'use strict';

const modelName                  = 'Notification';
const Joi                        = require('@hapi/joi');
const { NotificationModel }      = require('@database');
const CONSTANT                   = require('@lib/constant');
const UTILS                      = require('@lib/utils');

const create = async (req, res, next) => {
    let notification = req.body || {};
    notification.active = true;

    try {
        let result = await new Promise(async (resolve, reject) => {
            const schema = Joi.object({
                type : Joi.string().required(),
                device : Joi.array().required(),
                message: Joi.string(),
                userId: Joi.string(),
                data: Joi.object(),
                isRead: Joi.boolean(),
                active: Joi.boolean()
            });
        
            const { error } = schema.validate(notification);
            if (error) return reject({ error });

            notification.createdBy = req.user._id;
            notification.updatedBy = req.user._id;
            notification = new NotificationModel(notification);
            notification = await notification.save();
            return resolve(notification);
        });

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: result
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;

        let docs = await NotificationModel.find(query).sort({createdAt: -1})
                            .limit(limit).skip(pagination*limit)
                            .populate({
                                path: "createdBy",
                                select: 'firstName lastName userName file role',
                                populate: {
                                    path: "file",
                                    select: 'name original path thumbnail smallFile'
                                }
                            });

        return res.status(200).send({ result: docs.filter(e => e.createdBy) });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Notification id is required" });

        const schema = Joi.object({
            type: Joi.string(),
            device: Joi.array(),
            message: Joi.string(),
            userId: Joi.string(),
            data: Joi.object(),
            metadata: Joi.object(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        req.body.updatedBy = req.user._id;
        let notification = await NotificationModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!notification) return res.status(400).json({ error: "Notification update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Notification updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const schema = Joi.object({
            notifications: Joi.array()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        req.body.updatedBy = req.user._id;
        let notification = await NotificationModel.updateMany({_id: {$in: req.body.notifications}}, {$set: {isRead: true}});
        if (!notification) return res.status(400).json({ error: "Notifications update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Notifications updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const remove = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await NotificationModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Notification deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get,
    update,
    updateStatus,
    remove
};
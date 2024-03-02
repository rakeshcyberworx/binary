'use strict';

const modelName                 = 'Otp';
const Joi                       = require('@hapi/joi');
const { OtpModel }              = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');

const create = async (req, res, next) => {
    req.body.active = true;

    try {
        let result = await new Promise(async (resolve, reject) => {
            const schema = Joi.object({
                type: Joi.string().required(),
                token: Joi.string().required(),
                number: Joi.number(),
                expiry: Joi.number(),
                active: Joi.boolean()
            });
        
            const { error } = schema.validate(req.body);
            if (error) return reject({ error });

            let otp = new OtpModel(req.body);
            otp = await otp.save();
            return resolve(otp);
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
        let docs = await OtpModel.find(req.query || {});
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        await new Promise(async (resolve, reject) => {
            if (!req.params.id) return reject({error: "OTP id is required"});

            const schema = Joi.object({
                type: Joi.string(),
                device: Joi.string(),
                userId: Joi.string(),
                duration: Joi.string(),
                data: Joi.object(),
                active: Joi.boolean()
            });

            const { error } = schema.validate(req.body);
            if (error) return reject({ error });

            let otp = await OtpModel.updateOne({_id: req.params.id}, {$set: req.body});
            if (!otp) return reject({error: "OTP update failed"});

            resolve(otp);
        });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "OTP updated succesfully"
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

        await OtpModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "OTP deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get,
    update,
    remove
};
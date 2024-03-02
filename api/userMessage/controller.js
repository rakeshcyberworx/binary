'use strict';

const modelName                 = 'UserMessage';
const Joi                       = require('@hapi/joi');
const { UserMessageModel,
    User }                      = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const NOTIFICATION              = require('@lib/notification');

const create = async (req, res, next) => {

    let userMessage = req.body || {};
    if (!req.body.fromUserId && !req.body.toUserId) return res.status(400).json({error: "fromUserId and toUserId is required"});
    try {
        const schema = Joi.object({
            fromUserId: Joi.string(),
            toUserId: Joi.string(),
            fromUserName: Joi.string().required(),
            toUserName: Joi.string().required(),
            message: Joi.string().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(userMessage);
        if (error) return res.status(400).json({ error });

        userMessage = new UserMessageModel(userMessage);
        userMessage = await userMessage.save();

        userdetails = await User.find({_id : new mongoose.Types.ObjectId(toUserId)});

        if (userdetails.registerDevices != undefined && userdetails.registerDevices.length > 0) {
            devicetoken = await NOTIFICATION.extractDeviceTokenValue(userdetails.registerDevices);

            await new Promise((resolve, reject) => {
                if (devicetoken['android'].length> 0 ) {
                    console.log("android", devicetoken['android'])
                    let results = NOTIFICATION.sendNotificationToAndroidUsers(devicetoken['android'], payload, function (result) {
                        resolve(result);
                    });
                }
                if (devicetoken['ios'].length> 0) {
                    console.log("iostoken", devicetoken['ios'])
                    let results = NOTIFICATION.sendNotificationToIosUsers(devicetoken['ios'], payload, function (result) {
                        resolve(result);
                    });
                }
            });
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: userPosts
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

        let docs = await UserMessageModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get
};
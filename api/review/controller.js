'use strict';

const modelName         = 'Review';
const Joi               = require('@hapi/joi');
const { ReviewModel,
    UserModel,
    RoleModel,
    ProductModel,
    NotificationModel,
    ServiceModel }      = require('@database');
const CONSTANT          = require('@lib/constant');
const UTILS             = require('@lib/utils');
const FILE_UPLOAD       = require('@lib/file_upload');
const _                 = require('lodash');

const create = async (req, res, next) => {
    let review = await FILE_UPLOAD.uploadMultipleFile(req);
    if (review.comments && typeof review.comments == 'string') review.comments = JSON.parse(review.comments);
    
    try {
        const schema = Joi.object({
            order: Joi.string(),
            product: Joi.string(),
            service: Joi.string(),
            rating: Joi.number().required(),
            feedback: Joi.string().required(),
            comments: Joi.object(),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(review);
        if (error) return res.status(400).json({ error });

        if (review.product && !review.order) return res.status(400).json({ error: "Order id is required for this particular product!" });

        let query = {createdBy: req.user._id};
        if (review.order) query['order'] = review.order;
        if (review.product) query.product = review.product;
        else if (review.service) query.service = review.service;
        const oldReview = await ReviewModel.findOne(query)
        if (oldReview) return res.status(400).json({ error: "Your review is already submitted for this Product/Servie" });

        let record = {};
        if (review.product) record = await ProductModel.findOne({_id: review.product}, {createdBy: 1});
        else if (review.service) record = await ServiceModel.findOne({_id: review.service}, {createdBy: 1});
        if (!record) return res.status(400).json({ error: "Select a valid Product/Service" });
        let user = UTILS.cloneObject(await UserModel.findOne({_id: record.createdBy}, {_id: 1, overallReview: 1}));
        if (!user) return res.status(400).json({ error: "No user found for selected Product/Service" });
        if (review.files.length) review.files = review.files.map(file => file._id);
        else delete review.files;
        
        review.type = review.product ? "PRODUCT" : "SERVICE";
        review.createdBy = req.user._id;
        review.updatedBy = req.user._id;
        review = new ReviewModel(review);
        review = await review.save();

        await updateUserReview(review, user);

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: review
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updateUserReview = async (review, user) => {
    let overallReview = {};
    
    let reviewRating = {
        reviewsCount: review.feedback ? 1 : 0,
        excellent: review.rating > 4.5 ? 1 : 0,
        veryGood: (review.rating < 4.5) && (review.rating > 3.5) ? 1 : 0,
        good: (review.rating < 3.5) && (review.rating > 2.5) ? 1 : 0,
        average: (review.rating < 2.5) && (review.rating > 1.5) ? 1 : 0,
        poor: (review.rating < 1.5) && (review.rating > 0) ? 1 : 0,
        none: review.rating == 0 ? 1 : 0
    };
    
    if (!user.overallReview || !user.overallReview.review) {
        overallReview = {
            review: [review._id],
            avgRating: review.rating,
            ratingsCount: 1,
            ...reviewRating
        };
    } else {
        user.overallReview.review.push(review._id.toString());
        overallReview = {
            review: user.overallReview.review,
            avgRating: (user.overallReview.avgRating+review.rating)/2,
            ratingsCount: user.overallReview.ratingsCount++,
            reviewsCount: user.overallReview.reviewsCount+reviewRating.reviewsCount,
            excellent: user.overallReview.excellent+reviewRating.excellent,
            veryGood: user.overallReview.veryGood+reviewRating.veryGood,
            good: user.overallReview.good+reviewRating.good,
            average: user.overallReview.average+reviewRating.average,
            poor: user.overallReview.poor+reviewRating.poor,
            none: user.overallReview.none+reviewRating.none
        }
    }

    await UserModel.updateOne({_id: user._id}, {$set: {overallReview: overallReview}});

    return true;
}

const getProfessionalReviews = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);

        const role = ((await RoleModel.findOne({code: process.env.ROLE_PROFESSIONAL})) || {})._id || '';

        const user = UTILS.cloneObject(await UserModel.findOne({_id: (req.params.id || req.user._id), role: role}, {_id: 1, overallReview: 1}));
        if (!user) return res.status(400).json({ error: "No user found for selected Product/Service" });

        const query = {_id: {$in: ((user.overallReview || {}).review || [])}, status: "APPROVED"};
        if (req.query.type) query['type'] = req.query.type.toString();
        const reviewsCount = await ReviewModel.countDocuments(query);

        let docs = await ReviewModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                            .populate('files', 'name original path thumbnail smallFile')
                            .populate({
                                path: "product",
                                select: 'name productId description attributes files',
                                populate: {
                                   path: "files",
                                   select: 'name original path thumbnail smallFile'
                                }
                            })
                            .populate({
                                path: "createdBy",
                                select: 'firstName lastName email userName role file private',
                                populate: {
                                    path: "file",
                                    select: 'name original path thumbnail smallFile'
                                }
                            })
                            .populate({
                                path: "service",
                                select: 'name description files',
                                populate: {
                                   path: "files",
                                   select: 'name original path thumbnail smallFile'
                                }
                            });
        
        return res.status(200).send({ result: docs, count: reviewsCount });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;

        const reviewsCount = await ReviewModel.countDocuments(query);

        let docs = await ReviewModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                            .populate('files', 'name original path thumbnail smallFile')
                            .populate('product', 'name files productId')
                            .populate({
                                path: "product",
                                populate: {
                                   path: "files",
                                   select: 'name original path thumbnail smallFile'
                                }
                            })
                            .populate({
                                path: "createdBy",
                                populate: {
                                    path: "file",
                                    select: 'name original path thumbnail smallFile'
                                }
                            })
                            .populate({
                                path: "service",
                                populate: {
                                   path: "files",
                                   select: 'name original path thumbnail smallFile'
                                }
                            });
        docs = UTILS.cloneObject(docs);

        let reviewQuery = {status: {$in: ['APPROVED', 'DECLINED']}};
        if (query.type == 'PRODUCT') reviewQuery['product'] = {$in: docs.map(e => (e.product || {})._id).filter(e => e)};
        if (query.type == 'SERVICE') reviewQuery['service'] = {$in: docs.map(e => (e.service || {})._id).filter(e => e)};
        let reviews = await ReviewModel.find(reviewQuery, {product: 1, service: 1, rating: 1});

        docs = docs.map(doc => {
            if (doc.product && doc.product._id) doc.avgRating = _.mean(reviews.filter(e => e.product == doc.product._id).map(e => e.rating).filter(e => e));
            if (doc.service && doc.service._id) doc.avgRating = _.mean(reviews.filter(e => e.service == doc.service._id).map(e => e.rating).filter(e => e));
            doc.avgRating = doc.avgRating || 0;
            return doc;
        });

        docs = await Promise.all(docs).then(r => r);
        
        return res.status(200).send({ result: docs, count: reviewsCount });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        let review = req.body;
        if (!req.params.id) return res.status(400).json({ error: "Review id is required" });

        const schema = Joi.object({
            status: Joi.string(),
            customFields: Joi.object(),
            type: Joi.string(),
            comments: Joi.object()
        });

        const { error } = schema.validate(review);
        if (error) return res.status(400).json({ error });

        let updateRec = {
            "$set": {
                status: review.status,
                updatedBy: req.user._id
            }
        }
        if (review.status == 'APPROVED') updateRec['$set'].approvedBy = req.user._id;
        if (review.comments) updateRec['$push'] = {comments: review.comments};

        review = await ReviewModel.findOneAndUpdate({ _id: req.params.id }, updateRec, {returnOriginal: false});
        if (!review) return res.status(400).json({ error: "Review update failed" });

        if (review._id.toString() && review.status == 'APPROVED') {
            let product = await ProductModel.findOne({_id: review.product}, {createdBy: 1});

            for (let userId of [review.createdBy, (product || {}).createdBy]) {
                if (userId) {
                    let notification = {
                        type: "REVIEW_STATUS",
                        device : ["DESKTOP"],
                        message: `Review has been approved by ${req.user.firstName} ${req.user.lastName}.`,
                        userId: userId,
                        data: {
                            review: review._id
                        },
                        isRead: false,
                        active: true,
                        createdBy: req.user._id,
                        updatedBy: req.user._id
                    };
                    notification = new NotificationModel(notification);
                    await notification.save();
                }
            };
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Review updated succesfully"
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

        await ReviewModel.remove({ _id: req.params.id });
        return res.status(200).send({ result: "Review deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    getProfessionalReviews,
    get,
    update,
    remove
};
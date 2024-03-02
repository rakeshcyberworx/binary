'use strict';

const modelName                 = 'Report';
const Joi                       = require('@hapi/joi');
const { ReportModel }           = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const ObjectId                  = require('mongodb').ObjectId;
const readXlsxFile              = require("read-excel-file/node");

const create = async (req, res, next) => {
    let report = await FILE_UPLOAD.uploadMultipleFile(req, true, 'report');
    report.active = true;

    try {
        const schema = Joi.object({
            files: Joi.array(),
            userId: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(report);
        if (error) return res.status(400).json({ error });

        if (!report.files.length) return res.status(400).json({error: "Excel File is required"});
        if (report.files[0].ext != '.xlsx') return res.status(400).json({error: "Only Excel File format will be processed"});

        const excelSchema = {
            'Campaign ID': 'campaignId',
            'Campaign Category': 'campaignCategory',
            'Delivery': 'delivery',
            'Results': 'results',
            'Link Clicks': 'linkClicks',
            'Engagement': 'engagement',
            'Page Like': 'pageLike',
            'Event Response': 'eventResponse',
            'App Installs': 'appInstalls',
            'Video Views': 'videoViews',
            'Lead Generation': 'leadGeneration',
            'Messages': 'messages',
            'Conversions': 'conversions',
            'Store Traffic': 'storeTraffic',
            'Whatsapp Message': 'whatsappMessage',
            'Reach': 'reach',
            'Impressions': 'impressions',
            'Cost per result': 'costPerResult',
            'Amount Spent': 'amountSpent',
            'Ends': 'ends'
        };
        
        let rows = await readXlsxFile(report.files[0].path).then(r => r);
        if (!rows || !rows.length) console.log(" Excel file upload failed!");
        rows.shift();
        let headers = rows[0];
        rows.shift();
        report.data = rows.map(list => {
            let data = {};
            list.forEach((row, i) => {
                data[excelSchema[headers[i]]] = row;
            });
            return data;
        });

        report.name = report.files[0].name;
        delete report.files;

        let doc = await ReportModel.findOne({userId: report.userId}, {_id: 1});

        if (doc) {
            await ReportModel.updateOne({_id: doc._id}, {$set: {data: report.data}});
        } else {
            report.createdBy = req.user._id;
            report = new ReportModel(report);
            report = await report.save();
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: report
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        let docs = await ReportModel.find(req.query || {})
                            .populate({
                                path: "createdBy",
                                select: 'firstName lastName userName file role',
                                populate: {
                                    path: "file",
                                    select: 'name original path thumbnail smallFile'
                                }
                            })
                            .populate({
                                path: "userId",
                                select: 'firstName lastName userName file role',
                                populate: {
                                    path: "file",
                                    select: 'name original path thumbnail smallFile'
                                }
                            });
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        let report = await FILE_UPLOAD.uploadMultipleFile(req, true, 'report');
        if (!req.params.id) return res.status(400).json({error: "Report id is required"});

        const schema = Joi.object({
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(report);
        if (error) return res.status(400).json({ error });

        report.updatedBy = req.user._id;
        let updateData = Object.assign({}, report);

        let files = [];
        if (report.files.length) files = report.files.map(file => file._id);
        delete updateData.files;

        updateData = { $set: updateData };
        if (files.length) updateData['$push'] = {files: {$each: files}};

        let reportRec = await ReportModel.updateOne({_id: req.params.id}, updateData);
        if (!reportRec) return res.status(400).json({error: "Report update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Report updated succesfully"
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

        await ReportModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Report deleted successfully" });
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
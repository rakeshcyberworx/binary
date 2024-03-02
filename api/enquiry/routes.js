'use strict';

const router                        = require('express').Router();
const { EnquiryController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');


// home enquiry
router.post('/',                                         EnquiryController.create);
router.get('/',            Auth.isAuthenticated(),       EnquiryController.get);
router.delete('/:id',      Auth.isAuthenticated(),       EnquiryController.remove);


// product enquiry

router.post('/project',                                         EnquiryController.createProject);
router.get('/project',            Auth.isAuthenticated(),       EnquiryController.getProject);
router.delete('/project/:id',      Auth.isAuthenticated(),       EnquiryController.removeProject);


router.post('/homeloan',                                         EnquiryController.createHomeloan);
router.get('/homeloan',              Auth.isAuthenticated(),     EnquiryController.getHomeloan);
router.delete('/homeloan/:id',      Auth.isAuthenticated(),       EnquiryController.removeHomeloan);

router.post('/competitive',                                         EnquiryController.createCompetitive);
router.get('/competitive',             Auth.isAuthenticated(),       EnquiryController.getCompetitive);
router.delete('/competitive/:id',      Auth.isAuthenticated(),       EnquiryController.removeCompetitive);



router.post('/callback',                                         EnquiryController.createCallback);
router.get('/callback',              Auth.isAuthenticated(),      EnquiryController.getCallback);
router.delete('/callback/:id',      Auth.isAuthenticated(),       EnquiryController.removeCallback);

router.post('/whitepaper',                                         EnquiryController.createWhitepaper);
router.get('/whitepaper',              Auth.isAuthenticated(),      EnquiryController.getWhitepaper);
router.delete('/whitepaper/:id',      Auth.isAuthenticated(),       EnquiryController.removeWhitepaper);




module.exports = router;
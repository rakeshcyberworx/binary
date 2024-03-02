'use strict';

const router                        = require('express').Router();
const { CareerController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

// jobs
router.post('/',           Auth.isAuthenticated(),       CareerController.create);
router.get('/',            Auth.isAuthenticated(),       CareerController.get);
router.get('/pageDetail',                                 CareerController.pageDetail);
router.put('/:id',         Auth.isAuthenticated(),       CareerController.update);
router.delete('/:id',      Auth.isAuthenticated(),       CareerController.remove);

// benafits
router.post('/careerBenafits',           Auth.isAuthenticated(),       CareerController.createBenafits);
router.get('/careerBenafits',              Auth.isAuthenticated(),      CareerController.getBenafits);
router.put('/careerBenafits/:id',         Auth.isAuthenticated(),       CareerController.updateBenafits);
router.delete('/careerBenafits/:id',      Auth.isAuthenticated(),       CareerController.removeBenafits);



router.post('/gallery',           Auth.isAuthenticated(),       CareerController.createGallery);
router.get('/gallery',            Auth.isAuthenticated(),        CareerController.getGallery);
router.put('/gallery/:id',         Auth.isAuthenticated(),       CareerController.updateGallery);
router.delete('/gallery/:id',      Auth.isAuthenticated(),       CareerController.removeGallery);



router.post('/heading',           Auth.isAuthenticated(),       CareerController.createHeading);
router.get('/heading',             Auth.isAuthenticated(),      CareerController.getHeading);
router.put('/heading/:id',         Auth.isAuthenticated(),       CareerController.updateHeading);
router.delete('/heading/:id',      Auth.isAuthenticated(),       CareerController.removeHeading);

router.post('/apply',                                          CareerController.jobApply);
router.get('/apply',               Auth.isAuthenticated(),     CareerController.GetjobApply);

module.exports = router;
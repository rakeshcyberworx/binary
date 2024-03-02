'use strict';

const router                        = require('express').Router();
const { CustomerExperienceController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       CustomerExperienceController.create);
router.get('/',            Auth.isAuthenticated(),       CustomerExperienceController.get);
router.put('/:id',         Auth.isAuthenticated(),       CustomerExperienceController.update);
router.delete('/:id',      Auth.isAuthenticated(),       CustomerExperienceController.remove);



router.post('/benafit',           Auth.isAuthenticated(),       CustomerExperienceController.createBenafit);
router.get('/benafit',            Auth.isAuthenticated(),       CustomerExperienceController.getBenafit);
router.put('/benafit/:id',         Auth.isAuthenticated(),       CustomerExperienceController.updateBenafit);
router.delete('/benafit/:id',      Auth.isAuthenticated(),       CustomerExperienceController.removeBenafit);



router.get('/pageDetail',                                        CustomerExperienceController.pageDetail);
router.get('/offeringDetail',                                        CustomerExperienceController.offeringDetail);

router.get('/slugList',                                        CustomerExperienceController.slugList);


module.exports = router;
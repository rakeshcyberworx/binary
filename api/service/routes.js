'use strict';

const router                        = require('express').Router();
const { ServiceController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       ServiceController.create);
router.get('/',            Auth.isAuthenticated(),       ServiceController.get);
router.put('/:id',         Auth.isAuthenticated(),       ServiceController.update);
router.delete('/:id',      Auth.isAuthenticated(),       ServiceController.remove);


router.post('/offering',           Auth.isAuthenticated(),       ServiceController.createOffering);
router.get('/offering',            Auth.isAuthenticated(),       ServiceController.getOffering);
router.put('/offering/:id',         Auth.isAuthenticated(),       ServiceController.updateOffering);
router.delete('/offering/:id',      Auth.isAuthenticated(),       ServiceController.removeOffering);

router.get('/pageDetail',                                        ServiceController.pageDetail);
router.get('/offeringDetail',                                        ServiceController.offeringDetail);

router.get('/menuList',                                     ServiceController.menuList);
router.get('/slugServiceList',                                        ServiceController.slugServiceList);
router.get('/slugOfferList',                                        ServiceController.slugOfferList);


module.exports = router;
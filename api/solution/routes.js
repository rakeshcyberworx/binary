'use strict';

const router                        = require('express').Router();
const { SolutionController }        = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       SolutionController.create);
router.get('/',             Auth.isAuthenticated(),      SolutionController.get);
router.put('/:id',         Auth.isAuthenticated(),       SolutionController.update);
router.delete('/:id',      Auth.isAuthenticated(),       SolutionController.remove);


router.post('/services',           Auth.isAuthenticated(),       SolutionController.createServices);
router.get('/services',             Auth.isAuthenticated(),      SolutionController.getServices);
router.put('/services/:id',         Auth.isAuthenticated(),       SolutionController.updateServices);
router.delete('/services/:id',      Auth.isAuthenticated(),       SolutionController.removeServices);

router.post('/overview',           Auth.isAuthenticated(),       SolutionController.createOverview);
router.get('/overview',             Auth.isAuthenticated(),      SolutionController.getOverview);
router.put('/overview/:id',         Auth.isAuthenticated(),       SolutionController.updateOverview);
router.delete('/overview/:id',      Auth.isAuthenticated(),       SolutionController.removeOverview);


router.get('/pageDetail',                                       SolutionController.pageDetail);
router.get('/serviceDetail',                                     SolutionController.serviceDetail);
router.get('/slugSolutionList',                                     SolutionController.slugSolutionList);
router.get('/slugOfferList',                                     SolutionController.slugOfferList);


router.post('/homeModule',             Auth.isAuthenticated(),      SolutionController.createHomeModule);
router.get('/homeModule',             Auth.isAuthenticated(),      SolutionController.getHomeModule);
router.put('/homeModule/:id',         Auth.isAuthenticated(),       SolutionController.updateHomeModule);
router.delete('/homeModule/:id',      Auth.isAuthenticated(),       SolutionController.removeHomeModule);



router.post('/homeModuleInner',           Auth.isAuthenticated(),       SolutionController.createhomeModuleInner);
router.get('/homeModuleInner',             Auth.isAuthenticated(),      SolutionController.gethomeModuleInner);
router.put('/homeModuleInner/:id',         Auth.isAuthenticated(),       SolutionController.updatehomeModuleInner);
router.delete('/homeModuleInner/:id',      Auth.isAuthenticated(),       SolutionController.removehomeModuleInner);



router.get('/moduleList',             Auth.isAuthenticated(),      SolutionController.getmoduleList);

router.get('/menuList',                                     SolutionController.menuList);
module.exports = router;
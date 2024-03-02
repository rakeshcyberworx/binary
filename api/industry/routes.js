'use strict';

const router                        = require('express').Router();
const { IndustryController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       IndustryController.create);
router.get('/',            Auth.isAuthenticated(),       IndustryController.get);
router.put('/:id',         Auth.isAuthenticated(),       IndustryController.update);
router.delete('/:id',      Auth.isAuthenticated(),       IndustryController.remove);


router.post('/offering',           Auth.isAuthenticated(),       IndustryController.createOffering);
router.get('/offering',            Auth.isAuthenticated(),       IndustryController.getOffering);
router.put('/offering/:id',         Auth.isAuthenticated(),       IndustryController.updateOffering);
router.delete('/offering/:id',      Auth.isAuthenticated(),       IndustryController.removeOffering);

router.get('/pageDetail',                                        IndustryController.pageDetail);
router.get('/slugList',                                        IndustryController.slugList);


router.get('/list',                                        IndustryController.list);




module.exports = router;
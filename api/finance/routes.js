'use strict';

const router                        = require('express').Router();
const { FinanceController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       FinanceController.create);
router.get('/',            Auth.isAuthenticated(),       FinanceController.get);
router.put('/:id',         Auth.isAuthenticated(),       FinanceController.update);
router.delete('/:id',      Auth.isAuthenticated(),       FinanceController.remove);


router.post('/offering',           Auth.isAuthenticated(),       FinanceController.createOffering);
router.get('/offering',            Auth.isAuthenticated(),       FinanceController.getOffering);
router.put('/offering/:id',         Auth.isAuthenticated(),       FinanceController.updateOffering);
router.delete('/offering/:id',      Auth.isAuthenticated(),       FinanceController.removeOffering);



router.post('/heading',           Auth.isAuthenticated(),       FinanceController.createHeading);
router.get('/heading',            Auth.isAuthenticated(),       FinanceController.getHeading);
router.put('/heading/:id',         Auth.isAuthenticated(),       FinanceController.updateHeading);
router.delete('/heading/:id',      Auth.isAuthenticated(),       FinanceController.removeHeading);





router.get('/pageDetail',                                        FinanceController.pageDetail);

router.get('/financeDetail',                                        FinanceController.financeDetail);

router.get('/list',                                        FinanceController.list);
router.get('/slugList',                                        FinanceController.slugList);



module.exports = router;
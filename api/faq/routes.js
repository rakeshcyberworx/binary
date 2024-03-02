'use strict';

const router                        = require('express').Router();
const { FaqController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       FaqController.create);
router.get('/',             Auth.isAuthenticated(),      FaqController.get);
router.get('/pageDetail',                                FaqController.pageDetail);
router.put('/:id',         Auth.isAuthenticated(),       FaqController.update);
router.delete('/:id',      Auth.isAuthenticated(),       FaqController.remove);



router.post('/category',           Auth.isAuthenticated(),       FaqController.createCategory);
router.get('/category',            Auth.isAuthenticated(),       FaqController.getCategory);
router.put('/category/:id',         Auth.isAuthenticated(),       FaqController.updateCategory);
router.delete('/category/:id',      Auth.isAuthenticated(),       FaqController.removeCategory);

module.exports = router;
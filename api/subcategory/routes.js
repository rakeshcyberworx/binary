'use strict';

const router                        = require('express').Router();
const { SubcategoryController }        = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       SubcategoryController.create);
router.get('/',                                          SubcategoryController.get);
router.put('/:id',         Auth.isAuthenticated(),       SubcategoryController.update);
router.delete('/:id',      Auth.isAuthenticated(),       SubcategoryController.remove);

module.exports = router;
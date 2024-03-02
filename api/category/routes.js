'use strict';

const router                        = require('express').Router();
const { CategoryController }        = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       CategoryController.create);
router.get('/',                                          CategoryController.get);
router.put('/:id',         Auth.isAuthenticated(),       CategoryController.update);
router.delete('/:id',      Auth.isAuthenticated(),       CategoryController.remove);

module.exports = router;
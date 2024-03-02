'use strict';

const router                        = require('express').Router();
const { TagsController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       TagsController.create);
router.get('/',            Auth.isAuthenticated(),       TagsController.get);
router.put('/:id',         Auth.isAuthenticated(),       TagsController.update);
router.delete('/:id',      Auth.isAuthenticated(),       TagsController.remove);

module.exports = router;
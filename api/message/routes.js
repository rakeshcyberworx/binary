'use strict';

const router                        = require('express').Router();
const { MessageController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       MessageController.create);
router.get('/',            Auth.isAuthenticated(),       MessageController.get);
router.put('/:id',         Auth.isAuthenticated(),       MessageController.update);
router.delete('/:id',      Auth.isAuthenticated(),       MessageController.remove);

module.exports = router;

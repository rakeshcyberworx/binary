'use strict';

const router                        = require('express').Router();
const { TeamController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       TeamController.create);
router.get('/',            Auth.isAuthenticated(),       TeamController.get);
router.put('/:id',         Auth.isAuthenticated(),       TeamController.update);
router.delete('/:id',      Auth.isAuthenticated(),       TeamController.remove);

module.exports = router;
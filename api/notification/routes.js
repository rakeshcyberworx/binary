'use strict';

const router                        = require('express').Router();
const { NotificationController }    = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',         Auth.isAuthenticated(),       NotificationController.create);
router.get('/',          Auth.isAuthenticated(),       NotificationController.get);
router.put('/status',    Auth.isAuthenticated(),       NotificationController.updateStatus);
router.put('/:id',       Auth.isAuthenticated(),       NotificationController.update);
router.delete('/:id',    Auth.isAuthenticated(),       NotificationController.remove);

module.exports = router;
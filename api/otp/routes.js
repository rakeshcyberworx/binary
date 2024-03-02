'use strict';

const router                        = require('express').Router();
const { OtpController }             = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       OtpController.create);
router.get('/',            Auth.isAuthenticated(),       OtpController.get);
router.put('/:id',         Auth.isAuthenticated(),       OtpController.update);
router.delete('/:id',      Auth.isAuthenticated(),       OtpController.remove);

module.exports = router;
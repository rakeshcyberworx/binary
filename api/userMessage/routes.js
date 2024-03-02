'use strict';

const router                        = require('express').Router();
const { UserMessageController }       = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       UserMessageController.create);
router.get('/',            Auth.isAuthenticated(),       UserMessageController.get);

module.exports = router;
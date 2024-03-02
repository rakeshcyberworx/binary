'use strict';

const router                        = require('express').Router();
const { ContactController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',            Auth.isAuthenticated(),      ContactController.create);
router.get('/',            Auth.isAuthenticated(),       ContactController.get);
router.delete('/:id',      Auth.isAuthenticated(),       ContactController.remove);
router.put('/:id',         Auth.isAuthenticated(),       ContactController.update);
router.get('/pageDetail',                                ContactController.pageDetail);
module.exports = router;
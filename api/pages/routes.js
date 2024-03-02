'use strict';

const router                        = require('express').Router();
const { PageController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',            Auth.isAuthenticated(),      PageController.create);
router.get('/',            Auth.isAuthenticated(),       PageController.get);
router.put('/:id',          Auth.isAuthenticated(),      PageController.update);
router.delete('/:id',      Auth.isAuthenticated(),       PageController.remove);

router.get('/getpagedetail',                              PageController.getPageDetail);
module.exports = router;
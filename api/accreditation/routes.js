'use strict';

const router                        = require('express').Router();
const { AccreditationController }        = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       AccreditationController.create);
router.get('/',            Auth.isAuthenticated(),       AccreditationController.get);
router.put('/:id',         Auth.isAuthenticated(),       AccreditationController.update);
router.delete('/:id',      Auth.isAuthenticated(),       AccreditationController.remove);
router.get('/list',                                      AccreditationController.list);

module.exports = router;
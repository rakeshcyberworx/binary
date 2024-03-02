'use strict';

const router                        = require('express').Router();
const { AwardController }        = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       AwardController.create);
router.get('/',            Auth.isAuthenticated(),       AwardController.get);
router.put('/:id',         Auth.isAuthenticated(),       AwardController.update);
router.delete('/:id',      Auth.isAuthenticated(),       AwardController.remove);

router.get('/list',                                      AwardController.list);



module.exports = router;
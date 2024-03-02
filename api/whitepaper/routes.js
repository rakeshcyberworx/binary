'use strict';

const router                        = require('express').Router();
const { WhiteController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       WhiteController.create);
router.get('/',             Auth.isAuthenticated(),      WhiteController.get);
router.put('/:id',         Auth.isAuthenticated(),       WhiteController.update);
router.delete('/:id',      Auth.isAuthenticated(),       WhiteController.remove);
router.get('/pageDetail',                                WhiteController.pageDetail);


router.post('/tag',           Auth.isAuthenticated(),       WhiteController.createTag);
router.get('/tag',             Auth.isAuthenticated(),       WhiteController.getTag);
router.put('/tag/:id',         Auth.isAuthenticated(),       WhiteController.updateTag);
router.delete('/tag/:id',      Auth.isAuthenticated(),       WhiteController.removeTag);




module.exports = router;
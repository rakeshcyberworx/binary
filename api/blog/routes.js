'use strict';

const router                        = require('express').Router();
const { BlogController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       BlogController.create);
router.get('/',             Auth.isAuthenticated(),      BlogController.get);
router.get('/pageDetail',                                  BlogController.blogList);

router.get('/slugList',                                  BlogController.slugList);



router.put('/:id',         Auth.isAuthenticated(),       BlogController.update);
router.delete('/:id',      Auth.isAuthenticated(),       BlogController.remove);



router.post('/category',           Auth.isAuthenticated(),       BlogController.createCategory);
router.get('/category',             Auth.isAuthenticated(),       BlogController.getCategory);
router.put('/category/:id',         Auth.isAuthenticated(),       BlogController.updateCategory);
router.delete('/category/:id',      Auth.isAuthenticated(),       BlogController.removeCategory);




module.exports = router;
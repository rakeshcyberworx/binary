'use strict';

const router                        = require('express').Router();
const { StoryController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       StoryController.create);
router.get('/',             Auth.isAuthenticated(),      StoryController.get);
router.put('/:id',         Auth.isAuthenticated(),       StoryController.update);
router.delete('/:id',      Auth.isAuthenticated(),       StoryController.remove);

router.get('/pageDetail',                               StoryController.pageDetail);
router.get('/slugList',                               StoryController.slugList);
router.post('/tag',           Auth.isAuthenticated(),       StoryController.createTag);
router.get('/tag',             Auth.isAuthenticated(),       StoryController.getTag);
router.put('/tag/:id',         Auth.isAuthenticated(),       StoryController.updateTag);
router.delete('/tag/:id',      Auth.isAuthenticated(),       StoryController.removeTag);


router.post('/sidemenu',           Auth.isAuthenticated(),       StoryController.createSidemenu);
router.get('/sidemenu',             Auth.isAuthenticated(),       StoryController.getSidemenu);
router.put('/sidemenu/:id',         Auth.isAuthenticated(),       StoryController.updateSidemenu);
router.delete('/sidemenu/:id',      Auth.isAuthenticated(),       StoryController.removeSidemenu);




module.exports = router;
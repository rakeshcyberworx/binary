'use strict';

const router                        = require('express').Router();
const { CaseStudyController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       CaseStudyController.create);
router.get('/',             Auth.isAuthenticated(),      CaseStudyController.get);
router.put('/:id',         Auth.isAuthenticated(),       CaseStudyController.update);
router.delete('/:id',      Auth.isAuthenticated(),       CaseStudyController.remove);



router.post('/tag',           Auth.isAuthenticated(),       CaseStudyController.createTag);
router.get('/tag',             Auth.isAuthenticated(),       CaseStudyController.getTag);
router.put('/tag/:id',         Auth.isAuthenticated(),       CaseStudyController.updateTag);
router.delete('/tag/:id',      Auth.isAuthenticated(),       CaseStudyController.removeTag);




module.exports = router;
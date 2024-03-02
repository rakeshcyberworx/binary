'use strict';

const router                        = require('express').Router();
const { ReviewController }          = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                Auth.isAuthenticated(),       ReviewController.create);
router.get('/',                 Auth.isAuthenticated(),       ReviewController.get);
router.get('/professional/:id', Auth.isAuthenticated(),       ReviewController.getProfessionalReviews);
router.put('/:id',              Auth.isAuthenticated(),       ReviewController.update);
router.delete('/:id',           Auth.isAuthenticated(),       ReviewController.remove);

module.exports = router;
'use strict';

const router                        = require('express').Router();
const { TestimonialController }     = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       TestimonialController.create);
router.get('/',             Auth.isAuthenticated(),       TestimonialController.get);
router.get('/customerExperience',                         TestimonialController.testimonial);

router.put('/:id',         Auth.isAuthenticated(),       TestimonialController.update);
router.delete('/:id',      Auth.isAuthenticated(),       TestimonialController.remove);






module.exports = router;
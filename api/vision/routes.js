'use strict';

const router                        = require('express').Router();
const { VisionController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       VisionController.create);
router.get('/',            Auth.isAuthenticated(),       VisionController.get);
router.put('/:id',         Auth.isAuthenticated(),       VisionController.update);
router.delete('/:id',      Auth.isAuthenticated(),       VisionController.remove);


router.get('/gallery_heading',             Auth.isAuthenticated(),       VisionController.getGalleryHeading);
router.post('/gallery_heading',            Auth.isAuthenticated(),       VisionController.createGalleryHeading);
router.put('/gallery_heading/:id',         Auth.isAuthenticated(),       VisionController.updateGalleryHeading);
router.delete('/gallery_heading/:id',      Auth.isAuthenticated(),       VisionController.removeGalleryHeading);






module.exports = router;
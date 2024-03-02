'use strict';

const router                        = require('express').Router();
const { AboutController }           = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       AboutController.create);
router.get('/',            Auth.isAuthenticated(),      AboutController.get);
router.get('/pageDetail',                              AboutController.pageDetail);
router.put('/:id',         Auth.isAuthenticated(),       AboutController.update);
router.delete('/:id',      Auth.isAuthenticated(),       AboutController.remove);


router.get('/award',             Auth.isAuthenticated(),       AboutController.getAward);
router.post('/award',            Auth.isAuthenticated(),       AboutController.createAward);
router.put('/award/:id',         Auth.isAuthenticated(),       AboutController.updateAward);
router.delete('/award/:id',      Auth.isAuthenticated(),       AboutController.removeAward);


router.get('/journey',             Auth.isAuthenticated(),       AboutController.getJourney);
router.post('/journey',            Auth.isAuthenticated(),       AboutController.createjourney);
router.put('/journey/:id',         Auth.isAuthenticated(),       AboutController.updatejourney);
router.delete('/journey/:id',      Auth.isAuthenticated(),       AboutController.removejourney);


router.get('/contact',             Auth.isAuthenticated(),       AboutController.getContact);
router.post('/contact',            Auth.isAuthenticated(),       AboutController.createContact);
router.put('/contact/:id',         Auth.isAuthenticated(),       AboutController.updateContact);
router.delete('/contact/:id',      Auth.isAuthenticated(),       AboutController.removeContact);



router.get('/presence',             Auth.isAuthenticated(),       AboutController.getPresence);
router.post('/presence',            Auth.isAuthenticated(),       AboutController.createPresence);
router.put('/presence/:id',         Auth.isAuthenticated(),       AboutController.updatePresence);
router.delete('/presence/:id',      Auth.isAuthenticated(),       AboutController.removePresence);



router.get('/gallery',             Auth.isAuthenticated(),       AboutController.getGallery);
router.post('/gallery',            Auth.isAuthenticated(),       AboutController.createGallery);
router.put('/gallery/:id',         Auth.isAuthenticated(),       AboutController.updateGallery);
router.delete('/gallery/:id',      Auth.isAuthenticated(),       AboutController.removeGallery);






module.exports = router;
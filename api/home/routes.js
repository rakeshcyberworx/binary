'use strict';

const router                        = require('express').Router();
const { HomeController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                    Auth.isAuthenticated(),       HomeController.create);
router.get('/',                      Auth.isAuthenticated(),      HomeController.get);

router.put('/:id',                  Auth.isAuthenticated(),       HomeController.update);
router.delete('/:id',               Auth.isAuthenticated(),       HomeController.remove);

router.get('/pageDetail',                                         HomeController.pageDetail);


router.get('/whyChoose',             Auth.isAuthenticated(),      HomeController.getwhyChoose);
router.post('/whyChoose',            Auth.isAuthenticated(),       HomeController.createwhyChoose);
router.put('/whyChoose/:id',         Auth.isAuthenticated(),       HomeController.updatewhyChoose);
router.delete('/whyChoose/:id',      Auth.isAuthenticated(),       HomeController.removewhyChoose);

router.get('/homeBanner',             Auth.isAuthenticated(),       HomeController.getHomeBanner);
router.post('/homeBanner',            Auth.isAuthenticated(),       HomeController.createHomeBanner);
router.put('/homeBanner/:id',         Auth.isAuthenticated(),       HomeController.updateHomeBanner);
router.delete('/homeBanner/:id',      Auth.isAuthenticated(),       HomeController.removeHomeBanner);


router.post('/sentOtp',                                             HomeController.sentOtp);
router.post('/verifyOtp',                                           HomeController.verifyOtp);
router.post('/sentMessage',                                         HomeController.sentMessage);



router.post('/saveapply',                                             HomeController.saveapply);

router.get('/search',                                             HomeController.search);


module.exports = router;
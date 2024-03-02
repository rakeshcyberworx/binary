'use strict';

const router                        = require('express').Router();
const { BusinessController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/productivity',           Auth.isAuthenticated(),       BusinessController.create);
router.get('/productivity',             Auth.isAuthenticated(),      BusinessController.get);
router.put('/productivity/:id',         Auth.isAuthenticated(),       BusinessController.update);
router.delete('/productivity/:id',      Auth.isAuthenticated(),       BusinessController.remove);


router.post('/heading',           Auth.isAuthenticated(),       BusinessController.createHeading);
router.get('/heading',             Auth.isAuthenticated(),      BusinessController.getHeading);
router.put('/heading/:id',         Auth.isAuthenticated(),       BusinessController.updateHeading);
router.delete('/heading/:id',      Auth.isAuthenticated(),       BusinessController.removeHeading);



router.post('/work',           Auth.isAuthenticated(),       BusinessController.createWork);
router.get('/work',             Auth.isAuthenticated(),       BusinessController.getWork);
router.put('/work/:id',         Auth.isAuthenticated(),       BusinessController.updateWork);
router.delete('/work/:id',      Auth.isAuthenticated(),       BusinessController.removeWork);

router.get('/pageDetail',                                     BusinessController.pageDetail);


module.exports = router;
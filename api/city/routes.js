'use strict';

const router                        = require('express').Router();
const { CityController }        = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       CityController.create);
router.get('/',                                          CityController.get);
router.put('/:id',         Auth.isAuthenticated(),       CityController.update);
router.delete('/:id',      Auth.isAuthenticated(),       CityController.remove);



router.post('/locality',           Auth.isAuthenticated(),       CityController.createLocality);
router.get('/locality',                                          CityController.getLocality);
router.put('/locality/:id',         Auth.isAuthenticated(),       CityController.updateLocality);
router.delete('/locality/:id',      Auth.isAuthenticated(),       CityController.removeLocality);


router.post('/featureCollection',           Auth.isAuthenticated(),       CityController.createfeatureCollection);
router.get('/featureCollection',                                          CityController.getfeatureCollection);
router.put('/featureCollection/:id',         Auth.isAuthenticated(),       CityController.updatefeatureCollection);
router.delete('/featureCollection/:id',      Auth.isAuthenticated(),       CityController.removefeatureCollection);



module.exports = router;
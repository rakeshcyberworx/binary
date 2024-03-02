'use strict';

const router                        = require('express').Router();
const { SettingController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       SettingController.create);
router.get('/',                                          SettingController.get);
router.put('/:id',         Auth.isAuthenticated(),       SettingController.update);
router.delete('/:id',      Auth.isAuthenticated(),       SettingController.remove);



router.post('/meta',           Auth.isAuthenticated(),       SettingController.createMeta);
router.get('/meta',            Auth.isAuthenticated(),       SettingController.getMeta);
router.put('/meta/:id',         Auth.isAuthenticated(),       SettingController.updateMeta);
router.delete('/meta/:id',      Auth.isAuthenticated(),       SettingController.removeMeta);


router.post('/sideMenu',           Auth.isAuthenticated(),       SettingController.createsideMenu);
router.get('/sideMenu',            Auth.isAuthenticated(),       SettingController.getsideMenu);
router.put('/sideMenu/:id',         Auth.isAuthenticated(),       SettingController.updatesideMenu);
router.delete('/sideMenu/:id',      Auth.isAuthenticated(),       SettingController.removesideMenu);
router.get('/sideMenuList',                                        SettingController.sideMenuList);


router.post('/states',           Auth.isAuthenticated(),       SettingController.createState);
router.get('/states',                                          SettingController.getState);
router.put('/states/:id',         Auth.isAuthenticated(),       SettingController.updateState);
router.delete('/states/:id',      Auth.isAuthenticated(),       SettingController.removeState);



module.exports = router;
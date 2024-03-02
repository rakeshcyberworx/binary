'use strict';

const router                        = require('express').Router();
const { PartnerController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                    Auth.isAuthenticated(),       PartnerController.create);
router.get('/',                     Auth.isAuthenticated(),       PartnerController.get);
router.put('/:id',                  Auth.isAuthenticated(),       PartnerController.update);
router.delete('/:id',               Auth.isAuthenticated(),       PartnerController.remove);



router.post('/tag',                    Auth.isAuthenticated(),       PartnerController.createTag);
router.get('/tag',                      Auth.isAuthenticated(),      PartnerController.getTag);
router.put('/tag/:id',                  Auth.isAuthenticated(),       PartnerController.updateTag);
router.delete('/tag/:id',               Auth.isAuthenticated(),       PartnerController.removeTag);

router.get('/pageDetail',                                             PartnerController.pageDetail);


module.exports = router;
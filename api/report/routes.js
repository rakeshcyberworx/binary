'use strict';

const router                        = require('express').Router();
const { ReportController }          = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',           Auth.isAuthenticated(),       ReportController.create);
router.get('/',            Auth.isAuthenticated(),       ReportController.get);
router.put('/:id',         Auth.isAuthenticated(),       ReportController.update);
router.delete('/:id',      Auth.isAuthenticated(),       ReportController.remove);

module.exports = router;
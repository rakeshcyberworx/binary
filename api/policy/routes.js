'use strict';

const router                        = require('express').Router();
const { PolicyController }         = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                    Auth.isAuthenticated(),       PolicyController.create);
router.get('/',                                                   PolicyController.get);
router.put('/:id',                  Auth.isAuthenticated(),       PolicyController.update);
router.delete('/:id',               Auth.isAuthenticated(),       PolicyController.remove);


router.get('/policy_category',             Auth.isAuthenticated(),       PolicyController.getPolicyCategory);
router.post('/policy_category',            Auth.isAuthenticated(),       PolicyController.createPolicyCategory);
router.put('/policy_category/:id',         Auth.isAuthenticated(),       PolicyController.updatePolicyCategory);
router.delete('/policy_category/:id',      Auth.isAuthenticated(),       PolicyController.removePolicyCategory);

router.get('/heading',             Auth.isAuthenticated(),       PolicyController.getHeading);
router.post('/heading',            Auth.isAuthenticated(),       PolicyController.createHeading);
router.put('/heading/:id',         Auth.isAuthenticated(),       PolicyController.updateHeading);
router.delete('/heading/:id',      Auth.isAuthenticated(),       PolicyController.removeHeading);



router.get('/faq_category',             Auth.isAuthenticated(),       PolicyController.getFaqCategory);
router.post('/faq_category',            Auth.isAuthenticated(),       PolicyController.createFaqCategory);
router.put('/faq_category/:id',         Auth.isAuthenticated(),       PolicyController.updateFaqCategory);
router.delete('/faq_category/:id',      Auth.isAuthenticated(),       PolicyController.removeFaqCategory);


router.get('/faqs',             Auth.isAuthenticated(),       PolicyController.getFaqs);
router.post('/faqs',            Auth.isAuthenticated(),       PolicyController.createFaqs);
router.put('/faqs/:id',         Auth.isAuthenticated(),       PolicyController.updateFaqs);
router.delete('/faqs/:id',      Auth.isAuthenticated(),       PolicyController.removeFaqs);

router.get('/getData',                                         PolicyController.getPolicyData);
router.get('/getPolicyCategory',                              PolicyController.getPolicyCategories);
router.get('/getPolicyList',                              PolicyController.getPolicyList);
router.get('/getCustomerPolicyCategory',                              PolicyController.getCustomerPolicyCategory);
module.exports = router;
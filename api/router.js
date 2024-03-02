"use strict";

const router = require("express").Router();

/**
 * Import All Express Router Here
 */

router.use('/category', require("./category/routes"));

router.use('/file', require("./file/routes"));
router.use('/enquiry', require("./enquiry/routes"));
router.use('/logs', require("./logs/routes"));
router.use('/message', require("./message/routes"));
router.use('/notification', require("./notification/routes"));
router.use('/otp', require("./otp/routes"));
router.use('/report', require("./report/routes"));
router.use('/review', require("./review/routes"));
router.use('/role', require("./role/routes"));
router.use('/service', require("./service/routes"));
router.use('/session', require("./session/routes"));
router.use('/tags', require("./tags/routes"));
router.use('/user', require("./user/routes"));
router.use('/subcategory', require("./subcategory/routes"));
router.use('/userMessage', require("./userMessage/routes"));
router.use('/faq', require("./faq/routes"));
router.use('/blog', require("./blog/routes"));
router.use('/contact', require("./contact/routes"));
router.use('/testimonial', require("./testimonial/routes"));
router.use('/team', require("./team/routes"));
router.use('/vision', require("./vision/routes"));
router.use('/about', require("./about/routes"));
router.use('/home', require("./home/routes"));
router.use('/solution', require("./solution/routes"));
router.use('/career', require("./career/routes"));
router.use('/policy', require("./policy/routes"));
router.use('/setting', require("./setting/routes"));
router.use('/contact', require("./contact/routes"));
router.use('/gallery', require("./about/routes"));
router.use('/pages',                    require("./pages/routes"));
router.use('/city',                    require('./city/routes'));
router.use('/partner',                 require('./partner/routes'));

router.use('/industry',   require('./industry/routes'));
router.use('/story',   require('./story/routes'));
router.use('/caseStudy',   require('./caseStudy/routes'));
router.use('/whitepaper',   require('./whitepaper/routes'));
router.use('/businessRegiliency',   require('./businessRegiliency/routes'));
router.use('/finance',   require('./finance/routes'));
router.use('/customer',   require('./customer/routes'));
router.use('/award',   require('./award/routes'));
router.use('/accreditation',   require('./accreditation/routes'));



module.exports = router;
'use strict';

const router                        = require('express').Router();
const { UserController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                                                                UserController.registration);
router.post('/login',                                                           UserController.login);
router.post('/mobile/login',                                                    UserController.otpLogin);
router.post('/resend/otp',                                                      UserController.resendEmailOtp);
router.post('/verify/otp',                                                      UserController.verifyEmailOtp);
// router.post('/resend/otp',                                                      UserController.resendOtp);
// router.post('/verify/otp',                                                      UserController.verifyOtp);
router.post('/validate/userName',       Auth.isAuthenticated(),                 UserController.validateUserName);
router.post('/validate/email',          Auth.isAuthenticated(),                 UserController.validateEmail);
router.post('/upload/profile',          Auth.isAuthenticated(),                 UserController.uploadProfilePhoto);
router.post('/upload/cover',            Auth.isAuthenticated(),                 UserController.uploadCoverPhoto);
router.put('/',                         Auth.isAuthenticated(),                 UserController.update);
router.put('/update_profile/:id',          Auth.isAuthenticated(),             UserController.update_profile);
router.get('/logout',                   Auth.isAuthenticated(),                 UserController.logout);
router.get('/',                         Auth.isAuthenticated(),                 UserController.get);
router.get('/userdetail',                         Auth.isAuthenticated(),       UserController.userdetail);

router.get('/getAllCounts',             Auth.isAuthenticated(),                 UserController.getAllCounts);
router.delete('/:id',                   Auth.isAuthenticated(),                 UserController.remove);
router.get('/myOrder/:userId',                                                  UserController.getMyOrder);
router.get('/myReview/:userId',                                                 UserController.getMyReview);
router.get('/validate/login',           Auth.isAuthenticated(),                 UserController.validateLogin);
router.get('/profile',                  Auth.isAuthenticated(),                 UserController.getUserProfile);
router.get('/searchResults',            Auth.isAuthenticated(),                 UserController.getSearchResults);
router.get('/getSearchList',            Auth.isAuthenticated(),                 UserController.getSearchList);
router.get('/categories',               Auth.isAuthenticated(),                 UserController.getUserCategories);
router.post('/wishlist',                Auth.isAuthenticated(),                 UserController.wishlist);
router.get('/wishlist',                 Auth.isAuthenticated(),                 UserController.getUserWishlist);
router.put('/wishlist',                 Auth.isAuthenticated(),                 UserController.removeWishlist);
router.get('/states/list',              Auth.isAuthenticated(),                 UserController.getUserStates);
router.get('/states',                                                           UserController.getStates);
router.get('/random/list',                                                      UserController.getRandomUsers);
router.put('/updateStatus/:id',         Auth.isAuthenticated(),                 UserController.updateStatus);
router.get('/getUserList',              Auth.isAuthenticated(),                 UserController.getUserList);
router.get('/groupUsers/:groupId',      Auth.isAuthenticated(),                 UserController.getUnfollowedGroupUsers);
router.get('/exportUserList',                                                   UserController.exportUserList);
router.post('/create/professional',     Auth.isAuthenticated(),                 UserController.registration);
router.post('/changePassword',     Auth.isAuthenticated(),                 UserController.changePassword);




module.exports = router;
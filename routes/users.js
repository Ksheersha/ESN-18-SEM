var express = require('express');
var router = express.Router();
var JoinCommunityController = require('../controllers/joinCommunityController');
var joinCommunityController = new JoinCommunityController();
var ShareStatusController = require('../controllers/shareStatusController');
var shareStatusController = new ShareStatusController();
var MapController = require('../controllers/mapController');
var mapController = new MapController();



/* GET users listing. */
router.get('/',joinCommunityController.getUserList);

/* POST method to access register page */
router.post('/', joinCommunityController.postRegisterUser);

/* GET user's contacts given role */
router.get('/contacts/role/:role', joinCommunityController.getUsersInNetworkGivenRole);

/* GET users given role */
router.get('/role/:role', joinCommunityController.getUsersByRole);

/* GET a specific user's record */
router.get('/username/:userName', joinCommunityController.getUserRecord);

/* POST a specific user's record */
router.post('/id/:userId', joinCommunityController.setUserById);

/* GET a specific user's record by id */
router.get('/id/:uid', joinCommunityController.getUserById);

/* POST a new status*/
router.post('/status/id/:userID', shareStatusController.postNewStatus);

module.exports = router;

let express = require('express');
let router = express.Router();
let LogoutController = require('../controllers/logoutController');
let logoutController = new LogoutController();

/* Return to the homepage. */
router.get('/', logoutController.logout);

module.exports = router;

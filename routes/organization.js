'use strict';

var express = require('express');
var router = express.Router();
var OrganizationController = require('../controllers/organizationController');
var organizationController = new OrganizationController();

/**
 * Get all organizations. If one doesn't exist for a chief, create it.
 */
router.get('/', organizationController.getAllOrganizations);

/**
 * Get organization by chiefId.
 */
router.get('/chief/:chiefId', organizationController.getOrganizationByChiefId);

/**
 * Get organization areas by chiefId.
 */
router.get('/chief/:chiefId/areas', organizationController.getOrganizationAreasByChiefId);

/**
 * Get the organization that a given user is in
 */

router.get('/personnel/:userId', organizationController.getOrganizationByPersonnelId);

/**
 * Update organization by chiefId.
 */
router.post('/chief/:chiefId', organizationController.updateOrganization);

module.exports = router;

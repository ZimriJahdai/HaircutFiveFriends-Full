'use strict';

import express from 'express';
import { createClient, getClients, getClientById, updateClient, deleteClient, getClientPoints } from './client.controller.js';
import { uploadProfilePicture } from '../../middlewares/file-uploader.js';
import { validateCreateClient, validateUpdateClient } from '../../middlewares/client-validator.js';
import { validateJWT, ensureClientMatchesToken, authorizeRoles } from '../../middlewares/validate-JWT.js';

const router = express.Router();

router.post(
	'/',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	uploadProfilePicture.single('profilePicture'),
	ensureClientMatchesToken,
	validateCreateClient,
	createClient
);
router.get(
	'/',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
	getClients
);
router.get(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	getClientById
);
router.get(
	'/:id/points',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	getClientPoints
);
router.put(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE'),
	uploadProfilePicture.single('profilePicture'),
	validateUpdateClient,
	updateClient
);
router.delete(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE'),
	deleteClient
);

export default router;

'use strict';

import express from 'express';
import { createBarber, getBarbers, getBarberById, updateBarber, deleteBarber } from './barber.controller.js';
import { uploadProfilePicture } from '../../middlewares/file-uploader.js';
import { validateCreateBarber, validateUpdateBarber } from '../../middlewares/barber-validator.js';
import { validateJWT, authorizeRoles } from '../../middlewares/validate-JWT.js';

const router = express.Router();

router.post(
	'/',
	validateJWT,
	authorizeRoles('ADMIN_ROLE'),
	uploadProfilePicture.single('profilePicture'),
	validateCreateBarber,
	createBarber
);
router.get(
	'/',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	getBarbers
);
router.get(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	getBarberById
);
router.put(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE'),
	uploadProfilePicture.single('profilePicture'),
	validateUpdateBarber,
	updateBarber
);
router.delete(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE'),
	deleteBarber
);

export default router;

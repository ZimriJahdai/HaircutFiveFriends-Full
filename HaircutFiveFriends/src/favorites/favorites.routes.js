'use strict';

import express from 'express';
import multer from 'multer';
import { createFavorite, getFavorites, getFavoriteById, updateFavorite, deleteFavorite } from './favorites.controller.js';
import { validateJWT, authorizeRoles, attachClientFromToken } from '../../middlewares/validate-JWT.js';

const router = express.Router();
const upload = multer();

router.post(
	'/',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	attachClientFromToken,
	upload.none(),
	createFavorite
);
router.get(
	'/',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	attachClientFromToken,
	getFavorites
);
router.get(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	attachClientFromToken,
	getFavoriteById
);
router.put(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	attachClientFromToken,
	upload.none(),
	updateFavorite
);
router.delete(
	'/:id',
	validateJWT,
	authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
	attachClientFromToken,
	deleteFavorite
);

export default router;

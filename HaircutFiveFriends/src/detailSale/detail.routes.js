'use strict'

import { Router } from 'express'
import {
    createDetail,
    getDetails,
    getDetailsBySale,
    getDetailById,
    updateDetail,
    deleteDetail
} from './detail.controller.js'
import { uploadProfilePicture } from '../../middlewares/file-uploader.js'
import { validateJWT, authorizeRoles } from '../../middlewares/validate-JWT.js'

const router = Router()

router.post(
    '/create',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.none(),
    createDetail
)

router.get(
    '/sale/:saleId',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getDetailsBySale
)

router.get(
    '/',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getDetails
)

router.put(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.none(),
    updateDetail
)

router.delete(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    deleteDetail
)

router.get(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getDetailById
)

export default router

'use strict'

import { Router } from 'express'
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getRedeemableProducts
} from './product.controller.js'
import { uploadProfilePicture } from '../../middlewares/file-uploader.js'
import { validateJWT, authorizeRoles } from '../../middlewares/validate-JWT.js'

const router = Router()

router.post(
    '/create',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.single('image'),
    createProduct
)
router.get(
    '/',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getProducts
)
router.get(
    '/redeemable',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getRedeemableProducts
)
router.get(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getProductById
)
router.put(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.single('image'),
    updateProduct
)
router.delete(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE'),
    deleteProduct
)

export default router
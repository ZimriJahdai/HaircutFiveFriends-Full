'use strict'

import { Router } from 'express'
import {
    createSale,
    addDetailsToSale,
    getMySales,
    getSales,
    getSaleById,
    updateSale,
    deleteSale
} from './sale.controller.js'
import { uploadProfilePicture } from '../../middlewares/file-uploader.js'
import { validateSaleRequest } from '../../middlewares/sale-validator.js'
import requireAddressForDomicilio from '../../middlewares/requireAddressForDomicilio.js'
import { validateJWT, authorizeRoles } from '../../middlewares/validate-JWT.js'

const router = Router()

router.post(
    '/create',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.none(),
    validateSaleRequest,
    requireAddressForDomicilio,
    createSale
)

router.get(
    '/my-sales',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getMySales
)

router.get(
    '/',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getSales
)

router.put(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.none(),
    requireAddressForDomicilio,
    updateSale
)

router.put(
    '/:id/details',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.none(),
    addDetailsToSale
)

router.delete(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    deleteSale
)

router.get(
    '/:id',
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getSaleById
)


export default router

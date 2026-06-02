import express from 'express'
import { downloadInvoice } from './invoice.controller.js'
import { validateJWT, authorizeRoles } from '../../middlewares/validate-JWT.js'

const router = express.Router()

router.get('/pdf/:saleId', validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), downloadInvoice)

export default router
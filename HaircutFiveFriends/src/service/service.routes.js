'use strict';

import express from 'express';
import multer from 'multer';
import { 
    createService, 
    updateService,
    getAllServices,
    deleteService,
    getServiceById,
    getServicesByName,
    getServicesByStatus,
    getRedeemableServices
} from './service.controller.js';
import { validateCreateService, validateUpdateService } from '../../middlewares/service-validator.js';
import { validateJWT, authorizeRoles } from '../../middlewares/validate-JWT.js';

const router = express.Router();
const parseFormData = multer().none();

// Rutas principales
router.post('/crear', validateJWT, authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'), parseFormData, validateCreateService, createService);    // POST - Crear servicio
router.get('/obtener', validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), getAllServices);                 // GET - Obtener todos
router.get('/obtener/:id', validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), getServiceById);             // GET - Obtener por ID
router.put('/actualizar/:id', validateJWT, authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'), parseFormData, validateUpdateService, updateService); // PUT - Actualizar servicio
router.delete('/eliminar/:id', validateJWT, authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'), deleteService);          // DELETE - Eliminar servicio

// Rutas de filtrado
router.get('/redeemable', validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), getRedeemableServices);       // GET - Servicios canjeables por puntos
router.get('/estado/:status', validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), getServicesByStatus);     // GET - Filtrar por estado
router.get('/tipo/:name', validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), getServicesByName);           // GET - Filtrar por tipo de servicio

export default router;
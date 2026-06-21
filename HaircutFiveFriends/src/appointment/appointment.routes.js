import { Router } from "express";
import multer from "multer";
import { 
    createAppointment, 
    getAppointments, 
    getAppointmentById,
    getAppointmentsByDate,
    getAppointmentsByBarber,
    getAppointmentsByClient,
    getMyAppointments,
    updateAppointment,
    cancelAppointment
} from "./appointment.controller.js";
import {
    validateCreateAppointment,
    validateUpdateAppointment,
    validateBarberAvailability,
    validateBarberAvailabilityUpdate
} from "../../middlewares/appointment-validator.js";
import { validateJWT, authorizeRoles, attachClientFromToken, requireClientFromToken } from "../../middlewares/validate-JWT.js";

const router = Router();
const parseFormData = multer().none();

router.post(
    "/create",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    attachClientFromToken,
    parseFormData,
    validateCreateAppointment,
    validateBarberAvailability,
    createAppointment
);
router.get(
    "/",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getAppointments
);
router.get(
    "/mine",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    attachClientFromToken,
    requireClientFromToken,
    getMyAppointments
);
router.get(
    "/date/:date",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getAppointmentsByDate
);
router.get(
    "/barber/:barberId",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    getAppointmentsByBarber
);
router.get(
    "/client/:clientId",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getAppointmentsByClient
);
router.get(
    "/:id",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getAppointmentById
);
router.put(
    "/:id",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    parseFormData,
    validateUpdateAppointment,
    validateBarberAvailabilityUpdate,
    updateAppointment
);
router.delete(
    "/:id",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    cancelAppointment
);

export default router;
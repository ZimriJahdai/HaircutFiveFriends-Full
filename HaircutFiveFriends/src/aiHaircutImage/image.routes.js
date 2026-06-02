import { Router } from "express";
import { previewImage, saveImage } from "./image.controller.js";
import { validateJWT, authorizeRoles } from "../../middlewares/validate-JWT.js";

const router = Router();

router.post("/preview", validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), previewImage);
router.post("/save", validateJWT, authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'), saveImage);

export default router;

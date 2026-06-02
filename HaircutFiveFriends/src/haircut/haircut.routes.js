import { Router } from "express";
import { createHaircut, getHaircuts, getHaircutById, updateHaircut, deleteHaircut, getHaircutByFaceType, getHaircutByName } from "./haircut.controller.js"
import { uploadProfilePicture } from "../../middlewares/file-uploader.js";
import { validateCreateHaircut, validateUpdateHaircut } from "../../middlewares/haircut-validator.js";
import { validateJWT, authorizeRoles } from "../../middlewares/validate-JWT.js";

const router = Router();

router.post(
    "/create",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.single("imageRef"),
    validateCreateHaircut,
    createHaircut
);

router.get(
    "/",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getHaircuts
);

router.get(
    "/FaceType/:faceType",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getHaircutByFaceType
)

router.get(
    "/Name/:name",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getHaircutByName
)

router.get(
    "/:id",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
    getHaircutById
);

router.put(
    "/:id",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    uploadProfilePicture.single("imageRef"),
    validateUpdateHaircut,
    updateHaircut
);

router.delete(
    "/:id",
    validateJWT,
    authorizeRoles('ADMIN_ROLE', 'EMPLOYEE_ROLE'),
    deleteHaircut
);

export default router;
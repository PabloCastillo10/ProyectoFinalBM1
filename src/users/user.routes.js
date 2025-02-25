import { Router } from "express";

import { login, register, updateProfile, deleteUser, activateUser } from "./user-controller.js";

import { validarCampos } from "../../middlewares/validar-campos.js";

import { validarUserJWT } from "../../middlewares/validar-jwt.js";

import { registerUserValidator, loginUserValidator } from "../../middlewares/validator.js";

const router = Router();


router.post("/register", registerUserValidator, register, validarCampos);

router.post("/login", loginUserValidator, login, validarUserJWT, validarCampos);

router.put("/:id", validarUserJWT, updateProfile, validarCampos);

router.delete("/:id", validarUserJWT, deleteUser, validarCampos);

router.put("/activate/:id", validarUserJWT, activateUser, validarCampos);

export default router;
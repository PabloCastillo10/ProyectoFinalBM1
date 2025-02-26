import { body } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { existenteEmailUser } from "../helpers/db-validator-.js";

export const registerUserValidator = [
    body("name", "El nombre es obligatorio").notEmpty(),
    body("surname", "El apellido es obligatorio").notEmpty(),
    body("email", "El email es obligatorio").notEmpty().isEmail().withMessage("Debe ser un correo válido"),
    body("email").custom(existenteEmailUser),
    body("password", "La contraseña debe tener al menos 8 caracteres").isLength({ min: 8 }),
    validarCampos,
];


export const loginUserValidator = [
    body("email").optional().isEmail().withMessage("Ingrese un correo válido"),
    body("username").optional().isString().withMessage("Enter a valid username"),
    body("password", "La contraseña debe tener al menos 8 caracteres").isLength({ min: 8 }),
    validarCampos,
];


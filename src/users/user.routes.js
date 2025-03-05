import { Router } from "express";

import { login, register, updateProfile, getUsers, deleteUser, activateUser, editUser, updateRole, deleteCliente, 
    ObtenerProductoMasVendido, obtenerProductosCategoria, buscarProductoPorNombre, getCategories } from "./user-controller.js";

import { validarCampos } from "../../middlewares/validar-campos.js";

import { validarUserJWT } from "../../middlewares/validar-jwt.js";

import { registerUserValidator, loginUserValidator } from "../../middlewares/validator.js";

const router = Router();


router.post("/register", registerUserValidator, register, validarCampos);

router.post("/login", loginUserValidator, login, validarUserJWT, validarCampos);

router.get("/",  getUsers);

router.put("/:id", validarUserJWT, updateProfile, validarCampos);

router.delete("/:id", validarUserJWT, deleteUser, validarCampos);

router.put("/activate/:id", validarUserJWT, activateUser, validarCampos);

router.put("/edit/:id", validarUserJWT, editUser, validarCampos);

router.put("/updateRole/:id", validarUserJWT, updateRole, validarCampos);

router.delete("/deleteCliente/:id", validarUserJWT, deleteCliente, validarCampos);

router.get('/masvendido', ObtenerProductoMasVendido);

router.get('/categorias/:id', validarUserJWT,obtenerProductosCategoria);

router.get('/buscar/:name',validarUserJWT, buscarProductoPorNombre);

router.get('/categorias', getCategories);
export default router;
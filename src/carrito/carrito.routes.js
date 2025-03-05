import { Router } from "express";
import { validarUserJWT } from "../../middlewares/validar-jwt.js";
import { agregarProductoAlCarrito, obtenerCarrito,  procesarCompra } from "./carrito.controller.js";

const router = Router();

router.post("/", validarUserJWT, agregarProductoAlCarrito);

router.get("/:id", validarUserJWT,  obtenerCarrito); 


router.post("/compra/:id", validarUserJWT, procesarCompra);


export default router;
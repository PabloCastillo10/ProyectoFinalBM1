import { Router } from "express";
import { validarUserJWT } from "../../middlewares/validar-jwt.js";
import { agregarProductoAlCarrito, obtenerCarrito, eliminarProductoDelCarrito, procesarCompra } from "./carrito.controller.js";

const router = Router();

router.post("/", validarUserJWT, agregarProductoAlCarrito);

router.get("/:id", validarUserJWT,  obtenerCarrito); 

router.delete("/:id", validarUserJWT, eliminarProductoDelCarrito);

router.post("/compra", validarUserJWT, procesarCompra);

export default router;
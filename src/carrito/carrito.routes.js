import { Router } from "express";
import { validarUserJWT } from "../../middlewares/validar-jwt.js";
import { agregarProductoAlCarrito, obtenerCarrito, editarCompraCarrito, eliminarProductoDelCarrito, procesarCompra, obtenerHistorialFactura } from "./carrito.controller.js";

const router = Router();

router.post("/", validarUserJWT, agregarProductoAlCarrito);

router.get("/:id", validarUserJWT,  obtenerCarrito); 

router.put("/compra/:id", validarUserJWT, editarCompraCarrito); 

router.delete("/:id", validarUserJWT, eliminarProductoDelCarrito);

router.post("/compra", validarUserJWT, procesarCompra);

router.get("/historial/:id", validarUserJWT, obtenerHistorialFactura);

export default router;
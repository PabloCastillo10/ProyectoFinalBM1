import { Router } from "express";
import { validarUserJWT } from "../../middlewares/validar-jwt.js";
import { editarFactura, obtenerProductoFactura, obtenerHistorialFactura, detalleProductoFactura } from "./factura.controller.js";

const router = Router();

router.put("/:id", validarUserJWT, editarFactura);

router.get("/historial/:id", validarUserJWT,  obtenerHistorialFactura);

router.get("/detalle/:facturaId/:productoId", validarUserJWT, detalleProductoFactura);


router.get("/factura/:id", validarUserJWT,  obtenerProductoFactura);

export default router;
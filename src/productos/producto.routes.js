import express from 'express';
import { validarUserJWT } from '../../middlewares/validar-jwt.js';
import { validarCampos } from '../../middlewares/validar-campos.js';
import { createProduct, getAllProducto, getProductoById, updateProducto, deleteProducto, activateProducto, productoAgotados, productoMasVendido } from './producto.controller.js';

const router = express();

router.post('/', validarUserJWT, validarCampos, createProduct);

router.get('/',  getAllProducto);

router.get('/agotados', validarUserJWT,  productoAgotados); 

router.get('/masvendido', productoMasVendido); 

router.get('/:id', getProductoById);

router.put('/:id', validarUserJWT, validarCampos, updateProducto);

router.delete('/:id', validarUserJWT, deleteProducto);

router.put('/activate/:id', validarUserJWT, activateProducto);



export default router;
import express from 'express';
import { check } from 'express-validator';
import { saveCategory, getCategories, updateCategory, deleteCategory, activateCategory } from './categoria.controller.js';
import { validarUserJWT } from '../../middlewares/validar-jwt.js';
import { validarCampos } from '../../middlewares/validar-campos.js';


const router = express.Router();

router.post('/', validarUserJWT, validarCampos, saveCategory)

router.get('/',  getCategories);

router.put('/:id', validarUserJWT, validarCampos,  updateCategory);

router.delete('/:id', validarUserJWT, deleteCategory);

router.put('/activate/:id', validarUserJWT, activateCategory);

export default router;
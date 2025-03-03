'use strict';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {dbConnection} from './mongo.js';
import userRoutes from '../src/users/user.routes.js'
import categoriaRoutes from '../src/categorias/categoria.routes.js'
import productoRoutes from '../src/productos/producto.routes.js'
import { createAdmin } from '../src/users/user-controller.js';
import { categoriaDefecto } from '../src/categorias/categoria.controller.js';
import carritoRoutes from '../src/carrito/carrito.routes.js';
const configurarMiddlewares = (app) => {
    app.use(express.urlencoded({extended: false}));
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('dev'));
}
const configRoutes = (app) => {
    app.use('/proyectofinal/users', userRoutes);
    app.use('/proyectofinal/categorias', categoriaRoutes);
    app.use('/proyectofinal/productos', productoRoutes);
    app.use('/proyectofinal/carrito', carritoRoutes); 
}
 const conectarDB = async  () => {
    try{
        await dbConnection();
        console.log("Conexión a la base de datos exitosa");
        await createAdmin();
        await categoriaDefecto();
    }catch(error){
        console.error('Error conectando a la base de datos', error);
        process.exit(1);
    }
}
export const initServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;
    await conectarDB();
    configurarMiddlewares(app);
    configRoutes(app);
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
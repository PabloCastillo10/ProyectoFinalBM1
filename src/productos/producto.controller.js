import productoModel from "./producto.model.js";
import { hash, verify } from "argon2";
import { request, response } from "express";
import categoriaModel from "../categorias/categoria.model.js";


export const createProduct = async (req, res) => {
    try {
        const data = req.body;
        const authenticatedUser = req.user;
        const categoria = await categoriaModel.findOne({ name: data.categoria }); 

        if(!categoria) {
            return res.status(404).json({
                succes: false,
                msg: 'Categoria No Encontrada'
            });
        }

        if (!authenticatedUser || authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para crear productos" });
        }

        const newProduct = new productoModel({
            ...data,
            categoria: categoria._id  

        });
        await newProduct.save();

        const productoGuardado = await productoModel.findById(newProduct._id) 
        .populate('categoria', 'name')
 
         return  res.status(200).json({
            success: true,
            msg: "Producto creado correctamente",
            producto: productoGuardado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "Hubo un error en la creación del producto"});
    }
}


export const getAllProducto = async (req, res) => {
    try {
        const productos = await productoModel.find()
       .populate('categoria', 'name');
        res.status(200).json({
            success: true,
            msg: "Productos obtenidos correctamente",
            productos
        });
       } catch (error) {
        console.error(error);
        res.status(500).json({msg: "Hubo un error en la obtención de productos"});
       }
}


export const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await productoModel.findById(id)
       .populate('categoria', 'name');

        if (!producto) {
            return res.status(404).json({msg: "Producto no encontrado"});
        }

        res.status(200).json({
            success: true,
            msg: "Producto obtenido correctamente",
            producto
        });
       } catch (error) {
        console.error(error);
        res.status(500).json({msg: "Hubo un error en la obtención del producto"});
       }
}


export const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const {categoria, ...data}= req.body; 
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role!== "ADMIN_ROLE" ) {
            return res.status(403).json({ msg: "No tiene permisos para actualizar productos" });
        }

        const categoriaEncontrada = await categoriaModel.findOne({ name: categoria });
        if (!categoriaEncontrada) {
            return res.status(404).json({ msg: "La categoría no existe" });
        }

        data.categoria = categoriaEncontrada._id;

        const productoActualizado = await productoModel.findByIdAndUpdate(id, data, {new: true})

        if (!productoActualizado) {
            return res.status(404).json({msg: "Producto no encontrado"});
        }


        res.status(200).json({
            success: true,
            msg: "Producto actualizado correctamente",
            producto: productoActualizado
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({msg: "Hubo un error en la actualización del producto"});
        }
}


export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedUser = req.user;
        if (!authenticatedUser || authenticatedUser.role!== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para eliminar productos" });
        }
         await productoModel.findByIdAndUpdate(id, {status: false}, {new: true});
 

        res.status(200).json({
            success: true,
            msg: "Producto eliminado correctamente"
        });

        } catch (error) {
            console.error(error);
            res.status(500).json({msg: "Hubo un error en la eliminación del producto"});
        }
}


export const activateProducto = async (req, res ) => {
    try {
        const { id } = req.params;
        const authenticatedUser = req.user;
        if (!authenticatedUser || authenticatedUser.role!== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para activar productos" });
        }
        await productoModel.findByIdAndUpdate(id, {status: true}, {new: false}); 

        res.status(200).json({
            success: true,
            msg: "Producto activado correctamente"
        });

        } catch (error) {
            console.error(error);
            res.status(500).json({msg: "Hubo un error en la activacion del producto"});
        }
}

export const productoAgotados = async (req, res) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser || authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para obtener productos agotados" });
        }

        const productosAgotados = await productoModel.find({ stock: 0 });

        res.status(200).json({
            success: true,
            msg: "Productos agotados obtenidos correctamente",
            productos: productosAgotados
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error en la obtención de productos agotados" });
    }
}; 

export const productoMasVendido = async (req, res) => {
    try {
        const productos = await productoModel.find().sort({ stock: 1 });

        const productosModificados = productos.map(producto => ({
            ...producto.toObject(),
            stock: producto.stock < 0 ? 0 : producto.stock
        }));

        res.status(200).json({
            success: true,
            msg: "Producto más vendido obtenido correctamente",
            productoMasVendido: productosModificados
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error en la obtención del producto más vendido" });
    }
}; 

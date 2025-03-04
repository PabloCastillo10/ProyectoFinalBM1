import productoModel from "../productos/producto.model.js";
import categoriaModel from "./categoria.model.js";
import { request, response } from "express";

export const saveCategory =  async (req, res) => {
    try {
        const {name, description} = req.body; 
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para crear categorías" });
        } 
        
        const nuevaCategoria = await categoriaModel.create({ name, description });
        res.status(201).json({ 
            msg: "Categoría creada exitosamente", 
            categoria: nuevaCategoria 
        });

    
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error en el server", error: err.message });
    }
}


export const getCategories = async (req, res) => {
    try {
        const categorias = await categoriaModel.find();
        res.status(200).json({ categorias });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error en el server", error: err.message });
        }
}

export const updateCategory = async (req, res) => {
        const { id } = req.params;
        const { name, description } = req.body;
        const authenticatedUser = req.user;
    try {
            

        if (!authenticatedUser || authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para editar  categorías" });
        } 
        
        const categoriaGeneral = await categoriaModel.findOne({ name: "Defecto" });

        
        if (categoriaGeneral && categoriaGeneral._id.toString() === id) {
            return res.status(400).json({
                success: false,
                msg: 'No puedes desactivar o eliminar la categoría por defecto General'
            });
        } 

        const categoria = await categoriaModel.findByIdAndUpdate(id, { name, description }, { new: true });
        
        if(!categoria) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }
        
        res.status(200).json({
            msg: "Categoría actualizada correctamente",
            categoria
        })
     } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el server", error: error.message });
     }
}

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedUser = req.user;

    
        if (!authenticatedUser || authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para eliminar categorías" }); 
        } 

       
        const categoriaGeneral = await categoriaModel.findOne({ name: "Defecto" });

        
        if (categoriaGeneral && categoriaGeneral._id.toString() === id) {
            return res.status(400).json({
                success: false,
                msg: 'No puedes desactivar o eliminar la categoría por defecto General'
            });
        } 

        const productoAsociado = await productoModel.find({categoria: id})

        if (productoAsociado.length > 0) {
            await productoModel.updateMany(
                {categoria: id},
                {categoria: categoriaGeneral._id}
                 
            )
        }

      
        const categoria = await categoriaModel.findByIdAndUpdate(id, { estado: false }, { new: true }); 

        if (!categoria) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }

        res.status(200).json({
            msg: "Categoría desactivada correctamente",
            categoria
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor", error: error.message });
    }
}


export const activateCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para activar las  categorías" }); 
        } 
        const categoriaGeneral = await categoriaModel.findOne({ name: "Defecto".toLowerCase() });

        if (categoriaGeneral && categoriaGeneral._id.toString() === id) {
            return res.status(400).json({
                success: false,
                msg: 'No puedes cambiar el estado de la categoría por defecto General'
            });
        } 

        const categoria = await categoriaModel.findByIdAndUpdate(id, {estado : true}, {new : false}); 
        res.status(200).json({
            msg: "Categoría activada correctamente",
            categoria
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el server", error: error.message });
    }
}
export const categoriaDefecto = async () => {
    try { 
        const verifyCatego  = await categoriaModel.findOne({name : "Defecto" });

        if(!verifyCatego) {
            const categoria = new categoriaModel({
                name: "Defecto",
                description: "Categoría por defecto"
            });
            await categoria.save();

            console.log("Categoría por defecto creada");
        } else {
            console.log("Categoría por defecto ya existe");
        }
    } catch (error) {
        console.error("Error al crear la categoria por defecto: ", error);
    }
}

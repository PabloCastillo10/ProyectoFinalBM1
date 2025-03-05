import facturaModel from "./factura.model.js";
import productoModel from "../productos/producto.model.js";
import userModel from "../users/user-model.js";
import carritoModel from "../carrito/carrito.model.js";



export const editarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { productoId, cantidad } = req.body;
        const authenticatedUser = req.user;

     
        if (!authenticatedUser || authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tienes permisos para editar facturas" });
        }

     
        const factura = await facturaModel.findById(id).populate('productos.producto');

        if (!factura) {
            return res.status(404).json({ msg: "Factura no encontrada" });
        }

      
        if (!Array.isArray(productoId) || !Array.isArray(cantidad)) {
            return res.status(400).json({ msg: "productoId y cantidad deben ser arreglos" });
        }

        if (productoId.length !== cantidad.length) {
            return res.status(400).json({ msg: "La cantidad de productos y cantidades debe coincidir" });
        }

        let totalNuevo = 0;

        for (let i = 0; i < productoId.length; i++) {
            const prodId = productoId[i];
            const nuevaCantidad = parseInt(cantidad[i], 10);

      
            const productoEnFactura = factura.productos.find(p => p.producto._id.toString() === prodId);
            if (!productoEnFactura) {
                return res.status(404).json({ msg: `El producto con ID ${prodId} no está en la factura` });
            }

        
            const producto = await productoModel.findById(prodId);
            if (!producto) {
                return res.status(404).json({ msg: `Producto con ID ${prodId} no encontrado` });
            }

            const cantidadAnterior = productoEnFactura.cantidad;

           
            if (nuevaCantidad > cantidadAnterior) {
                const diferencia = nuevaCantidad - cantidadAnterior;
                if (diferencia > producto.stock) {
                    return res.status(400).json({ msg: `No hay suficiente stock para el producto con ID ${prodId}` });
                }
                producto.stock -= diferencia;
            } else if (nuevaCantidad < cantidadAnterior) {
                const diferencia = cantidadAnterior - nuevaCantidad;
                producto.stock += diferencia;
            }

        
            productoEnFactura.cantidad = nuevaCantidad;

           
            await producto.save();

           
            totalNuevo += producto.price * nuevaCantidad;
        }

        factura.total = totalNuevo;
        await factura.save();

        res.status(200).json({
            msg: "Factura actualizada correctamente",
            factura
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al editar la factura", error: error.message });
    }
};
;


export const obtenerProductoFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedUser = req.user;
        const factura = await facturaModel.findById(id).populate('productos.producto', 'name price');

        if (!factura) {
            return res.status(404).json({ msg: "Factura no encontrada" });
        }

        if (authenticatedUser.role !== "ADMIN_ROLE" && authenticatedUser.id !== factura.usuario.toString()) {
            return res.status(403).json({ msg: "No tiene permisos para ver esta factura" });
        }

        res.status(200).json({
            msg: "Productos de la factura",
            factura
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener la factura", error: error.message });
    }
};


export const detalleProductoFactura = async (req, res) => {
    try {
        const { facturaId, productoId } = req.params;
        const authenticatedUser = req.user;

       
        if (authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para ver este producto en esta factura" });
        }

        
        const factura = await facturaModel.findById(facturaId).populate('productos.producto', 'name price');

        if (!factura) {
            return res.status(404).json({ msg: "Factura no encontrada" });
        }

       
        const productoDetalle = factura.productos.find(item => 
            item.producto && item.producto._id.equals(productoId)
        );

        if (!productoDetalle) {
            return res.status(404).json({ msg: "Producto no encontrado en la factura" });
        }

        res.status(200).json({
            msg: "Detalle del producto en la factura",
            producto: productoDetalle
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener el detalle del producto en la factura", error: error.message });
    }
};


export const obtenerHistorialFactura = async (req, res) => {
    try {
        const authenticatedUser = req.user;
        const user = await userModel.findById(authenticatedUser.id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado en la base de datos" });
        }

        if (!authenticatedUser || authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "No tienes permisos para acceder al historial de compras" });
        }

        const usuarioId = authenticatedUser._id;

       
        const carrito = await facturaModel.findOne({ usuario: usuarioId })
            .populate('usuario', 'name') 
            .populate('productos.producto') 
            .sort({ fecha: -1 }); 

            if (!carrito) {
                return res.status(403).json({ msg: "No puedes acceder el historial si no eres el propietario " });
            }

        if (!carrito || carrito.length === 0) {
            return res.status(404).json({ msg: "No hay facturas registradas para este usuario " });
        }

        res.status(200).json({ historial: carrito });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener el historial de compras" });
    }
}; 
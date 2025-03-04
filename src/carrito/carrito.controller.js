import carritoModel from "./carrito.model.js";
import productoModel from "../productos/producto.model.js";
import userModel from "../users/user-model.js";
import facturaModel from "../factura/factura.model.js";

export const agregarProductoAlCarrito = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "Debes iniciar sesión para agregar productos al carrito" });
        }

        if (!Array.isArray(productoId) || !Array.isArray(cantidad) || productoId.length !== cantidad.length) {
            return res.status(400).json({ msg: "Datos inválidos. Asegúrate de enviar arrays de productoId y cantidad del mismo tamaño." });
        }

        const usuarioId = authenticatedUser._id;
        let carrito = await carritoModel.findOne({ usuario: usuarioId });

        if (!carrito) {
            carrito = new carritoModel({ usuario: usuarioId, productos: [] });
        }

        for (let i = 0; i < productoId.length; i++) {
            const idProducto = productoId[i];
            const cantidadProducto = parseInt(cantidad[i], 10);

            const producto = await productoModel.findById(idProducto);
            if (!producto) {
                return res.status(404).json({ msg: `Producto con ID ${idProducto} no encontrado` });
            }

            if (cantidadProducto > producto.stock) {
                return res.status(400).json({ msg: `No hay suficiente stock para el producto con ID ${idProducto}` });
            }

            const productoEnCarrito = carrito.productos.find(p => p.producto.toString() === idProducto);

            if (productoEnCarrito) {
                productoEnCarrito.cantidad += cantidadProducto;
            } else {
                carrito.productos.push({ producto: idProducto, cantidad: cantidadProducto });
            }

            producto.stock -= cantidadProducto;
            await producto.save();
        }

        await carrito.save();
        res.status(200).json({ msg: "Productos agregados al carrito correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al agregar los productos al carrito" });
    }
}; 


export const obtenerCarrito = async (req, res) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser || authenticatedUser.role!== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "Debes iniciar sesión para obtener el carrito" });
        }
        
        const usuarioId = authenticatedUser._id;  
        const carrito = await carritoModel
            .findOne({ usuario: usuarioId })
            .populate({
                path: 'productos.producto', 
                select: 'nombre precio stock'
            });  

        if (!carrito) {
            return res.status(403).json({ msg: "No puedes obtener listado de carrito " });
        } 
        if (!carrito) {
            return res.status(404).json({ msg: "Carrito no encontrado" });
        }
        

        res.status(200).json({ carrito });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener el carrito" });
    }
}

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

export const eliminarProductoDelCarrito = async (req, res) => {
    try {
        const { usuarioId, productoId } = req.params;
        const authenticatedUser = req.user;
        let carrito = await carritoModel.findOne({ userModel: usuarioId});
        if (!authenticatedUser || authenticatedUser.role!== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "Debes iniciar sesión para eliminar productos del carrito" });
        }

        if (!carrito) {
            return res.status(404).json({ msg: "El carrito no existe" });
        }

        carrito.productos = carrito.productos.filter(producto => producto.producto != productoId);
        await carrito.save();
        res.status(200).json({ msg: "Producto eliminado del carrito correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al eliminar el producto del carrito" });
    }
} 

export const procesarCompra = async (req, res) => {
    try {
        const authenticatedUser = req.user;
        const user = await userModel.findById(authenticatedUser.id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado en la base de datos" });
        }
        if (authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "No tienes permiso para procesar una compra" });
        }
        const usuarioId = authenticatedUser._id;
        const carrito = await carritoModel.findOne({ usuario: usuarioId }).populate('productos.producto');
        if (!carrito) {
            return res.status(403).json({ msg: "No puedes procesar la compra de otro usuario o no tienes un carrito activo" });
        }
        if (carrito.productos.length === 0) {
            return res.status(400).json({ msg: "No hay productos en el carrito para procesar la compra" });
        }
        let totalCompra = 0;
        for (const item of carrito.productos) {
            const producto = item.producto;
            totalCompra += producto.price * item.cantidad;
            producto.stock < 0 ? 0 : item.cantidad
            await producto.save();
        }
        const factura = new facturaModel({
            usuario: usuarioId,
            productos: carrito.productos.map(item => ({ producto: item.producto, cantidad: item.cantidad })),
            total: totalCompra,
            fecha: new Date(),
        })
        await factura.save();

        
        res.status(200).json({
            msg: "Compra procesada correctamente",
            totalCompra,
            factura
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al procesar la compra" });
    }
}


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
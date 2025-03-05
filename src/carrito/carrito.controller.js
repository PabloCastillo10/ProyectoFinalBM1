import carritoModel from "./carrito.model.js";
import productoModel from "../productos/producto.model.js";
import userModel from "../users/user-model.js";
import facturaModel from "../factura/factura.model.js";

export const agregarProductoAlCarrito = async (req, res) => {
    try {
        let { productoId, cantidad } = req.body;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "Debes iniciar sesión para agregar productos al carrito" });
        }

        if (!Array.isArray(productoId)) {
            productoId = [productoId];
        }
        if (!Array.isArray(cantidad)) {
            cantidad = [cantidad];
        }

        if (productoId.length !== cantidad.length) {
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
        const carritoId = req.params.id;
        const carrito = await carritoModel
            .findOne({ _id: carritoId, usuario: usuarioId })
            .populate({
                path: 'productos.producto', 
                select: 'nombre precio stock'
            });  
        
        if (!carrito) {
                return res.status(403).json({ msg: "No puedes procesar la lista de otro usuario o no tienes un carrito activo" });
        }
    

        res.status(200).json({ carrito });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener el carrito" });
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
        const carritoId = req.params.id;
        const carrito = await carritoModel.findOne({ _id: carritoId, usuario: usuarioId }).populate('productos.producto');
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
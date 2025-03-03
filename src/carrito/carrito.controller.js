import carritoModel from "./carrito.model.js";
import productoModel from "../productos/producto.model.js";
import userModel from "../users/user-model.js";
import facturaModel from "../factura/factura.model.js";

export const agregarProductoAlCarrito = async (req, res) => {
    try {
        const {  productoId, cantidad } = req.body;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role!== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "Debes iniciar sesión para agregar productos al carrito" });
        }

        const usuarioId = authenticatedUser._id;

        const producto = await productoModel.findById(productoId);
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        if (cantidad >  producto.stock) {
            return res.status(400).json({ msg: "No hay suficiente stock para este producto" });
        }

        let carrito = await carritoModel.findOne({ usuario: usuarioId})

        if (!carrito) {
            carrito = new carritoModel({usuario: usuarioId, productos: []})
        }

        const productoEnCarrito = carrito.productos.find(producto => producto.producto == productoId);

        if (productoEnCarrito) {
            productoEnCarrito.cantidad +=  parseInt(cantidad, 10);
        } else {
            carrito.productos.push({ producto: productoId, cantidad: parseInt(cantidad, 10) });
        }
        producto.stock -= parseInt(cantidad, 10);
        await carrito.save();
        await producto.save(); 

        res.status(200).json({ msg: "Producto agregado al carrito correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al agregar el producto al carrito" });
    }
}


export const obtenerCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const authenticatedUser = req.user;
        if (!authenticatedUser || authenticatedUser.role!== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "Debes iniciar sesión para obtener el carrito" });
        }

        const carrito = await carritoModel.findOne({ userModel: usuarioId}).populate('productos.producto');

        if (!carrito) {
            return res.status(404).json({ msg: "Carrito no encontrado" });
        }

        res.status(200).json({ carrito });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener el carrito" });
    }
}


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

        if (!authenticatedUser || authenticatedUser.role!== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "Debes iniciar sesión para procesar la compra" });
        }

        const usuarioId = authenticatedUser._id;
        const carrito = await carritoModel.findOne({ usuario: usuarioId}).populate('productos.producto');

        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ msg: "No hay productos en el carrito para procesar la compra" });
        }

        let totalCompra = 0;
        for (const item of carrito.productos) {
            const producto = item.producto;

            if(!producto || item.cantidad > producto.stock) {
                return res.status(400).json({ msg: "No hay suficiente stock para procesar la compra" });
            }

            totalCompra += producto.price * item.cantidad;
            producto.stock -= item.cantidad;
            await producto.save();
        }

        const factura = new facturaModel({
            usuario: usuarioId,
            productos: carrito.productos.map(item => ({ producto: item.producto, cantidad: item.cantidad })),
            fecha: new Date(),
        })

        await factura.save();

        await carritoModel.findOneAndUpdate({ usuario: usuarioId }, { productos: [] });

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


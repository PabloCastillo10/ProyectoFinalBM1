import facturaModel from "./factura.model.js";
import productoModel from "../productos/producto.model.js";
import userModel from "../users/user-model.js";

export const editarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedUser = req.user;
        const {productos} = req.body;
        if (!authenticatedUser || authenticatedUser.role!== "ADMIN_ROLE") {
            return res.status(403).json({ msg: "No tiene permisos para editar facturas" });
        }


        const factura = await facturaModel.findById(id);
        if (!factura) {
            return res.status(404).json({ msg: "Factura no encontrada" });
        }

        for (const item of productos) {
            const producto = await productoModel.findById(item.productoId);
            if (!producto) {
                return res.status(404).json({ msg: `Producto ${item.productoId} no encontrado` });
            }
        }

        if (productoModel.stock < item.cantidad) {
            return res.status(400).json({ msg: `No hay stock suficiente para el producto ${productoModel.name}` });
        }

        factura.productos = productos;
        await factura.save();

        res.status(200).json({
            msg: "Factura editada correctamente",
            factura
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error en el server", error: error.message });
    }
}


export const obtenerProductoFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedUser = req.user;
        const facturas = await facturaModel.findById(id).populate('productos.productoId', 'name price');

        if (!authenticatedUser || (authenticatedUser.role!== "ADMIN_ROLE" && authenticatedUser.id!== facturas[0].userId)) {
            return res.status(403).json({ msg: "No tiene permisos para ver productos de esta factura" });
        }

        if (!facturas.length) {
            return res.status(404).json({ msg: "Factura no encontrada" });
        }

        res.status(200).json({
            msg: "Productos de la factura",
            facturas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener las facturas del usuario", error: error.message });
    }
}


export const detalleProductoFactura = async (req, res) => {
    try {
        const { id, productoId } = req.params;
        const authenticatedUser = req.user;
        const facturas = await facturaModel.findById(id).populate('productos.productoId', 'name price');

        if (!authenticatedUser || (authenticatedUser.role!== "ADMIN_ROLE" && authenticatedUser.id!== facturas[0].userId)) {
            return res.status(403).json({ msg: "No tiene permisos para ver detalle de este producto en esta factura" });
        }

        if (!facturas.length) {
            return res.status(404).json({ msg: "Factura no encontrada" });
        }

        res.status(200).json({
            msg: "Detalle del producto en la factura",
            facturas
        })

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Hubo un error al obtener el detalle del producto en la factura", error: error.message });
        }
}
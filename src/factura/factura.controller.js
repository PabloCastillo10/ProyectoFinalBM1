import facturaModel from "./factura.model.js";
import productoModel from "../productos/producto.model.js";
import userModel from "../users/user-model.js";


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
        const { id, productoId } = req.params;
        const authenticatedUser = req.user;
        const factura = await facturaModel.findById(id).populate('productos.producto', 'name price');

        if (!factura) {
            return res.status(404).json({ msg: "Factura no encontrada" });
        }

        if (authenticatedUser.role !== "ADMIN_ROLE" && authenticatedUser.id !== factura.usuario.toString()) {
            return res.status(403).json({ msg: "No tiene permisos para ver este producto en esta factura" });
        }

        const productoDetalle = factura.productos.find(item => item.producto._id.toString() === productoId);

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
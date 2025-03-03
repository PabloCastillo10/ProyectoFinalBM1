import { Schema, model } from "mongoose";

const carritoSchema = Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productos: [
        {
            producto: {
                type: Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
            },
            cantidad: {
                type: Number,
                required: true
            },
        }
    ],
},
{
    timestamps: true,
    versionKey: false,
})

carritoSchema.methods.toJSON = function () {
    const { __v, _id,...carrito } = this.toObject();
    carrito.id = _id;
    return carrito;
}

export default model('Carrito', carritoSchema);
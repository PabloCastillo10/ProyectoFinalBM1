import { Schema, model } from "mongoose";

const facturaSchema = Schema({
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
    total: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true,
    versionKey: false
})

facturaSchema.methods.toJSON = function () {
    const { __v, _id, ...factura } = this.toObject();
    factura.id = _id;
    return factura;
}

export default model('Factura', facturaSchema);
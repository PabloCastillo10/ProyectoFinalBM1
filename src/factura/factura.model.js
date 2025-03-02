import { Schema, model } from "mongoose";

const facturaSchema = Schema({
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    productos: [{
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    }],
    cantidad: {
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
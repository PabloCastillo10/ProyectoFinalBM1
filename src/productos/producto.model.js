import { Schema, model  } from "mongoose";

const productSchema =  Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },
    status : {
        type: Boolean,
        default: true
    }
    
},
    {
        timestamps: true,
        versionKey: false
    })

    productSchema.methods.toJSON = function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    }
    
export default  model('Producto', productSchema);
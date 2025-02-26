import { model, Schema } from "mongoose";

const categoriaSchema = Schema({
    name : {
        type: String,
        required: true,
        unique: true
    },
    description : {
        type: String,
        required: true
    },
    estado: {
        type: Boolean,
        default: true
    }
    },
    {
        timestamps: true,
        versionKey : false
    }
)

categoriaSchema.methods.toJSON = function () {
    const { __v, _id,...categoria } = this.toObject();
    categoria.id = _id;
    return categoria;
}

export default  model('Categoria', categoriaSchema);
import { Schema, model } from "mongoose";


const userSchema = Schema(
    {

        name: {
            type: String,
            required: true
            },
        surname: {
            type: String,
            required: true
            },
        username: {
            type: String,
            required: true,
            unique: true
            },
        password: {
            type: String,
            required: true
            },
        email: {
            type: String,
            required: true,
            unique: true
            },
        role: {
            type: String,
            enum: ['ADMIN_ROLE', 'CLIENTE_ROLE'],
            default: 'CLIENTE_ROLE'
            },
        estado: {
            type : Boolean,
            default : true,
        }
},
    {
        timestamps: true,
        versionKey: false
    })

    userSchema.methods.toJSON = function () {
        const { __v, _id,...object } = this.toObject();
        object.id = _id;
        return object;
    }

    export default model('User', userSchema);
import userModel from "./user-model.js";
import {hash, verify} from 'argon2';
import { generarJWT } from "../../helpers/generate-jwt.js";
import  { response, request } from "express";


export const login = async (req, res) => {

    const {email, password, username} = req.body;

    try {
        const lowerEmail = email ? email.toLowerCase() : null;
        const lowerUsername = username ? username.toLowerCase() : null;

        const user = await userModel.findOne({
            $or: [
                { email: lowerEmail },
                { username: lowerUsername  }
            ]
        })

        if (!user) {
            return res.status(404).json({
                msg: "No se encontró ningún usuario con ese email o username en la base de datos"
            });
        }
        const validPassword = await verify(user.password, password);

        if (!validPassword) {
            return res.status(400).json({
                msg: "Contraseña incorrecta"
            });
        }

        const token = await generarJWT(user.id);

        return res.status(200).json({
            msg: "Inicio de sesion completado y correcto mano",
            userDetails: {
                username: user.username,
                token: token
            }
        })
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            msg: "Hubo un error en el inicio de sesion",
            error: error.message
        })
    }
    
}



export const register = async (req, res) => {

    try {
        const data = req.body;

        const encryptedPassword = await hash(data.password);

        const user = await userModel.create({
            name: data.name,
            surname: data.surname,
            username: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            password: encryptedPassword,
        });


        res.status(200).json({
            msg: 'Cliente registrado correctamente :)',
            userDetails: {
                user: user
            }
        })
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            msg: 'Hubo un error en el registro del cliente',
            error: error.message
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, surname, username, oldPassword, newPassword } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User no encontrado en la base de datos" });
        }

        if (username && username !== user.username) {
            const existingUser = await userModel.findOne({ username: username.toLowerCase() }); 
            if (existingUser) {
                return res.status(400).json({ msg: "Username en uso" });
            }
            user.username = username.toLowerCase();  
        }

        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ msg: "Contraseña antigua se requiere mano para cambiar la contraseña" });
            }

            const isMatch = await verify(user.password, oldPassword); 
            if (!isMatch) {
                return res.status(400).json({ msg: "Contraseña antigua incorrecta" });
            }

            user.password = await hash(newPassword);
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;
        await user.save();

        res.status(200).json({
            msg: "Usuario actualizado correctamente",
            userDetails: {
                name: user.name,
                surname: user.surname,
                username: user.username,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};



export const deleteUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

    
        if (!password) {
            return res.status(400).json({
                success: false,
                msg: 'Debe ingresar la contraseña para desactivar al usuario'
            });
        }

   
        const user = await userModel.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

      
        const isPasswordValid = await verify(user.password, password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                msg: 'Contraseña incorrecta'
            });
        }

        user.estado = false;
        await user.save();

        const authenticatedUser = req.user;  

        res.status(200).json({
            success: true,
            msg: 'Usuario desactivado correctamente',
            user,
            authenticatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al desactivar el usuario',
            error: error.message
        });
    }
};


export const activateUser = async (req, res = response) => {
    
    try {
        const { id } = req.params;
        const { password } = req.body;  
        
        if (!password) {
            return res.status(400).json({
                success: false,
                msg: 'Debe ingresar la contraseña para activar al usuario'
            });
        
            
            
        }
        const user = await userModel.findByIdAndUpdate(id, { estado: true }, { new: false });
    
    const authenticatedUser = req.user;
        res.status(200).json({
            success: true,
            msg: 'Usuario activad',
            user,
            authenticatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al activar el usuario',
            error: error.message
        });
    }
};



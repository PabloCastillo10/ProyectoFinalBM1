import userModel from "./user-model.js";
import {hash, verify} from 'argon2';
import { generarJWT } from "../../helpers/generate-jwt.js";
import  { response, request } from "express";
import productoModel from "../productos/producto.model.js";
import categoriaModel from "../categorias/categoria.model.js";

export const login = async (req, res) => {

    const {email, password, username} = req.body;

    try {
        
        const lowerUsername = username ? username.toLowerCase() : null;

        const user = await userModel.findOne({
            $or: [
                { email },
                { username: lowerUsername  }
            ]
        })

        if (!user) {
            return res.status(404).json({
                msg: "No se encontró ningún usuario con ese email o username en la base de datos (contraseña incorrecta)"
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

export const getUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json({ users });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los usuarios", error: error.message });
    }
}
export const updateProfile = async (req, res) => {
    try {
        const {id} = req.params
       const authenticatedUserId = req.user.id;
        const { name, surname, username, oldPassword, newPassword } = req.body;
        const authenticatedUser = req.user;

        if (authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "No tienes permiso para editar  este usuario" });
        }
  
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado en la base de datos" });
        }

        if(!user.status) {
            return res.status(400).json({msg: "Usuario desactivado, no se puede actualizar"});
        }

 
        if (authenticatedUserId !== id) {
            return res.status(403).json({ msg: "No puedes editar otro usuario, solo el propietario puede" });
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
                return res.status(400).json({ msg: "Contraseña antigua requerida para cambiar la contraseña" });
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
        res.status(500).json({ msg: "Error en el servidor", error: error.message });
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

        const authenticatedUser = req.user;

        if (authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "No tienes permiso para eliminar este usuario" });
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

        
        const authenticatedUserId = req.user.id;  
        if (authenticatedUserId !== id) {
            return res.status(403).json({ msg: "No puedes eliminar otro usuario, solo el propietario" });
        }

        user.estado = false;
        await user.save();



        res.status(200).json({
            success: true,
            msg: 'Usuario desactivado correctamente',
            user,
            authenticatedUserId
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
            msg: 'Usuario activado',
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


export const createAdmin = async (req, res) => {
    try {
        const verifyUser = await userModel.findOne({username: "Esantos".toLowerCase()})


        if (!verifyUser) {
            const encryptedPassword = await hash("12345678");
            const adminUser = new userModel({
                name : "Elmer",
                surname : "Santos",
                username: "Esantos".toLowerCase(),
                email: "esantos@gmail.com",
                password : encryptedPassword,
                role: "ADMIN_ROLE"
            });

            await adminUser.save();

            console.log("Elmer Santos Admin creado con exito")
        } else {
            console.log("Elmer Santos Admin ya existe")
        }
    } catch (error) {
        console.error("Error al crear el usuario ADMIN : " , error);
    }
}

//////////////////////////////////////////////////////////////////// GESTION USUARIOS //////////////////////////////////


export const updateRole = async (req , res) => {
    try {
        const {id } = req.params
        const {role} = req.body;
        const authenticatedUser = req.user ||  user();

        if (authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para realizar esta acción'
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            msg: 'Rol del usuario actualizado correctamente',
            userDetails: {
                name: user.name,
                surname: user.surname,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar el rol del usuario',
            error: error.message
        });
    }
}

export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, surname, username, email, oldPassword, newPassword } = req.body;
        const authenticatedUser = req.user;

      
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }
        if (authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para realizar esta acción'
            });
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
                return res.status(400).json({ msg: "Debes proporcionar la contraseña actual" });
            }

            const isMatch = await verify(user.password, oldPassword);
            if (!isMatch) {
                return res.status(400).json({ msg: "Contraseña actual incorrecta" });
            }

            user.password = await hash(newPassword);
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.email = email || user.email

        await user.save();

        res.status(200).json({
            msg: "Usuario actualizado correctamente",
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al editar cliente", error: error.message });
    }
};


export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const authenticatedUser = req.user;

        if (authenticatedUser.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para realizar esta acción'
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        const isPasswordValid = await verify(user.password, password);
        if (!isPasswordValid) {
            return res.status(400).json({ msg: "Contraseña incorrecta" });
        }
        user.estado = false;

    
        await user.save();
        res.status(200).json({ msg: "Cliente eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar cliente", error: error.message });
    }
}

/////////////////////////////////// EXPLORACION DE PRODUCTOS CLIENTES ///////////////////////////////////


export const ObtenerProductoMasVendido = async (req, res) => {
    try {
        const productos = await productoModel.find().sort({ stock: 1 });
        const productosModificados = productos.map(producto => ({
            ...producto.toObject(),
            stock: producto.stock < 0 ? 0 : producto.stock
        }));

        res.status(200).json({
            success: true,
            msg: "Producto más vendido obtenido correctamente",
            productoMasVendido: productosModificados
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error en la obtención del producto más vendido" });
    }
}

export const buscarProductoPorNombre = async (req, res) => {
    try {
        const { name } = req.params;
        
        const authenticatedUser = req.user;
        if (authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "No tienes permiso para  esta funcion" });
        }
        const productos = await productoModel.find({ name: new RegExp(name, 'i') });
        
        res.status(200).json({
            success: true,
            msg: "Productos obtenidos correctamente",
            productos
        });
       } catch (error) {
        console.error(error);
        res.status(500).json({msg: "Hubo un error en la obtención de productos"});
   
    }
}


export const getCategories = async (req, res) => {
    try {
        const categorias = await categoriaModel.find();
        res.status(200).json({ categorias });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error en el server", error: err.message });
        }
}

export const obtenerProductosCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedUser = req.user;
        if (authenticatedUser.role !== "CLIENTE_ROLE") {
            return res.status(403).json({ msg: "No tienes permiso para  esta funcion" });
        }

        const productos = await productoModel.find({ categoria: id });
        res.status(200).json({
            success: true,
            msg: "Productos obtenidos correctamente",
            productos
        });
       } catch (error) {
        console.error(error);
        res.status(500).json({msg: "Hubo un error en la obtencion de productos"});
   
    }
}
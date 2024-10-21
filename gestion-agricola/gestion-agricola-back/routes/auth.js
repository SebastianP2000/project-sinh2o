const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');


// Endpoint para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const {nombreusuario, email, contrasena} = req.body;
    
    try {
        // Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = new Usuario({ 
            nombreusuario, 
            email, 
            contrasena: hashedPassword,  // Guardar la contraseña hasheada
        });

        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar usuario' });
    }
});

// Endpoint para login 

router.post('/login', async (req, res) => {
    const { nombreusuario, contrasena } = req.body;
    try {
        const usuario = await Usuario.findOne({ nombreusuario });

        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        let isMatch = false;

        // Comparar la contraseña proporcionada con la almacenada (hasheada)
        if (usuario.contrasena.length > 20) {
            isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        }

         // Si la contraseña no está hasheada (es más corta), compararla directamente
         if (!isMatch && usuario.contrasena === contrasena) {
            // Hashear la contraseña para actualizarla
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(contrasena, salt);

            // Actualizar la contraseña en la base de datos
            usuario.contrasena = hashedPassword;
            await usuario.save();
            isMatch = true;
        }

        // Si no coincide la contraseña en ninguno de los casos
        if (!isMatch) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Aquí puedes generar un token o realizar cualquier otra acción
        res.json({ mensaje: 'Inicio de sesión exitoso', usuario });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// Endpoint para obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(400).json({ error: 'Error al obtener usuarios' });
    }
});

// Ruta para actualizar un usuario
router.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params; // Obtener el ID del usuario de los parámetros de la URL
    const { nombreusuario, email, contrasena, rol } = req.body; // Obtener datos del cuerpo de la solicitud

    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { nombreusuario, email, contrasena, rol }, // Campos a actualizar
            { new: true, runValidators: true } // new: devolver el nuevo documento y validar los campos
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(usuarioActualizado); // Devolver el usuario actualizado
    } catch (error) {
        res.status(400).json({ message: error.message }); // Manejo de errores
    }
});

// Ruta para eliminar un usuario
router.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params; // Obtener el ID del usuario de los parámetros de la URL

    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(id); // Eliminar el usuario

        if (!usuarioEliminado) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado con éxito' }); // Mensaje de éxito
    } catch (error) {
        res.status(400).json({ message: error.message }); // Manejo de errores
    }
});


module.exports = router;

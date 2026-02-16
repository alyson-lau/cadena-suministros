const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

router.post('/login', async (req, res) => {
  try {
    const { numeroDocumento, contraseña } = req.body;
    
    if (!numeroDocumento || !contraseña) {
      return res.status(400).json({ message: 'Número de documento y contraseña son requeridos' });
    }
    
    const usuario = await Usuario.findOne({ numeroDocumento, contraseña });
    
    if (!usuario) {
      return res.status(401).json({ message: 'Documento o contraseña incorrectos' });
    }
    
    const token = Buffer.from(`${usuario._id}:${Date.now()}`).toString('base64');
    
    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        tipoUsuario: usuario.tipoUsuario,
        numeroDocumento: usuario.numeroDocumento
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { nombre, tipoDocumento, numeroDocumento, tipoUsuario, contraseña } = req.body;
    
    if (!nombre || !tipoDocumento || !numeroDocumento || !tipoUsuario || !contraseña) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    const existingUser = await Usuario.findOne({ numeroDocumento });
    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario con este número de documento' });
    }
    
    const usuario = new Usuario({
      nombre,
      tipoDocumento,
      numeroDocumento,
      tipoUsuario,
      contraseña
    });
    
    await usuario.save();
    
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        tipoUsuario: usuario.tipoUsuario,
        numeroDocumento: usuario.numeroDocumento
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/recover', async (req, res) => {
  try {
    const { numeroDocumento } = req.body;
    
    if (!numeroDocumento) {
      return res.status(400).json({ message: 'Número de documento es requerido' });
    }
    
    const usuario = await Usuario.findOne({ numeroDocumento });
    
    if (!usuario) {
      return res.status(404).json({ message: 'No se encontró ningún usuario con ese número de documento' });
    }
    
    res.json({
      message: 'Datos recovered',
      nombre: usuario.nombre,
      contraseña: usuario.contraseña
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contraseña').sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-contraseña');
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, tipoDocumento, numeroDocumento, tipoUsuario, contraseña } = req.body;
    
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
    res.status(201).json({ message: 'Usuario registrado correctamente', usuario: { ...usuario.toObject(), contraseña: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, tipoDocumento, numeroDocumento, tipoUsuario, contraseña } = req.body;
    
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, tipoDocumento, numeroDocumento, tipoUsuario, contraseña },
      { new: true }
    ).select('-contraseña');
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

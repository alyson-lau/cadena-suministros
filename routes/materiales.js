const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

router.get('/', async (req, res) => {
  try {
    const { categoria, proveedor, search } = req.query;
    let query = { activo: true };
    
    if (categoria) {
      query.categoria = categoria;
    }
    
    if (proveedor) {
      query.proveedor = new RegExp(proveedor, 'i');
    }
    
    if (search) {
      query.$or = [
        { nombre: new RegExp(search, 'i') },
        { categoria: new RegExp(search, 'i') },
        { proveedor: new RegExp(search, 'i') }
      ];
    }
    
    const materiales = await Material.find(query).sort({ createdAt: -1 });
    res.json(materiales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categorias', async (req, res) => {
  try {
    const categorias = await Material.distinct('categoria');
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/proveedores', async (req, res) => {
  try {
    const proveedores = await Material.distinct('proveedor');
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/estadisticas', async (req, res) => {
  try {
    const materiales = await Material.find({ activo: true });
    
    const totalMateriales = materiales.length;
    const valorTotal = materiales.reduce((sum, m) => sum + (m.precio * m.stock), 0);
    const categorias = [...new Set(materiales.map(m => m.categoria))].length;
    const stockBajo = materiales.filter(m => m.stock <= 10).length;
    
    const porCategoria = {};
    materiales.forEach(m => {
      if (!porCategoria[m.categoria]) {
        porCategoria[m.categoria] = { count: 0, valor: 0, proveedores: new Set() };
      }
      porCategoria[m.categoria].count++;
      porCategoria[m.categoria].valor += m.precio * m.stock;
      porCategoria[m.categoria].proveedores.add(m.proveedor);
    });
    
    const porProveedor = {};
    materiales.forEach(m => {
      if (!porProveedor[m.proveedor]) {
        porProveedor[m.proveedor] = { count: 0, valor: 0, categorias: new Set() };
      }
      porProveedor[m.proveedor].count++;
      porProveedor[m.proveedor].valor += m.precio * m.stock;
      porProveedor[m.proveedor].categorias.add(m.categoria);
    });
    
    res.json({
      totalMateriales,
      valorTotal,
      categorias,
      stockBajo,
      porCategoria: Object.entries(porCategoria).map(([cat, data]) => ({
        categoria: cat,
        totalMateriales: data.count,
        valorTotal: data.valor,
        proveedores: data.proveedores.size
      })),
      porProveedor: Object.entries(porProveedor).map(([prov, data]) => ({
        proveedor: prov,
        totalMateriales: data.count,
        valorTotal: data.valor,
        categorias: data.categorias.size
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria, stock, proveedor, descripcion, unidad } = req.body;
    
    const material = new Material({
      nombre,
      precio,
      categoria,
      stock,
      proveedor,
      descripcion,
      unidad
    });
    
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const materiales = req.body;
    
    if (!Array.isArray(materiales)) {
      return res.status(400).json({ message: 'Se requiere un array de materiales' });
    }
    
    const created = await Material.insertMany(materiales);
    res.status(201).json({ message: `${created.length} materiales creados`, materiales: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio, categoria, stock, proveedor, descripcion, unidad, activo } = req.body;
    
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { nombre, precio, categoria, stock, proveedor, descripcion, unidad, activo },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }
    
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }
    
    res.json({ message: 'Material eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

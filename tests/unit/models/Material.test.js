// tests/unit/models/Material.test.js
const mongoose = require('mongoose');
const Material = require('../../../models/Material');

describe('Material Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cadenaSuministros_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Material.deleteMany({});
  });

  describe('Creación de Materiales', () => {
    test('Debe crear un material válido', async () => {
      const materialValid = {
        nombre: 'Tuberías PVC',
        precio: 25.50,
        categoria: 'Construcción',
        stock: 100,
        proveedor: 'Distribuidora ABC',
        descripcion: 'Tuberías de PVC de alta calidad'
      };

      const material = await Material.create(materialValid);
      expect(material.nombre).toBe('Tuberías PVC');
      expect(material.stock).toBe(100);
      expect(material.activo).toBe(true);
    });

    test('Debe faltar sin campo precio', async () => {
      const materialInvalid = {
        nombre: 'Cemento',
        categoria: 'Construcción',
        stock: 50,
        proveedor: 'Cementos SA'
      };

      await expect(Material.create(materialInvalid)).rejects.toThrow();
    });

    test('Debe rechazar precio negativo', async () => {
      const materialInvalid = {
        nombre: 'Acero',
        precio: -10, // Negativo
        categoria: 'Metales',
        stock: 50,
        proveedor: 'Acerías del Sur'
      };

      await expect(Material.create(materialInvalid)).rejects.toThrow();
    });

    test('Debe rechazar stock negativo', async () => {
      const materialInvalid = {
        nombre: 'Arena',
        precio: 8.50,
        categoria: 'Agregados',
        stock: -5, // Negativo
        proveedor: 'Arenera'
      };

      await expect(Material.create(materialInvalid)).rejects.toThrow();
    });
  });

  describe('Valores por defecto', () => {
    test('Stock debe defaultear a 0', async () => {
      const material = await Material.create({
        nombre: 'Madera',
        precio: 15.00,
        categoria: 'Madera',
        proveedor: 'Maderería'
      });

      expect(material.stock).toBe(0);
    });

    test('Unidad debe defaultear a und', async () => {
      const material = await Material.create({
        nombre: 'Tornillo',
        precio: 0.50,
        categoria: 'Herrajes',
        stock: 1000,
        proveedor: 'Herrajes SA'
      });

      expect(material.unidad).toBe('und');
    });

    test('Activo debe ser true por defecto', async () => {
      const material = await Material.create({
        nombre: 'Pintura',
        precio: 22.00,
        categoria: 'Pinturas',
        stock: 50,
        proveedor: 'Pinturas Premium'
      });

      expect(material.activo).toBe(true);
    });
  });

  describe('Lógica de Negocio', () => {
    test('Debe permitir material con stock bajo', async () => {
      const material = await Material.create({
        nombre: 'Producto Crítico',
        precio: 100.00,
        categoria: 'Premium',
        stock: 2, // Bajo
        proveedor: 'Proveedor'
      });

      expect(material.stock).toBe(2);
      expect(material.stock <= 10).toBe(true);
    });

    test('Debe permitir deshabilitar material (borrado lógico)', async () => {
      const material = await Material.create({
        nombre: 'Dejar de existir',
        precio: 50.00,
        categoria: 'Descontinuado',
        stock: 0,
        proveedor: 'Proveedor'
      });

      material.activo = false;
      await material.save();

      const encontrado = await Material.findById(material._id);
      expect(encontrado.activo).toBe(false);
    });
  });
});

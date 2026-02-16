// tests/integration/api/materiales.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Material = require('../../../models/Material');

describe('Materiales API Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cadenaSuministros_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await Material.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Material.deleteMany({});
    
    // Insertar materiales de prueba
    await Material.insertMany([
      {
        nombre: 'Tuberías PVC',
        precio: 25.50,
        categoria: 'Construcción',
        stock: 150,
        proveedor: 'Distribuidora ABC'
      },
      {
        nombre: 'Cemento Portland',
        precio: 18.75,
        categoria: 'Construcción',
        stock: 300,
        proveedor: 'Cementos Nacionales'
      },
      {
        nombre: 'Acero Reforzado',
        precio: 45.00,
        categoria: 'Metales',
        stock: 75,
        proveedor: 'Acerías del Sur'
      }
    ]);
  });

  describe('GET /api/materiales', () => {
    test('Debe retornar lista de materiales', async () => {
      const response = await request(app)
        .get('/api/materiales');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    test('Debe filtrar por categoría', async () => {
      const response = await request(app)
        .get('/api/materiales?categoria=Construcción');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].categoria).toBe('Construcción');
    });

    test('Debe buscar por nombre', async () => {
      const response = await request(app)
        .get('/api/materiales?search=Acero');

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].nombre).toContain('Acero');
    });

    test('Debe filtrar por proveedor', async () => {
      const response = await request(app)
        .get('/api/materiales?proveedor=Distribuidora ABC');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].proveedor).toContain('Distribuidora');
    });
  });

  describe('GET /api/materiales/categorias', () => {
    test('Debe retornar lista de categorías únicas', async () => {
      const response = await request(app)
        .get('/api/materiales/categorias');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Construcción y Metales
      expect(response.body).toContain('Construcción');
      expect(response.body).toContain('Metales');
    });
  });

  describe('GET /api/materiales/proveedores', () => {
    test('Debe retornar lista de proveedores únicos', async () => {
      const response = await request(app)
        .get('/api/materiales/proveedores');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      expect(response.body).toContain('Distribuidora ABC');
    });
  });

  describe('GET /api/materiales/estadisticas', () => {
    test('Debe retornar estadísticas correctas', async () => {
      const response = await request(app)
        .get('/api/materiales/estadisticas');

      expect(response.status).toBe(200);
      expect(response.body.totalMateriales).toBe(3);
      expect(response.body.valorTotal).toBeGreaterThan(0);
      expect(response.body.categorias).toBe(2);
      expect(response.body.stockBajo).toBeGreaterThanOrEqual(0);
    });

    test('Estadísticas deben incluir análisis por categoría', async () => {
      const response = await request(app)
        .get('/api/materiales/estadisticas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.porCategoria)).toBe(true);
      expect(response.body.porCategoria.length).toBe(2);
      
      const construccion = response.body.porCategoria.find(c => c.categoria === 'Construcción');
      expect(construccion).toBeDefined();
      expect(construccion.totalMateriales).toBe(2);
    });

    test('Estadísticas deben incluir análisis por proveedor', async () => {
      const response = await request(app)
        .get('/api/materiales/estadisticas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.porProveedor)).toBe(true);
      expect(response.body.porProveedor.length).toBe(3);
    });
  });
});

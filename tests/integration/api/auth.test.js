// tests/integration/api/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Usuario = require('../../../models/Usuario');

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cadenaSuministros_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await Usuario.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Usuario.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('Debe registrar un usuario correctamente', async () => {
      const newUser = {
        nombre: 'Maria Test',
        tipoDocumento: 'cc',
        numeroDocumento: '1111111111',
        tipoUsuario: 'analista',
        contraseña: 'secure123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Usuario registrado correctamente');
      expect(response.body.usuario.nombre).toBe('Maria Test');
      expect(response.body.usuario.contraseña).toBeUndefined(); // NO debe retornar contraseña
    });

    test('Debe fallar si faltan campos requeridos', async () => {
      const incompleteUser = {
        nombre: 'Incompleto',
        tipoDocumento: 'cc'
        // Faltan más campos
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('requerido');
    });

    test('Debe fallar si el usuario ya existe', async () => {
      const doc = '2222222222';
      
      // Crear primer usuario
      await Usuario.create({
        nombre: 'Usuario 1',
        tipoDocumento: 'cc',
        numeroDocumento: doc,
        tipoUsuario: 'lider',
        contraseña: 'pass123'
      });

      // Intentar crear duplicado
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Usuario 2',
          tipoDocumento: 'cc',
          numeroDocumento: doc,
          tipoUsuario: 'analista',
          contraseña: 'pass456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ya existe');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await Usuario.create({
        nombre: 'Usuario Login',
        tipoDocumento: 'cc',
        numeroDocumento: '3333333333',
        tipoUsuario: 'desarrollador',
        contraseña: 'correctpass'
      });
    });

    test('Debe hacer login correctamente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          numeroDocumento: '3333333333',
          contraseña: 'correctpass'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.token).toBeDefined();
      expect(response.body.usuario.nombre).toBe('Usuario Login');
    });

    test('Debe fallar con credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          numeroDocumento: '3333333333',
          contraseña: 'wrongpass'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('incorrectos');
    });

    test('Debe requerir documento y contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          numeroDocumento: '3333333333'
          // Falta contraseña
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('requerido');
    });
  });

  describe('POST /api/auth/recover', () => {
    beforeEach(async () => {
      await Usuario.create({
        nombre: 'Usuario Recover',
        tipoDocumento: 'ce',
        numeroDocumento: '4444444444',
        tipoUsuario: 'analista',
        contraseña: 'mypass123'
      });
    });

    test('Debe recuperar datos de usuario', async () => {
      const response = await request(app)
        .post('/api/auth/recover')
        .send({
          numeroDocumento: '4444444444'
        });

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Usuario Recover');
      expect(response.body.contraseña).toBe('mypass123');
    });

    test('Debe fallar si usuario no existe', async () => {
      const response = await request(app)
        .post('/api/auth/recover')
        .send({
          numeroDocumento: '9999999999'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('no se encontró');
    });
  });
});

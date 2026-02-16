// tests/integration/api/usuarios.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const Usuario = require('../../../models/Usuario');

describe('Usuarios API Integration Tests', () => {
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

  describe('GET /api/usuarios', () => {
    test('Debe retornar lista vacía sin usuarios', async () => {
      const response = await request(app)
        .get('/api/usuarios');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('Debe retornar lista de usuarios sin contraseñas', async () => {
      await Usuario.create([
        {
          nombre: 'Juan Test',
          tipoDocumento: 'cc',
          numeroDocumento: '1111111111',
          tipoUsuario: 'lider',
          contraseña: 'pass123'
        },
        {
          nombre: 'Maria Test',
          tipoDocumento: 'ce',
          numeroDocumento: '2222222222',
          tipoUsuario: 'analista',
          contraseña: 'pass456'
        }
      ]);

      const response = await request(app)
        .get('/api/usuarios');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].contraseña).toBeUndefined();
    });
  });

  describe('GET /api/usuarios/:id', () => {
    let usuarioId;

    beforeEach(async () => {
      const usuario = await Usuario.create({
        nombre: 'Usuario Para GET',
        tipoDocumento: 'cc',
        numeroDocumento: '3333333333',
        tipoUsuario: 'desarrollador',
        contraseña: 'pass789'
      });
      usuarioId = usuario._id;
    });

    test('Debe obtener usuario por ID', async () => {
      const response = await request(app)
        .get(`/api/usuarios/${usuarioId}`);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Usuario Para GET');
      expect(response.body.contraseña).toBeUndefined();
    });

    test('Debe retornar 404 si usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/usuarios/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('no encontrado');
    });
  });

  describe('POST /api/usuarios', () => {
    test('Debe crear usuario correctamente', async () => {
      const newUser = {
        nombre: 'Usuario Nuevo',
        tipoDocumento: 'ti',
        numeroDocumento: '4444444444',
        tipoUsuario: 'analista',
        contraseña: 'newpass123'
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('correctamente');
      expect(response.body.usuario.nombre).toBe('Usuario Nuevo');
    });

    test('Debe fallar sin campos requeridos', async () => {
      const incompleteUser = {
        nombre: 'Incompleto'
        // Faltan campos
      };

      const response = await request(app)
        .post('/api/usuarios')
        .send(incompleteUser);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /api/usuarios/:id', () => {
    let usuarioId;

    beforeEach(async () => {
      const usuario = await Usuario.create({
        nombre: 'Usuario Para Actualizar',
        tipoDocumento: 'cc',
        numeroDocumento: '5555555555',
        tipoUsuario: 'lider',
        contraseña: 'original123'
      });
      usuarioId = usuario._id;
    });

    test('Debe actualizar usuario correctamente', async () => {
      const updateData = {
        nombre: 'Usuario Actualizado',
        tipoUsuario: 'analista'
      };

      const response = await request(app)
        .put(`/api/usuarios/${usuarioId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Usuario Actualizado');
      expect(response.body.tipoUsuario).toBe('analista');
    });

    test('Debe retornar 404 si usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/usuarios/${fakeId}`)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    let usuarioId;

    beforeEach(async () => {
      const usuario = await Usuario.create({
        nombre: 'Usuario Para Eliminar',
        tipoDocumento: 'ce',
        numeroDocumento: '6666666666',
        tipoUsuario: 'desarrollador',
        contraseña: 'delete123'
      });
      usuarioId = usuario._id;
    });

    test('Debe eliminar usuario correctamente', async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${usuarioId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('eliminado');

      // Verificar que quedó eliminado
      const checkResponse = await request(app)
        .get(`/api/usuarios/${usuarioId}`);
      expect(checkResponse.status).toBe(404);
    });

    test('Debe retornar 404 si usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/usuarios/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });
});

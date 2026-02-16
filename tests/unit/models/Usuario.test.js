// tests/unit/models/Usuario.test.js
const mongoose = require('mongoose');
const Usuario = require('../../../models/Usuario');

describe('Usuario Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cadenaSuministros_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Usuario.deleteMany({});
  });

  describe('Validaciones', () => {
    test('Debe crear un usuario válido', async () => {
      const usuarioValid = {
        nombre: 'Juan Test',
        tipoDocumento: 'cc',
        numeroDocumento: '1234567890',
        tipoUsuario: 'lider',
        contraseña: 'test123'
      };

      const usuario = await Usuario.create(usuarioValid);
      expect(usuario.nombre).toBe('Juan Test');
      expect(usuario.tipoUsuario).toBe('lider');
    });

    test('Debe fallar sin campo nombre', async () => {
      const usuarioInvalid = {
        tipoDocumento: 'cc',
        numeroDocumento: '1234567890',
        tipoUsuario: 'lider',
        contraseña: 'test123'
      };

      await expect(Usuario.create(usuarioInvalid)).rejects.toThrow();
    });

    test('Debe rechazar tipoDocumento inválido', async () => {
      const usuarioInvalid = {
        nombre: 'Test',
        tipoDocumento: 'xxx', // Inválido
        numeroDocumento: '1234567890',
        tipoUsuario: 'lider',
        contraseña: 'test123'
      };

      await expect(Usuario.create(usuarioInvalid)).rejects.toThrow();
    });

    test('Debe asegurar unicidad de numeroDocumento', async () => {
      const doc = '9876543210';
      
      await Usuario.create({
        nombre: 'Usuario 1',
        tipoDocumento: 'cc',
        numeroDocumento: doc,
        tipoUsuario: 'analista',
        contraseña: 'pass123'
      });

      await expect(Usuario.create({
        nombre: 'Usuario 2',
        tipoDocumento: 'cc',
        numeroDocumento: doc, // Duplicado
        tipoUsuario: 'desarrollador',
        contraseña: 'pass456'
      })).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    test('Debe crear createdAt y updatedAt automáticamente', async () => {
      const usuario = await Usuario.create({
        nombre: 'Test Timestamps',
        tipoDocumento: 'ce',
        numeroDocumento: '5555555555',
        tipoUsuario: 'analista',
        contraseña: 'pass123'
      });

      expect(usuario.createdAt).toBeDefined();
      expect(usuario.updatedAt).toBeDefined();
    });

    test('Debe actualizar updatedAt al editar', async () => {
      const usuario = await Usuario.create({
        nombre: 'Test Update',
        tipoDocumento: 'ti',
        numeroDocumento: '3333333333',
        tipoUsuario: 'lider',
        contraseña: 'pass123'
      });

      const createdTime = usuario.updatedAt;
      
      // Esperar un poco para que haya diferencia
      await new Promise(resolve => setTimeout(resolve, 100));
      
      usuario.nombre = 'Test Updated';
      await usuario.save();

      expect(usuario.updatedAt.getTime()).toBeGreaterThan(createdTime.getTime());
    });
  });
});

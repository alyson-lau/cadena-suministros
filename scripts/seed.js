// seed.js - Cargar datos de prueba en MongoDB
const mongoose = require('mongoose');
const Material = require('../models/Material');
const Usuario = require('../models/Usuario');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cadenaSuministros';

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI);
    console.log('\n✅ Conectado a MongoDB\n');

    // Limpiar colecciones
    await Material.deleteMany({});
    await Usuario.deleteMany({});
    console.log('🗑️  Colecciones limpiadas\n');

    // Insertar usuarios de prueba
    const usuarios = [
      {
        nombre: 'Juan Pérez',
        tipoDocumento: 'cc',
        numeroDocumento: '1001234567',
        tipoUsuario: 'lider',
        contraseña: 'admin123'
      },
      {
        nombre: 'María García',
        tipoDocumento: 'cc',
        numeroDocumento: '1002345678',
        tipoUsuario: 'analista',
        contraseña: 'analista123'
      },
      {
        nombre: 'Carlos López',
        tipoDocumento: 'ce',
        numeroDocumento: '1003456789',
        tipoUsuario: 'desarrollador',
        contraseña: 'dev123'
      }
    ];

    await Usuario.insertMany(usuarios);
    console.log(`👥 ${usuarios.length} usuarios cargados:\n`);
    usuarios.forEach(u => console.log(`   - ${u.nombre} (${u.tipoUsuario})`));

    // Insertar materiales de prueba
    const materiales = [
      {
        nombre: 'Tuberías PVC 1 pulgada',
        precio: 25.50,
        categoria: 'Materiales de Construcción',
        stock: 150,
        proveedor: 'Distribuidora ABC',
        descripcion: 'Tuberías de PVC de alta calidad',
        unidad: 'metro'
      },
      {
        nombre: 'Cemento Portland 50kg',
        precio: 18.75,
        categoria: 'Materiales de Construcción',
        stock: 300,
        proveedor: 'Cementos Nacionales',
        descripcion: 'Cemento Portland tipo I',
        unidad: 'bolsa'
      },
      {
        nombre: 'Acero reforzado 10mm',
        precio: 45.00,
        categoria: 'Acero y Metales',
        stock: 75,
        proveedor: 'Acerías del Sur',
        descripcion: 'Varilla de acero reforzado',
        unidad: 'varilla'
      },
      {
        nombre: 'Alambre galvanizado',
        precio: 12.30,
        categoria: 'Acero y Metales',
        stock: 200,
        proveedor: 'Acerías del Sur',
        descripcion: 'Alambre galvanizado calibre 16',
        unidad: 'kg'
      },
      {
        nombre: 'Arena Fina',
        precio: 8.50,
        categoria: 'Agregados',
        stock: 500,
        proveedor: 'Arenera La Paz',
        descripcion: 'Arena fina para construcción',
        unidad: 'tonelada'
      },
      {
        nombre: 'Grava 3/4',
        precio: 15.00,
        categoria: 'Agregados',
        stock: 400,
        proveedor: 'Arenera La Paz',
        descripcion: 'Grava 3/4 pulgadas',
        unidad: 'tonelada'
      },
      {
        nombre: 'Pintura Látex Blanca',
        precio: 22.00,
        categoria: 'Pinturas y Acabados',
        stock: 120,
        proveedor: 'Pinturas Premium',
        descripcion: 'Pintura látex alta calidad',
        unidad: 'galón'
      },
      {
        nombre: 'Tornillos Hexagonales',
        precio: 0.75,
        categoria: 'Herrajes',
        stock: 5000,
        proveedor: 'Distribuidora ABC',
        descripcion: 'Tornillos hexagonales acero',
        unidad: 'pieza'
      },
      {
        nombre: 'Tuercas M10',
        precio: 0.50,
        categoria: 'Herrajes',
        stock: 3000,
        proveedor: 'Distribuidora ABC',
        descripcion: 'Tuercas de acero carbón',
        unidad: 'pieza'
      },
      {
        nombre: 'Madera Pino 2x4',
        precio: 8.00,
        categoria: 'Madera',
        stock: 250,
        proveedor: 'Maderería El Bosque',
        descripcion: 'Tabla de pino 2x4 pulgadas',
        unidad: 'pieza'
      }
    ];

    await Material.insertMany(materiales);
    console.log(`\n📦 ${materiales.length} materiales cargados:\n`);
    materiales.forEach(m => console.log(`   - ${m.nombre} | Stock: ${m.stock} | Precio: $${m.precio}`));

    // Estadísticas
    const totalInventario = materiales.reduce((sum, m) => sum + (m.precio * m.stock), 0);
    const categorias = [...new Set(materiales.map(m => m.categoria))];
    const proveedores = [...new Set(materiales.map(m => m.proveedor))];

    console.log(`\n📊 ESTADÍSTICAS:`);
    console.log(`   Total Materiales: ${materiales.length}`);
    console.log(`   Valor Inventario: $${totalInventario.toFixed(2)}`);
    console.log(`   Categorías: ${categorias.length}`);
    console.log(`   Proveedores: ${proveedores.length}`);
    console.log(`   Usuarios: ${usuarios.length}\n`);

    console.log('✅ Base de datos inicializada correctamente\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();

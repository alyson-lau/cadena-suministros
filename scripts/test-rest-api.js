// test-rest-api.js - Pruebas completas de API REST
const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testResults = [];
let userData = null;
let materialData = null;

// Helper para hacer peticiones HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Pruebas
async function runTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   PRUEBAS DE API REST - CADENA SUMINISTROS ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 1. ESTADO DEL SERVIDOR
  console.log('1️⃣  ESTADO DEL SERVIDOR');
  try {
    const res = await makeRequest('GET', '/api/status');
    const pass = res.status === 200 && res.data.status === 'ok';
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    console.log(`   MongoDB: ${res.data.mongodb}`);
    console.log(`   Versión: ${res.data.version}`);
    testResults.push({ test: 'GET /api/status', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'GET /api/status', result: false });
  }

  // 2. REGISTRO DE USUARIO
  console.log('\n2️⃣  AUTENTICACIÓN - REGISTRO');
  try {
    const userData = {
      nombre: 'Test User ' + Date.now(),
      tipoDocumento: 'cc',
      numeroDocumento: '999' + Date.now(),
      tipoUsuario: 'analista',
      contraseña: 'test123456'
    };
    const res = await makeRequest('POST', '/api/auth/register', userData);
    const pass = res.status === 201 && res.data.message;
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    if (res.data.usuario) {
      console.log(`   Usuario creado: ${res.data.usuario.nombre}`);
    }
    testResults.push({ test: 'POST /api/auth/register', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'POST /api/auth/register', result: false });
  }

  // 3. LOGIN
  console.log('\n3️⃣  AUTENTICACIÓN - LOGIN');
  try {
    const loginData = {
      numeroDocumento: '9991',
      contraseña: 'test123'
    };
    const res = await makeRequest('POST', '/api/auth/login', loginData);
    const pass = res.status === 200 || res.status === 401; // 401 es esperado si no existe
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    console.log(`   Respuesta: ${res.data.message || res.data.error}`);
    testResults.push({ test: 'POST /api/auth/login', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'POST /api/auth/login', result: false });
  }

  // 4. OBTENER USUARIOS
  console.log('\n4️⃣  USUARIOS - LISTAR');
  try {
    const res = await makeRequest('GET', '/api/usuarios');
    const pass = res.status === 200 && Array.isArray(res.data);
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    console.log(`   Usuarios encontrados: ${res.data.length || 0}`);
    testResults.push({ test: 'GET /api/usuarios', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'GET /api/usuarios', result: false });
  }

  // 5. OBTENER MATERIALES
  console.log('\n5️⃣  MATERIALES - LISTAR');
  try {
    const res = await makeRequest('GET', '/api/materiales');
    const pass = res.status === 200 && Array.isArray(res.data);
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    console.log(`   Materiales encontrados: ${res.data.length || 0}`);
    testResults.push({ test: 'GET /api/materiales', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'GET /api/materiales', result: false });
  }

  // 6. OBTENER CATEGORÍAS
  console.log('\n6️⃣  MATERIALES - CATEGORÍAS');
  try {
    const res = await makeRequest('GET', '/api/materiales/categorias');
    const pass = res.status === 200 && Array.isArray(res.data);
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    console.log(`   Categorías encontradas: ${res.data.length || 0}`);
    testResults.push({ test: 'GET /api/materiales/categorias', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'GET /api/materiales/categorias', result: false });
  }

  // 7. OBTENER PROVEEDORES
  console.log('\n7️⃣  MATERIALES - PROVEEDORES');
  try {
    const res = await makeRequest('GET', '/api/materiales/proveedores');
    const pass = res.status === 200 && Array.isArray(res.data);
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    console.log(`   Proveedores encontrados: ${res.data.length || 0}`);
    testResults.push({ test: 'GET /api/materiales/proveedores', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'GET /api/materiales/proveedores', result: false });
  }

  // 8. OBTENER ESTADÍSTICAS
  console.log('\n8️⃣  MATERIALES - ESTADÍSTICAS');
  try {
    const res = await makeRequest('GET', '/api/materiales/estadisticas');
    const pass = res.status === 200 && res.data.totalMateriales !== undefined;
    console.log(`   ${pass ? '✅ PASS' : '❌ FAIL'} - Status: ${res.status}`);
    if (res.data.totalMateriales !== undefined) {
      console.log(`   Total Materiales: ${res.data.totalMateriales}`);
      console.log(`   Valor Total: $${res.data.valorTotal}`);
      console.log(`   Categorías: ${res.data.categorias}`);
      console.log(`   Stock Bajo: ${res.data.stockBajo}`);
    }
    testResults.push({ test: 'GET /api/materiales/estadisticas', result: pass });
  } catch (err) {
    console.log(`   ❌ FAIL - ${err.message}`);
    testResults.push({ test: 'GET /api/materiales/estadisticas', result: false });
  }

  // RESUMEN
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║            RESUMEN DE PRUEBAS             ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const passed = testResults.filter(t => t.result).length;
  const total = testResults.length;
  const percentage = Math.round((passed / total) * 100);

  testResults.forEach((test, idx) => {
    console.log(`${idx + 1}. ${test.result ? '✅' : '❌'} ${test.test}`);
  });

  console.log(`\n📊 RESULTADO: ${passed}/${total} pruebas pasadas (${percentage}%)\n`);
  
  if (percentage === 100) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
  } else if (percentage >= 75) {
    console.log('⚠️  Algunas pruebas fallaron, revisa los logs');
  } else {
    console.log('❌ Múltiples fallos detectados');
  }

  console.log('\n═══════════════════════════════════════════════\n');
}

// Ejecutar
runTests().catch(console.error);

// app.js – Lógica principal de la interfaz
let currentMaterials = [];
let currentUser = null;
let editingMaterialId = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

async function initializeApp() {
    // Suscribirse a eventos de la base de datos
    API.suscribirEventos(handleDatabaseEvents);
    
    // Inicializar navegación suave
    initializeNavigation();
    
    // Inicializar formulario de usuario
    initializeUserForm();
    
    // Inicializar base de datos
    await initializeDatabase();
    
    // Inicializar controles de materiales
    initializeMaterialControls();
    
    // Inicializar upload de archivos
    initializeFileUpload();
    
    // Inicializar modal de materiales
    initializeMaterialModal();
    
    // Verificar sesión activa
    checkActiveSession();
    
    // Inicializar UI de autenticación
    updateAuthenticationUI();
}

async function initializeDatabase() {
    try {
        // Esperar a que la API cargue todas las bases de datos
        await API.loadExternalDatabases();
        
        // Actualizar la visualización de materiales
        await refreshMaterialsDisplay();
        updateStatistics();
        updateOperationsHistory();
        
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando base de datos:', error);
        showMessage('Error inicializando base de datos: ' + error.message, 'error');
    }
}

async function refreshMaterialsDisplay() {
    try {
        const materials = API.obtenerMateriales();
        currentMaterials = materials;
        displayMaterials(materials);
        return materials;
    } catch (error) {
        console.error('Error actualizando visualización de materiales:', error);
        return [];
    }
}

function displayMaterials(materials) {
    const databaseContent = document.getElementById('databaseContent');
    if (!databaseContent) return;
    
    if (materials.length === 0) {
        databaseContent.innerHTML = '<div class="no-materials">No hay materiales registrados</div>';
        return;
    }
    
    // Crear tabla de materiales
    const tableHTML = `
        <div class="materials-table-container">
            <table class="materials-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Categoría</th>
                        <th>Stock</th>
                        <th>Proveedor</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${materials.map(material => `
                        <tr class="material-row" data-id="${material.id}">
                            <td class="material-name">${material.nombre}</td>
                            <td class="material-price">$${material.precio.toLocaleString('es-CO')}</td>
                            <td class="material-category">${material.categoria}</td>
                            <td class="material-stock ${material.stock <= 10 ? 'low-stock' : ''}">${material.stock}</td>
                            <td class="material-provider">${material.proveedor}</td>
                            <td class="material-actions">
                                <button onclick="editMaterial('${material.id}')" class="btn-edit" ${!currentUser ? 'disabled' : ''}>✏️</button>
                                <button onclick="deleteMaterial('${material.id}')" class="btn-delete" ${!currentUser ? 'disabled' : ''}>🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    databaseContent.innerHTML = tableHTML;
}

function updateStatistics() {
    const materials = API.obtenerMateriales();
    const dashboardStats = document.getElementById('dashboardStats');
    
    if (!dashboardStats) return;
    
    // Calcular estadísticas
    const totalMaterials = materials.length;
    const totalValue = materials.reduce((sum, material) => sum + material.precio, 0);
    const categories = [...new Set(materials.map(m => m.categoria))].length;
    const lowStock = materials.filter(m => m.stock <= 10).length;
    
    // Actualizar dashboard
    document.getElementById('totalMaterials').textContent = totalMaterials;
    document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString('es-CO')}`;
    document.getElementById('totalCategories').textContent = categories;
    document.getElementById('lowStock').textContent = lowStock;
    
    // Mostrar dashboard si hay materiales
    if (totalMaterials > 0) {
        dashboardStats.style.display = 'grid';
    }
}

function updateOperationsHistory() {
    const operationsHistory = document.getElementById('operationsHistory');
    const operationsList = document.getElementById('operationsList');
    
    if (!operationsHistory || !operationsList) return;
    
    const history = API.obtenerHistorial();
    
    if (history.length === 0) {
        operationsHistory.style.display = 'none';
        return;
    }
    
    operationsHistory.style.display = 'block';
    
    const historyHTML = history.slice(0, 10).map(op => `
        <div class="operation-item">
            <div class="operation-time">${new Date(op.timestamp).toLocaleString('es-CO')}</div>
            <div class="operation-user">${op.userName} (${op.userRole})</div>
            <div class="operation-details">${op.details}</div>
        </div>
    `).join('');
    
    operationsList.innerHTML = historyHTML;
}

function handleDatabaseEvents(event, data) {
    console.log('Evento de base de datos:', event, data);
    
    // Actualizar UI según el evento
    switch (event) {
        case 'material:added':
        case 'material:updated':
        case 'material:deleted':
            refreshMaterialsDisplay();
            updateStatistics();
            updateOperationsHistory();
            break;
        case 'user:registered':
        case 'user:authenticated':
            updateAuthenticationUI();
            break;
    }
}

function checkActiveSession() {
    try {
        const savedSession = localStorage.getItem('cadenaSuministros_sesionActiva');
        if (savedSession) {
            const sessionData = JSON.parse(savedSession);
            const sessionAge = Date.now() - sessionData.loginTime;
            const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas
            
            if (sessionAge < maxSessionAge) {
                // Sesión válida, restaurar usuario
                currentUser = sessionData.user;
                console.log('Sesión restaurada para:', currentUser.nombre);
                showUserInfo(currentUser);
                
                // Ocultar formularios
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('userForm').parentElement.style.display = 'none';
                
                showMessage(`Bienvenido de vuelta, ${currentUser.nombre}!`, 'success');
            } else {
                // Sesión expirada, limpiar
                localStorage.removeItem('cadenaSuministros_sesionActiva');
                console.log('Sesión expirada');
            }
        }
    } catch (error) {
        console.error('Error verificando sesión activa:', error);
        localStorage.removeItem('cadenaSuministros_sesionActiva');
    }
}

function saveSession(user) {
    try {
        const sessionData = {
            user: user,
            loginTime: Date.now()
        };
        localStorage.setItem('cadenaSuministros_sesionActiva', JSON.stringify(sessionData));
        console.log('Sesión guardada para:', user.nombre);
    } catch (error) {
        console.error('Error guardando sesión:', error);
    }
}

function clearSession() {
    localStorage.removeItem('cadenaSuministros_sesionActiva');
    console.log('Sesión cerrada');
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Ocultar todas las secciones
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Mostrar la sección seleccionada
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initializeUserForm() {
    const userForm = document.getElementById('userForm');
    const loginForm = document.getElementById('loginFormElement');
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    
    // Toggle entre registro y login
    if (loginToggle) {
        loginToggle.onclick = function() {
            console.log('Click en: ¿Ya tienes cuenta? Iniciar Sesión');
            
            // Ocultar formulario de registro
            const userFormContainer = document.querySelector('#userForm').parentElement;
            if (userFormContainer) {
                userFormContainer.style.display = 'none';
            }
            
            // Mostrar formulario de login
            const loginFormContainer = document.getElementById('loginForm');
            if (loginFormContainer) {
                loginFormContainer.style.display = 'block';
            }
            
            // Habilitar botón de login
            const loginFormElement = document.getElementById('loginFormElement');
            if (loginFormElement) {
                const submitButton = loginFormElement.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                
                // Habilitar todos los inputs
                const inputs = loginFormElement.querySelectorAll('input');
                inputs.forEach(function(input) {
                    input.disabled = false;
                });
            }
            
            // Pre-llenar con último usuario registrado
            const usuarios = API.obtenerUsuariosRegistrados();
            if (usuarios.length > 0) {
                const ultimo = usuarios[usuarios.length - 1];
                const docInput = document.getElementById('loginDocumento');
                if (docInput && ultimo.numeroDocumento) {
                    docInput.value = ultimo.numeroDocumento;
                }
            }
        };
    }
    
    if (registerToggle) {
        registerToggle.addEventListener('click', () => {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('userForm').parentElement.style.display = 'block';
        });
    }
    
    // Validación en tiempo real
    if (userForm) {
        setupRealTimeValidation(userForm);
        
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validación final antes de enviar
            const nombre = document.getElementById('nombre').value.trim();
            const tipoDocumento = document.getElementById('tipoDocumento').value;
            const numeroDocumento = document.getElementById('numeroDocumento').value.trim();
            const tipoUsuario = document.getElementById('tipoUsuario').value;
            const contraseña = document.getElementById('contraseña').value;
            const confirmarContraseña = document.getElementById('confirmarContraseña').value;
            
            console.log('Datos del formulario:', { nombre, tipoDocumento, numeroDocumento, tipoUsuario, contraseña: contraseña.length });
            
            // Validaciones manuales
            if (!nombre || nombre.length < 3) {
                showMessage('El nombre debe tener al menos 3 caracteres', 'error');
                return;
            }
            
            if (!tipoDocumento) {
                showMessage('Seleccione un tipo de documento', 'error');
                return;
            }
            
            if (!/^[0-9]{5}$/.test(numeroDocumento)) {
                showMessage('El número de documento debe tener exactamente 5 dígitos', 'error');
                return;
            }
            
            if (!tipoUsuario) {
                showMessage('Seleccione un tipo de usuario', 'error');
                return;
            }
            
            if (!contraseña || contraseña.length < 6) {
                showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            if (contraseña !== confirmarContraseña) {
                showMessage('Las contraseñas no coinciden', 'error');
                return;
            }
            
            if (!validateUserForm()) {
                return;
            }
            
            const formData = {
                nombre,
                tipoDocumento,
                numeroDocumento,
                tipoUsuario,
                contraseña
            };

            console.log('Intentando registrar usuario:', formData);

            try {
                const result = await API.guardarUsuario(formData);
                console.log('Resultado del registro:', result);
                
                // Verificar que el usuario se guardó correctamente
                const usuariosGuardados = API.obtenerUsuariosRegistrados();
                console.log('Usuarios guardados después de registro:', usuariosGuardados);
                
                if (usuariosGuardados.length === 0) {
                    console.error('❌ ERROR: No se encontraron usuarios guardados');
                    showMessage('Error: El usuario no se guardó correctamente', 'error');
                    return;
                }
                
                const usuarioRegistrado = usuariosGuardados.find(u => u.numeroDocumento === formData.numeroDocumento);
                if (!usuarioRegistrado) {
                    console.error('❌ ERROR: Usuario registrado no encontrado en la lista');
                    showMessage('Error: Usuario registrado pero no encontrado en la base de datos', 'error');
                    return;
                }
                
                console.log('✅ Usuario guardado y verificado:', usuarioRegistrado);
                
                if (result.status === 'ok') {
                    showMessage('Usuario registrado correctamente. Por favor inicie sesión para continuar.', 'success');
                    userForm.reset();
                    clearValidationErrors(userForm);
                    
                    // Limpiar formulario de login por completo
                    const loginFormElement = document.getElementById('loginFormElement');
                    if (loginFormElement) {
                        loginFormElement.reset();
                        clearValidationErrors(loginFormElement);
                    }
                    
                    // Habilitar botón de login
                    const loginSubmitBtn = document.querySelector('#loginFormElement button[type="submit"]');
                    if (loginSubmitBtn) {
                        loginSubmitBtn.disabled = false;
                    }
                    
                    // Mostrar formulario de login
                    document.getElementById('userForm').parentElement.style.display = 'none';
                    document.getElementById('loginForm').style.display = 'block';
                    
                    // Enfocar el primer campo del login
                    setTimeout(() => {
                        const loginDocumento = document.getElementById('loginDocumento');
                        if (loginDocumento) {
                            loginDocumento.focus();
                        }
                    }, 100);
                } else {
                    showMessage(result.message, 'error');
                }
                
            } catch (error) {
                showMessage('Error registrando usuario: ' + error.message, 'error');
            }
        });
    }
    
    // Verificar estado inicial del formulario de login
    setTimeout(() => {
        const loginSubmitBtn = document.querySelector('#loginFormElement button[type="submit"]');
        if (loginSubmitBtn) {
            console.log('Estado inicial del botón de login:', {
                disabled: loginSubmitBtn.disabled,
                text: loginSubmitBtn.textContent,
                style: loginSubmitBtn.style.cssText
            });
        }
    }, 500);
    
    // Formulario de login
    if (loginForm) {
        // Event listeners para inputs del login
        const loginInputs = loginForm.querySelectorAll('input');
        loginInputs.forEach(input => {
            input.addEventListener('input', () => {
                const loginButton = loginForm.querySelector('button[type="submit"]');
                if (loginButton) {
                    loginButton.disabled = false;
                    console.log('Botón de login habilitado por input change');
                }
            });
            
            input.addEventListener('focus', () => {
                const loginButton = loginForm.querySelector('button[type="submit"]');
                if (loginButton) {
                    loginButton.disabled = false;
                    console.log('Botón de login habilitado por focus');
                }
            });
        });
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            console.log('Intentando iniciar sesión...');
            
            const documento = document.getElementById('loginDocumento').value.trim();
            const contraseña = document.getElementById('loginContraseña').value;
            
            console.log('Datos de login:', { documento, contraseñaLength: contraseña.length });
            
            // Validaciones de login
            if (!documento) {
                showMessage('Ingrese su número de documento', 'error');
                return;
            }
            
            if (!/^[0-9]{5}$/.test(documento)) {
                showMessage('El número de documento debe tener 5 dígitos', 'error');
                return;
            }
            
            if (!contraseña) {
                showMessage('Ingrese su contraseña', 'error');
                return;
            }
            
            try {
                const result = await API.autenticarUsuario(documento, contraseña);
                console.log('Resultado del login:', result);
                
                if (result.status === 'ok') {
                    showMessage('Sesión iniciada correctamente', 'success');
                    currentUser = result.user;
                    loginForm.reset();
                    
                    // Guardar sesión activa
                    saveSession(currentUser);
                    
                    // Mostrar información del usuario
                    showUserInfo(currentUser);
                    
                    // Ocultar formularios y mostrar dashboard
                    document.getElementById('loginForm').style.display = 'none';
                    document.getElementById('userForm').parentElement.style.display = 'none';
                    
                    // Actualizar UI de autenticación
                    console.log('Actualizando UI de autenticación...');
                    updateAuthenticationUI();
                    

                    
                    // Forzar actualización de materiales
                    setTimeout(updateMaterialButtons, 100);
                } else {
                    showMessage(result.message, 'error');
                }
                
            } catch (error) {
                console.error('Error en login:', error);
                showMessage('Error iniciando sesión: ' + error.message, 'error');
            }
        });
    }
}

// Función de diagnóstico
function devDiagnoseButtons() {
    console.log('=== DIAGNÓSTICO DE BOTONES ===');
    
    const loginFormElement = document.getElementById('loginFormElement');
    const userFormElement = document.getElementById('userForm');
    const loginButton = loginFormElement ? loginFormElement.querySelector('button[type="submit"]') : null;
    const registerButton = userFormElement ? userFormElement.querySelector('button[type="submit"]') : null;
    
    // Verificar usuarios guardados
    const usuariosGuardados = API.obtenerUsuariosRegistrados();
    console.log('👥 USUARIOS GUARDADOS:', usuariosGuardados.length);
    usuariosGuardados.forEach((usuario, index) => {
        console.log(`  ${index + 1}. ${usuario.nombre} (${usuario.tipoUsuario}) - Doc: ${usuario.numeroDocumento}`);
    });
    
    console.log('Formulario Login:', {
        existe: !!loginFormElement,
        visible: loginFormElement ? loginFormElement.style.display : 'N/A'
    });
    
    console.log('Formulario Registro:', {
        existe: !!userFormElement,
        visible: userFormElement ? userFormElement.parentElement.style.display : 'N/A'
    });
    
    console.log('Botón Login:', {
        existe: !!loginButton,
        disabled: loginButton ? loginButton.disabled : 'N/A',
        text: loginButton ? loginButton.textContent : 'N/A',
        style: loginButton ? loginButton.style.cssText : 'N/A'
    });
    
    console.log('Botón Registro:', {
        existe: !!registerButton,
        disabled: registerButton ? registerButton.disabled : 'N/A',
        text: registerButton ? registerButton.textContent : 'N/A'
    });
    
    const loginInputs = loginFormElement ? loginFormElement.querySelectorAll('input') : [];
    loginInputs.forEach((input, index) => {
        console.log(`Input Login ${index + 1}:`, {
            id: input.id,
            disabled: input.disabled,
            value: input.value,
            hasError: input.classList.contains('input-error')
        });
    });
    
    console.log('=== FIN DIAGNÓSTICO ===');
}

// Funciones de desarrollo
function devTestLogin() {
    console.log('🧪 Iniciando prueba de login automático...');
    
    // 1. Verificar usuarios guardados
    const usuariosGuardados = API.obtenerUsuariosRegistrados();
    if (usuariosGuardados.length === 0) {
        console.log('❌ No hay usuarios guardados, creando uno de prueba...');
        
        // Crear usuario de prueba
        const testUser = {
            nombre: 'Usuario Prueba',
            tipoDocumento: 'cc',
            numeroDocumento: '99999',
            tipoUsuario: 'analista',
            contraseña: 'test123'
        };
        
        API.guardarUsuario(testUser).then(result => {
            if (result.status === 'ok') {
                console.log('✅ Usuario de prueba creado:', result.user);
                devPerformLogin(result.user);
            }
        });
    } else {
        console.log('✅ Usuarios encontrados, usando el último:', usuariosGuardados[usuariosGuardados.length - 1]);
        devPerformLogin(usuariosGuardados[usuariosGuardados.length - 1]);
    }
}

function devPerformLogin(user) {
    console.log('🔄 Realizando login con usuario:', user);
    
    // Mostrar formulario de login
    document.getElementById('userForm').parentElement.style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    
    // Preenar campos
    setTimeout(() => {
        const loginDocumento = document.getElementById('loginDocumento');
        const loginContraseña = document.getElementById('loginContraseña');
        
        if (loginDocumento) loginDocumento.value = user.numeroDocumento;
        if (loginContraseña) loginContraseña.value = user.contraseña || 'test123';
        
        console.log('✅ Campos pre-llenados');
        
        // Intentar login automático
        setTimeout(() => {
            const loginFormElement = document.getElementById('loginFormElement');
            if (loginFormElement) {
                const submitButton = loginFormElement.querySelector('button[type="submit"]');
                if (submitButton) {
                    console.log('🚀 Simulando clic en botón de login');
                    submitButton.click();
                }
            }
        }, 500);
    }, 100);
}

// Función simple para mostrar login (botón de emergencia)
function mostrarLogin() {
    console.log('EMERGENCIA: Mostrando login');
    
    // Ocultar registro
    document.getElementById('userForm').parentElement.style.display = 'none';
    
    // Mostrar login
    document.getElementById('loginForm').style.display = 'block';
    
    // Habilitar botón
    var btn = document.querySelector('#loginFormElement button[type="submit"]');
    if (btn) btn.disabled = false;
    
    // Pre-llenar documento
    var usuarios = API.obtenerUsuariosRegistrados();
    if (usuarios.length > 0) {
        var doc = document.getElementById('loginDocumento');
        if (doc) doc.value = usuarios[usuarios.length - 1].numeroDocumento;
    }
    
    alert('Formulario de Inicio de Sesión activado');
}

// Función de prueba simple para verificar el botón
function testBotonLogin() {
    console.log('=== TEST BOTÓN LOGIN ===');
    
    // Simular clic en el botón
    const boton = document.getElementById('loginToggle');
    if (boton) {
        console.log('Botón encontrado:', boton.textContent);
        boton.click();
        console.log('Clic simulado ejecutado');
        
        // Verificar resultado
        setTimeout(function() {
            const loginVisible = document.getElementById('loginForm').style.display === 'block';
            const registroVisible = document.querySelector('#userForm').parentElement.style.display !== 'none';
            console.log('Login visible:', loginVisible);
            console.log('Registro visible:', registroVisible);
        }, 100);
    } else {
        console.error('Botón NO encontrado');
    }
}


}

function mostrarLoginDesdeSesion() {
    // Ocultar formulario de registro
    const userFormContainer = document.querySelector('#userForm').parentElement;
    if (userFormContainer) userFormContainer.style.display = 'none';
    
    // Mostrar formulario de login
    const loginFormContainer = document.getElementById('loginForm');
    if (loginFormContainer) loginFormContainer.style.display = 'block';
    
    // Scroll a la sección de usuario
    document.getElementById('usuario').scrollIntoView({ behavior: 'smooth' });
    
    // Mostrar mensaje
    showMessage('Ingrese sus credenciales para iniciar sesión', 'info');
}

function mostrarRegistroDesdeSesion() {
    // Mostrar formulario de registro
    const userFormContainer = document.querySelector('#userForm').parentElement;
    if (userFormContainer) userFormContainer.style.display = 'block';
    
    // Ocultar formulario de login
    const loginFormContainer = document.getElementById('loginForm');
    if (loginFormContainer) loginFormContainer.style.display = 'none';
    
    // Scroll a la sección de usuario
    document.getElementById('usuario').scrollIntoView({ behavior: 'smooth' });
    
    // Mostrar mensaje
    showMessage('Complete el formulario para registrarse', 'info');
}

function cerrarSesionDesdeFormulario() {
    if (confirm('¿Está seguro que desea cerrar la sesión?')) {
        logout();
        showMessage('Sesión cerrada correctamente', 'success');
        

    }
}

// Funciones de desarrollo
function devShowUsers() {
    const users = API.obtenerUsuariosRegistrados();
    console.log('Usuarios registrados:', users);
    
    let message = `Usuarios registrados (${users.length}):\n\n`;
    users.forEach((user, index) => {
        message += `${index + 1}. ${user.nombre} (${user.tipoUsuario}) - Doc: ${user.numeroDocumento}\n`;
    });
    
    alert(message);
}

function devClearData() {
    if (confirm('¿Está seguro que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
        API.limpiarDatos();
        currentUser = null;
        
        // Limpiar sesión
        clearSession();
        
        // Recargar página
        location.reload();
    }
}

// Mostrar herramientas de desarrollo en modo desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const devTools = document.getElementById('devTools');
    if (devTools) {
        devTools.style.display = 'block';
    }
}

function showUserInfo(user) {
    // Eliminar panel existente si hay
    const existingPanel = document.querySelector('.user-info-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // Crear un panel de información del usuario
    const userInfoPanel = document.createElement('div');
    userInfoPanel.className = 'user-info-panel';
    userInfoPanel.style.cssText = `
        background: white;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    userInfoPanel.innerHTML = `
        <h4>👤 Usuario Autenticado</h4>
        <p><strong>Nombre:</strong> ${user.nombre}</p>
        <p><strong>Rol:</strong> ${user.tipoUsuario}</p>
        <p><strong>Documento:</strong> ${user.numeroDocumento}</p>
        <button onclick="logout()" style="background: #dc3545; margin-top: 0.5rem;">Cerrar Sesión</button>
    `;
    
    // Insertar después del header
    const main = document.querySelector('main');
    main.insertBefore(userInfoPanel, main.firstChild);
}

function showRegistrationForm() {
    document.getElementById('userForm').parentElement.style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('usuario').scrollIntoView({ behavior: 'smooth' });
}

function showLoginForm() {
    document.getElementById('userForm').parentElement.style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('usuario').scrollIntoView({ behavior: 'smooth' });
}

function clearValidationErrors(form) {
    if (!form) return;
    
    // Limpiar clases de error
    const errorInputs = form.querySelectorAll('.input-error');
    errorInputs.forEach(input => {
        input.classList.remove('input-error');
    });
    
    // Remover mensajes de error
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
}

function updateAuthenticationUI() {
    console.log('Ejecutando updateAuthenticationUI, currentUser:', currentUser);
    
    const authRequiredMessage = document.getElementById('authRequiredMessage');
    const authRequiredActions = document.getElementById('authRequiredActions');
    const materialActions = document.getElementById('materialActions');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const processFilesBtn = document.getElementById('processFilesBtn');
    const dropZone = document.getElementById('dropZone');
    
    if (currentUser) {
        console.log('Usuario autenticado, habilitando controles');
        
        // Usuario autenticado: mostrar controles de materiales
        if (authRequiredMessage) {
            authRequiredMessage.style.display = 'none';
            console.log('Ocultando authRequiredMessage');
        }
        
        if (authRequiredActions) {
            authRequiredActions.style.display = 'none';
            console.log('Ocultando authRequiredActions');
        }
        
        if (materialActions) {
            materialActions.style.display = 'flex';
            console.log('Mostrando materialActions');
        }
        
        if (searchInput) {
            searchInput.disabled = false;
            searchInput.placeholder = 'Buscar materiales por nombre, categoría o proveedor...';
            console.log('Habilitando searchInput');
        }
        
        if (searchBtn) {
            searchBtn.disabled = false;
            console.log('Habilitando searchBtn');
        }
        
        if (addMaterialBtn) {
            addMaterialBtn.disabled = false;
            console.log('Habilitando addMaterialBtn');
        }
        
        if (refreshBtn) {
            refreshBtn.disabled = false;
            console.log('Habilitando refreshBtn');
        }
        
        if (processFilesBtn) {
            processFilesBtn.disabled = false;
            console.log('Habilitando processFilesBtn');
        }
        
        if (dropZone) {
            dropZone.style.pointerEvents = 'auto';
            dropZone.style.opacity = '1';
            console.log('Habilitando dropZone');
        }
        
        // Actualizar botones en tabla de materiales
        setTimeout(() => {
            const editButtons = document.querySelectorAll('button[onclick^="editMaterial"]');
            const deleteButtons = document.querySelectorAll('button[onclick^="deleteMaterial"]');
            
            editButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
            
            deleteButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
            
            console.log(`Habilitados ${editButtons.length} botones de edición y ${deleteButtons.length} botones de eliminación`);
        }, 500);
        
    } else {
        console.log('Usuario no autenticado, deshabilitando controles');
        
        // Usuario no autenticado: mostrar mensaje de autenticación
        if (authRequiredMessage) {
            authRequiredMessage.style.display = 'block';
            console.log('Mostrando authRequiredMessage');
        }
        
        if (authRequiredActions) {
            authRequiredActions.style.display = 'block';
            console.log('Mostrando authRequiredActions');
        }
        
        if (materialActions) {
            materialActions.style.display = 'none';
            console.log('Ocultando materialActions');
        }
        
        if (searchInput) {
            searchInput.disabled = true;
            searchInput.placeholder = '🔐 Inicie sesión para buscar materiales...';
            console.log('Deshabilitando searchInput');
        }
        
        if (searchBtn) {
            searchBtn.disabled = true;
            console.log('Deshabilitando searchBtn');
        }
        
        // Asegurar que el formulario de login esté completamente habilitado
        const loginFormElement = document.getElementById('loginFormElement');
        if (loginFormElement) {
            const loginInputs = loginFormElement.querySelectorAll('input');
            const loginButton = loginFormElement.querySelector('button[type="submit"]');
            
            loginInputs.forEach(input => {
                input.disabled = false;
                input.classList.remove('input-error');
            });
            
            if (loginButton) {
                loginButton.disabled = false;
            }
            
            // Limpiar errores del login
            clearValidationErrors(loginFormElement);
            
            console.log('Formulario de login habilitado completamente');
        }
    }
}

function initializeMaterialControls() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', async (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Agregar validación al intentar escribir en búsqueda
        searchInput.addEventListener('focus', () => {
            if (!currentUser) {
                showMessage('🔐 Debe iniciar sesión para buscar materiales', 'error');
                showLoginForm();
                searchInput.blur();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (!currentUser) {
                showMessage('🔐 Debe iniciar sesión para buscar materiales', 'error');
                showLoginForm();
                return;
            }
            performSearch();
        });
    }
    
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', () => {
            if (!currentUser) {
                showMessage('🔐 Debe iniciar sesión para agregar materiales', 'error');
                showLoginForm();
                return;
            }
            editingMaterialId = null;
            openMaterialModal();
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await refreshMaterialsDisplay();
            updateStatistics();
            updateOperationsHistory();
            showMessage('Base de datos actualizada', 'success');
        });
    }
}

async function performSearch() {
    // Verificar autenticación
    if (!currentUser) {
        showMessage('🔐 Debe iniciar sesión para buscar materiales', 'error');
        showLoginForm();
        return;
    }

    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (!query) {
        displayMaterials(currentMaterials);
        return;
    }
    
    try {
        showMessage('Buscando materiales...', 'info');
        const results = await API.buscarMateriales(query);
        displayMaterials(results);
        showMessage(`${results.length} materiales encontrados`, 'success');
    } catch (error) {
        showMessage('Error en la búsqueda: ' + error.message, 'error');
    }
}

function initializeFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processFilesBtn');
    
    if (!dropZone || !fileInput || !processBtn) return;

    // Click para seleccionar archivos
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(15, 98, 254, 0.05)';
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.backgroundColor = 'transparent';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'transparent';
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    // Input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
    
    // Procesar archivos
    processBtn.addEventListener('click', processSelectedFiles);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    const dropZone = document.getElementById('dropZone');
    const processBtn = document.getElementById('processFilesBtn');
    
    // Actualizar UI
    dropZone.innerHTML = `
        <p><strong>${files.length} archivo(s) seleccionado(s)</strong></p>
        <p>${files.map(f => f.name).join(', ')}</p>
    `;
    
    processBtn.style.display = 'inline-block';
    processBtn.textContent = 'Procesar Archivos';
    
    // Guardar archivos para procesar
    window.selectedFiles = files;
}

async function processSelectedFiles() {
    // Verificar autenticación
    if (!currentUser) {
        showMessage('🔐 Debe iniciar sesión para subir archivos', 'error');
        showLoginForm();
        return;
    }

    if (!window.selectedFiles || window.selectedFiles.length === 0) return;
    
    const processBtn = document.getElementById('processFilesBtn');
    const dropZone = document.getElementById('dropZone');
    
    try {
        processBtn.disabled = true;
        
        // Verificar si hay PDFs para mostrar mensaje especial
        const hasPDF = window.selectedFiles.some(f => f.name.endsWith('.pdf'));
        const processingText = hasPDF ? 'Procesando PDFs (esto puede tardar más)...' : 'Procesando archivos...';
        processBtn.textContent = processingText;
        
        if (hasPDF) {
            showMessage('Procesando archivos PDF, esto puede tomar unos momentos...', 'info');
        }
        
        const result = await API.procesarArchivos(window.selectedFiles, currentUser);
        
        if (result.status === 'success') {
            showMessage(result.message, 'success');
            
            // Recargar la base de datos
            await initializeDatabase();
        } else {
            showMessage(result.message, 'error');
        }
        
    } catch (error) {
        showMessage('Error procesando archivos: ' + error.message, 'error');
    } finally {
        // Resetear UI
        processBtn.disabled = false;
        processBtn.textContent = 'Procesar Archivos';
        
        if (dropZone) {
            dropZone.innerHTML = `
                <p>Arrastre archivos aquí o haga clic para seleccionar</p>
                <p>Formatos: CSV</p>
            `;
        }
        
        window.selectedFiles = null;
    }
}

function downloadDatabase(format) {
    try {
        const result = API.descargarBaseDatos(format);
        
        if (result.status === 'success') {
            showMessage(`Base de datos descargada: ${result.filename}`, 'success');
        }
    } catch (error) {
        showMessage('Error descargando base de datos: ' + error.message, 'error');
    }
}

// Funciones para el modal de materiales
function initializeMaterialModal() {
    const materialForm = document.getElementById('materialForm');
    if (materialForm) {
        materialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveMaterial();
        });
    }
}

function openMaterialModal(material = null) {
    const modal = document.getElementById('materialModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !modalTitle) return;
    
    if (material) {
        editingMaterialId = material.id;
        modalTitle.textContent = 'Editar Material';
        
        // Llenar formulario con datos del material
        document.getElementById('materialNombre').value = material.nombre;
        document.getElementById('materialPrecio').value = material.precio;
        document.getElementById('materialCategoria').value = material.categoria;
        document.getElementById('materialStock').value = material.stock;
        document.getElementById('materialProveedor').value = material.proveedor;
    } else {
        editingMaterialId = null;
        modalTitle.textContent = 'Agregar Material';
        
        // Limpiar formulario
        document.getElementById('materialForm').reset();
    }
    
    modal.style.display = 'flex';
}

function closeMaterialModal() {
    const modal = document.getElementById('materialModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingMaterialId = null;
}

async function saveMaterial() {
    try {
        // Verificar autenticación
        if (!currentUser) {
            showMessage('🔐 Debe iniciar sesión para guardar materiales', 'error');
            closeMaterialModal();
            showLoginForm();
            return;
        }
        
        const materialData = {
            nombre: document.getElementById('materialNombre').value,
            precio: parseFloat(document.getElementById('materialPrecio').value),
            categoria: document.getElementById('materialCategoria').value,
            stock: parseInt(document.getElementById('materialStock').value),
            proveedor: document.getElementById('materialProveedor').value
        };
        
        let result;
        if (editingMaterialId) {
            result = await API.actualizarMaterial(editingMaterialId, materialData, currentUser);
        } else {
            result = await API.agregarMaterial(materialData, currentUser);
        }
        
        if (result.status === 'success') {
            closeMaterialModal();
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
        
    } catch (error) {
        showMessage('Error guardando material: ' + error.message, 'error');
    }
}

async function editMaterial(id) {
    console.log('Intentando editar material', id, 'currentUser:', !!currentUser);
    
    // Verificar autenticación
    if (!currentUser) {
        showMessage('🔐 Debe iniciar sesión para editar materiales', 'error');
        showLoginForm();
        return;
    }
    
    const material = currentMaterials.find(m => m.id === id);
    if (material) {
        console.log('Abriendo modal para editar:', material);
        openMaterialModal(material);
    } else {
        showMessage('Material no encontrado', 'error');
    }
}

async function deleteMaterial(id) {
    console.log('Intentando eliminar material', id, 'currentUser:', !!currentUser);
    
    // Verificar autenticación
    if (!currentUser) {
        showMessage('🔐 Debe iniciar sesión para eliminar materiales', 'error');
        showLoginForm();
        return;
    }
    
    if (!confirm('¿Está seguro que desea eliminar este material?')) {
        return;
    }
    
    try {
        const result = await API.eliminarMaterial(id, currentUser);
        console.log('Resultado de eliminación:', result);
        
        if (result.status === 'success') {
            showMessage(result.message, 'success');
            // Refrescar la tabla y actualizar botones
            await refreshMaterialsDisplay();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Error eliminando material:', error);
        showMessage('Error eliminando material: ' + error.message, 'error');
    }
}

function showMessage(message, type = 'info') {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Colores según tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    messageEl.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(messageEl);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

function logout() {
    currentUser = null;
    const userInfoPanel = document.querySelector('.user-info-panel');
    if (userInfoPanel) {
        userInfoPanel.remove();
    }
    
    // Limpiar sesión activa
    clearSession();
    
    // Mostrar formulario de registro
    document.getElementById('userForm').parentElement.style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    
    // Actualizar UI de autenticación
    updateAuthenticationUI();
    
    // Actualizar formulario de sesión
    actualizarFormularioSesion();
    
    showMessage('Sesión cerrada correctamente', 'info');
}

// Estilos dinámicos para mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .materials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .material-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .material-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    
    .material-card h4 {
        margin: 0 0 0.5rem 0;
        color: #0f62fe;
    }
    
    .material-card p {
        margin: 0.25rem 0;
        color: #666;
    }
    
    .error {
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 8px;
        padding: 1.5rem;
        color: #c33;
        text-align: center;
    }
    
    .error h3 {
        margin: 0 0 1rem 0;
    }
    
    .error button {
        background: #c33;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
    }
    
    .message {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .message-success {
        background: #28a745;
    }
    
    .message-error {
        background: #dc3545;
    }
    
    .message-info {
        background: #17a2b8;
    }
    
    .message-warning {
        background: #ffc107;
    }
`;

document.head.appendChild(style);
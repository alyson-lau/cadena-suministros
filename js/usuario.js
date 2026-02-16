// usuario.js – Lógica específica de la página de usuario
let currentMaterials = [];
let editingMaterialId = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeUserPage();
});

async function initializeUserPage() {
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

function initializeNavigation() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Para navegación interna en la misma página
            const targetId = link.getAttribute('href').substring(1);
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
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
    
    // Validación en tiempo real y envío del formulario
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

function setupRealTimeValidation(form) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateField(input);
        });
        
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });
}

function validateField(input) {
    let isValid = true;
    let errorMessage = '';
    
    // Eliminar mensaje de error anterior
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    input.classList.remove('input-error');
    
    // Validar según el tipo de campo
    if (input.id === 'nombre') {
        if (input.value.trim().length < 3) {
            isValid = false;
            errorMessage = 'El nombre debe tener al menos 3 caracteres';
        }
    } else if (input.id === 'numeroDocumento') {
        if (!/^[0-9]{5}$/.test(input.value.trim())) {
            isValid = false;
            errorMessage = 'El número de documento debe tener exactamente 5 dígitos';
        }
    } else if (input.id === 'contraseña') {
        if (input.value.length < 6) {
            isValid = false;
            errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        }
    } else if (input.id === 'confirmarContraseña') {
        const contraseña = document.getElementById('contraseña').value;
        if (input.value !== contraseña) {
            isValid = false;
            errorMessage = 'Las contraseñas no coinciden';
        }
    } else if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    }
    
    if (!isValid) {
        input.classList.add('input-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;
        
        input.parentElement.appendChild(errorDiv);
    }
    
    return isValid;
}

function validateUserForm() {
    const userForm = document.getElementById('userForm');
    if (!userForm) return true;
    
    const inputs = userForm.querySelectorAll('input');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    const selects = userForm.querySelectorAll('select');
    selects.forEach(select => {
        if (!select.value) {
            select.classList.add('input-error');
            isValid = false;
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Este campo es obligatorio';
            errorDiv.style.cssText = `
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            `;
            
            select.parentElement.appendChild(errorDiv);
        }
    });
    
    return isValid;
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

// Resto de las funciones específicas de la página de usuario
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

function updateMaterialButtons() {
    const editButtons = document.querySelectorAll('button[onclick^="editMaterial"]');
    const deleteButtons = document.querySelectorAll('button[onclick^="deleteMaterial"]');
    
    if (currentUser) {
        editButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        
        deleteButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    } else {
        editButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        
        deleteButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
    }
}

// Funciones de controles de materiales
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

// Funciones de upload de archivos
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
                <p>Formatos: JSON, CSV, PDF</p>
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
            await refreshMaterialsDisplay();
            updateStatistics();
            updateOperationsHistory();
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
            updateStatistics();
            updateOperationsHistory();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Error eliminando material:', error);
        showMessage('Error eliminando material: ' + error.message, 'error');
    }
}
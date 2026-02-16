// shared.js – Funcionalidades compartidas entre todas las páginas
let currentUser = null;

// Funciones compartidas de sesión
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
                showUserBanner();
                
                // Mostrar mensaje de bienvenida
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

function showUserBanner() {
    const userInfo = document.getElementById('userInfo');
    if (currentUser && userInfo) {
        userInfo.style.display = 'flex';
        const headerUserName = document.getElementById('headerUserName');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserRole = document.getElementById('dropdownUserRole');
        
        if (headerUserName) headerUserName.textContent = currentUser.nombre;
        if (dropdownUserName) dropdownUserName.textContent = currentUser.nombre;
        
        const roleNames = {
            'lider': 'Líder de Compras',
            'analista': 'Analista',
            'desarrollador': 'Desarrollador'
        };
        if (dropdownUserRole) dropdownUserRole.textContent = roleNames[currentUser.tipoUsuario] || currentUser.tipoUsuario;
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('cadenaSuministros_sesionActiva');
        currentUser = null;
        
        const userInfo = document.getElementById('userInfo');
        if (userInfo) userInfo.style.display = 'none';
        
        showMessage('Sesión cerrada correctamente', 'info');
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(e) {
    const userInfo = document.getElementById('userInfo');
    const dropdown = document.getElementById('userDropdown');
    if (userInfo && dropdown && !userInfo.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

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

function logout() {
    currentUser = null;
    const userInfoPanel = document.querySelector('.user-info-panel');
    if (userInfoPanel) {
        userInfoPanel.remove();
    }
    
    // Limpiar sesión activa
    clearSession();
    
    showMessage('Sesión cerrada correctamente', 'info');
    
    // Recargar la página para mostrar formularios de registro e inicio de sesión
    setTimeout(() => {
        window.location.reload();
    }, 1000);
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
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
        min-width: 250px;
    `;
    
    // Mapear códigos de rol a nombres completos
    const rolNombres = {
        'lider': 'Líder de Compras',
        'analista': 'Analista',
        'desarrollador': 'Desarrollador'
    };
    const rolCompleto = rolNombres[user.tipoUsuario] || user.tipoUsuario;
    
    userInfoPanel.innerHTML = `
        <h4>👤 Usuario Autenticado</h4>
        <p><strong>Nombre:</strong> ${user.nombre}</p>
        <p><strong>Rol:</strong> ${rolCompleto}</p>
        <p><strong>Documento:</strong> ${user.numeroDocumento}</p>
        <button onclick="logout()" style="background: #dc3545; margin-top: 0.5rem;">Cerrar Sesión</button>
    `;
    
    // Insertar en el body
    document.body.appendChild(userInfoPanel);
}

function showRegistrationForm() {
    window.location.href = 'tipodeusuario.html#registro';
}

function showLoginForm() {
    window.location.href = 'tipodeusuario.html#login';
}

// Función de mensajes compartida
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

// Funciones de desarrollo compartidas
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

function devDiagnoseButtons() {
    console.log('=== DIAGNÓSTICO DE BOTONES ===');
    
    const loginFormElement = document.getElementById('loginFormElement');
    const userFormElement = document.getElementById('userForm');
    const loginButton = loginFormElement ? loginFormElement.querySelector('button[type="submit"]') : null;
    const registerButton = userFormElement ? userFormElement.querySelector('button[type="submit"]') : null;
    
    console.log('Formulario Login:', {
        existe: !!loginFormElement,
        visible: loginFormElement ? loginFormElement.style.display : 'N/A'
    });
    
    console.log('Formulario Registro:', {
        existe: !!userFormElement,
        visible: userFormElement ? userFormElement.parentElement.style.display : 'N/A'
    });
    
    console.log('=== FIN DIAGNÓSTICO ===');
}

function devTestLogin() {
    console.log('🧪 Iniciando prueba de login automático...');
    
    // Redirigir a usuario.html para hacer login
    window.location.href = 'usuario.html';
}

// Mostrar herramientas de desarrollo en modo desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const devTools = document.getElementById('devTools');
    if (devTools) {
        devTools.style.display = 'block';
    }
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
    
    nav a.active {
        background: var(--azul) !important;
        color: white !important;
        border-radius: 4px;
    }
    
    /* Estilos para el banner de usuario */
    .user-info {
        display: flex;
        align-items: center;
        margin-left: 1rem;
    }
    
    .user-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s;
    }
    
    .user-button:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .user-icon {
        font-size: 1.1rem;
    }
    
    .user-arrow {
        font-size: 0.7rem;
        transition: transform 0.3s;
    }
    
    .user-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 200px;
        z-index: 1000;
        margin-top: 0.5rem;
    }
    
    .user-dropdown.show {
        display: block;
        animation: slideIn 0.3s ease-out;
    }
    
    .user-dropdown-header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        color: #333;
    }
    
    .user-dropdown-header p {
        margin: 0.3rem 0;
        font-size: 0.9rem;
    }
    
    .logout-button {
        width: 100%;
        padding: 0.8rem 1rem;
        border: none;
        background: #dc3545;
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        border-radius: 0 0 8px 8px;
        text-align: left;
    }
    
    .logout-button:hover {
        background: #c82333;
    }
    
    nav {
        position: relative;
    }
`;

document.head.appendChild(style);
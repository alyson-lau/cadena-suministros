# 📦 Cadena de Suministros - Sistema de Gestión

Aplicación web integral para la gestión y optimización de cadenas de suministros con análisis de materiales, usuarios y estadísticas en tiempo real.

## 🚀 Características

- ✅ **Gestión de Usuarios**: Crear, editar, eliminar usuarios con roles (Líder, Analista, Desarrollador)
- ✅ **Catálogo de Materiales**: Inventario completo con búsqueda y filtrado avanzado
- ✅ **Estadísticas**: Dashboard con análisis por categoría, proveedor y valor total
- ✅ **Autenticación**: Sistema seguro de login, registro y recuperación de contraseña
- ✅ **API REST**: Endpoints completos para integración
- ✅ **Interfaz Responsiva**: Diseño moderno con Materialize CSS

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Frontend
- **AngularJS** - Framework SPA
- **Materialize CSS** - Diseño responsivo
- **HTML5 / CSS3** - Estructura y estilos

## 📋 Requisitos Previos

- Node.js v14 o superior
- MongoDB instalado y ejecutándose
- npm o yarn

## 🔧 Instalación

```bash
# Clonar repositorio
git clone https://github.com/alyson-lau/cadena-suministros.git
cd cadena-suministros

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor
npm start
```

## 📡 API REST

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/recover` - Recuperar contraseña

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Materiales
- `GET /api/materiales` - Listar materiales
- `GET /api/materiales/categorias` - Obtener categorías
- `GET /api/materiales/proveedores` - Obtener proveedores
- `GET /api/materiales/estadisticas` - Estadísticas generales

## 🎯 Estructura del Proyecto

```
.
├── models/                 # Esquemas de Mongoose
│   ├── Usuario.js
│   └── Material.js
├── routes/                 # Rutas de API
│   ├── auth.js
│   ├── usuarios.js
│   └── materiales.js
├── public/                 # Frontend
│   ├── index.html
│   ├── views/
│   └── js/
│       └── app.js
├── scripts/                # Utilidades
│   ├── test-apis.js
│   └── validate-html.js
├── server.js               # Punto de entrada
├── package.json
└── README.md
```

## 🚀 Comandos Disponibles

```bash
# Inicial servidor en modo desarrollo
npm run dev

# Ejecutar pruebas de API
npm run test-apis

# Validar HTML
npm run validate
```

## 📝 Variables de Entorno

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cadenaSuministros
NODE_ENV=development
```

## 👤 Autor

**Alyson Lau**
- GitHub: [@alyson-lau](https://github.com/alyson-lau)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios significativos, por favor abre un issue primero para discutir los cambios propuestos.

---

**Estado del Proyecto**: En desarrollo v1.0.0

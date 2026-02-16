# 🏭 Cadena de Suministros - Guía de Ejecución

## 📋 Requisitos Previos

Asegúrate de tener instalados:

- **Node.js** v20+ → [Descargar](https://nodejs.org/)
- **MongoDB** 8.2+ → [Descargar](https://www.mongodb.com/try/download/community)
- **Git** → [Descargar](https://git-scm.com/)

### ✅ Verificar instalaciones:

```bash
node --version    # Debe ser v20+
npm --version
mongod --version  # Debe estar en PATH
git --version
```

---

## 🚀 Cómo Ejecutar el Proyecto

### **OPCIÓN 1: Script Automático (Recomendado para Windows)**

El script maneja todo automáticamente: MongoDB, npm install, y Node.js.

**Double-click en:**
```
scripts/start-dev.bat
```

Esto abrirá **2 ventanas**:
1. MongoDB en puerto **27017**
2. Node.js en puerto **3000**

---

### **OPCIÓN 2: Comandos Manuales**

**Terminal 1 - Iniciar MongoDB:**
```bash
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath="C:\data\db"
```

**Terminal 2 - Iniciar Node.js:**
```bash
npm install
npm run dev
```

---

### **OPCIÓN 3: PowerShell (Control Total)**

```powershell
# Iniciar servicios
powershell -ExecutionPolicy Bypass -File scripts/start-dev.ps1 -Action start

# Ver estado
npm run services:status

# Ver logs de MongoDB
npm run services:logs

# Detener servicios
npm run services:stop
```

---

### **OPCIÓN 4: Docker (Recomendado para Producción)**

```bash
# Instalar las dependencias primero
npm install

# Iniciar con Docker Compose
npm run docker:up

# Ver logs
npm run docker:logs

# Detener
npm run docker:down
```

---

## 🌐 Acceso a la Aplicación

Una vez iniciada, accede a:

| URL | Descripción |
|-----|-------------|
| **http://localhost:3000** | Frontend AngularJS |
| **http://localhost:3000/app** | Aplicación |
| **http://localhost:3000/api** | API REST |
| **http://localhost:3000/api/status** | Estado de la API |

---

## 📊 Información de Conexión

### MongoDB
- **Host:** `localhost`
- **Puerto:** `27017`
- **Base de datos:** `cadenaSuministros`
- **Usuario:** (sin autenticación en desarrollo)

### Node.js API
- **Host:** `localhost`
- **Puerto:** `3000`
- **Base URL:** `http://localhost:3000/api`

---

## 🧪 Testing

Ejecute los tests con:

```bash
# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests completos con cobertura
npm test

# Tests en modo watch (se ejecutan al guardar)
npm run test:watch
```

---

## 🔧 Desarrollo

### Instalar dependencias:
```bash
npm install
```

### Ejecutar en modo desarrollo (con hot-reload):
```bash
npm run dev
```

### Linter y formateo:
```bash
# Ver errores de linting
npm run lint

# Arreglar errores automáticamente
npm run lint:fix
```

### Cargar datos de prueba:
```bash
npm run seed
```

---

## 📁 Estructura del Proyecto

```
proyecto/
├── public/              # Frontend AngularJS
│   ├── index.html
│   └── js/
│       └── app.js
├── routes/              # API REST
│   ├── auth.js
│   ├── usuarios.js
│   └── materiales.js
├── models/              # Modelos Mongoose
│   ├── Usuario.js
│   └── Material.js
├── scripts/             # Scripts de utilidad
│   ├── start-dev.bat    # 🆕 Iniciar automático
│   ├── start-dev.ps1    # 🆕 PowerShell control
│   ├── stop-all.bat     # 🆕 Detener servicios
│   ├── seed.js
│   └── test-apis.js
├── .github/             # GitHub Actions & Git Flow
│   ├── workflows/
│   └── GITFLOW.md
├── tests/               # Suite de tests
│   ├── unit/
│   └── integration/
├── docker-compose.yml   # Orquestación Docker
├── Dockerfile           # Imagen Docker
├── package.json         # Dependencias & Scripts
├── .env.example         # 🆕 Variables de entorno
└── server.js            # Entrada principal
```

---

## ⚠️ Solución de Problemas

### **"Puerto 3000 ya en uso"**

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza XXXX con el PID)
taskkill /PID XXXX /F
```

### **"MongoDB no inicia"**

```bash
# Crear carpeta de datos
mkdir C:\data\db

# Ejecutar con ruta explícita
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath="C:\data\db"
```

### **"npm command not found"**

Asegúrate de que Node.js está en PATH:
```bash
# Verificar
node --version

# Si no funciona, reinstala Node.js
```

### **"Conexión a MongoDB fallida"**

1. Verifica que MongoDB está corriendo:
   ```bash
   tasklist | findstr mongod
   ```

2. Verifica la URI en `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/cadenaSuministros
   ```

3. Revisa los logs:
   ```bash
   npm run services:logs
   ```

---

## 📊 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor (producción) |
| `npm run dev` | Inicia con nodemon (desarrollo) |
| `npm run dev:win` | Inicia con PowerShell (Windows) |
| `npm test` | Ejecuta tests completos |
| `npm run test:unit` | Tests unitarios solo |
| `npm run test:integration` | Tests de integración |
| `npm run lint` | Valida código |
| `npm run lint:fix` | Arregla problemas de linting |
| `npm run seed` | Carga datos de prueba |
| `npm run services:status` | Ver estado de servicios |
| `npm run services:stop` | Detener MongoDB y Node |
| `npm run docker:up` | Iniciar con Docker |
| `npm run docker:down` | Detener Docker |

---

## 🤝 Git Flow

### Crear feature:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/descripcion
# ... hacer cambios ...
git add .
git commit -m "feat: descripcion"
git push origin feature/descripcion
# Crear PR en GitHub
```

### Commits:
```bash
git commit -m "feat: nueva funcionalidad"
git commit -m "fix: corregir bug"
git commit -m "docs: actualizar documentación"
git commit -m "test: agregar tests"
```

---

## 📞 Contacto & Ayuda

- 📧 Email: support@cadenaSuministros.local
- 📖 Documentación: [Ver GITFLOW.md](.github/GITFLOW.md)
- 🐛 Reportar bugs: Crear issue en GitHub

---

**Última actualización:** 16 de febrero de 2026

**Estado:** ✅ Producción Ready

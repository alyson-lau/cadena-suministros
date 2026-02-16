# Git Flow Strategy - Cadena de Suministros

## Rama Naming Strategy

### Main Branch
- **main**: Rama de producción. Solo contains releases y hotfixes. Protected.

### Development Branch
- **develop**: Rama integración. Todo PRs deben mergear aquí primero.

### Feature Branches
- **feature/descripcion-corta**: Nuevas funcionalidades
  - Estructura: `feature/auth-jwt`, `feature/api-materiales`
  - Requiere PR review antes de merge

### Bugfix Branches
- **bugfix/descripcion-corta**: Correcciones en desarrollo
  - Estructura: `bugfix/login-validation`

### Hotfix Branches
- **hotfix/descripcion-corta**: Correcciones críticas en producción
  - Estructura: `hotfix/mongodb-connection`
  - Mergea a main y develop
  - Crea tag de versión

### Release Branches
- **release/v1.x.x**: Preparación de release
  - Estructura: `release/v1.1.0`
  - Solo bugfixes y versionado

## Workflow Ejemplo

```bash
# 1. Crear feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Trabajar en la feature
git add .
git commit -m "feat: descripcion de cambios"
git push origin feature/nueva-funcionalidad

# 3. PR en GitHub: feature/nueva-funcionalidad → develop

# 4. Merge en GitHub (después de review)

# 5. Eliminar rama local
git branch -d feature/nueva-funcionalidad

# 6. Cuando ready para producción
git checkout main
git pull origin main
git merge --no-ff develop
git tag v1.x.x
git push origin main --follow-tags
```

## Convenciones de Commits

### Formato
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios en estilos (no código funcional)
- **refactor**: Refactorización de código
- **perf**: Mejoras de performance
- **test**: Adición de tests
- **chore**: Cambios en build, dependencies, etc

### Scopes
- `auth`: Autenticación
- `api`: API REST
- `db`: Base de datos
- `frontend`: Frontend AngularJS
- `docker`: Docker/Contenedor
- `ci`: CI/CD

### Ejemplos Válidos
```
feat(auth): agregar JWT authentication
fix(api): corregir validación de usuarios
docs(readme): actualizar instrucciones de instalación
test(api): agregar tests para endpoint materiales
refactor(db): optimizar queries de MongoDB
chore(docker): actualizar versión de imagen base
```

## Rules for Protected Branches

**main:**
- ✅ Requiere 1 approval en PR
- ✅ Requiere que pase CI/CD
- ✅ Requiere que esté actualizado con base
- ✅ No permite force push

**develop:**
- ✅ Requiere que pase CI/CD
- ✅ Requiere que esté actualizado con base
- ❌ PRs desde features automáticas (1 approval mínimo)

## Version Number Strategy (Semantic Versioning)

- **MAJOR** (x.0.0): Cambios incompatibles, breaking changes
- **MINOR** (1.x.0): Nuevas funcionalidades backwards compatible
- **PATCH** (1.0.x): Bug fixes

Ejemplo: v1.2.3
- 1 = MAJOR (producto completo)
- 2 = MINOR (2 características nuevas)
- 3 = PATCH (3 correcciones de bugs)

// api.js – Gestión de APIs locales y procesamiento de archivos
class DatabaseManager {
    constructor() {
        this.materials = [];
        this.providers = [];
        this.users = [];
        this.isLoaded = false;
        this.listeners = [];
        this.operationHistory = [];
        this.externalDatabases = new Map(); // Guardar bases de datos externas
        
        // Inicializar persistencia
        this.loadFromStorage();
        
        // Cargar bases de datos externas
        this.loadExternalDatabases();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    // Cargar bases de datos externas desde los archivos JSON
    async loadExternalDatabases() {
        try {
            console.log('⚠️ Carga de bases externas deshabilitada temporalmente. Cargando materiales por defecto...');
            
            // Cargar siempre materiales por defecto para asegurar funcionamiento
            await this.loadDefaultMaterials();
            
            // Guardar en localStorage
            this.saveToStorage();
            
            console.log('✅ Materiales por defecto cargados exitosamente');
            
        } catch (error) {
            console.error('Error cargando bases de datos:', error);
            // Cargar datos por defecto si hay error
            if (this.materials.length === 0) {
                await this.loadDefaultMaterials();
            }
        }
    }

    async loadDefaultMaterials() {
        console.log('Cargando materiales por defecto...');
        
        this.materials = [
            { 
                id: `default_${Date.now()}_1`, 
                nombre: "Cemento gris", 
                precio: 32000, 
                categoria: "Materiales cementantes", 
                stock: 100, 
                proveedor: "Cemex Colombia",
                fuente: "Default"
            },
            { 
                id: `default_${Date.now()}_2`, 
                nombre: "Varilla de acero", 
                precio: 28000, 
                categoria: "Estructurales", 
                stock: 50, 
                proveedor: "Acerías Paz del Río",
                fuente: "Default"
            },
            { 
                id: `default_${Date.now()}_3`, 
                nombre: "Ladrillo cerámico", 
                precio: 850, 
                categoria: "Mampostería", 
                stock: 1000, 
                proveedor: "Cerámicas Andina",
                fuente: "Default"
            },
            { 
                id: `default_${Date.now()}_4`, 
                nombre: "Arena gruesa", 
                precio: 15000, 
                categoria: "Agregados", 
                stock: 500, 
                proveedor: "Canteras del Río",
                fuente: "Default"
            },
            { 
                id: `default_${Date.now()}_5`, 
                nombre: "Bloque de concreto", 
                precio: 2500, 
                categoria: "Mampostería", 
                stock: 800, 
                proveedor: "Prefabricados Nacional",
                fuente: "Default"
            }
        ];
        
        console.log(`📦 Cargados ${this.materials.length} materiales por defecto`);
    }

    async processExternalDatabases() {
        // Procesar Base de datos de Boyacá
        const boyacaDB = this.externalDatabases.get('Bases de datos materiales/Lista_oficial_de_precios_unitarios_fijos_de_Obra_Pública_y_de_consultoría_-_DEPARTAMENTO_DE_BOYACÁ_20260205.json');
        if (boyacaDB) {
            this.processBoyacaDatabase(boyacaDB);
        }
        
        // Procesar Catálogo de Ferretería IAD MIPYMES
        const ferreteriaDB = this.externalDatabases.get('Bases de datos materiales/Base de datos.catalogo_ferreteria_-_iad_mipymes_v13.2024.json');
        if (ferreteriaDB) {
            this.processFerreteriaDatabase(ferreteriaDB);
        }
    }

    processBoyacaDatabase(data) {
        try {
            // Limpiar el array si tiene elementos nulos al inicio
            const cleanData = data.filter(item => item && typeof item === 'object' && item.ITEM);
            
            cleanData.forEach(item => {
                const material = {
                    id: `boyaca_${item["CODIGO ITEM"]}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    nombre: item.ITEM || `Item ${item["CODIGO ITEM"]}`,
                    precio: item.TOTAL || 0,
                    categoria: this.mapBoyacaCategory(item.SUBCAPITULO || item.CAPITULO || 'General'),
                    stock: 0, // No hay información de stock en esta BD
                    proveedor: 'Gobernación de Boyacá',
                    codigo: item["CODIGO ITEM"],
                    unidad: item.UNIDAD || 'unidad',
                    capitulo: item.CAPITULO,
                    subcapitulo: item.SUBCAPITULO,
                    fuente: 'Boyacá 2023'
                };
                
                // Evitar duplicados
                const exists = this.materials.some(m => 
                    m.nombre.toLowerCase() === material.nombre.toLowerCase() && 
                    m.fuente === 'Boyacá 2023'
                );
                
                if (!exists) {
                    this.materials.push(material);
                }
            });
            
            console.log(`Procesados ${cleanData.length} materiales de Boyacá`);
            
        } catch (error) {
            console.error('Error procesando base de datos de Boyacá:', error);
        }
    }

    processFerreteriaDatabase(data) {
        try {
            // Saltar los primeros elementos que son metadatos (empresas y columnas)
            const startIndex = data.findIndex(item => 
                item && typeof item === 'object' && 
                item["Column1"] && 
                typeof item["Column1"] === 'number'
            );
            
            if (startIndex === -1) {
                console.log('No se encontraron datos de materiales en el catálogo de ferretería');
                return;
            }
            
            const materialData = data.slice(startIndex);
            
            materialData.forEach(item => {
                try {
                    const material = {
                        id: `ferreteria_${item["Column1"]}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        nombre: item["\nIAD MIPYMES - Catálogo Materiales de Construcción y Ferretería\n"] || `Material ${item["Column1"]}`,
                        precio: item["Column4"] || 0, // Primer precio disponible
                        categoria: this.categorizeMaterial(item["\nIAD MIPYMES - Catálogo Materiales de Construcción y Ferretería\n"] || ''),
                        stock: 0, // No hay información de stock en esta BD
                        proveedor: 'IAD MIPYMES',
                        unidad: item["Column3"] || 'unidad',
                        fuente: 'IAD MIPYMES 2024',
                        numero: item["Column1"]
                    };
                    
                    // Evitar duplicados
                    const exists = this.materials.some(m => 
                        m.nombre.toLowerCase() === material.nombre.toLowerCase() && 
                        m.fuente === 'IAD MIPYMES 2024'
                    );
                    
                    if (!exists && material.nombre && material.precio > 0) {
                        this.materials.push(material);
                    }
                } catch (itemError) {
                    // Ignorar items con errores
                }
            });
            
            console.log(`Procesados ${materialData.length} materiales del catálogo de ferretería IAD MIPYMES`);
            
        } catch (error) {
            console.error('Error procesando catálogo de ferretería:', error);
        }
    }

    mapBoyacaCategory(subcapitulo) {
        const categoryMap = {
            'PRELIMINARES': 'Materiales cementantes',
            'MOVIMIENTO DE TIERRAS': 'Agregados',
            'OBRAS DE CONCRETO SIMPLE': 'Materiales cementantes',
            'OBRAS DE CONCRETO REFORZADO': 'Materiales cementantes',
            'MAMPOSTERÍA': 'Mampostería',
            'ESTRUCTURAS METÁLICAS': 'Estructurales',
            'CARPINTERÍA': 'Acabados',
            'CUBIERTAS': 'Acabados',
            'ENCHAPES Y REVESTIMIENTOS': 'Acabados',
            'INSTALACIONES ELÉCTRICAS': 'Herramientas',
            'INSTALACIONES HIDRÁULICAS Y SANITARIAS': 'Herramientas',
            'PINTURAS': 'Acabados'
        };
        
        const categoryKey = subcapitulo ? subcapitulo.toUpperCase().trim() : '';
        return categoryMap[categoryKey] || 'Materiales cementantes';
    }

    // Métodos de persistencia con localStorage
    loadFromStorage() {
        try {
            // Cargar usuarios desde localStorage
            const savedUsers = localStorage.getItem('cadenaSuministros_usuarios');
            if (savedUsers) {
                this.users = JSON.parse(savedUsers);
                console.log('Usuarios cargados desde localStorage:', this.users.length);
            }
            
            // Cargar materiales desde localStorage
            const savedMaterials = localStorage.getItem('cadenaSuministros_materiales');
            if (savedMaterials) {
                this.materials = JSON.parse(savedMaterials);
                console.log('Materiales cargados desde localStorage:', this.materials.length);
            }
            
            // Cargar historial de operaciones desde localStorage
            const savedHistory = localStorage.getItem('cadenaSuministros_historial');
            if (savedHistory) {
                this.operationHistory = JSON.parse(savedHistory);
                console.log('Historial cargado desde localStorage:', this.operationHistory.length);
            }
            
        } catch (error) {
            console.error('Error cargando datos desde localStorage:', error);
        }
    }

    saveToStorage() {
        try {
            // Guardar usuarios
            localStorage.setItem('cadenaSuministros_usuarios', JSON.stringify(this.users));
            
            // Guardar materiales
            localStorage.setItem('cadenaSuministros_materiales', JSON.stringify(this.materials));
            
            // Guardar historial
            localStorage.setItem('cadenaSuministros_historial', JSON.stringify(this.operationHistory));
            
            console.log('Datos guardados en localStorage');
            
        } catch (error) {
            console.error('Error guardando datos en localStorage:', error);
        }
    }

    clearStorage() {
        try {
            localStorage.removeItem('cadenaSuministros_usuarios');
            localStorage.removeItem('cadenaSuministros_materiales');
            localStorage.removeItem('cadenaSuministros_historial');
            console.log('localStorage limpiado');
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
        }
    }

    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error en listener:', error);
            }
        });
    }

    addOperation(operation) {
        this.operationHistory.unshift({
            ...operation,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        
        if (this.operationHistory.length > 50) {
            this.operationHistory = this.operationHistory.slice(0, 50);
        }
        
        // Guardar en localStorage
        this.saveToStorage();
    }

    async loadDatabase() {
        return new Promise((resolve) => {
            this.notifyListeners('database:loading', { message: 'Cargando base de datos...' });
            
            setTimeout(() => {
                // Solo cargar datos por defecto si no hay nada en localStorage
                if (this.materials.length === 0) {
                    this.materials = [
                        { id: 1, nombre: "Cemento gris", precio: 32000, categoria: "Materiales cementantes", stock: 100, proveedor: "Cemex Colombia" },
                        { id: 2, nombre: "Varilla de acero", precio: 28000, categoria: "Estructurales", stock: 50, proveedor: "Acerías Paz del Río" },
                        { id: 3, nombre: "Ladrillo cerámico", precio: 850, categoria: "Mampostería", stock: 1000, proveedor: "Cerámicas Andina" },
                        { id: 4, nombre: "Arena gruesa", precio: 15000, categoria: "Agregados", stock: 500, proveedor: "Canteras del Río" },
                        { id: 5, nombre: "Piedra triturada", precio: 18000, categoria: "Agregados", stock: 300, proveedor: "Canteras del Río" },
                        { id: 6, nombre: "Bloque de concreto", precio: 2500, categoria: "Mampostería", stock: 800, proveedor: "Prefabricados Nacional" },
                        { id: 7, nombre: "Acero corrugado", precio: 29000, categoria: "Estructurales", stock: 40, proveedor: "Acerías Paz del Río" },
                        { id: 8, nombre: "Grava fina", precio: 12000, categoria: "Agregados", stock: 600, proveedor: "Canteras del Río" }
                    ];
                    
                    // Guardar los datos iniciales en localStorage
                    this.saveToStorage();
                }
                
                this.isLoaded = true;
                
                this.addOperation({
                    type: 'database:loaded',
                    details: `Base de datos cargada con ${this.materials.length} materiales`
                });
                
                this.notifyListeners('database:loaded', { 
                    materials: this.materials,
                    count: this.materials.length
                });
                
                resolve(this.materials);
            }, 1500);
        });
    }

    async addMaterial(material, user = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!user) {
                    reject({
                        status: "error",
                        message: "Debe estar autenticado para agregar materiales"
                    });
                    return;
                }

                const newMaterial = {
                    ...material,
                    id: Date.now(),
                    createdAt: new Date().toISOString(),
                    createdBy: user.nombre,
                    createdByRole: user.tipoUsuario
                };
                
                this.materials.push(newMaterial);
                
                // Guardar en localStorage
                this.saveToStorage();
                
                this.addOperation({
                    type: 'material:added',
                    materialName: newMaterial.nombre,
                    userName: user.nombre,
                    userRole: user.tipoUsuario,
                    userId: user.id,
                    details: `${user.nombre} (${user.tipoUsuario}) agregó "${newMaterial.nombre}"`
                });
                
                this.notifyListeners('material:added', { 
                    material: newMaterial,
                    user: user,
                    total: this.materials.length
                });
                
                resolve({
                    status: "success",
                    message: `Material "${newMaterial.nombre}" agregado correctamente`,
                    material: newMaterial
                });
            } catch (error) {
                reject({
                    status: "error",
                    message: "Error agregando material: " + error.message
                });
            }
        });
    }

    async updateMaterial(id, updates, user = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!user) {
                    reject({
                        status: "error",
                        message: "Debe estar autenticado para actualizar materiales"
                    });
                    return;
                }

                const index = this.materials.findIndex(m => m.id === id);
                if (index === -1) {
                    throw new Error('Material no encontrado');
                }
                
                const oldMaterial = { ...this.materials[index] };
                this.materials[index] = { 
                    ...this.materials[index], 
                    ...updates,
                    updatedBy: user.nombre,
                    updatedByRole: user.tipoUsuario,
                    updatedAt: new Date().toISOString()
                };
                
                // Guardar en localStorage
                this.saveToStorage();
                
                this.addOperation({
                    type: 'material:updated',
                    materialName: this.materials[index].nombre,
                    userName: user.nombre,
                    userRole: user.tipoUsuario,
                    userId: user.id,
                    details: `${user.nombre} (${user.tipoUsuario}) actualizó "${this.materials[index].nombre}"`,
                    changes: Object.keys(updates)
                });
                
                this.notifyListeners('material:updated', { 
                    material: this.materials[index],
                    oldMaterial,
                    user: user,
                    total: this.materials.length
                });
                
                resolve({
                    status: "success",
                    message: `Material "${this.materials[index].nombre}" actualizado correctamente`,
                    material: this.materials[index]
                });
            } catch (error) {
                reject({
                    status: "error",
                    message: "Error actualizando material: " + error.message
                });
            }
        });
    }

    async deleteMaterial(id, user = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!user) {
                    reject({
                        status: "error",
                        message: "Debe estar autenticado para eliminar materiales"
                    });
                    return;
                }

                const index = this.materials.findIndex(m => m.id === id);
                if (index === -1) {
                    throw new Error('Material no encontrado');
                }
                
                const deletedMaterial = this.materials.splice(index, 1)[0];
                
                // Guardar en localStorage
                this.saveToStorage();
                
                this.addOperation({
                    type: 'material:deleted',
                    materialName: deletedMaterial.nombre,
                    userName: user.nombre,
                    userRole: user.tipoUsuario,
                    userId: user.id,
                    details: `${user.nombre} (${user.tipoUsuario}) eliminó "${deletedMaterial.nombre}"`
                });
                
                this.notifyListeners('material:deleted', { 
                    material: deletedMaterial,
                    user: user,
                    total: this.materials.length
                });
                
                resolve({
                    status: "success",
                    message: `Material "${deletedMaterial.nombre}" eliminado correctamente`,
                    material: deletedMaterial
                });
            } catch (error) {
                reject({
                    status: "error",
                    message: "Error eliminando material: " + error.message
                });
            }
        });
    }

    async searchMaterials(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = this.materials.filter(material => 
                    material.nombre.toLowerCase().includes(query.toLowerCase()) ||
                    material.categoria.toLowerCase().includes(query.toLowerCase()) ||
                    material.proveedor.toLowerCase().includes(query.toLowerCase())
                );
                
                this.notifyListeners('materials:searched', { 
                    query,
                    results,
                    count: results.length
                });
                
                resolve(results);
            }, 300);
        });
    }

    async processFiles(files, user = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!user) {
                    reject({
                        status: "error",
                        message: "Debe estar autenticado para subir archivos"
                    });
                    return;
                }

                this.notifyListeners('files:processing', { 
                    message: `Procesando ${files.length} archivo(s)...`,
                    files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
                });
                
                setTimeout(async () => {
                    try {
                        let processedCount = 0;
                        let updatedCount = 0;
                        let errors = [];
                        
                        for (let file of files) {
                            try {
                                if (file.name.endsWith('.csv')) {
                                    const text = await this.readFileAsText(file);
                                    const lines = text.split('\n').filter(line => line.trim());
                                    
                                    for (let i = 1; i < lines.length; i++) {
                                        const values = lines[i].split(',').map(v => v.trim());
                                        if (values.length >= 1 && values[0]) {
                                            const material = {
                                                nombre: values[0],
                                                precio: values[1] ? parseFloat(values[1]) : 0,
                                                categoria: values[2] || 'General',
                                                stock: values[3] ? parseInt(values[3]) : 0,
                                                proveedor: values[4] || 'Sin especificar'
                                            };
                                            
                                            const existingIndex = this.materials.findIndex(m => 
                                                m.nombre.toLowerCase() === material.nombre.toLowerCase()
                                            );
                                            
                                            if (existingIndex >= 0) {
                                                const updates = {};
                                                if (material.precio > 0) updates.precio = material.precio;
                                                if (material.categoria !== 'General') updates.categoria = material.categoria;
                                                if (material.stock > 0) updates.stock = material.stock;
                                                if (material.proveedor !== 'Sin especificar') updates.proveedor = material.proveedor;
                                                
                                                if (Object.keys(updates).length > 0) {
                                                    await this.updateMaterial(this.materials[existingIndex].id, updates, user);
                                                    updatedCount++;
                                                }
                                            } else {
                                                await this.addMaterial(material, user);
                                                processedCount++;
                                            }
                                        }
                                    }
                                } else {
                                    errors.push({ file: file.name, error: 'Formato no válido. Solo se aceptan archivos CSV.' });
                                }
                            } catch (fileError) {
                                errors.push({ file: file.name, error: fileError.message });
                            }
                        }
                        
                        this.addOperation({
                            type: 'files:processed',
                            userName: user.nombre,
                            userRole: user.tipoUsuario,
                            userId: user.id,
                            details: `${user.nombre} (${user.tipoUsuario}) procesó ${files.length} archivo(s): ${processedCount} nuevos, ${updatedCount} actualizados`,
                            processedCount,
                            updatedCount,
                            errors: errors.length
                        });
                        
                        resolve({
                            status: "success",
                            message: `Procesados ${processedCount} materiales nuevos y ${updatedCount} actualizados`,
                            processedCount,
                            updatedCount,
                            errors,
                            totalMaterials: this.materials.length
                        });
                    } catch (error) {
                        reject({
                            status: "error",
                            message: "Error procesando archivos: " + error.message
                        });
                    }
                }, 2000);
                
            } catch (error) {
                reject({
                    status: "error",
                    message: "Error iniciando procesamiento: " + error.message
                });
            }
        });
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsText(file);
        });
    }

    downloadDatabase(format = 'json') {
        const materialsForExport = this.materials.map(material => ({
            nombre: material.nombre,
            precio: material.precio,
            categoria: material.categoria,
            stock: material.stock,
            proveedor: material.proveedor || '',
            contacto_proveedor: '',
            telefono_proveedor: '',
            email_proveedor: '',
            tiempo_entrega: '',
            notas: ''
        }));

        let content, filename, mimeType;
        
        if (format === 'json') {
            content = JSON.stringify(materialsForExport, null, 2);
            filename = `base_datos_materiales_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else if (format === 'csv') {
            // CSV con headers
            const headers = Object.keys(materialsForExport[0]).join(',');
            const rows = materialsForExport.map(material => 
                Object.values(material).map(value => `"${value}"`).join(',')
            );
            content = headers + '\n' + rows.join('\n');
            filename = `base_datos_materiales_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        }

        // Crear blob y descargar
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Registrar operación
        this.addOperation({
            type: 'database:downloaded',
            details: `Base de datos descargada en formato ${format.toUpperCase()}`,
            format: format,
            materialsCount: this.materials.length
        });

        return {
            status: "success",
            message: `Base de datos descargada correctamente en formato ${format.toUpperCase()}`,
            filename
        };
    }

    getOperationHistory() {
        return this.operationHistory;
    }

    getStatistics() {
        const categorias = {};
        const proveedores = {};
        let totalValue = 0;
        
        this.materials.forEach(material => {
            categorias[material.categoria] = (categorias[material.categoria] || 0) + 1;
            proveedores[material.proveedor] = (proveedores[material.proveedor] || 0) + 1;
            totalValue += material.precio * material.stock;
        });
        
        return {
            totalMaterials: this.materials.length,
            totalValue,
            categorias: Object.entries(categorias).map(([name, count]) => ({ name, count })),
            proveedores: Object.entries(proveedores).map(([name, count]) => ({ name, count })),
            lowStock: this.materials.filter(m => m.stock < 50).length
        };
    }

    async addUser(userData) {
        return new Promise((resolve, reject) => {
            try {
                // Validar que no exista el mismo número de documento
                const existingUser = this.users.find(u => u.numeroDocumento === userData.numeroDocumento);
                if (existingUser) {
                    resolve({
                        status: 'error',
                        message: 'Ya existe un usuario con este número de documento'
                    });
                    return;
                }

                // Generar ID único para el usuario
                const newUser = {
                    id: Date.now(),
                    ...userData,
                    createdAt: new Date().toISOString()
                };

                // Agregar usuario
                this.users.push(newUser);
                
                // Guardar en localStorage
                this.saveToStorage();
                
                // Registrar operación
                this.addOperation({
                    type: 'user:registered',
                    userName: newUser.nombre,
                    userRole: newUser.tipoUsuario,
                    userId: newUser.id,
                    details: `${newUser.nombre} (${newUser.tipoUsuario}) se ha registrado en el sistema`
                });

                this.notifyListeners('user:registered', newUser);

                resolve({
                    status: 'ok',
                    message: 'Usuario registrado correctamente',
                    user: newUser
                });

            } catch (error) {
                reject({
                    status: 'error',
                    message: 'Error registrando usuario: ' + error.message
                });
            }
        });
    }

    async authenticateUser(documento, contraseña) {
        return new Promise((resolve, reject) => {
            try {
                // Buscar usuario por número de documento
                const user = this.users.find(u => u.numeroDocumento === documento);
                
                if (!user) {
                    resolve({
                        status: 'error',
                        message: 'Usuario no encontrado. Verifique el número de documento.'
                    });
                    return;
                }

                // Verificar contraseña
                if (user.contraseña !== contraseña) {
                    resolve({
                        status: 'error',
                        message: 'Contraseña incorrecta. Intente nuevamente.'
                    });
                    return;
                }

                // Registrar operación
                this.addOperation({
                    type: 'user:authenticated',
                    userName: user.nombre,
                    userRole: user.tipoUsuario,
                    userId: user.id,
                    details: `${user.nombre} (${user.tipoUsuario}) ha iniciado sesión`
                });

                this.notifyListeners('user:authenticated', user);

                resolve({
                    status: 'ok',
                    message: 'Sesión iniciada correctamente',
                    user: {
                        id: user.id,
                        nombre: user.nombre,
                        tipoUsuario: user.tipoUsuario,
                        numeroDocumento: user.numeroDocumento,
                        tipoDocumento: user.tipoDocumento
                    }
                });

            } catch (error) {
                reject({
                    status: 'error',
                    message: 'Error iniciando sesión: ' + error.message
                });
            }
        });
    }
};

const API = {
    database: new DatabaseManager(),
    
    // Métodos de Materiales
    obtenerMateriales: () => {
        return API.database.materials;
    },
    
    agregarMaterial: async (material, user) => {
        return await API.database.addMaterial(material, user);
    },
    
    actualizarMaterial: async (id, updates, user) => {
        return await API.database.updateMaterial(id, updates, user);
    },
    
    eliminarMaterial: async (id, user) => {
        return await API.database.deleteMaterial(id, user);
    },
    
    buscarMateriales: async (query) => {
        const materials = API.database.materials;
        const lowerQuery = query.toLowerCase();
        
        return materials.filter(material => 
            material.nombre.toLowerCase().includes(lowerQuery) ||
            material.categoria.toLowerCase().includes(lowerQuery) ||
            material.proveedor.toLowerCase().includes(lowerQuery)
        );
    },
    
    // Métodos de Usuarios
    guardarUsuario: async (userData) => {
        return await API.database.addUser(userData);
    },
    
    autenticarUsuario: async (documento, contraseña) => {
        return await API.database.authenticateUser(documento, contraseña);
    },
    
    obtenerUsuariosRegistrados: () => {
        return API.database.users;
    },
    
    // Métodos de Operaciones
    obtenerHistorial: () => {
        return API.database.getOperationHistory();
    },
    
    // Métodos de Archivos
    procesarArchivos: async (files, user) => {
        return await API.database.processFiles(files, user);
    },
    
    // Métodos de Base de Datos
    descargarBaseDatos: (format) => {
        return API.database.downloadDatabase(format);
    },
    
    limpiarDatos: () => {
        API.database.clearStorage();
        API.database.materials = [];
        API.database.users = [];
        API.database.operationHistory = [];
    },
    
    // Métodos de Eventos
    suscribirEventos: (callback) => {
        API.database.addListener(callback);
    },
    
    // Métodos de Bases de Datos Externas
    loadExternalDatabases: async () => {
        return await API.database.loadExternalDatabases();
    },
    
    obtenerEstadisticas: () => {
        return API.database.getStatistics();
    },
    
    buscarMateriales: async (query) => {
        return await API.database.searchMaterials(query);
    },
    
    agregarMaterial: async (material, user) => {
        return await API.database.addMaterial(material, user);
    },
    
    actualizarMaterial: async (id, updates, user) => {
        return await API.database.updateMaterial(id, updates, user);
    },
    
    eliminarMaterial: async (id, user) => {
        return await API.database.deleteMaterial(id, user);
    },
    
    procesarArchivos: async (files, user) => {
        return await API.database.processFiles(files, user);
    },
    
    descargarBaseDatos: async (format = 'json') => {
        return await API.database.downloadDatabase(format);
    },
    
    guardarUsuario: async (userData) => {
        try {
            const existingUser = API.database.users.find(u => u.numeroDocumento === userData.numeroDocumento);
            
            if (existingUser) {
                return { 
                    status: "error", 
                    message: "Ya existe un usuario con este número de documento" 
                };
            }
            
            const newUser = {
                ...userData,
                id: Date.now(),
                createdAt: new Date().toISOString(),
                isActive: true
            };
            
            API.database.users.push(newUser);
            
            // Guardar en localStorage
            API.database.saveToStorage();
            
            API.database.addOperation({
                type: 'user:registered',
                userName: newUser.nombre,
                details: `Usuario "${newUser.nombre}" registrado como ${newUser.tipoUsuario}`
            });
            
            API.database.notifyListeners('user:registered', { user: newUser });
            
            return { 
                status: "ok", 
                message: "Usuario guardado correctamente",
                user: newUser
            };
        } catch (error) {
            return { 
                status: "error", 
                message: "Error guardando usuario: " + error.message 
            };
        }
    },
    
    autenticarUsuario: async (documento, contraseña) => {
        const user = API.database.users.find(u => 
            u.numeroDocumento === documento && u.contraseña === contraseña
        );
        
        if (user) {
            API.database.addOperation({
                type: 'user:authenticated',
                userName: user.nombre,
                details: `Usuario "${user.nombre}" inició sesión`
            });
            
            return { 
                status: "ok", 
                message: "Autenticación exitosa",
                user: { ...user, contraseña: undefined }
            };
        } else {
            return { 
                status: "error", 
                message: "Documento o contraseña incorrectos" 
            };
        }
    },
    
    obtenerEstadisticas: async () => {
        return API.database.getStatistics();
    },
    
    obtenerHistorialOperaciones: async () => {
        return API.database.getOperationHistory();
    },
    
    suscribirEventos: (callback) => {
        API.database.addListener(callback);
    },
    
    // Métodos de gestión de datos persistentes
    limpiarDatos: () => {
        API.database.clearStorage();
        API.database.users = [];
        API.database.materials = [];
        API.database.operationHistory = [];
        console.log('Todos los datos han sido eliminados');
    },
    
    obtenerUsuariosRegistrados: () => {
        return API.database.users;
    },
    
    exportarDatos: () => {
        return {
            usuarios: API.database.users,
            materiales: API.database.materials,
            historial: API.database.operationHistory,
            exportDate: new Date().toISOString()
        };
    }
};
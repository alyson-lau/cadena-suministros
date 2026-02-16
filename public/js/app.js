angular.module('cadenaSuministrosApp', ['ngRoute'])
    .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/inicio.html',
                controller: 'InicioController'
            })
            .when('/acceso', {
                templateUrl: 'views/acceso.html',
                controller: 'AccesoController'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginController'
            })
            .when('/materiales', {
                templateUrl: 'views/materiales.html',
                controller: 'MaterialesController'
            })
            .when('/estadisticas', {
                templateUrl: 'views/estadisticas.html',
                controller: 'EstadisticasController'
            })
            .otherwise({
                redirectTo: '/'
            });
        
        $httpProvider.interceptors.push('AuthInterceptor');
    }])
    .factory('AuthInterceptor', ['$rootScope', '$q', function($rootScope, $q) {
        return {
            request: function(config) {
                var token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            responseError: function(rejection) {
                if (rejection.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '#!/login';
                }
                return $q.reject(rejection);
            }
        };
    }])
    .service('AuthService', ['$http', '$window', function($http, $window) {
        this.login = function(credentials) {
            return $http.post('/api/auth/login', credentials);
        };
        
        this.register = function(userData) {
            return $http.post('/api/auth/register', userData);
        };
        
        this.recover = function(numeroDocumento) {
            return $http.post('/api/auth/recover', { numeroDocumento });
        };
        
        this.logout = function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            $window.location.href = '#!/login';
        };
        
        this.isLoggedIn = function() {
            return !!localStorage.getItem('token');
        };
        
        this.getUser = function() {
            var user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        };
        
        this.saveUser = function(user) {
            localStorage.setItem('user', JSON.stringify(user));
        };
        
        this.saveToken = function(token) {
            localStorage.setItem('token', token);
        };
    }])
    .service('MaterialService', ['$http', function($http) {
        this.getMateriales = function(params) {
            return $http.get('/api/materiales', { params: params });
        };
        
        this.getMaterial = function(id) {
            return $http.get('/api/materiales/' + id);
        };
        
        this.createMaterial = function(material) {
            return $http.post('/api/materiales', material);
        };
        
        this.updateMaterial = function(id, material) {
            return $http.put('/api/materiales/' + id, material);
        };
        
        this.deleteMaterial = function(id) {
            return $http.delete('/api/materiales/' + id);
        };
        
        this.getCategorias = function() {
            return $http.get('/api/materiales/categorias');
        };
        
        this.getProveedores = function() {
            return $http.get('/api/materiales/proveedores');
        };
        
        this.getEstadisticas = function() {
            return $http.get('/api/materiales/estadisticas');
        };
        
        this.uploadMateriales = function(materiales) {
            return $http.post('/api/materiales/bulk', materiales);
        };
    }])
    .controller('MainController', ['$scope', 'AuthService', function($scope, AuthService) {
        $scope.currentUser = AuthService.getUser();
        $scope.isLoggedIn = function() {
            return AuthService.isLoggedIn();
        };
        
        $scope.getRoleName = function() {
            var roles = {
                'lider': 'Líder de Compras',
                'analista': 'Analista',
                'desarrollador': 'Desarrollador'
            };
            return $scope.currentUser ? roles[$scope.currentUser.tipoUsuario] : '';
        };
        
        $scope.logout = function() {
            AuthService.logout();
        };
        
        $scope.$on('$routeChangeSuccess', function() {
            $scope.currentUser = AuthService.getUser();
            M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {
                coverTrigger: false,
                constrainWidth: false
            });
        });
    }])
    .controller('InicioController', ['$scope', function($scope) {
        $scope.titulo = 'Inicio';
    }])
    .controller('AccesoController', ['$scope', 'AuthService', function($scope, AuthService) {
        $scope.usuario = {};
        $scope.modoLogin = true;
        $scope.error = '';
        
        $scope.registrar = function() {
            $scope.error = '';
            if ($scope.usuario.contraseña !== $scope.usuario.confirmarContraseña) {
                $scope.error = 'Las contraseñas no coinciden';
                return;
            }
            
            AuthService.register($scope.usuario)
                .then(function(response) {
                    M.toast({ html: 'Usuario registrado correctamente', classes: 'green' });
                    $scope.usuario = {};
                    $scope.modoLogin = true;
                })
                .catch(function(error) {
                    $scope.error = error.data.message || 'Error al registrar';
                });
        };
        
        $scope.login = function() {
            $scope.error = '';
            AuthService.login($scope.usuario)
                .then(function(response) {
                    AuthService.saveToken(response.data.token);
                    AuthService.saveUser(response.data.usuario);
                    window.location.href = '#!/materiales';
                })
                .catch(function(error) {
                    $scope.error = error.data.message || 'Error al iniciar sesión';
                });
        };
    }])
    .controller('LoginController', ['$scope', 'AuthService', function($scope, AuthService) {
        $scope.usuario = {};
        $scope.error = '';
        
        $scope.login = function() {
            $scope.error = '';
            AuthService.login($scope.usuario)
                .then(function(response) {
                    AuthService.saveToken(response.data.token);
                    AuthService.saveUser(response.data.usuario);
                    window.location.href = '#!/materiales';
                })
                .catch(function(error) {
                    $scope.error = error.data.message || 'Error al iniciar sesión';
                });
        };
    }])
    .controller('MaterialesController', ['$scope', 'MaterialService', 'AuthService', function($scope, MaterialService, AuthService) {
        $scope.materiales = [];
        $scope.categorias = [];
        $scope.proveedores = [];
        $scope.loading = true;
        $scope.error = '';
        $scope.searchQuery = '';
        $scope.isLoggedIn = AuthService.isLoggedIn();
        
        $scope.loadMateriales = function() {
            $scope.loading = true;
            MaterialService.getMateriales({ search: $scope.searchQuery })
                .then(function(response) {
                    $scope.materiales = response.data;
                    $scope.loading = false;
                })
                .catch(function(error) {
                    $scope.error = 'Error al cargar materiales';
                    $scope.loading = false;
                });
        };
        
        $scope.loadCategorias = function() {
            MaterialService.getCategorias()
                .then(function(response) {
                    $scope.categorias = response.data;
                });
        };
        
        $scope.loadProveedores = function() {
            MaterialService.getProveedores()
                .then(function(response) {
                    $scope.proveedores = response.data;
                });
        };
        
        $scope.eliminarMaterial = function(id) {
            if (confirm('¿Está seguro de eliminar este material?')) {
                MaterialService.deleteMaterial(id)
                    .then(function() {
                        M.toast({ html: 'Material eliminado', classes: 'green' });
                        $scope.loadMateriales();
                    })
                    .catch(function(error) {
                        M.toast({ html: 'Error al eliminar', classes: 'red' });
                    });
            }
        };
        
        $scope.search = function() {
            $scope.loadMateriales();
        };
        
        $scope.loadMateriales();
        $scope.loadCategorias();
        $scope.loadProveedores();
        
        // Inicializar modal
        document.addEventListener('DOMContentLoaded', function() {
            var modals = document.querySelectorAll('.modal');
            M.Modal.init(modals);
        });
    }])
    .controller('EstadisticasController', ['$scope', 'MaterialService', function($scope, MaterialService) {
        $scope.estadisticas = null;
        $scope.loading = true;
        
        $scope.loadEstadisticas = function() {
            $scope.loading = true;
            MaterialService.getEstadisticas()
                .then(function(response) {
                    $scope.estadisticas = response.data;
                    $scope.loading = false;
                })
                .catch(function(error) {
                    $scope.error = 'Error al cargar estadísticas';
                    $scope.loading = false;
                });
        };
        
        $scope.loadEstadisticas();
    }]);

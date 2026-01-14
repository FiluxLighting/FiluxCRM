# 📦 Telematel Standalone - Arquitectura Modular

## 🏗️ Estructura del Proyecto

```
standalone/
├── src/
│   ├── Controller/
│   │   └── ApiController.php          # Controlador principal de API
│   └── Service/
│       ├── BaseApiService.php         # Servicio base con autenticación
│       ├── OrderService.php           # Gestión de pedidos
│       ├── CustomerService.php        # Gestión de clientes
│       ├── ProductService.php         # Gestión de productos
│       └── StatsService.php           # Cálculo de estadísticas
├── public/
│   ├── index.php                      # Entry point con DI Container
│   └── js/
│       ├── services/
│       │   └── api.js                 # Cliente API fetch wrapper
│       ├── components/
│       │   ├── FilterPanel.js         # Panel de filtros
│       │   ├── OrdersTable.js         # Tabla de pedidos
│       │   ├── CustomersTable.js      # Tabla de clientes
│       │   └── StatsCards.js          # Tarjetas de estadísticas
│       └── utils/
│           └── formatters.js          # Utilidades de formato
└── templates/
    ├── app.html                       # Template original (legacy)
    └── app_modular.html               # Template modularizado (nuevo)
```

## 🎯 Principios de Diseño

### **Backend (PHP)**

#### **1. Separación de Responsabilidades**
- **BaseApiService**: Maneja autenticación y comunicación HTTP
- **Services específicos**: Cada entidad (Orders, Customers, Products) tiene su propio servicio
- **Controller**: Solo coordina requests/responses, delega lógica a servicios

#### **2. Inyección de Dependencias**
```php
// index.php - Container configuration
$container->set(\App\Service\OrderService::class, function() {
    return new \App\Service\OrderService();
});

// ApiController constructor
public function __construct(
    OrderService $orderService,
    CustomerService $customerService,
    ProductService $productService,
    StatsService $statsService
) { ... }
```

#### **3. Herencia y Reutilización**
Todos los servicios heredan de `BaseApiService`:
```php
class OrderService extends BaseApiService {
    // Acceso a métodos protegidos:
    // - getToken()
    // - apiCall()
    // - logDebug()
}
```

### **Frontend (JavaScript/Vue 3)**

#### **1. Componentes Modulares**
Cada componente Vue es independiente y reutilizable:

- **FilterPanel**: Maneja filtros con v-model bidireccional
- **OrdersTable / CustomersTable**: Tablas especializadas con props
- **StatsCards**: Tarjetas de estadísticas con computed values

#### **2. Servicios Centralizados**
```javascript
// api.js - Single source of truth para API calls
ApiService.getOrders(filters)
ApiService.getCustomers(filters)
ApiService.getProduct(reference)
```

#### **3. Utilidades Compartidas**
```javascript
// formatters.js - Funciones puras de formato
Formatters.formatDate(dateString)
Formatters.formatCurrency(value)
Formatters.formatNumber(value)
```

#### **4. Provider/Inject Pattern**
```javascript
// app_modular.html
provide() {
    return {
        formatDate: Formatters.formatDate,
        formatCurrency: Formatters.formatCurrency
    };
}

// OrdersTable.js
inject: ['formatDate', 'formatCurrency']
```

## 🔄 Flujo de Datos

### **Request Flow**
```
Browser
  ↓
  ├─ fetchData() en app_modular.html
  ↓
  ├─ ApiService.getOrders() en api.js
  ↓
  ├─ GET /api/orders en index.php
  ↓
  ├─ ApiController::getOrders()
  ↓
  ├─ OrderService::getOrders()
  ↓
  ├─ BaseApiService::apiCall()
  ↓
  └─ Telematel API
```

### **Response Flow**
```
Telematel API
  ↓
  ├─ BaseApiService devuelve JSON
  ↓
  ├─ OrderService procesa si es necesario
  ↓
  ├─ ApiController retorna Response
  ↓
  ├─ ApiService.request() parsea JSON
  ↓
  ├─ fetchData() actualiza ref()
  ↓
  └─ Vue reactivity actualiza componentes
```

## 📝 Uso de los Módulos

### **Backend - Crear un nuevo servicio**

```php
<?php
namespace App\Service;

class InvoiceService extends BaseApiService
{
    public function getInvoices(int $limit = 100, array $filters = []): array
    {
        $queryParams = [
            'entries' => $limit,
            'page' => 1,
            'company_id' => 1
        ];
        
        // Merge filters
        $queryParams = array_merge($queryParams, $filters);
        
        return $this->apiCall('apitmt-invoices/List', $queryParams);
    }
}
```

Registrar en `index.php`:
```php
$container->set(\App\Service\InvoiceService::class, function() {
    return new \App\Service\InvoiceService();
});
```

### **Frontend - Crear un nuevo componente**

```javascript
// components/InvoicesTable.js
const InvoicesTable = {
    name: 'InvoicesTable',
    props: {
        invoices: {
            type: Array,
            required: true
        }
    },
    inject: ['formatDate', 'formatCurrency'],
    template: `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr>
                        <th>Nº Factura</th>
                        <th>Fecha</th>
                        <th>Importe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="invoice in invoices" :key="invoice.id">
                        <td>{{ invoice.number }}</td>
                        <td>{{ formatDate(invoice.date) }}</td>
                        <td>{{ formatCurrency(invoice.amount) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
};

export default InvoicesTable;
```

### **Añadir un método al ApiService**

```javascript
// services/api.js
async getInvoices(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`./api/invoices?${queryString}`);
}
```

## ✅ Ventajas de esta Arquitectura

### **Backend**
- ✅ **Testeable**: Cada servicio puede testearse independientemente
- ✅ **Mantenible**: Cambios en Orders no afectan a Customers
- ✅ **Escalable**: Fácil añadir nuevos servicios (Invoices, Quotes, etc.)
- ✅ **DRY**: Autenticación y HTTP calls centralizados en BaseApiService
- ✅ **Type Safety**: PHP 8.1+ type hints en todos los métodos

### **Frontend**
- ✅ **Reutilizable**: Componentes pueden usarse en diferentes vistas
- ✅ **Reactivo**: Vue 3 Composition API con refs y watchers
- ✅ **Mantenible**: Lógica separada en services, components y utils
- ✅ **Performance**: Componentes solo se re-renderizan cuando cambian sus props
- ✅ **ES Modules**: Import/export estándar sin bundler

## 🚀 Migración desde el código anterior

Para usar la nueva arquitectura modular:

1. **Actualizar el template**:
   Cambiar `app.html` por `app_modular.html` en `index.php`:
   ```php
   $content = file_get_contents(__DIR__ . '/../templates/app_modular.html');
   ```

2. **Los servicios son compatibles**: 
   - Mismos endpoints
   - Mismos parámetros
   - Misma estructura de respuesta

3. **Sin cambios en la API externa**:
   La API de Telematel se consume igual, solo cambió la organización interna

## 📚 Próximas Mejoras

- [ ] Tests unitarios para servicios PHP (PHPUnit)
- [ ] Tests de componentes Vue (Vitest)
- [ ] Cache de respuestas API (Redis/Memcached)
- [ ] Paginación en frontend
- [ ] Búsqueda/filtrado avanzado
- [ ] Export a CSV/Excel
- [ ] Dashboard con gráficas (Chart.js)

# API de Pedidos (Sales Orders)

## Información General

La API de Telematel proporciona endpoints para gestionar pedidos de venta (sales orders). Los pedidos pueden ser creados desde la tienda online y consultados mediante diferentes filtros.

## Endpoints Disponibles

### 1. POST - Crear Pedido

**Endpoint:** `POST /apitmt-sales-orders`

**Descripción:** Crea un nuevo pedido de venta. Este endpoint se utiliza cuando se realiza un pedido desde la tienda online.

**Estructura del Body (JSON):**

```json
{
  "customer_id": 12345,
  "customer_contact_id": 1,
  "reference": "",
  "lines": [
    {
      "product_id": "0007001234",
      "ordered_quantity": 2,
      "product_reference": "",
      "user_char5": "",
      "user_char6": "",
      "product_code_corporative": "",
      "purchase_packing_unit_quantity": 1,
      "description": "Producto ejemplo XYZ",
      "discount_1": 10.0,
      "discount_2": 0,
      "discount_3": 0,
      "delivery_date": "2025-12-25",
      "line_number": 0,
      "price": 49.99,
      "has_tax": true,
      "line_type": ""
    }
  ],
  "is_locked": false,
  "user_char1": "",
  "user_char2": "",
  "user_char3": "",
  "user_char4": "",
  "vat_number": "B12345678",
  "delivery_terms": "",
  "branch_id": 0,
  "company_id": 1,
  "payment_method_id": 3,
  "country_id": "ES",
  "shipping_country_id": "ES",
  "origin_id": "",
  "province_id": 28,
  "shipping_province_id": 8,
  "carrier_id": 5,
  "street_name": "Calle Principal",
  "shipping_street_name": "Avenida Secundaria",
  "postal_code": 28001,
  "shipping_postal_code": 8001,
  "prompt_payment_discount": 0,
  "email": "cliente@ejemplo.com",
  "packaging_cost": 0,
  "fax": "",
  "date": "2025-12-19",
  "street_number": "123",
  "shipping_street_number": "45",
  "notes": "",
  "contact_person": "Juan Pérez García",
  "city": "Madrid",
  "shipping_city": "Barcelona",
  "shipping_cost": 5.50,
  "business_name": "Empresa Ejemplo SL",
  "shipping_business_name": "Empresa Ejemplo SL",
  "reference_2": "Mensaje del pedido o comentarios",
  "financial_surcharge_rate": 0,
  "shipping_phone": "666123456",
  "phone": "666123456",
  "auxiliar_reference": "Mensaje del pedido o comentarios"
}
```

**Campos Requeridos:**
- `customer_id`: ID del cliente
- `company_id`: ID de la empresa
- `lines`: Array con al menos una línea de pedido
  - `product_id`: Referencia del producto
  - `ordered_quantity`: Cantidad pedida
  - `price`: Precio unitario
  - `description`: Descripción del producto

**Response:**
```json
{
  "sale_order_id": 123456,
  "success": true,
  "message": "Order created successfully"
}
```

---

### 2. GET - Listar Pedidos

**Endpoint:** `GET /apitmt-sales-orders/List`

**Versiones disponibles:** v2025.4

**Descripción:** Obtiene pedidos de venta según parámetros de filtrado. Todos los pedidos creados con POST estarán disponibles aquí.

**Parámetros de Query (todos opcionales):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `branch_id` | number | Código Delegación | `1` |
| `company_id` | number | Código Empresa | `1` |
| `customer_id` | number | Código Cliente | `12345` |
| `entries` | number | Número de entradas por página | `100` |
| `from_date` | date | Fecha desde (dd/mm/aaaa) | `19/12/2025` |
| `to_date` | date | Fecha hasta (dd/mm/aaaa) | `25/12/2025` |
| `from_sale_order_id` | number | ID pedido desde | `1000` |
| `to_sale_order_id` | number | ID pedido hasta | `2000` |
| `is_closed` | boolean | Pedido cerrado | `false` |
| `page` | number | Número de página | `1` |
| `sales_representative_id` | number | Código Agente Comercial | `5` |
| `sort` | text | Criterios de ordenación | `date=desc` |

**Ordenación (parámetro `sort`):**

El parámetro `sort` permite múltiples criterios separados por comas:
- Por defecto: ASCENDENTE
- Para DESCENDENTE: añadir `=desc` al criterio

Ejemplos:
- `sort=date` → ordena por fecha ascendente
- `sort=date=desc` → ordena por fecha descendente
- `sort=date=desc,user_id` → ordena por fecha DESC y luego por user_id ASC

**Response:**
```json
{
  "page_entries": [
    {
      "sale_order_id": 123456,
      "customer_id": 12345,
      "reference": "TEST_20251219",
      "date": "2025-12-19",
      "business_name": "Empresa Ejemplo SL",
      "email": "cliente@ejemplo.com",
      "total": 94.99,
      "lines": [
        {
          "product_id": "0007001234",
          "description": "Producto ejemplo XYZ",
          "ordered_quantity": 2,
          "price": 49.99,
          "discount_1": 10.0
        }
      ]
    }
  ],
  "total_entries": 150,
  "total_pages": 2,
  "current_page": 1
}
```

**Tablas Relacionadas:**
- `sales_order`
- `sales_order_line`
- `sales_order_tax`

---

### 3. GET - Obtener Pedido por ID

**Endpoint:** `GET /apitmt-sales-orders/Get`

**Parámetros:**
- `sale_order_id`: ID del pedido

**Response:** Devuelve los detalles completos de un pedido específico.

---

## Ejemplos de Uso

### Ejemplo 1: Listar todos los pedidos de hoy

```bash
curl -X GET "https://api.telematel.com/apitmt-sales-orders/List?from_date=19/12/2025&to_date=19/12/2025&entries=100&sort=date=desc"
```

### Ejemplo 2: Listar pedidos de un cliente específico

```bash
curl -X GET "https://api.telematel.com/apitmt-sales-orders/List?customer_id=12345&entries=50"
```

### Ejemplo 3: Listar pedidos abiertos (no cerrados)

```bash
curl -X GET "https://api.telematel.com/apitmt-sales-orders/List?is_closed=false&entries=100"
```

### Ejemplo 4: Crear un pedido nuevo

```bash
curl -X POST "https://api.telematel.com/apitmt-sales-orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 12345,
    "company_id": 1,
    "reference": "ORDEN_001",
    "lines": [
      {
        "product_id": "0007001234",
        "ordered_quantity": 2,
        "description": "Producto XYZ",
        "price": 49.99,
        "discount_1": 10.0,
        "has_tax": true
      }
    ],
    "date": "2025-12-19",
    "email": "cliente@ejemplo.com",
    "business_name": "Empresa Ejemplo SL"
  }'
```

---

## Flujo de Trabajo

### Proceso de Pedido desde Tienda Online

1. **Cliente realiza pedido** en la tienda online
2. **Sistema envía POST** a `/apitmt-sales-orders` con los datos del pedido
3. **API crea el pedido** y devuelve el `sale_order_id`
4. **Pedido está disponible** inmediatamente en `/apitmt-sales-orders/List`
5. **Se puede consultar** usando filtros (fecha, cliente, etc.)

### Verificación de Pedidos

Para verificar que un pedido fue creado correctamente:

1. Anotar el `sale_order_id` del response del POST
2. Buscar usando filtros:
   - Por fecha: `from_date` y `to_date`
   - Por cliente: `customer_id`
   - Por referencia única
3. Obtener detalles completos con GET usando el `sale_order_id`

---

## Scripts PHP de Prueba

### Listar Pedidos
```bash
php public/test_list_orders.php
```

### Crear y Verificar Pedido
```bash
php public/test_create_and_list_order.php
```

---

## Notas Importantes

1. **Formato de fechas:** Siempre usar `dd/mm/aaaa` (ej: `19/12/2025`)
2. **Paginación:** Usar `entries` para controlar resultados por página
3. **Ordenación:** Por defecto ascendente, usar `=desc` para descendente
4. **Filtros combinables:** Se pueden usar múltiples filtros simultáneamente
5. **Disponibilidad inmediata:** Los pedidos creados con POST están disponibles inmediatamente en GET
6. **IDs únicos:** Cada pedido tiene un `sale_order_id` único generado por el sistema

---

## Integración con OrderService.php

El `OrderService` proporciona métodos PHP para interactuar con estos endpoints:

- `createOrder($orderData)` - Crea un nuevo pedido
- `listOrders($filters)` - Lista pedidos con filtros avanzados
- `getOrders($limit, $filters)` - Obtiene pedidos recientes
- `getOrderById($orderId)` - Obtiene un pedido específico
- `getOrderLines($orderId)` - Obtiene las líneas de un pedido

Ejemplo de uso:
```php
$orderService = new OrderService();

// Crear pedido
$newOrder = $orderService->createOrder([
    'customer_id' => 12345,
    'company_id' => 1,
    'lines' => [...]
]);

// Listar pedidos de hoy
$todayOrders = $orderService->listOrders([
    'from_date' => date('d/m/Y'),
    'to_date' => date('d/m/Y'),
    'sort' => 'date=desc'
]);
```

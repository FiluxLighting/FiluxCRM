# Telematel GO!Manage API Documentation

## 📄 Local Resources
*   **[Data Models & Fields (Excel)](./Telematel_Data_Models.xlsx)**
    *   This file contains the detailed relationship of tables and fields used in the API. It is the most useful resource for understanding the data structure (customers, products, orders, etc.).

## 🌐 Online Reference
*   **Documentation Portal**: [https://help.telematel.com/documentation/gomanage/v2025.4/](https://help.telematel.com/documentation/gomanage/v2025.4/)
*   Also available: [GraphQL Help](https://help.telematel.com/documentation/gomanage/v2025.4/help/graph_ql)

## 🗂 API Structure
The API is divided into the following sections. Note that the online portal uses a dynamic interface that is difficult to export completely, but these are the key services you will interact with:

### Core / Auth
*   **Seguridad / Login**: Endpoint for obtaining the Bearer Token.

### Sales (Ventas)
*   **Pedidos de venta**: `Apitmt-sales-orders`
*   **Facturas de venta**: `Apitmt-sales-invoices`
*   **Ofertas de venta**: `Apitmt-sales-offers`
*   **Albaranes de venta**: `Apitmt-sales-deliverynotes`

### Purchasing (Compras)
*   **Pedidos de compra**: `Apitmt-purchases-orders`
*   **Confirmaciones**: `Apitmt-purchases-ordersconfirmation` / `preconfirmorders`
*   **Entregas**: `Apitmt-purchases-deliverynotifications`

### Master Data (Maestros)
*   **Clientes**: `Apitmt-customers` (Customer Data)
*   **Artículos**: `Apitmt-products` (Product Info)
*   **Familias**: `Apitmt-product-families`
*   **Contactos**: `Apitmt-contacts`
*   **Direcciones**: `Apitmt-customeraddresses`

## ℹ️ Developer Note
Consulting the online portal is recommended for the exact HTTP methods (GET, POST) and URL parameters for each endpoint, as these are interactive. However, the **Excel file** provided above should cover 90% of your needs regarding "what fields are sent/received".

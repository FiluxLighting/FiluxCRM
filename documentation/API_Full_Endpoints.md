# Telematel API Endpoints (Comprehensive)

This document lists the available API endpoints for the Telematel GO!Manage system, based on the provided documentation.

## Services List

### Apitmt-bank-movements (Movimientos bancarios)
*   `DELETE` Delete
*   `GET` Get
*   `POST` Updatedata

### Apitmt-billsreceivable (Efectos de cobro)
*   `GET` Get
*   `GET` List

### Apitmt-carriermethods (Transportistas)
*   `GET` Get
*   `GET` List

### Apitmt-commercial-actions (Acciones comerciales)
*   `GET` Get
*   `GET` List

### Apitmt-contacts (Contactos de proveedores, clientes y clientes potenciales)
*   `GET` Get
*   `GET` List
*   `GET` Pending
*   `POST` Updatedata
*   `PUT` Updatedata

### Apitmt-customeraddresses (Direcciones de envío de clientes)
*   `GET` Get
*   `GET` List
*   `GET` Pending
*   `POST` Updatedata
*   `PUT` Updatedata

### Apitmt-customers (Datos de clientes)
*   `GET` Get
*   `GET` List
*   `GET` Pending
*   `GET` Risk
*   `POST` Modifyrisk
*   `POST` Updatedata

### Apitmt-documents (Ficheros adjuntos / gestión documental)
*   `GET` Download
*   `GET` Get
*   `GET` List
*   `POST` Create

### Apitmt-notice-draft (Borradores de avisos)
*   `DELETE` Delete
*   `GET` Get
*   `POST` Accept
*   `POST` Updatedata

### Apitmt-notices (Avisos)
*   `GET` Get
*   `POST` Changestate
*   `POST` Close
*   `POST` Modify

### Apitmt-paymentmethods (Formas de pago)
*   `GET` Get
*   `GET` List

### Apitmt-potentialcustomers (Clientes potenciales)
*   `GET` Get
*   `GET` List
*   `GET` Pending
*   `POST` Updatedata
*   `PUT` Updatedata

### Apitmt-product-families (Familias de artículos)
*   `GET` Get
*   `GET` List

### Apitmt-product-packingunits (Embalajes del artículo)
*   `GET` Get
*   `GET` List

### Apitmt-products (Información de artículos)
*   `GET` Altdescriptions
*   `GET` Get
*   `GET` List
*   `GET` Pending
*   `GET` Related
*   `GET` Salespricing (**Tarifas / Precios de Venta**)
*   `GET` Stock
*   `GET` Stockarray
*   `GET` Stockleft
*   `PUT` Salespricingarray

### Apitmt-purchases-deliverynotifications (Notificaciones de entrega de compras)
*   `POST` Updatedata

### Apitmt-purchases-invoicenotifications (Notificaciones de facturas de compra)
*   `GET` Get
*   `POST` Updatedata

### Apitmt-purchases-orders (Pedidos de compra)
*   `DELETE` Delete
*   `GET` Get
*   `POST` Modify
*   `POST` Updatedata

### Apitmt-purchases-ordersconfirmation (Confirmación de pedidos de compra)
*   `GET` Get
*   `POST` Updatedata

### Apitmt-purchases-preconfirmorders (Confirmación de pedidos de compra)
*   `POST` Updatedata

### Apitmt-sales-deliverynotes (Albaranes de venta)
*   `GET` Get
*   `GET` List
*   `GET` Listbyorder
*   `GET` Pdf
*   `GET` Related

### Apitmt-sales-invoices (Facturas de venta)
*   `GET` Get
*   `GET` List
*   `GET` Pdf
*   `GET` Related

### Apitmt-sales-offers (Ofertas de venta)
*   `DELETE` Delete
*   `GET` Extendedstatus
*   `GET` Get
*   `GET` List
*   `GET` Pdf
*   `GET` Related
*   `POST` Accept
*   `POST` Modify
*   `POST` Updatedata
*   `PUT` Shippingcost

### Apitmt-sales-orders (Pedidos de venta)
*   `GET` Extendedstatus
*   `GET` Extendedstatusdetail
*   `GET` Get
*   `GET` List
*   `GET` Listbyoffer
*   `GET` Pdf
*   `GET` Pdf Invoice
*   `GET` Related
*   `POST` Updatedata
*   `PUT` Advancepayment
*   `PUT` Shippingcost

### Apitmt-timekeeping (Fichajes)
*   `DELETE` Delete
*   `GET` Get
*   `POST` Updatedata

### Apitmt-working-draft (Borradores de partes)
*   `DELETE` Delete
*   `GET` Get
*   `POST` Accept
*   `POST` Pdfpartefirmado
*   `POST` Updatedata

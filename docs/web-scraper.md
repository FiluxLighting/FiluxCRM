# Web Scraper - Configuración

## 🔍 Descripción

El Web Scraper busca automáticamente electricistas en múltiples ciudades de España y los añade a tu base de datos de contactos.

## 📋 Características

- ✅ Carga ciudades desde CSV
- ✅ Búsqueda automática en múltiples ciudades
- ✅ Revisión y selección de resultados
- ✅ Guardado masivo en base de datos
- ✅ Modo demo (sin API configurada)
- ✅ Integración con Google Places API
- ✅ Integración con Bing Search API (alternativa)

## 🚀 Uso Básico (Sin API)

El scraper funciona **inmediatamente** con datos simulados si no tienes API configurada:

1. Ve a **Herramientas de Datos** en el menú
2. Carga el archivo CSV con ciudades (puedes usar `/public/ciudades-espana.csv`)
3. Haz clic en "Iniciar Búsqueda"
4. Revisa los resultados (datos de ejemplo)
5. Selecciona y guarda los contactos

## ⚙️ Configuración con Google Places API (Recomendado)

Para obtener datos **reales** de electricistas:

### 1. Obtener API Key de Google Places

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Places API**
   - **Places API (New)**
4. Ve a **Credenciales** → **Crear credenciales** → **Clave de API**
5. Copia tu API key

### 2. Configurar Variables de Entorno

Añade en tu archivo `.env.local`:

```env
GOOGLE_PLACES_API_KEY=tu_api_key_aqui
```

### 3. Limitaciones y Costos

- **Consultas gratuitas**: 0$ por mes hasta cierto límite
- **Consulta de texto**: ~$0.032 por consulta
- **Detalles de lugar**: ~$0.017 por consulta
- **Estimación**: Para 50 ciudades = ~$2.45

💡 **Consejo**: Empieza con un límite bajo en tu cuenta de Google Cloud.

## 🔄 Alternativa: Bing Search API

Si prefieres usar Bing:

### 1. Obtener API Key de Bing

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Crea un recurso "Bing Search v7"
3. Copia tu API key

### 2. Configurar Variables de Entorno

```env
BING_SEARCH_API_KEY=tu_api_key_aqui
```

### 3. Costos

- **Gratis**: 1,000 transacciones/mes (nivel F0)
- **Pago**: $3 por 1,000 transacciones

## 📁 Formato del CSV de Ciudades

Tu archivo CSV debe tener estas columnas:

```csv
name,province,population
Madrid,Madrid,3223334
Barcelona,Barcelona,1620343
Valencia,Valencia,791413
```

**Columnas**:
- `name` (obligatorio): Nombre de la ciudad
- `province` (obligatorio): Nombre de la provincia
- `population` (opcional): Habitantes (filtra automáticamente > 10,000)

## 🎯 Ejemplo de Uso

```
1. Cargar CSV → ciudades-espana.csv (58 ciudades incluidas)
2. Iniciar búsqueda → Buscará en todas las ciudades
3. Revisar resultados → ~2-5 electricistas por ciudad
4. Seleccionar los que quieras → Checkbox individual o "Seleccionar todos"
5. Guardar → Se añaden a la lista "Scraping Web"
```

## 🛠️ Personalización

### Cambiar el término de búsqueda

Edita el archivo: `/src/app/api/search-electricians/route.ts`

```typescript
// Línea 36
const query = `electricistas ${city} ${province}`;

// Cambia a:
const query = `fontaneros ${city} ${province}`;  // Para fontaneros
const query = `carpinteros ${city} ${province}`; // Para carpinteros
```

### Cambiar la lista de destino

Edita el archivo: `/src/components/data-tools/WebScraperCard.tsx`

```typescript
// Línea 227
listName: "Scraping Web",

// Cambia a:
listName: "Electricistas 2026",
```

## 📊 Resultados Esperados

Con API configurada:
- **Google Places**: 1-10 resultados por ciudad con datos reales
- **Bing Search**: 1-10 resultados por ciudad (puede requerir procesamiento)
- **Sin API**: 2 resultados simulados por ciudad

## ⚠️ Limitaciones

1. **Rate Limits**: Las APIs tienen límites de consultas por segundo
2. **Costos**: Google Places cobra por consulta
3. **Calidad**: No todos los resultados tendrán email/teléfono completo
4. **Duplicados**: Revisa bien antes de guardar (el sistema detecta algunos)

## 🔐 Seguridad

- ✅ Las API keys están en variables de entorno (no en código)
- ✅ Las consultas se hacen desde el servidor (no expone keys al cliente)
- ✅ Los datos se guardan con el UID del usuario autenticado

## 📞 Soporte

Si tienes problemas:
1. Verifica que las API keys estén en `.env.local`
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Revisa la consola del navegador para errores
4. Revisa los logs de la terminal

## 🎨 Capturas

El scraper incluye:
- Barra de progreso en tiempo real
- Ciudad actual en búsqueda
- Tabla con resultados
- Selección múltiple
- Vista previa antes de guardar

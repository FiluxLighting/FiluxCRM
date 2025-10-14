# Guía de Deploy en Vercel

## Pasos para hacer deploy en Vercel

### 📋 Variables de entorno para Vercel:

**Obtén las credenciales de Firebase Console:**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Project Settings" > "General" > "Your apps"
4. Copia las credenciales de configuración
5. Configura estas variables en Vercel:

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NODE_ENV=production
```

### 2. Deploy desde GitHub

#### Opción A: Deploy automático (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "New Project"
4. Importa el repositorio `FiluxLighting/FiluxCRM`
5. Configura las variables de entorno en la sección "Environment Variables"
6. Haz clic en "Deploy"

#### Opción B: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login en Vercel
vercel login

# Deploy desde el directorio del proyecto
vercel

# Para deploys subsiguientes
vercel --prod
```

### 3. Configuración post-deploy

Después del deploy:

1. **Actualizar dominios en Firebase Console:**
   - Ve a Firebase Console > Authentication > Settings
   - Agrega tu dominio de Vercel a "Authorized domains"

2. **Verificar variables de entorno:**
   - Ve a tu proyecto en Vercel Dashboard
   - Sección "Settings" > "Environment Variables"
   - Asegúrate de que todas las variables estén configuradas

3. **Configurar reglas de Firestore:**
   - Las reglas ya están en `firestore.rules`
   - Deploya las reglas: `firebase deploy --only firestore:rules`

### 4. Comandos útiles

```bash
# Verificar build local
npm run build

# Verificar tipos
npm run typecheck

# Ejecutar linting
npm run lint

# Limpiar cache de Next.js
npm run clean
```

### 5. Estructura de URLs

Una vez deployado, tu aplicación estará disponible en:
- **Producción:** `https://filux-crm.vercel.app` (o tu dominio personalizado)
- **Preview:** URLs automáticas para cada PR/branch

### 6. Monitoreo

Vercel automáticamente:
- ✅ Realiza builds automáticos en cada push
- ✅ Genera URLs de preview para PRs
- ✅ Proporciona analytics y logs
- ✅ Configura HTTPS automáticamente

### 7. Solución de problemas comunes

#### Error de build:
```bash
# Verificar localmente
npm run build
npm run typecheck
```

#### Variables de entorno no funcionan:
- Verificar que empiecen con `NEXT_PUBLIC_` para el cliente
- Redeploy después de cambiar variables de entorno

#### Firebase no se conecta:
- Verificar que las variables de entorno estén correctas
- Agregar el dominio de Vercel a Firebase Auth

---

## 🎉 ¡Listo para el deploy!

Tu proyecto FiluxCRM está completamente configurado y listo para ser deployado en Vercel. Todas las configuraciones necesarias ya están en su lugar.
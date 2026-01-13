# FiluxCRM 

Una aplicación CRM moderna construida con Next.js, Firebase y AI integrado con Google Genkit.

## 🚀 Características

- **Gestión de Contactos**: Crear, editar y gestionar contactos con información detallada
- **Notas y Seguimiento**: Sistema de notas para cada contacto con seguimiento de actividades
- **Importación/Exportación**: Importa contactos desde CSV y exporta datos
- **Web Scraper**: Busca automáticamente electricistas en múltiples ciudades (Google Places API)
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS y componentes de Radix UI
- **AI Integrado**: Funcionalidades de AI utilizando Google Genkit
- **Autenticación**: Sistema de autenticación con Firebase Auth
- **Base de Datos**: Firestore para almacenamiento en tiempo real
- **Dashboard**: Estadísticas y visualización de datos

## 🛠 Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Firestore, Auth)
- **AI**: Google Genkit
- **Deployment**: Vercel
- **Forms**: React Hook Form con Zod validation

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/FiluxLighting/FiluxCRM.git
   cd FiluxCRM
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales de Firebase y Google AI.

4. **Ejecuta la aplicación en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Ejecuta Genkit en modo desarrollo** (opcional)
   ```bash
   npm run genkit:dev
   ```

## 🔧 Configuración

### Firebase Setup

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Obtén las credenciales de configuración
5. Actualiza las variables de entorno en `.env.local`

### Google AI Setup

1. Obtén una API key de [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Agrega la key a `GOOGLE_GENAI_API_KEY` en `.env.local`

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio de GitHub con Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a main

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 Scripts Disponibles

- `npm run dev` - Ejecuta la app en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter
- `npm run typecheck` - Verifica los tipos de TypeScript
- `npm run genkit:dev` - Ejecuta Genkit en modo desarrollo
- `npm run genkit:watch` - Ejecuta Genkit en modo watch

## 📁 Estructura del Proyecto

```
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── (app)/          # Rutas principales
│   │   └── (auth)/         # Rutas de autenticación
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes base UI
│   │   ├── contacts/      # Componentes específicos de contactos
│   │   └── layout/        # Componentes de layout
│   ├── firebase/          # Configuración y servicios de Firebase
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilidades y tipos
│   └── ai/                # Configuración de Genkit
├── public/                # Archivos estáticos
└── docs/                  # Documentación
```

## 🔐 Variables de Entorno

Revisa `.env.example` para ver todas las variables de entorno necesarias.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio de GitHub.

---

Desarrollado con ❤️ por [FiluxLighting](https://github.com/FiluxLighting)

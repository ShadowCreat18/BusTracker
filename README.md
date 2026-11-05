# Zacatecas Bus Tracker — Solución de Movilidad Inteligente y Eficiente

> **Proyecto Académico** desarrollado para la materia de **Desarrollo Web Profesional**  
> **Institución**: Universidad Tecnológica del Estado de Zacatecas (UTZAC)  
> **Profesor**: M.T.I. José Cruz Moreira  
> **Alumno**: Christian Israel Esparza Solis  

---

## 📌 Descripción del Proyecto

En la zona conurbada de **Zacatecas y Guadalupe**, la movilidad urbana enfrenta un reto diario significativo: la falta de información digital centralizada, clara y accesible sobre los recorridos de las rutas de camiones urbanos y la ubicación exacta de los paraderos oficiales. Frecuentemente los usuarios desconocen los trayectos completos o tienen incertidumbre sobre qué ruta tomar en puntos clave de la ciudad.

**BusTracker** es una solución integral compuesta por una **aplicación móvil híbrida** y un **backend administrativo RESTful** que permite a cualquier usuario consultar los recorridos de transporte público de forma inmediata, interactiva y con capacidad de funcionamiento sin conexión a internet.

---

## 🎯 Cumplimiento de Requerimientos de la Rúbrica

El proyecto fue diseñado y construido para satisfacer al 100% los requerimientos técnicos y funcionales solicitados en la materia:

### 1. Frontend Móvil Híbrido (Ionic + Angular)
- **Mapa Interactivo**: Integración completa de **Leaflet.js** consumiendo las teselas libres de **OpenStreetMap (OSM)**, evitando costos de APIs comerciales.
- **Visualización de Capas por Rutas**: Capacidad de activar, desactivar y alternar entre los recorridos de camiones con colores visuales distintivos.
- **Geolocalización en Tiempo Real**: Uso de la API nativa `@capacitor/geolocation` para identificar la posición del usuario en el mapa con un marcador dinámico.
- **Detección de Conexión (Online / Offline)**: Manejo de estado de red mediante `@capacitor/network`, avisando al usuario de forma amigable en caso de pérdida de señal.
- **Cero Barreras de Acceso**: La aplicación es **100% libre de login/registro**. El usuario abre la app y tiene el mapa disponible al instante sin trámites ni consumo innecesario de batería.
- **Caché y Funcionamiento Offline**: Incluye un catálogo local precompilado (`data.json`) que garantiza que la app funcione incluso si el usuario no cuenta con saldo o datos móviles.

### 2. Backend y Base de Datos (Node.js + Strapi)
- **Arquitectura RESTful**: Servidor desacoplado con endpoints para consulta de rutas (`/api/rutas`) y paraderos (`/api/paradas`).
- **Base de Datos Relacional**: Modelado relacional que vincula cada ruta con su lista ordenada de paraderos oficiales.
- **Bootstrap y Sincronización**: Carga automatizada y normalización de coordenadas y polilíneas geográficas acotadas a los límites urbanos de Zacatecas y Guadalupe.

### 3. Seguridad y Buenas Prácticas
- **Autenticación JWT**: Panel de administración de Strapi debidamente protegido con tokens JWT para la gestión de datos.
- **Variables de Entorno**: Credenciales, llaves maestras y configuración de puertos aisladas en archivos `.env` y `.env.example`.
- **Protección de Código**: Script de ofuscación de código JavaScript antes de la sincronización final con Android.

---

## 🏗️ Arquitectura del Sistema

```
BusTracker/
├── docs/                       # Presentación ejecutiva y requerimientos
│   ├── BusTracker.pptx         # Diapositivas oficiales del proyecto
│   └── Proyecto Rutas.docx     # Documento de requerimientos
├── release/                    # Entregable ejecutable para prueba
│   └── Bustracker.apk          # Instalador compilado listo para Android
├── rutas-backend/              # API REST con Strapi CMS (Node.js / TypeScript)
│   ├── src/                    # Modelos (Rutas, Paradas) y controladores
│   ├── config/                 # Configuración de base de datos y servidor
│   └── package.json
├── rutas-frontend/             # App móvil híbrida (Ionic / Angular / Capacitor)
│   ├── src/app/                # Componentes (Mapa interactivo, Servicios GPS)
│   ├── src/assets/data.json    # Base de datos offline de rutas locales
│   ├── android/                # Proyecto nativo de Android Studio
│   └── package.json
└── README.md
```

---

## 📱 Instalador Android (APK)

Para facilitar la revisión y prueba directa en dispositivos móviles sin necesidad de compilar todo el entorno de desarrollo:

* El archivo instalable se encuentra en: [`release/Bustracker.apk`](release/Bustracker.apk).
* Compatible con dispositivos Android 8.0 en adelante.

---

## ⚙️ Guía de Ejecución en Desarrollo

### Prerrequisitos
- **Node.js** v20 o superior
- **npm** v10 o superior
- **Ionic CLI**: `npm install -g @ionic/cli`

---

### Paso 1: Levantar el Backend (Strapi)

```bash
cd rutas-backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servidor en modo desarrollo
npm run develop
```
* **Panel de Administración**: `http://localhost:1337/admin`
* **API de Rutas**: `http://localhost:1337/api/rutas`

---

### Paso 2: Levantar el Frontend (Ionic)

En una nueva terminal:

```bash
cd rutas-frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de pruebas web
ionic serve
```
La aplicación abrirá automáticamente en tu navegador en `http://localhost:8100/`.

---

### Paso 3: Compilación para Android (Opcional)

Si deseas regenerar el APK desde el código fuente:

```bash
cd rutas-frontend

# 1. Compilar aplicación web
npm run build:prod

# 2. Sincronizar cambios con Android Studio
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android
```

---

## 👤 Autor

* **Christian Israel Esparza Solis**  
  *Desarrollo y Gestión de Software — Universidad Tecnológica del Estado de Zacatecas (UTZAC)*  
  *Materia: Desarrollo Web Profesional — Profesor: M.T.I. José Cruz Moreira*

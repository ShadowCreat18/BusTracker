# 📱 BusTracker — Frontend (Ionic + Angular + Leaflet)

Aplicación móvil híbrida desarrollada con **Ionic Framework**, **Angular** y **Capacitor** para la visualización interactiva de rutas de camiones y paraderos en Zacatecas y Guadalupe.

---

## 🛠️ Tecnologías y Librerías

* **Ionic Framework v8** con **Angular v20**
* **Leaflet.js** & **Leaflet MarkerCluster**: Renderizado del mapa interactivo con OpenStreetMap (OSM) y agrupación inteligente de paradas.
* **Capacitor**:
  - `@capacitor/geolocation`: Acceso nativo al GPS del teléfono para centrar el mapa en la posición del usuario.
  - `@capacitor/network`: Monitoreo del estado de conexión (detección online/offline).
  - `@capacitor/android`: Compilación nativa a paquete Android (APK).
* **Mapbox Polyline**: Decodificación de los recorridos de transporte en tiempo real.

---

## ✨ Características Principales

1. **Mapa Interactivo**: Despliegue de OpenStreetMap sin costo de licencias ni cuotas por petición.
2. **Visualización de Rutas**: Trazado de recorridos completos de ida y vuelta con colores diferenciados.
3. **Paradas Cercanas**: Detección y listado de los paraderos más próximos a la ubicación actual del usuario.
4. **100% Sin Registro**: No requiere login ni datos personales; la app está lista para usar de inmediato al abrirla.
5. **Modo Offline**: Incluye un archivo precargado local (`src/assets/data.json`) que permite consultar las rutas incluso sin saldo o conexión de datos móviles.

---

## 🚀 Puesta en Marcha

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Ejecutar en Navegador
```bash
ionic serve
```
La aplicación se abrirá en `http://localhost:8100/`.

### 3. Sincronizar y Compilar para Android
```bash
# Compilar proyecto web
npm run build:prod

# Sincronizar con el proyecto de Android Studio
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

---

## 👤 Autor
* **Christian Israel Esparza Solis** — Proyecto Académico de *Desarrollo Web Profesional*.

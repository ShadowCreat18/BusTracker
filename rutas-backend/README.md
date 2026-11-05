# 🚌 BusTracker — Backend (Strapi CMS)

Servicio backend RESTful desarrollado sobre **Node.js** y **Strapi Headless CMS** para la gestión y distribución de información de rutas de transporte público y paradas oficiales en la zona conurbada de Zacatecas y Guadalupe.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js** (v20+)
* **Strapi Headless CMS** (v5.x)
* **Base de Datos**: SQLite (`better-sqlite3`) para almacenamiento local y portabilidad
* **Polyline Mapbox**: Para codificación y decodificación de coordenadas geográficas
* **TypeScript**

---

## 📋 Colecciones y Modelos de Datos

1. **Rutas (`api::ruta`)**:
   - `nombre`: Nombre o identificador de la ruta (Ej: *Ruta 5*, *Ruta 10*, *Transportes de Guadalupe*).
   - `wialon_id`: Identificador original del sistema de telemetría/GPS.
   - `polilinea`: Cadena de coordenadas codificada que dibuja el recorrido en el mapa.
   - `paradas`: Relación muchos a muchos con los paraderos oficiales asignados.

2. **Paradas (`api::parada`)**:
   - `nombre`: Nombre del paradero o punto de referencia urbano.
   - `lat` / `lng`: Coordenadas geográficas de la parada.
   - `wialon_id`: Identificador de la parada.

---

## 🚀 Puesta en Marcha

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo de ejemplo para generar tu archivo local:
```bash
cp .env.example .env
```

### 3. Modo de Desarrollo
Inicia el servidor local con recarga automática:
```bash
npm run develop
```
El panel de administración estará disponible en: `http://localhost:1337/admin`
Y los endpoints REST en: `http://localhost:1337/api/rutas` y `http://localhost:1337/api/paradas`

---

## 👤 Autor
* **Christian Israel Esparza Solis** — Proyecto Académico de *Desarrollo Web Profesional*.

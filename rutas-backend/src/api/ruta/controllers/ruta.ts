import { factories } from '@strapi/strapi';

/**
 * Controlador principal de 'Ruta'.
 * Strapi genera este archivo automáticamente para manejar las peticiones HTTP (GET, POST, PUT, DELETE)
 * dirigidas a la colección de Rutas. 
 * 'createCoreController' envuelve las funciones predeterminadas del ciclo de vida del CRUD.
 */
// @ts-ignore
export default factories.createCoreController('api::ruta.ruta');

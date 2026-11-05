import { factories } from '@strapi/strapi';

/**
 * Rutas de la API para 'Ruta'.
 * Aquí Strapi expone automáticamente los endpoints REST (por ejemplo: /api/rutas)
 * para que el frontend o cualquier cliente pueda consumirlos.
 */
// @ts-ignore
export default factories.createCoreRouter('api::ruta.ruta');

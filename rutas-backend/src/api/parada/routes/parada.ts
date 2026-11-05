import { factories } from '@strapi/strapi';

/**
 * Rutas de la API para 'Parada'.
 * Vincula los endpoints REST públicos o privados de las paradas (ej. /api/paradas) 
 * con las acciones del controlador definido.
 */
// @ts-ignore
export default factories.createCoreRouter('api::parada.parada');

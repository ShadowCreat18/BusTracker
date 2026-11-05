import { factories } from '@strapi/strapi';

/**
 * Controlador principal de 'Parada'.
 * Gestiona las peticiones entrantes desde el cliente para interactuar con los datos
 * de las Paradas (ej. obtener todas las paradas o crear una nueva).
 */
// @ts-ignore
export default factories.createCoreController('api::parada.parada');

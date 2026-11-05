import { factories } from '@strapi/strapi';

/**
 * Servicio principal de 'Parada'.
 * Encapsula consultas a la base de datos reusables para la entidad Parada.
 * Es llamado por el controlador correspondiente para realizar operaciones CRUD.
 */
// @ts-ignore
export default factories.createCoreService('api::parada.parada');

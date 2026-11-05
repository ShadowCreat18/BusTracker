import { factories } from '@strapi/strapi';

/**
 * Servicio principal de 'Ruta'.
 * Este archivo contiene la lógica de negocio subyacente que los controladores llaman
 * para interactuar con la base de datos (crear, leer, actualizar, eliminar rutas).
 * 'createCoreService' expone la funcionalidad base de Strapi.
 */
// @ts-ignore
export default factories.createCoreService('api::ruta.ruta');

import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  // Función que se ejecuta al arrancar el backend
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const response = await fetch('https://nimbus.wialon.com/api/locator/0aa31562757a464f9b7ae15085d9d561/data');
      const data: any = await response.json();

      // @ts-ignore
      const existingRutas = await strapi.documents('api::ruta.ruta').count({});
      
      // Si la base de datos está vacía, la llenamos con el JSON
      if (existingRutas === 0) {
        strapi.log.info('Llenando base de datos con Rutas y Paradas...');
        
        const stopIdsMap = new Map();

        // 1. Guardar Paradas
        for (const stop of data.stops || []) {
          const lat = stop.p && stop.p[0] ? stop.p[0].y : 0;
          const lng = stop.p && stop.p[0] ? stop.p[0].x : 0;
          
          // @ts-ignore
          const createdStop = await strapi.documents('api::parada.parada').create({
            data: {
              wialon_id: stop.id,
              nombre: String(stop.n),
              lat,
              lng,
              publishedAt: new Date()
            }
          });
          stopIdsMap.set(stop.id, createdStop.documentId);
        }

        // Límites urbanos de Zacatecas y Guadalupe
        const bounds = {
          minLat: 22.65, maxLat: 22.85,
          minLng: -102.68, maxLng: -102.44
        };

        // 2. Guardar Rutas
        for (const route of data.routes || []) {
          let isLocal = true;
          const connectedStops = (route.s || []).map((id: number) => stopIdsMap.get(id)).filter(Boolean);
          
          // Verificar que pase por el área urbana
          if (route.s && route.s.length) {
            for (const stopId of route.s) {
              const stopInfo = data.stops.find((s: any) => s.id === stopId);
              if (stopInfo && stopInfo.p && stopInfo.p[0]) {
                const lat = stopInfo.p[0].y;
                const lng = stopInfo.p[0].x;
                if (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng) {
                  isLocal = false;
                  break;
                }
              }
            }
          }
          
          if (!isLocal) continue;
          
          // @ts-ignore
          await strapi.documents('api::ruta.ruta').create({
            data: {
              wialon_id: route.id,
              nombre: String(route.n),
              polilinea: route.path || '',
              paradas: connectedStops,
              publishedAt: new Date()
            }
          });
        }
        strapi.log.info('¡Base de datos cargada exitosamente!');
      }
    } catch (error) {
      strapi.log.error('Error al insertar datos: ', error);
    }
  },
};

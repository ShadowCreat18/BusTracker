import { Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { RouteService } from '../services/route';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
/**
 * Página principal que contiene el mapa de Leaflet, la localización GPS,
 * el dibujo de las rutas y la gestión interactiva con las paradas de autobuses.
 */
export class HomePage {
  // Instancia principal del mapa de Leaflet
  map!: L.Map;
  // Agrupador para marcadores muy cercanos entre sí (MarkerCluster)
  clusterGroup: any;

  // Banderas de estado para controlar cargandos y modales de la interfaz
  isLoading = true;
  isStopModalOpen = false;
  
  // Capa base de mapas (proveedor OpenStreetMap)
  baseLayer!: L.TileLayer;
  // Referencia visual al marcador GPS del usuario actual
  userMarker: any = null;
  
  // Capa para mostrar las paradas cercanas y bandera de estado
  nearbyStopsLayer: L.LayerGroup = L.layerGroup();
  isNearbyStopsVisible = false;

  // Variables para la Búsqueda de Lugares (Nominatim)
  searchQuery: string = '';
  searchMarker: any = null;
  suggestions: any[] = [];
  searchTimeout: any;

  // Variables auxiliares para la ubicación GPS actual
  watchId: string | null = null;
  hasCentered: boolean = false;
  userLocationName: string = 'Detectando...';
  userLat: number | null = null;
  userLng: number | null = null;

  allStopsMap: Map<number, any> = new Map();

  rutasIda: any[] = [];
  rutasRegreso: any[] = [];

  constructor(
    private routeService: RouteService, 
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  /**
   * Evento del ciclo de vida de Ionic. Se ejecuta cuando la página ya está visible.
   * Inicializa el mapa, escucha cambios de red y trata de localizar al usuario.
   */
  async ionViewDidEnter() {
    this.initMap();
    this.loadData();
    this.initNetworkListener();
    await this.locateUser();
  }

  /**
   * Configura las opciones básicas del mapa (coordenadas centrales y zoom).
   * Adjunta la capa de OpenStreetMap y habilita la agrupación (Cluster) de marcadores.
   */
  initMap() {
    this.map = L.map('map', { zoomControl: false }).setView([22.76843, -102.58141], 13);

    this.baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40
    });
    this.map.addLayer(this.clusterGroup);
  }

  /**
   * Solicita permisos de geolocalización,
   * lee la posición del dispositivo y establece/actualiza el marcador del usuario
   * para posteriormente centrar la vista sobre dicho marcador.
   */
  async locateUser() {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissionStatus = await Geolocation.checkPermissions();
        if (permissionStatus.location !== 'granted') {
          const requestStatus = await Geolocation.requestPermissions();
          if (requestStatus.location !== 'granted') {
            throw new Error('Permisos de ubicación denegados');
          }
        }
      }

      if (this.watchId) {
        if (this.userLat && this.userLng) {
          this.map.setView([this.userLat, this.userLng], 15);
        }
        return;
      }

      this.watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }, (position, err) => {
        if (position) {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          this.userLat = userLat;
          this.userLng = userLng;
          this.userLocationName = `Ubicación actualizada (±${accuracy}m)`;
          
          if (!this.userMarker) {
            this.userMarker = L.circleMarker([userLat, userLng], {
              color: '#fff',
              fillColor: '#28ba62',
              fillOpacity: 1,
              radius: 8,
              weight: 3,
              className: 'pulse-marker'
            }).addTo(this.map);
          } else {
            this.userMarker.setLatLng([userLat, userLng]);
          }

          let colorAlerta = accuracy > 50 ? 'color: #eb445a;' : (accuracy > 20 ? 'color: #eeb000;' : 'color: #28ba62;');
          this.userMarker.bindPopup(`<div style="text-align:center;"><b>Estás aquí</b><br><small style="${colorAlerta}">Margen de error: ±${accuracy}m</small></div>`);
          
          if (!this.hasCentered) {
            this.map.setView([userLat, userLng], 15);
            this.hasCentered = true;
          }
        }
      });
      
      this.showToast('Rastreando señal GPS. Muévete a una ventana si tarda en afinar la precisión.');

    } catch(e) {
      console.error('Error al obtener ubicación', e);
      const toast = await this.toastController.create({
        message: 'No pudimos detectar tu ubicación. Revisa permisos GPS y que la "Ubicación Precisa" esté activada.',
        duration: 5000,
        color: 'warning',
        position: 'top'
      });
      toast.present();
    }
  }

  centerMapOnUser() {
    this.locateUser();
  }

  /**
   * Muestra las paradas que están a 750 metros o menos de la 
   * ubicación actual del usuario mediante un botón dedicado.
   */
  showNearbyStops() {
    const uLat = this.userLat;
    const uLng = this.userLng;

    if (!uLat || !uLng) {
      this.showToast('Primero asegúrate de que se detecte tu ubicación GPS.');
      return;
    }

    if (this.isNearbyStopsVisible) {
      this.map.removeLayer(this.nearbyStopsLayer);
      this.isNearbyStopsVisible = false;
      this.showToast('Paradas cercanas ocultas.');
      return;
    }

    this.nearbyStopsLayer.clearLayers();
    const NEARBY_ROUTE_RADIUS_METERS = 750;
    let found = 0;

    const stopCatalog = Array.from(this.allStopsMap.values());
    stopCatalog.forEach((stop) => {
      // Validamos que la parada tenga coordenadas válidas
      if (!stop.p || !stop.p[0]) return;
      
      const distanceKm = this.calcDist(uLat, uLng, stop.p[0].y, stop.p[0].x);
      const meters = distanceKm * 1000; // Pasamos a metros

      // Aquí entra en rigor el fragmento sugerido
      if (!Number.isFinite(meters) || meters > NEARBY_ROUTE_RADIUS_METERS) {
        return; // Salta a la siguiente iteración
      }

      found++;
      const marker = L.circleMarker([stop.p[0].y, stop.p[0].x], {
        color: 'white',
        fillColor: '#ffbb00', // Un color distitivo para fácil ubicación (naranja/amarillo)
        fillOpacity: 1,
        radius: 8,
        weight: 2
      });

      marker.bindPopup(`<div style="text-align:center;"><b>${stop.n}</b><br><small style="color:#666;">A ${Math.round(meters)} metros de ti</small></div>`);
      
      // Permitimos que al clickear diga qué rutas pasan
      marker.on('click', () => {
        this.clickOnStop(stop);
      });

      marker.addTo(this.nearbyStopsLayer);
    });

    if (found > 0) {
      this.map.addLayer(this.nearbyStopsLayer);
      this.isNearbyStopsVisible = true;
      this.showToast(`¡Se encontraron ${found} paradas en un radio de 750m!`);
    } else {
      this.showToast('No hay paradas a menos de 750 metros de ti.');
    }
  }

  /**
   * Monitoriza los cambios en la conexión a internet.
   * Muestra notificaciones tipo "Toast" indicando que está sin red / modo offline.
   */
  initNetworkListener() {
    Network.addListener('networkStatusChange', async status => {
      if (!status.connected) {
        const toast = await this.toastController.create({
          message: 'Ups. Has perdido la conexión a internet.',
          duration: 4000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });

    Network.getStatus().then(async status => {
      if (!status.connected) {
        const toast = await this.toastController.create({
          message: 'Sin conexión. Estás en modo offline.',
          duration: 4000,
          color: 'warning',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  /**
   * Orquesta la descarga de rutas y paradas.
   * Combina (forkJoin) los datos locales y los datos remotos de Strapi CMS.
   * Enruta la asignación de colores, filtra rutas inválidas, recorta la
   * polilínea entre la primera y la última parada, e inicializa a los arrays
   * interactivos (rutasIda / rutasRegreso).
   */
  loadData() {
    forkJoin({
      localData: this.routeService.getData(),
      strapiData: this.http.get<any>('http://localhost:1337/api/rutas?pagination[limit]=100').pipe(
        catchError(() => of({ data: null })) 
      )
    }).subscribe({
      next: (res) => {
        const stopMap = new Map();
        res.localData.stops?.forEach((s: any) => stopMap.set(s.id, s));

        let rawRoutes;
        if (res.strapiData && res.strapiData.data) {

          rawRoutes = res.strapiData.data.map((r: any) => {
            let routeStopsIds: number[] = [];
            
            if (r.paradas && Array.isArray(r.paradas)) {
              r.paradas.forEach((ps: any) => {
                if (ps.id) {
                  stopMap.set(ps.id, ps); 
                  routeStopsIds.push(ps.id);
                }
              });
            } else {

              routeStopsIds = res.localData.routes?.find((orig: any) => orig.id === r.wialon_id)?.s || [];
            }

            return {
              id: r.documentId || r.wialon_id || Math.floor(Math.random() * 10000),
              n: r.nombre,
              c: r.color,
              path: r.polilinea,
              s: routeStopsIds
            }
          });
        } else {

          console.warn('Modo Offline Activado: Usando base de rutas local en caché.');
          rawRoutes = res.localData.routes || [];
        }

        this.allStopsMap = stopMap;

        const bounds = {
          minLat: 22.65, maxLat: 22.85,
          minLng: -102.68, maxLng: -102.44
        };

        let filteredRoutes = rawRoutes.filter((route: any) => {
        let isLocal = true;
        
        if (route.s && route.s.length) {
          for (const stopId of route.s) {
            const stop = stopMap.get(stopId);
            if (stop && stop.p && stop.p[0]) {
              const lat = stop.p[0].y;
              const lng = stop.p[0].x;
              if (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng) {
                isLocal = false;
                break;
              }
            }
          }
        }
        
        if (isLocal && route.path) {
          const latlngs = this.routeService.decodePolyline(route.path);
          for (const [lat, lng] of latlngs) {
            if (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng) {
              isLocal = false;
              break;
            }
          }
        }
        return isLocal;
      });

      const routeColors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff', '#ffff00', '#ff8000', '#0080ff'];

      let tempIda: any[] = [];
      let tempRegreso: any[] = [];
      const seenNames = new Set<string>();

      filteredRoutes.forEach((route: any, index: number) => {
        const routeLayerGroup = L.layerGroup();
        const color = routeColors[index % routeColors.length];
        
        const isIda = !seenNames.has(route.n);
        seenNames.add(route.n);

        let latlngs: any[] = [];
        if (route.path) {
          latlngs = this.routeService.decodePolyline(route.path);
        }

        let originCoords: [number, number] | null = null;
        let destCoords: [number, number] | null = null;

        if (latlngs.length > 0 && route.s && route.s.length > 1) {
             const firstStopId = route.s[0];
             const lastStopId = route.s[route.s.length - 1];
             
             const firstStopObj = stopMap.get(firstStopId);
             const lastStopObj = stopMap.get(lastStopId);

             if (firstStopObj && lastStopObj && firstStopObj.p && firstStopObj.p[0] && lastStopObj.p && lastStopObj.p[0]) {
                 const fLat = firstStopObj.p[0].y;
                 const fLng = firstStopObj.p[0].x;
                 const lLat = lastStopObj.p[0].y;
                 const lLng = lastStopObj.p[0].x;

                 originCoords = [fLat, fLng];
                 destCoords = [lLat, lLng];

                 let minFirstDist = Infinity;
                 let idxFirst = 0;
                 let minLastDist = Infinity;
                 let idxLast = latlngs.length - 1;

                 // Buscar el punto del hilo (latlngs) geográficamente más cercano a la Primera Parada
                 for (let i = 0; i < latlngs.length; i++) {
                     const d = this.calcDist(fLat, fLng, latlngs[i][0], latlngs[i][1]);
                     if (d < minFirstDist) {
                         minFirstDist = d;
                         idxFirst = i;
                     }
                 }

                 // Buscar el punto del hilo (latlngs) geográficamente más cercano a la Última Parada
                 for (let i = 0; i < latlngs.length; i++) {
                     const d = this.calcDist(lLat, lLng, latlngs[i][0], latlngs[i][1]);
                     if (d < minLastDist) {
                         minLastDist = d;
                         idxLast = i;
                     }
                 }

                 let startIdx = Math.min(idxFirst, idxLast);
                 let endIdx = Math.max(idxFirst, idxLast);

                 if (startIdx === endIdx || Math.abs(startIdx - endIdx) < 10) {
                 } else {
                     latlngs = latlngs.slice(startIdx, endIdx + 1);
                 }
             }
        }

        let startStopName = 'Desconocido';
        let endStopName = 'Desconocido';
        if (route.s && route.s.length > 0) {
           const firstS = stopMap.get(route.s[0]);
           const lastS = stopMap.get(route.s[route.s.length - 1]);
           if (firstS) startStopName = firstS.n;
           if (lastS) endStopName = lastS.n;
        }

        if (latlngs.length > 0) {
          L.polyline(latlngs, { color: color, weight: 4 }).addTo(routeLayerGroup);

          // Indicadores Visuales de Inicio y Fin de Recorrido 
          const startNode = originCoords || latlngs[0];
          const endNode = destCoords || latlngs[latlngs.length - 1];

          L.circleMarker(startNode, {
            color: 'white', fillColor: '#2dd36f', fillOpacity: 1, radius: 7, weight: 2
          }).bindPopup(`<div style="text-align:center;"><b>Inicio: ${startStopName}</b><br><small style="color:#666;">${route.n} ${isIda ? '(Ida)' : '(Regreso)'}</small></div>`).addTo(routeLayerGroup);

          L.circleMarker(endNode, {
            color: 'white', fillColor: '#eb445a', fillOpacity: 1, radius: 7, weight: 2
          }).bindPopup(`<div style="text-align:center;"><b>Fin: ${endStopName}</b><br><small style="color:#666;">${route.n} ${isIda ? '(Ida)' : '(Regreso)'}</small></div>`).addTo(routeLayerGroup);
        }

        if (route.s && route.s.length) {
          route.s.forEach((stopId: number) => {
            const stop = stopMap.get(stopId);
            if (stop && stop.p && stop.p[0]) {
              const marker = L.circleMarker([stop.p[0].y, stop.p[0].x], {
                color: 'white',
                fillColor: '#3880ff',
                fillOpacity: 1,
                radius: 6,
                weight: 2
              });

              marker.on('click', () => {
                this.clickOnStop(stop);
              });

              marker.addTo(routeLayerGroup);
            }
          });
        }

        const routeObj = {
          id: route.id,
          name: route.n.startsWith('Ruta ') ? route.n.replace('Ruta ', '') : route.n,
          color: color,
          layerGroup: routeLayerGroup,
          isOn: false,
          stops: route.s || [],
          pathPoints: latlngs,
          startStopName: startStopName,
          endStopName: endStopName
        };

        if (isIda) {
          tempIda.push(routeObj);
        } else {
          tempRegreso.push(routeObj);
        }
      });

      const sortFn = (a: any, b: any) => {
        const nameA = a.name.toString().replace('Ruta ', '');
        const nameB = b.name.toString().replace('Ruta ', '');
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      };

      this.rutasIda = tempIda.sort(sortFn);
      this.rutasRegreso = tempRegreso.sort(sortFn);

      this.isLoading = false;
    },
    error: async (err) => {
      console.error(err);
      this.isLoading = false;
    }});
  }

  /**
   * Muestra u oculta los trazos de una ruta particular en el mapa al activar un 'Toggle' en UI.
   * @param ruta Objeto que representa la ruta de camiones.
   */
  toggleRoute(ruta: any) {
    if (ruta.isOn) {
      if (!this.map.hasLayer(ruta.layerGroup)) {
        this.map.addLayer(ruta.layerGroup);
      }
    } else {
      if (this.map.hasLayer(ruta.layerGroup)) {
        this.map.removeLayer(ruta.layerGroup);
      }
    }
  }

  /**
   * Cuando el usuario toca el marcador de una Parada de camión en el mapa.
   * Busca todas las rutas que pasan por la parada seleccionada, y dibuja
   * una "Cápsula" (Popup) flotante directamente sobre la parada.
   * @param stop Objeto de la parada clicada.
   */
  /**
   * Cuando el usuario toca el marcador de una Parada de camión en el mapa.
   * Busca todas las rutas que pasan por la parada seleccionada.
   * @param stop Objeto de la parada clicada.
   */
  clickOnStop(stop: any) {
    const uniqueRoutesMap = new Map<string, any>();

    this.rutasIda.forEach(r => {
      if (r.stops.includes(stop.id)) uniqueRoutesMap.set(r.name, r);
    });
    this.rutasRegreso.forEach(r => {
      if (r.stops.includes(stop.id)) uniqueRoutesMap.set(r.name, r);
    });

    const routesFound = Array.from(uniqueRoutesMap.values());
    
    let chipsHtml = '';
    if (routesFound.length > 0) {
      chipsHtml = `<div style="display:flex; flex-wrap:wrap; justify-content:center; gap: 5px;">`;
      routesFound.forEach(r => {
        const color = r.color || '#5856D6';
        chipsHtml += `
          <div style="display:inline-flex; align-items:center; background:rgba(255,255,255,0.7); border-radius:30px; padding:6px 14px; border:1px solid ${color}; box-shadow:0 3px 6px rgba(0,0,0,0.05);">
            <div style="width:14px; height:14px; border-radius:50%; background-color:${color}; margin-right:8px;"></div>
            <span style="font-family: var(--ion-font-family); font-weight:700; font-size:13px; color:#1e293b;">Ruta ${r.name}</span>
          </div>
        `;
      });
      chipsHtml += `</div>`;
    } else {
      chipsHtml = `<p style="font-size: 13px; color: #94a3b8; font-style: italic;">Sin rutas</p>`;
    }

    const capsuleHtml = `
      <div style="text-align:center; min-width: 180px; padding: 10px 5px;">
        <h3 style="margin: 0 0 5px 0; font-size: 18px; font-weight:800; color:#1e293b; letter-spacing: -0.5px;">${stop.n}</h3>
        <p style="margin:0 0 15px 0; font-size:12px; font-weight: 600; color:#64748b;">¿Qué rutas pasan por aquí?</p>
        ${chipsHtml}
      </div>
    `;

    L.popup({ autoClose: false, closeButton: false, className: 'capsule-popup' })
      .setLatLng([stop.p[0].y, stop.p[0].x])
      .setContent(capsuleHtml)
      .openOn(this.map);

    this.map.setView([stop.p[0].y, stop.p[0].x], 16, { animate: true });
  }
  /**
   * Fórmula de Haversine para calcular la distancia en kilómetros 
   * entre dos puntos de coordenadas GPS.
   */
  calcDist(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ==========================================
  // BUSCADOR PREDICTIVO (Autocomplete)
  // ==========================================

  /**
   * Se ejecuta cada vez que el usuario teclea en el buscador.
   * Utiliza un temporizador (debounce) de 600ms para no saturar la API
   * mientras el usuario sigue escribiendo.
   */
  onSearchInput(event: any) {
    const query = event.target.value;
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!query || query.trim().length === 0) {
      this.clearSearch(); // Dispara la limpieza total si borran el texto con retroceso
      return;
    }

    if (query.trim().length < 3) {
      this.suggestions = [];
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.fetchAutocompleteSuggestions(query.trim());
    }, 600);
  }

  /**
   * Realiza la llamada HTTP de fondo a Nominatim para obtener sugerencias (texto predictivo).
   */
  fetchAutocompleteSuggestions(query: string) {
    let finalQuery = query;
    const lowerQ = query.toLowerCase();
    if (!lowerQ.includes('zacatecas') && !lowerQ.includes('guadalupe')) {
      finalQuery += ', Zacatecas';
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&countrycodes=mx&limit=5`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          // Limpia y formatea los resultados para la lista
          this.suggestions = res.map(item => {
            const parts = item.display_name.split(',');
            return {
              title: parts[0],
              subtitle: parts.slice(1, 3).join(',').trim(),
              lat: item.lat,
              lon: item.lon,
              original: item
            };
          });
        } else {
          this.suggestions = [];
        }
      },
      error: (err) => {
        console.error('Error fetching suggestions', err);
        this.suggestions = [];
      }
    });
  }

  /**
   * Cuando el usuario hace click en una sugerencia del menú desplegable.
   */
  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.title;
    this.suggestions = []; // Ocultar el menú

    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

    // Dibujamos marcador en el mapa
    if (this.searchMarker) {
      this.map.removeLayer(this.searchMarker);
    }

    const customIcon = L.icon({
      iconUrl: 'assets/icon/pin.png', 
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.searchMarker = L.marker([lat, lon], {
      icon: customIcon
    }).addTo(this.map);

    // Pasamos de inmediato a buscar qué parada o ruta le queda cerca
    this.handlePlaceFound(lat, lon, suggestion.title);
  }

  /**
   * Limpia el buscador y remueve el pin rojo del mapa al presionar la "X"
   */
  clearSearch() {
    this.searchQuery = '';
    this.suggestions = [];
    if (this.searchMarker) {
      this.map.removeLayer(this.searchMarker);
      this.searchMarker = null;
    }
    // Apagar rutas marcadas por la busqueda
    this.rutasIda.concat(this.rutasRegreso).forEach(r => {
      if (r.isOn) {
        r.isOn = false;
        this.toggleRoute(r);
      }
    });
  }

  // ==========================================
  // BÚSQUEDA TRADICIONAL (Con el botón Enter)
  // ==========================================

  /**
   * Ejecutado por el componente <ion-searchbar>.
   * Primero busca en la base local (Catálogo de paradas). 
   * Si no hay coincidencias locales, traduce el "Lugar" a Lat/Lon con Nominatim.
   */
  searchLocation() {
    if (!this.searchQuery.trim()) return;
    this.suggestions = []; // Ocultar menú si presiona enter directo
    
    const queryLower = this.searchQuery.toLowerCase().trim();
    const stopCatalog = Array.from(this.allStopsMap.values());
    
    // 1. ¿Logró escribir el nombre de una Parada existente?
    let matchedStop = stopCatalog.find(s => s.n.toLowerCase().includes(queryLower));
    
    if (matchedStop && matchedStop.p && matchedStop.p[0]) {
      this.map.setView([matchedStop.p[0].y, matchedStop.p[0].x], 16);
      this.clickOnStop(matchedStop);
      this.showToast('Parada encontrada en el catálogo local.');
      return;
    }

    // 2. Si no es una Parada, entonces consultamos OpenStreetMap
    this.isLoading = true;
    
    this.showToast('Buscando lugar...');

    // Mejorando el algoritmo: Si el usuario no escribe Zacatecas, lo agregamos como contexto para Nominatim
    let finalQuery = this.searchQuery;
    const lowerQ = this.searchQuery.toLowerCase();
    if (!lowerQ.includes('zacatecas') && !lowerQ.includes('guadalupe')) {
      finalQuery += ', Zacatecas';
    }

    // Endpoint de Nominatim sin 'bounded=1' estricto, para no descartar lugares limítrofes, usando limits y countrycodes.
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&countrycodes=mx&limit=3`;
    
    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.length > 0) {
          const place = res[0];
          const lat = parseFloat(place.lat);
          const lon = parseFloat(place.lon);
          this.handlePlaceFound(lat, lon, place.display_name);
        } else {
          this.showToast('No encontramos ese lugar en Zacatecas.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.showToast('Error al buscar el lugar. Revisa tu conexión.');
      }
    });
  }

  /**
   * Recicla el código de proximidad (Radio 750m) que usábamos con el GPS,
   * pero ahora enfocado en la Latitud/Longitud del "Lugar" buscado.
   */
  handlePlaceFound(lat: number, lon: number, placeName: string) {
    const NEARBY_ROUTE_RADIUS_METERS = 750;
    
    let closestStop: any = null;
    let minMeters = Infinity;

    const stopCatalog = Array.from(this.allStopsMap.values());
    stopCatalog.forEach((stop) => {
      if (!stop.p || !stop.p[0]) return;
      
      const distanceKm = this.calcDist(lat, lon, stop.p[0].y, stop.p[0].x);
      const meters = distanceKm * 1000;
      
      // Buscar la parada ABSOLUTAMENTE MÁS CERCANA dentro del margen
      if (meters < minMeters && meters <= NEARBY_ROUTE_RADIUS_METERS) {
        minMeters = meters;
        closestStop = stop;
      }
    });

    if (this.searchMarker) {
      this.map.removeLayer(this.searchMarker);
    }

    // Marcador especial (Pin Azul Distinto) para el Destino/Lugar
    this.searchMarker = L.marker([lat, lon], {
      icon: L.icon({
        iconUrl: 'assets/icon/favicon.png', // Usamos el favicon base, o marcador Leaflet default
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(this.map);

    const friendlyName = placeName.split(',')[0]; // Tomar solo el nombre principal, quitar el "Zacatecas, MX"

    if (closestStop) {
      this.searchMarker.bindPopup(`<div style="text-align:center;"><b>${friendlyName}</b><br><small style="color:#666;">Parada destino: ${closestStop.n} (a ${Math.round(minMeters)}m)</small></div>`).openPopup();
      
      this.map.setView([lat, lon], 15);
      
      // Intentar calcular ruta desde GPS hasta este punto
      this.calculateRouteFromGPS(closestStop);
      
      this.showToast(`Destino encontrado. Calculando mejor ruta...`);
    } else {
      this.searchMarker.bindPopup(`<div style="text-align:center;"><b>${friendlyName}</b><br><small style="color:#eeb000;">No hay paradas cerca (radio de 750m)</small></div>`).openPopup();
      this.map.setView([lat, lon], 15);
      this.showToast('Lo sentimos, no hay cobertura directa de rutas cerca de ese lugar.');
    }
  }

  // ==========================================
  // ENRUTAMIENTO (A -> B)
  // ==========================================
  
  /**
   * Calcula la ruta desde la ubicación GPS actual hasta la parada destino.
   * Identifica Rutas Directas y (básicamente) 1 Transbordo.
   */
  calculateRouteFromGPS(destStop: any) {
    if (!this.userLat || !this.userLng) {
      this.showToast('No se detectó GPS. Se mostrarán solo las rutas de esa parada.');
      this.clickOnStop(destStop); // Fallback: si no hay GPS, solo mostramos la cápsula normal
      return;
    }

    const uLat = this.userLat;
    const uLng = this.userLng;

    // 1. Encontrar la parada de origen más cercana al GPS
    let originStop: any = null;
    let minOriginDist = Infinity;
    const stopCatalog = Array.from(this.allStopsMap.values());
    
    stopCatalog.forEach((stop) => {
      if (!stop.p || !stop.p[0]) return;
      const meters = this.calcDist(uLat, uLng, stop.p[0].y, stop.p[0].x) * 1000;
      if (meters < minOriginDist && meters <= 1000) { // 1km max para caminar al origen
        minOriginDist = meters;
        originStop = stop;
      }
    });

    if (!originStop) {
      this.showToast('Estás muy lejos de una ruta. Acércate a la zona urbana para iniciar tu viaje.');
      this.clickOnStop(destStop);
      return;
    }

    // 2. Apagar todas las rutas actuales para limpiar el mapa visualmente
    this.rutasIda.concat(this.rutasRegreso).forEach(r => {
      if (r.isOn) {
        r.isOn = false;
        this.toggleRoute(r);
      }
    });

    // 3. Buscar rutas coincidentes (Directas)
    const destRoutes = new Set<string>();
    this.rutasIda.concat(this.rutasRegreso).forEach(r => {
      if (r.stops.includes(destStop.id)) destRoutes.add(r.name);
    });

    const directRoutesForUi: any[] = [];
    
    this.rutasIda.concat(this.rutasRegreso).forEach(r => {
      if (r.stops.includes(originStop.id) && destRoutes.has(r.name)) {
        // Es ruta directa!
        directRoutesForUi.push(r);
      }
    });

    // 4. Mostrar Resultados (Rutas Directas)
    if (directRoutesForUi.length > 0) {
      const routeNames = Array.from(new Set(directRoutesForUi.map(r => r.name))).join(', ');
      
      const masterHtml = `
        <div style="min-width: 220px; padding: 10px 5px;">
          <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 800; color: #1e293b;">Resumen de Viaje</h3>
          <p style="margin: 8px 0; font-size: 13px; color: #475569;">
            <b>1.</b> Camina a <span style="color:var(--ion-color-primary); font-weight:600;">${originStop.n}</span>
          </p>
          <p style="margin: 8px 0; font-size: 13px; color: #475569;">
            <b>2.</b> Sube a la <span style="color:var(--ion-color-secondary); font-weight:600;">Ruta ${routeNames}</span> en dirección correcta.
          </p>
          <p style="margin: 8px 0; font-size: 13px; color: #475569;">
            <b>3.</b> Bájate en <span style="color:#f59e0b; font-weight:600;">${destStop.n}</span> y camina a tu destino.
          </p>
        </div>
      `;
      L.popup({ autoClose: false, closeButton: false, className: 'capsule-popup' })
        .setLatLng([originStop.p[0].y, originStop.p[0].x])
        .setContent(masterHtml)
        .openOn(this.map);
      
      const group = L.featureGroup([
        L.marker([originStop.p[0].y, originStop.p[0].x]),
        L.marker([destStop.p[0].y, destStop.p[0].x])
      ]);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });

    } else {
      // 5. Lógica de 1 Transbordo
      const transferPlan = this.findOneTransferRoute(originStop, destStop);

      if (transferPlan) {
        const r1 = transferPlan.route1;
        const r2 = transferPlan.route2;
        const tStop = transferPlan.transferStop;

        const masterHtml = `
          <div style="min-width: 230px; padding: 10px 5px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 800; color: #1e293b;">Viaje con Transbordo</h3>
            <p style="margin: 8px 0; font-size: 13px; color: #475569;">
              <b>1.</b> Camina a <span style="color:var(--ion-color-primary); font-weight:600;">${originStop.n}</span> y toma <span style="color:${r1.color || 'var(--ion-color-secondary)'}; font-weight:600;">Ruta ${r1.name}</span>
            </p>
            <p style="margin: 8px 0; font-size: 13px; color: #475569;">
              <b>2.</b> Baja en <span style="color:#0ea5e9; font-weight:600;">${tStop.n}</span> y cambia a <span style="color:${r2.color || 'var(--ion-color-tertiary)'}; font-weight:600;">Ruta ${r2.name}</span>
            </p>
            <p style="margin: 8px 0; font-size: 13px; color: #475569;">
              <b>3.</b> Bájate en <span style="color:#f59e0b; font-weight:600;">${destStop.n}</span> y camina a destino.
            </p>
          </div>
        `;
        L.popup({ autoClose: false, closeButton: false, className: 'capsule-popup' })
          .setLatLng([originStop.p[0].y, originStop.p[0].x])
          .setContent(masterHtml)
          .openOn(this.map);

        const group = L.featureGroup([
          L.marker([originStop.p[0].y, originStop.p[0].x]),
          L.marker([tStop.p[0].y, tStop.p[0].x]),
          L.marker([destStop.p[0].y, destStop.p[0].x])
        ]);
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] });

      } else {
        // 6. Lógica de MÚLTIPLES Transbordos (2 Transbordos / 3 Camiones)
        const complexPlan = this.findTwoTransferRoute(originStop, destStop);

        if (complexPlan) {
          const r1 = complexPlan.route1;
          const r2 = complexPlan.route2;
          const r3 = complexPlan.route3;
          const tStop1 = complexPlan.transferStop1;
          const tStop2 = complexPlan.transferStop2;

          const masterHtml = `
            <div style="min-width: 240px; padding: 10px 5px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 800; color: #1e293b;">Viaje Complejo (2)</h3>
              <p style="margin: 8px 0; font-size: 13px; color: #475569;">
                <b>1.</b> Camina a <span style="color:var(--ion-color-primary); font-weight:600;">${originStop.n}</span> y toma <span style="color:${r1.color}; font-weight:600;">Ruta ${r1.name}</span>
              </p>
              <p style="margin: 8px 0; font-size: 13px; color: #475569;">
                <b>2.</b> Baja en <span style="color:#0ea5e9; font-weight:600;">${tStop1.n}</span> y cambia a <span style="color:${r2.color}; font-weight:600;">Ruta ${r2.name}</span>
              </p>
              <p style="margin: 8px 0; font-size: 13px; color: #475569;">
                <b>3.</b> Baja en <span style="color:#0ea5e9; font-weight:600;">${tStop2.n}</span> y toma <span style="color:${r3.color}; font-weight:600;">Ruta ${r3.name}</span>
              </p>
              <p style="margin: 8px 0; font-size: 13px; color: #475569;">
                <b>4.</b> Bájate en <span style="color:#f59e0b; font-weight:600;">${destStop.n}</span> y camina a destino.
              </p>
            </div>
          `;
          L.popup({ autoClose: false, closeButton: false, className: 'capsule-popup' })
            .setLatLng([originStop.p[0].y, originStop.p[0].x])
            .setContent(masterHtml)
            .openOn(this.map);

          const group = L.featureGroup([
            L.marker([originStop.p[0].y, originStop.p[0].x]),
            L.marker([tStop1.p[0].y, tStop1.p[0].x]),
            L.marker([tStop2.p[0].y, tStop2.p[0].x]),
            L.marker([destStop.p[0].y, destStop.p[0].x])
          ]);
          this.map.fitBounds(group.getBounds(), { padding: [50, 50] });

        } else {
          // No hay transbordo tampoco
          this.showToast(`El viaje a ${destStop.n} requeriría más de 3 camiones. Busca acercarte más.`);
          this.clickOnStop(destStop);
        }
      }
    }
  }

  /**
   * Algoritmo de intersección para encontrar viajes de 1 transbordo.
   */
  findOneTransferRoute(originStop: any, destStop: any): { route1: any, route2: any, transferStop: any } | null {
    const originRoutes: any[] = [];
    const destRoutes: any[] = [];

    const allRoutes = this.rutasIda.concat(this.rutasRegreso);

    // Separar rutas que pasen por el origen y el destino
    allRoutes.forEach(r => {
      if (r.stops.includes(originStop.id)) originRoutes.push(r);
      if (r.stops.includes(destStop.id)) destRoutes.push(r);
    });

    // Iterar para encontrar una parada común (intersección)
    for (const r1 of originRoutes) {
      for (const r2 of destRoutes) {
        // Ignorar si es la misma ruta (ya hubiese sido directa)
        if (r1.name === r2.name) continue;

        // Encontrar paradas en común
        const commonStopsIds = r1.stops.filter((id: string) => r2.stops.includes(id));
        
        if (commonStopsIds.length > 0) {
          // Elegir la primera parada en común como el punto de transbordo ideal
          const transferStopId = commonStopsIds[0];
          const transferStop = this.allStopsMap.get(transferStopId);
          
          if (transferStop && transferStop.p) {
            return {
              route1: r1,
              route2: r2,
              transferStop: transferStop
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Algoritmo de intersección profunda para encontrar viajes de 2 transbordos.
   * Cubre el 99% de los destinos de la ciudad.
   */
  findTwoTransferRoute(originStop: any, destStop: any): { route1: any, route2: any, route3: any, transferStop1: any, transferStop2: any } | null {
    const originRoutes: any[] = [];
    const destRoutes: any[] = [];
    const allRoutes = this.rutasIda.concat(this.rutasRegreso);

    allRoutes.forEach(r => {
      if (r.stops.includes(originStop.id)) originRoutes.push(r);
      if (r.stops.includes(destStop.id)) destRoutes.push(r);
    });

    for (const r1 of originRoutes) {
      for (const r3 of destRoutes) {
        if (r1.name === r3.name) continue;

        // Buscamos una ruta "matriz 2" puente que conecte r1 con r3
        for (const r2 of allRoutes) {
          if (r2.name === r1.name || r2.name === r3.name) continue;

          // Busca interesecciones r1 <-> r2
          const common12 = r1.stops.filter((id: string) => r2.stops.includes(id));
          // Busca intersecciones r2 <-> r3
          const common23 = r2.stops.filter((id: string) => r3.stops.includes(id));

          if (common12.length > 0 && common23.length > 0) {
            const tStop1 = this.allStopsMap.get(common12[0]);
            const tStop2 = this.allStopsMap.get(common23[0]);

            if (tStop1 && tStop2 && tStop1.p && tStop2.p) {
              return {
                route1: r1,
                route2: r2,
                route3: r3,
                transferStop1: tStop1,
                transferStop2: tStop2
              };
            }
          }
        }
      }
    }
    return null;
  }

  async showToast(msg: string) {
    const t = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
    t.present();
  }
}

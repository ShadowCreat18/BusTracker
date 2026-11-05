import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as polyline from '@mapbox/polyline';

@Injectable({
  providedIn: 'root',
})
/**
 * Servicio encargado de la gestión de rutas y coordenadas.
 */
export class RouteService {
  constructor(private http: HttpClient) {}

  /**
   * Obtiene la información local de rutas desde data.json 
   * (usado como respaldo o base principal).
   */
  getData(): Observable<any> {
    return this.http.get('/assets/data.json');
  }

  /**
   * Decodifica una polilínea (cadena de texto) en un arreglo de coordenadas (latitud y longitud).
   * @param encoded Cadena de polilínea cifrada.
   */
  decodePolyline(encoded: string): [number, number][] {
    return polyline.decode(encoded);
  }
}


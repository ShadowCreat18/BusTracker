const fs = require('fs');
const path = 'src/assets/data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const userRutas1 = {
  "rutas": [
    {
      "nombre": "Ruta 5",
      "ida": [
        {"orden":1,"parada":"Filósofos","lat":22.7684,"lng":-102.5831},
        {"orden":2,"parada":"El Orito","lat":22.7649,"lng":-102.5802},
        {"orden":3,"parada":"Estrella de Oro","lat":22.7632,"lng":-102.5768},
        {"orden":4,"parada":"Felipe Ángeles","lat":22.7615,"lng":-102.5732},
        {"orden":5,"parada":"Cinco Señores","lat":22.7601,"lng":-102.5698},
        {"orden":6,"parada":"Nueva Celaya","lat":22.7584,"lng":-102.5655},
        {"orden":7,"parada":"Av. de la Juventud","lat":22.7569,"lng":-102.5612},
        {"orden":8,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
        {"orden":9,"parada":"Díaz Ordaz","lat":22.7742,"lng":-102.5861}
      ],
      "regreso": [
        {"orden":1,"parada":"Díaz Ordaz","lat":22.7742,"lng":-102.5861},
        {"orden":2,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
        {"orden":3,"parada":"Av. de la Juventud","lat":22.7569,"lng":-102.5612},
        {"orden":4,"parada":"Nueva Celaya","lat":22.7584,"lng":-102.5655},
        {"orden":5,"parada":"Cinco Señores","lat":22.7601,"lng":-102.5698},
        {"orden":6,"parada":"Felipe Ángeles","lat":22.7615,"lng":-102.5732},
        {"orden":7,"parada":"Estrella de Oro","lat":22.7632,"lng":-102.5768},
        {"orden":8,"parada":"El Orito","lat":22.7649,"lng":-102.5802},
        {"orden":9,"parada":"Filósofos","lat":22.7684,"lng":-102.5831}
      ]
    },
    {
      "nombre": "Ruta 6",
      "ida": [
        {"orden":1,"parada":"Las Quintas","lat":22.7718,"lng":-102.6023},
        {"orden":2,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
        {"orden":3,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
        {"orden":4,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
        {"orden":5,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
        {"orden":6,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
        {"orden":7,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
        {"orden":8,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
        {"orden":9,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
        {"orden":10,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060}
      ],
      "regreso": [
        {"orden":1,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060},
        {"orden":2,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
        {"orden":3,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
        {"orden":4,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
        {"orden":5,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
        {"orden":6,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
        {"orden":7,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
        {"orden":8,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
        {"orden":9,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
        {"orden":10,"parada":"Las Quintas","lat":22.7718,"lng":-102.6023}
      ]
    },
    {
      "nombre": "Ruta 7",
      "ida": [
        {"orden":1,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
        {"orden":2,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
        {"orden":3,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
        {"orden":4,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
        {"orden":5,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
        {"orden":6,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
        {"orden":7,"parada":"Av Universidad","lat":22.7730,"lng":-102.5794},
        {"orden":8,"parada":"Tecnológico de Zacatecas","lat":22.7775,"lng":-102.5743},
        {"orden":9,"parada":"Colinas del Padre","lat":22.7842,"lng":-102.5651}
      ],
      "regreso": [
        {"orden":1,"parada":"Colinas del Padre","lat":22.7842,"lng":-102.5651},
        {"orden":2,"parada":"Tecnológico de Zacatecas","lat":22.7775,"lng":-102.5743},
        {"orden":3,"parada":"Av Universidad","lat":22.7730,"lng":-102.5794},
        {"orden":4,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
        {"orden":5,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
        {"orden":6,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
        {"orden":7,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
        {"orden":8,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
        {"orden":9,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944}
      ]
    },
    {
      "nombre": "Ruta 9",
      "ida": [
        {"orden":1,"parada":"La Ribera","lat":22.7601,"lng":-102.5951},
        {"orden":2,"parada":"Ojo de Agua","lat":22.7624,"lng":-102.5902},
        {"orden":3,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
        {"orden":4,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
        {"orden":5,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
        {"orden":6,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
        {"orden":7,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
        {"orden":8,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
        {"orden":9,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
        {"orden":10,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060}
      ],
      "regreso": [
        {"orden":1,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060},
        {"orden":2,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
        {"orden":3,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
        {"orden":4,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
        {"orden":5,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
        {"orden":6,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
        {"orden":7,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
        {"orden":8,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
        {"orden":9,"parada":"Ojo de Agua","lat":22.7624,"lng":-102.5902},
        {"orden":10,"parada":"La Ribera","lat":22.7601,"lng":-102.5951}
      ]
    }
  ]
};

const userRuta10 = {
  "nombre": "Ruta 10",
  "ida": [
    {"orden":1,"parada":"Las Palmas","lat":22.7592,"lng":-102.6021},
    {"orden":2,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
    {"orden":3,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
    {"orden":4,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
    {"orden":5,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
    {"orden":6,"parada":"IMSS","lat":22.7662,"lng":-102.5882},
    {"orden":7,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
    {"orden":8,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
    {"orden":9,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
    {"orden":10,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
    {"orden":11,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060}
  ],
  "regreso": [
    {"orden":1,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060},
    {"orden":2,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
    {"orden":3,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
    {"orden":4,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
    {"orden":5,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
    {"orden":6,"parada":"IMSS","lat":22.7662,"lng":-102.5882},
    {"orden":7,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
    {"orden":8,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
    {"orden":9,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
    {"orden":10,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
    {"orden":11,"parada":"Las Palmas","lat":22.7592,"lng":-102.6021}
  ]
};

const userRuta11 = {
  "nombre": "Ruta 11",
  "ida": [
    {"orden":1,"parada":"Lienzo Charro","lat":22.7735,"lng":-102.6002},
    {"orden":2,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
    {"orden":3,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
    {"orden":4,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
    {"orden":5,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
    {"orden":6,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
    {"orden":7,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
    {"orden":8,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
    {"orden":9,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
    {"orden":10,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
    {"orden":11,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060}
  ],
  "regreso": [
    {"orden":1,"parada":"Centro de Guadalupe","lat":22.7560,"lng":-102.5060},
    {"orden":2,"parada":"Villas de Guadalupe","lat":22.7810,"lng":-102.5702},
    {"orden":3,"parada":"Mercado Arroyo de la Plata","lat":22.7728,"lng":-102.5795},
    {"orden":4,"parada":"Centro Histórico","lat":22.7709,"lng":-102.5832},
    {"orden":5,"parada":"Plaza Bicentenario","lat":22.7711,"lng":-102.5823},
    {"orden":6,"parada":"Alameda","lat":22.7699,"lng":-102.5847},
    {"orden":7,"parada":"Boulevard López Mateos","lat":22.7671,"lng":-102.5905},
    {"orden":8,"parada":"Central de Autobuses","lat":22.7687,"lng":-102.5944},
    {"orden":9,"parada":"Máquina 30-30","lat":22.7704,"lng":-102.5978},
    {"orden":10,"parada":"Tres Cruces","lat":22.7762,"lng":-102.5751},
    {"orden":11,"parada":"Lienzo Charro","lat":22.7735,"lng":-102.6002}
  ]
};

const newRoutesInfo = [ ...userRutas1.rutas, userRuta10, userRuta11 ];

let nextStopId = Math.max(...data.stops.map(s => s.id)) + 1;
let nextRouteId = Math.max(...data.routes.map(r => r.id)) + 1;

function encodePolyline(points) {
  let prevLat = 0;
  let prevLng = 0;
  let result = '';
  
  for (const point of points) {
    let lat = Math.round(point[0] * 1e5);
    let lng = Math.round(point[1] * 1e5);
    
    let dLat = lat - prevLat;
    let dLng = lng - prevLng;
    
    prevLat = lat;
    prevLng = lng;
    
    let endLat = (dLat < 0) ? ~(dLat << 1) : (dLat << 1);
    let endLng = (dLng < 0) ? ~(dLng << 1) : (dLng << 1);
    
    let encodeValue = (val) => {
      let str = '';
      while (val >= 0x20) {
        str += String.fromCharCode((0x20 | (val & 0x1f)) + 63);
        val >>= 5;
      }
      str += String.fromCharCode(val + 63);
      return str;
    };
    
    result += encodeValue(endLat) + encodeValue(endLng);
  }
  return Buffer.from(result).toString('base64');
}

newRoutesInfo.forEach(routeInfo => {
  // Ida
  let idaStops = [];
  let idaPoints = [];
  routeInfo.ida.forEach(stop => {
    let s = {
      id: nextStopId++,
      n: stop.parada,
      p: [{y: stop.lat, x: stop.lng}],
      d: ''
    };
    data.stops.push(s);
    idaStops.push(s.id);
    idaPoints.push([stop.lat, stop.lng]);
  });
  
  data.routes.push({
    id: nextRouteId++,
    n: routeInfo.nombre,
    path: encodePolyline(idaPoints),
    s: idaStops,
    c: ''
  });
  
  // Regreso
  let regresoStops = [];
  let regresoPoints = [];
  routeInfo.regreso.forEach(stop => {
    let s = {
      id: nextStopId++,
      n: stop.parada,
      p: [{y: stop.lat, x: stop.lng}],
      d: ''
    };
    data.stops.push(s);
    regresoStops.push(s.id);
    regresoPoints.push([stop.lat, stop.lng]);
  });
  
  data.routes.push({
    id: nextRouteId++,
    n: routeInfo.nombre,
    path: encodePolyline(regresoPoints),
    s: regresoStops,
    c: ''
  });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Routes added successfully!');

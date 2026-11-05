const fs = require('fs');
const polyline = require('@mapbox/polyline');

const dataPath = 'data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const stopMap = new Map();
data.stops.forEach(s => stopMap.set(s.id, s));

// Haversine distance
function getDist(p1, p2) {
  const R = 6371e3;
  const f1 = p1[0] * Math.PI/180;
  const f2 = p2[0] * Math.PI/180;
  const df = (p2[0]-p1[0]) * Math.PI/180;
  const dl = (p2[1]-p1[1]) * Math.PI/180;
  const a = Math.sin(df/2) * Math.sin(df/2) +
            Math.cos(f1) * Math.cos(f2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find closest point on polyline to a stop
function findClosestPolylineIndex(stopId, pts) {
  const s = stopMap.get(stopId);
  if (!s || !s.p || !s.p[0]) return -1;
  const p = [s.p[0].y, s.p[0].x];
  
  let minDist = Infinity;
  let minIdx = -1;
  for (let i = 0; i < pts.length; i++) {
    const d = getDist(p, pts[i]);
    if (d < minDist) {
      minDist = d;
      minIdx = i;
    }
  }
  return minIdx;
}

// Agrupamos rutas por nombre
const routesByName = new Map();
data.routes.forEach(r => {
  const name = r.n.replace('Ruta ', '');
  if (!routesByName.has(name)) routesByName.set(name, []);
  routesByName.get(name).push(r);
});

let modifiedCount = 0;

for (const [name, arr] of routesByName.entries()) {
  if (arr.length >= 2) {
    const r1 = arr[0];
    const r2 = arr[1];

    if (r1.path && r2.path) {
      const pts1 = polyline.decode(r1.path);
      if (pts1.length < 10) continue;

      // Detect if circuit by checking start/end distance
      const startEndDist = getDist(pts1[0], pts1[pts1.length-1]);
      
      // Encontrar el punto más lejano al inicio
      let maxDist = 0;
      let farIdx = -1;
      for (let i=0; i<pts1.length; i++) {
        let d = getDist(pts1[0], pts1[i]);
        if (d > maxDist) {
          maxDist = d;
          farIdx = i;
        }
      }

      // Si el punto más lejano está al menos a X distancia y el start/end están cerca (circular)
      if (startEndDist < 2000 && maxDist > 3000) {
        console.log(`Dividiendo la circular Ruta ${name}. farIdx: ${farIdx}/${pts1.length}`);
        
        // 1. Partir el Path de Ida y Regreso
        const pathIda = pts1.slice(0, farIdx + 1);
        const pathRegreso = pts1.slice(farIdx);
        
        r1.path = polyline.encode(pathIda);
        r2.path = polyline.encode(pathRegreso);

        // 2. Partir los Stops (s)
        if (r1.s && r1.s.length > 0) {
          const stopsIda = [];
          const stopsRegreso = [];
          
          r1.s.forEach(stopId => {
            const idx = findClosestPolylineIndex(stopId, pts1);
            if (idx <= farIdx && idx !== -1) {
              stopsIda.push(stopId);
            } else if (idx > farIdx) {
              stopsRegreso.push(stopId);
            }
          });
          
          r1.s = stopsIda;
          r2.s = stopsRegreso;
        }
        modifiedCount++;
      }
    }
  }
}

console.log('Rutas circulares cortadas:', modifiedCount);
fs.writeFileSync(dataPath, JSON.stringify(data));

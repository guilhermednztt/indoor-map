// Largura da imagem/planta usada no mapa.
const MAP_W = 2000;

// Altura da imagem/planta usada no mapa.
const MAP_H = 1400;

// Converte coordenadas normais de imagem, x e y, para o formato usado pelo Leaflet.
// Em imagem, o ponto 0,0 fica no canto superior esquerdo.
// No Leaflet com CRS.Simple, o eixo Y funciona invertido, por isso usamos MAP_H - y.
function toLeafletPoint(x, y) {
  return [MAP_H - y, x];
}

// Converte uma coordenada clicada no mapa Leaflet de volta para coordenada da imagem.
function fromLeafletPoint(latlng) {
  return {
    x: Number(latlng.lng.toFixed(0)),
    y: Number((MAP_H - latlng.lat).toFixed(0))
  };
}

// Cria o mapa Leaflet.
// O CRS.Simple é o que permite usar uma planta baixa como mapa,
// sem depender de latitude e longitude reais.
const map = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -1,
  maxZoom: 2,
  zoomSnap: 0.25
});

// Define os limites da imagem dentro do mapa.
// O mapa começa em 0,0 e vai até a altura/largura da planta.
const bounds = [[0, 0], [MAP_H, MAP_W]];

// Adiciona a imagem da planta ao mapa.
L.imageOverlay("assets/medias/planta1.png", bounds).addTo(map);

// Ajusta o zoom inicial para mostrar toda a planta.
map.fitBounds(bounds);

// Camada usada para desenhar e limpar rotas.
// Tudo que for rota fica aqui.
const routeLayer = L.layerGroup().addTo(map);

// Camada usada para exibir os nós de rota.
// Pode ser escondida depois no projeto final.
const nodeLayer = L.layerGroup().addTo(map);

// Camada usada para desenhar as salas clicáveis.
const roomLayer = L.layerGroup().addTo(map);

// Lista de salas ou ambientes clicáveis.
const rooms = [
  {
    name: "Entrada 1",
    code: "E1",
    color: "#1a73e8",
    category: "Entrada",
    polygon: [[20, 328], [50, 328], [50, 388], [20, 388]]
  },
  {
    name: "Entrada 2",
    code: "E2",
    color: "#1a73e8",
    category: "Entrada",
    polygon: [[160, 1390], [240, 1390], [240, 1420], [160, 1420]]
  },
  {
    name: "Entrada 3",
    code: "E3",
    color: "#1a73e8",
    category: "Entrada",
    polygon: [[1980, 690], [2000, 690], [2000, 760], [1980, 760]]
  },
  {
    name: "Cinema",
    code: "CM6",
    color: "#1a73e8",
    category: "Cinema",
    polygon: [[1510, 19], [1975, 19], [1975, 275], [1510, 275]]
  },
  {
    name: "Academia",
    code: "AC1",
    color: "#1a73e8",
    category: "Academia",
    polygon: [[1510, 1130], [1975, 1130], [1975, 1385], [1510, 1385]]
  },
  {
    name: "Supermercado",
    code: "SM1",
    color: "#1a73e8",
    category: "Supermercado",
    polygon: [[15, 1135], [480, 1135], [480, 1385], [15, 1385]]
  },
  {
    name: "Sala de Jogos",
    code: "L21",
    color: "#1a73e8",
    category: "Games",
    polygon: [[1140, 1190], [1200, 1190], [1200, 1270], [1285, 1270], [1285, 1390], [1140, 1390]]
  },
  {
    name: "Moda",
    code: "L01",
    color: "#1a73e8",
    category: "Moda",
    polygon: [[520, 18], [665, 18], [665, 215], [520, 215]]
  },
  {
    name: "Recepção",
    code: "ET-01",
    color: "#B200ED",
    category: "Acesso",
    polygon: []
  }
];

// Desenha as salas no mapa.
// Cada sala vira um polígono clicável com popup.
rooms.forEach(room => {
  const polygon = L.polygon(
    room.polygon.map(([x, y]) => toLeafletPoint(x, y)),
    {
      color: room.color,
      weight: 2,
      fillOpacity: 0.15
    }
  ).addTo(roomLayer);

  polygon.bindPopup(`
    <strong>${room.name}</strong><br>
    Sala: ${room.code}<br>
    Categoria: ${room.category}
  `);
});

// Vertices da malha de navegação.
// Esses pontos representam corredores, portas, recepção e destinos.
const nodes = {
  c1: { x: 335, y: 358 },
  c2: { x: 335, y: 290 },
  c3: { x: 595, y: 290 },
  c4: { x: 1472, y: 290 },
  c5: { x: 1472, y: 670 },
  c6: { x: 1800, y: 670 },
  c7: { x: 1472, y: 1125 },
  c8: { x: 1177, y: 1125 },
  c9: { x: 570, y: 1125 },
  c10: { x: 335, y: 1046 },
  c11: { x: 959, y: 670 },
  c12: { x: 335, y: 670 },

  moda: { x: 595, y: 222 },
  cinema: { x: 1502, y: 219 },
  games: { x: 1177, y: 1174 },
  supermercado1: { x: 386, y: 1115 },
  supermercado2: { x: 490, y: 1184 },
  academia: { x: 1495, y: 1195 },

  entrada1: { x: 35, y: 358 },
  entrada2: { x: 205, y: 1405 },
  entrada3: { x: 1990, y: 730 }
};

// Locais pesquisáveis pelo usuário.
// Cada location aponta para um node.
const locations = {
  entrada1: {
    label: "Entrada 1",
    node: "entrada1"
  },
  entrada2: {
    label: "Entrada 2",
    node: "entrada2"
  },
  entrada3: {
    label: "Entrada 3",
    node: "entrada3"
  },
  academia: {
    label: "Academia",
    node: "academia"
  },
  supermercado1: {
    label: "Supermercado L1",
    node: "supermercado1"
  },
  supermercado2: {
    label: "Supermercado L2",
    node: "supermercado2"
  },
  moda: {
    label: "Moda",
    node: "moda"
  },
  games: {
    label: "Games",
    node: "games"
  },
  cinema: {
    label: "Cinema",
    node: "cinema"
  }
};

// Conexões entre os nós.
// Isso representa por onde a pessoa pode andar.
const links = [
    // esquerda
  ["entrada1", "c1"],
  ["c1", "c2"],
  ["c1", "c12"],
  ["c2", "c3"],
  ["c3", "c4"],
  ["c3", "moda"],
  ["c4", "c5"],
  ["c4", "cinema"],
  ["c5", "c6"],
  ["c6", "entrada3"],
  ["c5", "c7"],
  ["c7", "academia"],
  ["c7", "c8"],
  ["c8", "games"],
  ["c8", "c9"],
  ["c9", "supermercado1"],
  ["c9", "supermercado2"],
  ["c12", "c10"],
  ["c10", "supermercado1"],
  ["c11", "c12"],
  ["c11", "c5"],
  ["supermercado1", "entrada2"],
  ["supermercado2", "entrada2"]
];


const graph = {};


function distance(a, b) {
  const na = nodes[a];
  const nb = nodes[b];
  return Math.hypot(na.x - nb.x, na.y - nb.y);
}


function addEdge(a, b) {
  if (!graph[a]) graph[a] = {};
  if (!graph[b]) graph[b] = {};

  const d = distance(a, b);
  graph[a][b] = d;
  graph[b][a] = d;
}

links.forEach(([a, b]) => addEdge(a, b));

Object.entries(nodes).forEach(([id, node]) => {
  L.circleMarker(toLeafletPoint(node.x, node.y), {
    radius: 5,
    color: "#111",
    fillColor: "#111",
    fillOpacity: 1
  })
  .bindTooltip(id)
  .addTo(nodeLayer);
});

// Desenha marcadores nos locais pesquisáveis.
Object.entries(locations).forEach(([id, location]) => {
  const node = nodes[location.node];

  L.marker(toLeafletPoint(node.x, node.y))
    .bindPopup(`<strong>${location.label}</strong>`)
    .addTo(map);
});

// Algoritmo de Dijkstra.
// Ele encontra o menor caminho entre dois nós da malha.
function dijkstra(start, end) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(nodes));

  Object.keys(nodes).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });

  distances[start] = 0;

  while (unvisited.size > 0) {
    const current = [...unvisited].sort((a, b) => distances[a] - distances[b])[0];

    if (current === end) break;
    if (distances[current] === Infinity) break;

    unvisited.delete(current);

    const neighbors = graph[current] || {};

    Object.keys(neighbors).forEach(neighbor => {
      if (!unvisited.has(neighbor)) return;

      const newDistance = distances[current] + neighbors[neighbor];

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = current;
      }
    });
  }

  const path = [];
  let current = end;

  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  if (path[0] !== start) return [];

  return path;
}

// Preenche os campos select de origem e destino.
// Ele usa automaticamente os locais cadastrados em locations.
function fillSelects() {
  const origem = document.getElementById("origem");
  const destino = document.getElementById("destino");

  Object.entries(locations).forEach(([id, location]) => {
    const option1 = document.createElement("option");
    option1.value = id;
    option1.textContent = location.label;

    const option2 = document.createElement("option");
    option2.value = id;
    option2.textContent = location.label;

    origem.appendChild(option1);
    destino.appendChild(option2);
  });

  // Origem padrão ao carregar a POC.
  // Para o totem real, provavelmente será o ponto "Você está aqui".
  origem.value = "recepcao";

  // Destino padrão ao carregar a POC.
  destino.value = "inova";
}

// Traça a rota entre origem e destino selecionados.
// Busca os locais, encontra os nós correspondentes,
// calcula o caminho com Dijkstra e desenha uma linha no mapa.
function drawRoute() {
  routeLayer.clearLayers();

  const origemId = document.getElementById("origem").value;
  const destinoId = document.getElementById("destino").value;

  const startNode = locations[origemId].node;
  const endNode = locations[destinoId].node;

  const path = dijkstra(startNode, endNode);

  if (!path.length) {
    document.getElementById("steps").innerHTML = "Nenhuma rota encontrada.";
    return;
  }

  const routePoints = path.map(nodeId => {
    const node = nodes[nodeId];
    return toLeafletPoint(node.x, node.y);
  });

  const polyline = L.polyline(routePoints, {
    color: "#1a73e8",
    weight: 8,
    opacity: 0.85
  }).addTo(routeLayer);

  routePoints.forEach(point => {
    L.circleMarker(point, {
      radius: 8,
      color: "#1a73e8",
      fillColor: "#1a73e8",
      fillOpacity: 1
    }).addTo(routeLayer);
  });

  map.fitBounds(polyline.getBounds().pad(0.25));

  document.getElementById("steps").innerHTML = `
    <strong>Rota gerada:</strong><br>
    ${path.join(" → ")}
  `;
}

// Limpa a rota atual e volta o mapa para a visualização completa da planta.
function clearRoute() {
  routeLayer.clearLayers();
  document.getElementById("steps").innerHTML = "";
  map.fitBounds(bounds);
}

// Evento de clique no mapa.
// Serve para descobrir as coordenadas x/y da planta.
map.on("click", function(e) {
  const p = fromLeafletPoint(e.latlng);
  document.getElementById("coords").innerHTML = `
    Coordenada clicada:<br>
    x: ${p.x}, y: ${p.y}
  `;
});

// Preenche os selects de origem e destino ao carregar a página.
fillSelects();

// Desenha uma rota inicial automaticamente para validar a POC.
drawRoute();


//====================================================================
// ===== JS da área de Publicidade

const adBanners = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgTz0MIDdkxXwslzzNvNPEN8LWjt2_-FeV-WYnrK4nneLFtNWS3-2FO6S4&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzARd6lSZDtBTe9fNzbOSxPy39ORQNaIu2tlr0BBTtMqk331E4ogbhTEg&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTrvecNNgUe3ZV3879-XTT8TYseU-dr39gT7xjIInqUUYOVBrh5VaiKw&s=10"
];

let currentAdIndex = -1;

function rotateBanner() {
  currentAdIndex = (currentAdIndex + 1) % adBanners.length;

  const banner = document.getElementById("adBanner");
  banner.src = adBanners[currentAdIndex];
}
rotateBanner();
setInterval(rotateBanner, 8000);

setTimeout(() => {
  map.invalidateSize();
}, 300);
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { DRACOLoader } from './vendor/DRACOLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

// Baked light is stored as srgb(irradiance / LM_SCALE) in lightmaps and as linear irradiance / LM_SCALE in vertex colours.
// Standard materials apply BRDF_Lambert (1/PI) to irradiance, so we scale back by LM_SCALE * PI.
const LM_SCALE = 4.0;
const LM_INTENSITY = LM_SCALE * Math.PI;
const LM_GROUPS = ['floor', 'walls', 'ceil'];
const MOBILE = matchMedia('(max-width: 700px)').matches;

// Lightmaps already contain diffuse light; the environment map should only add reflections.
THREE.ShaderChunk.lights_fragment_maps = THREE.ShaderChunk.lights_fragment_maps.replace(
  'iblIrradiance += getIBLIrradiance( geometryNormal );', '');

const B = (x, y, z) => new THREE.Vector3(x, z, -y);   // Blender z-up -> three y-up

// Camera stations, a walk through the flat's doors in plan order. t = scroll progress, fov = vertical fov at 16:9,
// sx/sy = frame shift for captions (wide / portrait), via = pass through without slowing (no caption here).
const KEYS = [
  { t: 0.000, p: B(62, -78, 52), l: B(11, 8, -6), fov: 34, sx: -0.14, sy: 0.16 },          // the building in its street
  { t: 0.080, p: B(75, -255, 215), l: B(-80, -75, -15), fov: 40, sx: 0.12, sy: 0.12,       // route to Santacruz station
    pp: B(-30, -330, 330), pl: B(-70, -70, -15) },
  { t: 0.140, p: B(240, 40, 330), l: B(-45, 185, -15), fov: 42, sx: 0.12, sy: 0.12,        // route to the Aqua Line
    pp: B(-30, -190, 380), pl: B(-40, 175, -15) },              // portrait: look up the route so it runs top to bottom
  { t: 0.195, p: B(11.5, 52, 26), l: B(11.5, 12, 0), fov: 50, via: true },                  // swoop down to the lobby
  { t: 0.220, p: B(11.5, 14.6, 1.6), l: B(11.5, 9.0, 1.4), fov: 60, via: true },            // at the front door
  { t: 0.250, p: B(11.5, 9.5, 1.62), l: B(11.3, 6.0, 1.4), fov: 62 },                       // foyer
  { t: 0.300, p: B(11.5, 7.1, 1.65), l: B(11.5, 0.5, 1.2), fov: 66 },                       // the hall
  { t: 0.355, p: B(10.3, 4.3, 1.6), l: B(6.0, 4.3, 1.45), fov: 56 },                        // main altar
  { t: 0.410, p: B(9.9, 6.5, 1.62), l: B(17.0, 2.6, 1.05), fov: 64 },                         // seating, east red wall
  { t: 0.455, p: B(6.85, 5.6, 1.62), l: B(6.75, 11.0, 1.45), fov: 62, via: true },          // towards the corridor
  { t: 0.500, p: B(6.95, 8.2, 1.6), l: B(6.1, 9.7, 1.5), fov: 62 },                         // corridor gallery
  { t: 0.535, p: B(6.75, 11.85, 1.6), l: B(3.0, 11.6, 1.3), fov: 64, via: true },
  { t: 0.565, p: B(5.4, 11.85, 1.6), l: B(1.5, 9.6, 1.0), fov: 66 },                        // master bedroom
  { t: 0.595, p: B(6.75, 12.0, 1.6), l: B(6.6, 15.5, 1.3), fov: 64, via: true },
  { t: 0.620, p: B(6.55, 13.75, 1.6), l: B(3.4, 15.4, 1.0), fov: 66 },                       // peach bedroom
  { t: 0.660, p: B(6.75, 10.2, 1.62), l: B(6.8, 6.0, 1.4), fov: 62, via: true },            // back down the corridor
  { t: 0.685, p: B(6.85, 6.5, 1.64), l: B(12.0, 5.6, 1.3), fov: 62, via: true },            // out into the hall
  { t: 0.715, p: B(10.4, 6.0, 1.65), l: B(14.8, 9.6, 1.1), fov: 62, via: true },            // across to the dining
  { t: 0.760, p: B(15.6, 6.7, 1.65), l: B(14.4, 11.2, 0.95), fov: 64 },                     // dining
  { t: 0.800, p: B(13.6, 11.95, 1.65), l: B(15.4, 16.0, 1.0), fov: 70 },                     // kitchen
  { t: 0.840, p: B(14.6, 12.8, 1.65), l: B(18.0, 12.8, 0.95), fov: 66, via: true },
  { t: 0.880, p: B(17.35, 12.8, 1.6), l: B(19.3, 12.0, 0.55), fov: 66 },                      // washing machine
  { t: 0.935, p: B(16.0, 10.5, 10.0), l: B(11.5, 8.0, 0.0), fov: 60, via: true },           // rise out
  { t: 1.000, p: B(-38, -48, 50), l: B(11, 8, -3), fov: 36, sx: -0.22, sy: 0.26 },          // the whole home
];
// interior look targets sit a fixed distance ahead, so the spline turns the head smoothly instead of swinging
for (const k of KEYS) { const d = k.l.distanceTo(k.p); if (d < 30) k.l = k.p.clone().add(k.l.clone().sub(k.p).setLength(5)); }

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let dpr = Math.min(devicePixelRatio, 1.5);
renderer.setPixelRatio(dpr);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.autoClear = false;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;     // the city never moves: one shadow pass after it loads

// two scenes: the city is lit conventionally, the home is fully baked and must not receive those lights
const city = new THREE.Scene();
city.background = new THREE.Color(0xdfe3e2);
city.fog = new THREE.Fog(0xe2e4e0, 650, 2200);
city.add(new THREE.HemisphereLight(0xeef3f6, 0x9c9282, 1.9));
const sun = new THREE.DirectionalLight(0xffe2c0, 2.4);
sun.position.copy(B(-0.4, -0.85, 0.5)).multiplyScalar(600).add(B(-70, 100, 0));
sun.target.position.copy(B(-70, 100, -15));
sun.castShadow = true;
sun.shadow.mapSize.set(MOBILE ? 2048 : 4096, MOBILE ? 2048 : 4096);
Object.assign(sun.shadow.camera, { left: -420, right: 420, top: 420, bottom: -420, near: 10, far: 1400 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
city.add(sun, sun.target);
const farGround = new THREE.Mesh(new THREE.CircleGeometry(4000, 48).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xc9c2b4 }));
farGround.position.y = -15.45;            // under the OSM ground tile, so the map never shows an edge
city.add(farGround);
const home = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 2500);

const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

// --- camera path: C1-smooth everywhere. Position/look follow Catmull-Rom splines through the keys; scroll maps to the
// spline parameter through a monotone Hermite curve that slows at caption stations and flows through 'via' keys.
const curves = (portrait) => [new THREE.CatmullRomCurve3(KEYS.map(k => (portrait && k.pp) || k.p), false, 'centripetal'),
  new THREE.CatmullRomCurve3(KEYS.map(k => (portrait && k.pl) || k.l), false, 'centripetal')];
const CURVES = [curves(false), curves(true)];
const N = KEYS.length;
const sec = i => 1 / (KEYS[i + 1].t - KEYS[i].t);
const slope = KEYS.map((k, i) => {
  const a = sec(Math.max(0, i - 1)), b = sec(Math.min(N - 2, i));
  return Math.min((k.via ? 1 : 0.35) * (a + b) / 2, 3 * Math.min(a, b));
});
function sample(t) {
  let i = 0;
  while (i < N - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1], dt = b.t - a.t;
  const s = THREE.MathUtils.clamp((t - a.t) / dt, 0, 1), s2 = s * s, s3 = s2 * s;
  const u = (2 * s3 - 3 * s2 + 1) * i + (s3 - 2 * s2 + s) * slope[i] * dt + (-2 * s3 + 3 * s2) * (i + 1) + (s3 - s2) * slope[i + 1] * dt;
  const j = Math.min(N - 2, Math.floor(u)), f = u - j, A = KEYS[j], Bk = KEYS[j + 1];
  const lerp = k => (A[k] || 0) + ((Bk[k] || 0) - (A[k] || 0)) * f;
  const q = THREE.MathUtils.clamp(u / (N - 1), 0, 1);
  const [pc, lc] = CURVES[camera.aspect < 1 ? 1 : 0];
  return { p: pc.getPoint(q), l: lc.getPoint(q), fov: lerp('fov'), sx: lerp('sx'), sy: lerp('sy') };
}

// --- loading: the city first (small, starts the tour), then the home streams in behind it
const loaderEl = document.querySelector('.loader');
const pctEl = loaderEl.querySelector('.pct');
const homeEl = document.querySelector('.homeload');
const homePct = homeEl.querySelector('.pct');
let dirty = true, homeReady = false, cityReady = false;
const draco = new DRACOLoader().setDecoderPath('./vendor/draco/');
const gltfLoader = new GLTFLoader().setDRACOLoader(draco);
const pct = e => (e.total ? Math.round(e.loaded / e.total * 100) : 0) + '%';

const texLoader = new THREE.TextureLoader();
const lightmaps = {};

const overhead = [];          // ceilings, fans, lights: hidden when the camera is above the roofline
const outdoorOnly = [];       // far city, trees, rails: not drawn while we are inside

function vertexIrradiance(mat) {
  mat.vertexColors = true;
  mat.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader
      .replace('#include <color_fragment>', '')
      .replace('#include <lights_fragment_maps>', `#include <lights_fragment_maps>\n  irradiance += vColor.rgb * ${LM_INTENSITY.toFixed(5)};`);
  };
  mat.customProgramCacheKey = () => 'vc-irradiance';
}

function softenVeins(mat) {    // the marble scan has dark veins that read as cracks; lift them
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>',
      '#include <map_fragment>\n  diffuseColor.rgb = max(diffuseColor.rgb, vec3(0.6, 0.585, 0.56));');
  };
  mat.customProgramCacheKey = () => 'soft-veins';
}

function owner(o) {
  for (let n = o; n; n = n.parent) {
    if (n.userData && n.userData.lm) return { lm: n.userData.lm };
    if (n.userData && n.userData.vc) return { vc: true };
    const m = n.name.match(/^(LM|VC)_([a-z]+)/);
    if (m) return m[1] === 'LM' ? { lm: m[2] } : { vc: m[2] };
  }
  return {};
}

function upload(scene) {     // push every texture to the GPU now so the first pass through a room doesn't hitch
  const seen = new Set();
  scene.traverse(o => { if (!o.isMesh) return; for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'lightMap']) { const t = o.material[k]; if (t && !seen.has(t)) { seen.add(t); renderer.initTexture(t); } } });
}

gltfLoader.load('assets/city.glb', gltf => {
  city.add(...[...gltf.scene.children]);
  city.traverse(o => {
    if (!o.isMesh || o === farGround) return;
    const s = o.material;
    const leaf = { 'Canopy.Leaves': 0x7d9455, 'Canopy.Gulmohar': 0xc0703f }[s.name];   // flat canopy tones suit the clay model
    o.material = new THREE.MeshLambertMaterial({ color: leaf || s.color, emissive: s.emissive, emissiveIntensity: s.emissiveIntensity,
      transparent: s.transparent, opacity: s.opacity });
    o.castShadow = !/Ground|Road|Railway/.test(o.name);
    o.receiveShadow = true;
    let top = o; while (top.parent && top.parent !== city) top = top.parent;
    if (!/BuildingsNear|Ground|Roads|OurBuilding/.test(top.name)) outdoorOnly.push(o);
  });
  cityReady = true; buildRoutes();
  renderer.shadowMap.needsUpdate = true;
  renderer.compile(city, camera); upload(city);
  requestAnimationFrame(() => { loaderEl.classList.add('done'); dirty = true; });
  loadHome();
}, e => { pctEl.textContent = pct(e); }, err => { pctEl.textContent = 'could not load the 3D tour'; console.error(err); dispatchEvent(new Event('residency:load-error')); });

function loadHome() {
  let pending = LM_GROUPS.length + 1;
  const done = () => { if (--pending) return; homeReady = true; renderer.compile(home, camera); upload(home); dirty = true; };
  for (const g of LM_GROUPS) {
    const t = lightmaps[g] = texLoader.load(`assets/lm_${g}.webp`, done, undefined, done);
    t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.channel = 1; t.anisotropy = 4;
  }
  gltfLoader.load('assets/home.glb', gltf => {
    home.add(...[...gltf.scene.children]);
    const box = new THREE.Box3();
    home.traverse(o => {
      if (!o.isMesh) return;
      const who = owner(o), s = o.material;
      const glow = s.emissive && s.emissive.getHex() !== 0 && s.emissiveIntensity > 0;
      if (/^(Art|Img)\./.test(s.name)) {           // paintings: evenly lit, like gallery lighting
        o.material = new THREE.MeshBasicMaterial({ map: s.map, color: new THREE.Color(0.86, 0.84, 0.8) });
      } else if (glow) {
        o.material = new THREE.MeshBasicMaterial({ color: s.emissive.clone().multiplyScalar(THREE.MathUtils.clamp(s.emissiveIntensity * 0.12, 0.85, 1.6)) });
      } else if (who.lm && lightmaps[who.lm]) {
        s.lightMap = lightmaps[who.lm]; s.lightMapIntensity = LM_INTENSITY;
        if (/^Floor\.Marble/.test(s.name)) softenVeins(s);
        s.envMap = envMap; s.envMapIntensity = 0.35;
      } else if (who.vc) {
        if (s.metalnessMap && !/brass|chandelier|lamp|diya/i.test(s.name)) { s.metalness = 0; s.metalnessMap = null; }   // repacked ARM maps arrive as metal
        s.envMap = envMap; s.envMapIntensity = s.metalness > 0.5 ? 0.8 : 0.3;
        vertexIrradiance(s);
      } else if (s.transparent || s.opacity < 1) {
        o.material = new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: Math.min(0.25, s.opacity), depthWrite: false });
        o.renderOrder = 2;
      } else {
        o.material = new THREE.MeshBasicMaterial({ color: s.color, map: s.map, alphaTest: s.alphaTest || 0.5 * (s.map ? 1 : 0), transparent: false });
      }
      box.setFromObject(o);
      if (box.min.y > 2.3) overhead.push(o);
    });
    done();
  }, e => { homePct.textContent = pct(e); }, err => { homePct.textContent = 'failed'; console.error(err); dispatchEvent(new Event('residency:load-error')); });
}

// --- walking routes: glowing animated ribbons on the street, still faintly visible through buildings
const pins = {};
const routes = [];
let places = null;
fetch('assets/places.json').then(r => r.json()).then(p => { places = p; buildRoutes(); });

const routeVert = `
  attribute float along; varying float vAlong; varying float vSide;
  void main() { vAlong = along; vSide = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const routeFrag = `
  uniform vec3 color; uniform float drawn; uniform float time; uniform float opacity;
  varying float vAlong; varying float vSide;
  void main() {
    if (vAlong > drawn) discard;
    float edge = abs(vSide - 0.5) * 2.0;                                   // 0 centre .. 1 edge
    float core = 1.0 - smoothstep(0.32, 0.42, edge);
    float halo = (1.0 - edge) * 0.55;
    float flow = smoothstep(0.55, 0.85, fract((vAlong - time * 18.0) / 14.0)) * core;   // walking chevrons
    float head = smoothstep(18.0, 0.0, drawn - vAlong);                    // bright tip while drawing
    vec3 c = mix(color, vec3(1.0), 0.55 * flow + 0.5 * head * core);
    gl_FragColor = vec4(c, max(core, halo) * opacity);
  }`;

function ribbon(curve, width, y) {
  const L = curve.getLength(), n = Math.ceil(L / 1.5);
  const pos = [], uv = [], along = [], idx = [];
  const up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = curve.getPointAt(u), tan = curve.getTangentAt(u);
    side.crossVectors(up, tan).setY(0).normalize().multiplyScalar(width / 2);
    pos.push(p.x + side.x, y, p.z + side.z, p.x - side.x, y, p.z - side.z);
    uv.push(u, 0, u, 1); along.push(u * L, u * L);
    if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('along', new THREE.Float32BufferAttribute(along, 1));
  g.setIndex(idx);
  return { g, L };
}

function beacon(color, at, h) {    // a soft light pillar marking the destination
  const g = new THREE.CylinderGeometry(4, 4, h, 24, 1, true).translate(0, h / 2, 0);
  const m = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    vertexShader: 'varying float vy; void main(){ vy = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 color; varying float vy; void main(){ gl_FragColor = vec4(color, 0.55 * pow(1.0 - vy, 1.6)); }',
  });
  const mesh = new THREE.Mesh(g, m); mesh.position.copy(at); mesh.renderOrder = 4; mesh.visible = false;
  city.add(mesh);
  return mesh;
}

function buildRoutes() {
  if (!places || routes.length || !cityReady) return;
  const y = places.ground + 0.35;
  for (const [key, color] of [['station', 0xff6a2b], ['metro', 0x1e7bff]]) {
    const pts = places.routes[key].map(([x, yy]) => B(x, yy, places.ground));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const { g, L } = ribbon(curve, 9, y);
    const mk = (opacity, depthTest, order) => {
      const m = new THREE.ShaderMaterial({ vertexShader: routeVert, fragmentShader: routeFrag, transparent: true, depthWrite: false, depthTest,
        toneMapped: false, uniforms: { color: { value: new THREE.Color(color) }, drawn: { value: 0 }, time: { value: 0 }, opacity: { value: opacity } } });
      const mesh = new THREE.Mesh(g, m); mesh.renderOrder = order; mesh.visible = false; city.add(mesh);
      return mesh;
    };
    const end = pts[pts.length - 1];
    routes.push({ key, L, meshes: [mk(1, true, 3), mk(0.35, false, 3)], beacon: beacon(color, new THREE.Vector3(end.x, places.ground, end.z), 70) });
  }
  for (const [k, cls] of [['home', 'home'], ['station', 'stn'], ['metro', 'metro']]) {
    const el = document.querySelector(`.pin.${cls}`);
    const [x, yy] = places.pins[k];
    pins[k] = { el, pos: B(x, yy, k === 'home' ? 3 : places.ground + 20) };
  }
}

// --- scroll
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let target = 0, shown = -1, last = performance.now();
const readScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  target = max > 0 ? THREE.MathUtils.clamp(scrollY / max, 0, 1) : 0;
};
addEventListener('scroll', readScroll, { passive: true });

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight; dirty = true;
}
addEventListener('resize', resize);

function fitFov(v) {
  const hf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(v) / 2) * 16 / 9);
  const need = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hf / 2) / camera.aspect));
  return Math.min(Math.max(v, need), v < 45 ? v * 2.1 : v * 1.55, 92);
}

// --- captions + chapter rail
const caps = [...document.querySelectorAll('.cap')].map(el => {
  const [a, b] = el.dataset.at.split(',').map(Number);
  return { el, a, b, label: el.dataset.label };
});
const rail = document.querySelector('.rail');
caps.forEach((c, i) => {
  const btn = document.createElement('button');
  btn.innerHTML = `<span>${String(i).padStart(2, '0')} ${c.label}</span>`;
  btn.setAttribute('aria-label', `Go to ${c.label}`);
  btn.onclick = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: ((c.a + c.b) / 2) * max, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  c.btn = btn; rail.append(btn);
});
function updateCaptions(t) {
  let active = 0;
  caps.forEach((c, i) => { c.el.classList.toggle('on', t >= c.a && t < c.b); if (t >= c.a) active = i; });
  caps.forEach((c, i) => c.btn.classList.toggle('on', i === active));
}

// routes draw in one after the other while the camera frames each; pins follow their 3D anchors
const DRAW = { station: [0.035, 0.08], metro: [0.095, 0.14] };
const MAP_END = 0.2;
const v = new THREE.Vector3();
function updateMap(t, time) {
  const show = t > 0.02 && t < MAP_END;
  const ready = {};
  for (const r of routes) {
    const d = THREE.MathUtils.smoothstep(t, ...DRAW[r.key]);
    ready[r.key] = d > 0.98;
    for (const m of r.meshes) {
      m.visible = show && d > 0;
      m.material.uniforms.drawn.value = d * r.L;
      m.material.uniforms.time.value = time;
    }
    r.beacon.visible = show && ready[r.key];
  }
  for (const k in pins) {
    const p = pins[k];
    const on = k === 'home' ? t < MAP_END : (show && ready[k]);
    v.copy(p.pos).project(camera);
    const vis = on && v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
    p.el.classList.toggle('on', vis);
    if (vis) p.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * innerWidth}px, ${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
  }
  return show;
}

// keep it smooth: if frames run slow, render fewer pixels (down to 1x)
let slow = 0;
function adapt(ms) {
  slow = ms > 26 ? slow + 1 : Math.max(0, slow - 1);
  if (slow > 20 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); resize(); slow = 0; }
}

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2);
  const next = shown < 0 ? target : shown + (target - shown) * k;
  const animating = shown >= 0.02 && shown < MAP_END;      // flowing routes need continuous frames
  if (Math.abs(next - shown) > 1e-5 || dirty || animating) {
    shown = Math.abs(next - target) < 1e-5 ? target : next;
    const s = sample(shown);
    camera.position.copy(s.p);
    camera.lookAt(s.l);
    camera.fov = fitFov(s.fov);
    const w = innerWidth, h = innerHeight, portrait = w < h;
    camera.setViewOffset(w, h, portrait ? 0 : s.sx * w, portrait ? s.sy * h : 0, w, h);
    camera.updateProjectionMatrix();
    const above = camera.position.y > 2.75;
    const p = camera.position, inside = !above && p.x > -0.5 && p.x < 22.5 && p.z < 0.5 && p.z > -17;
    for (const o of overhead) o.visible = !above;
    for (const o of outdoorOnly) o.visible = !inside;
    updateCaptions(target);
    updateMap(shown, now / 1000);
    homeEl.classList.toggle('on', !homeReady && shown > 0.18);
    renderer.clear();
    renderer.render(city, camera);
    if (homeReady) renderer.render(home, camera);
    dirty = false;
    adapt(dt * 1000);
  }
  requestAnimationFrame(frame);
}

if (location.hash === '#debug') window.__dbg = { home, city, camera, renderer, THREE, poke: () => { dirty = true; }, jump: (t) => { const max = document.documentElement.scrollHeight - innerHeight; scrollTo(0, t * max); target = t; shown = t; dirty = true; } };
resize(); readScroll();
requestAnimationFrame(frame);

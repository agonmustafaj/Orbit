/**
 * ORBIT hero — glowing particle Earth.
 * Point-cloud continents, bright coastlines, magenta node markers,
 * outward spikes, orbital rings, blue/purple atmosphere, shallow DOF feel.
 * Cursor: hover parallax + drag tilt with inertia. Mobile quality tiers.
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const LANDMASK_URL = "/static/images/earth-landmask.png";
const RADIUS = 1.55;

/** Magenta hotspot cities — lat, lon, relative weight. */
const NODES = [
  [51.5, -0.1, 1.0], // London
  [48.9, 2.3, 0.95], // Paris
  [52.5, 13.4, 0.9], // Berlin
  [41.9, 12.5, 0.85], // Rome
  [40.4, -3.7, 0.8], // Madrid
  [55.8, 37.6, 0.85], // Moscow
  [41.0, 28.9, 0.9], // Istanbul
  [30.0, 31.2, 1.0], // Cairo
  [6.5, 3.4, 0.85], // Lagos
  [-1.3, 36.8, 0.8], // Nairobi
  [-26.2, 28.0, 0.85], // Johannesburg
  [25.2, 55.3, 0.95], // Dubai
  [19.1, 72.9, 0.9], // Mumbai
  [28.6, 77.2, 0.85], // Delhi
  [1.3, 103.8, 0.9], // Singapore
  [35.7, 139.7, 1.0], // Tokyo
  [31.2, 121.5, 0.9], // Shanghai
  [-33.9, 151.2, 0.8], // Sydney
  [40.7, -74.0, 1.0], // New York
  [34.0, -118.2, 0.95], // LA
  [37.8, -122.4, 0.85], // SF
  [19.4, -99.1, 0.85], // Mexico City
  [-23.5, -46.6, 0.95], // Sao Paulo
  [-34.6, -58.4, 0.8], // Buenos Aires
  [59.9, 10.8, 0.7], // Oslo
  [59.3, 18.1, 0.7], // Stockholm
  [47.4, 8.5, 0.75], // Zurich
  [50.1, 8.7, 0.75], // Frankfurt
  [21.0, 105.8, 0.8], // Hanoi
  [13.8, 100.5, 0.75], // Bangkok
];

function qualityProfile() {
  const w = window.innerWidth || 1024;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const phone = w < 720 || coarse;
  // Phone: fewer, brighter particles + closer framing (not a muddy desktop downsample).
  if (saveData || (phone && w < 400)) {
    return {
      id: "low",
      phone: true,
      dpr: 1,
      antialias: false,
      landStep: 5,
      coastStep: 3,
      atmoCount: 120,
      starCount: 48,
      ringSeg: 72,
      rings: 1,
      spikes: 8,
      nodes: 10,
      softPoints: false,
      glowShell: false,
      coreLayer: false,
      coastLines: false,
      landSize: 0.032,
      coastSize: 0.028,
      atmoSize: 0.05,
      earthScale: 1.28,
      earthY: 0.42,
      camZ: 4.15,
      camY: 0.05,
      fogDensity: 0.028,
      spin: 0.1,
    };
  }
  if (phone) {
    return {
      id: "mid",
      phone: true,
      dpr: 1.15,
      antialias: false,
      landStep: 4,
      coastStep: 2,
      atmoCount: 220,
      starCount: 90,
      ringSeg: 96,
      rings: 1,
      spikes: 12,
      nodes: 14,
      softPoints: false,
      glowShell: true,
      coreLayer: false,
      coastLines: false,
      landSize: 0.028,
      coastSize: 0.024,
      atmoSize: 0.045,
      earthScale: 1.22,
      earthY: 0.38,
      camZ: 4.35,
      camY: 0.08,
      fogDensity: 0.032,
      spin: 0.09,
    };
  }
  return {
    id: "high",
    phone: false,
    dpr: 1.75,
    antialias: (window.devicePixelRatio || 1) < 2,
    landStep: 2,
    coastStep: 1,
    atmoCount: 900,
    starCount: 280,
    ringSeg: 220,
    rings: 3,
    spikes: 28,
    nodes: NODES.length,
    softPoints: true,
    glowShell: true,
    coreLayer: true,
    coastLines: true,
    landSize: 4.2,
    coastSize: 3.4,
    atmoSize: 6.5,
    earthScale: 1,
    earthY: 0,
    camZ: 5.15,
    camY: 0.12,
    fogDensity: 0.045,
    spin: 0.08,
  };
}

function readSize(canvas) {
  const parent = canvas?.parentElement || document.body;
  const rect = parent.getBoundingClientRect?.() || { width: 0, height: 0 };
  const w = Math.max(
    1,
    Math.floor(parent.clientWidth || rect.width || window.innerWidth || 1)
  );
  const h = Math.max(
    1,
    Math.floor(parent.clientHeight || rect.height || window.innerHeight || 1)
  );
  return { w, h, parent };
}

function latLonToVec3(lat, lon, r = RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  const x = -r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function loadLandmask() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
        resolve({ data, width, height });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Landmask failed to load"));
    img.src = LANDMASK_URL;
  });
}

function sampleLand(mask, lon, lat) {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const x = Math.min(mask.width - 1, Math.max(0, Math.floor(u * mask.width)));
  const y = Math.min(mask.height - 1, Math.max(0, Math.floor(v * mask.height)));
  return mask.data[(y * mask.width + x) * 4];
}

function makeSoftPointMaterial({
  color,
  size,
  opacity = 1,
  focus = 5.0,
  dof = 0.55,
  vertexColors = false,
}) {
  const col = new THREE.Color(color);
  const colorAttr = vertexColors
    ? `attribute vec3 color;
       varying vec3 vColor;`
    : `varying vec3 vColor;`;
  const colorAssign = vertexColors
    ? `vColor = color;`
    : `vColor = vec3(1.0);`;
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: col },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uFocus: { value: focus },
      uDof: { value: dof },
    },
    vertexShader: `
      uniform float uSize;
      uniform float uFocus;
      uniform float uDof;
      ${colorAttr}
      varying float vAlpha;
      void main() {
        ${colorAssign}
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = -mv.z;
        float blur = smoothstep(0.0, 2.8, abs(dist - uFocus));
        float atten = uSize * (300.0 / max(40.0, dist));
        gl_PointSize = clamp(atten * mix(1.15, 0.35, blur * uDof), 1.0, 48.0);
        vAlpha = mix(1.0, 0.22, blur * uDof);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float d = dot(p, p);
        if (d > 1.0) discard;
        float soft = exp(-d * 3.2) * (1.0 - d);
        gl_FragColor = vec4(uColor * vColor, soft * vAlpha * uOpacity);
      }
    `,
  });
}

function makeBasicPoints(color, size, opacity = 0.85) {
  return new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  });
}

function buildFromMask(mask, q) {
  const disposables = [];
  const group = new THREE.Group();

  const landPos = [];
  const landCol = [];
  const coastPos = [];
  const landThresh = 10;

  const isLandAt = (x, y) => {
    const i = (y * mask.width + x) * 4;
    return mask.data[i] > landThresh;
  };

  for (let y = 0; y < mask.height; y += q.landStep) {
    for (let x = 0; x < mask.width; x += q.landStep) {
      if (!isLandAt(x, y)) continue;
      const elev = mask.data[(y * mask.width + x) * 4] / 255;
      const lon = (x / mask.width) * 360 - 180;
      const lat = 90 - (y / mask.height) * 180;
      // Mild jitter so the cloud doesn't look grid-locked.
      const jLon = lon + (Math.random() - 0.5) * (360 / mask.width) * q.landStep * 0.8;
      const jLat = lat + (Math.random() - 0.5) * (180 / mask.height) * q.landStep * 0.8;
      const r = RADIUS * (0.992 + elev * 0.018);
      const p = latLonToVec3(jLat, jLon, r);
      landPos.push(p.x, p.y, p.z);
      // Cool blue → violet by elevation / latitude (Orbit brand).
      const t = THREE.MathUtils.clamp(elev * 0.7 + (Math.abs(jLat) / 90) * 0.25, 0, 1);
      const c = new THREE.Color().setHSL(0.68 - t * 0.12, 0.75, 0.55 + elev * 0.2);
      landCol.push(c.r, c.g, c.b);
    }
  }

  for (let y = 1; y < mask.height - 1; y += q.coastStep) {
    for (let x = 1; x < mask.width - 1; x += q.coastStep) {
      if (!isLandAt(x, y)) continue;
      const edge =
        !isLandAt(x - 1, y) ||
        !isLandAt(x + 1, y) ||
        !isLandAt(x, y - 1) ||
        !isLandAt(x, y + 1);
      if (!edge) continue;
      const lon = (x / mask.width) * 360 - 180;
      const lat = 90 - (y / mask.height) * 180;
      const p = latLonToVec3(lat, lon, RADIUS * 1.002);
      coastPos.push(p.x, p.y, p.z);
    }
  }

  const landGeo = new THREE.BufferGeometry();
  landGeo.setAttribute("position", new THREE.Float32BufferAttribute(landPos, 3));
  landGeo.setAttribute("color", new THREE.Float32BufferAttribute(landCol, 3));
  disposables.push(landGeo);

  const landMat = q.softPoints
    ? makeSoftPointMaterial({
        color: 0xffffff,
        size: q.landSize,
        opacity: 0.92,
        dof: 0.65,
        vertexColors: true,
      })
    : makeBasicPoints(0x8b9cff, q.landSize, q.phone ? 0.95 : 0.8);
  if (!q.softPoints) landMat.vertexColors = true;
  const land = new THREE.Points(landGeo, landMat);
  group.add(land);
  disposables.push(landMat);

  // Second denser cool layer for depth (desktop only).
  if (q.coreLayer && landPos.length > 60) {
    const corePos = [];
    for (let i = 0; i < landPos.length; i += 9) {
      corePos.push(landPos[i] * 0.985, landPos[i + 1] * 0.985, landPos[i + 2] * 0.985);
    }
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute("position", new THREE.Float32BufferAttribute(corePos, 3));
    const coreMat = q.softPoints
      ? makeSoftPointMaterial({
          color: 0xa855f7,
          size: 3.2,
          opacity: 0.45,
          dof: 0.4,
        })
      : makeBasicPoints(0xa855f7, 0.012, 0.4);
    group.add(new THREE.Points(coreGeo, coreMat));
    disposables.push(coreGeo, coreMat);
  }

  if (coastPos.length) {
    const coastGeo = new THREE.BufferGeometry();
    coastGeo.setAttribute("position", new THREE.Float32BufferAttribute(coastPos, 3));
    const coastMat = q.softPoints
      ? makeSoftPointMaterial({
          color: 0xe9d5ff,
          size: q.coastSize,
          opacity: 1,
          dof: 0.35,
        })
      : makeBasicPoints(0xe9d5ff, q.coastSize, 1);
    group.add(new THREE.Points(coastGeo, coastMat));
    disposables.push(coastGeo, coastMat);

    // Bright coastline polyline stitches (desktop only).
    if (q.coastLines) {
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xc4b5fd,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const segs = [];
      for (let i = 0; i < coastPos.length - 6; i += 6) {
        const a = new THREE.Vector3(coastPos[i], coastPos[i + 1], coastPos[i + 2]);
        const b = new THREE.Vector3(coastPos[i + 3], coastPos[i + 4], coastPos[i + 5]);
        if (a.distanceToSquared(b) < 0.01) {
          segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
      if (segs.length) {
        const lg = new THREE.BufferGeometry();
        lg.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
        group.add(new THREE.LineSegments(lg, lineMat));
        disposables.push(lg, lineMat);
      }
    }
  }

  // Magenta / pink node markers.
  // Phone: bias to Europe / Africa / ME nodes that face the default camera.
  const nodePool = q.phone
    ? NODES.filter(([lat, lon]) => lon > -20 && lon < 60 && lat > -35 && lat < 65)
    : NODES;
  const nodeList = (nodePool.length ? nodePool : NODES).slice(0, q.nodes);
  const nodeGroup = new THREE.Group();
  const spikePos = [];
  const nodeMat = new THREE.MeshBasicMaterial({
    color: 0xf472b6,
    transparent: true,
    opacity: 0.95,
  });
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xe879f9,
    transparent: true,
    opacity: q.phone ? 0.7 : 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(nodeMat, haloMat);

  for (let i = 0; i < nodeList.length; i += 1) {
    const [lat, lon, weight] = nodeList[i];
    const p = latLonToVec3(lat, lon, RADIUS * 1.01);
    const n = p.clone().normalize();
    const s = (q.phone ? 0.024 : 0.018) + weight * (q.phone ? 0.016 : 0.012);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 10), nodeMat);
    dot.position.copy(p);
    nodeGroup.add(dot);
    disposables.push(dot.geometry);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(s * 1.6, s * 2.6, 20),
      haloMat
    );
    halo.position.copy(p);
    halo.lookAt(0, 0, 0);
    nodeGroup.add(halo);
    disposables.push(halo.geometry);

    if (i < q.spikes) {
      const len = (q.phone ? 0.38 : 0.28) + weight * (q.phone ? 0.7 : 0.55) + (i % 3) * 0.08;
      const outer = n.clone().multiplyScalar(RADIUS + len);
      spikePos.push(p.x, p.y, p.z, outer.x, outer.y, outer.z);
      // Tiny tip glow.
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(q.phone ? 0.016 : 0.012, 6, 6),
        new THREE.MeshBasicMaterial({
          color: 0xf5d0fe,
          transparent: true,
          opacity: 0.85,
        })
      );
      tip.position.copy(outer);
      nodeGroup.add(tip);
      disposables.push(tip.geometry, tip.material);
    }
  }
  group.add(nodeGroup);

  if (spikePos.length) {
    const spikeGeo = new THREE.BufferGeometry();
    spikeGeo.setAttribute("position", new THREE.Float32BufferAttribute(spikePos, 3));
    const spikeMat = new THREE.LineBasicMaterial({
      color: 0xd8b4fe,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.LineSegments(spikeGeo, spikeMat));
    disposables.push(spikeGeo, spikeMat);
  }

  // Soft atmospheric particle shell.
  const atmoPos = [];
  for (let i = 0; i < q.atmoCount; i += 1) {
    const lon = Math.random() * 360 - 180;
    const lat = Math.acos(2 * Math.random() - 1) * (180 / Math.PI) - 90;
    const r = RADIUS * (1.04 + Math.random() * 0.22);
    const p = latLonToVec3(lat, lon, r);
    atmoPos.push(p.x, p.y, p.z);
  }
  const atmoGeo = new THREE.BufferGeometry();
  atmoGeo.setAttribute("position", new THREE.Float32BufferAttribute(atmoPos, 3));
  const atmoMat = q.softPoints
    ? makeSoftPointMaterial({
        color: 0x7c3aed,
        size: q.atmoSize,
        opacity: 0.35,
        dof: 0.85,
        focus: 5.4,
      })
    : makeBasicPoints(0x7c3aed, q.atmoSize, q.phone ? 0.4 : 0.28);
  const atmosphere = new THREE.Points(atmoGeo, atmoMat);
  group.add(atmosphere);
  disposables.push(atmoGeo, atmoMat);

  if (q.glowShell) {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.08, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0x4c1d95,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    group.add(shell);
    disposables.push(shell.geometry, shell.material);

    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.02, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    group.add(rim);
    disposables.push(rim.geometry, rim.material);
  }

  // Face Europe / North Africa toward the camera by default.
  group.rotation.y = THREE.MathUtils.degToRad(15);

  return { group, atmosphere, disposables, landCount: landPos.length / 3 };
}

function buildRings(q) {
  const group = new THREE.Group();
  const disposables = [];
  const configs = [
    { r: 2.15, tube: 0.012, rx: 78, rz: -18, color: 0xc4b5fd, glow: 0.3 },
    { r: 2.42, tube: 0.008, rx: 62, rz: 28, color: 0xa855f7, glow: 0.22 },
    { r: 2.7, tube: 0.006, rx: 88, rz: -42, color: 0x818cf8, glow: 0.18 },
  ].slice(0, q.rings);

  configs.forEach((cfg, i) => {
    const g = new THREE.Group();
    g.rotation.x = THREE.MathUtils.degToRad(cfg.rx);
    g.rotation.z = THREE.MathUtils.degToRad(cfg.rz);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.r, cfg.tube, 8, q.ringSeg),
      new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.r, cfg.tube * 3.2, 8, Math.max(48, Math.floor(q.ringSeg * 0.6))),
      new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: cfg.glow,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    g.add(ring, glow);
    disposables.push(ring.geometry, ring.material, glow.geometry, glow.material);
    if (i === 0 && q.id === "high") {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.r, 0.004, 6, 64, Math.PI * 0.45),
        new THREE.MeshBasicMaterial({
          color: 0xf5f3ff,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      g.add(arc);
      disposables.push(arc.geometry, arc.material);
    }
    group.add(g);
  });

  return { group, disposables };
}

function buildStars(count) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = 4.5 + Math.random() * 5.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75;
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xc4b5fd,
    size: 0.016,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return { points: new THREE.Points(geo, mat), disposables: [geo, mat] };
}

export function createGlobe(canvas, { onReady, onFallback } = {}) {
  if (!canvas) {
    onFallback?.("Globe canvas missing");
    return null;
  }
  if (!THREE?.WebGLRenderer) {
    onFallback?.("Three.js failed to load");
    return null;
  }

  const q = qualityProfile();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: q.antialias,
      alpha: true,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
      premultipliedAlpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
  } catch (err) {
    onFallback?.(String(err?.message || err));
    return null;
  }

  const gl = renderer.getContext?.();
  if (!gl) {
    renderer.dispose();
    onFallback?.("WebGL context unavailable");
    return null;
  }

  const scene = new THREE.Scene();
  // Soft vignette-like fog for shallow DOF / depth falloff against black space.
  scene.fog = new THREE.FogExp2(0x050308, q.fogDensity);

  const camera = new THREE.PerspectiveCamera(q.phone ? 38 : 42, 1, 0.1, 100);
  camera.position.set(0, q.camY, q.camZ);

  const root = new THREE.Group();
  scene.add(root);

  const earthHolder = new THREE.Group();
  earthHolder.scale.setScalar(q.earthScale);
  earthHolder.position.y = q.earthY;
  root.add(earthHolder);

  // Let CSS know which hero treatment is active (phone layout vs desktop).
  const heroSection = canvas.closest?.(".section--hero") || canvas.parentElement;
  if (heroSection) {
    heroSection.classList.toggle("hero--phone", Boolean(q.phone));
    heroSection.classList.toggle("hero--desktop", !q.phone);
    heroSection.dataset.orbitQuality = q.id;
  }

  let earth = null;
  let atmosphere = null;
  let ringBundle = null;
  let stars = null;
  const allDispose = [];

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const drag = {
    active: false,
    pointerId: null,
    px: 0,
    py: 0,
    moved: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  };
  // Phone: lighter parallax so the framed Earth stays readable while dragging.
  const parallaxAmp = q.phone
    ? { x: 0.18, y: 0.1 }
    : finePointer
      ? { x: 0.45, y: 0.28 }
      : { x: 0.24, y: 0.14 };
  const camParallax = q.phone ? 0.06 : finePointer ? 0.28 : 0.1;
  const rootParallax = q.phone ? 0.02 : finePointer ? 0.08 : 0.035;
  const dragSens = finePointer && !q.phone ? 0.0055 : 0.0075;
  const lerpHover = finePointer && !q.phone ? 0.08 : 0.14;

  const hero = canvas.parentElement;
  const normFromEvent = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      rect,
    };
  };

  const isUiTarget = (target) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        "a, button, input, textarea, select, label, [role='button'], .hero-copy, .meta-list, .site-chrome, .terminal, .scroll-cue"
      )
    );
  };

  const onPointerMove = (e) => {
    if (drag.active && e.pointerId === drag.pointerId) {
      const dx = e.clientX - drag.px;
      const dy = e.clientY - drag.py;
      if (!drag.moved && dx * dx + dy * dy > 9) drag.moved = true;
      if (drag.moved) {
        if (e.pointerType === "touch") e.preventDefault();
        drag.y += dx * dragSens;
        drag.x += dy * dragSens;
        drag.vx = dx * dragSens;
        drag.vy = dy * dragSens;
        drag.px = e.clientX;
        drag.py = e.clientY;
        const n = normFromEvent(e);
        if (n) {
          pointer.tx = n.x;
          pointer.ty = n.y;
        }
      }
      return;
    }

    if (e.pointerType === "touch" && e.target !== canvas) return;
    const n = normFromEvent(e);
    if (!n) return;
    if (e.pointerType === "touch") {
      if (
        e.clientX < n.rect.left ||
        e.clientX > n.rect.right ||
        e.clientY < n.rect.top ||
        e.clientY > n.rect.bottom
      ) {
        return;
      }
    }
    if (finePointer || e.target === canvas || (hero && hero.contains(e.target))) {
      pointer.tx = THREE.MathUtils.clamp(n.x, -1.2, 1.2);
      pointer.ty = THREE.MathUtils.clamp(n.y, -1.2, 1.2);
    }
  };

  const onPointerDown = (e) => {
    if (drag.active) return;
    if (e.button != null && e.button !== 0) return;
    if (isUiTarget(e.target)) return;
    drag.active = true;
    drag.pointerId = e.pointerId;
    drag.px = e.clientX;
    drag.py = e.clientY;
    drag.moved = false;
    drag.vx = 0;
    drag.vy = 0;
    try {
      canvas.setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    canvas.classList.add("is-dragging");
  };

  const endDrag = (e) => {
    if (!drag.active) return;
    if (e?.pointerId != null && drag.pointerId != null && e.pointerId !== drag.pointerId) {
      return;
    }
    drag.active = false;
    drag.pointerId = null;
    canvas.classList.remove("is-dragging");
    drag.vx = THREE.MathUtils.clamp(drag.vx, -0.08, 0.08);
    drag.vy = THREE.MathUtils.clamp(drag.vy, -0.08, 0.08);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", endDrag, { passive: true });
  window.addEventListener("pointercancel", endDrag, { passive: true });

  let scrollT = 0;
  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      scrollT = window.scrollY / max;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const setSize = () => {
    const { w, h } = readSize(canvas);
    const dpr = Math.min(window.devicePixelRatio || 1, q.dpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  setSize();
  requestAnimationFrame(setSize);
  window.addEventListener("resize", setSize);
  window.addEventListener("orientationchange", setSize);

  let raf = 0;
  let running = true;
  let visible = true;
  let pageVisible = document.visibilityState !== "hidden";
  const clock = new THREE.Clock();
  let lastFrame = 0;
  let spinY = 0;
  const minFrameMs = q.id === "high" ? 1000 / 60 : 1000 / 30;

  const tick = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (!visible || !pageVisible) return;
    if (now - lastFrame < minFrameMs) return;
    const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0.016);
    lastFrame = now;

    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * lerpHover;
    pointer.y += (pointer.ty - pointer.y) * lerpHover;

    if (!REDUCED && earth) {
      if (!drag.active) {
        drag.y += drag.vx;
        drag.x += drag.vy;
        drag.vx *= 0.94;
        drag.vy *= 0.94;
        if (Math.abs(drag.vx) < 0.00005) drag.vx = 0;
        if (Math.abs(drag.vy) < 0.00005) drag.vy = 0;
        spinY += dt * q.spin;
      }

      earthHolder.rotation.y = spinY + drag.y + pointer.x * parallaxAmp.x;
      earthHolder.rotation.x = THREE.MathUtils.clamp(
        drag.x + pointer.y * parallaxAmp.y,
        q.phone ? -0.7 : -1.05,
        q.phone ? 0.7 : 1.05
      );

      if (ringBundle) {
        ringBundle.group.children.forEach((ring, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          ring.rotation.z +=
            dir * (0.0022 + Math.abs(pointer.x) * 0.001) +
            (drag.active ? drag.vx * 0.12 : 0);
          ring.rotation.y = Math.sin(t * 0.18 + i) * 0.06 + pointer.x * 0.04;
        });
      }

      if (atmosphere) {
        atmosphere.rotation.y = t * 0.03 + drag.y * 0.08;
      }
      if (stars) {
        stars.points.rotation.y = t * 0.01;
      }

      camera.position.x = pointer.x * camParallax + drag.y * (q.phone ? 0.02 : 0.04);
      camera.position.y =
        q.camY + pointer.y * (camParallax * 0.5) + scrollT * (q.phone ? 0.2 : 0.35);
      camera.position.z =
        q.camZ - scrollT * (q.phone ? 0.55 : 1.05) - Math.abs(pointer.x) * (q.phone ? 0.03 : 0.06);
      const lookY = q.phone ? q.earthY * 0.55 : 0;
      camera.lookAt(pointer.x * 0.12, lookY + pointer.y * 0.06, 0);

      root.position.x = pointer.x * rootParallax;
      root.position.y = Math.sin(t * 0.35) * (q.phone ? 0.015 : 0.03) + pointer.y * rootParallax * 0.55;
    }

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  const io =
    hero &&
    new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) clock.getDelta();
      },
      { threshold: 0.05 }
    );
  if (hero && io) io.observe(hero);

  const onVisibility = () => {
    pageVisible = document.visibilityState !== "hidden";
  };
  document.addEventListener("visibilitychange", onVisibility);

  let ready = false;
  const finishReady = () => {
    if (ready) return;
    ready = true;
    onReady?.();
  };

  loadLandmask()
    .then((mask) => {
      if (!running) return;
      const built = buildFromMask(mask, q);
      earth = built.group;
      atmosphere = built.atmosphere;
      earthHolder.add(earth);
      allDispose.push(...built.disposables);

      ringBundle = buildRings(q);
      // Phone: rings ride with the framed Earth; desktop: independent root orbits.
      if (q.phone) earthHolder.add(ringBundle.group);
      else root.add(ringBundle.group);
      allDispose.push(...ringBundle.disposables);

      stars = buildStars(q.starCount);
      root.add(stars.points);
      allDispose.push(...stars.disposables);

      finishReady();
    })
    .catch((err) => {
      console.warn("[ORBIT] Particle Earth landmask error:", err);
      // Minimal procedural fallback so WebGL still shows something on-brand.
      const fallback = new THREE.Group();
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(RADIUS, 2),
        new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          wireframe: true,
          transparent: true,
          opacity: 0.45,
        })
      );
      fallback.add(wire);
      earth = fallback;
      earthHolder.add(earth);
      allDispose.push(wire.geometry, wire.material);
      ringBundle = buildRings(q);
      if (q.phone) earthHolder.add(ringBundle.group);
      else root.add(ringBundle.group);
      allDispose.push(...ringBundle.disposables);
      finishReady();
    });

  return {
    quality: q.id,
    setSectionInfluence(sectionId) {
      const map = {
        index: 0,
        playground: 0.25,
        about: 0.45,
        capabilities: 0.55,
        contact: 0.7,
      };
      scrollT = map[sectionId] ?? scrollT;
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("orientationchange", setSize);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
      allDispose.forEach((d) => d?.dispose?.());
      renderer.dispose();
    },
  };
}

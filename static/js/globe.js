/**
 * ORBIT hero globe — wireframe sphere, orbital ring, central eye, particles.
 */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createGlobe(canvas, { onReady, onFallback } = {}) {
  if (!window.THREE) {
    onFallback?.("Three.js failed to load");
    return null;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    onFallback?.(String(err));
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.15, 5.2);

  const root = new THREE.Group();
  scene.add(root);

  const globeGroup = new THREE.Group();
  root.add(globeGroup);

  // Wireframe globe layers
  const violet = 0xa855f7;
  const soft = 0xc4b5fd;

  const sphereGeo = new THREE.SphereGeometry(1.35, 48, 32);
  const wire = new THREE.Mesh(
    sphereGeo,
    new THREE.MeshBasicMaterial({
      color: violet,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
  );
  globeGroup.add(wire);

  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 32, 24),
    new THREE.MeshBasicMaterial({
      color: soft,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    })
  );
  globeGroup.add(inner);

  // Latitude / longitude accents
  const latMat = new THREE.LineBasicMaterial({
    color: soft,
    transparent: true,
    opacity: 0.35,
  });
  for (let i = -2; i <= 2; i += 1) {
    const phi = (Math.PI / 2) * (i / 3);
    const r = Math.cos(phi) * 1.36;
    const y = Math.sin(phi) * 1.36;
    const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(64).map((p) => new THREE.Vector3(p.x, y, p.y));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    globeGroup.add(new THREE.LineLoop(geo, latMat));
  }

  // Atmosphere shell
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 32, 32),
    new THREE.MeshBasicMaterial({
      color: violet,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    })
  );
  globeGroup.add(atmosphere);

  // Central eye
  const eye = new THREE.Group();
  const lid = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshStandardMaterial({
      color: 0x12081c,
      metalness: 0.4,
      roughness: 0.35,
      emissive: 0x2e1065,
      emissiveIntensity: 0.35,
    })
  );
  lid.scale.set(1.4, 0.85, 1);
  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: violet,
      emissiveIntensity: 1.4,
      metalness: 0.2,
      roughness: 0.2,
    })
  );
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.26, 48),
    new THREE.MeshBasicMaterial({
      color: soft,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    })
  );
  halo.rotation.x = Math.PI / 2;
  eye.add(lid, pupil, halo);
  globeGroup.add(eye);

  // Orbital ring
  const ringGroup = new THREE.Group();
  ringGroup.rotation.x = THREE.MathUtils.degToRad(72);
  ringGroup.rotation.z = THREE.MathUtils.degToRad(-18);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.018, 16, 180),
    new THREE.MeshBasicMaterial({ color: soft })
  );
  const ringGlow = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.055, 16, 120),
    new THREE.MeshBasicMaterial({
      color: violet,
      transparent: true,
      opacity: 0.28,
    })
  );
  const trail = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.008, 8, 64, Math.PI * 0.55),
    new THREE.MeshBasicMaterial({
      color: 0xf5f3ff,
      transparent: true,
      opacity: 0.85,
    })
  );
  ringGroup.add(ring, ringGlow, trail);
  root.add(ringGroup);

  // Particles
  const count = window.innerWidth < 720 ? 80 : 160;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = 2.4 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: soft,
      size: 0.02,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    })
  );
  root.add(particles);

  // Lights
  scene.add(new THREE.AmbientLight(0x4c1d95, 0.7));
  const key = new THREE.PointLight(violet, 40, 12);
  key.position.set(2.5, 1.5, 3);
  scene.add(key);
  const fill = new THREE.PointLight(0x7c3aed, 18, 10);
  fill.position.set(-2, -1, 2);
  scene.add(fill);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let scrollT = 0;
  const onScroll = () => {
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    scrollT = window.scrollY / max;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const setSize = () => {
    const parent = canvas.parentElement || document.body;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  setSize();
  window.addEventListener("resize", setSize);

  let raf = 0;
  let running = true;
  const clock = new THREE.Clock();

  const tick = () => {
    if (!running) return;
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    if (!REDUCED) {
      globeGroup.rotation.y = t * 0.12 + pointer.x * 0.35;
      globeGroup.rotation.x = pointer.y * 0.2;
      ringGroup.rotation.z += 0.003 + pointer.x * 0.001;
      ringGroup.rotation.y = Math.sin(t * 0.2) * 0.08;
      particles.rotation.y = t * 0.04;
      eye.rotation.y = -globeGroup.rotation.y * 0.25;
      camera.position.z = 5.2 - scrollT * 1.1;
      camera.position.y = 0.15 + scrollT * 0.35;
      camera.lookAt(0, 0, 0);
      root.position.y = Math.sin(t * 0.4) * 0.04;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();
  onReady?.();

  return {
    setSectionInfluence(sectionId) {
      const map = { index: 0, work: 0.2, playground: 0.35, about: 0.45, capabilities: 0.55, contact: 0.7 };
      scrollT = map[sectionId] ?? scrollT;
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", setSize);
      renderer.dispose();
      sphereGeo.dispose();
    },
  };
}

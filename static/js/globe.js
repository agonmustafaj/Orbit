/**
 * ORBIT hero globe — wireframe sphere, orbital ring, central eye, particles.
 * Three.js is loaded as an ES module (r170+ no longer ships UMD three.min.js).
 * Mobile / iOS: lower geometry, DPR, and pause when off-screen for smooth FPS.
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function qualityProfile() {
  const w = window.innerWidth || 1024;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const mobile = w < 720 || coarse;
  if (saveData || (mobile && w < 400)) {
    return {
      id: "low",
      dpr: 1,
      antialias: false,
      sphereSeg: [24, 16],
      innerSeg: [16, 12],
      atmoSeg: 16,
      ringSeg: 72,
      particles: 36,
      latLines: false,
      atmosphere: false,
      inner: false,
      standardEye: false,
      lights: false,
    };
  }
  if (mobile) {
    return {
      id: "mid",
      dpr: 1.25,
      antialias: false,
      sphereSeg: [32, 20],
      innerSeg: [20, 14],
      atmoSeg: 20,
      ringSeg: 96,
      particles: 56,
      latLines: true,
      atmosphere: false,
      inner: true,
      standardEye: false,
      lights: false,
    };
  }
  return {
    id: "high",
    dpr: 1.75,
    antialias: (window.devicePixelRatio || 1) < 2,
    sphereSeg: [48, 32],
    innerSeg: [32, 24],
    atmoSeg: 32,
    ringSeg: 180,
    particles: 160,
    latLines: true,
    atmosphere: true,
    inner: true,
    standardEye: true,
    lights: true,
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

  // Do NOT probe WebGL on a throwaway canvas first — iOS Safari has a very
  // low simultaneous WebGL context limit; a probe can steal the only slot.
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
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.15, 5.2);

  const root = new THREE.Group();
  scene.add(root);

  const globeGroup = new THREE.Group();
  root.add(globeGroup);

  const violet = 0xa855f7;
  const soft = 0xc4b5fd;

  const sphereGeo = new THREE.SphereGeometry(1.35, q.sphereSeg[0], q.sphereSeg[1]);
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

  if (q.inner) {
    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.18, q.innerSeg[0], q.innerSeg[1]),
        new THREE.MeshBasicMaterial({
          color: soft,
          wireframe: true,
          transparent: true,
          opacity: 0.18,
        })
      )
    );
  }

  if (q.latLines) {
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
      const pts = curve.getPoints(48).map((p) => new THREE.Vector3(p.x, y, p.y));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      globeGroup.add(new THREE.LineLoop(geo, latMat));
    }
  }

  if (q.atmosphere) {
    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.55, q.atmoSeg, q.atmoSeg),
        new THREE.MeshBasicMaterial({
          color: violet,
          transparent: true,
          opacity: 0.06,
          side: THREE.BackSide,
        })
      )
    );
  }

  const eye = new THREE.Group();
  const eyeMat = q.standardEye
    ? new THREE.MeshStandardMaterial({
        color: 0x12081c,
        metalness: 0.4,
        roughness: 0.35,
        emissive: 0x2e1065,
        emissiveIntensity: 0.35,
      })
    : new THREE.MeshBasicMaterial({ color: 0x2e1065 });
  const lid = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), eyeMat);
  lid.scale.set(1.4, 0.85, 1);
  const pupilMat = q.standardEye
    ? new THREE.MeshStandardMaterial({
        color: 0xe9d5ff,
        emissive: violet,
        emissiveIntensity: 1.4,
        metalness: 0.2,
        roughness: 0.2,
      })
    : new THREE.MeshBasicMaterial({ color: soft });
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), pupilMat);
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.26, q.id === "high" ? 48 : 24),
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

  const ringGroup = new THREE.Group();
  ringGroup.rotation.x = THREE.MathUtils.degToRad(72);
  ringGroup.rotation.z = THREE.MathUtils.degToRad(-18);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.018, 12, q.ringSeg),
    new THREE.MeshBasicMaterial({ color: soft })
  );
  const ringGlow = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.055, 12, Math.max(48, Math.floor(q.ringSeg * 0.66))),
    new THREE.MeshBasicMaterial({
      color: violet,
      transparent: true,
      opacity: 0.28,
    })
  );
  ringGroup.add(ring, ringGlow);
  if (q.id === "high") {
    ringGroup.add(
      new THREE.Mesh(
        new THREE.TorusGeometry(2.05, 0.008, 8, 64, Math.PI * 0.55),
        new THREE.MeshBasicMaterial({
          color: 0xf5f3ff,
          transparent: true,
          opacity: 0.85,
        })
      )
    );
  }
  root.add(ringGroup);

  const count = q.particles;
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
      size: q.id === "high" ? 0.02 : 0.028,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    })
  );
  root.add(particles);

  if (q.lights) {
    scene.add(new THREE.AmbientLight(0x4c1d95, 0.7));
    const key = new THREE.PointLight(violet, 40, 12);
    key.position.set(2.5, 1.5, 3);
    scene.add(key);
    const fill = new THREE.PointLight(0x7c3aed, 18, 10);
    fill.position.set(-2, -1, 2);
    scene.add(fill);
  }

  // Cursor / drag state — hover parallax + drag rotate with light inertia.
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const drag = {
    active: false,
    pointerId: null,
    px: 0,
    py: 0,
    moved: false,
    // Accumulated user rotation (radians).
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  };
  // Stronger parallax on desktop; softer on touch-first devices.
  const parallaxAmp = finePointer ? { x: 0.55, y: 0.32 } : { x: 0.28, y: 0.16 };
  const camParallax = finePointer ? 0.32 : 0.12;
  const rootParallax = finePointer ? 0.1 : 0.04;
  const dragSens = finePointer ? 0.0055 : 0.007;
  const lerpHover = finePointer ? 0.08 : 0.12;

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
        // Touch: once we commit to a drag, keep the page from scrolling.
        if (e.pointerType === "touch") e.preventDefault();
        drag.y += dx * dragSens;
        drag.x += dy * dragSens;
        drag.vx = dx * dragSens;
        drag.vy = dy * dragSens;
        drag.px = e.clientX;
        drag.py = e.clientY;
        // Keep hover target under finger/cursor while dragging.
        const n = normFromEvent(e);
        if (n) {
          pointer.tx = n.x;
          pointer.ty = n.y;
        }
      }
      return;
    }

    // Hover parallax — desktop always; touch only while over the hero canvas.
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
    // Fine pointers track across the viewport relative to the hero.
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
    // Soften leftover velocity so inertia feels controlled.
    drag.vx = THREE.MathUtils.clamp(drag.vx, -0.08, 0.08);
    drag.vy = THREE.MathUtils.clamp(drag.vy, -0.08, 0.08);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: false });
  // Hero grid uses pointer-events:none, so grabs on the planet land on the canvas.
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
  // ~30fps on mid/low phones; full 60 on desktop.
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

    if (!REDUCED) {
      // Inertia after release — decay toward rest.
      if (!drag.active) {
        drag.y += drag.vx;
        drag.x += drag.vy;
        drag.vx *= 0.94;
        drag.vy *= 0.94;
        if (Math.abs(drag.vx) < 0.00005) drag.vx = 0;
        if (Math.abs(drag.vy) < 0.00005) drag.vy = 0;
        // Auto-spin only while the user isn't grabbing the planet.
        spinY += dt * 0.12;
      }

      globeGroup.rotation.y = spinY + drag.y + pointer.x * parallaxAmp.x;
      globeGroup.rotation.x = THREE.MathUtils.clamp(
        drag.x + pointer.y * parallaxAmp.y,
        -1.1,
        1.1
      );

      ringGroup.rotation.z += 0.003 + pointer.x * 0.0015 + (drag.active ? drag.vx * 0.15 : 0);
      ringGroup.rotation.y = Math.sin(t * 0.2) * 0.08 + pointer.x * 0.06;
      particles.rotation.y = t * 0.04 + drag.y * 0.15;
      eye.rotation.y = -globeGroup.rotation.y * 0.25;
      eye.rotation.x = -globeGroup.rotation.x * 0.2;

      // Camera + root parallax for depth.
      camera.position.x = pointer.x * camParallax + drag.y * 0.05;
      camera.position.y = 0.15 + pointer.y * (camParallax * 0.55) + scrollT * 0.35;
      camera.position.z = 5.2 - scrollT * 1.1 - Math.abs(pointer.x) * 0.08;
      camera.lookAt(pointer.x * 0.15, pointer.y * 0.08, 0);

      root.position.x = pointer.x * rootParallax;
      root.position.y = Math.sin(t * 0.4) * 0.04 + pointer.y * rootParallax * 0.6;
    }

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);
  onReady?.();

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
      renderer.dispose();
      sphereGeo.dispose();
    },
  };
}

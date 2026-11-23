import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

const instances = new Map();

function clearStage(stage) {
  stage.innerHTML = "";
}

function resizeCanvas(canvas, host) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = host.clientWidth || 320;
  const h = host.clientHeight || 220;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  return { w, h, dpr };
}

function createParticleField(host) {
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let running = true;
  let raf = 0;
  const mouse = { x: 0, y: 0 };
  const count = window.innerWidth < 720 ? 45 : 70;
  let particles = [];

  const resize = () => {
    const { w, h, dpr } = resizeCanvas(canvas, host);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const p of particles) {
      p.x = Math.min(w, Math.max(0, p.x));
      p.y = Math.min(h, Math.max(0, p.y));
    }
    return { w, h };
  };

  const reset = () => {
    const { w, h } = resize();
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));
  };

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };
  canvas.addEventListener("pointermove", onMove);

  const tick = () => {
    if (!running) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 120) {
        p.vx -= (dx / dist) * 0.05;
        p.vy -= (dy / dist) * 0.05;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(196,181,253,0.9)";
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 90) {
          ctx.strokeStyle = `rgba(168,85,247,${1 - d / 90})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(tick);
  };

  reset();
  tick();
  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    reset,
    resize,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointermove", onMove);
    },
  };
}

function createGravitySystem(host) {
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let running = true;
  let raf = 0;
  let gravity = 0.08;
  let bodies = [];

  const spawn = (x, y) => {
    bodies.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      kind: Math.random() > 0.5 ? "circle" : "square",
    });
  };

  const resize = () => {
    resizeCanvas(canvas, host);
  };

  const reset = () => {
    resize();
    bodies = [];
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    for (let i = 0; i < 8; i += 1) spawn(Math.random() * w, Math.random() * h * 0.4);
  };

  const onClick = (e) => {
    const rect = canvas.getBoundingClientRect();
    spawn(e.clientX - rect.left, e.clientY - rect.top);
  };
  canvas.addEventListener("click", onClick);

  const controls = document.createElement("div");
  controls.style.cssText = "position:absolute;left:8px;bottom:8px;display:flex;gap:6px;z-index:2";
  controls.innerHTML = `<button type="button" class="btn btn--ghost" data-g="-">G-</button><button type="button" class="btn btn--ghost" data-g="+">G+</button>`;
  host.style.position = "relative";
  host.appendChild(controls);
  controls.addEventListener("click", (e) => {
    const t = e.target.closest("[data-g]");
    if (!t) return;
    gravity = Math.max(0, gravity + (t.getAttribute("data-g") === "+" ? 0.03 : -0.03));
  });

  const tick = () => {
    if (!running) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = canvas.width / w || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const b of bodies) {
      b.vy += gravity;
      b.x += b.vx;
      b.y += b.vy;
      b.rot += 0.02;
      if (b.x < b.r || b.x > w - b.r) b.vx *= -0.9;
      if (b.y > h - b.r) {
        b.y = h - b.r;
        b.vy *= -0.72;
        b.vx *= 0.98;
      }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.strokeStyle = "#c4b5fd";
      ctx.lineWidth = 1.5;
      if (b.kind === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(-b.r, -b.r, b.r * 2, b.r * 2);
      }
      ctx.restore();
    }
    raf = requestAnimationFrame(tick);
  };

  reset();
  tick();
  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    reset,
    resize,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClick);
      controls.remove();
    },
  };
}

function createObjectExplorer(host) {
  if (!THREE?.WebGLRenderer) {
    host.innerHTML = `<p class="mono stage-placeholder">WebGL unavailable</p>`;
    return { reset() {}, resize() {}, dispose() {} };
  }
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.devicePixelRatio < 2,
      alpha: true,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    host.innerHTML = `<p class="mono stage-placeholder">WebGL unavailable</p>`;
    return { reset() {}, resize() {}, dispose() {} };
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.z = 4;
  const light = new THREE.PointLight(0xa855f7, 60, 20);
  light.position.set(2, 2, 3);
  scene.add(light, new THREE.AmbientLight(0x4c1d95, 0.6));

  let mode = 0;
  let mesh;
  const build = () => {
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    const geos = [
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.TorusKnotGeometry(0.7, 0.22, 100, 16),
      new THREE.OctahedronGeometry(1.1, 0),
    ];
    const mats = [
      new THREE.MeshStandardMaterial({ color: 0x2e1065, emissive: 0xa855f7, emissiveIntensity: 0.4, wireframe: false, metalness: 0.5, roughness: 0.3 }),
      new THREE.MeshBasicMaterial({ color: 0xc4b5fd, wireframe: true }),
      new THREE.MeshStandardMaterial({ color: 0x1a0b24, emissive: 0x7c3aed, emissiveIntensity: 0.8, flatShading: true }),
    ];
    mesh = new THREE.Mesh(geos[mode % 3], mats[mode % 3]);
    scene.add(mesh);
  };
  build();

  let running = true;
  let raf = 0;
  let dragging = false;
  let prev = { x: 0, y: 0 };
  const rot = { x: 0.4, y: 0.6 };

  const onDown = (e) => {
    dragging = true;
    prev = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => {
    dragging = false;
  };
  const onMove = (e) => {
    if (!dragging) return;
    rot.y += (e.clientX - prev.x) * 0.01;
    rot.x += (e.clientY - prev.y) * 0.01;
    prev = { x: e.clientX, y: e.clientY };
  };
  const onWheel = (e) => {
    e.preventDefault();
    camera.position.z = Math.min(8, Math.max(2, camera.position.z + e.deltaY * 0.01));
  };
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("dblclick", () => {
    mode = (mode + 1) % 3;
    build();
  });

  const modeBtn = document.createElement("button");
  modeBtn.type = "button";
  modeBtn.className = "btn btn--ghost";
  modeBtn.textContent = "Mode";
  modeBtn.style.cssText = "position:absolute;right:8px;bottom:8px;z-index:2";
  host.style.position = "relative";
  host.appendChild(modeBtn);
  modeBtn.addEventListener("click", () => {
    mode = (mode + 1) % 3;
    build();
  });

  const setSize = () => {
    const w = host.clientWidth || 320;
    const h = host.clientHeight || 220;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  setSize();
  const onResize = () => setSize();
  window.addEventListener("resize", onResize);

  const tick = () => {
    if (!running) return;
    if (!dragging) rot.y += 0.005;
    if (mesh) {
      mesh.rotation.x = rot.x;
      mesh.rotation.y = rot.y;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  return {
    reset() {
      rot.x = 0.4;
      rot.y = 0.6;
      camera.position.z = 4;
      mode = 0;
      build();
      setSize();
    },
    resize: setSize,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("wheel", onWheel);
      modeBtn.remove();
      renderer.dispose();
    },
  };
}

const factories = {
  "particle-field": createParticleField,
  "gravity-system": createGravitySystem,
  "object-explorer": createObjectExplorer,
};

function experimentTitle(id) {
  const list = window.__ORBIT__?.experiments || [];
  const match = list.find((exp) => exp.id === id);
  return match?.title || id;
}

function afterLayout(fn) {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
}

export function initPlayground() {
  const dialog = document.getElementById("experiment-dialog");
  const dialogStage = document.getElementById("experiment-dialog-stage");
  const dialogTitle = document.getElementById("experiment-dialog-title");
  const dialogClose = document.getElementById("experiment-dialog-close");
  let activeDialogId = null;
  let stageObserver = null;

  const launch = (id, host) => {
    const existing = instances.get(id);
    existing?.dispose?.();
    clearStage(host);
    const factory = factories[id];
    if (!factory) return;
    const inst = factory(host);
    instances.set(id, inst);
  };

  const disposeDialogInstance = () => {
    if (!activeDialogId) return;
    const key = `${activeDialogId}:dialog`;
    instances.get(key)?.dispose?.();
    instances.delete(key);
    activeDialogId = null;
  };

  const stopStageObserver = () => {
    stageObserver?.disconnect?.();
    stageObserver = null;
  };

  const mountExpanded = (id) => {
    if (!dialogStage || !factories[id]) return;
    disposeDialogInstance();
    clearStage(dialogStage);
    const inst = factories[id](dialogStage);
    if (!inst) return;
    activeDialogId = id;
    instances.set(`${id}:dialog`, inst);
    // Ensure buffer matches the now-visible dialog stage (closed dialogs are 0×0).
    inst.resize?.();
    stopStageObserver();
    if (typeof ResizeObserver !== "undefined") {
      stageObserver = new ResizeObserver(() => {
        instances.get(`${id}:dialog`)?.resize?.();
      });
      stageObserver.observe(dialogStage);
    }
  };

  const openExpanded = (id) => {
    if (!dialog || !dialogStage) return;
    if (dialogTitle) dialogTitle.textContent = experimentTitle(id);
    const wasOpen = dialog.open;
    if (!wasOpen) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
    // Wait for dialog layout so host.clientWidth/Height are real.
    afterLayout(() => mountExpanded(id));
  };

  const closeExpanded = () => {
    stopStageObserver();
    disposeDialogInstance();
    if (dialogStage) clearStage(dialogStage);
    if (dialog?.open) dialog.close();
  };

  document.querySelectorAll("[data-launch-experiment]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-launch-experiment");
      const stage = document.querySelector(`[data-stage="${id}"]`);
      if (stage) launch(id, stage);
    });
  });

  document.querySelectorAll("[data-reset-experiment]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-reset-experiment");
      instances.get(id)?.reset?.();
    });
  });

  document.querySelectorAll("[data-expand-experiment]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-expand-experiment");
      if (id) openExpanded(id);
    });
  });

  dialogClose?.addEventListener("click", () => {
    closeExpanded();
  });

  // Escape / backdrop dismiss must dispose the dialog instance too.
  dialog?.addEventListener("close", () => {
    stopStageObserver();
    disposeDialogInstance();
    if (dialogStage) clearStage(dialogStage);
  });
}

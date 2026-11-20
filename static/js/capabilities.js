export function initCapabilities(capabilities = []) {
  const canvas = document.getElementById("constellation-canvas");
  const detail = document.getElementById("constellation-detail");
  const related = document.getElementById("constellation-related");
  const chips = [...document.querySelectorAll("[data-capability]")];
  if (!canvas || !capabilities.length) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = canvas.clientWidth || 900;
  const cssH = 520;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cats = [...new Set(capabilities.map((c) => c.category))];
  const nodes = capabilities.map((cap, i) => {
    const catIndex = cats.indexOf(cap.category);
    const angle = (i / capabilities.length) * Math.PI * 2;
    const radius = 120 + (catIndex % 4) * 35;
    return {
      ...cap,
      x: cssW / 2 + Math.cos(angle) * radius,
      y: cssH / 2 + Math.sin(angle) * radius * 0.72,
      r: 5,
    };
  });

  let activeId = null;

  const show = (cap) => {
    activeId = cap.id;
    if (detail) {
      detail.innerHTML = `
        <p class="mono">${cap.category}</p>
        <h3>${cap.name}</h3>
        <p>${cap.description}</p>
        <p class="mono">USED IN</p>
        <ul id="constellation-related">${(cap.usedIn || []).map((u) => `<li>${u}</li>`).join("")}</ul>
      `;
    }
    chips.forEach((chip) => chip.classList.toggle("is-active", chip.getAttribute("data-capability") === cap.id));
    draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.strokeStyle = "rgba(168,85,247,0.18)";
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        if (nodes[i].category !== nodes[j].category) continue;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
    for (const n of nodes) {
      const active = n.id === activeId;
      ctx.beginPath();
      ctx.arc(n.x, n.y, active ? 8 : n.r, 0, Math.PI * 2);
      ctx.fillStyle = active ? "#e9d5ff" : "#a855f7";
      ctx.fill();
      if (active) {
        ctx.strokeStyle = "rgba(196,181,253,0.7)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(244,240,255,0.75)";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText(n.name, n.x + 10, n.y + 3);
    }
  };

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 16);
    if (hit) show(hit);
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const cap = capabilities.find((c) => c.id === chip.getAttribute("data-capability"));
      if (cap) show(cap);
    });
  });

  draw();
  // Seed with first node
  show(nodes[0]);
}

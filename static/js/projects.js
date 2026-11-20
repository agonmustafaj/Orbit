function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function initProjects(projects = []) {
  const dialog = document.getElementById("project-dialog");
  const content = document.getElementById("project-dialog-content");
  const closeBtn = document.getElementById("project-dialog-close");
  const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

  const open = (id) => {
    const project = byId[id];
    if (!project || !dialog || !content) return;
    content.innerHTML = `
      <p class="mono">PROJECT ${escapeHtml(project.number)} · ${escapeHtml(project.category)}</p>
      <h2 id="project-dialog-title">${escapeHtml(project.title)}</h2>
      <p>${escapeHtml(project.description)}</p>
      <img src="${escapeHtml(project.preview)}" alt="Large preview of ${escapeHtml(project.title)}" width="1600" height="1000" />
      <div class="project-meta">
        <span>Case study</span>
        <a href="${escapeHtml(project.liveUrl || "#work")}">Live demo</a>
        <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
      <h3>Objectives</h3>
      <ul>${(project.objectives || []).map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
      <h3>Design decisions</h3>
      <ul>${(project.designDecisions || []).map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
      <h3>Implementation</h3>
      <ul>${(project.implementation || []).map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
      <h3>Technologies</h3>
      <ul class="tech-list">${(project.technologies || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
      <p>${escapeHtml(project.caseStudy || "")}</p>
      <button type="button" class="btn" data-close-project>Back to work</button>
    `;
    dialog.showModal();
    content.querySelector("[data-close-project]")?.addEventListener("click", () => dialog.close());
    window.lucide?.createIcons();
  };

  document.querySelectorAll("[data-open-project]").forEach((btn) => {
    btn.addEventListener("click", () => open(btn.getAttribute("data-open-project")));
  });

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card.getAttribute("data-project-id"));
      }
    });
  });

  closeBtn?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  return { open };
}

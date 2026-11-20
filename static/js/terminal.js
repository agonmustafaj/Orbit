const HELP = `Available commands:
  help          list commands
  about         ORBIT philosophy
  projects      list demonstration projects
  experiments   list playground experiments
  technologies  stack overview
  contact       contact channels
  clear         clear the screen

Hidden: orbit, matrix, whoami`;

export function initTerminal(data = {}) {
  const root = document.getElementById("terminal");
  const output = document.getElementById("terminal-output");
  const form = document.getElementById("terminal-form");
  const input = document.getElementById("terminal-input");
  const openBtn = document.getElementById("terminal-toggle");
  const closeBtn = document.getElementById("terminal-close");

  const print = (text) => {
    if (!output) return;
    output.textContent += `${text}\n`;
    output.scrollTop = output.scrollHeight;
  };

  const open = () => {
    if (!root) return;
    root.hidden = false;
    if (!output.dataset.booted) {
      print("ORBIT terminal online. Type `help` to begin.");
      output.dataset.booted = "1";
    }
    input?.focus();
  };

  const close = () => {
    if (root) root.hidden = true;
  };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    print(`› ${raw}`);
    switch (cmd) {
      case "help":
        print(HELP);
        break;
      case "about":
        print("ORBIT is a digital universe for ideas, experiments, and craft.\nExplore. Create. Evolve.");
        break;
      case "projects":
        print(
          (data.projects || [])
            .map((p) => `${p.number} — ${p.title} [${p.category}]`)
            .join("\n") || "No projects loaded."
        );
        break;
      case "experiments":
        print(
          (data.experiments || [])
            .map((e) => `${e.number} — ${e.title}`)
            .join("\n") || "No experiments loaded."
        );
        break;
      case "technologies":
        print(
          (data.capabilities || [])
            .map((c) => `${c.name} · ${c.category}`)
            .join("\n")
        );
        break;
      case "contact":
        print(`Email: ${data.email || "hello@orbit.studio"}\nSection: #contact`);
        break;
      case "clear":
        if (output) output.textContent = "";
        break;
      case "orbit":
        print("◯ ring synchronized · violet core stable · welcome traveler");
        break;
      case "matrix":
        print("There is no spoon — only wireframes and intention.");
        break;
      case "whoami":
        print("guest@orbit — explorer status: curious");
        break;
      case "":
        break;
      default:
        print(`Command not found: ${cmd}. Try help.`);
    }
  };

  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    run(value);
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (root?.hidden) open();
      else close();
    }
    if (e.key === "Escape" && root && !root.hidden) close();
  });

  return { open, close, run };
}

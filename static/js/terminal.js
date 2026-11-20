const HELP = `Available commands:
  help          list commands
  about         ORBIT philosophy
  projects      list demonstration projects
  experiments   list playground experiments
  technologies  stack overview
  contact       contact channels
  clear         clear the screen
  exit          close terminal

Hidden: orbit, matrix, whoami`;

export function initTerminal(data = {}) {
  const root = document.getElementById("terminal");
  const output = document.getElementById("terminal-output");
  const form = document.getElementById("terminal-form");
  const input = document.getElementById("terminal-input");
  const openBtn = document.getElementById("terminal-toggle");
  const closeBtn = document.getElementById("terminal-close");

  const isOpen = () => Boolean(root && !root.hasAttribute("hidden"));

  const print = (text) => {
    if (!output) return;
    output.textContent += `${text}\n`;
    output.scrollTop = output.scrollHeight;
  };

  const open = () => {
    if (!root) return;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    openBtn?.setAttribute("aria-expanded", "true");
    if (output && !output.dataset.booted) {
      print("ORBIT terminal online. Type `help` to begin.");
      output.dataset.booted = "1";
    }
    input?.focus();
  };

  const close = () => {
    if (!root) return;
    root.setAttribute("hidden", "");
    root.setAttribute("aria-hidden", "true");
    openBtn?.setAttribute("aria-expanded", "false");
    openBtn?.focus();
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
      case "exit":
      case "quit":
      case "close":
        close();
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

  openBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) close();
    else open();
  });

  // Lucide replaces inner <i> with <svg>; listen on the button and capture clicks on children
  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    run(value);
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (isOpen()) close();
      else open();
      return;
    }
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      close();
    }
  });

  // Ensure closed on init (display:grid must not override [hidden])
  if (root) {
    root.setAttribute("hidden", "");
    root.setAttribute("aria-hidden", "true");
  }
  openBtn?.setAttribute("aria-expanded", "false");

  return { open, close, run };
}

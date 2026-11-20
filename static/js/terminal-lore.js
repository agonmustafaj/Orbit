/**
 * ORBIT terminal lore — curated tech-history Q&A.
 * Simulated answers only; no network, no code execution.
 */

const LORE = [
  {
    id: "first-phone",
    keys: [
      "first phone",
      "first telephone",
      "who invented the phone",
      "invented telephone",
      "alexander graham bell",
      "bell phone",
    ],
    answer:
      "Signal acquired.\nThe telephone is usually credited to Alexander Graham Bell (patent 1876).\nEarlier work by Antonio Meucci and others orbited the same idea — history rarely has a single vertex.\nBell’s design is the one that locked into the public timeline.",
  },
  {
    id: "internet-name",
    keys: [
      "internet was called",
      "what was the internet called",
      "before the internet",
      "arpa",
      "arpanet",
      "original internet name",
      "first name of the internet",
    ],
    answer:
      "Archive ping…\nBefore “the internet,” the backbone was ARPANET (Advanced Research Projects Agency Network), live from 1969.\nPacket switching + shared protocols → the mesh that later became the public Internet.\nSame orbit. Bigger radius.",
  },
  {
    id: "first-pc",
    keys: [
      "first pc",
      "first personal computer",
      "who built the first pc",
      "who made the first computer",
      "altair",
      "ibm pc",
      "first microcomputer",
    ],
    answer:
      "Depends which orbit you measure.\n• Many historians point to the Altair 8800 (1975) as the breakout personal microcomputer kit.\n• The IBM Personal Computer (1981) made “PC” a household word.\n• Earlier machines (Kenbak-1, Xerox Alto, Apple I) are also in the constellation.\nShort answer people want: Altair sparked the hobbyist PC wave; IBM standardized the name.",
  },
  {
    id: "www",
    keys: [
      "world wide web",
      "who invented the web",
      "tim berners",
      "first website",
      "www invented",
      "invented the internet",
    ],
    answer:
      "Clarify the layers:\n• Internet = the network of networks (ARPANET lineage).\n• World Wide Web = documents + links on that network, proposed by Tim Berners-Lee at CERN (1989–1991).\nThe first website lived at CERN. The net was older; the Web made it human-readable.",
  },
  {
    id: "first-email",
    keys: [
      "first email",
      "who invented email",
      "invented e-mail",
      "ray tomlinson",
      "@ symbol email",
    ],
    answer:
      "Ray Tomlinson sent networked email on ARPANET around 1971 and chose @ to split user from host.\nSubject lines and inboxes came later — the protocol kept evolving, like everything in this universe.",
  },
  {
    id: "transistor",
    keys: [
      "transistor",
      "who invented the transistor",
      "bell labs transistor",
      "shockley",
      "bardeen",
      "brattain",
    ],
    answer:
      "Bell Labs, 1947: John Bardeen, Walter Brattain, and William Shockley.\nThe transistor replaced vacuum tubes, shrunk machines, and made modern computing possible.\nWithout it, ORBIT would still be drawing circles on paper.",
  },
  {
    id: "first-bug",
    keys: [
      "first bug",
      "computer bug",
      "grace hopper bug",
      "moth bug",
      "debugging origin",
    ],
    answer:
      "Legend mode: In 1947, a moth was found in Relay #70 of the Harvard Mark II — logged as the first actual “bug.”\nGrace Hopper’s team popularized the story. The word “bug” for glitches was older; the moth made it immortal.",
  },
  {
    id: "unix",
    keys: [
      "unix",
      "who created unix",
      "bell labs unix",
      "thompson ritchie",
      "linux origin",
    ],
    answer:
      "UNIX began at Bell Labs (~1969) with Ken Thompson, Dennis Ritchie, and colleagues.\nC was forged to rewrite it. Linux (1991, Linus Torvalds) later entered the same gravitational well.\nTerminal culture descends from that lineage — you’re standing in it.",
  },
  {
    id: "gui",
    keys: [
      "first gui",
      "graphical user interface",
      "xerox alto",
      "who invented the gui",
      "macintosh gui",
    ],
    answer:
      "The Xerox Alto (1973) defined the modern GUI: windows, icons, mouse.\nApple’s Macintosh (1984) and Microsoft Windows brought the idea to mass orbit.\nXerox invented the language; others amplified the signal.",
  },
  {
    id: "dns",
    keys: [
      "dns",
      "domain name system",
      "who invented dns",
      "hosts file",
      "name servers",
    ],
    answer:
      "DNS (Domain Name System) arrived in the 1980s (Mockapetris et al.) to replace flat HOSTS.TXT files.\nNames ↔ numbers. Without DNS, you’d be typing IP addresses into every browser like a time traveler with a punch card.",
  },
  {
    id: "tcpip",
    keys: [
      "tcp/ip",
      "tcp ip",
      "vint cerf",
      "robert kahn",
      "internet protocol",
      "who invented tcp",
    ],
    answer:
      "Vint Cerf and Bob Kahn designed TCP/IP in the 1970s — the protocol stack that let different networks speak one language.\nJanuary 1, 1983 (“flag day”) ARPANET cut over to TCP/IP. That’s when the modern Internet’s grammar locked in.",
  },
  {
    id: "first-programmer",
    keys: [
      "first programmer",
      "ada lovelace",
      "first computer program",
      "who was the first coder",
    ],
    answer:
      "Ada Lovelace (1840s) wrote notes on Babbage’s Analytical Engine that include what many call the first published algorithm intended for a machine.\nShe saw computers as more than calculators — creative engines. ORBIT salutes that foresight.",
  },
  {
    id: "moore",
    keys: [
      "moore's law",
      "moores law",
      "gordon moore",
      "transistor doubling",
    ],
    answer:
      "Gordon Moore (1965) observed that transistor counts on chips tended to double on a regular cadence.\nIt became a self-fulfilling roadmap for the industry — until physics started arguing back.\nProgress still moves; the slope just got more interesting.",
  },
  {
    id: "wifi",
    keys: [
      "wifi",
      "wi-fi",
      "who invented wifi",
      "802.11",
      "wireless ethernet",
    ],
    answer:
      "Wi-Fi grows from 802.11 standards (IEEE) with deep roots in earlier wireless research (including CSIRO work often cited in patent history).\nThe brand “Wi-Fi” is marketing; the tech is coordinated radio + protocols.\nInvisible orbits connecting devices.",
  },
  {
    id: "http",
    keys: [
      "http",
      "https",
      "http status",
      "what is http",
    ],
    answer:
      "HTTP = Hypertext Transfer Protocol — how browsers ask servers for documents.\nBerners-Lee’s Web stack: HTML + URL + HTTP.\nHTTPS adds TLS encryption so the conversation can’t be casually intercepted.\nStatus codes are the Web’s body language: 200 ok, 404 lost, 500 the server blinked.",
  },
  {
    id: "javascript",
    keys: [
      "javascript invented",
      "who created javascript",
      "brendan eich",
      "js history",
      "mocha livescript",
    ],
    answer:
      "Brendan Eich created JavaScript in ~10 days at Netscape (1995). Working names included Mocha and LiveScript.\nIt was meant to script the browser. It accidentally became the language of the interactive web — including this terminal.",
  },
  {
    id: "python",
    keys: [
      "python invented",
      "who created python",
      "guido van rossum",
      "python history",
    ],
    answer:
      "Guido van Rossum started Python in the late 1980s; 0.9.0 appeared in 1991.\nNamed after Monty Python, not snakes. Readability was the mission.\nORBIT’s local API speaks Python/FastAPI — same philosophy, different altitude.",
  },
  {
    id: "git",
    keys: [
      "who invented git",
      "git created",
      "linus git",
      "version control history",
    ],
    answer:
      "Linus Torvalds built Git in 2005 to manage Linux kernel development after BitKeeper access ended.\nDistributed version control: every clone is a full history.\nThis site’s deploys ride that same tooling culture.",
  },
  {
    id: "space-race-computer",
    keys: [
      "apollo computer",
      "agc",
      "moon landing computer",
      "nasa computer",
    ],
    answer:
      "The Apollo Guidance Computer (AGC) flew humans to the moon with ~64KB of memory and rope-core programs woven by hand.\nMargaret Hamilton’s software team proved rigorous software could be mission-critical.\nSmall machine. Enormous orbit.",
  },
  {
    id: "ask",
    keys: ["history", "tech history", "lore", "trivia", "quiz"],
    answer:
      "Tech-history channel open.\nTry asking naturally, e.g.:\n  what was the internet called\n  who built the first pc\n  first phone\n  who invented the web\n  first email\n  transistor\n  unix\nOr type `topics` for the full constellation.",
  },
];

const TOPICS = `Tech-history topics in range:
  first phone · internet / arpanet · first pc · world wide web
  first email · transistor · first bug · unix · gui · dns
  tcp/ip · ada lovelace · moore's law · wifi · http · javascript
  python · git · apollo computer

Ask in plain language. Example: "what was the internet called before?"`;

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s/@.+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchLore(raw) {
  const q = normalize(raw);
  if (!q) return null;

  if (q === "topics" || q === "lore" || q === "history" || q === "trivia") {
    return TOPICS;
  }

  // Prefer longer key matches
  let best = null;
  let bestScore = 0;
  for (const entry of LORE) {
    for (const key of entry.keys) {
      const k = normalize(key);
      if (!k) continue;
      if (q === k || q.includes(k) || k.split(" ").every((part) => q.includes(part))) {
        const score = k.length;
        if (score > bestScore) {
          bestScore = score;
          best = entry.answer;
        }
      }
    }
  }
  return best;
}

export function loreHelpLine() {
  return "Also: ask tech-history questions — try `topics` or “what was the internet called”.";
}

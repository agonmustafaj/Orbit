# ORBIT

Immersive digital experience — Three.js globe, playground, FastAPI (local) / Cloudflare Pages (production).

**Production:** https://orbit.pages.dev/ (Git-connected Pages project `orbit`)

Standalone project — not the personal portfolio.

## Deploy pattern (same as Agon’s live sites)

**Cloudflare Pages ↔ GitHub Connect to Git.** No GitHub Actions secrets.

| Project | How it deploys |
| --- | --- |
| hoxhahandwerk | CF Pages Git + dashboard settings |
| roofman | CF Pages Git + `npm run build` → `dist` |
| agodev | Prefer CF Pages Git; GHA workflow exists but fails without secrets (unused) |

### Dashboard settings for Orbit

| Setting | Value |
| --- | --- |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `dist` |

Optional contact secrets in the **Cloudflare** dashboard only: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`.

### Optional local one-shot

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name=orbit
```

## Local (FastAPI)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Edit content in `app/data/portfolio.json`. Run `npm run build` to refresh `dist/` for Pages.

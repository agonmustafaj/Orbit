# ORBIT

Immersive digital experience — interactive Three.js globe, experimental playground, FastAPI (local) / Cloudflare Pages (production).

**Production:** https://orbit-83j.pages.dev/

ORBIT is a standalone project. It is not the personal portfolio and must stay independent.

## Stack

- **Frontend:** HTML, CSS, JavaScript, Three.js, GSAP, Lucide
- **Local backend:** Python 3.12+, FastAPI, Pydantic, Uvicorn
- **Production:** Cloudflare Pages (`orbit-83j`) + Advanced Mode `_worker.js` for `/api/*`

## Local development (FastAPI)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/

### API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/projects` | All projects |
| GET | `/api/projects/{id}` | Single project |
| GET | `/api/site` | Site + capabilities metadata |
| POST | `/api/contact` | Contact form (Pydantic-validated) |

Contact email delivery is optional. Without `RESEND_API_KEY` + `CONTACT_FROM` + `CONTACT_TO`, the API validates and accepts messages but does **not** claim email delivery.

## Cloudflare Pages deploy

Project name: **`orbit-83j`** → https://orbit-83j.pages.dev/

```bash
source .venv/bin/activate
python scripts/build_pages.py
npx wrangler pages deploy dist --project-name=orbit-83j
```

Required credentials:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` (Cloudflare Pages Edit + Account Settings Read)

Or connect the GitHub repo in the Cloudflare dashboard (Framework: None / build: `python scripts/build_pages.py` / output: `dist`).

Optional Pages secrets for email: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`.

## Content

Edit demonstration projects and capabilities in `app/data/portfolio.json`. Rebuild Pages after changes.

## License

Private demonstration project for portfolio showcase.

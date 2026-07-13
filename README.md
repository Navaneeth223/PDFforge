# 📄 PDFforge — Free, Open-Source PDF Toolkit

> Merge, split, compress, convert, edit, sign & more. **No subscriptions. No watermarks. No limits.** Self-hostable.

PDFforge is a free, open-source PDF toolkit that runs entirely in your browser (or self-hosted). Powered by PyMuPDF + FastAPI + Next.js.

🌐 **Live demo:** https://pd-fforge.vercel.app

---

## ✨ Features

- 🔀 **Merge / Split** PDFs
- 🗜️ **Compress** without quality loss
- 🔄 **Convert** PDF ⇄ images / Office / text
- ✏️ **Edit** text & pages
- ✍️ **Sign** documents
- 🔎 **OCR** (extract text from scanned PDFs)
- 🔒 **Privacy-first** — runs client-side; self-hostable via Docker

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python, PyMuPDF |
| AI/OCR | Tesseract / vision models |
| Deploy | Docker, Vercel |

## 📸 Screenshots

> _Add screenshots to `docs/screenshots/` and reference them here:_
> - `docs/screenshots/merge.png` — merge tool UI
> - `docs/screenshots/compress.png` — compression results
> - `docs/screenshots/ocr.png` — OCR output

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/Navaneeth223/PDFforge.git
cd PDFforge

# With Docker
docker compose up --build

# Or run locally
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
cd frontend && npm install && npm run dev
```

## 🤝 Built by

**Navaneeth KV** — Full Stack / MERN developer, AI-assisted.
🌐 Portfolio: https://portfolio-one-bice-26.vercel.app · 💼 linkedin.com/in/navaneeth-kv-270386214

⭐ Free forever — star the repo if it helps!

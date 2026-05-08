# Docxio

Every document tool. Free forever. Open source.

![Docxio Banner](https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=200&section=header&text=Docxio&fontSize=50&fontColor=ffffff&animation=fadeIn)

## Features

- **📄 PDF Tools:** Merge, split, compress, convert, sign, and protect.
- **📝 Word Tools:** Word to PDF/HTML/Text, merge docs, and remove passwords.
- **📊 Excel Tools:** Excel to PDF/CSV/JSON and merge sheets.
- **📽️ PowerPoint Tools:** PPT to PDF, images, or video (slideshow).
- **🖼️ Image Tools:** Resize, compress, convert, and AI background removal.
- **✏️ Canvas PDF Editor:** A flagship visual editor to drag-and-drop elements on any PDF.
- **🔄 Universal Converter:** Smart "from → to" format matrix for all your document needs.
- **100% Private:** Open-source and self-hostable. Your files never leave your infrastructure.
- **Asynchronous Processing:** Built on Celery and Redis to handle massive files without blocking.

## Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS, Framer Motion, Zustand
- **Backend:** FastAPI, Python 3.11, PyMuPDF, Celery
- **Infrastructure:** Docker, Docker Compose, Redis, Nginx

## Deployment

PDFForge can be deployed in two primary ways:

### 1. Offline / Local (Self-Hosted via Docker)
This is the recommended way for maximum privacy.
```bash
# Clone and enter repo
git clone https://github.com/Navaneeth223/docxio.git && cd docxio

# Start everything
docker-compose up -d --build
```
Access at `http://localhost`.

### 2. Online / Cloud (Vercel + Render)
For hosting on the web with a live URL:

#### **Backend (Render)**
1. Fork this repository.
2. Connect your GitHub to [Render](https://render.com).
3. Click **New +** > **Blueprint**.
4. Select the `render.yaml` file from your repo.
5. Set `ALLOWED_ORIGINS` to your future Vercel URL.
6. Render will automatically deploy the API, Celery Worker, and Redis.

#### **Frontend (Vercel)**
1. Connect your GitHub to [Vercel](https://vercel.com).
2. Select the `frontend` directory.
3. Set Environment Variable: `NEXT_PUBLIC_API_URL` to your Render API URL.
4. Deploy.

## manual Development Setup

If you wish to run the services manually without Docker:

### Backend

1. Install Python 3.11+.
2. Install system dependencies: `tesseract-ocr`, `libreoffice`, `weasyprint`.
3. Setup virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
4. Start Redis server locally.
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
6. Start the Celery Worker (in a new terminal):
   ```bash
   celery -A services.job_queue worker --loglevel=info
   ```

### Frontend

1. Install Node.js 18+.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Whether it's adding a new tool, improving the UI, or fixing bugs, please open an issue or submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

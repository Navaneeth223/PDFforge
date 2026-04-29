# PDFForge

PDFForge is a powerful, self-hostable, and completely free open-source PDF toolkit. Forget vendor lock-in, uploading sensitive documents to third-party servers, and expensive subscriptions. PDFForge brings 25+ PDF manipulation tools directly to your infrastructure.

![PDFForge Banner](./public/banner.png)

## Features

- **Merge & Split:** Combine multiple PDFs or extract exact page ranges.
- **Compress:** Drastically reduce PDF file sizes while maintaining quality.
- **Convert:** Transform PDFs to Word, Excel, Images, Text, and vice-versa.
- **Security:** Encrypt with AES-256, unlock documents, and permanently redact sensitive information.
- **Edit:** Rotate pages, add watermarks, sign documents, edit metadata, and repair corrupted files.
- **100% Private:** Your files never leave your server. Auto-cleanup ensures files are deleted instantly upon completion.
- **Asynchronous Processing:** Built on Celery and Redis to handle massive files without blocking.

## Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS, Framer Motion, Zustand
- **Backend:** FastAPI, Python 3.11, PyMuPDF, Celery
- **Infrastructure:** Docker, Docker Compose, Redis, Nginx

## Quick Start (Docker)

The fastest way to run PDFForge is using Docker Compose. This will automatically spin up the frontend, backend, Redis broker, Celery worker, and Nginx proxy.

```bash
# Clone the repository
git clone https://github.com/yourusername/PDFforge.git
cd PDFforge

# Copy the environment file
cp .env.example .env

# Build and start all containers
docker-compose up -d --build
```

Access the application at: `http://localhost:3000`

## Manual Development Setup

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

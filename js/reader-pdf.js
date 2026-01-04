let zoomLevel = 1;
let baseScale = 1;
let isLocked = false;

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;

const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo  = document.getElementById("pageInfo");
const titleBox  = document.getElementById("bookTitle");

const PDF_BASE = "https://cdn.jsdelivr.net/gh/rzee-Jpn/aksa@main/data/books";

let pdfDoc = null;
let currentPage = 1;
let panelSize   = 10;
let totalPages  = 0;

/* ===== Validasi ===== */
if (!bookId) {
  container.innerHTML = "<p style='text-align:center'>❌ Parameter ?book= tidak ada</p>";
  throw new Error("Missing book param");
}

/* ===== Load meta ===== */
fetch(`${PDF_BASE}/${bookId}/meta.json`)
  .then(r => r.json())
  .then(meta => titleBox.textContent = meta.title)
  .catch(() => titleBox.textContent = bookId);

/* ===== Load PDF ===== */
pdfjsLib.getDocument(`${PDF_BASE}/${bookId}/book.pdf`).promise.then(async pdf => {
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });

  baseScale = (container.clientWidth - 20) / viewport.width;
  zoomLevel = baseScale; // FIT WIDTH = 100%

  const saved = localStorage.getItem(bookId + "_page");
  if (saved) currentPage = parseInt(saved);

  renderPanel();
});

/* ===== Render Panel ===== */
function renderPanel() {
  container.innerHTML = "";

  const start = currentPage;
  const end   = Math.min(currentPage + panelSize - 1, totalPages);

  for (let i = start; i <= end; i++) {
    renderPage(i);
  }

  const zoomPercent = Math.round((zoomLevel / baseScale) * 100);
  pageInfo.textContent = `Zoom ${zoomPercent}% | Hal ${start}–${end} / ${totalPages}`;

  localStorage.setItem(bookId + "_page", start);
}

/* ===== Render Page ===== */
function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: zoomLevel });

    const wrapper = document.createElement("div");
    wrapper.className = "canvasWrapper";

    const canvas = document.createElement("canvas");
    canvas.width  = viewport.width;
    canvas.height = viewport.height;

    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    page.render({
      canvasContext: canvas.getContext("2d"),
      viewport
    });
  });
}

/* ===== Navigation ===== */
document.getElementById("nextBtn").onclick = () => {
  if (currentPage + panelSize <= totalPages) {
    currentPage += panelSize;
    renderPanel();
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (currentPage - panelSize >= 1) {
    currentPage -= panelSize;
    renderPanel();
  }
};

/* ===== Zoom Control ===== */
document.getElementById("zoomIn").onclick = () => {
  zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
  renderPanel();
};

document.getElementById("zoomOut").onclick = () => {
  zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
  renderPanel();
};

/* ===== Lock Horizontal Scroll ===== */
document.getElementById("lockBtn").onclick = () => {
  isLocked = !isLocked;

  if (isLocked) {
    container.classList.add("lock-x");
    container.scrollLeft = 0;
  } else {
    container.classList.remove("lock-x");
  }
};
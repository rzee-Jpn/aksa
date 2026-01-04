let zoomLevel = 1.4;
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 2.5;
const PANEL_SIZE = 10;

const PDF_BASE = "https://cdn.jsdelivr.net/gh/rzee-Jpn/aksa@main/data/books";

const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo  = document.getElementById("pageInfo");
const titleBox  = document.getElementById("bookTitle");

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;

if (!bookId) {
  container.innerHTML = "<p style='text-align:center'>❌ Parameter ?book= tidak ada</p>";
  throw new Error("Missing book param");
}

// Load meta
fetch(`${PDF_BASE}/${bookId}/meta.json`)
  .then(r => r.json())
  .then(meta => titleBox.textContent = meta.title)
  .catch(() => titleBox.textContent = bookId);

// Load PDF
pdfjsLib.getDocument(`${PDF_BASE}/${bookId}/book.pdf`).promise
.then(pdf => {
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  const saved = localStorage.getItem(bookId + "_page");
  if (saved) currentPage = parseInt(saved);

  renderPanel();
})
.catch(err => {
  console.error(err);
  container.innerHTML = "<p style='text-align:center'>❌ PDF gagal dimuat</p>";
});

// Render panel
function renderPanel() {
  const start = currentPage;
  const end   = Math.min(start + PANEL_SIZE - 1, totalPages);

  // Reuse scroll pos
  const scrollTop = container.scrollTop;

  container.innerHTML = "";
  for (let i = start; i <= end; i++) renderPage(i);

  pageInfo.textContent = `Hal ${start}–${end} / ${totalPages}`;
  localStorage.setItem(bookId + "_page", start);

  // Restore scroll
  container.scrollTop = scrollTop;
}

// Render page
function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const viewport = page.getViewport({ scale: zoomLevel });
    canvas.width  = viewport.width;
    canvas.height = viewport.height;

    container.appendChild(canvas);
    page.render({ canvasContext: ctx, viewport });
  });
}

// Panel nav
document.getElementById("nextBtn").onclick = () => {
  if (currentPage + PANEL_SIZE <= totalPages) {
    currentPage += PANEL_SIZE;
    renderPanel();
  }
};
document.getElementById("prevBtn").onclick = () => {
  if (currentPage - PANEL_SIZE >= 1) {
    currentPage -= PANEL_SIZE;
    renderPanel();
  }
};

// Floating Zoom
document.getElementById("zoomIn").onclick = () => {
  if (zoomLevel < ZOOM_MAX) { zoomLevel += 0.2; renderPanel(); }
};
document.getElementById("zoomOut").onclick = () => {
  if (zoomLevel > ZOOM_MIN) { zoomLevel -= 0.2; renderPanel(); }
};
// ================================
// PARAM & ELEMENT
// ================================
const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo = document.getElementById("pageInfo");
const titleBox = document.getElementById("bookTitle");

let pdfDoc = null;
let currentPage = 1;
let panelSize = 10;
let totalPages = 0;

// ================================
// LOAD META (LOKAL / PAGES)
// ================================
fetch(`data/books/${bookId}/meta.json`)
  .then(r => {
    if (!r.ok) throw new Error("Meta tidak ditemukan");
    return r.json();
  })
  .then(meta => {
    titleBox.textContent = meta.title || "Tanpa Judul";
  })
  .catch(() => {
    titleBox.textContent = "Buku";
  });

// ================================
// PDF SOURCE (CDN – FIX 404)
// ================================
const pdfURL =
  `https://cdn.jsdelivr.net/gh/rzee-Jpn/aksa@main/data/books/${bookId}/book.pdf`;

// ================================
// LOAD PDF
// ================================
pdfjsLib.getDocument(pdfURL).promise.then(pdf => {
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  const saved = localStorage.getItem(bookId + "_page");
  if (saved) currentPage = parseInt(saved, 10) || 1;

  renderPanel();
}).catch(err => {
  container.innerHTML = `<p style="padding:2rem;text-align:center">
    ❌ Gagal memuat PDF<br>${err.message}
  </p>`;
});

// ================================
// RENDER PANEL
// ================================
function renderPanel() {
  container.innerHTML = "";

  const start = currentPage;
  const end = Math.min(start + panelSize - 1, totalPages);

  for (let i = start; i <= end; i++) {
    renderPage(i);
  }

  pageInfo.textContent = `Hal ${start}–${end} / ${totalPages}`;
  localStorage.setItem(bookId + "_page", start);
}

// ================================
// RENDER SINGLE PAGE
// ================================
function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const viewport = page.getViewport({ scale: 1.4 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className = "pdf-page";

    container.appendChild(canvas);

    page.render({
      canvasContext: ctx,
      viewport: viewport
    });
  });
}

// ================================
// NAVIGATION
// ================================
document.getElementById("nextBtn").onclick = () => {
  if (currentPage + panelSize <= totalPages) {
    currentPage += panelSize;
    renderPanel();
    window.scrollTo(0, 0);
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (currentPage - panelSize >= 1) {
    currentPage -= panelSize;
    renderPanel();
    window.scrollTo(0, 0);
  }
};
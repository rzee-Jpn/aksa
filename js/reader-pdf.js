const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo = document.getElementById("pageInfo");
const titleBox = document.getElementById("bookTitle");

/* 🔥 WAJIB GitHub Pages, JANGAN jsDelivr */
const PDF_BASE = "https://rzee-jpn.github.io/aksa/data/books";

let pdfDoc = null;
let currentPage = 1;
let panelSize = 5;
let totalPages = 0;

/* sanity check */
if (!bookId) {
  container.innerHTML = "<p>❌ Parameter ?book= tidak ada</p>";
  throw new Error("book param missing");
}

/* load meta */
fetch(`${PDF_BASE}/${bookId}/meta.json`)
  .then(r => r.json())
  .then(meta => titleBox.textContent = meta.title)
  .catch(() => titleBox.textContent = bookId);

/* load PDF */
container.innerHTML = "<p>📄 Memuat PDF…</p>";

pdfjsLib.getDocument({
  url: `${PDF_BASE}/${bookId}/book.pdf`
}).promise.then(pdf => {
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  const saved = localStorage.getItem(bookId + "_page");
  if (saved) currentPage = parseInt(saved);

  renderPanel();
}).catch(err => {
  console.error("PDF ERROR:", err);
  container.innerHTML = "<p>❌ PDF gagal dimuat</p>";
});

function renderPanel() {
  container.innerHTML = "";
  const start = currentPage;
  const end = Math.min(start + panelSize - 1, totalPages);

  for (let i = start; i <= end; i++) renderPage(i);

  pageInfo.textContent = `Hal ${start}–${end} / ${totalPages}`;
  localStorage.setItem(bookId + "_page", start);
}

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const viewport = page.getViewport({ scale: 1.4 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.marginBottom = "1.5rem";

    container.appendChild(canvas);
    page.render({ canvasContext: ctx, viewport });
  });
}

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
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";

const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo = document.getElementById("pageInfo");

let pdfDoc = null;
let currentPage = 1;
const panelSize = 10;
let totalPages = 0;

// ===== GUARD =====
if (!bookId) {
  container.innerHTML = "<p style='padding:2rem'>Buku tidak ditemukan</p>";
  throw new Error("Book ID missing");
}

// ===== LOAD PDF =====
const pdfPath = `data/books/${bookId}/book.pdf`;

pdfjsLib.getDocument(pdfPath).promise
  .then(pdf => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;

    const saved = localStorage.getItem(bookId + "_page");
    if (saved) currentPage = parseInt(saved);

    renderPanel();
  })
  .catch(err => {
    container.innerHTML = `<p style="padding:2rem;color:red">
      Gagal memuat PDF<br>${err.message}
    </p>`;
    console.error(err);
  });

// ===== RENDER PANEL =====
function renderPanel() {
  container.innerHTML = "";

  const start = currentPage;
  const end = Math.min(start + panelSize - 1, totalPages);

  for (let i = start; i <= end; i++) {
    renderPage(i);
  }

  pageInfo.textContent = `${start}–${end} / ${totalPages}`;
  localStorage.setItem(bookId + "_page", start);
}

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const viewport = page.getViewport({ scale: 1.4 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    canvas.style.display = "block";
    canvas.style.margin = "0 auto 1.5rem";

    container.appendChild(canvas);
    page.render({ canvasContext: ctx, viewport });
  });
}

// ===== NAVIGATION =====
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

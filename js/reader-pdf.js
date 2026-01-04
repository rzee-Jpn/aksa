const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo = document.getElementById("pageInfo");
const titleBox = document.getElementById("bookTitle");

const PDF_BASE = "https://rzee-jpn.github.io/aksa/data/books";

if (!bookId) {
  container.innerHTML = "<p>❌ Parameter buku tidak ada</p>";
  throw new Error("book param missing");
}

console.log("PDFJS:", window.pdfjsLib);
console.log("BOOK:", bookId);
console.log("PDF:", `${PDF_BASE}/${bookId}/book.pdf`);

let pdfDoc = null;
let currentPage = 1;
let panelSize = 5;
let totalPages = 0;

fetch(`${PDF_BASE}/${bookId}/meta.json`)
  .then(r => r.json())
  .then(meta => titleBox.textContent = meta.title)
  .catch(() => titleBox.textContent = bookId);

pdfjsLib.getDocument(`${PDF_BASE}/${bookId}/book.pdf`)
  .promise.then(pdf => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    renderPanel();
  }).catch(err => {
    console.error(err);
    container.innerHTML = "❌ PDF gagal dimuat";
  });

function renderPanel() {
  container.innerHTML = "";
  const start = currentPage;
  const end = Math.min(start + panelSize - 1, totalPages);

  for (let i = start; i <= end; i++) {
    pdfDoc.getPage(i).then(page => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 1.3 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      container.appendChild(canvas);
      page.render({ canvasContext: ctx, viewport });
    });
  }

  pageInfo.textContent = `${start}-${end} / ${totalPages}`;
}
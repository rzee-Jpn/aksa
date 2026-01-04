const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo = document.getElementById("pageInfo");
const titleBox = document.getElementById("bookTitle");

const BASE = "data/books";

let pdfDoc = null;
let currentPage = 1;
let panelSize = 3;
let totalPages = 0;

if (!bookId) {
  container.innerHTML = "❌ parameter book tidak ada";
  throw "NO BOOK";
}

/* meta */
fetch(`${BASE}/${bookId}/meta.json`)
  .then(r => r.json())
  .then(m => titleBox.textContent = m.title)
  .catch(() => titleBox.textContent = bookId);

/* PDF */
container.innerHTML = "📄 Memuat buku…";

pdfjsLib.getDocument(`${BASE}/${bookId}/book.pdf`).promise
.then(pdf => {
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  console.log("PDF OK:", totalPages, "halaman");

  render();
})
.catch(err => {
  console.error(err);
  container.innerHTML = "❌ PDF gagal dimuat";
});

function render() {
  container.innerHTML = "";
  const start = currentPage;
  const end = Math.min(start + panelSize - 1, totalPages);

  for (let i = start; i <= end; i++) {
    pdfDoc.getPage(i).then(page => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const v = page.getViewport({ scale: 1.4 });
      canvas.width = v.width;
      canvas.height = v.height;
      canvas.style.display = "block";
      canvas.style.margin = "0 auto 1.5rem";

      container.appendChild(canvas);
      page.render({ canvasContext: ctx, viewport: v });
    });
  }

  pageInfo.textContent = `${start}–${end} / ${totalPages}`;
}

document.getElementById("nextBtn").onclick = () => {
  if (currentPage + panelSize <= totalPages) {
    currentPage += panelSize;
    render();
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 1) {
    currentPage -= panelSize;
    if (currentPage < 1) currentPage = 1;
    render();
  }
};
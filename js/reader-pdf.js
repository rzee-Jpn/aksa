let zoomLevel = 1.0;
const ZOOM_MIN = 0.5;
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
if(!bookId){
  container.innerHTML = "<p style='text-align:center'>❌ Parameter ?book= tidak ada</p>";
  throw new Error("Missing book param");
}

/* ===== Load meta ===== */
fetch(`${PDF_BASE}/${bookId}/meta.json`)
  .then(r => r.json())
  .then(meta => titleBox.textContent = meta.title)
  .catch(() => titleBox.textContent = bookId);

/* ===== Load PDF ===== */
pdfjsLib.getDocument(`${PDF_BASE}/${bookId}/book.pdf`).promise
.then(pdf=>{
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  const saved = localStorage.getItem(bookId+"_page");
  if(saved) currentPage = parseInt(saved);

  renderPanel();
})
.catch(err=>{
  console.error(err);
  container.innerHTML = "<p style='text-align:center'>❌ PDF gagal dimuat</p>";
});

/* ===== Render Panel ===== */
function renderPanel(){
  container.innerHTML = "";
  const start = currentPage;
  const end   = Math.min(currentPage + panelSize -1, totalPages);

  for(let i=start;i<=end;i++) renderPage(i);

  pageInfo.textContent = `Hal ${start}–${end} / ${totalPages}`;
  localStorage.setItem(bookId+"_page", start);

  applyZoom(); // pastikan zoom diterapkan
}

/* ===== Render Page ===== */
function renderPage(num){
  pdfDoc.getPage(num).then(page=>{
    const viewport = page.getViewport({ scale: 1.4 });

    const wrapper = document.createElement("div");
    wrapper.className = "canvasWrapper";
    wrapper.style.margin = "10px 0";
    wrapper.style.overflow = "hidden";
    // Set tinggi wrapper dulu sesuai zoom
    wrapper.style.height = `${viewport.height * zoomLevel}px`;

    const canvas = document.createElement("canvas");
    canvas.className = "pdfCanvas";
    canvas.width  = viewport.width;
    canvas.height = viewport.height;

    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    // Render PDF di canvas
    page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise.then(() => {
      // pastikan canvas scale sudah diterapkan
      canvas.style.transformOrigin = "top center";
      canvas.style.transform = `scale(${zoomLevel})`;
    });
  });
}

/* ===== Navigation ===== */
document.getElementById("nextBtn").onclick = ()=>{
  if(currentPage + panelSize <= totalPages){
    currentPage += panelSize;
    renderPanel();
  }
};

document.getElementById("prevBtn").onclick = ()=>{
  if(currentPage - panelSize >= 1){
    currentPage -= panelSize;
    renderPanel();
  }
};

/* ===== Zoom Control ===== */
function applyZoom(){
  const wrappers = container.querySelectorAll(".canvasWrapper");
  wrappers.forEach(wrapper=>{
    const canvas = wrapper.querySelector("canvas");
    // update transform
    canvas.style.transformOrigin = "top center";
    canvas.style.transform = `scale(${zoomLevel})`;
    // update wrapper height sesuai zoom
    wrapper.style.height = `${canvas.height * zoomLevel}px`;
  });
}

document.getElementById("zoomIn").onclick = ()=>{
  zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
  applyZoom();
};

document.getElementById("zoomOut").onclick = ()=>{
  zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
  applyZoom();
};
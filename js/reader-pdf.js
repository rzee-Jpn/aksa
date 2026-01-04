let zoomLevel = 1.4;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;

const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo  = document.getElementById("pageInfo");
const titleBox  = document.getElementById("bookTitle");
const zoomLabel = document.getElementById("zoomLevelDisplay");

const PDF_BASE = "https://cdn.jsdelivr.net/gh/rzee-Jpn/aksa@main/data/books";

let pdfDoc = null;
let currentPage = 1;
let panelSize   = 10;
let totalPages  = 0;

/* ===== Zoom label ===== */
function updateZoomLabel(){
  zoomLabel.textContent = Math.round(zoomLevel * 100) + "%";
}

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
pdfjsLib.getDocument(`${PDF_BASE}/${bookId}/book.pdf`).promise.then(pdf=>{
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  const saved = localStorage.getItem(bookId+"_page");
  if(saved) currentPage = parseInt(saved);

  renderPanel();
});

/* ===== Render Panel ===== */
function renderPanel(){
  container.innerHTML = "";

  const start = currentPage;
  const end   = Math.min(currentPage + panelSize - 1, totalPages);

  for(let i = start; i <= end; i++){
    renderPage(i);
  }

  pageInfo.textContent = `Hal ${start}–${end} / ${totalPages}`;
  localStorage.setItem(bookId+"_page", start);
  updateZoomLabel();
}

/* ===== Render Page (TAJAM / DPR AWARE) ===== */
function renderPage(num){
  pdfDoc.getPage(num).then(page=>{
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const viewport = page.getViewport({ scale: zoomLevel });
    const hiResViewport = page.getViewport({
      scale: zoomLevel * dpr
    });

    const wrapper = document.createElement("div");
    wrapper.className = "canvasWrapper";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // resolusi nyata (tajam)
    canvas.width  = hiResViewport.width;
    canvas.height = hiResViewport.height;

    // ukuran tampilan (layout)
    canvas.style.width  = viewport.width + "px";
    canvas.style.height = viewport.height + "px";

    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    page.render({
      canvasContext: ctx,
      viewport: hiResViewport
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
document.getElementById("zoomIn").onclick = ()=>{
  zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
  renderPanel();
};

document.getElementById("zoomOut").onclick = ()=>{
  zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
  renderPanel();
};

/* ===== Scroll Lock ===== */
let isLocked = false;
const lockBtn = document.getElementById("lockScroll");

lockBtn.onclick = ()=>{
  isLocked = !isLocked;

  if(isLocked){
    container.classList.add("lock-x");
    lockBtn.textContent = "🔒";
  } else {
    container.classList.remove("lock-x");
    lockBtn.textContent = "🔓";
  }
};
let zoomLevel = 1.4;
const BASE_ZOOM = 1.4;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;

const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo  = document.getElementById("pageInfo");
const titleBox  = document.getElementById("bookTitle");
const zoomText  = document.getElementById("zoomLevelDisplay");

const PDF_BASE = "https://cdn.jsdelivr.net/gh/rzee-Jpn/aksa@main/data/books";

let pdfDoc = null;
let currentPage = 1;
let panelSize   = 10;
let totalPages  = 0;
let lockHorizontal = true;

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

  container.classList.add("lock-x");
  renderPanel();
  updateZoomDisplay();
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
}

/* ===== Render Page ===== */
function renderPage(num){
  pdfDoc.getPage(num).then(page=>{
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

/* ===== Zoom Display ===== */
function updateZoomDisplay(){
  const percent = Math.round((zoomLevel / BASE_ZOOM) * 100);
  zoomText.textContent = percent + "%";
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
  updateZoomDisplay();
};

document.getElementById("zoomOut").onclick = ()=>{
  zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
  renderPanel();
  updateZoomDisplay();
};

/* ===== LOCK / UNLOCK (klik %) ===== */
zoomText.onclick = ()=>{
  lockHorizontal = !lockHorizontal;
  container.classList.toggle("lock-x", lockHorizontal);
  container.classList.toggle("unlock-x", !lockHorizontal);
};
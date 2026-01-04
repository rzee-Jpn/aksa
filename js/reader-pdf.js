let zoomLevel = 1.0;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;

const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container  = document.getElementById("panelContainer");
const pageInfo   = document.getElementById("pageInfo");
const titleBox   = document.getElementById("bookTitle");
const zoomDisplay= document.getElementById("zoomLevelDisplay");

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
  const end   = Math.min(start + panelSize - 1, totalPages);

  for(let i=start;i<=end;i++) renderPage(i);

  pageInfo.textContent = `Hal ${start}–${end} / ${totalPages}`;
  localStorage.setItem(bookId+"_page", start);
}

/* ===== Render Page dengan zoom responsif ===== */
function renderPage(num){
  pdfDoc.getPage(num).then(page=>{
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // scale otomatis agar sesuai width container
    const viewport = page.getViewport({ scale: zoomLevel });
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width  = "100%";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "10px auto";

    container.appendChild(canvas);
    page.render({ canvasContext: ctx, viewport });
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
function updateZoomDisplay(){
  zoomDisplay.textContent = `${Math.round(zoomLevel*100)}%`;
}

document.getElementById("zoomIn").onclick = ()=>{
  zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
  updateZoomDisplay();
  renderPanel();
};

document.getElementById("zoomOut").onclick = ()=>{
  zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
  updateZoomDisplay();
  renderPanel();
};

/* ===== Floating Zoom Hide on Scroll ===== */
let scrollTimeout;
window.addEventListener("scroll", ()=>{
  const zoomCtrl = document.getElementById("zoomControl");
  zoomCtrl.style.opacity = "1";
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(()=> zoomCtrl.style.opacity="0", 1500);
});
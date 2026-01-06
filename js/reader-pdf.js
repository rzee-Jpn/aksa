let zoomLevel = 1.4;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;

let isHD = false;

const params = new URLSearchParams(location.search);
const bookId = params.get("book");

const container = document.getElementById("panelContainer");
const pageInfo  = document.getElementById("pageInfo");
const titleBox  = document.getElementById("bookTitle");
const zoomLabel = document.getElementById("zoomLevelDisplay");
const hdBtn     = document.getElementById("hdToggle");

const PDF_BASE = "https://cdn.jsdelivr.net/gh/rzee-Jpn/aksa@main/data/books";

let pdfDoc = null;
let currentPage = 1;
let panelSize   = 10;
let totalPages  = 0;

/* ===== Browser Check (Opera Mini / lama) ===== */
function browserNotSupported(){
  container.innerHTML = `
    <div style="text-align:center;padding:40px;font-size:15px">
      ❌ Browser tidak mendukung PDF Viewer<br><br>
      Gunakan <b>Chrome / Edge / Firefox terbaru</b>
    </div>`;
  throw new Error("Unsupported browser");
}

if (!window.Promise || !window.fetch || !window.URLSearchParams) {
  browserNotSupported();
}

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
pdfjsLib.getDocument({
  url: `${PDF_BASE}/${bookId}/book.pdf`,
  disableStream: true,
  disableAutoFetch: true
}).promise.then(pdf=>{
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  const saved = localStorage.getItem(bookId+"_page");
  if(saved) currentPage = parseInt(saved);

  renderPanel();
}).catch(err=>{
  console.error(err);
  browserNotSupported();
});

/* ===== Clear memory ===== */
function clearPanels(){
  container.querySelectorAll("canvas").forEach(c=>{
    c.width = c.height = 0;
  });
}

/* ===== Render Panel ===== */
function renderPanel(){
  clearPanels();
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

/* ===== Render Page ===== */
function renderPage(num){
  pdfDoc.getPage(num).then(page=>{
    const dpr = isHD ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    const viewport = page.getViewport({ scale: zoomLevel });
    const renderViewport = page.getViewport({ scale: zoomLevel * dpr });

    const wrapper = document.createElement("div");
    wrapper.className = "canvasWrapper";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width  = renderViewport.width;
    canvas.height = renderViewport.height;
    canvas.style.width  = viewport.width + "px";
    canvas.style.height = viewport.height + "px";

    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    page.render({ canvasContext: ctx, viewport: renderViewport });
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

/* ===== Zoom ===== */
document.getElementById("zoomIn").onclick = ()=>{
  zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
  renderPanel();
};

document.getElementById("zoomOut").onclick = ()=>{
  zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
  renderPanel();
};

/* ===== HD ===== */
hdBtn.onclick = ()=>{
  isHD = !isHD;
  hdBtn.textContent = isHD ? "HD ON" : "HD OFF";
  renderPanel();
};

/* ===== Scroll Lock ===== */
let isLocked = false;
const lockBtn = document.getElementById("lockScroll");

lockBtn.onclick = ()=>{
  isLocked = !isLocked;
  container.classList.toggle("lock-x", isLocked);
  lockBtn.textContent = isLocked ? "🔒" : "🔓";
};
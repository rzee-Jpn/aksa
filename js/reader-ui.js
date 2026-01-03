document.getElementById("backBtn").onclick = () => history.back();

let zen = false;
document.body.addEventListener("dblclick", () => {
  zen = !zen;
  document.querySelector(".reader-header").style.display = zen ? "none" : "flex";
  document.querySelector(".reader-footer").style.display = zen ? "none" : "flex";
});
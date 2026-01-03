window.addEventListener("beforeunload", () => {
  localStorage.setItem("lastRead", location.href);
});
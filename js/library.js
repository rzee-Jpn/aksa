fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    const books = data.books;
    const lib = document.getElementById("library");
    const search = document.getElementById("searchInput");

    const categoryList = document.getElementById("categoryList");
    const latestList   = document.getElementById("latestList");
    const popularList  = document.getElementById("popularList");

    renderBooks(books);

    /* ===== SEARCH ===== */
    search.oninput = () => {
      const q = search.value.toLowerCase();
      renderBooks(
        books.filter(b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        )
      );
    };

    /* ===== KATEGORI ===== */
    [...new Set(books.map(b => b.category))].forEach(cat => {
      const li = document.createElement("li");
      li.textContent = cat;
      li.onclick = () => {
        renderBooks(books.filter(b => b.category === cat));
      };
      categoryList.appendChild(li);
    });

    /* ===== TERBARU (10 TERAKHIR) ===== */
    books.slice(-10).reverse().forEach(b => {
      const li = document.createElement("li");
      li.textContent = b.title;
      li.onclick = () => location.href = b.path;
      latestList.appendChild(li);
    });

    /* ===== POPULER (sementara urutan awal) ===== */
    books.slice(0,5).forEach(b => {
      const li = document.createElement("li");
      li.textContent = b.title;
      li.onclick = () => location.href = b.path;
      popularList.appendChild(li);
    });

    /* ===== RENDER GRID ===== */
    function renderBooks(list){
      lib.innerHTML = "";
      list.forEach(b => {
        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `
          <img src="${b.cover}" alt="">
          <h3>${b.title}</h3>
          <p>${b.author}</p>
          <p>${b.year} • ${b.language}</p>
        `;
        div.onclick = () => location.href = b.path;
        lib.appendChild(div);
      });
    }
  });
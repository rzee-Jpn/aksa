fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    const books = data.books;

    const allBooksEl = document.getElementById("allBooks");
    const latestEl   = document.getElementById("latestBooks");
    const popularEl  = document.getElementById("popularBooks");
    const catListEl  = document.getElementById("categoryList");
    const searchInp  = document.getElementById("searchInput");

    // ========= UTIL =========
    function renderBooks(list, target) {
      target.innerHTML = "";
      list.forEach(b => {
        const card = document.createElement("div");
        card.className = "book-card";
        card.innerHTML = `
          <img src="${b.cover || ''}" alt="">
          <div class="book-info">
            <h4>${b.title}</h4>
            <p>${b.author}</p>
          </div>
        `;
        card.onclick = () => location.href = b.path;
        target.appendChild(card);
      });
    }

    // ========= ALL =========
    renderBooks(books, allBooksEl);

    // ========= TERBARU =========
    renderBooks(books.slice(-10).reverse(), latestEl);

    // ========= POPULER (dummy/random) =========
    renderBooks([...books].sort(() => 0.5 - Math.random()).slice(0, 6), popularEl);

    // ========= KATEGORI =========
    const categories = [...new Set(books.map(b => b.category))];
    categories.forEach(cat => {
      const li = document.createElement("li");
      li.textContent = cat;
      li.onclick = () => {
        renderBooks(books.filter(b => b.category === cat), allBooksEl);
      };
      catListEl.appendChild(li);
    });

    // ========= SEARCH =========
    searchInp.oninput = () => {
      const q = searchInp.value.toLowerCase();
      renderBooks(
        books.filter(b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        ),
        allBooksEl
      );
    };
  });
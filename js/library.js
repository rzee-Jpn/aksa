fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    const lib = document.getElementById("library");

    data.books.forEach(b => {
      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `<h3>${b.title}</h3><p>${b.author}</p>`;
      div.onclick = () => {
        location.href = `reader.html?book=${b.id}`;
      };
      lib.appendChild(div);
    });
  });
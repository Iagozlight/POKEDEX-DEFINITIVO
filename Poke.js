document.addEventListener("DOMContentLoaded", () => {
  const lista_pokemons = [
    { nome: "Pikachu", tipo: "Elétrico", nivel: 1, hp: 120, gen: 1, img:"PIKACHU.png"},
    { nome: "Charmander", tipo: "Fogo", nivel: 1, hp: 45, gen: 1, img:"image.png"},
    { nome: "Charmeleon", tipo: "Fogo", nivel: 16, hp: 60, gen: 1, img:"charmeleon.png"},
    { nome: "Charizard", tipo: "Fogo", nivel: 32, hp: 60, gen: 1, img:"Charizard-PNG-Photos.png" },
    { nome: "Squirtle", tipo: "Água", nivel: 1, hp: 45, gen: 1, img:"Squirtle.png" },
    { nome: "Bulbasaur", tipo: "Planta", nivel: 1, hp: 45, gen: 1, img:"bulbasaur.png" },
    { nome: "Ivyssauro", tipo: "Planta", nivel: 16, hp: 60, gen: 1, img:"ivyssauro.png" },
    { nome: "Venussauro", tipo: "Planta", nivel: 32, hp: 93, gen: 1, img:"VENUSAUR.png" },
    { nome: "Jigglypuff", tipo: "Normal", nivel: 1, hp: 130, gen: 1, img:"jigglypuff.png" },
    { nome: "Onix", tipo: "Pedra", nivel: 30, hp: 160, gen: 1, img:"onix.png" },
    { nome: "Mewtwo", tipo: "Psíquico", nivel: 70, hp: 320, gen: 1, img:"mewtwo.png"},
    { nome: "Chikorita", tipo: "Planta", nivel: 18, hp: 100, gen: 2, img:"chikorita.png" },
    { nome: "Cyndaquil", tipo: "Fogo", nivel: 20, hp: 105, gen: 2, img:"Cyndaquil .png"},
    { nome: "Totodile", tipo: "Água", nivel: 22, hp: 115, gen: 2, img:"Totodile.png"}
  ];

  const ul = document.getElementById("listaPokemons");
  ul.innerHTML = "";

  function normalizeText(str) {
    if (!str) return "";
    try {
      return String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (e) {
      return String(str).toLowerCase();
    }
  }

  function renderList(filter = "") {
    ul.innerHTML = "";
    const f = normalizeText(filter.trim());

    lista_pokemons.forEach(pokemon => {
      if (f) {
        const hay = normalizeText(`${pokemon.nome} ${pokemon.tipo} ${pokemon.gen}`);
        if (!hay.includes(f)) return;
      }

      const li = document.createElement("li");
      li.classList.add("pokemon-card");

      const img = document.createElement("img");
      img.src = pokemon.img ? `POKEMONS/${pokemon.img}` : "POKEMONS/default.png";
      img.alt = pokemon.nome;
      img.classList.add("pokemon-img");

      const info = document.createElement("p");
      info.innerHTML = `<h4>${pokemon.nome}<h4>Nível: ${pokemon.nivel}<br>HP: ${pokemon.hp}<br><br><br>Tipo: ${pokemon.tipo}`;

      li.appendChild(img);
      li.appendChild(info);
      ul.appendChild(li);
    });
  }

  renderList();

  const barra = document.getElementById("barra");
  if (barra) {
    barra.addEventListener("input", (e) => {
      renderList(e.target.value);
    });
  }

  const lupa = document.getElementById("lupa");
  if (lupa && barra) {
    lupa.addEventListener("click", (ev) => {
      ev.preventDefault();
      barra.focus();
    });
  }
});

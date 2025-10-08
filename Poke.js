document.addEventListener("DOMContentLoaded", () => {
    const lista_pokemons = [
    { nome: "Pikachu", tipo: "Elétrico", nivel: 1, hp: 120, gen: 1 },
    { nome: "Charmander", tipo: "Fogo", nivel: 1, hp: 45, gen: 1 },
    { nome: "Charmeleon", tipo: "Fogo", nivel: 16, hp: 60, gen: 1 },
    { nome: "Charizard", tipo: "Fogo", nivel: 32, hp: 60, gen: 1 },
    { nome: "Squirtle", tipo: "Água", nivel: 1, hp: 45, gen: 1 },
    { nome: "Bulbasaur", tipo: "Planta", nivel: 1, hp: 45, gen: 1 },
    { nome: "Ivyssauro", tipo: "Planta", nivel: 16, hp: 60, gen: 1 },
    { nome: "Venussauro", tipo: "Planta", nivel: 32, hp: 93, gen: 1 },
    { nome: "Jigglypuff", tipo: "Normal", nivel: 1, hp: 130, gen: 1 },
    { nome: "Onix", tipo: "Pedra", nivel: 30, hp: 160, gen: 1 },
    { nome: "Mewtwo", tipo: "Psíquico", nivel: 70, hp: 320, gen: 1 },
    { nome: "Chikorita", tipo: "Planta", nivel: 18, hp: 100, gen: 2 },
    { nome: "Cyndaquil", tipo: "Fogo", nivel: 20, hp: 105, gen: 2 },
    { nome: "Totodile", tipo: "Água", nivel: 22, hp: 115, gen: 2 }
];

    const ul = document.getElementById("listaPokemons");

    ul.innerHTML = "";

    lista_pokemons.forEach(pokemon => {
        const li = document.createElement("li");
        li.textContent = `${pokemon.nome} | Tipo: ${pokemon.tipo} | Nível: ${pokemon.nivel} | HP: ${pokemon.hp}`;
        ul.appendChild(li);
    });
});

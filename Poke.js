const lista_pokemons = [
  { nome: "Pikachu", tipo: "Elétrico", nivel: 25, hp: 120, gen: 1 },
  { nome: "Charmander", tipo: "Fogo", nivel: 20, hp: 110, gen: 1 },
  { nome: "Squirtle", tipo: "Água", nivel: 22, hp: 115, gen: 1 },
  { nome: "Bulbasaur", tipo: "Planta", nivel: 18, hp: 105, gen: 1 },
  { nome: "Jigglypuff", tipo: "Normal", nivel: 28, hp: 130, gen: 1 },
  { nome: "Onix", tipo: "Pedra", nivel: 30, hp: 160, gen: 1 },
  { nome: "Mewtwo", tipo: "Psíquico", nivel: 70, hp: 320, gen: 1 },
  { nome: "Chikorita", tipo: "Planta", nivel: 18, hp: 100, gen: 2 },
  { nome: "Cyndaquil", tipo: "Fogo", nivel: 20, hp: 105, gen: 2 },
  { nome: "Totodile", tipo: "Água", nivel: 22, hp: 115, gen: 2 }
];

const lista_pokemonsJSON = JSON.stringify(lista_pokemons)
const lista_pokemonsPARSE = JSON.parse(lista_pokemonsJSON)
console.log(lista_pokemonsJSON)
console.log(lista_pokemonsPARSE)

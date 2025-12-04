const lista = document.getElementById("listaPokemons");
const sobreposicaoInfo = document.getElementById("pokemonInfoOverlay");
const conteudoInfo = document.getElementById("pokemonInfoContent");
const btnFecharInfo = document.getElementById("closeInfo");
const btnFiltrar = document.getElementById("filterBtn");
const menuPrincipal = document.getElementById("mainMenu");
const menuTipos = document.getElementById("typesMenu");
const menuGeneracoes = document.getElementById("gensMenu");
lista.innerHTML = "";

lista.style.display = "flex";
lista.style.flexWrap = "wrap";
lista.style.gap = "1rem";
lista.style.justifyContent = "flex-start";
lista.style.padding = "0";
lista.style.margin = "0";

let offset = 0;
const limit = 32;
let loading = false;

const detalhesCarregados = [];

const coresTipos = {
	fire: "red",
	grass: "green",
	water: "blue",
	electric: "yellow",
	psychic: "purple",
	ice: "lightblue",
	rock: "brown",
	ground: "sienna",
	ghost: "indigo",
	dark: "black",
	steel: "gray",
	dragon: "darkorange",
	fairy: "pink",
	poison: "violet",
	flying: "skyblue",
	bug: "limegreen",
	normal: "white"
};

function criarCardPokemon(dados){
	const li = document.createElement("li");
	li.classList.add("pokemon-card");
	li.style.background = "oklch(27.9% 0.041 260.031)";
	li.style.borderRadius = "8px";
	li.style.padding = "1rem";
	li.style.width = "200px";
	li.style.listStyle = "none";
	li.style.flex = "0 0 auto";
	li.style.margin = "0.5rem";
	li.dataset.name = (dados.name || '').toLowerCase();
	li.dataset.types = (dados.types || []).map(t => t.type.name).join(',');

	const tipoPrincipal = dados.types[0].type.name;
	li.style.boxShadow = `0 0 20px ${coresTipos[tipoPrincipal] || "white"}`;

	const img = document.createElement("img");
	img.src =
		(dados.sprites &&
			dados.sprites.versions &&
			dados.sprites.versions['generation-v'] &&
			dados.sprites.versions['generation-v']['black-white'] &&
			dados.sprites.versions['generation-v']['black-white'].animated &&
			dados.sprites.versions['generation-v']['black-white'].animated.front_default)
		|| dados.sprites.front_default
		|| (dados.sprites.other && dados.sprites.other['official-artwork'] && dados.sprites.other['official-artwork'].front_default)
		|| '';
	img.alt = dados.name;
	img.style.width = "96px";
	img.style.height = "auto";
	img.style.display = "block";
	img.style.margin = "auto";
	img.style.transition = "transform 200ms ease";

	const nome = dados.name[0].toUpperCase() + dados.name.slice(1);
	const hp = dados.stats.find(stat => stat.stat.name === "hp").base_stat;
	const info = document.createElement("div");
	info.style.color = "white";
	info.style.textAlign = "center";
	info.innerHTML = `<h4>${nome}</h4><p><strong>HP:</strong> ${hp}</p><p><strong>Tipo:</strong> ${tipoPrincipal}</p>`;

	li.appendChild(img);
	li.appendChild(info);

	const favBtn = document.createElement('button');
	favBtn.className = 'fav-btn';
	favBtn.title = 'Favoritar';
	favBtn.setAttribute('aria-pressed', String(favoritos.has(dados.name)));
	favBtn.innerText = favoritos.has(dados.name) ? '★' : '☆';
	if (favoritos.has(dados.name)) favBtn.classList.add('active');

	favBtn.addEventListener('click', (ev) => {
		ev.stopPropagation();
		const name = dados.name;
		if (favoritos.has(name)) {
			favoritos.delete(name);
			favBtn.classList.remove('active');
			favBtn.innerText = '☆';
			favBtn.setAttribute('aria-pressed', 'false');
		} else {
			favoritos.add(name);
			favBtn.classList.add('active');
			favBtn.innerText = '★';
			favBtn.setAttribute('aria-pressed', 'true');
			if (!detalhesCarregados.some(d => d.name === name)) detalhesCarregados.push(dados);
		}
		salvarFavoritosNoStorage();
		if (favoritosSelecionados) aplicarFiltros();
	});

	li.appendChild(favBtn);

	li.addEventListener("click", () => {
		abrirCard(dados);
	});
	return li;
}

async function carregarLote(){
	if (loading) return;
	loading = true;
	try {
		const listUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
		const res = await fetch(listUrl);
		const data = await res.json();
		const results = data.results || [];
		const detailPromises = results.map(r => fetch(r.url).then(s => s.json()));
		const details = await Promise.all(detailPromises);

		detalhesCarregados.push(...details);

		await aplicarFiltros();

		offset += limit;
	} catch (error) {
		console.error("Erro ao carregar pokémons:", error);
	} finally {
		loading = false;
	}
}

let debounceBuscaTimeout = null;
let controladorAbortPesquisa = null;

async function buscarEMostrarPokemon(q) {
	try {
		if (!q) return;
		controladorAbortPesquisa = new AbortController();
		const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(q)}`, { signal: controladorAbortPesquisa.signal });
		if (!res.ok) {
			mostrarMensagemBusca('Pokémon não encontrado.');
			renderizarDeCarregados([]);
			return;
		}
		const dados = await res.json();
		if (!detalhesCarregados.some(d => d.name === dados.name)) detalhesCarregados.push(dados);

		if (geracaoSelecionada && obterGeracaoPorId(dados.id) !== geracaoSelecionada) {
			mostrarMensagemBusca('Nenhum resultado compatível com filtros.');
			renderizarDeCarregados([]);
			return;
		}
		if (tiposSelecionados.size > 0) {
			const pt = (dados.types || []).map(t => t.type.name);
			const matchesType = Array.from(tiposSelecionados).some(t => pt.includes(t));
			if (!matchesType) {
				mostrarMensagemBusca('Nenhum resultado compatível com filtros.');
				renderizarDeCarregados([]);
				return;
			}
		}

		renderizarDeCarregados([dados]);
		mostrarMensagemBusca(`Resultado: ${dados.name}`);
	} catch (err) {
		if (err.name === 'AbortError') return;
		console.error(err);
		mostrarMensagemBusca('Erro ao buscar Pokémon.');
	} finally {
		controladorAbortPesquisa = null;
	}
}

const inputPesquisa = document.querySelector('.pesquisa');
let timeoutMensagemBusca = null;

function mostrarMensagemBusca(text) {
	let msg = document.getElementById('searchMessage');
	if (!msg) {
		msg = document.createElement('div');
		msg.id = 'searchMessage';
		msg.style.color = 'white';
		msg.style.textAlign = 'center';
		msg.style.margin = '0.5rem 0';
		lista.parentNode.insertBefore(msg, lista);
	}
	msg.textContent = text;
	clearTimeout(timeoutMensagemBusca);
	timeoutMensagemBusca = setTimeout(() => { msg.textContent = ''; }, 3000);
}

function renderizarDeCarregados(list) {
	lista.innerHTML = '';
	for (const dados of list) {
		lista.appendChild(criarCardPokemon(dados));
	}
}

if (inputPesquisa) {
	inputPesquisa.addEventListener('input', () => {
		const q = inputPesquisa.value.trim().toLowerCase();
		clearTimeout(debounceBuscaTimeout);
		if (controladorAbortPesquisa) {
			controladorAbortPesquisa.abort();
			controladorAbortPesquisa = null;
		}

		if (q === '') {
			aplicarFiltros();
			return;
		}

		const localMatches = detalhesCarregados.filter(d =>
			(d.name || '').toLowerCase().includes(q) ||
			(d.types || []).some(t => t.type.name.includes(q))
		);

		if (localMatches.length > 0) {
			renderizarDeCarregados(localMatches);
			return;
		}

		debounceBuscaTimeout = setTimeout(() => {
			buscarEMostrarPokemon(q);
		}, 600);
	});

	inputPesquisa.addEventListener('keydown', async (e) => {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		const q = inputPesquisa.value.trim().toLowerCase();
		if (!q) return;

		clearTimeout(debounceBuscaTimeout);
		if (controladorAbortPesquisa) {
			controladorAbortPesquisa.abort();
			controladorAbortPesquisa = null;
		}

		await buscarEMostrarPokemon(q);
	});
}

window.addEventListener("scroll", () =>{
	const threshold = 600;
	if (inputPesquisa && inputPesquisa.value.trim() !== '') return;
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold) {
		carregarLote();
	}
});

const nomesTipos = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dark','dragon','steel','fairy'];
let tiposSelecionados = new Set();
let geracaoSelecionada = null;

const faixasGeracoes = {
	1: [1, 151],
	2: [152, 251],
	3: [252, 386],
	4: [387, 493],
	5: [494, 649],
	6: [650, 721],
	7: [722, 809],
	8: [810, 898],
	9: [899, 1008]
};

function obterGeracaoPorId(id){
	for (const gen in faixasGeracoes){
		const [min, max] = faixasGeracoes[gen];
		if (id >= min && id <= max) return Number(gen);
	}
	return null;
}

const cacheGeracoes = {};
let currentFilterRequestId = 0;

let estaAssegurando = false;

async function buscarPokemonsGeracao(gen) {
	if (cacheGeracoes[gen]) return cacheGeracoes[gen];
	try {
		const res = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
		if (!res.ok) throw new Error('Erro ao buscar geração');
		const data = await res.json();
		const species = data.pokemon_species || [];
		const names = species.map(s => s.name);
		const detailPromises = names.map(n => fetch(`https://pokeapi.co/api/v2/pokemon/${n}`).then(r => {
			if (!r.ok) return null;
			return r.json();
		}).catch(() => null));
		const details = (await Promise.all(detailPromises)).filter(Boolean);
		details.sort((a,b) => (a.id || 0) - (b.id || 0));
		cacheGeracoes[gen] = details;
		return details;
	} catch (err) {
		console.error("Erro ao carregar pokémons da geração:", err);
		return [];
	}
}

async function aplicarFiltros() {
	const thisRequestId = ++currentFilterRequestId;
	let list = detalhesCarregados.slice();

	if (geracaoSelecionada) {
		list = await buscarPokemonsGeracao(geracaoSelecionada);
		if (thisRequestId !== currentFilterRequestId) return;
	}

	if (tiposSelecionados.size > 0) {
		list = list.filter(d => {
			const pt = (d.types || []).map(t => t.type.name);
			return Array.from(tiposSelecionados).some(t => pt.includes(t));
		});
	}

	if (favoritosSelecionados) {
		list = list.filter(d => favoritos.has(d.name));
	}

	renderizarDeCarregados(list);

	if (!estaAssegurando && !geracaoSelecionada && !favoritosSelecionados) {
		await garantirMaisResultados();
	}
}

async function garantirMaisResultados(maxAttempts = 6) {

	estaAssegurando = true;
	try {
		for (let attempt = 0; attempt < maxAttempts; attempt++){
			if (document.body.scrollHeight > window.innerHeight + 200) break;

			if (loading) {
				await new Promise(res => setTimeout(res, 150));
				continue;
			}
			await carregarLote();
			await new Promise(res => setTimeout(res, 120));
		}
	} finally {
		estaAssegurando = false;
	}
}

function popularMenuTipos() {
	const container = document.getElementById("typesList");
	container.innerHTML = '';
	for (const t of nomesTipos) {
		const id = `type-${t}`;
		const label = document.createElement('label');
		label.innerHTML = `<input type="checkbox" id="${id}" value="${t}"> <span style="text-transform:capitalize">${t}</span>`;
		container.appendChild(label);
		const chk = label.querySelector('input');
		chk.addEventListener('change', (e) => {
			if (e.target.checked) tiposSelecionados.add(e.target.value);
			else tiposSelecionados.delete(e.target.value);
			aplicarFiltros();
			btnFiltrar.classList.toggle('filter-active', tiposSelecionados.size > 0 || geracaoSelecionada !== null);
		});
	}
}

let favoritos = new Set();
let favoritosSelecionados = false;

function carregarFavoritosDoStorage() {
	try {
		const raw = localStorage.getItem('pokedexFavorites');
		if (!raw) return;
		const arr = JSON.parse(raw);
		if (Array.isArray(arr)) favoritos = new Set(arr);
	} catch (err) { console.warn('Erro ao ler favoritos', err); }
}
function salvarFavoritosNoStorage() {
	try {
		localStorage.setItem('pokedexFavorites', JSON.stringify(Array.from(favoritos)));
	} catch (err) { console.warn('Erro ao salvar favoritos', err); }
}

async function garantirFavoritosCarregados() {
	const missing = Array.from(favoritos).filter(name => !detalhesCarregados.some(d => d.name === name));
	if (missing.length === 0) return;
	try {
		const promises = missing.map(n => fetch(`https://pokeapi.co/api/v2/pokemon/${n}`).then(r => r.ok ? r.json() : null).catch(()=>null));
		const results = (await Promise.all(promises)).filter(Boolean);
		for (const d of results) {
			if (!detalhesCarregados.some(x => x.name === d.name)) detalhesCarregados.push(d);
		}
	} catch (err) {
		console.error('Erro ao carregar detalhes dos favoritos', err);
	}
}

if (btnFiltrar) {
	btnFiltrar.addEventListener('click', (e) => {
		e.stopPropagation();
		const isOpen = !menuPrincipal.classList.contains('hidden');
		menuPrincipal.classList.toggle('hidden', isOpen);
		menuTipos.classList.add('hidden');
		menuGeneracoes.classList.add('hidden');
		btnFiltrar.setAttribute('aria-expanded', String(!isOpen));
	});
}

if (menuPrincipal) {
	menuPrincipal.addEventListener('click', async (e) => {
		const btn = e.target.closest('.menu-option');
		if (!btn) return;
		if (btn.dataset.open === 'typesMenu') {
			menuTipos.classList.toggle('hidden');
			menuGeneracoes.classList.add('hidden');
		} else if (btn.dataset.open === 'gensMenu') {
			menuGeneracoes.classList.toggle('hidden');
			menuTipos.classList.add('hidden');
		} else if (btn.dataset.filter === 'favorites') {
			favoritosSelecionados = !favoritosSelecionados;
			btn.classList.toggle('filter-active', favoritosSelecionados);
			if (favoritosSelecionados) {
				await garantirFavoritosCarregados();
			}
			aplicarFiltros();
		} else if (btn.classList.contains('clear-filters')) {
			tiposSelecionados.clear();
			geracaoSelecionada = null;
			favoritosSelecionados = false;
			document.querySelectorAll('#typesList input[type="checkbox"]').forEach(i => i.checked = false);
			menuGeneracoes.querySelectorAll('.gen-option').forEach(b => b.classList.remove('filter-active'));
			menuPrincipal.querySelectorAll('[data-filter="favorites"]').forEach(b => b.classList.remove('filter-active'));
			btnFiltrar.classList.remove('filter-active');
			aplicarFiltros();
		}
	});
}

if (menuGeneracoes) {
	menuGeneracoes.addEventListener('click', async (e) => {
		const btn = e.target.closest('.gen-option');
		if (!btn) return;
		const gen = Number(btn.dataset.gen);
		if (geracaoSelecionada === gen) {
			geracaoSelecionada = null;
			btn.classList.remove('filter-active');
		} else {
			geracaoSelecionada = gen;
			menuGeneracoes.querySelectorAll('.gen-option').forEach(b => b.classList.remove('filter-active'));
			btn.classList.add('filter-active');
		}
		btnFiltrar.classList.toggle('filter-active', tiposSelecionados.size > 0 || geracaoSelecionada !== null || favoritosSelecionados);
		await aplicarFiltros();
	});
}

document.addEventListener('click', (e) => {
	if (!menuPrincipal.contains(e.target) && e.target !== btnFiltrar) {
		menuPrincipal.classList.add('hidden');
	}
	if (!menuTipos.contains(e.target) && !menuPrincipal.contains(e.target)) menuTipos.classList.add('hidden');
	if (!menuGeneracoes.contains(e.target) && !menuPrincipal.contains(e.target)) menuGeneracoes.classList.add('hidden');
});
popularMenuTipos();
(async () => {
	carregarFavoritosDoStorage();
	if (favoritos.size > 0) {
		await garantirFavoritosCarregados();
	}
	aplicarFiltros();
	await carregarLote();
})();

const sobreposicaoPainel = document.getElementById("panelOverlay");
const painel = document.getElementById("pokemonPanel");
const conteudoPainel = document.getElementById("pokemonPanelContent");
const btnFecharPainel = document.getElementById("panelClose");

function extrairDescricaoPT(species) {
	if (!species || !species.flavor_text_entries) return '';
	const entries = species.flavor_text_entries;
	const ptEntry = entries.find(e => e.language?.name === 'pt-BR') ||
					entries.find(e => e.language?.name === 'pt') ||
					entries.find(e => e.language?.name && e.language.name.startsWith('pt')) ||
					entries.find(e => e.language?.name === 'en');
	return ptEntry ? ptEntry.flavor_text.replace(/\r|\n|\f/g, ' ') : '';
}

async function abrirCard(dados) {
	try {
		let species = null;
		try {
			const idOrName = dados.id || dados.name;
			const sres = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}`);
			if (sres.ok) species = await sres.json();
		} catch (err) {
			console.warn('Erro ao buscar species:', err);
		}

		const nome = (dados.name || '').charAt(0).toUpperCase() + (dados.name || '').slice(1);
		const id = dados.id ?? '—';
		const types = (dados.types || []).map(t => (t.type?.name || '').toLowerCase());
		const abilities = (dados.abilities || []).map(a => a.ability?.name || '').map(n => n.replace('-', ' '));
		const heightM = dados.height ? (dados.height / 10).toFixed(1) + ' m' : '—';
		const weightKg = dados.weight ? (dados.weight / 10).toFixed(1) + ' kg' : '—';
		const stats = (dados.stats || []).map(s => ({ name: s.stat?.name || '', value: s.base_stat || 0 }));
		const art = dados.sprites?.other?.['official-artwork']?.front_default
			|| dados.sprites?.front_default
			|| '';

		const flavor = extrairDescricaoPT(species) || '';

		const html =`
			<img src="${art}" alt="${nome}">
			<h2 style="text-align:center; margin-top:.3rem;">${nome} <small style="opacity:.7">#${id}</small></h2>
			<div class="panel-section">
				<div class="panel-row"><strong>Tipo:</strong><span style="text-transform:capitalize">${types.join(', ') || '—'}</span></div>
				<div class="panel-row"><strong>Altura:</strong><span>${heightM}</span></div>
				<div class="panel-row"><strong>Peso:</strong><span>${weightKg}</span></div>
				<div class="panel-row"><strong>Habilidades:</strong><span style="text-transform:capitalize">${abilities.join(', ') || '—'}</span></div>
			</div>

			<div class="panel-section">
				<h4>Descrição</h4>
				<p style="margin:0.2rem 0;">${flavor || 'Nenhuma descrição disponível em PT.'}</p>
			</div>

			<div class="panel-section">
				<h4>Status</h4>
				<ul class="panel-list">
					${stats.map(s => `<li><strong>${s.name.toUpperCase()}:</strong> ${s.value}</li>`).join('')}
				</ul>
			</div>

			<div class="panel-section">
				<h4>Movimentos (exemplo)</h4>
				<ul class="panel-list">
					${(dados.moves || []).slice(0,8).map(m => `<li>${m.move?.name || ''}</li>`).join('')}
				</ul>
			</div>
		`;

		conteudoPainel.innerHTML = html;
		sobreposicaoPainel.classList.add('visible');
		painel.classList.remove('hidden', 'closing');
		painel.classList.add('open');
		painel.setAttribute('aria-hidden', 'false');
		sobreposicaoPainel.setAttribute('aria-hidden', 'false');
		btnFecharPainel?.focus();
	} catch (err) {
		console.error("Erro ao abrir painel:", err);
	}
}

function fecharPainel() {
	painel.classList.remove('open');
	painel.classList.add('closing');
	sobreposicaoPainel.classList.remove('visible');
	painel.setAttribute('aria-hidden', 'true');
	sobreposicaoPainel.setAttribute('aria-hidden', 'true');

	const onAnimEnd = () => {
		painel.classList.remove('closing');
		painel.classList.add('hidden');
		painel.removeEventListener('animationend', onAnimEnd);
	};
	painel.addEventListener('animationend', onAnimEnd);
}

btnFecharPainel?.addEventListener('click', fecharPainel);
sobreposicaoPainel?.addEventListener('click', fecharPainel);

btnFecharInfo.addEventListener("click", () => sobreposicaoInfo.style.display = "none");
sobreposicaoInfo.addEventListener("click", (e) => {
	if (e.target === sobreposicaoInfo) sobreposicaoInfo.style.display = "none";
});

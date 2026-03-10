const API_KEY = "27d6e4bc840fecf1f4a43650e2736924"; // Sua chave

const btnBuscar = document.getElementById('btn-buscar');
const btnGeo = document.getElementById('btn-geo');
const inputCidade = document.getElementById('input-cidade');
const containerHistorico = document.getElementById('historico');

let mapa;
let marcador;

// Inicializa ou atualiza o mapa Leaflet
function atualizarMapa(lat, lon) {
    if (!mapa) {
        mapa = L.map('mapa').setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
        marcador = L.marker([lat, lon]).addTo(mapa);
    } else {
        mapa.setView([lat, lon], 12);
        marcador.setLatLng([lat, lon]);
    }
}

// Busca por nome de cidade
async function buscarClima(cidade) {
    if (!cidade) return;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&units=metric&lang=pt_br&appid=${API_KEY}`;
    executarFetch(url);
}

// Desafio: Buscar por GPS
function buscarPorGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&lang=pt_br&appid=${API_KEY}`;
            executarFetch(url);
        });
    }
}

async function executarFetch(url) {
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error();
        const dados = await resposta.json();
        
        exibirDados(dados);
        salvarNoHistorico(dados.name);
        localStorage.setItem('ultimo_clima', JSON.stringify(dados));
    } catch (err) {
        document.getElementById('erro').classList.remove('hidden');
        document.getElementById('card-clima').classList.add('hidden');
    }
}

function exibirDados(dados) {
    document.getElementById('cidade-nome').innerText = dados.name;
    document.getElementById('clima-temp').innerText = `${Math.round(dados.main.temp)}°`;
    document.getElementById('clima-descricao').innerText = dados.weather[0].description;
    document.getElementById('detalhe-umidade').innerText = `${dados.main.humidity}%`;
    document.getElementById('detalhe-vento').innerText = `${Math.round(dados.wind.speed * 3.6)} km/h`;
    document.getElementById('detalhe-sensacao').innerText = `${Math.round(dados.main.feels_like)}°C`;
    
    const icone = dados.weather[0].icon;
    document.getElementById('clima-icone').src = `https://openweathermap.org/img/wn/${icone}@2x.png`;

    // Troca background dinamicamente
    const clima = dados.weather[0].main.toLowerCase();
    document.body.className = "";
    if (clima.includes("rain")) document.body.classList.add("chuva");
    else if (clima.includes("clear")) document.body.classList.add("limpo");
    else if (clima.includes("cloud")) document.body.classList.add("nuvens");
    else document.body.classList.add("default-bg");

    atualizarMapa(dados.coord.lat, dados.coord.lon);
    document.getElementById('card-clima').classList.remove('hidden');
    document.getElementById('erro').classList.add('hidden');
}

// Desafio: Salvar histórico de 5 cidades
function salvarNoHistorico(cidade) {
    let historico = JSON.parse(localStorage.getItem('historico_cidades')) || [];
    historico = historico.filter(c => c !== cidade); // Remove duplicatas
    historico.unshift(cidade); // Adiciona no início
    historico = historico.slice(0, 5); // Corta em 5
    localStorage.setItem('historico_cidades', JSON.stringify(historico));
    renderizarHistorico();
}

function renderizarHistorico() {
    const historico = JSON.parse(localStorage.getItem('historico_cidades')) || [];
    containerHistorico.innerHTML = "";
    historico.forEach(cidade => {
        const btn = document.createElement('button');
        btn.classList.add('btn-historico');
        btn.innerText = cidade;
        btn.onclick = () => buscarClima(cidade);
        containerHistorico.appendChild(btn);
    });
}

// Eventos
btnBuscar.addEventListener('click', () => buscarClima(inputCidade.value));
btnGeo.addEventListener('click', buscarPorGPS);
inputCidade.addEventListener('keypress', (e) => { if(e.key === 'Enter') buscarClima(inputCidade.value) });

// Ao carregar a página
window.onload = () => {
    renderizarHistorico();
    const ultimo = localStorage.getItem('ultimo_clima');
    if (ultimo) exibirDados(JSON.parse(ultimo));
};
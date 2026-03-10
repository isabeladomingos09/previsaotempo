// Substitua pela sua chave que você pegou no site
const API_KEY = "2bcf5199d2deb446ac3001ad937a7b67"; 

const btnBuscar = document.getElementById('btn-buscar');
const inputCidade = document.getElementById('input-cidade');
const cardClima = document.getElementById('card-clima');
const erroMsg = document.getElementById('erro');

// 1. Função para buscar dados da API
async function buscarClima(cidade) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&units=metric&lang=pt_br&appid=${API_KEY}`;

    try {
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            throw new Error("Cidade não encontrada");
        }

        const dados = await resposta.json();
        exibirDados(dados);
        salvarNoLocalStorage(dados); // Fase 4: Salvar

    } catch (erro) {
        mostrarErro();
    }
}

// 2. Função para injetar os dados no HTML (DOM)
function exibirDados(dados) {
    document.getElementById('cidade-nome').innerText = dados.name;
    document.getElementById('clima-temp').innerText = `${Math.round(dados.main.temp)}°C`;
    document.getElementById('clima-descricao').innerText = dados.weather[0].description;
    
    const icone = dados.weather[0].icon;
    document.getElementById('clima-icone').src = `https://openweathermap.org/img/wn/${icone}@2x.png`;

    cardClima.classList.remove('hidden');
    erroMsg.classList.add('hidden');
}

// 3. Função de Erro
function mostrarErro() {
    cardClima.classList.add('hidden');
    erroMsg.classList.remove('hidden');
}

// --- FASE 4: LOCAL STORAGE ---

// Salvar no navegador
function salvarNoLocalStorage(dados) {
    localStorage.setItem('clima_salvo', JSON.stringify(dados));
}

// Recuperar ao carregar a página
window.onload = () => {
    const dadosSalvos = localStorage.getItem('clima_salvo');
    if (dadosSalvos) {
        const dadosObj = JSON.parse(dadosSalvos);
        exibirDados(dadosObj);
    }
};

// Eventos
btnBuscar.addEventListener('click', () => {
    const cidade = inputCidade.value;
    if (cidade) buscarClima(cidade);
});

// Permitir busca ao apertar "Enter"
inputCidade.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cidade = inputCidade.value;
        if (cidade) buscarClima(cidade);
    }
});
// --- 1. IMPORTAÇÕES DO FIREBASE ---
// Importa (como no Java) apenas as funções que vamos usar
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, 
    deleteDoc, doc, query, orderBy, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- 2. CONFIGURAÇÃO DO FIREBASE ---
// A "Chave Secreta" do seu projeto
const firebaseConfig = {
    apiKey: "AIzaSyDUm06GOoISDPQYAFuzDV681Nhma24zrQs",
    authDomain: "app-barbearia-premium.firebaseapp.com",
    projectId: "app-barbearia-premium",
    storageBucket: "app-barbearia-premium.firebasestorage.app",
    messagingSenderId: "588599007164",
    appId: "1:588599007164:web:44e90640c5859a15057db9"
};

// Inicializa o app e conecta ao Banco (Firestore)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // 'db' é nosso "portão" para o banco de dados

// --- 3. CATÁLOGO DE PRODUTOS ---
// O "Banco de Dados" da Loja. Para adicionar produtos, SÓ MEXA AQUI.
const catalogoCategorizado = {
    "Bebidas 🍺": [
        { id: "prod-heineken", nome: "Heineken", preco: 10, emoji: "🍺", 
          imagemUrl: "https://png.pngtree.com/png-clipart/20231014/original/pngtree-heineken-liquid-green-white-picture-image_13160098.png" },
        { id: "prod-bud", nome: "Budweiser", preco: 9, emoji: "🍺", 
          imagemUrl: "https://media.istockphoto.com/id/458416053/pt/foto/gelo-frio-garrafa-de-cerveja-budweiser.jpg?s=612x612&w=0&k=20&c=dhfME3lvb3HWhobu2iT0A9jv_szPnaQhTil6JcvBXPU=" },
        { id: "prod-coca", nome: "Coca-Cola", preco: 6, emoji: "🥤", 
          imagemUrl: "" }
    ],
    "Cosméticos 💈": [
        { id: "prod-pomada-m", nome: "Pomada Matte", preco: 35, emoji: "💈", 
          imagemUrl: "https://via.placeholder.com/150/D4AF37/000000?text=Pomada" },
        { id: "prod-gel", nome: "Gel Fixador", preco: 25, emoji: "🧴", 
          imagemUrl: "" }
    ]
};

// --- 4. ELEMENTOS GLOBAIS DA TELA ---
// Guarda as referências dos elementos do HTML para não ter que buscar toda hora
const form = document.getElementById('form-agendamento');
const listaAgendamentos = document.getElementById('lista-agendamentos');
const btnTema = document.getElementById('btn-tema');
const selectHorario = document.getElementById('horaAgendamento');
const selectData = document.getElementById('dataAgendamento');

// --- 5. FUNÇÃO: LÓGICA DO BOTÃO DE TEMA ---
if (btnTema) {
    btnTema.addEventListener('click', () => {
        // 'toggle' adiciona ou remove a classe
        document.body.classList.toggle('light-mode');
        // Muda o emoji baseado na classe que o body tem
        btnTema.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    });
}

// --- 6. FUNÇÃO: "DESENHA" A LOJA (SANFONA) ---
function renderizarCatalogo() {
    const container = document.getElementById("loja-container-dinamica");
    if (!container) return; // Trava de segurança
    container.innerHTML = ""; 

    // Loop nas chaves do catálogo (ex: "Bebidas 🍺")
    for (const categoriaNome in catalogoCategorizado) {
        
        // 1. Cria o botão (Header da Sanfona)
        const header = document.createElement("button");
        header.type = "button"; // IMPORTANTE: impede de submeter o form
        header.className = "categoria-header";
        header.textContent = categoriaNome;
        
        // 2. Cria o container dos produtos (o "recheio" escondido)
        const grid = document.createElement("div");
        grid.className = "categoria-grid";

        // 3. Loop nos produtos DENTRO da categoria
        catalogoCategorizado[categoriaNome].forEach(produto => {
            
            // Lógica "If/Else" da Imagem (como você pediu)
            let visualProdutoHtml = "";
            if (produto.imagemUrl && produto.imagemUrl !== "") {
                visualProdutoHtml = `<img src="${produto.imagemUrl}" alt="${produto.nome}" class="produto-imagem">`;
            } else {
                visualProdutoHtml = `<span class="emoji">${produto.emoji}</span>`;
            }

            // 4. Monta o HTML do Card do Produto
            const cardHtml = `
                <div class="card-produto-qtd">
                    <div class="produto-visual">
                        ${visualProdutoHtml} 
                    </div>
                    <h4>${produto.nome}</h4>
                    <p>R$ ${produto.preco},00</p>
                    <input type="number" 
                           id="${produto.id}" 
                           min="0" max="10" value="0" 
                           data-nome="${produto.nome}"
                           data-preco="${produto.preco}">
                </div>
            `;
            grid.innerHTML += cardHtml; // Adiciona o card ao grid
        });

        // 5. Adiciona o 'click' na sanfona
        header.addEventListener('click', () => {
            // Fecha todos os outros grids abertos
            document.querySelectorAll('.categoria-grid.active').forEach(g => {
                if (g !== grid) g.classList.remove('active');
            });
            // Abre/Fecha o grid clicado
            grid.classList.toggle('active');
        });

        // 6. Coloca o botão e o grid na tela
        container.appendChild(header);
        container.appendChild(grid);
    }
} // --- FIM DA FUNÇÃO renderizarCatalogo ---
// ***** O ERRO DE CÓDIGO DUPLICADO ESTAVA AQUI E FOI REMOVIDO *****


// --- 7. FUNÇÃO: GERA OS DIAS (SELECT DE DATAS) ---
function gerarDias() {
    if (!selectData) return;
    const hoje = new Date();
    for (let i = 0; i < 15; i++) { // Gera agenda para os próximos 15 dias
        const dia = new Date();
        dia.setDate(hoje.getDate() + i);
        
        const diaSemana = dia.toLocaleDateString('pt-BR', { weekday: 'long' });
        const diaMes = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        
        const valorData = dia.toISOString().split('T')[0]; // Formato 'AAAA-MM-DD'
        const option = document.createElement('option');
        option.value = valorData;
        option.textContent = i === 0 ? `Hoje (${diaMes})` : (i === 1 ? `Amanhã (${diaMes})` : `${diaSemanaCap} (${diaMes})`);
        
        selectData.appendChild(option);
    }
}

// --- 8. FUNÇÃO: GERA OS HORÁRIOS (A "AGENDA INTELIGENTE") ---
function gerarHorarios(horariosOcupados = []) {
    if (!selectHorario) return;
    selectHorario.innerHTML = '<option value="" disabled selected>Escolha...</option>';
    
    const inicio = 9; 
    const fim = 19;   
    let horariosDisponiveis = 0;

    for (let hora = inicio; hora < fim; hora++) {
        // Cria os horários :00 e :30
        const horariosParaChecar = [ `${hora.toString().padStart(2, '0')}:00`, `${hora.toString().padStart(2, '0')}:30` ];

        horariosParaChecar.forEach((textoHorario) => {
            // A MÁGICA: Só cria o <option> se o horário NÃO ESTIVER na lista de ocupados
            if (!horariosOcupados.includes(textoHorario)) {
                const option = document.createElement('option');
                option.value = textoHorario;
                option.textContent = textoHorario;
                selectHorario.appendChild(option);
                horariosDisponiveis++;
            }
        });
    }

    if (horariosDisponiveis === 0) {
        selectHorario.innerHTML = '<option value="" disabled>ESGOTADO 😥</option>';
    }
}

// --- 9. EVENTO: ATUALIZAR HORÁRIOS QUANDO A DATA MUDA ---
// 'change' é disparado toda vez que o usuário troca o dia
selectData.addEventListener('change', async () => {
    const dataSelecionada = selectData.value;
    selectHorario.innerHTML = '<option>Carregando...</option>';

    // Pergunta ao Firebase: "Quais agendamentos existem ONDE a data == dataSelecionada?"
    const q = query(collection(db, "agendamentos"), where("data", "==", dataSelecionada));
    const querySnapshot = await getDocs(q); // Pega os dados 1 vez
    
    let horariosOcupados = [];
    querySnapshot.forEach((doc) => {
        horariosOcupados.push(doc.data().hora); // Guarda só a hora (ex: "14:30")
    });

    gerarHorarios(horariosOcupados); // Chama a função 8, passando os horários bloqueados
});

// --- 10. EVENTO: SALVAR AGENDAMENTO (SUBMIT DO FORM) ---
if (form) {
    // 'async' é necessário porque vamos usar 'await' (esperar o Firebase salvar)
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o reload da página

        // 1. Coleta dados básicos
        const nome = document.getElementById('cliente').value;
        const telefone = document.getElementById('telefone').value;
        const servico = document.getElementById('servico').value;
        const dataInput = document.getElementById('dataAgendamento').value;
        const horaInput = document.getElementById('horaAgendamento').value;

        if (!horaInput || horaInput === "") { // Validação extra
            alert("Por favor, escolha um horário válido.");
            return;
        }

       // 2. Coleta dados da Loja Dinâmica
       const inputsProdutos = document.querySelectorAll('#loja-container-dinamica input[type="number"]');
        let produtosComprados = [];
        let precoTotalProdutos = 0;

        inputsProdutos.forEach(input => {
            const quantidade = parseInt(input.value);
            if (quantidade > 0) {
                produtosComprados.push({
                    nome: input.dataset.nome,
                    qtd: quantidade,
                    precoUnit: parseFloat(input.dataset.preco)
                });
                precoTotalProdutos += quantidade * parseFloat(input.dataset.preco);
            }
        });

        // 3. Monta o objeto para salvar na nuvem
        const novoAgendamento = {
            nome, telefone, servico, 
            data: dataInput,
            hora: horaInput,
            criadoEm: new Date(), // Para ordenar a lista
            produtos: produtosComprados,
            totalProdutos: precoTotalProdutos
        };

        // 4. Salva no Firebase (try/catch para tratar erros)
        try {
            // 'await' espera o 'addDoc' terminar
            const docRef = await addDoc(collection(db, "agendamentos"), novoAgendamento);
            form.reset(); // Limpa o formulário
            inputsProdutos.forEach(input => input.value = 0); // Limpa a loja
            alert("✅ Agendamento Confirmado!");
        } catch (e) {
            console.error("Erro ao salvar: ", e);
            alert("❌ Erro! Não foi possível salvar.");
        }
    });
}

// --- 11. FUNÇÃO: RENDERIZAR LISTA (ATUALIZAR TELA) ---
// Esta função é chamada pelo 'onSnapshot' (item 13)
function renderizarLista(listaDeDados) {
    listaAgendamentos.innerHTML = '';
    
    if (listaDeDados.length === 0) {
        listaAgendamentos.innerHTML = '<li class="vazio" style="color:#aaa; text-align:center;">Nenhum horário marcado...</li>';
        return;
    }

    listaDeDados.forEach((item) => {
        // Formata data 'AAAA-MM-DD' para 'DD/MM/AAAA'
        const partes = item.data.split('-');
        const dataBR = `${partes[2]}/${partes[1]}/${partes[0]}`;

        // Formata a lista de produtos (ex: "Heineken (3)")
        let produtosHtml = '-';
        if (item.produtos && item.produtos.length > 0) {
            produtosHtml = item.produtos.map(p => `${p.nome} (${p.qtd})`).join(', ');
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${item.nome}</strong> <br>
                <small style="color:var(--texto-secundario)">${item.servico}</small> <br>
                <small style="color:#d4af37">🛒 ${produtosHtml}</small> <br> 
                <span style="color: var(--texto-primario); font-weight: bold;">
                    📅 ${dataBR} - ⏰ ${item.hora}
                </span>
            </div>
            <button onclick="deletar('${item.id}')" style="background:rgba(255,0,0,0.2); color:red; border:1px solid red; padding:5px 10px; border-radius:5px; cursor:pointer;">✕</button>
        `;
        listaAgendamentos.appendChild(li);
    });
}

// --- 12. FUNÇÃO: DELETAR (GLOBAL) ---
// 'window.deletar' torna a função "pública" para o HTML (o 'onclick') enxergar
window.deletar = async function(id) {
    if(confirm("Cancelar este agendamento?")) {
        try {
            // Aponta para o documento exato pelo ID e deleta
            await deleteDoc(doc(db, "agendamentos", id));
            alert("Agendamento cancelado!");
            // Não precisa recarregar a lista, o 'onSnapshot' faz isso
        } catch (e) {
            console.error("Erro ao deletar: ", e);
            alert("❌ Erro! Não foi possível cancelar.");
        }
    }
}

// --- 13. OUVINTE EM TEMPO REAL (A MÁGICA) ---
// 'onSnapshot' fica "ouvindo" a coleção 'agendamentos'
// Se algo for adicionado, deletado ou mudado, ele roda esta função sozinho
const q = query(collection(db, "agendamentos"), orderBy("criadoEm", "desc"));
onSnapshot(q, (querySnapshot) => {
    let agendamentosDaNuvem = [];
    querySnapshot.forEach((doc) => {
        // Pega os dados (doc.data()) e o ID (doc.id)
        agendamentosDaNuvem.push({ ...doc.data(), id: doc.id });
    });
    // Envia a lista fresquinha da nuvem para a tela
    renderizarLista(agendamentosDaNuvem);
});

// --- 14. INICIALIZAÇÃO ---
// Funções que rodam assim que a página carrega
renderizarCatalogo();
gerarDias();
// 'gerarHorarios' só roda depois que o usuário escolhe um dia
// --- 1. ELEMENTOS GLOBAIS ---
const form = document.getElementById('form-agendamento');
const listaAgendamentos = document.getElementById('lista-agendamentos');
const btnTema = document.getElementById('btn-tema');
const selectHorario = document.getElementById('horaAgendamento');
const selectData = document.getElementById('dataAgendamento');
let agendamentos = [];

// --- 2. LÓGICA DO BOTÃO DE TEMA (PRIORIDADE MÁXIMA) ---
if (btnTema) {
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        // Troca o Emoji
        if (document.body.classList.contains('light-mode')) {
            btnTema.textContent = '☀️';
        } else {
            btnTema.textContent = '🌙';
        }
    });
}

// --- 3. GERAÇÃO DE HORÁRIOS ---
function gerarHorarios() {
    if (!selectHorario) return;
    const inicio = 9; 
    const fim = 19;   
    for (let hora = inicio; hora < fim; hora++) {
        criarOpcaoHorario(hora, '00');
        criarOpcaoHorario(hora, '30');
    }
}

function criarOpcaoHorario(hora, minuto) {
    const horaFormatada = hora.toString().padStart(2, '0');
    const texto = `${horaFormatada}:${minuto}`;
    const option = document.createElement('option');
    option.value = texto;
    option.textContent = texto;
    selectHorario.appendChild(option);
}

// --- 4. GERAÇÃO DE DIAS ---
function gerarDias() {
    if (!selectData) return;
    const hoje = new Date();
    for (let i = 0; i < 15; i++) {
        const dia = new Date();
        dia.setDate(hoje.getDate() + i);
        
        const diaSemana = dia.toLocaleDateString('pt-BR', { weekday: 'long' });
        const diaMes = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        
        const valorData = dia.toISOString().split('T')[0];
        const option = document.createElement('option');
        option.value = valorData;
        option.textContent = i === 0 ? `Hoje (${diaMes})` : (i === 1 ? `Amanhã (${diaMes})` : `${diaSemanaCap} (${diaMes})`);
        
        selectData.appendChild(option);
    }
}

// Inicializa as listas
gerarDias();
gerarHorarios();

// --- 5. SALVAR AGENDAMENTO ---
if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Captura Campos
        const nome = document.getElementById('cliente').value;
        const telefone = document.getElementById('telefone').value;
        const servico = document.getElementById('servico').value;
        const dataInput = document.getElementById('dataAgendamento').value;
        const horaInput = document.getElementById('horaAgendamento').value;

        // Captura Produtos Marcados
        const produtos = [];
        if (document.getElementById('prod-cerveja').checked) produtos.push("Heineken");
        if (document.getElementById('prod-pomada').checked) produtos.push("Pomada");
        if (document.getElementById('prod-refri').checked) produtos.push("Coca-Cola");
        const produtosTexto = produtos.length > 0 ? produtos.join(', ') : "-";

        // Formata Data
        const partes = dataInput.split('-');
        const dataBR = `${partes[2]}/${partes[1]}/${partes[0]}`;

        // Cria Objeto
        const novoAgendamento = {
            id: Date.now(),
            nome, telefone, servico, produtos: produtosTexto,
            data: dataBR, hora: horaInput
        };

        agendamentos.push(novoAgendamento);
        renderizarLista();
        form.reset();
        alert("✅ Agendamento Confirmado!");
    });
}

// --- 6. RENDERIZAR TELA ---
function renderizarLista() {
    listaAgendamentos.innerHTML = '';
    
    if (agendamentos.length === 0) {
        listaAgendamentos.innerHTML = '<li class="vazio" style="color:#aaa; text-align:center;">Nenhum horário marcado...</li>';
        return;
    }

    agendamentos.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${item.nome}</strong> <br>
                <small style="color:var(--texto-secundario)">${item.servico}</small> <br>
                <small style="color:#d4af37">🛒 ${item.produtos}</small> <br>
                <span style="color: #fff; font-weight: bold;">
                    📅 ${item.data} - ⏰ ${item.hora}
                </span>
            </div>
            <button onclick="deletar(${item.id})" style="background:rgba(255,0,0,0.2); color:red; border:1px solid red; padding:5px 10px; border-radius:5px; cursor:pointer;">✕</button>
        `;
        listaAgendamentos.appendChild(li);
    });
}

// --- 7. DELETAR ---
window.deletar = function(id) {
    if(confirm("Cancelar este agendamento?")) {
        agendamentos = agendamentos.filter(item => item.id !== id);
        renderizarLista();
    }
}
// --- 1. IMPORTAÇÃO DOS ELEMENTOS (Como instanciar objetos de UI) ---
// 'const' é como 'final' no Java (variável que não muda a referência)
// 'document.getElementById' busca o componente na tela pelo ID.
const form = document.getElementById('form-agendamento');
const listaAgendamentos = document.getElementById('lista-agendamentos');
const btnTema = document.getElementById('btn-tema');
// --- 1.1 GERAÇÃO AUTOMÁTICA DE HORÁRIOS ---
const selectHorario = document.getElementById('horaAgendamento');

function gerarHorarios() {
    const inicio = 9; // Começa 09:00
    const fim = 19;   // Termina 19:00

    for (let hora = inicio; hora < fim; hora++) {
        // Cria horário cheio (Ex: 14:00)
        criarOpcaoHorario(hora, '00');
        
        // Cria horário meia (Ex: 14:30)
        criarOpcaoHorario(hora, '30');
    }
}

// Função auxiliar para criar a tag <option>
function criarOpcaoHorario(hora, minuto) {
    // Formata para garantir dois dígitos (Ex: 9 vira "09")
    const horaFormatada = hora.toString().padStart(2, '0');
    const horarioTexto = `${horaFormatada}:${minuto}`;

    const option = document.createElement('option');
    option.value = horarioTexto;
    option.textContent = horarioTexto; // O que o usuário vê

    selectHorario.appendChild(option);
}
// --- 1.2 GERAÇÃO AUTOMÁTICA DE DIAS (Próximos 15 dias) ---
const selectData = document.getElementById('dataAgendamento');

function gerarDias() {
    const hoje = new Date();
    const diasParaMostrar = 15; // Quantos dias a agenda fica aberta

    for (let i = 0; i < diasParaMostrar; i++) {
        // Cria uma cópia da data de hoje para não alterar a original
        const dia = new Date();
        dia.setDate(hoje.getDate() + i);

        // Formatação para o usuário ver (Ex: "Sexta-feira, 14/11")
        const diaSemana = dia.toLocaleDateString('pt-BR', { weekday: 'long' });
        const diaMes = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        // Truque para deixar a primeira letra Maiúscula (ex: "sexta" -> "Sexta")
        const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        
        const textoVisivel = `${diaSemanaCap} (${diaMes})`;

        // Formatação para o código salvar (Ex: "2023-11-14")
        // O split('T')[0] pega só a parte da data do formato ISO
        const valorData = dia.toISOString().split('T')[0];

        // Cria a opção
        const option = document.createElement('option');
        option.value = valorData; // O sistema lê isso
        option.textContent = textoVisivel; // O usuário vê isso

        // Se for hoje, escreve "Hoje" em vez do dia da semana
        if (i === 0) option.textContent = `Hoje (${diaMes})`;
        // Se for amanhã, escreve "Amanhã"
        if (i === 1) option.textContent = `Amanhã (${diaMes})`;

        selectData.appendChild(option);
    }
}

// Chama a função ao iniciar
gerarDias();

// Chama a função assim que o script carregar
gerarHorarios();
// Criamos um Array (Lista) para guardar os dados na memória RAM
// No Java seria: ArrayList<Agendamento> agendamentos = new ArrayList<>();
let agendamentos = [];

// --- 2. EVENT LISTENER DO FORMULÁRIO (Action Listener) ---
// Adiciona um ouvinte para quando o botão 'submit' for clicado.
form.addEventListener('submit', function(event) {
    
    // IMPORTANTE: O comportamento padrão do HTML é recarregar a página.
    // Isso previne o reload para não perdermos os dados da memória.
    event.preventDefault();

    // --- CAPTURA DE DADOS (Getters) ---
    // Pega o valor (String) que está dentro dos inputs
    const nome = document.getElementById('cliente').value;
    const telefone = document.getElementById('telefone').value;
    const servico = document.getElementById('servico').value;
    const dataBruta = document.getElementById('dataHora').value;

    // Formata a data para ficar bonita (DD/MM/AAAA HH:MM)
    // 'Date' é a classe de data padrão do JS
    const dataFormatada = new Date(dataBruta).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    // --- CRIAÇÃO DO OBJETO (Instanciando a classe Agendamento) ---
    // No JS, não precisamos criar uma classe antes. Criamos o objeto direto (JSON).
    const novoAgendamento = {
        id: Date.now(), // Gera um número único baseado no tempo (Timestamp)
        nome: nome,
        telefone: telefone,
        servico: servico,
        horario: dataFormatada
    };

    // Adiciona na nossa lista (ArrayList.add())
    agendamentos.push(novoAgendamento);

    // Chama a função que redesenha a tela (Refresh UI)
    renderizarLista();

    // Limpa os campos do formulário
    form.reset();
    
    alert('✅ Agendamento realizado com sucesso!');
});

// --- 3. FUNÇÃO DE RENDERIZAÇÃO (Update UI) ---
function renderizarLista() {
    // Limpa o HTML atual da lista para não duplicar itens
    listaAgendamentos.innerHTML = '';

    // Verifica se a lista está vazia (isEmpty)
    if (agendamentos.length === 0) {
        listaAgendamentos.innerHTML = '<li class="vazio">Nenhum horário marcado ainda...</li>';
        return; // Sai da função
    }

    // Loop For-Each: Para cada 'item' na lista 'agendamentos'
    agendamentos.forEach((item) => {
        
        // Cria um elemento <li> na memória
        const li = document.createElement('li');

        // Injeta o HTML dentro do LI usando Template Strings (crases ``)
        // ${item.nome} é como concatenar strings no Java: "Texto" + item.nome
        li.innerHTML = `
            <div>
                <strong>${item.nome}</strong> <br>
                <small>${item.servico} - ${item.horario}</small> <br>
                <span style="color: #888; font-size: 12px">${item.telefone}</span>
            </div>
            <button onclick="deletar(${item.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">X</button>
        `;

        // Adiciona o LI criado dentro da UL (Adiciona na tela)
        listaAgendamentos.appendChild(li);
    });
}

// --- 4. FUNÇÃO DELETAR (Remove by ID) ---
// Essa função precisa estar no escopo global (window) para o HTML enxergar
window.deletar = function(idParaDeletar) {
    // Confirmar exclusão
    if(confirm("Tem certeza que deseja cancelar?")) {
        // Filtra a lista, mantendo apenas os itens que NÃO têm esse ID
        // É uma forma moderna de remover itens de arrays no JS
        agendamentos = agendamentos.filter(item => item.id !== idParaDeletar);
        
        // Atualiza a tela de novo
        renderizarLista();
    }
}

// --- 5. LÓGICA DO TEMA (Dark/Light Mode) ---
btnTema.addEventListener('click', () => {
    // 'toggle' adiciona a classe se não existir, e remove se existir.
    document.body.classList.toggle('light-mode');

    // Troca o ícone do botão
    if (document.body.classList.contains('light-mode')) {
        btnTema.textContent = '☀️ Modo Escuro'; // Se tá claro, botão volta pro escuro
    } else {
        btnTema.textContent = '🌙 Modo Claro';
    }
});
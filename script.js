// Selecionando os elementos do HTML
const form = document.getElementById('form-agendamento');
const lista = document.getElementById('lista-agendamentos');

// Evento: Quando o formulário for enviado
form.addEventListener('submit', function(event) {
    event.preventDefault(); // IMPORTANTE: Impede a página de recarregar

    // 1. Capturar os valores que o usuário digitou
    const nome = document.getElementById('cliente').value;
    const data = new Date(document.getElementById('data').value).toLocaleString('pt-BR'); // Formata a data
    const servico = document.getElementById('servico').value;

    // 2. Validar se a lista tem a mensagem de "vazio" e remover ela
    const itemVazio = document.querySelector('.vazio');
    if (itemVazio) {
        itemVazio.remove();
    }

    // 3. Criar o elemento HTML do novo item (li)
    const novoItem = document.createElement('li');
    
    // Usamos Template String (crases) para inserir HTML com variáveis
    novoItem.innerHTML = `
        <div>
            <strong>${nome}</strong> <br>
            <small>${data} - ${servico}</small>
        </div>
        <button class="btn-delete" onclick="removerItem(this)">X</button>
    `;

    // 4. Adicionar na lista visual (na tela)
    lista.appendChild(novoItem);

    // 5. Limpar o formulário para o próximo
    form.reset();
    alert('Agendamento Confirmado! ✅');
});

// Função para remover um agendamento (Bônus)
function removerItem(botao) {
    // O botão está dentro de um <li>. O parentElement sobe um nível e pega o <li> inteiro.
    const itemLi = botao.parentElement;
    itemLi.remove();
}
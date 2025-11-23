// --- CONFIGURAÇÃO ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUm06GOoISDPQYAFuzDV681Nhma24zrQs",
    authDomain: "app-barbearia-premium.firebaseapp.com",
    projectId: "app-barbearia-premium",
    storageBucket: "app-barbearia-premium.firebasestorage.app",
    messagingSenderId: "588599007164",
    appId: "1:588599007164:web:44e90640c5859a15057db9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CATÁLOGO ---
const catalogoCategorizado = {
    "Bebidas 🍺": [
        { id: "prod-heineken", nome: "Heineken", preco: 10, emoji: "🍺", imagemUrl: "https://png.pngtree.com/png-clipart/20231014/original/pngtree-heineken-liquid-green-white-picture-image_13160098.png" },
        { id: "prod-bud", nome: "Budweiser", preco: 9, emoji: "🍺", imagemUrl: "https://media.istockphoto.com/id/458416053/pt/foto/gelo-frio-garrafa-de-cerveja-budweiser.jpg?s=612x612&w=0&k=20&c=dhfME3lvb3HWhobu2iT0A9jv_szPnaQhTil6JcvBXPU=" },
        { id: "prod-coca", nome: "Coca-Cola", preco: 6, emoji: "🥤", imagemUrl: "https://assets.jokrtech.com/small_PROD_150304008_P1_57d47e0c1c.png" }
    ],
    "Cosméticos 💈": [
        { id: "prod-pomada-m", nome: "Pomada Matte", preco: 35, emoji: "💈", imagemUrl: "https://storage.moovin.store/main/2c2d7a73-f01a-4987-9809-6a905e766145/a37f31d7-d4d4-4bd1-8c39-dbe90f845ccd.png?v=1753720933&ims=fit-in/484x484/filters:fill(FFF):quality(100)" },
        { id: "prod-gel", nome: "Gel Fixador", preco: 25, emoji: "🧴", imagemUrl: "https://www.callfarma.com.br/_next/image?url=https%3A%2F%2Fd2lakedouw4zad.cloudfront.net%2Fqod-barber-shop-gel-fix-3-forte-ef-molha-59148.png&w=828&q=75" }
    ]
};

// --- ELEMENTOS ---
const form = document.getElementById('form-agendamento');
const listaAgendamentos = document.getElementById('lista-agendamentos');
const btnTema = document.getElementById('btn-tema');
const selectHorario = document.getElementById('horaAgendamento');
const selectData = document.getElementById('dataAgendamento');

// --- BOTÃO DE TEMA (SVG) ---
const iconeSol = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const iconeLua = `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

if (btnTema) {
    btnTema.innerHTML = iconeLua;
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        btnTema.innerHTML = document.body.classList.contains('light-mode') ? iconeSol : iconeLua;
    });
}

// --- FUNÇÕES ---
function renderizarCatalogo() {
    const container = document.getElementById("loja-container-dinamica");
    if (!container) return;
    container.innerHTML = ""; 
    for (const categoriaNome in catalogoCategorizado) {
        const header = document.createElement("button");
        header.type = "button"; header.className = "categoria-header"; header.textContent = categoriaNome;
        const grid = document.createElement("div"); grid.className = "categoria-grid";

        catalogoCategorizado[categoriaNome].forEach(produto => {
            let visual = produto.imagemUrl ? `<img src="${produto.imagemUrl}" class="produto-imagem">` : `<span class="emoji">${produto.emoji}</span>`;
            const cardHtml = `<div class="card-produto-qtd"><div class="produto-visual">${visual}</div><h4>${produto.nome}</h4><p>R$ ${produto.preco},00</p><input type="number" id="${produto.id}" min="0" max="10" value="0" data-nome="${produto.nome}" data-preco="${produto.preco}"></div>`;
            grid.innerHTML += cardHtml;
        });
        header.addEventListener('click', () => {
            document.querySelectorAll('.categoria-grid.active').forEach(g => { if (g !== grid) g.classList.remove('active'); });
            grid.classList.toggle('active');
        });
        container.appendChild(header); container.appendChild(grid);
    }
}

function gerarDias() {
    if (!selectData) return;
    const hoje = new Date();
    for (let i = 0; i < 15; i++) {
        const dia = new Date(); dia.setDate(hoje.getDate() + i);
        const dataISO = dia.toISOString().split('T')[0];
        const diaMes = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const diaSemana = dia.toLocaleDateString('pt-BR', { weekday: 'long' });
        
        const option = document.createElement('option'); option.value = dataISO;
        option.textContent = i === 0 ? `Hoje (${diaMes})` : (i === 1 ? `Amanhã (${diaMes})` : `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} (${diaMes})`);
        selectData.appendChild(option);
    }
}

function gerarHorarios(horariosOcupados = []) {
    if (!selectHorario) return;
    selectHorario.innerHTML = '<option value="" disabled selected>Escolha...</option>';
    for (let hora = 9; hora < 19; hora++) {
        [`${hora.toString().padStart(2,'0')}:00`, `${hora.toString().padStart(2,'0')}:30`].forEach(h => {
            if (!horariosOcupados.includes(h)) {
                const opt = document.createElement('option'); opt.value = h; opt.textContent = h;
                selectHorario.appendChild(opt);
            }
        });
    }
}

selectData.addEventListener('change', async () => {
    selectHorario.innerHTML = '<option>Carregando...</option>';
    const q = query(collection(db, "agendamentos"), where("data", "==", selectData.value));
    const snapshot = await getDocs(q);
    gerarHorarios(snapshot.docs.map(doc => doc.data().hora));
});

if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const inputs = document.querySelectorAll('#loja-container-dinamica input[type="number"]');
        const prods = []; let totalProds = 0;
        inputs.forEach(input => {
            const qtd = parseInt(input.value);
            if (qtd > 0) {
                prods.push({ nome: input.dataset.nome, qtd: qtd });
                totalProds += qtd * parseFloat(input.dataset.preco);
            }
        });

        const novoAgendamento = {
            nome: document.getElementById('cliente').value,
            telefone: document.getElementById('telefone').value,
            servico: document.getElementById('servico').value,
            data: document.getElementById('dataAgendamento').value,
            hora: document.getElementById('horaAgendamento').value,
            criadoEm: new Date(),
            produtos: prods,
            totalProdutos: totalProds
        };

        try {
            await addDoc(collection(db, "agendamentos"), novoAgendamento);
            form.reset(); inputs.forEach(i => i.value = 0);
            alert("✅ Confirmado!");
        } catch (e) { alert("Erro ao salvar."); }
    });
}

// Renderizar lista Cliente (Simples)
const q = query(collection(db, "agendamentos"), orderBy("criadoEm", "desc"));
onSnapshot(q, (snapshot) => {
    listaAgendamentos.innerHTML = '';
    if (snapshot.empty) { listaAgendamentos.innerHTML = '<li class="vazio">Sem agendamentos...</li>'; return; }
    snapshot.forEach(doc => {
        const d = doc.data(); const dataBR = d.data.split('-').reverse().join('/');
        const prods = d.produtos ? d.produtos.map(p => `${p.nome}(${p.qtd})`).join(', ') : '-';
        const li = document.createElement('li');
        li.innerHTML = `<div><strong>${d.nome}</strong><br><small>${d.servico}</small><br><small style="color:#d4af37">🛒 ${prods}</small><br><span>📅 ${dataBR} - ⏰ ${d.hora}</span></div>`;
        if (window.deletar) li.innerHTML += `<button onclick="deletar('${doc.id}')" style="color:red;border:1px solid red;background:rgba(255,0,0,0.2);border-radius:5px;">X</button>`;
        listaAgendamentos.appendChild(li);
    });
});

window.deletar = async (id) => { if(confirm("Cancelar?")) await deleteDoc(doc(db, "agendamentos", id)); };

// INÍCIO
renderizarCatalogo();
gerarDias();
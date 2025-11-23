// --- 1. IMPORTAÇÕES ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- 2. CONFIGURAÇÃO ---
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
const auth = getAuth(app);

// --- 3. SEGURANÇA ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Admin logado: ", user.email);
        iniciarSistemaAdmin();
    } else {
        window.location.href = "login.html";
    }
});

// --- 4. ELEMENTOS ---
const listaAgendamentos = document.getElementById('lista-agendamentos');
const valorTotalDia = document.getElementById('valor-total-dia');
const filtroData = document.getElementById('filtro-data');
const btnTema = document.getElementById('btn-tema');
let modoAtual = 'dia';

// --- 5. TEMA ---
const iconeSol = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const iconeLua = `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

if (btnTema) {
    btnTema.innerHTML = iconeLua;
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        btnTema.innerHTML = document.body.classList.contains('light-mode') ? iconeSol : iconeLua;
    });
}

// --- 6. FUNÇÕES DE FILTRO ---
function gerarOpcoesDias() {
    filtroData.innerHTML = ''; const hoje = new Date();
    for (let i = -30; i < 30; i++) {
        const d = new Date(); d.setDate(hoje.getDate() + i);
        const val = d.toISOString().split('T')[0];
        const opt = document.createElement('option'); opt.value = val;
        opt.textContent = i === 0 ? `Hoje ⭐` : `${d.toLocaleDateString('pt-BR', {weekday:'short'}).toUpperCase()} (${d.getDate()}/${d.getMonth()+1})`;
        if(i===0) opt.selected = true;
        filtroData.appendChild(opt);
    }
}

function gerarOpcoesMeses() {
    filtroData.innerHTML = ''; const hoje = new Date();
    for (let i = -6; i < 6; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
        const val = d.toISOString().slice(0, 7);
        const opt = document.createElement('option'); opt.value = val;
        opt.textContent = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
        if(i===0) opt.selected = true;
        filtroData.appendChild(opt);
    }
}

window.mudarModo = function(modo) {
    modoAtual = modo;
    document.getElementById('btn-modo-dia').classList.toggle('ativo', modo === 'dia');
    document.getElementById('btn-modo-mes').classList.toggle('ativo', modo === 'mes');
    document.getElementById('label-filtro').innerText = modo === 'dia' ? "Escolha o Dia:" : "Escolha o Mês:";
    modo === 'dia' ? gerarOpcoesDias() : gerarOpcoesMeses();
    carregarAgenda();
}

// --- 7. FUNÇÕES FINANCEIRAS E RENDERIZAÇÃO ---
function extrairPreco(txt) { try { return parseFloat(txt.split('R$')[1].trim().replace(',','.')); } catch(e) { return 0; } }

function carregarAgenda() {
    const val = filtroData.value;
    listaAgendamentos.innerHTML = '<li class="vazio">Calculando...</li>';
    
    let q;
    if (modoAtual === 'dia') {
        q = query(collection(db, "agendamentos"), where("data", "==", val), orderBy("hora", "asc"));
    } else {
        q = query(collection(db, "agendamentos"), where("data", ">=", val + "-01"), where("data", "<=", val + "-31"), orderBy("data", "asc"), orderBy("hora", "asc"));
    }

    onSnapshot(q, (snapshot) => {
        let total = 0; listaAgendamentos.innerHTML = '';
        if (snapshot.empty) { listaAgendamentos.innerHTML = '<li class="vazio">Sem registros.</li>'; valorTotalDia.innerText = "R$ 0,00"; return; }
        
        snapshot.forEach(doc => {
            const d = doc.data();
            const precoServ = extrairPreco(d.servico);
            const precoProd = d.totalProdutos || 0;
            const totalCli = precoServ + precoProd;
            total += totalCli;

            const li = document.createElement('li');
            
            // --- AQUI ESTAVA O ERRO VISUAL, AGORA CORRIGIDO ---
            let produtosHtml = '';
            if (d.produtos && d.produtos.length > 0) {
                // Agora mostra: "Heineken (x3)"
                const listaProds = d.produtos.map(p => `${p.nome} (x${p.qtd})`).join(', ');
                produtosHtml = `<br><small style="color:#d4af37">🛒 ${listaProds} (+ R$ ${d.totalProdutos},00)</small>`;
            }

            const dataShow = modoAtual === 'mes' ? `<span style='color:#d4af37'>${d.data.split('-')[2]}/${d.data.split('-')[1]}</span> - ` : '';
            
            li.innerHTML = `
                <div style="width:100%">
                    <div style="display:flex;justify-content:space-between">
                        <span>${dataShow}${d.hora}</span>
                        <span style="border:1px solid #555;padding:2px 5px;border-radius:4px">R$ ${totalCli.toFixed(2)}</span>
                    </div>
                    <strong>${d.nome}</strong><br>
                    <small style="color:var(--texto-secundario)">${d.servico}</small>
                    ${produtosHtml} <br>
                    <a href="https://wa.me/55${d.telefone.replace(/\D/g,'')}" target="_blank" style="color:#25D366;font-size:0.8rem">📞 WhatsApp</a>
                </div>
                <button onclick="deletar('${doc.id}')" style="margin-left:10px;color:red;background:none;border:1px solid red;border-radius:5px">X</button>
            `;
            listaAgendamentos.appendChild(li);
        });
        valorTotalDia.innerHTML = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }, (error) => {
        if (error.message.includes("requires an index")) {
            alert("⚠️ Abra o Console (F12) e clique no link para criar o Índice do Relatório Mensal!");
        }
    });
}

// --- 8. INICIALIZAÇÃO ---
window.deletar = async (id) => { if(confirm("Excluir?")) await deleteDoc(doc(db, "agendamentos", id)); };
window.sair = () => { signOut(auth).then(() => window.location.href = "login.html"); };

filtroData.addEventListener('change', carregarAgenda);

function iniciarSistemaAdmin() {
    gerarOpcoesDias();
    carregarAgenda();
}
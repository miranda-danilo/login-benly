import { auth, db } from "./conexion_firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { collection, doc, getDoc, getDocs, setDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

/**
 * Inicializa la lógica de la interfaz de usuario del panel de docente.
 * @param {HTMLElement} panelElement El elemento principal del panel de docente.
 * @param {string} adminRole El rol del usuario (debe ser 'admin').
 */
export function setupAdminPanelLogic(panelElement, adminRole) {
    const modules = [
        { id: 'UT1', title: 'Introduction and Basic Greetings' },
        { id: 'UT2', title: 'People and Places' },
        { id: 'UT3', title: 'Daily Life' },
        { id: 'UT4', title: 'Foods and Drinks' },
        { id: 'UT5', title: 'Things I Have' },
        { id: 'UT6', title: 'Around Town - Free Time' }
    ];

    // Referencias a elementos del DOM
    const moduleList = document.getElementById('module-list-admin');
    const moduloContent = document.getElementById('modulo-content-admin');
    const estudiantesContent = document.getElementById('estudiantes-content-admin');
    const progresoContent = document.getElementById('progreso-content-admin');
    const kahootContent = document.getElementById('kahoot-content-admin');
    const moduloSection = document.getElementById('modulo-section-admin');
    const estudiantesSection = document.getElementById('estudiantes-section-admin');
    const progresoSection = document.getElementById('progreso-section-admin');
    const kahootSection = document.getElementById('kahoot-section-admin');
    const logoutBtn = document.getElementById('logout-btn-admin');
    const adminNameSpan = document.getElementById("admin-name");
    const adminRoleSpan = document.getElementById("admin-role");
    const adminPhoto = document.getElementById("admin-photo");

    // --- Navegación entre secciones ---
    function showSection(sectionId) {
        [moduloSection, estudiantesSection, progresoSection, kahootSection].forEach(sec => {
            if (sec.id === sectionId) {
                sec.classList.remove('seccion-admin--hidden');
            } else {
                sec.classList.add('seccion-admin--hidden');
            }
        });
    }

    // --- Renderiza la barra lateral de módulos ---
    function renderModuleList() {
        moduleList.innerHTML = '';
        modules.forEach(mod => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" class="modulo-link-admin" data-module-id="${mod.id}">${mod.title}</a>`;
            moduleList.appendChild(li);
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                renderModuleContent(mod.id);
                showSection('modulo-section-admin');
                moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
                li.querySelector('a').classList.add('modulo-link-admin--activo');
            });
        });

        // Extra opciones de admin
        // Gestión de estudiantes
        const liEstudiantes = document.createElement('li');
        liEstudiantes.innerHTML = `<a href="#" class="modulo-link-admin" id="admin-estudiantes-link">Gestión de Estudiantes</a>`;
        moduleList.appendChild(liEstudiantes);
        liEstudiantes.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            renderEstudiantesContent();
            showSection('estudiantes-section-admin');
            moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
            liEstudiantes.querySelector('a').classList.add('modulo-link-admin--activo');
        });

        // Monitoreo de progreso
        const liProgreso = document.createElement('li');
        liProgreso.innerHTML = `<a href="#" class="modulo-link-admin" id="admin-progreso-link">Monitorear Progreso</a>`;
        moduleList.appendChild(liProgreso);
        liProgreso.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            renderProgresoContent();
            showSection('progreso-section-admin');
            moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
            liProgreso.querySelector('a').classList.add('modulo-link-admin--activo');
        });

        // Quiz Kahoot
        const liKahoot = document.createElement('li');
        liKahoot.innerHTML = `<a href="#" class="modulo-link-admin" id="admin-kahoot-link">Quiz tipo Kahoot</a>`;
        moduleList.appendChild(liKahoot);
        liKahoot.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            renderKahootContent();
            showSection('kahoot-section-admin');
            moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
            liKahoot.querySelector('a').classList.add('modulo-link-admin--activo');
        });
    }

    // --- Impartir contenido interactivo de los módulos ---
    function renderModuleContent(moduleId) {
        const mod = modules.find(m => m.id === moduleId);
        if (!mod) {
            moduloContent.innerHTML = `<p>Módulo no encontrado.</p>`;
            return;
        }
        moduloContent.innerHTML = `
            <div class="card-admin">
                <h2>${mod.title}</h2>
                <p>Contenido interactivo para este módulo aquí...</p>
                <ul>
                    <li>Video explicativo</li>
                    <li>Material descargable</li>
                    <li>Ejercicios para la clase</li>
                    <li>Quiz rápido</li>
                    <li>Botón para lanzar quiz tipo Kahoot</li>
                </ul>
            </div>
        `;
    }

    // --- Gestión de estudiantes ---
    async function renderEstudiantesContent() {
        estudiantesContent.innerHTML = '<p>Cargando estudiantes...</p>';
        const usuariosRef = collection(db, 'usuarios');
        const snapshot = await getDocs(usuariosRef);
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acceso</th>
                </tr>
            </thead>
            <tbody>`;
        snapshot.forEach(docu => {
            const data = docu.data();
            html += `<tr>
                <td>${data.name || '-'}</td>
                <td>${data.email || '-'}</td>
                <td>${data.role || '-'}</td>
                <td>
                    <button class="boton-acceso-admin" data-uid="${docu.id}" data-role="${data.role || 'user'}">
                        ${data.role === 'user' ? 'Bloquear' : 'Desbloquear'}
                    </button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        estudiantesContent.innerHTML = html;
        estudiantesContent.querySelectorAll('.boton-acceso-admin').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const uid = btn.dataset.uid;
                const role = btn.dataset.role;
                const docRef = doc(db, 'usuarios', uid);
                if (role === 'user') {
                    await updateDoc(docRef, { role: 'blocked' });
                    btn.textContent = 'Desbloquear';
                    btn.dataset.role = 'blocked';
                } else {
                    await updateDoc(docRef, { role: 'user' });
                    btn.textContent = 'Bloquear';
                    btn.dataset.role = 'user';
                }
            });
        });
    }

    // --- Monitoreo de progreso por estudiante y módulo ---
    async function renderProgresoContent() {
        progresoContent.innerHTML = '<p>Cargando progreso...</p>';
        const usuariosRef = collection(db, 'usuarios');
        const snapshot = await getDocs(usuariosRef);
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Módulo</th>
                    <th>Puntaje</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>`;
        snapshot.forEach(docu => {
            const data = docu.data();
            if (data.role === 'user' && data.scores) {
                Object.entries(data.scores).forEach(([moduloId, scoreObj]) => {
                    const moduloNombre = modules.find(m => m.id === moduloId)?.title || moduloId;
                    html += `<tr>
                        <td>${data.name || '-'}</td>
                        <td>${moduloNombre}</td>
                        <td>${scoreObj.score ?? '-'}</td>
                        <td class="${scoreObj.completada ? 'estado-aprobado' : 'estado-reprobado'}">
                            ${scoreObj.completada ? 'Completada' : 'Pendiente'}
                        </td>
                    </tr>`;
                });
            }
        });
        html += '</tbody></table>';
        progresoContent.innerHTML = html;
    }

    // --- Quiz tipo Kahoot: sala, código, puntajes ---
    let kahootCode = null;
    let kahootPlayers = [];
    let kahootQuestions = [];
    let kahootResponses = {};

    function generateKahootCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function renderKahootContent() {
        kahootContent.innerHTML = `
            <div class="kahoot-card">
                <button id="generate-kahoot-code-btn">Generar código de sala</button>
                <div id="kahoot-code-display"></div>
                <div id="kahoot-join-list"></div>
            </div>
            <div class="kahoot-quiz-form">
                <h3>Crear pregunta de Kahoot</h3>
                <input type="text" id="kahoot-question" placeholder="Escribe tu pregunta aquí" />
                <textarea id="kahoot-options" placeholder="Opciones separadas por salto de línea"></textarea>
                <input type="text" id="kahoot-answer" placeholder="Respuesta correcta" />
                <button id="kahoot-add-question-btn">Agregar pregunta</button>
                <div id="kahoot-questions-list"></div>
                <button id="kahoot-start-btn">Iniciar Quiz</button>
            </div>
        `;
        document.getElementById('generate-kahoot-code-btn').onclick = () => {
            kahootCode = generateKahootCode();
            kahootPlayers = [];
            kahootQuestions = [];
            kahootResponses = {};
            document.getElementById('kahoot-code-display').innerHTML = `<div class="kahoot-code">${kahootCode}</div>`;
            document.getElementById('kahoot-join-list').innerHTML = '';
        };

        document.getElementById('kahoot-add-question-btn').onclick = () => {
            const question = document.getElementById('kahoot-question').value.trim();
            const options = document.getElementById('kahoot-options').value.trim().split('\n').filter(o => o);
            const answer = document.getElementById('kahoot-answer').value.trim();
            if (question && options.length >= 2 && answer) {
                kahootQuestions.push({ question, options, answer });
                document.getElementById('kahoot-questions-list').innerHTML = kahootQuestions.map((q, i) => `
                    <div><strong>${i + 1}. ${q.question}</strong> (${q.options.join(', ')}) [Resp: ${q.answer}]</div>
                `).join('');
                document.getElementById('kahoot-question').value = '';
                document.getElementById('kahoot-options').value = '';
                document.getElementById('kahoot-answer').value = '';
            }
        };

        document.getElementById('kahoot-start-btn').onclick = () => {
            // Simulación: muestra puntajes por jugador
            let html = `<h4>Resultados del Quiz</h4>`;
            html += `<table class="admin-table"><thead>
                <tr>
                    <th>Jugador</th>
                    <th>Puntaje</th>
                </tr>
            </thead><tbody>`;
            kahootPlayers.forEach(player => {
                // Simula puntaje aleatorio (en integración real, recoge respuestas)
                const score = Math.floor(Math.random() * kahootQuestions.length * 10);
                html += `<tr><td>${player}</td><td>${score}/10</td></tr>`;
            });
            html += `</tbody></table>`;
            document.getElementById('kahoot-join-list').innerHTML = html;
        };
    }

    // --- Autenticación y datos de perfil ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (adminNameSpan) adminNameSpan.textContent = user.displayName || user.email || "Docente";
            if (adminPhoto) adminPhoto.src = user.photoURL || "https://placehold.co/64x64/E2E8F0/A0AEC0?text=D";
            if (adminRoleSpan) adminRoleSpan.textContent = adminRole || "admin";
            renderModuleList();
            renderModuleContent(modules[0].id);
            showSection('modulo-section-admin');
        }
    });

    // --- Cerrar sesión ---
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            window.location.reload();
        });
    }
}
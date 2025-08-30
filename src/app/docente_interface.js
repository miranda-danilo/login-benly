import { auth, db } from "./conexion_firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

/**
 * Panel Docente: Menú único "Módulos" que muestra el grid de los 6 módulos, clic para ver cada uno, responsive.
 */
export function setupAdminPanelLogic(panelElement, adminRole) {
    // --- Módulos, cada uno con tema, vocabulario + imagen, ejemplos, diálogo + imagen ---
    const modules = [
        {
            id: 'UT1',
            title: 'Introduction and Basic Greetings',
            icon: '👋',
            desc: 'Saludos y presentaciones',
            vocabulario: [
                { word: 'Hello', translation: 'Hola', img: 'assets/vocab_hello.png' },
                { word: 'Goodbye', translation: 'Adiós', img: 'assets/vocab_goodbye.png' },
                { word: 'Morning', translation: 'Mañana', img: 'assets/vocab_morning.png' },
            ],
            ejemplos: [
                { sentence: 'Hello! How are you?', img: 'assets/ejemplo_hello.png' },
                { sentence: 'Good morning, teacher.', img: 'assets/ejemplo_morning.png' },
                { sentence: 'Goodbye, friends!', img: 'assets/ejemplo_goodbye.png' }
            ],
            dialogo: {
                text: "A: Hello! Good morning.\nB: Good morning! How are you?\nA: I am fine, thank you.",
                img: "assets/dialogo_ut1.png"
            }
        },
        {
            id: 'UT2',
            title: 'People and Places',
            icon: '🏠',
            desc: 'Familia y lugares',
            vocabulario: [
                { word: 'Father', translation: 'Padre', img: 'assets/vocab_father.png' },
                { word: 'City', translation: 'Ciudad', img: 'assets/vocab_city.png' },
                { word: 'Home', translation: 'Casa', img: 'assets/vocab_home.png' }
            ],
            ejemplos: [
                { sentence: 'My father is at home.', img: 'assets/ejemplo_father.png' },
                { sentence: 'We live in the city.', img: 'assets/ejemplo_city.png' },
                { sentence: 'Welcome home!', img: 'assets/ejemplo_home.png' }
            ],
            dialogo: {
                text: "A: Where is your father?\nB: He is at home.\nA: Do you live in this city?\nB: Yes, I do.",
                img: "assets/dialogo_ut2.png"
            }
        },
        {
            id: 'UT3',
            title: 'Daily Life',
            icon: '⏰',
            desc: 'Rutinas diarias',
            vocabulario: [
                { word: 'Wake up', translation: 'Despertarse', img: 'assets/vocab_wakeup.png' },
                { word: 'Breakfast', translation: 'Desayuno', img: 'assets/vocab_breakfast.png' },
                { word: 'Never', translation: 'Nunca', img: 'assets/vocab_never.png' }
            ],
            ejemplos: [
                { sentence: 'I always eat breakfast.', img: 'assets/ejemplo_breakfast.png' },
                { sentence: 'She wakes up early.', img: 'assets/ejemplo_wakeup.png' },
                { sentence: 'He never goes to bed late.', img: 'assets/ejemplo_never.png' }
            ],
            dialogo: {
                text: "A: What do you do in the morning?\nB: I wake up and eat breakfast.\nA: Do you ever skip breakfast?\nB: Never!",
                img: "assets/dialogo_ut3.png"
            }
        },
        {
            id: 'UT4',
            title: 'Foods and Drinks',
            icon: '🍎',
            desc: 'Comidas y bebidas',
            vocabulario: [
                { word: 'Fruit', translation: 'Fruta', img: 'assets/vocab_fruit.png' },
                { word: 'Bread', translation: 'Pan', img: 'assets/vocab_bread.png' },
                { word: 'Juice', translation: 'Jugo', img: 'assets/vocab_juice.png' }
            ],
            ejemplos: [
                { sentence: 'I like fruit juice.', img: 'assets/ejemplo_juice.png' },
                { sentence: 'She eats bread.', img: 'assets/ejemplo_bread.png' },
                { sentence: 'Banana is a fruit.', img: 'assets/ejemplo_fruit.png' }
            ],
            dialogo: {
                text: "A: What do you eat for breakfast?\nB: Bread and fruit.\nA: Do you drink juice?\nB: Yes, I do.",
                img: "assets/dialogo_ut4.png"
            }
        },
        {
            id: 'UT5',
            title: 'Things I Have',
            icon: '📱',
            desc: 'Objetos personales',
            vocabulario: [
                { word: 'Phone', translation: 'Teléfono', img: 'assets/vocab_phone.png' },
                { word: 'Bag', translation: 'Bolsa', img: 'assets/vocab_bag.png' },
                { word: 'Keys', translation: 'Llaves', img: 'assets/vocab_keys.png' }
            ],
            ejemplos: [
                { sentence: 'I have a phone.', img: 'assets/ejemplo_phone.png' },
                { sentence: 'My keys are in my bag.', img: 'assets/ejemplo_keys.png' },
                { sentence: 'She has a new bag.', img: 'assets/ejemplo_bag.png' }
            ],
            dialogo: {
                text: "A: Do you have your keys?\nB: Yes, they are in my bag.\nA: And your phone?\nB: I have it too.",
                img: "assets/dialogo_ut5.png"
            }
        },
        {
            id: 'UT6',
            title: 'Around Town - Free Time',
            icon: '🏞️',
            desc: 'Lugares y ocio',
            vocabulario: [
                { word: 'Park', translation: 'Parque', img: 'assets/vocab_park.png' },
                { word: 'Cinema', translation: 'Cine', img: 'assets/vocab_cinema.png' },
                { word: 'Bank', translation: 'Banco', img: 'assets/vocab_bank.png' }
            ],
            ejemplos: [
                { sentence: 'I go to the park.', img: 'assets/ejemplo_park.png' },
                { sentence: 'She works at the bank.', img: 'assets/ejemplo_bank.png' },
                { sentence: 'We watch movies at the cinema.', img: 'assets/ejemplo_cinema.png' }
            ],
            dialogo: {
                text: "A: Where do you go in your free time?\nB: I go to the cinema or the park.\nA: Do you work at the bank?\nB: Yes, I do.",
                img: "assets/dialogo_ut6.png"
            }
        }
    ];

    // DOM refs
    const moduleList = document.getElementById('module-list-admin');
    const moduloContent = document.getElementById('modulo-content-admin');
    const estudiantesContent = document.getElementById('estudiantes-content-admin');
    const progresoContent = document.getElementById('progreso-content-admin');
    const moduloSection = document.getElementById('modulo-section-admin');
    const estudiantesSection = document.getElementById('estudiantes-section-admin');
    const progresoSection = document.getElementById('progreso-section-admin');
    const logoutBtn = document.getElementById('logout-btn-admin');
    const adminNameSpan = document.getElementById("admin-name");
    const adminRoleSpan = document.getElementById("admin-role");
    const adminPhoto = document.getElementById("admin-photo");

    // --- Menú lateral único: Modulos, Estudiantes, Progreso ---
    function renderMenu() {
        moduleList.innerHTML = '';
        // Opción única "Módulos"
        const liModulos = document.createElement('li');
        liModulos.innerHTML = `<a href="#" class="modulo-link-admin" id="admin-modulos-link">Módulos</a>`;
        moduleList.appendChild(liModulos);
        liModulos.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            renderModulosGrid();
            showSection(moduloSection);
            moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
            liModulos.querySelector('a').classList.add('modulo-link-admin--activo');
        });

        // Gestión de estudiantes
        const liEstudiantes = document.createElement('li');
        liEstudiantes.innerHTML = `<a href="#" class="modulo-link-admin" id="admin-estudiantes-link">Gestión de Estudiantes</a>`;
        moduleList.appendChild(liEstudiantes);
        liEstudiantes.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            renderEstudiantesContent();
            showSection(estudiantesSection);
            moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
            liEstudiantes.querySelector('a').classList.add('modulo-link-admin--activo');
        });

        // Monitorear progreso
        const liProgreso = document.createElement('li');
        liProgreso.innerHTML = `<a href="#" class="modulo-link-admin" id="admin-progreso-link">Monitorear Progreso</a>`;
        moduleList.appendChild(liProgreso);
        liProgreso.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            renderProgresoContent();
            showSection(progresoSection);
            moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
            liProgreso.querySelector('a').classList.add('modulo-link-admin--activo');
        });
    }

    // Mostrar solo la sección activa
    function showSection(section) {
        [moduloSection, estudiantesSection, progresoSection].forEach(sec => sec.classList.add('seccion-admin--hidden'));
        section.classList.remove('seccion-admin--hidden');
    }

    // --- MÓDULOS: grid de 6 tarjetas ---
    function renderModulosGrid() {
        moduloContent.innerHTML = `<div class="modulos-grid-admin">` +
            modules.map(mod => `
                <div class="modulo-card-admin" data-module-id="${mod.id}">
                    <div class="modulo-card-admin__icon">${mod.icon}</div>
                    <div class="modulo-card-admin__title">${mod.title}</div>
                    <div class="modulo-card-admin__desc">${mod.desc}</div>
                    <button class="boton-accion" data-module-id="${mod.id}">Ver módulo</button>
                </div>
            `).join('') +
            `</div>`;
        moduloContent.querySelectorAll('.boton-accion').forEach(btn => {
            btn.onclick = () => renderModuloDetalle(btn.dataset.moduleId);
        });
    }

    // --- MODULO DETALLE: estructura completa y funcional ---
    function renderModuloDetalle(moduleId) {
        const mod = modules.find(m => m.id === moduleId);
        if (!mod) {
            moduloContent.innerHTML = `<p>Módulo no encontrado.</p>`;
            return;
        }
        moduloContent.innerHTML = `
            <div class="modulo-detalle-admin">
                <div class="modulo-detalle__tema">${mod.title}</div>
                <div class="modulo-detalle__vocabulario">
                    <h3>Vocabulario</h3>
                    <div class="vocabulario-grid-admin">
                        ${mod.vocabulario.map((v, i) => `
                            <div class="vocab-card-admin">
                                <img src="${v.img}" alt="${v.word}" class="vocab-img-admin"/>
                                <div class="vocab-word-admin">${v.word}</div>
                                <div class="vocab-translation-admin">${v.translation}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="vocab-audio-btn-admin" id="vocab-audio-btn-all-${mod.id}" style="margin-top:1rem;">🔊 Reproducir vocabulario</button>
                </div>
                <div class="modulo-detalle__ejemplos">
                    <h3>Ejemplos</h3>
                    <div class="ejemplo-grid-admin">
                        ${mod.ejemplos.map((e, i) => `
                            <div class="ejemplo-card-admin">
                                <img src="${e.img}" alt="Ejemplo" class="ejemplo-img-admin"/>
                                <div class="ejemplo-text-admin">${e.sentence}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="ejemplo-audio-btn-admin" id="ejemplo-audio-btn-all-${mod.id}" style="margin-top:1rem;">🔊 Reproducir ejemplos</button>
                </div>
                <div class="modulo-detalle__dialogo">
                    <img src="${mod.dialogo.img}" alt="Diálogo" class="dialogo-img-admin">
                    <span class="dialogo-text-admin" style="display:block; margin-bottom:8px; white-space:pre-line;">${mod.dialogo.text}</span>
                    <button class="dialogo-audio-btn-admin" id="dialogo-audio-btn-${mod.id}">🔊 Reproducir diálogo</button>
                </div>
                <button class="boton-accion" id="volver-modulos">Volver</button>
            </div>
        `;
        document.getElementById('volver-modulos').onclick = renderModulosGrid;

        // Audio vocabulario todo
        const vocabAllBtn = document.getElementById(`vocab-audio-btn-all-${mod.id}`);
        if (vocabAllBtn) {
            vocabAllBtn.onclick = () => {
                const texto = mod.vocabulario.map(v => v.word).join('. ');
                const utter = new window.SpeechSynthesisUtterance(texto);
                utter.lang = 'en-US';
                window.speechSynthesis.speak(utter);
            };
        }
        // Audio ejemplos todos
        const ejemplosAllBtn = document.getElementById(`ejemplo-audio-btn-all-${mod.id}`);
        if (ejemplosAllBtn) {
            ejemplosAllBtn.onclick = () => {
                const texto = mod.ejemplos.map(e => e.sentence).join('. ');
                const utter = new window.SpeechSynthesisUtterance(texto);
                utter.lang = 'en-US';
                window.speechSynthesis.speak(utter);
            };
        }
        // Audio diálogo
        const dialogoBtn = document.getElementById(`dialogo-audio-btn-${mod.id}`);
        if (dialogoBtn) {
            dialogoBtn.onclick = () => {
                const texto = mod.dialogo.text.replace(/\n/g, '. ');
                const utter = new window.SpeechSynthesisUtterance(texto);
                utter.lang = 'en-US';
                window.speechSynthesis.speak(utter);
            };
        }
    }

    // --- GESTIÓN DE ESTUDIANTES ---
    async function renderEstudiantesContent() {
        estudiantesContent.innerHTML = '<p style="color:#2563eb;">Cargando estudiantes...</p>';
        const usuariosRef = collection(db, 'usuarios');
        const snapshot = await getDocs(usuariosRef);
        let html = `<table class="admin-table" style="border:2px solid #58CC02;">
            <thead>
                <tr style="background:#58CC02;color:#fff;">
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Curso</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>`;
        snapshot.forEach(docu => {
            const data = docu.data();
            html += `<tr>
                <td>${data.name || '-'}</td>
                <td>${data.email || '-'}</td>
                <td>
                    <select class="curso-select" data-uid="${docu.id}" style="border:1px solid #58CC02;">
                        <option value="">Sin curso</option>
                        <option value="Primero A"${data.curso === 'Primero A' ? ' selected' : ''}>Primero A</option>
                        <option value="Primero B"${data.curso === 'Primero B' ? ' selected' : ''}>Primero B</option>
                    </select>
                </td>
                <td>
                   <button class="boton-eliminar-estudiante" data-uid="${docu.id}">Eliminar</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        estudiantesContent.innerHTML = html;
        estudiantesContent.querySelectorAll('.curso-select').forEach(select => {
            select.addEventListener('change', async () => {
                const uid = select.dataset.uid;
                const curso = select.value;
                await updateDoc(doc(db, 'usuarios', uid), { curso });
                select.style.background = "#d1fae5";
            });
        });
        estudiantesContent.querySelectorAll('.boton-eliminar-estudiante').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Eliminar estudiante? Esta acción no se puede deshacer.')) {
                    await deleteDoc(doc(db, 'usuarios', btn.dataset.uid));
                    renderEstudiantesContent();
                }
            });
        });
    }

    // --- MONITOREAR PROGRESO ---
    async function renderProgresoContent() {
        progresoContent.innerHTML = `
            <label for="curso-progreso" style="font-weight:700;color:#2563eb;">Selecciona curso:</label>
            <select id="curso-progreso" style="border:1px solid #58CC02;">
                <option value="Primero A">Primero A</option>
                <option value="Primero B">Primero B</option>
            </select>
            <div id="progreso-lista-estudiantes"></div>
            <div id="progreso-detalle-admin"></div>
        `;
        const selectCurso = document.getElementById('curso-progreso');
        async function cargarEstudiantesProgreso(curso) {
            const usuariosRef = collection(db, 'usuarios');
            const snapshot = await getDocs(usuariosRef);
            let lista = `<table class="admin-table" style="border:2px solid #58CC02;">
                <thead>
                    <tr style="background:#58CC02;color:#fff;">
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>`;
            snapshot.forEach(docu => {
                const data = docu.data();
                if (data.curso === curso) {
                    lista += `<tr>
                        <td>${data.name || '-'}</td>
                        <td>${data.email || '-'}</td>
                        <td>
                           <button class="boton-ver-detalle" data-uid="${docu.id}">Ver progreso</button>
                        </td>
                    </tr>`;
                }
            });
            lista += '</tbody></table>';
            document.getElementById('progreso-lista-estudiantes').innerHTML = lista;
            document.querySelectorAll('.boton-ver-detalle').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const docSnap = await getDoc(doc(db, 'usuarios', btn.dataset.uid));
                    if (!docSnap.exists()) return;
                    const data = docSnap.data();
                    const scores = data.scores || {};
                    let detalle = `<h3 style="color:#2563eb;">Calificaciones de ${data.name || data.email}</h3>
                        <table class="admin-table" style="border:2px solid #58CC02;">
                        <thead><tr style="background:#58CC02;color:#fff;"><th>Unidad</th><th>Puntaje</th><th>Estado</th></tr></thead><tbody>`;
                    Object.entries(scores).forEach(([unidad, obj]) => {
                        detalle += `<tr>
                            <td>${unidad}</td>
                            <td>${obj.score ?? '-'}</td>
                            <td class="${obj.completada ? 'estado-aprobado' : 'estado-reprobado'}">
                                ${obj.completada ? 'Completada' : 'Pendiente'}
                            </td>
                        </tr>`;
                    });
                    detalle += '</tbody></table><button id="cerrar-detalle-progreso" class="boton-accion" style="background:#2563eb;color:#fff;">Cerrar</button>';
                    document.getElementById('progreso-detalle-admin').innerHTML = detalle;
                    document.getElementById('cerrar-detalle-progreso').onclick = () => document.getElementById('progreso-detalle-admin').innerHTML = "";
                });
            });
        }
        selectCurso.addEventListener('change', () => cargarEstudiantesProgreso(selectCurso.value));
        cargarEstudiantesProgreso(selectCurso.value);
    }

    // --- INICIALIZACIÓN y perfil ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (adminNameSpan) adminNameSpan.textContent = user.displayName || user.email || "Docente";
            if (adminPhoto) adminPhoto.src = user.photoURL || "https://placehold.co/64x64/E2E8F0/A0AEC0?text=D";
            if (adminRoleSpan) adminRoleSpan.textContent = adminRole || "admin";
            renderMenu();
            renderModulosGrid();
            showSection(moduloSection);
            // Activar menú "Módulos" por defecto visualmente
            moduleList.querySelectorAll('.modulo-link-admin').forEach(lnk => lnk.classList.remove('modulo-link-admin--activo'));
            const modulosLink = document.getElementById('admin-modulos-link');
            if (modulosLink) modulosLink.classList.add('modulo-link-admin--activo');
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
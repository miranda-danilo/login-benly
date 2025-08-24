import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { auth, db } from "./conexion_firebase.js";
import { showMessage } from "./notificaciones.js";

// Unidades y tests (8 preguntas por unidad)
const units = [
    { id: 'UT1', title: 'Introduction and Basic Greetings', quiz: 'true_false' },
    { id: 'UT2', title: 'People and Places', quiz: 'true_false' },
    { id: 'UT3', title: 'Daily Life', quiz: 'true_false' },
    { id: 'UT4', title: 'Foods and Drinks', quiz: 'true_false' },
    { id: 'UT5', title: 'Things I Have', quiz: 'true_false' },
    { id: 'UT6', title: 'Around Town - Free Time', quiz: 'true_false' },
];

const quizData = {
    'UT1': [
        { question: "Hello is a greeting.", answer: "true" },
        { question: "Goodbye means 'hello'.", answer: "false" },
        { question: "The verb To Be is am/is/are.", answer: "true" },
        { question: "'How are you?' is to ask for someone's name.", answer: "false" },
        { question: "Good morning is used in the afternoon.", answer: "false" },
        { question: "I am a teacher.", answer: "false" },
        { question: "We are friends.", answer: "true" },
        { question: "It is a book.", answer: "true" }
    ],
    'UT2': [
        { question: "My is a possessive adjective.", answer: "true" },
        { question: "Brother means 'hermana'.", answer: "false" },
        { question: "Her phone is 'su teléfono' de ella.", answer: "true" },
        { question: "Father means madre.", answer: "false" },
        { question: "Your car is 'tu carro'.", answer: "true" },
        { question: "Sister means hermano.", answer: "false" },
        { question: "Son means hijo.", answer: "true" },
        { question: "Mother means mamá.", answer: "true" }
    ],
    'UT3': [
        { question: "There are means plural.", answer: "true" },
        { question: "Wake up means dormir.", answer: "false" },
        { question: "Always is an adverb of frequency.", answer: "true" },
        { question: "Go to bed means levantarse.", answer: "false" },
        { question: "Never means nunca.", answer: "true" },
        { question: "Eat breakfast means cenar.", answer: "false" },
        { question: "Sometimes means a veces.", answer: "true" },
        { question: "She wakes up at 7.", answer: "true" }
    ],
    'UT4': [
        { question: "Apple is a fruit.", answer: "true" },
        { question: "'Some' is used with countable nouns.", answer: "false" },
        { question: "Water is uncountable.", answer: "true" },
        { question: "Bread is a drink.", answer: "false" },
        { question: "Banana is a fruit.", answer: "true" },
        { question: "Milk is uncountable.", answer: "true" },
        { question: "Eggs are countable.", answer: "true" },
        { question: "Juice is a food.", answer: "false" }
    ],
    'UT5': [
        { question: "I have a phone.", answer: "true" },
        { question: "Keys means 'llaves'.", answer: "true" },
        { question: "Bag means comida.", answer: "false" },
        { question: "Notebook means cuaderno.", answer: "true" },
        { question: "Pen means lápiz.", answer: "false" },
        { question: "I have two bags.", answer: "true" },
        { question: "Wallet means cartera.", answer: "true" },
        { question: "Shoes means camisa.", answer: "false" }
    ],
    'UT6': [
        { question: "Bank is a place in town.", answer: "true" },
        { question: "Playing sports is a hobby.", answer: "true" },
        { question: "Present continuous is used for future plans.", answer: "true" },
        { question: "Library is a place to eat.", answer: "false" },
        { question: "Park is a place for free time.", answer: "true" },
        { question: "Cinema is a place to watch movies.", answer: "true" },
        { question: "Swimming pool is for reading.", answer: "false" },
        { question: "Restaurant is a place to eat.", answer: "true" }
    ]
};

export const setupUserPanelLogic = (panelElement, userRole) => {
    if (!panelElement) return;

    const userEmailSpan = panelElement.querySelector("#user-email");
    const userRoleSpan = panelElement.querySelector("#user-role");
    const userPhoto = panelElement.querySelector("#user-photo");
    const logoutBtn = document.getElementById("logout-btn");
    const unitList = document.getElementById('unit-list');
    const mainContent = document.getElementById('main-content');
    const unitSections = document.querySelectorAll('.seccion-unidad');
    const gradesTab = document.getElementById('grades-tab');
    const gradesSection = document.getElementById('grades-section');
    let userScores = {};

    // Actualiza el perfil y barra lateral
    const updateProfileUI = (user) => {
        if (user && userEmailSpan) userEmailSpan.textContent = user.displayName || user.email;
        if (userPhoto && user.photoURL) userPhoto.src = user.photoURL;
        else if (userPhoto) {
            const initials = user.email ? user.email.charAt(0).toUpperCase() : 'U';
            userPhoto.src = `https://placehold.co/80x80/E2E8F0/A0AEC0?text=${initials}`;
        }
        if (userRoleSpan && userRole) userRoleSpan.textContent = userRole;
        // Nombre y rol en barra lateral
        const sidebarName = document.getElementById("sidebar-student-name");
        const sidebarRole = document.getElementById("sidebar-student-role");
        if (sidebarName) sidebarName.textContent = user.displayName || user.email || "Inglés A1";
        if (sidebarRole) sidebarRole.textContent = userRole ? `Rol: ${userRole}` : "";

        const sidebarPhoto = document.getElementById("sidebar-photo");
        if (sidebarPhoto && user.photoURL) {
            sidebarPhoto.src = user.photoURL;
        } else if (sidebarPhoto) {
            const initials = user.email ? user.email.charAt(0).toUpperCase() : 'U';
            sidebarPhoto.src = `https://placehold.co/48x48/E2E8F0/A0AEC0?text=${initials}`;
        }


    };

    // Inicializa el dashboard y escucha puntajes
   const initializeDashboardUI = (userId) => {
    unitList.innerHTML = '';
    units.forEach(unit => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-unit-id="${unit.id}" class="unidad-link">
                            <span class="unidad-link__id">${unit.id}:</span> ${unit.title}
                        </a>`;
        unitList.appendChild(li);
        li.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            renderUnitContent(unit.id);
        });
    });



       // Agrega opción de calificaciones al final del menú
    const gradesLi = document.createElement('li');
    gradesLi.innerHTML = `<a href="#" id="grades-tab" class="unidad-link unidad-link--calificaciones">
        <span class="unidad-link__id">Calificaciones</span>
    </a>`;
    unitList.appendChild(gradesLi);

    const gradesTab = document.getElementById('grades-tab');
    if (gradesTab) {
        gradesTab.addEventListener('click', (e) => {
            e.preventDefault();
            renderGradesSection();
        });
    }

    const userRef = doc(db, `usuarios/${userId}`);
    onSnapshot(userRef, (docSnap) => {
        userScores = docSnap.exists() && docSnap.data().scores ? docSnap.data().scores : {};
        updateUnitCompletionStatus();
    });
};

    // Guarda solo la nota más alta en Firestore
    const saveTestScore = async (userId, unitId, score) => {
        try {
            const docRef = doc(db, `usuarios/${userId}`);
            const docSnap = await getDoc(docRef);
            const currentData = docSnap.exists() ? docSnap.data() : {};
            const currentScores = currentData.scores || {};
            const prevScore = currentScores[unitId]?.score || 0;
            if (score > prevScore) {
                const newScores = {
                    ...currentScores,
                    [unitId]: {
                        score: score,
                        completada: score >= 7
                    }
                };
                await setDoc(docRef, { ...currentData, scores: newScores }, { merge: true });
                showMessage("¡Puntaje guardado con éxito!", "success");
            }
        } catch (error) {
            console.error("Error al guardar el puntaje:", error);
            showMessage("Error al guardar el puntaje.", "error");
        }
    };

    // Actualiza el menú lateral según puntaje
    const updateUnitCompletionStatus = () => {
        const links = unitList.querySelectorAll('.unidad-link');
        links.forEach(link => {
            const unitId = link.dataset.unitId;
            const scoreData = userScores[unitId];
            if (scoreData && scoreData.completada) {
                link.classList.add('unidad-link--completada');
            } else {
                link.classList.remove('unidad-link--completada');
            }
        });
    };

    // Renderiza contenido de unidad y test
 // Renderiza contenido de unidad y test
const renderUnitContent = (unitId) => {
    // Oculta el panel de bienvenida
    const userPanel = document.getElementById('user-panel');
    if (userPanel) userPanel.style.display = 'none';

    // Oculta calificaciones y todas las unidades
    if (gradesSection) gradesSection.classList.add('seccion-unidad--oculta');
    unitSections.forEach(section => section.classList.add('seccion-unidad--oculta'));

    // Activa el link seleccionado
    document.querySelectorAll('.unidad-link').forEach(link => link.classList.remove('unidad-link--activo'));
    const activeLink = document.querySelector(`[data-unit-id="${unitId}"]`);
    if (activeLink) activeLink.classList.add('unidad-link--activo');

    // Muestra la unidad seleccionada
    const unitSection = document.getElementById(`unit-${unitId}`);
    if (unitSection) {
        unitSection.classList.remove('seccion-unidad--oculta');
        // Elimina quiz anterior si existe
        const oldQuiz = unitSection.querySelector('.tarjeta-actividad');
        if (oldQuiz) oldQuiz.remove();
        // Inserta el quiz al final del contenido de la unidad
        const quizDiv = document.createElement('div');
        quizDiv.className = 'tarjeta-actividad';
        quizDiv.innerHTML = `
            <h3 class="tarjeta-actividad__subtitulo">Test Interactivo</h3>
            <div class="quiz-progress-bar"><div id="quiz-progress-${unitId}" class="quiz-progress-bar-fill"></div></div>
            <div id="quiz-container-${unitId}" class="contenedor-quiz">
                <p class="contenedor-quiz__pregunta" id="question-${unitId}"></p>
                <div class="contenedor-quiz__botones">
                    <button class="boton-quiz boton-quiz--verdadero" data-answer="true">Verdadero</button>
                    <button class="boton-quiz boton-quiz--falso" data-answer="false">Falso</button>
                </div>
                <p id="feedback-${unitId}" class="contenedor-quiz__retroalimentacion"></p>
                <button id="repeat-quiz-${unitId}" class="boton-quiz--repeat" style="display:none;">Repetir Quiz</button>
                <p style="margin-top:1rem;font-weight:bold;"><b>Solo se guardará tu nota más alta en este test.</b></p>
            </div>
        `;
        unitSection.appendChild(quizDiv);
        setupTrueFalseQuiz(unitId);

        // Audio dinámico para todas las unidades
       setTimeout(() => {
    const audioBtn = document.getElementById(`audio-${unitId.toLowerCase()}`);
    const stopBtn = document.getElementById(`audio-stop-${unitId.toLowerCase()}`);
    let utterance;

    if (audioBtn) {
        audioBtn.onclick = () => {
            window.speechSynthesis.cancel();

            // Solo lee el texto en inglés, ignorando lo que está dentro de <span>
            const leccionUl = unitSection.querySelector('.tarjeta-leccion ul');
            const vocabularioUl = unitSection.querySelector('.tarjeta-vocabulario ul');
            let texto = '';

            function getEnglishFromList(ul) {
                if (!ul) return '';
                return Array.from(ul.querySelectorAll('li'))
                    .map(li => {
                        // Si hay <span>, elimina su texto
                        const span = li.querySelector('span');
                        if (span) {
                            // Quita el texto del span del li
                            return li.innerText.replace(span.innerText, '').trim();
                        }
                        // Si hay ":", ignora todo después del ":"
                        if (li.innerText.includes(':')) {
                            return li.innerText.split(':')[0].trim();
                        }
                        return li.innerText.trim();
                    })
                    .filter(txt => txt.length > 0)
                    .join('. ') + '. ';
            }

            texto += getEnglishFromList(leccionUl);
            texto += getEnglishFromList(vocabularioUl);

            utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        };
    }
    if (stopBtn) {
        stopBtn.onclick = () => {
            window.speechSynthesis.cancel();
        };
    }
}, 0);
    } else {
        mainContent.classList.remove('seccion-contenido--oculta');
        mainContent.innerHTML = `
            <h1 class="seccion-contenido__titulo">Unidad no encontrada.</h1>
            <p class="seccion-contenido__subtitulo">Por favor, selecciona otra unidad.</p>
        `;
    }
};

    // Renderiza la pestaña de calificaciones
   
const renderGradesSection = () => {
    // Oculta el panel de bienvenida igual que al seleccionar una unidad
    const userPanel = document.getElementById('user-panel');
    if (userPanel) userPanel.style.display = 'none';

    mainContent.classList.add('seccion-contenido--oculta');
    unitSections.forEach(section => section.classList.add('seccion-unidad--oculta'));
    let gradesSection = document.getElementById('grades-section');
    if (!gradesSection) {
        gradesSection = document.createElement('section');
        gradesSection.id = 'grades-section';
        gradesSection.className = 'seccion-unidad';
        gradesSection.innerHTML = `
            <div class="tarjeta-leccion">
                <h2 class="tarjeta-leccion__titulo">Calificaciones por Unidad</h2>
                <table class="tabla-calificaciones">
                    <thead>
                        <tr>
                            <th>Unidad</th>
                            <th>Puntaje más alto</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="grades-table-body"></tbody>
                </table>
            </div>
        `;
        mainContent.parentNode.appendChild(gradesSection);
    }
    gradesSection.classList.remove('seccion-unidad--oculta');
    const tbody = document.getElementById("grades-table-body");
    if (tbody) {
        tbody.innerHTML = "";
        units.forEach(unit => {
            const scoreData = userScores[unit.id];
            const score = scoreData ? scoreData.score : "-";
            const estado = scoreData && scoreData.completada ? "Completada" : "Pendiente";
            const estadoClass = scoreData && scoreData.completada ? "estado-aprobado" : "estado-reprobado";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${unit.title}</td>
                <td><b>${score !== "-" ? score.toFixed(1) : "-"}</b></td>
                <td class="${estadoClass}">${score !== "-" ? estado : "-"}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    document.querySelectorAll('.unidad-link').forEach(link => link.classList.remove('unidad-link--activo'));
    const gradesTab = document.getElementById('grades-tab');
    if (gradesTab) gradesTab.classList.add('unidad-link--activo');
};

    // Quiz interactivo con barra de progreso y botón repetir
const setupTrueFalseQuiz = (unitId) => {
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    const questions = quizData[unitId];
    const totalQuestions = questions.length;
    const questionEl = document.getElementById(`question-${unitId}`);
    const feedbackEl = document.getElementById(`feedback-${unitId}`);
    const quizBtns = document.querySelectorAll(`#quiz-container-${unitId} .boton-quiz`);
    const progressBar = document.getElementById(`quiz-progress-${unitId}`);
    const repeatBtn = document.getElementById(`repeat-quiz-${unitId}`);

    // Sonidos
    const playSound = (type) => {
        let audio;
        if (type === "correct") {
            audio = new Audio("assets/correct-ding.mp3");
        } else if (type === "wrong") {
            audio = new Audio("assets/chicharra-error-incorrecto-.mp3");
        } else if (type === "win") {
            audio = new Audio("assets/bites-ta-da-winner.mp3");
        } else if (type === "fail") {
            audio = new Audio("assets/computers-critical-error-windows.mp3");
        }
        if (audio) audio.play();
    };

    // Notificación animada
    const showAnimatedNotification = (message, success = true) => {
        let notif = document.getElementById('quiz-notification');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'quiz-notification';
            notif.className = 'quiz-notification';
            document.body.appendChild(notif);
        }
        notif.innerHTML = message;
        notif.classList.remove('quiz-notification--hide');
        notif.classList.toggle('quiz-notification--success', success);
        notif.classList.toggle('quiz-notification--fail', !success);
        setTimeout(() => {
            notif.classList.add('quiz-notification--hide');
        }, 3500);
    };

    function showQuestion() {
        if (progressBar) progressBar.style.width = `${(currentQuestionIndex / totalQuestions) * 100}%`;
        if (currentQuestionIndex < totalQuestions) {
            questionEl.textContent = questions[currentQuestionIndex].question;
            feedbackEl.textContent = '';
            feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--sucesso', 'contenedor-quiz__retroalimentacion--error');
            quizBtns.forEach(btn => btn.disabled = false);
        } else {
            const score = (correctAnswers / totalQuestions) * 10;
            questionEl.textContent = `Quiz completado. Tu puntaje es: ${score.toFixed(1)}/10`;
            feedbackEl.textContent = score >= 7 ? '¡Felicidades!' : 'Puedes mejorar tu puntaje.';
            feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--sucesso', score >= 7);
            feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--error', score < 7);
            quizBtns.forEach(btn => btn.disabled = true);
            repeatBtn.style.display = "inline-block";
            // Sonido y notificación final
            if (score >= 7) {
                playSound("win");
                showAnimatedNotification('¡Lo lograste! 🎉🥳<br><span style="font-size:2rem;">✅</span>', true);
            } else {
                playSound("fail");
                showAnimatedNotification('¡Sigue intentando! 😢<br><span style="font-size:2rem;">🚫</span>', false);
            }
        }
    }

    quizBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.disabled) return;
            const userAnswer = btn.dataset.answer;
            const correctAnswer = questions[currentQuestionIndex].answer;
            if (userAnswer === correctAnswer) {
                correctAnswers++;
                feedbackEl.textContent = "¡Correcto!";
                feedbackEl.classList.add('contenedor-quiz__retroalimentacion--sucesso');
                feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--error');
                playSound("correct");
            } else {
                feedbackEl.textContent = `Incorrecto. La respuesta correcta era: ${correctAnswer === "true" ? "Verdadero" : "Falso"}`;
                feedbackEl.classList.add('contenedor-quiz__retroalimentacion--error');
                feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--sucesso');
                playSound("wrong");
            }
            quizBtns.forEach(b => b.disabled = true);
            setTimeout(() => {
                currentQuestionIndex++;
                showQuestion();
                if (currentQuestionIndex > totalQuestions - 1) {
                    const score = (correctAnswers / totalQuestions) * 10;
                    const user = auth.currentUser;
                    if (user) saveTestScore(user.uid, unitId, score);
                }
            }, 900);
        };
    });

    repeatBtn.onclick = () => {
        currentQuestionIndex = 0;
        correctAnswers = 0;
        quizBtns.forEach(btn => btn.disabled = false);
        repeatBtn.style.display = "none";
        showQuestion();
    };

    const scoreData = userScores[unitId];
    if (scoreData) {
        questionEl.textContent = `Quiz completado. Tu puntaje es: ${scoreData.score.toFixed(1)}/10`;
        feedbackEl.textContent = scoreData.completada ? '¡Felicidades!' : 'Puedes mejorar tu puntaje.';
        feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--sucesso', scoreData.completada);
        feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--error', !scoreData.completada);
        quizBtns.forEach(btn => btn.disabled = true);
        repeatBtn.style.display = "inline-block";
    } else {
        showQuestion();
    }
};

    // Autenticación y eventos
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateProfileUI(user);
            initializeDashboardUI(user.uid);
            // Pantalla de selección por defecto
            mainContent.classList.remove("seccion-contenido--oculta");
            unitSections.forEach(section => section.classList.add('seccion-unidad--oculta'));
            if (gradesSection) gradesSection.classList.add('seccion-unidad--oculta');
        } else {
            if (userEmailSpan) userEmailSpan.textContent = "Usuario";
            if (userPhoto) userPhoto.src = "https://placehold.co/80x80/E2E8F0/A0AEC0?text=U";
            const sidebarName = document.getElementById("sidebar-student-name");
            const sidebarRole = document.getElementById("sidebar-student-role");
            if (sidebarName) sidebarName.textContent = "Inglés A1";
            if (sidebarRole) sidebarRole.textContent = "";
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                showMessage("Sesión cerrada correctamente", "success");
                window.location.reload();
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                showMessage("Error al cerrar sesión.", "error");
            }
        });
    }

  
const audioBtnUT1 = document.getElementById('audio-ut1');
    if (audioBtnUT1) {
        audioBtnUT1.addEventListener('click', () => {
            const texto = `
                I am a student.
                He is a teacher.
                You are friends.
                Hello. Goodbye. Good morning. Good afternoon. Good evening. Good night.
            `;
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        });
    }


};


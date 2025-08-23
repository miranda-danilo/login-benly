import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { auth, db } from "./conexion_firebase.js";
import { showMessage } from "./notificaciones.js";

// Unidades y tests
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
        { question: "'How are you?' is to ask for someone's name.", answer: "false" }
    ],
    'UT2': [
        { question: "My is a possessive adjective.", answer: "true" },
        { question: "Brother means 'hermana'.", answer: "false" },
        { question: "Her phone is 'su teléfono' de ella.", answer: "true" }
    ],
    'UT3': [
        { question: "There are means plural.", answer: "true" },
        { question: "Wake up means dormir.", answer: "false" },
        { question: "Always is an adverb of frequency.", answer: "true" }
    ],
    'UT4': [
        { question: "Apple is a fruit.", answer: "true" },
        { question: "'Some' is used with countable nouns.", answer: "false" },
        { question: "Water is uncountable.", answer: "true" }
    ],
    'UT5': [
        { question: "I have a phone.", answer: "true" },
        { question: "Keys means 'llaves'.", answer: "true" },
        { question: "Bag means comida.", answer: "false" }
    ],
    'UT6': [
        { question: "Bank is a place in town.", answer: "true" },
        { question: "Playing sports is a hobby.", answer: "true" },
        { question: "Present continuous is used for future plans.", answer: "true" }
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
    let userScores = {};

    // Actualiza el perfil
    const updateProfileUI = (user) => {
        if (user && userEmailSpan) userEmailSpan.textContent = user.displayName;
        if (userPhoto && user.photoURL) userPhoto.src = user.photoURL;
        else if (userPhoto) {
            const initials = user.email ? user.email.charAt(0).toUpperCase() : 'U';
            userPhoto.src = `https://placehold.co/80x80/E2E8F0/A0AEC0?text=${initials}`;
        }
        if (userRoleSpan && userRole) userRoleSpan.textContent = userRole;
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

        const userRef = doc(db, `/usuarios/${userId}`);
        onSnapshot(userRef, (docSnap) => {
            userScores = docSnap.exists() && docSnap.data().scores ? docSnap.data().scores : {};
            updateUnitCompletionStatus();
        });
    };

    // Guarda puntaje en Firestore en el documento del usuario
    const saveTestScore = async (userId, unitId, score) => {
        try {
            const docRef = doc(db, `/usuarios/${userId}`);
            const docSnap = await getDoc(docRef);
            const currentData = docSnap.exists() ? docSnap.data() : {};
            const currentScores = currentData.scores || {};
            const newScores = {
                ...currentScores,
                [unitId]: {
                    score: score,
                    completada: score >= 7
                }
            };
            await setDoc(docRef, { ...currentData, scores: newScores });
            showMessage("¡Puntaje guardado con éxito!", "success");
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
    const renderUnitContent = (unitId) => {
        mainContent.classList.add('seccion-contenido--oculta');
        unitSections.forEach(section => section.classList.add('seccion-unidad--oculta'));
        const unitSection = document.getElementById(`unit-${unitId}`);
        if (unitSection) {
            unitSection.classList.remove('seccion-unidad--oculta');
        } else {
            mainContent.classList.remove('seccion-contenido--oculta');
            mainContent.innerHTML = `
                <h1 class="seccion-contenido__titulo">Unidad no encontrada.</h1>
                <p class="seccion-contenido__subtitulo">Por favor, selecciona otra unidad.</p>
            `;
            return;
        }
        document.querySelectorAll('.unidad-link').forEach(link => link.classList.remove('unidad-link--activo'));
        document.querySelector(`[data-unit-id="${unitId}"]`).classList.add('unidad-link--activo');
        const unit = units.find(u => u.id === unitId);
        if (unit && unit.quiz === 'true_false') {
            setupTrueFalseQuiz(unitId);
        }
    };

    // Test Verdadero/Falso para todas las unidades
    const setupTrueFalseQuiz = (unitId) => {
        let currentQuestionIndex = 0;
        let correctAnswers = 0;
        const questions = quizData[unitId];
        if (!questions || questions.length === 0) return;

        const questionEl = document.getElementById(`question-${unitId}`);
        const feedbackEl = document.getElementById(`feedback-${unitId}`);
        const quizBtns = document.querySelectorAll(`#quiz-container-${unitId} .boton-quiz`);

        // Si ya hay puntaje, mostrarlo y bloquear botones
        const scoreData = userScores[unitId];
        if (scoreData) {
            questionEl.textContent = `Quiz completado. Tu puntaje es: ${scoreData.score}/10`;
            feedbackEl.textContent = scoreData.completada ? '¡Felicidades!' : 'Puedes mejorar tu puntaje.';
            feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--sucesso', scoreData.completada);
            feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--error', !scoreData.completada);
            quizBtns.forEach(btn => btn.disabled = true);
            return;
        }

        const showQuestion = () => {
            if (currentQuestionIndex < questions.length) {
                questionEl.textContent = questions[currentQuestionIndex].question;
                feedbackEl.textContent = '';
                feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--sucesso', 'contenedor-quiz__retroalimentacion--error');
                quizBtns.forEach(btn => btn.disabled = false);
            } else {
                const score = (correctAnswers / questions.length) * 10;
                questionEl.textContent = `Quiz completado. Tu puntaje es: ${score.toFixed(1)}/10`;
                feedbackEl.textContent = score >= 7 ? '¡Felicidades!' : 'Puedes mejorar tu puntaje.';
                feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--sucesso', score >= 7);
                feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--error', score < 7);
                quizBtns.forEach(btn => btn.disabled = true);
                const user = auth.currentUser;
                if (user) saveTestScore(user.uid, unitId, score);
            }
        };

        quizBtns.forEach(btn => {
            btn.onclick = () => {
                const userAnswer = btn.dataset.answer;
                const correctAnswer = questions[currentQuestionIndex].answer;
                if (userAnswer === correctAnswer) {
                    correctAnswers++;
                    feedbackEl.textContent = "¡Correcto!";
                    feedbackEl.classList.add('contenedor-quiz__retroalimentacion--sucesso');
                    feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--error');
                } else {
                    feedbackEl.textContent = `Incorrecto. La respuesta correcta era: ${correctAnswer === "true" ? "Verdadero" : "Falso"}`;
                    feedbackEl.classList.add('contenedor-quiz__retroalimentacion--error');
                    feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--sucesso');
                }
                quizBtns.forEach(b => b.disabled = true);
                setTimeout(() => {
                    currentQuestionIndex++;
                    showQuestion();
                }, 1200);
            };
        });
        showQuestion();
    };

    // Autenticación y eventos
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateProfileUI(user);
            initializeDashboardUI(user.uid);
        } else {
            if (userEmailSpan) userEmailSpan.textContent = "Usuario";
            userPhoto.src = "https://placehold.co/80x80/E2E8F0/A0AEC0?text=U";
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
};  
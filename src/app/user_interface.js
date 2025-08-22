// user_interface.js

// Importa las funciones necesarias de Firebase y otros módulos
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { auth, db } from "./conexion_firebase.js"; // Asegúrate de que 'db' se exporte aquí
import { showMessage } from "./notificaciones.js";

/**
 * Función principal que inicializa la lógica de la interfaz de usuario del panel de usuario.
 * @param {HTMLElement} panelElement El elemento del panel de usuario.
 * @param {string} userRole El rol del usuario (por ejemplo, 'estudiante').
 */
export const setupUserPanelLogic = (panelElement, userRole) => {
    // Si el panel de usuario existe, configuramos su lógica
    if (panelElement) {
        // Obtener referencias para los elementos dentro del panel
        const userEmailSpan = panelElement.querySelector("#user-email");
        const userRoleSpan = panelElement.querySelector("#user-role");
        const userPhoto = panelElement.querySelector("#user-photo");
        const logoutBtn = document.getElementById("logout-btn"); // Obtener el botón de logout
        
        // Referencias para los nuevos elementos del menú y contenido
        const unitList = document.getElementById('unit-list');
        const mainContent = document.getElementById('main-content');
        const unitSections = document.querySelectorAll('.seccion-unidad');

        // Unidades y contenido del curso
        const units = [
            { id: 'UT1', title: 'Introduction and Basic Greetings', 
              content: 'En esta unidad, aprenderás a presentarte y saludar. Practicaremos con el verbo "To Be" y vocabulario básico como saludos y países.',
              quiz: 'true_false' 
            },
            { id: 'UT2', title: 'People and Places',
              content: 'Aprende a hablar de dónde son las personas y dónde viven, usando pronombres de sujeto y adjetivos posesivos. También aprenderás vocabulario sobre la familia y lugares comunes.',
              quiz: 'hangman'
            },
            { id: 'UT3', title: 'Daily Life',
              content: 'Descubre cómo dar direcciones y hablar de tu rutina diaria. Usarás "There is/There are" para describir lugares y preposiciones de lugar. También aprenderás a decir la hora y a usar adverbios de frecuencia.',
              quiz: 'quiz'
            },
            { id: 'UT4', title: 'Foods and Drinks',
              content: 'Habla sobre alimentos y comidas, usando sustantivos contables e incontables. También practicarás el vocabulario de restaurantes y cómo usar "some" y "any" para pedir comida.',
              quiz: 'true_false'
            },
            { id: 'UT5', title: 'Things I Have',
              content: 'Aprende a hablar de posesiones usando el verbo "have/has" y a preguntar por precios. Practica el vocabulario de objetos comunes y cómo usar pronombres demostrativos.',
              quiz: 'hangman'
            },
            { id: 'UT6', title: 'Around Town - Free Time',
              content: 'Expande tu vocabulario sobre lugares en la ciudad y pasatiempos. Aprende a dar direcciones, hablar de tus actividades de ocio y a hacer planes para el futuro usando el presente continuo.',
              quiz: 'quiz'
            },
        ];
        
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        let userScores = {};

        /**
         * Función para actualizar la UI del perfil del usuario
         * @param {object} user El objeto de usuario de Firebase.
         */
        const updateProfileUI = (user) => {
            if (user && userEmailSpan) {
                userEmailSpan.textContent = user.email;
            }
            
            if (userPhoto && user.photoURL) {
                userPhoto.src = user.photoURL;
            } else if (userPhoto) {
                // Si no hay photoURL, usa un placeholder
                const initials = user.email ? user.email.charAt(0).toUpperCase() : 'U';
                userPhoto.src = `https://placehold.co/80x80/E2E8F0/A0AEC0?text=${initials}`;
            }
            
            if (userRoleSpan && userRole) {
                userRoleSpan.textContent = userRole;
            }
        };

        /**
         * Inicializa la interfaz de las unidades y la lógica de Firebase.
         * @param {string} userId El ID del usuario autenticado.
         */
        const initializeDashboardUI = (userId) => {
            // Cargar unidades en el menú lateral y escuchar los clics
            unitList.innerHTML = ''; // Limpiar lista previa
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

            // Escuchar los cambios en los puntajes del usuario en tiempo real
            const scoresRef = doc(db, `artifacts/${appId}/users/${userId}/scores/results`);
            onSnapshot(scoresRef, (docSnap) => {
                if (docSnap.exists()) {
                    userScores = docSnap.data().scores || {};
                    updateUnitCompletionStatus();
                } else {
                    userScores = {};
                    updateUnitCompletionStatus();
                }
            });
        };

        /**
         * Guarda el puntaje de un test en Firestore.
         * @param {string} userId El ID del usuario.
         * @param {string} unitId El ID de la unidad.
         * @param {number} score El puntaje obtenido.
         */
        const saveTestScore = async (userId, unitId, score) => {
            try {
                const docRef = doc(db, `artifacts/${appId}/users/${userId}/scores/results`);
                const docSnap = await getDoc(docRef);
                const currentScores = docSnap.exists() ? docSnap.data().scores : {};
                
                const newScores = {
                    ...currentScores,
                    [unitId]: {
                        score: score,
                        completada: score >= 7
                    }
                };

                await setDoc(docRef, { scores: newScores });
                showMessage("¡Puntaje guardado con éxito!", "success");
            } catch (error) {
                console.error("Error al guardar el puntaje:", error);
                showMessage("Error al guardar el puntaje.", "error");
            }
        };

        /**
         * Actualiza el estado visual de las unidades en el menú lateral.
         */
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

        /**
         * Renderiza el contenido y el juego de una unidad específica.
         * @param {string} unitId El ID de la unidad a ser renderizada.
         */
        const renderUnitContent = (unitId) => {
            // Ocultar todas las secciones y el contenido principal
            mainContent.classList.add('seccion-contenido--oculta');
            unitSections.forEach(section => section.classList.add('seccion-unidad--oculta'));

            // Exibir la sección de la unidad seleccionada
            const unitSection = document.getElementById(`unit-${unitId}`);
            if (unitSection) {
                unitSection.classList.remove('seccion-unidad--oculta');
            } else {
                // Si la sección no existe, exhibe el contenido principal con un mensaje
                mainContent.classList.remove('seccion-contenido--oculta');
                mainContent.innerHTML = `
                    <h1 class="seccion-contenido__titulo">Unidad no encontrada.</h1>
                    <p class="seccion-contenido__subtitulo">Por favor, selecciona otra unidad.</p>
                `;
                return;
            }

            // Actualizar el link activo en la barra lateral
            document.querySelectorAll('.unidad-link').forEach(link => link.classList.remove('unidad-link--activo'));
            document.querySelector(`[data-unit-id="${unitId}"]`).classList.add('unidad-link--activo');

            // Configurar el quiz
            const unit = units.find(u => u.id === unitId);
            if (unit && unit.quiz === 'true_false') {
                setupTrueFalseQuiz(unitId);
            }
        };

        /**
         * Lógica del juego Verdadero o Falso.
         * @param {string} unitId El ID de la unidad.
         */
        const setupTrueFalseQuiz = (unitId) => {
            const quizData = {
                'UT1': [
                    { question: "Hello is a formal greeting.", answer: "true" },
                    { question: "Goodbye means 'hello'.", answer: "false" },
                    { question: "The verb To Be is am/is/are.", answer: "true" },
                    { question: "'How are you?' is to ask for someone's name.", answer: "false" }
                ],
                'UT4': [
                    { question: "Apple is a fruit.", answer: "true" },
                    { question: "'Some' is used with countable nouns.", answer: "false" }
                ]
            };

            let currentQuestionIndex = 0;
            let correctAnswers = 0;
            
            const questions = quizData[unitId];
            if (!questions || questions.length === 0) {
                const quizContainer = document.getElementById(`quiz-container-${unitId}`);
                if (quizContainer) {
                    quizContainer.innerHTML = `<p class="contenedor-quiz__retroalimentacion--error">No hay preguntas para esta unidad.</p>`;
                }
                return;
            }

            const questionEl = document.getElementById(`question-${unitId}`);
            const feedbackEl = document.getElementById(`feedback-${unitId}`);
            const quizBtns = document.querySelectorAll(`#quiz-container-${unitId} .boton-quiz`);

            const showQuestion = () => {
                if (currentQuestionIndex < questions.length) {
                    questionEl.textContent = questions[currentQuestionIndex].question;
                    feedbackEl.textContent = '';
                    quizBtns.forEach(btn => btn.disabled = false);
                } else {
                    const score = (correctAnswers / questions.length) * 10;
                    questionEl.textContent = `Quiz completado. Tu puntaje es: ${score.toFixed(1)}/10`;
                    feedbackEl.textContent = '¡Felicidades!';
                    feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--error');
                    feedbackEl.classList.add('contenedor-quiz__retroalimentacion--sucesso');
                    quizBtns.forEach(btn => btn.disabled = true);
                    const user = auth.currentUser;
                    if (user) {
                        saveTestScore(user.uid, unitId, score);
                    }
                }
            };

            quizBtns.forEach(btn => {
                btn.onclick = () => {
                    const userAnswer = btn.dataset.answer;
                    const correctAnswer = questions[currentQuestionIndex].answer;
                    
                    if (userAnswer === correctAnswer) {
                        correctAnswers++;
                        feedbackEl.textContent = "¡Correcto!";
                        feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--error');
                        feedbackEl.classList.add('contenedor-quiz__retroalimentacion--sucesso');
                    } else {
                        feedbackEl.textContent = `Incorrecto. La respuesta correcta era: ${correctAnswer === "true" ? "Verdadero" : "Falso"}`;
                        feedbackEl.classList.remove('contenedor-quiz__retroalimentacion--sucesso');
                        feedbackEl.classList.add('contenedor-quiz__retroalimentacion--error');
                    }
                    
                    quizBtns.forEach(b => b.disabled = true);
                    setTimeout(() => {
                        currentQuestionIndex++;
                        showQuestion();
                    }, 1500);
                };
            });

            showQuestion();
        };

        // Escuchar los cambios en el estado de autenticación
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Si un usuario está autenticado, actualiza la UI y el dashboard
                updateProfileUI(user);
                initializeDashboardUI(user.uid);
            } else {
                // Si no hay usuario, restablece la UI o redirige
                if (userEmailSpan) {
                    userEmailSpan.textContent = "Usuario";
                }
                userPhoto.src = "https://placehold.co/80x80/E2E8F0/A0AEC0?text=U";
            }
        });

        // Configurar el botón de cerrar sesión
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await signOut(auth);
                    showMessage("Sesión cerrada correctamente", "success");
                    // Recargar la página
                    window.location.reload();
                } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                    showMessage("Error al cerrar sesión.", "error");
                }
            });
        }
    }
};

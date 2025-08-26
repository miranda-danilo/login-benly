import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { auth, db } from "./conexion_firebase.js";
import { showMessage } from "./notificaciones.js";

// ... tus importaciones existentes


// Unidades y tests (8 preguntas por unidad)
const units = [
    { id: 'UT1', title: 'Introduction and Basic Greetings', quiz: 'true_false' },
    { id: 'UT2', title: 'People and Places', quiz: 'true_false' },
    { id: 'UT3', title: 'Daily Life', quiz: 'true_false' },
    { id: 'UT4', title: 'Foods and Drinks', quiz: 'true_false' },
    { id: 'UT5', title: 'Things I Have', quiz: 'true_false' },
    { id: 'UT6', title: 'Around Town - Free Time', quiz: 'true_false' },
    { id: 'JUEGOS', title: 'Juegos - Ahorcado', quiz: 'none' },
    { id: 'WRITING', title: 'Práctica de Escritura', quiz: 'none' }, // Removed interactive test
    { id: 'EXAM1', title: 'FIRST TERM EXAMEN', quiz: 'true_false' },
    { id: 'EXAM2', title: 'SECOND TERM EXAMEN', quiz: 'true_false' },
    /* { id: 'UT7', title: 'Around Town - Free Time', quiz: 'true_false' }, */
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
    ],
    'EXAM1': [
        { question: "The verb 'to be' has three forms: am, is, are.", answer: "true" },
        { question: "'Good morning' is used to say hello in the evening.", answer: "false" },
        { question: "Possessive adjectives like 'my', 'your', 'his' show ownership.", answer: "true" },
        { question: "'Brother' means the same as 'sister'.", answer: "false" },
        { question: "Adverbs of frequency include 'always', 'never', and 'sometimes'.", answer: "true" },
        { question: "'Wake up' means the same as 'go to bed'.", answer: "false" },
        { question: "Countable nouns can be singular or plural.", answer: "true" },
        { question: "'Water' is a countable noun.", answer: "false" }
    ],
    'EXAM2': [
        { question: "'I have a phone' is a correct sentence.", answer: "true" },
        { question: "'Keys' means 'comida' in Spanish.", answer: "false" },
        { question: "Present continuous can be used for future plans.", answer: "true" },
        { question: "'Library' is a place to eat food.", answer: "false" },
        { question: "Basic greetings include 'hello' and 'goodbye'.", answer: "true" },
        { question: "'Good afternoon' is used at night.", answer: "false" },
        { question: "Family vocabulary includes 'father', 'mother', 'brother'.", answer: "true" },
        { question: "'Son' means 'hija' in Spanish.", answer: "false" }
    ],
    /* 'UT7': [
        { question: "Bank is a place in town.", answer: "true" },
        { question: "Playing sports is a hobby.", answer: "true" },
        { question: "Present continuous is used for future plans.", answer: "true" },
        { question: "Library is a place to eat.", answer: "false" },
        { question: "Park is a place for free time.", answer: "true" },
        { question: "Cinema is a place to watch movies.", answer: "true" },
        { question: "Swimming pool is for reading.", answer: "false" },
        { question: "Restaurant is a place to eat.", answer: "true" }
    ] */
};


export const setupUserPanelLogic = (panelElement, userRole) => {
    
 const sentenceInput = document.getElementById('sentenceInput');
        const correctButton = document.getElementById('correctButton');
        const feedbackContainer = document.getElementById('feedbackContainer');
        const feedbackContent = document.getElementById('feedbackContent');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const alertPlaceholder = document.getElementById('alertPlaceholder');

        // Función para mostrar mensajes de alerta
        const showAlert = (message) => {
            alertPlaceholder.innerHTML = `<div class="alert-message">${message}</div>`;
        };
        
        


        // Función para realizar la llamada a la API con reintentos y retroceso exponencial
        async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                if (retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return fetchWithRetry(url, options, retries - 1, delay * 2);
                } else {
                    throw error;
                }
            }
        }

        correctButton.addEventListener('click', async () => {
            const sentence = sentenceInput.value.trim();
            if (!sentence) {
                showAlert('Por favor, escribe una oración para verificar.');
                return;
            }

            // Ocultar mensajes de alerta anteriores
            alertPlaceholder.innerHTML = '';
            
            // Mostrar estado de carga
            feedbackContainer.classList.remove('hidden');
            feedbackContent.classList.add('hidden');
            loadingIndicator.classList.remove('hidden');

            try {
                // El prompt para el modelo Gemini
                const prompt = `Actúa como un corrector de oraciones en inglés. Analiza la siguiente oración y determina si es gramaticalmente correcta. Si es correcta, devuelve un JSON con el estado "Correcta". Si es incorrecta, devuelve un JSON con el estado "Incorrecta", la versión corregida de la oración y una explicación clara y concisa de los errores en español.
                
                Oración: "${sentence}"
                
                Ejemplo de JSON correcto:
                {
                    "status": "Correcta"
                }
                
                Ejemplo de JSON incorrecto:
                {
                    "status": "Incorrecta",
                    "corrected_sentence": "The man goes to the store.",
                    "explanation": "El verbo 'go' debe estar en su forma 'goes' para concordar con el sujeto 'the man' en tercera persona del singular."
                }`;

                const payload = {
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                status: { type: "STRING" },
                                corrected_sentence: { type: "STRING", description: "Only required if status is 'Incorrecta'" },
                                explanation: { type: "STRING", description: "Only required if status is 'Incorrecta'" }
                            },
                            required: ["status"]
                        }
                    }
                };

                const apiKey = "AIzaSyDk6yjhp_DZ3gXUob4gID6vKrDLAaD-OGY";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                const response = await fetchWithRetry(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = response.candidates[0].content.parts[0].text;
                const parsedResult = JSON.parse(result);

                // Actualizar la interfaz de usuario con el resultado
                let outputHtml = '';



                if (parsedResult.status === 'Correcta') {
                    outputHtml = `
                        <p class="feedback-message feedback-message--correct">
                            <svg class="feedback-message__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ¡Correcta!
                        </p>
                        <p class="feedback-explanation">Tu oración es gramaticalmente correcta.</p>
                    `;
                } else {
                    outputHtml = `
                        <p class="feedback-message feedback-message--incorrect">
                            <svg class="feedback-message__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ¡Incorrecta!
                        </p>
                        <div class="corrected-section">
                            <h3 class="input-label">Versión corregida:</h3>
                            <p class="corrected-text">"${parsedResult.corrected_sentence}"</p>
                        </div>
                        <div class="explanation-section">
                            <h3 class="input-label">Explicación:</h3>
                            <p class="explanation-text">${parsedResult.explanation}</p>
                        </div>
                    `;
                }

               
                console.log('API Response:', parsedResult);

                feedbackContent.innerHTML = outputHtml;
            } catch (error) {
                console.error('Error:', error);
                feedbackContent.innerHTML = `
                    <p class="error-message">Ocurrió un error al procesar la solicitud. Por favor, inténtalo de nuevo.</p>
                    <p class="error-detail">Detalles del error: ${error.message}</p>
                `;
            } finally {
                // Ocultar estado de carga y mostrar contenido
                loadingIndicator.classList.add('hidden');
                feedbackContent.classList.remove('hidden');
            }
        });

    
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
        // Solo inserta el quiz si no es la unidad WRITING
       
    
       
        if (unitId !== 'WRITING' && unitId !== 'JUEGOS') {
            const quizDiv = document.createElement('div');
            quizDiv.className = 'tarjeta-actividad';
        
    
            // Different text for exams vs regular units
            const isExam = unitId === 'EXAM1' || unitId === 'EXAM2';
            const infoText = isExam ? 
                'El examen solo se podrá dar una vez.‼️‼️' : 
                'Solo se guardará tu nota más alta en este test.';
            
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
                    <p style="margin-top:1rem;font-weight:bold;"><b>${infoText}</b></p>
                </div>
            `;
            unitSection.appendChild(quizDiv);
            setupTrueFalseQuiz(unitId);
        } 
        else if (unitId === 'JUEGOS') {
            
            setupHangmanGame();
        }
        
        
        // Audio dinámico para todas las unidades
setTimeout(() => {
    const playBtn = document.getElementById(`audio-play-${unitId.toLowerCase()}`);
    const pauseBtn = document.getElementById(`audio-pause-${unitId.toLowerCase()}`);
    const stopBtn = document.getElementById(`audio-stop-${unitId.toLowerCase()}`);
    let utterance;
    let isPaused = false;
    let isSpeaking = false;

    if (playBtn) {
        playBtn.onclick = () => {
            window.speechSynthesis.cancel();
            isPaused = false;
            isSpeaking = true;

            playBtn.classList.add('boton-audio--playing');
            playBtn.innerHTML = '🔊 Reproduciendo...';
            pauseBtn.classList.add('boton-audio--pause');
            pauseBtn.classList.remove('boton-audio--resume');
            pauseBtn.innerHTML = '⏸️ Pausar';
            stopBtn.classList.add('boton-audio--stop');

            // Solo lee el texto en inglés, ignorando lo que está dentro de <span>
            const leccionUl = unitSection.querySelector('.tarjeta-leccion ul');
            const vocabularioUl = unitSection.querySelector('.tarjeta-vocabulario ul');
            let texto = '';

            function getEnglishFromList(ul) {
                if (!ul) return '';
                return Array.from(ul.querySelectorAll('li'))
                    .map(li => {
                        const span = li.querySelector('span');
                        if (span) {
                            return li.innerText.replace(span.innerText, '').trim();
                        }
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

            utterance.onend = () => {
                isSpeaking = false;
                playBtn.classList.remove('boton-audio--playing');
                playBtn.innerHTML = '▶️ Reproducir';
                pauseBtn.classList.add('boton-audio--pause');
                pauseBtn.classList.remove('boton-audio--resume');
                pauseBtn.innerHTML = '⏸️ Pausar';
            };
            utterance.onpause = () => {
                isPaused = true;
                pauseBtn.classList.remove('boton-audio--pause');
                pauseBtn.classList.add('boton-audio--resume');
                pauseBtn.innerHTML = '▶️ Reanudar';
            };
            utterance.onresume = () => {
                isPaused = false;
                pauseBtn.classList.add('boton-audio--pause');
                pauseBtn.classList.remove('boton-audio--resume');
                pauseBtn.innerHTML = '⏸️ Pausar';
            };

            window.speechSynthesis.speak(utterance);
        };
    }
    if (pauseBtn) {
        pauseBtn.onclick = () => {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                window.speechSynthesis.pause();
            } else if (window.speechSynthesis.paused && isPaused) {
                window.speechSynthesis.resume();
            }
        };
        pauseBtn.classList.add('boton-audio--pause');
        pauseBtn.classList.remove('boton-audio--resume');
        pauseBtn.innerHTML = '⏸️ Pausar';
    }
    if (stopBtn) {
        stopBtn.onclick = () => {
            window.speechSynthesis.cancel();
            if (playBtn) {
                playBtn.classList.remove('boton-audio--playing');
                playBtn.innerHTML = '▶️ Reproducir';
            }
            if (pauseBtn) {
                pauseBtn.classList.add('boton-audio--pause');
                pauseBtn.classList.remove('boton-audio--resume');
                pauseBtn.innerHTML = '⏸️ Pausar';
            }
        };
        stopBtn.classList.add('boton-audio--stop');
        stopBtn.innerHTML = '⏹️ Parar';
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

    // Quiz interactivo con barra de progreso - Exámenes solo permiten un intento
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
            questionEl.textContent = `Examen completado. Tu puntaje es: ${score.toFixed(1)}/10`;
            
            // Para exámenes (EXAM1 y EXAM2), mostrar mensaje de un solo intento
            if (unitId === 'EXAM1' || unitId === 'EXAM2') {
                feedbackEl.textContent = 'danilo miranda xd';
            } else {
                feedbackEl.textContent = score >= 7 ? '¡Felicidades!' : 'Puedes mejorar tu puntaje.';
            }
            
            feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--sucesso', score >= 7);
            feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--error', score < 7);
            quizBtns.forEach(btn => btn.disabled = true);
            
            // Ocultar botón de repetir para exámenes
            if (unitId === 'EXAM1' || unitId === 'EXAM2') {
                repeatBtn.style.display = "none";
            } else {
                repeatBtn.style.display = "inline-block";
            }
            
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

    // Solo mostrar botón de repetir para unidades normales, no para exámenes
    if (repeatBtn) {
        if (unitId === 'EXAM1' || unitId === 'EXAM2') {
            repeatBtn.style.display = "none";
        } else {
            repeatBtn.onclick = () => {
                currentQuestionIndex = 0;
                correctAnswers = 0;
                quizBtns.forEach(btn => btn.disabled = false);
                repeatBtn.style.display = "none";
                showQuestion();
            };
        }
    }

    const scoreData = userScores[unitId];
    if (scoreData) {
        questionEl.textContent = `Examen completado. Tu puntaje es: ${scoreData.score.toFixed(1)}/10`;
        
        // Para exámenes, mostrar mensaje de un solo intento
        if (unitId === 'EXAM1' || unitId === 'EXAM2') {
            feedbackEl.textContent = 'EXAMEN REALIZADO.';
        } else {
            feedbackEl.textContent = scoreData.completada ? '¡Felicidades!' : 'Puedes mejorar tu puntaje.';
        }
        
        feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--sucesso', scoreData.completada);
        feedbackEl.classList.toggle('contenedor-quiz__retroalimentacion--error', !scoreData.completada);
        quizBtns.forEach(btn => btn.disabled = true);
        
        // Ocultar botón de repetir para exámenes
        if (unitId === 'EXAM1' || unitId === 'EXAM2') {
            if (repeatBtn) repeatBtn.style.display = "none";
        } else {
            if (repeatBtn) repeatBtn.style.display = "inline-block";
        }
    } else {
        showQuestion();
    }
};

// ==========================================================================
// Lógica del Juego del Ahorcado
// ==========================================================================

function setupHangmanGame() {
    const unitWords = {
        UT1: ['hello', 'bye', 'morning', 'night', 'teacher', 'student'],
        UT2: ['mother', 'father', 'sister', 'brother', 'family', 'home', 'city', 'town'],
        UT3: ['always', 'never', 'sometimes', 'schedule', 'morning', 'evening'],
        UT4: ['apple', 'banana', 'orange', 'grape', 'sandwich', 'water', 'juice', 'coffee'],
        UT5: ['phone', 'laptop', 'bag', 'wallet', 'keys', 'notebook', 'shoe'],
        UT6: ['town', 'bank', 'store', 'park', 'movies', 'sports', 'reading', 'cooking']
    };

    const wordDisplay = document.getElementById('hangman-word');
    const messageDisplay = document.getElementById('hangman-message');
    const lettersContainer = document.getElementById('hangman-letters');
    const subtitulo = document.getElementById('subtitulo');
    const restartButton = document.getElementById('hangman-restart-button');
    const unitSelector = document.getElementById('unit-selector');
    const hangmanParts = document.querySelectorAll('.parte-ahorcado');

    let secretWord = '';
    let guessedLetters = [];
    let mistakesLeft = 6;
    let currentScore = 0;

    function updateWordDisplay() {
        let display = '';
        for (const letter of secretWord) {
            if (guessedLetters.includes(letter)) {
                display += letter + ' ';
            } else {
                display += '_ ';
            }
        }
        wordDisplay.textContent = display.trim();
        console.log('Palabra actualizada en pantalla:', wordDisplay.textContent);
    }

    function updateHangman() {
        const partsToDisplay = 8 - mistakesLeft;
        hangmanParts.forEach((part, index) => {
            part.style.display = index < partsToDisplay ? 'block' : 'none';
        });
    }

    function checkWin() {
        if (!wordDisplay.textContent.includes('_')) {
            currentScore = 10;
            messageDisplay.textContent = `¡Ganaste! 🎉 Calificación: ${currentScore}`;
            messageDisplay.className = 'juego-ahorcado__mensaje juego-ahorcado__mensaje--ganador';
            disableLetters();
            // Guarda la calificación en Firestore
            const user = auth.currentUser;
            if (user) {
                saveTestScore(user.uid, 'JUEGOS', currentScore);
            }
        }
    }

    function checkLose() {
        if (mistakesLeft <= 0) {
            currentScore = 0;
            messageDisplay.textContent = `¡Perdiste! 😭 La palabra era: ${secretWord}. Calificación: ${currentScore}`;
            messageDisplay.className = 'juego-ahorcado__mensaje juego-ahorcado__mensaje--perdedor';
            updateHangman();
            disableLetters();
            // Guarda la calificación en Firestore
            const user = auth.currentUser;
            if (user) {
                saveTestScore(user.uid, 'JUEGOS', currentScore);
            }
        }
    }

    function disableLetter(letterButton, correct) {
        letterButton.disabled = true;
        letterButton.classList.add(correct ? 'juego-ahorcado__letra--correcta' : 'juego-ahorcado__letra--incorrecta');
    }

    function disableLetters() {
        document.querySelectorAll('.juego-ahorcado__letras button').forEach(button => {
            button.disabled = true;
        });
    }
    
    function enableLetters() {
        document.querySelectorAll('.juego-ahorcado__letras button').forEach(button => {
            button.disabled = false;
            button.className = 'juego-ahorcado__letra';
        });
    }
    
    function generateLetters() {
        lettersContainer.innerHTML = '';
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (const letter of alphabet) {
            const button = document.createElement('button');
            button.textContent = letter;
            button.className = 'juego-ahorcado__letra';
            button.addEventListener('click', handleGuess);
            lettersContainer.appendChild(button);
        }

        console.log('Letras generadas para el juego del ahorcado.');
    }

    function handleGuess(event) {
        if (unitSelector.value === 'none') return;
        
        const letter = event.target.textContent;
        if (guessedLetters.includes(letter)) {
            return;
        }
        guessedLetters.push(letter);
        const correctGuess = secretWord.includes(letter);
        disableLetter(event.target, correctGuess);

        if (correctGuess) {
            updateWordDisplay();
            checkWin();
        } else {
            mistakesLeft--;
            updateHangman();
            checkLose();
        }
    }

    function resetGame() {
        const selectedUnit = unitSelector.value;
        if (selectedUnit === 'none') {
            subtitulo.textContent = 'Selecciona una opción para empezar.';
            wordDisplay.textContent = '';
            messageDisplay.textContent = '';
            disableLetters();
            hangmanParts.forEach(part => part.style.display = 'none');
            return;
        }
        
        enableLetters();
        subtitulo.textContent = '¡Adivina la palabra!';
        const wordsForUnit = unitWords[selectedUnit] || [];
        secretWord = wordsForUnit[(Math.random() * wordsForUnit.length) | 0].toUpperCase();
        guessedLetters = [];
        mistakesLeft = 6;
        currentScore = 0;
        messageDisplay.textContent = '';
        messageDisplay.className = 'juego-ahorcado__mensaje';
        updateWordDisplay();
        updateHangman();
    }
    
    // Nueva lógica de inicialización. Primero genera las letras y luego
    // espera a que el usuario seleccione una unidad.
    generateLetters();
    unitSelector.addEventListener('change', resetGame);
    
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            unitSelector.value = 'none';
            resetGame();
        });
    }

}
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

import { auth, db } from "./conexion_firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { showMessage } from "./notificaciones.js";

// Datos de ejemplo para la práctica de habla
const speakingData = {
    'greetings': {
        title: "Saludos Básicos",
        phrases: [
            "Hello, how are you?",
            "Nice to meet you.",
            "Good morning.",
            "Goodbye, see you later."
        ]
    },
    'introductions': {
        title: "Presentaciones",
        phrases: [
            "My name is...",
            "I am from...",
            "I like to...",
            "How old are you?"
        ]
    },
    'questions': {
        title: "Preguntas Frecuentes",
        phrases: [
            "Where are you from?",
            "What is your name?",
            "What time is it?",
            "How do you spell that?"
        ]
    }
};

let recognition = null;

// Inicializa el SpeechRecognition API
const initSpeechRecognition = () => {
    // Si ya existe una instancia, la retorna
    if (recognition) {
        return recognition;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        showMessage("Tu navegador no soporta la API de reconocimiento de voz. Por favor, usa Chrome.", "error");
        return null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    return recognition;
};


/**
 * Calcula un puntaje de similitud entre dos textos.
 * @param {string} reference - El texto de referencia.
 * @param {string} userText - El texto del usuario.
 * @returns {number} - El puntaje de similitud (0-10).
 */
function calculateScore(reference, userText) {
    const refWords = reference.toLowerCase().split(/\s+/);
    const userWords = userText.toLowerCase().split(/\s+/);
    let correctWords = 0;
    
    // Contar las palabras correctas
    userWords.forEach(userWord => {
        if (refWords.includes(userWord)) {
            correctWords++;
        }
    });

    const score = (correctWords / refWords.length) * 10;
    return Math.min(score, 10); // Asegura que el puntaje no sea mayor a 10
}


/**
 * Maneja la lógica de la sección de speaking.
 * @param {HTMLElement} unitSection - La sección de la unidad en el DOM.
 * @param {function} playSound - La función para reproducir sonidos.
 * @param {object} userScores - El objeto de puntajes del usuario.
 */
export const setupSpeakingExercise = (unitSection, playSound, userScores) => {
    const content = `
        <h2 class="titulo-user">Práctica de Habla y Pronunciación</h2>
        <p class="descripcion">Mejora tu pronunciación repitiendo frases en inglés.</p>
        
        <div class="speaking-section">
            <div class="opciones-speaking">
                <select id="speakingTopicSelect" class="select-field">
                    <option value="">-- Selecciona un tema --</option>
                    <option value="greetings">Saludos Básicos</option>
                    <option value="introductions">Presentaciones</option>
                    <option value="questions">Preguntas Frecuentes</option>
                </select>
            </div>
            
            <div id="speaking-area" class="speaking-area">
                <div class="speaking-card">
                    <p class="speaking-phrase-title">Frase a Practicar:</p>
                    <p id="phraseText" class="speaking-phrase">Selecciona un tema para comenzar.</p>
                </div>

                <div class="speaking-buttons">
                    <button id="recordBtn" class="action-button record-button">
                        <i class="fas fa-microphone"></i> Grabar
                    </button>
                    <button id="nextPhraseBtn" class="action-button next-button hidden">Siguiente</button>
                </div>

                <div id="feedbackContainer" class="feedback-container hidden">
                    <div id="loadingIndicator" class="loading-indicator hidden">
                        <div class="loading-spinner"></div>
                        <span class="loading-text">Evaluando...</span>
                    </div>
                    <div id="feedbackContent"></div>
                    <div id="speakingScoreDisplay" class="mt-4 text-center font-bold text-lg"></div>
                </div>
            </div>
        </div>
    `;

    unitSection.innerHTML = content;

    const topicSelect = document.getElementById('speakingTopicSelect');
    const speakingArea = document.getElementById('speaking-area');
    const phraseTextEl = document.getElementById('phraseText');
    const recordBtn = document.getElementById('recordBtn');
    const nextPhraseBtn = document.getElementById('nextPhraseBtn');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const feedbackContent = document.getElementById('feedbackContent');
    const scoreDisplay = document.getElementById('speakingScoreDisplay');

    let currentPhrases = [];
    let currentPhraseIndex = 0;
    let recognition = initSpeechRecognition();

    const displayCurrentScore = () => {
        const speakingScore = userScores.scores?.SPEAKING;
        const score = speakingScore ? speakingScore.score : 0;
        scoreDisplay.innerHTML = `<h3 class="font-bold text-lg">Tu puntaje: ${score.toFixed(1)}/10</h3>`;
    };

    displayCurrentScore();

    topicSelect.addEventListener('change', () => {
        const selectedTopic = topicSelect.value;
        if (selectedTopic && speakingData[selectedTopic]) {
            currentPhrases = speakingData[selectedTopic].phrases;
            currentPhraseIndex = 0;
            phraseTextEl.textContent = currentPhrases[currentPhraseIndex];
            recordBtn.disabled = false;
            nextPhraseBtn.classList.add('hidden');
            feedbackContainer.classList.add('hidden');
        }
        displayCurrentScore();
    });

    recordBtn.addEventListener('click', () => {
        if (!recognition) return;
        
        recordBtn.textContent = "Escuchando...";
        recordBtn.disabled = true;
        feedbackContainer.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        recognition.onresult = (event) => {
            const userSpeech = event.results[0][0].transcript;
            const phrase = currentPhrases[currentPhraseIndex];
            const score = calculateScore(phrase, userSpeech);
            
            loadingIndicator.classList.add('hidden');
            feedbackContainer.classList.remove('hidden');

            let feedbackMessage = '';
            let isCorrect = false;

            if (score >= 7) {
                feedbackMessage = `
                    <p class="feedback-message--correct">¡Muy bien! ✅</p>
                    <p class="feedback-explanation">Tu pronunciación fue excelente.</p>
                    <p class="feedback-explanation">Tu puntaje en esta frase: ${score.toFixed(1)}/10</p>
                `;
                playSound("win");
                isCorrect = true;
            } else if (score >= 4) {
                feedbackMessage = `
                    <p class="feedback-message--warning">¡Casi! 🤔</p>
                    <p class="feedback-explanation">Tu pronunciación es buena, pero puedes mejorar. Intenta de nuevo.</p>
                    <p class="feedback-explanation">Tu puntaje en esta frase: ${score.toFixed(1)}/10</p>
                `;
                playSound("wrong");
            } else {
                feedbackMessage = `
                    <p class="feedback-message--incorrect">¡Inténtalo de nuevo! ❌</p>
                    <p class="feedback-explanation">La pronunciación no fue la esperada. Escucha la frase y repite.</p>
                    <p class="feedback-explanation">Tu puntaje en esta frase: ${score.toFixed(1)}/10</p>
                `;
                playSound("fail");
            }
            
            feedbackContent.innerHTML = feedbackMessage;

            const user = auth.currentUser;
            if (user) {
                saveSpeakingScore(user.uid, score);
            }
            
            recordBtn.textContent = "Grabar";
            recordBtn.disabled = false;
            nextPhraseBtn.classList.remove('hidden');
        };

        recognition.onerror = (event) => {
            loadingIndicator.classList.add('hidden');
            showMessage(`Error en el reconocimiento de voz: ${event.error}`, "error");
            recordBtn.textContent = "Grabar";
            recordBtn.disabled = false;
        };

        recognition.start();
    });

    nextPhraseBtn.addEventListener('click', () => {
        currentPhraseIndex = (currentPhraseIndex + 1) % currentPhrases.length;
        phraseTextEl.textContent = currentPhrases[currentPhraseIndex];
        feedbackContainer.classList.add('hidden');
        nextPhraseBtn.classList.add('hidden');
        displayCurrentScore();
    });
};

/**
 * Guarda el puntaje de la unidad SPEAKING en Firestore.
 * @param {string} userId - ID del usuario.
 * @param {number} score - Puntaje obtenido.
 */
async function saveSpeakingScore(userId, score) {
    if (!userId) {
        showMessage("No se pudo guardar el puntaje. Usuario no autenticado.", "error");
        return;
    }

    try {
        const docRef = doc(db, `usuarios/${userId}`);
        const docSnap = await getDoc(docRef);
        const currentData = docSnap.exists() ? docSnap.data() : {};
        const currentScores = currentData.scores || {};
        const prevScore = currentScores['SPEAKING']?.score || 0;
        
        if (score > prevScore) {
             const newScoreEntry = {
                score: score,
                completada: score >= 7,
            };
            
            await setDoc(docRef, {
                ...currentData,
                scores: {
                    ...currentScores,
                    ['SPEAKING']: newScoreEntry
                }
            }, { merge: true });

            showMessage("Puntaje de habla guardado con éxito.", "success");
        }
    } catch (error) {
        console.error("Error al guardar el puntaje de habla:", error);
        showMessage("Error al guardar el puntaje de habla.", "error");
    }
}

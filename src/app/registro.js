import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { auth } from "./conexion_firebase.js";
import { showMessage } from "../app/notificaciones.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";


// Obtiene los elementos del DOM necesarios
const d = document;
const $signupModal = d.getElementById("signup-modal");
const $signupForm = d.getElementById("signup-form");

/**
 * Configura el listener del formulario para el registro de usuarios.
 * Esta función debe ser llamada una vez que el DOM esté cargado.
 */
export function setupRegistrationForm() {
    d.addEventListener("submit", async (e) => {
        // Solo ejecuta la lógica si el evento proviene del formulario de registro
        if (e.target === $signupForm) {
            e.preventDefault();

            const email = $signupForm["signup-email"].value;
            const password = $signupForm["signup-password"].value;

            try {
                // Crea el usuario con email y contraseña
                const response = await createUserWithEmailAndPassword(auth, email, password);

                // Cierra el modal y reinicia el formulario en caso de éxito
                $signupModal.close();
                $signupForm.reset();


                // Envía un email de verificación al usuario recién creado
                await sendEmailVerification(auth.currentUser);


                // Muestra un mensaje de éxito al usuario
                showMessage("LINK DE VERIFICACIÓN ENVIADO A SU CORREO");






            } catch (error) {
                // Manejo de errores específicos de Firebase
                const errorCode = error.code;
                if (errorCode === "auth/weak-password") {
                    showMessage("CONTRASEÑA MUY DÉBIL", "error");
                } else if (errorCode === "auth/invalid-email") {
                    showMessage("CORREO INVÁLIDO", "error");
                } else if (errorCode === "auth/email-already-in-use") {
                    showMessage("CORREO YA REGISTRADO", "error");
                } else {
                    // Mensaje de error genérico para otros casos
                    showMessage("OCURRIÓ UN ERROR INESPERADO", "error");
                    console.error("Error completo:", error);
                }
            }
        }
    });
}

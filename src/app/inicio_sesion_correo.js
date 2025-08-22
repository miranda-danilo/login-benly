import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { auth, db } from "./conexion_firebase.js";
import { showMessage } from "./notificaciones.js";

// Obtiene los elementos del DOM una sola vez
const $signinForm = document.getElementById("signin-form");
const $signinModal = document.getElementById("signin-modal");

/**
 * Configura el listener del formulario para el inicio de sesión de usuarios.
 * Esta función debe ser llamada una vez que el DOM esté cargado.
 */
export function setupSignInForm() {
    // Si el formulario existe, configura el listener
    if ($signinForm) {
        $signinForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = $signinForm["signin-email"].value;
            const password = $signinForm["signin-password"].value;

            try {
                // Inicia sesión con email y contraseña
                const response = await signInWithEmailAndPassword(auth, email, password);

                $signinModal.close();
                $signinForm.reset();

                // --- ⚠️ Lógica agregada para la verificación de correo ---
                if (!response.user.emailVerified) {
                    // Si el correo NO está verificado, cierra la sesión del usuario
                    // para evitar que acceda a la UI y muestra un mensaje de error.
                    await auth.signOut();
                    showMessage("CORREO NO VERIFICADO. LOGIN", "error");
                    return; // Detiene la ejecución de la función
                }
                // --------------------------------------------------------
                
               


                const uid = response.user.uid;

                // ⚠️ Tu lógica para asignar el rol (es mejor hacerlo en el registro,
                // pero si lo necesitas aquí para mantener la consistencia, es válido)
                let roleUser = "user";
                if (email === "miranda-roberth0691@unesum.edu.ec") {
                    roleUser = "admin";
                }

                // Crea la referencia al documento en Firestore
                const docRef = doc(db, `usuarios/${uid}`);

                // Guarda la información del usuario en Firestore (o actualiza si ya existe)
                await setDoc(docRef, {
                    email: email,
                    role: roleUser
                });


               /*   $signinModal.close(); */


                // Muestra un mensaje de éxito
                showMessage(`¡Bienvenido!`);

                // Cierra el modal de inicio de sesión
                // Se asume que 'closeModal' está definida en tu index.js
                // Puedes usar una función de utilidad si lo prefieres



/* 
                if ($signinModal) {
                    $signinModal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                } */

                // Limpia el formulario
               /*  $signinForm.reset(); */

            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Error al iniciar sesión:", errorCode, errorMessage);

                // Muestra un mensaje de error detallado
                if (errorCode === "auth/wrong-password") {
                    showMessage("Contraseña incorrecta", "error");
                } else if (errorCode === "auth/user-not-found") {
                    showMessage("Usuario no encontrado", "error");
                } else if (errorCode === "auth/invalid-email") {
                    showMessage("Correo inválido", "error");
                } else {
                    showMessage(`Error: ${errorMessage}`, "error");
                }
            }
        });
    }
}
// user_interface.js

// Importa las funciones necesarias de Firebase y otros módulos
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { auth } from "./conexion_firebase.js";
import { showMessage } from "./notificaciones.js";

/**
 * Función principal que inicializa la lógica de la interfaz de usuario del panel de usuario.
 * @param {HTMLElement} panelElement El elemento del panel de usuario.
 */
export const setupUserPanelLogic = (panelElement, userRole) => {
    // Si el panel de usuario existe, configuramos su lógica
    if (panelElement) {
        // Obtenemos las referencias a los elementos dentro del panel
        const userEmailSpan = panelElement.querySelector("#user-email");
        const userRoleSpan = panelElement.querySelector("#user-role");
        const userPhoto = panelElement.querySelector("#user-photo"); // Nueva referencia
        const logoutBtn = panelElement.querySelector("#logout-btn");

        // Función para actualizar la UI del perfil de usuario
        const updateProfileUI = (user) => {
            if (user && userEmailSpan) {
                userEmailSpan.textContent = user.email;
            }

            // Aquí puedes cargar el rol del usuario desde la base de datos
            // Por ahora, lo dejamos en "Estudiante"
            /*    if (userRoleSpan) {
                   userRoleSpan.textContent = "Estudiante";
   
   
               }
    */
            
            // NUEVA LÓGICA: Cargar la foto de perfil del usuario
                if (userPhoto && user.photoURL) {
                    userPhoto.src = user.photoURL;
                } else if (userPhoto) {
                    // Si no hay photoURL, usa un placeholder genérico
                    userPhoto.src = "https://placehold.co/80x80/E2E8F0/A0AEC0?text=JP";
                }
            
            
               // Establecer el rol del usuario en la interfaz
            if (userRoleSpan && userRole) {
                userRoleSpan.textContent = userRole;
            }

        };

        // Escuchamos cambios en el estado de autenticación
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Si hay un usuario autenticado, actualizamos la UI
                updateProfileUI(user);
            } else {
                // Si no hay usuario, puedes resetear la UI o redirigir
                if (userEmailSpan) {
                    userEmailSpan.textContent = "Usuario";
                }
            }
        });

        // Añadimos el listener para el botón de cerrar sesión
        /*   if (logoutBtn) {
              logoutBtn.addEventListener("click", async () => {
                  try {
                      await signOut(auth);
                      showMessage("Sesión cerrada correctamente", "success");
                  } catch (error) {
                      console.error("Error al cerrar sesión:", error);
                      showMessage("Error al cerrar sesión", "error");
                  }
              });
          } */
    }
};

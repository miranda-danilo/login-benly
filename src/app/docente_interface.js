// panel_docente.js

// Importaciones de Firebase y otros módulos
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { auth } from "./conexion_firebase.js";
import { showMessage } from "./notificaciones.js";

/**
 * Función que inicializa la lógica de la interfaz de usuario del panel del docente.
 * @param {HTMLElement} panelElement El elemento del panel de usuario.
 * @param {string} adminRole El rol del administrador (docente).
 */
export const setupAdminPanelLogic = (panelElement, adminRole) => {
    // Si el panel del administrador existe, configuramos su lógica
    if (panelElement) {
        // Obtenemos las referencias a los elementos dentro del panel
        const adminNameSpan = panelElement.querySelector("#admin-name");
        const adminRoleSpan = panelElement.querySelector("#admin-role");
        const logoutBtn = panelElement.querySelector("#logout-btn-admin");
       
       

        // Función para actualizar la UI del perfil del docente
        const updateProfileUI = (user) => {
            if (user && adminNameSpan) {
                // Actualiza el nombre con el correo electrónico del usuario
                adminNameSpan.textContent = user.email;
            }
        };

        // Escuchamos cambios en el estado de autenticación
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Si hay un usuario autenticado, actualizamos la UI
                updateProfileUI(user);
            }
        });

        // Establecer el rol del administrador en la interfaz
        if (adminRoleSpan && adminRole) {
            adminRoleSpan.textContent = adminRole;
        }

        // Añadimos el listener para el botón de cerrar sesión
       /*  if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                try {
                    const loginModal = document.getElementById('signin-modal');
                    await signOut(auth);
                    loginModal.close();
                    showMessage("Sesión de docente cerrada correctamente", "success");
                } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                    showMessage("Error al cerrar sesión", "error");
                }
            });
        } */
    }
};

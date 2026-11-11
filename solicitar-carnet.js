const SUPABASE_URL = "https://yhzoryuhrrkggtlyppjt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Kaw2rZJutbc5BmrIrEmN6Q_A7kSUebl";

const formulario = document.getElementById("formularioSolicitud");

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mensaje = document.getElementById("mensajeSolicitud");
    const boton = formulario.querySelector('button[type="submit"]');

    mensaje.textContent = "Enviando solicitud...";
    boton.disabled = true;

    const solicitud = {
        nombre_completo: document.getElementById("nombreCompleto").value.trim(),
        cedula: document.getElementById("cedula").value.trim(),
        fecha_nacimiento: document.getElementById("fechaNacimiento").value,
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        domicilio: document.getElementById("domicilio").value.trim(),
        tiene_discapacidad: document.getElementById("discapacidad").value === "true"
    };

    try {
        const respuesta = await fetch(
            `${SUPABASE_URL}/functions/v1/recibir-solicitud-carnet`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(solicitud)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            mensaje.textContent = resultado.error || "No se pudo enviar la solicitud.";
            return;
        }

        document.getElementById("seccionFormulario").style.display = "none";
        document.getElementById("seccionConfirmacion").style.display = "block";

    } catch {
        mensaje.textContent = "No se pudo conectar con el servidor. Intentá nuevamente.";
    } finally {
        boton.disabled = false;
    }
});
```

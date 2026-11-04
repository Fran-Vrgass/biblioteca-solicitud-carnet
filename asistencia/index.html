
const SUPABASE_URL = "https://yhzoryuhrrkggtlyppjt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Kaw2rZJutbc5BmrIrEmN6Q_A7kSUebl";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const canvas = document.getElementById("lienzoFirma");
const ctx = canvas.getContext("2d");

let dibujando = false;
let firmaRealizada = false;

// Cargar actividades activas desde Supabase.
async function cargarActividades() {
    const selector = document.getElementById("actividad");

    selector.innerHTML = '<option value="">Cargando actividades...</option>';
    selector.disabled = true;

    try {
        const { data, error } = await supabaseClient
            .from("actividades")
            .select("nombre")
            .eq("activa", true)
            .order("nombre", { ascending: true });

        if (error) throw error;

        selector.innerHTML = '<option value="">Seleccione una actividad</option>';

        if (!data || data.length === 0) {
            selector.innerHTML = '<option value="">No hay actividades disponibles</option>';
            return;
        }

        data.forEach((actividad) => {
            const opcion = document.createElement("option");
            opcion.value = actividad.nombre;
            opcion.textContent = actividad.nombre;
            selector.appendChild(opcion);
        });

    } catch (error) {
        console.error("Error al cargar actividades:", error);
        selector.innerHTML = '<option value="">No se pudieron cargar las actividades</option>';
    } finally {
        selector.disabled = false;
    }
}

cargarActividades();

function ajustarLienzo() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#245b45";
}

ajustarLienzo();

function obtenerPosicion(evento) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: evento.clientX - rect.left,
        y: evento.clientY - rect.top
    };
}

canvas.addEventListener("pointerdown", (evento) => {
    dibujando = true;
    firmaRealizada = true;

    const posicion = obtenerPosicion(evento);

    ctx.beginPath();
    ctx.moveTo(posicion.x, posicion.y);

    canvas.setPointerCapture(evento.pointerId);
});

canvas.addEventListener("pointermove", (evento) => {
    if (!dibujando) return;

    const posicion = obtenerPosicion(evento);

    ctx.lineTo(posicion.x, posicion.y);
    ctx.stroke();
});

function terminarDibujo() {
    dibujando = false;
}

canvas.addEventListener("pointerup", terminarDibujo);
canvas.addEventListener("pointercancel", terminarDibujo);

document.getElementById("limpiarFirma")
    .addEventListener("click", () => {
        const rect = canvas.getBoundingClientRect();

        ctx.clearRect(0, 0, rect.width, rect.height);
        firmaRealizada = false;
    });

const formulario = document.getElementById("formularioAsistencia");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const carnet = document.getElementById("carnet").value.trim();
    const actividad = document.getElementById("actividad").value;
    const mensaje = document.getElementById("mensaje");
    const boton = formulario.querySelector('button[type="submit"]');

    if (carnet === "") {
        mensaje.textContent = "Debe ingresar su número de carné.";
        mensaje.style.color = "red";
        return;
    }

    if (actividad === "") {
        mensaje.textContent = "Debe seleccionar una actividad.";
        mensaje.style.color = "red";
        return;
    }

    if (!firmaRealizada) {
        mensaje.textContent = "Debe realizar su firma antes de continuar.";
        mensaje.style.color = "red";
        return;
    }

    const tokenTurnstile = document.querySelector(
        '[name="cf-turnstile-response"]'
    )?.value;

    if (!tokenTurnstile) {
        mensaje.textContent = "Por favor, completá la verificación de seguridad.";
        mensaje.style.color = "red";
        return;
    }

    const firma = canvas.toDataURL("image/png");

    boton.disabled = true;
    mensaje.textContent = "Registrando asistencia...";
    mensaje.style.color = "black";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "registrar-asistencia",
            {
                body: {
                    carnet: carnet,
                    actividad: actividad,
                    firma: firma,
                    tokenTurnstile: tokenTurnstile
                }
            }
        );

        if (error) {
            const respuesta = await error.context?.json?.();

            if (respuesta?.error) {
                mensaje.textContent = respuesta.error;
                mensaje.style.color = "red";
                return;
            }

            throw error;
        }

        mensaje.textContent = data.mensaje;
        mensaje.style.color = "green";

    } catch (error) {
        console.error("Error:", error);
        mensaje.textContent =
            "No se pudo registrar la asistencia. Verifique los datos e intente nuevamente.";
        mensaje.style.color = "red";

    } finally {
        boton.disabled = false;
    }
});

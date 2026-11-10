
const SUPABASE_URL = "https://yhzoryuhrrkggtlyppjt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Kaw2rZJutbc5BmrIrEmN6Q_A7kSUebl";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const canvas = document.getElementById("lienzoFirma");
const ctx = canvas.getContext("2d");

const formulario = document.getElementById("formularioAsistencia");
const selector = document.getElementById("actividad");
const mensaje = document.getElementById("mensaje");
const botonLimpiar = document.getElementById("limpiarFirma");
const botonEnviar = formulario.querySelector('button[type="submit"]');

let dibujando = false;
let firmaRealizada = false;
let pointerActivo = null;

function configurarPincel() {
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#245b45";
}

function ajustarLienzo() {
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    configurarPincel();
}

ajustarLienzo();

if ("ResizeObserver" in window) {
    const observador = new ResizeObserver(ajustarLienzo);
    observador.observe(canvas.parentElement);
} else {
    window.addEventListener("resize", ajustarLienzo);
}

// ----------------------------------
// CARGAR ACTIVIDADES DESDE SUPABASE
// ----------------------------------

async function cargarActividades() {
    selector.disabled = true;
    selector.innerHTML =
        '<option value="">Cargando actividades...</option>';

    try {
        const { data, error } = await supabaseClient
            .from("actividades")
            .select("nombre")
            .eq("activa", true)
            .order("nombre", { ascending: true });

        if (error) {
            console.error("Error Supabase:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });

            throw error;
        }

        console.log("Actividades recibidas:", data);

        selector.innerHTML =
            '<option value="">Seleccione una actividad</option>';

        if (!data || data.length === 0) {
            selector.innerHTML =
                '<option value="">No hay actividades activas</option>';

            return;
        }

        data.forEach((actividad) => {
            const opcion = document.createElement("option");

            opcion.value = actividad.nombre;
            opcion.textContent = actividad.nombre;

            selector.appendChild(opcion);
        });

        console.log("Actividades cargadas correctamente.");

    } catch (error) {
        console.error("No se pudieron cargar las actividades:", error);

        selector.innerHTML =
            '<option value="">Error al cargar actividades</option>';

        mensaje.textContent =
            "Error al cargar actividades: " +
            (error.message || "Error desconocido");

        mensaje.style.color = "red";

    } finally {
        selector.disabled = false;
    }
}

cargarActividades();

// ----------------------------------
// FIRMA DIGITAL
// ----------------------------------

function obtenerPosicion(evento) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: evento.clientX - rect.left,
        y: evento.clientY - rect.top
    };
}

canvas.addEventListener("pointerdown", (evento) => {
    if (!evento.isPrimary || pointerActivo !== null) return;

    evento.preventDefault();

    pointerActivo = evento.pointerId;
    dibujando = true;
    firmaRealizada = true;

    const posicion = obtenerPosicion(evento);

    ctx.beginPath();
    ctx.arc(posicion.x, posicion.y, 1.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(posicion.x, posicion.y);

    canvas.setPointerCapture(evento.pointerId);
});

canvas.addEventListener("pointermove", (evento) => {
    if (!dibujando || evento.pointerId !== pointerActivo) return;

    evento.preventDefault();

    const posicion = obtenerPosicion(evento);

    ctx.lineTo(posicion.x, posicion.y);
    ctx.stroke();
});

function terminarDibujo(evento) {
    if (evento && evento.pointerId !== pointerActivo) return;

    dibujando = false;
    pointerActivo = null;
    ctx.beginPath();
}

canvas.addEventListener("pointerup", terminarDibujo);
canvas.addEventListener("pointercancel", terminarDibujo);
canvas.addEventListener("lostpointercapture", terminarDibujo);

function limpiarFirma() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    dibujando = false;
    pointerActivo = null;
    firmaRealizada = false;
    ctx.beginPath();
}

botonLimpiar.addEventListener("click", () => {
    limpiarFirma();
    mensaje.textContent = "";
});

// ----------------------------------
// REGISTRAR ASISTENCIA
// ----------------------------------

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const carnet = document.getElementById("carnet").value.trim();
    const actividad = selector.value;

    if (!carnet) {
        mensaje.textContent = "Debe ingresar su número de carné.";
        mensaje.style.color = "red";
        return;
    }

    if (!actividad) {
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
        mensaje.textContent =
            "Por favor, completá la verificación de seguridad.";
        mensaje.style.color = "red";
        return;
    }

    const firma = canvas.toDataURL("image/png");

    botonEnviar.disabled = true;
    mensaje.textContent = "Registrando asistencia...";
    mensaje.style.color = "black";

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "registrar-asistencia",
            {
                body: {
                    carnet,
                    actividad,
                    firma,
                    tokenTurnstile
                }
            }
        );

        if (error) {
            let respuesta = null;

            try {
                respuesta = await error.context?.json?.();
            } catch (_) {}

            throw new Error(
                respuesta?.error || error.message
            );
        }

        mensaje.textContent =
            data?.mensaje || "Asistencia registrada correctamente.";

        mensaje.style.color = "green";

        limpiarFirma();
        formulario.reset();

    } catch (error) {
        console.error("Error al registrar asistencia:", error);

        mensaje.textContent =
            error.message ||
            "No se pudo registrar la asistencia.";

        mensaje.style.color = "red";

    } finally {
        botonEnviar.disabled = false;
    }
});

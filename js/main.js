document.addEventListener("DOMContentLoaded", () => {

  /* ===== Menú desplegable ===== */
  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");

  function cerrarMenu() {
    menu.classList.remove("abierto");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menú");
  }

  menuBtn.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", String(abierto));
    menuBtn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });

  menu.querySelectorAll("a").forEach(enlace => enlace.addEventListener("click", cerrarMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenu(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 800) cerrarMenu(); });

  /* ===== Cuenta atrás ===== */
  const fechaFestival = new Date("2026-12-05T20:00:00");
  const ids = { dias: "dias", horas: "horas", minutos: "minutos", segundos: "segundos" };

  function actualizarCuenta() {
    let resto = fechaFestival - new Date();
    if (resto < 0) resto = 0;
    const valores = {
      dias: Math.floor(resto / 86400000),
      horas: Math.floor((resto / 3600000) % 24),
      minutos: Math.floor((resto / 60000) % 60),
      segundos: Math.floor((resto / 1000) % 60)
    };
    for (const clave in ids) {
      document.getElementById(ids[clave]).textContent = String(valores[clave]).padStart(2, "0");
    }
  }
  actualizarCuenta();
  setInterval(actualizarCuenta, 1000);

  /* ===== Modales (usan <dialog>) ===== */
  document.querySelectorAll("dialog").forEach(dialogo => {
    dialogo.querySelector("[data-cerrar]").addEventListener("click", () => dialogo.close());
    // Cerrar al pulsar fuera del cuadro
    dialogo.addEventListener("click", e => { if (e.target === dialogo) dialogo.close(); });
  });

  // Modal de banda
  const modalBanda = document.getElementById("modalBanda");
  document.querySelectorAll(".banda-foto").forEach(boton => {
    boton.addEventListener("click", () => {
      const foto = document.getElementById("bandaFoto");
      foto.src = boton.dataset.foto;
      foto.alt = "Foto de " + boton.dataset.banda;
      document.getElementById("bandaTitulo").textContent = boton.dataset.banda;
      document.getElementById("bandaDia").textContent = boton.dataset.dia;
      document.getElementById("bandaEscenario").textContent = boton.dataset.escenario;
      document.getElementById("bandaTexto").textContent = boton.dataset.texto;
      modalBanda.showModal();
    });
  });

  // Modal de entrada
  const modalEntrada = document.getElementById("modalEntrada");
  const cantidad = document.getElementById("cantidad");
  const total = document.getElementById("total");
  const confirmacion = document.getElementById("confirmacion");
  let precioActual = 0;
  let nombreEntrada = "";

  function calcularTotal() {
    let n = parseInt(cantidad.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 6) n = 6;
    cantidad.value = n;
    total.textContent = n * precioActual;
  }

  document.querySelectorAll("[data-entrada]").forEach(boton => {
    boton.addEventListener("click", () => {
      nombreEntrada = boton.dataset.entrada;
      precioActual = Number(boton.dataset.precio);
      document.getElementById("entradaTitulo").textContent = "Entrada: " + nombreEntrada;
      cantidad.value = 1;
      confirmacion.textContent = "";
      calcularTotal();
      modalEntrada.showModal();
    });
  });

  cantidad.addEventListener("input", calcularTotal);

  document.getElementById("confirmar").addEventListener("click", () => {
    confirmacion.textContent = "Reserva simulada: " + cantidad.value + " × " + nombreEntrada + " (" + total.textContent + "€).";
  });

  /* ===== Validación del formulario ===== */
  const form = document.getElementById("formulario");
  const exito = document.getElementById("exito");

  function mostrarError(campo, mensaje) {
    const span = document.getElementById("error-" + campo.id);
    span.textContent = mensaje;
    campo.classList.toggle("invalido", mensaje !== "");
    campo.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
    return mensaje === "";
  }

  const reglas = {
    nombre: campo => {
      const v = campo.value.trim();
      if (v.length < 2) return "Escribe tu nombre (mínimo 2 caracteres).";
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(v)) return "El nombre solo puede tener letras.";
      return "";
    },
    email: campo => {
      const v = campo.value.trim();
      if (v === "") return "Escribe tu correo electrónico.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "El correo no tiene un formato válido (ej: nombre@correo.com).";
      return "";
    },
    motivo: campo => (campo.value === "" ? "Elige un motivo." : ""),
    mensaje: campo => {
      const v = campo.value.trim();
      if (v.length < 10) return "El mensaje debe tener al menos 10 caracteres.";
      if (v.length > 500) return "El mensaje no puede pasar de 500 caracteres.";
      return "";
    },
    acepto: campo => (campo.checked ? "" : "Debes aceptar la política de privacidad.")
  };

  // Validación en vivo al salir de cada campo
  Object.keys(reglas).forEach(id => {
    const campo = document.getElementById(id);
    campo.addEventListener("blur", () => mostrarError(campo, reglas[id](campo)));
    campo.addEventListener("input", () => {
      if (campo.classList.contains("invalido")) mostrarError(campo, reglas[id](campo));
    });
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    exito.textContent = "";
    let todoOk = true;
    let primerError = null;

    Object.keys(reglas).forEach(id => {
      const campo = document.getElementById(id);
      const ok = mostrarError(campo, reglas[id](campo));
      if (!ok) {
        todoOk = false;
        if (!primerError) primerError = campo;
      }
    });

    if (!todoOk) {
      primerError.focus();
      return;
    }
    exito.textContent = "Mensaje enviado. Te respondemos en unos días.";
    form.reset();
  });
});

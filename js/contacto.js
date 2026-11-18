import { activarValidacionEnVivo, validarFormulario } from './validacion.js';
import { crearElemento, formatearFecha } from './ui.js';
import {
  obtenerSolicitudes, guardarSolicitud, actualizarSolicitud, eliminarSolicitud,
  vaciarSolicitudes, obtenerBorrador, guardarBorrador, borrarBorrador
} from './storage.js';

const CAMPOS = ['nombre', 'correo', 'telefono', 'fecha_preferida', 'asunto', 'mensaje'];

const form = document.querySelector('#form-contacto');
const lista = document.querySelector('#lista-solicitudes');
const aviso = document.querySelector('#aviso-form');
const botonEnviar = form.querySelector('button[type="submit"]');
const botonCancelar = document.querySelector('#cancelar-edicion');
const botonVaciar = document.querySelector('#vaciar');
const contadorMensaje = document.querySelector('#contador-mensaje');

let editandoId = null;
let temporizadorAviso;


function aISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function leerCampos({ limpiar = false } = {}) {
  const datos = {};
  CAMPOS.forEach((nombre) => {
    const valor = form.elements[nombre].value;
    datos[nombre] = limpiar ? valor.trim() : valor;
  });
  return datos;
}

function actualizarContador() {
  const mensaje = form.elements.mensaje;
  contadorMensaje.textContent = `${mensaje.value.length} / ${mensaje.maxLength}`;
}

function mostrarAviso(texto, tipo = 'success') {
  clearTimeout(temporizadorAviso);
  aviso.replaceChildren(crearElemento('div', { clase: `alert alert-${tipo}`, texto }));
  temporizadorAviso = setTimeout(() => aviso.replaceChildren(), 6000);
}

function salirDeEdicion() {
  editandoId = null;
  botonEnviar.textContent = 'Enviar';
  botonCancelar.hidden = true;
}


function crearItem(solicitud) {
  const item = crearElemento('li', { clase: 'solicitud', atributos: { 'data-id': solicitud.id } });

  const cita = solicitud.fecha_preferida
    ? ` · Cita preferida: ${formatearFecha(solicitud.fecha_preferida)}`
    : '';

  const cuerpo = crearElemento('div');
  cuerpo.append(
    crearElemento('h3', { texto: solicitud.asunto }),
    crearElemento('p', { texto: solicitud.mensaje }),
    crearElemento('p', {
      clase: 'solicitud-meta',
      texto: `${solicitud.nombre} · ${solicitud.correo} · ${solicitud.telefono}${cita}`
    }),
    crearElemento('p', {
      clase: 'solicitud-meta',
      texto: `Guardada el ${new Date(solicitud.creado).toLocaleString('es-CO')}`
    })
  );

  const acciones = crearElemento('div', { clase: 'solicitud-acciones' });
  acciones.append(
    crearElemento('button', {
      clase: 'btn btn-outline-secondary btn-sm',
      texto: 'Editar',
      atributos: { type: 'button', 'data-accion': 'editar' }
    }),
    crearElemento('button', {
      clase: 'btn btn-outline-danger btn-sm',
      texto: 'Eliminar',
      atributos: { type: 'button', 'data-accion': 'eliminar' }
    })
  );

  item.append(cuerpo, acciones);
  return item;
}

function pintarLista() {
  const solicitudes = obtenerSolicitudes();
  lista.replaceChildren(...[...solicitudes].reverse().map(crearItem)); 

  if (!solicitudes.length) {
    lista.append(crearElemento('li', { clase: 'solicitud-vacia', texto: 'Aún no tienes solicitudes guardadas.' }));
  }
  botonVaciar.hidden = solicitudes.length === 0;
}

function iniciarEdicion(id) {
  const solicitud = obtenerSolicitudes().find((s) => s.id === id);
  if (!solicitud) return;

  editandoId = id;
  CAMPOS.forEach((nombre) => {
    form.elements[nombre].value = solicitud[nombre] ?? '';
  });
  actualizarContador();
  botonEnviar.textContent = 'Guardar cambios';
  botonCancelar.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.elements.nombre.focus();
}


// funciona también con los elementos que se crean después
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const id = Number(boton.closest('li').dataset.id);

  if (boton.dataset.accion === 'editar') {
    iniciarEdicion(id);
    return;
  }

  eliminarSolicitud(id);
  if (editandoId === id) form.reset();
  pintarLista();
  mostrarAviso('Solicitud eliminada.', 'info');
});

botonVaciar.addEventListener('click', () => {
  if (!confirm('¿Borrar todas las solicitudes guardadas en este navegador?')) return;
  vaciarSolicitudes();
  if (editandoId !== null) form.reset();
  pintarLista();
  mostrarAviso('Se borraron todas las solicitudes.', 'info');
});

botonCancelar.addEventListener('click', () => form.reset());

form.addEventListener('input', (evento) => {
  if (evento.target === form.elements.mensaje) actualizarContador();
  if (editandoId === null) guardarBorrador(leerCampos()); 
});

form.addEventListener('reset', () => {
  salirDeEdicion();
  borrarBorrador();
  setTimeout(actualizarContador, 0); 
});

form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // sin recargar la página

  if (!validarFormulario(form)) {
    mostrarAviso('Revisa los campos marcados: hay datos por corregir.', 'danger');
    return;
  }

  const datos = leerCampos({ limpiar: true });
  const editando = editandoId !== null;

  // Aquí, más adelante, irá el fetch POST a Formspree
  const guardado = editando
    ? actualizarSolicitud(editandoId, datos)
    : guardarSolicitud({ id: Date.now(), creado: new Date().toISOString(), ...datos });

  if (!guardado) {
    mostrarAviso('No se pudo guardar en este navegador (almacenamiento lleno o bloqueado).', 'danger');
    return;
  }

  form.reset(); 
  pintarLista();
  mostrarAviso(editando ? 'Solicitud actualizada.' : 'Solicitud guardada correctamente.', 'success');
});

activarValidacionEnVivo(form);

const hoy = new Date();
const limite = new Date();
limite.setDate(hoy.getDate() + 90);
form.elements.fecha_preferida.min = aISO(hoy);
form.elements.fecha_preferida.max = aISO(limite);

// Recupera el borrador que quedó sin enviar
const borrador = obtenerBorrador();
if (borrador) {
  CAMPOS.forEach((nombre) => {
    form.elements[nombre].value = borrador[nombre] ?? '';
  });
  mostrarAviso('Recuperamos el borrador que dejaste sin enviar.', 'info');
}

actualizarContador();
pintarLista();
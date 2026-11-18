import { obtenerServicios } from './api.js';
import { crearElemento, mostrarCargando, mostrarError } from './ui.js';

const detalle = document.querySelector('#detalle');
const relacionados = document.querySelector('#relacionados');
const lista = document.querySelector('#relacionados-lista');

function crearDato(icono, texto) {
  const item = crearElemento('li');
  item.append(
    crearElemento('i', { clase: `bi ${icono}`, atributos: { 'aria-hidden': 'true' } }),
    crearElemento('span', { texto })
  );
  return item;
}

function pintarDetalle(servicio) {
  const figura = crearElemento('figure');
  figura.append(
    crearElemento('img', {
      atributos: { src: servicio.imagen, alt: servicio.alt, width: 600, height: 450 }
    })
  );

  const ficha = crearElemento('ul', { clase: 'ficha' });
  ficha.append(
    crearDato('bi-clock', `Duración: ${servicio.duracion}`),
    crearDato('bi-hospital', `Modalidad: ${servicio.modalidad}`)
  );

  const texto = crearElemento('div', { clase: 'detalle-texto' });
  texto.append(
    crearElemento('h1', { texto: servicio.nombre, atributos: { id: 'titulo-servicio' } }),
    ficha,
    ...servicio.descripcion.map((parrafo) => crearElemento('p', { texto: parrafo }))
  );

  detalle.replaceChildren(figura, texto);
  document.title = `Clínica del Norte | ${servicio.nombre}`;
}

function crearRelacionado(servicio) {
  const tarjeta = crearElemento('article', { clase: 'relacionado' });
  const cuerpo = crearElemento('div');
  cuerpo.append(
    crearElemento('h3', { texto: servicio.nombre }),
    crearElemento('a', {
      clase: 'btn btn-clinica btn-sm',
      texto: 'Ver más',
      atributos: { href: `detalle_servicio.html?id=${servicio.id}` }
    })
  );
  tarjeta.append(
    crearElemento('img', {
      atributos: { src: servicio.imagen, alt: '', width: 80, height: 80, loading: 'lazy' }
    }),
    cuerpo
  );
  return tarjeta;
}

function pintarRelacionados(actual, todos) {
  const otros = todos.filter((s) => s.id !== actual.id).slice(0, 3);
  lista.replaceChildren(...otros.map(crearRelacionado));
  relacionados.hidden = otros.length === 0;
}

async function cargar() {
  relacionados.hidden = true;
  mostrarCargando(detalle, 'Cargando servicio...');
  try {
    const id = Number(new URLSearchParams(location.search).get('id')) || 1;
    const servicios = await obtenerServicios();
    const servicio = servicios.find((s) => s.id === id);

    if (!servicio) {
      mostrarError(detalle, 'No encontramos ese servicio (error 404).');
      return;
    }
    pintarDetalle(servicio);
    pintarRelacionados(servicio, servicios);
  } catch (error) {
    mostrarError(detalle, error.message, cargar);
  }
}

cargar();
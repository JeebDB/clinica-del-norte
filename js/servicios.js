import { obtenerServicios } from './api.js';
import { crearElemento, mostrarCargando, mostrarError } from './ui.js';

const catalogo = document.querySelector('#catalogo');
const filtros = document.querySelector('.barra-filtros');
const buscar = document.querySelector('#buscar');
const categoria = document.querySelector('#categoria');
const contador = document.querySelector('#contador');

let servicios = [];

// Quita tildes y mayúsculas para que "examen" encuentre "Exámenes"
function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function crearTarjeta(servicio) {
  const tarjeta = crearElemento('article', { clase: 'tarjeta tarjeta-servicio' });

  const figura = crearElemento('figure');
  figura.append(
    crearElemento('img', {
      atributos: { src: servicio.imagen, alt: servicio.alt, width: 600, height: 338, loading: 'lazy' }
    })
  );

  tarjeta.append(
    figura,
    crearElemento('h2', { texto: servicio.nombre }),
    crearElemento('p', { texto: servicio.resumen }),
    crearElemento('a', {
      clase: 'btn btn-clinica',
      texto: 'Ver más',
      atributos: { href: `detalle_servicio.html?id=${servicio.id}` }
    })
  );
  return tarjeta;
}

function pintar() {
  if (!servicios.length) return;

  const termino = normalizar(buscar.value.trim());
  const visibles = servicios.filter(
    (s) =>
      (categoria.value === 'todas' || s.categoria === categoria.value) &&
      normalizar(`${s.nombre} ${s.resumen}`).includes(termino)
  );

  catalogo.replaceChildren(...visibles.map(crearTarjeta));

  if (!visibles.length) {
    catalogo.append(crearElemento('p', { clase: 'estado', texto: 'No hay servicios que coincidan con tu búsqueda.' }));
  }
  contador.textContent = `Mostrando ${visibles.length} de ${servicios.length} servicios`;
}

async function cargar() {
  catalogo.setAttribute('aria-busy', 'true');
  mostrarCargando(catalogo, 'Cargando servicios...');
  try {
    servicios = await obtenerServicios();
    pintar();
  } catch (error) {
    contador.textContent = '';
    mostrarError(catalogo, error.message, cargar);
  } finally {
    catalogo.setAttribute('aria-busy', 'false');
  }
}

// Eventos
filtros.addEventListener('submit', (evento) => evento.preventDefault()); 
buscar.addEventListener('input', pintar);       
categoria.addEventListener('change', pintar);   

cargar();
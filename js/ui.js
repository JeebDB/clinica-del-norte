export function crearElemento(etiqueta, { clase, texto, atributos } = {}) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  if (atributos) {
    for (const [nombre, valor] of Object.entries(atributos)) {
      elemento.setAttribute(nombre, valor);
    }
  }
  return elemento;
}

export function mostrarCargando(contenedor, mensaje = 'Cargando...') {
  const caja = crearElemento('div', { clase: 'estado', atributos: { role: 'status' } });
  caja.append(
    crearElemento('span', { clase: 'spinner-border text-success', atributos: { 'aria-hidden': 'true' } }),
    crearElemento('span', { texto: mensaje })
  );
  contenedor.replaceChildren(caja);
}

export function mostrarError(contenedor, mensaje, alReintentar) {
  const caja = crearElemento('div', { clase: 'alert alert-danger estado', atributos: { role: 'alert' } });
  caja.append(crearElemento('p', { texto: mensaje }));

  if (alReintentar) {
    const boton = crearElemento('button', {
      clase: 'btn btn-clinica',
      texto: 'Reintentar',
      atributos: { type: 'button' }
    });
    boton.addEventListener('click', alReintentar);
    caja.append(boton);
  }
  contenedor.replaceChildren(caja);
}

// '2026-11-20' -> '20/11/2026'
export function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}
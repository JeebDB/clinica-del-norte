const URL_SERVICIOS = 'data/servicios.json';

const MENSAJES_HTTP = {
  404: 'No se encontró la información de los servicios (error 404).',
  500: 'El servidor tuvo un problema al responder (error 500). Intenta de nuevo más tarde.'
};

export async function obtenerServicios() {
  let respuesta;

  try {
    respuesta = await fetch(URL_SERVICIOS);
  } catch {
    throw new Error('No se pudo conectar. Revisa tu conexión e intenta de nuevo.');
  }

  if (!respuesta.ok) {
    throw new Error(
      MENSAJES_HTTP[respuesta.status] ?? `Ocurrió un error inesperado (código ${respuesta.status}).`
    );
  }

  try {
    return await respuesta.json();
  } catch {
    throw new Error('Los datos recibidos no tienen un formato válido.');
  }
}
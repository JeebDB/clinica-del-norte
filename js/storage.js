const CLAVE_SOLICITUDES = 'clinica_solicitudes';
const CLAVE_BORRADOR = 'clinica_borrador';

function leer(clave, valorPorDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : valorPorDefecto;
  } catch {
    return valorPorDefecto; 
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false; 
  }
}

export const obtenerSolicitudes = () => leer(CLAVE_SOLICITUDES, []);

export function guardarSolicitud(solicitud) {
  return escribir(CLAVE_SOLICITUDES, [...obtenerSolicitudes(), solicitud]);
}

export function actualizarSolicitud(id, cambios) {
  const lista = obtenerSolicitudes().map((s) => (s.id === id ? { ...s, ...cambios } : s));
  return escribir(CLAVE_SOLICITUDES, lista);
}

export function eliminarSolicitud(id) {
  return escribir(CLAVE_SOLICITUDES, obtenerSolicitudes().filter((s) => s.id !== id));
}

export const vaciarSolicitudes = () => localStorage.removeItem(CLAVE_SOLICITUDES);

export const obtenerBorrador = () => leer(CLAVE_BORRADOR, null);
export const guardarBorrador = (datos) => escribir(CLAVE_BORRADOR, datos);
export const borrarBorrador = () => localStorage.removeItem(CLAVE_BORRADOR);
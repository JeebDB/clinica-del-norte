import { formatearFecha } from './ui.js';

const esCampo = (elemento) => elemento.matches('input, textarea, select');

// Reglas propias de la clínica, que HTML no puede expresar
function reglaDeNegocio(campo) {
  const valor = campo.value.trim();
  if (!valor) return '';

  if (campo.id === 'nombre' && valor.split(/\s+/).length < 2) {
    return 'Escribe tu nombre y apellido.';
  }
  if (campo.id === 'fecha') {
    const dia = new Date(`${campo.value}T00:00:00`).getDay(); // 0 domingo, 6 sábado
    if (dia === 0 || dia === 6) {
      return 'La clínica atiende de lunes a viernes. Elige un día hábil.';
    }
  }
  return '';
}

function mensajeDeError(campo) {
  const valor = campo.value.trim();
  if (campo.required && !valor) return 'Este campo es obligatorio.';

  // El largo mínimo se revisa a mano: el navegador no lo marca cuando el valor
  // se rellena por código (por ejemplo, al recuperar un borrador)
  if (valor && campo.minLength > 0 && valor.length < campo.minLength) {
    return `Escribe al menos ${campo.minLength} caracteres (llevas ${valor.length}).`;
  }

  const v = campo.validity;
  if (v.valid) return '';
  if (v.typeMismatch) {
    return campo.type === 'email'
      ? 'Escribe un correo válido, por ejemplo nombre@dominio.com.'
      : 'El formato no es válido.';
  }
  if (v.patternMismatch) return campo.title || 'El formato no es válido.';
  if (v.rangeUnderflow) return `Elige una fecha desde el ${formatearFecha(campo.min)}.`;
  if (v.rangeOverflow) return `Elige una fecha hasta el ${formatearFecha(campo.max)}.`;
  return campo.validationMessage; // incluye los mensajes de reglaDeNegocio
}

function zonaDeError(campo) {
  const contenedor = campo.closest('.campo');
  let zona = contenedor.querySelector('.error-campo');
  if (!zona) {
    zona = document.createElement('p');
    zona.className = 'error-campo';
    zona.id = `error-${campo.id}`;
    zona.setAttribute('aria-live', 'polite');
    contenedor.append(zona);
    campo.setAttribute('aria-describedby', zona.id);
  }
  return zona;
}

export function validarCampo(campo) {
  campo.setCustomValidity(reglaDeNegocio(campo));
  const mensaje = mensajeDeError(campo);
  const contenedor = campo.closest('.campo');

  zonaDeError(campo).textContent = mensaje;
  contenedor.classList.toggle('campo-error', mensaje !== '');
  contenedor.classList.toggle('campo-ok', mensaje === '' && campo.value.trim() !== '');
  campo.setAttribute('aria-invalid', String(mensaje !== ''));
  return mensaje === '';
}

export function validarFormulario(form) {
  const campos = [...form.elements].filter(esCampo);
  const resultados = campos.map((campo) => {
    campo.dataset.tocado = 'true';
    return validarCampo(campo);
  });
  const primerError = resultados.indexOf(false);
  if (primerError !== -1) campos[primerError].focus();
  return primerError === -1;
}

export function limpiarValidacion(form) {
  form.querySelectorAll('.campo').forEach((campo) => {
    campo.classList.remove('campo-error', 'campo-ok');
    campo.querySelector('.error-campo')?.replaceChildren();
  });
  [...form.elements].filter(esCampo).forEach((campo) => {
    campo.setCustomValidity('');
    campo.removeAttribute('aria-invalid');
    delete campo.dataset.tocado;
  });
}


export function activarValidacionEnVivo(form) {
  const marcarYValidar = (evento) => {
    if (!esCampo(evento.target)) return;
    evento.target.dataset.tocado = 'true';
    validarCampo(evento.target);
  };

  form.addEventListener('focusout', marcarYValidar); 
  form.addEventListener('change', marcarYValidar);   
  form.addEventListener('input', (evento) => {       
    if (esCampo(evento.target) && evento.target.dataset.tocado) validarCampo(evento.target);
  });
  form.addEventListener('reset', () => limpiarValidacion(form));
}
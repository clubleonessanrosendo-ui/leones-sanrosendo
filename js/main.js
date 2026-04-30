/**
 * Club de Leones San Rosendo
 * Script principal - Carga dinámica desde contenido.json
 */

// --- CARGA DE DATOS ---
async function cargarDatos() {
  const res = await fetch('data/contenido.json');
  return await res.json();
}

// --- UTILIDAD: reemplazar [COMPLETAR...] con badge visual ---
function marcarCompletarData(texto) {
  if (!texto) return '';
  if (texto.includes('[COMPLETAR')) {
    return `<span class="tag-completar">${texto}</span>`;
  }
  return texto;
}

// --- NAVBAR TOGGLE ---
function initNavbar() {
  const toggle = document.getElementById('navbar-toggle');
  const menu = document.getElementById('navbar-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('abierto');
    });
    // Cerrar al hacer click en un enlace
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menu.classList.remove('abierto'));
    });
  }
}

// --- RENDER: DATOS DEL CLUB ---
function renderClub(data) {
  const d = data.club;

  // Textos dinámicos del hero
  const heroMensaje = document.getElementById('hero-mensaje');
  const heroSub = document.getElementById('hero-submensaje');
  const heroLema = document.getElementById('hero-lema');
  if (heroMensaje) heroMensaje.textContent = d.mensaje_principal;
  if (heroSub) heroSub.textContent = d.submensaje;
  if (heroLema) heroLema.textContent = d.lema;

  // WhatsApp FAB
  const wa = document.getElementById('whatsapp-fab');
  if (wa && d.whatsapp && !d.whatsapp.includes('[COMPLETAR')) {
    wa.href = `https://wa.me/${d.whatsapp.replace(/\D/g, '')}`;
    wa.style.display = 'flex';
  }

  // Correo
  document.querySelectorAll('.correo-club').forEach(el => {
    el.textContent = d.correo;
    if (el.tagName === 'A') el.href = `mailto:${d.correo}`;
  });

  // Footer
  const footerNombre = document.getElementById('footer-nombre');
  const footerDistrito = document.getElementById('footer-distrito');
  const footerLema = document.getElementById('footer-lema');
  const footerCiudad = document.getElementById('footer-ciudad');
  if (footerNombre) footerNombre.textContent = d.nombre;
  if (footerDistrito) footerDistrito.textContent = d.distrito;
  if (footerLema) footerLema.textContent = `"${d.lema}"`;
  if (footerCiudad) footerCiudad.textContent = d.ciudad;
}

// --- RENDER: QUIÉNES SOMOS ---
function renderQuienesSomos(data) {
  const d = data.quienes_somos;

  const historia = document.getElementById('historia-texto');
  if (historia) historia.innerHTML = marcarCompletarData(d.historia);

  const lions = document.getElementById('lions-descripcion');
  if (lions) lions.textContent = d.lions_internacional;

  // Misión y Visión
  const mision = document.getElementById('mision-texto');
  const vision = document.getElementById('vision-texto');
  if (mision) mision.textContent = d.mision;
  if (vision) vision.textContent = d.vision;

  // Valores
  const contenedorValores = document.getElementById('valores-lista');
  if (contenedorValores && d.valores) {
    contenedorValores.innerHTML = d.valores.map((v, i) => `
      <div class="valor-item">
        <div class="valor-numero">${i + 1}</div>
        <div>
          <div class="valor-titulo">${v.titulo}</div>
          <div class="valor-desc">${v.descripcion}</div>
        </div>
      </div>
    `).join('');
  }
}

// --- RENDER: SERVICIOS ---
function renderServicios(data) {
  const contenedor = document.getElementById('servicios-grid');
  if (!contenedor) return;

  contenedor.innerHTML = data.servicios.map(s => `
    <div class="servicio-card">
      <div class="servicio-icono">${s.icono}</div>
      <h3 class="servicio-titulo">${s.titulo}</h3>
      <p class="servicio-desc">${s.descripcion}</p>
      <p class="servicio-detalle">${s.detalle}</p>
    </div>
  `).join('');
}

// --- RENDER: ACTIVIDADES ---
function renderActividades(data) {
  const contenedor = document.getElementById('actividades-grid');
  if (!contenedor) return;

  const ICONOS_CAT = {
    salud: '🩺',
    institucional: '🦁',
    financiamiento: '🎟️',
    social: '🤝',
    default: '⭐'
  };

  const ESTADO_LABEL = {
    realizado: 'Realizado',
    programado: 'Programado',
    activo: 'En curso'
  };

  contenedor.innerHTML = data.actividades.map(a => {
    const icono = ICONOS_CAT[a.categoria] || ICONOS_CAT.default;
    const estadoClass = `estado-${a.estado}`;
    const estadoLabel = ESTADO_LABEL[a.estado] || a.estado;
    const fechaMarcada = marcarCompletarData(a.fecha);

    return `
      <div class="actividad-card" data-categoria="${a.categoria}">
        <div class="actividad-imagen">
          <span class="actividad-imagen-placeholder">${icono}</span>
          <span class="actividad-estado ${estadoClass}">${estadoLabel}</span>
        </div>
        <div class="actividad-cuerpo">
          <div class="actividad-fecha">${fechaMarcada}</div>
          <h3 class="actividad-titulo">${a.titulo}</h3>
          <div class="actividad-lugar">📍 ${a.lugar}</div>
          <p class="actividad-desc">${a.descripcion}</p>
        </div>
      </div>
    `;
  }).join('');
}

// --- FILTROS DE ACTIVIDADES ---
function initFiltros() {
  const btns = document.querySelectorAll('.filtro-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.actividad-card').forEach(card => {
        if (cat === 'todos' || card.dataset.categoria === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// --- RENDER: PRÓXIMAS ACTIVIDADES ---
function renderProximas(data) {
  const contenedor = document.getElementById('proximas-lista');
  if (!contenedor) return;

  if (!data.proximas_actividades || data.proximas_actividades.length === 0) {
    contenedor.innerHTML = `<p class="centrado" style="color:#64748b">No hay actividades próximas registradas aún.</p>`;
    return;
  }

  contenedor.innerHTML = data.proximas_actividades.map(a => {
    const fechaTexto = marcarCompletarData(a.fecha);
    const lugarTexto = marcarCompletarData(a.lugar);

    // Intentar parsear fecha para mostrar día/mes
    let dia = '??';
    let mes = '????';
    if (a.fecha && !a.fecha.includes('[COMPLETAR')) {
      const d = new Date(a.fecha);
      if (!isNaN(d)) {
        dia = d.getDate().toString().padStart(2, '0');
        mes = d.toLocaleString('es-CL', { month: 'short' }).toUpperCase();
      } else {
        dia = a.fecha.split(' ')[0] || '??';
        mes = a.fecha.split(' ')[1] || '';
      }
    }

    return `
      <div class="proxima-item">
        <div class="proxima-fecha-bloque">
          <div class="proxima-fecha-dia">${a.fecha.includes('[COMPLETAR') ? '?' : dia}</div>
          <div class="proxima-fecha-mes">${a.fecha.includes('[COMPLETAR') ? 'FECHA' : mes}</div>
        </div>
        <div>
          <div class="proxima-titulo">${a.titulo}</div>
          <div class="proxima-lugar">📍 ${lugarTexto}</div>
        </div>
        <span class="proxima-badge">Programado</span>
      </div>
    `;
  }).join('');
}

// --- RENDER: GESTIÓN ---
function renderGestion(data) {
  const d = data.gestion;

  const ids = {
    'indicador-socios': d.socios_activos,
    'indicador-servicios': d.servicios_realizados,
    'indicador-personas': d.personas_beneficiadas,
    'indicador-actividades': d.actividades_anuales
  };

  Object.entries(ids).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = marcarCompletarData(val);
  });

  const resumen = document.getElementById('gestion-resumen');
  if (resumen) resumen.innerHTML = marcarCompletarData(d.resumen);

  const proyeccion = document.getElementById('gestion-proyeccion');
  if (proyeccion) proyeccion.innerHTML = marcarCompletarData(d.proyeccion);

  const actClave = document.getElementById('actividades-clave');
  if (actClave && d.actividades_clave) {
    actClave.innerHTML = d.actividades_clave.map(a => `
      <li>${marcarCompletarData(a)}</li>
    `).join('');
  }

  const anio = document.getElementById('gestion-anio');
  if (anio) anio.textContent = d.anio;
}

// --- RENDER: DONACIONES ---
function renderDonaciones(data) {
  const d = data.donaciones;

  const campos = {
    'dato-banco': d.banco,
    'dato-tipo-cuenta': d.tipo_cuenta,
    'dato-numero': d.numero_cuenta,
    'dato-rut': d.rut,
    'dato-titular': d.nombre_titular,
    'dato-responsable': d.responsable
  };

  Object.entries(campos).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = marcarCompletarData(val);
  });

  const confianza = document.getElementById('texto-confianza');
  if (confianza) confianza.textContent = d.texto_confianza;
}

// --- PESTAÑAS COLABORA ---
function initPestanas() {
  const btns = document.querySelectorAll('.pestana-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      const panel = btn.dataset.panel;
      document.querySelectorAll('.colabora-panel').forEach(p => p.classList.remove('activo'));
      const target = document.getElementById(panel);
      if (target) target.classList.add('activo');
    });
  });
}

// --- GALERÍA ---
function renderGaleria(data) {
  const contenedor = document.getElementById('galeria-contenedor');
  if (!contenedor) return;

  fetch('data/galeria.json')
    .then(r => r.json())
    .then(imagenes => {
      if (!imagenes || imagenes.length === 0) {
        contenedor.innerHTML = `
          <div class="galeria-aviso">
            <div class="galeria-aviso-titulo">📷 Galería en construcción</div>
            <p>Agrega imágenes en <strong>img/galeria/</strong> y actualiza <strong>data/galeria.json</strong></p>
          </div>`;
        return;
      }
      contenedor.innerHTML = `
        <div class="galeria-grid">
          ${imagenes.map(img => `
            <div class="galeria-item" style="opacity:1;">
              <img src="${img.archivo}" alt="${img.titulo}" style="width:100%;height:100%;object-fit:cover;">
              <div class="galeria-placeholder-texto">${img.titulo}</div>
            </div>
          `).join('')}
        </div>`;
    })
    .catch(() => {
      contenedor.innerHTML = `<div class="galeria-aviso"><p>No se pudieron cargar las imágenes.</p></div>`;
    });
}

// --- ANIMACIONES SCROLL ---
function initAnimacionesScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.servicio-card, .actividad-card, .indicador-card, .valor-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// --- SCROLL SUAVE NAVBAR ---
function initScrollNavbar() {
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    }
  });
}


// --- RENDER: DIRECTIVA ---
function renderDirectiva(data) {
  const grid = document.getElementById('directiva-grid');
  if (!grid || !data.directiva) return;

  grid.innerHTML = data.directiva.map(d => `
    <div class="directiva-card">
      <div class="directiva-cargo">${d.cargo}</div>
      <div class="directiva-nombre">${d.nombre}</div>
    </div>
  `).join('');

  // Render socios
  const sociosGrid = document.getElementById('socios-grid');
  if (sociosGrid && data.socios) {
    sociosGrid.innerHTML = data.socios.map(s => {
      const esFundador = s.tipo === 'Socio Fundador';
      return `
        <div class="socio-item">
          <span class="socio-nombre">${s.nombre}</span>
          <span class="socio-tipo ${esFundador ? 'socio-tipo-fundador' : ''}">${s.tipo}</span>
        </div>
      `;
    }).join('');
  }
}

// --- INICIALIZACIÓN PRINCIPAL ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await cargarDatos();
    renderClub(data);
    renderQuienesSomos(data);
    renderServicios(data);
    renderActividades(data);
    initFiltros();
    renderProximas(data);
    renderGestion(data);
    renderDonaciones(data);
    renderDirectiva(data);
    renderGaleria(data);
    initNavbar();
    initPestanas();
    initAnimacionesScroll();
    initScrollNavbar();
  } catch (e) {
    console.error('Error cargando datos del club:', e);
  }
});

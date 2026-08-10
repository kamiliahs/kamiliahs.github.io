/* ==========================================================================
   FÁCIL - Aplicación SPA & PWA para Android (Compatible con GitHub Pages)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de módulos
  initPWAInstaller();
  initServiceWorker();
  initNavigation();
  initTextSizeToggle();
  initNetStatus();
  initContactsManager();
  initRemindersManager();
  initShoppingManager();
  initToolsManager();
  initModals();
});

/* ==========================================================================
   1. GESTOR DE INSTALACIÓN PWA (IN-APP INSTALL PROMPT)
   ========================================================================== */
let deferredPrompt = null;

function initPWAInstaller() {
  const installBanner = document.getElementById('install-banner');
  const btnInstall = document.getElementById('btn-install-app');
  const btnDismiss = document.getElementById('btn-dismiss-install');
  const btnOpenGuide = document.getElementById('btn-open-install-guide');

  // Capturar evento de instalación del navegador Android/Desktop
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que el navegador muestre su banner predeterminado sin control
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar nuestro banner in-app personalizado y amigable
    if (installBanner && !localStorage.getItem('pwa_dismissed')) {
      installBanner.classList.remove('hidden');
    }
  });

  // Botón Principal de Instalación In-App
  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Resultado de instalación: ${outcome}`);
        deferredPrompt = null;
        installBanner.classList.add('hidden');
      } else {
        // Si no está disponible la prompt automática, abrir la guía manual
        const modalGuide = document.getElementById('modal-install-guide');
        if (modalGuide) modalGuide.showModal();
      }
    });
  }

  // Descartar aviso por hoy
  if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
      installBanner.classList.add('hidden');
      localStorage.setItem('pwa_dismissed', 'true');
    });
  }

  if (btnOpenGuide) {
    btnOpenGuide.addEventListener('click', () => {
      const modalGuide = document.getElementById('modal-install-guide');
      if (modalGuide) modalGuide.showModal();
    });
  }

  // Detectar cuando la app ha sido instalada exitosamente
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Aplicación instalada correctamente');
    if (installBanner) installBanner.classList.add('hidden');
    speakText('¡Felicidades! La aplicación ya está instalada en tu móvil.');
  });
}

/* ==========================================================================
   2. REGISTRO DEL SERVICE WORKER (RUTA RELATIVA PARA GITHUB PAGES)
   ========================================================================== */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Usamos './sw.js' y scope './' para compatibilidad total en subdirectorios de GitHub Pages
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => {
        console.log('[Service Worker] Registrado con éxito en scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Service Worker] Error de registro:', err);
      });
  }
}

/* ==========================================================================
   3. NAVEGACIÓN SPA DE 4 BOTONES (ANDROID BOTTOM NAV)
   ========================================================================== */
function initNavigation() {
  const navButtons = document.querySelectorAll('.bottom-nav .nav-item');
  const views = document.querySelectorAll('.spa-view');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      // Actualizar botones de navegación
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Alternar vistas SPA
      views.forEach(view => {
        if (view.id === targetId) {
          view.classList.remove('hidden');
          view.classList.add('active');
        } else {
          view.classList.add('hidden');
          view.classList.remove('active');
        }
      });

      // Ir arriba suavemente
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   4. ACCESIBILIDAD: TAMAÑO DE TEXTO (LETTRA GRANDE)
   ========================================================================== */
function initTextSizeToggle() {
  const btnToggleText = document.getElementById('btn-toggle-text-size');
  const isLarge = localStorage.getItem('facil_text_large') === 'true';

  if (isLarge) {
    document.body.classList.add('text-xl');
  }

  if (btnToggleText) {
    btnToggleText.addEventListener('click', () => {
      document.body.classList.toggle('text-xl');
      const nowLarge = document.body.classList.contains('text-xl');
      localStorage.setItem('facil_text_large', nowLarge);
      speakText(nowLarge ? 'Texto agrandado' : 'Texto normal');
    });
  }
}

/* ==========================================================================
   5. ESTADO DE RED (ONLINE / OFFLINE)
   ========================================================================== */
function initNetStatus() {
  const netStatusEl = document.getElementById('net-status');
  const netTextEl = document.getElementById('net-status-text');

  function updateStatus() {
    if (navigator.onLine) {
      netStatusEl.className = 'net-status online';
      netTextEl.textContent = 'En línea';
    } else {
      netStatusEl.className = 'net-status offline';
      netTextEl.textContent = 'Sin red';
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', () => {
    updateStatus();
    speakText('Atención: Tu teléfono se ha quedado sin red. La app sigue funcionando.');
  });

  updateStatus();
}

/* ==========================================================================
   6. SECCIÓN CONTACTOS RÁPIDOS (1 TOQUE)
   ========================================================================== */
const DEFAULT_CONTACTS = [
  { id: '1', name: 'Mi Hijo/a', phone: '600123456', icon: '❤️' },
  { id: '2', name: 'Centro de Salud / Médico', phone: '900123456', icon: '👨‍⚕️' },
  { id: '3', name: 'Urgencias y Emergencias', phone: '112', icon: '🚨' }
];

function initContactsManager() {
  const container = document.getElementById('contacts-list');
  const formContact = document.getElementById('form-contact');

  function getContacts() {
    const saved = localStorage.getItem('facil_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  }

  function saveContacts(list) {
    localStorage.setItem('facil_contacts', JSON.stringify(list));
    render();
  }

  function render() {
    const contacts = getContacts();
    container.innerHTML = '';

    contacts.forEach(c => {
      const card = document.createElement('div');
      card.className = 'contact-card';
      card.innerHTML = `
        <div class="contact-card-header">
          <div class="contact-avatar">${c.icon}</div>
          <div class="contact-info">
            <div class="contact-name">${escapeHTML(c.name)}</div>
            <div class="contact-number">📞 ${escapeHTML(c.phone)}</div>
          </div>
          <button class="btn-speak-item" title="Escuchar nombre" onclick="speakText('Llamar a ${escapeHTML(c.name)}')">🔊</button>
          ${c.id !== '3' ? `<button class="btn-delete-item" data-id="${c.id}" title="Borrar contacto">✕</button>` : ''}
        </div>
        <div class="contact-actions">
          <a href="tel:${escapeHTML(c.phone)}" class="btn-call">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            LLAMAR
          </a>
          ${c.phone.length >= 9 && c.id !== '3' ? `
            <a href="https://wa.me/34${c.phone.replace(/\s+/g, '')}" target="_blank" class="btn-whatsapp" title="Enviar WhatsApp">
              💬 Mensaje
            </a>
          ` : ''}
        </div>
      `;
      container.appendChild(card);
    });

    // Eventos de borrar
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Quieres quitar este contacto?')) {
          const filtered = getContacts().filter(item => item.id !== id);
          saveContacts(filtered);
        }
      });
    });
  }

  // Guardar nuevo contacto
  if (formContact) {
    formContact.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const icon = document.getElementById('contact-icon').value;

      if (name && phone) {
        const list = getContacts();
        list.push({ id: Date.now().toString(), name, phone, icon });
        saveContacts(list);
        
        formContact.reset();
        document.getElementById('modal-add-contact').close();
        speakText(`Contacto ${name} guardado correctamente`);
      }
    });
  }

  const btnOpenModal = document.getElementById('btn-add-contact-modal');
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      document.getElementById('modal-add-contact').showModal();
    });
  }

  render();
}

/* ==========================================================================
   7. SECCIÓN RECORDATORIOS / MEDICINAS
   ========================================================================== */
const DEFAULT_REMINDERS = [
  { id: '1', text: 'Tomar medicina del Desayuno', time: '08:30', completed: false },
  { id: '2', text: 'Tomar medicina de la Cena', time: '21:00', completed: false }
];

function initRemindersManager() {
  const container = document.getElementById('reminders-list');
  const formReminder = document.getElementById('form-reminder');

  function getReminders() {
    const saved = localStorage.getItem('facil_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  }

  function saveReminders(list) {
    localStorage.setItem('facil_reminders', JSON.stringify(list));
    render();
  }

  function render() {
    const reminders = getReminders();
    container.innerHTML = '';

    if (reminders.length === 0) {
      container.innerHTML = '<p class="subtitle" style="text-align:center; padding:20px;">No tienes recordatorios anotados.</p>';
      return;
    }

    reminders.forEach(r => {
      const card = document.createElement('div');
      card.className = `reminder-card ${r.completed ? 'completed' : ''}`;
      card.innerHTML = `
        <button class="btn-check-giant" data-id="${r.id}" title="Marcar cumplido">
          ${r.completed ? '✓' : ''}
        </button>
        <div class="reminder-info">
          <span class="reminder-time">⏰ ${escapeHTML(r.time)}</span>
          <div class="reminder-title">${escapeHTML(r.text)}</div>
        </div>
        <button class="btn-speak-item" onclick="speakText('${escapeHTML(r.text)} a las ${escapeHTML(r.time)}')">🔊</button>
        <button class="btn-delete-item" data-id="${r.id}" title="Borrar">✕</button>
      `;
      container.appendChild(card);
    });

    // Checkbox cumplido
    container.querySelectorAll('.btn-check-giant').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const list = getReminders();
        const item = list.find(x => x.id === id);
        if (item) {
          item.completed = !item.completed;
          saveReminders(list);
          speakText(item.completed ? 'Completado' : 'Pendiente');
        }
      });
    });

    // Borrar
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const filtered = getReminders().filter(x => x.id !== id);
        saveReminders(filtered);
      });
    });
  }

  if (formReminder) {
    formReminder.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('reminder-text').value.trim();
      const time = document.getElementById('reminder-time').value;

      if (text && time) {
        const list = getReminders();
        list.push({ id: Date.now().toString(), text, time, completed: false });
        saveReminders(list);

        formReminder.reset();
        document.getElementById('modal-add-reminder').close();
        speakText(`Recordatorio anotado para las ${time}`);
      }
    });
  }

  const btnOpenModal = document.getElementById('btn-add-reminder-modal');
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      document.getElementById('modal-add-reminder').showModal();
    });
  }

  render();
}

/* ==========================================================================
   8. SECCIÓN LISTA DE LA COMPRA
   ========================================================================== */
const DEFAULT_SHOPPING = [
  { id: '1', text: '🥛 Leche', done: false },
  { id: '2', text: '🍞 Pan integral', done: false },
  { id: '3', text: '🍎 Fruta fresca', done: false }
];

function initShoppingManager() {
  const container = document.getElementById('shopping-list');
  const formAdd = document.getElementById('form-add-item');
  const inputNew = document.getElementById('input-new-item');
  const quickChips = document.querySelectorAll('.chip-btn');

  function getItems() {
    const saved = localStorage.getItem('facil_shopping');
    return saved ? JSON.parse(saved) : DEFAULT_SHOPPING;
  }

  function saveItems(list) {
    localStorage.setItem('facil_shopping', JSON.stringify(list));
    render();
  }

  function addItem(text) {
    if (!text) return;
    const list = getItems();
    list.unshift({ id: Date.now().toString(), text, done: false });
    saveItems(list);
    speakText(`Añadido ${text} a la lista`);
  }

  function render() {
    const items = getItems();
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = '<p class="subtitle" style="text-align:center; padding:20px;">La lista está vacía.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `shopping-card ${item.done ? 'done' : ''}`;
      card.innerHTML = `
        <button class="btn-check-giant" data-id="${item.id}">
          ${item.done ? '✓' : ''}
        </button>
        <span class="shopping-text">${escapeHTML(item.text)}</span>
        <button class="btn-speak-item" onclick="event.stopPropagation(); speakText('${escapeHTML(item.text)}')">🔊</button>
        <button class="btn-delete-item" data-id="${item.id}" onclick="event.stopPropagation();">✕</button>
      `;

      card.addEventListener('click', () => {
        const list = getItems();
        const target = list.find(x => x.id === item.id);
        if (target) {
          target.done = !target.done;
          saveItems(list);
        }
      });

      container.appendChild(card);
    });

    // Botones de borrar individual
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const filtered = getItems().filter(x => x.id !== id);
        saveItems(filtered);
      });
    });
  }

  if (formAdd) {
    formAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      addItem(inputNew.value.trim());
      inputNew.value = '';
    });
  }

  // Chips rápido con 1 toque
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-item');
      addItem(val);
    });
  });

  render();
}

/* ==========================================================================
   9. HERRAMIENTAS Y ÚTILES (LUZ, VOZ DE AYUDA Y ALARMA SOS)
   ========================================================================== */
let audioCtx = null;
let sosOscillator = null;

function initToolsManager() {
  const btnLight = document.getElementById('btn-toggle-light');
  const lightOverlay = document.getElementById('full-light-overlay');
  const btnCloseLight = document.getElementById('btn-close-light');
  const btnSpeakHelp = document.getElementById('btn-speak-help');
  const btnSOS = document.getElementById('btn-toggle-sos');

  // Herramienta 1: Luz de pantalla
  if (btnLight && lightOverlay && btnCloseLight) {
    btnLight.addEventListener('click', () => {
      lightOverlay.classList.remove('hidden');
    });

    btnCloseLight.addEventListener('click', () => {
      lightOverlay.classList.add('hidden');
    });
  }

  // Herramienta 2: Asistente de Voz
  if (btnSpeakHelp) {
    btnSpeakHelp.addEventListener('click', () => {
      speakText('Bienvenido a FÁCIL. Esta aplicación está diseñada para ayudarte. Puedes pulsar los botones grandes para llamar a tus contactos, ver tus recordatorios de medicinas o anotar la compra. Pulsa la pantalla cuando lo necesites.');
    });
  }

  // Herramienta 3: Sonido de Alarma SOS
  if (btnSOS) {
    let isSosActive = false;

    btnSOS.addEventListener('click', () => {
      isSosActive = !isSosActive;

      if (isSosActive) {
        btnSOS.textContent = 'DETENER ALARMA ⏹';
        btnSOS.style.backgroundColor = '#991b1b';
        startSOSAlarm();
        speakText('Atención Alarma de emergencia activada');
      } else {
        btnSOS.textContent = 'SONAR ALARMA';
        btnSOS.style.backgroundColor = 'var(--danger-color)';
        stopSOSAlarm();
      }
    });
  }
}

function startSOSAlarm() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    sosOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    sosOscillator.type = 'sawtooth';
    sosOscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Tono 880Hz
    
    // Modulación tipo sirena
    let toggle = false;
    setInterval(() => {
      if (sosOscillator && audioCtx) {
        sosOscillator.frequency.setValueAtTime(toggle ? 880 : 600, audioCtx.currentTime);
        toggle = !toggle;
      }
    }, 400);

    gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
    sosOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    sosOscillator.start();
  } catch (err) {
    console.warn('Error al iniciar audio SOS:', err);
  }
}

function stopSOSAlarm() {
  if (sosOscillator) {
    try {
      sosOscillator.stop();
      sosOscillator.disconnect();
    } catch(e){}
    sosOscillator = null;
  }
}

/* ==========================================================================
   10. MODALES (DIALOGS)
   ========================================================================== */
function initModals() {
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-modal');
      const dialog = document.getElementById(modalId);
      if (dialog) dialog.close();
    });
  });
}

/* ==========================================================================
   UTILIDADES REUTILIZABLES
   ========================================================================== */
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Cancelar locuciones previas
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Velocidad pausada y clara para mayores/neófitos
    window.speechSynthesis.speak(utterance);
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* ==========================================================================
   FÁCIL - Lógica de Aplicación SPA & PWA (Estilo Suizo / Brutalista Minimalista)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
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
   1. SELECTOR DE TEMA (CLARO / OSCURO SUIZO)
   ========================================================================== */
function initThemeToggle() {
  const btnToggle = document.getElementById('btn-toggle-theme');
  const iconSun = document.getElementById('theme-icon-sun');
  const iconMoon = document.getElementById('theme-icon-moon');

  // Guardar preferencia o detectar tema del sistema
  const savedTheme = localStorage.getItem('app_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(currentTheme);

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('app_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      iconSun?.classList.remove('hidden');
      iconMoon?.classList.add('hidden');
    } else {
      iconSun?.classList.add('hidden');
      iconMoon?.classList.remove('hidden');
    }
  }
}

/* ==========================================================================
   2. GESTOR DE INSTALACIÓN PWA (IN-APP PROMPT)
   ========================================================================== */
let deferredPrompt = null;

function initPWAInstaller() {
  const installBanner = document.getElementById('install-banner');
  const btnInstall = document.getElementById('btn-install-app');
  const btnDismiss = document.getElementById('btn-dismiss-install');
  const btnOpenGuide = document.getElementById('btn-open-install-guide');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBanner && !localStorage.getItem('pwa_dismissed')) {
      installBanner.classList.remove('hidden');
    }
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Instalación: ${outcome}`);
        deferredPrompt = null;
        installBanner.classList.add('hidden');
      } else {
        const modalGuide = document.getElementById('modal-install-guide');
        if (modalGuide) modalGuide.showModal();
      }
    });
  }

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

  window.addEventListener('appinstalled', () => {
    if (installBanner) installBanner.classList.add('hidden');
    speakText('¡Aplicación instalada con éxito!');
  });
}

/* ==========================================================================
   3. REGISTRO DEL SERVICE WORKER
   ========================================================================== */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => console.log('[ServiceWorker] Registrado:', reg.scope))
      .catch((err) => console.warn('[ServiceWorker] Error:', err));
  }
}

/* ==========================================================================
   4. NAVEGACIÓN SPA
   ========================================================================== */
function initNavigation() {
  const navButtons = document.querySelectorAll('.bottom-nav .nav-item');
  const views = document.querySelectorAll('.spa-view');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');

      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      views.forEach(view => {
        if (view.id === targetId) {
          view.classList.remove('hidden');
          view.classList.add('active');
        } else {
          view.classList.add('hidden');
          view.classList.remove('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   5. TAMAÑO DE TEXTO (ACCESIBILIDAD EXTRA-GRANDE)
   ========================================================================== */
function initTextSizeToggle() {
  const btnToggleText = document.getElementById('btn-toggle-text-size');
  
  if (localStorage.getItem('text_xl') === 'true') {
    document.body.classList.add('text-xl');
  }

  if (btnToggleText) {
    btnToggleText.addEventListener('click', () => {
      const isXL = document.body.classList.toggle('text-xl');
      localStorage.setItem('text_xl', isXL ? 'true' : 'false');
    });
  }
}

/* ==========================================================================
   6. ESTADO DE RED
   ========================================================================== */
function initNetStatus() {
  const netBadge = document.getElementById('net-status');
  const netText = document.getElementById('net-status-text');

  function updateStatus() {
    if (navigator.onLine) {
      netBadge.classList.remove('offline');
      netBadge.classList.add('online');
      if (netText) netText.textContent = 'ONLINE';
    } else {
      netBadge.classList.remove('online');
      netBadge.classList.add('offline');
      if (netText) netText.textContent = 'OFFLINE';
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

/* ==========================================================================
   7. GESTOR DE CONTACTOS
   ========================================================================== */
const DEFAULT_CONTACTS = [
  { id: '1', name: 'EMERGENCIAS 112', phone: '112', type: 'sos' },
  { id: '2', name: 'Hija Ana', phone: '600123456', type: 'heart' },
  { id: '3', name: 'Médico de Cabecera', phone: '912345678', type: 'med' },
  { id: '4', name: 'Hijo Carlos', phone: '611223344', type: 'user' }
];

function getCategorySVG(type) {
  switch (type) {
    case 'heart':
      return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    case 'med':
      return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20"/></svg>`;
    case 'home':
      return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case 'sos':
      return `<svg class="icon-svg" style="color: var(--danger)" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    default:
      return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  }
}

function initContactsManager() {
  const container = document.getElementById('contacts-list');
  const formAdd = document.getElementById('form-contact');
  const modal = document.getElementById('modal-add-contact');

  let contacts = JSON.parse(localStorage.getItem('contacts_list')) || DEFAULT_CONTACTS;

  function render() {
    if (!container) return;
    container.innerHTML = '';

    contacts.forEach(contact => {
      const card = document.createElement('div');
      card.className = 'contact-card';

      card.innerHTML = `
        <div class="contact-info">
          <div class="contact-avatar-icon">
            ${getCategorySVG(contact.type)}
          </div>
          <div class="contact-details">
            <h3>${escapeHTML(contact.name)}</h3>
            <p>${escapeHTML(contact.phone)}</p>
          </div>
        </div>
        <div class="contact-actions">
          <a href="tel:${contact.phone}" class="btn-call">
            <svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            LLAMAR
          </a>
          <a href="sms:${contact.phone}" class="btn-message">
            <svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            SMS
          </a>
          <button class="btn-delete-item" data-id="${contact.id}" title="Eliminar contacto">
            <svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      card.querySelector('.btn-delete-item').addEventListener('click', () => {
        if (confirm(`¿Eliminar a ${contact.name}?`)) {
          contacts = contacts.filter(c => c.id !== contact.id);
          saveAndRender();
        }
      });

      container.appendChild(card);
    });
  }

  function saveAndRender() {
    localStorage.setItem('contacts_list', JSON.stringify(contacts));
    render();
  }

  if (formAdd) {
    formAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name');
      const phoneInput = document.getElementById('contact-phone');
      const typeInput = document.getElementById('contact-icon');

      if (nameInput.value && phoneInput.value) {
        contacts.push({
          id: Date.now().toString(),
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          type: typeInput.value
        });
        saveAndRender();
        formAdd.reset();
        modal?.close();
      }
    });
  }

  render();
}

/* ==========================================================================
   8. GESTOR DE RECORDATORIOS
   ========================================================================== */
const DEFAULT_REMINDERS = [
  { id: '1', text: 'Tomar la pastilla de la tensión', time: '08:30', completed: false },
  { id: '2', text: 'Caminar 20 minutos', time: '11:00', completed: false },
  { id: '3', text: 'Beber un vaso de agua', time: '16:00', completed: true }
];

function initRemindersManager() {
  const container = document.getElementById('reminders-list');
  const formAdd = document.getElementById('form-reminder');
  const modal = document.getElementById('modal-add-reminder');

  let reminders = JSON.parse(localStorage.getItem('reminders_list')) || DEFAULT_REMINDERS;

  function render() {
    if (!container) return;
    container.innerHTML = '';

    reminders.forEach(reminder => {
      const card = document.createElement('div');
      card.className = `reminder-card ${reminder.completed ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="reminder-main">
          <button class="btn-toggle-reminder" aria-label="Marcar como completado">
            <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <div>
            <span class="reminder-time-badge">${escapeHTML(reminder.time)}</span>
            <div class="reminder-title">${escapeHTML(reminder.text)}</div>
          </div>
        </div>
        <button class="btn-delete-item" title="Eliminar recordatorio">
          <svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      `;

      card.querySelector('.btn-toggle-reminder').addEventListener('click', () => {
        reminder.completed = !reminder.completed;
        saveAndRender();
      });

      card.querySelector('.btn-delete-item').addEventListener('click', () => {
        reminders = reminders.filter(r => r.id !== reminder.id);
        saveAndRender();
      });

      container.appendChild(card);
    });
  }

  function saveAndRender() {
    localStorage.setItem('reminders_list', JSON.stringify(reminders));
    render();
  }

  if (formAdd) {
    formAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      const textInput = document.getElementById('reminder-text');
      const timeInput = document.getElementById('reminder-time');

      if (textInput.value && timeInput.value) {
        reminders.push({
          id: Date.now().toString(),
          text: textInput.value.trim(),
          time: timeInput.value,
          completed: false
        });
        saveAndRender();
        formAdd.reset();
        modal?.close();
      }
    });
  }

  render();
}

/* ==========================================================================
   9. GESTOR DE LISTA DE LA COMPRA
   ========================================================================== */
const DEFAULT_SHOPPING = [
  { id: '1', text: 'Leche', bought: false },
  { id: '2', text: 'Pan', bought: false },
  { id: '3', text: 'Huevos', bought: true },
  { id: '4', text: 'Manzanas', bought: false }
];

function initShoppingManager() {
  const container = document.getElementById('shopping-list');
  const formAdd = document.getElementById('form-add-item');
  const chipButtons = document.querySelectorAll('.quick-chips .chip-btn');

  let items = JSON.parse(localStorage.getItem('shopping_list')) || DEFAULT_SHOPPING;

  function render() {
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `shopping-item-card ${item.bought ? 'bought' : ''}`;

      card.innerHTML = `
        <div class="shopping-item-text">
          <svg class="icon-svg" width="20" height="20" viewBox="0 0 24 24">
            ${item.bought ? '<polyline points="20 6 9 17 4 12"/>' : '<circle cx="12" cy="12" r="9"/>'}
          </svg>
          ${escapeHTML(item.text)}
        </div>
        <button class="btn-delete-item" title="Eliminar producto">
          <svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      `;

      card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-delete-item')) {
          item.bought = !item.bought;
          saveAndRender();
        }
      });

      card.querySelector('.btn-delete-item').addEventListener('click', (e) => {
        e.stopPropagation();
        items = items.filter(i => i.id !== item.id);
        saveAndRender();
      });

      container.appendChild(card);
    });
  }

  function saveAndRender() {
    localStorage.setItem('shopping_list', JSON.stringify(items));
    render();
  }

  function addItem(text) {
    if (!text) return;
    items.unshift({
      id: Date.now().toString(),
      text: text,
      bought: false
    });
    saveAndRender();
  }

  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemText = btn.getAttribute('data-item');
      if (itemText) addItem(itemText);
    });
  });

  if (formAdd) {
    formAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-new-item');
      if (input && input.value.trim()) {
        addItem(input.value.trim());
        input.value = '';
      }
    });
  }

  render();
}

/* ==========================================================================
   10. GESTOR DE HERRAMIENTAS Y ÚTILES
   ========================================================================== */
let audioCtx = null;
let sosOscillator = null;
let isSosPlaying = false;

function initToolsManager() {
  // 1. Luz de Pantalla
  const btnToggleLight = document.getElementById('btn-toggle-light');
  const lightOverlay = document.getElementById('full-light-overlay');
  const btnCloseLight = document.getElementById('btn-close-light');

  if (btnToggleLight && lightOverlay && btnCloseLight) {
    btnToggleLight.addEventListener('click', () => {
      lightOverlay.classList.remove('hidden');
    });

    btnCloseLight.addEventListener('click', () => {
      lightOverlay.classList.add('hidden');
    });
  }

  // 2. Asistente de Voz (TTS Web Speech API)
  const btnSpeakHelp = document.getElementById('btn-speak-help');
  if (btnSpeakHelp) {
    btnSpeakHelp.addEventListener('click', () => {
      speakText('Bienvenido a FÁCIL. Esta aplicación está diseñada con botones grandes y tipografía clara. Puedes añadir contactos rápidos, recordar tus medicinas y guardar tu lista de la compra.');
    });
  }

  // 3. Alarma SOS de Emergencia (Web Audio API Generator)
  const btnToggleSos = document.getElementById('btn-toggle-sos');
  if (btnToggleSos) {
    btnToggleSos.addEventListener('click', () => {
      if (!isSosPlaying) {
        startSosSound();
        btnToggleSos.textContent = 'DETENER ALARMA SOS';
        btnToggleSos.classList.add('btn-danger');
      } else {
        stopSosSound();
        btnToggleSos.textContent = 'SONAR ALARMA SOS';
      }
    });
  }
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

function startSosSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    sosOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    sosOscillator.type = 'sawtooth';
    sosOscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

    // Modulación de frecuencia tipo sirena
    let high = true;
    const interval = setInterval(() => {
      if (!isSosPlaying) {
        clearInterval(interval);
        return;
      }
      if (sosOscillator && audioCtx) {
        sosOscillator.frequency.setValueAtTime(high ? 950 : 550, audioCtx.currentTime);
        high = !high;
      }
    }, 400);

    gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
    sosOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    sosOscillator.start();
    isSosPlaying = true;
  } catch (e) {
    console.warn('Error AudioContext:', e);
  }
}

function stopSosSound() {
  if (sosOscillator) {
    try { sosOscillator.stop(); } catch (e) {}
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch (e) {}
  }
  isSosPlaying = false;
}

/* ==========================================================================
   11. GESTOR DE MODALES / DIÁLOGOS
   ========================================================================== */
function initModals() {
  const openButtons = document.querySelectorAll('[id$="-modal"]');
  const closeButtons = document.querySelectorAll('.btn-close-modal');

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      let modalId = '';
      if (btn.id === 'btn-add-contact-modal') modalId = 'modal-add-contact';
      if (btn.id === 'btn-add-reminder-modal') modalId = 'modal-add-reminder';

      const targetModal = document.getElementById(modalId);
      if (targetModal) targetModal.showModal();
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) targetModal.close();
    });
  });

  // Cerrar al hacer clic en el backdrop fuera del diálogo
  document.querySelectorAll('dialog').forEach(modal => {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        modal.close();
      }
    });
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

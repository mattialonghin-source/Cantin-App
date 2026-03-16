// Cantina Personale - Main App Logic

// ---- State ----
let allWines = [];
let currentModal = null;
let currentEditId = null;
let isEditMode = false;
let activeTab = 'cantina';
let searchQuery = '';
let filterDenom = '';
let filterSort = '';
let filterInCantina = false;

// ---- Init ----
document.addEventListener('DOMContentLoaded', async () => {
  await openDB();
  await refreshWineList();
  setupEventListeners();
  navigateTo('cantina');
  registerServiceWorker();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('Service Worker registration failed:', err);
    });
  }
}

// ---- Navigation ----
function navigateTo(tab) {
  activeTab = tab;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById(`page-${tab}`);
  const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (page) page.classList.add('active');
  if (navItem) navItem.classList.add('active');

  if (tab === 'cantina') {
    // Update denominations filter
    populateDenomFilter();
    updateStats();
  }
}

// ---- Event Listeners ----
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.tab));
  });

  // Search and filters
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderWineList();
  });

  document.getElementById('filter-denom').addEventListener('change', (e) => {
    filterDenom = e.target.value;
    renderWineList();
  });

  document.getElementById('filter-sort').addEventListener('change', (e) => {
    filterSort = e.target.value;
    renderWineList();
  });

  document.getElementById('filter-in-cantina').addEventListener('change', (e) => {
    filterInCantina = e.target.checked;
    renderWineList();
  });

  // Action buttons
  document.getElementById('btn-add-wine').addEventListener('click', () => openAddModal());
  document.getElementById('btn-export').addEventListener('click', handleExport);
  document.getElementById('btn-import').addEventListener('click', handleImport);
  document.getElementById('btn-clear-db').addEventListener('click', handleClearDB);

  // Abbina page
  document.getElementById('btn-find-pairing').addEventListener('click', handleFindPairing);

  // Settings
  document.getElementById('btn-save-api-key').addEventListener('click', handleSaveApiKey);
  document.getElementById('btn-test-api-key').addEventListener('click', handleTestApiKey);
  document.getElementById('toggle-api-key').addEventListener('click', () => {
    const input = document.getElementById('api-key-input');
    const btn = document.getElementById('toggle-api-key');
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  });

  // Load saved API key
  const savedKey = localStorage.getItem('claude_api_key');
  if (savedKey) {
    document.getElementById('api-key-input').value = savedKey;
  }
}

// ---- Wine List ----
async function refreshWineList() {
  allWines = await getAllBottiglie();
  await populateDenomFilter();
  renderWineList();
  updateStats();
}

async function updateStats() {
  const stats = await getStats();
  document.getElementById('stat-bottiglie').textContent = stats.bottiglie;
  document.getElementById('stat-etichette').textContent = stats.etichette;
  document.getElementById('stat-valore').textContent = formatCurrency(stats.valore);
}

async function populateDenomFilter() {
  const select = document.getElementById('filter-denom');
  const currentVal = select.value;
  const denoms = await getDenominazioni();

  // Clear existing options except first
  while (select.options.length > 1) select.remove(1);

  denoms.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  if (denoms.includes(currentVal)) select.value = currentVal;
  else select.value = '';
}

function getFilteredAndSortedWines() {
  let wines = [...allWines];

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    wines = wines.filter(w =>
      (w.cantina || '').toLowerCase().includes(q) ||
      (w.vino || '').toLowerCase().includes(q) ||
      (w.denominazione || '').toLowerCase().includes(q) ||
      (w.uve || '').toLowerCase().includes(q)
    );
  }

  // Denomination filter
  if (filterDenom) {
    wines = wines.filter(w => w.denominazione === filterDenom);
  }

  // In cantina filter
  if (filterInCantina) {
    wines = wines.filter(w => (Number(w.quantita) || 0) > 0);
  }

  // Sort
  switch (filterSort) {
    case 'nome':
      wines.sort((a, b) => (a.vino || '').localeCompare(b.vino || ''));
      break;
    case 'annata':
      wines.sort((a, b) => (Number(b.annata) || 0) - (Number(a.annata) || 0));
      break;
    case 'prezzo':
      wines.sort((a, b) => (Number(b.costo) || 0) - (Number(a.costo) || 0));
      break;
    case 'approvazione':
      wines.sort((a, b) => (Number(b.approvazione) || 0) - (Number(a.approvazione) || 0));
      break;
    case 'posizione':
      wines.sort((a, b) => (a.posizione || 'z').localeCompare(b.posizione || 'z'));
      break;
    default:
      // Default: by id descending (most recent first)
      wines.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  return wines;
}

function renderWineList() {
  const wines = getFilteredAndSortedWines();
  const container = document.getElementById('wine-list');

  if (wines.length === 0) {
    const msg = allWines.length === 0
      ? 'Nessun vino in cantina'
      : 'Nessun risultato trovato';
    const sub = allWines.length === 0
      ? 'Aggiungi la tua prima bottiglia!'
      : 'Prova a modificare i filtri';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🍷</div>
        <div class="empty-state-text">${msg}</div>
        <div class="empty-state-sub">${sub}</div>
      </div>
    `;
    return;
  }

  container.innerHTML = wines.map(w => renderWineCard(w)).join('');

  // Attach click handlers
  container.querySelectorAll('.wine-card').forEach(card => {
    card.addEventListener('click', () => openDetailModal(Number(card.dataset.id)));
  });
}

function renderWineCard(wine) {
  const qty = Number(wine.quantita) || 0;
  const rating = Number(wine.approvazione) || 0;
  const price = parseFloat(wine.costo) || 0;
  const posIcon = wine.posizione === 'interna' ? '❄️' : wine.posizione === 'esterna' ? '🏠' : '';

  const dots = Array.from({ length: 5 }, (_, i) =>
    `<div class="rating-dot ${i < rating ? 'filled' : ''}"></div>`
  ).join('');

  return `
    <div class="wine-card" data-id="${wine.id}">
      <div class="qty-badge ${qty === 0 ? 'empty' : ''}">${qty}</div>
      <div class="wine-info">
        <div class="wine-producer">${escapeHtml(wine.cantina || '—')}</div>
        <div class="wine-name">${escapeHtml(wine.vino || '—')}</div>
        <div class="wine-meta">
          ${price > 0 ? `<span class="wine-price">€${formatPrice(price)}</span><span class="meta-sep">·</span>` : ''}
          ${wine.denominazione ? `<span class="wine-denom">${escapeHtml(wine.denominazione)}</span><span class="meta-sep">·</span>` : ''}
          ${wine.annata ? `<span class="wine-year">${wine.annata}</span>` : ''}
          ${posIcon ? `<span class="meta-sep">·</span><span class="wine-position">${posIcon}</span>` : ''}
        </div>
      </div>
      <div class="wine-rating">
        <div class="rating-dots">${dots}</div>
      </div>
    </div>
  `;
}

// ---- Modal: Add / Edit / Detail ----
function openAddModal() {
  currentEditId = null;
  isEditMode = true;
  showModal(null, true);
}

async function openDetailModal(id) {
  const wine = await getBottiglia(id);
  if (!wine) { showToast('Vino non trovato', 'error'); return; }
  currentEditId = id;
  isEditMode = false;
  showModal(wine, false);
}

function showModal(wine, editMode) {
  const existingModal = document.getElementById('bottle-modal');
  if (existingModal) existingModal.remove();

  const isNew = !wine;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'bottle-modal';

  const title = isNew ? 'Aggiungi bottiglia' : (editMode ? 'Modifica bottiglia' : (wine.vino || wine.cantina || 'Dettaglio'));

  modal.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-header">
        <div>
          <div class="modal-handle"></div>
          <div class="modal-title" id="modal-title">${escapeHtml(title)}</div>
          ${!isNew && !editMode && wine.denominazione ? `<div class="modal-subtitle">${escapeHtml(wine.denominazione)}${wine.annata ? ' · ' + wine.annata : ''}</div>` : ''}
        </div>
        <button class="modal-close-btn" id="modal-close-x" aria-label="Chiudi">✕</button>
      </div>
      <div class="modal-body" id="modal-body">
        ${editMode ? renderEditForm(wine) : renderDetailView(wine)}
      </div>
      <div class="modal-footer" id="modal-footer">
        ${renderModalFooter(isNew, editMode)}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  currentModal = modal;

  // Setup modal events
  document.getElementById('modal-close-x').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  setupModalFooterEvents(isNew, wine);
  if (editMode) setupFormEvents(wine);
}

function renderModalFooter(isNew, editMode) {
  if (isNew) {
    return `
      <button class="btn btn-primary flex-1 btn-lg" id="btn-save">💾 Salva</button>
      <button class="btn btn-secondary btn-lg" id="btn-close">✕ Chiudi</button>
    `;
  }
  if (editMode) {
    return `
      <button class="btn btn-danger btn-lg" id="btn-delete">🗑 Elimina</button>
      <button class="btn btn-secondary btn-lg" id="btn-duplicate">⧉ Duplica</button>
      <button class="btn btn-primary flex-1 btn-lg" id="btn-save">💾 Salva</button>
      <button class="btn btn-secondary btn-lg" id="btn-close">✕ Chiudi</button>
    `;
  }
  // View mode
  return `
    <button class="btn btn-danger btn-lg" id="btn-delete">🗑 Elimina</button>
    <button class="btn btn-secondary btn-lg" id="btn-duplicate">⧉ Duplica</button>
    <button class="btn btn-blue flex-1 btn-lg" id="btn-edit">✏️ Edita</button>
    <button class="btn btn-secondary btn-lg" id="btn-close">✕ Chiudi</button>
  `;
}

function setupModalFooterEvents(isNew, wine) {
  const saveBtn = document.getElementById('btn-save');
  const closeBtn = document.getElementById('btn-close');
  const deleteBtn = document.getElementById('btn-delete');
  const duplicateBtn = document.getElementById('btn-duplicate');
  const editBtn = document.getElementById('btn-edit');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const data = collectFormData();
      if (!data) return;
      try {
        if (currentEditId) {
          await updateBottiglia(currentEditId, data);
          showToast('Bottiglia aggiornata!', 'success');
        } else {
          await addBottiglia(data);
          showToast('Bottiglia aggiunta!', 'success');
        }
        closeModal();
        await refreshWineList();
      } catch (err) {
        showToast('Errore nel salvataggio: ' + err.message, 'error');
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmed = await showConfirm('Elimina bottiglia', 'Sei sicuro di voler eliminare questa bottiglia?');
      if (!confirmed) return;
      try {
        await deleteBottiglia(currentEditId);
        showToast('Bottiglia eliminata', 'info');
        closeModal();
        await refreshWineList();
      } catch (err) {
        showToast('Errore: ' + err.message, 'error');
      }
    });
  }

  if (duplicateBtn) {
    duplicateBtn.addEventListener('click', async () => {
      const current = await getBottiglia(currentEditId);
      if (!current) return;
      const copy = { ...current };
      delete copy.id;
      try {
        await addBottiglia(copy);
        showToast('Bottiglia duplicata!', 'success');
        closeModal();
        await refreshWineList();
      } catch (err) {
        showToast('Errore: ' + err.message, 'error');
      }
    });
  }

  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      const current = await getBottiglia(currentEditId);
      if (!current) return;
      isEditMode = true;
      showModal(current, true);
    });
  }
}

function renderEditForm(wine) {
  const w = wine || {};
  const pos = w.posizione || '';
  return `
    <form id="wine-form" autocomplete="off">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Quantità</label>
          <input class="form-input" type="number" id="f-quantita" value="${escapeHtml(String(w.quantita ?? ''))}" min="0" step="1" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Posizione</label>
          <div class="position-toggle">
            <button type="button" class="position-btn ${pos === '' ? 'active' : ''}" data-pos="">—</button>
            <button type="button" class="position-btn ${pos === 'interna' ? 'active' : ''}" data-pos="interna">❄️ Frigo</button>
            <button type="button" class="position-btn ${pos === 'esterna' ? 'active' : ''}" data-pos="esterna">🏠 Cantina</button>
          </div>
          <input type="hidden" id="f-posizione" value="${pos}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cantina / Produttore</label>
          <input class="form-input" type="text" id="f-cantina" value="${escapeHtml(w.cantina || '')}" placeholder="Es. Antinori">
        </div>
        <div class="form-group">
          <label class="form-label">Annata</label>
          <input class="form-input" type="number" id="f-annata" value="${escapeHtml(String(w.annata ?? ''))}" min="1900" max="2100" placeholder="2020">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Nome del vino</label>
        <input class="form-input" type="text" id="f-vino" value="${escapeHtml(w.vino || '')}" placeholder="Es. Tignanello">
      </div>
      <div class="form-group">
        <label class="form-label">Denominazione</label>
        <input class="form-input" type="text" id="f-denominazione" value="${escapeHtml(w.denominazione || '')}" placeholder="Es. Chianti Classico DOCG">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Prezzo €</label>
          <input class="form-input" type="number" id="f-costo" value="${escapeHtml(String(w.costo ?? ''))}" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="form-group">
          <label class="form-label">Anno acquisto</label>
          <input class="form-input" type="number" id="f-acquisto" value="${escapeHtml(String(w.acquisto ?? ''))}" min="1900" max="2100" placeholder="${new Date().getFullYear()}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Uve / Vitigni</label>
        <textarea class="form-textarea" id="f-uve" placeholder="Es. Sangiovese 80%, Cabernet Sauvignon 20%">${escapeHtml(w.uve || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Abbinamenti gastronomici</label>
        <div class="textarea-with-btn">
          <textarea class="form-textarea" id="f-abbinamenti" placeholder="Es. Bistecca, funghi, formaggi stagionati" style="padding-bottom: 36px;">${escapeHtml(w.abbinamenti || '')}</textarea>
          <button type="button" class="textarea-action-btn" id="btn-cerca-abbinamenti">🔍 Cerca abbinamenti</button>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Consumo ideale</label>
          <input class="form-input" type="text" id="f-consumo" value="${escapeHtml(w.consumo || '')}" placeholder="Es. 2024-2030">
        </div>
        <div class="form-group">
          <label class="form-label">Temperatura servizio</label>
          <input class="form-input" type="text" id="f-temperatura" value="${escapeHtml(w.temperatura || '')}" placeholder="Es. 16-18°C">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Luogo di acquisto</label>
        <input class="form-input" type="text" id="f-luogo" value="${escapeHtml(w.luogo || '')}" placeholder="Es. Enoteca Italiana, Milano">
      </div>
      <div class="form-group">
        <label class="form-label">Approvazione</label>
        <div class="rating-selector" id="rating-selector">
          ${Array.from({ length: 5 }, (_, i) =>
            `<div class="rating-selector-dot ${i < (Number(w.approvazione) || 0) ? 'filled' : ''}" data-value="${i + 1}"></div>`
          ).join('')}
          <span style="font-size:11px; color:var(--text-muted); margin-left:6px;" id="rating-label">${Number(w.approvazione) || 0}/5</span>
        </div>
        <input type="hidden" id="f-approvazione" value="${Number(w.approvazione) || 0}">
      </div>
      <div class="form-group">
        <label class="form-label">Note</label>
        <textarea class="form-textarea" id="f-note" placeholder="Note personali...">${escapeHtml(w.note || '')}</textarea>
      </div>
    </form>
  `;
}

function renderDetailView(wine) {
  const w = wine || {};
  const rating = Number(w.approvazione) || 0;
  const qty = Number(w.quantita) || 0;
  const price = parseFloat(w.costo) || 0;
  const posLabel = w.posizione === 'interna' ? '❄️ Frigo' : w.posizione === 'esterna' ? '🏠 Cantina esterna' : '—';

  const dots = Array.from({ length: 5 }, (_, i) =>
    `<div class="rating-dot ${i < rating ? 'filled' : ''}" style="width:12px;height:12px;"></div>`
  ).join('');

  function field(label, value, isEmpty) {
    return `
      <div class="detail-field">
        <div class="detail-field-label">${label}</div>
        <div class="detail-field-value ${!value || isEmpty ? 'empty' : ''}">${value || '—'}</div>
      </div>
    `;
  }

  return `
    <div>
      <div style="display:flex;gap:10px;margin-bottom:16px;">
        <div class="qty-badge ${qty === 0 ? 'empty' : ''}" style="width:52px;height:52px;font-size:20px;">${qty}</div>
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent-gold);margin-bottom:2px;">${escapeHtml(w.cantina || '—')}</div>
          <div style="font-size:17px;font-weight:600;">${escapeHtml(w.vino || '—')}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(w.denominazione || '')}${w.annata ? ' · ' + w.annata : ''}</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
        ${price > 0 ? `<div style="text-align:center"><div style="font-size:18px;font-weight:700;color:var(--accent-green-light)">€${formatPrice(price)}</div><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Prezzo</div></div>` : ''}
        ${w.annata ? `<div style="text-align:center"><div style="font-size:18px;font-weight:700;color:var(--text-primary)">${w.annata}</div><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Annata</div></div>` : ''}
        <div style="text-align:center">
          <div class="rating-dots" style="justify-content:center">${dots}</div>
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Voto</div>
        </div>
        <div style="text-align:center"><div style="font-size:15px;">${posLabel}</div><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Posizione</div></div>
      </div>
      <div class="divider"></div>
      ${w.uve ? field('Uve / Vitigni', escapeHtml(w.uve)) : ''}
      ${w.abbinamenti ? field('Abbinamenti', escapeHtml(w.abbinamenti)) : ''}
      ${w.consumo ? field('Consumo ideale', escapeHtml(w.consumo)) : ''}
      ${w.temperatura ? field('Temperatura di servizio', escapeHtml(w.temperatura)) : ''}
      ${w.luogo ? field('Luogo di acquisto', escapeHtml(w.luogo)) : ''}
      ${w.acquisto ? field('Anno di acquisto', String(w.acquisto)) : ''}
      ${w.note ? field('Note', escapeHtml(w.note)) : ''}
    </div>
  `;
}

function setupFormEvents(wine) {
  // Position toggle
  document.querySelectorAll('.position-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('f-posizione').value = btn.dataset.pos;
    });
  });

  // Rating selector
  const dots = document.querySelectorAll('.rating-selector-dot');
  const ratingInput = document.getElementById('f-approvazione');
  const ratingLabel = document.getElementById('rating-label');

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const val = Number(dot.dataset.value);
      const current = Number(ratingInput.value);
      // Toggle off if clicking same value
      const newVal = current === val ? 0 : val;
      ratingInput.value = newVal;
      if (ratingLabel) ratingLabel.textContent = `${newVal}/5`;
      dots.forEach((d, i) => {
        d.classList.toggle('filled', i < newVal);
      });
    });
  });

  // Cerca abbinamenti
  const cercaBtn = document.getElementById('btn-cerca-abbinamenti');
  if (cercaBtn) {
    cercaBtn.addEventListener('click', async () => {
      const wineData = {
        cantina: document.getElementById('f-cantina').value,
        vino: document.getElementById('f-vino').value,
        denominazione: document.getElementById('f-denominazione').value,
        annata: document.getElementById('f-annata').value,
        uve: document.getElementById('f-uve').value,
      };

      cercaBtn.disabled = true;
      cercaBtn.innerHTML = '<span class="spinner"></span> Ricerca...';

      try {
        const result = await getPairings(wineData);
        document.getElementById('f-abbinamenti').value = result.text;
        const source = result.source === 'ai' ? 'Abbinamenti trovati con AI!' : 'Usando database locale';
        showToast(source, result.source === 'ai' ? 'success' : 'info');
      } catch (err) {
        showToast('Errore nella ricerca: ' + err.message, 'error');
      } finally {
        cercaBtn.disabled = false;
        cercaBtn.textContent = '🔍 Cerca abbinamenti';
      }
    });
  }
}

function collectFormData() {
  const cantina = document.getElementById('f-cantina')?.value?.trim() || '';
  const vino = document.getElementById('f-vino')?.value?.trim() || '';

  if (!cantina && !vino) {
    showToast('Inserisci almeno il produttore o il nome del vino', 'warning');
    return null;
  }

  return {
    quantita: Number(document.getElementById('f-quantita')?.value) || 0,
    posizione: document.getElementById('f-posizione')?.value || '',
    cantina,
    vino,
    denominazione: document.getElementById('f-denominazione')?.value?.trim() || '',
    annata: Number(document.getElementById('f-annata')?.value) || null,
    costo: parseFloat(document.getElementById('f-costo')?.value) || 0,
    uve: document.getElementById('f-uve')?.value?.trim() || '',
    consumo: document.getElementById('f-consumo')?.value?.trim() || '',
    luogo: document.getElementById('f-luogo')?.value?.trim() || '',
    temperatura: document.getElementById('f-temperatura')?.value?.trim() || '',
    abbinamenti: document.getElementById('f-abbinamenti')?.value?.trim() || '',
    acquisto: Number(document.getElementById('f-acquisto')?.value) || null,
    approvazione: Number(document.getElementById('f-approvazione')?.value) || 0,
    note: document.getElementById('f-note')?.value?.trim() || '',
  };
}

function closeModal() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
  currentEditId = null;
  isEditMode = false;
}

// ---- Abbina Page ----
async function handleFindPairing() {
  const dish = document.getElementById('abbina-input').value.trim();
  if (!dish) {
    showToast('Inserisci un piatto', 'warning');
    return;
  }

  const btn = document.getElementById('btn-find-pairing');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Ricerca in corso...';

  const resultsDiv = document.getElementById('abbina-results');
  resultsDiv.innerHTML = '<div class="no-matches">Ricerca in corso...</div>';

  try {
    const cellarWines = await getAllBottiglie();
    const result = await getWineSuggestions(dish, cellarWines);
    renderAbbinaResults(result);
  } catch (err) {
    showToast('Errore: ' + err.message, 'error');
    resultsDiv.innerHTML = '<div class="no-matches">Errore nella ricerca. Riprova.</div>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔍 Trova abbinamento';
  }
}

function renderAbbinaResults(result) {
  const div = document.getElementById('abbina-results');
  const sourceLabel = result.source === 'ai'
    ? '<span class="source-badge ai">✨ AI</span>'
    : '<span class="source-badge local">📚 Database locale</span>';

  let html = '<div class="abbina-results">';

  // General suggestions
  html += `
    <div>
      <div class="results-section-title">Vini consigliati ${sourceLabel}</div>
      <div class="suggestion-pills">
        ${result.suggestions.map(s => `<span class="suggestion-pill">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  `;

  // Motivation
  if (result.motivation) {
    html += `<div class="motivation-text">${escapeHtml(result.motivation)}</div>`;
  }

  // Cellar matches
  html += `<div><div class="results-section-title">Dalla tua cantina:</div>`;
  if (result.cellarMatches && result.cellarMatches.length > 0) {
    html += result.cellarMatches.slice(0, 6).map(wine => {
      const qty = Number(wine.quantita) || 0;
      const rating = Number(wine.approvazione) || 0;
      const dots = Array.from({ length: 5 }, (_, i) =>
        `<div class="rating-dot ${i < rating ? 'filled' : ''}"></div>`
      ).join('');
      return `
        <div class="cellar-match-card">
          <div class="qty-badge ${qty === 0 ? 'empty' : ''}" style="min-width:32px;height:32px;font-size:12px;">${qty}</div>
          <div class="wine-info">
            <div class="wine-producer">${escapeHtml(wine.cantina || '—')}</div>
            <div class="wine-name">${escapeHtml(wine.vino || '—')}</div>
            <div class="wine-meta">
              ${wine.denominazione ? `<span class="wine-denom">${escapeHtml(wine.denominazione)}</span>` : ''}
              ${wine.annata ? `<span class="meta-sep">·</span><span class="wine-year">${wine.annata}</span>` : ''}
            </div>
          </div>
          <div class="rating-dots">${dots}</div>
        </div>
      `;
    }).join('');
  } else {
    html += '<div class="no-matches">Nessun vino della tua cantina si abbina direttamente. Prova ad aggiungere più dettagli ai tuoi vini.</div>';
  }
  html += '</div>';

  html += '</div>';
  div.innerHTML = html;
}

// ---- Import / Export ----
async function handleExport() {
  const btn = document.getElementById('btn-export');
  btn.disabled = true;
  try {
    const result = await exportToXLSX();
    showToast(`Esportati ${result.count} vini in ${result.fileName}`, 'success');
  } catch (err) {
    showToast('Errore esportazione: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function handleImport() {
  const dialog = await showImportDialog();
  if (!dialog) return;

  const { file, mode } = dialog;
  showToast('Importazione in corso...', 'info');

  try {
    const result = await importFromXLSX(file, mode);
    const msg = mode === 'replace'
      ? `Database sostituito: ${result.added} bottiglie importate`
      : `Importate ${result.added} bottiglie${result.errors > 0 ? ` (${result.errors} errori)` : ''}`;
    showToast(msg, 'success');
    await refreshWineList();
  } catch (err) {
    showToast('Errore importazione: ' + err.message, 'error');
  }
}

async function handleClearDB() {
  const confirmed = await showConfirm(
    'Svuota database',
    'Questa operazione eliminerà TUTTE le bottiglie dalla cantina. Sei sicuro? L\'operazione è irreversibile.'
  );
  if (!confirmed) return;
  try {
    await clearAllBottiglie();
    allWines = [];
    renderWineList();
    updateStats();
    showToast('Database svuotato', 'info');
  } catch (err) {
    showToast('Errore: ' + err.message, 'error');
  }
}

// ---- Settings ----
function handleSaveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (key) {
    localStorage.setItem('claude_api_key', key);
    showToast('API key salvata!', 'success');
  } else {
    localStorage.removeItem('claude_api_key');
    showToast('API key rimossa', 'info');
  }
}

async function handleTestApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key) {
    showToast('Inserisci prima una API key', 'warning');
    return;
  }

  const btn = document.getElementById('btn-test-api-key');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Test in corso...';
  document.getElementById('api-test-status').innerHTML = '';

  try {
    const result = await testApiKey(key);
    const statusDiv = document.getElementById('api-test-status');
    if (result.success) {
      statusDiv.innerHTML = '<span class="status-badge success">✓ Connessione riuscita</span>';
      showToast('API key valida!', 'success');
    } else {
      statusDiv.innerHTML = `<span class="status-badge error">✕ ${escapeHtml(result.message)}</span>`;
      showToast('API key non valida', 'error');
    }
  } catch (err) {
    document.getElementById('api-test-status').innerHTML = `<span class="status-badge error">✕ ${escapeHtml(err.message)}</span>`;
    showToast('Errore nel test: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔌 Testa connessione';
  }
}

// ---- Toast ----
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ---- Confirm Dialog ----
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" id="confirm-no">Annulla</button>
          <button class="btn btn-danger" id="confirm-yes">Conferma</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('confirm-yes').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
    document.getElementById('confirm-no').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { overlay.remove(); resolve(false); }
    });
  });
}

// ---- Utilities ----
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
  if (value >= 10000) return (value / 1000).toFixed(1) + 'k';
  if (value === 0) return '0';
  return value.toFixed(0);
}

function formatPrice(value) {
  if (!value) return '0';
  const n = parseFloat(value);
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
}

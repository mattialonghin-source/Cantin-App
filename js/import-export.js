// XLSX Import/Export for Cantina Personale

const COLUMN_MAP = {
  'quantita': 'quantita',
  'quantità': 'quantita',
  'qty': 'quantita',
  'cantina': 'cantina',
  'produttore': 'cantina',
  'producer': 'cantina',
  'vino': 'vino',
  'wine': 'vino',
  'nome vino': 'vino',
  'denominazione': 'denominazione',
  'denom': 'denominazione',
  'doc': 'denominazione',
  'docg': 'denominazione',
  'annata': 'annata',
  'anno': 'annata',
  'vintage': 'annata',
  'year': 'annata',
  'costo': 'costo',
  'prezzo': 'costo',
  'price': 'costo',
  'cost': 'costo',
  'uve': 'uve',
  'vitigno': 'uve',
  'vitigni': 'uve',
  'grape': 'uve',
  'grapes': 'uve',
  'consumo': 'consumo',
  'consumo ideale': 'consumo',
  'finestra di consumo': 'consumo',
  'drink by': 'consumo',
  'luogo': 'luogo',
  'luogo acquisto': 'luogo',
  'luogo di acquisto': 'luogo',
  'negozio': 'luogo',
  'shop': 'luogo',
  'temperatura': 'temperatura',
  'temperatura servizio': 'temperatura',
  'temp': 'temperatura',
  'abbinamenti': 'abbinamenti',
  'abbinamento': 'abbinamenti',
  'pairings': 'abbinamenti',
  'acquisto': 'acquisto',
  'anno acquisto': 'acquisto',
  'anno di acquisto': 'acquisto',
  'purchase year': 'acquisto',
  'approvazione': 'approvazione',
  'voto': 'approvazione',
  'rating': 'approvazione',
  'score': 'approvazione',
  'note': 'note',
  'notes': 'note',
  'commenti': 'note',
  'comments': 'note',
  'posizione': 'posizione',
  'position': 'posizione',
  'location': 'posizione',
};

function normalizeHeader(header) {
  return String(header || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function mapRow(row, headers) {
  const mapped = {};
  headers.forEach((header, i) => {
    const normalized = normalizeHeader(header);
    const field = COLUMN_MAP[normalized];
    if (field) {
      mapped[field] = row[i] !== undefined && row[i] !== null ? row[i] : '';
    }
  });
  return mapped;
}

async function importFromXLSX(file, mode = 'merge') {
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined') {
      reject(new Error('SheetJS non caricato. Controlla la connessione internet.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawData || rawData.length < 2) {
          reject(new Error('File vuoto o formato non valido.'));
          return;
        }

        const headers = rawData[0].map(h => String(h));
        const rows = rawData.slice(1).filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined));

        const items = rows.map(row => {
          const mapped = mapRow(row, headers);
          // Apply defaults and sanitize
          return {
            quantita: Number(mapped.quantita) || 0,
            cantina: String(mapped.cantina || '').trim(),
            vino: String(mapped.vino || '').trim(),
            denominazione: String(mapped.denominazione || '').trim(),
            annata: mapped.annata ? Number(mapped.annata) : null,
            costo: parseFloat(mapped.costo) || 0,
            uve: String(mapped.uve || '').trim(),
            consumo: String(mapped.consumo || '').trim(),
            luogo: String(mapped.luogo || '').trim(),
            temperatura: String(mapped.temperatura || '').trim(),
            abbinamenti: String(mapped.abbinamenti || '').trim(),
            acquisto: mapped.acquisto ? Number(mapped.acquisto) : null,
            approvazione: Math.min(5, Math.max(0, Number(mapped.approvazione) || 0)),
            note: String(mapped.note || '').trim(),
            posizione: ['interna', 'esterna'].includes(String(mapped.posizione || '').toLowerCase().trim())
              ? String(mapped.posizione).toLowerCase().trim()
              : '',
          };
        }).filter(item => item.cantina || item.vino || item.denominazione);

        if (items.length === 0) {
          reject(new Error('Nessuna riga valida trovata nel file.'));
          return;
        }

        if (mode === 'replace') {
          await clearAllBottiglie();
          const result = await bulkAddBottiglie(items);
          resolve({ ...result, mode: 'replace', total: items.length });
        } else {
          const result = await bulkAddBottiglie(items);
          resolve({ ...result, mode: 'merge', total: items.length });
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Errore nella lettura del file.'));
    reader.readAsArrayBuffer(file);
  });
}

async function exportToXLSX() {
  if (typeof XLSX === 'undefined') {
    throw new Error('SheetJS non caricato. Controlla la connessione internet.');
  }

  const all = await getAllBottiglie();
  if (all.length === 0) {
    throw new Error('Nessun vino da esportare.');
  }

  const headers = [
    'quantita', 'cantina', 'vino', 'denominazione', 'annata', 'costo',
    'uve', 'consumo', 'luogo', 'temperatura', 'abbinamenti',
    'acquisto', 'approvazione', 'note', 'posizione',
  ];

  const rows = all.map(b => headers.map(h => {
    const val = b[h];
    if (val === null || val === undefined) return '';
    return val;
  }));

  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = [
    { wch: 10 }, { wch: 25 }, { wch: 30 }, { wch: 25 }, { wch: 8 },
    { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
    { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 12 },
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cantina');

  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const fileName = `cantina_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
  return { count: all.length, fileName };
}

function showImportDialog() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'import-overlay';
    overlay.innerHTML = `
      <div class="import-dialog glass-card">
        <h3>Importa da XLSX</h3>
        <p class="text-secondary">Seleziona un file Excel (.xlsx) da importare.</p>
        <p class="text-secondary small">Colonne supportate: quantita, cantina, vino, denominazione, annata, costo, uve, consumo, luogo, temperatura, abbinamenti, acquisto, approvazione, note, posizione</p>
        <div class="import-mode">
          <label class="radio-label">
            <input type="radio" name="import-mode" value="merge" checked>
            <span>Unisci (aggiungi nuovi, mantieni esistenti)</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="import-mode" value="replace">
            <span>Sostituisci tutto (elimina e reimporta)</span>
          </label>
        </div>
        <div class="import-actions">
          <button class="btn btn-secondary" id="import-cancel">Annulla</button>
          <label class="btn btn-primary" for="import-file-input">
            Scegli file
            <input type="file" id="import-file-input" accept=".xlsx,.xls" style="display:none">
          </label>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cleanup = () => { overlay.remove(); };

    document.getElementById('import-cancel').addEventListener('click', () => {
      cleanup();
      resolve(null);
    });

    document.getElementById('import-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) { cleanup(); resolve(null); return; }
      const mode = overlay.querySelector('input[name="import-mode"]:checked').value;
      cleanup();
      resolve({ file, mode });
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { cleanup(); resolve(null); }
    });
  });
}

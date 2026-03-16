// Wine Pairings - Static Database + AI Integration
const STATIC_PAIRINGS = {
  'sagrantino': 'Selvaggina, cinghiale, formaggi stagionati, carni rosse brasate, lombatine di agnello',
  'barolo': 'Brasato al Barolo, tartufo, selvaggina, formaggi stagionati, costata di manzo',
  'barbaresco': 'Funghi porcini, selvaggina, carni rosse, risotto al tartufo, fagiano',
  'amarone': 'Brasato, stufato di manzo, formaggi stagionati, cioccolato fondente, cinghiale',
  'brunello': 'Bistecca fiorentina, cinghiale, agnello al forno, tartufo nero, pici al ragù',
  'vino nobile': 'Pici al ragù, bistecca, cinghiale, pecorino stagionato, piccione',
  'nobile di montepulciano': 'Pici al ragù, bistecca, cinghiale, pecorino stagionato',
  'chianti classico': 'Bistecca alla fiorentina, pasta al ragù, ribollita, salumi toscani',
  'chianti': 'Bistecca, pasta al ragù, salumi, formaggi toscani, pizza',
  'morellino': 'Cinghiale, agnello, pasta al ragù, formaggi toscani',
  'montecucco': 'Carni rosse, pasta al sugo, formaggi, salumi',
  'primitivo': 'Carni alla brace, pasta con ragù, orecchiette, formaggi semistagionati',
  "nero d'avola": 'Arancina, pasta alla norma, carni rosse, caponata, agnello',
  'nero davola': 'Arancina, pasta alla norma, carni rosse, caponata',
  'montepulciano': 'Arrosticini, agnello allo spiedo, porchetta, pasta all\'amatriciana',
  'valpolicella': 'Pasta al ragù, carni rosse, formaggi, salumi, risotto',
  'ripasso': 'Carni rosse, pasta al ragù, formaggi stagionati, salumi',
  'pinot nero': 'Funghi porcini, salmone, carni bianche, risotto, quaglia',
  'pinot noir': 'Funghi, salmone, carni bianche, risotto, piccione',
  'nebbiolo': 'Tartufo, funghi, selvaggina, formaggi stagionati, risotto',
  'barbera': 'Pasta al ragù, pizza margherita, salumi, carni bianche, tajarin',
  'dolcetto': 'Antipasti, pasta, pizza, salumi, vitello tonnato',
  'sangiovese': 'Bistecca, pasta al pomodoro, formaggi toscani, prosciutto',
  'merlot': 'Carni rosse, pasta al ragù, formaggi medi, arrosto di maiale',
  'cabernet sauvignon': 'Bistecca, agnello, formaggi stagionati, selvaggina',
  'cabernet franc': 'Carni rosse, agnello, formaggi, risotto',
  'cabernet': 'Bistecca, agnello, formaggi stagionati, carni rosse',
  'syrah': 'Agnello, selvaggina, formaggi stagionati, carni alla brace',
  'shiraz': 'Carni alla brace, agnello, salsicce, formaggi stagionati',
  'aglianico': 'Agnello, maiale, salsicce, formaggi campani, pasta e fagioli',
  'taurasi': 'Carni rosse brasate, agnello al forno, formaggi stagionati',
  'fiano': 'Pesce al forno, frutti di mare, risotto di pesce, mozzarella di bufala',
  'greco di tufo': 'Pesce, frutti di mare, mozzarella di bufala, antipasti campani',
  'falanghina': 'Frutti di mare, pesce alla griglia, pizza margherita, mozzarella',
  'vermentino': 'Pesce, frutti di mare, antipasti di mare, bottarga, spaghetti alle vongole',
  'pinot grigio': 'Pesce, risotto di pesce, antipasti leggeri, prosciutto crudo',
  'pinot gris': 'Pesce, formaggi medi, foie gras, antipasti',
  'prosecco': 'Antipasti, fritture, formaggi freschi, prosciutto crudo, salmone affumicato',
  'soave': 'Risotto, pesce alla griglia, antipasti, baccalà mantecato',
  'etna': 'Pesce spada, tonno alla siciliana, antipasti siciliani, arancini',
  'etna rosso': 'Pasta alla norma, carni rosse, salsicce, formaggi siciliani',
  'etna bianco': 'Pesce spada, gamberi, antipasti di pesce',
  'rosso conero': 'Vincigrassi, coniglio in porchetta, formaggi marchigiani, ciauscolo',
  'verdicchio': 'Pesce, frutti di mare, olive ascolane, brodetto',
  'pecorino': 'Pesce, frutti di mare, pasta allo scoglio, antipasti',
  'trebbiano': 'Pesce, antipasti leggeri, formaggi freschi',
  'chardonnay': 'Pesce, pollo, risotto, formaggi medi, pasta con panna',
  'sauvignon': 'Pesce, formaggi caprini, insalate, antipasti leggeri',
  'sauvignon blanc': 'Pesce, formaggi caprini, insalate di mare, crostacei',
  'riesling': 'Pesce, carni bianche, formaggi, cucina asiatica',
  'gewurztraminer': 'Formaggi, cucina speziata, foie gras, antipasti aromatici',
  'tocai': 'Prosciutto di San Daniele, formaggi friulani, risotto, pesce',
  'friulano': 'Prosciutto di San Daniele, formaggi friulani, risotto al radicchio',
  'malvasia': 'Pesce, antipasti, formaggi freschi, crostacei',
  'garganega': 'Pesce, risotto, antipasti leggeri, formaggi freschi',
  'franciacorta': 'Antipasti, pesce, risotto, dessert leggeri',
  'trento doc': 'Antipasti, pesce, crostacei, risotto',
  'lambrusco': 'Prosciutto di Parma, mortadella, crescentine, zampone, cotechino',
  'sangiovese di romagna': 'Piadina, pasta al ragù, grigliate, formaggi',
  'lagrein': 'Selvaggina, carni rosse, speck, formaggi altoatesini',
  'teroldego': 'Carni alla brace, speck, crauti, formaggi trentini',
  'marzemino': 'Carni bianche, formaggi medi, salumi trentini',
  'corvina': 'Pasta al ragù, carni rosse, formaggi, salumi veneti',
  'cannonau': 'Agnello, maialetto arrosto, formaggi sardi, culurgionis',
  'carignano': 'Pesce, carni, formaggi sardi',
  'vernaccia': 'Pesce, frutti di mare, antipasti, formaggi freschi',
  'vermentino di sardegna': 'Bottarga, aragosta, frutti di mare, antipasti sardi',
  'nuragus': 'Pesce, antipasti, formaggi freschi',
  'monica': 'Carni, formaggi sardi, antipasti',
  'ciliegiolo': 'Carni bianche, pasta, formaggi medi',
  'aleatico': 'Formaggi stagionati, dolci secchi, cioccolato',
  'brachetto': 'Fragole, dolci, crostate di frutta',
  'moscato': 'Dolci, panettone, formaggi erborinati, torta di mele',
  'passito': 'Formaggi stagionati, dolci secchi, cioccolato fondente, biscotti',
  'vin santo': 'Cantucci, crostate, formaggi stagionati',
  'recioto': 'Dolci al cioccolato, torte, formaggi erborinati',
  'sforzato': 'Selvaggina, carni rosse, formaggi stagionati, brasati',
  'amarone della valpolicella': 'Brasato all\'Amarone, stufati, formaggi stagionati, cioccolato',
  'custoza': 'Pesce, antipasti leggeri, formaggi freschi',
  'lugana': 'Lavarello del lago, carpacci di pesce, antipasti lacustri',
  'franciacorta satèn': 'Antipasti, salmone, crostacei, risotto',
  'oltrepò pavese': 'Salumi lombardi, formaggi, risotto, carni',
  'buttafuoco': 'Carni rosse, pasta al ragù, formaggi',
  'rossese': 'Pesce, pasta al pesto, focaccia genovese',
  'pigato': 'Pesce, focaccia, trofie al pesto, formaggi liguri',
  'cinqueterre': 'Pesce, frutti di mare, pesto, trofie',
  'colli di luni': 'Pesce, antipasti, pasta al pesto',
  'cesanese': 'Pasta all\'amatriciana, abbacchio, porchetta',
  'frascati': 'Antipasti romani, carciofi alla romana, pesce',
  'est est est': 'Pesce, antipasti, formaggi laziali',
  'orvieto': 'Pesce, antipasti umbri, pasta al tartufo bianco',
  'sagrantino di montefalco': 'Piccione alla ghiotta, cinghiale, carni rosse, formaggi umbri',
  'torgiano': 'Pasta al tartufo, carni, formaggi umbri',
  'asprinio': 'Antipasti, pizza fritta, fritture campane',
  'piedirosso': 'Pasta e fagioli, carni bianche, formaggi campani',
  'cirò': 'Carni rosse, pasta al ragù, formaggi calabresi',
  'gaglioppo': 'Carni rosse, pasta, formaggi calabresi',
  'nerello mascalese': 'Pesce spada, tonno, carni rosse siciliane',
  'frappato': 'Pesce, antipasti siciliani, arancini',
  'cerasuolo di vittoria': 'Pasta alla norma, carni, formaggi siciliani',
  // Default fallbacks by color
  'rosso': 'Carni rosse, formaggi stagionati, pasta al ragù, salumi',
  'bianco': 'Pesce, risotto, antipasti, formaggi freschi, crostacei',
  'rosato': 'Antipasti, pesce, pizza, salumi, carni bianche',
  'spumante': 'Antipasti, fritture, pesce, crostacei',
  'bollicine': 'Antipasti, pesce, crostacei, formaggi freschi',
  'dolce': 'Formaggi erborinati, dolci, frutta secca, foie gras',
};

const DISH_KEYWORDS = {
  pesce: ['bianco', 'vermentino', 'pinot grigio', 'soave', 'falanghina', 'fiano', 'vernaccia', 'lugana'],
  frutti_di_mare: ['bianco secco', 'vermentino', 'prosecco', 'falanghina', 'pecorino'],
  carne_rossa: ['barolo', 'barbaresco', 'amarone', 'brunello', 'sagrantino', 'aglianico', 'cabernet sauvignon'],
  carne_bianca: ['pinot nero', 'barbera', 'dolcetto', 'chardonnay', 'vermentino'],
  agnello: ['aglianico', 'montepulciano', 'cannonau', 'syrah', 'brunello'],
  selvaggina: ['barolo', 'barbaresco', 'sagrantino', 'amarone', 'sforzato'],
  pasta_ragu: ['chianti', 'sangiovese', 'montepulciano', 'barbera', 'primitivo'],
  pasta_pesce: ['vermentino', 'pinot grigio', 'soave', 'fiano', 'verdicchio'],
  pizza: ['barbera', 'sangiovese', 'prosecco', 'lambrusco', 'primitivo'],
  formaggi: ['passito', 'vin santo', 'barolo', 'barbaresco', 'amarone'],
  tartufo: ['barolo', 'barbaresco', 'nebbiolo', 'pinot nero', 'brunello'],
  risotto: ['barbera', 'dolcetto', 'pinot grigio', 'lugana', 'soave'],
  dolci: ['moscato', 'brachetto', 'recioto', 'passito', 'vin santo'],
  antipasti: ['prosecco', 'pinot grigio', 'vermentino', 'falanghina', 'barbera'],
  salumi: ['lambrusco', 'barbera', 'dolcetto', 'sangiovese', 'prosecco'],
  cinghiale: ['sagrantino', 'brunello', 'barolo', 'amarone', 'morellino'],
  salmone: ['pinot nero', 'chardonnay', 'prosecco', 'sauvignon', 'riesling'],
  cioccolato: ['amarone', 'passito', 'recioto', 'brachetto', 'aleatico'],
  brace: ['primitivo', 'nero davola', 'montepulciano', 'syrah', 'cannonau'],
};

function normalizeText(text) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function findStaticPairing(wine) {
  const fields = [
    wine.denominazione || '',
    wine.uve || '',
    wine.vino || '',
    wine.cantina || '',
  ].join(' ');
  const normalized = normalizeText(fields);

  const sortedKeys = Object.keys(STATIC_PAIRINGS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (normalized.includes(normalizeText(key))) {
      return STATIC_PAIRINGS[key];
    }
  }

  // Fallback by color keywords
  if (/\brosso\b|\bred\b|\brouge\b/.test(normalized)) return STATIC_PAIRINGS['rosso'];
  if (/\bbianco\b|\bwhite\b|\bblanc\b/.test(normalized)) return STATIC_PAIRINGS['bianco'];
  if (/\brosato\b|\brose\b|\brosé\b/.test(normalized)) return STATIC_PAIRINGS['rosato'];
  if (/\bspumante\b|\bprosecco\b|\bfranciacorta\b|\btrento\b/.test(normalized)) return STATIC_PAIRINGS['spumante'];

  return 'Carni, formaggi, pasta - abbinamento generico. Aggiungi una Claude API key per abbinamenti personalizzati.';
}

async function callClaudeAPI(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.content[0].text.trim();
}

async function getPairings(wine) {
  const apiKey = localStorage.getItem('claude_api_key');
  if (apiKey && apiKey.trim() !== '') {
    try {
      const wineDesc = [
        wine.cantina && `Cantina: ${wine.cantina}`,
        wine.vino && `Vino: ${wine.vino}`,
        wine.denominazione && `Denominazione: ${wine.denominazione}`,
        wine.annata && `Annata: ${wine.annata}`,
        wine.uve && `Uve: ${wine.uve}`,
      ].filter(Boolean).join(', ');

      const prompt = `Sei un sommelier esperto italiano. Suggerisci abbinamenti gastronomici per questo vino: ${wineDesc}.
Rispondi con una lista concisa di 5-8 abbinamenti separati da virgola, in italiano, senza introduzione. Solo gli abbinamenti.`;

      const result = await callClaudeAPI(prompt, apiKey);
      return { text: result, source: 'ai' };
    } catch (err) {
      console.warn('Claude API error, falling back to static DB:', err.message);
      return { text: findStaticPairing(wine), source: 'static', error: err.message };
    }
  }
  return { text: findStaticPairing(wine), source: 'static' };
}

function staticDishSuggestions(dish) {
  const normalized = normalizeText(dish);
  const suggestions = new Map();

  const keywordMap = {
    'pesce': ['pesce', 'fish', 'merluzzo', 'branzino', 'orata', 'sogliola', 'spigola', 'alici', 'sardine'],
    'frutti_di_mare': ['frutti di mare', 'vongole', 'cozze', 'gamberi', 'scampi', 'aragosta', 'polpo', 'calamari', 'seppie', 'mare'],
    'carne_rossa': ['carne rossa', 'bistecca', 'manzo', 'bue', 'filetto', 'tagliata', 'fiorentina', 'costata', 'roastbeef'],
    'carne_bianca': ['pollo', 'tacchino', 'coniglio', 'maiale', 'vitello', 'lonza'],
    'agnello': ['agnello', 'abbacchio', 'arrosticini', 'castrato'],
    'selvaggina': ['cinghiale', 'cervo', 'capriolo', 'fagiano', 'lepre', 'selvaggina', 'piccione', 'quaglia'],
    'pasta_ragu': ['ragu', 'ragù', 'bolognese', 'amatriciana', 'carbonara', 'pasta al forno', 'lasagne', 'cannelloni'],
    'pasta_pesce': ['spaghetti alle vongole', 'pasta al salmone', 'pasta allo scoglio', 'linguine'],
    'pizza': ['pizza', 'focaccia', 'calzone'],
    'formaggi': ['formaggio', 'formaggi', 'pecorino', 'parmigiano', 'grana', 'gorgonzola', 'brie', 'taleggio'],
    'tartufo': ['tartufo', 'truffle'],
    'risotto': ['risotto'],
    'dolci': ['dolce', 'torta', 'tiramisù', 'panna cotta', 'cannolo', 'dessert', 'cioccolato', 'gelato', 'pasticcini'],
    'antipasti': ['antipasto', 'antipasti', 'aperitivo', 'stuzzichini', 'bruschetta'],
    'salumi': ['salumi', 'prosciutto', 'salame', 'mortadella', 'speck', 'bresaola', 'coppa'],
    'cinghiale': ['cinghiale', 'wild boar'],
    'salmone': ['salmone', 'salmon'],
    'cioccolato': ['cioccolato', 'fondente', 'cacao', 'chocolate'],
    'brace': ['brace', 'grigliate', 'grigliata', 'bbq', 'barbecue', 'arrosto'],
  };

  for (const [category, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      if (normalized.includes(normalizeText(kw))) {
        const wines = DISH_KEYWORDS[category] || [];
        wines.forEach((w, i) => {
          const score = (suggestions.get(w) || 0) + (wines.length - i);
          suggestions.set(w, score);
        });
        break;
      }
    }
  }

  if (suggestions.size === 0) {
    return {
      suggestions: ['Vino rosso medio corpo', 'Vino bianco secco', 'Rosato'],
      message: 'Abbinamento generico - specifica meglio il piatto per risultati migliori.',
    };
  }

  const sorted = [...suggestions.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([wine]) => wine);
  return { suggestions: sorted, message: null };
}

function rankCellarWines(dish, cellarWines) {
  const normalized = normalizeText(dish);
  const scored = cellarWines.map((wine) => {
    const fields = normalizeText([wine.denominazione, wine.uve, wine.vino, wine.abbinamenti, wine.cantina].join(' '));
    let score = 0;
    const sortedKeys = Object.keys(STATIC_PAIRINGS).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (fields.includes(normalizeText(key))) {
        score += 3;
        break;
      }
    }
    // Check if abbinamenti field contains dish words
    const abbWords = normalizeText(wine.abbinamenti || '').split(/\s+/);
    const dishWords = normalized.split(/\s+/).filter(w => w.length > 3);
    dishWords.forEach(dw => { if (abbWords.some(aw => aw.includes(dw) || dw.includes(aw))) score += 5; });
    return { wine, score };
  });
  return scored.sort((a, b) => b.score - a.score).filter(item => item.score > 0).map(item => item.wine);
}

async function getWineSuggestions(dish, cellarWines) {
  const apiKey = localStorage.getItem('claude_api_key');
  const inCellar = cellarWines.filter(w => (Number(w.quantita) || 0) > 0);

  if (apiKey && apiKey.trim() !== '') {
    try {
      const cellarDesc = inCellar.slice(0, 20).map(w =>
        `${w.cantina || ''} ${w.vino || ''} ${w.denominazione || ''} ${w.annata || ''}`.trim()
      ).join('; ');

      const prompt = `Sei un sommelier italiano esperto. Il cliente vuole abbinare un vino a: "${dish}".
La sua cantina contiene: ${cellarDesc || 'nessun vino disponibile'}.

Rispondi in italiano con questo formato esatto:
SUGGERIMENTI GENERALI: [4 tipologie di vino ideali separate da |]
DALLA CANTINA: [nomi esatti dei vini dalla cantina che si abbinano meglio, separati da |, o "nessuno" se nessuno si abbina]
MOTIVAZIONE: [1 frase breve sul perché]`;

      const result = await callClaudeAPI(prompt, apiKey);
      const lines = result.split('\n').filter(l => l.trim());
      let generalSuggestions = [];
      let cellarMatches = [];
      let motivation = '';

      for (const line of lines) {
        if (line.includes('SUGGERIMENTI GENERALI:')) {
          generalSuggestions = line.split(':').slice(1).join(':').split('|').map(s => s.trim()).filter(Boolean);
        } else if (line.includes('DALLA CANTINA:')) {
          const cellarText = line.split(':').slice(1).join(':').trim();
          if (cellarText.toLowerCase() !== 'nessuno') {
            const names = cellarText.split('|').map(s => s.trim().toLowerCase()).filter(Boolean);
            cellarMatches = inCellar.filter(w => {
              const wineStr = `${w.cantina} ${w.vino} ${w.denominazione}`.toLowerCase();
              return names.some(n => wineStr.includes(n) || n.includes(w.vino?.toLowerCase() || ''));
            });
          }
        } else if (line.includes('MOTIVAZIONE:')) {
          motivation = line.split(':').slice(1).join(':').trim();
        }
      }

      if (generalSuggestions.length === 0) generalSuggestions = ['Vino consigliato da AI'];
      if (cellarMatches.length === 0) cellarMatches = rankCellarWines(dish, inCellar);

      return { suggestions: generalSuggestions, cellarMatches, motivation, source: 'ai' };
    } catch (err) {
      console.warn('Claude API error:', err.message);
    }
  }

  // Static fallback
  const { suggestions, message } = staticDishSuggestions(dish);
  const cellarMatches = rankCellarWines(dish, inCellar);
  return { suggestions, cellarMatches, motivation: message, source: 'static' };
}

async function testApiKey(apiKey) {
  try {
    const result = await callClaudeAPI('Rispondi solo con "OK"', apiKey);
    return { success: true, message: result };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

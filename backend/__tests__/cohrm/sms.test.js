/**
 * Tests for COHRM SMS parsing logic
 * Tests the parseSmsCode function extracted from routes/cohrm.js
 */

// Extract parseSmsCode function (same logic as in cohrm.js lines 61-118)
const parseSmsCode = (smsText) => {
  const parts = smsText.split('*');
  if (parts.length < 4) return null;

  const symptomCodes = {
    'FI': 'Fievre', 'VO': 'Vomissements', 'DI': 'Diarrhee',
    'TO': 'Toux', 'ER': 'Eruption cutanee', 'HE': 'Hemorragie',
    'PA': 'Paralysie', 'MO': 'Mortalite', 'AB': 'Avortement',
    'RE': 'Problemes respiratoires', 'NE': 'Symptomes neurologiques', 'OE': 'Oedemes',
  };

  const specieCodes = {
    'HUM': 'Humain', 'BOV': 'Bovin', 'OVI': 'Ovin/Caprin',
    'VOL': 'Volaille', 'POR': 'Porcin', 'SAU': 'Faune sauvage',
    'CHI': 'Chien/Chat', 'AUT': 'Autre',
  };

  const eventCodes = {
    'MAL': 'Maladie suspecte', 'MOR': 'Mortalite anormale',
    'EPI': 'Epidemie suspectee', 'ZOO': 'Zoonose suspectee',
    'INT': 'Intoxication', 'ENV': 'Evenement environnemental',
  };

  const eventCode = parts[0].toUpperCase();
  const location = parts[1];
  const symptoms = parts[2].split(',').map(s => symptomCodes[s.toUpperCase()] || s).join(', ');
  const species = specieCodes[parts[3].toUpperCase()] || parts[3];
  const count = parts[4] ? parseInt(parts[4]) : null;
  const details = parts[5] || '';

  return {
    event_type: eventCodes[eventCode] || eventCode,
    location,
    symptoms,
    species,
    affected_count: count,
    details,
    original_sms: smsText,
  };
};

describe('SMS Code Parser (parseSmsCode)', () => {
  test('parses a complete valid SMS correctly', () => {
    const result = parseSmsCode('MAL*YAOUNDE*FI,VO,DI*HUM*5*Cas groupes marche central');
    expect(result).not.toBeNull();
    expect(result.event_type).toBe('Maladie suspecte');
    expect(result.location).toBe('YAOUNDE');
    expect(result.symptoms).toBe('Fievre, Vomissements, Diarrhee');
    expect(result.species).toBe('Humain');
    expect(result.affected_count).toBe(5);
    expect(result.details).toBe('Cas groupes marche central');
    expect(result.original_sms).toBe('MAL*YAOUNDE*FI,VO,DI*HUM*5*Cas groupes marche central');
  });

  test('parses all event codes correctly', () => {
    const events = {
      'MAL': 'Maladie suspecte',
      'MOR': 'Mortalite anormale',
      'EPI': 'Epidemie suspectee',
      'ZOO': 'Zoonose suspectee',
      'INT': 'Intoxication',
      'ENV': 'Evenement environnemental',
    };
    for (const [code, label] of Object.entries(events)) {
      const result = parseSmsCode(`${code}*LOC*FI*HUM`);
      expect(result.event_type).toBe(label);
    }
  });

  test('parses all species codes correctly', () => {
    const species = {
      'HUM': 'Humain', 'BOV': 'Bovin', 'VOL': 'Volaille',
      'POR': 'Porcin', 'SAU': 'Faune sauvage',
    };
    for (const [code, label] of Object.entries(species)) {
      const result = parseSmsCode(`MAL*LOC*FI*${code}`);
      expect(result.species).toBe(label);
    }
  });

  test('handles unknown species code as-is', () => {
    const result = parseSmsCode('MAL*LOC*FI*ELEPHANT');
    expect(result.species).toBe('ELEPHANT');
  });

  test('handles unknown event code as-is', () => {
    const result = parseSmsCode('XXX*LOC*FI*HUM');
    expect(result.event_type).toBe('XXX');
  });

  test('handles multiple symptoms', () => {
    const result = parseSmsCode('MAL*LOC*FI,TO,HE*HUM');
    expect(result.symptoms).toBe('Fievre, Toux, Hemorragie');
  });

  test('handles unknown symptom codes as-is', () => {
    const result = parseSmsCode('MAL*LOC*FI,INCONNU*HUM');
    expect(result.symptoms).toBe('Fievre, INCONNU');
  });

  test('returns null for SMS with less than 4 parts', () => {
    expect(parseSmsCode('MAL*LOC')).toBeNull();
    expect(parseSmsCode('MAL*LOC*FI')).toBeNull();
    expect(parseSmsCode('HELLO')).toBeNull();
    expect(parseSmsCode('')).toBeNull();
  });

  test('handles SMS without count and details (minimum 4 parts)', () => {
    const result = parseSmsCode('MOR*DOUALA*MO*VOL');
    expect(result).not.toBeNull();
    expect(result.event_type).toBe('Mortalite anormale');
    expect(result.location).toBe('DOUALA');
    expect(result.species).toBe('Volaille');
    expect(result.affected_count).toBeNull();
    expect(result.details).toBe('');
  });

  test('is case-insensitive for codes', () => {
    const result = parseSmsCode('mal*yaounde*fi,vo*hum*3');
    expect(result.event_type).toBe('Maladie suspecte');
    expect(result.symptoms).toBe('Fievre, Vomissements');
    expect(result.species).toBe('Humain');
  });

  test('parses count as integer', () => {
    const result = parseSmsCode('MAL*LOC*FI*HUM*123');
    expect(result.affected_count).toBe(123);
    expect(typeof result.affected_count).toBe('number');
  });

  test('handles non-numeric count gracefully', () => {
    const result = parseSmsCode('MAL*LOC*FI*HUM*abc');
    expect(result.affected_count).toBeNaN();
  });
});

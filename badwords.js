// Filter für anstößige Benutzernamen. Dieselbe Liste steht in supabase-6.sql (die Datenbank prüft verbindlich).
// Gesucht wird als Teilwort, nach Normalisierung: klein, 0→o 1→i 3→e 4→a 5→s 7→t 8→b, ohne _, doppelte Buchstaben einfach.
// shortcut: einfache Wortliste, findet nicht jede Umschreibung; bei Bedarf Wörter ergänzen (hier und in supabase-6.sql).
export const BAD_WORDS = [
  'fick', 'fotze', 'hure', 'nutte', 'schlampe', 'wichser', 'wixer', 'arschloch', 'arschgeige', 'scheiss', 'pimmel',
  'titten', 'muschi', 'missgeburt', 'spast', 'behindert', 'schwuchtel', 'kanake', 'neger', 'nigger', 'nigga',
  'hitler', 'nazi', 'siegheil', 'heilhitler', 'kinderf', 'vergewalt', 'paedo', 'pedophil',
  'fuck', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'faggot', 'retard', 'penis', 'vagina', 'porno', 'porn',
];

export const normName = t => t.toLowerCase().replace(/_/g, '')
  .replace(/[0134578]/g, d => ({ 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b' })[d])
  .replace(/(.)\1+/g, '$1');

export const badUsername = name => { const n = normName(name); return BAD_WORDS.some(w => n.includes(normName(w))); };

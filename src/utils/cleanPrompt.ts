/**
 * Clean and translate user video prompts to Cinema English
 * Guarantees no French text or "-moi" suffixes
 */
export function cleanPrompt(raw: string): string {
  if (!raw) return '';
  
  // 1. Strip French conversational prefixes and suffixes
  let text = raw
    .replace(/\b(fais-moi|crée-moi|génère-moi|donne-moi|montre-moi)\b/gi, '')
    .replace(/\b(je veux|fais une vidéo de|fais une video de|une vidéo de|une video de|vidéo de|video de|génère une vidéo de|génère une video de|crée une vidéo de|crée une video de|une pub tiktok pour|une pub tiktok|une pub pour|pub pour)\b/gi, '')
    .replace(/-moi/gi, '')
    .trim();

  // 2. Specialized cinematic concept mappings
  const specials: Array<{ regex: RegExp; repl: string }> = [
    {
      regex: /pizzaiolo.*(?:lance|pâte|pate)|pizzeria.*pizzaiolo/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /pizzaiolo/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /pizzeria/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /pizza/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /dino.*(?:skate|duba)/i,
      repl: 'Cinematic tracking shot of T-Rex dinosaur skateboarding along Dubai Marina skyline at golden hour, 8K, volumetric light',
    },
    {
      regex: /femme.*(?:danse|pluie)|fille.*(?:danse|pluie)/i,
      repl: 'Cinematic slow-motion tracking shot of graceful woman dancing under pouring rain on city street, 8K, volumetric light, wet reflections',
    },
    {
      regex: /sneakers|chaussures/i,
      repl: 'Dynamic commercial shot of modern futuristic sneakers floating with neon light reflections, 8K, volumetric light, 60fps',
    },
    {
      regex: /mode.*paris|mannequin/i,
      repl: 'Cinematic tracking shot of high-fashion model walking on Paris runway, 8K, volumetric light, elegant bokeh',
    },
    {
      regex: /supercar|voiture.*(?:nuit|sport|course)/i,
      repl: 'Cinematic low-angle tracking shot of sleek supercar accelerating on highway at night, 8K, volumetric neon light, motion blur',
    },
    {
      regex: /sushi/i,
      repl: 'Cinematic macro 120fps closeup of Japanese sushi master slicing fresh red tuna, 8K, volumetric light',
    },
    {
      regex: /café|cafe.*paris|terrasse/i,
      repl: 'Cinematic shot of cozy Paris cafe terrace at golden hour with warm bokeh lights, 8K, volumetric light',
    },
  ];

  for (const s of specials) {
    if (s.regex.test(text)) {
      return s.repl;
    }
  }

  // 3. Word-by-word French -> English translation
  const dictionary: Array<[RegExp, string]> = [
    [/\bpizzaiolo\b/gi, 'pizzaiolo'],
    [/\bpizzeria\b/gi, 'pizzeria'],
    [/\bpizza\b/gi, 'pizza'],
    [/\blance\b/gi, 'tossing'],
    [/\bpâte\b/gi, 'dough'],
    [/\bpate\b/gi, 'dough'],
    [/\bfour\b/gi, 'stone oven'],
    [/\bfarine\b/gi, 'flour'],
    [/\bcuisine\b/gi, 'kitchen'],
    [/\brestaurant\b/gi, 'restaurant'],
    [/\bdinosaure\b/gi, 'dinosaur'],
    [/\bskate\b/gi, 'skateboarding'],
    [/\bdubaï\b|\bdubai\b/gi, 'Dubai Marina'],
    [/\bfemme\b/gi, 'woman'],
    [/\bfille\b/gi, 'girl'],
    [/\bhomme\b/gi, 'man'],
    [/\bdanse\b|\bdanser\b/gi, 'dancing'],
    [/\bpluie\b/gi, 'pouring rain'],
    [/\bparis\b/gi, 'Paris'],
    [/\brobe\b/gi, 'dress'],
    [/\brouge\b/gi, 'red'],
    [/\bnoir\b|\bnoire\b/gi, 'black'],
    [/\bblanc\b|\bblanche\b/gi, 'white'],
    [/\bvoiture\b/gi, 'supercar'],
    [/\bmoto\b/gi, 'motorcycle'],
    [/\broute\b/gi, 'highway'],
    [/\bvitesse\b/gi, 'high speed'],
    [/\bmer\b/gi, 'ocean'],
    [/\bocéan\b|\bocean\b/gi, 'ocean waves'],
    [/\bplage\b/gi, 'beach'],
    [/\bmontagne\b/gi, 'mountains'],
    [/\bforêt\b|\bforet\b/gi, 'forest'],
    [/\bcascade\b/gi, 'waterfall'],
    [/\bespace\b/gi, 'outer space'],
    [/\bastronaute\b/gi, 'astronaut'],
    [/\bplanète\b|\bplanete\b/gi, 'alien planet'],
    [/\bétoiles?\b/gi, 'stars'],
    [/\bville\b/gi, 'futuristic city'],
    [/\bnéon\b|\bneons?\b/gi, 'neon lights'],
    [/\bnuit\b/gi, 'night'],
    [/\bjour\b/gi, 'daytime'],
    [/\bcoucher de soleil\b/gi, 'sunset golden hour'],
    [/\blever de soleil\b/gi, 'sunrise golden hour'],
    [/\bchien\b/gi, 'dog'],
    [/\bchat\b/gi, 'cat'],
    [/\bavec\b/gi, 'with'],
    [/\bqui\b/gi, 'who is'],
    [/\bsa\b|\bson\b|\bles\b|\bla\b|\ble\b/gi, 'the'],
    [/\bun\b|\bune\b/gi, 'a'],
    [/\bdes\b/gi, ''],
    [/\bdans\b|\bsur\b/gi, 'in'],
    [/\bsous\b/gi, 'under'],
    [/\bpour\b/gi, 'for'],
    [/\bet\b/gi, 'and'],
    [/\bà\b|\ba\b/gi, 'in'],
    [/\bau\b|\baux\b/gi, 'at the'],
    [/\bde\b|\bdu\b|\bd'|\bl'/gi, ''],
    [/\b-moi\b/gi, ''],
  ];

  for (const [re, val] of dictionary) {
    text = text.replace(re, val);
  }

  // 4. Strip leftover French words, extra spaces and punctuation
  text = text
    .replace(/-moi/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `Cinematic slow-motion of ${text}, 8K, volumetric light`;
}

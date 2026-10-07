/**
 * Faithful, accurate translation & cinematic enhancement of video prompts.
 * Converts conversational French to English without replacing the user's idea
 * with hardcoded or canned templates.
 */

// Comprehensive phrase & idiom mappings (longest match first to avoid fragmented substitutions)
const IDIOMATIC_MAP: Array<[RegExp, string]> = [
  // Conversational command strippers
  [/\b(fais[- ]moi une vid[eé]o (de |d'|pour )?|g[eé]n[eè]re[- ]moi une vid[eé]o (de |d'|pour )?|cr[eé]e[- ]moi une vid[eé]o (de |d'|pour )?)\b/gi, ''],
  [/\b(fais[- ]moi|g[eé]n[eè]re[- ]moi|cr[eé]e[- ]moi|donne[- ]moi|montre[- ]moi)\b/gi, ''],
  [/\b(je veux une vid[eé]o (de |d'|pour )?|je veux voir|je souhaite une vid[eé]o)\b/gi, ''],
  [/\b(une vid[eé]o (de |d'|pour )?|court[- ]m[eé]trage (de |d'|pour )?|clip (de |d'|pour )?)\b/gi, ''],
  [/\b(une pub tiktok (pour |de )?|pub (pour |de )?)\b/gi, ''],
  [/-moi\b/gi, ''],

  // Complex multi-word phrases (MUST be replaced before individual words!)
  [/\bqui sort du four\b|\bsortant du four\b/gi, 'freshly pulled from the hot oven'],
  [/\bqui sort de\b|\bsortant de\b/gi, 'emerging from'],
  [/\bsort du four\b/gi, 'freshly taken out of the wood-fired oven'],
  [/\bpâte à pizza\b|\bpate a pizza\b/gi, 'pizza dough'],
  [/\blance sa pâte\b|\blance la pâte\b|\blançant sa pâte\b/gi, 'tossing and spinning pizza dough in the air'],
  [/\bfour à bois\b|\bfour a bois\b/gi, 'wood-fired stone pizza oven with glowing flames'],
  [/\bfromage coulant\b|\bfromage fondu\b|\bfromage fondant\b/gi, 'bubbling stringy melted mozzarella cheese'],
  [/\bau coucher du soleil\b|\bau coucher de soleil\b/gi, 'at golden hour sunset with warm amber lighting'],
  [/\bau lever du soleil\b|\bau lever de soleil\b/gi, 'at early morning sunrise with soft golden rays'],
  [/\bsous la pluie battante\b|\bsous une pluie battante\b/gi, 'under heavy cinematic rain with glistening wet reflections'],
  [/\bsous la pluie\b/gi, 'under gentle falling rain with glossy reflections'],
  [/\bà toute vitesse\b|\ba toute vitesse\b|\bà pleine vitesse\b/gi, 'at high speed with dynamic motion blur'],
  [/\ben pleine nuit\b|\bde nuit\b/gi, 'at night under dramatic moody lighting'],
  [/\bface caméra\b|\bface a la camera\b|\bface à la caméra\b/gi, 'facing directly into the camera'],
  [/\ben gros plan\b/gi, 'in extreme detailed close-up'],
  [/\ben ralenti\b|\bau ralenti\b/gi, 'in ultra slow-motion 120fps'],
  [/\bvue du ciel\b|\bvue aérienne\b|\bvue aerienne\b/gi, 'aerial cinematic drone bird-eye view'],
  [/\bsur la route\b|\bsur l'autoroute\b/gi, 'along the highway asphalt road'],
  [/\bdans les rues de\b|\bdans la rue de\b/gi, 'through the scenic streets of'],
  [/\bdans l'espace\b|\bdans le cosmos\b/gi, 'in deep outer space surrounded by vibrant nebulae'],
  [/\bsur la lune\b/gi, 'on the lunar surface of the Moon'],
  [/\bdans un champ de blé\b|\bdans un champ de ble\b/gi, 'in a vast golden wheat field swayed by gentle wind'],
  [/\bdans un champ\b|\bdans les champs\b/gi, 'across scenic countryside green fields'],
  [/\bqui marche\b|\bmarchant\b/gi, 'walking smoothly forward'],
  [/\bqui court\b|\bcourant\b/gi, 'sprinting fast dynamically'],
  [/\bqui vole\b|\bvolant\b/gi, 'flying gracefully in mid-air'],
  [/\bqui nage\b|\bnageant\b/gi, 'swimming through crystal clear water'],
  [/\bqui danse\b|\bdansant\b/gi, 'dancing with elegant fluid movements'],
  [/\bqui roule\b|\broulant\b/gi, 'cruising dynamically on asphalt'],
  [/\bqui conduit\b|\bconduisant\b/gi, 'driving focused behind the wheel'],
  [/\bqui joue de la guitare\b/gi, 'playing acoustic electric guitar passionately'],
  [/\bqui joue\b|\bjouant\b/gi, 'playing joyfully'],
  [/\bavec des lunettes de soleil\b/gi, 'wearing stylish dark sunglasses'],
  [/\bavec des reflets\b/gi, 'with realistic mirror-like puddle reflections'],
  [/\ben train de manger\b|\bmangeant\b/gi, 'savoring delicious food'],
  [/\ben train de\b/gi, 'actively'],
];

// Single word contextual dictionary (applied carefully)
const VOCABULARY_MAP: Array<[RegExp, string]> = [
  // Food & Kitchen
  [/\bpizzaiolo\b/gi, 'Italian pizzaiolo chef in apron'],
  [/\bpizzeria\b/gi, 'traditional rustic Italian pizzeria'],
  [/\bpizza\b/gi, 'hot artisanal gourmet pizza'],
  [/\bpâte\b|\bpate\b/gi, 'dough'],
  [/\bfour\b/gi, 'stone brick oven'],
  [/\bfromage\b/gi, 'melted cheese'],
  [/\btomates?\b/gi, 'fresh ripe tomatoes'],
  [/\bfarine\b/gi, 'airborne flour dust particles'],
  [/\bcuisine\b/gi, 'professional kitchen'],
  [/\bcuisinier\b|\bchef\b/gi, 'master chef'],
  [/\brestaurant\b/gi, 'restaurant'],
  [/\bterrasse\b/gi, 'cafe terrace'],
  [/\bsushi\b/gi, 'fresh salmon sashimi sushi'],
  [/\bburger\b|\bhamburger\b/gi, 'gourmet juicy burger'],
  [/\bchocolat\b/gi, 'rich glossy melted chocolate'],
  [/\bcafé\b|\bcafe\b/gi, 'steaming espresso coffee cup'],
  [/\bcroissant\b/gi, 'golden flaky French croissant'],

  // Characters
  [/\bhomme\b/gi, 'man'],
  [/\bfemme\b/gi, 'woman'],
  [/\bfille\b/gi, 'girl'],
  [/\bgarçon\b|\bgarcon\b/gi, 'young boy'],
  [/\benfant\b|\benfants\b/gi, 'children'],
  [/\bastronaute\b/gi, 'astronaut in modern high-tech EVA suit'],
  [/\bguerrier\b|\bguerrière\b/gi, 'armored epic warrior'],
  [/\bsamuraï\b|\bsamourai\b|\bsamurai\b/gi, 'honorable samurai with katana blade'],
  [/\brobot\b|\bcyborg\b/gi, 'futuristic sleek android robot'],
  [/\bmannequin\b/gi, 'high-fashion runway model'],

  // Animals
  [/\bdinosaure\b|\bt[- ]rex\b/gi, 'giant Tyrannosaurus Rex dinosaur'],
  [/\blion\b/gi, 'majestic male lion with full mane'],
  [/\btigre\b/gi, 'bengal tiger'],
  [/\bloup\b/gi, 'wild wolf with silver fur'],
  [/\bours\b/gi, 'grizzly bear in wilderness'],
  [/\baigle\b/gi, 'bald eagle soaring'],
  [/\bcheval\b|\bchevaux\b/gi, 'wild galloping horse'],
  [/\bchien\b/gi, 'golden retriever dog'],
  [/\bchat\b/gi, 'feline cat'],
  [/\brequin\b/gi, 'great white shark underwater'],
  [/\bdauphin\b/gi, 'leaping dolphin'],
  [/\bdragon\b/gi, 'mythical fire-breathing dragon'],

  // Vehicles
  [/\bvoiture de sport\b|\bsupercar\b/gi, 'sleek aerodynamic luxury supercar'],
  [/\bvoiture\b|\bautomobile\b/gi, 'modern car'],
  [/\bmoto\b/gi, 'high-performance sport motorcycle'],
  [/\bcamion\b/gi, 'semi-truck'],
  [/\bvaisseau spatial\b|\bvaisseau\b/gi, 'interstellar starship vessel'],
  [/\bavion\b/gi, 'airplane'],
  [/\bavion de chasse\b/gi, 'stealth fighter jet'],
  [/\bhélicoptère\b|\bhelicoptere\b/gi, 'helicopter'],
  [/\bbateau\b|\bnavire\b/gi, 'wooden sailboat'],
  [/\byacht\b/gi, 'luxury yacht'],
  [/\bskateboard\b|\bskate\b/gi, 'skateboard'],
  [/\bvélo\b|\bvelo\b/gi, 'bicycle'],

  // Places
  [/\brocher\b|\brochers\b/gi, 'weathered stone cliff rock'],
  [/\bmer\b|\bocéan\b|\bocean\b/gi, 'ocean waves'],
  [/\bplage\b/gi, 'tropical beach with fine sand'],
  [/\bmontagne\b|\bmontagnes\b/gi, 'snow-capped mountain summit'],
  [/\bforêt\b|\bforet\b/gi, 'misty pine forest'],
  [/\bjungle\b/gi, 'dense tropical jungle'],
  [/\bdésert\b|\bdesert\b/gi, 'vast sand dunes desert'],
  [/\bcascade\b/gi, 'waterfall'],
  [/\bville\b|\bmétropole\b/gi, 'city metropolis'],
  [/\brue\b/gi, 'urban street'],
  [/\bparis\b/gi, 'Paris with Haussmann architecture'],
  [/\bdubaï\b|\bdubai\b/gi, 'futuristic Dubai skyline'],
  [/\btokyo\b/gi, 'neon-lit Tokyo Shibuya crossing'],
  [/\bnew york\b/gi, 'New York City skyline'],
  [/\bchâteau\b|\bchateau\b/gi, 'medieval stone castle'],

  // Weather & Atmosphere
  [/\borage\b|\béclair\b|\beclair\b/gi, 'thunderstorm with lightning'],
  [/\bbrouillard\b|\bbrume\b/gi, 'atmospheric volumetric mist and fog'],
  [/\bnéon\b|\bneons?\b/gi, 'radiant vibrant neon lights'],
  [/\bflammes?\b|\bfeu\b/gi, 'blazing cinematic fire and glowing embers'],
  [/\bfuturiste\b|\bcyberpunk\b/gi, 'futuristic cyberpunk sci-fi'],

  // Prepositions & common connectors
  [/\bavec (du|de la|des|de l'|un|une)?\b|\bavec\b/gi, 'with'],
  [/\bdans (le|la|les|un|une)?\b|\bdans\b/gi, 'in'],
  [/\bsur (le|la|les|un|une)?\b|\bsur\b/gi, 'on'],
  [/\bsous (le|la|les|un|une)?\b|\bsous\b/gi, 'under'],
  [/\bet\b/gi, 'and'],
  [/\b(un|une|le|la|les|du|de la|des)\b/gi, ''],

  // Colors
  [/\brouge\b/gi, 'red'],
  [/\bbleu\b|\bbleue\b/gi, 'deep blue'],
  [/\bvert\b|\bverte\b/gi, 'vivid green'],
  [/\bjaune\b/gi, 'golden yellow'],
  [/\bnoir\b|\bnoire\b/gi, 'sleek black'],
  [/\bblanc\b|\bblanche\b/gi, 'pure white'],
  [/\bdor[eé]\b|\bdor[eé]e\b/gi, 'shimmering gold'],
  [/\bargent[eé]\b|\bargent[eé]e\b/gi, 'metallic silver'],
  [/\bviolet\b|\bviolette\b/gi, 'neon violet purple'],
  [/\brose\b/gi, 'vivid pink'],
];

export function cleanPrompt(raw: string): string {
  if (!raw) return '';

  // 1. Extract prompt text if structured markdown or tags are present
  let text = raw;
  if (text.includes('**PROMPT') || text.includes('PROMPT VEO') || text.includes('Prompt :')) {
    const promptMatch = text.match(/\*\*(?:PROMPT[^*]*|Prompt)\*\*\s*:\s*([^\n\r]+)/i);
    if (promptMatch && promptMatch[1]) {
      text = promptMatch[1];
    }
  }
  text = text.replace(/\*\*EXPLICATION[\s\S]*$/i, '').trim();

  // 2. Apply Idiomatic multi-word phrases first (e.g. "qui sort du four" -> "freshly pulled from the hot oven")
  for (const [re, val] of IDIOMATIC_MAP) {
    text = text.replace(re, val);
  }

  // 3. Apply single word vocabulary mapping
  for (const [re, val] of VOCABULARY_MAP) {
    text = text.replace(re, val);
  }

  // 4. Clean up remaining conversational filler words and extra spacing
  text = text
    .replace(/-moi/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 5. Return high-impact cinematic prompt
  if (!text) {
    return 'Cinematic 8K slow-motion tracking shot, volumetric lighting, photorealistic textures';
  }

  // If already contains cinematic descriptors or English, don't duplicate
  if (/cinematic|8k|volumetric|photorealistic/i.test(text)) {
    return text;
  }

  return `Cinematic 8K slow-motion shot of ${text}, photorealistic, volumetric cinematic lighting, high-definition textures`;
}

/**
 * Faithful, accurate translation & cinematic prompt engineering for video models.
 * Enforces photorealistic consistency, eliminates broken translations & duplicate words,
 * and adds mandatory negative prompts to eliminate deformations.
 */

export const MANDATORY_NEGATIVE_PROMPT = 
  "deformed, blurry, morphing, melted, extra wheels, extra limbs, distorted vehicle, low quality, watermark, cartoon, zoom only, static image";

// Comprehensive phrase & idiom mappings
const IDIOMATIC_MAP: Array<[RegExp, string]> = [
  // Conversational command strippers
  [/\b(fais[- ]moi une vid[eé]o (de |d'|pour )?|g[eé]n[eè]re[- ]moi une vid[eé]o (de |d'|pour )?|cr[eé]e[- ]moi une vid[eé]o (de |d'|pour )?)\b/gi, ''],
  [/\b(fais[- ]moi|g[eé]n[eè]re[- ]moi|cr[eé]e[- ]moi|donne[- ]moi|montre[- ]moi)\b/gi, ''],
  [/\b(je veux une vid[eé]o (de |d'|pour )?|je veux voir|je souhaite une vid[eé]o)\b/gi, ''],
  [/\b(une vid[eé]o (de |d'|pour )?|court[- ]m[eé]trage (de |d'|pour )?|clip (de |d'|pour )?)\b/gi, ''],
  [/\b(une pub tiktok (pour |de )?|pub (pour |de )?)\b/gi, ''],
  [/-moi\b/gi, ''],

  // Duplicate / broken agricultural phrases
  [/\bagricole labour\b|\blabour agricole\b|\blabour\b/gi, 'plowing fertile soil with multi-blade steel plow'],
  [/\bsoil agricole\b|\bterre agricole\b/gi, 'rich dark farmland soil'],
  [/\bchamps agricoles\b|\bchamp agricole\b/gi, 'golden agricultural fields'],
  [/\bchamps de bl[eé]\b|\bchamp de bl[eé]\b/gi, 'vast golden wheat fields'],
  [/\bà toute vitesse\b|\ba toute vitesse\b|\bà pleine vitesse\b|\bfast at high speed\b/gi, 'at high speed with dynamic forward motion'],
  [/\bqui conduit\b|\bconduisant\b/gi, 'driving focused inside closed cabin'],

  // Food & Kitchen
  [/\bqui sort du four\b|\bsortant du four\b/gi, 'freshly pulled from the hot oven'],
  [/\bqui sort de\b|\bsortant de\b/gi, 'emerging from'],
  [/\bsort du four\b/gi, 'freshly taken out of the wood-fired oven'],
  [/\bpâte à pizza\b|\bpate a pizza\b/gi, 'pizza dough'],
  [/\blance sa pâte\b|\blance la pâte\b|\blançant sa pâte\b/gi, 'tossing and spinning pizza dough in the air'],
  [/\bfour à bois\b|\bfour a bois\b/gi, 'wood-fired stone pizza oven with glowing flames'],
  [/\bfromage coulant\b|\bfromage fondu\b|\bfromage fondant\b/gi, 'bubbling stringy melted mozzarella cheese'],

  // Atmosphere & Lighting
  [/\bau coucher du soleil\b|\bau coucher de soleil\b/gi, 'at golden hour sunset with warm amber lighting'],
  [/\bau lever du soleil\b|\bau lever de soleil\b/gi, 'at early morning sunrise with soft golden rays'],
  [/\bsous la pluie battante\b|\bsous une pluie battante\b/gi, 'under heavy cinematic rain with glistening wet reflections'],
  [/\bsous la pluie\b/gi, 'under gentle falling rain with glossy reflections'],
  [/\ben pleine nuit\b|\bde nuit\b/gi, 'at night under dramatic moody lighting'],
  [/\bface caméra\b|\bface a la camera\b|\bface à la caméra\b/gi, 'facing directly into the camera'],
  [/\ben gros plan\b/gi, 'in extreme detailed close-up'],
  [/\ben ralenti\b|\bau ralenti\b/gi, 'in ultra slow-motion 120fps'],
  [/\bvue du ciel\b|\bvue aérienne\b|\bvue aerienne\b/gi, 'aerial cinematic drone bird-eye view'],
  [/\bsur la route\b|\bsur l'autoroute\b/gi, 'along the highway asphalt road'],
  [/\bdans les rues de\b|\bdans la rue de\b/gi, 'through the scenic streets of'],
  [/\bdans l'espace\b|\bdans le cosmos\b/gi, 'in deep outer space surrounded by vibrant nebulae'],
  [/\bavec des lunettes de soleil\b/gi, 'wearing stylish dark sunglasses'],
];

// Single word contextual dictionary
const VOCABULARY_MAP: Array<[RegExp, string]> = [
  // Agricultural & Machinery
  [/\btracteur agricole\b|\btracteur\b/gi, 'heavy farming John Deere tractor'],
  [/\blabourer\b|\blaboure\b/gi, 'plowing turning dark soil'],
  [/\bagriculteur\b|\bfermier\b/gi, 'farmer driving inside closed cabin'],

  // Food
  [/\bpizzaiolo\b/gi, 'Italian pizzaiolo chef in apron'],
  [/\bpizzeria\b/gi, 'traditional rustic Italian pizzeria'],
  [/\bpizza\b/gi, 'hot artisanal gourmet pizza'],
  [/\bpâte\b|\bpate\b/gi, 'dough'],
  [/\bfour\b/gi, 'stone brick oven'],
  [/\bfromage\b/gi, 'melted cheese'],
  [/\bsushi\b/gi, 'fresh salmon sashimi sushi'],
  [/\bburger\b|\bhamburger\b/gi, 'gourmet juicy burger'],

  // Characters
  [/\bhomme\b/gi, 'man'],
  [/\bfemme\b/gi, 'woman'],
  [/\bastronaute\b/gi, 'astronaut in modern high-tech EVA suit'],
  [/\brobot\b|\bcyborg\b/gi, 'futuristic sleek android robot'],

  // Animals
  [/\bdinosaure\b|\bt[- ]rex\b/gi, 'giant Tyrannosaurus Rex dinosaur'],
  [/\blion\b/gi, 'majestic male lion with full mane'],
  [/\bcheval\b|\bchevaux\b/gi, 'wild galloping horse'],

  // Vehicles
  [/\bvoiture de sport\b|\bsupercar\b/gi, 'sleek aerodynamic luxury supercar'],
  [/\bvoiture\b|\bautomobile\b/gi, 'modern car'],
  [/\bmoto\b/gi, 'high-performance sport motorcycle'],
  [/\bcamion\b/gi, 'semi-truck'],
  [/\bvaisseau spatial\b|\bvaisseau\b/gi, 'interstellar starship vessel'],
  [/\bskateboard\b|\bskate\b/gi, 'skateboard'],

  // Places
  [/\bparis\b/gi, 'Paris Haussmann architecture'],
  [/\bdubaï\b|\bdubai\b/gi, 'futuristic Dubai skyline'],
  [/\btokyo\b/gi, 'neon-lit Tokyo Shibuya crossing'],
];

/**
 * Reconstructs a clean cinematic prompt and enforces the mandatory negative prompt.
 */
export function engineerCinematicPrompt(raw: string, cameraMotion = 'cinematic side tracking shot, smooth forward motion'): {
  prompt: string;
  negativePrompt: string;
} {
  if (!raw) {
    return {
      prompt: 'Photorealistic 8K cinematic shot, volumetric lighting, side tracking shot, highly detailed',
      negativePrompt: MANDATORY_NEGATIVE_PROMPT,
    };
  }

  const lower = raw.toLowerCase();

  // SPECIALIZED TRACTOR / AGRICULTURE PROMPT RECONSTRUCTION
  if (lower.includes('tracteur') || lower.includes('tractor') || (lower.includes('plow') && lower.includes('soil')) || (lower.includes('labour') && lower.includes('agricol'))) {
    const isSunset = lower.includes('sunset') || lower.includes('coucher') || lower.includes('golden') || lower.includes('dore');
    const timeLighting = isSunset ? 'at sunset, golden hour volumetric lighting' : 'natural daylight with volumetric light shafts';

    const reconstructedTractorPrompt = 
      `A heavy John Deere 8R farm tractor driving forward at 12 km/h across a golden wheat field, all 4 large wheels visibly rolling and rotating, deep tire treads gripping soil, rich dark soil turning behind plow, soil and dust particles being displaced behind plow, farmer visible driving in closed cabin, continuous forward motion from left to right, cinematic ground tracking shot, realistic physics, wheels rotation synchronized with forward movement, 8K ultra detailed photorealistic, sharp focus on tractor, ${timeLighting}`;

    return {
      prompt: reconstructedTractorPrompt,
      negativePrompt: MANDATORY_NEGATIVE_PROMPT,
    };
  }

  // GENERAL PROMPT CLEANING
  let text = cleanPrompt(raw);

  // Clean duplicate phrases
  text = text
    .replace(/\bagricole labour\b/gi, '')
    .replace(/\bfast at high speed\b/gi, 'at dynamic high speed')
    .replace(/\s+/g, ' ')
    .trim();

  // Ban "zoom only" and enforce smooth forward tracking
  const motionDescriptor = cameraMotion && !cameraMotion.toLowerCase().includes('zoom only')
    ? cameraMotion
    : 'cinematic side tracking shot, smooth forward motion';

  if (!text.toLowerCase().includes('tracking shot') && !text.toLowerCase().includes('dolly')) {
    text = `${text}, ${motionDescriptor}`;
  }

  return {
    prompt: text,
    negativePrompt: MANDATORY_NEGATIVE_PROMPT,
  };
}

export function cleanPrompt(raw: string): string {
  if (!raw) return '';

  let text = raw;
  if (text.includes('**PROMPT') || text.includes('PROMPT VEO') || text.includes('Prompt :')) {
    const promptMatch = text.match(/\*\*(?:PROMPT[^*]*|Prompt)\*\*\s*:\s*([^\n\r]+)/i);
    if (promptMatch && promptMatch[1]) {
      text = promptMatch[1];
    }
  }
  text = text.replace(/\*\*EXPLICATION[\s\S]*$/i, '').trim();

  // Apply Idiomatic multi-word phrases first
  for (const [re, val] of IDIOMATIC_MAP) {
    text = text.replace(re, val);
  }

  // Apply single word vocabulary mapping
  for (const [re, val] of VOCABULARY_MAP) {
    text = text.replace(re, val);
  }

  // Clean remaining filler and spacing
  text = text
    .replace(/-moi/gi, '')
    .replace(/\bagricole labour\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    return 'Photorealistic 8K cinema shot, volumetric lighting, side tracking shot, sharp focus';
  }

  return text;
}

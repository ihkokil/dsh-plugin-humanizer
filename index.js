/**
 * dsh-plugin-humanizer
 * DeepSeek Harness Humanizer Plugin
 * 
 * Provides a `humanize_text` tool that rewrites AI-generated text to sound
 * natural, engaging, and human-like through a robust multi-pass engine:
 * 
 * - Pass 0: Code, URL, and Markdown syntax protection
 * - Pass 1: Sentence segmentation with abbreviation & decimal awareness
 * - Pass 2: Robotic transition softening & throat-clearing removal
 * - Pass 3: Randomized wave rewrite (macro variation)
 * - Pass 4: Inflected lexical audit (AI telltale buzzword elimination)
 * - Pass 5: Conversational contraction application
 * - Pass 6: Anti-AI punctuation & rhythm cleanup (em-dash & semicolon reduction)
 * - Pass 7: Syntax & formatting restoration
 */

// Plugin Identity for Cordis / DeepSeek Harness
export const name = 'dsh-plugin-humanizer';
export const inject = ['tools'];

// ============================================================================
// Lexical Dictionaries & Rule Sets
// ============================================================================

/**
 * Multi-word phrases replaced first to avoid awkward fragments
 * (e.g. "delve into" -> "dig into" prevents "dig into into").
 */
const PHRASE_REPLACEMENTS = [
  // Verb phrase inflections
  { pattern: /\bdelves into\b/gi, replacement: 'digs into' },
  { pattern: /\bdelving into\b/gi, replacement: 'digging into' },
  { pattern: /\bdelved into\b/gi, replacement: 'dug into' },
  { pattern: /\bdelve into\b/gi, replacement: 'dig into' },

  // Fluffy transitions & throat-clearing
  { pattern: /\bit is important to note that\b/gi, replacement: 'note that' },
  { pattern: /\bit should be noted that\b/gi, replacement: 'note that' },
  { pattern: /\bit is worth noting that\b/gi, replacement: 'notably,' },
  { pattern: /\bplease note that\b/gi, replacement: 'note that' },
  { pattern: /\bneedless to say,?\b/gi, replacement: 'clearly,' },
  { pattern: /\bin order to\b/gi, replacement: 'to' },
  { pattern: /\bat this point in time\b/gi, replacement: 'right now' },
  { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
  { pattern: /\bfor the purpose of\b/gi, replacement: 'to' },
  { pattern: /\bin the event that\b/gi, replacement: 'if' },
  { pattern: /\bwith regard to\b/gi, replacement: 'about' },
  { pattern: /\bin terms of\b/gi, replacement: 'for' },
  { pattern: /\ba plethora of\b/gi, replacement: 'plenty of' },
  { pattern: /\ba myriad of\b/gi, replacement: 'lots of' },
  { pattern: /\bparadigm shift\b/gi, replacement: 'major shift' },
  { pattern: /\btestament to\b/gi, replacement: 'proof of' },
  { pattern: /\bbeacon of\b/gi, replacement: 'guide for' },
  { pattern: /\bsymphony of\b/gi, replacement: 'blend of' },
  { pattern: /\btapestry of\b/gi, replacement: 'mix of' },
  { pattern: /\bgame[- ]changer\b/gi, replacement: 'big shift' },
  { pattern: /\bstate[- ]of[- ]the[- ]art\b/gi, replacement: 'modern' },
  { pattern: /\bcutting[- ]edge\b/gi, replacement: 'latest' },
  { pattern: /\bbest[- ]in[- ]class\b/gi, replacement: 'top-tier' },
  { pattern: /\bworld[- ]class\b/gi, replacement: 'top' }
];

/**
 * Word-level replacements (inflected to preserve grammatical agreement)
 */
const WORD_REPLACEMENTS = {
  // Common AI buzzwords
  'delve': 'dig into',
  'delves': 'digs into',
  'delving': 'digging into',
  'delved': 'dug into',

  'utilize': 'use',
  'utilizes': 'uses',
  'utilizing': 'using',
  'utilized': 'used',
  'utilization': 'use',

  'leverage': 'use',
  'leverages': 'uses',
  'leveraging': 'using',
  'leveraged': 'used',

  'foster': 'build',
  'fosters': 'builds',
  'fostering': 'building',
  'fostered': 'built',

  'underscore': 'highlight',
  'underscores': 'highlights',
  'underscoring': 'highlighting',
  'underscored': 'highlighted',

  'unleash': 'release',
  'unleashes': 'releases',
  'unleashing': 'releasing',
  'unleashed': 'released',

  'unlock': 'open',
  'unlocks': 'opens',
  'unlocking': 'opening',
  'unlocked': 'opened',

  'elevate': 'raise',
  'elevates': 'raises',
  'elevating': 'raising',
  'elevated': 'raised',

  'revolutionize': 'change',
  'revolutionizes': 'changes',
  'revolutionizing': 'changing',
  'revolutionized': 'changed',

  'commence': 'start',
  'commences': 'starts',
  'commencing': 'starting',
  'commenced': 'started',

  'terminate': 'end',
  'terminates': 'ends',
  'terminating': 'ending',
  'terminated': 'ended',

  'facilitate': 'help',
  'facilitates': 'helps',
  'facilitating': 'helping',
  'facilitated': 'helped',

  'navigating': 'handling',
  'navigate': 'handle',
  'navigates': 'handles',
  'navigated': 'handled',

  // Stiff AI adjectives & nouns
  'tapestry': 'mix',
  'testament': 'proof',
  'landscape': 'scene',
  'realm': 'area',
  'beacon': 'guide',
  'symphony': 'blend',
  'crucial': 'key',
  'vital': 'essential',
  'paramount': 'top',
  'imperative': 'essential',
  'indispensable': 'essential',
  'pivotal': 'key',
  'cornerstone': 'foundation',
  'bedrock': 'foundation',
  'unprecedented': 'new',
  'transformative': 'major',
  'paradigm': 'model',
  'holistic': 'complete',
  'synergy': 'teamwork',
  'robust': 'strong',
  'seamless': 'smooth',
  'seamlessly': 'smoothly',
  'myriad': 'many',

  // Stiff connectors
  'furthermore': 'also',
  'moreover': 'plus',
  'additionally': 'also',
  'consequently': 'so',
  'subsequently': 'then'
};

/**
 * Sentence-initial transition replacements
 */
const TRANSITION_REPLACEMENTS = [
  { regex: /^Furthermore,\s*/i, casual: 'Plus, ' },
  { regex: /^Moreover,\s*/i, casual: 'On top of that, ' },
  { regex: /^Additionally,\s*/i, casual: 'Also, ' },
  { regex: /^In addition,\s*/i, casual: 'Also, ' },
  { regex: /^Consequently,\s*/i, casual: 'So, ' },
  { regex: /^Therefore,\s*/i, casual: 'So, ' },
  { regex: /^However,\s*/i, casual: 'Still, ' },
  { regex: /^Nevertheless,\s*/i, casual: 'Even so, ' },
  { regex: /^Nonetheless,\s*/i, casual: 'Still, ' },
  { regex: /^In conclusion,\s*/i, casual: 'All in all, ' },
  { regex: /^To summarize,\s*/i, casual: 'In short, ' },
  { regex: /^In summary,\s*/i, casual: 'In short, ' },
  { regex: /^Ultimately,\s*/i, casual: 'In the end, ' }
];

/**
 * Conversational Contractions mapping
 */
const CONTRACTIONS = {
  'do not': "don't",
  'does not': "doesn't",
  'did not': "didn't",
  'cannot': "can't",
  'could not': "couldn't",
  'should not': "shouldn't",
  'would not': "wouldn't",
  'will not': "won't",
  'is not': "isn't",
  'are not': "aren't",
  'was not': "wasn't",
  'were not': "weren't",
  'have not': "haven't",
  'has not': "hasn't",
  'had not': "hadn't",
  'it is': "it's",
  'that is': "that's",
  'there is': "there's",
  'what is': "what's",
  'who is': "who's",
  'where is': "where's",
  'how is': "how's",
  'we are': "we're",
  'they are': "they're",
  'you are': "you're",
  'i am': "I'm",
  'i have': "I've",
  'you have': "you've",
  'we have': "we've",
  'they have': "they've",
  'i will': "I'll",
  'you will': "you'll",
  'we will': "we'll",
  'they will': "they'll",
  'i would': "I'd",
  'you would': "you'd",
  'we would': "we'd",
  'they would': "they'd"
};

// ============================================================================
// Protection Utilities (Code blocks, URLs, and Markdown)
// ============================================================================

/**
 * Replaces non-prose elements (code, urls, markdown links) with safe placeholders
 */
function protectNonProse(text) {
  const protectedItems = [];
  let protectedText = text;

  const stash = (match) => {
    const placeholder = `__DSH_HUMANIZER_SAFE_${protectedItems.length}__`;
    protectedItems.push(match);
    return placeholder;
  };

  // 1. Fenced code blocks (```...```)
  protectedText = protectedText.replace(/```[\s\S]*?```/g, stash);

  // 2. Inline code (`...`)
  protectedText = protectedText.replace(/`[^`\n]+`/g, stash);

  // 3. Raw URLs and Email addresses
  protectedText = protectedText.replace(/\bhttps?:\/\/[^\s)\]]+/gi, stash);
  protectedText = protectedText.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, stash);

  // 4. Markdown links: protect destination URL only, leave label readable
  protectedText = protectedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const urlPlaceholder = stash(url);
    return `[${label}](${urlPlaceholder})`;
  });

  return { protectedText, protectedItems };
}

/**
 * Restores stashed non-prose elements back into text
 */
function restoreNonProse(text, protectedItems) {
  let restored = text;
  for (let i = 0; i < protectedItems.length; i++) {
    const placeholder = `__DSH_HUMANIZER_SAFE_${i}__`;
    restored = restored.replaceAll(placeholder, () => protectedItems[i]);
  }
  return restored;
}

// ============================================================================
// Sentence Tokenization & Casing Helpers
// ============================================================================

/**
 * Splits text into sentences without breaking on abbreviations, decimals, or newlines.
 */
function splitSentences(text) {
  if (!text || typeof text !== 'string') return [];

  // Protect common abbreviations before splitting
  const abbrList = ['e.g.', 'i.e.', 'etc.', 'vs.', 'Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Inc.', 'Ltd.', 'Co.', 'U.S.', 'approx.'];
  let masked = text;
  const masks = [];

  abbrList.forEach((abbr, idx) => {
    const pattern = new RegExp(`\\b${escapeRegExp(abbr)}`, 'gi');
    masked = masked.replace(pattern, (match) => {
      const token = `__ABBR_${idx}_${masks.length}__`;
      masks.push({ token, match });
      return token;
    });
  });

  // Protect decimals (e.g. 3.14)
  masked = masked.replace(/(\d+)\.(\d+)/g, (_m, a, b) => {
    const token = `__DEC_${a}_${b}__`;
    masks.push({ token, match: `${a}.${b}` });
    return token;
  });

  // Match sentences ending in terminal punctuation followed by space/end, or trailing fragment
  const regex = /.*?[.!?]+(?=\s+|$)|.+$/gs;
  const matches = masked.match(regex);
  const rawSentences = matches ? matches.map(s => s.trim()).filter(s => s.length > 0) : [masked];

  // Restore masks
  return rawSentences.map(s => {
    let unmasked = s;
    for (let i = masks.length - 1; i >= 0; i--) {
      unmasked = unmasked.replaceAll(masks[i].token, masks[i].match);
    }
    return unmasked;
  });
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Preserves the casing pattern of the original word when replacing
 */
function applyCasing(original, replacement) {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

// ============================================================================
// Core Multi-Pass Humanization Engine
// ============================================================================

/**
 * Rewrites sentence transitions and removes robotic throat-clearing
 */
function rewriteSentenceTransitions(sentence, intensity) {
  let result = sentence.trim();

  // 1. Transition replacements
  for (const { regex, casual } of TRANSITION_REPLACEMENTS) {
    if (regex.test(result)) {
      result = result.replace(regex, casual);
      break;
    }
  }

  // 2. Intensity-based sentence start variations (strong only)
  if (intensity === 'strong' && Math.random() < 0.12) {
    const starters = ['And ', 'But ', 'So ', 'Plus '];
    const firstWordMatch = result.match(/^([A-Za-z]+)\b/);
    if (firstWordMatch) {
      const firstWord = firstWordMatch[1];
      const isProperNoun = /^(I|Google|DeepSeek|API|JSON|Windows|Linux|Mac)$/i.test(firstWord) ||
        (firstWord === firstWord.toUpperCase() && firstWord.length > 1);

      if (!/^(And|But|So|Plus|Look|Still|Note)/i.test(result)) {
        const starter = starters[Math.floor(Math.random() * starters.length)];
        const rest = isProperNoun
          ? result
          : result.charAt(0).toLowerCase() + result.slice(1);
        result = starter + rest;
      }
    }
  }

  return result;
}

/**
 * Applies wave rewrites across a paragraph's sentences
 */
function passWaveRewrite(sentences, intensity) {
  if (intensity === 'light' || sentences.length <= 1) {
    return sentences.map(s => rewriteSentenceTransitions(s, intensity));
  }

  const result = [];
  let i = 0;
  while (i < sentences.length) {
    const waveSize = intensity === 'strong'
      ? Math.floor(Math.random() * 3) + 1  // rewrite 1-3
      : Math.floor(Math.random() * 2) + 1; // rewrite 1-2

    const skipSize = intensity === 'strong' ? 1 : 2;

    for (let j = 0; j < waveSize && i < sentences.length; j++, i++) {
      result.push(rewriteSentenceTransitions(sentences[i], intensity));
    }
    for (let k = 0; k < skipSize && i < sentences.length; k++, i++) {
      result.push(sentences[i]);
    }
  }
  return result;
}

/**
 * Performs microscopic lexical audit, replacing AI telltale words & phrases
 */
function passLexicalAudit(text, intensity) {
  let result = text;
  let wordsReplaced = 0;

  // 1. Multi-word phrases first
  for (const { pattern, replacement } of PHRASE_REPLACEMENTS) {
    result = result.replace(pattern, (match) => {
      wordsReplaced++;
      return applyCasing(match, replacement);
    });
  }

  // 2. Single word replacements
  for (const [aiWord, humanWord] of Object.entries(WORD_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${escapeRegExp(aiWord)}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      wordsReplaced++;
      return applyCasing(match, humanWord);
    });
  }

  return { text: result, wordsReplaced };
}

/**
 * Applies conversational contractions
 */
function passContractions(text) {
  let result = text;
  let contractionsApplied = 0;

  for (const [expanded, contracted] of Object.entries(CONTRACTIONS)) {
    const regex = new RegExp(`\\b${escapeRegExp(expanded)}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      contractionsApplied++;
      return applyCasing(match, contracted);
    });
  }

  return { text: result, contractionsApplied };
}

/**
 * Polishes punctuation, removes robotic em-dashes and excessive semicolons
 */
function passPunctuationAndRhythm(text, intensity) {
  let result = text;

  // Replace em-dashes and double hyphens with clean commas
  result = result.replace(/\s*—\s*/g, ', ');
  result = result.replace(/\s+--\s+/g, ', ');

  // Semicolons: AI loves semicolons; replace with a period or comma
  if (intensity !== 'light') {
    result = result.replace(/;\s+([a-z])/g, (_m, nextChar) => {
      return `. ${nextChar.toUpperCase()}`;
    });
    result = result.replace(/;\s+/g, '. ');
  }

  // Normalize duplicate spaces and comma spacing
  result = result.replace(/[ \t]{2,}/g, ' ');
  result = result.replace(/\s+([,.!?])/g, '$1');

  return result.trim();
}

/**
 * Main humanizer pipeline function
 */
export function humanizeText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return { humanized: '', stats: { wordsReplaced: 0, contractionsApplied: 0, sentencesAnalyzed: 0 } };
  }

  const intensity = ['light', 'medium', 'strong'].includes(options.intensity)
    ? options.intensity
    : 'medium';
  const preserveFormatting = options.preserveFormatting !== false;

  // Step 0: Stash protected non-prose elements (code, URLs, markdown links)
  const { protectedText, protectedItems } = protectNonProse(text);

  // Step 1: Split into paragraphs to preserve layout/indentation
  const paragraphs = preserveFormatting
    ? protectedText.split(/(\r?\n\r?\n)/)
    : [protectedText];

  let totalWordsReplaced = 0;
  let totalContractionsApplied = 0;
  let totalSentencesAnalyzed = 0;

  const processedParagraphs = paragraphs.map((para) => {
    // Preserve empty lines / delimiters
    if (/^\r?\n\r?\n$/.test(para) || para.trim().length === 0) {
      return para;
    }

    // Preserve markdown list/heading prefixes
    const prefixMatch = para.match(/^(\s*(?:[-*+]|\d+\.|#{1,6}|>)\s+)/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    const content = prefix ? para.slice(prefix.length) : para;

    // Split paragraph content into sentences
    const sentences = splitSentences(content);
    totalSentencesAnalyzed += sentences.length;

    // Pass 1: Wave rewrite & transitions
    const rewrittenSentences = passWaveRewrite(sentences, intensity);
    let paraText = rewrittenSentences.join(' ');

    // Pass 2: Lexical audit
    const lexicalRes = passLexicalAudit(paraText, intensity);
    paraText = lexicalRes.text;
    totalWordsReplaced += lexicalRes.wordsReplaced;

    // Pass 3: Contractions
    if (intensity !== 'light') {
      const contractRes = passContractions(paraText);
      paraText = contractRes.text;
      totalContractionsApplied += contractRes.contractionsApplied;
    }

    // Pass 4: Punctuation & rhythm
    paraText = passPunctuationAndRhythm(paraText, intensity);

    return prefix + paraText;
  });

  let assembledText = processedParagraphs.join('');

  // Step 5: Restore protected code, URLs, and syntax
  assembledText = restoreNonProse(assembledText, protectedItems);

  return {
    humanized: assembledText,
    stats: {
      wordsReplaced: totalWordsReplaced,
      contractionsApplied: totalContractionsApplied,
      sentencesAnalyzed: totalSentencesAnalyzed
    }
  };
}

// ============================================================================
// DSH Tool Registration & Schema Projection
// ============================================================================

/**
 * Strict, Lossless JSON Parameter Schema for DeepSeek Harness (schemaOf)
 * DSH schema compiler inspects `tool.parameters` as an open object dictionary
 * of parameter specifications. Every field MUST be a lossless JSON primitive.
 */
export const HumanizeTextParameters = {
  text: {
    type: 'string',
    required: true,
    description: 'The AI-generated text to rewrite into natural, human-like text.'
  },
  intensity: {
    type: 'string',
    enum: ['light', 'medium', 'strong'],
    description: 'Intensity level: "light" (subtle touches, AI vocabulary removal), "medium" (balanced rewrites, contractions, flow adjustments), or "strong" (thorough conversational rework). Defaults to "medium".'
  },
  preserveFormatting: {
    type: 'boolean',
    description: 'Whether to preserve paragraph breaks, code blocks, bullet points, and markdown formatting. Defaults to true.'
  }
};

/**
 * Output schema for the humanize_text tool
 */
export const HumanizeTextOutputSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    original: { type: 'string' },
    humanized: { type: 'string' },
    changes: { type: 'boolean' },
    stats: {
      type: 'object',
      properties: {
        wordsReplaced: { type: 'number' },
        contractionsApplied: { type: 'number' },
        sentencesAnalyzed: { type: 'number' }
      }
    },
    error: { type: 'string' }
  },
  required: ['success']
};

/**
 * Render function projecting tool results into DSH model-visible content blocks
 */
export function renderHumanizeTextOutput(_args, result) {
  if (!result || !result.success) {
    return [{
      type: 'text',
      text: `❌ Humanizer error: ${result?.error || 'Unknown failure'}`
    }];
  }

  if (!result.changes) {
    return [{
      type: 'text',
      text: `✅ Text is already natural; no AI patterns detected.\n\n${result.humanized || result.original || ''}`
    }];
  }

  const stats = result.stats
    ? `\n\n*(Adjusted ${result.stats.wordsReplaced || 0} buzzwords, ${result.stats.contractionsApplied || 0} contractions across ${result.stats.sentencesAnalyzed || 0} sentences)*`
    : '';

  return [{
    type: 'text',
    text: `✅ Humanized Text:\n\n${result.humanized}${stats}`
  }];
}

/**
 * Execution routine handling both direct args and wrapped options
 */
export async function executeHumanize(args, _context) {
  // Normalize input if passed as raw string
  if (typeof args === 'string') {
    args = { text: args };
  }

  const text = args?.text;
  const intensity = (args?.intensity || args?.options?.intensity || 'medium').toLowerCase();
  const preserveFormatting = args?.preserveFormatting ?? args?.options?.preserveFormatting ?? true;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return {
      success: false,
      error: 'Invalid input: "text" parameter must be a non-empty string.'
    };
  }

  try {
    const { humanized, stats } = humanizeText(text, { intensity, preserveFormatting });
    return {
      success: true,
      original: text,
      humanized,
      changes: text !== humanized,
      stats
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// ============================================================================
// Cordis Plugin Entrypoint
// ============================================================================

export function apply(ctx, _config) {
  const toolDefinition = {
    name: 'humanize_text',
    description: 'Rewrite AI-generated text to sound more natural, human, and conversational using a multi-pass engine (Randomized Wave Rewrite, Microscopic Lexical Audit, burstiness variation, and anti-AI punctuation rules).',
    parameters: HumanizeTextParameters,
    output: {
      schema: HumanizeTextOutputSchema,
      render: renderHumanizeTextOutput
    },
    execute: executeHumanize,
    handler: executeHumanize
  };

  // Register with DSH tools service
  const dispose = ctx.tools.register(toolDefinition);

  // Return clean disposal function for hot-reloads and teardown
  return () => {
    if (typeof dispose === 'function') {
      dispose();
    } else if (ctx.tools && typeof ctx.tools.unregister === 'function') {
      ctx.tools.unregister('humanize_text');
    }
  };
}

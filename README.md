# dsh-plugin-humanizer

A production-ready humanizer plugin for **DeepSeek Harness (DSH)** powered by the **Cordis** kernel framework.

This plugin registers the `humanize_text` tool, rewriting AI-generated text into natural, engaging, and conversational human prose while preserving formatting, code blocks, and URLs.

---

## 🏷️ Why `dsh-plugin-humanizer`?

In DeepSeek Harness and the Cordis ecosystem:
* Official and community plugin packages follow the prefix convention: **`dsh-plugin-<feature>`** (e.g., `dsh-plugin-git`, `dsh-plugin-pomodoro-float`).
* The GitHub topic tag is `dsh-plugin`.
* Moving from `dsh-humanizer-plugin` to **`dsh-plugin-humanizer`** adheres to standard DSH package discoverability and architectural conventions.
* For backward compatibility, both `@local/dsh-plugin-humanizer` and `@local/dsh-humanizer-plugin` directory junctions are supported.

---

## 🐛 Root Cause of the Earlier Error

### The Error
```text
This turn failed tool "humanize_text" parameters must be lossless JSON before schema projection.
```

### The Mechanism
1. In DeepSeek Harness, tool parameter schemas are projected via `schemaOf` in `packages/core/tools/src/schema.ts`.
2. Before projecting parameters to the model, DSH runs `snapshotJsonValue(tool.parameters)` to create a deep snapshot and guarantee the structure is strictly lossless JSON (plain objects, strings, numbers, booleans, arrays; no `undefined`, no functions, no class instances).
3. The original plugin declared:
   ```javascript
   ctx.tools.register({
     name: 'humanize_text',
     schema: HumanizeTextSchema, // ❌ BUG: Should be `parameters`
     handler: async (input) => { ... } // ❌ BUG: Should provide `execute`
   });
   ```
4. Because the property was named `schema:` instead of `parameters:`, `tool.parameters` resolved to `undefined`.
5. `snapshotJsonValue(undefined)` returned `undefined`, immediately triggering:
   ```typescript
   if (detached === undefined) {
     throw new Error(`tool "${name}" parameters must be lossless JSON before schema projection`);
   }
   ```
6. Additionally, `HumanizeTextSchema` included invalid JSON Schema fields (`optional: true`), lacked support for `execute(args, context)`, and returned a plain string rather than DSH content blocks (`[{ type: 'text', text: ... }]`).

### The Solution
* Converted parameters into a clean, strictly lossless JSON parameter map under `parameters: HumanizeTextParameters`.
* Implemented both `execute` and `handler` for seamless invocation compatibility across DSH runtimes and MCP bridges.
* Updated `output.render` to project valid model-visible content blocks: `[{ type: 'text', text: formattedOutput }]`.

---

## 🛠️ Multi-Pass Humanization Pipeline

The plugin replaces simplistic regex hacks with a multi-pass pipeline:

1. **Pass 0 (Non-Prose Protection):** Stashes Markdown code fences (```` ```python ... ``` ````), inline code (`` `code` ``), raw URLs (`https://...`), email addresses, and Markdown link destinations with safe tokens so technical elements are never modified.
2. **Pass 1 (Sentence Tokenization):** Intelligent sentence segmentation with abbreviation awareness (`Dr.`, `e.g.`, `i.e.`, `U.S.`) and decimal number protection (`3.14`).
3. **Pass 2 (Robotic Transition Softening):** Replaces stiff AI transition formulas (`Furthermore,`, `Moreover,`, `In conclusion,`, `It is important to note that`) with natural, varied transitions.
4. **Pass 3 (Randomized Wave Rewrite):** Varies rewrites dynamically (alternating between rewritten and untouched sentences) to break the uniform cadence characteristic of AI text.
5. **Pass 4 (Inflected Lexical Audit):** Comprehensive multi-word phrase mapping (`delve into` -> `dig into` to eliminate the infamous "dig into into" bug), plus inflected word substitutions (`utilize`/`utilizing`/`utilized`, `foster`, `paradigm`, `tapestry`, `unleash`, etc.).
6. **Pass 5 (Conversational Contractions):** Applies common human contractions (`do not` -> `don't`, `it is` -> `it's`, `cannot` -> `can't`) with casing preservation.
7. **Pass 6 (Punctuation & Rhythm Polish):** Eliminates robotic em-dashes (`—`) in favor of commas, reduces unnecessary semicolons, and cleans duplicate spacing.
8. **Pass 7 (Syntax Restoration):** Reinserts all protected code blocks, URLs, and Markdown formatting verbatim.

---

## 📖 Tool Reference: `humanize_text`

### Parameters
| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | **Yes** | The AI-generated text to humanize. |
| `intensity` | `string` | No | Rewrite intensity: `'light'`, `'medium'` (default), or `'strong'`. |
| `preserveFormatting` | `boolean` | No | Preserves paragraph breaks (`\n\n`), code fences, and list syntax (default: `true`). |

### Output
```json
{
  "success": true,
  "original": "Furthermore, it is crucial to delve into the data.",
  "humanized": "Plus, it's key to dig into the data.",
  "changes": true,
  "stats": {
    "wordsReplaced": 2,
    "contractionsApplied": 1,
    "sentencesAnalyzed": 1
  }
}
```

---

## 🧪 Testing

Run the automated test suite covering all 10 validation vectors:

```bash
node test.js
```

### Coverage
- [x] Cordis export compliance (`name`, `inject`, `apply`)
- [x] Lossless JSON parameter verification (`snapshotJsonValue`)
- [x] Preposition duplication prevention ("delve into")
- [x] Code fence, inline code, and URL verbatim preservation
- [x] Multi-paragraph layout & newline preservation
- [x] Abbreviation & decimal tokenization (`Dr.`, `3.14`)
- [x] Anti-AI punctuation rules (em-dash & semicolon polish)
- [x] Execution input normalization & error handling
- [x] DSH content block render structure (`[{ type: 'text', text }]`)
- [x] Cordis lifecycle registration and clean teardown

---

## 📄 License
MIT

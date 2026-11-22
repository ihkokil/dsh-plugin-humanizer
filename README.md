# dsh-plugin-humanizer

A production-ready humanizer plugin for **DeepSeek Harness (DSH)** powered by the **Cordis** kernel framework.

This plugin registers the `humanize_text` tool, rewriting AI-generated text into natural, engaging, and conversational human prose while strictly preserving Markdown syntax, code blocks, and URLs.

---

## 📦 Installation for Any User

Anyone can install this plugin into their DeepSeek Harness profile using either the DSH CLI or by adding it to their profile manifest.

### Method 1: Using the DSH CLI
```bash
dsh plugin --profile desktop add github:ihkokil/dsh-plugin-humanizer
```

*(Or replace `desktop` with `web`, `headless`, or `tui` depending on your target profile).*

### Method 2: In Profile Manifest (`$DSH_HOME/profiles/<profile>/package.json`)
Add the package to `dsh.profile.bundles` and `dependencies`:

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-plugin-humanizer"
      ]
    }
  },
  "dependencies": {
    "dsh-plugin-humanizer": "github:ihkokil/dsh-plugin-humanizer"
  }
}
```

Then run `pnpm install` inside the profile folder (or restart DeepSeek Harness).

---

## 🛠️ Multi-Pass Humanization Pipeline

The plugin runs an intelligent multi-pass pipeline:

1. **Pass 0 (Non-Prose Protection):** Stashes Markdown code fences (```` ```python ... ``` ````), inline code (`` `code` ``), raw URLs (`https://...`), email addresses, and Markdown links with unique safe tokens so technical elements are never altered.
2. **Pass 1 (Sentence Tokenization):** Intelligent sentence segmentation with abbreviation awareness (`Dr.`, `e.g.`, `i.e.`, `U.S.`) and decimal number protection (`3.14`).
3. **Pass 2 (Robotic Transition Softening):** Replaces stiff AI transitions (`Furthermore,`, `Moreover,`, `In conclusion,`, `It is important to note that`) with natural, conversational transitions.
4. **Pass 3 (Randomized Wave Rewrite):** Dynamically alternates rewrites across sentences to break the uniform cadence characteristic of AI text.
5. **Pass 4 (Inflected Lexical Audit):** Comprehensive phrase mapping (`delve into` $\to$ `dig into`) to eliminate duplicate prepositions, plus inflected word substitutions (`utilize`/`utilizing`/`utilized`, `foster`, `paradigm`, `tapestry`, `unleash`, etc.).
6. **Pass 5 (Conversational Contractions):** Applies natural contractions (`do not` $\to$ `don't`, `it is` $\to$ `it's`, `cannot` $\to$ `can't`) while respecting original casing.
7. **Pass 6 (Punctuation & Rhythm Polish):** Replaces AI telltale em-dashes (`—`) with commas, reduces semicolons, and cleans duplicate spaces.
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

## 📄 License
MIT

# Fix: {title="..."} attrs not translating correctly in XLIFF

## Problem

`![alt](test.svg){title="New Title" inline=true}` produces raw text in XLIFF:

```xml
<g ctype="image" ...>alt</g>{title="New Title" inline=true}
```

Only `"New Title"` should be translatable; the surrounding `{title="` and `" inline=true}` should be non-translatable structural tags.

## Root Cause

1. The Liquid tokenizer's Attributes regex does NOT match `{title="New Title" inline=true}` (space in value):
   ```
   /^\{\s*(?:[.#](?!T})[a-z0-9_-]+|(?:\s?[a-z0-9_-]+\s*=\s*["']?[a-z0-9_-]+)["']?)+\s*\}/i
   ```
2. So the text token `{title="New Title" inline=true}` falls through to a regular text token → translatable.
3. This text appears in the same segment as the image alt text → broken XLIFF.

## Why "add markdown-it-attrs to skeleton" doesn't work

Adding `md.use(attrs)` to `src/skeleton/index.ts` would BREAK existing `{width=700px}` handling:

- Currently, `{width=700px}` stays as a text token → Liquid tokenizer recognizes it as `liquid_Attributes` → non-translatable
- With markdown-it-attrs, `{width=700px}` is removed from the token stream → Consumer cursor never advances past it in source → existing tests break

## How the Consumer/skeleton mechanism works (key insight)

**compact=true mode** (used in unit tests):

- `dropUselessTokens` WITHOUT grouping
- For `[image_open, text("alt"), image_close]`:
  - before = [image_open]
  - content = [text("alt")] ← only this is hashed
  - after = [image_close] ← beforeDrop fires here!
- `drop(after=[image_close])` calls `beforeDrop` on image_close
- `beforeDrop` hashes the title in the main consumer source
- Consumer only replaces "alt" at its exact position, image structure `![](...)` remains intact
- Result: `![%%%1%%%](image.png "%%%0%%%")` ← both alt and title separately hashed

**compact=false mode** (actual extract):

- `dropUselessTokens` WITH grouping
- `[image_open, text("alt"), image_close]` → grouped → goes to `content`
- `hash([image_open, text("alt"), image_close])` generates full XLIFF with `<g>` structure
- `beforeDrop` still needs to fire... TBD (needs investigation)

## The Fix

**File: `src/skeleton/hooks/image.ts`**

In the image hook, BEFORE the image token splice, check if the NEXT sibling token is a text token matching `{...title="..."...}`:

```typescript
const TITLE_ATTRS_RE = /^(\{[^}]*?title=")([^"]+)(".*?\})/;

const nextInline = inlines[j + 1];
if (nextInline && nextInline.type === 'text') {
  const attrsMatch = TITLE_ATTRS_RE.exec(nextInline.content);
  if (attrsMatch) {
    const [fullMatch, prefix, titleValue, suffix] = attrsMatch;
    const remaining = nextInline.content.slice(fullMatch.length);

    // Set title on closeToken so image_close rule processes it via beforeDrop
    closeToken.attrSet('title', titleValue);

    // Replace the text token with: prefix-skip, suffix-skip (title handled by beforeDrop)
    const newTokens: Token[] = [
      token('liquid', {content: '', skip: prefix, subtype: 'Attributes', generated: 'liquid'}),
      token('liquid', {content: '', skip: suffix, subtype: 'Attributes', generated: 'liquid'}),
    ];
    if (remaining) {
      newTokens.push(token('text', {content: remaining}));
    }
    inlines.splice(j + 1, 1, ...newTokens);
  }
}
```

**Why this works (compact=true trace):**

Tokens after fix: `[image_open, text("alt"), image_close(title="New Title"), liquid_prefix, liquid_suffix]`

`splitByContent`:

- before = [image_open]
- content = [text("alt")]
- after = [image_close, liquid_prefix, liquid_suffix] ← ALL go to after!

`drop(after=[image_close, liquid_prefix, liquid_suffix])`:

1. `erule([image_close, liquid_prefix, liquid_suffix])`:
   - image_close: finds `)` → [pos_paren, pos_paren+1]
   - liquid_prefix: finds `{title="` → [after_paren, after_prefix]
   - liquid_suffix: finds `" inline=true}` → [after_title, end]
2. `beforeDrop` for image_close fires:
   - Searches for 'New Title' from cursor → finds it INSIDE `{title="New Title" inline=true}`
   - Hashes it → skeleton: `![%%%1%%%](test.svg){title="%%%0%%%" inline=true}`

**Key**: The gap/dgap mechanism in `drop` correctly accounts for the content modification by `beforeDrop`.

## Expected skeleton output

`![%%%1%%%](test.svg){title="%%%0%%%" inline=true}`

Where:

- `%%%0%%%` = "New Title" (title value, separate trans-unit)
- `%%%1%%%` = "alt" (alt text, separate trans-unit)

## Expected XLIFF output

```xml
<trans-unit id="0">
    <source>New Title</source>
</trans-unit>
<trans-unit id="1">
    <source><g ctype="image" equiv-text="![{{text}}](test.svg &quot;%%%0%%%&quot;)" ...>alt</g></source>
</trans-unit>
```

## Outstanding questions

1. **compact=false mode**: Does `beforeDrop` fire when image_close is in `content` (non-compact)? Need to verify. The link rule uses the same pattern, so presumably it works the same way. But in non-compact mode, image_close ends up in `content` (not `after`) due to grouping. Need to check if there's a different path for `beforeDrop` in non-compact mode.

2. **The `" inline=true}` search**: After `beforeDrop` replaces 'New Title' with '%%%0%%%', the `erule` positions (computed before `beforeDrop`) need to map correctly via `dgap`. Should work due to the gap tracking mechanism.

3. **The prefix search order**: The `erule` processes tokens in order. liquid_prefix searches for `{title="` BEFORE `beforeDrop` runs. The `beforeDrop` then searches for 'New Title' separately. These don't conflict because they operate on different substrings.

## Files to modify

1. `src/skeleton/hooks/image.ts` — Add title attrs detection before splice
2. `src/skeleton/__snapshots__/index.spec.ts.snap` — Update snapshots (remove "known truncation issue" for `{title=...}` tests)
3. `packages/cli/tests/mocks/translation/conditions/output/` — Regenerate CLI fixtures

## Current test state

Two tests marked as "known truncation issue":

```
exports[`image: translatable attributes (title and alt) > renders standalone image with title via markdown-it-attrs {title="..."} syntax (known truncation issue) 1`] = `"![%%%0%%%"`;
exports[`image: translatable attributes (title and alt) > renders standalone SVG with title and inline via markdown-it-attrs (known truncation issue) 1`] = `"![%%%0%%%"`;
```

After fix, these should produce correct output instead of truncated `"![%%%0%%%"`.

## Debug file to delete

`src/_debug_attrs.spec.ts` — temporary debug file, should be deleted before merging.

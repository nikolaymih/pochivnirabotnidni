# UX Critique Protocol

## Purpose

Mandatory review process for ALL UI code changes. Ensures Coffee design system compliance and deliberate visual decisions. This protocol is a prerequisite for Phase 6 and all subsequent UI work.

## Tool Availability

| Tool | Status | Command | Notes |
|------|--------|---------|-------|
| agent-browser | INSTALLED | `agent-browser` | v0.9.1, installed globally via npm |
| ChunkHound | NOT INSTALLED | `chunkhound` | Not available on npm or pip. See Manual Installation below |

### Manual Installation Required

**ChunkHound:**

**Status:** NOT INSTALLED

**Failed installation attempts (from Plan 03):**
1. `npm install -g chunkhound` -- Error: 404 Not Found (package does not exist on npm registry)
2. `pip install chunkhound` -- Error: command not found (pip not available)
3. `pip3 install chunkhound` -- Error: command not found (pip3 not available)
4. `python3 -m pip install chunkhound` -- Error: No module named pip

**Alternative installation methods to try:**
1. Install pip first: `sudo apt install python3-pip && pip3 install chunkhound`
2. Check if available via pipx: `pipx install chunkhound`
3. Build from source: Check https://chunkhound.github.io/ for repository and build instructions
4. Install via cargo (if Rust tool): `cargo install chunkhound`

**MCP configuration already in place** in `.claude/settings.json`. Once ChunkHound is installed by any method, the MCP server config will work automatically.

**Protocol steps that reference ChunkHound should be skipped until the tool is installed.**

## When to Trigger

**Mandatory before ANY commit that modifies:**
- Files in `components/` (any .tsx file)
- `app/page.tsx` or `app/layout.tsx`
- `app/globals.css`
- Any file containing Tailwind classes

**Exceptions (no critique needed):**
- Pure logic changes (lib/, contexts/ that don't touch UI)
- Test files
- Documentation files
- Configuration files (unless they affect visual output)

## Process

### Step 1: Capture Current State

agent-browser is installed (v0.9.1). Use it to capture the current UI state:

```bash
# Start dev server if not running
npm run dev

# Take accessibility snapshot (text-based, for AI analysis)
agent-browser snapshot http://localhost:3000 > /tmp/critique-before.txt

# Take screenshot for visual reference
agent-browser screenshot http://localhost:3000 --path /tmp/critique-before.png
```

### Step 2: Identify Affected Components

ChunkHound is NOT currently installed. Use grep fallback to find component imports and consumers:

```bash
# Find all files that import the changed component
grep -rn "import.*from.*components/MonthGrid" components/ app/

# Find all consumers of the changed component
grep -rn "<MonthGrid" components/ app/

# Check for Tailwind class usage in changed files
grep -rn "className" [changed-files]
```

When ChunkHound becomes available, use instead:
```bash
chunkhound search "components affected by [change description]"
chunkhound research "[component name] dependencies and consumers"
```

### Step 3: Write Critique Document

Create `.planning/critiques/YYYY-MM-DD-{view-or-component}.md` using the template below.

### Step 4: Capture Post-Change State

After implementing changes, capture the updated UI:

```bash
agent-browser snapshot http://localhost:3000 > /tmp/critique-after.txt
agent-browser screenshot http://localhost:3000 --path /tmp/critique-after.png
```

### Step 5: Verify Token Compliance

```bash
# Check for any hardcoded default Tailwind colors in changed files
grep -rn "bg-\(red\|blue\|yellow\|gray\|green\|purple\)-[0-9]" [changed files]
```

Must return zero matches. All colors must use Coffee theme tokens.

## Critique Document Template

```markdown
# UX Critique: {View or Component Name}

**Date:** YYYY-MM-DD
**Triggered by:** {what UI change is proposed or implemented}
**Scope:** {which components/views are affected}

## Visual Capture
- Before: /tmp/critique-before.png
- After: /tmp/critique-after.png (if post-implementation)
- Snapshot: /tmp/critique-before.txt

## Observations
1. {Factual observation about current state - no judgment, no solutions}
2. {Another observation}
3. {Pattern noticed}

## Questions
1. {Does X alignment match the 4px spacing grid?}
2. {Is this color consistent with its semantic meaning across other components?}
3. {Does the touch target meet 44px minimum?}

## Design System Violations
| Element | Current Value | Expected (Coffee Token) | Severity |
|---------|--------------|------------------------|----------|
| {element} | {what it currently uses} | {correct Coffee token} | high/medium/low |

## Token Compliance
- Colors: {PASS/FAIL - list violations if any}
- Typography: {PASS/FAIL - all text using Nunito?}
- Spacing: {PASS/FAIL - consistent with 4px base?}
- Border Radius: {PASS/FAIL - using sm/md/lg/xl tokens?}
- Shadows: {PASS/FAIL - espresso-based rgba?}
```

## Rules

### ALLOWED in critique output:
- State factual observations ("The button background is #2563eb")
- Ask clarifying questions ("Should the hover state darken or lighten?")
- Flag design system violations (table with current vs expected)
- Note accessibility concerns ("Contrast ratio appears low")
- Reference Coffee token names ("Expected: bg-caramel")

### FORBIDDEN in critique output:
- Propose code changes ("Change bg-blue-500 to bg-caramel")
- Suggest implementations ("Wrap in a div with padding")
- Recommend alternatives ("Use a modal instead of a dropdown")
- Make design decisions ("This should be left-aligned")
- Provide solutions of any kind

The critique exists to INFORM, not to PRESCRIBE. The developer (human or Claude executor) reviews the critique and decides how to act on it.

## Coffee Design System Reference

### Base Colors

| Token | Hex | Tailwind Class | Use For |
|-------|-----|----------------|---------|
| Espresso | #2C1810 | bg-espresso, text-espresso | Primary text, dark backgrounds, tooltips |
| Dark Roast | #3D251E | bg-dark-roast, text-dark-roast | Hover states on dark elements |
| Mocha | #5D3A2E | bg-mocha, text-mocha | Links, secondary emphasis |
| Coffee | #6F4E37 | bg-coffee, text-coffee | Secondary text, labels |
| Cappuccino | #8B6B5D | bg-cappuccino, text-cappuccino | Muted text, cancel buttons |
| Latte | #C4A484 | bg-latte, text-latte | Borders, dividers |
| Oat Milk | #D4C4A8 | bg-oat-milk | Disabled states, subtle backgrounds |
| Cream | #F5F0E8 | bg-cream | Weekend cells, hover backgrounds |
| Foam | #FAF8F5 | bg-foam | Page background, light cards |

### Accent Colors

| Token | Hex | Tailwind Class | Semantic Use |
|-------|-----|----------------|-------------|
| Caramel | #C68E17 | bg-caramel, text-caramel | Vacation days, primary actions, today ring |
| Cinnamon | #B5651D | bg-cinnamon, text-cinnamon | Holidays |
| Honey | #EB9605 | bg-honey, text-honey | Bridge days |

### Semantic Colors

| Token | Hex | Tailwind Class | Use For |
|-------|-----|----------------|---------|
| Success | #5D8A4E | text-success, bg-success | Positive remaining days |
| Warning | #C68E17 | text-warning, bg-warning | Same as Caramel (intentional) |
| Error | #B54D4D | text-error, bg-error | Negative values, validation errors |
| Info | #5D7A8A | text-info, bg-info | Informational messages |

### Typography

- **Primary:** Nunito (latin + cyrillic subsets)
- **Weights:** 400 (body), 600 (semibold labels), 700 (bold headings)
- **Accent:** Caveat (cursive, for decorative text if needed)

### Spacing

- **Base unit:** 4px
- **Scale:** xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(96px)

### Border Radius

| Token | Value | Use For |
|-------|-------|---------|
| sm | 8px | Small elements, tags, badges |
| md | 12px | Cards, panels, inputs |
| lg | 16px | Modals, large containers |
| xl | 24px | Full rounding, pills |

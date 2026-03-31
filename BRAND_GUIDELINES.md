# FundReady™ Brand Guidelines
> Version 1.0 — Enforced across all Claude Code, Cursor, and GitHub Copilot outputs.

---

## 1. Brand Identity

**Product Name:** FundReady™
**Tagline:** The capital readiness platform for small business.
**Parent Company:** Fundabl
**Domain:** fundreadyai.com
**Trademark:** Always render as FundReady™ in headings, FundReady in body copy.

---

## 2. Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Lime Green | `#8ab820` | Primary CTA, active states, score highlights, borders |
| Deep Black | `#0d0f0b` | Page background, primary surface |
| Cream | `#e4e8d8` | Primary text on dark backgrounds |
| Deep Charcoal | `#131510` | Card backgrounds |
| Slate Gray | `#6b7258` | Muted text, secondary labels |

### Surface Layers
| Token | Hex | Usage |
|-------|-----|-------|
| `--surface-1` | `#131510` | Card background |
| `--surface-2` | `#191c14` | Elevated cards, popovers |
| `--surface-3` | `#1f231a` | Input backgrounds, accent fills |
| `--sidebar-bg` | `#0a0c08` | Sidebar / deepest dark |

### Semantic Colors
| Role | Hex | Usage |
|------|-----|-------|
| Success | `#8ab820` | Approved, ready, complete |
| Warning | `#c89020` | Caution, developing, partial |
| Destructive | `#b04428` | Blocked, denied, critical |
| Info / Teal | `#38a880` | Neutral info, approaching |

### Border Colors
| Token | Hex |
|-------|-----|
| `--border` | `#2a2e22` |
| `--border-medium` | `#363b2c` |
| `--border-strong` | `#4a5038` |

### FundScore™ Band Colors
| Range | Color | Hex |
|-------|-------|-----|
| 0–399 | Critical | `#b04428` |
| 400–549 | Low | `#c89020` |
| 550–649 | Developing | `#a0a020` |
| 650–749 | Approaching | `#38a880` |
| 750–899 | Ready | `#8ab820` |
| 900–1000 | Prime | `#c8f040` |

### Primary Color Alpha Variants
```
--primary-bg:     rgba(138, 184, 32, 0.08)   /* subtle tint */
--primary-mid:    rgba(138, 184, 32, 0.20)   /* hover fills */
--primary-border: rgba(138, 184, 32, 0.35)   /* bordered elements */
```

---

## 3. Typography

### Font Stack
| Role | Font | Weights |
|------|------|---------|
| Display / Headings | **Syne** | 400, 600, 700, 800 |
| Body | **DM Sans** | 300, 400, 500 |
| Callouts / Pull Quotes | **Crimson Pro** | 300 italic |

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Crimson+Pro:ital,wght@0,300;1,300;1,400&display=swap');
```

### Type Scale
| Element | Font | Size | Weight | Special |
|---------|------|------|--------|---------|
| H1 | Syne | clamp(28px, 4vw, 44px) | 800 | letter-spacing: -0.02em |
| H2 | Syne | 22px | 700 | letter-spacing: -0.01em |
| H3 | Syne | 15px | 600 | UPPERCASE, letter-spacing: 0.02em |
| H4 | Syne | 15px | 600 | — |
| Body (p) | DM Sans | 14px | 300 | line-height: 1.65 |
| Label | DM Sans | 11px | 400 | UPPERCASE, letter-spacing: 0.12em |
| Button | Syne | 13px | 700 | UPPERCASE, letter-spacing: 0.06em |
| Input | DM Sans | 14px | 300 | — |

---

## 4. Buttons

### Primary Button
```css
background: #8ab820;
color: #0d0f0b;
font-family: Syne;
font-size: 13px;
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
border-radius: 0.375rem;
padding: 10px 20px;
```
**Hover:** `background: #5a7a10`

### Secondary Button
```css
background: transparent;
border: 1px solid rgba(138, 184, 32, 0.35);
color: #8ab820;
```
**Hover:** `background: rgba(138, 184, 32, 0.08)`

### Destructive Button
```css
background: rgba(176, 68, 40, 0.10);
border: 1px solid rgba(176, 68, 40, 0.25);
color: #e4e8d8;
```

---

## 5. Spacing & Layout

- **Container max-width:** 1200px
- **Standard horizontal padding:** 24px (mobile), 40px (desktop)
- **Card padding:** 24px
- **Section vertical spacing:** 64px–96px
- **Border radius:** 0.375rem (default), 0.5rem (lg), 0.75rem (xl), 1rem (2xl)

---

## 6. Shadows (Dark Mode Optimized)
```css
--shadow-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.4);
--shadow-md:  0 4px 8px -1px rgba(0, 0, 0, 0.5);
--shadow-lg:  0 10px 20px -3px rgba(0, 0, 0, 0.6);
--shadow-xl:  0 20px 30px -5px rgba(0, 0, 0, 0.7);
```

---

## 7. Tone of Voice — PCP Framework

FundReady uses **PCP (Perception → Cognition → Persuasion)** methodology across all copy.

### Core Rules
1. **Resonant, not directive.** Never tell users what's wrong with them. Reveal patterns they can self-identify with.
2. **Pattern language over verdict language.** Say "a pattern lenders flag" not "you were denied because."
3. **Elicitation over interrogation.** Questions should feel like self-discovery, not a form.
4. **Outcome-first.** Every action shows what it unlocks, not just what to do.
5. **Identity engineering.** Tier transitions are identity moments, not just score changes.

### Banned Phrases
- ❌ "You were denied because..."
- ❌ "You need to fix..."
- ❌ "Your score is bad"
- ❌ "What is your...?" (interrogation framing)
- ❌ "Stop doing X"
- ❌ "Get started"
- ❌ "Sign up"

### Preferred Phrases
- ✅ "A pattern that commonly blocks approval at this stage..."
- ✅ "Businesses that reach bankable typically address..."
- ✅ "How would you describe your..."
- ✅ "See what changes open this up"
- ✅ "See your FundScore Free"
- ✅ "You are X points from becoming a Bankable Business"

### Tone Adjectives
- Confident, not arrogant
- Warm, not casual
- Clear, not simple
- Precise, not clinical

---

## 8. Brand Elements

### Score System
- **FundScore™:** 0–1000 (6 weighted dimensions)
- **Bankable Score:** 0–300 (threshold: 160)
- **Capital Tiers:** Unprepared → Fundable → Progressing → Bankable → Elite

### Capital Tier Identity Messages
| Tier | Message |
|------|---------|
| Fundable (T1) | "Your business now qualifies for alternative capital. This is the starting point most businesses never get clear about." |
| Progressing (T2) | "Your profile is strengthening. You're in the stage where the right moves compound quickly." |
| Bankable (T3) | "You are now a Bankable Business. Banks seek out businesses at this level — not the other way around." |
| Elite (T4) | "Your business is now in the 1%. Institutional capital, the best terms, and lenders competing for your business." |

### Progress Bar Copy (Assessment)
| Progress | Copy |
|----------|------|
| 0–25% | "Building your business profile..." |
| 25–50% | "Mapping your financial signals..." |
| 50–75% | "Analyzing your credit landscape..." |
| 75–100% | "Calculating your capital path..." |

### Loading Screen Copy (Post-Assessment)
1. "Analyzing your funding profile..."
2. "Identifying patterns lenders flag..."
3. "Mapping your capital path..."
4. "Calculating what you unlock in 30, 90, and 180 days..."

---

## 9. Design Patterns

### Cards
- Background: `--surface-1` (`#131510`)
- Border: `1px solid --border` (`#2a2e22`)
- Border-radius: `0.5rem`
- Padding: `24px`
- Hover: border shifts to `--primary-border`

### Status Badges
| Badge | Color |
|-------|-------|
| Approval Barrier | `--destructive` red-orange |
| Significant Pattern | `--warning` amber |
| Improvement Signal | `--info` teal |
| Ready | `--primary` lime green |

### Score Ring / Gauge
- Track: `--border` (`#2a2e22`)
- Fill: FundScore band color (see section 2)
- Center text: Syne 800, Cream

---

## 10. Logo Usage

- Full name: **FundReady™**
- Always dark background (Deep Black `#0d0f0b` or Deep Charcoal `#131510`)
- Primary accent: Lime Green `#8ab820`
- Never display on light backgrounds without explicit approval
- Minimum clear space: 16px on all sides

---

## 11. Do Not

- Do not use rounded-2xl or pill-shaped buttons (FundReady uses sharper `0.375rem` radius)
- Do not use blue or purple as primary colors (those are competitor colors)
- Do not use light/white backgrounds for the core platform UI
- Do not use gradient backgrounds on primary surfaces
- Do not use emoji in product copy
- Do not use exclamation marks in professional copy
- Do not use casual language ("Hey!", "Awesome!", "Let's go!")

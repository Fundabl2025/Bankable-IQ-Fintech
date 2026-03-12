# Visual Button Design Guide

## 📐 Button Specifications

### **Standard Button Dimensions**

| Size | Height | Padding | Icon Size | Font Size | Use Case |
|------|--------|---------|-----------|-----------|----------|
| `sm` | 32px (h-8) | px-3 py-1.5 | 16px (w-4 h-4) | text-sm | Inline actions, compact UI |
| `default` | 36px (h-9) | px-4 py-2 | 16px (w-4 h-4) | text-sm | Primary actions, forms |
| `lg` | 40px (h-10) | px-6 py-3 | 20px (w-5 h-5) | text-base | Hero CTAs, important actions |

---

## 🎨 Module-Specific Themes

### **Entity & Filings (Blue-Cyan Theme)**

```tsx
// Primary Button
<ThemeButton theme="blue-cyan">
  Complete Task
</ThemeButton>
// Renders: bg-blue-600 hover:bg-blue-700

// Outline Button (Watch Tutorial)
<ThemeButton theme="blue-cyan" variant="outline" size="sm">
  <Video className="w-4 h-4" />
  Watch Tutorial
</ThemeButton>
// Renders: bg-blue-500/20 border-blue-500/50 hover effect
```

**Color Palette:**
- Primary: `#2563eb` (blue-600)
- Hover: `#1d4ed8` (blue-700)
- Gradient: `linear-gradient(to right, #2563eb, #06b6d4)` (blue-600 → cyan-600)
- Light/Outline: `rgba(59, 130, 246, 0.2)` with border

---

### **Business Location (Purple-Pink Theme)**

```tsx
// Primary Button
<ThemeButton theme="purple-pink">
  Verify Address
</ThemeButton>
// Renders: bg-purple-600 hover:bg-purple-700

// Outline Button (Watch Tutorial)
<ThemeButton theme="purple-pink" variant="outline" size="sm">
  <Video className="w-4 h-4" />
  Watch Tutorial
</ThemeButton>
// Renders: bg-purple-500/20 border-purple-500/50 hover effect
```

**Color Palette:**
- Primary: `#9333ea` (purple-600)
- Hover: `#7e22ce` (purple-700)
- Gradient: `linear-gradient(to right, #9333ea, #ec4899)` (purple-600 → pink-600)
- Light/Outline: `rgba(147, 51, 234, 0.2)` with border

---

## 🔘 Button State Variations

### **Default State**
```
┌────────────────────────────┐
│  ▶  Complete Task          │  ← Icon + Text
└────────────────────────────┘
   ↑                      ↑
   px-4              py-2
   
Background: theme.primary (solid color)
Text: white
Border: none
Shadow: subtle elevation
```

### **Hover State**
```
┌────────────────────────────┐
│  ▶  Complete Task          │  ← Darker shade
└────────────────────────────┘

Background: theme.hover (darker)
Text: white
Scale: 1.02 (subtle grow)
Shadow: increased elevation
Transition: 200ms smooth
```

### **Outline Variant**
```
╔════════════════════════════╗
║  📹  Watch Tutorial        ║  ← Icon + Text
╚════════════════════════════╝
   ↑                      ↑
   Border (2px)         Light background

Background: theme.light (20% opacity)
Text: theme color (dark)
Border: theme.border (50% opacity)
```

### **Disabled State**
```
┌────────────────────────────┐
│  ▶  Complete Task          │  ← Grayed out
└────────────────────────────┘

Opacity: 50%
Cursor: not-allowed
No hover effects
```

---

## 📱 Responsive Behavior

### **Desktop (≥1024px)**
- Full button width with padding
- Icons at 16px (default) or 20px (large)
- Text fully visible

### **Tablet (768px - 1023px)**
- Slightly reduced padding
- Icons at 16px
- Text fully visible

### **Mobile (<768px)**
- Compact padding (small size)
- Icons at 16px
- Text may wrap on very narrow screens

---

## 🎯 Button Placement Examples

### **1. Module Header (Watch Tutorial Button)**
```
┌─────────────────────────────────────────────────────────┐
│  Entity & Filings  [📹 Watch Tutorial]                  │
│  Establish your business entity...                      │
└─────────────────────────────────────────────────────────┘
     ↑                      ↑
  Title (h1)          Outline button (sm)
```

### **2. Onboarding Modal Navigation**
```
┌─────────────────────────────────────────────────────┐
│  Welcome to Entity & Filings!                       │
│                                                     │
│  [Content here...]                                  │
│                                                     │
│  ● ○ ○                [Back]  [Next →]            │
└─────────────────────────────────────────────────────┘
                          ↑        ↑
                      Outline  Primary (theme)
```

### **3. Task Cards**
```
┌─────────────────────────────────────────────────────┐
│  ✓ Entity Formation                                 │
│  Complete your business entity registration         │
│                                                     │
│  [Mark Complete]    [Ask AI Coach]    [Edit]       │
└─────────────────────────────────────────────────────┘
      ↑                    ↑               ↑
   Primary            Theme color       Ghost
```

---

## 🎨 Theme Color Matrix

| Theme | Primary | Hover | Gradient Start | Gradient End | Use Cases |
|-------|---------|-------|----------------|--------------|-----------|
| **blue-cyan** | `#2563eb` | `#1d4ed8` | `#2563eb` | `#06b6d4` | Legal, Formation, Compliance |
| **purple-pink** | `#9333ea` | `#7e22ce` | `#9333ea` | `#ec4899` | Location, Verification, Identity |
| **green** | `#16a34a` | `#15803d` | `#16a34a` | `#059669` | Completion, Success, Banking |
| **orange** | `#ea580c` | `#c2410c` | `#ea580c` | `#f59e0b` | Warnings, Review, Planning |
| **red** | `#dc2626` | `#b91c1c` | `#dc2626` | `#e11d48` | Critical, Urgent, Delete |

---

## 📊 Button Hierarchy

### **Priority Levels**

**1. Primary Actions** (ThemeButton with default variant)
- Most important action on the page
- Uses solid theme color
- Example: "Complete Task", "Save", "Submit"

**2. Secondary Actions** (ThemeButton with outline variant)
- Supporting actions
- Uses light background + border
- Example: "Watch Tutorial", "Learn More"

**3. Tertiary Actions** (Button with ghost variant)
- Low-priority actions
- No background, hover only
- Example: "Cancel", "Skip", "Back"

**4. Destructive Actions** (ThemeButton with red theme)
- Dangerous or irreversible actions
- Red color scheme
- Example: "Delete", "Remove", "Cancel Subscription"

---

## ♿ Accessibility Features

### **Keyboard Navigation**
- ✅ `Tab` to focus
- ✅ `Enter` or `Space` to activate
- ✅ `Shift+Tab` to reverse
- ✅ Visible focus ring (3px ring with theme color)

### **Screen Readers**
- ✅ Proper ARIA labels on icon-only buttons
- ✅ Role="button" automatically applied
- ✅ Disabled state announced

### **Visual Indicators**
- ✅ 3:1 contrast ratio minimum (WCAG AA)
- ✅ Focus visible for keyboard users
- ✅ Loading states for async actions
- ✅ Error states clearly marked

---

## 🔧 Implementation Patterns

### **Pattern 1: Action Button with Icon**
```tsx
<ThemeButton theme="blue-cyan">
  <CheckCircle2 className="w-4 h-4 mr-2" />
  Complete Task
</ThemeButton>
```

### **Pattern 2: Icon-Only Button**
```tsx
<ThemeButton theme="purple-pink" size="sm" aria-label="Edit task">
  <Edit2 className="w-4 h-4" />
</ThemeButton>
```

### **Pattern 3: Button Group**
```tsx
<div className="flex gap-3">
  <Button variant="outline">Cancel</Button>
  <ThemeButton theme="green">Save</ThemeButton>
</div>
```

### **Pattern 4: Loading State**
```tsx
<ThemeButton theme="blue-cyan" disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</ThemeButton>
```

---

## 📝 Design Tokens

### **Spacing**
```css
--button-padding-x-sm: 0.75rem;    /* 12px */
--button-padding-y-sm: 0.375rem;   /* 6px */
--button-padding-x: 1rem;          /* 16px */
--button-padding-y: 0.5rem;        /* 8px */
--button-padding-x-lg: 1.5rem;     /* 24px */
--button-padding-y-lg: 0.75rem;    /* 12px */
--button-gap: 0.5rem;              /* 8px between icon & text */
```

### **Typography**
```css
--button-font-size-sm: 0.875rem;   /* 14px */
--button-font-size: 0.875rem;      /* 14px */
--button-font-size-lg: 1rem;       /* 16px */
--button-font-weight: 500;         /* medium */
--button-line-height: 1.5;
```

### **Border & Radius**
```css
--button-border-radius: 0.5rem;    /* 8px - rounded-lg */
--button-border-width: 1px;
--button-outline-width: 3px;       /* focus ring */
```

### **Transitions**
```css
--button-transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🎯 Best Practices

### **DO ✅**
- Use ThemeButton for primary/secondary actions
- Match button theme to module color scheme
- Provide clear, action-oriented labels
- Include icons for better recognition
- Test keyboard navigation
- Ensure proper contrast ratios

### **DON'T ❌**
- Mix multiple themes in the same context
- Use more than one primary button per section
- Make buttons too small (< 32px height)
- Forget disabled states for loading actions
- Use vague labels like "Click Here"
- Overcrowd buttons with too many in a row

---

## 📸 Visual Examples

### **Entity & Filings Module**
```
Header:
[Entity & Filings] [📹 Watch Tutorial]
                    ↑ outline, blue-cyan, sm

Onboarding:
[Previous] [Next →]
  ↑         ↑
outline   blue-cyan primary

Task Actions:
[✓ Mark Complete] [💬 Ask AI Coach] [✏️ Edit]
       ↑               ↑              ↑
   blue-cyan      blue-cyan       ghost
```

### **Business Location Module**
```
Header:
[Business Location] [📹 Watch Tutorial]
                     ↑ outline, purple-pink, sm

AI Coach:
[✨ Ask AI Coach]
       ↑
purple-pink primary

Save:
[Cancel] [Save]
   ↑       ↑
outline  purple-pink
```

---

**Last Updated**: Implementation complete for 2/13 modules  
**Status**: ✅ Ready for rollout to remaining modules  
**Designer**: Centralized ThemeButton system  
**Developer Guide**: See BUTTON_SYSTEM_IMPLEMENTATION.md

# Entity & Filings - Complete Design Specification

## Page Layout

### Container
- **Background**: `bg-slate-50` (light gray)
- **Max Width**: `max-w-5xl` (1024px)
- **Padding**: `p-8` (32px all sides)
- **Position**: Centered with `mx-auto`

---

## 1. HEADER SECTION

### Back Button
- **Location**: Top left, above title
- **Style**: Outline variant button
- **Margin**: `mb-4`
- **Content**: 
  - ArrowLeft icon (4x4)
  - Text: "Back to Lender Compliance"
- **Action**: Navigate to `/lender-compliance`

### Title Row (Flex Container)
- **Layout**: `flex items-start justify-between gap-4 mb-2`

#### Left Side - Title Group
- **H1 Title**: "Entity & Filings"
  - Font: `text-4xl font-bold text-gray-900`
  - Margin bottom: `mb-2`
- **Video Guide Button**: Next to title
  - Theme: `blue-cyan` gradient
  - Variant: `outline`
  - Size: `sm`
  - Icon: Video (4x4)
  - Text: "Video Guide"
  - Gap: `gap-2`
- **Subtitle**: Below title
  - Text: "Establish your business entity and complete necessary state filings"
  - Style: `text-gray-600`

#### Right Side - Badges & Action
- **Badge Container**: `flex items-center gap-2`

##### FICO Points Badge
- **Background**: `bg-gradient-to-r from-cyan-500 to-blue-600`
- **Text**: White, `text-lg`
- **Padding**: `px-4 py-2`
- **Border**: None (`border-0`)
- **Content**: 
  - Zap icon (4x4) with `mr-2`
  - "{totalFicoAvailable} FICO Points"

##### Streak Badge (Conditional - if streak > 0)
- **Background**: `bg-gradient-to-r from-orange-500 to-red-600`
- **Text**: White, `text-lg`
- **Padding**: `px-4 py-2`
- **Border**: None
- **Content**:
  - Flame icon (4x4) with `mr-2`
  - "{currentStreak} Day Streak"

##### Achievement Badge (Conditional - if achievements > 0)
- **Background**: `bg-gradient-to-r from-yellow-500 to-amber-600`
- **Text**: White, `text-lg`
- **Padding**: `px-4 py-2`
- **Border**: None
- **Cursor**: `cursor-pointer`
- **Hover**: `hover:from-yellow-600 hover:to-amber-700 transition-all`
- **Content**:
  - Trophy icon (4x4) with `mr-2`
  - "{count} Achievements"
- **Action**: Opens Achievement Gallery modal

##### Quick Start Button (Below badges)
- **Variant**: `outline`
- **Size**: `sm`
- **Content**:
  - HelpCircle icon (4x4) with `mr-2`
  - Text: "Quick Start"
- **Action**: Opens onboarding modal

---

## 2. MODULE PROGRESS CARD

### Container Card
- **Background**: `bg-gradient-to-br from-blue-600 to-cyan-600`
- **Text**: `text-white`
- **Border**: None (`border-0`)
- **Shadow**: `shadow-lg`
- **Margin**: `mb-8`
- **Padding**: `p-6`

### Header Row
- **Layout**: `flex items-center justify-between mb-4`
- **Left**: "Module Progress" - `text-2xl font-bold`
- **Right**: "{completed}/{total}" - `text-3xl font-bold`

### Progress Bar Section
- **Margin**: `mb-6`

#### Progress Labels
- **Layout**: `flex items-center justify-between text-sm mb-2`
- **Left**: "Tasks Completed"
- **Right**: "{percentage}%" - `font-bold`

#### Progress Bar Track
- **Width**: `w-full`
- **Background**: `bg-white/30` (30% opacity white)
- **Border Radius**: `rounded-full`
- **Height**: `h-3` (12px)

#### Progress Bar Fill
- **Background**: `bg-white`
- **Border Radius**: `rounded-full`
- **Height**: `h-3`
- **Width**: Dynamic `${percentage}%`
- **Transition**: `transition-all duration-500`

### FICO Progress Box
- **Background**: `bg-white/20 backdrop-blur`
- **Border Radius**: `rounded-lg`
- **Padding**: `p-4`

#### FICO Header Row
- **Layout**: `flex items-center justify-between mb-2`
- **Left Side**:
  - Target icon (5x5) with `gap-2`
  - Text: "FICO Points Earned:" - `font-bold`
- **Right Side**: "{earned} / {total}" - `text-2xl font-bold`

#### Current Score Row
- **Layout**: `flex items-center gap-2 text-sm text-blue-100`
- **Icon**: TrendingUp (4x4)
- **Text**: "Current Total FICO SBSS: {score}/160"

### Gamification Stats Grid
- **Margin**: `mt-4`
- **Layout**: `grid grid-cols-3 gap-3`

#### Level Stat Box
- **Background**: `bg-white/20 backdrop-blur`
- **Border Radius**: `rounded-lg`
- **Padding**: `p-3`
- **Alignment**: `text-center`
- **Number**: `text-2xl font-bold`
- **Label**: "Level" - `text-xs text-blue-100`

#### Streak Stat Box
- **Background**: `bg-white/20 backdrop-blur`
- **Border Radius**: `rounded-lg`
- **Padding**: `p-3`
- **Alignment**: `text-center`
- **Number**: `text-2xl font-bold flex items-center justify-center gap-1`
  - Includes Flame icon (5x5 `text-orange-400`) if streak > 0
- **Label**: "Day Streak" - `text-xs text-blue-100`

#### Achievement Stat Box
- **Background**: `bg-white/20 backdrop-blur`
- **Border Radius**: `rounded-lg`
- **Padding**: `p-3`
- **Alignment**: `text-center`
- **Number**: `text-2xl font-bold`
- **Label**: "Achievements" - `text-xs text-blue-100`

### Next Action Alert (Conditional - if incomplete)
- **Margin**: `mt-4`
- **Background**: `bg-yellow-400`
- **Text**: `text-gray-900`
- **Border Radius**: `rounded-lg`
- **Padding**: `p-4`
- **Layout**: `flex items-center gap-2`
- **Icon**: AlertTriangle (5x5)
- **Text**: `font-bold`
  - If 0 complete: "Start with critical tasks to unlock funding!"
  - Else: "{remaining} task(s) remaining"

---

## 3. TASK TIMELINE SECTION

### Timeline Card
- **Background**: White
- **Border**: Default card border
- **Shadow**: Default card shadow
- **Margin**: `mb-8`

### Timeline Header
- **Padding**: `p-6 pb-0`
- **Layout**: Flex row with space-between

#### Title Section
- **Icon**: Award (6x6) `text-cyan-600`
- **Title**: "Task Timeline" - `text-xl font-bold`
- **Badge**: "Start Here" - Cyan badge

#### Description
- **Text**: Gray description text
- **Margin**: `mt-2`

### Timeline Visual
- **Layout**: Grid of 4 circles connected by dotted lines
- **Padding**: `p-6`

#### Circle Icons
- **Size**: Large circular containers
- **States**: 
  - Active/Complete: Filled with color
  - Incomplete: Outlined
- **Icons**: CheckCircle, Upload, FileText icons
- **Labels**: Below each icon
  - "Complete"
  - "Upload"
  - "Verify EIN"
  - "Upload Cert"

### Milestone Cards Row
- **Layout**: `grid grid-cols-3 gap-4`
- **Padding**: `p-6 pt-0`

#### Card 1 (Green - In Progress)
- **Border**: `border-l-4 border-green-500`
- **Background**: `bg-green-50`
- **Icon**: CheckCircle (green)
- **Badge**: "In progress" - Green badge
- **Content**: Status text

#### Card 2 (Orange/Yellow - Pending)
- **Border**: `border-l-4 border-orange-500`
- **Background**: `bg-orange-50`
- **Icon**: Number badge "4"
- **Content**: Task count text

#### Card 3 (Blue - Upcoming)
- **Border**: `border-l-4 border-blue-500`
- **Background**: `bg-blue-50`
- **Icon**: Number badge "5"
- **Content**: Task count text

---

## 4. FILTER & SORT SECTION

### Header Row
- **Layout**: `flex items-center justify-between mb-4`
- **Left**: "Filter & Sort Tasks" - `text-lg font-bold`
- **Right**: "Clear All" link (if filters active)

### Filter Controls Row
- **Layout**: Flex row with gap
- **Alignment**: `items-center`

#### Hide Completed Toggle
- **Type**: Checkbox with label
- **Text**: "My completed tasks are hidden"
- **Icon**: Eye or EyeOff based on state

#### Tag Filter Dropdown
- **Type**: Select dropdown
- **Label**: "Filter by tag"
- **Options**: All available tags
- **Style**: Standard select styling

#### Assignee Filter Dropdown
- **Type**: Select dropdown
- **Label**: "Filter by assignee"
- **Options**: Team members
- **Style**: Standard select styling

#### Status Filter Dropdown
- **Type**: Select dropdown
- **Label**: "Status"
- **Options**: All, Complete, Incomplete
- **Icon**: Filter icon

#### Sort Dropdown
- **Type**: Select dropdown
- **Label**: "Sort by"
- **Options**: None, Priority, Due Date
- **Icon**: SortAsc icon
- **Default**: "None"

---

## 5. TASK CARDS

### Task Card Container
- **Margin**: `mb-4`
- **Border Radius**: `rounded-lg`
- **Shadow**: Hover shadow effect
- **Transition**: `transition-all duration-200`

### Priority-Based Styling

#### Critical Priority
- **Border**: `border-l-4 border-red-500`
- **Background**: `bg-red-50`
- **Badge**: Red with "Critical" text

#### High Priority
- **Border**: `border-l-4 border-orange-500`
- **Background**: `bg-orange-50`
- **Badge**: Orange with "High" text

#### Medium Priority
- **Border**: `border-l-4 border-yellow-500`
- **Background**: `bg-yellow-50`
- **Badge**: Yellow with "Medium" text

#### Low Priority
- **Border**: `border-l-4 border-gray-500`
- **Background**: `bg-gray-50`
- **Badge**: Gray with "Low" text

### Task Card Header
- **Layout**: Flex row with space-between
- **Padding**: `p-4`
- **Cursor**: `cursor-pointer` (for expand/collapse)

#### Left Section
- **Layout**: Flex row with gap-3

##### Checkbox (Left-most)
- **Type**: Large circular checkbox
- **Size**: `w-6 h-6`
- **States**:
  - Unchecked: Circle outline
  - Checked: CheckCircle2 icon (green)
- **Action**: Toggles task completion
- **Effect**: Confetti animation on complete

##### Task Info
- **Task Title**: `font-bold text-gray-900`
- **Task Description**: `text-sm text-gray-600 mt-1`

#### Right Section
- **Layout**: Flex row with gap-2
- **Items**: Aligned to right

##### FICO Points Badge
- **Background**: Gradient based on points value
- **High points**: Cyan to blue gradient
- **Medium points**: Purple gradient
- **Text**: White
- **Size**: `text-sm px-3 py-1`
- **Content**: 
  - Zap icon (3x3)
  - "+{points} FICO"

##### Priority Badge
- **Size**: Small badge
- **Colors**: Match task card border color
- **Text**: Priority level name

##### Due Date Badge (if set)
- **Icon**: Clock (3x3)
- **Text**: Formatted date
- **Color**: 
  - Red if overdue
  - Orange if due soon (< 3 days)
  - Gray if future

##### Expand/Collapse Icon
- **Icon**: ChevronDown or ChevronUp
- **Size**: 5x5
- **Color**: Gray

### Task Card Metadata Row (Header)
- **Layout**: Flex row with gap-3
- **Padding**: `px-4 pt-2`
- **Font**: `text-xs text-gray-500`
- **Items**: Tags as small badges

### Task Card Expanded Content
- **Display**: Conditional based on expanded state
- **Border Top**: `border-t border-gray-200`
- **Background**: Slightly darker shade

#### Educational Content Section
- **Padding**: `p-6`
- **Background**: White or very light tint
- **Content**: 
  - Title: `text-lg font-bold mb-3`
  - Rich text content with formatting
  - Lists, paragraphs, emphasis

#### AI Coach Section
- **Padding**: `p-4`
- **Background**: `bg-gradient-to-r from-cyan-50 to-blue-50`
- **Border**: `border-2 border-cyan-200`
- **Border Radius**: `rounded-lg`

##### AI Coach Header
- **Layout**: Flex row space-between
- **Left**:
  - Bot icon (5x5) `text-cyan-600`
  - Title: "AI Coach" - `font-bold`
- **Button**:
  - Text: "Ask Coach" or "Open Coach"
  - Theme: Cyan gradient button
  - Icon: Sparkles or Bot

#### Document Upload Section
- **Padding**: `p-4`
- **Border Top**: `border-t border-gray-200`

##### Upload Header
- **Icon**: Paperclip (5x5)
- **Title**: "Documents" - `font-bold`

##### Upload Drop Zone
- **Border**: `border-2 border-dashed border-gray-300`
- **Background**: `bg-gray-50`
- **Padding**: `p-4`
- **Border Radius**: `rounded-lg`
- **Hover**: `hover:bg-gray-100 hover:border-gray-400`
- **Layout**: Centered flex column
- **Content**:
  - Upload icon (large)
  - Text: "Click to upload or drag and drop"
  - Subtext: Accepted file types

##### Document List
- **Layout**: Vertical list with gap
- **Item Layout**: Flex row space-between

###### Document Item
- **Padding**: `p-3`
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Border Radius**: `rounded-lg`
- **Hover**: `hover:bg-gray-50`

**Left Side**:
- FileText icon (4x4) `text-blue-600`
- File name - `font-medium`
- File size + date - `text-xs text-gray-500`

**Right Side**:
- Download button (icon only)
- Delete button (icon only, red on hover)

#### Action Buttons Row
- **Padding**: `p-4`
- **Border Top**: `border-t border-gray-200`
- **Layout**: Flex row with gap-3

##### View Resources Button
- **Variant**: Outline
- **Icon**: ExternalLink (4x4)
- **Text**: "View Resources"
- **Size**: Small

##### Edit Metadata Button
- **Variant**: Outline
- **Icon**: Edit2 (4x4)
- **Text**: "Edit Details"
- **Size**: Small
- **Action**: Opens metadata modal

##### Complete Task Button
- **Theme**: Green gradient
- **Icon**: CheckCircle2 (4x4)
- **Text**: "Mark Complete" or "Mark Incomplete"
- **Size**: Standard
- **Action**: Toggles task completion
- **Full Width**: `flex-1`

---

## 6. IMPLEMENTATION TIMELINE (Collapsible)

### Container
- **Margin**: `mt-8`
- **Border**: `border border-gray-200`
- **Border Radius**: `rounded-lg`
- **Background**: White

### Header (Clickable)
- **Padding**: `p-4`
- **Layout**: Flex row space-between
- **Cursor**: `cursor-pointer`
- **Hover**: `hover:bg-gray-50`

#### Left Side
- **Icon**: Clock (5x5) `text-blue-600`
- **Title**: "Implementation Timeline" - `font-bold text-lg`

#### Right Side
- **Icon**: ChevronDown or ChevronUp (5x5)
- **State**: Rotates based on expanded state

### Content (Conditional)
- **Padding**: `p-6 pt-0`
- **Animation**: Smooth expand/collapse

#### Step Items
- **Layout**: Vertical list with gap

##### Step Item
- **Layout**: Flex row with gap-4
- **Margin**: `mb-6`

**Step Number Circle**:
- **Size**: `w-8 h-8`
- **Background**: `bg-blue-600`
- **Text**: White, centered
- **Border Radius**: `rounded-full`
- **Font**: `font-bold`
- **Number**: 1, 2, 3

**Step Content**:
- **Title**: `font-bold text-gray-900`
- **Description**: `text-sm text-gray-600 mt-1`
- **Sub-items**: Bulleted list (if applicable)

**Connector Line** (between steps):
- **Width**: `w-0.5` (2px)
- **Height**: Connects circles
- **Color**: `bg-gray-300`
- **Position**: Vertical line through circles

---

## 7. MODALS

### 7.1 Onboarding Modal

#### Modal Overlay
- **Position**: `fixed inset-0`
- **Background**: `bg-black/60 backdrop-blur-sm`
- **Z-Index**: `z-50`
- **Layout**: `flex items-center justify-center`
- **Padding**: `p-4`

#### Modal Card
- **Max Width**: `max-w-2xl w-full`
- **Border**: `border-4 border-blue-500`
- **Shadow**: `shadow-2xl`

#### Modal Header
- **Background**: `bg-gradient-to-r from-blue-600 to-cyan-600`
- **Text**: `text-white`
- **Padding**: `p-6`
- **Border Radius**: `rounded-t-xl`

**Header Row**:
- **Layout**: Flex space-between
- **Title**: "👋 Welcome to Entity & Filings!" - `text-3xl font-bold`
- **Close Button**:
  - Hover: `hover:bg-white/20`
  - Border Radius: `rounded-full`
  - Padding: `p-2`
  - Icon: X (5x5)

**Subtitle**:
- **Text**: "Let's get you started on your path to becoming bankable"
- **Size**: `text-lg`
- **Opacity**: `opacity-90`

#### Modal Body
- **Padding**: `p-8`

##### Step 0 - What is Bankable?
- **Layout**: Centered content with `space-y-6`
- **Emoji**: 🎯 - `text-6xl mb-4`
- **Title**: "What is 'Bankable'?" - `text-2xl font-bold text-gray-900 mb-3`
- **Description**: Paragraph with bold emphasis
- **Info Box**:
  - Background: `bg-blue-50`
  - Border: `border-2 border-blue-200`
  - Border Radius: `rounded-lg`
  - Padding: `p-4`
  - Alignment: `text-left`
  - Content: Checklist with ✓ items

##### Step 1 - Module Overview
- **Layout**: Centered content with `space-y-6`
- **Emoji**: 📋 - `text-6xl mb-4`
- **Title**: "Entity & Filings Module"
- **Description**: Task count and FICO points
- **Features Box**:
  - Background: Gradient `from-cyan-50 to-blue-50`
  - Border: `border-2 border-cyan-200`
  - Content: 3 rows with icons
    - CheckCircle2 (green) - Complete tasks
    - Bot (cyan) - Ask AI Coach
    - Target (blue) - Track progress

##### Step 2 - How to Use
- **Layout**: Centered content with `space-y-6`
- **Emoji**: 🚀 - `text-6xl mb-4`
- **Title**: "How to Use This Module"
- **Description**: Workflow explanation
- **Step Cards**: 3 cards with emoji numbers
  - Each card: `bg-blue-50 p-4 rounded-lg`
  - Number: 1️⃣, 2️⃣, 3️⃣ - `text-2xl`
  - Title: `font-bold text-gray-900`
  - Description: `text-sm text-gray-700`

#### Modal Footer
- **Padding**: `mt-8 pt-6`
- **Border Top**: `border-t-2 border-gray-200`
- **Layout**: Flex space-between

**Step Indicators** (Left):
- **Layout**: Flex row `gap-2`
- **Dots**: 3 small circles
  - Active: `bg-blue-600`
  - Inactive: `bg-gray-300`
  - Size: `w-2 h-2 rounded-full`

**Navigation Buttons** (Right):
- **Layout**: Flex row `gap-3`
- **Back Button**: Outline variant (if not first step)
- **Next Button**: Blue-cyan gradient ThemeButton
  - Icon: ChevronRight (4x4 ml-2)
  - Text: "Next"
- **Final Button**: Green gradient ThemeButton
  - Icon: CheckCircle2 (4x4 ml-2)
  - Text: "Let's Get Started!"

### 7.2 Achievement Gallery Modal

#### Modal Overlay
- Same as onboarding modal

#### Modal Container
- **Background**: White
- **Border Radius**: `rounded-xl`
- **Shadow**: `shadow-2xl`
- **Max Width**: `max-w-2xl w-full`
- **Max Height**: `max-h-[80vh]`
- **Overflow**: `overflow-y-auto`

#### Modal Header
- **Position**: `sticky top-0`
- **Background**: White
- **Border Bottom**: `border-b border-gray-200`
- **Padding**: `p-6`
- **Layout**: Flex space-between

**Title**:
- **Text**: "Achievement Gallery" - `text-xl font-bold text-gray-900`

**Close Button**:
- **Color**: Gray with hover
- **Icon**: X (5x5)

#### Modal Body
- **Padding**: `p-6`

##### Unlocked Achievements Section
- **Header**: 
  - Star icon (5x5) `text-yellow-600`
  - Text: "Unlocked" - `font-bold text-lg`
- **Layout**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

###### Achievement Card (Unlocked)
- **Background**: White
- **Border**: `border-2 border-yellow-200`
- **Border Radius**: `rounded-lg`
- **Padding**: `p-4`
- **Shadow**: `shadow-sm hover:shadow-md`
- **Transition**: `transition-shadow`

**Content**:
- **Layout**: Flex with gap-3
- **Emoji**: `text-4xl`
- **Title**: `font-bold text-gray-900`
- **Description**: `text-sm text-gray-600 mb-2`
- **Date**: `text-xs text-gray-500`
  - Text: "Unlocked {date}"

##### Locked Achievements Section
- **Header**: 
  - Lock icon (5x5) `text-gray-400`
  - Text: "Locked" - `font-bold text-lg`
- **Layout**: Same grid as unlocked

###### Achievement Card (Locked)
- **Background**: `bg-gray-50`
- **Border**: `border-2 border-gray-200`
- **Opacity**: `opacity-60`
- **Content**: Same structure but grayed out

### 7.3 Metadata Edit Modal

#### Modal Structure
- Similar to onboarding modal overlay

#### Modal Card
- **Max Width**: `max-w-2xl w-full`
- **Border**: `border-2 border-blue-500`
- **Shadow**: `shadow-2xl`

#### Header
- **Background**: `bg-gradient-to-r from-cyan-500 to-blue-600`
- **Text**: White
- **Padding**: `p-6`
- **Border Radius**: `rounded-t-xl`

**Header Row**:
- **Icon**: ✏️ emoji
- **Title**: "Edit Task Metadata" - `text-2xl font-bold`
- **Close Button**: Same as onboarding

**Subtitle**:
- **Text**: Task title
- **Size**: `text-sm`
- **Opacity**: `opacity-90`

#### Form Body
- **Padding**: `p-6`
- **Layout**: `space-y-4`

##### Form Fields
Each field has:
- **Label**: `text-sm font-medium text-gray-700 mb-1`
- **Input/Select**: Standard Tailwind form styling
- **Spacing**: `mb-4`

**Fields**:
1. **Due Date** - Date input
2. **Assigned To** - Text input
3. **Estimated Time** - Text input
4. **Tags** - Text input (comma-separated)

#### Footer Buttons
- **Layout**: Flex row `gap-3`
- **Cancel Button**: Outline variant
- **Save Button**: Cyan-blue gradient ThemeButton
  - Icon: CheckCircle2 (4x4 mr-2)
  - Text: "Save Changes"
  - Full Width: `flex-1`

### 7.4 Video Explanation Modal

#### Component
- Custom `<VideoExplanationModal>` component
- **Props**: 
  - `isOpen`: boolean
  - `onClose`: function
  - `videoId`: string (YouTube ID)
  - `title`: string
  - `description`: string

---

## 8. AI COACH CHAT

### Component
- Custom `<AICoachChat>` component
- **Position**: Fixed or modal-based
- **Props**:
  - `isOpen`: boolean
  - `onClose`: function
  - `taskId`: string
  - `taskTitle`: string
  - `context`: object with task details

---

## 9. INTERACTIVE BEHAVIORS

### Confetti Animations
- **25% completion**: Star burst (150 particles, star shapes)
- **50% completion**: Large burst from both sides (100 particles each)
- **75% completion**: Rainbow confetti (150 particles, 7 colors)
- **100% completion**: Massive explosion (3 seconds, continuous bursts)

### Toast Notifications
- **Achievement Unlocked**: 
  - Duration: 5000ms
  - Layout: Icon + title + description
  - Style: Success toast
- **Streak Update**:
  - Duration: 3000ms
  - Layout: Flame icon + text
  - Shows for streaks > 1 day

### Hover Effects
- Task cards: Shadow increase
- Buttons: Gradient shift, opacity change
- Badges: Darker gradient
- Document items: Background lighten

### Transitions
- Progress bar fill: `transition-all duration-500`
- Task expand/collapse: Smooth height animation
- Badge hovers: `transition-all`
- Modal backdrop: Blur and fade

### Keyboard Shortcuts
- **Ctrl/Cmd + A**: Select all tasks (bulk actions)
- **Escape**: Clear task selection or close modals

---

## 10. RESPONSIVE DESIGN

### Breakpoints
- **Mobile** (< 768px): Single column layout
- **Tablet** (768px - 1024px): Adjusted grid columns
- **Desktop** (> 1024px): Full layout as described

### Mobile Adjustments
- Header: Stack vertically
- Badges: Wrap to multiple rows
- Task cards: Simplified layout
- Grid layouts: Reduce to 1-2 columns
- Modal: Full screen on small devices

---

## 11. COLOR PALETTE

### Primary Colors
- **Blue-600**: `#2563eb`
- **Cyan-600**: `#0891b2`
- **Blue-500**: `#3b82f6`
- **Cyan-500**: `#06b6d4`

### Status Colors
- **Green** (Complete): `#10b981`, `#6ee7b7`
- **Red** (Critical): `#ef4444`, `#fca5a5`
- **Orange** (High/Warning): `#f97316`, `#fdba74`
- **Yellow** (Medium): `#eab308`, `#fde047`
- **Purple**: `#8b5cf6`, `#c4b5fd`

### Neutral Colors
- **Gray-50**: `#f9fafb`
- **Gray-100**: `#f3f4f6`
- **Gray-200**: `#e5e7eb`
- **Gray-300**: `#d1d5db`
- **Gray-400**: `#9ca3af`
- **Gray-500**: `#6b7280`
- **Gray-600**: `#4b5563`
- **Gray-700**: `#374151`
- **Gray-900**: `#111827`

### Gradients
- **Blue-Cyan**: `from-blue-600 to-cyan-600`
- **Cyan-Blue**: `from-cyan-500 to-blue-600`
- **Orange-Red**: `from-orange-500 to-red-600`
- **Yellow-Amber**: `from-yellow-500 to-amber-600`
- **Cyan-Blue Light**: `from-cyan-50 to-blue-50`

---

## 12. TYPOGRAPHY

### Font Sizes
- **4xl**: 36px (h1 titles)
- **3xl**: 30px (modal titles)
- **2xl**: 24px (section headers)
- **xl**: 20px (subsection headers)
- **lg**: 18px (large text)
- **base**: 16px (body text)
- **sm**: 14px (small text)
- **xs**: 12px (labels, metadata)

### Font Weights
- **bold**: 700 (titles, headers)
- **medium**: 500 (emphasis, buttons)
- **normal**: 400 (body text)

---

## 13. SPACING SYSTEM

### Padding
- **p-2**: 8px
- **p-3**: 12px
- **p-4**: 16px
- **p-6**: 24px
- **p-8**: 32px

### Margin
- **mb-2**: 8px
- **mb-3**: 12px
- **mb-4**: 16px
- **mb-6**: 24px
- **mb-8**: 32px

### Gap
- **gap-2**: 8px
- **gap-3**: 12px
- **gap-4**: 16px

---

## 14. ICONS (Lucide React)

### Used Icons
- ArrowLeft, CheckCircle2, CheckCircle, Circle
- ChevronDown, ChevronUp, ChevronRight
- Zap, Target, Award, AlertTriangle
- ExternalLink, TrendingUp, Bot, Sparkles
- HelpCircle, X, Upload, FileText
- Download, Trash2, Paperclip, Calendar
- User, Tag, Clock, Edit2
- Filter, SortAsc, Bell, Trophy
- PlayCircle, Flame, Star, Video

### Icon Sizes
- **w-3 h-3**: 12px (small badges)
- **w-4 h-4**: 16px (buttons, inline)
- **w-5 h-5**: 20px (medium emphasis)
- **w-6 h-6**: 24px (large checkboxes)
- **w-8 h-8**: 32px (step circles)
- **text-6xl**: 60px (modal emojis)

---

## 15. SHADOW SYSTEM

- **shadow-sm**: Subtle shadow for cards
- **shadow**: Default shadow
- **shadow-lg**: Large shadow for elevated cards
- **shadow-2xl**: Extra large shadow for modals
- **hover:shadow-md**: Hover effect shadow

---

## 16. BORDER RADIUS

- **rounded**: 4px (small elements)
- **rounded-lg**: 8px (cards, buttons)
- **rounded-xl**: 12px (modal cards)
- **rounded-full**: 50% (circles, pills)

---

## 17. DATA MANAGEMENT

### Local Storage Keys
- `entity-filings-seen-onboarding`: Boolean flag
- `entity-filings-seen-quickstart`: Boolean flag
- `entity-filings-timeline-expanded`: Boolean flag
- `entity-filings-documents-{taskId}`: JSON array of documents
- `entity-filings-metadata-{taskId}`: JSON object of task metadata

### State Management
- Uses unified `businessData.ts` store
- Real-time synchronization via `window.dispatchEvent('scanDataUpdated')`
- Automatic FICO score calculation
- Gamification tracking (streaks, achievements, level)

---

## 18. ACCESSIBILITY

### ARIA Labels
- Buttons have descriptive labels
- Icons have semantic meaning
- Modals trap focus
- Keyboard navigation supported

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for icons (where needed)
- Form labels properly associated

### Focus Management
- Visible focus indicators
- Tab order follows visual flow
- Modal focus trapping
- Skip links (if needed)

---

This specification covers all visual, interactive, and functional aspects of the Entity & Filings page.

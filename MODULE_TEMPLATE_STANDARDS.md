# 🔒 MODULE TEMPLATE STANDARDS - LOCKED & FINAL

**Version:** 1.0  
**Status:** LOCKED - All 13 modules MUST follow these exact standards  
**Reference Modules:** Entity & Filings, Business Location  
**Last Updated:** Week 1, Day [Current]

---

## 📋 TABLE OF CONTENTS

1. [Color Palette](#color-palette)
2. [Button Components](#button-components)
3. [Layout Structure](#layout-structure)
4. [Typography](#typography)
5. [Icons](#icons)
6. [Spacing & Gaps](#spacing--gaps)
7. [Task Card Structure](#task-card-structure)
8. [AI Coach Integration](#ai-coach-integration)
9. [Document Management](#document-management)
10. [Progress Tracking](#progress-tracking)
11. [Gamification Elements](#gamification-elements)
12. [Resource Links](#resource-links)
13. [Educational Content](#educational-content)
14. [Modals & Overlays](#modals--overlays)
15. [Filters & Badges](#filters--badges)
16. [Onboarding Experience](#onboarding-experience)
17. [Empty States](#empty-states)

---

## 🎨 COLOR PALETTE

### Primary Theme Colors
```tsx
// APPROVED COLORS - USE THESE ONLY
Cyan: 'cyan-50', 'cyan-100', 'cyan-200', 'cyan-500', 'cyan-600', 'cyan-700', 'cyan-900'
Blue: 'blue-50', 'blue-100', 'blue-200', 'blue-500', 'blue-600', 'blue-700', 'blue-900'
```

### Status Colors
```tsx
Success: 'green-50', 'green-100', 'green-200', 'green-600', 'green-700'
Warning: 'yellow-50', 'yellow-100', 'yellow-200', 'yellow-600', 'yellow-700'
Error: 'red-50', 'red-100', 'red-200', 'red-600', 'red-700'
Info: 'blue-50', 'blue-100', 'blue-200', 'blue-600', 'blue-700'
```

### Neutral Colors
```tsx
Gray: 'gray-50', 'gray-100', 'gray-200', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900'
White: 'white'
Black: 'black' (only for overlays with opacity)
```

### Gradients (APPROVED PATTERNS)
```tsx
Primary Gradient: "bg-gradient-to-r from-cyan-500 to-blue-600"
Secondary Gradient: "bg-gradient-to-r from-blue-600 to-cyan-600"
Light Gradient: "bg-gradient-to-r from-cyan-50 to-blue-50"
```

### ❌ BANNED COLORS
```tsx
// NEVER USE THESE
Purple: ALL purple shades (purple-50 through purple-900)
Pink: ALL pink shades (pink-50 through pink-900)
Indigo: ALL indigo shades (indigo-50 through indigo-900)
Violet: ALL violet shades (violet-50 through violet-900)
```

---

## 🔘 BUTTON COMPONENTS

### Primary Action Buttons
**Component:** `ThemeButton`  
**Theme:** `"blue-cyan"`  
**Usage:** Main interactive actions (Save, Submit, Start, etc.)

```tsx
<ThemeButton theme="blue-cyan" onClick={handleAction}>
  <Icon className="w-4 h-4 mr-2" />
  Button Text
</ThemeButton>
```

**Visual:** Solid gradient background `from-cyan-500 to-blue-600`, white text

---

### Secondary Action Buttons (Outline)
**Component:** `ThemeButton`  
**Theme:** `"blue-cyan"`  
**Variant:** `"outline"`  
**Usage:** AI Coach buttons in task headers

```tsx
<ThemeButton theme="blue-cyan" variant="outline" onClick={handleAction} size="sm">
  <Sparkles className="w-4 h-4 mr-2" />
  AI Coach
</ThemeButton>
```

**Visual:** Outline with cyan border, gradient text on hover

---

### Tertiary Action Buttons
**Component:** `Button`  
**Variant:** `"outline"` or `"ghost"`  
**Usage:** Show/Hide Details, Cancel, Filter toggles

```tsx
<Button variant="outline" size="sm" onClick={handleToggle}>
  <ChevronDown className="w-4 h-4 mr-2" />
  Show Details
</Button>
```

**Visual:** Gray outline or no background, gray text

---

### Danger/Destructive Buttons
**Component:** `Button`  
**Custom Classes:** `"bg-red-600 hover:bg-red-700 text-white"`  
**Usage:** Delete, Remove actions

```tsx
<Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</Button>
```

---

### Conditional Bulk Action Buttons
**Component:** `Button`  
**Dynamic Classes Based on Action**  
**Usage:** Confirm dialogs for bulk operations

```tsx
<Button
  onClick={confirmBulkAction}
  className={`flex-1 ${
    bulkAction === 'complete' 
      ? 'bg-green-600 hover:bg-green-700' 
      : 'bg-orange-600 hover:bg-orange-700'
  }`}
>
  Confirm
</Button>
```

---

### External Resource Links
**Component:** `<a>` tag  
**Style:** Outline/ghost with hover effects  
**Layout:** Grid 2-column on desktop

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {resources.map((resource) => (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-cyan-600 hover:bg-cyan-50 transition-colors group"
    >
      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-600" />
      <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
        {resource.name}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 ml-auto" />
    </a>
  ))}
</div>
```

---

## 📐 LAYOUT STRUCTURE

### Page Container
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
  {/* Header Alert */}
  {showAlert && <Alert />}
  
  {/* Onboarding Modal */}
  {showOnboarding && <OnboardingModal />}
  
  {/* Main Content */}
  <div className="max-w-7xl mx-auto p-6 space-y-6">
    {/* Progress Header Card */}
    <Card>...</Card>
    
    {/* Filter/Action Bar */}
    <div className="flex items-center justify-between gap-4">...</div>
    
    {/* Task Cards */}
    <div className="space-y-6">...</div>
  </div>
  
  {/* AI Coach Dialog */}
  {aiCoachOpenFor && <Dialog />}
  
  {/* Bulk Action Confirm Dialog */}
  {showBulkConfirm && <Dialog />}
</div>
```

---

### Progress Header Card Structure
```tsx
<Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
  <div className="flex items-center justify-between mb-6">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <CategoryIcon className="w-8 h-8" />
        <h1 className="text-3xl font-bold">[Category Name]</h1>
      </div>
      <p className="text-cyan-50">
        [Category description]
      </p>
    </div>
    <Button variant="outline" className="border-white/50 text-white hover:bg-white/20">
      <HelpCircle className="w-4 h-4 mr-2" />
      Help Guide
    </Button>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* 4 stat cards */}
  </div>

  {/* Progress Bar */}
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span>Overall Progress</span>
      <Badge className="bg-cyan-600 text-white border-0 text-sm px-3 py-1">
        {progressPercentage}% Complete
      </Badge>
    </div>
    <Progress value={progressPercentage} className="h-3 bg-cyan-900/30" />
  </div>
</Card>
```

---

### Filter/Action Bar Structure
```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  {/* Left: Search */}
  <div className="relative flex-1 w-full sm:w-auto sm:max-w-md">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input
      placeholder="Search tasks..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>

  {/* Right: Actions */}
  <div className="flex items-center gap-3">
    {/* Filter Button with Count Badge */}
    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
      <Filter className="w-4 h-4 mr-2" />
      Filters
      {activeFiltersCount > 0 && (
        <Badge className="ml-2 bg-cyan-600 text-white">{activeFiltersCount}</Badge>
      )}
    </Button>

    {/* Bulk Actions Dropdown */}
    {selectedTasks.size > 0 && (
      <DropdownMenu>...</DropdownMenu>
    )}

    {/* View Toggle */}
    <div className="flex items-center gap-2 border rounded-lg p-1">
      <Button
        variant={viewMode === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('cards')}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('list')}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  </div>
</div>
```

---

## 🔤 TYPOGRAPHY

### Headings
```tsx
Page Title: "text-3xl font-bold" (in gradient header)
Card Title (H2): "text-2xl font-bold text-gray-900"
Section Title (H3): "text-xl font-bold text-gray-900"
Subsection Title (H4): "font-bold text-gray-900"
Small Heading (H5): "font-bold text-[color]-900 text-lg"
```

### Body Text
```tsx
Primary: "text-gray-700" (default body text)
Secondary: "text-gray-600" (supporting text)
Muted: "text-gray-500" (less important text)
Small: "text-sm text-gray-700"
Extra Small: "text-xs text-gray-600"
```

### Special Text
```tsx
Description: "text-sm text-gray-600"
Lead: "leading-relaxed" (for educational content)
List Items: "text-sm text-gray-700 space-y-2"
```

---

## 🎯 ICONS

### Standard Icon Sizes
```tsx
Extra Small: "w-3 h-3" (inline with small text, external link indicators)
Small: "w-4 h-4" (buttons, badges, inline icons)
Medium: "w-5 h-5" (section headers, task priorities)
Large: "w-6 h-6" (expanded sections, AI coach)
Extra Large: "w-8 h-8" (page headers, category icons)
```

### Icon Colors by Context
```tsx
Primary Action: "text-cyan-600"
Info/Help: "text-blue-600"
Success: "text-green-600"
Warning: "text-yellow-600"
Error/Priority: "text-red-600"
Neutral: "text-gray-400" or "text-gray-600"
```

### Icon Usage Patterns
```tsx
// Icons with text - always add margin
<Icon className="w-4 h-4 mr-2" />
Button Text

// Icons in lists - align to top
<Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />

// Icons with group hover
<Icon className="w-4 h-4 text-gray-400 group-hover:text-cyan-600" />
```

---

## 📏 SPACING & GAPS

### Container Spacing
```tsx
Page Padding: "p-6"
Card Padding: "p-6"
Section Spacing: "space-y-6"
Subsection Spacing: "space-y-4"
Item Spacing: "space-y-3"
Compact Spacing: "space-y-2"
```

### Gap Between Elements
```tsx
Large Gap: "gap-6" (between major sections)
Medium Gap: "gap-4" (between related items)
Small Gap: "gap-3" (between inline elements)
Compact Gap: "gap-2" (between icons and text)
```

### Margin Patterns
```tsx
Bottom Margin (sections): "mb-6"
Bottom Margin (subsections): "mb-4"
Bottom Margin (items): "mb-3"
Bottom Margin (small): "mb-2"
```

---

## 📋 TASK CARD STRUCTURE

### Complete Task Card Template
```tsx
<Card className="hover:shadow-lg transition-all duration-200 relative">
  {/* Selection Checkbox */}
  <div className="absolute top-4 left-4 z-10">
    <Checkbox
      checked={selectedTasks.has(task.id)}
      onCheckedChange={() => toggleTaskSelection(task.id)}
    />
  </div>

  {/* Header Section */}
  <div className="flex items-start justify-between gap-4 mb-4 pl-8">
    <div className="flex-1">
      <div className="flex items-start gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
          {task.priority === 'high' && (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      
      {/* Badges Row */}
      <div className="flex flex-wrap gap-2">
        {/* Status Badge */}
        <Badge className={statusStyles[getTaskStatus(task.id)]}>
          {getTaskStatus(task.id) === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
          {getTaskStatus(task.id) === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
          {getTaskStatusText(task.id)}
        </Badge>

        {/* Priority Badge */}
        {task.priority === 'high' && (
          <Badge variant="destructive">High Priority</Badge>
        )}

        {/* FICO Impact Badge */}
        {task.ficoImpact > 0 && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{task.ficoImpact} FICO Points
          </Badge>
        )}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <ThemeButton
        theme="blue-cyan"
        variant="outline"
        onClick={() => setAiCoachOpenFor(task.id)}
        size="sm"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        AI Coach
      </ThemeButton>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toggleTaskExpanded(task.id)}
      >
        {expandedTasks.has(task.id) ? (
          <>
            <ChevronUp className="w-4 h-4 mr-2" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            Show Details
          </>
        )}
      </Button>
    </div>
  </div>

  {/* Status Action Bar */}
  {getTaskStatus(task.id) === 'not-started' && (
    <div className="flex items-center gap-3 mb-4 pl-8">
      <ThemeButton
        theme="blue-cyan"
        onClick={() => handleStartTask(task.id)}
        size="sm"
      >
        <Play className="w-4 h-4 mr-2" />
        Start Task
      </ThemeButton>
      <span className="text-sm text-gray-500">Click to begin this task</span>
    </div>
  )}

  {getTaskStatus(task.id) === 'in-progress' && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 ml-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-blue-900">Task in progress...</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleResetTask(task.id)}
          className="text-blue-600 hover:text-blue-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
      <ThemeButton
        theme="blue-cyan"
        onClick={() => handleCompleteTask(task.id)}
        className="w-full"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Mark as Complete
      </ThemeButton>
    </div>
  )}

  {getTaskStatus(task.id) === 'complete' && (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 ml-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">Task completed!</span>
          {task.ficoImpact > 0 && (
            <Badge className="bg-green-600 text-white">
              +{task.ficoImpact} FICO points earned
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleResetTask(task.id)}
          className="text-green-600 hover:text-green-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Undo
        </Button>
      </div>
    </div>
  )}

  {/* Expanded Details Section */}
  {expandedTasks.has(task.id) && (
    <div className="border-t pt-6 space-y-6 pl-8">
      {/* AI Coach CTA Section - ALWAYS FIRST */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Bot className="w-6 h-6 text-cyan-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h5 className="font-bold text-cyan-900 mb-2 text-lg">🤖 Ask Your AI Coach</h5>
            <p className="text-sm text-gray-700 mb-3">
              Have questions about this task? Get instant answers from your AI Coach 24/7!
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">💡 What do I do first?</Badge>
              <Badge variant="secondary" className="text-xs">⏱️ How long will this take?</Badge>
              <Badge variant="secondary" className="text-xs">💰 Why does this matter?</Badge>
              <Badge variant="secondary" className="text-xs">🚫 Common mistakes?</Badge>
            </div>
            <ThemeButton
              theme="blue-cyan"
              onClick={() => setAiCoachOpenFor(task.id)}
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI Coach
            </ThemeButton>
          </div>
        </div>
      </div>

      {/* Document Management Section */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Document Management:
        </h4>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
          {getUploadedFiles(task.id).length === 0 ? (
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-4">
                No documents uploaded yet. Upload relevant documents to track your progress.
              </p>
              <input
                type="file"
                id={`file-upload-${task.id}`}
                className="hidden"
                onChange={(e) => handleFileUpload(task.id, e)}
                multiple
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById(`file-upload-${task.id}`)?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {getUploadedFiles(task.id).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <input
                type="file"
                id={`file-upload-${task.id}`}
                className="hidden"
                onChange={(e) => handleFileUpload(task.id, e)}
                multiple
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById(`file-upload-${task.id}`)?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload More Documents
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Educational Content Section */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          What You Need to Know:
        </h4>
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          {task.educationalContent}
        </div>
      </div>

      {/* Resources Section */}
      {task.resources && task.resources.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            Recommended Resources:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {task.resources.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-cyan-600 hover:bg-cyan-50 transition-colors group"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
                  {resource.name}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 ml-auto" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Progress Timeline:
        </h4>
        <div className="space-y-4">
          {/* Timeline items */}
        </div>
      </div>
    </div>
  )}
</Card>
```

---

## 🤖 AI COACH INTEGRATION

### AI Coach Button in Task Header
```tsx
<ThemeButton
  theme="blue-cyan"
  variant="outline"
  onClick={() => setAiCoachOpenFor(task.id)}
  size="sm"
>
  <Sparkles className="w-4 h-4 mr-2" />
  AI Coach
</ThemeButton>
```

### AI Coach CTA Section (Inside Expanded Task)
**MUST BE FIRST SECTION AFTER EXPANSION**

```tsx
<div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6">
  <div className="flex items-start gap-3">
    <Bot className="w-6 h-6 text-cyan-600 mt-1 flex-shrink-0" />
    <div className="flex-1">
      <h5 className="font-bold text-cyan-900 mb-2 text-lg">🤖 Ask Your AI Coach</h5>
      <p className="text-sm text-gray-700 mb-3">
        Have questions about this task? Get instant answers from your AI Coach 24/7!
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">💡 What do I do first?</Badge>
        <Badge variant="secondary" className="text-xs">⏱️ How long will this take?</Badge>
        <Badge variant="secondary" className="text-xs">💰 Why does this matter?</Badge>
        <Badge variant="secondary" className="text-xs">🚫 Common mistakes?</Badge>
      </div>
      <ThemeButton
        theme="blue-cyan"
        onClick={() => setAiCoachOpenFor(task.id)}
        size="sm"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Ask AI Coach
      </ThemeButton>
    </div>
  </div>
</div>
```

### AI Coach Dialog
```tsx
<Dialog open={!!aiCoachOpenFor} onOpenChange={() => setAiCoachOpenFor(null)}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-3">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <DialogTitle className="text-2xl">Your AI Business Coach</DialogTitle>
          <p className="text-sm text-gray-600">
            Ask me anything about: {getCurrentTask()?.title}
          </p>
        </div>
      </div>
    </DialogHeader>

    {/* Chat Interface */}
    <div className="space-y-4">
      {/* Messages */}
      <div className="space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Hi! I'm here to help you with this task. What would you like to know?
            </p>
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => handleSendMessage(question)}
                  className="text-left justify-start h-auto py-3 px-4"
                >
                  <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-2 w-8 h-8 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask your question..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <ThemeButton
          theme="blue-cyan"
          onClick={() => handleSendMessage()}
          disabled={!currentMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </ThemeButton>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

## 📁 DOCUMENT MANAGEMENT

### Empty State (No Documents)
```tsx
<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
  <div className="text-center">
    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
    <p className="text-sm text-gray-600 mb-4">
      No documents uploaded yet. Upload relevant documents to track your progress.
    </p>
    <input
      type="file"
      id={`file-upload-${task.id}`}
      className="hidden"
      onChange={(e) => handleFileUpload(task.id, e)}
      multiple
    />
    <Button
      variant="outline"
      onClick={() => document.getElementById(`file-upload-${task.id}`)?.click()}
    >
      <Upload className="w-4 h-4 mr-2" />
      Upload Documents
    </Button>
  </div>
</div>
```

### With Documents
```tsx
<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
  <div className="space-y-3">
    {getUploadedFiles(task.id).map((file) => (
      <div
        key={file.id}
        className="flex items-center justify-between p-3 bg-white rounded-lg border"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteFile(file.id)}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    ))}
    <input
      type="file"
      id={`file-upload-${task.id}`}
      className="hidden"
      onChange={(e) => handleFileUpload(task.id, e)}
      multiple
    />
    <Button
      variant="outline"
      onClick={() => document.getElementById(`file-upload-${task.id}`)?.click()}
      className="w-full"
    >
      <Upload className="w-4 h-4 mr-2" />
      Upload More Documents
    </Button>
  </div>
</div>
```

---

## 📊 PROGRESS TRACKING

### Stats Grid (4 Cards)
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Card 1: Completed Tasks */}
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="w-5 h-5" />
      <span className="text-sm font-medium">Completed</span>
    </div>
    <p className="text-3xl font-bold">{completedTasks}/{totalTasks}</p>
    <p className="text-xs text-cyan-100 mt-1">Tasks finished</p>
  </div>

  {/* Card 2: FICO Points */}
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp className="w-5 h-5" />
      <span className="text-sm font-medium">FICO Impact</span>
    </div>
    <p className="text-3xl font-bold">+{ficoEarned}</p>
    <p className="text-xs text-cyan-100 mt-1">of {totalFicoAvailable} points</p>
  </div>

  {/* Card 3: In Progress */}
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="w-5 h-5" />
      <span className="text-sm font-medium">In Progress</span>
    </div>
    <p className="text-3xl font-bold">{inProgressTasks}</p>
    <p className="text-xs text-cyan-100 mt-1">Active tasks</p>
  </div>

  {/* Card 4: High Priority */}
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm font-medium">High Priority</span>
    </div>
    <p className="text-3xl font-bold">{highPriorityTasks}</p>
    <p className="text-xs text-cyan-100 mt-1">Urgent items</p>
  </div>
</div>
```

### Progress Bar
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between text-sm">
    <span>Overall Progress</span>
    <Badge className="bg-cyan-600 text-white border-0 text-sm px-3 py-1">
      {progressPercentage}% Complete
    </Badge>
  </div>
  <Progress value={progressPercentage} className="h-3 bg-cyan-900/30" />
</div>
```

---

## 🎮 GAMIFICATION ELEMENTS

### XP Progress Bar
```tsx
<div className="bg-white rounded-lg p-4 border-2 border-purple-200">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <Zap className="w-5 h-5 text-purple-600" />
      <span className="font-bold text-gray-900">Level {currentLevel}</span>
    </div>
    <span className="text-sm text-gray-600">{currentXP} / {xpForNextLevel} XP</span>
  </div>
  <Progress value={(currentXP / xpForNextLevel) * 100} className="h-2 mb-2" />
  <p className="text-xs text-gray-600">
    {xpForNextLevel - currentXP} XP until Level {currentLevel + 1}
  </p>
</div>
```

### Streak Counter
```tsx
<div className="bg-white rounded-lg p-4 border-2 border-orange-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Flame className="w-5 h-5 text-orange-600" />
      <span className="font-bold text-gray-900">{currentStreak} Day Streak</span>
    </div>
    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
      🔥 Keep it up!
    </Badge>
  </div>
  <p className="text-xs text-gray-600 mt-2">
    Complete a task daily to maintain your streak
  </p>
</div>
```

### Recent Achievements
```tsx
<div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
  <div className="flex items-center gap-2 mb-3">
    <Trophy className="w-5 h-5 text-yellow-600" />
    <span className="font-bold text-gray-900">Recent Achievements</span>
  </div>
  {recentAchievements.length > 0 ? (
    <div className="space-y-2">
      {recentAchievements.map((achievement) => (
        <div key={achievement.id} className="flex items-center gap-2">
          <span className="text-2xl">{achievement.icon}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
            <p className="text-xs text-gray-600">{achievement.description}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-600">Complete tasks to earn achievements!</p>
  )}
</div>
```

---

## 🔗 RESOURCE LINKS

### Resource Section Template
**MUST USE THIS EXACT PATTERN**

```tsx
{task.resources && task.resources.length > 0 && (
  <div>
    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
      <ExternalLink className="w-5 h-5 text-blue-600" />
      Recommended Resources:
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {task.resources.map((resource) => (
        <a
          key={resource.name}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-cyan-600 hover:bg-cyan-50 transition-colors group"
        >
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-600" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">
            {resource.name}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 ml-auto" />
        </a>
      ))}
    </div>
  </div>
)}
```

### Key Requirements:
- ✅ Grid layout: `grid grid-cols-1 md:grid-cols-2 gap-3`
- ✅ Outline style: `border border-gray-200`
- ✅ Hover: `hover:border-cyan-600 hover:bg-cyan-50`
- ✅ Group utility: `group` class on anchor
- ✅ Icons: ExternalLink (left) + ChevronRight (right with ml-auto)
- ✅ All icons respond to group-hover with cyan color

---

## 📚 EDUCATIONAL CONTENT

### Content Container
```tsx
<div>
  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
    <Award className="w-5 h-5 text-blue-600" />
    What You Need to Know:
  </h4>
  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
    {task.educationalContent}
  </div>
</div>
```

### Content Patterns
```tsx
// Paragraphs
<p className="text-gray-700 leading-relaxed">
  Your educational content here...
</p>

// Warning/Alert Box
<div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
  <p className="font-bold text-yellow-900 mb-2">⚠️ Important:</p>
  <p className="text-sm text-yellow-800">Warning text here...</p>
</div>

// Action Steps Box
<div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
  <p className="font-bold text-blue-900 mb-2">Action Steps:</p>
  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
    <li>Step one</li>
    <li>Step two</li>
    <li>Step three</li>
  </ol>
</div>

// Success/Tip Box
<div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
  <p className="font-bold text-green-900 mb-2">💡 Pro Tip:</p>
  <p className="text-sm text-green-800">Tip content here...</p>
</div>

// Lists with Icons
<ul className="text-sm text-gray-700 space-y-2">
  <li className="flex items-start gap-2">
    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
    <span>Positive point here</span>
  </li>
  <li className="flex items-start gap-2">
    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
    <span>Negative point here</span>
  </li>
</ul>
```

---

## 🪟 MODALS & OVERLAYS

### Onboarding Modal
```tsx
{showOnboarding && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <Card className="max-w-2xl w-full border-4 border-blue-500 shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold">👋 Welcome to [Module Name]!</h2>
          <button onClick={() => setShowOnboarding(false)} className="hover:bg-white/20 rounded-full p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-cyan-50 text-lg">
          [Module description and importance]
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Start Guide */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-blue-600" />
            Quick Start Guide
          </h3>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-4 text-left space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700"><strong>Complete tasks</strong> to build your FICO score</p>
            </div>
            <div className="flex items-start gap-2">
              <Bot className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700"><strong>Ask AI Coach</strong> for help anytime</p>
            </div>
            <div className="flex items-start gap-2">
              <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700"><strong>Track progress</strong> in real-time</p>
            </div>
          </div>
        </div>

        {/* What You'll Do */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-green-600" />
            What You'll Do Here
          </h3>
          <div className="space-y-3">
            {/* Task previews */}
          </div>
        </div>

        {/* Success Tips */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Tips for Success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tip cards */}
          </div>
        </div>

        {/* CTA Button */}
        <ThemeButton
          theme="blue-cyan"
          onClick={() => setShowOnboarding(false)}
          className="w-full"
          size="lg"
        >
          <Rocket className="w-5 h-5 mr-2" />
          Let's Get Started!
        </ThemeButton>
      </div>
    </Card>
  </div>
)}
```

### Bulk Action Confirm Dialog
```tsx
{showBulkConfirm && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <Card className="max-w-md w-full">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Bulk Action</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to mark {selectedTasks.size} task(s) as {bulkAction}?
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowBulkConfirm(false);
              setBulkAction(null);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBulkAction}
            className={`flex-1 ${
              bulkAction === 'complete' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Card>
  </div>
)}
```

---

## 🏷️ FILTERS & BADGES

### Filter Panel
```tsx
{showFilters && (
  <Card className="mb-6">
    <div className="p-4">
      <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
          <div className="space-y-2">
            {['all', 'not-started', 'in-progress', 'complete'].map((status) => (
              <label key={status} className="flex items-center gap-2">
                <Checkbox
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                />
                <span className="text-sm text-gray-700 capitalize">
                  {status.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
          <div className="space-y-2">
            {['all', 'high', 'medium', 'low'].map((priority) => (
              <label key={priority} className="flex items-center gap-2">
                <Checkbox
                  checked={priorityFilter.includes(priority)}
                  onCheckedChange={() => togglePriorityFilter(priority)}
                />
                <span className="text-sm text-gray-700 capitalize">{priority}</span>
              </label>
            ))}
          </div>
        </div>

        {/* FICO Impact Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">FICO Impact</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={showOnlyFicoImpact}
                onCheckedChange={setShowOnlyFicoImpact}
              />
              <span className="text-sm text-gray-700">Show only tasks with FICO impact</span>
            </label>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="ghost"
        onClick={clearFilters}
        className="mt-4 text-cyan-600 hover:text-cyan-700"
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  </Card>
)}
```

### Status Badges
```tsx
const statusStyles = {
  'complete': 'bg-green-100 text-green-800 border-green-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'not-started': 'bg-gray-100 text-gray-800 border-gray-200'
};

<Badge className={statusStyles[getTaskStatus(task.id)]}>
  {getTaskStatus(task.id) === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
  {getTaskStatus(task.id) === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
  {getTaskStatusText(task.id)}
</Badge>
```

### FICO Impact Badge
```tsx
{task.ficoImpact > 0 && (
  <Badge className="bg-green-100 text-green-800 border-green-200">
    <TrendingUp className="w-3 h-3 mr-1" />
    +{task.ficoImpact} FICO Points
  </Badge>
)}
```

### Priority Badge
```tsx
{task.priority === 'high' && (
  <Badge variant="destructive">High Priority</Badge>
)}
```

---

## 🎬 ONBOARDING EXPERIENCE

### Onboarding Structure
1. **Welcome Header** (gradient bg, module icon + name)
2. **Quick Start Guide** (3 key features with icons)
3. **What You'll Do** (task previews)
4. **Tips for Success** (2-4 tip cards)
5. **CTA Button** (Let's Get Started)

### Task Preview Card (in Onboarding)
```tsx
<div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
  <div className="bg-blue-600 text-white rounded-full p-2 flex-shrink-0">
    <TaskIcon className="w-4 h-4" />
  </div>
  <div className="flex-1">
    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
    <p className="text-xs text-gray-600">{task.description}</p>
  </div>
  {task.ficoImpact > 0 && (
    <Badge className="bg-green-600 text-white border-0 text-xs">
      +{task.ficoImpact} FICO
    </Badge>
  )}
</div>
```

### Success Tip Card (in Onboarding)
```tsx
<div className="bg-white rounded-lg p-4 border-2 border-green-200">
  <div className="flex items-start gap-3">
    <div className="bg-cyan-100 text-cyan-600 rounded-full p-2 flex-shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900 mb-2">🤖 Tip Title</h4>
      <p className="text-sm text-gray-700">
        Tip description here...
      </p>
    </div>
  </div>
</div>
```

---

## 🌟 EMPTY STATES

### No Tasks Match Filters
```tsx
{filteredTasks.length === 0 && (
  <Card className="p-12 text-center">
    <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks match your filters</h3>
    <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
    <Button variant="outline" onClick={clearFilters}>
      <X className="w-4 h-4 mr-2" />
      Clear Filters
    </Button>
  </Card>
)}
```

### No Documents Uploaded
```tsx
<div className="text-center">
  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
  <p className="text-sm text-gray-600 mb-4">
    No documents uploaded yet. Upload relevant documents to track your progress.
  </p>
  <Button variant="outline" onClick={handleUploadClick}>
    <Upload className="w-4 h-4 mr-2" />
    Upload Documents
  </Button>
</div>
```

---

## ✅ CHECKLIST FOR NEW MODULES

Before marking a module as complete, verify:

### Colors
- [ ] Zero purple/pink/indigo/violet colors
- [ ] All primary colors use cyan-500, cyan-600, blue-600
- [ ] Gradients use `from-cyan-500 to-blue-600` or `from-blue-600 to-cyan-600`
- [ ] Status colors match standards (green for success, yellow for warning, etc.)

### Buttons
- [ ] Primary actions use `ThemeButton theme="blue-cyan"`
- [ ] AI Coach buttons use `ThemeButton theme="blue-cyan" variant="outline"`
- [ ] Show/Hide Details use `Button variant="outline"`
- [ ] Resource links use outline style with grid layout
- [ ] Bulk action confirm uses conditional colors (green/orange)

### Task Cards
- [ ] Checkbox in top-left corner
- [ ] AI Coach button in header
- [ ] Show/Hide Details button in header
- [ ] Status badges with correct colors
- [ ] AI Coach CTA section is FIRST in expanded content
- [ ] Document Management section present
- [ ] Educational Content section present
- [ ] Resources section uses grid + outline buttons
- [ ] Progress Timeline section present

### Layout
- [ ] Page uses gradient background `from-gray-50 to-blue-50/30`
- [ ] Progress header card with gradient bg
- [ ] 4-stat grid in header
- [ ] Progress bar with percentage badge
- [ ] Filter/search bar with proper actions
- [ ] Task cards have proper spacing (`space-y-6`)

### AI Coach
- [ ] Button in task header
- [ ] CTA section in expanded task (first section)
- [ ] Dialog with chat interface
- [ ] Suggested questions for empty state
- [ ] Message bubbles styled correctly

### Onboarding
- [ ] Welcome modal on first visit
- [ ] Gradient header with module name
- [ ] Quick Start Guide section
- [ ] What You'll Do section
- [ ] Tips for Success section
- [ ] CTA button to dismiss

### Icons
- [ ] All icons use correct sizes (w-4 h-4 for buttons)
- [ ] Icons have proper colors (cyan-600 for primary)
- [ ] Icons in lists use `flex-shrink-0`
- [ ] Icons with text use `mr-2` spacing

### Spacing
- [ ] Consistent padding (p-6 for cards)
- [ ] Consistent gaps (gap-4 between elements)
- [ ] Consistent margins (mb-3, mb-4, mb-6)
- [ ] Proper section spacing (`space-y-6`)

### Typography
- [ ] Page title is `text-3xl font-bold`
- [ ] Card titles are `text-2xl font-bold text-gray-900`
- [ ] Section titles are `text-xl font-bold text-gray-900`
- [ ] Body text is `text-gray-700` or `text-gray-600`
- [ ] Small text is `text-sm`

### Functionality
- [ ] Task status changes work
- [ ] AI Coach dialog opens/closes
- [ ] Document upload/delete works
- [ ] Filters work correctly
- [ ] Bulk actions work
- [ ] Search filters tasks
- [ ] Onboarding can be dismissed

---

## 🚫 COMMON MISTAKES TO AVOID

### ❌ DON'T DO THIS:
```tsx
// Wrong button component
<Button className="bg-cyan-600 hover:bg-cyan-700">AI Coach</Button>

// Wrong colors
<div className="bg-purple-600">...</div>

// Wrong resource link style
<a className="bg-blue-600 text-white">...</a>

// Wrong icon size
<Icon className="w-6 h-6 mr-2" /> // Too big for button

// Missing ml-auto on ChevronRight
<ChevronRight className="w-4 h-4" />

// Wrong gradient direction
<div className="bg-gradient-to-br from-purple-500 to-pink-600">...</div>

// Missing group utilities
<a className="hover:border-cyan-600">
  <Icon className="hover:text-cyan-600" /> // Won't work
</a>
```

### ✅ DO THIS INSTEAD:
```tsx
// Correct button component
<ThemeButton theme="blue-cyan">AI Coach</ThemeButton>

// Correct colors
<div className="bg-cyan-600">...</div>

// Correct resource link style
<a className="border border-gray-200 hover:border-cyan-600 group">...</a>

// Correct icon size
<Icon className="w-4 h-4 mr-2" />

// Correct ChevronRight placement
<ChevronRight className="w-4 h-4 ml-auto" />

// Correct gradient
<div className="bg-gradient-to-r from-cyan-500 to-blue-600">...</div>

// Correct group utilities
<a className="group hover:border-cyan-600">
  <Icon className="group-hover:text-cyan-600" />
</a>
```

---

## 📝 IMPLEMENTATION ORDER

When creating a new module, implement in this order:

1. **Create file structure** - Copy EntityFilings.tsx or BusinessLocation.tsx
2. **Update module name** - Replace all references to old module name
3. **Update imports** - Ensure ThemeButton is imported
4. **Define tasks array** - Create module-specific tasks
5. **Update TASK_AUDIT_MAP** - Map tasks to audit item IDs
6. **Update category icon** - Use appropriate icon from lucide-react
7. **Test onboarding** - Verify modal displays correctly
8. **Test task operations** - Start, complete, reset tasks
9. **Test AI Coach** - Open dialog, send messages
10. **Test document upload** - Upload and delete files
11. **Test filters** - Verify all filter combinations
12. **Test bulk actions** - Select multiple, confirm action
13. **Visual audit** - Use this document as checklist
14. **Cross-browser test** - Verify in Chrome, Firefox, Safari
15. **Mobile test** - Verify responsive design

---

## 🔐 FINAL NOTES

**This document is the single source of truth for all module development.**

- Every pattern here is **mandatory** and **non-negotiable**
- If a pattern is not in this document, check EntityFilings.tsx or BusinessLocation.tsx
- Before submitting ANY module, audit against this checklist
- When in doubt, match EntityFilings.tsx exactly
- All 13 modules MUST be pixel-perfect copies with only:
  - Different module names
  - Different task content
  - Different task counts
  - Different FICO impacts

**Everything else must be identical.**

---

**Document Status:** ✅ LOCKED  
**Approved By:** Development Team  
**Implementation Date:** Week 1  
**Next Review:** After completing all 13 modules

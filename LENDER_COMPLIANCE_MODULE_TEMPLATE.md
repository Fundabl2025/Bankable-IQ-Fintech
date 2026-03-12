# 📋 MANDATORY LENDER COMPLIANCE MODULE TEMPLATE

**Authority Document**: This template is based on `/src/app/pages/LenderCompliance/EntityFilings.tsx` which serves as the SINGLE SOURCE OF TRUTH for all Lender Compliance module pages.

## 🎯 RULE: Every Lender Compliance module page MUST follow this exact layout structure.

---

## 📐 REQUIRED LAYOUT STRUCTURE

### 1. **Header Section** (Outside main card)
```tsx
<div className="mb-8">
  {/* Back Button */}
  <Button onClick={() => navigate('/lender-compliance')}>
    <ArrowLeft /> Back to Lender Compliance
  </Button>
  
  {/* Title Row */}
  <div className="flex items-start justify-between gap-4 mb-2">
    <div>
      {/* Module Title + Video Guide Button */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-4xl font-bold">[MODULE NAME]</h1>
        <ThemeButton onClick={() => setShowVideoModal(true)}>
          <Video /> Video Guide
        </ThemeButton>
      </div>
      {/* Subtitle Description */}
      <p className="text-gray-600">[Module description]</p>
    </div>
    
    {/* Right Side Badges */}
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {/* FICO Points Badge */}
        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <Zap /> [X] FICO Points
        </Badge>
        
        {/* Streak Badge (if > 0) */}
        {currentStreak > 0 && (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <Flame /> [X] Day Streak
          </Badge>
        )}
        
        {/* Achievement Count Badge (clickable) */}
        {achievements > 0 && (
          <Badge onClick={() => setShowAchievementGallery(true)}>
            <Trophy /> [X] Achievements
          </Badge>
        )}
      </div>
      
      {/* Quick Start Button */}
      <Button onClick={() => setShowOnboarding(true)}>
        <HelpCircle /> Quick Start
      </Button>
    </div>
  </div>
</div>
```

### 2. **Module Progress Card** (Large Blue Gradient Card)
```tsx
<Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-lg mb-8">
  <div className="p-6">
    {/* Header: Title + Completion Fraction */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Module Progress</h2>
      <span className="text-3xl font-bold">[X]/[Y]</span>
    </div>
    
    {/* Progress Bar */}
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm mb-2">
        <span>Tasks Completed</span>
        <span className="font-bold">[XX]%</span>
      </div>
      <div className="w-full bg-white/30 rounded-full h-3">
        <div className="bg-white rounded-full h-3" style={{ width: `[XX]%` }}></div>
      </div>
    </div>

    {/* FICO Progress Section */}
    <div className="bg-white/20 backdrop-blur rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target />
          <span className="font-bold">FICO Points Earned:</span>
        </div>
        <span className="text-2xl font-bold">[X] / [Y]</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-blue-100">
        <TrendingUp />
        <span>Current Total FICO SBSS: [X]/160</span>
      </div>
    </div>

    {/* Gamification Stats - 3 Boxes */}
    <div className="mt-4 grid grid-cols-3 gap-3">
      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
        <div className="text-2xl font-bold">[X]</div>
        <div className="text-xs text-blue-100">Level</div>
      </div>
      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
        <div className="text-2xl font-bold flex items-center justify-center gap-1">
          [X]
          {streak > 0 && <Flame className="text-orange-400" />}
        </div>
        <div className="text-xs text-blue-100">Day Streak</div>
      </div>
      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
        <div className="text-2xl font-bold">[X]</div>
        <div className="text-xs text-blue-100">Achievements</div>
      </div>
    </div>

    {/* Yellow Warning Banner (if tasks remain) */}
    {completedTasks < totalTasks && (
      <div className="mt-4 bg-yellow-400 text-gray-900 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle />
          <p className="font-bold">
            {completedTasks === 0 
              ? 'Start with critical tasks to unlock funding!' 
              : `[X] task(s) remaining`}
          </p>
        </div>
      </div>
    )}
  </div>
</Card>
```

### 3. **Task Timeline Card** (Collapsible)
```tsx
<Card className="border-2 border-blue-300 mb-8 overflow-hidden">
  {/* Header (Clickable to expand/collapse) */}
  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200 p-4 cursor-pointer" onClick={toggleTimeline}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
          <Clock className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Task Timeline</h3>
          <p className="text-sm text-gray-600">Visual progress tracker with milestones</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-blue-600 text-white">[XX]% Complete</Badge>
        <Button variant="ghost" size="sm">
          {timelineExpanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>
    </div>
  </div>

  {timelineExpanded && (
    <div className="p-6">
      {/* Milestone Progress Bar with 5 stages */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
        {/* Progress line */}
        <div className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600" style={{ width: `[XX]%` }}></div>
        
        <div className="relative flex justify-between">
          {/* Milestone 1: Start (0 tasks) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 border-4 border-blue-600">
              <PlayCircle className="text-white" />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-bold">Start</div>
              <div className="text-xs text-gray-500">0 tasks</div>
            </div>
          </div>

          {/* Milestone 2: First Win (1 task) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-4">
              <CheckCircle />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-bold">First Win</div>
              <div className="text-xs text-gray-500">1 task</div>
            </div>
          </div>

          {/* Milestone 3: Halfway (2 tasks) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-4">
              <TrendingUp />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-bold">Halfway</div>
              <div className="text-xs text-gray-500">2 tasks</div>
            </div>
          </div>

          {/* Milestone 4: Almost There (3 tasks) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-4">
              <Target />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-bold">Almost There</div>
              <div className="text-xs text-gray-500">3 tasks</div>
            </div>
          </div>

          {/* Milestone 5: Complete (all tasks) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-4">
              <Trophy />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-bold">Complete!</div>
              <div className="text-xs text-gray-500">[X] tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Breakdown - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Green: Completed */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
              <CheckCircle className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">[X]</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Orange: In Progress */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg">
              <Clock className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">[X]</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>

        {/* Blue: FICO Points Earned */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
              <Zap className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">[X]</div>
              <div className="text-sm text-gray-600">FICO Points Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Milestone Info */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
        <div className="flex items-start gap-2">
          <div className="text-blue-600">ℹ️</div>
          <div>
            <div className="font-bold text-sm text-gray-900">Next milestone:</div>
            <div className="text-sm text-gray-600">Complete your first task to get started!</div>
          </div>
        </div>
      </div>
    </div>
  )}
</Card>
```

### 4. **Filter & Sort Tasks Section**
```tsx
<Card className="border-2 border-gray-200 mb-8">
  <div className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter />
        <h3 className="font-bold text-gray-900">Filter & Sort Tasks</h3>
      </div>
      <Button variant="ghost" onClick={() => setShowFilters(!showFilters)}>
        Show Filters <ChevronDown />
      </Button>
    </div>

    {showFilters && (
      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        {/* Filter controls go here */}
      </div>
    )}
  </div>
</Card>
```

### 5. **Bulk Actions Tip** (Optional - if tasks support bulk selection)
```tsx
<div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <Lightbulb className="w-4 h-4 text-yellow-600" />
    <span>💡 Tip: Use the square checkboxes to select multiple tasks for bulk actions</span>
  </div>
</div>
```

### 6. **Individual Task Cards**
(Standard task card structure with expand/collapse, metadata, documents, etc.)

---

## 🎨 VISUAL DESIGN RULES

1. **Color Scheme**:
   - Primary gradient: `bg-gradient-to-br from-blue-600 to-cyan-600`
   - Background: `bg-gradient-to-br from-blue-50 via-cyan-50 to-white`
   - FICO badge: Cyan to Blue gradient
   - Streak badge: Orange to Red gradient  
   - Achievement badge: Yellow to Amber gradient

2. **Typography**:
   - Page title: `text-4xl font-bold`
   - Card titles: `text-2xl font-bold`
   - Section headers: `text-lg font-bold`

3. **Spacing**:
   - Main container: `max-w-7xl mx-auto`
   - Card padding: `p-6` or `p-8`
   - Section gaps: `space-y-6` or `mb-8`

4. **Borders**:
   - Module Progress Card: NO border (`border-0`)
   - Timeline Card: `border-2 border-blue-300`
   - Filter Card: `border-2 border-gray-200`

---

## ✅ COMPLIANCE CHECKLIST

Before deploying a Lender Compliance module, verify:

- [ ] Header section with back button, title, video guide button
- [ ] Top-right badges (FICO Points, Streak, Achievements, Quick Start)
- [ ] Large blue Module Progress Card with all 6 subsections
- [ ] Task Timeline Card with 5 milestones and 3 status cards
- [ ] Filter & Sort Tasks section
- [ ] Gamification system integrated (streak, achievements, confetti)
- [ ] AI Coach integration using AICoachChat component
- [ ] Document management for each task
- [ ] Video Explanation Modal
- [ ] Onboarding modal (3-step welcome)
- [ ] All localStorage persistence for user preferences
- [ ] Keyboard shortcuts (Ctrl+A for select all, Escape for clear)
- [ ] Bulk actions support
- [ ] Task metadata (due date, assignee, tags, estimated time)
- [ ] Responsive design

---

## 📦 REQUIRED IMPORTS

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, CheckCircle2, CheckCircle, Circle, ChevronDown, ChevronUp,
  Zap, Target, Award, AlertTriangle, ExternalLink, TrendingUp,
  Bot, Sparkles, HelpCircle, X, ChevronRight, Upload, FileText,
  Download, Trash2, Paperclip, Calendar, User, Tag, Clock, Edit2,
  Filter, SortAsc, Bell, Trophy, PlayCircle, Flame, Star, Video
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AICoachChat } from '../../components/AICoachChat';
import { ThemeButton } from '../../components/ThemeButton';
import { VideoExplanationModal } from '../../components/VideoExplanationModal';
import { 
  getAuditItemById, updateAuditItem, getFicoBankableStatus,
  updateStreak, checkAchievements, getGamificationData,
  getUnlockedAchievements, getLockedAchievements, type Achievement
} from '../../utils/businessData';
```

---

## 🔄 DATA SYNCHRONIZATION

ALL task status changes MUST update the unified data store:

```typescript
const TASK_AUDIT_MAP: { [key: string]: string } = {
  'task-id': 'audit-item-id'
};

const getTaskStatus = (taskId: string): 'complete' | 'incomplete' => {
  const auditId = TASK_AUDIT_MAP[taskId];
  const auditItem = getAuditItemById(auditId);
  return auditItem?.status === 'complete' ? 'complete' : 'incomplete';
};

const handleComplete = (taskId: string) => {
  const auditId = TASK_AUDIT_MAP[taskId];
  updateAuditItem(auditId, { status: newStatus });
  updateStreak();
  checkAchievements();
  // Trigger confetti, toasts, etc.
};
```

---

## 🚨 CRITICAL NOTES

1. **NO DEVIATIONS**: Do not create custom hero sections that combine multiple sections into one gradient card. Follow the structure exactly.

2. **Entity & Filings is the source of truth**: When in doubt, reference `/src/app/pages/LenderCompliance/EntityFilings.tsx`

3. **Consistency is MANDATORY**: All 13 Lender Compliance modules must look and feel identical except for their specific task content.

4. **User Experience**: The predictable layout helps users navigate confidently between different compliance areas.

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-23  
**Authority**: Entity & Filings template

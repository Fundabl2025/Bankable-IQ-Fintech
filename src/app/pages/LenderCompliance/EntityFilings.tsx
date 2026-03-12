import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  CheckCircle2, 
  CheckCircle,
  Circle, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Target,
  Award,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Bot,
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  Upload,
  FileText,
  Download,
  Trash2,
  Paperclip,
  Calendar,
  User,
  Tag,
  Clock,
  Edit2,
  Filter,
  SortAsc,
  Bell,
  Trophy,
  PlayCircle,
  Flame,
  Star,
  Video
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
  getAuditItemById, 
  updateAuditItem, 
  getFicoBankableStatus,
  updateStreak,
  checkAchievements,
  getGamificationData,
  getUnlockedAchievements,
  getLockedAchievements,
  type Achievement
} from '../../utils/businessData';

// Task-to-Audit mapping for this module
const TASK_AUDIT_MAP: { [key: string]: string } = {
  'entity-formation': 'entity-formation',
  'trademark-verification': 'trademark-verification',
  'good-standing': 'good-standing',
  'business-name-review': 'business-name-review'
};

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  ficoImpact: number;
  educationalContent: React.ReactNode;
  resources?: { name: string; url: string }[];
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

interface TaskMetadata {
  dueDate?: string;
  assignedTo?: string;
  tags: string[];
  estimatedTime?: string;
}

export function EntityFilings() {
  const navigate = useNavigate();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiCoachOpenFor, setAiCoachOpenFor] = useState<string | null>(null);
  
  // Onboarding Modal - Check if user has seen it before
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    localStorage.getItem('entity-filings-seen-onboarding') === 'true'
  );
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Quick Start - Check if user has dismissed it permanently
  const [hasSeenQuickStart, setHasSeenQuickStart] = useState(
    localStorage.getItem('entity-filings-seen-quickstart') === 'true'
  );
  const [showQuickStart, setShowQuickStart] = useState(!hasSeenQuickStart);
  
  // Timeline - Remember user's collapse preference
  const [timelineExpanded, setTimelineExpanded] = useState(
    localStorage.getItem('entity-filings-timeline-expanded') !== 'false' // Default to expanded
  );
  
  // Track if user has ever expanded a task (for helper banner)
  const [hasExpandedAnyTask, setHasExpandedAnyTask] = useState(
    localStorage.getItem('entity-filings-has-expanded') === 'true'
  );

  // Gamification State
  const [gamificationData, setGamificationData] = useState(getGamificationData());
  const [showAchievementGallery, setShowAchievementGallery] = useState(false);

  // Bulk Actions State
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<'complete' | 'incomplete' | null>(null);
  
  // Video Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const [documents, setDocuments] = useState<{ [taskId: string]: UploadedDocument[] }>({});
  const [taskMetadata, setTaskMetadata] = useState<{ [taskId: string]: TaskMetadata }>({
    'entity-formation': {
      dueDate: '2026-03-07',
      assignedTo: 'Business Owner',
      tags: ['Legal', 'Formation', 'Required'],
      estimatedTime: '3-5 days'
    },
    'trademark-verification': {
      dueDate: '2026-03-05',
      assignedTo: 'Business Owner',
      tags: ['Legal', 'Compliance'],
      estimatedTime: '1-2 hours'
    },
    'good-standing': {
      dueDate: '2026-03-10',
      assignedTo: 'Business Owner',
      tags: ['State Filing', 'Required'],
      estimatedTime: '1 hour'
    },
    'business-name-review': {
      assignedTo: 'Marketing Team',
      tags: ['Compliance', 'Review'],
      estimatedTime: '30 mins'
    }
  });
  const [editingMetadataFor, setEditingMetadataFor] = useState<string | null>(null);

  // Temp state for metadata editing modal
  const [tempDueDate, setTempDueDate] = useState('');
  const [tempAssignedTo, setTempAssignedTo] = useState('');
  const [tempEstimatedTime, setTempEstimatedTime] = useState('');
  const [tempTags, setTempTags] = useState('');

  // Filtering & sorting state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'none'>('none');
  const [statusFilter, setStatusFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load temp values when opening edit modal
  useEffect(() => {
    if (editingMetadataFor) {
      const metadata = taskMetadata[editingMetadataFor] || { tags: [] };
      setTempDueDate(metadata.dueDate || '');
      setTempAssignedTo(metadata.assignedTo || '');
      setTempEstimatedTime(metadata.estimatedTime || '');
      setTempTags(metadata.tags.join(', '));
    }
  }, [editingMetadataFor, taskMetadata]);

  // Keyboard shortcuts for bulk actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A or Cmd+A - Select all tasks
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAllTasks();
      }
      
      // Escape - Clear selection
      if (e.key === 'Escape' && selectedTasks.size > 0) {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTasks]);

  // Get task status from unified system
  const getTaskStatus = (taskId: string): 'complete' | 'incomplete' => {
    const auditItemId = TASK_AUDIT_MAP[taskId];
    const auditItem = getAuditItemById(auditItemId);
    return auditItem?.status || 'incomplete';
  };

  // Toggle task completion in unified system
  const toggleTask = (taskId: string) => {
    const auditItemId = TASK_AUDIT_MAP[taskId];
    const currentStatus = getTaskStatus(taskId);
    
    if (currentStatus === 'complete') {
      updateAuditItem(auditItemId, { status: 'incomplete' });
    } else {
      // Mark complete
      updateAuditItem(auditItemId, { 
        status: 'complete',
        completedDate: new Date().toISOString(),
        source: 'manual'
      });

      // 🎮 GAMIFICATION: Update streak
      const streak = updateStreak();

      // 🎮 GAMIFICATION: Check for newly unlocked achievements
      const newAchievements = checkAchievements();
      
      // Calculate new percentage after this completion
      const newCompletedCount = tasks.filter(t => {
        const status = getTaskStatus(t.id);
        return t.id === taskId ? true : status === 'complete';
      }).length;
      const newPercentage = Math.round((newCompletedCount / totalTasks) * 100);
      
      // 🎊 CELEBRATION: Milestone-specific confetti
      if (newPercentage === 100) {
        // 🎉 100% - MASSIVE EXPLOSION
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        
        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }
        
        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          
          const particleCount = 50 * (timeLeft / duration);
          
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);
        
      } else if (newPercentage === 75) {
        // 💎 75% - Rainbow confetti
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
        });
      } else if (newPercentage === 50) {
        // 🏆 50% - Large burst from both sides
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      } else if (newPercentage === 25) {
        // ⭐ 25% - Star burst
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          shapes: ['star']
        });
      } else {
        // Regular task completion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // 🏆 ACHIEVEMENT TOAST: Show newly unlocked achievements
      newAchievements.forEach(achievement => {
        toast.success(
          <div className="flex items-center gap-3">
            <span className="text-3xl">{achievement.icon}</span>
            <div>
              <div className="font-bold">{achievement.title}</div>
              <div className="text-sm text-gray-600">{achievement.description}</div>
            </div>
          </div>,
          { duration: 5000 }
        );
      });

      // 🔥 STREAK TOAST: Show streak updates
      if (streak.currentStreak > 1) {
        toast(
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold">{streak.currentStreak}-day streak! Keep it going!</span>
          </div>,
          { duration: 3000 }
        );
      }

      // Refresh gamification data
      setGamificationData(getGamificationData());
    }
    
    // Trigger updates across app
    window.dispatchEvent(new Event('scanDataUpdated'));
    setRefreshKey(prev => prev + 1);
  };

  // Bulk Action Functions
  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const selectAllTasks = () => {
    setSelectedTasks(new Set(tasks.map(t => t.id)));
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
  };

  const executeBulkAction = (action: 'complete' | 'incomplete') => {
    if (selectedTasks.size === 0) return;
    
    // Show confirmation dialog
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = () => {
    if (!bulkAction || selectedTasks.size === 0) return;

    selectedTasks.forEach(taskId => {
      const auditItemId = TASK_AUDIT_MAP[taskId];
      
      if (bulkAction === 'complete') {
        updateAuditItem(auditItemId, { 
          status: 'complete',
          completedDate: new Date().toISOString(),
          source: 'manual'
        });
      } else {
        updateAuditItem(auditItemId, { status: 'incomplete' });
      }
    });

    // Show bulk completion celebration
    if (bulkAction === 'complete') {
      // Update streak once for bulk
      updateStreak();
      
      // Check achievements
      const newAchievements = checkAchievements();
      
      // Big confetti for bulk completion
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#00ff00', '#00cc00', '#009900']
      });

      // Show toast
      toast.success(
        `✅ ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''} completed!`,
        { duration: 3000 }
      );

      // Show newly unlocked achievements
      newAchievements.forEach(achievement => {
        toast.success(
          <div className="flex items-center gap-3">
            <span className="text-3xl">{achievement.icon}</span>
            <div>
              <div className="font-bold">{achievement.title}</div>
              <div className="text-sm text-gray-600">{achievement.description}</div>
            </div>
          </div>,
          { duration: 5000 }
        );
      });

      // Refresh gamification data
      setGamificationData(getGamificationData());
    } else {
      toast.info(
        `↩️ ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''} marked incomplete`,
        { duration: 2000 }
      );
    }

    // Clear selection and close dialog
    clearSelection();
    setShowBulkConfirm(false);
    setBulkAction(null);

    // Trigger updates
    window.dispatchEvent(new Event('scanDataUpdated'));
    setRefreshKey(prev => prev + 1);
  };

  // Dismiss Quick Start permanently
  const dismissQuickStart = () => {
    localStorage.setItem('entity-filings-seen-quickstart', 'true');
    setHasSeenQuickStart(true);
    setShowQuickStart(false);
  };

  // Toggle timeline collapse state
  const toggleTimeline = () => {
    const newState = !timelineExpanded;
    localStorage.setItem('entity-filings-timeline-expanded', String(newState));
    setTimelineExpanded(newState);
  };

  // Listen for updates from other parts of app
  useEffect(() => {
    const handleUpdate = () => setRefreshKey(prev => prev + 1);
    window.addEventListener('scanDataUpdated', handleUpdate);
    return () => window.removeEventListener('scanDataUpdated', handleUpdate);
  }, []);

  // Document management handlers
  const handleFileUpload = (taskId: string, files: FileList | null) => {
    if (!files) return;
    
    const newDocs: UploadedDocument[] = Array.from(files).map(file => ({
      id: `${taskId}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));
    
    setDocuments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), ...newDocs]
    }));
  };

  const handleDeleteDocument = (taskId: string, docId: string) => {
    setDocuments(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(doc => doc.id !== docId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatUploadDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper functions for due dates
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntilDue = (dateString: string) => {
    const due = new Date(dateString);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (dateString: string) => {
    const days = getDaysUntilDue(dateString);
    if (days < 0) return 'text-red-600 bg-red-100';
    if (days <= 3) return 'text-orange-600 bg-orange-100';
    if (days <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const updateTaskMetadata = (taskId: string, updates: Partial<TaskMetadata>) => {
    setTaskMetadata(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        ...updates
      }
    }));
  };

  // Task definitions
  const tasks: Task[] = [
    {
      id: 'entity-formation',
      title: 'Form Business Entity (LLC or Corporation)',
      description: 'Set up a business entity or verify your business entity is set up correctly.',
      priority: 'critical',
      ficoImpact: 45,
      educationalContent: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Protecting your personal credit and assets is just one of many reasons to operate your company as a separate 
            entity (LLC, C-Corp, S-Corp, etc.). Your business cannot become Bankable and stand on its own for financing 
            without being its own entity.
          </p>
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
            <p className="font-bold text-red-900 mb-2">Don't be fooled!</p>
            <p className="text-red-800 text-sm">
              The business credit reporting agencies will let you build business credit reports under a sole prop or 
              partnership but these are completely worthless as everything you do under those is 100% personal.
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="font-bold text-blue-900 mb-2">Action Steps:</p>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Choose entity type (LLC recommended for most small businesses)</li>
              <li>File Articles of Organization with your Secretary of State</li>
              <li>Obtain your EIN from the IRS</li>
              <li>Keep formation documents safe</li>
            </ol>
          </div>
        </div>
      ),
      resources: [
        { name: 'LegalZoom', url: 'https://legalzoom.com' },
        { name: 'IncFile', url: 'https://incfile.com' }
      ]
    },
    {
      id: 'trademark-verification',
      title: 'Verify No Trademark Infringement',
      description: 'Check the TESS database to ensure your business name does not infringe on existing trademarks.',
      priority: 'high',
      ficoImpact: 0,
      educationalContent: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            When you form your business entity in any State they will have a "Name Availability Check" for that State only. 
            There may be a company in another state that has already trademarked the name, creating infringement issues.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
            <p className="font-bold text-yellow-900 mb-2">Why This Matters:</p>
            <p className="text-yellow-800 text-sm">
              Using a trademarked name can result in expensive lawsuits and force you to rebrand after you've built credit. 
              Check now to avoid problems later!
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="font-bold text-blue-900 mb-2">Action Steps:</p>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Visit the USPTO TESS database</li>
              <li>Search for your exact business name</li>
              <li>Check similar names in your industry</li>
              <li>Document your search results</li>
            </ol>
          </div>
        </div>
      ),
      resources: [
        { name: 'USPTO TESS Database', url: 'https://tess.uspto.gov' }
      ]
    },
    {
      id: 'good-standing',
      title: 'Verify Entity is in Good Standing',
      description: 'Confirm your entity is current with all state filings and fees.',
      priority: 'critical',
      ficoImpact: 25,
      educationalContent: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Your entity must be "In Good Standing" with your Secretary of State. This means all annual reports are filed, 
            all fees are paid, and there are no compliance issues. Lenders check this directly!
          </p>
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
            <p className="font-bold text-red-900 mb-2">Critical for Funding:</p>
            <p className="text-red-800 text-sm">
              Lenders WILL verify your good standing status. If you're not in good standing, your application will be 
              automatically denied. No exceptions.
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="font-bold text-blue-900 mb-2">Action Steps:</p>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Visit your Secretary of State website</li>
              <li>Look up your business entity</li>
              <li>Check status is "Active" or "Good Standing"</li>
              <li>Pay any overdue fees immediately</li>
              <li>File any missing annual reports</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'business-name-review',
      title: 'Review Business Name for High-Risk Terms',
      description: 'Ensure your business name doesn\'t contain terms that trigger automatic lender declines.',
      priority: 'medium',
      ficoImpact: 0,
      educationalContent: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Most business lenders avoid known high-risk businesses and often auto-decline applications based solely on 
            the business name. <strong>These automated systems reject applications before a human even looks at them.</strong>
          </p>
          
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-3">❌ Financial Services Terms (Auto-Decline):</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Loan', 'Lending', 'Credit', 'Debt', 'Financing', 'Capital', 'Funding', 'Bank', 'Mortgage'].map(term => (
                <span key={term} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold border border-red-300">
                  {term}
                </span>
              ))}
            </div>
            <p className="text-sm text-red-800">
              Lenders don't want to lend to other lenders. These terms trigger instant rejection.
            </p>
          </div>

          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-3">⚠️ Regulated Industries (Auto-Decline):</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Cannabis', 'CBD', 'Tobacco', 'Vape', 'Gambling', 'Casino', 'Adult', 'Firearms'].map(term => (
                <span key={term} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold border border-orange-300">
                  {term}
                </span>
              ))}
            </div>
            <p className="text-sm text-orange-800">
              These industries have complex regulations. Most business lenders avoid them entirely.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="font-bold text-blue-900 mb-2">💡 Workarounds if your name has these terms:</p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>1. <strong>File DBA (Doing Business As):</strong> Form entity under safe name, use DBA for marketing</li>
              <li>2. <strong>Rebrand now:</strong> Change your business name before building credit</li>
              <li>3. <strong>Be more specific:</strong> Add industry descriptor to generic terms</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => getTaskStatus(t.id) === 'complete').length;
  const totalFicoAvailable = tasks.reduce((sum, t) => sum + t.ficoImpact, 0);
  const ficoEarned = tasks
    .filter(t => getTaskStatus(t.id) === 'complete')
    .reduce((sum, t) => sum + t.ficoImpact, 0);
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
  
  // Get current FICO from unified system
  const ficoStatus = getFicoBankableStatus();

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      critical: 'border-red-300 bg-red-50',
      high: 'border-orange-300 bg-orange-50',
      medium: 'border-yellow-300 bg-yellow-50',
      low: 'border-green-300 bg-green-50'
    };
    return colors[priority];
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const badges = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return badges[priority];
  };

  // Get all unique tags and assignees
  const allTags = Array.from(new Set(
    Object.values(taskMetadata).flatMap(m => m.tags)
  )).sort();
  
  const allAssignees = Array.from(new Set(
    Object.values(taskMetadata).map(m => m.assignedTo).filter(Boolean)
  )).sort();

  // Filter and sort tasks
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (statusFilter === 'complete') {
      filtered = filtered.filter(t => getTaskStatus(t.id) === 'complete');
    } else if (statusFilter === 'incomplete') {
      filtered = filtered.filter(t => getTaskStatus(t.id) === 'incomplete');
    }

    if (selectedTag) {
      filtered = filtered.filter(t => taskMetadata[t.id]?.tags.includes(selectedTag));
    }

    if (selectedAssignee) {
      filtered = filtered.filter(t => taskMetadata[t.id]?.assignedTo === selectedAssignee);
    }

    if (sortBy === 'dueDate') {
      filtered.sort((a, b) => {
        const dateA = taskMetadata[a.id]?.dueDate;
        const dateB = taskMetadata[b.id]?.dueDate;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const hasActiveFilters = selectedTag || selectedAssignee || statusFilter !== 'all' || sortBy !== 'none';

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        
        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-4 border-blue-500 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold">👋 Welcome to Entity & Filings!</h2>
                  <button onClick={() => setShowOnboarding(false)} className="hover:bg-white/20 rounded-full p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-lg opacity-90">Let's get you started on your path to becoming bankable</p>
              </div>

              <div className="p-8">
                {onboardingStep === 0 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">What is "Bankable"?</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        <strong>"Bankable"</strong> means your business qualifies for financing on its own—without relying on your personal credit.
                      </p>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>To become bankable, you need:</strong>
                        </p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>✓ FICO SBSS Score of <strong>160+</strong></li>
                          <li>✓ Properly formed business entity</li>
                          <li>✓ Business credit established</li>
                          <li>✓ Lender compliance requirements met</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Entity & Filings Module</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        This module contains <strong>{totalTasks} critical tasks</strong> that lay the foundation for your business credit.
                        Complete these to earn <strong>{totalFicoAvailable} FICO points</strong>!
                      </p>
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
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🚀</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Use This Module</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Follow this simple workflow to make the most of your time:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl">1️⃣</div>
                          <div>
                            <p className="font-bold text-gray-900">Expand Tasks</p>
                            <p className="text-sm text-gray-700">Click "View Details" to see what you need to do</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl">2️⃣</div>
                          <div>
                            <p className="font-bold text-gray-900">Complete Tasks</p>
                            <p className="text-sm text-gray-700">Click the circle checkbox when done. Your FICO score updates automatically!</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl">3️⃣</div>
                          <div>
                            <p className="font-bold text-gray-900">Reach 160 = Bankable!</p>
                            <p className="text-sm text-gray-700">Once you hit 160 FICO SBSS, you qualify for business financing</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(step => (
                      <div 
                        key={step} 
                        className={`w-2 h-2 rounded-full ${step === onboardingStep ? 'bg-blue-600' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {onboardingStep > 0 && (
                      <Button variant="outline" onClick={() => setOnboardingStep(onboardingStep - 1)}>
                        Back
                      </Button>
                    )}
                    {onboardingStep < 2 ? (
                      <ThemeButton theme="blue-cyan" onClick={() => setOnboardingStep(onboardingStep + 1)}>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </ThemeButton>
                    ) : (
                      <ThemeButton 
                        theme="green"
                        onClick={() => {
                          localStorage.setItem('entity-filings-seen-onboarding', 'true');
                          setHasSeenOnboarding(true);
                          setShowOnboarding(false);
                        }}
                      >
                        Let's Get Started!
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </ThemeButton>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Metadata Edit Modal */}
        {editingMetadataFor && (() => {
          const task = tasks.find(t => t.id === editingMetadataFor);
          const metadata = taskMetadata[editingMetadataFor] || { tags: [] };
          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="max-w-2xl w-full border-2 border-blue-500 shadow-2xl">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-t-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">✏️ Edit Task Metadata</h2>
                    <button onClick={() => setEditingMetadataFor(null)} className="hover:bg-white/20 rounded-full p-2">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm opacity-90">{task?.title}</p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Due Date */}
                  <div>
                    <label className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={tempDueDate}
                      onChange={(e) => setTempDueDate(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set a deadline to stay on track</p>
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={tempAssignedTo}
                      onChange={(e) => setTempAssignedTo(e.target.value)}
                      placeholder="e.g., Business Owner, Marketing Team, CFO"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Who is responsible for completing this task?</p>
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      value={tempEstimatedTime}
                      onChange={(e) => setTempEstimatedTime(e.target.value)}
                      placeholder="e.g., 30 mins, 1-2 hours, 3-5 days"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">How long will this take?</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tempTags}
                      onChange={(e) => setTempTags(e.target.value)}
                      placeholder="e.g., Legal, Formation, Urgent (comma-separated)"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add comma-separated tags to organize tasks</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                    <Button
                      onClick={() => setEditingMetadataFor(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <ThemeButton
                      theme="blue-cyan"
                      onClick={() => {
                        updateTaskMetadata(editingMetadataFor, {
                          dueDate: tempDueDate || undefined,
                          assignedTo: tempAssignedTo || undefined,
                          estimatedTime: tempEstimatedTime || undefined,
                          tags: tempTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
                        });
                        setEditingMetadataFor(null);
                      }}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Changes
                    </ThemeButton>
                  </div>
                </div>
              </Card>
            </div>
          );
        })()}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/lender-compliance')}
            className="mb-4 w-full sm:w-auto min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Lender Compliance</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Entity & Filings</h1>
                <ThemeButton
                  theme="blue-cyan"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start min-h-[44px]"
                >
                  <Video className="w-4 h-4" />
                  Video Guide
                </ThemeButton>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Establish your business entity and complete necessary state filings</p>
            </div>
            <div className="flex flex-row lg:flex-col items-start lg:items-end gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 text-lg px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  {totalFicoAvailable} FICO Points
                </Badge>
                
                {/* Streak Badge */}
                {gamificationData.streak.currentStreak > 0 && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 text-lg px-4 py-2">
                    <Flame className="w-4 h-4 mr-2" />
                    {gamificationData.streak.currentStreak} Day Streak
                  </Badge>
                )}
                
                {/* Achievement Count Badge */}
                {getUnlockedAchievements().length > 0 && (
                  <Badge 
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-lg px-4 py-2 cursor-pointer hover:from-yellow-600 hover:to-amber-700 transition-all"
                    onClick={() => setShowAchievementGallery(!showAchievementGallery)}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    {getUnlockedAchievements().length} Achievements
                  </Badge>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowOnboarding(true);
                  setOnboardingStep(0);
                  setShowQuickStart(true);
                }}
                size="sm"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-lg mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Module Progress</h2>
              <span className="text-3xl font-bold">{completedTasks}/{totalTasks}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Tasks Completed</span>
                <span className="font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* FICO Progress */}
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span className="font-bold">FICO Points Earned:</span>
                </div>
                <span className="text-2xl font-bold">{ficoEarned} / {totalFicoAvailable}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <TrendingUp className="w-4 h-4" />
                <span>Current Total FICO SBSS: {ficoStatus.currentScore}/160</span>
              </div>
            </div>

            {/* Gamification Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{gamificationData.level}</div>
                <div className="text-xs text-blue-100">Level</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {gamificationData.streak.currentStreak}
                  {gamificationData.streak.currentStreak > 0 && <Flame className="w-5 h-5 text-orange-400" />}
                </div>
                <div className="text-xs text-blue-100">Day Streak</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{getUnlockedAchievements().length}</div>
                <div className="text-xs text-blue-100">Achievements</div>
              </div>
            </div>

            {/* Next Action */}
            {completedTasks < totalTasks && (
              <div className="mt-4 bg-yellow-400 text-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-bold">
                    {completedTasks === 0 ? 'Start with critical tasks to unlock funding!' : `${totalTasks - completedTasks} task${totalTasks - completedTasks > 1 ? 's' : ''} remaining`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 🏆 Achievement Gallery Modal */}
        {showAchievementGallery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Achievement Gallery</h3>
                <button
                  onClick={() => setShowAchievementGallery(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
              {/* Unlocked Achievements */}
              {getUnlockedAchievements().length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Unlocked
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getUnlockedAchievements().map(achievement => (
                      <div
                        key={achievement.id}
                        className="bg-white rounded-lg p-4 border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-4xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-900">{achievement.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                            <p className="text-xs text-gray-500">
                              Unlocked {new Date(achievement.unlockedDate!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {getLockedAchievements().length > 0 && (
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gray-400" />
                    Locked
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getLockedAchievements().map(achievement => (
                      <div
                        key={achievement.id}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-4xl grayscale">{achievement.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-700">{achievement.title}</h5>
                            <p className="text-sm text-gray-500">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Summary */}
              <div className="mt-6 pt-6 border-t-2 border-yellow-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {gamificationData.level}
                    </div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {gamificationData.streak.currentStreak}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {gamificationData.totalPoints}
                    </div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Visual Progress Timeline - Syncs with unified data store */}
        <Card className="border-2 border-blue-300 mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={toggleTimeline}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Task Timeline</h3>
                  <p className="text-sm text-gray-600">Visual progress tracker with milestones</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600 text-white border-0 text-sm px-3 py-1">
                  {progressPercentage}% Complete
                </Badge>
                <Button variant="ghost" size="sm" className="hover:bg-white/50">
                  {timelineExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-700" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {timelineExpanded && (
            <div className="p-6">
            {/* Milestone Progress Bar */}
            <div className="relative mb-8">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
              <div 
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              
              <div className="relative flex justify-between">
                {/* Milestone 1: Start */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    completedTasks >= 0 ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-600' : 'bg-white border-gray-300'
                  } transition-all duration-500 shadow-lg`}>
                    <PlayCircle className={`w-5 h-5 ${completedTasks >= 0 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-gray-900">Start</div>
                    <div className="text-xs text-gray-500">0 tasks</div>
                  </div>
                </div>

                {/* Milestone 2: 25% */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    completedTasks >= 1 ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-600' : 'bg-white border-gray-300'
                  } transition-all duration-500 shadow-lg`}>
                    <CheckCircle className={`w-5 h-5 ${completedTasks >= 1 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-gray-900">First Win</div>
                    <div className="text-xs text-gray-500">1 task</div>
                  </div>
                </div>

                {/* Milestone 3: 50% */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    completedTasks >= 2 ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-600' : 'bg-white border-gray-300'
                  } transition-all duration-500 shadow-lg`}>
                    <TrendingUp className={`w-5 h-5 ${completedTasks >= 2 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-gray-900">Halfway</div>
                    <div className="text-xs text-gray-500">2 tasks</div>
                  </div>
                </div>

                {/* Milestone 4: 75% */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    completedTasks >= 3 ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-600' : 'bg-white border-gray-300'
                  } transition-all duration-500 shadow-lg`}>
                    <Target className={`w-5 h-5 ${completedTasks >= 3 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-gray-900">Almost There</div>
                    <div className="text-xs text-gray-500">3 tasks</div>
                  </div>
                </div>

                {/* Milestone 5: 100% */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    completedTasks === totalTasks ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-600' : 'bg-white border-gray-300'
                  } transition-all duration-500 shadow-lg`}>
                    {completedTasks === totalTasks ? (
                      <Trophy className="w-5 h-5 text-white" />
                    ) : (
                      <Target className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-gray-900">Complete!</div>
                    <div className="text-xs text-gray-500">{totalTasks} tasks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{completedTasks}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalTasks - completedTasks}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{ficoEarned}</div>
                    <div className="text-sm text-gray-600">FICO Points Earned</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Message */}
            {completedTasks === totalTasks ? (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  <div>
                    <div className="font-bold text-lg">🎉 Module Complete!</div>
                    <div className="text-sm text-green-100">
                      You've earned {ficoEarned} FICO points. Your total score is now {ficoStatus.currentScore}/160!
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-gray-900">Next milestone:</span> {
                      completedTasks === 0 ? 'Complete your first task to get started!' :
                      completedTasks === 1 ? 'Complete one more task to reach halfway!' :
                      completedTasks === 2 ? 'You\'re halfway there! Keep going!' :
                      completedTasks === 3 ? 'Just one more task to finish the module!' :
                      'Almost done!'
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </Card>

        {/* Quick Start Guide */}
        {showQuickStart && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 mb-8">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 text-white rounded-full p-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900">🚀 Quick Start Guide</h3>
                    <p className="text-sm text-green-700">Best practices for this module</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickStart(false)}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 text-red-600 rounded-full p-2 flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">⚡ Start with Critical Tasks</h4>
                      <p className="text-sm text-gray-700">
                        Tasks marked <span className="font-bold text-red-600">CRITICAL</span> are required for lender approval. Complete these first to maximize your FICO score.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">📄 Keep Documents Handy</h4>
                      <p className="text-sm text-gray-700">
                        Have your Articles of Organization, EIN letter, and formation documents ready. You'll need them for verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-100 text-cyan-600 rounded-full p-2 flex-shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🤖 Use Your AI Coach</h4>
                      <p className="text-sm text-gray-700">
                        Stuck on something? Click "Ask AI Coach" in any task for instant help. It's like having an expert on call 24/7!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full p-2 flex-shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">⏰ Set a Timeline</h4>
                      <p className="text-sm text-gray-700">
                        Most businesses complete this module in <span className="font-bold">1-2 weeks</span>. Block time on your calendar to stay on track!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">⚡ Use Bulk Actions</h4>
                      <p className="text-sm text-gray-700">
                        Check the square boxes to select multiple tasks. Then use bulk actions to mark them complete/incomplete at once. <span className="font-bold">Ctrl+A</span> to select all!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <p className="font-bold">
                    💡 Pro Tip: Entity formation is the foundation of everything. Get this right, and the rest becomes easier!
                  </p>
                </div>
              </div>

              {/* Dismiss Button */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  You can always reopen this guide from the "Quick Start" button in the header
                </p>
                <Button
                  onClick={dismissQuickStart}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100 flex-shrink-0"
                >
                  Got it, don't show again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filtering & Sorting Panel */}
        <Card className="bg-white border-2 border-gray-300 mb-6">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Filter & Sort Tasks</h3>
                {hasActiveFilters && (
                  <Badge variant="outline" className="text-xs">
                    {filteredTasks.length} of {tasks.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-4">
                {/* Quick Presets */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Quick Views:</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={statusFilter === 'incomplete' && sortBy === 'dueDate' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setStatusFilter('incomplete');
                        setSortBy('dueDate');
                      }}
                      className="text-xs"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Overdue & Urgent
                    </Button>
                    <Button
                      variant={sortBy === 'priority' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('priority')}
                      className="text-xs"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      By Priority
                    </Button>
                    <Button
                      variant={statusFilter === 'incomplete' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('incomplete')}
                      className="text-xs"
                    >
                      <Circle className="w-3 h-3 mr-1" />
                      Not Complete
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="all">All Tasks</option>
                      <option value="incomplete">Incomplete</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>

                  {/* Tag Filter */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Tag:</label>
                    <select
                      value={selectedTag || ''}
                      onChange={(e) => setSelectedTag(e.target.value || null)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="">All Tags</option>
                      {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assignee Filter */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Assigned To:</label>
                    <select
                      value={selectedAssignee || ''}
                      onChange={(e) => setSelectedAssignee(e.target.value || null)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="">All Assignees</option>
                      {allAssignees.map(assignee => (
                        <option key={assignee} value={assignee}>{assignee}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Sort By:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="none">Default Order</option>
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {statusFilter !== 'all' && (
                        <Badge variant="outline" className="text-xs">
                          Status: {statusFilter}
                          <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                      {selectedTag && (
                        <Badge variant="outline" className="text-xs">
                          Tag: {selectedTag}
                          <button onClick={() => setSelectedTag(null)} className="ml-1 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                      {selectedAssignee && (
                        <Badge variant="outline" className="text-xs">
                          Assignee: {selectedAssignee}
                          <button onClick={() => setSelectedAssignee(null)} className="ml-1 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                      {sortBy !== 'none' && (
                        <Badge variant="outline" className="text-xs">
                          Sort: {sortBy === 'dueDate' ? 'Due Date' : 'Priority'}
                          <button onClick={() => setSortBy('none')} className="ml-1 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTag(null);
                        setSelectedAssignee(null);
                        setStatusFilter('all');
                        setSortBy('none');
                      }}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Bulk Action Bar */}
        {selectedTasks.size > 0 && (
          <Card className="border-2 border-cyan-400 bg-gradient-to-r from-cyan-50 to-blue-50 mb-4 sticky top-4 z-10 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-600" />
                    <span className="font-bold text-gray-900">
                      {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeBulkAction('complete')}
                      className="bg-green-600 text-white hover:bg-green-700 border-0"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeBulkAction('incomplete')}
                      className="bg-orange-600 text-white hover:bg-orange-700 border-0"
                    >
                      <Circle className="w-4 h-4 mr-2" />
                      Mark Incomplete
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearSelection}
                      className="bg-gray-600 text-white hover:bg-gray-700 border-0"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded border border-gray-300">
                    <kbd className="font-mono font-bold">Ctrl+A</kbd> to select all • <kbd className="font-mono font-bold">Esc</kbd> to clear
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllTasks}
                  >
                    Select All ({totalTasks})
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Bulk Confirmation Dialog */}
        {showBulkConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-2 border-cyan-500 shadow-2xl">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-t-xl">
                <h2 className="text-2xl font-bold">Confirm Bulk Action</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to mark <strong>{selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''}</strong> as{' '}
                  <strong className={bulkAction === 'complete' ? 'text-green-600' : 'text-orange-600'}>
                    {bulkAction}
                  </strong>?
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

        {/* First-Time User Helper Banner */}
        {!hasExpandedAnyTask && filteredTasks.length > 0 && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-cyan-50 via-blue-50 to-cyan-50 border-2 border-cyan-400 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="bg-cyan-500 text-white rounded-full p-3 flex-shrink-0 animate-pulse">
                <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                  👋 New here? Click <span className="text-blue-600">"View Details"</span> on any task to get started!
                </p>
                <p className="text-xs sm:text-sm text-gray-700">
                  Each task contains step-by-step instructions, AI coaching, document upload, and resources to help you become bankable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Hint - Only show when nothing selected */}
        {selectedTasks.size === 0 && filteredTasks.length > 1 && hasExpandedAnyTask && (
          <div className="mb-4 p-3 bg-cyan-50 border-2 border-cyan-200 rounded-lg">
            <p className="text-sm text-cyan-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>💡 <strong>Tip:</strong> Use the square checkboxes to select multiple tasks for bulk actions</span>
            </p>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isComplete = getTaskStatus(task.id) === 'complete';
            const isExpanded = expandedTasks.has(task.id);
            const isSelected = selectedTasks.has(task.id);
            
            return (
              <Card 
                key={task.id}
                className={`border-2 transition-all ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-50 shadow-lg' 
                    : getPriorityColor(task.priority)
                } ${isComplete ? 'opacity-75' : ''}`}
              >
                <div className="p-3 sm:p-4 md:p-5">
                  
                  {/* Task Header */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskSelection(task.id);
                      }}
                      className={`mt-1 flex-shrink-0 hover:scale-110 transition-all border-2 rounded ${
                        selectedTasks.has(task.id)
                          ? 'bg-cyan-600 border-cyan-600'
                          : 'border-gray-300 hover:border-cyan-400'
                      }`}
                      style={{ width: '20px', height: '20px' }}
                      title="Select for bulk actions"
                    >
                      {selectedTasks.has(task.id) && (
                        <CheckCircle className="w-4 h-4 text-white -m-0.5" />
                      )}
                    </button>
                    
                    {/* Completion Checkbox */}
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
                      title={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                        <h3 className={`text-base sm:text-lg font-bold ${isComplete ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <Badge className={`${getPriorityBadge(task.priority)} text-xs px-2 py-1 border`}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          {task.ficoImpact > 0 && (
                            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              {task.ficoImpact} pts
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{task.description}</p>

                      {/* Task Metadata Badges */}
                      {taskMetadata[task.id] && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {taskMetadata[task.id].dueDate && (
                            <Badge className={`${getDueDateColor(taskMetadata[task.id].dueDate!)} border font-medium text-xs`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              Due {formatDueDate(taskMetadata[task.id].dueDate!)}
                              {getDaysUntilDue(taskMetadata[task.id].dueDate!) >= 0 && 
                                ` (${getDaysUntilDue(taskMetadata[task.id].dueDate!)}d)`}
                            </Badge>
                          )}
                          {taskMetadata[task.id].assignedTo && (
                            <Badge variant="outline" className="text-xs font-medium">
                              <User className="w-3 h-3 mr-1" />
                              {taskMetadata[task.id].assignedTo}
                            </Badge>
                          )}
                          {taskMetadata[task.id].estimatedTime && (
                            <Badge variant="outline" className="text-xs font-medium">
                              <Clock className="w-3 h-3 mr-1" />
                              {taskMetadata[task.id].estimatedTime}
                            </Badge>
                          )}
                          {taskMetadata[task.id].tags && taskMetadata[task.id].tags.length > 0 && (
                            <>
                              {taskMetadata[task.id].tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMetadataFor(task.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <ThemeButton
                          theme="blue-cyan"
                          variant="outline"
                          size="sm"
                          onClick={() => setAiCoachOpenFor(task.id)}
                          className="w-full sm:w-auto justify-center sm:justify-start min-h-[44px]"
                        >
                          <Bot className="w-4 h-4 mr-2 sm:mr-1" />
                          AI Coach
                        </ThemeButton>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={() => {
                            const newExpanded = new Set(expandedTasks);
                            if (isExpanded) {
                              newExpanded.delete(task.id);
                            } else {
                              newExpanded.add(task.id);
                              // Track that user has expanded a task
                              if (!hasExpandedAnyTask) {
                                localStorage.setItem('entity-filings-has-expanded', 'true');
                                setHasExpandedAnyTask(true);
                              }
                            }
                            setExpandedTasks(newExpanded);
                          }}
                          className="border-2 border-blue-600 hover:bg-blue-50 hover:border-blue-700 font-bold shadow-sm transition-all min-h-[44px]"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-5 h-5 mr-2" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-5 h-5 mr-2" />
                              <span className="hidden sm:inline">View Details & Instructions</span>
                              <span className="sm:hidden">View Details</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-6">
                      
                      {/* Educational Content */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          What You Need to Know:
                        </h4>
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                          {task.educationalContent}
                        </div>
                      </div>

                      {/* Resources */}
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

                      {/* AI Coach Section */}
                      {aiCoachOpenFor === task.id ? (
                        <AICoachChat
                          taskTitle={task.title}
                          taskContext={task.description}
                          onClose={() => setAiCoachOpenFor(null)}
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-5">
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
                      )}

                      {/* Document Management Section */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Paperclip className="w-5 h-5 text-blue-600" />
                          Documents & Files:
                        </h4>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-5">
                          {/* Upload Area */}
                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center hover:bg-blue-50/50 transition-colors">
                              <Upload className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                              <p className="font-bold text-blue-900 mb-1">Click to upload documents</p>
                              <p className="text-sm text-gray-600">or drag and drop files here</p>
                              <p className="text-xs text-gray-500 mt-2">PDF, PNG, JPG, DOC up to 10MB</p>
                            </div>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => handleFileUpload(task.id, e.target.files)}
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            />
                          </label>

                          {/* Uploaded Documents List */}
                          {documents[task.id] && documents[task.id].length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-sm font-bold text-gray-700 mb-2">
                                📎 {documents[task.id].length} document{documents[task.id].length > 1 ? 's' : ''} uploaded:
                              </p>
                              {documents[task.id].map((doc) => (
                                <div key={doc.id} className="bg-white rounded-lg p-3 border-2 border-blue-200 flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(doc.size)} • Uploaded {formatUploadDate(doc.uploadedAt)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        // In real app, this would download the file
                                        alert('Download functionality would trigger here');
                                      }}
                                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                      title="Download"
                                    >
                                      <Download className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDocument(task.id, doc.id)}
                                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <Button 
                          onClick={() => toggleTask(task.id)}
                          className={isComplete ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {isComplete ? 'Mark as Incomplete' : 'Mark as Complete'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Implementation Timeline */}
        <Card className="mt-8">
          <div 
            className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={toggleTimeline}
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Implementation Timeline
            </h3>
            {timelineExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
          
          {timelineExpanded && (
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-semibold text-gray-900 mb-2">Week 1: Entity Formation</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Research and select the best business structure (LLC or Corporation). File formation documents with your state and obtain Certificate of Formation.
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Legal Foundation</Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-semibold text-gray-900 mb-2">Week 2: Trademark & Compliance Check</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Verify your business name has no trademark conflicts. Ensure entity is in good standing and review for any high-risk terms in your business name.
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Risk Prevention</Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Week 3-4: Ongoing Maintenance</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Keep annual reports filed on time, maintain registered agent service, and ensure all state fees are current to stay in good standing.
                    </p>
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">Ongoing</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Module Complete Celebration */}
        {completedTasks === totalTasks && (
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl mt-8">
            <div className="p-8 text-center">
              <Award className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-3">🎉 Module Complete!</h2>
              <p className="text-xl mb-2">You completed all Entity & Filings tasks!</p>
              <p className="text-lg mb-6">
                You earned <strong>+{ficoEarned} FICO points</strong>!
              </p>
              <Button 
                onClick={() => navigate('/lender-compliance')}
                className="bg-white text-green-600 hover:bg-green-50 font-bold text-lg py-6 px-8"
              >
                Continue to Next Module
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {/* Video Explanation Modal */}
      <VideoExplanationModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl="https://assets.cdn.filesafe.space/uamzHygM1jRY78rPSYvc/media/69916c48c0866523400608f9.mp4"
        title="Entity & Filings - Module Overview"
        theme="blue-cyan"
      />
    </div>
  );
}
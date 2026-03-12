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
  MapPin,
  Home,
  Building2,
  ShieldAlert,
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
  'business-address': 'business-address'
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

export function BusinessLocation() {
  const navigate = useNavigate();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiCoachOpenFor, setAiCoachOpenFor] = useState<string | null>(null);
  
  // Onboarding Modal - Check if user has seen it before
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    localStorage.getItem('business-location-seen-onboarding') === 'true'
  );
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Quick Start - Check if user has dismissed it permanently
  const [hasSeenQuickStart, setHasSeenQuickStart] = useState(
    localStorage.getItem('business-location-seen-quickstart') === 'true'
  );
  const [showQuickStart, setShowQuickStart] = useState(!hasSeenQuickStart);
  
  // Timeline - Remember user's collapse preference
  const [timelineExpanded, setTimelineExpanded] = useState(
    localStorage.getItem('business-location-timeline-expanded') !== 'false' // Default to expanded
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
    'business-address': {
      dueDate: '2026-03-07',
      assignedTo: 'Business Owner',
      tags: ['Critical', 'USPS', 'Required'],
      estimatedTime: '2-3 hours'
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
    const currentItem = getAuditItemById(auditItemId);
    const newStatus = currentItem?.status === 'complete' ? 'incomplete' : 'complete';
    
    updateAuditItem(auditItemId, { status: newStatus });
    
    // Update streak and check for achievements when completing
    if (newStatus === 'complete') {
      updateStreak();
      const newAchievements = checkAchievements();
      
      // Show confetti for task completion
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      
      // Show achievement notifications
      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
            description: achievement.description,
            duration: 5000
          });
        });
        
        // Extra confetti for achievements
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.5 }
          });
        }, 300);
      }
      
      // Refresh gamification data
      setGamificationData(getGamificationData());
    }
    
    setRefreshKey(prev => prev + 1);
  };

  // Bulk action handlers
  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const selectAllTasks = () => {
    const allTaskIds = tasks.map(t => t.id);
    setSelectedTasks(new Set(allTaskIds));
    toast.info(`Selected all ${allTaskIds.length} tasks`);
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
  };

  const handleBulkAction = (action: 'complete' | 'incomplete') => {
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;

    const targetStatus = bulkAction;
    let completedCount = 0;
    let newAchievements: Achievement[] = [];

    selectedTasks.forEach(taskId => {
      const auditItemId = TASK_AUDIT_MAP[taskId];
      const currentItem = getAuditItemById(auditItemId);
      
      // Only update if status is different
      if (currentItem?.status !== targetStatus) {
        updateAuditItem(auditItemId, { status: targetStatus });
        completedCount++;
        
        if (targetStatus === 'complete') {
          updateStreak();
          const achievements = checkAchievements();
          newAchievements = [...newAchievements, ...achievements];
        }
      }
    });

    if (completedCount > 0) {
      // Show confetti for bulk completions
      if (targetStatus === 'complete') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      toast.success(
        `${completedCount} task${completedCount > 1 ? 's' : ''} marked as ${targetStatus}!`
      );

      // Show achievement notifications
      if (newAchievements.length > 0) {
        const uniqueAchievements = Array.from(
          new Map(newAchievements.map(a => [a.id, a])).values()
        );
        
        uniqueAchievements.forEach(achievement => {
          toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
            description: achievement.description,
            duration: 5000
          });
        });
        
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 120,
            origin: { y: 0.5 }
          });
        }, 300);
      }

      setGamificationData(getGamificationData());
      setRefreshKey(prev => prev + 1);
    }

    clearSelection();
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const saveMetadata = () => {
    if (!editingMetadataFor) return;
    
    setTaskMetadata(prev => ({
      ...prev,
      [editingMetadataFor]: {
        dueDate: tempDueDate,
        assignedTo: tempAssignedTo,
        tags: tempTags.split(',').map(t => t.trim()).filter(Boolean),
        estimatedTime: tempEstimatedTime
      }
    }));
    
    setEditingMetadataFor(null);
    toast.success('Task metadata updated!');
  };

  const handleFileUpload = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newDocs: UploadedDocument[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));

    setDocuments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), ...newDocs]
    }));

    toast.success(`${newDocs.length} document(s) uploaded!`);
  };

  const removeDocument = (taskId: string, docId: string) => {
    setDocuments(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(doc => doc.id !== docId)
    }));
    toast.info('Document removed');
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('business-location-seen-onboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const dismissQuickStart = () => {
    setShowQuickStart(false);
    localStorage.setItem('business-location-seen-quickstart', 'true');
    setHasSeenQuickStart(true);
  };

  const toggleTimeline = () => {
    const newState = !timelineExpanded;
    setTimelineExpanded(newState);
    localStorage.setItem('business-location-timeline-expanded', String(newState));
  };





  const tasks: Task[] = [
    {
      id: 'business-address',
      title: 'Set up USPS-compliant business address',
      description: 'Establish a proper business address that meets lender requirements and USPS compliance standards',
      priority: 'critical',
      ficoImpact: 5,
      educationalContent: (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Critical Requirement</h4>
                <p className="text-sm text-amber-800">
                  Your business MUST be at a US Postal Service listed business address. Using residential addresses or mail stops (like UPS Store, FedEx Office, Postal Annex) will result in immediate decline.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Understanding Business Addresses</h4>
            <p className="text-sm text-gray-700 mb-4">
              You can have a home-based business, but it will limit your access to most lenders and to becoming bankable. Building strong business credit and getting approved for financing is all about paying attention to the details.
            </p>
            <p className="text-sm text-gray-700 mb-4">
              It is very important that we have your exact business legal name. This includes the recorded DBA filing you will be using. It is not required to have a DBA, but if you need one (or already have one) there are potential issues to be aware of.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">DO NOT USE MAIL STOPS (Box Rentals)</h4>
                <p className="text-sm text-red-800 mb-3">
                  A Mail Stop is your local post office or postal type store that will rent you a mailbox inside their store location. These addresses will show lenders that your business is not real and may be a very high risk of default.
                </p>
                <p className="text-sm text-red-800 mb-2">
                  <strong>Examples of mail stops to AVOID:</strong>
                </p>
                <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                  <li>The UPS Store</li>
                  <li>FedEx Office</li>
                  <li>Postal Annex</li>
                  <li>PostNet</li>
                  <li>Any other local mailbox rental service</li>
                </ul>
                <p className="text-sm text-red-800 mt-3">
                  Potential creditors will Google your stated business location and see these store fronts are obviously not your business location. When your business address is Google searched you want it to show as an office building, executive suite, or shared work space.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">USPS Listed Business Address - The Solution</h4>
                <p className="text-sm text-blue-800 mb-3">
                  To properly establish and build credit, your business needs a deliverable physical address and not a PO Box. If you don't have an actual storefront or office location, you can run your business from anywhere and still have a qualifying business address with a Virtual Office Solution.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Why Home Addresses Are Risky</h4>
            <p className="text-sm text-gray-700 mb-4">
              Past history has shown lenders that home-based businesses default on their loans at a rate of 10 to 20 times higher than that of physical business location businesses. What this means is that if you put a residential address on any business loan or credit application, you will be immediately tagged as a much higher risk of default and therefore much more likely to be declined.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> You can use your home address for business credit building, but be aware that some lenders will not fund "home based" businesses. This will not stop you from building business credit scores, but may limit your funding options.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Avoiding DBA Credit File Confusion</h4>
            <p className="text-sm text-gray-700 mb-4">
              Filing DBAs for your Corporation or LLC can cause multiple credit files to open if you're not careful. For example, say your business bank account is under "ABC Corporation" but you open a credit account as "ABC Corporation, dba ABC Tire Service", and you have another credit account that you opened as just "ABC Tire Service".
            </p>
            <p className="text-sm text-gray-700 mb-4">
              What will happen in the above example is that your business ends up with three open credit files under all three names...and now you have a mess.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Solution:</strong> If you're going to use a DBA you'll need to avoid creating duplicate credit files. All banking, utilities, offices leases, credit accounts, etc. must be opened as <strong>"ABC Corporation dba ABC Tire Service"</strong> consistently.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">USPS Address Verification</h4>
            <p className="text-sm text-gray-700 mb-4">
              Our system is integrated with the USPS database. The best way to know if the address you are using will work or not is to test it. Put the address in and click "save and continue". Then come back to this page.
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>If the address shows <strong>"Residential"</strong> or <strong>"Mail Stop"</strong> - you need to fix this</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>If the address comes back as <strong>"Business"</strong> or <strong>"Unknown"</strong> - you are fine using that address</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      resources: [
        { name: 'Davinci Virtual Offices', url: 'https://www.davincivirtual.com' },
        { name: 'Alliance Virtual Offices', url: 'https://www.alliancevirtualoffices.com' },
        { name: 'Opus Virtual Offices', url: 'https://www.opusvirtualoffices.com' },
        { name: 'iPostal1', url: 'https://www.ipostal1.com' }
      ]
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

  // Get gamification stats - using state variable already declared at line 115
  const totalPoints = gamificationData.totalPoints;

  // Aliases for consistency with JSX references
  const completedCount = completedTasks;
  const totalCount = totalTasks;
  const maxPoints = totalFicoAvailable;

  // Filtering logic
  const allTags = Array.from(new Set(Object.values(taskMetadata).flatMap(m => m.tags)));
  const allAssignees = Array.from(new Set(Object.values(taskMetadata).map(m => m.assignedTo).filter(Boolean)));

  const filteredTasks = tasks.filter(task => {
    // Status filter
    const status = getTaskStatus(task.id);
    if (statusFilter === 'complete' && status !== 'complete') return false;
    if (statusFilter === 'incomplete' && status !== 'incomplete') return false;

    // Tag filter
    const metadata = taskMetadata[task.id];
    if (selectedTag && (!metadata || !metadata.tags.includes(selectedTag))) return false;

    // Assignee filter
    if (selectedAssignee && metadata?.assignedTo !== selectedAssignee) return false;

    return true;
  });

  // Sorting logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      const dateA = taskMetadata[a.id]?.dueDate || '';
      const dateB = taskMetadata[b.id]?.dueDate || '';
      return dateA.localeCompare(dateB);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  // Get active filters count
  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) + 
    (selectedTag ? 1 : 0) + 
    (selectedAssignee ? 1 : 0) + 
    (sortBy !== 'none' ? 1 : 0);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-4 border-blue-500 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">🏢 Welcome to Business Location!</h2>
                <button 
                  onClick={() => setShowOnboarding(false)} 
                  className="hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-lg opacity-90">Your address is critical for lender approval</p>
            </div>

            <div className="p-8">
              {onboardingStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Why Address Matters</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Your business address is <strong>critical for lender approval</strong>. A USPS-compliant business address shows credibility and dramatically increases your funding chances.
                    </p>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Lenders check your address to verify:</strong>
                      </p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>✓ You have a real business location</li>
                        <li>✓ Your business is not high-risk</li>
                        <li>✓ NAP (Name, Address, Phone) consistency</li>
                        <li>✓ USPS database compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">The Home Address Problem</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Home-based businesses default on loans <strong>10-20x more often</strong> than physical locations. Lenders flag residential addresses as high risk.
                    </p>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 text-left space-y-2">
                      <div className="flex items-start gap-2">
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700"><strong>Residential address</strong> = Auto-decline risk</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700"><strong>Mail stops</strong> (UPS Store, FedEx) = Instant reject</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700"><strong>USPS Business address</strong> = Approved ✓</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Solution</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Don't have a physical office? No problem! Here's how to get USPS-compliant:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl">1️⃣</div>
                        <div>
                          <p className="font-bold text-gray-900">Verify Current Address</p>
                          <p className="text-sm text-gray-700">Check if your address is "Business" or "Residential" in USPS database</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl">2️⃣</div>
                        <div>
                          <p className="font-bold text-gray-900">Get Virtual Office</p>
                          <p className="text-sm text-gray-700">Use a USPS-compliant virtual office provider (we recommend 4 trusted options)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl">3️⃣</div>
                        <div>
                          <p className="font-bold text-gray-900">Update Everywhere</p>
                          <p className="text-sm text-gray-700">Use the exact same address format on all accounts, credit files, and filings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200">
                {/* Progress Dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map(step => (
                    <div
                      key={step}
                      className={`h-2.5 w-2.5 rounded-full transition-all ${
                        step === onboardingStep 
                          ? 'bg-cyan-600 w-8' 
                          : step < onboardingStep 
                          ? 'bg-cyan-300' 
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {onboardingStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setOnboardingStep(prev => prev - 1)}
                      className="border-cyan-300 text-cyan-700"
                    >
                      Back
                    </Button>
                  )}
                  <ThemeButton
                    theme={onboardingStep < 2 ? 'blue-cyan' : 'green'}
                    onClick={() => {
                      if (onboardingStep < 2) {
                        setOnboardingStep(prev => prev + 1);
                      } else {
                        completeOnboarding();
                      }
                    }}
                  >
                    {onboardingStep < 2 ? 'Next' : 'Get Started'}
                  </ThemeButton>
                </div>
              </div>

              {/* Skip Tutorial Link */}
              <div className="text-center mt-4">
                <button
                  onClick={completeOnboarding}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Skip tutorial
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Confirm Bulk Action
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} as <strong>{bulkAction}</strong>?
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
        </div>
      )}

      {/* Achievement Gallery Modal */}
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
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Unlocked ({getUnlockedAchievements().length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getUnlockedAchievements().map(achievement => (
                    <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{achievement.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              +{achievement.points} pts
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(achievement.unlockedAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locked Achievements */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-400" />
                  Locked ({getLockedAchievements().length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getLockedAchievements().map(achievement => (
                    <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-60">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl grayscale">{achievement.icon}</div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-700 mb-1">{achievement.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                            +{achievement.points} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Edit Modal */}
      {editingMetadataFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Task Metadata</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={tempDueDate}
                  onChange={(e) => setTempDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={tempAssignedTo}
                  onChange={(e) => setTempAssignedTo(e.target.value)}
                  placeholder="e.g., Business Owner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Time
                </label>
                <input
                  type="text"
                  value={tempEstimatedTime}
                  onChange={(e) => setTempEstimatedTime(e.target.value)}
                  placeholder="e.g., 2-3 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tempTags}
                  onChange={(e) => setTempTags(e.target.value)}
                  placeholder="e.g., Critical, USPS, Required"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingMetadataFor(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <ThemeButton
                theme="blue-cyan"
                onClick={saveMetadata}
                className="flex-1"
              >
                Save
              </ThemeButton>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/lender-compliance')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lender Compliance
          </Button>
          
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">Business Location</h1>
                <ThemeButton
                  theme="blue-cyan"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video Guide
                </ThemeButton>
              </div>
              <p className="text-gray-600">USPS-compliant business address setup</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 text-lg px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  {maxPoints} FICO Points
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
        <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Module Progress</h2>
              <span className="text-3xl font-bold">{completedCount}/{totalCount}</span>
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
                <span className="text-sm font-medium">FICO Points Earned</span>
                <span className="text-2xl font-bold">{totalPoints}/{maxPoints}</span>
              </div>
              <p className="text-sm opacity-90">
                Complete all tasks to earn {maxPoints} points toward your FICO SBSS score
              </p>
            </div>
          </div>
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
                  onClick={dismissQuickStart}
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
                      <h4 className="font-bold text-gray-900 mb-2">⚡ Verify Address First</h4>
                      <p className="text-sm text-gray-700">
                        Check if your address is listed as "Business" in USPS. Residential or Mail Stop addresses get auto-declined by lenders.
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
                      <h4 className="font-bold text-gray-900 mb-2">📍 Update All Records</h4>
                      <p className="text-sm text-gray-700">
                        Use the exact same address format everywhere: State of State, IRS, banks, credit bureaus, and all business accounts.
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
                      <h4 className="font-bold text-gray-900 mb-2">⏰ Quick Setup</h4>
                      <p className="text-sm text-gray-700">
                        This module can be completed in <span className="font-bold">1-3 days</span>. Address verification is critical before moving forward!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🏢 Virtual Office Options</h4>
                      <p className="text-sm text-gray-700">
                        If your address isn't compliant, we recommend USPS-approved virtual office providers (see resources in task).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🚫 Avoid These Mistakes</h4>
                      <p className="text-sm text-gray-700">
                        Never use UPS Store, FedEx Office, PO Box, or home address if marked "Residential". Lenders auto-decline these.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Visual Progress Timeline - Syncs with unified data store */}
        <Card className="border-2 border-cyan-300 mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-200 p-4 cursor-pointer hover:bg-cyan-100 transition-colors"
            onClick={toggleTimeline}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Task Timeline</h3>
                  <p className="text-sm text-gray-600">Visual progress tracker with milestones</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-cyan-600 text-white border-0 text-sm px-3 py-1">
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
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              
              <div className="relative flex justify-between">
                {/* Milestone 1: Start */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    completedTasks >= 0 ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-600' : 'bg-white border-gray-300'
                  } transition-all duration-500 shadow-lg`}>
                    <PlayCircle className={`w-5 h-5 ${completedTasks >= 0 ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-gray-900">Start</div>
                    <div className="text-xs text-gray-500">0% Done</div>
                  </div>
                </div>

                {/* Milestone 2: Complete */}
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
                    <div className="text-xs text-gray-500">100%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
                <h4 className="font-bold text-gray-900 text-lg">Your Progress</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks} / {totalTasks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">FICO Points Earned</p>
                  <p className="text-2xl font-bold text-cyan-600">+{totalPoints}</p>
                </div>
              </div>
            </div>

            {/* Next Action */}
            {completedTasks < totalTasks ? (
              <div className="mt-4 bg-yellow-400 text-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-bold">
                    Complete your business address verification to unlock funding!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-gray-900">Great work!</span> Your business address is verified. Continue to the next module!
                  </div>
                </div>
              </div>
            )}
            </div>
          )}
        </Card>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{gamificationData.totalPoints}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{gamificationData.currentStreak} days</p>
                </div>
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{gamificationData.achievementsUnlocked}</p>
                </div>
                <Award className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowAchievementGallery(true)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">View Gallery</p>
                  <p className="text-sm font-semibold text-blue-600">All Achievements →</p>
                </div>
                <Star className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Bulk Actions */}
        <Card className="mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={activeFiltersCount > 0 ? 'border-cyan-600 text-cyan-600' : ''}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-cyan-600 text-white">{activeFiltersCount}</Badge>
                  )}
                </Button>

                {selectedTasks.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                      {selectedTasks.size} selected
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('complete')}
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('incomplete')}
                      className="border-gray-600 text-gray-600 hover:bg-gray-50"
                    >
                      <Circle className="w-4 h-4 mr-1" />
                      Mark Incomplete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearSelection}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Keyboard: Ctrl+A (Select All), Esc (Clear)</span>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="all">All Tasks</option>
                    <option value="incomplete">Incomplete Only</option>
                    <option value="complete">Complete Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tag</label>
                  <select
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    value={selectedAssignee || ''}
                    onChange={(e) => setSelectedAssignee(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Assignees</option>
                    {allAssignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="none">Default Order</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Task List */}
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const isExpanded = expandedTasks.has(task.id);
            const isComplete = getTaskStatus(task.id) === 'complete';
            const isSelected = selectedTasks.has(task.id);
            const metadata = taskMetadata[task.id];
            const taskDocs = documents[task.id] || [];

            return (
              <Card 
                key={task.id} 
                className={`border-2 transition-all ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-50' 
                    : isComplete 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-6">
                  {/* Task Header */}
                  <div className="flex items-start gap-4">
                    {/* Checkbox for bulk selection */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="mt-1 w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                    />

                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 mt-1"
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold mb-1 ${isComplete ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          
                          {/* Metadata Display */}
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Target className="w-4 h-4 text-cyan-600" />
                              <span className="font-semibold">{task.ficoImpact} pts</span>
                            </div>
                            
                            {task.priority === 'critical' && (
                              <Badge variant="destructive" className="bg-red-600">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Critical
                              </Badge>
                            )}
                            {task.priority === 'high' && (
                              <Badge className="bg-orange-600">
                                High Priority
                              </Badge>
                            )}

                            {metadata?.dueDate && (
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs">Due: {new Date(metadata.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}

                            {metadata?.assignedTo && (
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <User className="w-4 h-4" />
                                <span className="text-xs">{metadata.assignedTo}</span>
                              </div>
                            )}

                            {metadata?.estimatedTime && (
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">{metadata.estimatedTime}</span>
                              </div>
                            )}

                            {metadata?.tags && metadata.tags.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {metadata.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => setEditingMetadataFor(task.id)}
                              className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <ThemeButton
                            theme="blue-cyan"
                            variant="outline"
                            size="sm"
                            onClick={() => setAiCoachOpenFor(task.id)}
                          >
                            <Bot className="w-4 h-4 mr-1" />
                            AI Coach
                          </ThemeButton>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpanded(task.id)}
                          >
                            {isExpanded ? (
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

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          {/* Educational Content */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-cyan-600" />
                              What You Need to Know
                            </h4>
                            <div className="prose prose-sm max-w-none">
                              {task.educationalContent}
                            </div>
                          </div>

                          {/* Resources */}
                          {task.resources && task.resources.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-blue-600" />
                                USPS-Compliant Virtual Office Providers
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">
                                We earn a commission at no additional cost to you when you use these services
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {task.resources.map((resource, idx) => (
                                  <a
                                    key={idx}
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
                            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-5 mb-6">
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

                          {/* Document Management */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-gray-600" />
                              Documents
                            </h4>
                            
                            {/* Upload Button */}
                            <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors mb-4">
                              <Upload className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">Upload Document</span>
                              <input
                                type="file"
                                multiple
                                onChange={(e) => handleFileUpload(task.id, e)}
                                className="hidden"
                              />
                            </label>

                            {/* Document List */}
                            {taskDocs.length > 0 ? (
                              <div className="space-y-2">
                                {taskDocs.map(doc => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {doc.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {(doc.size / 1024).toFixed(2)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                                        <Download className="w-4 h-4 text-gray-600" />
                                      </button>
                                      <button
                                        onClick={() => removeDocument(task.id, doc.id)}
                                        className="p-2 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No documents uploaded yet</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Timeline Section */}
        <Card className="mt-8">
          <div 
            className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={toggleTimeline}
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
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
                    <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-cyan-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-semibold text-gray-900 mb-2">Week 1: Address Verification</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Verify your current business address in the USPS database. Identify if it's listed as Business, Residential, or Mail Stop.
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Assessment</Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-cyan-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-semibold text-gray-900 mb-2">Week 1-2: Address Solution</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      If address is not compliant, research and select a virtual office provider. Sign up for service and receive new business address.
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Action Required</Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Week 2-3: Update All Records</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Update your business address with Secretary of State, IRS, banks, credit accounts, and all business accounts using the exact same format.
                    </p>
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">Ongoing</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

      </div>
      
      {/* Video Explanation Modal */}
      <VideoExplanationModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl="https://assets.cdn.filesafe.space/uamzHygM1jRY78rPSYvc/media/69916c48c0866523400608f9.mp4"
        title="Business Location - Module Overview"
        theme="blue-cyan"
      />
    </div>
  );
}

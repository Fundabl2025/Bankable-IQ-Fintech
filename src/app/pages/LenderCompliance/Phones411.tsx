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
  Video,
  Phone
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
  'business-phone': 'business-phone'
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

export function Phones411() {
  const navigate = useNavigate();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiCoachOpenFor, setAiCoachOpenFor] = useState<string | null>(null);
  
  // Onboarding Modal - Check if user has seen it before
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    localStorage.getItem('phones-411-seen-onboarding') === 'true'
  );
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(
    localStorage.getItem('phones-411-show-quick-start') !== 'false'
  );
  
  // Video Modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Gamification & Progress
  const [showAchievementGallery, setShowAchievementGallery] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(() => {
    return localStorage.getItem('phones-411-timeline-expanded') === 'true';
  });
  
  // Task management
  const [taskDocuments, setTaskDocuments] = useState<{ [taskId: string]: UploadedDocument[] }>(() => {
    const saved = localStorage.getItem('phones-411-task-documents');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [taskMetadata, setTaskMetadata] = useState<{ [taskId: string]: TaskMetadata }>(() => {
    const saved = localStorage.getItem('phones-411-task-metadata');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [editingMetadataFor, setEditingMetadataFor] = useState<string | null>(null);
  const [tempDueDate, setTempDueDate] = useState('');
  const [tempAssignedTo, setTempAssignedTo] = useState('');
  const [tempEstimatedTime, setTempEstimatedTime] = useState('');
  const [tempTags, setTempTags] = useState('');
  
  // Bulk actions
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'status' | 'name'>('priority');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');

  // Intake Form Data
  const [intakeFormData, setIntakeFormData] = useState<{ [taskId: string]: {
    listedIn411: string;
    phone411: string;
    phone800: string;
    submitTo411: string;
    businessFax: string;
  } }>(() => {
    const saved = localStorage.getItem('phones-411-intake-forms');
    return saved ? JSON.parse(saved) : {};
  });

  const tasks: Task[] = [
    {
      id: 'business-phone',
      title: 'Set Up Business Phone Number with 411 Listing',
      description: 'Establish a dedicated business phone line with directory assistance (411) listing to verify legitimacy.',
      priority: 'critical',
      ficoImpact: 10,
      educationalContent: (
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong className="text-blue-600">Why This Matters:</strong> Lenders verify your business by calling 
            411 (directory assistance) to confirm your listing. A dedicated business phone number demonstrates 
            operational legitimacy and separates personal from business activities.
          </p>
          
          {/* Compliance Item - Business Phone Number */}
          <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-4">
              <h4 className="font-bold">Compliance Item Fix - FCC Listed Business Phone</h4>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>How do potential lenders, vendors and customers see you?</strong> It's easy and inexpensive to set-up a virtual local phone number in your area code or a toll free 800 or 8** number - We recommend setting up both.
              </p>
              
              <p>
                If you already have a local number for your business, adding an "800" number can greatly boost credibility and provide your customers easy access to your company. Even if you're a single owner with a home-based business, a toll-free number provides the perception that you are a real business.
              </p>
              
              <p>
                If you need a business number to list in 411, you must get a Virtual Local Number with your local area code. 800 toll free numbers cannot be listed in your local 411 directory.
              </p>
              
              <p className="text-sm text-center text-gray-600 italic">
                We earn a commission at no additional cost to you when you use these services
              </p>
              
              {/* Service Provider Recommendations */}
              <div className="space-y-3">
                {[
                  { name: 'Vonage.com', logo: '📞', url: 'https://www.vonage.com' },
                  { name: 'Phone.com', logo: '☎️', url: 'https://www.phone.com' },
                  { name: 'Nextiva.com', logo: '📱', url: 'https://www.nextiva.com' },
                  { name: 'VoipStudio.com', logo: '🎙️', url: 'https://www.voipstudio.com' }
                ].map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.logo}</span>
                      <span className="font-semibold text-gray-800">{provider.name}</span>
                    </div>
                    <a 
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2"
                    >
                      Go To {provider.name.split('.')[0]}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Critical Warning */}
          <div className="bg-red-50 border-l-4 border-red-600 rounded p-4">
            <h4 className="font-bold text-red-900 mb-2">🚨 CRITICAL WARNING</h4>
            <p className="text-red-800 font-medium">
              Whether you're applying for financing with a lender or net credit terms with a vendor, providing a cell or home phone number as your main business line could get you "flagged" as an unestablished business that is too high of a risk. This means we <strong>DON'T recommend</strong> giving a personal cell phone or residential phone as the business phone number (note: you can forward a virtual number to any phone number, see the information in the box above).
            </p>
          </div>

          {/* Compliance Item - National 411 Directory */}
          <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 mt-6">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-4">
              <h4 className="font-bold">Compliance Item Fix - National 411 Business Listing</h4>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p className="text-red-600 font-bold text-center">
                *** DO NOT USE A CELL PHONE NUMBER OR A RESIDENTIAL NUMBER FOR THIS 411 LISTING ***
              </p>
              
              <p>
                You have the option below to select <strong>Yes</strong> for your business name and phone number to be submitted for listing with the national 411 directory. This is a courtesy service and we cannot guarantee every submission because we are simply passing your information to 411 and then they list the information. Please do not enter a cell phone or home phone number in the field provided. (NOTE that local area code numbers from providers like Ring Central, etc.) Allow up to <strong>2 weeks</strong> for your phone number to show as listed. After selecting YES you'll need to click the "Save & Continue" button in order for your information to be submitted to 411.
              </p>
              
              <p>
                Another option is for your business phone number listed is to contact your local phone carrier. Keep in mind that you'll need to have your phone service with them in order to get a number listed.
              </p>
              
              <p>
                A third option is to list your business with <strong>ListYourself.net</strong>. The service is free and has been proven to be very effective to solve the 411 directory assistance listing.
              </p>
              
              <div className="flex justify-center my-4">
                <a 
                  href="https://www.listyourself.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Use ListYourself.net To List Your Business In 411 Directory Assistance
                </a>
              </div>
              
              <p>
                Once you have submitted, you need to verify the listing under 411. To do this dial (Your Area Code)-555-1212 and then ask for the listing of your exact business legal name. <strong>If possible, do not use a cell phone to check your listing!</strong>
              </p>
              
              <p className="mt-4">
                In addition, since searching the internet is the number one tool used to locate a business today, it's crucial to make sure your business is listed on major online business directories. While there are many online directories to get listed with there are several key sites that play a role in the business credit building process.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">🎯 Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Use a dedicated business line (not your personal cell phone)</li>
              <li>Set up BOTH a local number AND an 800 number for credibility</li>
              <li>Ensure the number matches your NAP (Name, Address, Phone) across all platforms</li>
              <li>Answer with your business name during business hours</li>
              <li>Register with 411 directory services (may take up to 2 weeks to appear)</li>
              <li>Verify your 411 listing by calling (Your Area Code)-555-1212</li>
              <li>Use ListYourself.net for free and effective 411 directory listing</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">⚠️ Common Mistakes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li><strong className="text-red-600">Using personal cell phone numbers (CRITICAL ERROR)</strong></li>
              <li><strong className="text-red-600">Using residential phone numbers (CRITICAL ERROR)</strong></li>
              <li>Trying to list 800 numbers in local 411 directory (not possible)</li>
              <li>Inconsistent phone numbers across directories</li>
              <li>Not answering professionally or during business hours</li>
              <li>Failing to verify 411 listing after submission</li>
              <li>Using cell phone to check 411 listing verification</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">✅ Recommended Services:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li><strong>Vonage Business:</strong> Virtual local & toll-free numbers with 411 listing capability</li>
              <li><strong>Phone.com:</strong> Business VoIP service with professional features</li>
              <li><strong>Nextiva:</strong> Enterprise-grade business phone system</li>
              <li><strong>VoipStudio:</strong> Cloud-based business phone solution</li>
              <li><strong>ListYourself.net:</strong> Free 411 directory listing service (HIGHLY RECOMMENDED)</li>
              <li><strong>Ring Central:</strong> Virtual phone system with local area code numbers</li>
            </ul>
          </div>
        </div>
      ),
      resources: [
        { name: 'ListYourself.net - Free 411 Directory Listing', url: 'https://www.listyourself.net' },
        { name: 'Vonage Business Phone Service', url: 'https://www.vonage.com' },
        { name: 'Phone.com Virtual Phone System', url: 'https://www.phone.com' },
        { name: 'Nextiva Business VoIP', url: 'https://www.nextiva.com' },
        { name: 'VoipStudio Cloud Phone', url: 'https://www.voipstudio.com' },
        { name: 'FCC Business Line Requirements', url: 'https://www.fcc.gov' }
      ]
    }
  ];

  // Get task status from unified system - MUST be defined before calculations
  const getTaskStatus = (taskId: string): 'complete' | 'incomplete' => {
    const auditItemId = TASK_AUDIT_MAP[taskId];
    const auditItem = getAuditItemById(auditItemId);
    return auditItem?.status || 'incomplete';
  };

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => getTaskStatus(task.id) === 'complete').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate FICO
  const totalFicoAvailable = tasks.reduce((sum, task) => sum + task.ficoImpact, 0);
  const ficoEarned = tasks
    .filter(task => getTaskStatus(task.id) === 'complete')
    .reduce((sum, task) => sum + task.ficoImpact, 0);
  
  const ficoStatus = getFicoBankableStatus();
  const gamificationData = getGamificationData();

  // Save timeline state
  useEffect(() => {
    localStorage.setItem('phones-411-timeline-expanded', timelineExpanded.toString());
  }, [timelineExpanded]);

  // Save document state
  useEffect(() => {
    localStorage.setItem('phones-411-task-documents', JSON.stringify(taskDocuments));
  }, [taskDocuments]);

  // Save metadata state
  useEffect(() => {
    localStorage.setItem('phones-411-task-metadata', JSON.stringify(taskMetadata));
  }, [taskMetadata]);

  // Save intake form data
  useEffect(() => {
    localStorage.setItem('phones-411-intake-forms', JSON.stringify(intakeFormData));
  }, [intakeFormData]);

  // Mark onboarding as seen
  useEffect(() => {
    if (!showOnboarding && !hasSeenOnboarding) {
      localStorage.setItem('phones-411-seen-onboarding', 'true');
      setHasSeenOnboarding(true);
    }
  }, [showOnboarding, hasSeenOnboarding]);

  // Pre-fill metadata form when opening
  useEffect(() => {
    if (editingMetadataFor) {
      const metadata = taskMetadata[editingMetadataFor] || { tags: [] };
      setTempDueDate(metadata.dueDate || '');
      setTempAssignedTo(metadata.assignedTo || '');
      setTempEstimatedTime(metadata.estimatedTime || '');
      setTempTags(metadata.tags.join(', '));
    }
  }, [editingMetadataFor, taskMetadata]);

  // Bulk actions - MUST be defined before keyboard shortcuts
  const selectAllTasks = () => {
    setSelectedTasks(new Set(tasks.map(t => t.id)));
    toast.info(`Selected all ${tasks.length} tasks`);
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
    toast.info('Selection cleared');
  };

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
        completedDate: new Date().toISOString()
      });
      
      // Update streak
      updateStreak();
      
      // Check for new achievements
      const newAchievements = checkAchievements();
      
      // Celebration effects
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const task = tasks.find(t => t.id === taskId);
      toast.success(`Task completed! +${task?.ficoImpact} FICO points`, {
        description: 'Great progress on your credit journey! 🎉'
      });
      
      // Show achievement toast if unlocked
      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          setTimeout(() => {
            toast.success(`🏆 Achievement Unlocked: ${achievement.title}`, {
              description: achievement.description
            });
          }, 500);
        });
      }
    }
    
    setRefreshKey(prev => prev + 1);
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

  const toggleTimeline = () => {
    setTimelineExpanded(!timelineExpanded);
  };

  // Document management
  const handleFileUpload = (taskId: string, files: FileList | null) => {
    if (!files) return;
    
    const newDocs: UploadedDocument[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));
    
    setTaskDocuments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), ...newDocs]
    }));
    
    toast.success('Document uploaded successfully!');
  };

  const deleteDocument = (taskId: string, docId: string) => {
    setTaskDocuments(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(doc => doc.id !== docId)
    }));
    toast.success('Document deleted');
  };

  // Metadata management
  const updateTaskMetadata = (taskId: string, metadata: Partial<TaskMetadata>) => {
    setTaskMetadata(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], tags: [], ...metadata }
    }));
    toast.success('Task metadata updated!');
  };

  // Intake form management
  const updateIntakeForm = (taskId: string, field: string, value: string) => {
    setIntakeFormData(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { listedIn411: '', phone411: '', phone800: '', submitTo411: '', businessFax: '' }),
        [field]: value
      }
    }));
  };

  const saveIntakeForm = (taskId: string) => {
    toast.success('Form data saved successfully!');
  };

  // Task selection (for bulk actions)
  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const bulkCompleteSelected = () => {
    selectedTasks.forEach(taskId => {
      if (getTaskStatus(taskId) !== 'complete') {
        toggleTask(taskId);
      }
    });
    clearSelection();
    toast.success(`Completed ${selectedTasks.size} tasks!`);
  };

  const bulkUncompleteSelected = () => {
    selectedTasks.forEach(taskId => {
      if (getTaskStatus(taskId) === 'complete') {
        toggleTask(taskId);
      }
    });
    clearSelection();
    toast.info(`Marked ${selectedTasks.size} tasks as incomplete`);
  };

  // Filtering and sorting
  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];
    
    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => {
        const status = getTaskStatus(task.id);
        return filterStatus === 'complete' ? status === 'complete' : status === 'incomplete';
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'status') {
        const aStatus = getTaskStatus(a.id) === 'complete' ? 1 : 0;
        const bStatus = getTaskStatus(b.id) === 'complete' ? 1 : 0;
        return aStatus - bStatus;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    
    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-4 border-blue-500 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold">📞 Welcome to Phones & 411!</h2>
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
                      <div className="text-6xl mb-4">📞</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Professional Phone Identity</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        A dedicated business phone line with 411 directory listing is <strong>CRITICAL for lender verification</strong>. Lenders call to verify your business is real and operating.
                      </p>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>In this module, you'll establish:</strong>
                        </p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>✓ Dedicated business phone line (NOT personal!)</li>
                          <li>✓ 411 directory listing for verification</li>
                          <li>✓ NAP consistency across all platforms</li>
                          <li>✓ Professional business identity that lenders trust</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Phones & 411 Module</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        This module contains <strong>{totalTasks} critical tasks</strong> that establish your phone identity.
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
                        onClick={() => setShowOnboarding(false)}
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

        {/* Video Explanation Modal */}
        {showVideoModal && (
          <VideoExplanationModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            title="Phones & 411 Setup Guide"
            videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
            description="Learn how to set up a professional business phone line with 411 directory listing for lender verification."
          />
        )}

        {/* AI Coach Chat Modal */}
        {aiCoachOpenFor && (() => {
          const task = tasks.find(t => t.id === aiCoachOpenFor);
          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="max-w-2xl w-full border-2 border-blue-500 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-t-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">🤖 AI Coach</h2>
                    <button onClick={() => setAiCoachOpenFor(null)} className="hover:bg-white/20 rounded-full p-2">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm opacity-90">{task?.title}</p>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <AICoachChat
                    context={{
                      module: 'Phones & 411',
                      task: task?.title || '',
                      userProgress: `${completedTasks}/${totalTasks} tasks complete`,
                      ficoImpact: task?.ficoImpact || 0,
                      priority: task?.priority || 'medium'
                    }}
                  />
                </div>
              </Card>
            </div>
          );
        })()}

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
                      placeholder="e.g., Business Owner, Office Manager"
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
                      placeholder="e.g., Phone, 411, Communication (comma-separated)"
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
                <h1 className="text-4xl font-bold text-gray-900">Phones & 411</h1>
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
              <p className="text-gray-600">Establish a dedicated business phone line with 411 directory listing</p>
            </div>
            <div className="flex flex-col items-end gap-2">
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
                    {completedTasks === 0 ? 'Set up your business phone to unlock funding!' : `${totalTasks - completedTasks} task${totalTasks - completedTasks > 1 ? 's' : ''} remaining`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

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
                    <div className="text-xs text-gray-500">{totalTasks} task</div>
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
                      completedTasks === 0 ? 'Complete your business phone setup to get started!' :
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
                  onClick={() => {
                    setShowQuickStart(false);
                    localStorage.setItem('phones-411-show-quick-start', 'false');
                  }}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 text-red-600 rounded-full p-2 flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-900 mb-2">🚨 NEVER Use Cell or Home Phones</h4>
                      <p className="text-sm text-gray-700">
                        Using a personal cell phone or residential phone as your business line will get you <strong className="text-red-600">FLAGGED</strong> as high risk. This is a <strong className="text-red-600">CRITICAL ERROR</strong> that can disqualify you from funding!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-600 rounded-full p-2 flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">📞 Set Up Local + 800 Numbers</h4>
                      <p className="text-sm text-gray-700">
                        Get BOTH a local area code number AND an 800 toll-free number. This boosts credibility significantly. Use services like Vonage, Phone.com, Nextiva, or VoipStudio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🔍 List in 411 Directory</h4>
                      <p className="text-sm text-gray-700">
                        Use <strong>ListYourself.net</strong> (FREE) to get listed in 411 directory. Takes up to 2 weeks. Verify by calling (Area Code)-555-1212. DO NOT use cell phone to verify!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full p-2 flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">⚠️ 800 Numbers Can't List in 411</h4>
                      <p className="text-sm text-gray-700">
                        Toll-free 800 numbers <strong>CANNOT</strong> be listed in local 411 directory. You MUST have a local area code number for 411 listing. Use virtual local number services.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full p-2 flex-shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">⚡ NAP Consistency is Critical</h4>
                      <p className="text-sm text-gray-700">
                        Your phone number must match EXACTLY across all platforms: website, Google Business Profile, Dun & Bradstreet, state filings, and online directories.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-cyan-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-100 text-cyan-600 rounded-full p-2 flex-shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🤖 Use AI Coach for Help</h4>
                      <p className="text-sm text-gray-700">
                        Need help choosing a provider, setting up 411 listing, or understanding requirements? Click "Ask AI Coach" for personalized, step-by-step guidance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filter & Sort Tasks */}
        <Card className="border-2 border-gray-200 mb-8">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Filter & Sort Tasks</h3>
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
              <div className="mt-4 pt-4 border-t-2 border-gray-200 grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Sort By</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Filter by Priority</label>
                  <select 
                    value={filterPriority} 
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Filter by Status</label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Tasks</option>
                    <option value="incomplete">Incomplete Only</option>
                    <option value="complete">Complete Only</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bulk Actions Tip */}
        {selectedTasks.size > 0 && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 mb-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-900">{selectedTasks.size} task(s) selected</span>
                </div>
                <div className="flex gap-2">
                  <ThemeButton 
                    theme="blue-cyan" 
                    size="sm"
                    onClick={bulkCompleteSelected}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Selected
                  </ThemeButton>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={bulkUncompleteSelected}
                  >
                    <Circle className="w-4 h-4 mr-2" />
                    Uncomplete Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Task List */}
        <div className="space-y-6">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTasks.has(task.id);
            const isComplete = getTaskStatus(task.id) === 'complete';
            const isSelected = selectedTasks.has(task.id);
            const docs = taskDocuments[task.id] || [];
            const metadata = taskMetadata[task.id];

            const priorityColors = {
              critical: 'border-red-500 bg-red-50',
              high: 'border-orange-500 bg-orange-50',
              medium: 'border-yellow-500 bg-yellow-50',
              low: 'border-blue-500 bg-blue-50'
            };

            const priorityBadgeColors = {
              critical: 'bg-red-600 text-white',
              high: 'bg-orange-600 text-white',
              medium: 'bg-yellow-600 text-white',
              low: 'bg-blue-600 text-white'
            };

            return (
              <Card 
                key={task.id} 
                className={`border-2 transition-all ${
                  isSelected ? 'ring-4 ring-purple-300' : ''
                } ${
                  isComplete ? 'bg-green-50 border-green-300' : priorityColors[task.priority]
                }`}
              >
                <div className="p-6">
                  {/* Task Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Bulk Select Checkbox */}
                    <button
                      onClick={() => toggleTaskSelection(task.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-all ${
                        isSelected 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-300 hover:border-purple-400'
                      } flex items-center justify-center`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      ) : (
                        <Circle className="w-8 h-8 text-gray-400 hover:text-blue-600 transition-colors" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-1 ${isComplete ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={priorityBadgeColors[task.priority]}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                            <Zap className="w-3 h-3 mr-1" />
                            +{task.ficoImpact} FICO
                          </Badge>
                        </div>
                      </div>

                      {/* Metadata Display */}
                      {metadata && (
                        <div className="flex flex-wrap gap-3 mt-3 text-xs">
                          {metadata.dueDate && (
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              <span>Due: {new Date(metadata.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {metadata.assignedTo && (
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                              <User className="w-3 h-3 text-blue-600" />
                              <span>{metadata.assignedTo}</span>
                            </div>
                          )}
                          {metadata.estimatedTime && (
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>{metadata.estimatedTime}</span>
                            </div>
                          )}
                          {metadata.tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
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
                        
                        <ThemeButton
                          theme="blue-cyan"
                          size="sm"
                          onClick={() => setAiCoachOpenFor(task.id)}
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          Ask AI Coach
                        </ThemeButton>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMetadataFor(task.id)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Metadata
                        </Button>

                        {docs.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {docs.length} document{docs.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-6">
                      {/* Educational Content */}
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          Educational Content
                        </h4>
                        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                          {task.educationalContent}
                        </div>
                      </div>

                      {/* Resources */}
                      {task.resources && task.resources.length > 0 && (
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-blue-600" />
                            Helpful Resources
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {task.resources.map((resource, idx) => (
                              <a
                                key={idx}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                              >
                                <ExternalLink className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                  {resource.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Document Management */}
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                          <Paperclip className="w-5 h-5 text-blue-600" />
                          Documents ({docs.length})
                        </h4>
                        
                        <div className="space-y-3">
                          {docs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-gray-200">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{doc.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(doc.size / 1024).toFixed(2)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deleteDocument(task.id, doc.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          ))}


                        </div>
                      </div>

                      {/* Intake Questionnaire */}
                      <div>
                        <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4 mb-4">
                          <p className="text-gray-700">
                            In addition, since searching the internet is the number one tool used to locate a business today, it's crucial to make sure your business is listed on major online business directories. While there are many popular online directories to get listed with there are several key sites that play a role in the business credit building process.
                          </p>
                        </div>
                        
                        <h4 className="font-bold text-lg text-gray-900 mb-3">Once you have a FCC listed business phone number, fill out the information below</h4>
                        
                        <div className="space-y-6 bg-white p-6 rounded-lg border-2 border-gray-200">
                          {/* Question 1 - Listed in 411 */}
                          <div>
                            <label className="block font-semibold text-gray-900 mb-2">
                              Is your business phone number currently listed in 411
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`${task.id}-listed411`}
                                  value="Yes"
                                  checked={intakeFormData[task.id]?.listedIn411 === 'Yes'}
                                  onChange={(e) => updateIntakeForm(task.id, 'listedIn411', e.target.value)}
                                  className="w-4 h-4"
                                />
                                <span className="text-gray-700">Yes</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`${task.id}-listed411`}
                                  value="No"
                                  checked={intakeFormData[task.id]?.listedIn411 === 'No'}
                                  onChange={(e) => updateIntakeForm(task.id, 'listedIn411', e.target.value)}
                                  className="w-4 h-4"
                                />
                                <span className="text-gray-700">No</span>
                              </label>
                            </div>
                          </div>

                          {/* Question 2 - 411 Phone */}
                          <div>
                            <label className="block font-semibold text-gray-900 mb-2">
                              411 Directory Assistance Phone #:
                              <span className="text-xs text-gray-500 font-normal ml-2">(Separate business number not home)</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="tel"
                                placeholder="555-555-5555"
                                value={intakeFormData[task.id]?.phone411 || ''}
                                onChange={(e) => updateIntakeForm(task.id, 'phone411', e.target.value)}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                              />
                              <span className="text-sm text-gray-600 font-medium">(Land Line)</span>
                            </div>
                          </div>

                          {/* Question 3 - 800 Phone */}
                          <div>
                            <label className="block font-semibold text-gray-900 mb-2">
                              800 Directory Assistance Phone #:
                              <span className="text-xs text-gray-500 font-normal ml-2">(if applicable)</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="tel"
                                placeholder="555-555-5555"
                                value={intakeFormData[task.id]?.phone800 || ''}
                                onChange={(e) => updateIntakeForm(task.id, 'phone800', e.target.value)}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                              />
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                              >
                                GO
                              </Button>
                            </div>
                          </div>

                          {/* Question 4 - Submit to 411 */}
                          <div>
                            <label className="block font-semibold text-gray-900 mb-2">
                              Would you like us to submit your business name, phone number and address to the national 411 Directory?
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`${task.id}-submit411`}
                                  value="Yes"
                                  checked={intakeFormData[task.id]?.submitTo411 === 'Yes'}
                                  onChange={(e) => updateIntakeForm(task.id, 'submitTo411', e.target.value)}
                                  className="w-4 h-4"
                                />
                                <span className="text-gray-700">Yes</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`${task.id}-submit411`}
                                  value="No"
                                  checked={intakeFormData[task.id]?.submitTo411 === 'No'}
                                  onChange={(e) => updateIntakeForm(task.id, 'submitTo411', e.target.value)}
                                  className="w-4 h-4"
                                />
                                <span className="text-gray-700">No</span>
                              </label>
                            </div>
                          </div>

                          {/* Question 5 - Business Fax */}
                          <div>
                            <label className="block font-semibold text-gray-900 mb-2">
                              Business Fax:
                            </label>
                            <input
                              type="tel"
                              placeholder=""
                              value={intakeFormData[task.id]?.businessFax || ''}
                              onChange={(e) => updateIntakeForm(task.id, 'businessFax', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={() => saveIntakeForm(task.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            >
                              Save & Continue &gt;&gt;
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
  Globe,
  Mail,
  ShieldCheck,
  Lightbulb
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
  'business-website': 'business-website',
  'business-email': 'business-email'
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

interface TaskInputData {
  websiteUrl?: string;
  domainRegistrar?: string;
  websiteBuilder?: string;
  hasSSL?: string;
  napConsistent?: string;
  businessEmail?: string;
  emailProvider?: string;
  emailMatchesDomain?: string;
}

export function WebsiteEmail() {
  const navigate = useNavigate();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiCoachOpenFor, setAiCoachOpenFor] = useState<string | null>(null);
  
  // Onboarding Modal - Check if user has seen it before
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    localStorage.getItem('website-email-seen-onboarding') === 'true'
  );
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(
    localStorage.getItem('website-email-show-quick-start') !== 'false'
  );
  
  // Video Modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Gamification & Progress
  const [showAchievementGallery, setShowAchievementGallery] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(() => {
    return localStorage.getItem('website-email-timeline-expanded') === 'true';
  });
  
  // Task management
  const [taskDocuments, setTaskDocuments] = useState<{ [taskId: string]: UploadedDocument[] }>(() => {
    const saved = localStorage.getItem('website-email-task-documents');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [taskMetadata, setTaskMetadata] = useState<{ [taskId: string]: TaskMetadata }>(() => {
    const saved = localStorage.getItem('website-email-task-metadata');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [taskInputData, setTaskInputData] = useState<{ [taskId: string]: TaskInputData }>(() => {
    const saved = localStorage.getItem('website-email-task-input-data');
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

  const tasks: Task[] = [
    {
      id: 'business-website',
      title: 'Professional Business Website',
      description: 'Create and maintain an active website with business information and NAP consistency',
      priority: 'high',
      ficoImpact: 3,
      educationalContent: (
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong className="text-blue-600">Why This Matters:</strong> A professional website is 
            essential for establishing credibility with lenders, vendors, and customers. It demonstrates 
            that you're a legitimate, active business and provides a platform to showcase your NAP 
            (Name, Address, Phone) consistency across all channels.
          </p>
          
          {/* Main Website Guidance */}
          <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-4">
              <h4 className="font-bold">Compliance Item Fix - Company Website</h4>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>How do potential lenders, vendors and customers see you?</strong> With today's technology 
                your business must have its own website. Even if it's a simple one-page site that lists your NAP 
                (Name, Address, Phone), products/services and contact information, it's extremely important to have. 
                Having a website allows you to be found in search engines and further establishes your legitimacy.
              </p>
              
              <p>
                <strong className="text-red-600">NOTE:</strong> A website is not a social media page (like Facebook). 
                It must have its own unique web address such as www.YourBusinessName.com
              </p>
              
              <p>
                There are many free and affordable website solutions that make it very easy to have a simple website. 
                At a minimum, your website should have the following:
              </p>
              
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Company legal name</li>
                <li>Company legal address (street, city, state, zip - ALL matching your EIN and credit profile)</li>
                <li>Company local or toll-free phone number (matching phone used on credit profile)</li>
                <li>Description of products/services your business offers</li>
                <li>About Us / Information about your company</li>
                <li>Contact info / Email or Contact form</li>
              </ul>
              
              <p>
                <strong>BE CONSISTENT!</strong> It is critical that your NAP (Name, Address, Phone) information on 
                your website EXACTLY matches the information you have on your state formation documents, your business 
                credit profile and all of your online listing information.
              </p>
              
              <p className="text-sm text-center text-gray-600 italic">
                We earn a commission at no additional cost to you when you use these services
              </p>
              
              {/* Website Builder Recommendations */}
              <div className="space-y-3">
                <h5 className="font-bold text-gray-900">Recommended Website Solutions:</h5>
                {[
                  { name: 'Wix.com', logo: '🌐', url: 'https://www.wix.com', description: 'Easy drag-and-drop builder with free options' },
                  { name: 'Weebly.com', logo: '🎨', url: 'https://www.weebly.com', description: 'Simple website builder, beginner-friendly' },
                  { name: 'WordPress.com', logo: '📝', url: 'https://www.wordpress.com', description: 'Most popular platform, very flexible' },
                  { name: 'GoDaddy.com', logo: '🚀', url: 'https://www.godaddy.com', description: 'Website builder + domain + hosting in one' },
                  { name: 'HostGator.com', logo: '💻', url: 'https://www.hostgator.com', description: 'Affordable hosting with website builder' },
                  { name: 'SquareSpace.com', logo: '✨', url: 'https://www.squarespace.com', description: 'Beautiful templates, professional designs' }
                ].map((provider) => (
                  <div key={provider.name} className="flex items-start justify-between bg-white p-4 rounded border">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{provider.logo}</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">{provider.name}</span>
                        <span className="text-sm text-gray-600">{provider.description}</span>
                      </div>
                    </div>
                    <a 
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 whitespace-nowrap ml-4"
                    >
                      Go To {provider.name.split('.')[0]}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4 mt-4">
                <p className="font-bold text-yellow-900 mb-2">⚠️ IMPORTANT REMINDERS:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  <li>Your website must have its own domain name (www.YourBusiness.com), not a social media page</li>
                  <li>NAP information must be EXACTLY the same across website, state documents, and credit profile</li>
                  <li>Include all required information: legal name, address, phone, products/services, about page</li>
                  <li>Keep your website active and updated - lenders will check it</li>
                </ul>
              </div>
            </div>
          </div>

          {/* NAP Consistency Critical Warning */}
          <div className="bg-red-50 border-l-4 border-red-600 rounded p-4">
            <h4 className="font-bold text-red-900 mb-2">🚨 NAP CONSISTENCY IS CRITICAL</h4>
            <p className="text-red-800">
              Your business Name, Address, and Phone (NAP) must be <strong>EXACTLY identical</strong> across 
              your website, state formation documents, business credit profile, and ALL online listings. Even small 
              differences (like "St" vs "Street" or "Suite 100" vs "#100") can hurt your credibility with lenders 
              and credit agencies. Inconsistent NAP information is one of the top reasons businesses get denied credit.
            </p>
          </div>

          {/* What NOT to do */}
          <div className="bg-gray-50 border-l-4 border-gray-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">❌ What NOT to Do:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Do NOT use a Facebook page or social media profile as your "website"</li>
              <li>Do NOT use free subdomains (yoursite.wix.com, yourbusiness.weebly.com)</li>
              <li>Do NOT have inconsistent NAP information across different platforms</li>
              <li>Do NOT leave your website as "Under Construction" or outdated</li>
              <li>Do NOT forget to include all required business information</li>
              <li>Do NOT use personal information instead of business information</li>
            </ul>
          </div>

          {/* Domain Best Practices */}
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">🎯 Domain Name Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Purchase your own custom domain (YourBusiness.com) - don't use free hosting subdomains</li>
              <li>Choose a .com domain when possible (most trusted by lenders and customers)</li>
              <li>Keep the domain name simple, memorable, and matching your business name</li>
              <li>Register for at least 1-2 years (shows stability and commitment)</li>
              <li>Keep WHOIS information accurate with business contact details</li>
              <li>Consider purchasing similar domain variations to protect your brand</li>
            </ul>
          </div>

          {/* SSL/HTTPS Notice */}
          <div className="bg-green-50 border-l-4 border-green-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              🔒 Security (SSL/HTTPS):
            </h4>
            <p className="text-sm text-gray-700">
              Make sure your website uses HTTPS (secure connection with the padlock icon). Most modern website builders 
              include this for free. Lenders and customers expect secure websites, and Google ranks 
              secure sites higher in search results. An unsecured website (HTTP only) raises red flags.
            </p>
          </div>
        </div>
      ),
      resources: [
        { name: 'Wix Website Builder', url: 'https://www.wix.com' },
        { name: 'Weebly Website Builder', url: 'https://www.weebly.com' },
        { name: 'WordPress.com', url: 'https://www.wordpress.com' },
        { name: 'GoDaddy Website Builder', url: 'https://www.godaddy.com' },
        { name: 'HostGator', url: 'https://www.hostgator.com' },
        { name: 'SquareSpace', url: 'https://www.squarespace.com' }
      ]
    },
    {
      id: 'business-email',
      title: 'Professional Business Email',
      description: 'Set up email address using your business domain (not Gmail/Yahoo)',
      priority: 'high',
      ficoImpact: 2,
      educationalContent: (
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong className="text-blue-600">Why This Matters:</strong> Using a professional email 
            address with your business domain (like info@yourbusiness.com) instead of a personal email 
            (Gmail, Yahoo, Hotmail) demonstrates professionalism and legitimacy to lenders, vendors, 
            and customers. It's a simple but powerful credibility signal.
          </p>
          
          {/* Main Email Guidance */}
          <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-4">
              <h4 className="font-bold">Compliance Item Fix - Company Domain Email</h4>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>How do potential lenders, vendors and customers see you?</strong> It's essential to have 
                an email address that uses your company domain, such as YourName@YourBusinessName.com or 
                Info@YourBusinessName.com. This gives an appearance of professionalism and further establishes your legitimacy.
              </p>
              
              <p>
                <strong className="text-red-600">AVOID FREE EMAIL SERVICES!</strong> Do NOT use Gmail, Hotmail, Yahoo, 
                AOL or other free email services for your business communication. These free services signal to lenders 
                and vendors that you're not serious about your business or that you're trying to hide something.
              </p>
              
              <p>
                <strong>What makes a professional business email:</strong> A business email uses your 
                custom domain name (the same one as your website) rather than a free email service. 
                For example:
              </p>
              
              <div className="bg-white border-2 border-gray-300 rounded p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Professional:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">john@yourbusiness.com</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Professional:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">info@yourbusiness.com</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Professional:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">support@yourbusiness.com</code>
                  </div>
                  <div className="h-px bg-gray-300 my-3"></div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">Unprofessional:</span>
                    <code className="bg-red-50 px-2 py-1 rounded">yourname@gmail.com</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">Unprofessional:</span>
                    <code className="bg-red-50 px-2 py-1 rounded">yourbusiness123@yahoo.com</code>
                  </div>
                </div>
              </div>
              
              <p>
                <strong>How to get a professional business email:</strong> Most website builders and 
                domain registrars offer business email as part of their packages or as an add-on. Here 
                are the most popular options:
              </p>
              
              <p className="text-sm text-center text-gray-600 italic">
                We earn a commission at no additional cost to you when you use these services
              </p>
              
              {/* Email Service Recommendations */}
              <div className="space-y-3">
                <h5 className="font-bold text-gray-900">Recommended Email Services:</h5>
                {[
                  { 
                    name: 'Google Workspace', 
                    logo: '📧', 
                    url: 'https://workspace.google.com', 
                    description: 'Professional Gmail with your domain, includes Drive & Calendar',
                    price: 'Starting at $6/user/month'
                  },
                  { 
                    name: 'Microsoft 365', 
                    logo: '📨', 
                    url: 'https://www.microsoft.com/microsoft-365/business', 
                    description: 'Outlook with your domain, includes Office apps',
                    price: 'Starting at $6/user/month'
                  },
                  { 
                    name: 'Zoho Mail', 
                    logo: '✉️', 
                    url: 'https://www.zoho.com/mail/', 
                    description: 'Affordable business email, ad-free experience',
                    price: 'Starting at $1/user/month'
                  },
                  { 
                    name: 'GoDaddy Email', 
                    logo: '📬', 
                    url: 'https://www.godaddy.com/email', 
                    description: 'Simple business email, easy setup with domain',
                    price: 'Starting at $5.99/month'
                  }
                ].map((provider) => (
                  <div key={provider.name} className="flex items-start justify-between bg-white p-4 rounded border">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{provider.logo}</span>
                      <div>
                        <span className="font-semibold text-gray-800 block">{provider.name}</span>
                        <span className="text-sm text-gray-600 block">{provider.description}</span>
                        <span className="text-xs text-gray-500 block mt-1">{provider.price}</span>
                      </div>
                    </div>
                    <a 
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 whitespace-nowrap ml-4"
                    >
                      Get Started
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4 mt-4">
                <p className="font-bold text-yellow-900 mb-2">⚠️ IMPORTANT REMINDERS:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  <li>Your email domain MUST match your website domain exactly</li>
                  <li>NEVER use free email services (Gmail, Yahoo, Hotmail, AOL) for business</li>
                  <li>Use this email on ALL business documents, applications, and communications</li>
                  <li>Set up email forwarding to your personal email for convenience if needed</li>
                  <li>Many website builders include business email - check before purchasing separately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Critical Warning - Free Email Services */}
          <div className="bg-red-50 border-l-4 border-red-600 rounded p-4">
            <h4 className="font-bold text-red-900 mb-2">🚨 NEVER USE FREE EMAIL SERVICES</h4>
            <p className="text-red-800 mb-3">
              <strong>DO NOT use Gmail, Yahoo, Hotmail, AOL, or any other free email service for your business!</strong> 
              Using free email services on credit applications, vendor applications, or lender communications is an 
              <strong> immediate red flag</strong> that can result in:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
              <li>Automatic rejection of your application</li>
              <li>Being flagged as a high-risk or unestablished business</li>
              <li>Closer scrutiny and additional documentation requirements</li>
              <li>Damage to your business credibility and reputation</li>
              <li>Lower credit limits or unfavorable terms if approved</li>
            </ul>
          </div>

          {/* What Lenders Think */}
          <div className="bg-gray-50 border-l-4 border-gray-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">💭 What Lenders Think When They See Free Email:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>"This business isn't professional or serious"</li>
              <li>"They might be trying to hide their identity"</li>
              <li>"This could be a brand-new startup with no track record"</li>
              <li>"They're not willing to invest even $6/month in their business"</li>
              <li>"This application needs extra scrutiny - potential fraud risk"</li>
            </ul>
          </div>

          {/* Email Best Practices */}
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">🎯 Professional Email Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Use a standard format: info@, contact@, support@, or firstname@yourbusiness.com</li>
              <li>Email domain must EXACTLY match your website domain</li>
              <li>Set up email forwarding to personal email for convenience (but always send FROM business email)</li>
              <li>Create a professional email signature with full business contact information</li>
              <li>Use this email on ALL official documents, applications, and credit profiles</li>
              <li>Check your business email regularly and respond professionally within 24 hours</li>
              <li>Avoid numbers, special characters, or unprofessional usernames</li>
              <li>Consider multiple addresses (info@, sales@, support@) for different purposes</li>
            </ul>
          </div>

          {/* Setup Steps */}
          <div className="bg-green-50 border-l-4 border-green-600 rounded p-4">
            <h4 className="font-bold text-gray-900 mb-2">✅ Quick Setup Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Choose an email service provider (Google Workspace, Microsoft 365, etc.)</li>
              <li>Verify you own your business domain (or purchase one first)</li>
              <li>Follow provider setup instructions to connect your domain</li>
              <li>Create your professional email address(es)</li>
              <li>Set up email forwarding to your personal email (optional)</li>
              <li>Configure email on your phone, computer, or use web access</li>
              <li>Create a professional email signature</li>
              <li>Update all your business profiles and documents with the new email</li>
            </ol>
          </div>
        </div>
      ),
      resources: [
        { name: 'Google Workspace', url: 'https://workspace.google.com' },
        { name: 'Microsoft 365 Business', url: 'https://www.microsoft.com/microsoft-365/business' },
        { name: 'Zoho Mail', url: 'https://www.zoho.com/mail/' },
        { name: 'GoDaddy Business Email', url: 'https://www.godaddy.com/email' }
      ]
    }
  ];

  // Calculate progress
  const getTaskStatus = (taskId: string): 'complete' | 'incomplete' => {
    const auditId = TASK_AUDIT_MAP[taskId];
    if (!auditId) return 'incomplete';
    const auditItem = getAuditItemById(auditId);
    return auditItem?.status === 'complete' ? 'complete' : 'incomplete';
  };

  const completedTasks = tasks.filter(task => getTaskStatus(task.id) === 'complete').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate FICO points
  const earnedFicoPoints = tasks
    .filter(task => getTaskStatus(task.id) === 'complete')
    .reduce((sum, task) => sum + task.ficoImpact, 0);
  const totalFicoPoints = tasks.reduce((sum, task) => sum + task.ficoImpact, 0);

  // Get gamification data
  const gamificationData = getGamificationData();
  const currentStreak = gamificationData.streak.currentStreak;
  const totalPoints = gamificationData.totalPoints;
  const userLevel = gamificationData.level;
  const unlockedAchievements = getUnlockedAchievements();
  const achievementCount = unlockedAchievements.length;

  // Milestone calculation
  const getMilestoneStatus = (milestone: number) => {
    if (completedTasks >= milestone) return 'complete';
    if (completedTasks === milestone - 1) return 'current';
    return 'locked';
  };

  const getNextMilestone = () => {
    if (completedTasks === 0) return 'Complete your first task to get started!';
    if (completedTasks === 1) return 'You\'re halfway there! Complete 1 more task.';
    if (completedTasks < totalTasks) return `Almost done! ${totalTasks - completedTasks} task(s) remaining.`;
    return 'Module complete! Congratulations! 🎉';
  };

  // Save task documents to localStorage
  useEffect(() => {
    localStorage.setItem('website-email-task-documents', JSON.stringify(taskDocuments));
  }, [taskDocuments]);

  // Save task metadata to localStorage
  useEffect(() => {
    localStorage.setItem('website-email-task-metadata', JSON.stringify(taskMetadata));
  }, [taskMetadata]);

  // Save timeline expanded state
  useEffect(() => {
    localStorage.setItem('website-email-timeline-expanded', String(timelineExpanded));
  }, [timelineExpanded]);

  // Save task input data to localStorage
  useEffect(() => {
    localStorage.setItem('website-email-task-input-data', JSON.stringify(taskInputData));
  }, [taskInputData]);

  const handleCompleteTask = (taskId: string) => {
    const auditId = TASK_AUDIT_MAP[taskId];
    if (!auditId) return;

    const currentStatus = getTaskStatus(taskId);
    const newStatus = currentStatus === 'complete' ? 'incomplete' : 'complete';
    
    updateAuditItem(auditId, { 
      status: newStatus,
      completedDate: newStatus === 'complete' ? new Date().toISOString() : undefined
    });

    if (newStatus === 'complete') {
      // Update streak
      updateStreak();
      
      // Check for achievements
      checkAchievements();
      
      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(`🎉 Task completed! +${tasks.find(t => t.id === taskId)?.ficoImpact} FICO points`, {
        description: 'Keep up the great work!'
      });

      // Check if module is complete
      const newCompletedCount = tasks.filter(t => 
        t.id === taskId ? true : getTaskStatus(t.id) === 'complete'
      ).length;
      
      if (newCompletedCount === totalTasks) {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 }
          });
          toast.success('🏆 Module Complete!', {
            description: `You've completed Website & Email! All ${totalFicoPoints} FICO points earned.`,
          });
        }, 500);
      }
    } else {
      toast.info('Task marked as incomplete');
    }

    setRefreshKey(prev => prev + 1);
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Document Management
  const handleFileUpload = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newDocs: UploadedDocument[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));

    setTaskDocuments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), ...newDocs]
    }));

    toast.success(`Uploaded ${newDocs.length} document(s)`);
  };

  const handleDeleteDocument = (taskId: string, docId: string) => {
    setTaskDocuments(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(doc => doc.id !== docId)
    }));
    toast.success('Document deleted');
  };

  // Metadata Management
  const handleSaveMetadata = (taskId: string) => {
    setTaskMetadata(prev => ({
      ...prev,
      [taskId]: {
        dueDate: tempDueDate,
        assignedTo: tempAssignedTo,
        tags: tempTags ? tempTags.split(',').map(t => t.trim()) : [],
        estimatedTime: tempEstimatedTime
      }
    }));
    setEditingMetadataFor(null);
    toast.success('Task metadata saved');
  };

  const handleEditMetadata = (taskId: string) => {
    const metadata = taskMetadata[taskId];
    setTempDueDate(metadata?.dueDate || '');
    setTempAssignedTo(metadata?.assignedTo || '');
    setTempEstimatedTime(metadata?.estimatedTime || '');
    setTempTags(metadata?.tags?.join(', ') || '');
    setEditingMetadataFor(taskId);
  };

  // Input Data Management
  const handleUpdateInputData = (taskId: string, field: keyof TaskInputData, value: string) => {
    setTaskInputData(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)));
    }
  };

  const handleBulkComplete = () => {
    selectedTasks.forEach(taskId => {
      if (getTaskStatus(taskId) !== 'complete') {
        handleCompleteTask(taskId);
      }
    });
    setSelectedTasks(new Set());
  };

  const handleBulkIncomplete = () => {
    selectedTasks.forEach(taskId => {
      if (getTaskStatus(taskId) === 'complete') {
        handleCompleteTask(taskId);
      }
    });
    setSelectedTasks(new Set());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      if (e.key === 'Escape') {
        setSelectedTasks(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTasks]);

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks;

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
    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Onboarding close handler
  const handleCloseOnboarding = () => {
    setHasSeenOnboarding(true);
    localStorage.setItem('website-email-seen-onboarding', 'true');
  };

  const handleCompleteOnboarding = () => {
    handleCloseOnboarding();
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/lender-compliance')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lender Compliance
          </Button>
          
          {/* Title Row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              {/* Module Title + Video Guide Button */}
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">Website & Email</h1>
                <ThemeButton 
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video Guide
                </ThemeButton>
              </div>
              {/* Subtitle Description */}
              <p className="text-gray-600">Create professional online presence with domain and email</p>
            </div>
            
            {/* Right Side Badges */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {/* FICO Points Badge */}
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1">
                  <Zap className="w-4 h-4 mr-1" />
                  {totalFicoPoints} FICO Points
                </Badge>
                
                {/* Streak Badge (if > 0) */}
                {currentStreak > 0 && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1">
                    <Flame className="w-4 h-4 mr-1" />
                    {currentStreak} Day Streak
                  </Badge>
                )}
                
                {/* Achievement Count Badge (clickable) */}
                {achievementCount > 0 && (
                  <Badge 
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1 cursor-pointer hover:opacity-90"
                    onClick={() => setShowAchievementGallery(true)}
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    {achievementCount} Achievement{achievementCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {/* Quick Start Button */}
              <Button 
                variant="outline"
                onClick={() => setHasSeenOnboarding(false)}
                className="flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Quick Start Guide
              </Button>
            </div>
          </div>
        </div>

        {/* Module Progress Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-lg mb-8">
          <div className="p-6">
            {/* Header: Title + Completion Fraction */}
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

            {/* FICO Progress Section */}
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span className="font-bold">FICO Points Earned:</span>
                </div>
                <span className="text-2xl font-bold">{earnedFicoPoints} / {totalFicoPoints}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <TrendingUp className="w-4 h-4" />
                <span>Current Total FICO SBSS: {totalPoints}/160</span>
              </div>
            </div>

            {/* Gamification Stats - 3 Boxes */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{userLevel}</div>
                <div className="text-xs text-blue-100">Level</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {currentStreak}
                  {currentStreak > 0 && <Flame className="w-5 h-5 text-orange-400" />}
                </div>
                <div className="text-xs text-blue-100">Day Streak</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{achievementCount}</div>
                <div className="text-xs text-blue-100">Achievements</div>
              </div>
            </div>

            {/* Yellow Warning Banner (if tasks remain) */}
            {completedTasks < totalTasks && (
              <div className="mt-4 bg-yellow-400 text-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-bold">
                    {completedTasks === 0 
                      ? 'Establish your online presence to unlock funding opportunities!' 
                      : `${totalTasks - completedTasks} task(s) remaining to complete this module`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Task Timeline Card */}
        <Card className="border-2 border-blue-300 mb-8 overflow-hidden">
          {/* Header (Clickable to expand/collapse) */}
          <div 
            className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => setTimelineExpanded(!timelineExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Task Timeline</h3>
                  <p className="text-sm text-gray-600">Visual progress tracker with milestones</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600 text-white">{progressPercentage}% Complete</Badge>
                <Button variant="ghost" size="sm">
                  {timelineExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {timelineExpanded && (
            <div className="p-6">
              {/* Milestone Progress Bar with 4 stages (2 tasks total) */}
              <div className="relative mb-8">
                {/* Background line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
                {/* Progress line */}
                <div 
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500" 
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                ></div>
                
                <div className="relative flex justify-between">
                  {/* Milestone 1: Start (0 tasks) */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      getMilestoneStatus(0) === 'complete' 
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-4 border-blue-600' 
                        : 'bg-white border-4 border-gray-300'
                    }`}>
                      <PlayCircle className={`w-5 h-5 ${getMilestoneStatus(0) === 'complete' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-xs font-bold text-gray-900">Start</div>
                      <div className="text-xs text-gray-500">0 tasks</div>
                    </div>
                  </div>

                  {/* Milestone 2: First Win (1 task) */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      getMilestoneStatus(1) === 'complete' 
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-4 border-blue-600' 
                        : getMilestoneStatus(1) === 'current'
                        ? 'bg-white border-4 border-blue-400 animate-pulse'
                        : 'bg-white border-4 border-gray-300'
                    }`}>
                      <CheckCircle className={`w-5 h-5 ${
                        getMilestoneStatus(1) === 'complete' ? 'text-white' : 
                        getMilestoneStatus(1) === 'current' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-xs font-bold text-gray-900">First Win</div>
                      <div className="text-xs text-gray-500">1 task</div>
                    </div>
                  </div>

                  {/* Milestone 3: Complete (2 tasks) */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      getMilestoneStatus(2) === 'complete' 
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-4 border-green-600' 
                        : getMilestoneStatus(2) === 'current'
                        ? 'bg-white border-4 border-blue-400 animate-pulse'
                        : 'bg-white border-4 border-gray-300'
                    }`}>
                      <Trophy className={`w-5 h-5 ${
                        getMilestoneStatus(2) === 'complete' ? 'text-white' : 
                        getMilestoneStatus(2) === 'current' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-xs font-bold text-gray-900">Complete!</div>
                      <div className="text-xs text-gray-500">{totalTasks} tasks</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Status Breakdown - 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Green: Completed */}
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

                {/* Orange: In Progress */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{totalTasks - completedTasks}</div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>

                {/* Blue: FICO Points Earned */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{earnedFicoPoints}</div>
                      <div className="text-sm text-gray-600">FICO Points Earned</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Milestone Info */}
              <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-xl">ℹ️</div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">Next milestone:</div>
                    <div className="text-sm text-gray-600">{getNextMilestone()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Filter & Sort Tasks Section */}
        <Card className="border-2 border-gray-200 mb-8">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Filter & Sort Tasks</h3>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SortAsc className="w-4 h-4 inline mr-1" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'priority' | 'status' | 'name')}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                      <option value="name">Name</option>
                    </select>
                  </div>

                  {/* Filter by Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Priority
                    </label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Filter by Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'complete' | 'incomplete')}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="all">All Tasks</option>
                      <option value="incomplete">Incomplete Only</option>
                      <option value="complete">Complete Only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bulk Actions Tip */}
        {selectedTasks.size > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{selectedTasks.size} task(s) selected</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleBulkComplete}
                >
                  Mark Complete
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleBulkIncomplete}
                >
                  Mark Incomplete
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedTasks(new Set())}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Individual Task Cards */}
        <div className="space-y-6">
          {filteredTasks.map((task) => {
            const isComplete = getTaskStatus(task.id) === 'complete';
            const isExpanded = expandedTasks.has(task.id);
            const isSelected = selectedTasks.has(task.id);
            const docs = taskDocuments[task.id] || [];
            const metadata = taskMetadata[task.id];

            return (
              <Card
                key={task.id}
                className={`border-2 transition-all ${
                  isComplete
                    ? 'border-green-300 bg-green-50/50'
                    : 'border-gray-300 hover:border-blue-300'
                } ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
              >
                {/* Task Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Bulk Select Checkbox */}
                    <div 
                      className="mt-1 cursor-pointer"
                      onClick={() => {
                        setSelectedTasks(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(task.id)) {
                            newSet.delete(task.id);
                          } else {
                            newSet.add(task.id);
                          }
                          return newSet;
                        });
                      }}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-bold ${isComplete ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </h3>
                            <Badge
                              className={
                                task.priority === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {task.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              <Zap className="w-3 h-3 mr-1" />
                              +{task.ficoImpact} FICO
                            </Badge>
                            {metadata?.tags && metadata.tags.length > 0 && (
                              <div className="flex gap-1">
                                {metadata.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{task.description}</p>

                          {/* Metadata Display */}
                          {(metadata?.dueDate || metadata?.assignedTo || metadata?.estimatedTime) && (
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                              {metadata.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {new Date(metadata.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {metadata.assignedTo && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{metadata.assignedTo}</span>
                                </div>
                              )}
                              {metadata.estimatedTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{metadata.estimatedTime}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleCompleteTask(task.id)}
                              className={
                                isComplete
                                  ? 'bg-gray-500 hover:bg-gray-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }
                            >
                              {isComplete ? (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Mark Incomplete
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Complete Task
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => toggleTaskExpanded(task.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-2" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-2" />
                                  View Details
                                </>
                              )}
                            </Button>

                            <ThemeButton
                              onClick={() => setAiCoachOpenFor(task.id)}
                              className="flex items-center gap-2"
                            >
                              <Bot className="w-4 h-4" />
                              AI Coach
                            </ThemeButton>

                            <Button
                              variant="outline"
                              onClick={() => handleEditMetadata(task.id)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Details
                            </Button>
                          </div>
                        </div>

                        {/* Complete Checkmark */}
                        {isComplete && (
                          <div className="ml-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-6">
                          {/* Educational Content */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-blue-600" />
                              Educational Content
                            </h4>
                            <div className="prose max-w-none">{task.educationalContent}</div>
                          </div>

                          {/* Resources */}
                          {task.resources && task.resources.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-blue-600" />
                                Helpful Resources
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {task.resources.map((resource, idx) => (
                                  <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                  >
                                    <span className="font-medium text-gray-900">{resource.name}</span>
                                    <ExternalLink className="w-4 h-4 text-blue-600" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Input Questions Form */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <HelpCircle className="w-5 h-5 text-blue-600" />
                              Answer These Questions
                            </h4>
                            
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                              {task.id === 'business-website' && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      What is your business website URL?
                                    </label>
                                    <input
                                      type="url"
                                      value={taskInputData[task.id]?.websiteUrl || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'websiteUrl', e.target.value)}
                                      placeholder="https://www.yourbusiness.com"
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Where did you purchase/register your domain?
                                    </label>
                                    <input
                                      type="text"
                                      value={taskInputData[task.id]?.domainRegistrar || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'domainRegistrar', e.target.value)}
                                      placeholder="e.g., GoDaddy, Namecheap, Google Domains"
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Which website builder are you using?
                                    </label>
                                    <select
                                      value={taskInputData[task.id]?.websiteBuilder || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'websiteBuilder', e.target.value)}
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                      <option value="">Select a website builder</option>
                                      <option value="Wix">Wix</option>
                                      <option value="Weebly">Weebly</option>
                                      <option value="WordPress">WordPress</option>
                                      <option value="GoDaddy">GoDaddy</option>
                                      <option value="HostGator">HostGator</option>
                                      <option value="Squarespace">Squarespace</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Does your website have SSL/HTTPS (secure connection)?
                                    </label>
                                    <select
                                      value={taskInputData[task.id]?.hasSSL || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'hasSSL', e.target.value)}
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                      <option value="">Select an option</option>
                                      <option value="yes">Yes - My website has HTTPS</option>
                                      <option value="no">No - Still using HTTP only</option>
                                      <option value="unsure">I'm not sure</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Is your NAP (Name, Address, Phone) information consistent on your website with your state documents and credit profile?
                                    </label>
                                    <select
                                      value={taskInputData[task.id]?.napConsistent || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'napConsistent', e.target.value)}
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                      <option value="">Select an option</option>
                                      <option value="yes">Yes - Everything matches exactly</option>
                                      <option value="no">No - I have inconsistencies</option>
                                      <option value="unsure">I need to verify</option>
                                    </select>
                                  </div>
                                </>
                              )}
                              
                              {task.id === 'business-email' && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      What is your professional business email address?
                                    </label>
                                    <input
                                      type="email"
                                      value={taskInputData[task.id]?.businessEmail || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'businessEmail', e.target.value)}
                                      placeholder="yourname@yourbusiness.com"
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Must use your business domain - NOT Gmail, Yahoo, or Hotmail
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Which email service provider are you using?
                                    </label>
                                    <select
                                      value={taskInputData[task.id]?.emailProvider || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'emailProvider', e.target.value)}
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                      <option value="">Select a provider</option>
                                      <option value="Google Workspace">Google Workspace</option>
                                      <option value="Microsoft 365">Microsoft 365</option>
                                      <option value="Zoho Mail">Zoho Mail</option>
                                      <option value="GoDaddy Email">GoDaddy Email</option>
                                      <option value="Other">Other professional email service</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Does your email domain match your website domain exactly?
                                    </label>
                                    <select
                                      value={taskInputData[task.id]?.emailMatchesDomain || ''}
                                      onChange={(e) => handleUpdateInputData(task.id, 'emailMatchesDomain', e.target.value)}
                                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    >
                                      <option value="">Select an option</option>
                                      <option value="yes">Yes - They match exactly</option>
                                      <option value="no">No - They are different</option>
                                      <option value="no-website">I don't have a website yet</option>
                                    </select>
                                  </div>
                                </>
                              )}
                              
                              <div className="pt-2 border-t border-gray-300">
                                <p className="text-xs text-gray-600 italic">
                                  💾 Your answers are automatically saved as you type
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata Edit Form */}
                      {editingMetadataFor === task.id && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-4">Edit Task Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                              </label>
                              <input
                                type="date"
                                value={tempDueDate}
                                onChange={(e) => setTempDueDate(e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
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
                                placeholder="Team member name"
                                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
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
                                placeholder="e.g., 2 hours"
                                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
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
                                placeholder="e.g., urgent, legal, setup"
                                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => handleSaveMetadata(task.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Save Details
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingMetadataFor(null)}
                            >
                              Cancel
                            </Button>
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

        {/* No Results Message */}
        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks match your filters</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filter settings</p>
            <Button
              variant="outline"
              onClick={() => {
                setFilterPriority('all');
                setFilterStatus('all');
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        )}

        {/* Video Explanation Modal */}
        {showVideoModal && (
          <VideoExplanationModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            moduleTitle="Website & Email"
            videoUrl=""
            fallbackMessage="Video guide coming soon! In the meantime, explore the educational content in each task for detailed guidance on setting up your professional website and business email."
          />
        )}

        {/* AI Coach Chat */}
        {aiCoachOpenFor && (
          <AICoachChat
            isOpen={true}
            onClose={() => setAiCoachOpenFor(null)}
            context={{
              module: 'Website & Email',
              task: tasks.find(t => t.id === aiCoachOpenFor)?.title || '',
              userProgress: {
                completedTasks,
                totalTasks,
                ficoPoints: earnedFicoPoints
              }
            }}
          />
        )}

        {/* Onboarding Modal */}
        {!hasSeenOnboarding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-4 border-blue-500 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold">🌐 Welcome to Website & Email!</h2>
                  <button onClick={handleCloseOnboarding} className="hover:bg-white/20 rounded-full p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-lg opacity-90">Let's get you started on your path to becoming bankable</p>
              </div>

              <div className="p-8">
                {onboardingStep === 0 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🌐</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Professional Online Presence</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Lenders, vendors, and customers judge your business by your online presence. A professional website and domain email are <strong>essential credibility signals</strong> that show you're serious about your business.
                      </p>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>In this module, you'll establish:</strong>
                        </p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>✓ A professional business website (NOT Facebook!)</li>
                          <li>✓ A custom domain email address</li>
                          <li>✓ NAP consistency across all platforms</li>
                          <li>✓ Credibility that helps you get approved for funding</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Website & Email Module</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        This module contains <strong>{totalTasks} critical tasks</strong> that establish your online presence.
                        Complete these to earn <strong>{totalFicoPoints} FICO points</strong>!
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
                            <p className="text-sm text-gray-700">Answer questions and click "Complete Task". Your FICO score updates automatically!</p>
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
                        onClick={handleCompleteOnboarding}
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

        {/* Achievement Gallery Modal */}
        {showAchievementGallery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-600" />
                    Your Achievements
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAchievementGallery(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Unlocked Achievements */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Unlocked ({unlockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-4 border-2 border-green-300 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            {achievement.unlockedDate && (
                              <p className="text-xs text-gray-500 mt-2">
                                Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locked Achievements */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Locked ({getLockedAchievements().length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getLockedAchievements().map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-4 border-2 border-gray-300 bg-gray-50 rounded-lg opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl grayscale">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                          <Circle className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

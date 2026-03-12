import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, User, Bell, Lock, CreditCard, Building2 } from 'lucide-react';
import { Card } from '../components/ui/card';

const settingsOptions = [
  {
    title: 'My Business Profile',
    description: 'Manage your business information, contact details, and verification status',
    icon: Building2,
    path: '/settings/my-business-profile',
    color: 'from-blue-600 to-cyan-600',
    iconBg: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Account Settings',
    description: 'Update your email, password, and notification preferences',
    icon: User,
    path: '/settings/account',
    color: 'from-purple-600 to-pink-600',
    iconBg: 'from-purple-500 to-pink-500',
    comingSoon: true
  },
  {
    title: 'Privacy & Security',
    description: 'Manage your privacy settings and security preferences',
    icon: Lock,
    path: '/settings/privacy',
    color: 'from-emerald-600 to-teal-600',
    iconBg: 'from-emerald-500 to-teal-500',
    comingSoon: true
  },
  {
    title: 'Billing & Subscription',
    description: 'View and manage your subscription and payment methods',
    icon: CreditCard,
    path: '/settings/billing',
    color: 'from-orange-600 to-red-600',
    iconBg: 'from-orange-500 to-red-500',
    comingSoon: true
  }
];

export function Settings() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string, comingSoon?: boolean) => {
    if (!comingSoon) {
      navigate(path);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-base sm:text-lg text-gray-600">
                Manage your account, business profile, and system preferences
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card
                  onClick={() => handleNavigation(option.path, option.comingSoon)}
                  className={`p-6 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 ${
                    option.comingSoon ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
                  } relative overflow-hidden group`}
                >
                  {/* Background Gradient Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
                  
                  <div className="relative">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`w-14 h-14 bg-gradient-to-br ${option.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-gray-900">{option.title}</h2>
                          {option.comingSoon && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-300">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {/* Arrow Indicator - Only for active options */}
                    {!option.comingSoon && (
                      <div className="flex justify-end">
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Additional Settings Coming Soon</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We're continuously improving your experience. Account settings, privacy controls, and billing management will be available soon. For now, you can manage your complete business profile and all verification details.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

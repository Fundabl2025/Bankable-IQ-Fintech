import { Globe, MapPin, Phone, Building2, CheckCircle, XCircle, AlertTriangle, Search, TrendingUp, Award } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

export function OnlineAnalysis() {
  const napConsistency = {
    canonical: {
      name: 'Accident Resource Network LLC',
      address: '3575 N Hall St, Suite 107, Dallas, TX 75219',
      phone: '(214) 555-0123'
    },
    variations: [
      {
        source: 'Google Business Profile',
        name: 'Accident Resource Network LLC',
        address: '3575 N Hall St, Ste 107, Dallas, TX 75219',
        phone: '(214) 555-0123',
        status: 'consistent'
      },
      {
        source: 'Dun & Bradstreet',
        name: 'Accident Resource Network LLC',
        address: '3575 N Hall Street, Suite 107, Dallas, Texas 75219',
        phone: '214-555-0123',
        status: 'minor-variation'
      },
      {
        source: 'Experian Business',
        name: 'Accident Resource Network',
        address: '3575 N Hall St, Suite 107, Dallas, TX 75219',
        phone: '(214) 555-0123',
        status: 'warning'
      },
      {
        source: 'Equifax Business',
        name: 'Accident Resource Network LLC',
        address: '3575 Hall St N, Dallas, TX 75219',
        phone: '214.555.0123',
        status: 'warning'
      },
      {
        source: 'Yelp',
        name: 'Accident Resource Network',
        address: '3575 N Hall St #107, Dallas, TX 75219',
        phone: '(214) 555-0123',
        status: 'minor-variation'
      },
      {
        source: 'Yellow Pages',
        name: 'Accident Resource Network LLC',
        address: '3575 N Hall St, Ste 107, Dallas, TX 75219',
        phone: '(214) 555-0123',
        status: 'consistent'
      }
    ]
  };

  const digitalFootprint = [
    {
      category: 'Business Directories',
      score: 85,
      platforms: [
        { name: 'Google Business Profile', status: 'claimed', verified: true, complete: 95 },
        { name: 'Bing Places', status: 'claimed', verified: true, complete: 90 },
        { name: 'Yellow Pages', status: 'claimed', verified: false, complete: 80 },
        { name: 'Yelp', status: 'claimed', verified: true, complete: 85 },
        { name: 'Better Business Bureau', status: 'unclaimed', verified: false, complete: 0 }
      ]
    },
    {
      category: 'Credit Bureaus',
      score: 75,
      platforms: [
        { name: 'Dun & Bradstreet', status: 'claimed', verified: true, complete: 90 },
        { name: 'Experian Business', status: 'claimed', verified: true, complete: 85 },
        { name: 'Equifax Business', status: 'claimed', verified: false, complete: 60 }
      ]
    },
    {
      category: 'Social Media',
      score: 70,
      platforms: [
        { name: 'LinkedIn Company', status: 'claimed', verified: true, complete: 90 },
        { name: 'Facebook Business', status: 'claimed', verified: true, complete: 80 },
        { name: 'Twitter/X', status: 'claimed', verified: false, complete: 60 },
        { name: 'Instagram Business', status: 'unclaimed', verified: false, complete: 0 }
      ]
    },
    {
      category: 'Industry Specific',
      score: 60,
      platforms: [
        { name: 'Healthcare Directory', status: 'claimed', verified: false, complete: 70 },
        { name: 'Insurance Listings', status: 'unclaimed', verified: false, complete: 0 },
        { name: 'Chamber of Commerce', status: 'claimed', verified: true, complete: 85 }
      ]
    }
  ];

  const citationIssues = [
    {
      type: 'Name Inconsistency',
      severity: 'high',
      count: 3,
      description: 'Business name appears without LLC designation on 3 platforms',
      action: 'Update to include LLC on all citations'
    },
    {
      type: 'Address Format',
      severity: 'medium',
      count: 4,
      description: 'Address format varies (St vs Street, Ste vs Suite)',
      action: 'Standardize to "St, Ste" format'
    },
    {
      type: 'Phone Format',
      severity: 'low',
      count: 2,
      description: 'Phone number format inconsistent (dots vs dashes vs parentheses)',
      action: 'Standardize to (XXX) XXX-XXXX format'
    },
    {
      type: 'Missing Suite Number',
      severity: 'medium',
      count: 1,
      description: 'Suite number missing on 1 citation',
      action: 'Add complete suite information'
    },
    {
      type: 'Duplicate Listings',
      severity: 'high',
      count: 2,
      description: 'Duplicate business listings found on Google and Yelp',
      action: 'Merge or remove duplicate listings'
    }
  ];

  const recommendations = [
    {
      title: 'Standardize NAP Across All Platforms',
      priority: 'critical',
      impact: 'High',
      effort: 'Medium',
      description: 'Update all business listings to match canonical NAP format exactly',
      steps: [
        'Audit all 50+ directory listings',
        'Update name to include LLC',
        'Standardize address format',
        'Use consistent phone format'
      ]
    },
    {
      title: 'Claim Unclaimed Listings',
      priority: 'high',
      impact: 'High',
      effort: 'Low',
      description: 'Claim and verify business on BBB and Instagram',
      steps: [
        'Claim Better Business Bureau profile',
        'Set up Instagram Business account',
        'Complete verification process',
        'Add complete business information'
      ]
    },
    {
      title: 'Remove Duplicate Listings',
      priority: 'high',
      impact: 'High',
      effort: 'Low',
      description: 'Merge or remove duplicate business listings',
      steps: [
        'Identify all duplicate listings',
        'Request removal or merge with Google',
        'Update Yelp duplicates',
        'Monitor for new duplicates'
      ]
    },
    {
      title: 'Complete Partial Profiles',
      priority: 'medium',
      impact: 'Medium',
      effort: 'Medium',
      description: 'Fill out incomplete business profiles to 100%',
      steps: [
        'Add business hours to all profiles',
        'Upload photos to directories',
        'Complete business descriptions',
        'Add services/products offered'
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'consistent':
        return <Badge variant="success">Consistent</Badge>;
      case 'minor-variation':
        return <Badge variant="warning">Minor Variation</Badge>;
      case 'warning':
        return <Badge variant="error">Inconsistent</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consistent':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'minor-variation':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'warning':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getPlatformStatusBadge = (status: string) => {
    switch (status) {
      case 'claimed':
        return <Badge variant="success">Claimed</Badge>;
      case 'unclaimed':
        return <Badge variant="error">Unclaimed</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const avgFootprintScore = Math.round(
    digitalFootprint.reduce((sum, cat) => sum + cat.score, 0) / digitalFootprint.length
  );

  const consistentCount = napConsistency.variations.filter(v => v.status === 'consistent').length;
  const totalCount = napConsistency.variations.length;
  const consistencyPercentage = Math.round((consistentCount / totalCount) * 100);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Online Presence Analysis</h1>
            <Badge variant="info" className="text-sm px-3 py-1">
              NAP Consistency Check
            </Badge>
          </div>
          <p className="text-gray-600">Monitor NAP consistency and digital footprint across the web</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className={`rounded-2xl p-6 text-white shadow-lg ${
            consistencyPercentage >= 80 
              ? 'bg-gradient-to-br from-emerald-600 to-green-600'
              : consistencyPercentage >= 60
              ? 'bg-gradient-to-br from-amber-600 to-orange-600'
              : 'bg-gradient-to-br from-red-600 to-rose-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/90 text-sm mb-1">NAP Consistency</p>
            <p className="text-4xl font-bold mb-1">{consistencyPercentage}%</p>
            <p className="text-sm text-white/80">{consistentCount} of {totalCount} listings</p>
          </div>

          <div className={`rounded-2xl p-6 text-white shadow-lg ${
            avgFootprintScore >= 80 
              ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
              : 'bg-gradient-to-br from-purple-600 to-indigo-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/90 text-sm mb-1">Digital Footprint</p>
            <p className="text-4xl font-bold mb-1">{avgFootprintScore}/100</p>
            <p className="text-sm text-white/80">Average presence score</p>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/90 text-sm mb-1">Issues Found</p>
            <p className="text-4xl font-bold mb-1">{citationIssues.length}</p>
            <p className="text-sm text-white/80">Citation issues</p>
          </div>
        </motion.div>

        {/* NAP Consistency Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg mb-8 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">NAP Consistency Analysis</h2>
                <p className="text-sm text-blue-100">Name, Address, Phone verification across platforms</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Canonical NAP */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Canonical Business Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Business Name:</div>
                    <div className="font-semibold text-gray-900">{napConsistency.canonical.name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Address:</div>
                    <div className="font-semibold text-gray-900">{napConsistency.canonical.address}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Phone:</div>
                    <div className="font-semibold text-gray-900">{napConsistency.canonical.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Variations */}
            <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Variations</h3>
            <div className="space-y-3">
              {napConsistency.variations.map((variation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.05) }}
                  className={`p-4 rounded-xl border-2 ${
                    variation.status === 'consistent'
                      ? 'bg-emerald-50 border-emerald-200'
                      : variation.status === 'minor-variation'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(variation.status)}
                      <h4 className="font-bold text-gray-900">{variation.source}</h4>
                    </div>
                    {getStatusBadge(variation.status)}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="text-gray-900">{variation.name}</span></div>
                    <div><span className="text-gray-600">Address:</span> <span className="text-gray-900">{variation.address}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="text-gray-900">{variation.phone}</span></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Digital Footprint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Digital Footprint Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {digitalFootprint.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
              >
                <div className={`p-6 ${
                  category.score >= 80 
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600'
                    : category.score >= 60
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{category.category}</h3>
                      <p className="text-sm opacity-90">{category.platforms.length} platforms</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{category.score}</div>
                      <div className="text-sm opacity-90">Score</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {category.platforms.map((platform, pIndex) => (
                      <div key={pIndex} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{platform.name}</div>
                          <div className="flex items-center gap-2">
                            {getPlatformStatusBadge(platform.status)}
                            {platform.verified && (
                              <Badge variant="success" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{platform.complete}%</div>
                          <div className="text-xs text-gray-600">Complete</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Citation Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg mb-8 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Citation Issues to Fix</h2>
                <p className="text-sm text-amber-100">Problems affecting NAP consistency</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {citationIssues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.05) }}
                  className={`p-5 rounded-xl border-2 ${
                    issue.severity === 'high'
                      ? 'bg-red-50 border-red-200'
                      : issue.severity === 'medium'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-gray-900">{issue.type}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}>
                        {issue.severity} severity
                      </Badge>
                      <Badge variant="default">{issue.count} instances</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Action:</span>
                    <span className="font-medium text-gray-900">{issue.action}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Action Plan Recommendations</h2>
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + (index * 0.1) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge variant={rec.priority === 'critical' ? 'error' : rec.priority === 'high' ? 'warning' : 'info'}>
                      {rec.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Impact: <span className="font-semibold">{rec.impact}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Effort: <span className="font-semibold">{rec.effort}</span></span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Action Steps:</h4>
                  <ul className="space-y-1">
                    {rec.steps.map((step, sIndex) => (
                      <li key={sIndex} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button>Start Action Plan</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

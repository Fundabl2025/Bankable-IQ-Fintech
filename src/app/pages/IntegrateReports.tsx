import { Download, CheckCircle2, Lock, Shield, TrendingUp, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card-modern';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';

export function IntegrateReports() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full -ml-32 -mb-32" />
            
            <div className="relative">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="default" className="mb-3 bg-white/20 border-white/30 text-white">
                    Credit Integration
                  </Badge>
                  <h1 className="text-4xl font-bold mb-3">Accessing & Integrating Personal & Business Credit Data</h1>
                  <p className="text-cyan-100 text-lg">
                    Integrate the personal credit reports of the owners to be better matched to available funding programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Why Integrate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Why Integrate Your Credit Reports?</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Unlock accurate funding pre-qualifications</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  By integrating the owner's personal credit reports we then produce a report that shows how to optimize it for business funding.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-gray-900 font-semibold">
                    To fully activate your funding pre-qualifications we need to integrate the personal credit reports of an owner of the business.
                  </p>
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  If there are more than one owner of the business, it is best to choose the owner with the best personal credit. "Best" in this case means having the highest FICO scores along with the highest amount limits on open revolving credit cards.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">3 Personal Credit Reports</h3>
              <p className="text-sm text-gray-600 mb-3">
                Access Experian, Equifax, and TransUnion personal credit reports with FICO 8 scores
              </p>
              <Badge variant="success">Included</Badge>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">2 Business Credit Reports</h3>
              <p className="text-sm text-gray-600 mb-3">
                Monitor Experian and Dun & Bradstreet with Intelliscore and Paydex scores
              </p>
              <Badge variant="info">Included</Badge>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-md"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">UBF Funding Estimator</h3>
              <p className="text-sm text-gray-600 mb-3">
                Details how much unsecured financing may be available and optimization actions
              </p>
              <Badge variant="default">Bonus</Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Additional Insights Included</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Having a mySCOREIQ account makes it possible to integrate the three personal credit reports and two business credit reports. 
                    This will make your funding program pre-qualifications more accurate. See Uniform Commercial Code (UCC) filings, 
                    public record filings and pending legal filings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3-Step Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Integrate Your Reports</h2>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <motion.div
              whileHover={{ x: 4 }}
              className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Get A Subscription To Access Your Reports</h3>
                  <p className="text-sm text-gray-600">
                    You will need to set up your mySCOREIQ credit report account to begin the integration process.
                  </p>
                </div>
                <Badge variant="warning">Required</Badge>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ x: 4 }}
              className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Provide Credentials To Integrate Reports</h3>
                  <p className="text-sm text-gray-600">
                    Enter your mySCOREIQ User ID/Password with the last 4 digits of SSN and click "Save" to complete the integration.
                  </p>
                </div>
                <Badge variant="info">Secure</Badge>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ x: 4 }}
              className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Reports Automatically Integrated</h3>
                  <p className="text-sm text-gray-600">
                    When steps 1 & 2 are completed, your personal and business credit reports are integrated into your success system.
                  </p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <Badge variant="default" className="mb-3 bg-white/20 border-white/30 text-white">
                Get Started Now
              </Badge>
              <h2 className="text-3xl font-bold text-white mb-3">
                Access, Monitor & Integrate Your Credit Reports
              </h2>
              <p className="text-cyan-100 max-w-3xl mx-auto">
                Make sure that your funding pre-qualifications are accurate - integrate your reports today
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">What You'll Access:</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                View and integrate your 3 personal credit reports and FICO 8 scores. For better funding pre-qualifications, 
                access and monitor your business credit with both Experian business and Dun & Bradstreet. Integrate your 
                business credit reports with your Intelliscore and Paydex scores. See Uniform Commercial Code (UCC) filings, 
                public record filings and pending legal filings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-6 text-base shadow-lg">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Get A Subscription To Access Your Reports
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 text-base shadow-lg">
                    <Lock className="w-5 h-5 mr-2" />
                    Provide Credentials To Integrate Reports
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-cyan-100 text-sm">
              <Shield className="w-4 h-4" />
              <span>Your credentials are encrypted and securely stored</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
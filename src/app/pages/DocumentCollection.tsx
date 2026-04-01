import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Download, Trash2, Eye } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';

export function DocumentCollection() {
  // Persist doc portal visit so Finances checklist reflects state
  useEffect(() => {
    localStorage.setItem('fundready_doc_portal_visited', '1');
    // Mark specific categories based on uploaded docs in state
    const hasBankDoc = documents.some(d => d.category === 'Bank Statements' && d.status === 'uploaded');
    const hasTaxDoc = documents.some(d => d.category === 'Tax Returns' && d.status === 'uploaded');
    if (hasBankDoc) localStorage.setItem('fundready_bank_statements_uploaded', '1');
    if (hasTaxDoc) localStorage.setItem('fundready_tax_returns_uploaded', '1');
    window.dispatchEvent(new Event('fundscoreUpdated'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [documents, setDocuments] = useState([
    { 
      category: 'Tax Returns', 
      name: '2023_Business_Tax_Return.pdf', 
      status: 'uploaded', 
      uploadedDate: '2024-01-15',
      size: '2.4 MB'
    },
    { 
      category: 'Bank Statements', 
      name: 'Bank_Statement_Dec_2023.pdf', 
      status: 'uploaded', 
      uploadedDate: '2024-01-18',
      size: '1.2 MB'
    },
    { 
      category: 'Financial Statements', 
      name: 'P&L_Statement_Q4_2023.pdf', 
      status: 'uploaded', 
      uploadedDate: '2024-01-20',
      size: '890 KB'
    }
  ]);

  const documentCategories = [
    {
      name: 'Tax Returns',
      description: 'Business and personal tax returns (last 2 years)',
      required: true,
      status: 'complete',
      count: 1
    },
    {
      name: 'Bank Statements',
      description: 'Business bank statements (last 3-6 months)',
      required: true,
      status: 'complete',
      count: 1
    },
    {
      name: 'Financial Statements',
      description: 'P&L, Balance Sheet, Cash Flow statements',
      required: true,
      status: 'complete',
      count: 1
    },
    {
      name: 'Business Licenses',
      description: 'Business license and permits',
      required: true,
      status: 'pending',
      count: 0
    },
    {
      name: 'Articles of Incorporation',
      description: 'LLC/Corporation formation documents',
      required: true,
      status: 'pending',
      count: 0
    },
    {
      name: 'Business Plan',
      description: 'Current business plan and projections',
      required: false,
      status: 'pending',
      count: 0
    },
    {
      name: 'Accounts Receivable',
      description: 'Aging reports and invoices',
      required: false,
      status: 'pending',
      count: 0
    },
    {
      name: 'Collateral Documentation',
      description: 'Equipment lists, property deeds, etc.',
      required: false,
      status: 'pending',
      count: 0
    }
  ];

  const totalRequired = documentCategories.filter(d => d.required).length;
  const completedRequired = documentCategories.filter(d => d.required && d.status === 'complete').length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="success">Complete</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'uploaded':
        return <Badge variant="success">Uploaded</Badge>;
      default:
        return <Badge variant="default">Not Started</Badge>;
    }
  };

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
            <h1 className="text-4xl font-bold text-gray-900">Document Collection</h1>
            <Badge variant="info" className="text-sm px-3 py-1">
              {completedRequired} of {totalRequired} Required
            </Badge>
          </div>
          <p className="text-gray-600">Organize and upload necessary documents for financing applications</p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Document Completion</h2>
              <p className="text-blue-100">Track your progress on required documents</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{completionPercentage}%</div>
              <div className="text-sm text-blue-100">Complete</div>
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-4 mb-4">
            <div 
              className="bg-white rounded-full h-4 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-100 text-sm mb-1">Total Documents</p>
              <p className="text-3xl font-bold">{documents.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-100 text-sm mb-1">Required Items</p>
              <p className="text-3xl font-bold">{completedRequired}/{totalRequired}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-100 text-sm mb-1">Optional Items</p>
              <p className="text-3xl font-bold">{documentCategories.filter(d => !d.required).length}</p>
            </div>
          </div>
        </motion.div>

        {/* Document Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.05) }}
              >
                <Card className={`p-6 border-2 ${
                  category.status === 'complete' 
                    ? 'border-emerald-200 bg-emerald-50/50' 
                    : 'border-slate-200 hover:border-blue-300'
                } transition-all`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        category.status === 'complete'
                          ? 'bg-emerald-100'
                          : 'bg-slate-100'
                      }`}>
                        {category.status === 'complete' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{category.name}</h3>
                          {category.required && (
                            <Badge variant="error" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        {category.count > 0 && (
                          <p className="text-xs text-emerald-600 font-medium">{category.count} file(s) uploaded</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(category.status)}
                  </div>

                  <Button 
                    variant="outline"
                    className="w-full mt-3"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Uploaded Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Uploaded Documents</h2>
                <p className="text-sm text-purple-100">Manage your uploaded files</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (index * 0.05) }}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-gray-600">{doc.category}</p>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-600">{doc.size}</p>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-600">Uploaded {doc.uploadedDate}</p>
                        </div>
                      </div>
                      <Badge variant="success">Uploaded</Badge>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-gray-600 font-medium">No documents uploaded yet</p>
                <p className="text-sm text-gray-500 mt-1">Upload documents using the category cards above</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Document Requirements</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc ml-4">
                <li>All documents must be in PDF format</li>
                <li>File size should not exceed 10MB per document</li>
                <li>Ensure all documents are current and legible</li>
                <li>Personal information should be clearly visible (don't redact required fields)</li>
                <li>Required documents must be uploaded before submitting funding applications</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

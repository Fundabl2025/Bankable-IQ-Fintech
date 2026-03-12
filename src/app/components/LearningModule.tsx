import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, PlayCircle, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { useNavigate } from 'react-router';
import {
  getModuleById,
  getNextModule,
  getPreviousModule,
  markModuleComplete,
  markModuleIncomplete,
  isModuleComplete as checkModuleComplete,
  updateModuleLastViewed
} from '../utils/lenderComplianceModules';

interface LearningModuleProps {
  moduleId: string;
  videoUrl?: string;
  children: ReactNode; // Content sections will be passed as children
}

export function LearningModule({ moduleId, videoUrl, children }: LearningModuleProps) {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const module = getModuleById(moduleId);
  const nextModule = getNextModule(moduleId);
  const previousModule = getPreviousModule(moduleId);

  useEffect(() => {
    if (module) {
      setIsComplete(checkModuleComplete(moduleId));
      updateModuleLastViewed(moduleId);
    }
  }, [moduleId, module]);

  if (!module) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <h1 className="mb-2" style={{ color: 'var(--foreground)' }}>Module Not Found</h1>
          <Button onClick={() => navigate('/lender-compliance')}>
            Return to Lender Compliance
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleComplete = () => {
    if (isComplete) {
      markModuleIncomplete(moduleId);
      setIsComplete(false);
    } else {
      markModuleComplete(moduleId);
      setIsComplete(true);
    }
  };

  const handleNext = () => {
    if (nextModule) {
      navigate(nextModule.route);
    }
  };

  const handlePrevious = () => {
    if (previousModule) {
      navigate(previousModule.route);
    }
  };

  const handleBackToOverview = () => {
    navigate('/lender-compliance');
  };

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto p-8">
        {/* Breadcrumb / Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-2 font-medium transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lender Compliance
          </button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card 
            className="p-8 border-2"
            style={{
              backgroundColor: isComplete ? 'var(--success-bg)' : 'var(--primary-bg)',
              borderColor: isComplete ? 'var(--success-border)' : 'var(--primary-border)'
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={module.category === 'Complete Compliance' ? 'default' : 'info'}>
                    {module.category}
                  </Badge>
                  {isComplete && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </Badge>
                  )}
                </div>
                <h1 className="mb-3" style={{ color: 'var(--foreground)' }}>{module.title}</h1>
                <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>{module.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleToggleComplete}
                  size="lg"
                  style={{
                    backgroundColor: isComplete ? 'var(--muted)' : 'var(--success)',
                    color: isComplete ? 'var(--foreground)' : 'var(--success-foreground)'
                  }}
                >
                  {isComplete ? (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Video Section */}
        {videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-2" style={{ borderColor: 'var(--border)' }}>
              <div className="p-4" style={{ 
                background: 'linear-gradient(to right, var(--primary), var(--info))',
                color: 'var(--primary-foreground)'
              }}>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Video Lesson</h2>
                </div>
              </div>
              <div className="relative w-full" style={{ backgroundColor: '#000', paddingBottom: '56.25%' }}>
                <iframe
                  src={videoUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${module.title} Video Lesson`}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Placeholder for Video if URL not provided */}
        {!videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card 
              className="p-8 border-2 border-dashed" 
              style={{ 
                borderColor: 'var(--border-medium)',
                backgroundColor: 'var(--surface-1)' 
              }}
            >
              <div className="text-center">
                <PlayCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Video Lesson Coming Soon</h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  The video lesson for this module will be added here.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="overflow-hidden border-2" style={{ borderColor: 'var(--border)' }}>
            <div 
              className="p-4"
              style={{ 
                background: 'linear-gradient(to right, var(--surface-3), var(--muted))',
                color: 'var(--foreground)'
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-lg font-bold">Learning Content</h2>
              </div>
            </div>
            <div className="p-8">
              {children}
            </div>
          </Card>
        </motion.div>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between gap-4"
        >
          {previousModule ? (
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous: {previousModule.title}
            </Button>
          ) : (
            <div className="flex-1"></div>
          )}

          {nextModule ? (
            <Button
              onClick={handleNext}
              size="lg"
              className="flex-1"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              Next: {nextModule.title}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleBackToOverview}
              size="lg"
              className="flex-1"
              style={{
                backgroundColor: 'var(--success)',
                color: 'var(--success-foreground)'
              }}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Back to Overview
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

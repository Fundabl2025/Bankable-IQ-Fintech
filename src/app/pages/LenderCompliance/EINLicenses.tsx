import { LearningModule } from '../../components/LearningModule';

export function EINLicenses() {
  return (
    <LearningModule moduleId="ein-licenses">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Overview</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your EIN (Employer Identification Number) and business licenses are fundamental 
            requirements for business credit and funding approval.
          </p>
        </div>

        <div className="bg-slate-100 border-2 border-dashed border-slate-300 p-8 rounded-xl text-center">
          <p className="text-slate-600">
            Detailed content will be added here based on your materials.
          </p>
        </div>
      </div>
    </LearningModule>
  );
}

import { LearningModule } from '../../components/LearningModule';

export function CDBusinessLoan() {
  return (
    <LearningModule moduleId="cd-business-loan">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Overview</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            CD-secured business loans offer a unique path to business credit using your 
            certificate of deposit as collateral.
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

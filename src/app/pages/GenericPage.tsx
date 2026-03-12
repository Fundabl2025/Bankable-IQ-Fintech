import { LucideIcon } from 'lucide-react';
import { Card } from '../components/ui/card';

interface GenericPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function GenericPage({ title, description, icon: Icon }: GenericPageProps) {
  return (
    <div className="flex-1 min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Icon className="w-10 h-10 text-cyan-600" />
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <Card className="p-8">
          <p className="text-gray-600 text-lg mb-6">{description}</p>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
            <p className="text-cyan-900">
              This section is under development. More features and functionality will be added soon.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

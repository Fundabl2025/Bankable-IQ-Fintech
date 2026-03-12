interface GoalCardProps {
  number: number;
  title: string;
  description: string;
  status?: string;
}

export function GoalCard({ number, title, description, status }: GoalCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-bold mb-2">Goal {number}</h3>
      <p className="text-sm font-semibold mb-1">{title}</p>
      {status && <p className="text-xs text-gray-600">Status: {status}</p>}
      <p className="text-xs text-gray-600 mt-2">{description}</p>
    </div>
  );
}

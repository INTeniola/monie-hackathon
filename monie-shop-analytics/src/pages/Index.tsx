
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { MetricsDisplay } from "@/components/MetricsDisplay";


const Index = () => {
  const [metrics, setMetrics] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/uploads/f5076410-97d2-4186-be7f-b0945576b5e8.png"
              alt="Monieshop Logo"
              className="h-16 w-auto mb-4"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Monieshop Analytics
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your daily transaction files to view key performance metrics
          </p>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <FileUpload onFilesProcessed={setMetrics} />
        </div>

        {metrics.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <MetricsDisplay metrics={metrics} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

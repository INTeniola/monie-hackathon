
import { Card } from "@/components/ui/card";
import { 
  TrendingUpIcon, 
  DollarSignIcon, 
  PackageIcon, 
  UserIcon, 
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import { useState } from "react";

interface MetricsDisplayProps {
  metrics: {
    date: string;
    highestVolumeDay: { day: string; volume: number };
    highestValueDay: { day: string; value: number };
    mostSoldProduct: { id: string; quantity: number };
    topStaffByMonth: Array<{ month: string; staffId: string }>;
    peakHour: { hour: number; avgVolume: number };
  }[];
}

export const MetricsDisplay = ({ metrics }: MetricsDisplayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const formatHour = (hour: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      hour: 'numeric', 
      hour12: true 
    }).format(new Date().setHours(hour, 0, 0));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(metrics.length - 1, prev + 1));
  };

  const currentMetrics = metrics[currentIndex];

  return (
    <div className="relative">
      {metrics.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Previous metrics"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === metrics.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Next metrics"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700">
          Metrics for {formatDate(currentMetrics.date)}
        </h3>
        <p className="text-sm text-gray-500">
          File {currentIndex + 1} of {metrics.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto animate-fade-in">
        <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-50">
              <TrendingUpIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-600">Highest Sales Volume</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{currentMetrics.highestVolumeDay.volume.toLocaleString()} units</p>
            <p className="text-sm text-gray-500">{formatDate(currentMetrics.highestVolumeDay.day)}</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-50">
              <DollarSignIcon className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="font-medium text-gray-600">Highest Sales Value</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">₦{currentMetrics.highestValueDay.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-gray-500">{formatDate(currentMetrics.highestValueDay.day)}</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-50">
              <PackageIcon className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-medium text-gray-600">Most Sold Product</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">ID: {currentMetrics.mostSoldProduct.id}</p>
            <p className="text-sm text-gray-500">{currentMetrics.mostSoldProduct.quantity.toLocaleString()} units sold</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-50">
              <UserIcon className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="font-medium text-gray-600">Top Staff by Month</h3>
          </div>
          <div className="space-y-2">
            {currentMetrics.topStaffByMonth.map(({ month, staffId }) => (
              <div key={month} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{month}</span>
                <span className="font-medium">Staff #{staffId}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-50">
              <ClockIcon className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-medium text-gray-600">Peak Sales Hour</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{formatHour(currentMetrics.peakHour.hour)}</p>
            <p className="text-sm text-gray-500">
              Avg. {Math.round(currentMetrics.peakHour.avgVolume)} units/transaction
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

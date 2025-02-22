
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { ArrowUpIcon } from 'lucide-react';

interface FileUploadProps {
  onFilesProcessed: (metrics: any[]) => void;
}

export const FileUpload = ({ onFilesProcessed }: FileUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    try {
      const fileMetrics = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          const transactions = content
            .split('\n')
            .filter(Boolean)
            .map((line) => {
              const [staffId, time, products, amount] = line.split(',');
              return {
                staffId: parseInt(staffId),
                time: new Date(time),
                products: products.slice(1, -1).split('|').map(prod => {
                  const [id, qty] = prod.split(':');
                  return { id, quantity: parseInt(qty) };
                }),
                amount: parseFloat(amount)
              };
            });

          const fileDate = transactions[0]?.time.toISOString().split('T')[0] || '';
          return {
            date: fileDate,
            ...calculateMetrics(transactions)
          };
        })
      );

      // Sort metrics by date
      fileMetrics.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      onFilesProcessed(fileMetrics);
      toast.success(`Processed ${files.length} file${files.length > 1 ? 's' : ''} successfully`);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateMetrics = (transactions: any[]) => {
    // Group by day for sales volume and value
    const dailyStats = transactions.reduce((acc, t) => {
      const day = t.time.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { volume: 0, value: 0 };
      
      const volume = t.products.reduce((sum: number, p: any) => sum + p.quantity, 0);
      acc[day].volume += volume;
      acc[day].value += t.amount;
      return acc;
    }, {});

    // Find highest sales volume and value days
    const highestVolumeDay = Object.entries(dailyStats)
      .reduce((max, [day, stats]: [string, any]) => 
        stats.volume > (max.volume || 0) ? { day, volume: stats.volume } : max
      , { day: '', volume: 0 });

    const highestValueDay = Object.entries(dailyStats)
      .reduce((max, [day, stats]: [string, any]) => 
        stats.value > (max.value || 0) ? { day, value: stats.value } : max
      , { day: '', value: 0 });

    // Most sold product
    const productVolumes = transactions.flatMap(t => 
      t.products.map(p => ({ id: p.id, quantity: p.quantity }))
    ).reduce((acc, { id, quantity }) => {
      acc[id] = (acc[id] || 0) + quantity;
      return acc;
    }, {});

    const mostSoldProduct = Object.entries(productVolumes)
      .reduce((max, [id, qty]: [string, any]) => 
        qty > max.quantity ? { id, quantity: qty } : max
      , { id: '', quantity: 0 });

    // Top staff by month
    const monthlyStaffSales = transactions.reduce((acc, t) => {
      const month = t.time.toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = {};
      acc[month][t.staffId] = (acc[month][t.staffId] || 0) + t.amount;
      return acc;
    }, {});

    const topStaffByMonth = Object.entries(monthlyStaffSales).map(([month, staffSales]: [string, any]) => ({
      month,
      staffId: Object.entries(staffSales)
        .reduce((max: [string, number], [staffId, amount]: [string, number]) => 
          amount > max[1] ? [staffId, amount] : max
        , ['', 0])[0]
    }));

    // Peak hour
    const hourlyVolumes = transactions.reduce((acc, t) => {
      const hour = t.time.getHours();
      if (!acc[hour]) acc[hour] = { count: 0, totalVolume: 0 };
      acc[hour].count++;
      acc[hour].totalVolume += t.products.reduce((sum: number, p: any) => sum + p.quantity, 0);
      return acc;
    }, {});

    const peakHour = Object.entries(hourlyVolumes)
      .reduce((max, [hour, stats]: [string, any]) => {
        const avg = stats.totalVolume / stats.count;
        return avg > (max.avgVolume || 0) ? { hour: parseInt(hour), avgVolume: avg } : max;
      }, { hour: 0, avgVolume: 0 });

    return {
      highestVolumeDay,
      highestValueDay,
      mostSoldProduct,
      topStaffByMonth,
      peakHour
    };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-xl mx-auto p-12 rounded-xl border-2 border-dashed
        transition-all duration-300 ease-in-out
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200'}
        ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-primary/50'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <ArrowUpIcon className={`w-12 h-12 transition-colors duration-300 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
        <p className="text-center text-lg text-gray-600">
          {isProcessing ? 'Processing...' : (
            isDragActive ? 'Drop the files here' : 'Drag & drop transaction files here, or click to select'
          )}
        </p>
      </div>
    </div>
  );
};

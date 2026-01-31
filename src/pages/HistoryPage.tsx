
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  History, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  BarChart3,
  Clock,
  Database,
  Info,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockAPI, analyticsAPI } from '@/services/api';
import type { EquipmentDataset } from '@/types/equipment';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Dataset card component
function DatasetCard({
  dataset,
  index,
  onViewAnalytics,
  onDownloadReport,
  onDelete,
}: {
  dataset: EquipmentDataset;
  index: number;
  onViewAnalytics: () => void;
  onDownloadReport: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="glass-card-hover p-6 group"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Icon and file info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:scale-110 transition-transform duration-300">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate">
              {dataset.filename}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(dataset.uploaded_at), 'MMM d, yyyy h:mm a')}
              </span>
              <span className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                {dataset.total_records} records
              </span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-6 px-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Flowrate</p>
            <p className="text-lg font-bold text-foreground">
              {dataset.avg_flowrate?.toFixed(1) || '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pressure</p>
            <p className="text-lg font-bold text-foreground">
              {dataset.avg_pressure?.toFixed(2) || '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Temp</p>
            <p className="text-lg font-bold text-foreground">
              {dataset.avg_temperature?.toFixed(1) || '-'}°
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAnalytics}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadReport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Empty state
function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/5 flex items-center justify-center mb-6"
      >
        <History className="h-10 w-10 text-muted-foreground" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">No Upload History</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        You haven't uploaded any datasets yet. Start by uploading your first CSV file.
      </p>
      
      <Button onClick={() => navigate('/upload')} className="gap-2">
        Upload Your First Dataset
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [datasets, setDatasets] = useState<EquipmentDataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<EquipmentDataset | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const history = await mockAPI.getHistory();
      setDatasets(history.datasets);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load upload history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [toast]);

  const handleViewAnalytics = (dataset: EquipmentDataset) => {
    navigate('/dashboard');
    toast({
      title: 'Viewing Analytics',
      description: `Loaded analytics for ${dataset.filename}`,
    });
  };

  const handleDownloadReport = (dataset: EquipmentDataset) => {
  const reportUrl = analyticsAPI.getReportUrl(dataset.id);

  // 🔥 ACTUALLY DOWNLOAD / OPEN PDF
  window.open(reportUrl, "_blank");

  toast({
    title: "Download Started",
    description: `Generating PDF report for ${dataset.filename}`,
  });
};

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDatasets((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast({
        title: 'Deleted',
        description: `${deleteTarget.filename} has been deleted`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete dataset',
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Upload History</h1>
            <p className="text-muted-foreground">
              View and manage your recent uploads
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button 
            variant="outline" 
            onClick={loadHistory} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </motion.div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 flex items-center gap-3 bg-info/5 border-info/20"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
          <Info className="h-5 w-5 text-info" />
        </div>
        <p className="text-sm text-foreground">
          <strong>Retention Policy:</strong> Only the last 5 uploads are retained. 
          Older datasets are automatically removed to optimize storage.
        </p>
      </motion.div>

      {/* Dataset List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card h-28 shimmer"
            />
          ))}
        </div>
      ) : datasets.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {datasets.map((dataset, index) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                index={index}
                onViewAnalytics={() => handleViewAnalytics(dataset)}
                onDownloadReport={() => handleDownloadReport(dataset)}
                onDelete={() => setDeleteTarget(dataset)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Dataset?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{deleteTarget?.filename}"? 
              This action cannot be undone and all associated records will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

import React from 'react';
import { AuditHistoryLog } from '../../types';
import { History, X, User, ArrowRight, Shield, Clock } from 'lucide-react';

interface HistoryAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditHistoryLog[];
  filterRecordId?: string | null;
  filterEntityName?: string;
}

export const HistoryAuditModal: React.FC<HistoryAuditModalProps> = ({
  isOpen,
  onClose,
  logs,
  filterRecordId,
  filterEntityName,
}) => {
  if (!isOpen) return null;

  const filteredLogs = filterRecordId
    ? logs.filter((l) => l.recordId === filterRecordId)
    : logs;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#141722] border border-brand/30 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/20 text-brand flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Change Audit History (পরিবর্তন লগ)</span>
              </h3>
              <p className="text-xs text-zinc-400">
                {filterRecordId 
                  ? `Showing audit trail for record #${filterRecordId} (${filterEntityName || ''})`
                  : 'Complete transparent activity log across Sales, Inventory & Bazaar'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Logs List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              কোনো পরিবর্তন ইতিহাস পাওয়া যায়নি। এটি এখনো অপরিবর্তিত আছে।
            </div>
          ) : (
            filteredLogs.map((log) => {
              const actionColor = 
                log.action === 'INSERT' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                log.action === 'UPDATE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30';

              return (
                <div 
                  key={log.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] border ${actionColor}`}>
                        {log.action}
                      </span>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        [{log.entityType.toUpperCase()}] #{log.recordId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  {/* Field change old -> new */}
                  {log.action === 'UPDATE' && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                      <span className="text-zinc-400 font-semibold">{log.changedField}:</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 line-through">
                          {String(log.oldValue)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                          {String(log.newValue)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* User & Reason */}
                  <div className="flex items-start justify-between gap-2 text-xs pt-1 border-t border-zinc-800/60">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <User className="w-3.5 h-3.5 text-brand" />
                      <span className="font-semibold text-white">{log.changedBy}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {log.userRole}
                      </span>
                    </div>

                    {log.reason && (
                      <p className="text-[11px] text-zinc-400 italic text-right max-w-xs">
                        "{log.reason}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-between items-center text-xs text-zinc-400">
          <span>Total Records: {filteredLogs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


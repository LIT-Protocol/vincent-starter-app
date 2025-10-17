import React, { useState } from 'react';
import { CircleAlert } from 'lucide-react';

import { Box } from '@/components/ui/box';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DCA } from '@/hooks/useBackend';
import { cn } from '@/lib/utils';

export interface DCADetailsDialogProps {
  dca: DCA;
  children?: React.ReactNode;
}

export const DialogueDcaFailedDetails: React.FC<DCADetailsDialogProps> = ({ dca, children }) => {
  const [open, setOpen] = useState(false);

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  const failedAfterLastRun =
    dca.failedAt && dca.lastFinishedAt
      ? new Date(dca.lastFinishedAt) <= new Date(dca.failedAt)
      : false;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="inline-flex items-center gap-0 hover:opacity-80 cursor-pointer bg-transparent border-none p-0">
            <CircleAlert className="w-4 h-4" color="#dc0909" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className={cn(failedAfterLastRun ? 'min-w-2/3' : '', 'overflow-hidden')}>
        <DialogHeader>
          <DialogTitle>DCA Schedule Details</DialogTitle>
          <DialogDescription>Detailed information about your DCA schedule.</DialogDescription>
        </DialogHeader>

        <Box className="grid gap-4 py-4 overflow-y-auto max-h-[70vh]">
          {dca.failedAt && failedAfterLastRun && (
            <>
              <Separator />

              <div className="grid grid-cols-[auto,1fr] gap-3 items-baseline">
                <span className="font-medium whitespace-nowrap">Failed At:</span>
                <span className="overflow-hidden text-ellipsis text-red-500">
                  {formatDate(dca.failedAt)}
                </span>
              </div>

              {dca.failReason && (
                <>
                  <Separator />

                  <div>
                    <span className="font-medium block mb-2">Failure Reason:</span>
                    <div
                      className="text-red-500 text-sm border border-gray-200 rounded p-3 max-h-[120px] overflow-y-auto break-words whitespace-pre-wrap"
                      style={{ wordBreak: 'break-word', maxHeight: '120px', overflowY: 'scroll' }}
                      dangerouslySetInnerHTML={{
                        __html: dca.failReason.replace(/\\n/g, '<br />'),
                      }}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

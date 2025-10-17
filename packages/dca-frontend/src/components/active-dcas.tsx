import React, { useCallback, useEffect, useState } from 'react';
import { CircleAlert, Delete, Pause, Play } from 'lucide-react';

import { useBackend, DCA } from '@/hooks/useBackend';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DialogueEditDCA } from '@/components/dialogue-edit-dca';
import { FREQUENCIES } from '@/components/select-frequency';
import { Spinner } from '@/components/ui/spinner';
import { DialogueDcaFailedDetails } from '@/components/dialogue-dca-failed-details';

import { cn } from '@/lib/utils';

function renderDCASchedulesTable(
  activeDCAs: DCA[],
  handleUpdatedDCA: (updatedDCA: DCA) => Promise<void>,
  handleDisableDCA: (dcaId: string) => Promise<void>,
  handleEnableDCA: (dcaId: string) => Promise<void>,
  handleDeleteDCA: (dcaId: string) => Promise<void>
) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Amount (USD)
          </TableHead>
          <TableHead
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Frequency
          </TableHead>
          <TableHead
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Last Update
          </TableHead>
          <TableHead
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Status
          </TableHead>
          <TableHead
            className="text-right"
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {activeDCAs.map((dca) => {
          const {
            disabled,
            lastFinishedAt,
            failedAt,
            _id: uniqueKey,
            data: { purchaseAmount, purchaseIntervalHuman, updatedAt },
          } = dca;

          const failedAfterLastRun =
            failedAt && lastFinishedAt ? new Date(lastFinishedAt) <= new Date(failedAt) : false;

          const active = !disabled;
          return (
            <TableRow key={uniqueKey}>
              <TableCell
                style={{
                  fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                  color: 'var(--footer-text-color, #121212)',
                }}
              >
                ${purchaseAmount}
              </TableCell>
              <TableCell
                style={{
                  fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                  color: 'var(--footer-text-color, #121212)',
                }}
              >
                {FREQUENCIES.find((freq) => freq.value === purchaseIntervalHuman)?.label ||
                  purchaseIntervalHuman}
              </TableCell>
              <TableCell
                style={{
                  fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                  color: 'var(--footer-text-color, #121212)',
                }}
              >
                {new Date(updatedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {failedAfterLastRun ? (
                  <DialogueDcaFailedDetails dca={dca}>
                    <button className="inline-flex items-center gap-2 hover:opacity-80 cursor-pointer bg-transparent border-none p-0">
                      <span
                        className="font-medium text-red-600"
                        style={{
                          fontFamily: 'Poppins, system-ui, sans-serif',
                        }}
                      >
                        Failed
                      </span>
                      <CircleAlert className="w-4 h-4" color="#dc0909" />
                    </button>
                  </DialogueDcaFailedDetails>
                ) : (
                  <span
                    className={cn(
                      'font-medium',
                      active && 'text-green-600',
                      !active && 'text-gray-500'
                    )}
                    style={{
                      fontFamily: 'Poppins, system-ui, sans-serif',
                    }}
                  >
                    {!active ? 'Inactive' : 'Active'}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-row items-center justify-end gap-2">
                  <DialogueEditDCA dca={dca} onUpdate={handleUpdatedDCA} />
                  {active ? (
                    <Button
                      variant="secondary-outline"
                      size="sm"
                      onClick={() => handleDisableDCA(dca._id)}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => handleEnableDCA(dca._id)}>
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteDCA(dca._id)}>
                    <Delete className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function renderSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Spinner />
    </div>
  );
}

function renderContent(
  activeDCAs: DCA[],
  isLoading: boolean,
  handleUpdatedDCA: (updatedDCA: DCA) => Promise<void>,
  handleDisableDCA: (dcaId: string) => Promise<void>,
  handleEnableDCA: (dcaId: string) => Promise<void>,
  handleDeleteDCA: (dcaId: string) => Promise<void>
) {
  console.log('activeDCAs', activeDCAs);
  if (!activeDCAs.length && isLoading) {
    return renderSpinner();
  } else if (activeDCAs.length) {
    return renderDCASchedulesTable(
      activeDCAs,
      handleUpdatedDCA,
      handleDisableDCA,
      handleEnableDCA,
      handleDeleteDCA
    );
  } else {
    return (
      <div
        className="flex justify-center"
        style={{
          fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
        }}
      >
        No active DCAs
      </div>
    );
  }
}

export const ActiveDcas: React.FC = () => {
  const [activeDCAs, setActiveDCAs] = useState<DCA[]>([]);
  const { deleteDCA, disableDCA, enableDCA, getDCAs } = useBackend();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDCAs = async () => {
      try {
        const dcas = await getDCAs();

        setActiveDCAs(dcas);
      } catch (error) {
        console.error('Error fetching active DCAs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDCAs();
  }, [getDCAs]);

  const handleDisableDCA = useCallback(
    async (dcaId: string) => {
      try {
        await disableDCA(dcaId);

        const updatedDCAs = [...activeDCAs];
        const index = updatedDCAs.findIndex((dca) => dca._id === dcaId);
        updatedDCAs[index].disabled = true;
        setActiveDCAs(updatedDCAs);
      } catch (error) {
        console.error('Error disabling DCA:', error);
      }
    },
    [activeDCAs, disableDCA, setActiveDCAs]
  );

  const handleEnableDCA = useCallback(
    async (dcaId: string) => {
      try {
        await enableDCA(dcaId);

        const updatedDCAs = [...activeDCAs];
        const index = updatedDCAs.findIndex((dca) => dca._id === dcaId);
        updatedDCAs[index].disabled = false;
        setActiveDCAs(updatedDCAs);
      } catch (error) {
        console.error('Error disabling DCA:', error);
      }
    },
    [activeDCAs, enableDCA, setActiveDCAs]
  );

  const handleUpdatedDCA = useCallback(
    async (updatedDCA: DCA) => {
      try {
        const updatedDCAs = [...activeDCAs];
        const index = updatedDCAs.findIndex((dca) => dca._id === updatedDCA._id);
        updatedDCAs[index] = updatedDCA;
        setActiveDCAs(updatedDCAs);
      } catch (error) {
        console.error('Error disabling DCA:', error);
      }
    },
    [activeDCAs, setActiveDCAs]
  );

  const handleDeleteDCA = useCallback(
    async (dcaId: string) => {
      try {
        await deleteDCA(dcaId);

        const updatedDCAs = [...activeDCAs.filter((dca) => dca._id !== dcaId)];
        setActiveDCAs(updatedDCAs);
      } catch (error) {
        console.error('Error disabling DCA:', error);
      }
    },
    [activeDCAs, deleteDCA, setActiveDCAs]
  );

  return (
    <div data-test-id="active-dcas" className="w-full">
      {renderContent(
        activeDCAs,
        isLoading,
        handleUpdatedDCA,
        handleDisableDCA,
        handleEnableDCA,
        handleDeleteDCA
      )}
    </div>
  );
};

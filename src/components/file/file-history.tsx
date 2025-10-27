'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface FileHistoryProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Checkpoint {
  id: string;
  content: any;
  createdAt: string;
}

export function FileHistory({ fileId, isOpen, onClose }: FileHistoryProps) {
  const queryClient = useQueryClient();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);

  const { data: checkpoints, isLoading } = useQuery({
    queryKey: ['checkpoints', fileId],
    queryFn: () => fetch(`/api/files/${fileId}/checkpoints`).then((r) => r.json()),
    enabled: isOpen,
  });

  const restoreCheckpoint = useMutation({
    mutationFn: async (checkpointId: string) => {
      const response = await fetch(`/api/files/${fileId}/checkpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpointId }),
      });
      if (!response.ok) throw new Error('Failed to restore checkpoint');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      queryClient.invalidateQueries({ queryKey: ['checkpoints', fileId] });
      onClose();
    },
  });

  const handleRestore = (checkpoint: Checkpoint) => {
    if (confirm('Are you sure you want to restore this version? Your current work will be saved as a checkpoint.')) {
      restoreCheckpoint.mutate(checkpoint.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Version History</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and restore previous versions of your drawing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Checkpoint List */}
          <div className="w-80 border-r border-gray-200 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : checkpoints && checkpoints.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {checkpoints.map((checkpoint: Checkpoint) => (
                  <button
                    key={checkpoint.id}
                    onClick={() => setSelectedCheckpoint(checkpoint)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      selectedCheckpoint?.id === checkpoint.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(checkpoint.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(checkpoint.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {checkpoint.content?.elements?.length || 0} elements
                        </p>
                      </div>
                      {selectedCheckpoint?.id === checkpoint.id && (
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-gray-600">No version history yet</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            {selectedCheckpoint ? (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedCheckpoint.createdAt).toLocaleString('en-US', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Elements</p>
                      <p className="text-sm text-gray-900">
                        {selectedCheckpoint.content?.elements?.length || 0} drawing elements
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Background</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{
                            backgroundColor:
                              selectedCheckpoint.content?.appState?.viewBackgroundColor || '#ffffff',
                          }}
                        />
                        <p className="text-sm text-gray-900">
                          {selectedCheckpoint.content?.appState?.viewBackgroundColor || '#ffffff'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(selectedCheckpoint)}
                  disabled={restoreCheckpoint.isPending}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {restoreCheckpoint.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Restore This Version
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Your current work will be saved before restoring
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  <p className="text-gray-500">Select a version to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

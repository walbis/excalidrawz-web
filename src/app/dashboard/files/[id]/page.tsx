'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ExcalidrawWrapper } from '@/components/excalidraw/excalidraw-wrapper';
import { FileHistory } from '@/components/file/file-history';
import { ExportDialog, ExportOptions } from '@/components/file/export-dialog';
import { exportFile } from '@/lib/export';
import Link from 'next/link';

interface FileEditorPageProps {
  params: {
    id: string;
  };
}

export default function FileEditorPage({ params }: FileEditorPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Fetch file data
  const { data: file, isLoading, error } = useQuery({
    queryKey: ['file', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/files/${params.id}`);
      if (!response.ok) throw new Error('Failed to load file');
      return response.json();
    },
  });

  // Update file mutation
  const updateFile = useMutation({
    mutationFn: async (content: any) => {
      const response = await fetch(`/api/files/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to save file');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', params.id] });
    },
  });

  // Rename file mutation
  const renameFile = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/files/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to rename file');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', params.id] });
      setIsRenaming(false);
      setNewName('');
    },
  });

  // Delete file mutation
  const deleteFile = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/files/${params.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete file');
      return response.json();
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const handleSave = async (excalidrawData: any) => {
    await updateFile.mutateAsync(excalidrawData);
  };

  const handleRename = () => {
    if (newName.trim()) {
      renameFile.mutate(newName);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this file? It will be moved to trash.')) {
      deleteFile.mutate();
    }
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'json', options: ExportOptions) => {
    if (!file) return;
    try {
      await exportFile(file.name, file.content, format, options);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export file. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drawing...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">File Not Found</h2>
          <p className="text-gray-600 mb-6">
            The file you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white z-10">
        {/* Left: File Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {isRenaming ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0"
                autoFocus
              />
              <button
                onClick={handleRename}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsRenaming(true);
                setNewName(file.name);
              }}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-lg transition min-w-0"
            >
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium text-gray-900 truncate">{file.name}</span>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Export Button */}
          <button
            onClick={() => setShowExport(true)}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
            title="Export"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>

          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
            title="View History"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            History
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1 overflow-hidden">
        <ExcalidrawWrapper initialData={file.content} onSave={handleSave} />
      </div>

      {/* File History Modal */}
      <FileHistory fileId={params.id} isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* Export Dialog */}
      <ExportDialog isOpen={showExport} onClose={() => setShowExport(false)} onExport={handleExport} />
    </div>
  );
}

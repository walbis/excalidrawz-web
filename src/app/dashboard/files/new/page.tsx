'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function NewFilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const workspaceId = searchParams.get('workspaceId');

  const [fileName, setFileName] = useState('Untitled Drawing');
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetch('/api/workspaces').then((r) => r.json()),
  });

  const { data: groups } = useQuery({
    queryKey: ['groups', workspaceId],
    queryFn: () => fetch(`/api/groups?workspaceId=${workspaceId}`).then((r) => r.json()),
    enabled: !!workspaceId,
  });

  const createFile = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fileName,
          groupId: selectedGroupId,
          content: {
            type: 'excalidraw',
            version: 2,
            source: 'https://excalidrawz.app',
            elements: [],
            appState: {
              gridSize: null,
              viewBackgroundColor: '#ffffff',
            },
            files: {},
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create file');
      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/dashboard/files/${data.id}`);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert('Please select a folder');
      return;
    }
    createFile.mutate();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Drawing</h1>
          <p className="text-gray-600">Give your drawing a name and choose where to save it</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-2">
              File Name
            </label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter file name"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-2">
              Folder
            </label>
            <select
              id="folder"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a folder</option>
              {groups?.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!fileName.trim() || !selectedGroupId || createFile.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createFile.isPending ? 'Creating...' : 'Create Drawing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FileTree } from './file-tree';
import Link from 'next/link';

export function Sidebar() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const queryClient = useQueryClient();

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetch('/api/workspaces').then((r) => r.json()),
  });

  const { data: groups } = useQuery({
    queryKey: ['groups', selectedWorkspaceId],
    queryFn: () =>
      fetch(`/api/groups?workspaceId=${selectedWorkspaceId}`).then((r) => r.json()),
    enabled: !!selectedWorkspaceId,
  });

  const createGroup = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, workspaceId: selectedWorkspaceId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', selectedWorkspaceId] });
      setIsCreatingGroup(false);
      setNewGroupName('');
    },
  });

  // Auto-select first workspace
  if (workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
    setSelectedWorkspaceId(workspaces[0].id);
  }

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroup.mutate(newGroupName);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* New File Button */}
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/dashboard/files/new"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Drawing
        </Link>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-4">
        {/* Groups Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Folders
          </h3>
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="New folder"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* New Group Form */}
        {isCreatingGroup && (
          <form onSubmit={handleCreateGroup} className="mb-3 p-2 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newGroupName.trim()}
                className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingGroup(false);
                  setNewGroupName('');
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* File Tree */}
        {groups && <FileTree groups={groups} workspaceId={selectedWorkspaceId!} />}

        {!groups && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No folders yet</p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="border-t border-gray-200 p-4 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Settings
        </Link>
        <Link
          href="/dashboard/trash"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Trash
        </Link>
      </div>
    </div>
  );
}

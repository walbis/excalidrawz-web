'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  members: any[];
}

export function WorkspaceSelector({ workspaces }: { workspaces: Workspace[] }) {
  const [selectedId, setSelectedId] = useState(workspaces[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  const createWorkspace = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSelectedId(data.id);
      setIsCreating(false);
      setNewWorkspaceName('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspace.mutate(newWorkspaceName);
    }
  };

  const selectedWorkspace = workspaces.find((w) => w.id === selectedId);

  return (
    <div>
      {/* Workspace Dropdown */}
      <div className="relative">
        <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {selectedWorkspace?.name[0] || 'W'}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm text-gray-900 truncate">
                {selectedWorkspace?.name || 'Select Workspace'}
              </p>
              <p className="text-xs text-gray-500">
                {selectedWorkspace?.members?.length || 0} members
              </p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* New Workspace Form */}
      {isCreating ? (
        <form onSubmit={handleCreate} className="mt-2 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Workspace name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!newWorkspaceName.trim()}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewWorkspaceName('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full mt-2 flex items-center gap-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Workspace
        </button>
      )}
    </div>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function WorkspaceSettingsPage() {
  const queryClient = useQueryClient();

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetch('/api/workspaces').then((r) => r.json()),
  });

  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState('');

  const updateWorkspace = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      const response = await fetch(`/api/workspaces/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name }),
      });
      if (!response.ok) throw new Error('Failed to update workspace');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      alert('Workspace updated successfully');
    },
  });

  const deleteWorkspace = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workspace');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSelectedWorkspace(null);
      alert('Workspace deleted successfully');
    },
  });

  const handleWorkspaceSelect = (workspace: any) => {
    setSelectedWorkspace(workspace);
    setWorkspaceName(workspace.name);
  };

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || !workspaceName.trim()) return;
    updateWorkspace.mutate({ id: selectedWorkspace.id, name: workspaceName });
  };

  const handleDeleteWorkspace = () => {
    if (!selectedWorkspace) return;
    if (
      confirm(
        `Are you sure you want to delete "${selectedWorkspace.name}"? This will delete all files and folders in this workspace.`
      )
    ) {
      deleteWorkspace.mutate(selectedWorkspace.id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Workspace List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Your Workspaces</h3>
          <div className="space-y-2">
            {workspaces?.map((workspace: any) => (
              <button
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedWorkspace?.id === workspace.id
                    ? 'bg-blue-50 border-2 border-blue-600'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-gray-900">{workspace.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {workspace.members?.length || 0} members
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace Details */}
      <div className="lg:col-span-2">
        {selectedWorkspace ? (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Workspace Settings</h2>
              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                <div>
                  <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-2">
                    Workspace Name
                  </label>
                  <input
                    id="workspaceName"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter workspace name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workspace URL</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">excalidrawz.app/w/</span>
                    <input
                      type="text"
                      value={selectedWorkspace.slug}
                      disabled
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Workspace URL cannot be changed</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updateWorkspace.isPending || !workspaceName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                  >
                    {updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Workspace Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Workspace Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedWorkspace.members?.length || 0}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Files</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedWorkspace._count?.files || 0}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Folders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedWorkspace._count?.groups || 0}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(selectedWorkspace.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h2 className="text-xl font-bold text-red-900 mb-6">Danger Zone</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Delete Workspace</p>
                  <p className="text-sm text-gray-600">
                    Permanently delete this workspace and all its content
                  </p>
                </div>
                <button
                  onClick={handleDeleteWorkspace}
                  disabled={deleteWorkspace.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  {deleteWorkspace.isPending ? 'Deleting...' : 'Delete Workspace'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Workspace Selected</h3>
            <p className="text-gray-600">Select a workspace from the list to view and edit its settings</p>
          </div>
        )}
      </div>
    </div>
  );
}

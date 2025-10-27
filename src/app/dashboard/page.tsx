'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetch('/api/workspaces').then((r) => r.json()),
  });

  const { data: files } = useQuery({
    queryKey: ['files', selectedWorkspaceId],
    queryFn: () =>
      fetch(`/api/files?workspaceId=${selectedWorkspaceId}`).then((r) => r.json()),
    enabled: !!selectedWorkspaceId,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups', selectedWorkspaceId],
    queryFn: () =>
      fetch(`/api/groups?workspaceId=${selectedWorkspaceId}`).then((r) => r.json()),
    enabled: !!selectedWorkspaceId,
  });

  const importFile = useMutation({
    mutationFn: async ({ name, content, groupId }: { name: string; content: any; groupId: string }) => {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, groupId }),
      });
      if (!response.ok) throw new Error('Failed to import file');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files', selectedWorkspaceId] });
      router.push(`/dashboard/files/${data.id}`);
    },
  });

  // Auto-select first workspace
  if (workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
    setSelectedWorkspaceId(workspaces[0].id);
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.excalidraw') && !file.type.includes('json')) {
      alert('Please select a valid .excalidraw file');
      return;
    }

    // Get the first group to import into
    const defaultGroup = groups?.[0];
    if (!defaultGroup) {
      alert('No folder available. Please create a folder first.');
      return;
    }

    try {
      const text = await file.text();
      const content = JSON.parse(text);

      // Validate it's an Excalidraw file
      if (!content.type || content.type !== 'excalidraw') {
        alert('Invalid .excalidraw file format');
        return;
      }

      // Extract filename without extension
      const fileName = file.name.replace(/\.excalidraw$/, '');

      // Import the file
      importFile.mutate({
        name: fileName,
        content,
        groupId: defaultGroup.id,
      });
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import file. Please ensure it is a valid .excalidraw file.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const recentFiles = files?.slice(0, 6) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Continue where you left off or create something new.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/files/new"
          className="p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition group"
        >
          <svg
            className="w-8 h-8 mb-2 group-hover:scale-110 transition"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h3 className="font-semibold text-lg mb-1">New Drawing</h3>
          <p className="text-blue-100 text-sm">Start with a blank canvas</p>
        </Link>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition text-left group"
        >
          <svg
            className="w-8 h-8 mb-2 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <h3 className="font-semibold text-lg mb-1 text-gray-900">Import File</h3>
          <p className="text-gray-600 text-sm">Upload .excalidraw files</p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".excalidraw,application/json"
          onChange={handleFileImport}
          className="hidden"
        />

        <button className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition text-left group">
          <svg
            className="w-8 h-8 mb-2 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="font-semibold text-lg mb-1 text-gray-900">Invite Team</h3>
          <p className="text-gray-600 text-sm">Collaborate with others</p>
        </button>
      </div>

      {/* Recent Files */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Files</h2>
          <Link href="/dashboard/files" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {recentFiles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No files yet</h3>
            <p className="text-gray-600 mb-4">Create your first drawing to get started</p>
            <Link
              href="/dashboard/files/new"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Drawing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFiles.map((file: any) => (
              <Link
                key={file.id}
                href={`/dashboard/files/${file.id}`}
                className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition group"
              >
                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1 truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Updated {new Date(file.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Files</span>
            <svg
              className="w-5 h-5 text-blue-600"
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
          <p className="text-3xl font-bold text-gray-900">{files?.length || 0}</p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Workspaces</span>
            <svg
              className="w-5 h-5 text-green-600"
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
          </div>
          <p className="text-3xl font-bold text-gray-900">{workspaces?.length || 0}</p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Team Members</span>
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {workspaces?.[0]?.members?.length || 1}
          </p>
        </div>
      </div>
    </div>
  );
}

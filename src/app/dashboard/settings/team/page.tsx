'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetch('/api/workspaces').then((r) => r.json()),
  });

  const { data: members } = useQuery({
    queryKey: ['members', selectedWorkspaceId],
    queryFn: () =>
      fetch(`/api/workspaces/${selectedWorkspaceId}/members`).then((r) => r.json()),
    enabled: !!selectedWorkspaceId,
  });

  // Auto-select first workspace
  if (workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
    setSelectedWorkspaceId(workspaces[0].id);
  }

  const inviteMember = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await fetch(`/api/workspaces/${selectedWorkspaceId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send invitation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', selectedWorkspaceId] });
      setIsInviting(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
      alert('Invitation sent successfully');
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const response = await fetch(`/api/workspaces/${selectedWorkspaceId}/members/${data.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: data.role }),
      });
      if (!response.ok) throw new Error('Failed to update member role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', selectedWorkspaceId] });
      alert('Member role updated successfully');
    },
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/workspaces/${selectedWorkspaceId}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', selectedWorkspaceId] });
      alert('Member removed successfully');
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMember.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to remove ${userName} from this workspace?`)) {
      removeMember.mutate(userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label htmlFor="workspace" className="block text-sm font-medium text-gray-700 mb-2">
          Select Workspace
        </label>
        <select
          id="workspace"
          value={selectedWorkspaceId || ''}
          onChange={(e) => setSelectedWorkspaceId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {workspaces?.map((workspace: any) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>

      {/* Invite New Member */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          <button
            onClick={() => setIsInviting(!isInviting)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Invite Member
          </button>
        </div>

        {isInviting && (
          <form onSubmit={handleInvite} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'ADMIN')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={inviteMember.isPending || !inviteEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsInviting(false);
                  setInviteEmail('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Members List */}
        <div className="divide-y divide-gray-200">
          {members?.map((member: any) => (
            <div key={member.userId} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={member.user.image || `https://ui-avatars.com/api/?name=${member.user.name}`}
                  alt={member.user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{member.user.name}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={member.role}
                  onChange={(e) =>
                    updateMemberRole.mutate({ userId: member.userId, role: e.target.value })
                  }
                  disabled={member.role === 'OWNER'}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="OWNER" disabled>
                    Owner
                  </option>
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                {member.role !== 'OWNER' && (
                  <button
                    onClick={() => handleRemoveMember(member.userId, member.user.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove member"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {(!members || members.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>No team members yet. Invite your first member to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Role Permissions</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">Owner</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Full access</li>
                <li>• Manage billing</li>
                <li>• Delete workspace</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">Admin</p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Manage members</li>
                <li>• Create/edit files</li>
                <li>• Manage folders</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-semibold text-green-900 mb-2">Member</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Create files</li>
                <li>• Edit own files</li>
                <li>• View all files</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Viewer</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• View files</li>
                <li>• Export files</li>
                <li>• Read-only access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  parentId: string | null;
  children?: Group[];
  _count: {
    files: number;
    children: number;
  };
}

interface FileTreeProps {
  groups: Group[];
  workspaceId: string;
}

export function FileTree({ groups, workspaceId }: FileTreeProps) {
  // Build tree structure
  const groupMap = new Map<string, Group & { children: Group[] }>();
  groups.forEach((group) => {
    groupMap.set(group.id, { ...group, children: [] });
  });

  const rootGroups: Group[] = [];
  groups.forEach((group) => {
    if (!group.parentId) {
      rootGroups.push(groupMap.get(group.id)!);
    } else {
      const parent = groupMap.get(group.parentId);
      if (parent) {
        parent.children.push(groupMap.get(group.id)!);
      }
    }
  });

  return (
    <div className="space-y-1">
      {rootGroups.map((group) => (
        <GroupNode key={group.id} group={group} workspaceId={workspaceId} level={0} />
      ))}
    </div>
  );
}

function GroupNode({
  group,
  workspaceId,
  level,
}: {
  group: Group;
  workspaceId: string;
  level: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFiles, setShowFiles] = useState(false);

  const { data: files } = useQuery({
    queryKey: ['files', workspaceId, group.id],
    queryFn: () =>
      fetch(`/api/files?workspaceId=${workspaceId}&groupId=${group.id}`).then((r) => r.json()),
    enabled: showFiles,
  });

  const hasChildren = (group.children && group.children.length > 0) || group._count.files > 0;

  return (
    <div style={{ paddingLeft: `${level * 12}px` }}>
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!showFiles) setShowFiles(true);
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition group"
      >
        {hasChildren && (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
        {!hasChildren && <div className="w-4" />}
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <span className="flex-1 text-left truncate font-medium">{group.name}</span>
        <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100">
          {group._count.files}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-1 space-y-1">
          {/* Child Groups */}
          {group.children?.map((child) => (
            <GroupNode key={child.id} group={child} workspaceId={workspaceId} level={level + 1} />
          ))}

          {/* Files */}
          {files?.map((file: any) => (
            <Link
              key={file.id}
              href={`/dashboard/files/${file.id}`}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition group"
              style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="flex-1 truncate">{file.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

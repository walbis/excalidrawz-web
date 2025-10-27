'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types';

// Dynamic import to avoid SSR issues
const Excalidraw = React.lazy(() =>
  import('@excalidraw/excalidraw').then((module) => ({
    default: module.Excalidraw,
  }))
);

export interface ExcalidrawData {
  elements: ExcalidrawElement[];
  appState?: Partial<AppState>;
  files?: BinaryFiles;
}

interface ExcalidrawWrapperProps {
  fileId?: string;
  initialData?: ExcalidrawData;
  onSave?: (data: ExcalidrawData) => Promise<void>;
  readOnly?: boolean;
}

export function ExcalidrawWrapper({
  fileId,
  initialData,
  onSave,
  readOnly = false,
}: ExcalidrawWrapperProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save handler (debounced)
  const handleChange = useCallback(
    async (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      if (!onSave || readOnly) return;

      // Debounce auto-save
      const timeoutId = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onSave({
            elements: [...elements],
            appState,
            files,
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error('Failed to save:', error);
        } finally {
          setIsSaving(false);
        }
      }, 2000); // Save 2 seconds after last change

      return () => clearTimeout(timeoutId);
    },
    [onSave, readOnly]
  );

  // Load initial data when fileId changes
  useEffect(() => {
    if (excalidrawAPI && initialData) {
      excalidrawAPI.updateScene({
        elements: initialData.elements,
        appState: initialData.appState,
      });
      if (initialData.files) {
        excalidrawAPI.addFiles(Object.values(initialData.files));
      }
    }
  }, [excalidrawAPI, fileId, initialData]);

  return (
    <div className="h-full w-full relative">
      {/* Loading fallback */}
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Excalidraw...</p>
            </div>
          </div>
        }
      >
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData}
          onChange={handleChange}
          viewModeEnabled={readOnly}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              export: {
                saveFileToDisk: true,
              },
              changeViewBackgroundColor: true,
            },
          }}
        />
      </React.Suspense>

      {/* Save indicator */}
      {!readOnly && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {isSaving ? (
            <span className="text-blue-600">Saving...</span>
          ) : lastSaved ? (
            <span className="text-green-600">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

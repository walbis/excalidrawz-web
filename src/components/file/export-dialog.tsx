'use client';

import { useState } from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'svg' | 'pdf' | 'json', options: ExportOptions) => void;
}

export interface ExportOptions {
  background: boolean;
  darkMode: boolean;
  scale: number;
}

export function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [format, setFormat] = useState<'png' | 'svg' | 'pdf' | 'json'>('png');
  const [background, setBackground] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [scale, setScale] = useState(2);

  const handleExport = () => {
    onExport(format, { background, darkMode, scale });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Export Drawing</h2>
              <p className="text-sm text-gray-600 mt-1">Choose format and options</p>
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`p-4 border-2 rounded-lg transition text-left ${
                  format === 'png'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    format === 'png' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-6 h-6 ${format === 'png' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">PNG</p>
                    <p className="text-xs text-gray-500">Image</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFormat('svg')}
                className={`p-4 border-2 rounded-lg transition text-left ${
                  format === 'svg'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    format === 'svg' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-6 h-6 ${format === 'svg' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">SVG</p>
                    <p className="text-xs text-gray-500">Vector</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 border-2 rounded-lg transition text-left ${
                  format === 'pdf'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    format === 'pdf' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-6 h-6 ${format === 'pdf' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">PDF</p>
                    <p className="text-xs text-gray-500">Document</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`p-4 border-2 rounded-lg transition text-left ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    format === 'json' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-6 h-6 ${format === 'json' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">JSON</p>
                    <p className="text-xs text-gray-500">Data</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Options (not shown for JSON) */}
          {format !== 'json' && (
            <>
              {/* Background */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="background" className="text-sm font-medium text-gray-700">
                    Include Background
                  </label>
                  <p className="text-xs text-gray-500">Export with canvas background color</p>
                </div>
                <button
                  onClick={() => setBackground(!background)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    background ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      background ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="darkMode" className="text-sm font-medium text-gray-700">
                    Dark Mode
                  </label>
                  <p className="text-xs text-gray-500">Export with dark theme</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Scale (PNG only) */}
              {format === 'png' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Scale: {scale}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={scale}
                    onChange={(e) => setScale(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1x</span>
                    <span>2x</span>
                    <span>3x</span>
                    <span>4x</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

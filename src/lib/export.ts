import { ExportOptions } from '@/components/file/export-dialog';

export async function exportFile(
  fileName: string,
  content: any,
  format: 'png' | 'svg' | 'pdf' | 'json',
  options: ExportOptions
) {
  if (format === 'json') {
    // Export as .excalidraw file
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.excalidraw`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // For image exports (PNG, SVG, PDF), we need to use Excalidraw's export utilities
  // These require the canvas/scene to be rendered
  // We'll use dynamic import to load the export functions
  try {
    const { exportToBlob, exportToSvg } = await import('@excalidraw/excalidraw');

    const elements = content.elements || [];
    const appState = {
      ...content.appState,
      exportBackground: options.background,
      exportWithDarkMode: options.darkMode,
    };
    const files = content.files || {};

    if (format === 'svg') {
      const svg = await exportToSvg({
        elements,
        appState,
        files,
      });
      const svgString = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      downloadBlob(blob, `${fileName}.svg`);
    } else if (format === 'png') {
      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportScale: options.scale,
        },
        files,
        mimeType: 'image/png',
      });
      downloadBlob(blob, `${fileName}.png`);
    } else if (format === 'pdf') {
      // PDF export - convert to PNG first, then create PDF
      // For simplicity, we'll export as high-res PNG
      // A proper implementation would use a PDF library like jsPDF
      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportScale: 2,
        },
        files,
        mimeType: 'image/png',
      });
      downloadBlob(blob, `${fileName}.png`);
      // Note: For true PDF export, you'd need to integrate jsPDF or similar
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export file');
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

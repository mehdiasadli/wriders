'use client';

import { useState } from 'react';

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  slug: string;
}

interface Book {
  title: string;
  author: string;
}

interface ChapterDownloadOptionsProps {
  chapter: Chapter;
  book: Book;
}

export function ChapterDownloadOptions({ chapter, book }: ChapterDownloadOptionsProps) {
  const [isDownloading, setIsDownloading] = useState<'text' | 'pdf' | null>(null);

  const downloadAsText = async () => {
    setIsDownloading('text');

    try {
      // Create plain text content
      const textContent = createPlainTextContent();

      // Create and download file
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading text file:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadAsPdf = async () => {
    setIsDownloading('pdf');

    try {
      // Call the API route to generate PDF
      const response = await fetch(`/api/chapters/${chapter.slug}/download/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob from the response
      const pdfBlob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  const createPlainTextContent = (): string => {
    // Convert HTML content to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = chapter.content;

    // Get text content and format it
    let textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up the text
    textContent = textContent
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();

    // Create the final text content
    return `${chapter.title}\n\n${textContent}`;
  };

  const createPdfContent = (): string => {
    // Convert HTML content to plain text for PDF
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = chapter.content;

    // Get text content
    let textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up the text
    textContent = textContent
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    return textContent;
  };

  return (
    <div className='space-y-8'>
      {/* Download Options */}
      <div className='space-y-4'>
        {/* Text Download */}
        <div className='border border-gray-200 p-6 hover:bg-gray-50 transition-colors'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-lg font-serif text-gray-900 mb-1'>Plain Text</h3>
              <p className='text-sm text-gray-600'>Simple text file, compatible with any editor</p>
            </div>
          </div>

          <button
            onClick={downloadAsText}
            disabled={isDownloading !== null}
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
          >
            {isDownloading === 'text' ? 'Downloading...' : 'Download as Text'}
          </button>
        </div>

        {/* PDF Download */}
        <div className='border border-gray-200 p-6 hover:bg-gray-50 transition-colors'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-lg font-serif text-gray-900 mb-1'>PDF Document</h3>
              <p className='text-sm text-gray-600'>Formatted document, preserves styling and layout</p>
            </div>
          </div>

          <button
            onClick={downloadAsPdf}
            disabled={isDownloading !== null}
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
          >
            {isDownloading === 'pdf' ? 'Generating PDF...' : 'Download as PDF'}
          </button>
        </div>
      </div>

      {/* File Information */}
      <div className='pt-6 border-t border-gray-200 text-center'>
        <div className='text-sm text-gray-500 space-y-1'>
          <div>
            Chapter {chapter.order} of {book.title}
          </div>
          <div>by {book.author}</div>
        </div>
      </div>
    </div>
  );
}

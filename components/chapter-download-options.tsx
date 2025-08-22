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
  const [isDownloading, setIsDownloading] = useState<'text' | 'pdf' | 'html' | null>(null);

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

  const downloadAsHtml = async () => {
    setIsDownloading('html');

    try {
      // Create plain text content
      const htmlContent = createHtmlContent();

      // Create and download file
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading html file:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  const createHtmlContent = (): string => {
    // chapter.content is already html
    // we just need to add title and author info
    // also add padding

    // Wrap in a full HTML document to avoid rendering issues in browsers/editors
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(chapter.title)} - ${escapeHtml(book.title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman:ital,wght@0,400;0,700;1,400&display=swap');
    
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
      color: #000;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .title {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 10px;
      color: #000;
    }
    
    .description {
      font-size: 12pt;
      color: #666;
      margin-bottom: 20px;
    }
    
    .separator {
      border-top: 1px solid #ccc;
      margin: 20px 0;
    }
    
    .content {
      text-align: justify;
      font-size: 12pt;
      line-height: 1.6;
      margin: auto;
      width: min(100%, 45rem);
    }
    
    .content h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 20px 0 10px 0;
      color: #000;
    }
    
    .content h2 {
      font-size: 16pt;
      font-weight: bold;
      margin: 18px 0 9px 0;
      color: #000;
    }
    
    .content h3 {
      font-size: 14pt;
      font-weight: bold;
      margin: 16px 0 8px 0;
      color: #000;
    }
    
    .content h4, .content h5, .content h6 {
      font-size: 12pt;
      font-weight: bold;
      margin: 14px 0 7px 0;
      color: #000;
    }
    
    .content p {
      margin: 0 0 12px 0;
      text-align: justify;
    }
    
    .content ul, .content ol {
      margin: 12px 0;
      padding-left: 20px;
    }
    
    .content li {
      margin: 4px 0;
    }
    
    .content blockquote {
      margin: 12px 0;
      padding: 10px 20px;
      border-left: 3px solid #ccc;
      background-color: #f9f9f9;
      font-style: italic;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .header {
        margin-bottom: 30px;
      }
      
      .content {
        font-size: 11pt;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${escapeHtml(chapter.title)}</div>
    <div class="description"># ${chapter.order} • ${escapeHtml(book.title)} • ${escapeHtml(book.author)}</div>
  </div>
  <div class="separator"></div>
  <div class="content">
    ${chapter.content}
  </div>
</body>
</html>
    `;
  };

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

        {/* HTML Download */}
        <div className='border border-gray-200 p-6 hover:bg-gray-50 transition-colors'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-lg font-serif text-gray-900 mb-1'>HTML Document</h3>
              <p className='text-sm text-gray-600'>HTML file, compatible with any editor</p>
            </div>
          </div>

          <button
            onClick={downloadAsHtml}
            disabled={isDownloading !== null}
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
          >
            {isDownloading === 'html' ? 'Downloading...' : 'Download as HTML'}
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

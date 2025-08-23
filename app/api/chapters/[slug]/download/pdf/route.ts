import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Fetch chapter with book and author information
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      include: {
        book: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if user is author or chapter is published
    if (chapter.book.authorId !== session.user.id && chapter.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Create HTML content with proper styling
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${chapter.title}</title>
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
            <div class="description"># ${chapter.order} • ${escapeHtml(chapter.book.title)} • ${escapeHtml(chapter.book.author.name)}</div>
          </div>
          
          <div class="separator"></div>
          
          <div class="content">
            ${chapter.content}
          </div>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF with proper settings
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        printBackground: true,
        preferCSSPageSize: true,
      });

      // Create a proper ArrayBuffer from the Uint8Array
      const buffer = new ArrayBuffer(pdf.length);
      const view = new Uint8Array(buffer);
      view.set(pdf);

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${chapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

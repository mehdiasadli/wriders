import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Wriders';
    const author = searchParams.get('author') || '';
    const bookTitle = searchParams.get('book') || '';
    const chapterNumber = searchParams.get('chapter') || '';
    const type = searchParams.get('type') || 'default'; // 'chapter', 'book', 'default'

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            fontFamily: 'system-ui',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '2px',
              }}
            >
              WRIDERS
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            {type === 'chapter' && chapterNumber && (
              <div
                style={{
                  fontSize: '24px',
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '20px',
                }}
              >
                Chapter {chapterNumber}
              </div>
            )}

            <div
              style={{
                fontSize: type === 'chapter' ? '48px' : '56px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2,
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              {title}
            </div>

            {bookTitle && type === 'chapter' && (
              <div
                style={{
                  fontSize: '36px',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '20px',
                }}
              >
                {bookTitle}
              </div>
            )}

            {author && (
              <div
                style={{
                  fontSize: '28px',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                by {author}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Read on Wriders
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.log(`Error generating OG image: ${e}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

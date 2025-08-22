export function emailVerificationTemplate(verificationUrl: string, expiresAt: Date, name: string): string {
  const expiresAtFormatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(expiresAt);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email • wriders</title>
    <style>
        /* Email-safe CSS reset and base styles */
        body, table, td, th, p, div, span, a {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            width: 100% !important;
            min-width: 100%;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            text-align: center;
            padding: 48px 24px 32px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .logo-icon {
            width: 32px;
            height: 32px;
            border: 1px solid #374151;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 12px;
            font-weight: 500;
            color: #374151;
        }
        
        .logo-text {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 24px;
            color: #374151;
            font-weight: normal;
        }
        
        .content {
            padding: 48px 24px;
        }
        
        .title {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 32px;
            color: #111827;
            text-align: center;
            margin-bottom: 32px;
            line-height: 1.2;
        }
        
        .greeting {
            font-size: 16px;
            color: #374151;
            margin-bottom: 24px;
        }
        
        .message {
            font-size: 16px;
            color: #374151;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        .cta-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            padding: 16px 32px;
            font-size: 16px;
            font-weight: 500;
            color: #ffffff;
            background-color: #111827;
            text-decoration: none;
            border: 2px solid #111827;
            transition: all 0.2s ease;
            text-align: center;
        }
        
        .cta-button:hover {
            background-color: #374151;
            border-color: #374151;
        }
        
        .alternative-link {
            margin-top: 24px;
            padding: 20px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
        }
        
        .alternative-link p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .alternative-link a {
            color: #374151;
            text-decoration: none;
            border-bottom: 1px dotted #9ca3af;
            word-break: break-all;
        }
        
        .footer {
            padding: 32px 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .expiry-info {
            font-size: 12px;
            color: #9ca3af;
            font-style: italic;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            
            .header, .content, .footer {
                padding-left: 16px !important;
                padding-right: 16px !important;
            }
            
            .title {
                font-size: 24px !important;
            }
            
            .cta-button {
                padding: 14px 24px !important;
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="logo">
                <div class="logo-icon">w.</div>
                <div class="logo-text">wriders</div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="title">Verify Your Email</h1>
            
            <p class="greeting">Hello ${name},</p>
            
            <div class="message">
                <p>Welcome to wriders! We're excited to have you join our community of writers and readers.</p>
                <p>To complete your registration and start exploring our platform, please verify your email address by clicking the button below:</p>
            </div>
            
            <!-- Call to Action Button -->
            <div class="cta-container">
                <a href="${verificationUrl}" class="cta-button">Verify Email Address</a>
            </div>
            
            <!-- Alternative Link for Email Clients -->
            <div class="alternative-link">
                <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">This verification link will expire on ${expiresAtFormatted}.</p>
            <p class="footer-text">If you didn't create an account with wriders, you can safely ignore this email.</p>
            <p class="expiry-info">This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

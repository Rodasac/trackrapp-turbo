export const EMAIL_BRAND = {
  primary: "#10b981",
  foreground: "#f0fdf4",
  heroBg: "#0f172a",
  appName: "TrackrApp",
  appUrl: "https://trackrapp.xyz",
  fontStack: "Georgia, 'Times New Roman', serif",
  bodyFontStack:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

export interface EmailLayoutOptions {
  content: string;
  previewText?: string;
  appUrl?: string;
}

export function emailLayout({
  content,
  previewText,
  appUrl = EMAIL_BRAND.appUrl,
}: EmailLayoutOptions): string {
  const previewSpan = previewText
    ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;opacity:0;">${previewText}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${EMAIL_BRAND.appName}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:${EMAIL_BRAND.bodyFontStack};">
  ${previewSpan}
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${EMAIL_BRAND.heroBg};padding:24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;width:28px;height:28px;background:${EMAIL_BRAND.primary};border-radius:6px;text-align:center;line-height:28px;font-family:${EMAIL_BRAND.bodyFontStack};font-size:16px;font-weight:700;color:#ffffff;">T</div>
                  </td>
                  <td style="vertical-align:middle;padding-left:10px;">
                    <span style="font-family:${EMAIL_BRAND.bodyFontStack};font-size:18px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">${EMAIL_BRAND.appName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                &copy; ${new Date().getFullYear()} ${EMAIL_BRAND.appName}. All rights reserved.<br />
                <a href="${appUrl}" style="color:${EMAIL_BRAND.primary};text-decoration:none;">Visit ${EMAIL_BRAND.appName}</a>
                &nbsp;&bull;&nbsp;
                <a href="${appUrl}/cookies" style="color:${EMAIL_BRAND.primary};text-decoration:none;">Cookie Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${EMAIL_BRAND.primary};color:${EMAIL_BRAND.foreground};font-family:${EMAIL_BRAND.bodyFontStack};font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:6px;letter-spacing:0.1px;">${text}</a>`;
}

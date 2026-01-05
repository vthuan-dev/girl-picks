export function getPasswordResetEmailTemplate(
  resetUrl: string,
  userName?: string,
): { html: string; text: string } {
  const greeting = userName ? `Xin chào ${userName},` : 'Xin chào,';
  
  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu - Girl Pick</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); overflow: hidden;">
          <!-- Header with Red Gradient -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(135deg, #ff0000 0%, #e60000 100%);">
              <!-- Logo/Branding -->
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">GIRL PICK</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">Đặt lại mật khẩu</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                ${greeting}
              </p>
              
              <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấp vào nút bên dưới để tạo mật khẩu mới:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #ff0000 0%, #e60000 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(255, 0, 0, 0.4); transition: all 0.3s ease;">
                      Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Hoặc sao chép và dán liên kết sau vào trình duyệt của bạn:
              </p>
              <p style="margin: 12px 0 24px; padding: 12px; background-color: #f8f9fa; border-left: 3px solid #ff0000; color: #ff0000; font-size: 13px; word-break: break-all; line-height: 1.5; font-family: 'Courier New', monospace;">
                ${resetUrl}
              </p>
              
              <div style="margin: 32px 0 0; padding: 16px; background-color: #fff5f5; border-radius: 8px; border-left: 4px solid #ff0000;">
                <p style="margin: 0; color: #1a1a1a; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #ff0000;">⚠️ Lưu ý:</strong> Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và đảm bảo tài khoản của bạn được bảo mật.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0 0 8px; color: #666666; font-size: 14px; font-weight: 500;">
                © ${new Date().getFullYear()} <span style="color: #ff0000; font-weight: 600;">Girl Pick</span>. Tất cả quyền được bảo lưu.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
${greeting}

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 

Nhấp vào liên kết sau để đặt lại mật khẩu:
${resetUrl}

Lưu ý: Liên kết này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

© ${new Date().getFullYear()} Girl Pick. Tất cả quyền được bảo lưu.
Email này được gửi tự động, vui lòng không trả lời.
  `.trim();

  return { html, text };
}


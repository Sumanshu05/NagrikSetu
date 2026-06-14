/**
 * Email template for when a user's password has been updated.
 * @param {string} email - User's email
 * @param {string} name  - User's name
 * @returns {string} HTML string
 */
exports.passwordUpdated = (email, name) => {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8" />
            <title>Password Updated — NagrikSetu</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #1a73e8; padding: 24px 32px; color: #fff; }
                .header h1 { margin: 0; font-size: 22px; }
                .body { padding: 32px; color: #444; line-height: 1.7; }
                .body h2 { color: #1a73e8; }
                .footer { padding: 16px 32px; background: #f0f0f0; font-size: 12px; color: #888; text-align: center; }
                .badge { display: inline-block; background: #e8f4e8; color: #2e7d32; padding: 4px 12px; border-radius: 12px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 NagrikSetu — Password Updated</h1>
                </div>
                <div class="body">
                    <h2>Hello, ${name}</h2>
                    <p>
                        Your password for the account linked to <strong>${email}</strong>
                        has been <span class="badge">successfully updated</span>.
                    </p>
                    <p>
                        If you did not make this change, please contact our support team
                        immediately or reset your password.
                    </p>
                    <p>Stay safe,<br/><strong>The NagrikSetu Team</strong></p>
                </div>
                <div class="footer">
                    © ${new Date().getFullYear()} NagrikSetu. All rights reserved.
                </div>
            </div>
        </body>
    </html>`;
};

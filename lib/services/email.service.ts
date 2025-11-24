'use server'

import * as brevo from '@getbrevo/brevo'

// Initialize Brevo API
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY || ''
)

interface SendApprovalEmailParams {
    to: string
    hotelName: string
    ownerName: string
    email: string
    loginUrl: string
}

export async function sendHotelApprovalEmail({
    to,
    hotelName,
    ownerName,
    email,
    loginUrl
}: SendApprovalEmailParams) {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail()

        sendSmtpEmail.sender = {
            name: 'LankaStay',
            email: 'siritharsanthosh@gmail.com'
        }

        sendSmtpEmail.to = [{ email: to, name: ownerName }]

        sendSmtpEmail.subject = `🎉 Your Hotel "${hotelName}" Has Been Approved!`

        sendSmtpEmail.htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .credentials-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .credential-item { margin: 10px 0; }
      .credential-label { font-weight: bold; color: #667eea; }
      .credential-value { background: #f0f0f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; display: inline-block; margin-left: 10px; }
      .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
      .button:hover { background: #764ba2; }
      .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
      .important { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; font-weight: 500; }
      .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Congratulations!</h1>
        <p>Your Hotel Registration Has Been Approved</p>
      </div>
      
      <div class="content">
        <h2>Hello ${ownerName},</h2>
        
        <p>Great news! Your hotel <strong>"${hotelName}"</strong> has been approved and is now live on LankaStay.</p>
        
        <p>Your account has been <strong>upgraded to Manager</strong> to manage your property.</p>
        
        <div class="credentials-box">
          <h3>🔐 Your Login Credentials</h3>
          
          <div class="credential-item">
            <span class="credential-label">Email:</span>
            <span class="credential-value">${email}</span>
          </div>
          
          <div class="credential-item">
            <span class="credential-label">Password:</span>
            <span class="credential-value">Use your existing password</span>
          </div>
        </div>
        
        <div class="important">
          ⚠️ <strong>IMPORTANT:</strong> If you are currently logged in, please <strong>log out and log back in</strong> 
          with your existing password to activate your Manager Dashboard access.
        </div>
        
        <center>
          <a href="${loginUrl}" class="button">Login to Manager Dashboard →</a>
        </center>
        
        <h3>What's Next?</h3>
        <ul>
          <li>✅ Complete your hotel profile</li>
          <li>✅ Add room types and availability</li>
          <li>✅ Set pricing and policies</li>
          <li>✅ Upload additional photos</li>
          <li>✅ Start receiving bookings</li>
        </ul>
        
        <p>If you have any questions, feel free to contact our support team.</p>
        
        <p>Welcome to LankaStay Partner Program! 🏨</p>
        
        <div class="footer">
          <p>© 2024 LankaStay. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
`

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log('✅ Approval email sent:', result)
        return { success: true, messageId: result.body?.messageId }

    } catch {
        return { success: false, message: 'Failed to send approval email' }
    }
}

export async function sendHotelRejectionEmail({
    to,
    hotelName,
    ownerName,
    reason
}: {
    to: string
    hotelName: string
    ownerName: string
    reason?: string
}) {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail()

        sendSmtpEmail.sender = {
            name: 'LankaStay',
            email: 'noreply@lankastay.com'
        }

        sendSmtpEmail.to = [{ email: to, name: ownerName }]

        sendSmtpEmail.subject = `Application Update: ${hotelName}`

        sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason-box { background: white; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${ownerName},</h2>
            
            <p>Thank you for your interest in listing <strong>"${hotelName}"</strong> on LankaStay.</p>
            
            <p>Unfortunately, we're unable to approve your application at this time.</p>
            
            ${reason ? `
              <div class="reason-box">
                <h3>Reason:</h3>
                <p>${reason}</p>
              </div>
            ` : ''}
            
            <p>If you'd like to discuss this decision or reapply with updated information, please contact our support team.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" class="button">Contact Support</a>
            </center>
            
            <p>Best regards,<br>The LankaStay Team</p>
            
            <div class="footer">
              <p>© 2024 LankaStay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
        return { success: true, messageId: result.body?.messageId }
    } catch {
        return { success: false, message: 'Failed to send rejection email' }
    }
}
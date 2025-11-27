'use server'

import * as brevo from '@getbrevo/brevo'

// Initialize Brevo API
const apiInstance = new brevo.TransactionalEmailsApi()

if (!process.env.BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY environment variable is not set')
}
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
          ⚠️ <strong>IMPORTANT:</strong> If you are already logged in, please <strong>log out and log back in</strong> 
          with your existing credentials. This is required for the role update to take effect and to automatically redirect you to the Manager Dashboard.
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
      email: 'siritharsanthosh@gmail.com'
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

// ========== PUBLISH WORKFLOW EMAILS ==========

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendPublishRequestEmail({
  to,
  hotelName,
  ownerName
}: {
  to: string
  hotelName: string
  ownerName: string
}) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.sender = {
      name: 'LankaStay',
      email: 'siritharsanthosh@gmail.com'
    }

    sendSmtpEmail.to = [{ email: to, name: ownerName }]

    sendSmtpEmail.subject = `📢 New Publish Request: ${hotelName}`

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 New Publish Request</h1>
          </div>
          
          <div class="content">
            <h2>Hello Admin,</h2>
            
            <p>A hotel manager has requested to publish their hotel on LankaStay.</p>
            
            <div class="info-box">
              <h3>Hotel Details:</h3>
              <p><strong>Hotel Name:</strong> ${escapeHtml(hotelName)}</p>
              <p><strong>Manager:</strong> ${escapeHtml(ownerName)}</p>
            </div>
            
            <p>Please review the hotel details and approve or reject the publish request.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/hotels" class="button">Review Request →</a>
            </center>
            
            <p>Best regards,<br>The LankaStay System</p>
            
            <div class="footer">
              <p>© 2024 LankaStay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Publish request email sent successfully:', result.body?.messageId)
    return { success: true, messageId: result.body?.messageId }
  } catch (error: any) {
    console.error('❌ Failed to send publish request email:', error)
    console.error('Error details:', {
      to,
      hotelName,
      ownerName,
      errorMessage: error.message,
      errorResponse: error.response?.body
    })
    return { success: false, message: error.message || 'Failed to send publish request email' }
  }
}

export async function sendPublishApprovalEmail({
  to,
  hotelName,
  ownerName,
  dashboardUrl
}: {
  to: string
  hotelName: string
  ownerName: string
  dashboardUrl: string
}) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.sender = {
      name: 'LankaStay',
      email: 'siritharsanthosh@gmail.com'
    }

    sendSmtpEmail.to = [{ email: to, name: ownerName }]

    sendSmtpEmail.subject = `🎉 Your Hotel "${hotelName}" is Now Live!`

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #44ff9a 0%, #44b0ff 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: white; border: 2px solid #44ff9a; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your Hotel is Now Live on LankaStay</p>
          </div>
          
          <div class="content">
            <h2>Hello ${ownerName},</h2>
            
            <p>Great news! Your hotel <strong>"${hotelName}"</strong> has been approved and is now <strong>live and visible</strong> to all travelers on LankaStay!</p>
            
            <div class="success-box">
              <h3>✅ What This Means:</h3>
              <ul>
                <li>Your hotel is now visible on the LankaStay platform</li>
                <li>Travelers can view and book your hotel</li>
                <li>You can start receiving bookings immediately</li>
              </ul>
            </div>
            
            <center>
              <a href="${dashboardUrl}" class="button">Go to Manager Dashboard →</a>
            </center>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Welcome to LankaStay! 🏨</p>
            
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
    return { success: false, message: 'Failed to send publish approval email' }
  }
}

export async function sendPublishRejectionEmail({
  to,
  hotelName,
  ownerName,
  reason,
  dashboardUrl
}: {
  to: string
  hotelName: string
  ownerName: string
  reason: string
  dashboardUrl: string
}) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.sender = {
      name: 'LankaStay',
      email: 'siritharsanthosh@gmail.com'
    }

    sendSmtpEmail.to = [{ email: to, name: ownerName }]

    sendSmtpEmail.subject = `Publish Request Update: ${hotelName}`

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
            <h1>Publish Request Update</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${ownerName},</h2>
            
            <p>Thank you for submitting your hotel <strong>"${hotelName}"</strong> for publishing on LankaStay.</p>
            
            <p>Unfortunately, we're unable to approve your publish request at this time.</p>
            
            <div class="reason-box">
              <h3>Reason for Rejection:</h3>
              <p>${reason}</p>
            </div>
            
            <p>You can edit your hotel details and resubmit the publish request at any time.</p>
            
            <center>
              <a href="${dashboardUrl}" class="button">Edit Hotel Details →</a>
            </center>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
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
    return { success: false, message: 'Failed to send publish rejection email' }
  }
}

export async function sendPublishChangeRequestEmail({
  to,
  hotelName,
  ownerName,
  changeRequest,
  dashboardUrl
}: {
  to: string
  hotelName: string
  ownerName: string
  changeRequest: string
  dashboardUrl: string
}) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.sender = {
      name: 'LankaStay',
      email: 'siritharsanthosh@gmail.com'
    }

    sendSmtpEmail.to = [{ email: to, name: ownerName }]

    sendSmtpEmail.subject = `Action Required: Update Request for ${hotelName}`

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .change-box { background: white; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Action Required</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${ownerName},</h2>
            
            <p>We've reviewed your publish request for <strong>"${hotelName}"</strong> and would like to request some changes before we can approve it for publishing.</p>
            
            <div class="change-box">
              <h3>Requested Changes:</h3>
              <p>${changeRequest}</p>
            </div>
            
            <p>Please update your hotel details based on the feedback above and resubmit your publish request.</p>
            
            <center>
              <a href="${dashboardUrl}" class="button">Update Hotel Details →</a>
            </center>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
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
    return { success: false, message: 'Failed to send change request email' }
  }
}
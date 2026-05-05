// Sends email via Supabase Edge Functions if configured, otherwise logs to console.
// For production: set RESEND_API_KEY in environment and wire Resend directly here.

interface BookingEmailData {
  studentName: string
  studentEmail: string
  studentPhone: string
  classTitle: string
  bookingDate: string
  amountPaid: number
  paymentId?: string
  teacherEmail: string
  teacherName: string
  studioName?: string
}

interface ContactEmailData {
  fromName: string
  fromEmail: string
  fromPhone?: string
  message: string
  teacherEmail: string
}

function formatAmount(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`
}

export async function sendBookingNotification(data: BookingEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[EMAIL] Booking notification (no RESEND_API_KEY set):', data.studentName, data.classTitle)
    return
  }

  const body = {
    from: 'bookings@nirlipta.duckdns.org',
    to: data.teacherEmail,
    subject: `New booking: ${data.classTitle} — ${data.studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:4px">New Booking Confirmed</h2>
        <p style="color:#666;margin-top:0">Someone just booked a class on your website.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:40%">Class</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.classTitle}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.bookingDate}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Student</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.studentName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${data.studentEmail}">${data.studentEmail}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="tel:${data.studentPhone}">${data.studentPhone}</a></td></tr>
          <tr><td style="padding:10px 0;color:#666">Amount</td><td style="padding:10px 0;font-weight:700;color:#16a34a">${formatAmount(data.amountPaid)}</td></tr>
        </table>
        ${data.paymentId ? `<p style="font-size:12px;color:#999">Payment ID: ${data.paymentId}</p>` : ''}
        <p style="font-size:13px;color:#888">— Nirlipta booking system</p>
      </div>
    `,
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error('[EMAIL] Failed to send booking notification:', err)
  }

  // Student confirmation
  if (!data.studentEmail) return
  const studioName = data.studioName || 'the studio'
  const studentBody = {
    from: 'bookings@nirlipta.duckdns.org',
    to: data.studentEmail,
    subject: `Booking confirmed — ${data.classTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:4px">You&apos;re booked!</h2>
        <p style="color:#666;margin-top:0">Hi ${data.studentName}, your spot is confirmed. See you on the mat.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:40%">Class</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.classTitle}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.bookingDate}</td></tr>
          <tr><td style="padding:10px 0;color:#666">Amount paid</td><td style="padding:10px 0;font-weight:700;color:#16a34a">${formatAmount(data.amountPaid)}</td></tr>
        </table>
        ${data.paymentId ? `<p style="font-size:12px;color:#999">Payment ID: ${data.paymentId}</p>` : ''}
        <p style="font-size:13px;color:#888">— ${studioName}</p>
      </div>
    `,
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(studentBody),
    })
  } catch (err) {
    console.error('[EMAIL] Failed to send student confirmation:', err)
  }
}

export async function sendContactNotification(data: ContactEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[EMAIL] Contact notification (no RESEND_API_KEY set):', data.fromName, data.fromEmail)
    return
  }

  const body = {
    from: 'contact@nirlipta.duckdns.org',
    to: data.teacherEmail,
    reply_to: data.fromEmail,
    subject: `New message from ${data.fromName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:4px">New Contact Message</h2>
        <p style="color:#666;margin-top:0">Someone filled out the contact form on your website.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:40%">Name</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.fromName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${data.fromEmail}">${data.fromEmail}</a></td></tr>
          ${data.fromPhone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee">${data.fromPhone}</td></tr>` : ''}
        </table>
        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;color:#333;line-height:1.7;white-space:pre-wrap">${data.message}</p>
        </div>
        <p style="font-size:13px;color:#888;margin-top:16px">Hit Reply to respond directly to ${data.fromName}.</p>
      </div>
    `,
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error('[EMAIL] Failed to send contact notification:', err)
  }
}

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

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
}

async function send(payload: object) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[EMAIL] Resend error', res.status, body)
    }
  } catch (err) {
    console.error('[EMAIL] Send failed:', err)
  }
}

// Called immediately when a booking is created (status = pending).
// Notifies teacher + sends student a "received, pending confirmation" ack.
export async function sendBookingReceived(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] sendBookingReceived (no key):', data.studentName, data.classTitle)
    return
  }
  const studioName = data.studioName || 'Nirlipta'

  // Teacher notification
  await send({
    from: fromAddress(),
    to: data.teacherEmail,
    subject: `New booking request: ${data.classTitle} — ${data.studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:4px">New Booking Request</h2>
        <p style="color:#666;margin-top:0">A student has requested a class. Go to your dashboard to confirm.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:40%">Class</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.classTitle}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.bookingDate}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Student</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.studentName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${data.studentEmail}">${data.studentEmail}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="tel:${data.studentPhone}">${data.studentPhone}</a></td></tr>
          <tr><td style="padding:10px 0;color:#666">Amount</td><td style="padding:10px 0;font-weight:700;color:#16a34a">${formatAmount(data.amountPaid)}</td></tr>
        </table>
        ${data.paymentId ? `<p style="font-size:12px;color:#999">Payment ID: ${data.paymentId}</p>` : ''}
        <p style="font-size:13px;color:#888">— ${studioName} booking system</p>
      </div>
    `,
  })

  // Student acknowledgement — "we got it, pending confirmation"
  if (!data.studentEmail) return
  await send({
    from: fromAddress(),
    to: data.studentEmail,
    subject: `Booking received — ${data.classTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:4px">We received your booking!</h2>
        <p style="color:#666;margin-top:0">Hi ${data.studentName}, your request has been received. ${data.teacherName} will confirm your spot shortly.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:40%">Class</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.classTitle}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.bookingDate}</td></tr>
          <tr><td style="padding:10px 0;color:#666">Amount paid</td><td style="padding:10px 0;font-weight:700;color:#16a34a">${formatAmount(data.amountPaid)}</td></tr>
        </table>
        ${data.paymentId ? `<p style="font-size:12px;color:#999">Payment ID: ${data.paymentId}</p>` : ''}
        <p style="font-size:13px;color:#888">— ${studioName}</p>
      </div>
    `,
  })
}

// Called when admin confirms a booking. Sends student the confirmed email only.
export async function sendBookingConfirmed(data: BookingEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] sendBookingConfirmed (no key):', data.studentName, data.classTitle)
    return
  }
  if (!data.studentEmail) return
  const studioName = data.studioName || 'Nirlipta'

  await send({
    from: fromAddress(),
    to: data.studentEmail,
    subject: `Booking confirmed — ${data.classTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:4px">You're confirmed!</h2>
        <p style="color:#666;margin-top:0">Hi ${data.studentName}, your spot is confirmed. See you on the mat.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:40%">Class</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.classTitle}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${data.bookingDate}</td></tr>
          <tr><td style="padding:10px 0;color:#666">Amount paid</td><td style="padding:10px 0;font-weight:700;color:#16a34a">${formatAmount(data.amountPaid)}</td></tr>
        </table>
        <p style="font-size:13px;color:#888">— ${studioName}</p>
      </div>
    `,
  })
}

export async function sendContactNotification(data: ContactEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] sendContactNotification (no key):', data.fromName)
    return
  }
  await send({
    from: fromAddress(),
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
  })
}

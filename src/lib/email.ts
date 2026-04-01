import nodemailer from 'nodemailer';

// ============================================================
// TRANSPORT
// Creates a nodemailer transport using Mailtrap SMTP credentials
// from environment variables.
//
// Mailtrap is a development email sandbox - emails are captured
// in the Mailtrap inbox rather than delivered to real addresses.
// Switch to Resend / SendGrid for production by replacing the
// transport config and keeping the sendEmail interface the same.
// ============================================================

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
}

type EmailPayload = {
  to: string
  subject: string
  html: string
}

// ============================================================
// SEND EMAIL
// Single entry point for all outbound emails in the app.
// Returns null on success, error string on failure.
// Never throws - callers should treat email as best-effort.
// ============================================================

export async function sendEmail(payload: EmailPayload): Promise<string | null> {
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: '"PowerProShop" <noreply@powerpro.shop>',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return null;
  } catch (err) {
    console.error('sendEmail error:', err);
    return err instanceof Error ? err.message : 'Failed to send email';
  }
}

// ============================================================
// APPOINTMENT CONFIRMATION EMAIL
// Formats and sends the booking confirmation to the customer.
// Called from createAppointment after a successful DB insert.
//
// Kept as a named function so the template lives here alongside
// the transport config rather than scattered in action files.
// ============================================================

type AppointmentConfirmationData = {
  customerName: string
  customerEmail: string
  serviceName: string
  appointmentDate: string   // 'YYYY-MM-DD'
  appointmentTime: string   // 'HH:MM'
  duration: number          // minutes
  price: number
}

export async function sendAppointmentConfirmation(
  data: AppointmentConfirmationData
): Promise<string | null> {
  const formattedDate = new Date(data.appointmentDate + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = data.appointmentTime.substring(0, 5); // trim seconds if present
  const formattedPrice = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(data.price);

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #171717;">
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Booking Confirmed</h1>
      <p style="color: #525252; margin-bottom: 24px;">
        Hi ${data.customerName}, your appointment has been received and is pending confirmation from our team.
      </p>

      <div style="border: 1px solid #E5E5E5; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #525252; margin-bottom: 16px;">
          Booking Details
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #525252; width: 40%;">Service</td>
            <td style="padding: 8px 0; font-weight: 500;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #525252;">Date</td>
            <td style="padding: 8px 0; font-weight: 500;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #525252;">Time</td>
            <td style="padding: 8px 0; font-weight: 500;">${formattedTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #525252;">Duration</td>
            <td style="padding: 8px 0; font-weight: 500;">${data.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #525252;">Price</td>
            <td style="padding: 8px 0; font-weight: 500;">${formattedPrice}</td>
          </tr>
        </table>
      </div>

      <p style="color: #525252; font-size: 14px;">
        We'll send a confirmation once your booking has been reviewed.
        To cancel or reschedule, visit your
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/appointments" style="color: #2B9DAA;">appointments page</a>.
      </p>

      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 24px 0;" />
      <p style="color: #A3A3A3; font-size: 12px;">PowerProShop &middot; Gym Equipment Sales &amp; Repair</p>
    </div>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: `Booking Received - ${data.serviceName} on ${formattedDate}`,
    html,
  });
}

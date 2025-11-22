import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

type RegistrationPayload = {
  teamId?: string;
  email?: string;
  teamName?: string;
  category?: string;
};

const SMTP_HOST = Deno.env.get('MUQAWAMAH_SMTP_HOST') ?? Deno.env.get('SUPABASE_SMTP_HOST');
const SMTP_PORT = Number(Deno.env.get('MUQAWAMAH_SMTP_PORT') ?? Deno.env.get('SUPABASE_SMTP_PORT') ?? 587);
const SMTP_USER = Deno.env.get('MUQAWAMAH_SMTP_USER') ?? Deno.env.get('SUPABASE_SMTP_USER');
const SMTP_PASS = Deno.env.get('MUQAWAMAH_SMTP_PASS') ?? Deno.env.get('SUPABASE_SMTP_PASS');
const SMTP_SENDER =
  Deno.env.get('MUQAWAMAH_SMTP_SENDER') ?? Deno.env.get('SUPABASE_SMTP_SENDER') ?? 'noreply@muqawamah.local';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('MUQAWAMAH_ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('Missing SMTP configuration. Set MUQAWAMAH_SMTP_* secrets before deploying this function.');
}

async function sendRegistrationEmail(payload: Required<RegistrationPayload>) {
  const { email, teamName, category, teamId } = payload;

  const textContent = [
    'Assalamu Alaikum Captain,',
    '',
    `Your team "${teamName}" has been registered for the ${category.toUpperCase()} bracket.`,
    'We will keep you updated with the fixtures, squad confirmations, and tournament briefings.',
    '',
    `Team ID: ${teamId}`,
    '',
    'Best regards,',
    'Team Muqawama'
  ].join('\n');

  const htmlContent = `
    <p>Assalamu Alaikum Captain,</p>
    <p>Your team <strong>${teamName}</strong> has been registered for the <strong>${category.toUpperCase()}</strong> bracket.</p>
    <p>We will keep you updated with fixtures, squad confirmations, and tournament briefings.</p>
    <p><strong>Team ID:</strong> ${teamId}</p>
    <p>Best regards,<br />Team Muqawama</p>
  `;

  const client = new SmtpClient();
  await client.connectTLS({
    hostname: SMTP_HOST!,
    port: SMTP_PORT,
    username: SMTP_USER!,
    password: SMTP_PASS!
  });

  try {
    await client.send({
      from: SMTP_SENDER,
      to: email,
      subject: 'Muqawama Registration Confirmation',
      content: textContent,
      html: htmlContent
    });
  } finally {
    await client.close();
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { teamId, email, teamName, category } = (await req.json()) as RegistrationPayload;

    if (!teamId || !email || !teamName || !category) {
      throw new Error('Missing required payload fields.');
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP configuration is missing on the server.');
    }

    await sendRegistrationEmail({ teamId, email, teamName, category });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('send-registration-email error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});


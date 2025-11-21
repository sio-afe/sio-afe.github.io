import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { teamId, email, teamName, category } = await req.json();

    console.log('Sending registration email for', teamId);

    // Placeholder email integration.
    // Replace with actual provider (Resend, SendGrid, Mailgun, etc.)
    // Example with Resend:
    // await fetch('https://api.resend.com/emails', { ... })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email placeholder executed',
        payload: { teamId, email, teamName, category }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});


## Muqawama Registration Email Function

This project ships with a Supabase Edge Function named `send-registration-email`. It emails the team captain every time a registration is submitted or updated.

### 1. Configure SMTP secrets

The function expects SMTP credentials to be stored as Supabase secrets:

```bash
supabase secrets set \
  MUQAWAMAH_SMTP_HOST="smtp.example.com" \
  MUQAWAMAH_SMTP_PORT="587" \
  MUQAWAMAH_SMTP_USER="apikey" \
  MUQAWAMAH_SMTP_PASS="super-secret" \
  MUQAWAMAH_SMTP_SENDER="info@sio-abulfazal.org" \
  MUQAWAMAH_ALLOWED_ORIGIN="https://sio-abulfazal.org"
```

> If you already configured a custom SMTP provider under **Auth → Email → SMTP** you can reuse the same host/user/pass values here.

### 2. Deploy the function

From the repository root (where `supabase/config.toml` lives) run:

```bash
supabase functions deploy send-registration-email --project-ref <YOUR_PROJECT_REF>
```

Verify deployment logs:

```bash
supabase functions logs --project-ref <YOUR_PROJECT_REF> --function send-registration-email
```

### 3. Triggering the function

`RegistrationSummary.jsx` already calls the Edge Function after storing the team & players in Supabase:

```ts
await supabaseClient.functions.invoke('send-registration-email', {
  body: {
    teamId,
    email: teamData.captainEmail,
    teamName: teamData.teamName,
    category: teamData.category
  }
});
```

As soon as the function is deployed and secrets are set, captains receive a confirmation email containing their team ID and category.


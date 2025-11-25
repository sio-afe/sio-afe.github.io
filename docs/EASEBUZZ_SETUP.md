# Easebuzz Payment Gateway Setup

This guide explains how to configure Easebuzz payment gateway for the Muqawama tournament registration.

## Prerequisites

1. Easebuzz merchant account (get one at https://easebuzz.in)
2. Supabase project with Edge Functions enabled
3. Supabase CLI installed (`npm install -g supabase`)

## Step 1: Get Easebuzz Credentials

1. Log in to your Easebuzz dashboard
2. Go to **Settings** → **API Keys**
3. Note down:
   - **Merchant Key** (e.g., `2PBP7IABZ2`)
   - **Salt** (e.g., `DAH88E3UIG`)

For testing, use the test credentials provided by Easebuzz.

## Step 2: Run Database Migrations

Run the payment schema SQL in your Supabase SQL Editor:

```sql
-- Located at: docs/payment-schema.sql
```

This adds payment columns to `team_registrations` and creates the `coupons` table.

## Step 3: Deploy Supabase Edge Functions

### Link your project (if not already linked)
```bash
cd /path/to/sio-afe.github.io
supabase link --project-ref YOUR_PROJECT_REF
```

### Set the secrets
```bash
supabase secrets set EASEBUZZ_KEY=your-merchant-key
supabase secrets set EASEBUZZ_SALT=your-salt
supabase secrets set EASEBUZZ_ENV=test  # or 'prod' for production
supabase secrets set BASE_URL=https://sio-abulfazal.org
```

### Deploy the functions
```bash
supabase functions deploy easebuzz-initiate
supabase functions deploy easebuzz-webhook
```

## Step 4: Configure Easebuzz Webhook

1. Log in to Easebuzz dashboard
2. Go to **Settings** → **Webhook Configuration**
3. Set the webhook URL to:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/easebuzz-webhook
   ```
4. Enable the webhook

## Step 5: Test the Integration

### Test Mode
- Use Easebuzz test credentials
- Test card: `4111111111111111`
- Expiry: Any future date
- CVV: Any 3 digits

### Production Mode
1. Update secrets:
   ```bash
   supabase secrets set EASEBUZZ_ENV=prod
   ```
2. Redeploy functions:
   ```bash
   supabase functions deploy easebuzz-initiate
   supabase functions deploy easebuzz-webhook
   ```

## Pricing Configuration

Edit `PaymentCheckout.jsx` to update pricing:

```javascript
const PRICING = {
  'open-age': {
    label: 'Open Age',
    amount: 1500,        // Regular price
    earlyBird: 1200,     // Early bird price
    earlyBirdDeadline: '2025-12-15'
  },
  'u17': {
    label: 'Under 17',
    amount: 1000,
    earlyBird: 800,
    earlyBirdDeadline: '2025-12-15'
  }
};
```

## Creating Coupon Codes

Add coupons via Supabase SQL Editor:

```sql
INSERT INTO coupons (code, discount_percent, valid_categories, max_uses, expires_at)
VALUES 
  ('EARLYBIRD20', 20, NULL, 50, '2025-12-31'),
  ('STUDENT10', 10, ARRAY['u17'], 100, '2026-01-03');
```

## Troubleshooting

### Payment not initiating
- Check Supabase function logs: `supabase functions logs easebuzz-initiate`
- Verify secrets are set correctly
- Ensure CORS is properly configured

### Webhook not updating status
- Check webhook URL is correct in Easebuzz dashboard
- Verify `supabase functions logs easebuzz-webhook`
- Ensure RLS policies allow the service role to update

### Hash verification failing
- Double-check the salt value
- Ensure no extra spaces in credentials

## Payment Flow

1. User fills registration form (Steps 1-4)
2. User proceeds to payment (Step 5)
3. Frontend calls `easebuzz-initiate` Edge Function
4. Edge Function generates hash and calls Easebuzz API
5. User is redirected to Easebuzz payment page
6. After payment, user is redirected back with `?payment=success` or `?payment=failed`
7. Easebuzz sends webhook to `easebuzz-webhook` Edge Function
8. Edge Function updates registration status in database
9. Confirmation email is sent (if successful)


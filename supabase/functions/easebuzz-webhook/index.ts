import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const EASEBUZZ_SALT = Deno.env.get('EASEBUZZ_SALT')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function verifyHash(params: Record<string, string>): Promise<boolean> {
  const { key, txnid, amount, productinfo, firstname, email, status, hash } = params

  // Reverse hash calculation for verification
  const hashString = `${EASEBUZZ_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
  
  const encoder = new TextEncoder()
  const data = encoder.encode(hashString)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return calculatedHash === hash
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse form data from Easebuzz webhook
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    console.log('Webhook received:', {
      txnid: params.txnid,
      status: params.status,
      amount: params.amount
    })

    // Verify hash
    const isValid = await verifyHash(params)
    if (!isValid) {
      console.error('Hash verification failed')
      return new Response(
        JSON.stringify({ error: 'Invalid hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const teamId = params.udf1
    const txnid = params.txnid
    const status = params.status
    const easebuzzId = params.easepayid
    const paymentMode = params.mode
    const bankRefNum = params.bank_ref_num

    // Map Easebuzz status to our status
    let paymentStatus: string
    let registrationStatus: string

    switch (status) {
      case 'success':
        paymentStatus = 'success'
        registrationStatus = 'confirmed'
        break
      case 'failure':
        paymentStatus = 'failed'
        registrationStatus = 'pending_payment'
        break
      case 'pending':
        paymentStatus = 'pending'
        registrationStatus = 'pending_payment'
        break
      default:
        paymentStatus = 'unknown'
        registrationStatus = 'pending_payment'
    }

    // Update team registration
    const { error: updateError } = await supabase
      .from('team_registrations')
      .update({
        status: registrationStatus,
        payment_status: paymentStatus,
        easebuzz_payment_id: easebuzzId,
        payment_mode: paymentMode,
        bank_ref_num: bankRefNum,
        payment_completed_at: status === 'success' ? new Date().toISOString() : null
      })
      .eq('id', teamId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Database update failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If payment successful, send confirmation email
    if (status === 'success') {
      try {
        await supabase.functions.invoke('send-registration-email', {
          body: {
            teamId,
            type: 'payment_success'
          }
        })
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't fail the webhook for email errors
      }
    }

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


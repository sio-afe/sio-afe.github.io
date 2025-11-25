import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const EASEBUZZ_KEY = Deno.env.get('EASEBUZZ_KEY')!
const EASEBUZZ_SALT = Deno.env.get('EASEBUZZ_SALT')!
const EASEBUZZ_ENV = Deno.env.get('EASEBUZZ_ENV') || 'test'

const EASEBUZZ_API_URL = EASEBUZZ_ENV === 'prod'
  ? 'https://pay.easebuzz.in/payment/initiateLink'
  : 'https://testpay.easebuzz.in/payment/initiateLink'

const BASE_URL = Deno.env.get('BASE_URL') || 'https://sio-abulfazal.org'
const SUCCESS_URL = `${BASE_URL}/muqawamah/2026/register/?payment=success`
const FAILURE_URL = `${BASE_URL}/muqawamah/2026/register/?payment=failed`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function generateHash(params: Record<string, string>): Promise<string> {
  const hashString = `${EASEBUZZ_KEY}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${EASEBUZZ_SALT}`
  
  const encoder = new TextEncoder()
  const data = encoder.encode(hashString)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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

    if (!EASEBUZZ_KEY || !EASEBUZZ_SALT) {
      return new Response(
        JSON.stringify({ error: 'Easebuzz credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { txnid, amount, productinfo, firstname, email, phone, teamId, category } = await req.json()

    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const params: Record<string, string> = {
      key: EASEBUZZ_KEY,
      txnid,
      amount: parseFloat(amount).toFixed(2),
      productinfo,
      firstname,
      email,
      phone: phone || '9999999999',
      surl: SUCCESS_URL,
      furl: FAILURE_URL,
      udf1: teamId || '',
      udf2: category || '',
      udf3: '',
      udf4: '',
      udf5: ''
    }

    params.hash = await generateHash(params)

    // Call Easebuzz API
    const formData = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const response = await fetch(EASEBUZZ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })

    const data = await response.json()

    if (data.status === 1) {
      // Update team registration with transaction ID
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      if (teamId) {
        await supabase
          .from('team_registrations')
          .update({ 
            transaction_id: txnid,
            easebuzz_access_key: data.data 
          })
          .eq('id', teamId)
      }

      return new Response(
        JSON.stringify({
          status: 1,
          data: data.data, // Access key for payment
          payUrl: EASEBUZZ_ENV === 'prod' 
            ? `https://pay.easebuzz.in/pay/${data.data}`
            : `https://testpay.easebuzz.in/pay/${data.data}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('Easebuzz error:', data)
      return new Response(
        JSON.stringify({
          status: 0,
          error: data.error || 'Payment initiation failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Payment initiation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


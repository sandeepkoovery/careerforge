import { useState, useEffect, useRef } from 'react'
import { Crown, Check, X, Sparkles, Loader2, Zap, ShieldCheck, CreditCard } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth'

export default function UpgradeModal({ open, onClose, templateName }) {
  const { user, setUser, upgrade } = useAuth()
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const [err, setErr] = useState('')
  const [proPrice, setProPrice] = useState(799)

  const [isConfigured, setIsConfigured] = useState(false)
  const [simulationOrder, setSimulationOrder] = useState(null)
  const cardRef = useRef(null)

  useEffect(() => {
    if (simulationOrder && cardRef.current) {
      cardRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [simulationOrder])

  // Fetch dynamic pricing and Razorpay configuration set by Admin
  useEffect(() => {
    if (open) {
      setSimulationOrder(null)
      api.get('/pricing')
        .then((r) => {
          if (r.pro_monthly_price) setProPrice(r.pro_monthly_price)
          setIsConfigured(Boolean(r.razorpay_configured))
        })
        .catch(() => { })
    }
  }, [open])

  if (!open) return null

  // Loads Razorpay Checkout JS script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    if (!user) {
      onClose()
      window.location.href = '/login'
      return
    }

    setBusy(true)
    setErr('')
    setSuccess('')

    try {
      // 1. Create order on backend (uses dynamic price set by admin)
      const orderData = await api.post('/payment/razorpay/create-order', { plan: 'pro_monthly' })
      if (orderData.price_inr) setProPrice(orderData.price_inr)

      // 2. If backend is in Simulation Mode (keys not yet configured), use interactive sandbox checkout
      if (orderData.is_simulation) {
        setBusy(false)
        setSimulationOrder(orderData)
        return
      }

      // 3. Live/Test Mode with genuine Razorpay API credentials:
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK could not be loaded from CDN. Please check your internet connection or ad-blocker.')
      }

      // Configure Razorpay Checkout options with the real order_id created by Razorpay API
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Smartcvmaker Pro',
        description: '1-Month Unlimited Pro Access & All 35 Templates',
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        order_id: orderData.order_id,
        "config": {
          "display": {
            "blocks": {
              "custom_block": {
                "name": "Pay Using",
                "instruments": [
                  { "method": "upi" },
                  { "method": "card" }
                ]
              }
            },
            "sequence": ["block.custom_block"],
            "preferences": {
              "show_default_blocks": false // Hides all other standard methods
            }
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setBusy(false)
          },
        },
        handler: async (response) => {
          await executeVerification(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
            orderData.price_inr || proPrice
          )
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp) => {
        setErr(resp.error?.description || 'Payment was cancelled or rejected by Razorpay.')
        setBusy(false)
      })
      rzp.open()
    } catch (e) {
      console.error('Razorpay initialization error:', e)
      setErr(e.message || 'Failed to initiate Razorpay checkout.')
      setBusy(false)
    }
  }

  const handleSimulatedPayment = async () => {
    if (!simulationOrder) return
    setBusy(true)
    setErr('')
    const simulatedPaymentId = 'pay_sim_' + Math.random().toString(36).slice(2, 10).toUpperCase()
    await executeVerification(
      simulatedPaymentId,
      simulationOrder.order_id,
      'sim_sig_' + Math.random().toString(36).slice(2, 12),
      simulationOrder.price_inr || proPrice
    )
    setSimulationOrder(null)
  }

  const executeVerification = async (paymentId, orderId, signature = '', chargedAmount = null) => {
    try {
      const finalAmount = chargedAmount || proPrice
      const res = await api.post('/payment/razorpay/verify', {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        plan: 'pro_monthly',
        amount: finalAmount,
      })

      if (res.user) {
        setUser(res.user)
      }
      setSuccess('🎉 Payment confirmed via Razorpay! All 35 templates and Pro features are now unlocked.')
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 2000)
    } catch (e) {
      setErr(e.message || 'Payment verification failed.')
    } finally {
      setBusy(false)
    }
  }

  const perks = [
    'Access all 35 ATS-friendly templates (Aurora, Summit, Nordic, Matrix, Sovereign, etc.)',
    'Unlimited AI bullet improvement & summary generation',
    'Comprehensive job description keyword gap analysis',
    'Custom cover letters with all 4 professional tones',
    'Full LinkedIn profile headline & about section optimizer',
    'High-resolution PDF exports with unlimited re-downloads',
  ]

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div ref={cardRef} className="card modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <button className="btn btn-icon btn-ghost modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="center">
          <div className="pro-icon-bubble">
            <Crown size={28} color="#eab308" />
          </div>
          <span className="badge-pro" style={{ marginBottom: 12 }}>
            <Sparkles size={13} /> SMARTCVMAKER PRO
          </span>
          <h2 style={{ fontSize: '1.8rem', marginTop: 4, marginBottom: 8 }}>
            {templateName ? `Unlock "${templateName}" & All Templates` : 'Upgrade to Smartcvmaker Pro'}
          </h2>
          <p className="muted" style={{ maxWidth: 440, margin: '0 auto 20px', fontSize: '0.92rem' }}>
            Free accounts include 3 core ATS templates. Upgrade today via Razorpay to unlock all 35 recruiter layouts and unlimited AI power.
          </p>
        </div>

        {success && (
          <div className="alert alert-info center row" style={{ marginBottom: 16, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
            <Check size={16} /> <span>{success}</span>
          </div>
        )}
        {err && (
          <div className="alert alert-error center" style={{ marginBottom: 16 }}>
            {err}
          </div>
        )}

        {!simulationOrder && (
          <div className="plan-box">
            <div className="row" style={{ alignItems: 'baseline', marginBottom: 14 }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>₹{proPrice}</span>
              <span className="muted" style={{ marginLeft: 6 }}>/ month · cancel anytime</span>
              <span className="spacer" />
              <span className="chip good"><Zap size={13} /> Instant access</span>
            </div>

            <div className="stack" style={{ '--gap': '10px', margin: '14px 0' }}>
              {perks.map((p, i) => (
                <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span className="check-dot"><Check size={13} color="#fff" /></span>
                  <span style={{ fontSize: '0.88rem', color: '#334155' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {simulationOrder ? (
          <div className="card fade-in" style={{ padding: '20px', background: '#f8fafc', border: '1.5px dashed #6366f1', borderRadius: '14px', marginTop: 8 }}>
            <div className="row between" style={{ marginBottom: 10 }}>
              <span className="row" style={{ gap: 6, color: '#4338ca', fontWeight: 700, fontSize: '0.94rem' }}>
                <Sparkles size={16} /> Razorpay Test Sandbox
              </span>
              <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                SIMULATION ACTIVE
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: 12 }}>
              Razorpay API keys are not yet configured in <code>backend/.env</code> or Admin Settings. Complete this simulated checkout to test the Pro unlock flow.
            </p>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: 14 }}>
              <div className="row between" style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                <span className="muted">Simulated Order:</span>
                <code style={{ fontSize: '0.78rem', color: '#4338ca' }}>{simulationOrder.order_id}</code>
              </div>
              <div className="row between" style={{ fontSize: '0.85rem' }}>
                <span className="muted">Total Payable:</span>
                <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>₹{simulationOrder.price_inr || proPrice}</strong>
              </div>
            </div>
            <div className="stack" style={{ '--gap': '8px' }}>
              <button
                id="modal-approve-test-payment-btn"
                className="btn btn-primary btn-lg row center"
                style={{ width: '100%', background: '#4f46e5', gap: 8, fontSize: '1rem' }}
                disabled={busy}
                onClick={handleSimulatedPayment}
              >
                {busy ? <Loader2 size={18} className="spin" /> : <Check size={18} />}
                <span>Approve Test Payment (Upgrade to Pro)</span>
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', color: '#64748b' }}
                disabled={busy}
                onClick={() => setSimulationOrder(null)}
              >
                Cancel &amp; Go Back
              </button>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 12, textAlign: 'center' }}>
              💡 To enable real customer cards/UPI, add <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in <code>.env</code> or Admin Settings.
            </div>
          </div>
        ) : (
          <div className="stack" style={{ '--gap': '10px', marginTop: 20 }}>
            {/* Official Razorpay Pay Button */}
            <button
              id="modal-razorpay-btn"
              className="btn btn-primary btn-lg row center"
              style={{
                width: '100%',
                fontSize: '1.05rem',
                gap: 8,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.4)',
              }}
              disabled={busy}
              onClick={handleRazorpayPayment}
            >
              {busy ? (
                <><Loader2 size={18} className="spin" /> Processing Razorpay Checkout…</>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Pay ₹{proPrice} with Razorpay</span>
                </>
              )}
            </button>

            <div className="row center" style={{ gap: 6, fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>
                {isConfigured
                  ? 'Secured by Razorpay · UPI, Credit/Debit Cards, NetBanking'
                  : 'Razorpay Sandbox Active · Click to run test checkout'}
              </span>
            </div>
          </div>
        )}

        {user?.is_pro && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button
              className="btn btn-sm btn-ghost"
              style={{ width: '100%', color: 'var(--muted)', fontSize: '0.76rem' }}
              disabled={busy}
              onClick={async () => {
                await upgrade(false)
                setSuccess('Switched back to Free plan for testing.')
                setTimeout(() => { onClose(); setSuccess('') }, 1000)
              }}
            >
              Switch back to Free plan (testing)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

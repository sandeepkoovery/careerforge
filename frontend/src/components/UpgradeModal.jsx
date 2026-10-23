import { useState, useEffect } from 'react'
import { Crown, Check, X, Sparkles, Loader2, Zap, ShieldCheck, CreditCard } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth'

export default function UpgradeModal({ open, onClose, templateName }) {
  const { user, setUser, upgrade } = useAuth()
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const [err, setErr] = useState('')
  const [proPrice, setProPrice] = useState(799)

  // Fetch dynamic pricing set by Admin
  useEffect(() => {
    if (open) {
      api.get('/pricing')
        .then((r) => {
          if (r.pro_monthly_price) setProPrice(r.pro_monthly_price)
        })
        .catch(() => {})
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

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded || !window.Razorpay) {
        // Fallback demo simulator if external script is blocked in browser
        console.warn('Razorpay script could not be loaded from CDN, executing demo verification')
        await executeVerification('pay_sim_' + Math.random().toString(36).slice(2, 10), orderData.order_id, '', orderData.price_inr || proPrice)
        return
      }

      // 3. Configure Razorpay Checkout options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Smartcvmaker Pro',
        description: '1-Month Unlimited Pro Access & All 35 Templates',
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        order_id: orderData.order_id,
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
        setErr(resp.error?.description || 'Payment was cancelled or failed.')
        setBusy(false)
      })
      rzp.open()
    } catch (e) {
      console.error('Razorpay initialization error:', e)
      setErr(e.message)
      setBusy(false)
    }
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
      <div className="card modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
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
            <span>Secured by Razorpay · UPI, Credit/Debit Cards, NetBanking</span>
          </div>

          {/* Quick simulator for sandbox/admin testing */}
          <button
            id="modal-demo-upgrade-btn"
            className="btn btn-sm btn-ghost"
            style={{ width: '100%', color: '#6366f1', fontSize: '0.8rem', marginTop: 4 }}
            disabled={busy}
            onClick={() => executeVerification('pay_test_' + Math.random().toString(36).slice(2, 9), 'order_test_sim')}
          >
            ⚡ Quick Test Checkout (Instant Demo Upgrade)
          </button>

          {user?.is_pro && (
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
          )}
        </div>
      </div>
    </div>
  )
}

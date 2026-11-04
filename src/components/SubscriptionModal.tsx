import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Coins, 
  Mail, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onUpgradeSuccess: (newPlan: string, invoice: any) => void;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpgradeSuccess,
  userEmail,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'trial' | 'monthly' | '1-year' | '2-year'>('2-year');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | 'googlepay'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [emailInput, setEmailInput] = useState(userEmail || 'usahran3@gmail.com');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: '2-year',
      title: '2-Year Ultra Privacy',
      monthlyPrice: '$2.49',
      period: 'per month',
      billed: '$59.76 every 2 years',
      savings: 'SAVE 83% + 3 MONTHS FREE',
      badge: 'BEST VALUE',
      features: [
        'Unlimited ultra-fast 10Gbps bandwidth',
        '10 simultaneous devices protected',
        'Military-Grade 256-bit AES encryption',
        'RAM-only Zero-Logs servers in 60+ countries',
        'CyberShield Malware & Ad blocker',
        'Priority 24/7 dedicated support'
      ],
      amount: 59.76,
    },
    {
      id: '1-year',
      title: '1-Year Saver',
      monthlyPrice: '$4.99',
      period: 'per month',
      billed: '$59.88 billed annually',
      savings: 'SAVE 58%',
      badge: 'POPULAR',
      features: [
        'Unlimited high-speed bandwidth',
        '7 simultaneous devices protected',
        'Zero-Logs audited network',
        'Kill switch fail-safe firewall',
        'CyberShield basic protection'
      ],
      amount: 59.88,
    },
    {
      id: 'monthly',
      title: '1-Month Flexible',
      monthlyPrice: '$11.99',
      period: 'per month',
      billed: 'Billed monthly. Cancel anytime.',
      savings: '',
      badge: '',
      features: [
        'Standard high-speed bandwidth',
        '5 simultaneous devices',
        'Full server network access',
        'Zero-logs privacy guarantee'
      ],
      amount: 11.99,
    },
  ];

  const handleCheckout = async () => {
    setProcessing(true);
    const chosenPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
    const invoiceId = `AEGIS-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInvoice = {
      id: invoiceId,
      plan: chosenPlan.title,
      planId: selectedPlanId,
      amount: chosenPlan.amount,
      currency: 'USD',
      paymentMethod,
      date: new Date().toISOString(),
      status: 'paid',
      customerEmail: emailInput,
    };

    try {
      // Dispatch automated receipt & welcome alert via backend server endpoint
      await fetch('/api/send-email-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          type: 'invoice_receipt',
          planName: chosenPlan.title,
          amount: chosenPlan.amount,
          invoiceId,
        })
      });
    } catch (e) {
      console.warn('Simulated email dispatch warning:', e);
    }

    setTimeout(() => {
      setProcessing(false);
      setReceipt(newInvoice);
      onUpgradeSuccess(selectedPlanId, newInvoice);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AegisShield Subscription Plans</h2>
              <p className="text-xs text-slate-400">
                Guaranteed 30-Day Money-Back • Zero Logs • Instant Tunnel Activation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {receipt ? (
            /* Success Receipt Display */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Subscription Successfully Activated!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your payment was verified via our end-to-end tokenized gateway. An automated confirmation and VAT invoice have been dispatched to <strong className="text-emerald-400">{emailInput}</strong>.
              </p>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Invoice Reference:</span>
                  <span className="text-white font-bold">{receipt.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Selected Plan:</span>
                  <span className="text-white">{receipt.plan}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Charged Amount:</span>
                  <span className="text-emerald-400 font-bold">${receipt.amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gateway Method:</span>
                  <span className="uppercase text-slate-300">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Zero-Logs Audit:</span>
                  <span className="text-teal-400 font-bold">VERIFIED</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id as any)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.badge && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 shadow-md">
                          {p.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-white">{p.title}</h4>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="text-2xl font-bold font-mono text-white">{p.monthlyPrice}</span>
                          <span className="text-xs text-slate-400 ml-1">{p.period}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.billed}</p>

                        {p.savings && (
                          <span className="mt-2 inline-block text-[10px] font-extrabold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {p.savings}
                          </span>
                        )}

                        <ul className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-[11px] text-slate-300">
                          {p.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Secure Payment Gateway Selector */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2 text-sm font-bold text-white">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Bank-Grade 256-bit Encrypted Checkout</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Zero Payment Data Stored</span>
                </div>

                {/* Gateway Tab selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'paypal', label: 'PayPal', icon: FileText },
                    { id: 'crypto', label: 'Anonymous Crypto', icon: Coins },
                    { id: 'googlepay', label: 'Google Pay', icon: ShieldCheck },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      onClick={() => setPaymentMethod(gw.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                        paymentMethod === gw.id
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <gw.icon className="w-4 h-4" />
                      <span>{gw.label}</span>
                    </button>
                  ))}
                </div>

                {/* Card input mockup */}
                {paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">MM/YY</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div className="w-20">
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">CVC</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email for automated alerts */}
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Notification Email (For automated receipt & trial expiry alert)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

              </div>
            </>
          )}

        </div>

        {/* Footer Checkout Trigger */}
        {!receipt && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              <span className="font-semibold text-white">30-Day Money-Back Guarantee.</span>
              <p className="text-[11px] text-slate-500">Cancel anytime with one click in your dashboard.</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {processing ? 'Authorizing Secure Gateway...' : 'Complete Secure Checkout'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

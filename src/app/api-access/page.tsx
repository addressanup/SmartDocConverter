'use client'

import { Button } from '@/components/ui/Button'
import { Terminal, Copy, Check, Zap, Code, Lock, Key, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function ApiPage() {
  const [copied, setCopied] = useState(false)
  const sampleCode = `curl -X POST https://api.smartdoc.com/v1/convert \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@document.pdf" \\
  -F "format=docx"`

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.35]" />
      </div>

      <div className="relative z-10 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
          >
            ← Back to home
          </Link>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">Developer API</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Build with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">superpowers</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Our REST API provides programmatic access to all conversion tools. 
                Process thousands of documents with enterprise-grade reliability and security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  <Key className="w-4 h-4" />
                  Get API Key
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2">
                  Read Documentation
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Code Preview */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/10 rounded-3xl blur-xl" />
              <div className="relative rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-900 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">bash</span>
                </div>
                <div className="p-6 relative group">
                  <button
                    onClick={handleCopy}
                    className="absolute right-4 top-4 p-2.5 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="font-mono text-sm text-slate-300 leading-loose overflow-x-auto">
                    <code>{sampleCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: Zap,
                title: "High Performance",
                desc: "Process up to 100 files per minute with our distributed cloud infrastructure.",
                gradient: "from-amber-500 to-orange-600"
              },
              {
                icon: Lock,
                title: "Enterprise Security",
                desc: "End-to-end encryption, SOC2 compliance, and automatic file deletion.",
                gradient: "from-emerald-500 to-teal-600"
              },
              {
                icon: Code,
                title: "Simple Integration",
                desc: "SDKs available for Node.js, Python, Go, and Ruby. Get started in minutes.",
                gradient: "from-indigo-500 to-purple-600"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[32px] blur-2xl" />
            <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-slate-100 shadow-xl text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 mb-6">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">Simple Pricing</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Transparent API Pricing</h3>
              <p className="text-slate-500 mb-10 max-w-xl mx-auto">
                Pay only for what you use. No hidden fees or long-term contracts. 
                Start with 100 free conversions per month.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { tier: "Free", price: "$0", features: ["100 calls/mo", "Standard speed", "Community support"] },
                  { tier: "Pro", price: "$49", features: ["10k calls/mo", "Priority queue", "Email support"], popular: true },
                  { tier: "Business", price: "$199", features: ["100k calls/mo", "Dedicated support", "Custom SLA"] },
                ].map((plan, i) => (
                  <div key={i} className={`relative p-6 rounded-2xl ${plan.popular ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25 scale-105' : 'bg-slate-50 border-2 border-slate-100'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                        POPULAR
                      </div>
                    )}
                    <div className={`text-sm font-semibold mb-2 ${plan.popular ? 'text-indigo-200' : 'text-indigo-600'}`}>{plan.tier}</div>
                    <div className={`text-4xl font-bold mb-5 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}<span className="text-lg font-normal opacity-60">/mo</span>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((f, j) => (
                        <li key={j} className={`text-sm flex items-center gap-2 ${plan.popular ? 'text-white/90' : 'text-slate-600'}`}>
                          <Check className={`w-4 h-4 ${plan.popular ? 'text-emerald-300' : 'text-emerald-500'}`} /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant={plan.popular ? "secondary" : "outline"} 
                      className={`w-full mt-6 ${plan.popular ? 'bg-white text-indigo-600 hover:bg-slate-100' : ''}`}
                    >
                      Get Started
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

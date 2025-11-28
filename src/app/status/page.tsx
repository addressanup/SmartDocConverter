'use client'

import Link from 'next/link'
import { Activity, CheckCircle, AlertTriangle, XCircle, Server, Wifi, Database, Clock } from 'lucide-react'

const services = [
  { name: 'Conversion Engine', status: 'operational', uptime: '99.99%' },
  { name: 'API Gateway', status: 'operational', uptime: '100%' },
  { name: 'File Storage', status: 'operational', uptime: '99.95%' },
  { name: 'Authentication', status: 'operational', uptime: '99.99%' },
  { name: 'Web Dashboard', status: 'operational', uptime: '99.98%' },
]

const incidents = [
  {
    date: 'Nov 28, 2025',
    status: 'Resolved',
    title: 'Increased latency in OCR processing',
    description: 'We investigated reports of slower than usual processing times for image-to-text conversions.',
    updates: [
      { time: '14:30 UTC', msg: 'Issue resolved. Performance has returned to normal levels.' },
      { time: '13:45 UTC', msg: 'Identified bottleneck in GPU cluster scaling. Implementing fix.' },
      { time: '13:15 UTC', msg: 'Investigating increased latency alerts.' },
    ]
  }
]

export default function StatusPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' }
      case 'degraded': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' }
      case 'down': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' }
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'down': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Activity className="w-5 h-5 text-slate-600" />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.35]" />
      </div>

      <div className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
          >
            ← Back to home
          </Link>

          {/* Header */}
          <div className="flex items-start gap-6 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                System Status
              </h1>
              <p className="text-lg text-slate-500 mt-2">
                Real-time performance and availability monitoring
              </p>
            </div>
          </div>

          {/* Overall Status */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200 mb-10 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900">All Systems Operational</h2>
                <p className="text-emerald-600/70 text-sm">Last updated: Just now</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-mono font-bold text-emerald-600">99.98%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">30-Day Uptime</div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-xl p-6 mb-10">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Services</h3>
            <div className="space-y-3">
              {services.map((service, i) => {
                const colors = getStatusColor(service.status)
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <span className="font-semibold text-slate-900">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-sm text-slate-500 font-mono hidden sm:block">{service.uptime}</span>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${colors.bg} ${colors.text} border ${colors.border}`}>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
                          {service.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-500 font-semibold text-sm">API Latency</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">45ms</div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 w-[30%] rounded-full" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-500 font-semibold text-sm">Error Rate</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">0.01%</div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 w-[5%] rounded-full" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-500 font-semibold text-sm">Active Nodes</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">24/24</div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 w-full rounded-full" />
              </div>
            </div>
          </div>

          {/* Incident History */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-xl p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Incident History
            </h3>
            <div className="space-y-6 relative pl-8 border-l-2 border-slate-200">
              {incidents.map((incident, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow" />
                  <div className="mb-3">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-slate-500 font-mono">{incident.date}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {incident.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{incident.title}</h4>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{incident.description}</p>
                  <div className="space-y-2 bg-slate-50 rounded-xl p-4">
                    {incident.updates.map((update, j) => (
                      <div key={j} className="text-sm flex items-start gap-3">
                        <span className="text-slate-400 font-mono text-xs whitespace-nowrap pt-0.5">{update.time}</span>
                        <span className="text-slate-600">{update.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

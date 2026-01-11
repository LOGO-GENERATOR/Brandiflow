import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Brandiflow
        </div>
        <div className="space-x-4">
          <Link href="/auth/signin" className="text-slate-300 hover:text-white transition-colors">Sign In</Link>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full font-medium transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] -z-10" />

        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
          Craft the Perfect Logo <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            in Seconds with AI
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Brandiflow uses advanced AI to generate unique, professional logos for your brand. No design skills required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/generate" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
            Create Your Logo
          </Link>
          <Link href="#pricing" className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-full text-lg font-medium transition-all">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Brandiflow?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Generate dozens of concepts in under 30 seconds." },
              { icon: Shield, title: "Commercial Rights", desc: "Full ownership of every logo you generate." },
              { icon: Sparkles, title: "High Resolution", desc: "Download in 4K PNG and SVG formats suitable for print." }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                <f.icon className="w-10 h-10 text-blue-400 mb-6" />
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-6">Simple Pricing</h2>
        <p className="text-center text-slate-400 mb-16">Start for free, upgrade as you grow.</p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="mb-4">
              <span className="text-lg font-medium text-slate-400">Free</span>
              <div className="text-4xl font-bold mt-2">$0<span className="text-lg font-normal text-slate-500">/mo</span></div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> 5 Logos / month</li>
              <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Low Res Download</li>
              <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Community Support</li>
            </ul>
            <Link href="/auth/signin" className="block w-full text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-all">
              Try for Free
            </Link>
          </div>

          {/* Starter Tier */}
          <div className="p-8 bg-slate-900 rounded-2xl border-2 border-blue-500 relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">POPULAR</div>
            <div className="mb-4">
              <span className="text-lg font-medium text-blue-400">Starter</span>
              <div className="text-4xl font-bold mt-2">$2.99<span className="text-lg font-normal text-slate-500">/mo</span></div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-blue-500" /> 50 Logos / month</li>
              <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-blue-500" /> High Res (4K)</li>
              <li className="flex gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Transparent Background</li>
            </ul>
            <Link href="/auth/signin" className="block w-full text-center py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="mb-4">
              <span className="text-lg font-medium text-slate-400">Professional</span>
              <div className="text-4xl font-bold mt-2">$9.99<span className="text-lg font-normal text-slate-500">/mo</span></div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> 500 Logos / month</li>
              <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Priority Support</li>
              <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Commercial License</li>
            </ul>
            <Link href="/auth/signin" className="block w-full text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-all">
              Upgrade
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950 text-slate-500 text-center">
        <p>&copy; {new Date().getFullYear()} Brandiflow. All rights reserved.</p>
      </footer>
    </div>
  );
}

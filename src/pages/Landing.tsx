import { useRef } from 'react';
import {
  Camera,
  Shirt,
  Scan,
  Eye,
  Zap,
  Shield,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const howRef = useRef<HTMLDivElement>(null);

  const scrollToHow = () => howRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#08080c] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-sm font-bold">V</span>
          </div>
          <span className="font-semibold tracking-tight text-lg">VibeCheck</span>
        </div>
        <button
          onClick={onStart}
          className="px-4 sm:px-5 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all active:scale-95"
        >
          Start Try-On
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-[fadeIn_0.6s_ease-out]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-white/70 tracking-wide">Try the vibe. Live.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-[fadeIn_0.8s_ease-out]">
            Try Any Outfit
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Without Changing Clothes.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-xl mb-10 leading-relaxed animate-[fadeIn_1s_ease-out]">
            Step in front of your camera, choose an outfit, and see it on you in real time.
            No photos to upload. No waiting. Just live.
          </p>

          <button
            onClick={onStart}
            className="group relative flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-base hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-[0.98] shadow-xl shadow-cyan-500/20 animate-[fadeIn_1.2s_ease-out] overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Camera className="w-5 h-5" />
            Start Virtual Try-On
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={scrollToHow}
            className="mt-12 text-white/30 hover:text-white/60 transition-colors animate-bounce"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howRef} className="py-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/70 font-medium mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Three steps. Real-time magic.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Camera, title: 'Step in front of the camera', desc: 'Your webcam turns on. Your body is tracked in real time — no photo uploads needed.' },
            { icon: Shirt, title: 'Upload any shirt', desc: 'Grab a photo of any garment from your computer. We isolate it and prepare it for fitting.' },
            { icon: Eye, title: 'See it on you, live', desc: 'The garment appears on your body and follows your movements as you pose, turn, and move.' },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="group relative rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/8 p-8 hover:border-cyan-400/20 transition-all"
              >
                <div className="absolute top-6 right-6 text-5xl font-bold text-white/5 group-hover:text-cyan-400/10 transition-colors">
                  0{i + 1}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/20 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-8 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/70 font-medium mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built like a fitting room, not an app.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Scan, title: 'Real-time body tracking', desc: 'MediaPipe pose landmarks track your shoulders, torso, and arms frame by frame.' },
              { icon: Zap, title: 'Deformable garment mesh', desc: 'Shirts are mapped onto a mesh that bends and scales with your body — not a flat sticker.' },
              { icon: Eye, title: 'Live occlusion', desc: 'Person segmentation lets your arms appear in front of the virtual garment.' },
              { icon: Shield, title: 'Privacy-first', desc: 'Your camera feed is processed locally in your browser. No continuous uploads.' },
              { icon: Shirt, title: 'Any shirt you own', desc: 'Upload a photo of any garment — no predefined database required.' },
              { icon: Smartphone, title: 'Works on any device', desc: 'Desktop, laptop, or mobile. Responsive from phone to widescreen.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-white/5 border border-white/8 p-6 hover:bg-white/8 hover:border-white/15 transition-all"
                >
                  <Icon className="w-6 h-6 text-cyan-400 mb-4" />
                  <h3 className="font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Virtual Try-On showcase */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/70 font-medium mb-3">Live Virtual Try-On</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">The camera never stops being live.</h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              This is not a photo generator. There is no waiting for a result. The garment appears on your body
              in real time and follows every movement.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-400/15 p-8">
              <Monitor className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Live webcam + tracking</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Your webcam stays on. Body landmarks are detected and smoothed every frame.
                The garment is rendered on a transparent overlay.
              </p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-teal-500/10 to-cyan-600/5 border border-teal-400/15 p-8">
              <Sparkles className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mesh deformation</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                The uploaded shirt is split into a deformable mesh controlled by your shoulders and torso.
                It scales, rotates, and follows you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-24 px-4 sm:px-8 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-400/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Privacy by design</h2>
          <p className="text-white/50 leading-relaxed max-w-xl mx-auto">
            Your camera feed is processed locally in your browser whenever possible.
            We do not upload continuous webcam footage. We do not store video.
            The only image saved is a snapshot you explicitly choose to download.
          </p>
        </div>
      </section>

      {/* Supported Clothing */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/70 font-medium mb-3">Supported Clothing</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">If you can photograph it, you can try it.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Formal', 'Casual'].map((cat) => (
              <span
                key={cat}
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 backdrop-blur-sm hover:border-cyan-400/20 hover:text-white/90 transition-all"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/70 font-medium mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Questions</h2>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { q: 'Do I need to upload a photo of myself?', a: 'No. VibeCheck uses your live webcam. There are no static photos to upload — the try-on happens in real time.' },
              { q: 'Can I use any shirt image?', a: 'Yes. Upload any PNG, JPG, or WEBP of a garment — whether it is on a bed, hanging, or from an online store. The app isolates the garment automatically.' },
              { q: 'Is my webcam footage sent to a server?', a: 'No. Body tracking and segmentation run locally in your browser. The only thing that leaves your device is a snapshot you choose to download.' },
              { q: 'Does it work on mobile?', a: 'Yes. The interface adapts to any screen size. On mobile, the camera is on top with controls below.' },
              { q: 'What if background removal fails?', a: 'You can use the image as-is and adjust the fit manually with the size, position, and rotation controls.' },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white/5 border border-white/8 p-5 hover:border-white/12 transition-all"
              >
                <summary className="cursor-pointer flex items-center justify-between text-sm font-medium text-white/80 list-none">
                  {item.q}
                  <ChevronDown className="w-4 h-4 text-white/40 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-white/45 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
            Ready to <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">try the vibe?</span>
          </h2>
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-base hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-[0.98] shadow-xl shadow-cyan-500/20 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Camera className="w-5 h-5" />
            Start Virtual Try-On
          </button>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <p className="text-xs text-white/30">VibeCheck — Try the vibe. Live.</p>
      </footer>
    </div>
  );
}

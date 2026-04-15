import { Link } from "react-router-dom";
import { MapPin, BarChart3, Recycle, Leaf, Globe, Mail, MessageCircle } from "lucide-react";
import reportWasteImg from "../assets/images/reportwaste.jpg";
import trackImg from "../assets/images/trackit.jpg";
import recycleImg from "../assets/images/recycling.jpg";
import communityImg from "../assets/images/cleanercommunity.jpg";
import heroBg from "../assets/images/homepage.jpg";

const features = [
  {
    title: "Report Waste",
    description: "Submit waste reports using photos and location.",
    icon: MapPin,
    image: reportWasteImg,
  },
  {
    title: "Track It",
    description: "Monitor the progress of your reported waste in real-time.",
    icon: BarChart3,
    image: trackImg,
  },
  {
    title: "Recycling",
    description: "Waste is directed to recyclers for proper processing.",
    icon: Recycle,
    image: recycleImg,
  },
  {
    title: "Cleaner Community",
    description: "Cleaner environments through efficient waste management.",
    icon: Leaf,
    image: communityImg,
  },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#features" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { label: "Website", href: "https://ecotrack.app", icon: Globe },
  { label: "Email", href: "mailto:hello@ecotrack.app", icon: Mail },
  { label: "Community", href: "https://community.ecotrack.app", icon: MessageCircle },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative min-h-screen">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Clean city with greenery"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-emerald-900/40 to-black/70" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          <nav className="absolute inset-x-0 top-0 z-20 bg-black/30 backdrop-blur-md text-white">
            <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
              <div className="text-2xl font-semibold tracking-tight">EcoTrack</div>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                <a href="/" className="hover:text-emerald-200 transition">
                  Home
                </a>
                <a href="#features" className="hover:text-emerald-200 transition">
                  How It Works
                </a>
                <a href="#contact" className="hover:text-emerald-200 transition">
                  Contact
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full border border-white text-white hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition"
                >
                  Register
                </Link>
              </div>
            </div>
          </nav>

          <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20 text-center">
            <div className="max-w-3xl text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/90">
                Citizen-powered cleanup
              </p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                Report Waste in Seconds. Track It Until It&apos;s Cleaned.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/85">
                EcoTrack connects citizens, recyclers, and authorities to solve
                waste problems faster and smarter.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-emerald-500 text-white text-base font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/report-issue"
                  className="w-full sm:w-auto px-7 py-3 rounded-full border border-white/70 text-white text-base font-semibold hover:bg-white hover:text-slate-900 transition"
                >
                  Report Waste
                </Link>
              </div>
            </div>
          </div>

          <div className="pointer-events-none h-16 bg-gradient-to-b from-transparent to-gray-50" />
        </div>
      </section>

      <section
        id="features"
        className="bg-gray-50 py-20 px-6 md:px-12 lg:px-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
              How It Works
            </h2>
            <p className="mt-4 text-slate-600">
              Everything you need to report, track, and resolve waste issues in
              your community.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Icon size={18} />
                    <h3 className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t bg-gradient-to-b from-gray-100 to-white">
        <div className="px-6 md:px-12 lg:px-20 py-12 grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-semibold">EcoTrack</h3>
            <p className="mt-3 text-sm text-slate-600">
              Citizen-powered waste reporting &amp; recycling platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700">Quick Links</h4>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-emerald-600 transition"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700">Social</h4>
            <div className="mt-4 flex items-center gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t px-6 md:px-12 lg:px-20 py-4 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© 2026 EcoTrack. All rights reserved.</span>
          <span>Built for cleaner communities.</span>
        </div>
      </footer>
    </div>
  );
}
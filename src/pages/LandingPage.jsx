import { Link } from "react-router-dom";
import { MapPin, BarChart3, Recycle, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-green-600">EcoTrack</h1>

        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-green-500 text-green-600 hover:bg-green-50 transition"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* HERO + CARD WRAPPER */}
      <section className="relative">

        {/* Background */}
        <div
          className="absolute inset-0 h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6')",
          }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* HERO CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 h-[75vh] flex items-center justify-center text-center text-white px-4"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Report Waste in Seconds. <br />
              Track It Until It’s Cleaned.
            </h2>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
              EcoTrack connects citizens, recyclers, and authorities to solve waste problems faster and smarter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-green-600 transition"
                >
                  Get Started
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/report-issue"
                  className="px-6 py-3 border border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-black transition"
                >
                  Report Waste
                </Link>
              </motion.div>

            </div>
          </div>
        </motion.div>

        {/* CARD SECTION */}
        <div className="relative z-10 px-8 pb-20 -mt-20 max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-center mb-16 text-white">
            Why Use EcoTrack?
          </h3>

          <div className="grid md:grid-cols-2 gap-14">

            {[ 
              { icon: <MapPin size={32} />, title: "Report Waste", desc: "Quickly report waste in your area using GPS and images." },
              { icon: <BarChart3 size={32} />, title: "Smart Tracking", desc: "Track reported waste and monitor resolution progress." },
              { icon: <Recycle size={32} />, title: "Recycler Network", desc: "Connect waste to recyclers for proper processing." },
              { icon: <Globe size={32} />, title: "Cleaner Communities", desc: "Build a cleaner and healthier environment together." }
            ].map((card, index) => (
              
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition ${
                  index === 1 ? "md:translate-y-12" :
                  index === 2 ? "md:-translate-y-12" : ""
                }`}
              >
                <div className="text-green-500 mb-4">{card.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{card.title}</h4>
                <p className="text-gray-700">{card.desc}</p>
              </motion.div>

            ))}

          </div>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t px-8 py-6 text-center text-sm text-gray-600">
        <p>Contact: muhiamaina131@gmail.com | 0718415267</p>
        <p className="mt-2">EcoTrack © 2026</p>
      </footer>
    </div>
  );
}
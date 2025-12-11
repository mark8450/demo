'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight, Users, GraduationCap, UserCheck, Shield, Zap, Activity } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import App from '@/components/App'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)
  const { user, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-700"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-cyan-500 border-r-transparent border-b-transparent border-l-transparent absolute top-0"></div>
        </div>
      </div>
    )
  }

  // Show app if user is logged in
  if (user) {
    return <App />
  }

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative">
      {/* Navigation Bar */}
      <header className="relative z-50">
        <nav className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-semibold text-white">ClassConnect Pro</span>
            </div>
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 rounded-full px-6"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section with Dark Mode Aesthetic */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="block animate-title-glow">
                Welcome to
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-shift">
                ClassConnect Pro
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Connect. Learn. Grow. Experience the future of education.
            </p>
          </div>

          {/* Interactive Network Visualization */}
          <div className="relative mx-auto max-w-4xl h-[500px] mb-16">
            {/* Central Hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40 animate-hub-pulse">
                <div className="w-16 h-16 bg-slate-900/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Zap className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-xl animate-hub-glow"></div>
            </div>

            {/* Teacher Node */}
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
              <div className="group relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-slate-800/80 border border-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 animate-node-float" style={{ animationDelay: '0s' }}>
                  <GraduationCap className="w-8 h-8 text-blue-400" />
                </div>
                <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg animate-node-glow"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Teacher</div>
              </div>
            </div>

            {/* Student Node */}
            <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
              <div className="group relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-slate-800/80 border border-emerald-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:border-emerald-400/60 transition-all duration-300 animate-node-float" style={{ animationDelay: '0.5s' }}>
                  <Users className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg animate-node-glow"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Student</div>
              </div>
            </div>

            {/* Parent Node */}
            <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2">
              <div className="group relative">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-slate-800/80 border border-cyan-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:border-cyan-400/60 transition-all duration-300 animate-node-float" style={{ animationDelay: '1s' }}>
                  <UserCheck className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-lg animate-node-glow"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Parent</div>
              </div>
            </div>

            {/* Admin Node */}
            <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
              <div className="group relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-slate-800/80 border border-purple-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:border-purple-400/60 transition-all duration-300 animate-node-float" style={{ animationDelay: '1.5s' }}>
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-lg animate-node-glow"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Admin</div>
              </div>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 500">
              {/* Hub to Teacher */}
              <line x1="200" y1="250" x2="100" y2="125" stroke="url(#gradient1)" strokeWidth="2" className="animate-connection-pulse" />
              {/* Hub to Student */}
              <line x1="200" y1="250" x2="300" y2="125" stroke="url(#gradient2)" strokeWidth="2" className="animate-connection-pulse" style={{ animationDelay: '0.3s' }} />
              {/* Hub to Parent */}
              <line x1="200" y1="250" x2="100" y2="375" stroke="url(#gradient3)" strokeWidth="2" className="animate-connection-pulse" style={{ animationDelay: '0.6s' }} />
              {/* Hub to Admin */}
              <line x1="200" y1="250" x2="300" y2="375" stroke="url(#gradient4)" strokeWidth="2" className="animate-connection-pulse" style={{ animationDelay: '0.9s' }} />
              
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating Particles */}
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-particle-float" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-particle-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-particle-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-particle-float" style={{ animationDelay: '3s' }}></div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white text-lg px-12 py-4 rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-500 transform hover:scale-105 backdrop-blur-sm border border-cyan-400/20"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-slate-400 text-sm mt-4">
              Join thousands of educators and students worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes title-glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(6, 182, 212, 0.5); 
          }
          50% { 
            text-shadow: 0 0 30px rgba(6, 182, 212, 0.8); 
          }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes hub-pulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.4); 
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 0 50px rgba(6, 182, 212, 0.6); 
          }
        }

        @keyframes hub-glow {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.1); 
          }
        }

        @keyframes node-float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-10px) rotate(2deg); 
          }
        }

        @keyframes node-glow {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.4; 
            transform: scale(1.05); 
          }
        }

        @keyframes connection-pulse {
          0% { 
            opacity: 0.3; 
            stroke-dasharray: 0 100; 
          }
          50% { 
            opacity: 1; 
            stroke-dasharray: 100 0; 
          }
          100% { 
            opacity: 0.3; 
            stroke-dasharray: 0 100; 
          }
        }

        @keyframes particle-float {
          0% { 
            opacity: 0; 
            transform: translateY(0px) scale(0); 
          }
          20% { 
            opacity: 1; 
            transform: translateY(-20px) scale(1); 
          }
          80% { 
            opacity: 1; 
            transform: translateY(-60px) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(-80px) scale(0); 
          }
        }

        .animate-title-glow {
          animation: title-glow 3s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease-in-out infinite;
        }

        .animate-hub-pulse {
          animation: hub-pulse 3s ease-in-out infinite;
        }

        .animate-hub-glow {
          animation: hub-glow 4s ease-in-out infinite;
        }

        .animate-node-float {
          animation: node-float 4s ease-in-out infinite;
        }

        .animate-node-glow {
          animation: node-glow 3s ease-in-out infinite;
        }

        .animate-connection-pulse {
          animation: connection-pulse 2s ease-in-out infinite;
        }

        .animate-particle-float {
          animation: particle-float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
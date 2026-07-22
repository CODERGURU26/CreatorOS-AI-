import React from "react";
import { Cpu, AlertCircle, ArrowRight, Instagram } from "lucide-react";

interface ConnectViewProps {
  errorType: string | null;
}

export default function ConnectView({ errorType }: ConnectViewProps) {
  const handleConnect = () => {
    window.location.href = "/api/auth/instagram/start";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative px-4 py-8 overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#7C3AED]/10 via-[#3B82F6]/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] flex items-center justify-center p-[1px] shadow-lg shadow-purple-500/15">
          <div className="w-full h-full bg-[#050505] rounded-[11px] flex items-center justify-center">
            <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          CreatorOS <span className="text-cyan-400 font-mono text-xs bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/10">AI</span>
        </h1>
        <p className="text-xs text-[#A1A1AA] max-w-sm">
          The autonomous campaign engine requires a connected Instagram Professional account to boot.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur-[2px] pointer-events-none" />
        
        <div className="bg-[#111111]/80 border border-white/8 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative space-y-6">
          <h2 className="text-lg font-bold text-white tracking-wide">Connect Your Account</h2>
          
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Link your Instagram Creator or Business account to launch your dashboard. We will pull analytics telemetry, scan niche trends, and schedule reels campaigns autonomously.
          </p>

          {errorType && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-400 block">
                  {errorType === "not_professional" ? "Professional Account Required" : "Authentication Failed"}
                </span>
                <p className="text-[11px] text-[#D4D4D8] leading-relaxed">
                  {errorType === "not_professional" ? (
                    <>
                      The selected Instagram account is a Personal account. CreatorOS requires a <strong>Creator</strong> or <strong>Business</strong> profile to access insights. Update your account settings in the{" "}
                      <a
                        href="https://www.instagram.com/accounts/edit/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-rose-300 hover:text-rose-200"
                      >
                        Instagram App settings
                      </a>{" "}
                      first, then try connecting again.
                    </>
                  ) : (
                    "Meta rejected the authorization request or the connection timed out. Please try again."
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleConnect}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 active:scale-[0.98] transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Connect Instagram Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center font-mono text-[9px] text-[#71717A]">
            SECURE META OAUTH 2.0 • SHA-256 ENCRYPTION
          </div>
        </div>
      </div>
    </div>
  );
}

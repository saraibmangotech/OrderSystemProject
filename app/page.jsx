"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { requestNotificationPermission } from "../helpers";


export default function WelcomePage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleStartScanning = async () => {
    setIsLoading(true)
    setErrorMsg("")

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Camera access requires a secure context (HTTPS) or is not supported by your browser.")
      setIsLoading(false)
      return
    }

    try {
      // Request permission first
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      stream.getTracks().forEach((track) => track.stop())
      setIsScanning(true)
    } catch (err) {
      setErrorMsg("Camera permission denied. Please enable it in settings.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let html5QrCode = null

    if (isScanning) {
      html5QrCode = new Html5Qrcode("reader")
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }

      html5QrCode
        .start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            localStorage.setItem("tableNumber", decodedText)
            html5QrCode.stop().then(() => {
              router.push("/menu")
            })
          },
          (errorMessage) => {
            // Scanning in progress...
          },
        )
        .catch((err) => {
          console.error("[v0] Scanner Error:", err)
          setErrorMsg("Failed to start scanner. Please try again.")
        })
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((e) => console.log("[v0] Stop Error:", e))
      }
    }
  }, [isScanning, router])
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  return (
    <div className="page min-h-screen bg-white flex flex-col items-center justify-center p-6 safe-area-inset relative overflow-hidden font-poppins">
      {isScanning && (
        <div className="overlay-fade fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-6 z-10">
            <h2 className="text-white font-semibold">Scan Table QR</h2>
            <button
              onClick={() => setIsScanning(false)}
              className="btn text-white p-2 bg-white/10 rounded-full backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative p-6">
            <div
              id="reader"
              className="card w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-2 border-orange-400 bg-gray-900 shadow-2xl"
            />

            {errorMsg && (
              <div className="reveal is-visible mt-8 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-sm text-center max-w-xs">
                {errorMsg}
              </div>
            )}

            <p className="text-white mt-12 text-center text-lg font-medium opacity-80">
              Align QR code within the orange frame
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="reveal mb-12">
        <div className="card w-56 h-56 rounded-full bg-orange-50 flex items-center justify-center relative">
          <div className="text-[140px] leading-none select-none">🍋</div>
          <div className="absolute -top-2 -right-2 bg-orange-400 p-2 rounded-xl shadow-lg animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="reveal delay-1 text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome to DineQuick!</h1>
        <p className="text-gray-500 max-w-[280px] mx-auto text-lg leading-relaxed">
          Scan the QR code on your table to browse the menu and order.
        </p>
      </div>

      <button
        onClick={handleStartScanning}
        disabled={isLoading}
        className="btn reveal delay-2 w-full max-w-sm bg-orange-400 active:bg-orange-500 hover:bg-orange-400/90 text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-orange-200 disabled:opacity-70"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <span className="text-lg">Scan to Order</span>
          </>
        )}
      </button>

      {/* Footer Details */}
      {/* <div className="mt-auto pb-8 text-center">
        <p className="text-green-500 font-bold text-lg mb-2">Enjoy a 3-Month Free Trial on us!</p>
        <p className="text-gray-400 text-sm">
          Restaurant Owner?{" "}
          <span className="text-green-500 font-semibold underline underline-offset-4">POS Integration</span> Available!
        </p>
      </div> */}
    </div>
  )
}

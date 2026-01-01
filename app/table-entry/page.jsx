"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TableEntryPage() {
  const [tableNumber, setTableNumber] = useState("")
  const router = useRouter()

  const handleNumberClick = (num) => {
    setTableNumber((prev) => prev + num)
  }

  const handleClear = () => {
    setTableNumber("")
  }

  const handleSubmit = () => {
    if (tableNumber) {
      localStorage.setItem("tableNumber", tableNumber)
      router.push("/menu")
    }
  }

  return (
    <div className="page min-h-screen bg-white p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Table Number</h1>
      </div>

      {/* Instructions */}
      <p className="text-gray-600 text-center mb-6 text-sm">Enter your table number manually below</p>

      {/* Display */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-center min-h-[80px] flex items-center justify-center">
        <span className="text-4xl font-bold text-orange-400">{tableNumber || "|"}</span>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="bg-gray-100 hover:bg-gray-200 rounded-2xl py-6 text-2xl font-semibold text-gray-700 transition-colors"
          >
            {num}
          </button>
        ))}
        <div></div>
        <button
          onClick={() => handleNumberClick("0")}
          className="bg-gray-100 hover:bg-gray-200 rounded-2xl py-6 text-2xl font-semibold text-gray-700 transition-colors"
        >
          0
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-100 hover:bg-gray-200 rounded-2xl py-6 flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!tableNumber}
        className="btn w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl mb-4 transition-colors"
      >
        Submit
      </button>

      {/* Scan QR Option */}
      <button className="w-full text-orange-400 font-semibold hover:text-orange-500 transition-colors">
        Scan QR Instead
      </button>

      {/* Promotional Text */}
      <p className="text-center text-sm text-gray-500 mt-8">3-Month Free Trial for new restaurants!</p>
    </div>
  )
}

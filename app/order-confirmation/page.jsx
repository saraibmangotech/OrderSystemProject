"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState(null)
  const [currentStatus, setCurrentStatus] = useState("preparing")
  const router = useRouter()

  useEffect(() => {
    const savedOrder = localStorage.getItem("currentOrder")
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder))
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    // Simulate order status progression
    const statuses = ["preparing", "cooking", "ready", "delivered"]
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < statuses.length - 1) {
        currentIndex++
        setCurrentStatus(statuses[currentIndex])
      } else {
        clearInterval(interval)
      }
    }, 5000) // Change status every 5 seconds for demo

    return () => clearInterval(interval)
  }, [])

  const handleReorder = () => {
    if (order) {
      localStorage.setItem("cart", JSON.stringify(order.items))
      router.push("/cart")
    }
  }

  const handleViewReceipt = () => {
    alert("Receipt feature coming soon!")
  }

  if (!order) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>
  }

  const statuses = [
    { name: "Preparing", key: "preparing", icon: "⏱️" },
    { name: "Cooking", key: "cooking", icon: "👨‍🍳" },
    { name: "Ready", key: "ready", icon: "✓" },
    { name: "Delivered", key: "delivered", icon: "🚚" },
  ]

  const currentStatusIndex = statuses.findIndex((s) => s.key === currentStatus)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      {/* Chef Illustration */}
    

        <CookingAnimation />
        {/* Tic Tac Toe Game */}
      {/* Confirmation Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-balance">Order Confirmed!</h1>

      {/* Order Number */}
      <p className="text-sm text-gray-600 mb-8">
        Order <span className="font-semibold">#{order.id}</span>
      </p>

      {/* Cooking GIF & Tic Tac Toe */}
      <div className="w-full mb-8 flex flex-col items-center">
        <h2 className="text-sm font-semibold text-center mb-4 text-gray-700">While You Wait...</h2>

      
        <TicTacToe />
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3">
        {/* <button
          onClick={handleReorder}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reorder
        </button> */}

        {/* <button
          onClick={handleViewReceipt}
          className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          View Receipt
        </button> */}
      </div>

      {/* Back to Menu */}
      {/* <button onClick={() => router.push("/menu")} className="mt-6 text-gray-500 hover:text-gray-700 transition-colors">
        Back to Menu
      </button> */}
    </div>
  )
}
// CookingAnimation Component
function CookingAnimation() {
  const frames = ["👨‍🍳", "🍳", "🔥", "🍔"] // animation frames
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length)
    }, 500) // change every 0.5 sec
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-48 h-48 flex items-center justify-center text-6xl rounded-2xl bg-orange-50 mb-10">
      {frames[currentFrame]}
    </div>
  )
}

// Tic Tac Toe Component
function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)

  const winner = calculateWinner(board)

  const handleClick = (i) => {
    if (board[i] || winner) return
    const newBoard = board.slice()
    newBoard[i] = xIsNext ? "🍔" : "🥗" // use restaurant themed emojis
    setBoard(newBoard)
    setXIsNext(!xIsNext)
  }

  const renderSquare = (i) => (
    <button
      onClick={() => handleClick(i)}
      className={`w-14 h-14 md:w-16 md:h-16 border-2 border-orange-300 flex items-center justify-center text-2xl font-bold rounded-lg
        ${!board[i] ? "bg-orange-50 hover:bg-orange-100" : "bg-orange-200"} transition-colors`}
    >
      {board[i]}
    </button>
  )

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 gap-2">{board.map((_, i) => renderSquare(i))}</div>
      <div className="mt-2 text-sm text-gray-600 font-medium">
        {winner ? `Winner: ${winner}` : `Next: ${xIsNext ? "🍔" : "🥗"}`}
      </div>
      <button
        onClick={resetGame}
        className="mt-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all"
      >
        Reset
      </button>
    </div>
  )
}

// Helper function
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let line of lines) {
    const [a, b, c] = line
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}


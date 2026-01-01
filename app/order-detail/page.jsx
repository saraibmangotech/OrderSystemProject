"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import moment from "moment"
import Colors from "../assets/colors"


const getRemainingTime = (order) => {
  if (!order?.timestamp || !order?.estimate_time) return "00:00"

  const placedAt = moment(order.timestamp)
  const estimateMinutes = parseInt(order.estimate_time)
  const readyAt = placedAt.clone().add(estimateMinutes, "minutes")

  const diffMs = readyAt.diff(moment())
  if (diffMs <= 0) return "Ready"

  const duration = moment.duration(diffMs)
  const minutes = String(Math.floor(duration.asMinutes())).padStart(2, "0")
  const seconds = String(duration.seconds()).padStart(2, "0")

  return `${minutes}:${seconds}`
}

function OrderDetailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState(null)
  const [remainingTime, setRemainingTime] = useState("")

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders")) || []
    const found = orders.find((o) => o.id === orderId)
    setOrder(found)
  }, [orderId])

  useEffect(() => {
    if (!order) return

    const update = () => {
      setRemainingTime(getRemainingTime(order))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [order])

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-5 shadow animate-pulse space-y-3">
      <div className="h-5 bg-gray-300 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className={`h-10 rounded-xl mt-3`} style={{ backgroundColor: `${Colors.brown}30` }}></div>
      <div className="flex flex-wrap gap-2 mt-3">
        {Array(3).fill(0).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full"
            style={{ backgroundColor: `${Colors.brown}30` }}
          ></div>
        ))}
      </div>
      <div className="h-5 bg-gray-200 rounded w-2/3 mt-3"></div>
      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
    </div>
  )

  return (
    <div className="page min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="btn w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-95 transition"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-800">Order Details</h1>
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 space-y-5 mt-4">
        {!order ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl p-5 shadow">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold" style={{ color: Colors.brown }}>
                  Order #{order.id}
                </span>
                <span
                  className="px-3 py-1 text-xs font-bold uppercase rounded-full"
                  style={{ backgroundColor: `${Colors.brown}30`, color: Colors.brown }}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                Placed at{" "}
                {new Date(order.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="text-center rounded-xl py-4" style={{ backgroundColor: `${Colors.brown}10` }}>
                <p className="text-xs text-gray-500">Estimated Time</p>
                <p className="text-2xl font-bold mt-1" style={{ color: Colors.brown }}>
                  {remainingTime === "Ready" ? "Ready 🍽️" : remainingTime}
                </p>
              </div>
            </div>

            {/* Items */}
          {/* Items */}
<div className="bg-white rounded-2xl p-5 shadow">
  <h3 className="font-bold mb-3">Items</h3>
  <div className="space-y-3">
    {order.items.map((item, idx) => (
      <div key={idx} className="bg-gray-50 rounded-xl p-3">
        <div
          className="px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 mb-2"
          style={{ backgroundColor: `${Colors.brown}30`, color: Colors.brown }}
        >
          <span>{item.quantity}×</span>
          <span>{item.name}</span>
          <span className="font-bold ml-1" style={{ color: Colors.brown }}>
            ${((item.base_price || item.price) * item.quantity).toFixed(2)}
          </span>
        </div>

        {/* Selected Addons */}
        {item.selectedAddons && item.selectedAddons.length > 0 && (
          <div className="ml-4 space-y-1">
            {item.selectedAddons.map((addon) => (
              <div
                key={addon._id}
                className="px-2 py-1 rounded-full text-[10px] flex items-center gap-1"
                style={{ backgroundColor: `${Colors.brown}10`, color: Colors.brown }}
              >
                <span>+{addon.name}</span>
                <span className="font-bold ml-1">${addon.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
</div>


            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-5 shadow space-y-2">
              <h3 className="font-bold mb-2">Payment Summary</h3>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Info */}
            {(order.customerName || order.customerPhone) && (
              <div className="bg-white rounded-2xl p-5 shadow">
                <h3 className="font-bold mb-2">Customer</h3>
                {order.customerName && (
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                )}
                {order.customerPhone && (
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Wrap the inner component in Suspense
export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderDetailInner />
    </Suspense>
  )
}

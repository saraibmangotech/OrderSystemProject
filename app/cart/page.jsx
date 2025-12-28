"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const [cart, setCart] = useState([])
  const [tableNumber, setTableNumber] = useState("")
  const [tipPercentage, setTipPercentage] = useState(0)
  const [customTip, setCustomTip] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const router = useRouter()

  useEffect(() => {
    const table = localStorage.getItem("tableNumber")
    setTableNumber(table || "")

    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(savedCart)
  }, [])

  const updateQuantity = (index, delta) => {
    const newCart = [...cart]
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta)
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.customPrice || item.price
      return total + itemPrice * item.quantity
    }, 0)
  }

  const calculateTip = () => {
    if (customTip) return Number.parseFloat(customTip)
    return calculateSubtotal() * (tipPercentage / 100)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const deliveryFee = 0
    const tip = calculateTip()
    return subtotal + deliveryFee + tip
  }

  const handlePlaceOrder = () => {
    const order = {
      id: `DQ-${Date.now()}`,
      tableNumber,
      items: cart,
      subtotal: calculateSubtotal(),
      deliveryFee: 0,
      tip: calculateTip(),
      total: calculateTotal(),
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: "preparing",
    }

    localStorage.setItem("currentOrder", JSON.stringify(order))
    localStorage.setItem("cart", JSON.stringify([]))

    router.push("/order-confirmation")
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white p-5 border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="mr-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Your Order</h1>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl">
          <p className="text-sm text-orange-600 font-medium leading-relaxed">
            WristWizards Integration with your restaurant's systems saves time & reduces errors.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Table Number */}
        <div>
          <h2 className="text-sm font-semibold mb-2 text-gray-700">Table Number</h2>
          <div className="text-3xl font-bold text-orange-400">{tableNumber}</div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Your Items</h2>
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {item.size && `${item.size}, `}
                    {item.spiceLevel && `${item.spiceLevel}`}
                  </p>
                  <p className="text-orange-400 font-bold text-base">
                    {((item.customPrice || item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center ">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all font-semibold text-gray-700"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all font-semibold text-gray-700"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="ml-1 text-red-500 hover:text-red-600 w-9 h-9 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add a Tip */}
        <div>
          {/* <h2 className="text-sm font-semibold mb-3 text-gray-700">Add a Tip</h2>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => {
                setTipPercentage(15)
                setCustomTip("")
              }}
              className={`flex-1 py-4 rounded-xl font-semibold transition-all active:scale-95 ${
                tipPercentage === 15 && !customTip
                  ? "bg-orange-400 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              15%
            </button>
            <button
              onClick={() => {
                setTipPercentage(20)
                setCustomTip("")
              }}
              className={`flex-1 py-4 rounded-xl font-semibold transition-all active:scale-95 ${
                tipPercentage === 20 && !customTip
                  ? "bg-orange-400 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              20%
            </button>
            <button
              onClick={() => {
                setTipPercentage(25)
                setCustomTip("")
              }}
              className={`flex-1 py-4 rounded-xl font-semibold transition-all active:scale-95 ${
                tipPercentage === 25 && !customTip
                  ? "bg-orange-400 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              25%
            </button>
          </div>
          <input
            type="number"
            placeholder="Enter custom amount"
            value={customTip}
            onChange={(e) => {
              setCustomTip(e.target.value)
              setTipPercentage(0)
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base"
          /> */}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4 text-gray-800 text-base">Order Summary</h2>
          <div className="space-y-3 text-base">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{calculateSubtotal().toFixed(2)}</span>
            </div>
            {/* <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-medium">$2.00</span>
            </div> */}
            {/* <div className="flex justify-between text-gray-600">
              <span>Tip</span>
              <span className="font-medium">${calculateTip().toFixed(2)}</span>
            </div> */}
            <div className="border-t-2 pt-3 flex justify-between font-bold text-orange-400 text-lg">
              <span>Total</span>
              <span>{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        {/* <div>
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Payment Method</h2>
          <div className="space-y-3">
            <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl active:scale-98 transition-transform">
              <input
                type="radio"
                name="payment"
                value="apple-pay"
                checked={paymentMethod === "apple-pay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-orange-400"
              />
              <span className="ml-4 text-gray-700 font-medium">Apple Pay</span>
            </label>
            <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl active:scale-98 transition-transform">
              <input
                type="radio"
                name="payment"
                value="google-pay"
                checked={paymentMethod === "google-pay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-orange-400"
              />
              <span className="ml-4 text-gray-700 font-medium">Google Pay</span>
            </label>
            <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl active:scale-98 transition-transform">
              <input
                type="radio"
                name="payment"
                value="credit-card"
                checked={paymentMethod === "credit-card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-orange-400"
              />
              <span className="ml-4 text-gray-700 font-medium">Credit/Debit Card</span>
            </label>
          </div>
        </div> */}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t shadow-2xl z-10 pb-safe">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0}
            className="w-full bg-orange-400 active:bg-orange-500 disabled:bg-gray-300 text-white font-bold py-5 rounded-2xl transition-all active:scale-98 shadow-lg disabled:shadow-none text-lg"
          >
            Place Order - {calculateTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}

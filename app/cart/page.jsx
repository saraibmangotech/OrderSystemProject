"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Colors from "../assets/colors"


export default function CartPage() {
  const [Restaurant, setRestaurant] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem("restaurantData")
    if (data) {
      setRestaurant(JSON.parse(data))
    }
  }, [])
  const [specialInstruction, setSpecialInstruction] = useState("");

  const [cart, setCart] = useState([])
  const [expandedItems, setExpandedItems] = useState({})
  const [tableNumber, setTableNumber] = useState("")
  const [tipPercentage, setTipPercentage] = useState(0)
  const [customTip, setCustomTip] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [loading, setLoading] = useState(true)
  const [showUserPopup, setShowUserPopup] = useState(false)
  const [userName, setUserName] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      const table = localStorage.getItem("tableNumber")
      setTableNumber(table || "")

      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCart(savedCart)
      setLoading(false)
    }, 800)
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

  const toggleAddon = (itemIndex, addonId, groupId) => {
    const newCart = [...cart]
    const item = newCart[itemIndex]

    const selectedAddonIndex = item.selectedAddons.findIndex((addon) => addon._id === addonId)

    if (selectedAddonIndex >= 0) {
      item.selectedAddons.splice(selectedAddonIndex, 1)
    } else {
      const addonGroup = item.addons.find((group) => group._id === groupId)
      if (addonGroup) {
        const addonDetails = addonGroup.addons.find((addon) => addon._id === addonId)
        if (addonDetails) {
          item.selectedAddons.push({
            ...addonDetails,
            groupName: addonGroup.name,
            selectionType: addonGroup.selection_type,
            maxSelection: addonGroup.max_selection,
            minSelection: addonGroup.min_selection,
            groupId: addonGroup._id,
          })
        }
      }
    }

    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const basePrice = item.customPrice || item.price
      const addonsPrice = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0
      return total + (basePrice + addonsPrice) * item.quantity
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

  const confirmOrder = () => {
    if (!showUserPopup) {
      setShowUserPopup(true)
      return
    }
    console.log(cart, 'cart')
    const maxPrepTime = Math.max(
      ...cart.map(item => item.prep_time_minutes ?? 0)
    );

    console.log("Max prep time:", maxPrepTime);

    const order = {
      id: `DQ-${Date.now()}`,
      tableNumber,
      customerName: userName || null,
      customerPhone: userPhone || null,
      items: cart,
      subtotal: calculateSubtotal(),
      tip: calculateTip(),
      estimate_time: maxPrepTime,
      total: calculateTotal(),
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: "preparing",
      orderSpecialInstruction: specialInstruction
    }

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || []

    localStorage.setItem("currentOrder", JSON.stringify(order))
    localStorage.setItem("cart", JSON.stringify([]))
    existingOrders.push(order)
    localStorage.setItem("orders", JSON.stringify(existingOrders))
    router.push("/order-confirmation")
  }

  const toggleItemExpand = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const isAddonSelected = (itemIndex, addonId) => {
    return cart[itemIndex]?.selectedAddons?.some((addon) => addon._id === addonId) || false
  }

  return (
    <div className="page min-h-screen bg-gray-50 pb-32 relative">
      {/* Header */}
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
        <div className="p-4 rounded-xl" style={{ backgroundColor: `${Colors[`${Restaurant?.restaurant?.theme}`]}20` }}>
          <p className="text-sm font-medium leading-relaxed" style={{ color: Colors[`${Restaurant?.restaurant?.theme}`] }}>
            WristWizards Integration with your restaurant's systems saves time & reduces errors.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Table Number */}
        <div>
          <h2 className="text-sm font-semibold mb-2 text-gray-700">Table Number</h2>
          <div className="text-3xl font-bold" style={{ color: Colors[`${Restaurant?.restaurant?.theme}`] }}>{tableNumber}</div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Your Items</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse" />
                    <div className="h-5 w-1/4 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-8 h-4 rounded bg-gray-200 animate-pulse" />
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-9 h-9 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, itemIndex) => (
                <div key={itemIndex}>
                  {/* Item Card */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item?.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.size && `${item.size}, `}
                          {item.spiceLevel && `${item.spiceLevel}`}
                        </p>
                        <p className="font-bold text-base" style={{ color: Colors[`${Restaurant?.restaurant?.theme}`] }}>
                          {Restaurant?.restaurant?.currency}  {(
                            ((item.customPrice || item.price) +
                              (item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0)) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantity(itemIndex, -1)}
                          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all font-semibold text-gray-700"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(itemIndex, 1)}
                          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all font-semibold text-gray-700"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(itemIndex)}
                          className="ml-1 text-red-500 hover:text-red-600 w-9 h-9 flex items-center justify-center active:scale-95 transition-all"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {item.addons && item.addons.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => toggleItemExpand(itemIndex)}
                          className="flex items-center justify-between w-full text-sm font-semibold transition-colors"
                          style={{ color: Colors[`${Restaurant?.restaurant?.theme}`] }}
                        >
                          <span>Customize ({item.selectedAddons?.length || 0} selected)</span>
                          <svg
                            className={`w-5 h-5 transition-transform ${expandedItems[itemIndex] ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </button>

                        {/* Expanded Addons List */}
                        {expandedItems[itemIndex] && (
                          <div className="mt-4 space-y-4">
                            {item.addons.map((group) => (
                              <div key={group._id} className="bg-gray-50 p-4 rounded-xl">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                  {group.name}
                                  {group.required && <span className="text-red-500 ml-1">*</span>}
                                </h4>

                                <p className="text-xs text-gray-500 mb-3">
                                  Select {group.min_selection}
                                  {group.max_selection > group.min_selection
                                    ? `-${group.max_selection}`
                                    : ""}
                                </p>

                                <div className="space-y-2">
                                  {group.addons.map((addon) => {
                                    const isSelected = isAddonSelected(itemIndex, addon._id)

                                    const selectedCount = item?.selectedAddons?.filter(
                                      (a) => a.groupId === group._id
                                    ).length || 0


                                    const disableCheckbox =
                                      !isSelected && selectedCount >= group.max_selection

                                    return (
                                  <label
  key={addon._id}
  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2
    ${isSelected ? "" : "bg-gray-50 hover:bg-gray-100"}
    ${disableCheckbox ? "opacity-50 cursor-not-allowed" : ""}
  `}
  style={{
    borderColor: isSelected
      ? Colors[Restaurant?.restaurant?.theme]
      : "transparent",
    backgroundColor: isSelected
      ? `${Colors[Restaurant?.restaurant?.theme]}20`
      : undefined,
  }}
>
  <div className="relative flex items-center">
    {/* Hidden native checkbox (logic unchanged) */}
    <input
      type="checkbox"
      checked={isSelected}
      disabled={disableCheckbox}
      onChange={() =>
        toggleAddon(itemIndex, addon._id, group._id)
      }
      className="peer sr-only"
    />

    {/* Custom checkbox UI */}
    <div
      className={`h-5 w-5 flex items-center justify-center border-2 rounded-md transition-all
        ${disableCheckbox ? "opacity-50" : ""}
      `}
      style={{
        borderColor: isSelected
          ? Colors[Restaurant?.restaurant?.theme]
          : "#D1D5DB",
        backgroundColor: isSelected
          ? Colors[Restaurant?.restaurant?.theme]
          : "transparent",
      }}
    >
      {isSelected && (
        <svg
          className="w-3.5 h-3.5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>

    &nbsp;&nbsp;
    <span className="text-sm font-semibold text-gray-800">
      {addon.name}
    </span>
  </div>

  <span
    className="text-sm font-bold"
    style={{ color: Colors[Restaurant?.restaurant?.theme] }}
  >
    + {Restaurant?.restaurant?.currency} {addon.price.toFixed(2)}
  </span>
</label>

                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Special Instructions */}
        <div className=" pb-4">
          <label className="block text-xs font-bold text-black-400 uppercase tracking-wider mb-2">
            Special Instructions
          </label>

          <textarea
            value={specialInstruction}
            onChange={(e) => setSpecialInstruction(e.target.value)}
            placeholder="e.g. No onions, extra spicy, cut in halves..."
            rows={3}
            className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-all"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4 text-gray-800 text-base">Order Summary</h2>
          <div className="space-y-3 text-base">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="border-t-2 pt-3 flex justify-between font-bold text-lg" style={{ color: Colors[`${Restaurant?.restaurant?.theme}`] }}>
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t shadow-2xl z-10 pb-safe">
        <div className="max-w-md mx-auto">
          <button
            onClick={confirmOrder}
            disabled={cart.length === 0}
            className="w-full font-bold py-5 rounded-2xl transition-all active:scale-98 shadow-lg disabled:shadow-none text-lg"
            style={{
              backgroundColor: Colors[`${Restaurant?.restaurant?.theme}`],
              color: "white",
            }}
          >
            Place Order - ${calculateTotal().toFixed(2)}
          </button>
        </div>
      </div>

      {/* User Info Popup */}
      {showUserPopup && (
        <div className="overlay-fade fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Info (Optional)</h3>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none text-base"
              style={{ boxShadow: `0 0 0 2px ${Colors[`${Restaurant?.restaurant?.theme}`]}` }}
            />
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none text-base"
              style={{ boxShadow: `0 0 0 2px ${Colors[`${Restaurant?.restaurant?.theme}`]}` }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUserPopup(false)
                  confirmOrder()
                }}
                className="px-6 py-3 bg-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-300 transition-all"
              >
                Skip
              </button>
              <button
                onClick={confirmOrder}
                className="px-6 py-3 rounded-xl font-medium text-white transition-all"
                style={{ backgroundColor: Colors[`${Restaurant?.restaurant?.theme}`] }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

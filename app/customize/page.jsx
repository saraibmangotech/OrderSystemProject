"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const menuItems = [
  {
    id: 1,
    name: "Classic Cheeseburger",
    price: 12.99,
    image: "/classic-cheeseburger.png",
  },
  {
    id: 2,
    name: "Spicy Chicken Burger",
    price: 13.5,
    image: "/spicy-chicken-burger.png",
  },
  {
    id: 3,
    name: "French Fries",
    price: 4.99,
    image: "/crispy-french-fries.png",
  },
  {
    id: 4,
    name: "Coke",
    price: 2.5,
    image: "/refreshing-cola.png",
  },
]

const sizes = [
  { name: "Small", price: 0 },
  { name: "Medium", price: 1.5 },
  { name: "Large", price: 3.0 },
]

const spiceLevels = [
  { name: "Mild", price: 0 },
  { name: "Medium", price: 0.5 },
  { name: "Hot", price: 1.0 },
]

const addons = [
  { name: "Crispy Bacon", price: 2.5 },
  { name: "Fresh Avocado", price: 2.0 },
  { name: "Extra Cheddar", price: 1.0 },
  { name: "Side of Fries", price: 3.0 },
]

export default function CustomizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get("itemId")

  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedSize, setSelectedSize] = useState("Medium")
  const [selectedSpice, setSelectedSpice] = useState("Mild")
  const [selectedAddons, setSelectedAddons] = useState([])
  const [specialInstructions, setSpecialInstructions] = useState("")

  useEffect(() => {
    const item = menuItems.find((i) => i.id === Number.parseInt(itemId))
    if (item) {
      setSelectedItem(item)
    }
  }, [itemId])

  const toggleAddon = (addon) => {
    if (selectedAddons.includes(addon)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addon))
    } else {
      setSelectedAddons([...selectedAddons, addon])
    }
  }

  const calculateTotal = () => {
    if (!selectedItem) return 0

    let total = selectedItem.price

    const size = sizes.find((s) => s.name === selectedSize)
    if (size) total += size.price

    const spice = spiceLevels.find((s) => s.name === selectedSpice)
    if (spice) total += spice.price

    selectedAddons.forEach((addonName) => {
      const addon = addons.find((a) => a.name === addonName)
      if (addon) total += addon.price
    })

    return total
  }

  const handleAddToCart = () => {
    const cartItem = {
      ...selectedItem,
      size: selectedSize,
      spiceLevel: selectedSpice,
      addons: selectedAddons,
      specialInstructions,
      customPrice: calculateTotal(),
      quantity: 1,
    }

    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Add new item
    existingCart.push(cartItem)

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(existingCart))

    // Navigate to cart
    router.push("/cart")
  }

  if (!selectedItem) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="page min-h-screen bg-white pb-32 max-w-md mx-auto">
      {/* Header */}
      <div className="p-6 border-b">
        <button onClick={() => router.back()} className="mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="p-6">
        {/* Item Image */}
        <div className="w-full aspect-square bg-orange-50 rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
          <img
            src={selectedItem.image || "/placeholder.svg"}
            alt={selectedItem.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Item Name */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{selectedItem.name}</h1>

        {/* Size Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Size</h2>
          <div className="flex gap-3">
            {sizes.map((size) => (
              <button
                key={size.name}
                onClick={() => setSelectedSize(size.name)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedSize === size.name ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {size.name} {size.price > 0 && `(+$${size.price.toFixed(2)})`}
              </button>
            ))}
          </div>
        </div>

        {/* Spice Level */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Spice Level</h2>
          <div className="flex gap-3">
            {spiceLevels.map((spice) => (
              <button
                key={spice.name}
                onClick={() => setSelectedSpice(spice.name)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedSpice === spice.name ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {spice.name} {spice.price > 0 && `(+$${spice.price.toFixed(2)})`}
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Add-ons</h2>
          <div className="space-y-2">
            {addons.map((addon) => (
              <label
                key={addon.name}
                className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon.name)}
                    onChange={() => toggleAddon(addon.name)}
                    className="w-4 h-4 text-orange-400 rounded border-gray-300 focus:ring-orange-400"
                  />
                  <span className="ml-3 text-gray-700">{addon.name}</span>
                </div>
                <span className="text-gray-600">+${addon.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Special Instructions</h2>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="E.g., No pickles, extra onions..."
            className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows={3}
          />
        </div>

        {/* Add to Cart Button - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t max-w-md mx-auto">
          <button
            onClick={handleAddToCart}
            className="btn w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart - ${calculateTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}

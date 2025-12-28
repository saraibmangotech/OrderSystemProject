"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { showSuccessToast } from "../../components/toaster"

const menuItems = [
  {
    id: 1,
    name: "Classic Cheeseburger",
    price: 12.99,
    category: "Burgers",
    rating: 4.4,
    image: "/classic-cheeseburger.png",
  },
  {
    id: 2,
    name: "Spicy Chicken Burger",
    price: 13.5,
    category: "Burgers",
    rating: 4.6,
    image: "/spicy-chicken-burger.png",
  },
  {
    id: 3,
    name: "French Fries",
    price: 4.99,
    category: "Burgers",
    rating: 4.5,
    image: "/crispy-french-fries.png",
  },
  {
    id: 4,
    name: "Coke",
    price: 2.5,
    category: "Drinks",
    rating: 4.8,
    image: "/refreshing-cola.png",
  },
  {
    id: 5,
    name: "Ice Cream Sundae",
    price: 5.99,
    category: "Desserts",
    rating: 4.7,
    image: "/ice-cream-sundae.png",
  },
]

export default function MenuPage() {
  const [tableNumber, setTableNumber] = useState("")
  const [activeCategory, setActiveCategory] = useState("Burgers")
  const [cart, setCart] = useState([])
  const [temp, setTemp] = useState(false)
  const router = useRouter()
    const searchParams = useSearchParams()
    const restaurantId = searchParams.get("id")
    const table = searchParams.get("table")
  useEffect(() => {
 localStorage.setItem('restaurantId',restaurantId)
 
  localStorage.setItem('table',table)
    if (!table) router.push("/")
    else setTableNumber(table)

    const savedCart = localStorage.getItem("cart")
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [temp])

  const getCartCount = () =>
    cart.reduce((sum, item) => sum + item.quantity, 0)

  const getItemQty = (id) => {
    const found = cart.find((i) => i.id === id)
    return found ? found.quantity : 0
  }

  const increaseQty = (item) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]")
    const index = existing.findIndex((i) => i.id === item.id)

    if (index !== -1) {
      existing[index].quantity += 1
    } else {
      existing.push({ ...item, quantity: 1 })
      showSuccessToast("Product added to your cart")
    }

    localStorage.setItem("cart", JSON.stringify(existing))
    setTemp(!temp)
  }

  const decreaseQty = (item) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]")
    const index = existing.findIndex((i) => i.id === item.id)

    if (index !== -1) {
      if (existing[index].quantity > 1) {
        existing[index].quantity -= 1
      } else {
        existing.splice(index, 1)
      }
    }

    localStorage.setItem("cart", JSON.stringify(existing))
    setTemp(!temp)
  }

  const getCartTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="min-h-screen bg-white pb-28">

      {/* HEADER (UNCHANGED) */}
      <div className="sticky top-0 z-10 bg-white p-5 flex items-center justify-between border-b shadow-sm">
        <div>
          <span className="text-sm text-gray-500">Table:</span>
          <span className="ml-2 text-xl font-bold text-orange-400">
            {tableNumber}
          </span>
        </div>

        <button
          onClick={() => router.push("/cart")}
          className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          🛒
          {getCartCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center font-semibold shadow-lg">
              {getCartCount()}
            </span>
          )}
        </button>
      </div>

      {/* CATEGORIES (UNCHANGED) */}
      {/* YOUR EXISTING CATEGORIES CODE REMAINS EXACTLY SAME */}
       <div className="p-5">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Categories</h2>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">

          {/* Burgers */}
          <button
            onClick={() => setActiveCategory("Burgers")}
            className={`flex flex-col items-center justify-center min-w-[88px] h-24 rounded-2xl transition-all active:scale-95 ${activeCategory === "Burgers"
                ? "bg-orange-400 text-white shadow-lg"
                : "bg-gray-50 text-gray-600"
              }`}
          >
            <svg className="w-9 h-9 mb-1" viewBox="0 0 64 64" fill="currentColor">
              <path d="M8 30c0-8.8 10.7-16 24-16s24 7.2 24 16H8zm48 6H8v6h48v-6zm-4 12H12c0 4.4 8.9 8 20 8s20-3.6 20-8z" />
            </svg>
            <span className="text-xs font-semibold">Burgers</span>
          </button>

          {/* Drinks */}
          <button
            onClick={() => setActiveCategory("Drinks")}
            className={`flex flex-col items-center justify-center min-w-[88px] h-24 rounded-2xl transition-all active:scale-95 ${activeCategory === "Drinks"
                ? "bg-orange-400 text-white shadow-lg"
                : "bg-gray-50 text-gray-600"
              }`}
          >
            <svg className="w-9 h-9 mb-1" viewBox="0 0 64 64" fill="currentColor">
              <path d="M22 2v6h4v6h4V8h4V2h-12zM16 16l4 44h24l4-44H16z" />
            </svg>
            <span className="text-xs font-semibold">Drinks</span>
          </button>

          {/* Desserts */}
          <button
            onClick={() => setActiveCategory("Desserts")}
            className={`flex flex-col items-center justify-center min-w-[88px] h-24 rounded-2xl transition-all active:scale-95 ${activeCategory === "Desserts"
                ? "bg-orange-400 text-white shadow-lg"
                : "bg-gray-50 text-gray-600"
              }`}
          >
            <svg className="w-9 h-9 mb-1" viewBox="0 0 64 64" fill="currentColor">
              <path d="M12 28h40v10H12V28zm4 14h32v6H16v-6zm6-26c0-4.4 4.5-8 10-8s10 3.6 10 8H22z" />
            </svg>
            <span className="text-xs font-semibold">Desserts</span>
          </button>

        </div>
      </div>


      {/* PRODUCTS */}
      <div className="px-5">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Popular Items</h2>

        <div className="grid grid-cols-2 gap-4 pb-4">
          {menuItems
            .filter((item) =>
              activeCategory === "Burgers"
                ? true
                : item.category === activeCategory
            )
            .map((item) => {
              const qty = getItemQty(item.id)

              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm relative"
                >
                  <div className="aspect-square bg-gray-50">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3 pb-4">
                    <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-orange-400 font-bold text-base mb-2">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* FOODPANDA CONTROL – SAME POSITION */}
                  <div className="absolute bottom-3 right-3">
                    {qty === 0 ? (
                      <button
                        onClick={() => increaseQty(item)}
                        className="w-9 h-9 bg-orange-400 rounded-full flex items-center justify-center active:bg-orange-500 transition-all duration-200 shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex items-center bg-white rounded-full shadow-lg h-9 px-2 transition-all duration-200">
                        <button
                          onClick={() => decreaseQty(item)}
                          className="text-xl px-2 text-gray-700"
                        >
                          −
                        </button>
                        <span className="px-1 font-semibold text-sm">
                          {qty}
                        </span>
                        <button
                          onClick={() => increaseQty(item)}
                          className="text-xl px-2 text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* BOTTOM VIEW CART BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="max-w-md mx-auto px-4 py-3">
            <button
              onClick={() => router.push("/cart")}
              className="w-full bg-orange-400 text-white rounded-xl py-3 px-5 flex justify-between items-center font-semibold"
            >
              <span>View Cart</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

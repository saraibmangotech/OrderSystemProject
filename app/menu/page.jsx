"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { showSuccessToast } from "../../components/toaster"
import moment from "moment"

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

const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`} />

function MenuContent() {
  const [tableNumber, setTableNumber] = useState("")
  const [activeCategory, setActiveCategory] = useState("Burgers")
  const [cart, setCart] = useState([])
  const [temp, setTemp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [showOrdersPopup, setShowOrdersPopup] = useState(false)
  const [showCartDrawer, setShowCartDrawer] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const table = searchParams.get("table")

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const table = localStorage.getItem("tableNumber")
    if (!table) router.push("/")
    const savedCart = localStorage.getItem("cart")
    if (savedCart) setCart(JSON.parse(savedCart))
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders)
      setOrders(parsedOrders)
    }
  }, [temp, router])

  const ordersCount = orders.length
  const latestOrder = orders[orders.length - 1]
  const [remainingMinutes, setRemainingMinutes] = useState(null)

  useEffect(() => {
    if (!latestOrder) return

    const updateTime = () => {
      setRemainingMinutes(getRemainingMinutes(latestOrder))
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [latestOrder])

  const getRemainingMinutes = (order) => {
    if (!order?.timestamp || !order?.estimate_time) return null
    const placedAt = moment(order?.timestamp)
    const estimateMinutes = Number.parseInt(order?.estimate_time)
    const readyAt = placedAt.clone().add(estimateMinutes, "minutes")
    const now = moment()
    const diff = readyAt.diff(now, "minutes")
    return diff > 0 ? diff : 0
  }

  useEffect(() => {
    if (id) localStorage.setItem("restaurantId", id)
    if (table) {
      localStorage.setItem("tableNumber", table)
      setTableNumber(table)
    }
  }, [id, table])

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0)
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

  const getCartTotal = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="min-h-screen bg-white pb-28">
      {showOrdersPopup && orders.length > 0 && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
          {/* Orders Popup Content */}
        </div>
      )}
      {showCartDrawer && cart.length > 0 && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
          {/* Cart Drawer Content */}
        </div>
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white p-5 flex items-center justify-between border-b shadow-sm">
        {loading ? (
          <>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </>
        ) : (
          <>
            <div>
              <span className="text-sm text-gray-500">Table:</span>
              <span className="ml-2 text-xl font-bold text-orange-400">{tableNumber}</span>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center font-semibold shadow-lg">
                  {getCartCount()}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* CATEGORIES */}
        <div className="p-5">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Categories</h2>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
          {loading ? (
            <>
              <Skeleton className="min-w-[88px] h-24 rounded-2xl" />
              <Skeleton className="min-w-[88px] h-24 rounded-2xl" />
              <Skeleton className="min-w-[88px] h-24 rounded-2xl" />
            </>
          ) : (
            <>
              {/* BURGERS */}
              <button
                onClick={() => setActiveCategory("Burgers")}
                className={`flex flex-col items-center justify-center min-w-[88px] h-24 rounded-2xl transition-all active:scale-95 ${activeCategory === "Burgers" ? "bg-orange-400 text-white shadow-lg" : "bg-gray-50 text-gray-600"
                  }`}
              >
                <svg className="w-9 h-9 mb-1" viewBox="0 0 64 64" fill="currentColor">
                  <path d="M8 30c0-8.8 10.7-16 24-16s24 7.2 24 16H8zm48 6H8v6h48v-6zm-4 12H12c0 4.4 8.9 8 20 8s20-3.6 20-8z" />
                </svg>
                <span className="text-xs font-semibold">Burgers</span>
              </button>

              {/* DRINKS */}
              <button
                onClick={() => setActiveCategory("Drinks")}
                className={`flex flex-col items-center justify-center min-w-[88px] h-24 rounded-2xl transition-all active:scale-95 ${activeCategory === "Drinks" ? "bg-orange-400 text-white shadow-lg" : "bg-gray-50 text-gray-600"
                  }`}
              >
                <svg className="w-9 h-9 mb-1" viewBox="0 0 64 64" fill="currentColor">
                  <path d="M22 2v6h4v6h4V8h4V2h-12zM16 16l4 44h24l4-44H16z" />
                </svg>
                <span className="text-xs font-semibold">Drinks</span>
              </button>

              {/* DESSERTS */}
              <button
                onClick={() => setActiveCategory("Desserts")}
                className={`flex flex-col items-center justify-center min-w-[88px] h-24 rounded-2xl transition-all active:scale-95 ${activeCategory === "Desserts" ? "bg-orange-400 text-white shadow-lg" : "bg-gray-50 text-gray-600"
                  }`}
              >
                <svg className="w-9 h-9 mb-1" viewBox="0 0 64 64" fill="currentColor">
                  <path d="M12 28h40v10H12V28zm4 14h32v6H16v-6zm6-26c0-4.4 4.5-8 10-8s10 3.6 10 8H22z" />
                </svg>
                <span className="text-xs font-semibold">Desserts</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="px-5">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Popular Items</h2>
           <div className="grid grid-cols-2 gap-4 pb-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))
            : menuItems
              .filter((item) => (activeCategory === "Burgers" ? true : item.category === activeCategory))
              .map((item) => {
                const qty = getItemQty(item.id)

                return (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm relative"
                  >
                    <div className="aspect-square bg-gray-50">
                      <img src={item.image || "/placeholder.svg"} className="w-full h-full object-cover" />
                    </div>

                    <div className="p-3 pb-4">
                      <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-orange-400 font-bold text-base mb-2">${item.price.toFixed(2)}</p>
                    </div>

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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      ) : (
                        <div className="flex items-center bg-white rounded-full shadow-lg h-9 px-2 transition-all duration-200">
                          <button onClick={() => decreaseQty(item)} className="text-xl px-2 text-gray-700">
                            −
                          </button>
                          <span className="px-1 font-semibold text-sm">{qty}</span>
                          <button onClick={() => increaseQty(item)} className="text-xl px-2 text-gray-700">
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

      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className=" mx-auto px-3 py-3">
            <div className="flex gap-2">
              {/* Orders Button */}
              {orders.length > 0 && (
                <button
                  onClick={() => setShowOrdersPopup(true)}
                  className="flex-1 bg-gray-100 text-gray-800 rounded-xl px-3 py-3 flex items-center gap-2 font-semibold active:scale-95 transition-all"
                >
                  <svg
                    className="w-5 h-5 text-orange-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>

                  <div className="text-left leading-tight text-xs sm:text-sm">
                    {ordersCount === 1 ? (
                      <>
                        <div className="font-bold truncate">Order #{latestOrder.id.split("-")[1]}</div>
                        <div className="text-gray-500">
                          {remainingMinutes === 0 ? "Ready" : ` ${remainingMinutes} mints left`}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold">{ordersCount} Orders</div>
                        <div className="text-gray-500 truncate">
                          #{latestOrder.id.split("-")[1]} •{" "}
                          {remainingMinutes === 0 ? "Ready" : `${remainingMinutes} min left`}
                        </div>
                      </>
                    )}
                  </div>
                </button>
              )}

              {/* Cart Button */}
              {cart.length > 0 && (
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className={`${
                    orders.length > 0 ? "flex-[1.2]" : "w-full"
                  } bg-orange-400 text-white rounded-xl px-4 py-3 flex justify-between items-center font-bold shadow-md active:scale-95 transition-all`}
                >
                  <div className="flex flex-col items-start text-xs sm:text-sm">
                    <span className="bg-white/20 px-2 py-0.5 rounded-md">{getCartCount()} Items</span>
                    <span>View Cart</span>
                  </div>
                  <span className="text-base sm:text-lg">${getCartTotal().toFixed(2)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-5 flex items-center justify-center">Loading...</div>}>
      <MenuContent />
    </Suspense>
  )
}

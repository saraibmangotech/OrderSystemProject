"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { showSuccessToast } from "../../components/toaster"
import moment from "moment"
import axios from "axios"
import Colors from "../assets/colors"

const Skeleton = ({ className }) => <div className={`animate-pulse rounded-xl bg-gray-300/70 ${className}`} />

function MenuContent() {
  // ---- States ----
  const [tableNumber, setTableNumber] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [cart, setCart] = useState([])
  const [temp, setTemp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [showOrdersPopup, setShowOrdersPopup] = useState(false)
  const [showCartDrawer, setShowCartDrawer] = useState(false)
  const [remainingMinutes, setRemainingMinutes] = useState(null)
  const [data, setData] = useState([])

  const [showAddonsPopup, setShowAddonsPopup] = useState(false)
  const [selectedProductForAddons, setSelectedProductForAddons] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const table = searchParams.get("table")

  const getRestaurantDetails = async () => {
    try {
      const res = await axios.get(
        "https://scanserve.mangotech-api.com/api/v1/restaurants/694fadd4e6107f3236d79fcc/694fadfce6107f3236d79fd4/details",
      )
      setData(res?.data?.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRestaurantDetails()
  }, [])

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) setCart(JSON.parse(savedCart))

    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) setOrders(JSON.parse(savedOrders))
  }, [temp])

  useEffect(() => {
    if (id) localStorage.setItem("restaurantId", id)
    if (table) {
      localStorage.setItem("tableNumber", table)
      setTableNumber(table)
    }
  }, [id, table])

  const latestOrder = orders[orders.length - 1]
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
    if (!latestOrder) return
    const updateTime = () => setRemainingMinutes(getRemainingMinutes(latestOrder))
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [latestOrder])

  const getItemQty = (id) => {
    const found = cart.find((i) => i._id === id)
    return found ? found.quantity : 0
  }

  const increaseQty = (item) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]")
    const index = existing.findIndex((i) => i._id === item._id)

    if (item.addons && item.addons.length > 0 && index === -1) {
      // Flattening the nested addons structure for the UI
      const flattenedAddons = item.addons.flatMap((group) =>
        group.addons.map((addon) => ({
          ...addon,
          groupName: group.name,
          selectionType: group.selection_type,
          maxSelection: group.max_selection,
          minSelection: group.min_selection,
          groupId: group._id,
        })),
      )
      setSelectedProductForAddons({ ...item, flattenedAddons })
      setSelectedAddons([])
      setShowAddonsPopup(true)
    } else {
      addToCartDirect(item, [])
    }
  }

  const addToCartDirect = (item, selectedExtras = []) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]")
    const index = existing.findIndex((i) => i._id === item._id)

    if (index !== -1) {
      existing[index].quantity += 1
    } else {
      const addonsPrice = selectedExtras.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0)
      existing.push({
        _id: item._id,
        name: item.name,
        price: item.base_price + addonsPrice,
        image: item.image_urls?.[0],
        quantity: 1,
        addons: item.addons || [],
        selectedAddons: selectedExtras,
      })
      showSuccessToast("Product added to your cart")
    }

    localStorage.setItem("cart", JSON.stringify(existing))
    setTemp((prev) => !prev)
    setShowAddonsPopup(false)
  }

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a._id === addon._id) ? prev.filter((a) => a._id !== addon._id) : [...prev, addon],
    )
  }

  const decreaseQty = (item) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]")
    const index = existing.findIndex((i) => i._id === item._id)

    if (index !== -1) {
      if (existing[index].quantity > 1) {
        existing[index].quantity -= 1
      } else {
        existing.splice(index, 1)
      }
    }

    localStorage.setItem("cart", JSON.stringify(existing))
    setTemp((prev) => !prev)
  }

  const removeAddon = (item, addonToRemove) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]")
    const index = existing.findIndex((i) => i._id === item._id)

    if (index !== -1) {
      const updatedAddons = existing[index].selectedAddons.filter((a) => a._id !== addonToRemove._id)
      const removedAddonPrice = Number(addonToRemove.price) || 0

      existing[index].selectedAddons = updatedAddons
      existing[index].price = Number(existing[index].price) - removedAddonPrice

      localStorage.setItem("cart", JSON.stringify(existing))
      setTemp((prev) => !prev)
    }
  }

  const getCartTotal = () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)

  const ordersCount = orders.length

  return (
    <div className="page min-h-screen bg-white pb-28">
   {showAddonsPopup && selectedProductForAddons && (
  <div className="overlay-fade fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-[32px] w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Customize Order</h3>
          <p className="text-sm text-gray-500">{selectedProductForAddons.name}</p>
        </div>
        <button onClick={() => setShowAddonsPopup(false)} className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Addons List */}
      <div className="overflow-y-auto p-6 space-y-6">
        {selectedProductForAddons.flattenedAddons.map((addon) => (
          <div key={addon._id} className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{addon.groupName}</p>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                {addon.selectionType === "single" ? "Choose 1" : `Max ${addon.maxSelection}`}
              </span>
            </div>
            <div className="space-y-2">
              <label
                key={addon._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all border-2 border-transparent"
                style={{
                  borderColor: selectedAddons.find((a) => a._id === addon._id) ? Colors.brown : undefined,
                  backgroundColor: selectedAddons.find((a) => a._id === addon._id) ? `${Colors.brown}20` : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center">
                    <input
                      type={addon.selectionType === "single" ? "radio" : "checkbox"}
                      name={`addon-group-${addon.groupId}`}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 transition-all"
                      style={{
                        borderColor: selectedAddons.find((a) => a._id === addon._id) ? Colors.brown : undefined,
                        backgroundColor: selectedAddons.find((a) => a._id === addon._id) ? Colors.brown : undefined,
                      }}
                      checked={!!selectedAddons.find((a) => a._id === addon._id)}
                      onChange={() => {
                        if (addon.selectionType === "single") {
                          setSelectedAddons((prev) => [
                            ...prev.filter(
                              (a) =>
                                !selectedProductForAddons.flattenedAddons.find((ga) => ga.groupId === a.groupId),
                            ),
                            addon,
                          ])
                        } else {
                          toggleAddon(addon)
                        }
                      }}
                    />
                    <svg
                      className="absolute w-4 h-4 text-white pointer-events-none hidden peer-checked:block left-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">{addon.name}</span>
                </div>
                <span className="font-bold" style={{ color: Colors.brown }}>
                  +${Number(addon.price).toFixed(2)}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="p-6 border-t bg-gray-50 flex gap-3">
        <button
          onClick={() => addToCartDirect(selectedProductForAddons, [])}
          className="btn flex-1 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl py-4 font-bold"
        >
          Skip
        </button>
        <button
          onClick={() => addToCartDirect(selectedProductForAddons, selectedAddons)}
          className="btn flex-1 text-white rounded-2xl py-4 font-bold shadow-lg"
          style={{ backgroundColor: Colors.brown, boxShadow: `${Colors.brown}50 0px 4px 8px` }}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}


      {/* Orders Popup */}
{showOrdersPopup && orders.length > 0 && (
  <div className="overlay-fade fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Your Orders</h3>
        <button onClick={() => setShowOrdersPopup(false)} className="text-gray-400 hover:text-gray-600 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto p-6 space-y-6">
        {orders.map((order) => {
          const remaining = getRemainingMinutes(order)
          return (
            <div
              key={order.id}
              onClick={() => router.push(`/order-detail?orderId=${order.id}`, { state: order })}
              className="bg-gray-50 rounded-2xl p-4 border border-gray-100 cursor-pointer"
            >
              {/* Order header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: Colors.brown }}>
                    #{order.id.split("-")[1]}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {remaining === 0 ? "Ready" : `${remaining} min left`}
                  </p>
                </div>
                <span
                  className="px-3 py-1 text-[10px] font-bold uppercase rounded-full"
                  style={{ backgroundColor: `${Colors.brown}20`, color: Colors.brown }}
                >
                  {order.status}
                </span>
              </div>

              {/* Items and Addons */}
              <div className="space-y-2 mb-3">
                {order.items.map((item, idx) => {
                  const unitPrice = Number.parseFloat(item?.base_price || item?.price)
                  return (
                    <div key={idx} className="space-y-1">
                      {/* Item line */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">${(unitPrice * item.quantity).toFixed(2)}</span>
                      </div>

                      {/* Selected Addons */}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {item.selectedAddons.map((addon) => (
                            <div key={addon._id} className="flex justify-between text-xs text-gray-500">
                              <span>+ {addon.name}</span>
                              <span>${addon.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-dashed flex justify-between items-center font-bold text-gray-800">
                <span>Total Paid</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </div>
)}



      {/* Cart Drawer */}
    {showCartDrawer && cart.length > 0 && (
  <div className="overlay-fade fixed inset-0 z-[90] flex items-end justify-center bg-black/40">
    <div className="bg-white rounded-t-[32px] w-full max-w-md max-h-[70vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Current Cart</h3>
        <button
          onClick={() => setShowCartDrawer(false)}
          className="text-gray-400 hover:text-gray-600 font-medium text-sm"
        >
          Close
        </button>
      </div>
      <div className="overflow-y-auto px-6 py-4 flex-1">
        {cart?.map((item) => (
          <div key={item?._id} className="flex items-start gap-4 py-4 border-b last:border-0">
            <img
              src={item?.image || "/placeholder.svg"}
              alt={item?.name}
              className="w-16 h-16 rounded-xl object-cover bg-gray-100 mt-1"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">{item?.name}</h4>
              {item.selectedAddons && item.selectedAddons.length > 0 && (
                <div className="mt-2 space-y-1">
                  {item.selectedAddons.map((addon, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        + {addon.item_name || addon.name}
                        <span
                          className="text-[9px] font-bold ml-1"
                          style={{ color: Colors.brown }}
                        >
                          (${Number(addon.price).toFixed(2)})
                        </span>
                      </span>
                      <button
                        onClick={() => removeAddon(item, addon)}
                        className="text-gray-300 hover:text-red-400 p-0.5 transition-colors"
                        title="Remove addon"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="font-bold text-sm mt-1" style={{ color: Colors.brown }}>
                ${Number.parseFloat(item?.price).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full h-8 px-2">
              <button onClick={() => decreaseQty(item)} className="px-2 text-gray-600">
                -
              </button>
              <span className="px-2 text-sm font-bold">{item?.quantity}</span>
              <button onClick={() => increaseQty(item)} className="px-2 text-gray-600">
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500 font-medium">Subtotal</span>
          <span className="text-xl font-bold text-gray-800">${getCartTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={() => router.push("/cart")}
          className="w-full text-white rounded-2xl py-4 font-bold shadow-lg active:scale-[0.98] transition-all"
          style={{ backgroundColor: Colors.brown, boxShadow: `0 10px 25px ${Colors.brown}40` }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
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
              <span className="ml-2 text-xl font-bold "   style={{ color: Colors.brown }}>{tableNumber}</span>
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
              {cart?.length > 0 && (
             <span
  className="absolute -top-1 -right-1 text-white text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center font-semibold shadow-lg"
  style={{ backgroundColor: Colors.brown }}
>
  {cart?.length}
</span>

              )}
            </button>
          </>
        )}
      </div>

      {/* CATEGORIES */}
      <div className="p-5">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <>
              <Skeleton className="min-w-[120px] h-24 rounded-2xl" />
              <Skeleton className="min-w-[120px] h-24 rounded-2xl" />
              <Skeleton className="min-w-[120px] h-24 rounded-2xl" />
            </>
          ) : (
            data?.categories?.map((cat) => {
              const isActive = activeCategory === cat.name
              return (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`relative min-w-[120px] h-28 rounded-2xl overflow-hidden transform-gpu will-change-transform transition-all duration-300 ease-out active:scale-95 ${
                    isActive
                      ? "scale-[1.06] ring-2 ring-orange-400 shadow-xl"
                      : "scale-[0.98] ring-1 ring-gray-200 hover:scale-[1.02] hover:shadow-lg"
                  }`}
                >
                  <img
                    src={cat.image_url || "/placeholder.svg"}
                    alt={cat.name}
                    className={`absolute inset-0 h-full w-full object-cover transition duration-300 ease-out ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                  />
                  <div className={`absolute inset-0 transition ${isActive ? "bg-black/40" : "bg-black/30"}`} />
                  <div className="relative z-10 flex h-full items-end justify-center p-2">
                    <span className={`text-xs font-semibold text-center ${isActive ? "text-white" : "text-white/90"}`}>
                      {cat.name}
                    </span>
                  </div>
                </button>
              )
            })
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
            : data?.products
                ?.filter((item) => (activeCategory === "all" ? true : item.category_id === activeCategory))
                .map((item) => {
                  const qty = getItemQty(item._id)
                  return (
                    <div
                      key={item._id}
                      className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm relative"
                    >
                      <div className="aspect-square bg-gray-50">
                        <img
                          src={item.image_urls?.[0] || "/placeholder.svg"}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                      </div>
                      <div className="p-3 pb-4 reveal">
                        <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                        <p className=" font-bold text-base mb-2"   style={{ color: Colors.brown }}>${item.base_price.toFixed(2)}</p>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        {qty === 0 ? (
                      <button
  onClick={() => increaseQty(item)}
  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95"
  style={{ backgroundColor: Colors.brown }}
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

      {/* Bottom Bar */}
      {!loading && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto px-3 py-2">
            <div className="flex gap-2">
              {orders.length > 0 && (
                <button
                  onClick={() => setShowOrdersPopup(true)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3 flex items-center gap-3 active:scale-[0.98] transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left leading-tight text-xs sm:text-sm overflow-hidden">
                    {ordersCount === 1 ? (
                      <>
                        <span className="font-semibold text-gray-800 truncate">
                          Order #{latestOrder.id.split("-")[1]}
                        </span>
                        <span className="text-gray-500">
                          {remainingMinutes === 0 ? "Ready for pickup" : `${remainingMinutes} min remaining`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-gray-800">{ordersCount} Active Orders</span>
                        <span className="text-gray-500 truncate">
                          {remainingMinutes === 0 ? "Ready" : `Ready in ${remainingMinutes} min`}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              )}
              {cart.length > 0 && (
             <button
  onClick={() => setShowCartDrawer(true)}
  className={`${orders.length > 0 ? "flex-[1.3]" : "w-full"} text-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg active:scale-[0.98] transition`}
  style={{ backgroundColor: Colors.brown }}
>
  <div className="flex flex-col items-start text-xs sm:text-sm leading-tight">
    <span className="bg-white/20 px-2 py-0.5 rounded-md font-medium">
      {cart.length} items
    </span>
    <span className="font-semibold">View Cart</span>
  </div>
  <span className="text-base sm:text-lg font-bold">
    ${getCartTotal().toFixed(2)}
  </span>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MenuContent />
    </Suspense>
  )
}

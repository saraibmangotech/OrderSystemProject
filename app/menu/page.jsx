"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showSuccessToast } from "../../components/toaster";
import moment from "moment";

const menuItems = [
  { id: 1, name: "Classic Cheeseburger", price: 12.99, category: "Burgers", rating: 4.4, image: "/classic-cheeseburger.png" },
  { id: 2, name: "Spicy Chicken Burger", price: 13.5, category: "Burgers", rating: 4.6, image: "/spicy-chicken-burger.png" },
  { id: 3, name: "French Fries", price: 4.99, category: "Burgers", rating: 4.5, image: "/crispy-french-fries.png" },
  { id: 4, name: "Coke", price: 2.5, category: "Drinks", rating: 4.8, image: "/refreshing-cola.png" },
  { id: 5, name: "Ice Cream Sundae", price: 5.99, category: "Desserts", rating: 4.7, image: "/ice-cream-sundae.png" },
];

const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;

function MenuContent() {
  // ---- States ----
  const [tableNumber, setTableNumber] = useState("");
  const [activeCategory, setActiveCategory] = useState("Burgers");
  const [cart, setCart] = useState([]);
  const [temp, setTemp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const table = searchParams.get("table");

  // ---- Loading skeleton ----
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // ---- Initialize cart/orders/table ----
  useEffect(() => {
    const tableStored = localStorage.getItem("tableNumber");
    if (!tableStored) router.push("/");

    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, [temp]);

  // ---- Store restaurantId & table in localStorage ----
  useEffect(() => {
    if (id) localStorage.setItem("restaurantId", id);
    if (table) {
      localStorage.setItem("tableNumber", table);
      setTableNumber(table);
    }
  }, [id, table]);

  // ---- Remaining time for latest order ----
  const latestOrder = orders[orders.length - 1];
  const getRemainingMinutes = (order) => {
    if (!order?.timestamp || !order?.estimate_time) return null;
    const placedAt = moment(order?.timestamp);
    const estimateMinutes = parseInt(order?.estimate_time);
    const readyAt = placedAt.clone().add(estimateMinutes, "minutes");
    const now = moment();
    const diff = readyAt.diff(now, "minutes");
    return diff > 0 ? diff : 0;
  };

  useEffect(() => {
    if (!latestOrder) return;
    const updateTime = () => setRemainingMinutes(getRemainingMinutes(latestOrder));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [latestOrder]);

  // ---- Cart helpers ----
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getItemQty = (id) => {
    const found = cart.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };
  const increaseQty = (item) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = existing.findIndex((i) => i.id === item.id);
    if (index !== -1) existing[index].quantity += 1;
    else {
      existing.push({ ...item, quantity: 1 });
      showSuccessToast("Product added to your cart");
    }
    localStorage.setItem("cart", JSON.stringify(existing));
    setTemp(!temp);
  };
  const decreaseQty = (item) => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = existing.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      if (existing[index].quantity > 1) existing[index].quantity -= 1;
      else existing.splice(index, 1);
    }
    localStorage.setItem("cart", JSON.stringify(existing));
    setTemp(!temp);
  };
  const getCartTotal = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const ordersCount = orders.length;

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Orders Popup */}
      {showOrdersPopup && orders.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                const remaining = getRemainingMinutes(order);
                return (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/order-detail?orderId=${order.id}`, { state: order })}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">#{order.id.split("-")[1]}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{remaining === 0 ? "Ready" : `${remaining} min left`}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase rounded-full">{order.status}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.quantity}x {item.name}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-dashed flex justify-between items-center font-bold text-gray-800">
                      <span>Total Paid</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCartDrawer && cart.length > 0 && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-[32px] w-full max-w-md max-h-[70vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Current Cart</h3>
              <button onClick={() => setShowCartDrawer(false)} className="text-gray-400 hover:text-gray-600 font-medium text-sm">Close</button>
            </div>
            <div className="overflow-y-auto px-6 py-4 flex-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                    <p className="text-orange-400 font-bold text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-full h-8 px-2">
                    <button onClick={() => decreaseQty(item)} className="px-2 text-gray-600">-</button>
                    <span className="px-2 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => increaseQty(item)} className="px-2 text-gray-600">+</button>
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
                className="w-full bg-orange-400 text-white rounded-2xl py-4 font-bold shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
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
              <span className="ml-2 text-xl font-bold text-orange-400">{tableNumber}</span>
            </div>
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
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
              {["Burgers", "Drinks", "Desserts"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex flex-col items-center justify-center min-w-[88px] h-24 rounded-2xl transition-all active:scale-95 ${activeCategory === cat ? "bg-orange-400 text-white shadow-lg" : "bg-gray-50 text-gray-600"}`}
                >
                  <span className="text-xs font-semibold">{cat}</span>
                </button>
              ))}
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
                .filter((item) => activeCategory === "Burgers" ? true : item.category === activeCategory)
                .map((item) => {
                  const qty = getItemQty(item.id);
                  return (
                    <div key={item.id} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm relative">
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
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        ) : (
                          <div className="flex items-center bg-white rounded-full shadow-lg h-9 px-2 transition-all duration-200">
                            <button onClick={() => decreaseQty(item)} className="text-xl px-2 text-gray-700">−</button>
                            <span className="px-1 font-semibold text-sm">{qty}</span>
                            <button onClick={() => increaseQty(item)} className="text-xl px-2 text-gray-700">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
        </div>
      </div>

      {/* Bottom Bar */}
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
                        <div className="font-bold truncate">
                          Order #{latestOrder.id}
                        </div>
                        <div className="text-gray-500">
                          {remainingMinutes === 0
                            ? "Ready"
                            : ` ${remainingMinutes} mints left`}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold">
                          {ordersCount} Orders
                        </div>
                        <div className="text-gray-500 truncate">
                          #{latestOrder.id} •{" "}
                          {remainingMinutes === 0
                            ? "Ready"
                            : `${remainingMinutes} mints left`}
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
                  className={`${orders.length > 0 ? "flex-[1.2]" : "w-full"
                    } bg-orange-400 text-white rounded-xl px-4 py-3 flex justify-between items-center font-bold shadow-md active:scale-95 transition-all`}
                >
                  <div className="flex flex-col items-start text-xs sm:text-sm">
                    <span className="bg-white/20 px-2 py-0.5 rounded-md">
                      {getCartCount()} Items
                    </span>
                    <span>View Cart</span>
                  </div>
                  <span className="text-base sm:text-lg">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Wrap component in Suspense to fix useSearchParams issue
export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
}

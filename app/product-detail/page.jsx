"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { showSuccessToast } from "../../components/toaster"
import axios from "axios"
import Colors from "../assets/colors"

const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-gray-300/70 ${className}`} />
)

function ProductDetailContent() {
  const router = useRouter()
       let Restaurant = localStorage.getItem('restaurantData')
    Restaurant = JSON.parse(Restaurant)
  const [product, setProduct] = useState(null)
  const [customization, setCustomization] = useState("")

  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [tableNumber, setTableNumber] = useState("")

  useEffect(() => {
    const table = localStorage.getItem("tableNumber")
    if (table) setTableNumber(table)

    const fetchProduct = async () => {
      const productId = localStorage.getItem("selectedProductId")
      if (!productId) {
        router.push("/menu")
        return
      }

      try {
        const res = await axios.get(
          "https://scanserve.mangotech-api.com/api/v1/restaurants/694fadd4e6107f3236d79fcc/694fadfce6107f3236d79fd4/details"
        )
        const products = res?.data?.data?.products || []
        const found = products.find((p) => p._id === productId)
        found ? setProduct(found) : router.push("/menu")
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [router])

  const toggleAddon = (addon, group) => {
    setSelectedAddons((prev) => {
      const isSelected = prev.find((a) => a._id === addon._id)

      if (group.selection_type === "single") {
        const others = prev.filter((a) => a.groupId !== group._id)
        return isSelected
          ? others
          : [...others, { ...addon, groupId: group._id, groupName: group.name }]
      }

      if (isSelected) return prev.filter((a) => a._id !== addon._id)

      const count = prev.filter((a) => a.groupId === group._id).length
      if (group.max_selection && count >= group.max_selection) return prev

      return [...prev, { ...addon, groupId: group._id, groupName: group.name }]
    })
  }

  const calculateTotal = () => {
    if (!product) return 0
    const addonsTotal = selectedAddons.reduce(
      (sum, a) => sum + (Number(a.price) || 0),
      0
    )
    return (product.base_price + addonsTotal) * quantity
  }

 const handleAddToCart = () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")

  cart.push({
    _id: product._id,
    name: product.name,
    price: product.base_price,
    image: product.image_urls?.[0],
    quantity,
    selectedAddons,
    customization, // 👈 ADDED HERE
  })

  localStorage.setItem("cart", JSON.stringify(cart))
  showSuccessToast("Added to cart successfully!")
  router.push("/menu")
}


  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-5 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }
console.log(product,'product');

  if (!product) return null

  return (
    <div className="pb-36">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
       <h1 className="text-xl font-bold text-gray-800">Product Detail</h1>
        <div className="w-10" />
      </div>

      {/* IMAGE */}
      <div className="max-w-2xl mx-auto px-4 mt-3">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100">
          <img
            src={product.image_urls?.[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto px-5 mt-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{product.name}</h1>
              {product?.description && (
    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
      {product.description}
    </p>
  )}
            <p
              className="text-xl font-bold mt-1"
              style={{ color: Restaurant?.restaurant?.theme }}
            >
              ${product.base_price.toFixed(2)}
            </p>
            
          </div>

          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 bg-white rounded-full"
            >
              −
            </button>
            <span className="px-3 font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 bg-white rounded-full"
            >
              +
            </button>
          </div>
        </div>

        {/* ADDONS */}
        {product.addons?.length > 0 && (
          <div className="mt-8 space-y-8">
            {product.addons.map((group) => (
              <div key={group._id}>
                <h3 className="font-bold mb-3">{group.name}</h3>
                <div className="space-y-3">
                  {group.addons.map((addon) => {
                    const isSelected = selectedAddons.some(
                      (a) => a._id === addon._id
                    )
                    return (
                      <label
                        key={addon._id}
                        className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer ${
                          isSelected
                            ? "bg-gray-50"
                            : "bg-white"
                        }`}
                        style={{
                          borderColor: isSelected
                            ? Restaurant?.restaurant?.theme
                            : "#eee",
                        }}
                      >
                        <input
                          type={group.selection_type === "single" ? "radio" : "checkbox"}
                          checked={isSelected}
                          className="w-5 h-5 rounded cursor-pointer" style={{ accentColor: Restaurant?.restaurant?.theme }}
                          onChange={() => toggleAddon(addon, group)}
                        />
                        <span className="flex-1 ml-3">{addon.name}</span>
                        <span
                          className="font-bold"
                          style={{ color: Restaurant?.restaurant?.theme }}
                        >
                          +${Number(addon.price).toFixed(2)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* CUSTOMIZATION / NOTES */}
<div className="mt-8">
  <h3 className="font-bold mb-2">
    Special Instructions
  </h3>

  <textarea
    value={customization}
    onChange={(e) => setCustomization(e.target.value)}
    placeholder="Add extra notes like no onion, extra spicy, etc."
    rows={3}
    className="w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2"
    style={{
      borderColor: "#eee",
      focusRingColor: Restaurant?.restaurant?.theme,
    }}
  />

  <p className="text-xs text-gray-400 mt-1">
    Optional – this will be sent to the kitchen
  </p>
</div>
      </div>


      {/* FOOTER */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t">
        <div className="max-w-2xl mx-auto p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-bold">TOTAL</p>
            <p className="text-xl font-bold">
              ${calculateTotal().toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 text-white py-3 rounded-xl font-bold"
            style={{ backgroundColor: Restaurant?.restaurant?.theme }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={null}>
      <ProductDetailContent />
    </Suspense>
  )
}

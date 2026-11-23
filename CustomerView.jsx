import React, { useState } from "react";
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronRight, 
  Sparkles,
  Bike,
  CheckCircle,
  Phone,
  Flame,
  X
} from "lucide-react";
import MapViewer from "../components/MapViewer.jsx";
import RazorpayModal from "../components/RazorpayModal.jsx";

export default function CustomerView({ 
  restaurants, 
  orders, 
  riders, 
  onCreateOrder, 
  activeRiderLocation 
}) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("explore"); // 'explore' | 'track'
  const [trackedOrderId, setTrackedOrderId] = useState(null);

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cart operations
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, restaurantId: selectedRestaurant.id, restaurantName: selectedRestaurant.name }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing.quantity === 1) {
        return prev.filter(i => i.id !== itemId);
      }
      return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartTotal > 0 ? 35 : 0;
  const taxes = Math.round(cartTotal * 0.05);
  const finalAmount = cartTotal + deliveryFee + taxes;

  const handlePaymentSuccess = async (paymentMethod) => {
    const orderData = {
      customer: {
        name: "Aman Gupta",
        phone: "+91 98765 11223",
        address: "7th Main Road, HAL 2nd Stage, Indiranagar",
        coordinates: { lat: 12.9735, lng: 77.6468 }
      },
      restaurantId: selectedRestaurant.id,
      items: cart,
      paymentMethod
    };

    const created = await onCreateOrder(orderData);
    setCart([]);
    if (created && created.id) {
      setTrackedOrderId(created.id);
      setActiveTab("track");
    }
  };

  // Find currently tracked order
  const myOrders = orders.filter(o => o.customer.name.includes("Aman") || o.customer.name.includes("Pooja") || o.id === trackedOrderId);
  const activeOrder = orders.find(o => o.id === (trackedOrderId || myOrders[0]?.id)) || orders[0];

  // Map markers for tracking
  const trackingMarkers = [];
  let routeCoords = [];

  if (activeOrder) {
    trackingMarkers.push({
      lat: activeOrder.restaurantCoords.lat,
      lng: activeOrder.restaurantCoords.lng,
      type: "restaurant",
      popup: `<b>${activeOrder.restaurantName}</b><br/>Pickup Spot`
    });

    trackingMarkers.push({
      lat: activeOrder.customer.coordinates.lat,
      lng: activeOrder.customer.coordinates.lng,
      type: "customer",
      popup: `<b>Delivery Destination</b><br/>${activeOrder.customer.address}`
    });

    // Rider position (live or initial)
    const riderObj = riders.find(r => r.id === activeOrder.assignedRiderId) || riders[0];
    const riderPos = (activeRiderLocation && activeRiderLocation.orderId === activeOrder.id)
      ? activeRiderLocation.currentLocation
      : (riderObj ? riderObj.currentLocation : activeOrder.restaurantCoords);

    if (activeOrder.status === "out_for_delivery" || activeOrder.assignedRiderId) {
      trackingMarkers.push({
        lat: riderPos.lat,
        lng: riderPos.lng,
        type: "rider",
        popup: `<b>${activeOrder.assignedRiderName || "Assigned Rider"}</b><br/>On the way!`
      });
    }

    if (activeOrder.route?.coordinates) {
      routeCoords = activeOrder.route.coordinates;
    }
  }

  return (
    <div className="space-y-6">
      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "explore"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            🍽️ Order Food
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "track"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            🗺️ Live Tracking Map
            {activeOrder && activeOrder.status !== "delivered" && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-extrabold animate-pulse">
                LIVE
              </span>
            )}
          </button>
        </div>

        {cart.length > 0 && activeTab === "explore" && (
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Cart ({cart.reduce((s, i) => s + i.quantity, 0)}) • ₹{finalAmount}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {activeTab === "explore" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Restaurant List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search restaurant or cuisine..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredRestaurants.map(rest => (
                <div
                  key={rest.id}
                  onClick={() => setSelectedRestaurant(rest)}
                  className={`p-3.5 bg-white rounded-2xl border cursor-pointer transition-all card-hover ${
                    selectedRestaurant?.id === rest.id
                      ? "border-amber-500 ring-2 ring-amber-500/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{rest.name}</h4>
                        <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 text-emerald-700 text-xs font-bold">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          <span>{rest.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{rest.cuisine}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {rest.deliveryTime}
                        </span>
                        <span>•</span>
                        <span>₹{rest.avgCostForTwo} for two</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Menu of Selected Restaurant */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {selectedRestaurant ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedRestaurant.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">{selectedRestaurant.cuisine} • {selectedRestaurant.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                      ⚡ Open for Delivery
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" /> Recommended Dishes
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedRestaurant.menu.map(item => {
                      const inCart = cart.find(i => i.id === item.id);
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${
                                item.isVeg 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                                  : "bg-red-50 text-red-700 border-red-300"
                              }`}>
                                {item.isVeg ? "VEG" : "NON-VEG"}
                              </span>
                              <span className="text-xs font-medium text-slate-500">~{item.prepTimeMins}m prep</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mt-1.5">{item.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60">
                            <span className="text-sm font-extrabold text-slate-900">₹{item.price}</span>
                            {inCart ? (
                              <div className="flex items-center gap-2 bg-amber-500 text-white rounded-lg px-2 py-1 shadow-xs">
                                <button onClick={() => removeFromCart(item.id)} className="hover:opacity-80">
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                                <button onClick={() => addToCart(item)} className="hover:opacity-80">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                disabled={!item.available}
                                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-2xs disabled:opacity-40"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">Select a restaurant to view menu</div>
            )}
          </div>
        </div>
      ) : (
        /* LIVE TRACKING TAB (Module 6 & Module 4) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Order Details & Stepper */}
          <div className="lg:col-span-5 space-y-4">
            {activeOrder ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Active Order</span>
                    <h3 className="font-extrabold text-lg text-slate-900">{activeOrder.id}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">ETA</span>
                    <p className="text-base font-extrabold text-emerald-600">~{activeOrder.estimatedDeliveryMins || 20} mins</p>
                  </div>
                </div>

                {/* Status Stepper */}
                <div className="space-y-3">
                  {[
                    { key: "placed", label: "Order Confirmed", desc: "Received by restaurant" },
                    { key: "accepted", label: "Order Accepted", desc: "Chef confirmed ticket" },
                    { key: "preparing", label: "Food Being Prepared", desc: "Simmering in the kitchen" },
                    { key: "ready", label: "Ready for Pickup", desc: "Packed in heat-safe dabba" },
                    { key: "out_for_delivery", label: "Out for Delivery", desc: "Rider on the road" },
                    { key: "delivered", label: "Delivered", desc: "Bon appétit!" }
                  ].map((step, idx, arr) => {
                    const statusOrder = ["placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered"];
                    const currentIdx = statusOrder.indexOf(activeOrder.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={step.key} className="flex items-start gap-3 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 z-10 transition-colors ${
                          isDone 
                            ? "bg-emerald-500 text-white shadow-xs" 
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}>
                          {isDone ? "✓" : idx + 1}
                        </div>
                        {idx !== arr.length - 1 && (
                          <div className={`absolute left-3 top-6 w-0.5 h-6 -ml-px ${
                            currentIdx > idx ? "bg-emerald-500" : "bg-slate-200"
                          }`} />
                        )}
                        <div>
                          <p className={`text-xs font-bold ${isCurrent ? "text-amber-600 font-extrabold" : isDone ? "text-slate-800" : "text-slate-400"}`}>
                            {step.label} {isCurrent && "• (In Progress)"}
                          </p>
                          <p className="text-[11px] text-slate-400">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Partner Assigned Card */}
                {activeOrder.assignedRiderName ? (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        🛵
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Rider</span>
                        <h4 className="text-xs font-bold text-slate-900">{activeOrder.assignedRiderName}</h4>
                        <p className="text-[11px] text-slate-500">Verified DabbaDash Partner</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <p className="text-xs font-bold text-amber-800">Assigning nearest delivery partner...</p>
                  </div>
                )}

                {/* Items Summary */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-600 mb-2">Order Items:</h4>
                  <div className="space-y-1 text-xs">
                    {activeOrder.items?.map((it, i) => (
                      <div key={i} className="flex justify-between text-slate-600">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-semibold text-slate-900">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                      <span>Total Paid ({activeOrder.paymentMethod})</span>
                      <span>₹{activeOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                No active orders right now. Order a meal to start live tracking!
              </div>
            )}
          </div>

          {/* Interactive Live Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-sm text-slate-900">Real-Time GPS Tracking Map</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {activeOrder?.distanceKm ? `${activeOrder.distanceKm} km trip` : "OpenStreetMap + Leaflet"}
                </span>
              </div>

              <MapViewer
                markers={trackingMarkers}
                routeCoordinates={routeCoords}
                height="460px"
              />

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                <div>
                  <span className="text-slate-400">Pickup</span>
                  <p className="font-bold text-slate-800 truncate">{activeOrder?.restaurantName || "Kitchen"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Route Type</span>
                  <p className="font-bold text-amber-600">OSRM Optimized</p>
                </div>
                <div>
                  <span className="text-slate-400">Status</span>
                  <p className="font-bold text-emerald-600 uppercase text-[11px]">
                    {activeOrder?.status.replace(/_/g, " ") || "Idle"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Modal */}
      <RazorpayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={finalAmount}
        onPaymentSuccess={handlePaymentSuccess}
        orderSummary={cart}
      />
    </div>
  );
}

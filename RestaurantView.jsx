import React, { useState } from "react";
import { Utensils, CheckCircle, Clock, AlertCircle, ChefHat, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

export default function RestaurantView({ 
  restaurants, 
  orders, 
  onUpdateOrderStatus, 
  onToggleMenuItem 
}) {
  const [selectedRestId, setSelectedRestId] = useState(restaurants[0]?.id || "rest_1");

  const currentRest = restaurants.find(r => r.id === selectedRestId) || restaurants[0];
  const restOrders = orders.filter(o => o.restaurantId === currentRest?.id);

  const incomingOrders = restOrders.filter(o => o.status === "placed");
  const cookingOrders = restOrders.filter(o => ["accepted", "preparing"].includes(o.status));
  const readyOrders = restOrders.filter(o => o.status === "ready");
  const completedOrders = restOrders.filter(o => ["out_for_delivery", "delivered"].includes(o.status));

  return (
    <div className="space-y-6">
      {/* Top Banner / Restaurant Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{currentRest?.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kitchen Live
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentRest?.cuisine} • {currentRest?.address}</p>
          </div>
        </div>

        {/* Switch restaurant selector for demo */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Select Kitchen:</span>
          <select
            value={selectedRestId}
            onChange={e => setSelectedRestId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          >
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kitchen Display Board (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Incoming Tickets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Incoming Orders ({incomingOrders.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Needs Acceptance</span>
          </div>

          <div className="space-y-3">
            {incomingOrders.length === 0 ? (
              <div className="p-8 bg-slate-100/60 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No new orders right now.
              </div>
            ) : (
              incomingOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-sm space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-sm">{order.id}</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      NEW TICKET
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="text-slate-400">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Customer: <b className="text-slate-800">{order.customer.name}</b></span>
                    <span className="font-bold text-slate-900">₹{order.totalAmount}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, "accepted")}
                      className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              In the Kitchen ({cookingOrders.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Cooking</span>
          </div>

          <div className="space-y-3">
            {cookingOrders.length === 0 ? (
              <div className="p-8 bg-slate-100/60 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No orders cooking right now.
              </div>
            ) : (
              cookingOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-orange-200 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-sm">{order.id}</span>
                    <span className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Preparing
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{it.quantity}x {it.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Rider: {order.assignedRiderName || "Auto-assigning..."}</span>
                  </div>

                  <button
                    onClick={() => onUpdateOrderStatus(order.id, "ready")}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Food Ready for Pickup
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Rider Pickup */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Ready for Pickup ({readyOrders.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Handoff Counter</span>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="p-8 bg-slate-100/60 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No orders waiting on counter.
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-sm space-y-3 bg-emerald-50/20">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <span className="font-extrabold text-slate-900 text-sm">{order.id}</span>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      PACKED & READY
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p>Customer: <b className="text-slate-800">{order.customer.name}</b></p>
                    <p>Total: <b>₹{order.totalAmount}</b> ({order.paymentMethod})</p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Assigned Partner:</span>
                    <span className="font-bold text-emerald-700">{order.assignedRiderName || "Rider approaching"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Menu Item Availability Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-orange-500" /> Live Kitchen Menu Availability (Stock Control)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentRest?.menu.map(item => (
            <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                <p className="text-[11px] text-slate-500">₹{item.price} • {item.category}</p>
              </div>
              <button
                onClick={() => onToggleMenuItem(currentRest.id, item.id)}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  item.available 
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                }`}
              >
                {item.available ? "In Stock" : "Sold Out"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

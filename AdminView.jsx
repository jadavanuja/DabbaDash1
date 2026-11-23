import React, { useState } from "react";
import { 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Leaf, 
  DollarSign, 
  Radar, 
  Filter,
  CheckCircle2
} from "lucide-react";
import MapViewer from "../components/MapViewer.jsx";

export default function AdminView({ 
  metrics, 
  orders, 
  riders, 
  restaurants, 
  onReset 
}) {
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  // Prepare full city fleet radar markers
  const fleetMarkers = [];

  // 1. Restaurants
  restaurants.forEach(r => {
    fleetMarkers.push({
      lat: r.coordinates.lat,
      lng: r.coordinates.lng,
      type: "restaurant",
      popup: `<b>${r.name}</b><br/>${r.cuisine}`
    });
  });

  // 2. Riders
  riders.forEach(rd => {
    fleetMarkers.push({
      lat: rd.currentLocation.lat,
      lng: rd.currentLocation.lng,
      type: "rider",
      popup: `<b>Rider: ${rd.name}</b><br/>Status: ${rd.status.toUpperCase()}<br/>${rd.vehicle}`
    });
  });

  // 3. Customer dropoffs for active orders
  orders.filter(o => o.status !== "delivered").forEach(o => {
    fleetMarkers.push({
      lat: o.customer.coordinates.lat,
      lng: o.customer.coordinates.lng,
      type: "customer",
      popup: `<b>Active Delivery: ${o.id}</b><br/>${o.customer.address}`
    });
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> Total Orders
          </div>
          <p className="text-xl font-extrabold text-slate-900">{metrics.totalOrders || orders.length}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Active Orders
          </div>
          <p className="text-xl font-extrabold text-blue-600">{metrics.activeOrders || 0}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Platform GMV
          </div>
          <p className="text-xl font-extrabold text-slate-900">₹{metrics.totalRevenue || 0}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5 text-purple-500" /> Active Fleet
          </div>
          <p className="text-xl font-extrabold text-slate-900">{riders.length} Riders</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Batched Orders
          </div>
          <p className="text-xl font-extrabold text-purple-600">{metrics.batchedOrdersCount || 0}</p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
            <Leaf className="w-3.5 h-3.5" /> Km Saved
          </div>
          <p className="text-xl font-extrabold text-emerald-900">{metrics.totalKmSaved || 0} km</p>
        </div>
      </div>

      {/* Main City Fleet Radar Map */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-blue-600 animate-spin" />
            <h3 className="font-extrabold text-base text-slate-900">City Fleet Radar (Real-Time Geographic Overview)</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">🍳 Restaurants ({restaurants.length})</span>
            <span className="flex items-center gap-1">🛵 Riders ({riders.length})</span>
            <span className="flex items-center gap-1">🏠 Customers Active ({orders.filter(o => o.status !== "delivered").length})</span>
          </div>
        </div>

        <MapViewer
          markers={fleetMarkers}
          height="440px"
        />
      </div>

      {/* Orders Master Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">Master Orders Ledger</h3>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Restaurant</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Rider Assigned</th>
                <th className="py-2.5 px-3">Batch Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{order.id}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800">{order.customer.name}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{order.customer.address}</p>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{order.restaurantName}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹{order.totalAmount}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                      order.status === "out_for_delivery" ? "bg-blue-100 text-blue-800" :
                      order.status === "ready" ? "bg-teal-100 text-teal-800" :
                      order.status === "preparing" ? "bg-orange-100 text-orange-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {order.assignedRiderName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-3">
                    {order.isBatched ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        ⚡ Smart Batched
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Single</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

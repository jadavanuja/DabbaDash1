import React, { useState } from "react";
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Play, 
  CheckCircle2, 
  DollarSign, 
  Compass, 
  Phone,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import MapViewer from "../components/MapViewer.jsx";

export default function DeliveryView({ 
  riders, 
  orders, 
  onSimulateRide, 
  onUpdateOrderStatus, 
  activeRiderLocation 
}) {
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || "rider_1");
  const [isSimulating, setIsSimulating] = useState(false);

  const currentRider = riders.find(r => r.id === selectedRiderId) || riders[0];

  // Find assigned active order for this rider, or an order waiting for pickup
  const activeOrder = orders.find(o => 
    (o.assignedRiderId === currentRider.id && o.status !== "delivered") ||
    (o.status === "ready" && !o.assignedRiderId)
  ) || orders.find(o => o.status !== "delivered") || orders[0];

  // Map markers & route
  const mapMarkers = [];
  let routeCoords = [];

  if (activeOrder && currentRider) {
    // Current Rider position
    const riderCoords = (activeRiderLocation && activeRiderLocation.riderId === currentRider.id)
      ? activeRiderLocation.currentLocation
      : currentRider.currentLocation;

    mapMarkers.push({
      lat: riderCoords.lat,
      lng: riderCoords.lng,
      type: "rider",
      popup: `<b>${currentRider.name}</b><br/>${currentRider.vehicle}`
    });

    // Restaurant Pickup
    mapMarkers.push({
      lat: activeOrder.restaurantCoords.lat,
      lng: activeOrder.restaurantCoords.lng,
      type: "restaurant",
      popup: `<b>Pickup: ${activeOrder.restaurantName}</b>`
    });

    // Customer Drop-off
    mapMarkers.push({
      lat: activeOrder.customer.coordinates.lat,
      lng: activeOrder.customer.coordinates.lng,
      type: "customer",
      popup: `<b>Drop: ${activeOrder.customer.name}</b><br/>${activeOrder.customer.address}`
    });

    if (activeOrder.route?.coordinates) {
      routeCoords = activeOrder.route.coordinates;
    }
  }

  const handleStartSimulation = async () => {
    if (!activeOrder) return;
    setIsSimulating(true);
    await onSimulateRide(currentRider.id, activeOrder.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Rider Profile Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{currentRider?.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                ⭐ {currentRider?.rating}
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentRider?.vehicle} • {currentRider?.phone}</p>
          </div>
        </div>

        {/* Stats & Switcher */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium">Today's Earnings</span>
            <p className="text-base font-extrabold text-slate-900">₹{currentRider?.earningsToday}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium">Deliveries Done</span>
            <p className="text-base font-extrabold text-emerald-600">{currentRider?.completedDeliveries}</p>
          </div>

          <select
            value={selectedRiderId}
            onChange={e => setSelectedRiderId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            {riders.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.vehicle.split(" ")[0]})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Delivery Task Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Task Card */}
        <div className="lg:col-span-5 space-y-4">
          {activeOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase">Assigned Delivery Task</span>
                  <h3 className="font-extrabold text-lg text-slate-900">{activeOrder.id}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                    Payout: ₹65
                  </span>
                </div>
              </div>

              {/* Waypoint Steps */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                    <p className="text-xs font-bold text-slate-800">{activeOrder.restaurantName}</p>
                  </div>
                </div>

                <div className="border-l-2 border-dashed border-slate-300 ml-3 h-4" />

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Drop-off</span>
                    <p className="text-xs font-bold text-slate-800">{activeOrder.customer.name}</p>
                    <p className="text-[11px] text-slate-500">{activeOrder.customer.address}</p>
                  </div>
                </div>
              </div>

              {/* GPS Ride Simulator Control (Module 6 Standout) */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-extrabold text-emerald-900">Live GPS Simulation Engine</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Socket.IO
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Simulates rider movement along the OSRM road coordinates in real-time. Watch the bike move on the map!
                </p>

                <button
                  onClick={handleStartSimulation}
                  disabled={activeOrder.status === "delivered"}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> 
                  {activeOrder.status === "out_for_delivery" ? "Simulating Active Ride..." : "Simulate Real-Time Ride on Map"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onUpdateOrderStatus(activeOrder.id, "out_for_delivery", currentRider.id)}
                  disabled={activeOrder.status === "out_for_delivery" || activeOrder.status === "delivered"}
                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                >
                  Picked Up Order
                </button>
                <button
                  onClick={() => onUpdateOrderStatus(activeOrder.id, "delivered", currentRider.id)}
                  disabled={activeOrder.status === "delivered"}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                >
                  Mark Delivered ✓
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              No active tasks right now.
            </div>
          )}
        </div>

        {/* Right: Interactive Navigation Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600 animate-spin" />
                <h3 className="font-bold text-sm text-slate-900">Rider Navigation View</h3>
              </div>
              <span className="text-xs font-bold text-slate-600">
                {activeOrder?.distanceKm || 2.4} km • ~{activeOrder?.estimatedDeliveryMins || 15} mins
              </span>
            </div>

            <MapViewer
              markers={mapMarkers}
              routeCoordinates={routeCoords}
              routeColor="#10b981"
              height="460px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

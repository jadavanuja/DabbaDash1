import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Leaf, 
  TrendingDown, 
  Fuel, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  MapPin, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import MapViewer from "../components/MapViewer.jsx";

export default function BatchingLabView({ orders, riders, onExecuteBatch }) {
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDispatched, setIsDispatched] = useState(false);

  useEffect(() => {
    fetchBatchOpportunities();
  }, [orders]);

  const fetchBatchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/batching/opportunities");
      if (res.ok) {
        const data = await res.json();
        if (data.opportunities && data.opportunities.length > 0) {
          setBatchData(data.opportunities[0]);
        }
      }
    } catch (err) {
      console.error("Batching fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!batchData) return;
    const orderIds = [batchData.orderA.id, batchData.orderB.id];
    const riderId = batchData.assignedRider?.id || riders[0]?.id;
    await onExecuteBatch(orderIds, riderId);
    setIsDispatched(true);
  };

  // Build markers and route for the map
  const markers = [];
  let routeCoords = [];

  if (batchData) {
    const analysis = batchData.analysis;
    const rider = batchData.assignedRider;

    if (rider) {
      markers.push({
        lat: rider.currentLocation.lat,
        lng: rider.currentLocation.lng,
        type: "rider",
        popup: `<b>Rider: ${rider.name}</b><br/>Selected for Batch`
      });
    }

    if (analysis && analysis.optimalSequence) {
      analysis.optimalSequence.forEach((step, index) => {
        markers.push({
          lat: step.lat,
          lng: step.lng,
          type: "waypoint",
          badge: `${index + 1}`,
          popup: `<b>Stop ${index + 1}: ${step.label}</b>`
        });
      });
    }

    if (analysis?.route?.coordinates) {
      routeCoords = analysis.route.coordinates;
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/10 rounded-lg">
                <Zap className="w-5 h-5 text-amber-300" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">
                Smart Multiple Order Management & Route Optimizer
              </h2>
            </div>
            <p className="text-xs text-purple-100 max-w-2xl">
              DabbaDash solves the <b>Precedence-Constrained Vehicle Routing Problem (VRPTW)</b> to dynamically cluster nearby orders, reducing rider travel distance and delivery emissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold border border-white/20">
              Module 4 & 5 Core
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <span className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full inline-block animate-spin mb-2" />
          <p className="text-sm font-semibold">Scanning order pool for spatial corridor clustering...</p>
        </div>
      ) : batchData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Algorithmic Comparison & Metrics */}
          <div className="lg:col-span-5 space-y-4">
            {/* Efficiency KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                  <TrendingDown className="w-4 h-4" /> Distance Saved
                </div>
                <p className="text-2xl font-black text-emerald-900">
                  {batchData.analysis.distanceSavedKm} <span className="text-sm font-semibold">km</span>
                </p>
                <span className="text-[11px] font-bold text-emerald-600">
                  +{batchData.analysis.percentageEfficiency}% Route Efficiency
                </span>
              </div>

              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-1.5 text-teal-700 text-xs font-bold mb-1">
                  <Leaf className="w-4 h-4" /> CO2 Reduced
                </div>
                <p className="text-2xl font-black text-teal-900">
                  {batchData.analysis.co2SavedGrams} <span className="text-sm font-semibold">g</span>
                </p>
                <span className="text-[11px] font-bold text-teal-600">
                  Clean Green Logistics
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison: Traditional vs DabbaDash */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" /> Dispatch Comparison Matrix
              </h3>

              <div className="space-y-3">
                {/* Traditional Mode */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Traditional (2 Separate Riders)</span>
                    <span className="text-red-600">{batchData.analysis.unbatchedDistanceKm} km</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    2 riders dispatched independently. Redundant round-trip travel along the same corridor.
                  </p>
                </div>

                {/* DabbaDash Smart Batched */}
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-purple-900">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> DabbaDash Smart Batch
                    </span>
                    <span className="text-emerald-700 font-extrabold">{batchData.analysis.batchedDistanceKm} km</span>
                  </div>
                  <p className="text-purple-700 text-[11px]">
                    1 rider assigned both orders. Pickups and deliveries clustered into optimal multi-stop sequence.
                  </p>
                </div>
              </div>

              {/* Waypoint Sequence */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Optimal Stop Sequence:</span>
                <div className="mt-2 space-y-2">
                  {batchData.analysis.optimalSequence?.map((wp, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{wp.label}</span>
                      <span className="ml-auto text-[10px] text-slate-400 uppercase font-bold">{wp.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch Action Button */}
              <button
                onClick={handleDispatch}
                disabled={isDispatched}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
              >
                {isDispatched ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Batch Dispatched to {batchData.assignedRider?.name}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" /> Execute Smart Batch Dispatch
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Multi-Stop Route Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                  <h3 className="font-bold text-sm text-slate-900">Multi-Stop TSP Route Geometry</h3>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  OSRM Road Network
                </span>
              </div>

              <MapViewer
                markers={markers}
                routeCoordinates={routeCoords}
                routeColor="#9333ea"
                height="500px"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <p className="text-sm font-semibold">No active batch opportunities right now.</p>
          <p className="text-xs text-slate-400">Place 2 orders from the Customer view to trigger smart corridor batching!</p>
        </div>
      )}
    </div>
  );
}

// Smart Multiple Order Management & Batching Engine
// Implementation of Module 5 for DabbaDash: LastMile Bite Battle

import { calculateHaversineDistance, getOptimizedRoute } from "./osrmService.js";

/**
 * Checks if two orders are eligible for clustering/batching
 * Criteria:
 * 1. Pickups <= 2.5 km apart
 * 2. Drop-offs <= 3.5 km apart
 * 3. Both orders not yet delivered
 */
export function areOrdersBatchable(orderA, orderB) {
  if (!orderA || !orderB || orderA.id === orderB.id) return false;

  const pickupDist = calculateHaversineDistance(
    orderA.restaurantCoords.lat,
    orderA.restaurantCoords.lng,
    orderB.restaurantCoords.lat,
    orderB.restaurantCoords.lng
  );

  const dropoffDist = calculateHaversineDistance(
    orderA.customer.coordinates.lat,
    orderA.customer.coordinates.lng,
    orderB.customer.coordinates.lat,
    orderB.customer.coordinates.lng
  );

  // Feasibility criteria: nearby pickups and corridor delivery
  const isDistanceFeasible = pickupDist <= 2.5 && dropoffDist <= 3.5;
  const isStatusFeasible =
    ["placed", "accepted", "preparing", "ready"].includes(orderA.status) &&
    ["placed", "accepted", "preparing", "ready"].includes(orderB.status);

  return {
    feasible: isDistanceFeasible && isStatusFeasible,
    pickupDistanceKm: pickupDist,
    dropoffDistanceKm: dropoffDist
  };
}

/**
 * Solves Precedence-Constrained Delivery Sequencing for 2 orders:
 * Start (Rider) -> Pickup1, Pickup2, Dropoff1, Dropoff2
 * Evaluates valid order permutations where each Pickup precedes its Dropoff:
 * 1. P1 -> P2 -> D1 -> D2
 * 2. P1 -> P2 -> D2 -> D1
 * 3. P1 -> D1 -> P2 -> D2
 * 4. P2 -> P1 -> D2 -> D1
 * 5. P2 -> P1 -> D1 -> D2
 * 6. P2 -> D2 -> P1 -> D1
 */
export async function calculateOptimalBatchSequence(riderLocation, order1, order2) {
  const P1 = { ...order1.restaurantCoords, label: `Pickup: ${order1.restaurantName}`, type: "pickup", orderId: order1.id };
  const P2 = { ...order2.restaurantCoords, label: `Pickup: ${order2.restaurantName}`, type: "pickup", orderId: order2.id };
  const D1 = { ...order1.customer.coordinates, label: `Drop: ${order1.customer.name}`, type: "dropoff", orderId: order1.id };
  const D2 = { ...order2.customer.coordinates, label: `Drop: ${order2.customer.name}`, type: "dropoff", orderId: order2.id };

  const candidateSequences = [
    [P1, P2, D1, D2],
    [P1, P2, D2, D1],
    [P1, D1, P2, D2],
    [P2, P1, D2, D1],
    [P2, P1, D1, D2],
    [P2, D2, P1, D1]
  ];

  let bestSequence = null;
  let minDistance = Infinity;

  for (const seq of candidateSequences) {
    let currentDist = calculateHaversineDistance(riderLocation.lat, riderLocation.lng, seq[0].lat, seq[0].lng);
    for (let i = 0; i < seq.length - 1; i++) {
      currentDist += calculateHaversineDistance(seq[i].lat, seq[i].lng, seq[i + 1].lat, seq[i + 1].lng);
    }

    if (currentDist < minDistance) {
      minDistance = currentDist;
      bestSequence = seq;
    }
  }

  // Calculate Single-Delivery Baseline (2 separate delivery riders)
  const single1Dist =
    calculateHaversineDistance(riderLocation.lat, riderLocation.lng, P1.lat, P1.lng) +
    calculateHaversineDistance(P1.lat, P1.lng, D1.lat, D1.lng);

  const single2Dist =
    calculateHaversineDistance(riderLocation.lat, riderLocation.lng, P2.lat, P2.lng) +
    calculateHaversineDistance(P2.lat, P2.lng, D2.lat, D2.lng);

  const unbatchedTotalKm = Number((single1Dist + single2Dist).toFixed(2));
  const batchedTotalKm = Number(minDistance.toFixed(2));
  const distanceSavedKm = Number(Math.max(0, unbatchedTotalKm - batchedTotalKm).toFixed(2));
  const percentageEfficiency = Math.round((distanceSavedKm / unbatchedTotalKm) * 100);

  // Carbon Emission Savings (Avg 2-wheeler emits ~52g CO2 per km)
  const co2SavedGrams = Math.round(distanceSavedKm * 52);

  // Fuel Cost Savings (Avg fuel ₹3.2 per km for delivery bike)
  const costSavedInr = Math.round(distanceSavedKm * 3.2);

  // Full road polyline routing through the optimal waypoints
  const fullWaypoints = [riderLocation, ...bestSequence];
  const routeDetails = await getOptimizedRoute(fullWaypoints);

  return {
    orders: [order1.id, order2.id],
    optimalSequence: bestSequence,
    batchedDistanceKm: batchedTotalKm,
    unbatchedDistanceKm: unbatchedTotalKm,
    distanceSavedKm,
    percentageEfficiency,
    co2SavedGrams,
    costSavedInr,
    route: routeDetails
  };
}

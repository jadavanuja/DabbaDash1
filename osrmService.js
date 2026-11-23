// OSRM & Geo Routing Service for DabbaDash
// OpenStreetMap road-network routing with dynamic fallback

// Haversine straight-line distance in km
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Generate realistic intermediate road waypoints as an offline fallback
function generateFallbackWaypoints(points) {
  const allCoords = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const steps = 15;
    for (let s = 0; s <= steps; s++) {
      const ratio = s / steps;
      // Linear interpolation with a gentle road curvature arc
      const arc = Math.sin(ratio * Math.PI) * 0.0018;
      const lat = p1.lat + (p2.lat - p1.lat) * ratio + arc;
      const lng = p1.lng + (p2.lng - p1.lng) * ratio - arc * 0.5;
      allCoords.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    }
  }
  return allCoords;
}

/**
 * Fetch optimal driving route through an array of {lat, lng} waypoints
 * Uses Open Source Routing Machine (OSRM)
 */
export async function getOptimizedRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    throw new Error("At least 2 waypoints are required");
  }

  // Format coords for OSRM: lng,lat;lng,lat
  const coordString = waypoints.map(p => `${p.lng},${p.lat}`).join(";");
  const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM GeoJSON coordinates are [lng, lat], convert to Leaflet [lat, lng]
        const leafletCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);
        const distanceKm = Number((route.distance / 1000).toFixed(2));
        const durationMins = Math.ceil(route.duration / 60);

        // Turn-by-turn instruction extraction
        const steps = [];
        if (route.legs) {
          route.legs.forEach((leg, legIdx) => {
            leg.steps.forEach(step => {
              if (step.maneuver && step.name) {
                steps.push({
                  instruction: `${step.maneuver.type} onto ${step.name || "road"}`,
                  distanceM: Math.round(step.distance),
                  durationS: Math.round(step.duration)
                });
              }
            });
          });
        }

        return {
          source: "OSRM_API",
          distanceKm,
          durationMins,
          coordinates: leafletCoords,
          steps: steps.slice(0, 10)
        };
      }
    }
  } catch (err) {
    // If network fails or timeout, use fallback
    console.warn("OSRM routing unavailable, using high-fidelity fallback:", err.message);
  }

  // Fallback route computation
  let totalDist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDist += calculateHaversineDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }
  // Urban road factor (~1.25x straight line)
  const estimatedRoadDistanceKm = Number((totalDist * 1.25).toFixed(2));
  // 22 km/h average speed in city traffic + 3 min buffer
  const estimatedDurationMins = Math.ceil((estimatedRoadDistanceKm / 22) * 60) + 3;
  const simulatedCoords = generateFallbackWaypoints(waypoints);

  return {
    source: "FALLBACK_ENGINE",
    distanceKm: estimatedRoadDistanceKm,
    durationMins: estimatedDurationMins,
    coordinates: simulatedCoords,
    steps: [
      { instruction: "Head toward pickup location", distanceM: 400, durationS: 60 },
      { instruction: "Follow main corridor to delivery address", distanceM: Math.round(estimatedRoadDistanceKm * 800), durationS: estimatedDurationMins * 45 },
      { instruction: "Arrive at customer doorstep", distanceM: 100, durationS: 30 }
    ]
  };
}

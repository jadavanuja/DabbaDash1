import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar.jsx";
import CustomerView from "./pages/CustomerView.jsx";
import RestaurantView from "./pages/RestaurantView.jsx";
import DeliveryView from "./pages/DeliveryView.jsx";
import BatchingLabView from "./pages/BatchingLabView.jsx";
import AdminView from "./pages/AdminView.jsx";
import AuthModal from "./components/AuthModal.jsx";
import SecurityDrawer from "./components/SecurityDrawer.jsx";
import { Bell, ShieldCheck } from "lucide-react";

export default function App() {
  const [activeRole, setActiveRole] = useState("customer");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem("dabbadash_jwt") || "");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("dabbadash_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [activeRiderLocation, setActiveRiderLocation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, desc) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Helper for authenticated API calls with Bearer Token
  const authFetch = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  // 1. Initial Data Fetching
  const fetchAllData = async () => {
    try {
      const [restRes, ridersRes, ordersRes, metricsRes] = await Promise.all([
        fetch("/api/restaurants"),
        fetch("/api/riders"),
        fetch("/api/orders"),
        fetch("/api/admin/metrics")
      ]);

      if (restRes.ok) setRestaurants(await restRes.json());
      if (ridersRes.ok) setRiders(await ridersRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } catch (err) {
      console.error("Initial load error:", err);
    }
  };

  // Auto-login default demo user if not logged in
  useEffect(() => {
    if (!token) {
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "customer.aman@gmail.com", password: "Customer@123" })
      })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            setToken(data.token);
            setCurrentUser(data.user);
            localStorage.setItem("dabbadash_jwt", data.token);
            localStorage.setItem("dabbadash_user", JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  }, []);

  // 2. Initialize Socket.IO connection
  useEffect(() => {
    fetchAllData();

    const socketInstance = io(window.location.origin.includes("3000") ? "http://localhost:5000" : "/", {
      transports: ["websocket", "polling"]
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("order_created", newOrder => {
      setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
      showToast("New Order Placed!", `${newOrder.id} from ${newOrder.customer.name} (₹${newOrder.totalAmount})`);
    });

    socketInstance.on("order_updated", updatedOrder => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      showToast("Order Status Update", `${updatedOrder.id} is now ${updatedOrder.status.toUpperCase()}`);
    });

    socketInstance.on("rider_location_updated", payload => {
      setActiveRiderLocation(payload);
      setRiders(prev => prev.map(r => r.id === payload.riderId ? { ...r, currentLocation: payload.currentLocation } : r));
    });

    socketInstance.on("batch_dispatched", payload => {
      fetchAllData();
      showToast("⚡ Smart Batch Dispatched!", `Orders assigned to ${payload.rider.name}`);
    });

    socketInstance.on("admin_metrics_updated", newMetrics => {
      setMetrics(newMetrics);
    });

    socketInstance.on("system_reset", () => {
      fetchAllData();
      showToast("System Reset", "Demo state reset to initial baseline");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleLoginSuccess = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
    localStorage.setItem("dabbadash_jwt", jwtToken);
    localStorage.setItem("dabbadash_user", JSON.stringify(user));

    if (user.role === "admin") setActiveRole("admin");
    else if (user.role === "restaurant") setActiveRole("restaurant");
    else if (user.role === "delivery") setActiveRole("delivery");
    else setActiveRole("customer");

    showToast("Authentication Successful", `Signed in as ${user.name} [Role: ${user.role.toUpperCase()}]`);
  };

  // API Action Handlers
  const handleCreateOrder = async (orderPayload) => {
    try {
      const res = await authFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("Order Rejected by Security Filter", data.error || "Integrity validation failed");
        return null;
      }
      return data;
    } catch (err) {
      console.error("Order creation failed:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, riderId = null) => {
    try {
      await authFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, riderId })
      });
    } catch (err) {
      console.error("Update status failed:", err);
    }
  };

  const handleToggleMenuItem = async (restaurantId, itemId) => {
    try {
      await authFetch(`/api/restaurants/${restaurantId}/menu/${itemId}/toggle`, {
        method: "PATCH"
      });
      fetchAllData();
    } catch (err) {
      console.error("Menu toggle failed:", err);
    }
  };

  const handleSimulateRide = async (riderId, orderId) => {
    try {
      await authFetch(`/api/riders/${riderId}/simulate-ride`, {
        method: "POST",
        body: JSON.stringify({ orderId })
      });
      showToast("Simulation Started", "Rider GPS is streaming live over Socket.IO");
    } catch (err) {
      console.error("Ride simulation failed:", err);
    }
  };

  const handleExecuteBatch = async (orderIds, riderId) => {
    try {
      const res = await authFetch("/api/batching/execute", {
        method: "POST",
        body: JSON.stringify({ orderIds, riderId })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Batch dispatch failed:", err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await authFetch("/api/admin/reset", { method: "POST" });
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  const activeOrdersCount = orders.filter(o => o.status !== "delivered").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Top Persistent Role Switcher Navbar */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        isConnected={isConnected}
        onReset={handleResetDemo}
        activeOrdersCount={activeOrdersCount}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === "customer" && (
          <CustomerView
            restaurants={restaurants}
            orders={orders}
            riders={riders}
            onCreateOrder={handleCreateOrder}
            activeRiderLocation={activeRiderLocation}
          />
        )}

        {activeRole === "restaurant" && (
          <RestaurantView
            restaurants={restaurants}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onToggleMenuItem={handleToggleMenuItem}
          />
        )}

        {activeRole === "delivery" && (
          <DeliveryView
            riders={riders}
            orders={orders}
            onSimulateRide={handleSimulateRide}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            activeRiderLocation={activeRiderLocation}
          />
        )}

        {activeRole === "batching" && (
          <BatchingLabView
            orders={orders}
            riders={riders}
            onExecuteBatch={handleExecuteBatch}
          />
        )}

        {activeRole === "admin" && (
          <AdminView
            metrics={metrics}
            orders={orders}
            riders={riders}
            restaurants={restaurants}
            onReset={handleResetDemo}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentRole={activeRole}
      />

      {/* Security Audit Drawer */}
      <SecurityDrawer
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        currentUser={currentUser}
        token={token}
      />

      {/* Real-Time Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h5 className="font-bold text-xs">{toastMessage.title}</h5>
            <p className="text-[11px] text-slate-300">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            DabbaDash • LastMile Bite Battle • MERN + Leaflet + OSRM + Socket.IO
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>JWT & bcrypt Protected • Express Rate Limiting Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Comprehensive initial data for DabbaDash
// Coordinates are centered around Bangalore Indiranagar / Koramangala tech hub

export const initialRestaurants = [
  {
    id: "rest_1",
    name: "Punjab Grill & Tandoori Treats",
    cuisine: "North Indian, Kebabs, Biryani",
    rating: 4.8,
    reviewsCount: 342,
    deliveryTime: "25-35 mins",
    avgCostForTwo: 550,
    address: "100ft Road, Indiranagar, Bengaluru",
    coordinates: { lat: 12.9719, lng: 77.6412 },
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
    isOpen: true,
    menu: [
      {
        id: "item_101",
        name: "Butter Chicken Supreme",
        description: "Tender roasted chicken in rich velvety tomato & butter gravy",
        price: 360,
        isVeg: false,
        category: "Mains",
        prepTimeMins: 15,
        available: true,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_102",
        name: "Paneer Tikka Masala",
        description: "Charcoal-grilled cottage cheese cubes in aromatic spiced gravy",
        price: 310,
        isVeg: true,
        category: "Mains",
        prepTimeMins: 12,
        available: true,
        image: "https://images.unsplash.com/photo-1567184109411-b28f2703a1ab?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_103",
        name: "Awadhi Dum Biryani",
        description: "Fragrant basmati rice layered with marinated meat and saffron",
        price: 340,
        isVeg: false,
        category: "Biryani & Rice",
        prepTimeMins: 18,
        available: true,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_104",
        name: "Garlic Butter Naan (2 pcs)",
        description: "Crispy tandoor-baked flatbread infused with roasted garlic",
        price: 90,
        isVeg: true,
        category: "Breads",
        prepTimeMins: 8,
        available: true,
        image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "rest_2",
    name: "Dosa Express & South Tiffin Hub",
    cuisine: "South Indian, Breakfast, Beverages",
    rating: 4.7,
    reviewsCount: 512,
    deliveryTime: "20-30 mins",
    avgCostForTwo: 280,
    address: "CMH Road, Indiranagar, Bengaluru",
    coordinates: { lat: 12.9784, lng: 77.6441 },
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    isOpen: true,
    menu: [
      {
        id: "item_201",
        name: "Ghee Roast Masala Dosa",
        description: "Golden crisp crepe roasted in pure desi ghee, spiced potato stuffing",
        price: 150,
        isVeg: true,
        category: "Tiffin",
        prepTimeMins: 10,
        available: true,
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_202",
        name: "Steamed Button Idli & Vada Combo",
        description: "Three soft fluffy rice cakes, crunchy medu vada with sambar & coconut chutney",
        price: 120,
        isVeg: true,
        category: "Tiffin",
        prepTimeMins: 6,
        available: true,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_203",
        name: "Authentic Filter Kaapi",
        description: "Traditional South Indian frothy chicory-blend coffee",
        price: 60,
        isVeg: true,
        category: "Beverages",
        prepTimeMins: 5,
        available: true,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "rest_3",
    name: "Bao & Wok Asian Kitchen",
    cuisine: "Pan-Asian, Dimsums, Noodles, Bowls",
    rating: 4.6,
    reviewsCount: 289,
    deliveryTime: "30-40 mins",
    avgCostForTwo: 600,
    address: "12th Main, HAL 2nd Stage, Bengaluru",
    coordinates: { lat: 12.9698, lng: 77.6354 },
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
    isOpen: true,
    menu: [
      {
        id: "item_301",
        name: "Chilli Garlic Hakka Noodles",
        description: "Wok-tossed egg noodles with crisp vegetables and fiery garlic oil",
        price: 240,
        isVeg: true,
        category: "Mains",
        prepTimeMins: 14,
        available: true,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_302",
        name: "Crystal Veg Dimsums (6 pcs)",
        description: "Translucent dumplings stuffed with water chestnut, mushrooms and greens",
        price: 260,
        isVeg: true,
        category: "Starters",
        prepTimeMins: 15,
        available: true,
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_303",
        name: "Crispy Kung Pao Chicken",
        description: "Tossed with crunchy roasted peanuts, dried chilies and Szechuan pepper",
        price: 320,
        isVeg: false,
        category: "Starters",
        prepTimeMins: 15,
        available: true,
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "rest_4",
    name: "The Burger Cartel",
    cuisine: "Gourmet Burgers, Shakes, Loaded Fries",
    rating: 4.9,
    reviewsCount: 630,
    deliveryTime: "25-35 mins",
    avgCostForTwo: 500,
    address: "Double Road, Indiranagar, Bengaluru",
    coordinates: { lat: 12.9642, lng: 77.6439 },
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    isOpen: true,
    menu: [
      {
        id: "item_401",
        name: "Truffle Mushroom Smash Burger",
        description: "Double patty, melted aged cheddar, sautéed portobello, truffle mayo on brioche",
        price: 320,
        isVeg: false,
        category: "Burgers",
        prepTimeMins: 14,
        available: true,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_402",
        name: "Cheesy Peri-Peri Loaded Fries",
        description: "Golden skin-on potato fries smothered in house cheese sauce and peri-peri dust",
        price: 180,
        isVeg: true,
        category: "Sides",
        prepTimeMins: 8,
        available: true,
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80"
      },
      {
        id: "item_403",
        name: "Thick Belgian Chocolate Shake",
        description: "Crafted with imported dark chocolate ganache and full cream milk",
        price: 190,
        isVeg: true,
        category: "Shakes",
        prepTimeMins: 6,
        available: true,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80"
      }
    ]
  }
];

export const initialRiders = [
  {
    id: "rider_1",
    name: "Vikram Singh",
    phone: "+91 98765 43210",
    vehicle: "Honda Activa (KA-03-HA-4211)",
    rating: 4.9,
    completedDeliveries: 184,
    status: "idle", // 'idle' | 'assigned' | 'picking_up' | 'delivering'
    currentLocation: { lat: 12.9725, lng: 77.6380 },
    activeOrderId: null,
    earningsToday: 740
  },
  {
    id: "rider_2",
    name: "Rahul Sharma",
    phone: "+91 98450 12890",
    vehicle: "Ather 450X EV (KA-01-EQ-9088)",
    rating: 4.8,
    completedDeliveries: 142,
    status: "idle",
    currentLocation: { lat: 12.9760, lng: 77.6420 },
    activeOrderId: null,
    earningsToday: 620
  },
  {
    id: "rider_3",
    name: "Amit Patel",
    phone: "+91 97312 66540",
    vehicle: "TVS Jupiter (KA-04-MB-3190)",
    rating: 4.7,
    completedDeliveries: 98,
    status: "idle",
    currentLocation: { lat: 12.9680, lng: 77.6410 },
    activeOrderId: null,
    earningsToday: 410
  }
];

export const initialOrders = [
  {
    id: "ORD-9821",
    customer: {
      name: "Pooja Hegde",
      phone: "+91 98112 33445",
      address: "Flat 402, Sunshine Apts, 6th Cross, Indiranagar",
      coordinates: { lat: 12.9752, lng: 77.6475 }
    },
    restaurantId: "rest_1",
    restaurantName: "Punjab Grill & Tandoori Treats",
    restaurantCoords: { lat: 12.9719, lng: 77.6412 },
    items: [
      { id: "item_101", name: "Butter Chicken Supreme", price: 360, quantity: 1 },
      { id: "item_104", name: "Garlic Butter Naan (2 pcs)", price: 90, quantity: 2 }
    ],
    totalAmount: 540,
    paymentMethod: "Razorpay (Online UPI)",
    paymentStatus: "PAID",
    status: "preparing", // placed -> accepted -> preparing -> ready -> out_for_delivery -> delivered
    assignedRiderId: "rider_1",
    assignedRiderName: "Vikram Singh",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    estimatedDeliveryMins: 22,
    distanceKm: 2.1
  },
  {
    id: "ORD-9822",
    customer: {
      name: "Arjun Mehta",
      phone: "+91 99001 22334",
      address: "12th Main Road, HAL 2nd Stage, Indiranagar",
      coordinates: { lat: 12.9738, lng: 77.6491 }
    },
    restaurantId: "rest_1",
    restaurantName: "Punjab Grill & Tandoori Treats",
    restaurantCoords: { lat: 12.9719, lng: 77.6412 },
    items: [
      { id: "item_102", name: "Paneer Tikka Masala", price: 310, quantity: 1 },
      { id: "item_103", name: "Awadhi Dum Biryani", price: 340, quantity: 1 }
    ],
    totalAmount: 650,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "PENDING",
    status: "ready",
    assignedRiderId: null,
    assignedRiderName: null,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    estimatedDeliveryMins: 15,
    distanceKm: 2.3
  }
];

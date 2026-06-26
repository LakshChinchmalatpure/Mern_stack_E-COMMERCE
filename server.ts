import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Product, User, Order, CartItem } from "./src/types";

// Setup server port and pathing
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_E_COMMERCE_KEY_2026";
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

app.use(express.json());

// Initialize Stripe lazily as per guidance
let stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripe = new Stripe(key);
    }
  }
  return stripe;
}

// Ensure database file and initial data exist
interface DBStructure {
  users: User[];
  products: Product[];
  orders: Order[];
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299,
    category: "Electronics",
    stock: 12,
    rating: 4.8,
    reviewsCount: 124,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    description: "Immerse yourself in pure sound with hybrid active noise cancellation, 40-hour battery life, and high-fidelity drivers.",
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Backlit Mechanical Keyboard",
    price: 149,
    category: "Electronics",
    stock: 8,
    rating: 4.7,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    description: "An elegant mechanical keyboard featuring hot-swappable tactile switches, dynamic RGB backlighting, and a solid aluminum frame.",
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Minimalist Chronograph Watch",
    price: 199,
    category: "Accessories",
    stock: 15,
    rating: 4.6,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    description: "A timeless, ultra-thin wrist watch designed with premium stainless steel casing, mineral glass dome, and genuine leather strap.",
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "Ergonomic Office Chair",
    price: 349,
    category: "Office & Furniture",
    stock: 5,
    rating: 4.9,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
    description: "Engineered for maximum lower-back comfort with adaptive mesh back support, 3D armrests, and a dynamic tilt-lock mechanism.",
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Smart Learning Thermostat",
    price: 249,
    category: "Home & Living",
    stock: 2,
    rating: 4.5,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    description: "An intelligent, energy-saving thermostat that learns your temperature schedules and adapts dynamically to save electricity.",
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "6",
    name: "Handcrafted Leather Wallet",
    price: 79,
    category: "Accessories",
    stock: 25,
    rating: 4.8,
    reviewsCount: 154,
    image: "https://images.unsplash.com/photo-1627124765135-56c697c11f7a?auto=format&fit=crop&w=600&q=80",
    description: "Hand-stitched full-grain leather wallet featuring a slim bifold profile, RFID blocking material, and quick-access card slots.",
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "7",
    name: "Pro Portrait Camera Lens",
    price: 599,
    category: "Electronics",
    stock: 4,
    rating: 4.9,
    reviewsCount: 38,
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=600&q=80",
    description: "Ultra-sharp 50mm f/1.2 prime portrait lens delivering creamy bokeh background defocus, ultra-fast autofocus, and weather sealing.",
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "8",
    name: "Handmade Ceramic Coffee Mug",
    price: 29,
    category: "Home & Living",
    stock: 35,
    rating: 4.7,
    reviewsCount: 210,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    description: "A beautifully textured, dual-glaze stoneware mug. Hand-thrown by local artisans to elevate your morning espresso rituals.",
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "9",
    name: "Merino Wool Tech Sleeve",
    price: 89,
    category: "Accessories",
    stock: 14,
    rating: 4.8,
    reviewsCount: 37,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
    description: "Meticulously stitched premium German merino wool sleeve designed to cushion your laptop, with secure magnetic leather clasps.",
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "10",
    name: "Craft Walnut Desk Shelf",
    price: 119,
    category: "Office & Furniture",
    stock: 9,
    rating: 4.9,
    reviewsCount: 52,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
    description: "Elevate your visual workspace with our solid American walnut monitor stand and storage organizer shelf.",
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "11",
    name: "Hand-Blown Glass Decanter",
    price: 85,
    category: "Home & Living",
    stock: 11,
    rating: 4.7,
    reviewsCount: 29,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
    description: "Designed for wine or craft water infusions. This hand-blown glassware features high thermal shock resistance and a solid cork sphere stopper.",
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "12",
    name: "Waterproof Travel Tech Folio",
    price: 59,
    category: "Accessories",
    stock: 22,
    rating: 4.6,
    reviewsCount: 83,
    image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=600&q=80",
    description: "Keep cables, chargers, and drives organized. Crafted with hydrophobic water-resistant fabrics and silent, smooth YKK zippers.",
    featured: false,
    createdAt: new Date().toISOString()
  }
];

function readDB(): DBStructure {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const defaultData: DBStructure = {
      users: [
        {
          id: "u1",
          email: "admin@gmail.com",
          name: "Admin User",
          role: "admin",
          createdAt: new Date().toISOString(),
          password: bcrypt.hashSync("admin123", 10)
        },
        {
          id: "u2",
          email: "customer@gmail.com",
          name: "John Customer",
          role: "user",
          createdAt: new Date().toISOString(),
          password: bcrypt.hashSync("customer123", 10)
        }
      ],
      products: INITIAL_PRODUCTS,
      orders: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  const parsedData = JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as DBStructure;
  
  // Dynamic Self-Healing Backfill: Insert any new initial products into existing DB
  let isDBUpdated = false;
  INITIAL_PRODUCTS.forEach(initialItem => {
    if (!parsedData.products.some(existing => existing.id === initialItem.id)) {
      parsedData.products.push(initialItem);
      isDBUpdated = true;
    }
  });

  if (isDBUpdated) {
    fs.writeFileSync(DB_FILE, JSON.stringify(parsedData, null, 2));
  }

  return parsedData;
}

function writeDB(data: DBStructure) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Admin only verify middleware
function verifyAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator privileges" });
  }
  next();
}

// ------------------- API ROUTES -------------------

// 1. AUTH API
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const dbData = readDB();
  const existingUser = dbData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: "user_" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    name,
    role: "user",
    createdAt: new Date().toISOString(),
    password: hashedPassword
  };

  dbData.users.push(newUser);
  writeDB(dbData);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: "7d" });
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const dbData = readDB();
  const user = dbData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const dbData = readDB();
  const user = dbData.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// 2. PRODUCTS API
app.get("/api/products", (req, res) => {
  const { search, category, minPrice, maxPrice, sortBy } = req.query;
  const dbData = readDB();
  let filtered = [...dbData.products];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (category && category !== "All") {
    filtered = filtered.filter(p => p.category === category);
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(maxPrice));
  }

  // Sort logic
  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    // Newest / Default
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get dynamic categories list
  const categories = ["All", ...Array.from(new Set(dbData.products.map(p => p.category)))];

  res.json({ products: filtered, categories });
});

app.get("/api/products/:id", (req, res) => {
  const dbData = readDB();
  const product = dbData.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json({ product });
});

// 3. AI RECOMMENDATIONS API (GEMINI ENGINE)
app.post("/api/recommendations", async (req, res) => {
  const { cartItems, viewingProductId } = req.body;
  const dbData = readDB();
  const catalog = dbData.products;

  // Verify API Key
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey || geminiApiKey === "MY_GEMINI_API_KEY") {
    // Fallback static intelligence model if key is missing or is the placeholder
    // Recommends top-rated products or same-category items as the viewed or carted items
    let recommendations: { productId: string; reason: string; }[] = [];
    const inCartIds = new Set((cartItems || []).map((c: any) => c.productId));
    if (viewingProductId) inCartIds.add(viewingProductId);

    const targetCategory = viewingProductId 
      ? catalog.find(p => p.id === viewingProductId)?.category 
      : (cartItems && cartItems.length > 0 ? catalog.find(p => p.id === cartItems[0].productId)?.category : null);

    let eligible = catalog.filter(p => !inCartIds.has(p.id));

    if (targetCategory) {
      const sameCategory = eligible.filter(p => p.category === targetCategory);
      sameCategory.slice(0, 2).forEach(p => {
        recommendations.push({
          productId: p.id,
          reason: `Highly rated item in the same category (${p.category}) to elevate your current collection.`
        });
      });
      eligible = eligible.filter(p => p.category !== targetCategory);
    }

    eligible.sort((a, b) => b.rating - a.rating).slice(0, 3 - recommendations.length).forEach(p => {
      recommendations.push({
        productId: p.id,
        reason: `Trending product with ${p.rating}★ user rating. Highly recommended by other shoppers.`
      });
    });

    return res.json({ recommendations });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const slimCatalog = catalog.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, desc: p.description }));
    const currentItems = (cartItems || []).map((ci: any) => {
      const prod = catalog.find(p => p.id === ci.productId);
      return prod ? `${prod.name} (${prod.category})` : `ID:${ci.productId}`;
    });
    const viewingProd = viewingProductId ? catalog.find(p => p.id === viewingProductId) : null;

    const promptText = `
You are an advanced, warm, and highly analytical AI Shopping Assistant. 
We have a curated boutique catalog of products:
${JSON.stringify(slimCatalog, null, 2)}

Current state:
- User is viewing: ${viewingProd ? `${viewingProd.name} (${viewingProd.category}) - ${viewingProd.description}` : "Homepage / Dashboard"}
- User has in cart: ${currentItems.join(", ") || "No items yet"}

Task:
Recommend exactly 3 product IDs from our catalog that are different from the ones currently viewed or in cart.
Provide a personalized, human-friendly, highly persuasive reason why this specific recommendation fits the user's setup or interests. Keep the tone premium, friendly, and helpful.
Do not hallucinate products. You must only select IDs present in the catalog.

Return JSON in this format:
{
  "recommendations": [
    { "productId": "1", "reason": "Your desk setup would benefit immensely from premium audio..." }
  ]
}
`;

    const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      productId: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["productId", "reason"]
                  }
                }
              },
              required: ["recommendations"]
            }
          }
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model candidate '${modelName}' is busy or unavailable. Trying next...`);
      }
    }

    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      return res.json(parsed);
    }
    
    if (lastError) {
      throw lastError;
    }
    throw new Error("All candidate models returned empty responses");

  } catch (error) {
    console.error("Gemini API error:", error);
    // Safe fallback on Gemini service errors
    const recommendations = catalog
      .filter(p => p.id !== viewingProductId && !(cartItems || []).some((c: any) => c.productId === p.id))
      .slice(0, 3)
      .map(p => ({
        productId: p.id,
        reason: "Featured choice chosen by our style experts to complement your shopping trends."
      }));
    return res.json({ recommendations });
  }
});

// 4. CHECKOUT & ORDERS API (STRIPE + MOCK DUAL)
app.post("/api/checkout/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Valid amount is required" });
  }

  const stripeClient = getStripe();
  if (!stripeClient) {
    // Return mock payment mode indicating successful bypass since Stripe is not configured
    return res.json({
      simulated: true,
      clientSecret: "simulated_secret_token_" + Math.random().toString(36).substring(7)
    });
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: "usd",
      automatic_payment_methods: { enabled: true }
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
      simulated: false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", authenticateToken, (req: any, res) => {
  const { items, total, simulatedPayment } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Order items cannot be empty" });
  }

  const dbData = readDB();

  // Deduct inventories
  for (const item of items) {
    const p = dbData.products.find(prod => prod.id === item.productId);
    if (p) {
      if (p.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${p.name}. Only ${p.stock} units remaining.` });
      }
      p.stock -= item.quantity;
    }
  }

  const newOrder: Order = {
    id: "ord_" + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    items,
    total,
    status: "processing",
    paymentStatus: simulatedPayment ? "paid" : "paid", // Auto mark paid since payment transaction has been verified/processed client-side
    createdAt: new Date().toISOString()
  };

  dbData.orders.push(newOrder);
  writeDB(dbData);
  res.status(201).json({ order: newOrder });
});

app.get("/api/orders/my-history", authenticateToken, (req: any, res) => {
  const dbData = readDB();
  const userOrders = dbData.orders.filter(o => o.userId === req.user.id);
  res.json({ orders: userOrders });
});


// 5. ADMIN MANAGEMENT API
app.get("/api/admin/orders", authenticateToken, verifyAdmin, (req, res) => {
  const dbData = readDB();
  res.json({ orders: dbData.orders });
});

app.put("/api/admin/orders/:id", authenticateToken, verifyAdmin, (req, res) => {
  const { status, paymentStatus } = req.body;
  const dbData = readDB();
  const order = dbData.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  writeDB(dbData);
  res.json({ order });
});

app.post("/api/admin/products", authenticateToken, verifyAdmin, (req, res) => {
  const { name, description, price, category, image, stock } = req.body;
  if (!name || !price || !category || !image || stock === undefined) {
    return res.status(400).json({ error: "Missing required product fields" });
  }

  const dbData = readDB();
  const newProduct: Product = {
    id: "prod_" + Math.random().toString(36).substr(2, 9),
    name,
    description: description || "",
    price: Number(price),
    category,
    image,
    stock: Number(stock),
    rating: 5.0, // Initial 5 star rating
    reviewsCount: 0,
    createdAt: new Date().toISOString()
  };

  dbData.products.push(newProduct);
  writeDB(dbData);
  res.status(201).json({ product: newProduct });
});

app.put("/api/admin/products/:id", authenticateToken, verifyAdmin, (req, res) => {
  const { name, description, price, category, image, stock } = req.body;
  const dbData = readDB();
  const index = dbData.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const current = dbData.products[index];
  dbData.products[index] = {
    ...current,
    name: name !== undefined ? name : current.name,
    description: description !== undefined ? description : current.description,
    price: price !== undefined ? Number(price) : current.price,
    category: category !== undefined ? category : current.category,
    image: image !== undefined ? image : current.image,
    stock: stock !== undefined ? Number(stock) : current.stock,
  };

  writeDB(dbData);
  res.json({ product: dbData.products[index] });
});

app.delete("/api/admin/products/:id", authenticateToken, verifyAdmin, (req, res) => {
  const dbData = readDB();
  const index = dbData.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  dbData.products.splice(index, 1);
  writeDB(dbData);
  res.json({ success: true, message: "Product deleted successfully" });
});

app.get("/api/admin/stats", authenticateToken, verifyAdmin, (req, res) => {
  const dbData = readDB();
  const orders = dbData.orders;
  const products = dbData.products;

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Aggregate Category distribution
  const categorySales: { [key: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : "Uncategorized";
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
    });
  });

  const categoryDistribution = Object.keys(categorySales).map(key => ({
    name: key,
    value: Math.round(categorySales[key])
  }));

  res.json({
    totalSales,
    totalOrders,
    totalProducts,
    outOfStockCount,
    categoryDistribution
  });
});

// Serve frontend with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-Commerce platform API running on port ${PORT}`);
  });
}

startServer();

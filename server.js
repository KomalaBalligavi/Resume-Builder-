const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Provide a safe `fetch` fallback for Node versions that don't include global fetch
let fetchImpl;
try {
  fetchImpl = global.fetch || require('node-fetch');
} catch (e) {
  // node-fetch not installed and global.fetch missing; will error later with clear message
  fetchImpl = global.fetch;
}

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Simple storage
let users = [];
let resumes = [];

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.get("/builder", (req, res) => {
  res.sendFile(path.join(__dirname, "builder.html"));
});

// API Routes
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName
    };
    
    users.push(user);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      message: "User created successfully",
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// AI Assist endpoint (server-side proxy)
app.post("/api/ai/assist", async (req, res) => {
  try {
    const { type, title, description } = req.body || {};

    if (!type || type !== "bullets") {
      return res.status(400).json({ error: "Unsupported AI assist type" });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "AI provider key not configured on server" });
    }

    // Basic sanitization: redact emails and phone-like numbers before sending to provider
    const sanitize = (s = "") => {
      return s
        .replace(/\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "[redacted]")
        .replace(/\+?\d[\d\s\-()]{6,}\d/g, "[redacted]");
    };

    const userText = `${title || ""}\n\n${description || ""}`;
    const sanitized = sanitize(userText);

    // Build a clear prompt asking for a JSON array of bullets
    const prompt = `You are a professional resume writer.\nGiven the following job title and description, generate 3 concise achievement-oriented bullet points (10-18 words each). Use strong action verbs and quantify when possible. Return only a valid JSON array of strings (no extra text).\n\n${sanitized}`;

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional resume writer." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.6
    };

    // Log a short summary for debugging (do not log full user text)
    console.log(`[AI ASSIST] type=${type} titleLen=${(title||"").length} descLen=${(description||"").length}`);

    if (!fetchImpl) {
      console.error('No fetch implementation available on server. Install node-fetch or use Node 18+.');
      return res.status(500).json({ error: 'Server fetch unavailable. Please install node-fetch or upgrade Node.' });
    }

    const fetchRes = await fetchImpl("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await fetchRes.json();
    const content = data?.choices?.[0]?.message?.content || "";

    // Try to parse JSON array from model response
    let bullets = [];
    try {
      bullets = JSON.parse(content);
    } catch (err) {
      // Fallback: try to extract first JSON array substring
      const m = content.match(/\[[\s\S]*\]/);
      if (m) {
        try { bullets = JSON.parse(m[0]); } catch (e) { bullets = [content]; }
      } else {
        bullets = [content];
      }
    }

    res.json({ bullets, raw: content });
  } catch (error) {
    console.error("AI assist error:", error);
    res.status(500).json({ error: "AI assist failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("✅ Server running on http://localhost:" + PORT);
});

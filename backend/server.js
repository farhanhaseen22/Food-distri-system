const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Food resources data (this would normally come from a database)
const foodResources = {
  "corner brook": [
    {
      name: "Interfaith Food Bank - Corner Brook",
      address: "Corner Brook, NL",
      hours: "Tue/Thu 10AM-2PM",
      phone: "(709) 634-1234",
      type: "food-bank",
    },
  ],
  "food banks": [
    {
      name: "Salvation Army Food Bank",
      address: "25 Springdale St, St. John's",
      hours: "Mon-Fri 9AM-5PM",
      phone: "(709) 579-3919",
      type: "food-bank",
    },
    {
      name: "Society of St. Vincent de Paul",
      address: "Multiple locations across NL",
      hours: "Varies by location",
      phone: "(709) 754-2677",
      type: "food-bank",
    },
  ],
  "community fridges": [
    {
      name: "Memorial University Community Fridge",
      address: "MUN Campus, St. John's",
      hours: "Available 24/7",
      phone: "N/A",
      type: "community-fridge",
    },
    {
      name: "Downtown Community Fridge",
      address: "Water St, St. John's",
      hours: "Available 24/7",
      phone: "N/A",
      type: "community-fridge",
    },
  ],
};

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Create AI prompt with NL context
    const prompt = `You are a helpful AI assistant for FoodFinder NL, helping people find food resources in Newfoundland and Labrador, Canada. 

Context: The user is asking about food assistance. Be empathetic, helpful, and provide specific NL-focused advice.

Available resources include:
- Food banks (Salvation Army, St. Vincent de Paul)
- Community fridges (MUN campus, downtown St. John's)
- Soup kitchens (Gathering Place, Unity Kitchen)
- Emergency services (211, local churches)

User question: ${message}

Provide a helpful, warm response with specific suggestions for NL. Keep it under 150 words.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Still provide structured resources based on keywords
    let resources = [];
    const userMessage = message.toLowerCase();

    if (userMessage.includes("food bank")) {
      resources = foodResources["food banks"];
    } else if (userMessage.includes("community fridge")) {
      resources = foodResources["community fridges"];
    } else if (userMessage.includes("emergency")) {
      resources = [
        {
          name: "Call 211",
          address: "Immediate food assistance",
          hours: "24/7",
          phone: "211",
          type: "emergency",
        },
      ];
    }

    res.json({
      message: aiResponse,
      resources: resources,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("OpenAI API error:", error);

    // Fallback to original logic if AI fails
    const userMessage = message.toLowerCase();
    let response = "I can help you find food resources in NL!";
    let resources = [];

    if (userMessage.includes("food bank")) {
      response = "I found several food banks in NL! Here are some options:";
      resources = foodResources["food banks"];
    }

    res.json({
      message: response,
      resources: resources,
      timestamp: new Date().toISOString(),
    });
  }
});

// Location-based search
app.post("/api/resources/nearby", (req, res) => {
  const { location, type } = req.body;

  // Simulate location-based filtering
  let filteredResources = [];

  if (location && location.toLowerCase().includes("st. john's")) {
    filteredResources = [
      {
        name: "Salvation Army Food Bank",
        address: "25 Springdale St, St. John's",
        distance: "0.5 km",
        hours: "Mon-Fri 9AM-5PM",
        type: "food-bank",
      },
      {
        name: "MUN Community Fridge",
        address: "Memorial University",
        distance: "2.1 km",
        hours: "24/7",
        type: "community-fridge",
      },
    ];
  }

  res.json(filteredResources);
});

// Get all food resources
app.get("/api/resources", (req, res) => {
  const allResources = [];
  Object.values(foodResources).forEach((category) => {
    allResources.push(...category);
  });
  res.json(allResources);
});

// Serving as the homepage in frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 FoodFinder NL server running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
});

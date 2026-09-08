const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const { rateLimit } = require("express-rate-limit");
const { getBusiness } = require("./config");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const devOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (curl, server-to-server, local testing)
    if (!origin) return callback(null, true);

    // 2. Allow localhost:5173 / localhost:3000 in development
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && devOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Allow any origin listed in ALLOWED_ORIGINS in production
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
};

app.use(cors(corsOptions));
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Not allowed by CORS." });
  }
  next(err);
});
app.use(express.json());

// Rate limiter for review generation endpoint (defaults: 10 requests per minute per IP)
const reviewLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
  statusCode: 429,
});

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Fallback — kept deliberately human-sounding too, in case this ever fires
function generateFallbackReview(ambience, taste, service) {
  const templates = [
    `ngl the ${ambience} vibe caught me off guard, food was ${taste} and staff were ${service}`,
    `${ambience} spot, ${taste} food. service was ${service} too`,
    `wasn't expecting much but it was ${ambience} in here, ${taste} food and ${service} service`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Fetch business config (supports multi-cafe dynamic loading)
app.get("/business/:id", (req, res) => {
  const business = getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Unknown business" });
  res.json({ id: req.params.id, ...business });
});

// Support /api/business/:id as well
app.get("/api/business/:id", (req, res) => {
  const business = getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Unknown business" });
  res.json({ id: req.params.id, ...business });
});

async function handleGenerateReview(req, res) {
  const { businessId = "randomCafe", tags } = req.body;
  if (!tags || !tags.ambience || !tags.taste || !tags.service) {
    return res.status(400).json({ error: "Missing required tags." });
  }

  const defaultTags = getBusiness("randomCafe")?.tags || { ambience: [], taste: [], service: [] };
  const business = getBusiness(businessId) || { name: "this cafe", tags: defaultTags };
  const allowedTags = business.tags || defaultTags;

  if (
    !allowedTags.ambience.includes(tags.ambience) ||
    !allowedTags.taste.includes(tags.taste) ||
    !allowedTags.service.includes(tags.service)
  ) {
    return res.status(400).json({ error: "Invalid tag selection." });
  }

  const { ambience, taste, service } = tags;

  const prompt = `Write ONE customer review sentence for a cafe called ${business.name}, based on: ambience = "${ambience}", taste = "${taste}", service = "${service}".

Rules:
- Sound like a real, slightly rambly person typing a quick review, not an ad
- Do NOT use these words: definitely, truly, overall, moreover, delightful, must-visit, highly recommend
- Don't balance the three impressions neatly — real reviews are lopsided
- Lowercase and imperfect punctuation are fine
- Return ONLY the sentence

Examples of the tone to match:
- "ngl the food took a while but honestly worth the wait, staff were super sweet about it"
- "quiet spot, good for studying. coffee's decent, nothing crazy but does the job"
- "was expecting more tbh — service was quick at least"`;

  const ai = getAIClient();
  if (!ai) {
    console.warn("⚠️ GEMINI_API_KEY is not set in environment variables! AI generation falling back to static templates.");
    return res.json({
      sentence: generateFallbackReview(ambience, taste, service),
      source: "fallback",
      reason: "missing_api_key"
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: `You are an everyday customer casually typing a quick 1-sentence review on your phone.
Sound natural, slightly rambly, and authentic. Never sound like an ad or AI bot.
Never use these words: definitely, truly, overall, moreover, delightful, must-visit, highly recommend, vibe check, immaculate, no cap.
Return strictly the ONE review sentence and nothing else.`,
      },
    });
    let sentence = response.text.trim().replace(/^["'*]+|["'*]+$/g, "");
    if (!sentence) throw new Error("Empty response from Gemini");
    console.log(`[Gemini 3.5] Generated review for ${business.name}: "${sentence}"`);
    return res.json({ sentence, source: "gemini" });
  } catch (apiError) {
    console.warn("Gemini API call failed, using fallback:", apiError.message);
    return res.json({
      sentence: generateFallbackReview(ambience, taste, service),
      source: "fallback",
      error: "generation_failed"
    });
  }
}

// Review generation routes: supports direct calls, /api/ prefix, and Vercel serverless /api rewrite
app.post(["/generate-review", "/api/generate-review", "/api"], reviewLimiter, handleGenerateReview);

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

module.exports = app;

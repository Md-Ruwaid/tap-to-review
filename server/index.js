const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getBusiness } = require("./config");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Fallback sentence generator (guarantees the demo never breaks if API is unavailable)
function generateFallbackReview(businessName, tags) {
  const { ambience, taste, service } = tags;
  const templates = [
    `Super ${ambience} spot—service was really ${service} and the food was ${taste}.`,
    `Loved the ${ambience} setting here, staff was super ${service}, and the taste was honestly ${taste}.`,
    `Really ${ambience} vibe with ${service} service, and the food was definitely ${taste}.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// 1. Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Fetch business configuration (for multi-cafe dynamic loading)
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

// 3. AI review generation endpoint
async function handleGenerateReview(req, res) {
  const { businessId = "randomCafe", tags } = req.body;

  if (!tags || !tags.ambience || !tags.taste || !tags.service) {
    return res.status(400).json({
      error: "Missing required tags. Must provide ambience, taste, and service."
    });
  }

  const business = getBusiness(businessId) || { name: "this cafe" };
  const { ambience, taste, service } = tags;

  // Natural human customer prompt (avoids robotic AI tropes and clichés)
  const prompt = `Write a short, realistic 1-sentence customer review for "${business.name}".
Customer impressions:
- Ambience: ${ambience}
- Taste: ${taste}
- Service: ${service}

Guidelines:
- Write like an actual human casually typing on Google Maps on their phone.
- Do NOT sound like an AI (avoid robotic clichés like "vibe check", "immaculate", "delightful", "no cap", "testament").
- Keep it natural, conversational, and relaxed.
- Exactly ONE sentence.
- Under 20 words.
- No quotation marks.`;

  // Attempt Gemini generation if client is initialized
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: {
          temperature: 0.85,
          topP: 0.95
        }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let sentence = response.text().trim();

      // Clean any accidental enclosing quotes or asterisks
      sentence = sentence.replace(/^["'*]+|["'*]+$/g, "").trim();

      return res.json({
        sentence,
        source: "gemini",
        businessName: business.name,
        tags
      });
    } catch (apiError) {
      console.warn("Gemini API call failed, using fallback:", apiError.message);
      // Seamlessly drop to fallback so demo never fails
    }
  }

  // Fallback response
  const fallbackSentence = generateFallbackReview(business.name, tags);
  return res.json({
    sentence: fallbackSentence,
    source: "fallback",
    businessName: business.name,
    tags
  });
}

// Register both /generate-review and /api/generate-review
app.post("/generate-review", handleGenerateReview);
app.post("/api/generate-review", handleGenerateReview);

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;

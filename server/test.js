const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function runTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("\n🧪 Running Tap-to-Review AI Generation Test...\n");

  if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing from server/.env!");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const cafeName = "randomCafe";
  const tags = { ambience: "cozy", taste: "craazyy", service: "quick" };

  const prompt = `Write ONE customer review sentence for a cafe called ${cafeName}, based on: ambience = "${tags.ambience}", taste = "${tags.taste}", service = "${tags.service}".

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

    const sentence = response.text.trim().replace(/^["'*]+|["'*]+$/g, "");
    console.log("✅ Success! Live Gemini 3.5 Generated Review:\n");
    console.log(`   "${sentence}"\n`);
  } catch (err) {
    console.error("❌ Gemini API Error:", err.message);
  }
}

runTest();

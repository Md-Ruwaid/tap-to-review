# ☕ Tap-to-Review

> **AI-Powered 3-Tag Review Sentence Generator for Cafes**  
> Pitch-ready demo designed for cafes and dessert shops to turn customer intent into authentic Google reviews in under 30 seconds.

---

## 🚀 How It Works

1. **Scan QR Code**: The customer scans the table/counter QR code (`?business=randomCafe` or `?business=captain-kunafa`).
2. **Tap 3 Tags**: Exactly 1 tag per category:
   - **Ambience**: `cozy` • `lively` • `quiet`
   - **Taste**: `craazyy` • `valid` • `meh`
   - **Service**: `quick` • `friendly` • `slow`
3. **AI Generation**: Gemini model synthesizes an authentic, natural, human-sounding 1-sentence review.
4. **Edit & Copy**: The review appears in an editable `<textarea>` with a 1-tap **Copy** button.

---

## 🛠️ Project Structure

```
tap-to-review/
├── server/               # Express backend
│   ├── index.js          # API endpoints & Gemini integration
│   ├── config.js         # Multi-cafe business configurations & tags
│   └── .env              # Gemini API key (kept secure, not committed)
└── client/               # React + Vite frontend
    └── src/
        ├── App.jsx       # Interactive tag selector & review UI
        ├── App.css       # Mobile-first glassmorphic styling
        ├── config.js     # Client-side configuration
        └── main.jsx      # Vite entry
```

---

## 💻 Getting Started

### 1. Backend Setup
```bash
cd server
npm install
# Create .env and configure environment variables:
# GEMINI_API_KEY=your_key
# ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
npm start
```
**Environment Variables:**
- `GEMINI_API_KEY` (required): Your Google Gemini API key.
- `ALLOWED_ORIGINS` (optional): Comma-separated list of allowed frontend origins in production (e.g. `https://your-site.vercel.app`). Requests from `localhost:5173` and `localhost:3000` are automatically permitted in development.

Server starts on `http://localhost:3000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client starts on `http://localhost:5173`.

---

## ☁️ Deployment

When deploying to Vercel (or any serverless platform):

1. **Configure Environment Variables in Dashboard**:
   - Go to **Project Settings** $\rightarrow$ **Environment Variables**.
   - Add `GEMINI_API_KEY` and ensure it is enabled for the **Production** environment.
   - *Note*: Environment variables must be set in the Vercel dashboard — they cannot be baked into code. After adding or modifying variables, trigger a redeploy for them to take effect.
2. **Set Allowed Origins**:
   - Add `ALLOWED_ORIGINS` with your production frontend URL (e.g. `https://tap-to-review.vercel.app`).
3. **Deployment Protection**:
   - Ensure **Vercel Authentication** is toggled off under **Settings $\rightarrow$ Deployment Protection** if public access is required.


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
# Create .env and set GEMINI_API_KEY=your_key
npm start
```
Server starts on `http://localhost:3000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client starts on `http://localhost:5173`.

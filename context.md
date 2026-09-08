# Project Context: Tap-to-Review (Phase 1 Demo Build)

**Owner:** Ruwwaid  
**Target Market:** Cafe & dessert shop owners in Hyderabad  
**Version:** 0.2 (Draft — Demo Pitch Build)  
**Status:** In Development (Step-by-Step)

---

## 1. Core Problem & Value Proposition
- **Problem:** Happy cafe customers verbally agree to leave reviews, but drop off due to high friction (opening Google Maps, finding the venue, tapping "write review", and composing text from scratch).
- **Solution:** A lightweight, mobile-first web page accessed via a table/counter QR code. In under 30 seconds, customers tap 3 tags, get an AI-generated authentic 1-sentence review, tweak it in an editable box, and tap "Copy".

---

## 2. Phase 1 Scope & Boundaries

### In Scope
- Single generic web page per cafe via QR code (`?businessId=...` or route `/r/:businessId`).
- 3 fixed categories for every cafe:
  1. **Ambience**
  2. **Taste**
  3. **Service**
- Exactly **1 tag selected per category** (radio-button behavior, exactly 3 tags selected total).
- "Generate Review" button enabled only when all 3 categories have a selection.
- Backend API (`POST /generate-review`) calling **Gemini 2.5 Flash-Lite** server-side with strict persona prompt (< 25 words, casual customer voice, not marketer speak).
- Fail-safe fallback: deterministic template engine stitches realistic sentences if the Gemini API is slow or unreachable, ensuring pitch demos never fail.
- Editable text box with the generated sentence.
- 1-tap "Copy" button with "Copied!" micro-feedback.
- Multi-cafe business config stored in `server/config.js` (swapping cafes requires zero UI or AI code changes).

### Explicit Non-Goals (Phase 1)
- ❌ No direct Google Maps deep-linking or automated posting (deferred to future phase).
- ❌ No user accounts or login.
- ❌ No payment or customer reward/discount system.
- ❌ No owner analytics dashboard.
- ❌ No custom categories per cafe (Ambience, Taste, Service are fixed).

---

## 3. System Architecture & Tech Stack

```
[Customer Mobile / QR Code]
            │
            ▼
   React + Vite Frontend
 (3-category radio selection)
            │
            │ POST /generate-review { businessId, tags }
            ▼
    Node.js + Express Backend (Port 3000)
   ├── Loads cafe config from config.js
   ├── Calls Gemini 2.5 Flash-Lite with server-side GEMINI_API_KEY
   └── Fallback template engine (if API fails/times out)
            │
            ▼ Returns { sentence }
   React Frontend Display
 (Editable input + 1-tap Copy)
```

- **Frontend:** React + Vite, modern CSS, mobile-first responsive layout.
- **Backend:** Node.js + Express, `cors`, `dotenv`, `@google/generative-ai`.
- **Security:** Gemini API key lives exclusively in `server/.env`, never exposed to the client.

---

## 4. Key Functional Rules
1. **Radio Behavior:** Only 1 tag per category. Tapping another tag in the same category replaces the previous one.
2. **Strict Submission Gate:** The "Generate Review" CTA remains disabled until all 3 categories have an active choice.
3. **Editable Output:** The result must be in an editable textarea/input before copying.
4. **Resilience Target:** Under 3 seconds end-to-end response time with instant fallback if API drops.

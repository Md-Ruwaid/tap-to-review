const businesses = {
  "randomCafe": {
    name: "randomCafe",
    tags: {
      ambience: ["cozy", "lively", "quiet"],
      taste: ["craazyy", "valid", "meh"],
      service: ["quick", "friendly", "slow"],
    },
  },
  "captain-kunafa": {
    name: "Captain Kunafa",
    tags: {
      ambience: ["cozy", "lively", "quiet"],
      taste: ["craazyy", "valid", "meh"],
      service: ["quick", "friendly", "slow"],
    },
  },
  // add more cafes here later — same shape, new key
};

function getBusiness(businessId) {
  return businesses[businessId] || null;
}

module.exports = { getBusiness };

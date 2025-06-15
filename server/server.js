// server.js
const express = require('express');
const cors = require('cors'); // Required for cross-origin requests
const app = express();
const port = 3000; // You can choose any available port

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// --- Mock Data Definitions (from your Admin Panel, but now on backend) ---
const sectorList = {
    "agriculture": "🌱 Agriculture & Biotech", "fsf": "🥦 Food, Soil & Farming",
    "banking": "🏦 Banking & Finance", "creative": "🖋️ Creative Tech",
    "logistics": "📦 Logistics & Packaging", "education-ip": "📚 Education & IP",
    "fashion": "✂ Fashion & Identity", "gaming": "🎮 Gaming & Simulation",
    "health": "🧠 Health & Hygiene", "housing": "🏗️ Housing & Infrastructure",
    "justice": "⚖ Justice & Ethics", "knowledge": "📖 Knowledge & Archives",
    "micromesh": "☰ Micro-Mesh Logistics", "media": "🎬 Motion, Media & Sonic",
    "nutrition": "✿ Nutrition & Food Chain", "ai-logic": "🧠 AI, Logic & Grid",
    "packaging": "📦 Packaging & Materials", "quantum": "✴️ Quantum Protocols",
    "ritual": "☯ Ritual & Culture", "saas": "🔑 SaaS & Licensing",
    "trade": "🧺 Trade Systems", "utilities": "🔋 Utilities & Energy",
    "voice": "🎙️ Voice & Audio", "webless": "📡 Webless Tech & Nodes",
    "nft": "🔁 NFT & Ownership", "education-youth": "🎓 Education & Youth",
    "zerowaste": "♻️ Zero Waste", "professional": "🧾 Professional Services",
    "payroll-mining": "🪙 Payroll Mining & Accounting", "mining": "⛏️ Mining & Resources",
    "wildlife": "🦁 Wildlife & Habitat"
};

const FAA_ZONE_INDEX_SUMMARY_DATA = {
    "agriculture": { glyph: "🌱", monthlyFee: "550.00", annualFee: "5500.00", payoutTier: "B+", region: "Global Rural" },
    "fsf": { glyph: "🥦", monthlyFee: "560.00", annualFee: "5800.00", payoutTier: "B+", region: "Rural" },
    "banking": { glyph: "🏦", monthlyFee: "1250.00", annualFee: "12500.00", payoutTier: "A+", region: "Div A-E" },
    "creative": { glyph: "🖋️", monthlyFee: "700.00", annualFee: "7500.00", payoutTier: "A", region: "Div E" },
    "logistics": { glyph: "📦", monthlyFee: "600.00", annualFee: "6100.00", payoutTier: "B+", region: "Div B-F" },
    "education-ip": { glyph: "📚", monthlyFee: "400.00", annualFee: "4300.00", payoutTier: "A", region: "Tribal/Global" },
    "fashion": { glyph: "✂", monthlyFee: "720.00", annualFee: "7800.00", payoutTier: "A", region: "Global Metro" },
    "gaming": { glyph: "🎮", monthlyFee: "850.00", annualFee: "8700.00", payoutTier: "A", region: "Global Digital" },
    "health": { glyph: "🧠", monthlyFee: "550.00", annualFee: "5800.00", payoutTier: "B", region: "Div F" },
    "housing": { glyph: "🏗️", monthlyFee: "620.00", annualFee: "6400.00", payoutTier: "B+", region: "Div A-F" },
    "justice": { glyph: "⚖", monthlyFee: "950.00", annualFee: "9800.00", payoutTier: "A", region: "Global Legal" },
    "knowledge": { glyph: "📖", monthlyFee: "580.00", annualFee: "6100.00", payoutTier: "B+", region: "Global Archives" },
    "micromesh": { glyph: "☰", monthlyFee: "650.00", annualFee: "6800.00", payoutTier: "B+", region: "Local/Regional" },
    "media": { glyph: "🎬", monthlyFee: "750.00", annualFee: "7700.00", payoutTier: "A", region: "Creative" },
    "nutrition": { glyph: "✿", monthlyFee: "500.00", annualFee: "5300.00", payoutTier: "B+", region: "Global" },
    "ai-logic": { glyph: "🧠", monthlyFee: "1100.00", annualFee: "11200.00", payoutTier: "A+", region: "Global" },
    "packaging": { glyph: "📦", monthlyFee: "680.00", annualFee: "7000.00", payoutTier: "B", region: "Div B" },
    "quantum": { glyph: "✴️", monthlyFee: "1350.00", annualFee: "13800.00", payoutTier: "A+", region: "Global Research" },
    "ritual": { glyph: "☯", monthlyFee: "700.00", annualFee: "7500.00", payoutTier: "A", region: "Div C" },
    "saas": { glyph: "🔑", monthlyFee: "1000.00", annualFee: "10300.00", payoutTier: "A", region: "Global" },
    "trade": { glyph: "🧺", monthlyFee: "900.00", annualFee: "9200.00", payoutTier: "A+", region: "Div A-F" },
    "utilities": { glyph: "🔋", monthlyFee: "750.00", annualFee: "7800.00", payoutTier: "B+", region: "Div A-Z" },
    "voice": { glyph: "🎙️", monthlyFee: "630.00", annualFee: "6600.00", payoutTier: "B", region: "Global" },
    "webless": { glyph: "📡", monthlyFee: "800.00", annualFee: "8200.00", payoutTier: "A", region: "Div D-G" },
    "nft": { glyph: "🔁", monthlyFee: "1250.00", annualFee: "12800.00", payoutTier: "A", region: "FAA IP" },
    "education-youth": { glyph: "🎓", monthlyFee: "420.00", annualFee: "4500.00", payoutTier: "A", region: "Global Youth" },
    "zerowaste": { glyph: "♻️", monthlyFee: "450.00", annualFee: "4800.00", payoutTier: "B", region: "Global" },
    "professional": { glyph: "🧾", monthlyFee: "1150.00", annualFee: "11800.00", payoutTier: "A", region: "Global" },
    "payroll-mining": { glyph: "🪙", monthlyFee: "1050.00", annualFee: "10800.00", payoutTier: "A+", region: "Global Finance" },
    "mining": { glyph: "⛏️", monthlyFee: "1600.00", annualFee: "19000.00", payoutTier: "A+", region: "Global Resources" },
    "wildlife": { glyph: "🦁", monthlyFee: "400.00", annualFee: "4200.00", payoutTier: "B", region: "Conservation Zones" }
};

const SECTOR_TIER_PRICING = {
    "Starter": { multiplier: 1 },
    "Pro": { multiplier: 2.5 },
    "Enterprise": { multiplier: 5 }
};

// --- Mock Database for PayPal Plan IDs ---
const MOCK_PAYPAL_PLAN_DATABASE = {}; // In a real app, this would be a database

// Generate mock plan IDs and store them in the mock database
function generateAndStoreMockPlanIDs() {
    const annualDiscount = 0.15; // 15% discount for annual plans
    for (const sectorKey in FAA_ZONE_INDEX_SUMMARY_DATA) {
        const sectorDisplayName = sectorList[sectorKey];
        const baseMonthlyFee = parseFloat(FAA_ZONE_INDEX_SUMMARY_DATA[sectorKey].monthlyFee);

        for (const tierName in SECTOR_TIER_PRICING) {
            const tier = SECTOR_TIER_PRICING[tierName];
            const commonProductName = `${sectorDisplayName.replace(/<.*?>/g, '')} ${tierName} Package`;
            
            // Monthly Plan
            const monthlyPlanKey = `${commonProductName}_MONTHLY`;
            // In a real scenario, you'd call PayPal API here and get a real P-ID
            const monthlyPlanId = `P-MOCK${sectorKey.toUpperCase().substring(0,3)}${tierName.toUpperCase().substring(0,3)}MT${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;
            MOCK_PAYPAL_PLAN_DATABASE[monthlyPlanKey] = monthlyPlanId;

            // Annual Plan
            const annualPlanKey = `${commonProductName}_ANNUAL`;
            // In a real scenario, you'd call PayPal API here and get a real P-ID
            const annualPlanId = `P-MOCK${sectorKey.toUpperCase().substring(0,3)}${tierName.toUpperCase().substring(0,3)}AN${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;
            MOCK_PAYPAL_PLAN_DATABASE[annualPlanKey] = annualPlanId;
        }
    }
    // Override Agri Starter Monthly with the real one you created
    MOCK_PAYPAL_PLAN_DATABASE["🌱 Agriculture & Biotech Starter Package_MONTHLY"] = 'P-07F980334R518562XNBHLNJY';
    console.log("Mock PayPal Plan IDs generated and stored.");
}

generateAndStoreMockPlanIDs(); // Generate on server start

// --- API Endpoints ---

// Endpoint to fetch all generated PayPal Plan IDs
app.get('/api/paypal/plans', (req, res) => {
    res.json(MOCK_PAYPAL_PLAN_DATABASE);
});

// Mock endpoint for creating plans (if 'Deploy Plan' were to hit this)
// In a real app, this would integrate with PayPal's API
app.post('/api/paypal/create-plans', (req, res) => {
    // This would receive sector data, call PayPal API, and store real IDs
    console.log('Received request to create plans:', req.body.sectorDisplayName);
    // Simulate success
    res.json({ message: `Plans for ${req.body.sectorDisplayName} mocked as deployed.`, createdPlans: MOCK_PAYPAL_PLAN_DATABASE });
});

// Mock endpoint for creating a subscription
// In a real app, this would integrate with PayPal's API and return an approveUrl
app.post('/api/paypal/create-subscription', (req, res) => {
    console.log('Received request to create subscription for plan:', req.body.planId);
    // Simulate PayPal's approveUrl
    const mockApproveUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    res.json({ approveUrl: mockApproveUrl });
});

// Start the server
app.listen(port, () => {
    console.log(`Mock PayPal backend listening at http://localhost:${port}`);
    console.log(`Access PayPal Plan IDs at http://localhost:${port}/api/paypal/plans`);
});


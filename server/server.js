// /api/index.js - Your REAL Vercel Backend
const express = require('express');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();

// Middleware
app.use(cors()); // Allows your frontend to call this backend
app.use(express.json());

// --- YOUR DATA DEFINITIONS (LIVES ON THE BACKEND) ---
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
    "agriculture": { monthlyFee: "550.00" }, "fsf": { monthlyFee: "560.00" },
    "banking": { monthlyFee: "1250.00" }, "creative": { monthlyFee: "700.00" },
    "logistics": { monthlyFee: "600.00" }, "education-ip": { monthlyFee: "400.00" },
    "fashion": { monthlyFee: "720.00" }, "gaming": { monthlyFee: "850.00" },
    "health": { monthlyFee: "550.00" }, "housing": { monthlyFee: "620.00" },
    "justice": { monthlyFee: "950.00" }, "knowledge": { monthlyFee: "580.00" },
    "micromesh": { monthlyFee: "650.00" }, "media": { monthlyFee: "750.00" },
    "nutrition": { monthlyFee: "500.00" }, "ai-logic": { monthlyFee: "1100.00" },
    "packaging": { monthlyFee: "680.00" }, "quantum": { monthlyFee: "1350.00" },
    "ritual": { monthlyFee: "700.00" }, "saas": { monthlyFee: "1000.00" },
    "trade": { monthlyFee: "900.00" }, "utilities": { monthlyFee: "750.00" },
    "voice": { monthlyFee: "630.00" }, "webless": { monthlyFee: "800.00" },
    "nft": { monthlyFee: "1250.00" }, "education-youth": { monthlyFee: "420.00" },
    "zerowaste": { monthlyFee: "450.00" }, "professional": { monthlyFee: "1150.00" },
    "payroll-mining": { monthlyFee: "1050.00" }, "mining": { monthlyFee: "1600.00" },
    "wildlife": { monthlyFee: "400.00" }
};

// --- REAL PAYPAL API SETUP ---
// Using your LIVE credentials.
const liveClientId = "BAAThS_oBJJ22PM5R1nVJpXoSl9c3si7TJ3ICJBTht_PAFcRprbXkTv4_wqrG37kkAjUcv3tKBOxnUGQ98";
const liveClientSecret = "EFSS4mbIMZ6Q3ijOGCjqA9i4b3dzHULkCEV9jKAAHO9_fbO2aP9YCGRV9ekZaHqT2zSZL6Svrn-WyhIs";
const liveProductId = "P-07F980334R518562XNBHLNJY";

const environment = new paypal.core.LiveEnvironment(liveClientId, liveClientSecret);
const client = new paypal.core.PayPalHttpClient(environment);


// --- API ENDPOINTS ---

// This handles requests to /api/paypal/plans
app.get('/api/paypal/plans', async (req, res) => {
    try {
        const allPlans = await listPayPalPlans();
        res.status(200).json(allPlans);
    } catch (error) {
        console.error("PayPal API Error (Get Plans):", error.message);
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

// This handles requests to /api/paypal/create-plans
app.post('/api/paypal/create-plans', async (req, res) => {
    try {
        const { sectorKey } = req.body;
        const sectorData = FAA_ZONE_INDEX_SUMMARY_DATA[sectorKey];
        if (!sectorData) {
            return res.status(404).json({ error: "Sector data not found on server."});
        }
        
        const baseMonthlyFee = parseFloat(sectorData.monthlyFee);
        const annualDiscount = 0.15;
        const payload = {
            sectorDisplayName: sectorList[sectorKey],
            monthlyPrices: { "Starter": baseMonthlyFee, "Pro": baseMonthlyFee * 2.5, "Enterprise": baseMonthlyFee * 5 },
            annualPrices: { "Starter": (baseMonthlyFee * 12 * (1 - annualDiscount)), "Pro": (baseMonthlyFee * 2.5 * 12 * (1 - annualDiscount)), "Enterprise": (baseMonthlyFee * 5 * 12 * (1 - annualDiscount))},
            currencyCode: 'ZAR'
        };

        const createdPlans = await createAllPlansForSector(payload);
        res.status(201).json({ success: true, createdPlans });
    } catch (error) {
        console.error("PayPal API Error (Create Plans):", error.message);
        res.status(error.statusCode || 500).json({ error: error.message, details: error.details || {} });
    }
});


// --- PAYPAL API FUNCTIONS ---

async function createAllPlansForSector(payload) {
    const { sectorDisplayName, monthlyPrices, annualPrices, currencyCode } = payload;
    const planCreationPromises = [];

    const createPlanRequest = (tier, billingCycle, amount) => {
        const planName = `${sectorDisplayName.replace('🌱', '').trim()} ${tier} Package (${billingCycle})`;
        const request = new paypal.catalog.PlansCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            product_id: liveProductId,
            name: planName,
            status: "ACTIVE",
            billing_cycles: [{
                frequency: { interval_unit: billingCycle === 'MONTHLY' ? 'MONTH' : 'YEAR', interval_count: 1 },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: { fixed_price: { value: amount.toFixed(2), currency_code: currencyCode } }
            }],
            payment_preferences: { auto_bill_outstanding: true }
        });
        return client.execute(request);
    };

    for (const tier in monthlyPrices) planCreationPromises.push(createPlanRequest(tier, 'MONTHLY', monthlyPrices[tier]));
    for (const tier in annualPrices) planCreationPromises.push(createPlanRequest(tier, 'ANNUAL', annualPrices[tier]));

    const responses = await Promise.all(planCreationPromises);
    return responses.map(res => res.result);
}

async function listPayPalPlans() {
    const request = new paypal.catalog.PlansListRequest();
    request.productId(liveProductId);
    request.pageSize(20);
    const response = await client.execute(request);
    return response.result.plans;
}

// Export the app for Vercel
module.exports = app;


// api/index.js - Consolidated Vercel Backend for FAA.ZONE™ Admin Portal

const express = require('express');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk'); // Make sure this is installed: npm install @paypal/checkout-server-sdk
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

// --- Middleware Setup ---
// Enable CORS for all routes - adjust `origin` for production to your frontend domain
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow requests from your frontend URL or all origins for development
    credentials: true // Allow cookies to be sent across origins
}));
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(cookieParser()); // Parses cookies attached to the client request object

// Configure express-session. IMPORTANT: In production, `secret` MUST be a strong, randomly generated string.
// Store `SESSION_SECRET` as a Vercel Environment Variable.
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_super_secret_key_for_dev_CHANGE_IN_PROD', // CHANGE THIS IN PRODUCTION!
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true in production for HTTPS only cookies
        httpOnly: true, // Prevent client-side JavaScript from accessing cookies
        maxAge: 24 * 60 * 60 * 1000, // Session cookie validity: 24 hours
        // domain: process.env.NODE_ENV === 'production' ? '.faa.zone' : undefined // Set your domain for production
    }
}));


// --- PayPal API Environment Setup ---
// Use Vercel Environment Variables for sensitive PayPal credentials in production.
// Provide fallback values for local development if not set in .env.local
const liveClientId = process.env.PAYPAL_LIVE_CLIENT_ID || "BAAThS_oBJJ22PM5R1nVJpXoSl9c3si7TJ3ICJBTht_PAFcRprbXkTv4_wqrG37kkAjUcv3tKBOxnUGQ98";
const liveClientSecret = process.env.PAYPAL_LIVE_CLIENT_SECRET || "EFSS4mbIMZ6Q3ijOGCjqA9i4b3dzHULkCEV9jKAAHO9_fbO2aP9YCGRV9ekZaHqT2zSZL6Svrn-WyhIs";
const liveProductId = process.env.PAYPAL_LIVE_PRODUCT_ID || "P-07F980334R518562XNBHLNJY"; // Your Agri & Biotech Product ID

const environment = new paypal.core.LiveEnvironment(liveClientId, liveClientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

// --- YOUR DATA DEFINITIONS (LIVES ON THE BACKEND) ---
// This data is intentionally kept here as it's directly used by the backend PayPal plan creation logic.
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
    "wildlife": "🦁 Wildlife & Habitat",
    "admin-panel": "⚙️ Admin Panel" // Included for completeness, though not a "real" sector for pricing
};

// Data for pricing tiers and their features/descriptions
const SECTOR_TIER_PRICING = {
    "Starter": {
        description: "Ideal for small teams and pilot projects. Access essential features and secure basic data synchronization.",
        features: ["Basic API Access", "Standard Analytics Dashboard", "Community Support", "Up to 5 Users"],
        monthlyMetrics: { "Active Users": "5", "API Calls/Month": "10k", "Storage": "1GB" },
    },
    "Pro": {
        description: "Designed for growing firms needing advanced capabilities.",
        features: ["Advanced API Access", "Premium Analytics & Reporting", "Dedicated Priority Support", "Unlimited Users", "Custom Data Integrations"],
        monthlyMetrics: { "Active Users": "Unlimited", "API Calls/Month": "100k", "Storage": "10GB" },
    },
    "Enterprise": {
        description: "For large organizations requiring full VaultMesh access, custom integrations, and dedicated resources.",
        features: ["All Business Package Features", "Dedicated Account Manager", "24/7 Phone Support", "Enhanced Custom Integrations", "On-site Training & Setup"],
        monthlyMetrics: { "Active Users": "Unlimited", "API Calls/Month": "Custom", "Storage": "Custom" },
    }
};

/**
 * --- Main API Router ---
 * Your vercel.json should have a rewrite rule like:
 * { "source": "/api/(.*)", "destination": "/api/index.js" }
 * This single router handles various actions.
 */
app.post('/api', async (req, res) => {
    const { action, payload } = req.body;

    console.log(`Backend received action: ${action}`);

    try {
        if (action === 'create-plans-for-sector') {
            // Retrieve sector details from the backend's stored data
            const sectorData = FAA_ZONE_INDEX_SUMMARY_DATA[payload.sectorKey];
            if (!sectorData) {
                return res.status(404).json({ success: false, error: "Sector pricing data not found on server." });
            }

            const annualDiscount = 0.15; // 15% discount for annual plans

            const monthlyPrices = {
                "Starter": parseFloat(sectorData.monthlyFee),
                "Pro": parseFloat(sectorData.monthlyFee) * 2.5,
                "Enterprise": parseFloat(sectorData.monthlyFee) * 5
            };

            const annualPrices = {
                "Starter": (monthlyPrices.Starter * 12 * (1 - annualDiscount)),
                "Pro": (monthlyPrices.Pro * 12 * (1 - annualDiscount)),
                "Enterprise": (monthlyPrices.Enterprise * 12 * (1 - annualDiscount))
            };

            const fullPayloadForPlanCreation = {
                productId: liveProductId,
                sectorDisplayName: sectorList[payload.sectorKey],
                monthlyPrices: monthlyPrices,
                annualPrices: annualPrices,
                currencyCode: 'ZAR',
                tierPricingInfo: SECTOR_TIER_PRICING // Pass the full tier info for descriptions
            };
            const createdPlans = await createAllPlansForSector(fullPayloadForPlanCreation);
            res.status(201).json({ success: true, message: 'Plans created successfully', createdPlans });

        } else if (action === 'capture-subscription') {
            // This is a placeholder for your actual subscription capture logic
            // In a real scenario, you'd verify the subscription ID with PayPal
            // and update your database here.
            const { subscriptionID, planId, userId, productName } = payload;
            console.log(`Received subscription for verification: ID ${subscriptionID}, Plan ID ${planId}, User ${userId}, Product ${productName}`);
            // Implement PayPal API call to verify subscription details if needed
            // For now, simulate success
            res.status(200).json({ success: true, message: 'Subscription captured and verified (simulated).' });
        }
        else {
            res.status(400).json({ success: false, error: 'Invalid action specified.' });
        }
    } catch (error) {
        console.error(`PayPal API Error for action "${action}":`, error.message);
        // Log more details for debugging
        if (error.statusCode) console.error("Status Code:", error.statusCode);
        if (error.headers) console.error("Headers:", error.headers);
        if (error.error) console.error("PayPal API Error Object:", JSON.stringify(error.error, null, 2));

        const statusCode = error.statusCode || 500;
        const message = error.message || 'An internal server error occurred.';
        res.status(statusCode).json({ success: false, error: message, details: error.error || {} }); // Return PayPal's error object if available
    }
});

// Example GET endpoint to list plans (optional, for testing/debugging)
app.get('/api/paypal/plans', async (req, res) => {
    try {
        const allPlans = await listPayPalPlans();
        res.status(200).json(allPlans);
    } catch (error) {
        console.error(`PayPal API Error for getting plans:`, error.message);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'An internal server error occurred.';
        res.status(statusCode).json({ success: false, error: message });
    }
});


/**
 * Creates all 6 subscription plans for a sector by making REAL calls to the PayPal API.
 * @param {object} payload - Contains sector details and pricing for plan creation.
 * @returns {Promise<Array<object>>} - Array of created PayPal plan objects.
 */
async function createAllPlansForSector(payload) {
    const { productId, sectorDisplayName, monthlyPrices, annualPrices, currencyCode, tierPricingInfo } = payload;
    const planCreationPromises = [];

    const createPlanRequest = (tier, billingCycle, amount) => {
        const planName = `${sectorDisplayName.replace('🌱', '').trim()} ${tier} Package (${billingCycle})`;
        const requestId = `plan-${Date.now()}-${Math.random()}`; // Unique ID for idempotency

        // Get description and features from tierPricingInfo for the plan
        const tierDetails = tierPricingInfo[tier];
        const description = `${tierDetails.description || 'No description provided.'} Billing: ${billingCycle}. Key Features: ${tierDetails.features.join(', ')}.`;

        const request = new paypal.catalog.PlansCreateRequest();
        request.prefer("return=representation");
        request.payPalRequestId(requestId); // Ensures idempotency, preventing duplicate plan creation on retries
        request.requestBody({
            product_id: productId, // Use the product ID passed in the payload
            name: planName,
            description: description, // Added description for the plan
            status: "ACTIVE",
            billing_cycles: [{
                frequency: { interval_unit: billingCycle === 'MONTHLY' ? 'MONTH' : 'YEAR', interval_count: 1 },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0, // 0 means indefinite cycles
                pricing_scheme: {
                    fixed_price: { value: amount.toFixed(2), currency_code: currencyCode }
                }
            }],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: "0.00", currency_code: currencyCode }, // Explicitly set setup fee to 0
                setup_fee_failure_action: "CANCEL",
                payment_failure_threshold: 3 // Cancel subscription after 3 failed payments
            },
            // taxes: { percentage: "10", inclusive: false } // Example of adding tax, uncomment if needed
        });
        return client.execute(request);
    };

    for (const tier in monthlyPrices) {
        planCreationPromises.push(createPlanRequest(tier, 'MONTHLY', monthlyPrices[tier]));
    }
    for (const tier in annualPrices) {
        planCreationPromises.push(createPlanRequest(tier, 'ANNUAL', annualPrices[tier]));
    }

    const responses = await Promise.all(planCreationPromises);
    return responses.map(response => ({
        name: response.result.name,
        id: response.result.id,
        status: response.result.status
    }));
}

/**
 * Lists all active subscription plans associated with the configured product ID from your PayPal account.
 * @returns {Promise<Array<object>>} - Array of PayPal plan objects.
 */
async function listPayPalPlans() {
    const request = new paypal.catalog.PlansListRequest();
    request.productId(liveProductId);
    request.pageSize(20); // Fetch up to 20 plans
    // You can also filter by status: request.status("ACTIVE");
    const response = await client.execute(request);
    return response.result.plans;
}

// Export the Express app for Vercel
module.exports = app;

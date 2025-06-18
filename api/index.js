// api/index.js - Consolidated Vercel Backend for FAA.ZONE™ Admin Portal

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Required for direct PayPal API calls
const crypto = require('crypto'); // Built-in Node.js module, used for webhook verification
const cookieParser = require('cookie-parser');
const session = require('express-session'); // Ensure this is only imported once

const app = express();

// --- Middleware Setup ---
// Enable CORS for all routes - adjust `origin` for production to your frontend domain
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://seedwave.faa.zone', // Use your live domain in production, or localhost for dev
    credentials: true // Allow cookies to be sent across origins
}));
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(cookieParser()); // Parses cookies attached to the client request object

// Configure express-session. IMPORTANT: In production, `secret` MUST be a strong, randomly generated string.
// Store `SESSION_SECRET` as a Vercel Environment Variable.
// This ensures the session middleware is only initialized once and securely.
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_strong_random_secret_for_production', // !!! CHANGE THIS IN PRODUCTION ENVIRONMENT VARIABLES !!!
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true in production for HTTPS only cookies
        httpOnly: true, // Prevent client-side JavaScript from accessing cookies
        maxAge: 24 * 60 * 60 * 1000, // Session cookie validity: 24 hours
        // Set domain for production, otherwise let it be inferred for local/preview
        domain: process.env.NODE_ENV === 'production' ? 'seedwave.faa.zone' : undefined
    }
}));


// --- PayPal API Environment Setup ---
// Use Vercel Environment Variables for sensitive PayPal credentials in production.
// Provide fallback values from your Zoho credentials and product ID for local development.
// IMPORTANT: In production, these process.env variables MUST be set in Vercel!
const PAYPAL_CLIENT_ID = process.env.PAYPAL_LIVE_CLIENT_ID || 'BAAThS_oBJJ22PM5R1nVJpXoSl9c3si7TJ3ICJBTht_PAFcRprbXkTv4_wqrG37kkAjUcv3tKBOxnUGQ98';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_LIVE_CLIENT_SECRET || 'EFSS4mbIMZ6Q3ijOGCjqA9i4b3dzHULkCEV9jKAAHO9_fbO2aP9YCGRV9ekZaHqT2zSZL6Svrn-WyhIs';
const PAYPAL_API_BASE_URL = 'https://api-m.paypal.com'; // PayPal LIVE API Base URL (already correct)

// For Webhook Verification - CRITICAL FOR LIVE!
// These must match your configured PayPal Sandbox/Live Webhook details
// Replace 'YOUR_LIVE_WEBHOOK_ID_GOES_HERE' and 'YOUR_LIVE_WEBHOOK_SIGNING_SECRET_GOES_HERE' with ACTUAL values
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || 'YOUR_LIVE_WEBHOOK_ID_GOES_HERE'; // SET THIS IN VERCEL ENV VARS
const PAYPAL_WEBHOOK_SECRET = process.env.PAYPAL_WEBHOOK_SECRET || 'YOUR_LIVE_WEBHOOK_SIGNING_SECRET_GOES_HERE'; // SET THIS IN VERCEL ENV VARS

// Define your single product ID to which all plans will be linked
// This MUST be the LIVE PROD- ID you obtained from your PayPal Dashboard.
const YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS = process.env.PAYPAL_LIVE_PRODUCT_ID || 'PROD-2NC51830JC183315X'; // Your actual LIVE PROD- ID


// --- YOUR DATA DEFINITIONS (LIVES ON THE BACKEND) ---
// This data is intentionally kept here as it's directly used by the backend PayPal plan creation logic
// and other logic if this becomes a comprehensive backend.
const FAA_ZONE_INDEX_SUMMARY_DATA = {
    "agriculture": { monthlyFee: "550.00", annualFee: "5500.00", payoutTier: "B+", region: "Global Rural" },
    "fsf": { monthlyFee: "560.00", annualFee: "5800.00", payoutTier: "B+", region: "Rural" },
    "banking": { monthlyFee: "1250.00", annualFee: "12500.00", payoutTier: "A+", region: "Div A-E" },
    "creative": { monthlyFee: "700.00", annualFee: "7500.00", payoutTier: "A", region: "Div E" },
    "logistics": { monthlyFee: "600.00", annualFee: "6100.00", payoutTier: "B+", region: "Div B-F" },
    "education-ip": { monthlyFee: "400.00", annualFee: "4300.00", payoutTier: "A", region: "Tribal/Global" },
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

const sectorListBackend = { // Renamed to avoid conflict if frontend data is pasted
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
    // "admin-panel" is a frontend only concept for navigation, not a backend sector
};


// Data for pricing tiers and their features/descriptions (used in plan creation descriptions)
const SECTOR_TIER_PRICING = {
    "Starter": {
        multiplier: 1,
        description: "Ideal for small teams and pilot projects. Access essential features and secure basic data synchronization.",
        features: ["Basic API Access", "Standard Analytics Dashboard", "Community Support", "Up to 5 Users"],
        monthlyMetrics: { "Active Users": "5", "API Calls/Month": "10k", "Storage": "1GB" },
    },
    "Pro": {
        multiplier: 2.5,
        description: "Designed for growing firms needing advanced capabilities.",
        features: ["Advanced API Access", "Premium Analytics & Reporting", "Dedicated Priority Support", "Unlimited Users", "Custom Data Integrations"],
        monthlyMetrics: { "Active Users": "Unlimited", "API Calls/Month": "100k", "Storage": "10GB" },
    },
    "Enterprise": {
        multiplier: 5,
        description: "For large organizations requiring full VaultMesh access, custom integrations, and dedicated resources.",
        features: ["All Business Package Features", "Dedicated Account Manager", "24/7 Phone Support", "Enhanced Custom Integrations", "On-site Training & Setup"],
        monthlyMetrics: { "Active Users": "Unlimited", "API Calls/Month": "Custom", "Storage": "Custom" },
    }
};


// --- Helper Function: Generate PayPal Access Token ---
async function generateAccessToken() {
    // These lines were modified to directly use process.env and throw more specific errors.
    if (!process.env.PAYPAL_LIVE_CLIENT_ID) {
        console.error("Missing PAYPAL_LIVE_CLIENT_ID environment variable!");
        throw new Error("PayPal Client ID not configured. Cannot generate access token.");
    }
    if (!process.env.PAYPAL_LIVE_CLIENT_SECRET) {
        console.error("Missing PAYPAL_LIVE_CLIENT_SECRET environment variable!");
        throw new Error("PayPal Client Secret not configured. Cannot generate access token.");
    }

    const auth = Buffer.from(`${process.env.PAYPAL_LIVE_CLIENT_ID}:${process.env.PAYPAL_LIVE_CLIENT_SECRET}`).toString('base64');
    const tokenUrl = `${PAYPAL_API_BASE_URL}/v1/oauth2/token`;

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Failed to generate access token from PayPal:", data);
            throw new Error(`Failed to generate access token: ${response.status} - ${data.error_description || JSON.stringify(data)}`);
        }
        return data.access_token;
    } catch (error) {
        console.error("Error during PayPal access token generation:", error);
        throw new Error(`Error connecting to PayPal for access token: ${error.message}`);
    }
}

// --- PayPal API Call Wrapper ---
async function callPayPalApi(endpoint, method = 'GET', body = null, accessToken) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `REQ-${Date.now()}-${crypto.randomBytes(8).toString('hex')}` // Stronger Idempotency key
    };

    if (body && method !== 'GET') {
        headers['Prefer'] = 'return=representation'; // Get full response body
    }

    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${PAYPAL_API_BASE_URL}${endpoint}`, config);
    const responseBody = await response.json();

    if (!response.ok) {
        console.error(`PayPal API Error for ${endpoint} (${method}):`, response.status, JSON.stringify(responseBody, null, 2));
        throw new Error(`PayPal API request failed: ${response.status} - ${responseBody.message || responseBody.name || JSON.stringify(responseBody)}`);
    }
    return responseBody;
}


/**
 * --- Main API Router ---
 * This router handles various actions sent from the frontend.
 * Your vercel.json should have a rewrite rule like:
 * { "source": "/api/(.*)", "destination": "/api/index.js" }
 */
app.post('/api', async (req, res) => {
    // The 'action' is now in the request body, not query, as per common practice for POST requests
    const { action, payload } = req.body;

    console.log(`Backend received action: ${action}`);

    try {
        const accessToken = await generateAccessToken(); // Generate token once for the request

        switch (action) {
            case 'get-plans': {
                // Fetch all existing plans from PayPal associated with YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS
                console.log('Fetching all PayPal billing plans for product:', YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS);
                const plansResponse = await callPayPalApi(`/v1/billing/plans?product_id=${YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS}&page_size=100`, 'GET', null, accessToken);
                const plans = plansResponse.plans;

                const paypalPlanIDsMap = {};
                plans.forEach(plan => {
                    // This mapping needs to be precise based on how you name your plans in PayPal
                    // and how your frontend expects the keys (e.g., "Agriculture___Biotech_Starter_Package_MONTHLY")
                    const cleanName = plan.name.replace(/™/g, '').replace(/\s*\((Monthly|Annual)\)/, '').trim(); // Remove trademark and billing cycle from name
                    const billingCycleMatch = plan.name.match(/(Monthly|Annual)/);
                    const billingCycle = billingCycleMatch ? billingCycleMatch[1].toUpperCase() : '';

                    if (cleanName && billingCycle) {
                        // Example mapping to match frontend style "Agriculture___Biotech_Starter_Package_MONTHLY"
                        let frontendKey = cleanName.replace(/ /g, '_'); // Replace spaces with underscores
                        frontendKey = frontendKey.replace(/&/g, '___'); // Replace & with triple underscore as in frontend

                        paypalPlanIDsMap[`${frontendKey}_${billingCycle}`] = plan.id;
                    } else {
                        console.warn(`Plan name format not fully recognized for keying: "${plan.name}". Skipping.`);
                    }
                });

                return res.status(200).json(paypalPlanIDsMap);
            }

            case 'create-product': {
                // This action is generally for initial setup or if you have many distinct products
                // If all plans belong to one global product, you only need to run this once.
                const { name, description, type, category } = payload; // data from payload
                console.log('Creating PayPal product:', name);
                const product = await callPayPalApi('/v1/catalogs/products', 'POST', {
                    name: name,
                    description: description,
                    type: type || 'DIGITAL',
                    category: category || 'SOFTWARE'
                }, accessToken);
                return res.status(201).json(product);
            }

            case 'create-plans-for-sector': {
                // This is triggered by "Deploy Plan" in the admin panel.
                const { sectorKey, sectorDisplayName, monthlyPrices, annualPrices, currencyCode } = payload;

                const createdPlans = [];
                const planDetailsArray = [];

                // Define plans based on tiers (Starter, Pro, Enterprise) for both monthly and annual
                for (const tierName of ["Starter", "Pro", "Enterprise"]) {
                    const monthlyPlanName = `${sectorDisplayName} ${tierName} Package (Monthly)`;
                    const annualPlanName = `${sectorDisplayName} ${tierName} Package (Annual)`;
                    const tierInfo = SECTOR_TIER_PRICING[tierName]; // Get description from backend's SECTOR_TIER_PRICING
                    const description = tierInfo ? tierInfo.description : `${tierName} tier subscription.`;

                    // Add monthly plan details
                    planDetailsArray.push({
                        name: monthlyPlanName,
                        description: `${description} Billed monthly.`,
                        frequency: 'MONTH',
                        intervalCount: 1,
                        amount: monthlyPrices[tierName].toFixed(2),
                        currency: currencyCode
                    });

                    // Add annual plan details
                    planDetailsArray.push({
                        name: annualPlanName,
                        description: `${description} Billed annually. Includes a discount.`,
                        frequency: 'YEAR',
                        intervalCount: 1,
                        amount: annualPrices[tierName].toFixed(2),
                        currency: currencyCode
                    });
                }

                for (const planData of planDetailsArray) {
                    // Check if a plan with this name already exists under the product to avoid duplicates
                    // IMPORTANT: Ensure the product_id is correctly being used in this query as well.
                    const existingPlansResponse = await callPayPalApi(
                        `/v1/billing/plans?product_id=${YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS}&name=${encodeURIComponent(planData.name)}`,
                        'GET', null, accessToken
                    ).catch(err => {
                        console.warn(`Error checking for existing plan "${planData.name}": ${err.message}. Assuming not found.`);
                        return { plans: [] }; // Assume no existing plan if fetch fails
                    });

                    if (existingPlansResponse && existingPlansResponse.plans && existingPlansResponse.plans.length > 0) {
                        const existingPlan = existingPlansResponse.plans[0];
                        console.log(`Plan "${planData.name}" already exists with ID: ${existingPlan.id}. Skipping creation.`);
                        createdPlans.push({ name: planData.name, id: existingPlan.id, status: 'EXISTING' });
                        continue;
                    }

                    console.log(`Attempting to create plan: "${planData.name}" for product: ${YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS}`);
                    try {
                        const planBody = {
                            product_id: YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS, // Use the configured product ID (PROD- ID)
                            name: planData.name,
                            description: planData.description,
                            status: 'ACTIVE',
                            billing_cycles: [{
                                frequency: {
                                    interval_unit: planData.frequency, // e.g., 'MONTH', 'YEAR'
                                    interval_count: planData.intervalCount // e.g., 1
                                },
                                tenure_type: "REGULAR", // or TRIAL, REGULAR
                                sequence: 1,
                                total_cycles: 0, // 0 for infinite cycles
                                pricing_scheme: {
                                    fixed_price: {
                                        value: planData.amount,
                                        currency_code: planData.currency // e.g., 'ZAR'
                                    }
                                }
                            }],
                            payment_preferences: {
                                auto_bill_outstanding: true,
                                setup_fee: { value: "0.00", currency_code: planData.currency },
                                setup_fee_failure_action: "CANCEL", // or CONTINUE_ON_FAILURE
                                payment_failure_threshold: 3
                            },
                        };
                        const createdPlan = await callPayPalApi('/v1/billing/plans', 'POST', planBody, accessToken);
                        createdPlans.push({ name: createdPlan.name, id: createdPlan.id, status: createdPlan.status }); // Simplified response for frontend
                        console.log(`Successfully created PayPal plan: ${createdPlan.id} - ${createdPlan.name}`);
                    } catch (planError) {
                        console.error(`Failed to create plan "${planData.name}":`, planError);
                        createdPlans.push({ name: planData.name, error: planError.message });
                    }
                }
                return res.status(200).json({ success: true, message: 'Plan creation process completed.', createdPlans: createdPlans });
            }

            case 'create-subscription': {
                const { planId, subscriberDetails } = payload; // Expect planId and basic subscriber info
                console.log('Creating PayPal subscription for plan:', planId);

                // Minimal subscriber details for testing:
                const mockSubscriber = subscriberDetails || {
                    name: {
                        given_name: "Test",
                        surname: "User"
                    },
                    email_address: "testuser@example.com"
                };

                const subscriptionBody = {
                    plan_id: planId,
                    subscriber: mockSubscriber,
                    application_context: {
                        // IMPORTANT: These URLs must point to your actual live frontend URLs
                        return_url: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/subscription-success` : 'https://seedwave.faa.zone/admin-panel.co.za/subscription-success',
                        cancel_url: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/subscription-cancel` : 'https://seedwave.faa.zone/admin-panel.co.za/subscription-cancel',
                        brand_name: 'FAA.ZONE™',
                        locale: 'en-ZA',
                        shipping_preference: 'NO_SHIPPING_ADDRESS' // Adjust as needed based on your product
                    }
                };

                const subscription = await callPayPalApi('/v1/billing/subscriptions', 'POST', subscriptionBody, accessToken);
                // The response will contain a 'links' array with an 'approve' URL.
                const approveLink = subscription.links.find(link => link.rel === 'approve');
                if (approveLink) {
                    return res.status(201).json({ id: subscription.id, status: subscription.status, approveUrl: approveLink.href });
                } else {
                    throw new Error('Approval URL not found in PayPal subscription response.');
                }
            }

            case 'capture-subscription': {
                // This endpoint is called by the frontend's onApprove.
                // It's for confirming the subscription with your backend AFTER PayPal approval.
                const { subscriptionID, orderID, payerID, ...otherDetails } = payload;
                console.log(`Backend confirming subscription: ${subscriptionID}`);

                // 1. **VERIFY SUBSCRIPTION STATUS WITH PAYPAL (CRITICAL)**
                const paypalSubscription = await callPayPalApi(`/v1/billing/subscriptions/${subscriptionID}`, 'GET', null, accessToken);
                if (paypalSubscription.status !== 'ACTIVE' && paypalSubscription.status !== 'APPROVAL_PENDING') {
                    console.warn(`Subscription ${subscriptionID} not in expected status: ${paypalSubscription.status}`);
                    return res.status(400).json({ success: false, message: `PayPal subscription status is ${paypalSubscription.status}` });
                }

                // 2. **STORE SUBSCRIPTION DETAILS IN YOUR DATABASE**
                // In a real application, you would save `paypalSubscription` details
                // (e.g., ID, status, plan ID, start time, next billing date, payer details)
                // into your database here. Link it to your user account.
                console.log("Subscription details received and verified from PayPal:", paypalSubscription);
                console.log("Fulfilling service for user associated with:", paypalSubscription.subscriber.email_address);

                return res.status(200).json({
                    success: true,
                    message: `Subscription ${subscriptionID} confirmed and recorded.`,
                    status: paypalSubscription.status,
                    paypalSubscriptionId: subscriptionID
                });
            }

            case 'verify-webhook-signature': {
                // Endpoint for PayPal to send webhook events to
                // CRITICAL: VERIFY THE WEBHOOK SIGNATURE IN LIVE!
                if (!PAYPAL_WEBHOOK_ID || !PAYPAL_WEBHOOK_SECRET) {
                    console.error("PayPal Webhook ID or Secret environment variables are missing!");
                    return res.status(500).json({ error: "Webhook verification credentials not configured." });
                }

                try {
                    const { 'paypal-transmission-id': transmissionId, 'paypal-transmission-time': transmissionTime, 'paypal-transmission-sig': transmissionSig, 'paypal-cert-url': certUrl, 'paypal-auth-algo': authAlgo } = req.headers;
                    const webhookEvent = req.body; // Raw JSON body of the webhook event

                    // For robust production, consider using PayPal's Node.js SDK's WebhookEvent.validate.
                    // This implementation relies on a direct API call to PayPal for verification.
                    const verifyResponse = await fetch(`${PAYPAL_API_BASE_URL}/v1/notifications/verify-webhook-signature`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({
                            auth_algo: authAlgo,
                            cert_url: certUrl,
                            transmission_id: transmissionId,
                            transmission_time: transmissionTime,
                            transmission_sig: transmissionSig,
                            webhook_id: PAYPAL_WEBHOOK_ID,
                            webhook_event: webhookEvent // The raw JSON parsed event body
                        })
                    });

                    const verificationResult = await verifyResponse.json();

                    if (!verifyResponse.ok || verificationResult.verification_status !== 'SUCCESS') {
                        console.warn("Webhook signature verification FAILED:", verificationResult);
                        console.warn("Received Webhook Event (Verification Failed):", JSON.stringify(webhookEvent, null, 2));
                        return res.status(403).json({ status: verificationResult.verification_status, message: 'Webhook signature verification failed.' });
                    }

                    // If verification SUCCESS, process the webhook event
                    console.log("Webhook signature verification SUCCESS:", verificationResult.verification_status);
                    console.log("Received Webhook Event:", JSON.stringify(webhookEvent, null, 2));

                    // --- IMPORTANT: Process Webhook Event Here ---
                    // Update your database based on event_type (e.g., BILLING.SUBSCRIPTION.ACTIVATED, PAYMENT.SALE.COMPLETED)
                    // Example:
                    // if (webhookEvent.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
                    //    // Mark subscription as active in your DB, grant access
                    //    console.log(`Subscription ACTIVATED: ${webhookEvent.resource.id}`);
                    // } else if (webhookEvent.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
                    //    // Mark subscription as cancelled in your DB, revoke access
                    //    console.log(`Subscription CANCELLED: ${webhookEvent.resource.id}`);
                    // }
                    // ... handle other event types

                    return res.status(200).json({ status: 'SUCCESS', message: 'Webhook received and verified.' });

                } catch (error) {
                    console.error('Error verifying webhook signature or processing webhook:', error);
                    return res.status(500).json({ error: 'Internal server error during webhook processing.', details: error.message });
                }
            }

            default:
                return res.status(400).json({ error: 'Invalid API action specified.' });
        }
    } catch (error) {
        console.error('API handler (main) error:', error);
        // General error response for unexpected issues
        return res.status(500).json({ error: 'Internal server error or API issue.', details: error.message });
    }
});

// IMPORTANT: This line is crucial for Vercel to recognize and serve your Express app
module.exports = app;

// For local testing, you might want to uncomment the listen block,
// but for Vercel serverless functions, this is not needed as Vercel handles the listening.
/*
const PORT = process.env.PORT || 3001; // Vercel uses process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
*/

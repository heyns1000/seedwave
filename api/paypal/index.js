// api/paypal/index.js
// This file is designed as a Vercel Serverless Function to interact with PayPal's LIVE API.
// All sensitive credentials MUST be stored as Vercel Environment Variables.

const fetch = require('node-fetch'); // Ensure 'node-fetch' is installed (npm install node-fetch)
const crypto = require('crypto'); // Built-in Node.js module

// --- Configuration & Environment Variables ---
// IMPORTANT: These environment variables MUST be set in your Vercel project settings
// for LIVE deployment. For local Vercel CLI testing, use a .env.local file.
const PAYPAL_CLIENT_ID = process.env.PAYPAL_LIVE_CLIENT_ID || 'YOUR_LIVE_PAYPAL_CLIENT_ID_FROM_VERCEL_ENV';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_LIVE_CLIENT_SECRET || 'YOUR_LIVE_PAYPAL_CLIENT_SECRET_FROM_VERCEL_ENV';
const PAYPAL_API_BASE_URL = 'https://api-m.paypal.com'; // PayPal LIVE API Base URL

// For Webhook Verification - CRITICAL FOR LIVE!
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_LIVE_WEBHOOK_ID || 'YOUR_LIVE_WEBHOOK_ID'; // <--- **YOU MUST REPLACE THIS**
const PAYPAL_WEBHOOK_SECRET = process.env.PAYPAL_LIVE_WEBHOOK_SECRET || 'YOUR_LIVE_WEBHOOK_SIGNING_SECRET'; // <--- **YOU MUST REPLACE THIS**

// Define your single product ID to which all plans will be linked
// This *must* be your actual PayPal Product ID (starts with PROD-)
const YOUR_PAYPAL_PRODUCT_ID_FOR_PLANS = process.env.PAYPAL_LIVE_PRODUCT_ID || 'YOUR_ACTUAL_PAYPAL_PRODUCT_ID_HERE'; // Example: PROD-5FD60555F23244316. **YOU MUST REPLACE THIS**

// --- Helper Function: Generate PayPal Access Token ---
async function generateAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error("PayPal Live Client ID or Secret environment variables are missing!");
        throw new Error("PayPal LIVE credentials not configured. Cannot generate access token.");
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
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
        'PayPal-Request-Id': `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 10)}` // Idempotency key
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


// --- Main Serverless Function Handler ---
module.exports = async (req, res) => {
    const { action } = req.query; // Query parameter for the action (e.g., ?action=get-plans)

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this for production to your frontend domain
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, PayPal-Request-Id');
        return res.status(204).end();
    }

    // Set CORS headers for actual requests
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this for production to your frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Only methods used below
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, PayPal-Request-Id');

    if (req.method === 'GET' || req.method === 'POST') {
        try {
            const accessToken = await generateAccessToken();

            switch (action) {
                case 'get-plans': {
                    // Fetch all existing plans from PayPal
                    console.log('Fetching all PayPal billing plans...');
                    // You might want to filter by product_id if you have many products
                    const plansResponse = await callPayPalApi(`/v1/billing/plans?page_size=100`, 'GET', null, accessToken); // Fetch up to 100 plans
                    const plans = plansResponse.plans;

                    const paypalPlanIDsMap = {};
                    plans.forEach(plan => {
                        // Construct a key that matches your frontend's naming convention:
                        // "Sector & Biotech Tier Package_BILLING_CYCLE" (e.g., "Agriculture & Biotech Starter Package_MONTHLY")
                        // This requires the plan name in PayPal to be consistent.
                        // Example: "Agri & Biotech Starter (Monthly)" needs to map to "Agriculture & Biotech Starter Package_MONTHLY"
                        
                        const baseNameMatch = plan.name.match(/(.+?)\s*\((Monthly|Annual)\)/);
                        if (baseNameMatch) {
                            let cleanName = baseNameMatch[1].trim(); // "Agri & Biotech Starter"
                            let billingType = baseNameMatch[2]; // "Monthly" or "Annual"

                            // Map common names from PayPal to your frontend's 'Package' suffix
                            if (cleanName === 'Agri & Biotech Starter') cleanName = 'Agriculture & Biotech Starter Package';
                            // Add more specific mappings if PayPal names differ from your frontend product names
                            // e.g., if PayPal has "FinGrid Pro Plan" and frontend is "Banking Pro Package", map them here.

                            const frontendKey = `${cleanName.replace(/\s/g, '_')}_${billingType.toUpperCase()}`;
                            paypalPlanIDsMap[frontendKey] = plan.id;
                        } else {
                            console.warn(`Plan name format not recognized for keying: "${plan.name}". Skipping.`);
                        }
                    });

                    return res.status(200).json(paypalPlanIDsMap);
                }

                case 'create-product': {
                    // This action is generally for initial setup or if you have many distinct products
                    // If all plans belong to one global product, you only need to run this once.
                    const { name, description, type, category } = req.body;
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
                    const { productId, sectorKey, sectorDisplayName, monthlyPrices, annualPrices, currencyCode, tierPricingInfo } = req.body;

                    if (!productId || !productId.startsWith('PROD-')) {
                        return res.status(400).json({ error: 'Valid PayPal Product ID (starting with PROD-) is required to create plans.' });
                    }

                    const createdPlans = [];
                    const planDetailsArray = [];

                    for (const tierName of ["Starter", "Pro", "Enterprise"]) {
                        const monthlyPlanName = `${sectorDisplayName} ${tierName} Package (Monthly)`;
                        const annualPlanName = `${sectorDisplayName} ${tierName} Package (Annual)`;
                        const baseDescription = `Subscription for ${sectorDisplayName} ${tierName} Package.`;
                        
                        planDetailsArray.push({
                            name: monthlyPlanName,
                            description: `${baseDescription} Billed monthly.`,
                            frequency: 'MONTH',
                            intervalCount: 1,
                            amount: monthlyPrices[tierName].toFixed(2),
                            currency: currencyCode
                        });

                        planDetailsArray.push({
                            name: annualPlanName,
                            description: `${baseDescription} Billed annually. Includes a discount.`,
                            frequency: 'YEAR',
                            intervalCount: 1,
                            amount: annualPrices[tierName].toFixed(2),
                            currency: currencyCode
                        });
                    }

                    for (const planData of planDetailsArray) {
                        // Check if a plan with this name already exists
                        const existingPlansResponse = await callPayPalApi(`/v1/billing/plans?product_id=${productId}&plan_name=${encodeURIComponent(planData.name)}`, 'GET', null, accessToken).catch(() => ({ plans: [] }));
                        if (existingPlansResponse && existingPlansResponse.plans && existingPlansResponse.plans.length > 0) {
                            console.log(`Plan "${planData.name}" already exists. Skipping creation.`);
                            createdPlans.push({ name: planData.name, id: existingPlansResponse.plans[0].id, status: 'EXISTING' });
                            continue;
                        }

                        console.log(`Attempting to create plan: "${planData.name}" for product: ${productId}`);
                        try {
                            const planBody = {
                                product_id: productId,
                                name: planData.name,
                                description: planData.description,
                                status: 'ACTIVE',
                                billing_cycles: [{
                                    frequency: {
                                        interval_unit: planData.frequency,
                                        interval_count: planData.intervalCount
                                    },
                                    tenure_type: "REGULAR",
                                    sequence: 1,
                                    total_cycles: 0,
                                    pricing_scheme: {
                                        fixed_price: {
                                            value: planData.amount,
                                            currency_code: planData.currency
                                        }
                                    }
                                }],
                                payment_preferences: {
                                    auto_bill_outstanding: true,
                                    setup_fee: { value: "0.00", currency_code: planData.currency },
                                    setup_fee_failure_action: "CONTINUE",
                                },
                            };
                            const createdPlan = await callPayPalApi('/v1/billing/plans', 'POST', planBody, accessToken);
                            createdPlans.push(createdPlan);
                            console.log(`Successfully created PayPal plan: ${createdPlan.id} - ${createdPlan.name}`);
                        } catch (planError) {
                            console.error(`Failed to create plan "${planData.name}":`, planError);
                            createdPlans.push({ name: planData.name, error: planError.message });
                        }
                    }
                    return res.status(200).json({ success: true, message: 'Plan creation process completed.', createdPlans: createdPlans });
                }

                case 'create-subscription': {
                    const { planId, subscriberDetails } = req.body;
                    console.log('Creating PayPal subscription for plan:', planId);

                    const mockSubscriber = subscriberDetails || {
                        name: { given_name: "Test", surname: "User" },
                        email_address: "testuser@example.com"
                    };

                    const subscriptionBody = {
                        plan_id: planId,
                        subscriber: mockSubscriber,
                        application_context: {
                            return_url: 'https://seedwave.faa.zone/subscription-success', // IMPORTANT: Change to your actual success URL
                            cancel_url: 'https://seedwave.faa.zone/subscription-cancel', // IMPORTANT: Change to your actual cancel URL
                            brand_name: 'FAA.ZONE™',
                            locale: 'en-ZA',
                            shipping_preference: 'NO_SHIPPING_ADDRESS'
                        }
                    };

                    const subscription = await callPayPalApi('/v1/billing/subscriptions', 'POST', subscriptionBody, accessToken);
                    const approveLink = subscription.links.find(link => link.rel === 'approve');
                    if (approveLink) {
                        return res.status(201).json({ id: subscription.id, status: subscription.status, approveUrl: approveLink.href });
                    } else {
                        throw new Error('Approval URL not found in PayPal subscription response.');
                    }
                }

                case 'capture-subscription': { // Endpoint for your backend to confirm approved subscription
                    const { subscriptionID, ...otherDetails } = req.body;
                    console.log(`Backend confirming subscription: ${subscriptionID}`);

                    const paypalSubscription = await callPayPalApi(`/v1/billing/subscriptions/${subscriptionID}`, 'GET', null, accessToken);
                    if (paypalSubscription.status !== 'ACTIVE' && paypalSubscription.status !== 'APPROVED') {
                        console.warn(`Subscription ${subscriptionID} not in expected status: ${paypalSubscription.status}`);
                        return res.status(400).json({ success: false, message: `PayPal subscription status is ${paypalSubscription.status}` });
                    }
                    
                    console.log("Subscription details received and verified from PayPal:", paypalSubscription);
                    return res.status(200).json({
                        success: true,
                        message: `Subscription ${subscriptionID} confirmed and recorded.`,
                        status: paypalSubscription.status,
                        paypalSubscriptionId: subscriptionID
                    });
                }

                case 'verify-webhook-signature': {
                    if (!PAYPAL_WEBHOOK_ID || !PAYPAL_WEBHOOK_SECRET) {
                        console.error("PayPal Webhook ID or Secret environment variables are missing!");
                        return res.status(500).json({ error: "Webhook verification credentials not configured." });
                    }

                    try {
                        const { 'paypal-transmission-id': transmissionId, 'paypal-transmission-time': transmissionTime, 'paypal-transmission-sig': transmissionSig, 'paypal-cert-url': certUrl, 'paypal-auth-algo': authAlgo } = req.headers;
                        const webhookEvent = req.body;

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
                                webhook_event: webhookEvent
                            })
                        });

                        const verificationResult = await verifyResponse.json();

                        if (!verifyResponse.ok || verificationResult.verification_status !== 'SUCCESS') {
                            console.warn("Webhook signature verification FAILED:", verificationResult);
                            console.warn("Received Webhook Event (Verification Failed):", JSON.stringify(webhookEvent, null, 2));
                            return res.status(403).json({ status: verificationResult.verification_status, message: 'Webhook signature verification failed.' });
                        }

                        console.log("Webhook signature verification SUCCESS:", verificationResult.verification_status);
                        console.log("Received Webhook Event:", JSON.stringify(webhookEvent, null, 2));

                        // --- IMPORTANT: Process Webhook Event Here ---
                        return res.status(200).json({ status: 'SUCCESS', message: 'Webhook received and verified.' });

                    } catch (error) {
                        console.error('Error verifying webhook signature or processing webhook:', error);
                        return res.status(500).json({ error: 'Internal server error during webhook processing.', details: error.message });
                    }
                }

                default:
                    return res.status(400).json({ error: 'Invalid PayPal action specified.' });
            }
        } catch (error) {
            console.error('PayPal API handler (main) error:', error);
            return res.status(500).json({ error: 'Internal server error or PayPal API issue.', details: error.message });
        }
    } else {
        return res.status(405).send('Method Not Allowed');
    }
};
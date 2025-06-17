/**
 * ===================================================================================
 * Vercel Serverless Function for REAL PayPal API Integration
 * ===================================================================================
 * This file IS your backend. It handles all secure communication with the PayPal API.
 * It is designed to be deployed to Vercel.
 *
 * --- IMPORTANT SECURITY NOTE ---
 * For a live production environment, these credentials should NOT be hardcoded.
 * They should be stored as Environment Variables in your Vercel project settings.
 */

// These packages must be listed in your package.json
const paypal = require('@paypal/checkout-server-sdk');
const express = require('express');

const app = express();
app.use(express.json());

// --- PayPal API Environment Setup ---
// Using the LIVE credentials you provided.
const liveClientId = "BAAThS_oBJJ22PM5R1nVJpXoSl9c3si7TJ3ICJBTht_PAFcRprbXkTv4_wqrG37kkAjUcv3tKBOxnUGQ98";
const liveClientSecret = "EFSS4mbIMZ6Q3ijOGCjqA9i4b3dzHULkCEV9jKAAHO9_fbO2aP9YCGRV9ekZaHqT2zSZL6Svrn-WyhIs";
const liveProductId = "P-07F980334R518562XNBHLNJY"; // Your Agri & Biotech Product ID

const environment = new paypal.core.LiveEnvironment(liveClientId, liveClientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

/**
 * --- Main API Router ---
 * Your vercel.json rewrites /api/* to this file.
 * The router below handles specific paths like /api/paypal/plans.
 */
app.post('/api/paypal', async (req, res) => {
    const { action, payload } = req.body;

    console.log(`Backend received action: ${action}`);

    try {
        if (action === 'create-plans-for-sector') {
            const createdPlans = await createAllPlansForSector(payload);
            res.status(201).json({ success: true, message: 'Plans created successfully', createdPlans });
        } else {
            res.status(400).json({ success: false, error: 'Invalid action specified.' });
        }
    } catch (error) {
        console.error(`PayPal API Error for action "${action}":`, error.message);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'An internal server error occurred.';
        res.status(statusCode).json({ success: false, error: message, details: error.details || {} });
    }
});

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
 */
async function createAllPlansForSector(payload) {
    const { sectorDisplayName, monthlyPrices, annualPrices, currencyCode } = payload;
    const planCreationPromises = [];

    const createPlanRequest = (tier, billingCycle, amount) => {
        const planName = `${sectorDisplayName.replace('🌱', '').trim()} ${tier} Package (${billingCycle})`;
        const requestId = `plan-${Date.now()}-${Math.random()}`; // Unique ID for idempotency

        const request = new paypal.catalog.PlansCreateRequest();
        request.prefer("return=representation");
        request.payPalRequestId(requestId);
        request.requestBody({
            product_id: liveProductId,
            name: planName,
            description: `${billingCycle} subscription for the ${tier} tier.`,
            status: "ACTIVE",
            billing_cycles: [{
                frequency: { interval_unit: billingCycle === 'MONTHLY' ? 'MONTH' : 'YEAR', interval_count: 1 },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: {
                    fixed_price: { value: amount.toFixed(2), currency_code: currencyCode }
                }
            }],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee_failure_action: "CANCEL",
                payment_failure_threshold: 3
            }
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
 * Lists all active subscription plans from your PayPal account.
 */
async function listPayPalPlans() {
    const request = new paypal.catalog.PlansListRequest();
    request.productId(liveProductId);
    request.pageSize(20);
    const response = await client.execute(request);
    return response.result.plans;
}

// Export the Express app for Vercel
module.exports = app;

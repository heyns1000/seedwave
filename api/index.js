const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const app = express();

// Middleware for parsing request bodies
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'a_placeholder_secret_CHANGE_THIS_IN_PRODUCTION', // Set this in Vercel env vars!
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '.faa.zone' : undefined
    }
}));

// Serve static files from the 'public' directory one level up
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Endpoint for basic health check
app.get('/api/hello', (req, res) => {
    res.status(200).json({ message: 'Hello from Seedwave API Gateway!' });
});

// API Endpoint to check user session status
app.get('/api/auth/check-session', (req, res) => {
    if (req.session.user && req.session.user.isAuthenticated) {
        res.json({
            isAuthenticated: true,
            user: {
                email: req.session.user.email,
                role: req.session.user.role
            }
        });
    } else {
        // Line previously caused error - now corrected to be single line
        res.status(401).json({ isAuthenticated: false, message: 'Not authenticated.' });
    }
});

// API Endpoint for user logout
app.get('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out.', error: err.message });
        }
        res.clearCookie('connect.sid', {
            domain: process.env.NODE_ENV === 'production' ? '.faa.zone' : undefined,
            path: '/'
        });
        res.json({ message: 'Logged out successfully.' });
    });
});

// API Endpoint for Zoho OAuth login initiation
app.get('/api/auth/zoho-login', (req, res) => {
    const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
    const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
    const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com';

    // Store returnTo URL in session for after Zoho callback
    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
    } else {
        req.session.returnTo = '/admin-portal.html'; // Default redirect
    }

    const scope = 'aaaserver.profile.READ'; // Define required Zoho scope

    // Construct the Zoho OAuth authorization URL
    const authUrl = `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `client_id=${ZOHO_CLIENT_ID}&` +
                    `response_type=code&` +
                    `redirect_uri=${encodeURIComponent(ZOHO_REDIRECT_URI)}&` +
                    `access_type=offline`;

    res.redirect(authUrl); // Redirect user to Zoho for authentication
});

// API Endpoint for Zoho OAuth callback (Line 90 starts here)
app.get('/api/auth/zoho/callback', async (req, res) => {
    const code = req.query.code;
    const redirectUrl = req.session.returnTo || '/admin-portal.html';

    if (!code) {
        console.error('Zoho Callback: Authorization code missing.');
        // Line previously caused error - now corrected to be single line
        return res.status(400).send('Authentication failed: Authorization code missing.');
    }

    // The rest of your Zoho callback logic (axios calls, token exchange, session update) would go here
    // Example placeholder:
    try {
        // You would typically exchange the code for access/refresh tokens here
        // using axios to Zoho's token endpoint.
        // const tokenResponse = await axios.post(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, { ... });

        // For now, let's simulate success and redirect
        req.session.user = { isAuthenticated: true, email: 'test@example.com', role: 'admin' };
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Error during Zoho token exchange:', error.message);
        res.status(500).send('Authentication failed: Error exchanging Zoho token.');
    }
});


// Export the Express app for Vercel Serverless Functions
module.exports = app

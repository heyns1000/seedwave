cconst express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const app = express();

app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 
'a_placeholder_secret_CHANGE_THIS_IN_PRODUCTION',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '.faa.zone' : 
undefined
    }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/hello', (req, res) => {
    res.status(200).json({ message: 'Hello from Seedwave API Gateway!' });
});

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
        res.status(401).json({ isAuthenticated: false, message: 'Not authenticated.' });
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out.', 
error: err.message });
        }
        res.clearCookie('connect.sid', {
            domain: process.env.NODE_ENV === 'production' ? '.faa.zone' : 
undefined,
            path: '/'
        });
        res.json({ message: 'Logged out successfully.' });
    });
});

app.get('/api/auth/zoho-login', (req, res) => {
    const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
    const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
    const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com';

    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
    } else {
        req.session.returnTo = '/admin-portal.html';
    }

    const scope = 'aaaserver.profile.READ';

    const authUrl = `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `client_id=${ZOHO_CLIENT_ID}&` +
                    `response_type=code&` +
                    
`redirect_uri=${encodeURIComponent(ZOHO_REDIRECT_URI)}&` +
                    `access_type=offline`;

    res.redirect(authUrl);
});

app.get('/api/auth/zoho/callback', async (req, res) => {
    const code = req.query.code;
    const redirectUrl = req.session.returnTo || '/admin-portal.html';

    if (!code) {
        console.error('Zoho Callback: Authorization code missing.');
        return res.status(400).send('Authentication failed: Authorization 
code missing.');
    }

    try {
        const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
        const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
        const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
        const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com';

        const tokenResponse = await 
axios.post(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, null, {
            params: {
                code: code,
                client_id: ZOHO_CLIENT_ID,
                client_secret: ZOHO_CLIENT_SECRET,
                redirect_uri: ZOHO_REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;

        const profileResponse = await 
axios.get(`${ZOHO_ACCOUNTS_URL}/oauth/v2/user/info`, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`
            }
        });

        const zohoUser = profileResponse.data;
        console.log('Zoho User Profile:', zohoUser);

        let userRole = 'client';
        let userHasAccess = false;

        if (zohoUser.Email && (zohoUser.Email.endsWith('@faa.zone') || 
zohoUser.Email === 'heynsschoeman@gmail.com')) {
            userRole = 'admin';
            userHasAccess = true;
        } else {
            userHasAccess = true;
        }

        req.session.user = {
            isAuthenticated: true,
            id: zohoUser.ZUID,
            email: zohoUser.Email,
            fullName: zohoUser.full_name,
            role: userRole,
            zohoAccessToken: accessToken,
            access: {
                isAdminPortal: userRole === 'admin',
                hasQuickView: userHasAccess,
                hasLicenseLedger: userHasAccess,
                hasClauseIndex: userHasAccess,
                hasScrollMap: userHasAccess,
                hasNodeIndex: userHasAccess,
                hasSignalSync: userHasAccess,
                hasSectorGrid: userHasAccess,
                hasEcosystemDashboard: userHasAccess,
            }
        };

        delete req.session.returnTo;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Zoho OAuth Callback Error:', error.response ? 
error.response.data : error.message);
        res.status(500).send('Authentication failed. Please check backend 
logs.');
    }
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Seedwave API Gateway listening on 
http://localhost:${PORT}`);
        console.log(`Access admin portal at 
http://localhost:${PORT}/admin-portal.html`);
    });
}

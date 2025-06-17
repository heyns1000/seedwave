# config.py

# --- PayFast Credentials ---
# IMPORTANT: Replace these with your actual Merchant ID, Merchant Key, and Passphrase.
# Use your PayFast Sandbox credentials for testing.
# NEVER hardcode live credentials in a publicly accessible repository.
# Consider using environment variables for production environments.

PAYFAST_MERCHANT_ID = "YOUR_PAYFAST_MERCHANT_ID"
PAYFAST_MERCHANT_KEY = "YOUR_PAYFAST_MERCHANT_KEY"
PAYFAST_PASSPHRASE = "YOUR_PAYFAST_PASSPHRASE" # This is optional but highly recommended for security

# --- Return/Cancel/Notify URLs ---
# These URLs should be publicly accessible endpoints on your server.
# PayFast will redirect users or send notifications to these URLs.

# URL where the user is redirected after a successful payment
PAYFAST_RETURN_URL = "http://localhost:5000/payment_success" # Change this to your public success URL

# URL where the user is redirected if they cancel the payment
PAYFAST_CANCEL_URL = "http://localhost:5000/payment_cancelled" # Change this to your public cancel URL

# URL where PayFast sends Instant Transaction Notifications (ITN)
# This is crucial for verifying payments on your server-side.
PAYFAST_NOTIFY_URL = "http://localhost:5000/payfast_itn" # Change this to your public ITN URL


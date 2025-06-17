# app.py

from flask import Flask, request, redirect, url_for, render_template, jsonify
import hashlib
import urllib.parse
from collections import OrderedDict
import sys # For printing to stderr, useful for debugging with some deployment environments

# Import your PayFast configuration
from config import (
    PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY,
    PAYFAST_PASSPHRASE,
    PAYFAST_RETURN_URL,
    PAYFAST_CANCEL_URL,
    PAYFAST_NOTIFY_URL
)

app = Flask(__name__)

# Base PayFast URL (use sandbox for testing, live for production)
# For testing: 'https://sandbox.payfast.co.za/eng/process'
# For live:    'https://www.payfast.co.za/eng/process'
PAYFAST_PROCESS_URL = "https://sandbox.payfast.co.za/eng/process"


def generate_signature(data, passphrase=None):
    """
    Generates the PayFast security signature.
    The data should be an OrderedDict to ensure consistent parameter ordering.
    """
    # Sort the array by key.
    # The PayFast documentation states that parameters must be sorted alphabetically.
    # The `data` dictionary must be an OrderedDict for this to work reliably.
    sorted_data = OrderedDict(sorted(data.items()))

    # Build the query string from the sorted data
    # PayFast requires spaces to be replaced with '+'
    query_string = ""
    for key, value in sorted_data.items():
        # Corrected indentation for the if block
        if value is not None and value != '':
            query_string += f"{key}={urllib.parse.quote_plus(str(value).strip())}&"

    # Remove the trailing '&'
    query_string = query_string.rstrip('&')

    # Add the passphrase if provided
    # Corrected indentation for the if block
    if passphrase:
        query_string += f"&passphrase={urllib.parse.quote_plus(str(passphrase).strip())}"

    # Calculate the MD5 hash
    signature = hashlib.md5(query_string.encode('utf-8')).hexdigest()
    return signature

@app.route('/')
def index():
    """
    This route can display a simple page or automatically prepare payment details
    and redirect to the PayFast form.
    For simplicity, we'll demonstrate generating payment data and the signature here.
    In a real app, this data would come from a database (e.g., an order).
    """
    # Example payment data (replace with your actual product/order details)
    payment_data = OrderedDict([
        ('merchant_id', PAYFAST_MERCHANT_ID),
        ('merchant_key', PAYFAST_MERCHANT_KEY),
        ('return_url', PAYFAST_RETURN_URL),
        ('cancel_url', PAYFAST_CANCEL_URL),
        ('notify_url', PAYFAST_NOTIFY_URL),
        ('name_first', 'John'), # Example customer data
        ('name_last', 'Doe'),
        ('email_address', 'john.doe@example.com'),
        ('m_payment_id', 'ORDER-XYZ-789'), # Your unique order ID
        ('amount', '150.00'), # Amount in ZAR
        ('item_name', 'Annual Subscription')
    ])

    # Generate the signature
    # Note: PayFast signature calculation should exclude the 'signature' field itself.
    # The `generate_signature` function is designed to handle this by building
    # the query string from the `payment_data` provided.
    signature = generate_signature(payment_data, PAYFAST_PASSPHRASE)
    payment_data['signature'] = signature

    # If you put the HTML form from the previous canvas into a 'templates' folder
    # you could render it like this:
    # return render_template('payfast_form.html', payment_data=payment_data,
    #                        payfast_process_url=PAYFAST_PROCESS_URL)

    # For now, we'll return a JSON representation of the data
    # that you would use to populate the hidden fields in your HTML form.
    # In a real scenario, you'd likely serve the HTML form (e.g., via render_template)
    # and populate the hidden fields using JavaScript or server-side templating.
    return jsonify({
        "message": "Payment data and signature generated. Use this data to populate your HTML form.",
        "payfast_form_action": PAYFAST_PROCESS_URL,
        "payment_fields": payment_data
    })

@app.route('/payfast_itn', methods=['POST'])
def payfast_itn():
    """
    Handles Instant Transaction Notifications (ITN) from PayFast.
    PayFast will send a POST request to this URL when a transaction status changes.
    """
    itn_data = request.form.to_dict()
    print(f"Received ITN: {itn_data}", file=sys.stderr) # Log ITN data for debugging

    # 1. Verify the ITN (crucial for security)
    # Re-calculate the signature from the received data and compare it.
    # Exclude the received 'signature' and 'passphrase' from the data used for recalculation.
    received_signature = itn_data.pop('signature', None)
    itn_data.pop('passphrase', None) # Remove passphrase if it was sent (shouldn't be in standard ITN)

    # Sort the data alphabetically by key for consistent signature generation
    # PayFast ITN parameters are also sorted alphabetically for signature verification.
    itn_sorted_data = OrderedDict(sorted(itn_data.items()))

    calculated_signature = generate_signature(itn_sorted_data, PAYFAST_PASSPHRASE)

    if received_signature and received_signature == calculated_signature:
        print(f"ITN Signature Verified! Status: {itn_data.get('payment_status')}", file=sys.stderr)

        # 2. Process the ITN data based on payment_status
        payment_status = itn_data.get('payment_status')
        m_payment_id = itn_data.get('m_payment_id') # Your unique order ID

        if payment_status == 'COMPLETE':
            # Payment was successful. Update your database, fulfill the order, etc.
            print(f"Payment COMPLETE for order ID: {m_payment_id}", file=sys.stderr)
            # Example: update_order_status(m_payment_id, 'completed')
        elif payment_status == 'FAILED':
            # Payment failed. Update your database, notify the user, etc.
            print(f"Payment FAILED for order ID: {m_payment_id}", file=sys.stderr)
            # Example: update_order_status(m_payment_id, 'failed')
        elif payment_status == 'PENDING':
            # Payment is pending (e.g., Instant EFT waiting for bank confirmation).
            # Update status, but don't fulfill order yet.
            print(f"Payment PENDING for order ID: {m_payment_id}", file=sys.stderr)
            # Example: update_order_status(m_payment_id, 'pending')
        else:
            print(f"Unhandled payment status: {payment_status} for order ID: {m_payment_id}", file=sys.stderr)

        # 3. Respond to PayFast with a 200 OK status
        # This tells PayFast that you received and processed the ITN successfully.
        return "ITN received and processed.", 200
    else:
        print("ITN Signature Mismatch! Possible tampering or invalid ITN.", file=sys.stderr)
        # It's important to respond with something other than 200 OK
        # if verification fails, or log it as a critical error.
        return "ITN verification failed.", 400

@app.route('/payment_success')
def payment_success():
    """
    User is redirected here after a successful payment on PayFast.
    This is for user experience, the actual payment verification happens via ITN.
    """
    return render_template('success.html')


@app.route('/payment_cancelled')
def payment_cancelled():
    """
    User is redirected here if they cancel the payment on PayFast.
    """
    return render_template('cancelled.html')

if __name__ == '__main__':
    # When running locally for testing, you can use:
    # app.run(debug=True, port=5000)
    # For production, use a production-ready WSGI server like Gunicorn or uWSGI.
    app.run(debug=True, port=5000)

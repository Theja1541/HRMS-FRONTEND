/**
 * Dynamically loads the Razorpay checkout script into the document head.
 * Ensures the script is only loaded once.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

/**
 * Loads Razorpay script and pops open the Checkout Modal in the browser window.
 * 
 * @param {Object} options Razorpay configuration options (key, amount, currency, order_id, prefill, etc.)
 * @param {Function} onSuccess Callback fired when payment is successful
 * @param {Function} onFailure Callback fired on payment error, failure or checkout modal closed
 */
export const openRazorpayCheckout = async (options, onSuccess, onFailure) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    onFailure({ description: "Failed to load Razorpay SDK. Check your internet connection." });
    return;
  }

  const razorpayOptions = {
    ...options,
    handler: function (response) {
      // response contains { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) {
        onSuccess(response);
      }
    },
    modal: {
      ondismiss: function () {
        if (onFailure) {
          onFailure({ description: "Payment checkout was cancelled by the user." });
        }
      },
    },
  };

  try {
    const rzp = new window.Razorpay(razorpayOptions);
    
    // Register separate error event handler if available
    rzp.on("payment.failed", function (response) {
      if (onFailure) {
        onFailure({
          description: response.error.description,
          code: response.error.code,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
        });
      }
    });

    rzp.open();
  } catch (error) {
    if (onFailure) {
      onFailure({ description: `Failed to initialize checkout modal: ${error.message}` });
    }
  }
};

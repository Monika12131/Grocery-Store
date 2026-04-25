let razorpayScriptLoaded = false;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (razorpayScriptLoaded) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      razorpayScriptLoaded = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const initiatePayment = (key_id, order) => {
  return loadRazorpayScript().then((loaded) => {
    if (!loaded || !window.Razorpay) {
      throw new Error('Razorpay SDK failed to load');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'GreenBasket',
        description: 'Fresh Grocery Order',
        order_id: order.id,
        handler: resolve,
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', reject);
      rzp.open();
    });
  });
};

export { initiatePayment };

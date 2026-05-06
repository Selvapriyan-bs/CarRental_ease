exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    res.json({ orderId: `order_${Date.now()}`, amount: amount * 100, currency: 'INR', key: 'rzp_test_mock_key' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.verifyPayment = async (req, res) => {
  try {
    res.json({ success: true, paymentId: `pay_${Date.now()}` });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
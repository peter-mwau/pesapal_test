import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderTrackingId = searchParams.get("OrderTrackingId");
      const merchantRef = searchParams.get("OrderMerchantReference");

      if (!orderTrackingId) {
        setStatus("failed");
        setError("No payment information found");
        return;
      }

      try {
        // Check payment status from backend
        const response = await axios.get(
          `http://localhost:3000/api/payments/status/${orderTrackingId}`,
        );

        const { payment, pesapalStatus } = response.data;

        setPaymentData({
          orderNumber: payment.order.orderNumber,
          amount: payment.amount,
          status: payment.status,
          pesapalStatus: pesapalStatus.payment_status_description,
        });

        // Set status based on payment status
        if (payment.status === "COMPLETED") {
          setStatus("success");
        } else if (payment.status === "FAILED") {
          setStatus("failed");
          setError(payment.errorMessage || "Payment was not successful");
        } else {
          setStatus("pending");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setStatus("failed");
        setError("Failed to verify payment status");
      }
    };

    // Delay to allow IPN to process
    setTimeout(checkPaymentStatus, 2000);
  }, [searchParams]);

  const handleContinue = () => {
    if (status === "success") {
      navigate("/orders");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentData.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">
                      ${paymentData.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">
                      {paymentData.pesapalStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View Orders
            </button>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "There was an issue processing your payment."}
            </p>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentData.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-red-600">
                      {paymentData.pesapalStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Return to Home
            </button>
          </div>
        )}

        {status === "pending" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-yellow-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Pending
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please check your orders shortly.
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentCallback;

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import axios from 'axios'

enum PaymentMethod {
  PROMPT_PAY = 'promptpay',
  CREDIT_CARD = 'card'
}

function App() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>(PaymentMethod.CREDIT_CARD)
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined)
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault()

    let paymentMethod;

    if (!elements || !stripe) return

    if (selectedPaymentMethod === PaymentMethod.CREDIT_CARD) {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return

      const res = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        // add billing details if necessary
      });
      paymentMethod = res.paymentMethod;
      // Handle errors
    } else if (selectedPaymentMethod === PaymentMethod.PROMPT_PAY) {
      // Handle PromptPay payment
      const res = await stripe?.createPaymentMethod({
        type: 'promptpay',
        billing_details: {
          name: "test",
          email: "test@mail.com"
        }
      })
      paymentMethod = res?.paymentMethod
    }


    if (!paymentMethod) return

    const response = await axios.post('http://localhost:8000/create-payment-intent', {
      amount: 10000,
      currency: 'thb',
      paymentMethod: selectedPaymentMethod
    })
    const client_secret = response.data.clientSecret; // Retrieved from your server.

    let paymentIntent
    let paymentIntentError

    try {

      if (selectedPaymentMethod === PaymentMethod.CREDIT_CARD) {
        const { error: piError, paymentIntent: pi } = await stripe.confirmCardPayment(
          client_secret,
          { payment_method: paymentMethod.id }
        );
        paymentIntentError = piError
        paymentIntent = pi
      }
      else if (selectedPaymentMethod === PaymentMethod.PROMPT_PAY) {
        const { error: piError, paymentIntent: pi } = await stripe.confirmPromptPayPayment(
          client_secret,
          { payment_method: paymentMethod.id }
        );
        paymentIntentError = piError
        paymentIntent = pi
      }

      if (paymentIntentError) throw paymentIntentError
    } catch (error) {
      console.error("Failed to confirm PaymentIntent: ", error);
      return
    }

    if (!paymentIntent) return

    switch (paymentIntent.status) {
      // Add cases here for different statuses like 'requires_action', 'succeeded', etc.
      case 'requires_action':
        // Display QR Code using paymentIntent.next_action.promptpay_display_details.qr_code_data
        break;
      case 'succeeded':
        // Payment succeeded.
        setPaymentStatus(paymentIntent.status)
        break;
      default: console.warn(`Unhandled PaymentIntent status: ${paymentIntent.status}`);
        break;
    }

  }

  if (!paymentStatus)
    return (
      <form onSubmit={handleSubmit}>
        <label>
          Payment type:
          <select value={selectedPaymentMethod} onChange={(event) => setSelectedPaymentMethod(event.target.value as PaymentMethod)}>
            <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
            <option value={PaymentMethod.PROMPT_PAY}>PromptPay</option>
          </select>
        </label>
        {selectedPaymentMethod === 'card' && <CardElement />}
        <button type="submit" disabled={!stripe}>
          Pay
        </button>
      </form>
    )

  if (paymentStatus === 'succeeded')
    return (
      <div>
        Payment Success
      </div>
    )
}

export default App;
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js';
import Checkout from './Checkout'

const stripePromise: Promise<Stripe | null> = loadStripe("pk_test_51OJViSHFmY90f7HLErf9akOvB2AmOEMRu8FzywIpYoSUTi0DfDmB6EqI3INKNGGVNJ9bbFvDy6YTkMXKj9D84BcM00iirwI1Aj");

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  )
}

export default App

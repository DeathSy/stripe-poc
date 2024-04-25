import express from "express";
import cors from "cors";
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51OJViSHFmY90f7HLCiMVg2sBqwMRLhS3ZP3M4mkgeosclLiXzrRg8AF2zZmFkTG6PlVbNPkV1XmgQe05YNC0Z4Si00fm1hqFB3",
  {
    apiVersion: "2023-10-16",
  }
); // replace with your secret key

const app = express();

app.use(express.json());
app.use(cors());

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ["card", "promptpay"],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({
      error: (error as any).message,
    });
  }
});

const port = process.env.PORT || 8000; // change to your port
app.listen(port, () => console.log(`Server is running on port ${port}`));

// backend/server.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET);

// CORS allowed for your frontend
app.use(cors({
  origin: [ process.env.FRONTEND_URL || "*" ],
  credentials: true,
}));

// --- IMPORTANT: place the raw body parser before express.json() ---
// Webhook POST must receive raw body for signature verification
app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err && err.message ? err.message : err);
    return res.status(400).send(`Webhook Error: ${err && err.message ? err.message : 'invalid signature'}`);
  }

  console.log("🔥 Stripe event received:", event.type);

  // Add minimal handling for a couple of event types:
  if (event.type === "payment_intent.succeeded") {
    console.log("PaymentIntent succeeded:", event.data.object.id);
    // TODO: fulfill order, mark DB, forward to supplier, email, etc.
  } else if (event.type === "checkout.session.completed") {
    console.log("Checkout session completed:", event.data.object.id);
  }

  res.json({ received: true });
});

// Simple GET test for the webhook so visiting it in a browser shows it's present
app.get("/webhook", (req, res) => {
  res.send("Webhook endpoint is active (POST only).");
});

// Put JSON middleware AFTER the webhook route
app.use(express.json());

// Basic health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Listen on Render-provided port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

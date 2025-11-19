import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET);

// Middlewares
app.use(cors());
app.use(express.json());

// Stripe webhook endpoint (must use raw body)
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
        console.error("Webhook signature error", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("🔥 Stripe event received:", event.type);

    res.json({ received: true });
});

// Simple test endpoint
app.get("/", (req, res) => {
    res.send("Backend is running (Render)");
});

// Render MUST use process.env.PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

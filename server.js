const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Serwowanie statycznych plików (np. HTML, CSS, JS)
app.use(express.static('public'));

// Obsługa ścieżki głównej
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/checkout.html'); // Zwróć plik HTML
});

// Endpoint do tworzenia sesji płatności Stripe
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1QdaCgGgU76qWzUhu1w41Tsx', // Zastąp rzeczywistym Price ID z Stripe
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://stripe-tau-ashy.vercel.app/success.html', // Zastąp swoją domeną frontendu
      cancel_url: 'https://stripe-tau-ashy.vercel.app/cancel.html', // Zastąp swoją domeną frontendu
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

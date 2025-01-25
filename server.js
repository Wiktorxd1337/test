const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors'); // Importuj middleware CORS
const app = express();

// Użyj middleware CORS
app.use(cors({
  origin: 'https://kielbasnik.com', // Zezwól na żądania z tej domeny
  methods: ['POST', 'OPTIONS'], // Zezwól na żądania POST i OPTIONS (preflight)
  allowedHeaders: ['Content-Type'], // Zezwól na nagłówek Content-Type
}));

// Middleware do parsowania JSON
app.use(express.json());

// Serwowanie statycznych plików (np. HTML, CSS, JS)
app.use(express.static('public'));

// Obsługa ścieżki głównej
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/checkout.html'); // Zwróć plik HTML
});

// Endpoint do tworzenia sesji płatności Stripe
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { lineItems, successUrl, cancelUrl, allowedCountries } = req.body;

    // Tworzenie sesji płatności Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: allowedCountries,
      },
    });

    // Zwróć zarówno id, jak i url sesji
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Uruchomienie serwera
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));

// Eksportuj serwer dla Vercel
module.exports = app;

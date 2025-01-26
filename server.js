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
     payment_method_types: ['card', 'blik', 'p24'],  // Obsługiwane metody płatności
  line_items: lineItems,  // Lista produktów w koszyku
  mode: 'payment',  // Tryb płatności
  success_url: 'https://kielbasnik.com/dziekujemy',  // URL przekierowania po udanej płatności
  cancel_url: 'https://kielbasnik.com/sklep-kielbasnik',  // URL przekierowania po anulowaniu płatności
  shipping_address_collection: {
    allowed_countries: allowedCountries,  // Dozwolone kraje do dostawy
  },
  phone_number_collection: {
    enabled: true,  // Włącz zbieranie numerów telefonów
  },
      
  shipping_options: [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 2000, // 20 PLN (kwota w groszach)
          currency: 'pln', // Waluta w PLN
        },
        display_name: 'Dostawa kurierem', // Opcja 1: Dostawa kurierem
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 3, // Minimalny czas dostawy: 3 dni robocze
          },
          maximum: {
            unit: 'business_day',
            value: 5, // Maksymalny czas dostawy: 5 dni roboczych
          },
        },
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 1800, // 18 PLN (kwota w groszach)
          currency: 'pln', // Waluta w PLN
        },
        display_name: 'Dostawa do paczkomatu', // Opcja 2: Dostawa do paczkomatu
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 2, // Minimalny czas dostawy: 2 dni robocze
          },
          maximum: {
            unit: 'business_day',
            value: 4, // Maksymalny czas dostawy: 4 dni robocze
          },
        },
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 0, // Darmowy odbiór osobisty
          currency: 'pln', // Waluta w PLN
        },
        display_name: 'Odbiór osobisty', // Opcja 3: Odbiór osobisty
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 1, // Minimalny czas: 1 dzień roboczy
          },
          maximum: {
            unit: 'business_day',
            value: 1, // Maksymalny czas: 1 dzień roboczy
          },
        },
      },
    },
  ],
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

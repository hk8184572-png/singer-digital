import './globals.css';

export const metadata = {
  title: 'Singer Digital National Electronics – Alipur Chatha',
  description: 'Singer Digital National Electronics – Alipur Chatha. Fridge, AC, Washing Machine, LED, Vivo & Samsung Mobile Phones, Air Fryer, Electric Kaital & Food Processor. Contact: 0303-2997825 / 0302-6674808',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ur-PK">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

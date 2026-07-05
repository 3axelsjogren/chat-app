# Chatt-app

En full-stack privat chattapplikation byggd med Vue 3, Node.js/Express och MySQL, med realtidsmeddelanden via Socket.io.

## Funktioner

- 🔐 Registrering och inloggning med JWT-autentisering och bcrypt-hashade lösenord
- 👥 Sök efter användare, skicka och hantera vänförfrågningar
- 💬 Privata en-till-en-konversationer
- ⚡ Realtidsleverans av meddelanden via Socket.io (ingen refresh krävs)
- 🔴 Oläst-badge på vänlistan när nya meddelanden kommer in
- 📱 Responsiv design – separat vy för mobil (växla mellan vänlista och konversation) och sida-vid-sida-layout på desktop

## Teknisk stack

**Frontend**
- Vue 3 (Composition API, `<script setup>`)
- TypeScript
- Vite
- Vue Router
- Socket.io-client

**Backend**
- Node.js + Express
- MySQL (via `mysql2`/connection pool)
- Socket.io
- JWT (`jsonwebtoken`) för autentisering
- bcrypt för lösenordshashning

## Projektstruktur

```
chat-app/
├── frontend/          # Vue 3-applikation
│   ├── src/
│   │   ├── views/     # LoginView, ChatView, m.fl.
│   │   ├── socket.ts  # Socket.io-klient-instans
│   │   └── ...
│   └── vite.config.ts
├── backend/            # Express-server
│   ├── src/
│   │   ├── routes/    # auth, friends, messages
│   │   ├── middleware/
│   │   ├── socket.js  # Socket.io-init + auth-middleware
│   │   └── db.js
│   └── app.js
└── README.md
```

## Kom igång

### Förutsättningar

- Node.js (v18 eller senare rekommenderas)
- En MySQL-databas (lokal eller fjärransluten)

### 1. Klona repot

```bash
git clone https://github.com/3axelsjogren/chat-app.git
cd chat-app
```

### 2. Backend

```bash
cd backend
npm install
```

Skapa en `.env`-fil i `backend/`-mappen med:

```dotenv
JWT_SECRET=din_egen_hemliga_nyckel
DB_HOST=localhost
DB_USER=ditt_db_användarnamn
DB_PASSWORD=ditt_db_lösenord
DB_NAME=chat_app
```

> Justera variabelnamnen ovan så de matchar din faktiska `db.js`-konfiguration.

Starta servern:

```bash
node app.js
```

Servern kör som standard på `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
```

Skapa en `.env`-fil i `frontend/`-mappen med:

```dotenv
VITE_API_URL=
```

(Tom som standard – appen använder relativa API-anrop och en Vite-proxy mot backend under utveckling.)

Starta dev-servern:

```bash
npm run dev
```

Appen är nu tillgänglig på `http://localhost:5173`.

## Databas

Projektet förväntar sig tabeller ungefär enligt:

- `users` – användarkonton (id, username, password-hash, m.fl.)
- `friendships` – vänrelationer med status (`pending`/`accepted`)
- `messages` – meddelanden (sender_id, receiver_id, content, is_read, created_at)

## Roadmap

- [ ] Läskvitton (`is_read`-fältet finns redan i databasen, ej kopplat i UI ännu)
- [ ] Bildhantering i meddelanden
- [ ] Push-notiser utanför appen

## Licens

Detta är ett personligt/skolprojekt utan formell licens ännu.

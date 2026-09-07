# Resource Reservatie App

Eenvoudige webapp om 10 devices te reserveren voor een team van 15 personen.

## Features

- Login via Office 365 / Microsoft Entra ID, gekoppeld als Auth0 enterprise connection
- Rollen `user` en `admin`; admins worden ingesteld via `ADMIN_EMAILS`
- Overzicht van alle reservaties
- Alleen eigen reservaties aanmaken, aanpassen, verplaatsen en verwijderen
- Conflictcontrole:
  - Geen overlappende reservaties voor hetzelfde device
  - Geen overlappende reservaties voor dezelfde gebruiker
- Seeddata met devices

## Installatie

```bash
npm install
```

## Auth0 configureren

1. Kopieer .env.example naar .env
2. Vul je Auth0 gegevens in:

- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_AUDIENCE
- AUTH0_ISSUER_BASE_URL
- AUTH0_CONNECTION (de naam van je Auth0 Microsoft Entra ID connection)
- ADMIN_EMAILS (komma-gescheiden Office 365 e-mailadressen van admins)

3. Zorg dat in Auth0 voor je SPA-app deze URLs zijn toegestaan:

- Allowed Callback URLs: http://localhost:3000
- Allowed Logout URLs: http://localhost:3000
- Allowed Web Origins: http://localhost:3000

4. Gebruik dezelfde Audience als AUTH0_AUDIENCE in je API-config in Auth0

## Starten

```bash
npm start
```

Open daarna:

- http://localhost:3000

## Office 365 SSO instellen

1. Maak in Microsoft Entra admin center een App registration voor Auth0 en configureer de Auth0 Microsoft Entra ID enterprise connection.
2. Zet de connection aan voor de Auth0-app en vul de exacte connectionnaam in als `AUTH0_CONNECTION`.
3. Gebruik in `ADMIN_EMAILS` de volledige Office 365-adressen van beheerders, bijvoorbeeld `beheer@bedrijf.be,admin@bedrijf.be`.
4. De rol wordt bij elke login server-side opnieuw bepaald. Een gebruiker kan alleen eigen reservaties beheren; een admin kan alle reservaties beheren.

## API-endpoints

- GET /api/health
- GET /api/auth/config
- GET /api/auth/me
- GET /api/meta
- GET /api/reservations
- POST /api/reservations
- PUT /api/reservations/:id
- DELETE /api/reservations/:id

## Data-opslag

Data wordt lokaal opgeslagen in:

- data/db.json

Bij eerste succesvolle Auth0-login wordt de gebruiker automatisch toegevoegd in de users-collectie.

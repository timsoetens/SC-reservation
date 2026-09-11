# Resource Reservatie App

Eenvoudige webapp om 10 devices te reserveren voor een team van 15 personen.

## Features

- Login via Google Workspace, gekoppeld als Auth0 social connection
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
- AUTH0_CONNECTION (standaard `google-oauth2`, of de naam van je eigen Auth0 Google connection)
- ADMIN_EMAILS (komma-gescheiden Google Workspace-e-mailadressen van admins)

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

## Google Workspace SSO instellen

1. Configureer de Google social connection in Auth0 en beperk indien nodig de toegestane domeinen tot je Google Workspace-domein.
2. Zet de connection aan voor de Auth0-app en gebruik `google-oauth2` of de exacte connectionnaam als `AUTH0_CONNECTION`.
3. Gebruik in `ADMIN_EMAILS` de volledige Google Workspace-adressen van beheerders, bijvoorbeeld `beheer@bedrijf.be,admin@bedrijf.be`.
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

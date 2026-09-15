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

### Architectuur die ik zou kiezen

**Frontend**

- React / Vue / Vanilla JS
- Hosting op Azure Static Web Apps, Vercel of Cloudflare Pages

**Authenticatie**

- Microsoft Entra ID
- MSAL.js library

**Backend**

- Azure Function / Node.js API
- JWT validatie via Entra ID

**Database**

- SharePoint List
- Dataverse
- Supabase
- PostgreSQL

## Microsoft Entra ID configureren

1. Kopieer .env.example naar .env
2. Vul de Azure / Microsoft Entra-waarden in:

- AZURE_TENANT_ID
- AZURE_CLIENT_ID
- AZURE_AUTHORITY
- AZURE_REDIRECT_URI
- AZURE_API_AUDIENCE
- AZURE_API_SCOPE
- ADMIN_EMAILS (komma-gescheiden Microsoft 365-e-mailadressen van admins)

3. Maak in Microsoft Entra ID een App Registration aan voor de frontend (SPA) met:

- Redirect URI: http://localhost:3000
- Allowed redirect URL in the frontend MSAL config

4. Maak indien nodig ook een API-app registratie aan voor de backend en exposeer een scope zoals:

- api://<api-app-id-uri>/access_as_user

5. Gebruik dezelfde audience/scope in de frontend MSAL scope-config en in de backend JWT-validatie.

6. Voor een echte productie-opzet is het nodig om de juiste app registrations, redirect URIs en API permissions te verbinden met het juiste Microsoft 365-tenant.

> De huidige app draait in demo-modus als er geen echte Entra-config staat. Voor live Azure/Microsoft authenticatie moeten deze tenant-waarden wel worden ingevuld.

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

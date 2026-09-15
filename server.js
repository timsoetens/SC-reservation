require("dotenv").config({ path: require("path").join(__dirname, ".env"), override: true });

const express = require("express");
const { auth: auth0Jwt } = require("express-oauth2-jwt-bearer");
const { createRemoteJWKSet, jwtVerify } = require("jose");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "data", "db.json");

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || "";
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || "";
const AUTH0_ISSUER_BASE_URL = process.env.AUTH0_ISSUER_BASE_URL || (AUTH0_DOMAIN ? `https://${AUTH0_DOMAIN}` : "");
const AUTH0_CONNECTION = process.env.AUTH0_CONNECTION || "google-oauth2";
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || "";
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || "";
const AZURE_AUTHORITY = process.env.AZURE_AUTHORITY || (AZURE_TENANT_ID ? `https://login.microsoftonline.com/${AZURE_TENANT_ID}` : "");
const AZURE_ISSUER = `${AZURE_AUTHORITY.replace(/\/$/, "")}/v2.0`;
const AZURE_LEGACY_ISSUER = `https://sts.windows.net/${AZURE_TENANT_ID}/`;
const AZURE_JWKS_URI = AZURE_TENANT_ID
  ? `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`
  : "";
const AZURE_REDIRECT_URI = process.env.AZURE_REDIRECT_URI || "http://localhost:3000";
const AZURE_API_AUDIENCE = process.env.AZURE_API_AUDIENCE || "";
const AZURE_API_SCOPE = process.env.AZURE_API_SCOPE || "";
const AZURE_ALLOWED_EMAIL_DOMAIN = (process.env.AZURE_ALLOWED_EMAIL_DOMAIN || "sanacon.be").trim().toLowerCase().replace(/^@/, "");
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);
const PROJECT_COLORS = ["#c23e3f", "#2f6f95", "#3f8060", "#b2762c", "#76539b", "#3d7880"];

const azureConfigured = Boolean(AZURE_TENANT_ID && AZURE_CLIENT_ID && AZURE_API_AUDIENCE);
const auth0Configured = Boolean(AUTH0_DOMAIN && AUTH0_CLIENT_ID && AUTH0_AUDIENCE && AUTH0_ISSUER_BASE_URL);
const authConfigured = azureConfigured || auth0Configured;

const verifyJwt = authConfigured
  ? auth0Jwt({
      ...(azureConfigured
        ? { issuer: AZURE_ISSUER, jwksUri: AZURE_JWKS_URI }
        : { issuerBaseURL: AUTH0_ISSUER_BASE_URL }),
      audience: azureConfigured ? AZURE_API_AUDIENCE : AUTH0_AUDIENCE,
      tokenSigningAlg: "RS256"
    })
  : null;
const azureJwks = azureConfigured ? createRemoteJWKSet(new URL(AZURE_JWKS_URI)) : null;

app.use(express.json({ limit: "4mb" }));
app.use(express.static(path.join(__dirname, "public"), {
  setHeaders(res) {
    res.setHeader("Cache-Control", "no-store");
  }
}));

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const db = JSON.parse(raw);
  const resipod = db.devices.find((device) => device.name === "Resipod");
  const hasResipodA = db.devices.some((device) => device.name === "Resipod-A");
  const hasResipodB = db.devices.some((device) => device.name === "Resipod-B");

  if (resipod && !hasResipodA) {
    resipod.name = "Resipod-A";
  }

  if (!hasResipodB) {
    const resipodA = db.devices.find((device) => device.name === "Resipod-A");
    if (resipodA) {
      db.devices.push({ ...resipodA, id: "d9", name: "Resipod-B" });
    }
  }

  if ((resipod && !hasResipodA) || !hasResipodB) {
    writeDb(db);
  }

  const scheduleChanged = ensureScreenshotSchedule(db);
  if (scheduleChanged) {
    writeDb(db);
  }

  return db;
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function ensureUsersCollection(db) {
  if (!Array.isArray(db.users)) {
    db.users = [];
  }
}

function ensureProjectsCollection(db) {
  if (!Array.isArray(db.projects)) {
    db.projects = [];
  }
}

function ensureScreenshotSchedule(db) {
  ensureUsersCollection(db);
  ensureProjectsCollection(db);
  if (!Array.isArray(db.reservations)) {
    db.reservations = [];
  }

  const memberId = "google-oauth2|109878178874705663606";
  const projects = [
    ["p-screenshot-sc26007", "SC26007 - Rodi"],
    ["p-screenshot-sc26078", "SC26078 - North"],
    ["p-screenshot-sc25141", "SC25141 (SX31) - Milcobel"],
    ["p-screenshot-sc26171", "SC26171"]
  ];
  let changed = false;

  for (const [id, name] of projects) {
    if (!db.projects.some((project) => project.id === id)) {
      db.projects.push({ id, name, color: getProjectColor({ name }), createdBy: memberId, createdAt: new Date().toISOString() });
      changed = true;
    }
  }

  const bookings = [
    ["d4", "2026-09-07", "2026-09-10", "Walteren Rok"],
    ["d4", "2026-09-15", "2026-09-16", "SC26078 - North", "p-screenshot-sc26078"],
    ["d6", "2026-09-16", "2026-09-17", "Janssens"],
    ["d7", "2026-09-04", "2026-09-05", "SC231..."],
    ["d7", "2026-09-17", "2026-09-18", "SC26007 - Rodi", "p-screenshot-sc26007"],
    ["d1", "2026-08-31", "2026-09-05", "GSP (GX90)"],
    ["d1", "2026-09-07", "2026-09-09", "Walteren Rok"],
    ["d1", "2026-09-09", "2026-09-10", "SC26007"],
    ["d1", "2026-09-10", "2026-09-11", "SC25141"],
    ["d1", "2026-09-14", "2026-09-15", "SC25141"],
    ["d1", "2026-09-16", "2026-09-17", "Janssens"],
    ["d1", "2026-09-17", "2026-09-22", "SC26007 - Rodi", "p-screenshot-sc26007"],
    ["d1", "2026-09-22", "2026-09-23", "GSP (GX90)"],
    ["d1", "2026-09-24", "2026-09-25", "Janssens"],
    ["d1", "2026-09-25", "2026-09-26", "SC26007"],
    ["d1", "2026-09-29", "2026-09-30", "Pijlstra"],
    ["d2", "2026-09-10", "2026-09-15", "SC25141 (SX31) | Milcobel", "p-screenshot-sc25141"],
    ["d2", "2026-09-25", "2026-09-26", "SC26007 - Rodi", "p-screenshot-sc26007"],
    ["d2", "2026-09-26", "2026-09-27", "SC26171", "p-screenshot-sc26171"],
    ["d3", "2026-09-07", "2026-09-08", "Walteren Rok"],
    ["d3", "2026-09-08", "2026-09-09", "SC26007"],
    ["d3", "2026-09-17", "2026-09-18", "SC26007 - Rodi", "p-screenshot-sc26007"],
    ["d3", "2026-09-22", "2026-09-23", "GSP (GX90)"],
    ["d3", "2026-09-25", "2026-09-26", "SC26007 - Rodi", "p-screenshot-sc26007"],
    ["d3", "2026-09-29", "2026-09-30", "Pijlstra"]
  ];

  for (const [deviceId, startDate, endDate, note, projectId = ""] of bookings) {
    const id = `screenshot-${deviceId}-${startDate}`;
    if (db.reservations.some((reservation) => reservation.id === id)) {
      continue;
    }
    db.reservations.push({
      id,
      deviceId,
      memberId,
      projectId,
      start: `${startDate}T08:00:00.000Z`,
      end: `${endDate}T16:00:00.000Z`,
      note,
      createdAt: new Date().toISOString()
    });
    changed = true;
  }

  return changed;
}

function normalizeDevice(device) {
  return {
    ...device,
    status: device.status || "available",
    photoUrl: device.photoUrl || ""
  };
}

function getProjectColor(project) {
  if (project.color) {
    return project.color;
  }
  const hash = [...project.name].reduce((total, character) => total + character.charCodeAt(0), 0);
  return PROJECT_COLORS[hash % PROJECT_COLORS.length];
}

function isValidProjectColor(color) {
  return typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color);
}

function overlaps(startA, endA, startB, endB) {
  return startA.isBefore(endB) && startB.isBefore(endA);
}

function validateReservationInput(payload) {
  const { deviceId, start, end, note } = payload;
  if (!deviceId || !start || !end) {
    return "deviceId, start en end zijn verplicht.";
  }

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) {
    return "start en end moeten geldige datums/tijdstippen zijn.";
  }

  if (!startDate.isBefore(endDate)) {
    return "start moet vroeger zijn dan end.";
  }

  if (note && note.length > 200) {
    return "note mag maximaal 200 karakters bevatten.";
  }

  return null;
}

function authConfigRequired(req, res, next) {
  if (!authConfigured) {
    return res.status(503).json({ error: "Microsoft Entra ID / Auth0 is nog niet geconfigureerd op de server." });
  }
  return next();
}

function getClaimEmail(claims) {
  return String(claims.email || claims.preferred_username || claims.upn || "").trim().toLowerCase();
}

function isAllowedAzureEmail(email) {
  return Boolean(email) && email.endsWith(`@${AZURE_ALLOWED_EMAIL_DOMAIN}`);
}

function upsertAuthenticatedUser(claims, profile = {}) {
  const db = readDb();
  ensureUsersCollection(db);

  const subject = claims.sub;
  const existingUser = db.users.find((item) => item.id === subject);
  const displayName = profile.name || profile.nickname || claims.name || claims.nickname || claims.email || existingUser?.name || "Onbekende gebruiker";
  const email = (profile.email || profile.preferred_username || claims.email || claims.preferred_username || existingUser?.email || "").toLowerCase();
  const picture = profile.picture || claims.picture || existingUser?.picture || "";
  const isAdmin = ADMIN_EMAILS.has(email);

  let user = db.users.find((item) => item.id === subject);
  if (!user) {
    user = {
      id: subject,
      name: displayName,
      email,
      picture,
      role: isAdmin ? "admin" : "user",
      isAdmin,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDb(db);
    return user;
  }

  let changed = false;
  if (user.name !== displayName) {
    user.name = displayName;
    changed = true;
  }
  if (email && user.email !== email) {
    user.email = email;
    changed = true;
  }
  if (picture && user.picture !== picture) {
    user.picture = picture;
    changed = true;
  }
  if (user.role !== (isAdmin ? "admin" : "user")) {
    user.role = isAdmin ? "admin" : "user";
    changed = true;
  }
  if (user.isAdmin !== isAdmin) {
    user.isAdmin = isAdmin;
    changed = true;
  }

  if (changed) {
    writeDb(db);
  }

  return user;
}

function getLocalDemoUser() {
  const db = readDb();
  ensureUsersCollection(db);

  let user = db.users.find((item) => item.id === "local-demo-admin");
  if (!user) {
    user = {
      id: "local-demo-admin",
      name: "Demo Admin",
      email: "admin@local.test",
      picture: "",
      role: "admin",
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDb(db);
  }

  if (!user.isAdmin || user.role !== "admin") {
    user.role = "admin";
    user.isAdmin = true;
    writeDb(db);
  }

  return user;
}

function requireAuth(req, res, next) {
  if (!authConfigured) {
    req.authUser = getLocalDemoUser();
    return next();
  }

  return authConfigRequired(req, res, async (configError) => {
    if (configError) {
      return;
    }

    if (azureConfigured) {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
      if (!token) {
        return res.status(401).json({ error: "Aanmelding vereist." });
      }

      try {
        const verified = await jwtVerify(token, azureJwks, {
          issuer: [AZURE_ISSUER, AZURE_LEGACY_ISSUER],
          audience: [AZURE_API_AUDIENCE, AZURE_CLIENT_ID]
        });
        req.auth = { payload: verified.payload };
      } catch (error) {
        console.error("Microsoft token validation failed:", error.code || error.name, error.message);
        return res.status(401).json({ error: "Ongeldige Microsoft-aanmelding." });
      }

      const claims = req.auth.payload;
      if (!claims?.sub) {
        return res.status(401).json({ error: "Token bevat geen geldige gebruiker." });
      }

      if (!isAllowedAzureEmail(getClaimEmail(claims))) {
        return res.status(403).json({ error: `Alleen @${AZURE_ALLOWED_EMAIL_DOMAIN}-accounts hebben toegang.` });
      }

      req.authUser = upsertAuthenticatedUser(claims);
      return next();
    }

    return verifyJwt(req, res, (jwtError) => {
      if (jwtError) {
        return;
      }

      const claims = req.auth?.payload;
      if (!claims?.sub) {
        return res.status(401).json({ error: "Token bevat geen geldige gebruiker." });
      }

      if (azureConfigured && !isAllowedAzureEmail(getClaimEmail(claims))) {
        return res.status(403).json({ error: `Alleen @${AZURE_ALLOWED_EMAIL_DOMAIN}-accounts hebben toegang.` });
      }

      req.authUser = upsertAuthenticatedUser(claims);
      return next();
    });
  });
}

function requireAdmin(req, res, next) {
  if (!req.authUser?.isAdmin) {
    return res.status(403).json({ error: "Alleen admins mogen gebruikers beheren." });
  }
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "API running" });
});

app.get("/api/auth/config", (_req, res) => {
  res.json({
    enabled: authConfigured,
    localMode: !authConfigured,
    provider: azureConfigured ? "azure" : auth0Configured ? "auth0" : "local-demo",
    domain: AUTH0_DOMAIN,
    clientId: azureConfigured ? AZURE_CLIENT_ID : AUTH0_CLIENT_ID,
    audience: azureConfigured ? AZURE_API_AUDIENCE : AUTH0_AUDIENCE,
    connection: AUTH0_CONNECTION,
    tenantId: AZURE_TENANT_ID,
    authority: AZURE_AUTHORITY,
    redirectUri: AZURE_REDIRECT_URI,
    apiAudience: AZURE_API_AUDIENCE,
    apiScope: AZURE_API_SCOPE,
    allowedEmailDomain: AZURE_ALLOWED_EMAIL_DOMAIN
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ currentUser: req.authUser });
});

app.post("/api/auth/profile", requireAuth, (req, res) => {
  if (!req.auth?.payload) {
    return res.json({ currentUser: req.authUser });
  }
  res.json({ currentUser: upsertAuthenticatedUser(req.auth.payload, req.body || {}) });
});

app.get("/api/meta", requireAuth, (req, res) => {
  const db = readDb();
  ensureUsersCollection(db);

  res.json({
    devices: db.devices.map(normalizeDevice),
    users: db.users,
    currentUser: req.authUser
  });
});

app.post("/api/users/invitations", requireAuth, requireAdmin, (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Geef een geldig e-mailadres op." });
  }
  if (!isAllowedAzureEmail(email)) {
    return res.status(400).json({ error: `Gebruik een @${AZURE_ALLOWED_EMAIL_DOMAIN}-adres.` });
  }
  const db = readDb();
  if (!Array.isArray(db.invitations)) {
    db.invitations = [];
  }
  if (!db.invitations.some((invite) => invite.email === email)) {
    db.invitations.push({ email, role: "user", invitedBy: req.authUser.id, createdAt: new Date().toISOString() });
    writeDb(db);
  }
  return res.status(201).json({ email, role: "user" });
});

app.put("/api/users/:id/role", requireAuth, requireAdmin, (req, res) => {
  const role = req.body?.role === "admin" ? "admin" : "user";
  const db = readDb();
  ensureUsersCollection(db);
  const user = db.users.find((item) => item.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "Gebruiker niet gevonden." });
  }
  user.role = role;
  user.isAdmin = role === "admin";
  writeDb(db);
  return res.json(user);
});

app.put("/api/devices/:id", requireAuth, (req, res) => {
  const allowedStatuses = ["available", "out_of_use", "defect"];
  const status = String(req.body?.status || "available");
  const photoUrl = String(req.body?.photoUrl || "").trim();
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Ongeldige resource status." });
  }
  if (photoUrl && !/^https?:\/\//i.test(photoUrl) && !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(photoUrl)) {
    return res.status(400).json({ error: "Gebruik een afbeeldingsbestand of geldige foto-URL." });
  }
  if (photoUrl.length > 3_000_000) {
    return res.status(400).json({ error: "De foto mag maximaal 2 MB groot zijn." });
  }

  const db = readDb();
  const device = db.devices.find((item) => item.id === req.params.id);
  if (!device) {
    return res.status(404).json({ error: "Resource niet gevonden." });
  }
  device.status = status;
  device.photoUrl = photoUrl;
  writeDb(db);
  return res.json(normalizeDevice(device));
});

app.delete("/api/devices/:id", requireAuth, (req, res) => {
  const db = readDb();
  const deviceIndex = db.devices.findIndex((item) => item.id === req.params.id);
  if (deviceIndex === -1) {
    return res.status(404).json({ error: "Resource niet gevonden." });
  }
  if (db.reservations.some((reservation) => reservation.deviceId === req.params.id)) {
    return res.status(409).json({ error: "Deze resource heeft reservaties en kan niet verwijderd worden." });
  }
  db.devices.splice(deviceIndex, 1);
  writeDb(db);
  return res.status(204).end();
});

app.get("/api/projects", requireAuth, (_req, res) => {
  const db = readDb();
  ensureProjectsCollection(db);
  res.json(db.projects
    .filter((project) => project.name.toUpperCase().startsWith("SC"))
    .map((project) => ({ ...project, color: getProjectColor(project) })));
});

app.post("/api/projects", requireAuth, (req, res) => {
  const name = String(req.body?.name || "").trim();
  const projectName = String(req.body?.projectName || "").trim();
  const color = req.body?.color || "#c23e3f";
  if (!/^SC/i.test(name)) {
    return res.status(400).json({ error: "Een projectnaam moet met SC beginnen." });
  }
  if (!isValidProjectColor(color)) {
    return res.status(400).json({ error: "Kies een geldige projectkleur." });
  }
  if (!projectName) {
    return res.status(400).json({ error: "Geef ook een projectnaam op." });
  }

  const db = readDb();
  ensureProjectsCollection(db);
  const duplicate = db.projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    return res.status(409).json({ error: "Dit project bestaat al." });
  }
  if (db.projects.some((project) => getProjectColor(project).toLowerCase() === color.toLowerCase())) {
    return res.status(409).json({ error: "Deze kleur is al in gebruik door een ander project." });
  }

  const project = {
    id: `p${Date.now()}`,
    name,
    projectName,
    color,
    createdBy: req.authUser.id,
    createdAt: new Date().toISOString()
  };
  db.projects.push(project);
  writeDb(db);
  return res.status(201).json(project);
});

app.put("/api/projects/:id", requireAuth, (req, res) => {
  const color = req.body?.color;
  if (!isValidProjectColor(color)) {
    return res.status(400).json({ error: "Kies een geldige projectkleur." });
  }

  const db = readDb();
  ensureProjectsCollection(db);
  const project = db.projects.find((item) => item.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project niet gevonden." });
  }
  if (db.projects.some((item) => item.id !== project.id && getProjectColor(item).toLowerCase() === color.toLowerCase())) {
    return res.status(409).json({ error: "Deze kleur is al in gebruik door een ander project." });
  }

  project.color = color;
  writeDb(db);
  return res.json(project);
});

function requireOwnerOrAdmin(req, res, next) {
  const db = readDb();
  const reservation = db.reservations.find((item) => item.id === req.params.id);

  if (!reservation) {
    return res.status(404).json({ error: "Reservatie niet gevonden." });
  }

  if (!req.authUser.isAdmin && reservation.memberId !== req.authUser.id) {
    return res.status(403).json({ error: "Je kan enkel je eigen reservaties aanpassen." });
  }

  req.reservation = reservation;
  return next();
}

app.get("/api/reservations", requireAuth, (_req, res) => {
  const db = readDb();
  ensureUsersCollection(db);
  ensureProjectsCollection(db);

  const reservations = db.reservations
    .slice()
    .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    .map((reservation) => ({
      ...reservation,
      deviceName: db.devices.find((d) => d.id === reservation.deviceId)?.name || reservation.deviceId,
      memberName:
        db.users.find((u) => u.id === reservation.memberId)?.name ||
        db.teamMembers?.find((m) => m.id === reservation.memberId)?.name ||
        reservation.memberId,
      projectName: db.projects.find((project) => project.id === reservation.projectId)?.name || "",
      projectTitle: db.projects.find((project) => project.id === reservation.projectId)?.projectName || "",
      projectColor: (() => {
        const project = db.projects.find((item) => item.id === reservation.projectId);
        return project ? getProjectColor(project) : "";
      })()
    }));

  res.json(reservations);
});

app.post("/api/reservations", requireAuth, (req, res) => {
  const error = validateReservationInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const db = readDb();
  ensureUsersCollection(db);

  const { deviceId, start, end, note, projectId } = req.body;
  const memberId = req.authUser.id;

  const device = db.devices.find((item) => item.id === deviceId);
  if (!device) {
    return res.status(404).json({ error: "Device niet gevonden." });
  }
  if ((device.status || "available") !== "available") {
    return res.status(409).json({ error: "Deze resource is tijdelijk niet boekbaar." });
  }

  const dbProjectStore = readDb();
  ensureProjectsCollection(dbProjectStore);
  if (projectId && !dbProjectStore.projects.some((project) => project.id === projectId && project.name.toUpperCase().startsWith("SC"))) {
    return res.status(404).json({ error: "Project niet gevonden." });
  }

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  const deviceConflict = db.reservations.find((reservation) =>
    reservation.deviceId === deviceId &&
    overlaps(startDate, endDate, dayjs(reservation.start), dayjs(reservation.end))
  );

  if (deviceConflict) {
    return res.status(409).json({
      error: `${device.name} is al gereserveerd van ${dayjs(deviceConflict.start).format("DD/MM/YYYY HH:mm")} tot ${dayjs(deviceConflict.end).format("DD/MM/YYYY HH:mm")}.`
    });
  }

  const newReservation = {
    id: `r${Date.now()}`,
    deviceId,
    memberId,
    projectId: projectId || "",
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    note: note?.trim() || "",
    createdAt: new Date().toISOString()
  };

  db.reservations.push(newReservation);
  writeDb(db);

  return res.status(201).json(newReservation);
});

app.put("/api/reservations/:id", requireAuth, requireOwnerOrAdmin, (req, res) => {
  const reservationId = req.params.id;
  const error = validateReservationInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const db = readDb();
  ensureUsersCollection(db);

  const currentReservation = db.reservations.find((reservation) => reservation.id === reservationId);
  if (!currentReservation) {
    return res.status(404).json({ error: "Reservatie niet gevonden." });
  }

  const { deviceId, start, end, note, projectId } = req.body;
  const memberId = req.authUser.isAdmin ? currentReservation.memberId : req.authUser.id;

  const device = db.devices.find((item) => item.id === deviceId);
  if (!device) {
    return res.status(404).json({ error: "Device niet gevonden." });
  }
  if ((device.status || "available") !== "available") {
    return res.status(409).json({ error: "Deze resource is tijdelijk niet boekbaar." });
  }

  const projectStore = readDb();
  ensureProjectsCollection(projectStore);
  if (projectId && !projectStore.projects.some((project) => project.id === projectId && project.name.toUpperCase().startsWith("SC"))) {
    return res.status(404).json({ error: "Project niet gevonden." });
  }

  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const scheduleUnchanged = currentReservation.deviceId === deviceId &&
    dayjs(currentReservation.start).toISOString() === startDate.toISOString() &&
    dayjs(currentReservation.end).toISOString() === endDate.toISOString();

  const deviceConflict = scheduleUnchanged
    ? null
    : db.reservations.find((reservation) =>
        reservation.id !== reservationId &&
        reservation.deviceId === deviceId &&
        overlaps(startDate, endDate, dayjs(reservation.start), dayjs(reservation.end))
      );

  if (deviceConflict) {
    return res.status(409).json({
      error: `${device.name} is al gereserveerd van ${dayjs(deviceConflict.start).format("DD/MM/YYYY HH:mm")} tot ${dayjs(deviceConflict.end).format("DD/MM/YYYY HH:mm")}.`
    });
  }

  currentReservation.deviceId = deviceId;
  currentReservation.memberId = memberId;
  currentReservation.start = startDate.toISOString();
  currentReservation.end = endDate.toISOString();
  currentReservation.note = note?.trim() || "";
  currentReservation.projectId = projectId || "";

  writeDb(db);

  return res.json(currentReservation);
});

app.delete("/api/reservations/:id", requireAuth, requireOwnerOrAdmin, (req, res) => {
  const db = readDb();
  const index = db.reservations.findIndex((reservation) => reservation.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Reservatie niet gevonden." });
  }

  db.reservations.splice(index, 1);
  writeDb(db);

  return res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Resource reservation app running on http://localhost:${PORT}`);
});

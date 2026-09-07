require("dotenv").config();

const express = require("express");
const { auth: auth0Jwt } = require("express-oauth2-jwt-bearer");
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
const AUTH0_CONNECTION = process.env.AUTH0_CONNECTION || "";
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const authConfigured = Boolean(AUTH0_DOMAIN && AUTH0_CLIENT_ID && AUTH0_AUDIENCE && AUTH0_ISSUER_BASE_URL);

const verifyJwt = authConfigured
  ? auth0Jwt({
      issuerBaseURL: AUTH0_ISSUER_BASE_URL,
      audience: AUTH0_AUDIENCE,
      tokenSigningAlg: "RS256"
    })
  : null;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function ensureUsersCollection(db) {
  if (!Array.isArray(db.users)) {
    db.users = [];
  }
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
    return res.status(503).json({ error: "Auth0 is nog niet geconfigureerd op de server." });
  }
  return next();
}

function upsertAuthenticatedUser(claims) {
  const db = readDb();
  ensureUsersCollection(db);

  const subject = claims.sub;
  const displayName = claims.name || claims.nickname || claims.email || "Onbekende gebruiker";
  const email = (claims.email || claims.preferred_username || "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.has(email);

  let user = db.users.find((item) => item.id === subject);
  if (!user) {
    user = {
      id: subject,
      name: displayName,
      email,
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

function requireAuth(req, res, next) {
  return authConfigRequired(req, res, (configError) => {
    if (configError) {
      return;
    }

    return verifyJwt(req, res, (jwtError) => {
      if (jwtError) {
        return;
      }

      const claims = req.auth?.payload;
      if (!claims?.sub) {
        return res.status(401).json({ error: "Token bevat geen geldige gebruiker." });
      }

      req.authUser = upsertAuthenticatedUser(claims);
      return next();
    });
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "API running" });
});

app.get("/api/auth/config", (_req, res) => {
  res.json({
    enabled: authConfigured,
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    audience: AUTH0_AUDIENCE,
    connection: AUTH0_CONNECTION
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ currentUser: req.authUser });
});

app.get("/api/meta", requireAuth, (req, res) => {
  const db = readDb();
  ensureUsersCollection(db);

  res.json({
    devices: db.devices,
    users: db.users,
    currentUser: req.authUser
  });
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

  const reservations = db.reservations
    .slice()
    .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    .map((reservation) => ({
      ...reservation,
      deviceName: db.devices.find((d) => d.id === reservation.deviceId)?.name || reservation.deviceId,
      memberName:
        db.users.find((u) => u.id === reservation.memberId)?.name ||
        db.teamMembers?.find((m) => m.id === reservation.memberId)?.name ||
        reservation.memberId
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

  const { deviceId, start, end, note } = req.body;
  const memberId = req.authUser.id;

  const deviceExists = db.devices.some((d) => d.id === deviceId);
  if (!deviceExists) {
    return res.status(404).json({ error: "Device niet gevonden." });
  }

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  const deviceConflict = db.reservations.find((reservation) =>
    reservation.deviceId === deviceId &&
    overlaps(startDate, endDate, dayjs(reservation.start), dayjs(reservation.end))
  );

  if (deviceConflict) {
    return res.status(409).json({ error: "Dit device is al gereserveerd in deze periode." });
  }

  const memberConflict = db.reservations.find((reservation) =>
    reservation.memberId === memberId &&
    overlaps(startDate, endDate, dayjs(reservation.start), dayjs(reservation.end))
  );

  if (memberConflict) {
    return res.status(409).json({ error: "Je hebt al een reservatie in deze periode." });
  }

  const newReservation = {
    id: `r${Date.now()}`,
    deviceId,
    memberId,
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

  const { deviceId, start, end, note } = req.body;
  const memberId = req.authUser.isAdmin ? currentReservation.memberId : req.authUser.id;

  const deviceExists = db.devices.some((d) => d.id === deviceId);
  if (!deviceExists) {
    return res.status(404).json({ error: "Device niet gevonden." });
  }

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  const deviceConflict = db.reservations.find((reservation) =>
    reservation.id !== reservationId &&
    reservation.deviceId === deviceId &&
    overlaps(startDate, endDate, dayjs(reservation.start), dayjs(reservation.end))
  );

  if (deviceConflict) {
    return res.status(409).json({ error: "Dit device is al gereserveerd in deze periode." });
  }

  const memberConflict = db.reservations.find((reservation) =>
    reservation.id !== reservationId &&
    reservation.memberId === memberId &&
    overlaps(startDate, endDate, dayjs(reservation.start), dayjs(reservation.end))
  );

  if (memberConflict) {
    return res.status(409).json({ error: "Je hebt al een reservatie in deze periode." });
  }

  currentReservation.deviceId = deviceId;
  currentReservation.memberId = memberId;
  currentReservation.start = startDate.toISOString();
  currentReservation.end = endDate.toISOString();
  currentReservation.note = note?.trim() || "";

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

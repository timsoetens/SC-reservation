const fs = require("fs");
const path = require("path").join(__dirname, "..", "data", "db.json");
const db = JSON.parse(fs.readFileSync(path, "utf8"));

const oldId = "google-oauth2|109878178874705663606";
const newId = "PnnJ84kLzIGsgPu7Fz5N27D0gIrt-4K7HD4NkGG3idw";

const oldUser = db.users.find((u) => u.id === oldId);
const newUser = db.users.find((u) => u.id === newId);

if (!oldUser || !newUser) {
  console.log("Missing user(s)", { oldUser: !!oldUser, newUser: !!newUser });
  process.exit(1);
}

newUser.picture = oldUser.picture || newUser.picture;
if (new Date(oldUser.createdAt) < new Date(newUser.createdAt)) {
  newUser.createdAt = oldUser.createdAt;
}

let reservationsMigrated = 0;
db.reservations.forEach((r) => {
  if (r.memberId === oldId) {
    r.memberId = newId;
    reservationsMigrated += 1;
  }
});

let projectsMigrated = 0;
db.projects.forEach((p) => {
  if (p.createdBy === oldId) {
    p.createdBy = newId;
    projectsMigrated += 1;
  }
});

db.users = db.users.filter((u) => u.id !== oldId);

fs.writeFileSync(path, JSON.stringify(db, null, 2), "utf8");
console.log(`Migrated ${reservationsMigrated} reservations and ${projectsMigrated} projects. Removed duplicate user ${oldId}.`);

const WEEK_DAY_COUNT = 28;
const NAVIGATION_STEP_DAYS = 7;
const DAY_NAMES = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const PROJECT_COLOR_PRESETS = [
  "#f3b6b6", "#f6c4a3", "#f5d79b", "#e8e49f", "#c9df9c", "#a9d8ad",
  "#9ed9c7", "#a9dede", "#add5ee", "#b7c9ed", "#c5bceb", "#d4b9e5",
  "#e5b9d4", "#efb8c1", "#f7cbd0", "#f8d6be", "#f7e0b4", "#e4e5b1",
  "#d2e8b7", "#bfe4c0", "#b7e3d9", "#bce6e6", "#c4e1f1", "#cbd8f0",
  "#d5ccef", "#e2cbed", "#edc9e0", "#e9b5b5", "#f2c7ad", "#ecd49f",
  "#d8d49f", "#b9d2a5", "#a8cdb7", "#a9cdd0", "#b5cee2", "#c1c5df"
];

function compareProjectLabels(first, second) {
  return first.localeCompare(second, "nl", { numeric: true, sensitivity: "base" });
}

function formatProjectOptionLabel(label) {
  const maxLength = 48;
  return label.length > maxLength ? `${label.slice(0, maxLength - 1).trimEnd()}...` : label;
}

function getProjectTypeLabel(project) {
  if (project.projectType === "offerte") {
    return "Offerte";
  }
  return project.projectType === "opdracht" ? "Opdracht" : "Container";
}

function getProjectDisplayLabel(project) {
  const label = project.projectName ? `${project.name} - ${project.projectName}` : project.name;
  const number = project.projectType === "offerte"
    ? (project.offerteNummer ? ` #${project.offerteNummer}` : "")
    : project.projectType === "opdracht"
    ? (project.opdrachtNummer ? ` #${project.opdrachtNummer}` : "")
    : (project.containerNummer ? ` #${project.containerNummer}` : "");
  return `${label}${number} [${getProjectTypeLabel(project)}]`;
}

function getReservationProjectLabel(project) {
  if (project.projectType === "project-container") {
      const number = project.containerNummer ? `(SC${project.containerNummer}) ` : "";
    return `${number}${project.name}`;
  }
  return getProjectDisplayLabel(project);
}

function getReservationProjects(selectedProjectId = "") {
  const projects = state.projects.filter((project) => isExternalCustomer(project) && ["opdracht", "offerte"].includes(project.projectType) && project.name?.trim());
  const selectedProject = state.projects.find((project) => project.id === selectedProjectId);
  if (selectedProject && !projects.some((project) => project.id === selectedProject.id)) {
    projects.push(selectedProject);
  }
  return projects;
}

function isExternalCustomer(project) {
  return String(project.customerName || "").trim().toLowerCase() !== "sanacon";
}

const elements = {
  topbar: document.querySelector(".topbar"),
  authPanel: document.getElementById("auth-panel"),
  sessionPanel: document.getElementById("session-panel"),
  formPanel: document.getElementById("form-panel"),
  dashboardPanel: document.getElementById("dashboard-panel"),
  dashboardSummary: document.getElementById("dashboard-summary"),
  dashboardReservations: document.getElementById("dashboard-reservations"),
  plannerPanel: document.getElementById("planner-panel"),
  projectDialog: document.getElementById("project-dialog"),
  projectForm: document.getElementById("project-form"),
  projectPeriod: document.getElementById("project-period"),
  newProjectSearchInput: document.getElementById("project-search"),
  projectOptions: document.getElementById("project-options"),
  projectSelect: document.getElementById("project-select"),
  newProjectName: document.getElementById("new-project-name"),
  newProjectTitle: document.getElementById("new-project-title"),
  newProjectFields: document.getElementById("new-project-fields"),
  createProjectButton: document.getElementById("create-project-btn"),
  projectCancelButton: document.getElementById("project-cancel-btn"),
  projectSubmitButton: document.getElementById("project-submit-btn"),
  projectMessage: document.getElementById("project-message"),
  editDialog: document.getElementById("edit-dialog"),
  editForm: document.getElementById("edit-form"),
  editDeviceSelect: document.getElementById("edit-device-select"),
  editMemberField: document.getElementById("edit-member-field"),
  editMemberSelect: document.getElementById("edit-member-select"),
  editStart: document.getElementById("edit-start"),
  editEnd: document.getElementById("edit-end"),
  editProjectSearch: document.getElementById("edit-project-search"),
  editProjectOptions: document.getElementById("edit-project-options"),
  editProjectSelect: document.getElementById("edit-project-select"),
  editNote: document.getElementById("edit-note"),
  editMessage: document.getElementById("edit-message"),
  editCancelButton: document.getElementById("edit-cancel-btn"),
  editDeleteButton: document.getElementById("edit-delete-btn"),
  editSaveButton: document.getElementById("edit-save-btn"),
  timesheetSummary: document.getElementById("timesheet-summary"),
  timesheetList: document.getElementById("timesheet-list"),
  peopleList: document.getElementById("people-list"),
  resourceList: document.getElementById("resource-list"),
  adminUserTools: document.getElementById("admin-user-tools"),
  inviteUserForm: document.getElementById("invite-user-form"),
  inviteUserEmail: document.getElementById("invite-user-email"),
  inviteUserMessage: document.getElementById("invite-user-message"),
  syncPhotosButton: document.getElementById("sync-photos-btn"),
  syncPhotosMessage: document.getElementById("sync-photos-message"),
  resourceDialog: document.getElementById("resource-dialog"),
  resourceForm: document.getElementById("resource-form"),
  resourceDialogName: document.getElementById("resource-dialog-name"),
  resourcePhotoFile: document.getElementById("resource-photo-file"),
  resourceStatusSelect: document.getElementById("resource-status-select"),
  resourceMessage: document.getElementById("resource-message"),
  resourceCancelButton: document.getElementById("resource-cancel-btn"),
  resourceRemoveButton: document.getElementById("resource-remove-btn"),
  resourceSaveButton: document.getElementById("resource-save-btn"),
  userDialog: document.getElementById("user-dialog"),
  userForm: document.getElementById("user-form"),
  userNameInput: document.getElementById("user-name-input"),
  userEmailInput: document.getElementById("user-email-input"),
  userMessage: document.getElementById("user-message"),
  userCancelButton: document.getElementById("user-cancel-btn"),
  userRemoveButton: document.getElementById("user-remove-btn"),
  userSaveButton: document.getElementById("user-save-btn"),
  syncGrippButton: document.getElementById("sync-gripp-btn"),
  syncGrippMessage: document.getElementById("sync-gripp-message"),
  latestApiProject: document.getElementById("latest-api-project"),
  projectList: document.getElementById("project-list"),
  projectSearchInput: document.getElementById("project-search-input"),
  reportSummary: document.getElementById("report-summary"),
  reportYear: document.getElementById("report-year"),
  reservationChart: document.getElementById("reservation-chart"),
  hoursChart: document.getElementById("hours-chart"),
  reportList: document.getElementById("report-list"),
  loginButton: document.getElementById("login-btn"),
  loginMessage: document.getElementById("login-message"),
  reportsNav: document.getElementById("reports-nav"),
  currentUserLabel: document.getElementById("current-user-label"),
  currentUserRole: document.getElementById("current-user-role"),
  logoutButton: document.getElementById("logout-btn"),
  deviceSelect: document.getElementById("deviceId"),
  dateRangeInput: document.getElementById("date-range"),
  noteInput: document.getElementById("note"),
  form: document.getElementById("reservation-form"),
  message: document.getElementById("schedule-message"),
  prevWeekButton: document.getElementById("prev-week-btn"),
  todayWeekButton: document.getElementById("today-week-btn"),
  myReservationsButton: document.getElementById("my-reservations-btn"),
  nextWeekButton: document.getElementById("next-week-btn"),
  weekLabel: document.getElementById("week-label"),
  weekAxis: document.getElementById("week-axis"),
  weekShell: document.querySelector(".week-shell"),
  deviceRows: document.getElementById("device-rows"),
  deviceRowTemplate: document.getElementById("device-row-template")
};

const state = {
  users: [],
  devices: [],
  reservations: [],
  projects: [],
  currentUser: null,
  weekStart: null,
  dragReservationId: null,
  plannerSelection: null,
  isSelectingPlannerRange: false,
  pendingPlannerReservation: null,
  editingReservation: null,
  editingDevice: null,
  editingUser: null,
  resizingReservation: null,
  plannerScrollAdjusting: false,
  plannerLastScrollLeft: 0,
  plannerScrollCooldownUntil: 0,
  plannerScrollEdgeLock: "",
  scheduleRefreshTimer: null,
  scheduleRefreshInFlight: false,
  dateRangePicker: null,
  selectedRange: null,
  auth0Config: null,
  auth0Client: null,
  auth0User: null,
  msalConfig: null,
  msalClient: null,
  accessToken: "",
  currentPage: "schedule",
  myReservationsOnly: false
};

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("nl-BE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getReadableReservationColor(color) {
  const match = /^#?([0-9a-f]{6})$/i.exec(color || "");
  if (!match) {
    return "#f7d7d7";
  }
  const channels = [0, 2, 4].map((offset) => parseInt(match[1].slice(offset, offset + 2), 16));
  return `#${channels.map((channel) => Math.round(channel + (255 - channel) * 0.72).toString(16).padStart(2, "0")).join("")}`;
}

function showMessage(text, type) {
  if (!elements.message) {
    return;
  }
  elements.message.textContent = text;
  elements.message.className = `form-message ${type}`;
}

function showLoginMessage(text, type) {
  elements.loginMessage.textContent = text;
  elements.loginMessage.className = `form-message ${type}`;
}

function setAuthenticatedView(isAuthenticated) {
  document.querySelector(".app-shell")?.classList.toggle("is-authenticated", isAuthenticated);
  elements.authPanel.hidden = isAuthenticated;
  elements.sessionPanel.hidden = !isAuthenticated;
  if (elements.formPanel) {
    elements.formPanel.hidden = !isAuthenticated;
  }
  elements.plannerPanel.hidden = !isAuthenticated;
  elements.reportsNav.hidden = !isAuthenticated || !state.currentUser?.isAdmin;
  setPage(state.currentPage, isAuthenticated);
}

function setPage(page, isAuthenticated = Boolean(state.currentUser)) {
  const validPages = ["schedule", "people", "resources", "projects", "reports", "help"];
  state.currentPage = validPages.includes(page) ? page : "schedule";
  if (state.currentPage === "reports" && !state.currentUser?.isAdmin) {
    state.currentPage = "schedule";
  }

  document.querySelectorAll("[data-view]").forEach((panel) => {
    const views = panel.dataset.view.split(",");
    panel.hidden = !isAuthenticated || !views.includes(state.currentPage);
  });

  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === state.currentPage);
  });

  if (elements.topbar) {
    elements.topbar.hidden = !isAuthenticated || state.currentPage !== "schedule";
  }

  renderPageData();
  if (state.currentPage === "schedule" && isAuthenticated) {
    void refreshScheduleData();
  }
}

async function refreshScheduleData() {
  if (state.scheduleRefreshInFlight || !state.currentUser || state.currentPage !== "schedule") {
    return;
  }
  state.scheduleRefreshInFlight = true;
  try {
    await loadMeta();
    await loadProjects();
    await loadReservations();
  } catch (error) {
    showMessage(`Planning kon niet automatisch vernieuwd worden: ${error.message}`, "error");
  } finally {
    state.scheduleRefreshInFlight = false;
  }
}

function createDataRow(title, detail, value = "") {
  const row = document.createElement("div");
  row.className = "data-row";
  const content = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  const description = document.createElement("span");
  description.textContent = detail;
  content.append(heading, description);
  row.appendChild(content);
  if (value) {
    const valueNode = document.createElement("b");
    valueNode.textContent = value;
    row.appendChild(valueNode);
  }
  return row;
}

function renderTimesheetsPage() {
  const userReservations = state.reservations.filter((reservation) => reservation.memberId === state.currentUser?.id);
  const totalHours = userReservations.reduce((total, reservation) => {
    const duration = new Date(reservation.end) - new Date(reservation.start);
    return total + duration / 3600000;
  }, 0);
  elements.timesheetSummary.innerHTML = "";
  [{ label: "Reservaties", value: userReservations.length }, { label: "Geplande uren", value: `${totalHours.toFixed(1)} u` }, { label: "Gebruiker", value: state.currentUser?.name || "-" }].forEach((metric) => {
    const item = document.createElement("div");
    item.className = "metric-card";
    item.innerHTML = `<strong></strong><span></span>`;
    item.querySelector("strong").textContent = metric.value;
    item.querySelector("span").textContent = metric.label;
    elements.timesheetSummary.appendChild(item);
  });
  elements.timesheetList.innerHTML = "";
  userReservations.sort((first, second) => new Date(first.start) - new Date(second.start)).forEach((reservation) => {
    const hours = (new Date(reservation.end) - new Date(reservation.start)) / 3600000;
    elements.timesheetList.appendChild(createDataRow(reservation.deviceName, formatDateTime(reservation.start), `${hours.toFixed(1)} u`));
  });
}

function renderPeoplePage() {
  elements.adminUserTools.hidden = !state.currentUser?.isAdmin;
  elements.syncPhotosButton.hidden = !state.currentUser?.isAdmin || !state.auth0Config?.photoSyncConfigured;
  elements.peopleList.innerHTML = "";
  state.users.forEach((user) => {
    const tile = document.createElement("article");
    tile.className = "people-tile";
    const avatar = document.createElement("div");
    avatar.className = "people-tile-avatar";
    if (user.picture) {
      avatar.style.backgroundImage = `url("${user.picture}")`;
    } else {
      avatar.textContent = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    }
    const details = document.createElement("div");
    details.className = "people-tile-details";
    const name = document.createElement("strong");
    name.textContent = user.name;
    const email = document.createElement("span");
    email.textContent = user.email || "Google Workspace-gebruiker";
    const role = document.createElement("b");
    role.textContent = user.isAdmin ? "Admin" : "Gebruiker";
    if (state.currentUser?.isAdmin) {
      const roleSelect = document.createElement("select");
      roleSelect.innerHTML = "<option value=\"user\">Gebruiker</option><option value=\"admin\">Admin</option>";
      roleSelect.value = user.isAdmin ? "admin" : "user";
      roleSelect.addEventListener("change", async () => {
        try {
          const updated = await request(`/api/users/${user.id}/role`, { method: "PUT", body: JSON.stringify({ role: roleSelect.value }) });
          Object.assign(user, updated);
          renderPeoplePage();
        } catch (error) {
          alert(error.message);
        }
      });
      details.appendChild(roleSelect);

      const actions = document.createElement("div");
      actions.className = "resource-actions";
      const editButton = document.createElement("button");
      editButton.className = "ghost";
      editButton.type = "button";
      editButton.dataset.icon = "✎";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => openUserDialog(user));
      const removeButton = document.createElement("button");
      removeButton.className = "ghost";
      removeButton.type = "button";
      removeButton.dataset.icon = "⌫";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => removeUser(user));
      actions.append(editButton, removeButton);
      details.appendChild(actions);
    }
    details.append(name, email, role);
    tile.append(avatar, details);
    elements.peopleList.appendChild(tile);
  });
  elements.resourceList.innerHTML = "";
  [...state.devices]
    .sort((first, second) => first.name.localeCompare(second.name, "nl", { numeric: true, sensitivity: "base" }))
    .forEach((device) => {
    const usage = state.reservations.filter((reservation) => reservation.deviceId === device.id).length;
    const card = document.createElement("article");
    card.className = `resource-card resource-status-${device.status || "available"}`;
    const photo = document.createElement("div");
    photo.className = "resource-photo";
    if (device.photoUrl) {
      const image = document.createElement("img");
      image.src = device.photoUrl;
      image.alt = device.name;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        photo.textContent = "Geen foto";
      });
      photo.appendChild(image);
    } else {
      photo.textContent = device.type?.slice(0, 2).toUpperCase() || "R";
    }
    const content = document.createElement("div");
    content.className = "resource-content";
    content.innerHTML = "<strong></strong><span></span><b class=\"resource-status-label\"></b><div class=\"resource-actions\"><button class=\"ghost resource-edit\" type=\"button\">Edit</button><button class=\"ghost resource-remove\" type=\"button\">Remove</button></div>";
    content.querySelector("strong").textContent = device.name;
    content.querySelector("span").textContent = `${device.type || "Resource"} | ${usage} reservaties`;
    const statusLabel = document.createElement("b");
    statusLabel.className = "resource-status-label";
    statusLabel.textContent = device.status === "defect" ? "Defect - niet boekbaar" : device.status === "out_of_use" ? "Out of use - niet boekbaar" : "Beschikbaar";
    content.querySelector(".resource-status-label").replaceWith(statusLabel);
    content.querySelector(".resource-edit").addEventListener("click", () => openResourceDialog(device));
    content.querySelector(".resource-remove").addEventListener("click", () => removeResource(device));
    card.append(photo, content);
    elements.resourceList.appendChild(card);
    });
}

function openResourceDialog(device) {
  state.editingDevice = device;
  elements.resourceDialogName.textContent = `${device.name} | ${device.type || "Resource"}`;
  elements.resourceStatusSelect.value = device.status || "available";
  elements.resourcePhotoFile.value = "";
  elements.resourceMessage.textContent = "";
  elements.resourceMessage.className = "form-message";
  if (typeof elements.resourceDialog.showModal === "function") {
    elements.resourceDialog.showModal();
  } else {
    elements.resourceDialog.setAttribute("open", "open");
  }
}

function closeResourceDialog() {
  state.editingDevice = null;
  if (typeof elements.resourceDialog.close === "function") {
    elements.resourceDialog.close();
  } else {
    elements.resourceDialog.removeAttribute("open");
  }
}

function readUploadedImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("De originele foto mag maximaal 10 MB groot zijn."));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        const maxDimension = 1200;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });
      image.addEventListener("error", () => reject(new Error("De foto kon niet verwerkt worden.")));
      image.src = reader.result;
    });
    reader.addEventListener("error", () => reject(new Error("De foto kon niet gelezen worden.")));
    reader.readAsDataURL(file);
  });
}

async function saveResource() {
  if (!state.editingDevice) {
    return;
  }
  elements.resourceSaveButton.disabled = true;
  elements.resourceMessage.textContent = "";
  try {
    const uploadedPhoto = await readUploadedImage(elements.resourcePhotoFile.files[0]);
    const updated = await request(`/api/devices/${state.editingDevice.id}`, {
      method: "PUT",
      body: JSON.stringify({
        photoUrl: uploadedPhoto || state.editingDevice.photoUrl || "",
        status: elements.resourceStatusSelect.value
      })
    });
    Object.assign(state.editingDevice, updated);
    closeResourceDialog();
    renderPeoplePage();
    renderPlanner();
  } catch (error) {
    elements.resourceMessage.textContent = error.message;
    elements.resourceMessage.className = "form-message error";
  } finally {
    elements.resourceSaveButton.disabled = false;
  }
}

async function removeResource(device) {
  if (!window.confirm(`${device.name} verwijderen?`)) {
    return;
  }
  try {
    await request(`/api/devices/${device.id}`, { method: "DELETE" });
    state.devices = state.devices.filter((item) => item.id !== device.id);
    renderPeoplePage();
    renderPlanner();
  } catch (error) {
    alert(error.message);
  }
}

function openUserDialog(user) {
  state.editingUser = user;
  elements.userNameInput.value = user.name || "";
  elements.userEmailInput.value = user.email || "";
  elements.userMessage.textContent = "";
  elements.userMessage.className = "form-message";
  if (typeof elements.userDialog.showModal === "function") {
    elements.userDialog.showModal();
  } else {
    elements.userDialog.setAttribute("open", "open");
  }
}

function closeUserDialog() {
  state.editingUser = null;
  if (typeof elements.userDialog.close === "function") {
    elements.userDialog.close();
  } else {
    elements.userDialog.removeAttribute("open");
  }
}

async function saveUser() {
  if (!state.editingUser) {
    return;
  }
  elements.userSaveButton.disabled = true;
  elements.userMessage.textContent = "";
  try {
    const updated = await request(`/api/users/${state.editingUser.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: elements.userNameInput.value.trim(),
        email: elements.userEmailInput.value.trim()
      })
    });
    Object.assign(state.editingUser, updated);
    closeUserDialog();
    renderPeoplePage();
  } catch (error) {
    elements.userMessage.textContent = error.message;
    elements.userMessage.className = "form-message error";
  } finally {
    elements.userSaveButton.disabled = false;
  }
}

async function removeUser(user) {
  if (!window.confirm(`${user.name} verwijderen?`)) {
    return;
  }
  try {
    await request(`/api/users/${user.id}`, { method: "DELETE" });
    state.users = state.users.filter((item) => item.id !== user.id);
    renderPeoplePage();
  } catch (error) {
    alert(error.message);
  }
}

function renderColorPalette(container, selectedColor, onSelect, unavailableColors = []) {
  container.innerHTML = "";
  PROJECT_COLOR_PRESETS.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.title = color;
    swatch.setAttribute("aria-label", `Kies kleur ${color}`);
    swatch.disabled = unavailableColors.some((usedColor) => usedColor.toLowerCase() === color.toLowerCase());
    if (swatch.disabled) {
      swatch.title = `${color} is al in gebruik`;
    }
    swatch.classList.toggle("selected", color.toLowerCase() === selectedColor.toLowerCase());
    swatch.addEventListener("click", () => {
      container.querySelectorAll(".color-swatch.selected").forEach((item) => item.classList.remove("selected"));
      swatch.classList.add("selected");
      onSelect(color);
    });
    container.appendChild(swatch);
  });
}

function renderProjectsPage() {
  elements.syncGrippButton.hidden = !state.currentUser?.isAdmin || !state.auth0Config?.grippSyncConfigured;
  const latestApiProject = state.projects
    .filter((project) => project.grippCreatedAt)
    .sort((first, second) => new Date(second.grippCreatedAt) - new Date(first.grippCreatedAt))[0];
  elements.latestApiProject.textContent = latestApiProject
    ? `Laatste opdracht uit Gripp: ${getProjectDisplayLabel(latestApiProject)}`
    : "";
  elements.projectList.innerHTML = "";
  const searchTerm = elements.projectSearchInput.value.trim().toLowerCase();
  const filteredProjects = state.projects.filter((project) => isExternalCustomer(project) && ["opdracht", "offerte"].includes(project.projectType)).filter((project) => {
    const searchableText = `${project.name} ${project.projectName || ""} ${project.opdrachtNummer || ""} ${project.offerteNummer || ""} ${project.customerName || ""} ${project.containerNummer || ""} ${project.containerName || ""} ${getProjectTypeLabel(project)}`.toLowerCase();
    return searchableText.includes(searchTerm);
  }).sort((first, second) => compareProjectLabels(first.name, second.name));
  const reservationCounts = new Map();
  state.reservations.forEach((reservation) => {
    if (reservation.projectId) {
      reservationCounts.set(reservation.projectId, (reservationCounts.get(reservation.projectId) || 0) + 1);
    }
  });

  if (!filteredProjects.length) {
    const empty = document.createElement("p");
    empty.className = "project-list-empty";
    empty.textContent = state.projects.some((project) => isExternalCustomer(project) && ["opdracht", "offerte"].includes(project.projectType)) ? "Geen opdrachten of offertes gevonden." : "Geen externe opdrachten of offertes gevonden.";
    elements.projectList.appendChild(empty);
    return;
  }

  const table = document.createElement("table");
  table.className = "project-table";
  table.innerHTML = "<thead><tr><th>Nummer</th><th>Opdracht / offerte</th><th>Klant</th><th>Type</th><th>Reservaties</th></tr></thead><tbody></tbody>";
  const tableBody = table.querySelector("tbody");
  filteredProjects.forEach((project) => {
    const row = document.createElement("tr");
    row.className = `project-table-row project-type-${project.projectType}`;
    const number = project.projectType === "offerte" ? project.offerteNummer : project.opdrachtNummer;
    const title = project.projectName ? `${project.name} - ${project.projectName}` : project.name;
    const reservationCount = reservationCounts.get(project.id) || 0;
    row.innerHTML = "<td class=\"project-table-number\"></td><td class=\"project-table-title\"></td><td class=\"project-table-customer\"></td><td><span class=\"project-type-badge\"></span></td><td class=\"project-table-count\"></td>";
    row.querySelector(".project-table-number").textContent = number ? `#${number}` : "-";
    row.querySelector(".project-table-title").textContent = title;
    row.querySelector(".project-table-customer").textContent = project.customerName || "-";
    row.querySelector(".project-type-badge").textContent = getProjectTypeLabel(project);
    row.querySelector(".project-table-count").textContent = reservationCount;
    tableBody.appendChild(row);
  });
  elements.projectList.appendChild(table);
}

function renderReportsPage() {
  const years = [...new Set(state.reservations.map((reservation) => new Date(reservation.start).getFullYear()).filter((year) => Number.isFinite(year)))].sort((first, second) => second - first);
  if (!years.includes(2026)) {
    years.push(2026);
  }
  years.sort((first, second) => second - first);
  const selectedYear = Number(elements.reportYear.value) || 2026;
  elements.reportYear.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  elements.reportYear.value = String(years.includes(selectedYear) ? selectedYear : years[0]);
  const year = Number(elements.reportYear.value);
  const monthNames = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
  const monthlyReservations = Array(12).fill(0);
  const monthlyHours = Array(12).fill(0);
  state.reservations.forEach((reservation) => {
    const start = new Date(reservation.start);
    const end = new Date(reservation.end);
    if (start.getFullYear() === year) {
      monthlyReservations[start.getMonth()] += 1;
      monthlyHours[start.getMonth()] += Math.max(0, end - start) / 3600000;
    }
  });
  renderBarChart(elements.reservationChart, monthNames, monthlyReservations, (value) => String(value));
  renderBarChart(elements.hoursChart, monthNames, monthlyHours, (value) => `${value.toFixed(1)} u`);
  const activeReservations = state.reservations.filter((reservation) => new Date(reservation.end) > new Date()).length;
  const busiestDevice = state.devices
    .map((device) => ({ device, count: state.reservations.filter((reservation) => reservation.deviceId === device.id).length }))
    .sort((first, second) => second.count - first.count)[0];
  elements.reportSummary.innerHTML = "";
  [{ label: "Alle reservaties", value: state.reservations.length }, { label: "Actief of gepland", value: activeReservations }, { label: "Meest gebruikt", value: busiestDevice?.device.name || "-" }].forEach((metric) => {
    const item = document.createElement("div");
    item.className = "metric-card";
    item.innerHTML = `<strong></strong><span></span>`;
    item.querySelector("strong").textContent = metric.value;
    item.querySelector("span").textContent = metric.label;
    elements.reportSummary.appendChild(item);
  });
  elements.reportList.innerHTML = "";
  [...state.devices]
    .sort((first, second) => first.name.localeCompare(second.name, "nl", { numeric: true, sensitivity: "base" }))
    .forEach((device) => {
    const count = state.reservations.filter((reservation) => reservation.deviceId === device.id).length;
    elements.reportList.appendChild(createDataRow(device.name, device.type || "Device", `${count} reservaties`));
  });
}

function renderBarChart(container, labels, values, formatValue) {
  const maximum = Math.max(...values, 1);
  container.innerHTML = "";
  values.forEach((value, index) => {
    const row = document.createElement("div");
    row.className = "bar-chart-row";
    row.innerHTML = "<span class=\"bar-chart-label\"></span><span class=\"bar-chart-track\"><span class=\"bar-chart-fill\"></span></span><b class=\"bar-chart-value\"></b>";
    row.querySelector(".bar-chart-label").textContent = labels[index];
    row.querySelector(".bar-chart-fill").style.width = `${(value / maximum) * 100}%`;
    row.querySelector(".bar-chart-value").textContent = formatValue(value);
    container.appendChild(row);
  });
}

function renderPageData() {
  if (!state.currentUser) {
    return;
  }
  renderPeoplePage();
  renderProjectsPage();
  renderReportsPage();
}

function findMemberName(memberId) {
  return state.users.find((user) => user.id === memberId)?.name || memberId;
}

function focusReservationInSchedule(reservation) {
  setPage("schedule", true);
  window.requestAnimationFrame(() => {
    const block = document.querySelector(`.reservation-block[data-reservation-id="${reservation.id}"]`);
    if (!block) {
      return;
    }
    block.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    block.classList.add("is-focused");
    window.setTimeout(() => block.classList.remove("is-focused"), 1800);
  });
}

function toStartOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getWeekStart(date) {
  const dayStart = toStartOfDay(date);
  const day = dayStart.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  dayStart.setDate(dayStart.getDate() + offset);
  return dayStart;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatDateLabel(date) {
  return date.toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short"
  });
}

function getWeekDays() {
  return Array.from({ length: WEEK_DAY_COUNT }, (_, index) => addDays(state.weekStart, index));
}

function getWeekEndExclusive() {
  return addDays(state.weekStart, WEEK_DAY_COUNT);
}

function getDateKey(date) {
  const localDate = toStartOfDay(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEasterSunday(year) {
  const goldenNumber = year % 19;
  const century = Math.floor(year / 100);
  const yearInCentury = year % 100;
  const leapCentury = Math.floor(century / 4);
  const centuryRemainder = century % 4;
  const correction = Math.floor((century + 8) / 25);
  const lunarCorrection = Math.floor((century - correction + 1) / 3);
  const epact = (19 * goldenNumber + century - leapCentury - lunarCorrection + 15) % 30;
  const weekdayCorrection = (32 + 2 * centuryRemainder + 2 * Math.floor(yearInCentury / 4) - epact - yearInCentury % 4) % 7;
  const monthOffset = Math.floor((goldenNumber + 11 * epact + 22 * weekdayCorrection) / 451);
  const month = Math.floor((epact + weekdayCorrection - 7 * monthOffset + 114) / 31);
  const day = ((epact + weekdayCorrection - 7 * monthOffset + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getBelgianHoliday(date) {
  const year = date.getFullYear();
  const easterSunday = getEasterSunday(year);
  const holidays = [
    [new Date(year, 0, 1), "Nieuwjaar"],
    [addDays(easterSunday, 1), "Paasmaandag"],
    [new Date(year, 4, 1), "Dag van de Arbeid"],
    [addDays(easterSunday, 39), "Hemelvaart"],
    [addDays(easterSunday, 50), "Pinkstermaandag"],
    [new Date(year, 6, 21), "Nationale feestdag"],
    [new Date(year, 7, 15), "Onze-Lieve-Vrouw-Hemelvaart"],
    [new Date(year, 10, 1), "Allerheiligen"],
    [new Date(year, 10, 11), "Wapenstilstand"],
    [new Date(year, 11, 25), "Kerstmis"]
  ];
  const dateKey = getDateKey(date);
  const holiday = holidays.find(([holidayDate]) => getDateKey(holidayDate) === dateKey);
  return holiday?.[1] || "";
}

function getDefaultRange(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(8, 0, 0, 0);
  const end = new Date(baseDate);
  end.setHours(16, 0, 0, 0);
  return { start, end };
}

function applyRangeSelection(start, end) {
  state.selectedRange = { start, end };
  if (state.dateRangePicker) {
    state.dateRangePicker.setDate([start, end], true);
  }
}

function initializeDateRangePicker() {
  if (!elements.dateRangeInput) {
    return;
  }
  const defaults = getDefaultRange(new Date());
  state.selectedRange = defaults;

  if (typeof flatpickr !== "function") {
    elements.dateRangeInput.value = `${defaults.start.toLocaleString("nl-BE")} tot ${defaults.end.toLocaleString("nl-BE")}`;
    return;
  }

  state.dateRangePicker = flatpickr(elements.dateRangeInput, {
    mode: "range",
    enableTime: true,
    time_24hr: true,
    dateFormat: "d/m/Y H:i",
    conjunction: " tot ",
    locale: flatpickr.l10ns.nl,
    defaultDate: [defaults.start, defaults.end],
    onChange(selectedDates) {
      if (selectedDates.length === 2) {
        state.selectedRange = {
          start: selectedDates[0],
          end: selectedDates[1]
        };
      }
    }
  });
}

async function request(url, options = {}, includeAuth = true) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  if (includeAuth && state.accessToken) {
    headers.Authorization = `Bearer ${state.accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Er ging iets mis met de server.");
  }

  return data;
}

async function loadAuthConfig() {
  return request("/api/auth/config", {}, false);
}

function clearStuckMsalInteraction() {
  // a crashed/interrupted redirect can leave this flag set, blocking any new login attempt
  Object.keys(sessionStorage)
    .filter((key) => key.includes(".interaction.status"))
    .forEach((key) => sessionStorage.removeItem(key));
}

function getMsalClient(config) {
  if (state.msalClient) {
    return state.msalClient;
  }
  const msalConfig = {
    auth: {
      clientId: config.clientId,
      authority: config.authority || `https://login.microsoftonline.com/${config.tenantId}`,
      redirectUri: window.location.origin
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false
    }
  };
  state.msalClient = new window.msal.PublicClientApplication(msalConfig);
  state.msalConfig = {
    scopes: config.apiScope ? [config.apiScope] : [config.apiAudience || "User.Read"]
  };
  return state.msalClient;
}

async function initializeLocalSession() {
  state.auth0Config = await loadAuthConfig();

  if (state.auth0Config.provider === "azure" && window.msal && state.auth0Config.clientId) {
    const msalClient = getMsalClient(state.auth0Config);

    let redirectResult;
    try {
      redirectResult = await msalClient.handleRedirectPromise();
    } catch (error) {
      if (error.errorCode !== "interaction_in_progress") {
        throw error;
      }
      clearStuckMsalInteraction();
    }
    if (redirectResult?.account) {
      msalClient.setActiveAccount(redirectResult.account);
    }

    const accounts = msalClient.getAllAccounts();
    if (accounts.length > 0) {
      try {
        const account = accounts[0];
        const email = (account.username || "").toLowerCase();
        if (state.auth0Config.allowedEmailDomain && !email.endsWith(`@${state.auth0Config.allowedEmailDomain}`)) {
          await msalClient.logoutRedirect({ account, postLogoutRedirectUri: window.location.origin });
          return false;
        }
        msalClient.setActiveAccount(account);
        const silentResult = await msalClient.acquireTokenSilent({
          account,
          scopes: state.msalConfig.scopes
        });
        state.accessToken = silentResult.accessToken;
        state.currentUser = {
          id: account.homeAccountId || account.localAccountId,
          name: account.name || account.username,
          email,
          role: "admin",
          isAdmin: true,
          picture: ""
        };
        state.auth0User = state.currentUser;
        showLoginMessage("Microsoft Entra ID sessie hersteld.", "success");
        return true;
      } catch {
        state.msalClient = null;
      }
    }

    return false;
  }

  if (!state.auth0Config.enabled) {
    state.accessToken = "local-demo-token";
    state.currentUser = {
      id: "local-demo-admin",
      name: "Demo Admin",
      email: "admin@local.test",
      role: "admin",
      isAdmin: true,
      picture: ""
    };
    state.auth0User = state.currentUser;
    showLoginMessage("Geen Entra-config gevonden; lokale demo-sessie actief.", "success");
    return true;
  }

  return false;
}

async function loginWithAuth0(screenHint) {
  const config = await loadAuthConfig();
  if (config.provider === "azure" && window.msal && config.clientId) {
    const msalClient = getMsalClient(config);

    try {
      await msalClient.loginRedirect(state.msalConfig);
      return;
    } catch (error) {
      if (error.errorCode === "interaction_in_progress") {
        clearStuckMsalInteraction();
        try {
          await msalClient.loginRedirect(state.msalConfig);
          return;
        } catch (retryError) {
          showLoginMessage("Microsoft login fout: " + retryError.message, "error");
          return;
        }
      }
      showLoginMessage("Microsoft login fout: " + error.message, "error");
      return;
    }
  }

  const localSession = await initializeLocalSession();
  if (localSession) {
    setAuthenticatedView(true);
    await syncAuthenticatedProfile();
    await loadMeta();
    await loadProjects();
    await loadReservations();
    return;
  }

  showLoginMessage("Er is geen externe login-provider actief. Gebruik de lokale demo-sessie.", "error");
}

async function logoutFromAuth0() {
  if (state.msalClient) {
    try {
      const account = state.msalClient.getActiveAccount() || state.msalClient.getAllAccounts()[0];
      await state.msalClient.logoutRedirect({ account, postLogoutRedirectUri: window.location.origin });
      return;
    } catch {
      // ignore redirect logout issues when there is no active session
    }
  }

  state.accessToken = "";
  state.currentUser = null;
  state.auth0User = null;
  state.msalClient = null;
  setAuthenticatedView(false);
  showLoginMessage("Uitgelogd uit de Microsoft/Entra of demo-sessie.", "success");
}

function fillSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = "";

  const initial = document.createElement("option");
  initial.value = "";
  initial.textContent = placeholder;
  initial.disabled = true;
  initial.selected = true;
  selectEl.appendChild(initial);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.type ? `${item.name} (${item.type})` : item.name;
    selectEl.appendChild(option);
  });
}

function renderCurrentUser() {
  const userName = state.currentUser?.name || "";
  elements.currentUserLabel.textContent = userName;
  const sidebarUserLabel = document.getElementById("sidebar-user-label");
  if (sidebarUserLabel) {
    sidebarUserLabel.textContent = userName;
  }
  const sidebarAvatar = document.getElementById("sidebar-user-avatar");
  if (sidebarAvatar) {
    const initials = userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    sidebarAvatar.textContent = initials;
    sidebarAvatar.style.backgroundImage = "";
    sidebarAvatar.replaceChildren();
    if (state.currentUser?.picture) {
      sidebarAvatar.textContent = "";
      const image = document.createElement("img");
      image.src = state.currentUser.picture;
      image.alt = userName;
      image.addEventListener("error", () => {
        image.remove();
        sidebarAvatar.textContent = initials;
      });
      sidebarAvatar.appendChild(image);
    }
  }
  elements.currentUserRole.textContent = state.currentUser?.isAdmin ? "Admin" : "Gebruiker";
  elements.currentUserRole.className = `role-badge ${state.currentUser?.isAdmin ? "admin" : "user"}`;
}

async function deleteReservation(reservation) {
  if (!window.confirm(`Reservatie voor ${reservation.deviceName} verwijderen?`)) {
    return false;
  }

  try {
    await request(`/api/reservations/${reservation.id}`, { method: "DELETE" });
    await loadReservations();
    return true;
  } catch (error) {
    alert(error.message);
    return false;
  }
}

function toDateTimeInputValue(dateString) {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function openEditDialog(reservation) {
  state.editingReservation = reservation;
  elements.editDeviceSelect.innerHTML = "";
  [...state.devices]
    .sort((first, second) => first.name.localeCompare(second.name, "nl", { numeric: true, sensitivity: "base" }))
    .forEach((device) => {
    const option = document.createElement("option");
    option.value = device.id;
    option.textContent = `${device.name} (${device.type})`;
    option.selected = device.id === reservation.deviceId;
    elements.editDeviceSelect.appendChild(option);
  });

  elements.editProjectSearch.value = "";
  renderEditProjectOptions(reservation.projectId);
  elements.editProjectSearch.value = elements.editProjectSelect.selectedOptions[0]?.dataset.label || elements.editProjectSelect.selectedOptions[0]?.textContent || "";

  elements.editMemberField.hidden = !state.currentUser?.isAdmin;
  if (state.currentUser?.isAdmin) {
    elements.editMemberSelect.innerHTML = "";
    state.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      option.selected = user.id === reservation.memberId;
      elements.editMemberSelect.appendChild(option);
    });
  }

  elements.editStart.value = toDateTimeInputValue(reservation.start);
  elements.editEnd.value = toDateTimeInputValue(reservation.end);
  elements.editNote.value = reservation.note || "";
  elements.editMessage.textContent = "";
  if (typeof elements.editDialog.showModal === "function") {
    elements.editDialog.showModal();
  } else {
    elements.editDialog.setAttribute("open", "open");
  }
}

function renderEditProjectOptions(selectedProjectId = "") {
  const projects = getReservationProjects(selectedProjectId)
    .map((project) => ({
      project,
      label: getReservationProjectLabel(project)
    }))
    .sort((first, second) => compareProjectLabels(first.label, second.label));

  elements.editProjectSelect.innerHTML = "";
  elements.editProjectOptions.innerHTML = "";
  const noProject = document.createElement("option");
  noProject.value = "";
  noProject.textContent = "Geen opdracht";
  noProject.dataset.label = "Geen opdracht";
  noProject.selected = !selectedProjectId;
  elements.editProjectSelect.appendChild(noProject);

  projects.forEach(({ project, label }) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = formatProjectOptionLabel(`${label} · ${project.customerName || "Onbekende klant"}`);
    option.dataset.label = label;
    option.dataset.search = `${label} ${project.customerName || ""}`.toLowerCase();
    option.selected = project.id === selectedProjectId;
    elements.editProjectSelect.appendChild(option);
  });
}

function closeEditDialog() {
  state.editingReservation = null;
  if (typeof elements.editDialog.close === "function") {
    elements.editDialog.close();
  } else {
    elements.editDialog.removeAttribute("open");
  }
}

async function saveEditedReservation() {
  if (!state.editingReservation) {
    return;
  }
  elements.editSaveButton.disabled = true;
  elements.editSaveButton.textContent = "Opslaan...";
  elements.editMessage.textContent = "";
  try {
    await request(`/api/reservations/${state.editingReservation.id}`, {
      method: "PUT",
      body: JSON.stringify({
        deviceId: elements.editDeviceSelect.value,
        start: new Date(elements.editStart.value).toISOString(),
        end: new Date(elements.editEnd.value).toISOString(),
        projectId: elements.editProjectSelect.value,
        note: elements.editNote.value.trim(),
        ...(state.currentUser?.isAdmin ? { memberId: elements.editMemberSelect.value } : {})
      })
    });
    closeEditDialog();
    await loadReservations();
  } catch (error) {
    elements.editMessage.textContent = error.message;
    elements.editMessage.className = "form-message error";
  } finally {
    elements.editSaveButton.disabled = false;
    elements.editSaveButton.textContent = "Wijzigingen opslaan";
  }
}

function renderDashboard() {
  const now = new Date();
  const horizon = addDays(now, 28);
  const userReservations = state.reservations
    .filter((reservation) => reservation.memberId === state.currentUser?.id)
    .filter((reservation) => new Date(reservation.end) > now && new Date(reservation.start) < horizon)
    .sort((first, second) => new Date(first.start) - new Date(second.start));

  const deviceCount = new Set(userReservations.map((reservation) => reservation.deviceId)).size;
  elements.dashboardSummary.innerHTML = "";
  [
    { label: "Reservaties", value: userReservations.length },
    { label: "Devices", value: deviceCount },
    { label: "Periode", value: "28 dagen" }
  ].forEach((item) => {
    const card = document.createElement("div");
    card.className = "dashboard-stat";
    const value = document.createElement("strong");
    value.textContent = item.value;
    const label = document.createElement("span");
    label.textContent = item.label;
    card.append(value, label);
    elements.dashboardSummary.appendChild(card);
  });

  elements.dashboardReservations.innerHTML = "";
  if (!userReservations.length) {
    const empty = document.createElement("p");
    empty.className = "dashboard-empty";
    empty.textContent = "Je hebt de komende 4 weken geen reservaties.";
    elements.dashboardReservations.appendChild(empty);
    return;
  }

  userReservations.forEach((reservation) => {
    const item = document.createElement("article");
    item.className = "dashboard-reservation";
    item.addEventListener("click", () => focusReservationInSchedule(reservation));
    const device = document.createElement("strong");
    device.textContent = reservation.deviceName;
    const time = document.createElement("span");
    const customer = reservation.customerName ? ` · ${reservation.customerName}` : "";
    time.textContent = `${formatDateTime(reservation.start)} - ${formatDateTime(reservation.end)}${customer}`;
    item.append(device, time);
    elements.dashboardReservations.appendChild(item);
  });
}

function getSelectionBounds(selection) {
  const start = new Date(`${selection.startDate}T00:00:00`);
  const end = new Date(`${selection.endDate}T00:00:00`);
  return start <= end
    ? { startDate: selection.startDate, endDate: selection.endDate }
    : { startDate: selection.endDate, endDate: selection.startDate };
}

function updatePlannerSelectionVisuals() {
  document.querySelectorAll(".week-cell.selection-preview").forEach((cell) => cell.classList.remove("selection-preview"));
  if (!state.plannerSelection) {
    return;
  }

  const bounds = getSelectionBounds(state.plannerSelection);
  document.querySelectorAll(`.week-cell[data-device-id="${state.plannerSelection.deviceId}"]`).forEach((cell) => {
    if (cell.dataset.date >= bounds.startDate && cell.dataset.date <= bounds.endDate) {
      cell.classList.add("selection-preview");
    }
  });
}

function findPlannerConflict(deviceId, start, end) {
  return state.reservations.find((reservation) => {
    if (reservation.deviceId !== deviceId) {
      return false;
    }
    return new Date(reservation.start) < end && new Date(reservation.end) > start;
  });
}

async function finishPlannerSelection() {
  if (!state.isSelectingPlannerRange || !state.plannerSelection) {
    return;
  }

  state.isSelectingPlannerRange = false;
  const selection = { ...state.plannerSelection };
  const bounds = getSelectionBounds(selection);
  state.plannerSelection = null;
  updatePlannerSelectionVisuals();

  const startDate = new Date(`${bounds.startDate}T08:00:00`);
  const endDate = new Date(`${bounds.endDate}T16:00:00`);
  const device = state.devices.find((item) => item.id === selection.deviceId);
  if (device && (device.status || "available") !== "available") {
    showMessage(`${device.name} is niet boekbaar: ${device.status === "defect" ? "defect" : "out of use"}.`, "error");
    return;
  }

  const conflict = findPlannerConflict(selection.deviceId, startDate, endDate);
  if (conflict) {
    const conflictDevice = device?.name || selection.deviceId;
    showMessage(`${conflictDevice} is al geboekt van ${formatDateTime(conflict.start)} tot ${formatDateTime(conflict.end)}. Kies een andere periode of resource.`, "error");
    return;
  }

  state.pendingPlannerReservation = {
    deviceId: selection.deviceId,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    note: elements.noteInput?.value.trim() || ""
  };
  openProjectDialog();
}

function renderProjectOptions() {
  const selectedProjectId = elements.projectSelect.value;
  const projects = getReservationProjects()
    .map((project) => ({
      project,
      label: getReservationProjectLabel(project)
    }))
    .sort((first, second) => compareProjectLabels(first.label, second.label));

  elements.projectSelect.innerHTML = "";
  projects.forEach(({ project, label }) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = formatProjectOptionLabel(`${label} · ${project.customerName || "Onbekende klant"}`);
    option.dataset.label = label;
    option.dataset.search = `${label} ${project.customerName || ""}`.toLowerCase();
    option.selected = project.id === selectedProjectId;
    elements.projectSelect.appendChild(option);
  });
  const newOption = document.createElement("option");
  newOption.value = "__new_project__";
  newOption.textContent = "Nieuw project...";
  newOption.dataset.label = "Nieuw project...";
  newOption.selected = selectedProjectId === "__new_project__";
  elements.projectSelect.appendChild(newOption);
}

function updateNewProjectVisibility() {
  const isNewProject = elements.projectSelect.value === "__new_project__";
  elements.newProjectFields.hidden = !isNewProject;
  elements.newProjectName.required = isNewProject;
}

function syncProjectCombobox(input, select) {
  const searchValue = input.value.trim().toLowerCase();
  const matchingOption = [...select.options].find((option) => (option.dataset.label || option.textContent).toLowerCase() === searchValue);
  select.value = matchingOption?.value || "";
}

function renderProjectOptionList(input, list, select, onSelect) {
  const searchTerm = input.value.trim().toLowerCase();
  list.innerHTML = "";
  [...select.options]
    .filter((option) => (option.dataset.search || option.dataset.label || option.textContent).toLowerCase().includes(searchTerm))
    .forEach((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "project-option";
      item.textContent = option.textContent;
      item.addEventListener("click", () => {
        select.value = option.value;
        input.value = option.dataset.label || option.textContent;
        list.hidden = true;
        onSelect?.();
      });
      list.appendChild(item);
    });
  list.hidden = list.children.length === 0;
}

function openProjectDialog() {
  const pending = state.pendingPlannerReservation;
  if (!pending) {
    return;
  }
  const start = formatDateTime(pending.start);
  const end = formatDateTime(pending.end);
  const device = state.devices.find((item) => item.id === pending.deviceId)?.name || pending.deviceId;
  elements.projectPeriod.textContent = `${device} | ${start} - ${end}`;
  elements.projectMessage.textContent = "";
  elements.projectMessage.className = "form-message";
  const defaultProjectName = `SC${new Date(pending.start).toISOString().slice(0, 10).replace(/-/g, "")}`;
  elements.newProjectName.value = state.projects.length ? "" : defaultProjectName;
  elements.newProjectTitle.value = "";
  elements.newProjectSearchInput.value = "";
  renderProjectOptions();
  elements.projectSelect.value = state.projects.length ? state.projects[0].id : "__new_project__";
  elements.newProjectSearchInput.value = elements.projectSelect.selectedOptions[0]?.dataset.label || "Nieuw project...";
  updateNewProjectVisibility();
  if (typeof elements.projectDialog.showModal === "function") {
    elements.projectDialog.showModal();
  } else {
    elements.projectDialog.setAttribute("open", "open");
  }
}

function closeProjectDialog() {
  state.pendingPlannerReservation = null;
  if (typeof elements.projectDialog.close === "function") {
    elements.projectDialog.close();
  } else {
    elements.projectDialog.removeAttribute("open");
  }
}

async function submitPlannerReservation(projectId) {
  if (!state.pendingPlannerReservation || !projectId) {
    return;
  }

  await request("/api/reservations", {
    method: "POST",
    body: JSON.stringify({ ...state.pendingPlannerReservation, projectId })
  });
  closeProjectDialog();
  showMessage("Reservatie aangemaakt vanuit de planning.", "success");
  await loadReservations();
}

function updateWeekLabel() {
  const weekEnd = addDays(state.weekStart, WEEK_DAY_COUNT - 1);
  elements.weekLabel.textContent = `${formatDateLabel(state.weekStart)} - ${formatDateLabel(weekEnd)}`;
}

function renderPlanner() {
  elements.myReservationsButton.classList.toggle("active", state.myReservationsOnly);
  elements.myReservationsButton.setAttribute("aria-pressed", String(state.myReservationsOnly));
  elements.deviceRows.innerHTML = "";
  const weekDays = getWeekDays();
  const weekStart = state.weekStart;
  const weekEndExclusive = getWeekEndExclusive();

  elements.weekAxis.innerHTML = "";
  elements.weekShell.onscroll = () => {
    if (state.plannerScrollAdjusting) {
      return;
    }
    if (Date.now() < state.plannerScrollCooldownUntil) {
      return;
    }
    const currentScrollLeft = elements.weekShell.scrollLeft;
    if (currentScrollLeft === state.plannerLastScrollLeft) {
      return;
    }
    state.plannerLastScrollLeft = currentScrollLeft;
    const edgeDistance = 80;
    const maxScrollLeft = elements.weekShell.scrollWidth - elements.weekShell.clientWidth;
    if (maxScrollLeft <= 0) {
      return;
    }

    const atStartEdge = currentScrollLeft <= edgeDistance;
    const atEndEdge = currentScrollLeft >= maxScrollLeft - edgeDistance;
    if (!atStartEdge && !atEndEdge) {
      state.plannerScrollEdgeLock = "";
    }

    const columnWidth = Math.max(60, (elements.weekAxis.scrollWidth - 220) / WEEK_DAY_COUNT);
    if (atStartEdge && state.plannerScrollEdgeLock !== "start") {
      state.plannerScrollEdgeLock = "start";
      state.plannerScrollAdjusting = true;
      state.weekStart = addDays(state.weekStart, -NAVIGATION_STEP_DAYS);
      renderPlanner();
      elements.weekShell.scrollLeft = currentScrollLeft + NAVIGATION_STEP_DAYS * columnWidth;
      state.plannerLastScrollLeft = elements.weekShell.scrollLeft;
      state.plannerScrollCooldownUntil = Date.now() + 350;
      window.setTimeout(() => {
        state.plannerScrollAdjusting = false;
      }, 350);
    } else if (atEndEdge && state.plannerScrollEdgeLock !== "end") {
      state.plannerScrollEdgeLock = "end";
      state.plannerScrollAdjusting = true;
      state.weekStart = addDays(state.weekStart, NAVIGATION_STEP_DAYS);
      renderPlanner();
      elements.weekShell.scrollLeft = Math.max(0, currentScrollLeft - NAVIGATION_STEP_DAYS * columnWidth);
      state.plannerLastScrollLeft = elements.weekShell.scrollLeft;
      state.plannerScrollCooldownUntil = Date.now() + 350;
      window.setTimeout(() => {
        state.plannerScrollAdjusting = false;
      }, 350);
    }
  };
  const labelLead = document.createElement("span");
  labelLead.textContent = "Devices";
  elements.weekAxis.appendChild(labelLead);

  weekDays.forEach((dayDate, index) => {
    const day = document.createElement("span");
    const dateKey = getDateKey(dayDate);
    const todayKey = getDateKey(new Date());
    day.dataset.date = dateKey;
    if (dateKey === todayKey) {
      day.classList.add("today-column");
    }
    if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
      day.classList.add("weekend-column");
    }
    const holidayName = getBelgianHoliday(dayDate);
    if (holidayName) {
      day.classList.add("holiday-column");
      day.title = `Belgische feestdag: ${holidayName}`;
    }
    day.textContent = `${DAY_NAMES[index % DAY_NAMES.length]} ${formatDateLabel(dayDate)}`;
    elements.weekAxis.appendChild(day);
  });

  updateWeekLabel();

  const visibleReservations = state.myReservationsOnly
    ? state.reservations.filter((reservation) => reservation.memberId === state.currentUser?.id)
    : state.reservations;
  const reservationMap = new Map(visibleReservations.map((reservation) => [reservation.id, reservation]));

  [...state.devices]
    .sort((first, second) => first.name.localeCompare(second.name, "nl", { numeric: true, sensitivity: "base" }))
    .forEach((device) => {
    const node = elements.deviceRowTemplate.content.cloneNode(true);
    const row = node.querySelector(".device-row");
    const weekGrid = node.querySelector(".device-week-grid");
    const deviceUnavailable = (device.status || "available") !== "available";
    if (deviceUnavailable) {
      row.classList.add("device-unavailable");
    }

    const deviceThumb = document.createElement("span");
    deviceThumb.className = "device-thumb";
    if (device.photoUrl) {
      const deviceImage = document.createElement("img");
      deviceImage.src = device.photoUrl;
      deviceImage.alt = device.name;
      deviceImage.loading = "lazy";
      deviceImage.addEventListener("error", () => {
        deviceThumb.textContent = device.type?.slice(0, 2).toUpperCase() || "DV";
      });
      deviceThumb.appendChild(deviceImage);
    } else {
      deviceThumb.textContent = device.type?.slice(0, 2).toUpperCase() || "DV";
    }
    row.querySelector(".device-meta").prepend(deviceThumb);
    row.querySelector(".device-name").textContent = device.name;
    row.querySelector(".device-type").textContent = device.type;

    const deviceReservations = state.reservations.filter((reservation) => reservation.deviceId === device.id);
    const reservationLanes = new Map();
    const laneEndTimes = [];
    [...deviceReservations]
      .sort((first, second) => new Date(first.start) - new Date(second.start))
      .forEach((reservation) => {
        const reservationStart = new Date(reservation.start).getTime();
        const reservationEnd = new Date(reservation.end).getTime();
        let lane = laneEndTimes.findIndex((laneEnd) => laneEnd <= reservationStart);
        if (lane === -1) {
          lane = laneEndTimes.length;
        }
        laneEndTimes[lane] = reservationEnd;
        reservationLanes.set(reservation.id, lane);
      });
    const overlapDates = new Set(weekDays
      .filter((dayDate) => {
        const dayStart = new Date(dayDate);
        const dayEnd = addDays(dayStart, 1);
        return deviceReservations.filter((reservation) => new Date(reservation.start) < dayEnd && new Date(reservation.end) > dayStart).length > 1;
      })
      .map((dayDate) => getDateKey(dayDate)));
    row.classList.toggle("row-has-overlap", overlapDates.size > 0);
    row.style.setProperty("--device-row-height", `${laneEndTimes.length > 1 ? 128 + (laneEndTimes.length - 2) * 64 : 72}px`);

    weekDays.forEach((dayDate) => {
      const cell = document.createElement("div");
      cell.className = "week-cell";
      cell.dataset.deviceId = device.id;
      cell.dataset.date = getDateKey(dayDate);
      if (getDateKey(dayDate) === getDateKey(new Date())) {
        cell.classList.add("today-column");
      }
      if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
        cell.classList.add("weekend-column");
      }
      const holidayName = getBelgianHoliday(dayDate);
      if (holidayName) {
        cell.classList.add("holiday-column");
        cell.title = `Belgische feestdag: ${holidayName}`;
      }

      cell.addEventListener("mousedown", (event) => {
        if (event.button !== 0 || deviceUnavailable) {
          return;
        }
        event.preventDefault();
        state.isSelectingPlannerRange = true;
        state.plannerSelection = {
          deviceId: device.id,
          startDate: cell.dataset.date,
          endDate: cell.dataset.date
        };
        updatePlannerSelectionVisuals();
      });

      cell.addEventListener("mouseenter", () => {
        if (!state.isSelectingPlannerRange || !state.plannerSelection || state.plannerSelection.deviceId !== device.id) {
          return;
        }
        state.plannerSelection.endDate = cell.dataset.date;
        updatePlannerSelectionVisuals();
      });

      if (deviceUnavailable) {
        cell.classList.add("unavailable-cell");
        const unavailableLabel = document.createElement("span");
        unavailableLabel.className = "unavailable-label";
        unavailableLabel.textContent = device.status === "defect" ? "Defect" : "Out of use";
        cell.appendChild(unavailableLabel);
      }

      cell.addEventListener("dragover", (event) => {
        event.preventDefault();
        cell.classList.add("drag-over");
      });

      cell.addEventListener("dragleave", () => {
        cell.classList.remove("drag-over");
      });

      cell.addEventListener("drop", (event) => {
        event.preventDefault();
        cell.classList.remove("drag-over");
        const reservationId = event.dataTransfer.getData("text/plain");
        void moveReservationByDrop(reservationMap.get(reservationId), cell.dataset.deviceId, cell.dataset.date);
      });

      const dayStart = new Date(dayDate);
      const dayEnd = addDays(dayStart, 1);

      const overlappingReservations = visibleReservations
        .filter((reservation) => reservation.deviceId === device.id)
        .filter((reservation) => {
          const reservationStart = new Date(reservation.start);
          const reservationEnd = new Date(reservation.end);
          return reservationStart < dayEnd && reservationEnd > dayStart;
        })
        .filter((reservation) => {
          const reservationStart = new Date(reservation.start);
          const reservationEnd = new Date(reservation.end);
          return reservationEnd > weekStart && reservationStart < weekEndExclusive;
        });

      if (overlappingReservations.length > 1) {
        cell.classList.add("has-overlap");
        const overlapMarker = document.createElement("span");
        overlapMarker.className = "overlap-marker";
        overlapMarker.textContent = "!";
        overlapMarker.title = "Meerdere reservaties overlappen op deze dag";
        overlapMarker.setAttribute("aria-label", "Meerdere reservaties overlappen op deze dag");
        cell.appendChild(overlapMarker);
      }

      const firstVisibleDateKey = getDateKey(weekStart);
      const reservationItems = overlappingReservations.filter((reservation) => {
        const reservationDateKey = getDateKey(new Date(reservation.start));
        return reservationDateKey === cell.dataset.date ||
          (reservationDateKey < cell.dataset.date && cell.dataset.date === firstVisibleDateKey);
      });

      if (!overlappingReservations.length) {
        const empty = document.createElement("span");
        empty.className = "cell-empty";
        empty.textContent = "-";
        cell.appendChild(empty);
      }

      reservationItems.forEach((reservation) => {
        const block = document.createElement("div");
        block.className = "reservation-block reservation-span";
        const reservationLane = reservationLanes.get(reservation.id) || 0;
        block.style.gridRow = String(reservationLane + 1);
        block.style.transform = `translateY(${reservationLane * 64}px)`;
        const reservationStart = new Date(reservation.start);
        const reservationEnd = new Date(reservation.end);
        const spanDays = weekDays.filter((visibleDay) => {
          const visibleDayEnd = addDays(visibleDay, 1);
          return reservationStart < visibleDayEnd && reservationEnd > visibleDay;
        }).length;
        block.style.setProperty("--reservation-days", String(Math.max(1, spanDays)));
        const reservationColor = getReadableReservationColor(reservation.projectColor);
        block.style.background = reservationColor;
        block.style.borderLeft = `4px solid ${reservationColor}`;
        const canManageReservation = state.currentUser?.isAdmin || reservation.memberId === state.currentUser?.id;
        let wasDragged = false;
        let wasResized = false;
        block.draggable = canManageReservation;
        block.dataset.reservationId = reservation.id;
        block.addEventListener("mousedown", (event) => event.stopPropagation());
        block.addEventListener("click", () => {
          if (canManageReservation && !wasDragged && !wasResized) {
            openEditDialog(reservation);
          }
        });

        const project = document.createElement("strong");
        project.className = "reservation-project";
        project.textContent = reservation.projectTitle
          ? `${reservation.projectName} - ${reservation.projectTitle}`
          : reservation.projectName || "Zonder project";

        const member = document.createElement("small");
        member.className = "reservation-member-label";
        const memberPicture = reservation.memberPicture || state.users.find((user) => user.id === reservation.memberId)?.picture || "";
        if (memberPicture) {
          const memberAvatar = document.createElement("img");
          memberAvatar.className = "reservation-member-avatar";
          memberAvatar.src = memberPicture;
          memberAvatar.alt = "";
          memberAvatar.loading = "lazy";
          memberAvatar.addEventListener("error", () => memberAvatar.remove());
          member.appendChild(memberAvatar);
        }
        const memberName = reservation.memberName || findMemberName(reservation.memberId);
        member.title = memberName;
        member.appendChild(document.createTextNode(memberName));

        const timing = document.createElement("small");
        timing.className = "reservation-timing";
        timing.textContent = `${new Date(reservation.start).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })} - ${new Date(reservation.end).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}`;

        block.appendChild(project);
        block.appendChild(member);
        block.appendChild(timing);

        const startHandle = document.createElement("span");
        startHandle.className = "reservation-resize-handle start-handle";
        startHandle.title = "Sleep om start aan te passen";
        startHandle.addEventListener("mousedown", (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
        startHandle.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          wasResized = true;
          state.resizingReservation = { reservation, edge: "start", originalStart: reservation.start, originalEnd: reservation.end, targetDate: getDateKey(new Date(reservation.start)) };
          document.body.classList.add("is-resizing-reservation");
          startHandle.setPointerCapture?.(event.pointerId);
        });
        startHandle.addEventListener("pointermove", updateReservationResizeTarget);

        const endHandle = document.createElement("span");
        endHandle.className = "reservation-resize-handle end-handle";
        endHandle.title = "Sleep om einde aan te passen";
        endHandle.addEventListener("mousedown", (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
        endHandle.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          wasResized = true;
          state.resizingReservation = { reservation, edge: "end", originalStart: reservation.start, originalEnd: reservation.end, targetDate: getDateKey(new Date(reservation.end)) };
          document.body.classList.add("is-resizing-reservation");
          endHandle.setPointerCapture?.(event.pointerId);
        });
        endHandle.addEventListener("pointermove", updateReservationResizeTarget);

        block.append(startHandle, endHandle);

        if (canManageReservation) {
          const blockActions = document.createElement("span");
          blockActions.className = "reservation-block-actions";

          const editButton = document.createElement("button");
          editButton.type = "button";
          editButton.className = "reservation-action edit-action";
          editButton.textContent = "✎";
          editButton.title = "Reservatie bewerken";
          editButton.setAttribute("aria-label", "Reservatie bewerken");
          editButton.addEventListener("mousedown", (event) => event.stopPropagation());
          editButton.addEventListener("click", (event) => {
            event.stopPropagation();
            openEditDialog(reservation);
          });

          const deleteButton = document.createElement("button");
          deleteButton.type = "button";
          deleteButton.className = "reservation-action delete-action";
          deleteButton.textContent = "🗑";
          deleteButton.title = "Reservatie verwijderen";
          deleteButton.setAttribute("aria-label", "Reservatie verwijderen");
          deleteButton.addEventListener("mousedown", (event) => event.stopPropagation());
          deleteButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            await deleteReservation(reservation);
          });

          blockActions.append(editButton, deleteButton);
          block.appendChild(blockActions);
        }

        if (canManageReservation) {
          block.addEventListener("dragstart", (event) => {
            wasDragged = true;
            state.dragReservationId = reservation.id;
            block.classList.add("is-dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", reservation.id);
          });

          block.addEventListener("dragend", () => {
            state.dragReservationId = null;
            block.classList.remove("is-dragging");
            document.querySelectorAll(".week-cell.drag-over").forEach((nodeItem) => nodeItem.classList.remove("drag-over"));
            window.setTimeout(() => {
              wasDragged = false;
            }, 0);
          });
        } else {
          block.style.opacity = "0.7";
          block.title = "Reservatie van een andere gebruiker";
        }

        cell.appendChild(block);
      });

      weekGrid.appendChild(cell);
    });

    elements.deviceRows.appendChild(node);
  });
}

async function quickCreateReservation(deviceId, dateKey) {
  if (!state.currentUser) {
    showMessage("Log eerst in om een reservatie te maken.", "error");
    return;
  }

  const dayDate = new Date(`${dateKey}T08:00:00`);
  const endDate = new Date(`${dateKey}T16:00:00`);

  try {
    await request("/api/reservations", {
      method: "POST",
      body: JSON.stringify({
        deviceId,
        start: dayDate.toISOString(),
        end: endDate.toISOString(),
        note: elements.noteInput?.value.trim() || ""
      })
    });

    showMessage("Reservatie aangemaakt op de gekozen dag.", "success");
    await loadReservations();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function moveReservationByDrop(reservation, targetDeviceId, targetDateKey) {
  if (!reservation) {
    return;
  }

  if (!state.currentUser || (!state.currentUser.isAdmin && reservation.memberId !== state.currentUser.id)) {
    showMessage("Je hebt geen rechten om deze reservatie te verplaatsen.", "error");
    return;
  }

  const currentStart = new Date(reservation.start);
  const currentEnd = new Date(reservation.end);
  const duration = currentEnd.getTime() - currentStart.getTime();

  const targetDay = new Date(`${targetDateKey}T00:00:00`);
  targetDay.setHours(currentStart.getHours(), currentStart.getMinutes(), 0, 0);
  const newStart = targetDay;
  const newEnd = new Date(newStart.getTime() + duration);

  try {
    await request(`/api/reservations/${reservation.id}`, {
      method: "PUT",
      body: JSON.stringify({
        deviceId: targetDeviceId,
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
        projectId: reservation.projectId || "",
        note: reservation.note || ""
      })
    });

    showMessage("Reservatie verplaatst via drag-and-drop.", "success");
    await loadReservations();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function resizeReservationByDay(reservation, edge, direction) {
  if (!state.currentUser || (!state.currentUser.isAdmin && reservation.memberId !== state.currentUser.id)) {
    showMessage("Je hebt geen rechten om deze reservatie aan te passen.", "error");
    return;
  }

  const start = new Date(reservation.start);
  const end = new Date(reservation.end);
  if (edge === "start") {
    start.setDate(start.getDate() + direction);
  } else {
    end.setDate(end.getDate() + direction);
  }

  if (start >= end) {
    showMessage("De reservatieperiode moet minstens één dag lang zijn.", "error");
    return;
  }

  try {
    await request(`/api/reservations/${reservation.id}`, {
      method: "PUT",
      body: JSON.stringify({
        deviceId: reservation.deviceId,
        start: start.toISOString(),
        end: end.toISOString(),
        projectId: reservation.projectId || "",
        note: reservation.note || ""
      })
    });
    await loadReservations();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function finishReservationResize() {
  const resize = state.resizingReservation;
  state.resizingReservation = null;
  document.body.classList.remove("is-resizing-reservation");
  if (!resize?.targetDate) {
    return;
  }

  const start = new Date(resize.originalStart);
  const end = new Date(resize.originalEnd);
  const targetDate = new Date(`${resize.targetDate}T00:00:00`);
  if (resize.edge === "start") {
    start.setHours(8, 0, 0, 0);
    start.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  } else {
    end.setHours(16, 0, 0, 0);
    end.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  }

  if (start >= end) {
    showMessage("Het begin moet vóór het einde van de reservatie blijven.", "error");
    return;
  }

  try {
    await request(`/api/reservations/${resize.reservation.id}`, {
      method: "PUT",
      body: JSON.stringify({
        deviceId: resize.reservation.deviceId,
        start: start.toISOString(),
        end: end.toISOString(),
        projectId: resize.reservation.projectId || "",
        note: resize.reservation.note || ""
      })
    });
    await loadReservations();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function updateReservationResizeTarget(event) {
  if (!state.resizingReservation) {
    return;
  }
  const targetCells = document.querySelectorAll(`.week-cell[data-device-id="${state.resizingReservation.reservation.deviceId}"]`);
  const cell = [...targetCells].find((candidate) => {
    const bounds = candidate.getBoundingClientRect();
    return event.clientX >= bounds.left && event.clientX < bounds.right && event.clientY >= bounds.top && event.clientY < bounds.bottom;
  });
  if (cell && cell.dataset.deviceId === state.resizingReservation.reservation.deviceId) {
    state.resizingReservation.targetDate = cell.dataset.date;
    document.querySelectorAll(".week-cell.resize-target").forEach((item) => item.classList.remove("resize-target"));
    cell.classList.add("resize-target");
  }
}

async function loadMeta() {
  const data = await request("/api/meta");
  state.users = data.users || [];
  state.devices = data.devices;
  state.currentUser = data.currentUser;
  if (elements.deviceSelect) {
    fillSelect(elements.deviceSelect, data.devices, "Kies device");
  }
  renderCurrentUser();
}

async function syncAzurePhotosForAdmin() {
  if (!state.currentUser?.isAdmin || !state.auth0Config?.photoSyncConfigured) {
    return;
  }

  const syncKey = `azure-photo-sync:${window.location.origin}`;
  if (sessionStorage.getItem(syncKey) === "done") {
    return;
  }

  try {
    const result = await request("/api/users/sync-photos", { method: "POST" });
    sessionStorage.setItem(syncKey, "done");
    if (result.updatedCount > 0) {
      await loadMeta();
    }
  } catch (error) {
    console.warn("Azure-profielfoto's konden niet automatisch worden gesynchroniseerd:", error.message);
  }
}

async function loadProjects() {
  state.projects = await request("/api/projects");
  renderProjectOptions();
}

async function syncAuthenticatedProfile() {
  if (!state.auth0User) {
    return;
  }

  await request("/api/auth/profile", {
    method: "POST",
    body: JSON.stringify({
      name: state.auth0User.name,
      nickname: state.auth0User.nickname,
      email: state.auth0User.email,
      preferred_username: state.auth0User.preferred_username,
      picture: state.auth0User.picture
    })
  });
}

async function loadReservations() {
  const reservations = await request("/api/reservations");
  state.reservations = reservations;
  renderPageData();
  renderPlanner();
}

function initializeWeek() {
  state.weekStart = getWeekStart(new Date());
}

elements.loginButton.addEventListener("click", () => {
  void loginWithAuth0();
});

elements.newProjectSearchInput.addEventListener("input", () => {
  syncProjectCombobox(elements.newProjectSearchInput, elements.projectSelect);
  updateNewProjectVisibility();
  renderProjectOptionList(elements.newProjectSearchInput, elements.projectOptions, elements.projectSelect, updateNewProjectVisibility);
});

elements.newProjectSearchInput.addEventListener("focus", (event) => {
  event.target.value = "";
  elements.projectSelect.value = "";
  updateNewProjectVisibility();
  renderProjectOptionList(elements.newProjectSearchInput, elements.projectOptions, elements.projectSelect, updateNewProjectVisibility);
});

elements.editProjectSearch.addEventListener("input", () => {
  syncProjectCombobox(elements.editProjectSearch, elements.editProjectSelect);
  renderProjectOptionList(elements.editProjectSearch, elements.editProjectOptions, elements.editProjectSelect);
});

elements.editProjectSearch.addEventListener("focus", (event) => {
  event.target.value = "";
  elements.editProjectSelect.value = "";
  renderProjectOptionList(elements.editProjectSearch, elements.editProjectOptions, elements.editProjectSelect);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".project-combobox")) {
    document.querySelectorAll(".project-options").forEach((list) => {
      list.hidden = true;
    });
  }
});


elements.projectSelect.addEventListener("change", () => {
  updateNewProjectVisibility();
  if (elements.projectSelect.value === "__new_project__") {
    elements.newProjectName.focus();
  }
});

elements.projectCancelButton.addEventListener("click", () => {
  closeProjectDialog();
});

elements.logoutButton.addEventListener("click", () => {
  void logoutFromAuth0();
});

elements.projectSearchInput.addEventListener("input", () => {
  renderProjectsPage();
});

async function handleProjectSubmit() {
  elements.projectMessage.textContent = "";
  elements.projectMessage.className = "form-message";
  elements.projectSubmitButton.disabled = true;
  elements.projectSubmitButton.textContent = "Opslaan...";

  try {
    let projectId = elements.projectSelect.value;
    const newProjectName = elements.newProjectName.value.trim();
    if (projectId === "__new_project__") {
      if (!newProjectName) {
        throw new Error("Geef een SC-projectnummer op.");
      }
      const project = await request("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: newProjectName, projectName: elements.newProjectTitle.value.trim() })
      });
      state.projects = [...state.projects, project].sort((first, second) => compareProjectLabels(first.name, second.name));
      renderProjectOptions();
      projectId = project.id;
    }

    if (!projectId) {
      elements.projectMessage.textContent = "Kies een bestaand project of maak een nieuw SC-project aan.";
      elements.projectMessage.className = "form-message error";
      return;
    }

    await submitPlannerReservation(projectId);
  } catch (error) {
    elements.projectMessage.textContent = error.message;
    elements.projectMessage.className = "form-message error";
  } finally {
    elements.projectSubmitButton.disabled = false;
    elements.projectSubmitButton.textContent = "Reservatie aanmaken";
  }
}

elements.projectSubmitButton.addEventListener("click", () => {
  void handleProjectSubmit();
});

elements.editCancelButton.addEventListener("click", () => {
  closeEditDialog();
});

elements.editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveEditedReservation();
});

elements.editDeleteButton.addEventListener("click", async () => {
  if (state.editingReservation && await deleteReservation(state.editingReservation)) {
    closeEditDialog();
  }
});

elements.resourceCancelButton.addEventListener("click", () => {
  closeResourceDialog();
});

elements.resourceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveResource();
});

elements.userCancelButton.addEventListener("click", () => {
  closeUserDialog();
});

elements.userForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveUser();
});

elements.userRemoveButton.addEventListener("click", async () => {
  if (state.editingUser) {
    await removeUser(state.editingUser);
    closeUserDialog();
  }
});

elements.inviteUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.inviteUserMessage.textContent = "";
  try {
    await request("/api/users/invitations", {
      method: "POST",
      body: JSON.stringify({ email: elements.inviteUserEmail.value.trim() })
    });
    elements.inviteUserMessage.textContent = "Uitnodiging geregistreerd. De gebruiker kan aanmelden met Microsoft Entra ID.";
    elements.inviteUserMessage.className = "form-message success";
    elements.inviteUserForm.reset();
  } catch (error) {
    elements.inviteUserMessage.textContent = error.message;
    elements.inviteUserMessage.className = "form-message error";
  }
});

elements.syncPhotosButton.addEventListener("click", async () => {
  elements.syncPhotosButton.disabled = true;
  elements.syncPhotosMessage.textContent = "Synchroniseren...";
  elements.syncPhotosMessage.className = "form-message";
  try {
    const result = await request("/api/users/sync-photos", { method: "POST" });
    elements.syncPhotosMessage.textContent = `${result.updatedCount} van ${result.totalUsers} profielfoto's bijgewerkt.`;
    elements.syncPhotosMessage.className = "form-message success";
    await loadMeta();
    renderPeoplePage();
  } catch (error) {
    elements.syncPhotosMessage.textContent = error.message;
    elements.syncPhotosMessage.className = "form-message error";
  } finally {
    elements.syncPhotosButton.disabled = false;
  }
});

async function syncGrippProjects(silent = false) {
  if (!silent) {
    elements.syncGrippButton.disabled = true;
    elements.syncGrippMessage.textContent = "Synchroniseren met Gripp...";
    elements.syncGrippMessage.className = "form-message";
  }
  try {
    const result = await request("/api/projects/sync-gripp", { method: "POST", body: JSON.stringify({ force: !silent }) });
    if (!silent) {
      elements.syncGrippMessage.textContent = `${result.createdCount} nieuwe, ${result.updatedCount} bijgewerkte en ${result.removedCount || 0} ongebruikte lokale projecten verwijderd (van ${result.totalGrippProjects} lopende Gripp-records, ${result.skippedCount} lege records overgeslagen).`;
      elements.syncGrippMessage.className = "form-message success";
    }
    await loadProjects();
    renderProjectsPage();
  } catch (error) {
    if (!silent) {
      elements.syncGrippMessage.textContent = error.message;
      elements.syncGrippMessage.className = "form-message error";
    } else {
      console.warn("Automatische Gripp-synchronisatie mislukt:", error.message);
    }
  } finally {
    if (!silent) {
      elements.syncGrippButton.disabled = false;
    }
  }
}

elements.syncGrippButton.addEventListener("click", () => {
  void syncGrippProjects();
});

elements.prevWeekButton.addEventListener("click", () => {
  state.weekStart = addDays(state.weekStart, -NAVIGATION_STEP_DAYS);
  renderPlanner();
});

elements.myReservationsButton.addEventListener("click", () => {
  state.myReservationsOnly = !state.myReservationsOnly;
  renderPlanner();
});

elements.reportYear.addEventListener("change", () => {
  renderReportsPage();
});

elements.todayWeekButton.addEventListener("click", () => {
  state.weekStart = getWeekStart(new Date());
  renderPlanner();
});

elements.nextWeekButton.addEventListener("click", () => {
  state.weekStart = addDays(state.weekStart, NAVIGATION_STEP_DAYS);
  renderPlanner();
});

document.addEventListener("mouseup", () => {
  void finishPlannerSelection();
});

document.addEventListener("pointermove", updateReservationResizeTarget);
document.addEventListener("pointerup", () => {
  void finishReservationResize();
});

document.querySelectorAll("[data-page]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (!state.currentUser) {
      return;
    }
    const page = link.dataset.page;
    window.history.replaceState({}, "", `#${page}`);
    setPage(page, true);
  });
});

document.querySelectorAll("[data-section-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const selectedTab = tab.dataset.sectionTab;
    document.querySelectorAll("[data-section-tab]").forEach((item) => {
      item.classList.toggle("active", item === tab);
      item.setAttribute("aria-selected", String(item === tab));
    });
    document.querySelectorAll("[data-section-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.sectionPanel !== selectedTab;
    });
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) {
      return;
    }
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  });
});

async function start() {
  initializeDateRangePicker();
  initializeWeek();
  const initialPage = window.location.hash.slice(1);
  if (initialPage) {
    state.currentPage = initialPage;
  }

  try {
    const authenticated = await initializeLocalSession();
    setAuthenticatedView(authenticated);

    if (!authenticated) {
      return;
    }

    await syncAuthenticatedProfile();
    await loadMeta();
    await syncAzurePhotosForAdmin();
    if (state.currentUser?.isAdmin && state.auth0Config?.grippSyncConfigured) {
      await syncGrippProjects(true);
    }
    await loadProjects();
    await loadReservations();
    state.scheduleRefreshTimer = window.setInterval(() => {
      void refreshScheduleData();
    }, 30000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        void refreshScheduleData();
      }
    });
  } catch (error) {
    setAuthenticatedView(false);
    showLoginMessage(error.message, "error");
  }
}

start();

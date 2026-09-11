const WEEK_DAY_COUNT = 28;
const DAY_NAMES = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const PROJECT_COLOR_PRESETS = [
  "#f3b6b6", "#f6c4a3", "#f5d79b", "#e8e49f", "#c9df9c", "#a9d8ad",
  "#9ed9c7", "#a9dede", "#add5ee", "#b7c9ed", "#c5bceb", "#d4b9e5",
  "#e5b9d4", "#efb8c1", "#f7cbd0", "#f8d6be", "#f7e0b4", "#e4e5b1",
  "#d2e8b7", "#bfe4c0", "#b7e3d9", "#bce6e6", "#c4e1f1", "#cbd8f0",
  "#d5ccef", "#e2cbed", "#edc9e0", "#e9b5b5", "#f2c7ad", "#ecd49f",
  "#d8d49f", "#b9d2a5", "#a8cdb7", "#a9cdd0", "#b5cee2", "#c1c5df"
];

const elements = {
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
  projectSelect: document.getElementById("project-select"),
  newProjectName: document.getElementById("new-project-name"),
  newProjectColor: document.getElementById("new-project-color"),
  newProjectPalette: document.getElementById("new-project-palette"),
  createProjectButton: document.getElementById("create-project-btn"),
  projectCancelButton: document.getElementById("project-cancel-btn"),
  projectSubmitButton: document.getElementById("project-submit-btn"),
  projectMessage: document.getElementById("project-message"),
  editDialog: document.getElementById("edit-dialog"),
  editForm: document.getElementById("edit-form"),
  editDeviceSelect: document.getElementById("edit-device-select"),
  editStart: document.getElementById("edit-start"),
  editEnd: document.getElementById("edit-end"),
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
  resourceDialog: document.getElementById("resource-dialog"),
  resourceForm: document.getElementById("resource-form"),
  resourceDialogName: document.getElementById("resource-dialog-name"),
  resourcePhotoFile: document.getElementById("resource-photo-file"),
  resourceStatusSelect: document.getElementById("resource-status-select"),
  resourceMessage: document.getElementById("resource-message"),
  resourceCancelButton: document.getElementById("resource-cancel-btn"),
  resourceRemoveButton: document.getElementById("resource-remove-btn"),
  resourceSaveButton: document.getElementById("resource-save-btn"),
  projectList: document.getElementById("project-list"),
  reportSummary: document.getElementById("report-summary"),
  reportList: document.getElementById("report-list"),
  loginButton: document.getElementById("login-btn"),
  loginMessage: document.getElementById("login-message"),
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
  nextWeekButton: document.getElementById("next-week-btn"),
  weekLabel: document.getElementById("week-label"),
  weekAxis: document.getElementById("week-axis"),
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
  scheduleRefreshTimer: null,
  scheduleRefreshInFlight: false,
  dateRangePicker: null,
  selectedRange: null,
  auth0Config: null,
  auth0Client: null,
  auth0User: null,
  accessToken: "",
  currentPage: "dashboard"
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
  elements.dashboardPanel.hidden = !isAuthenticated;
  elements.plannerPanel.hidden = !isAuthenticated;
  setPage(state.currentPage, isAuthenticated);
}

function setPage(page, isAuthenticated = Boolean(state.currentUser)) {
  const validPages = ["dashboard", "schedule", "timesheets", "people", "projects", "reports", "help"];
  state.currentPage = validPages.includes(page) ? page : "dashboard";

  document.querySelectorAll("[data-view]").forEach((panel) => {
    const views = panel.dataset.view.split(",");
    panel.hidden = !isAuthenticated || !views.includes(state.currentPage);
  });

  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === state.currentPage);
  });

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
  elements.peopleList.innerHTML = "";
  state.users.forEach((user) => {
    elements.peopleList.appendChild(createDataRow(user.name, user.email || "Google Workspace-gebruiker", user.isAdmin ? "Admin" : "Gebruiker"));
  });
  elements.resourceList.innerHTML = "";
  state.devices.forEach((device) => {
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

function renderColorPalette(container, selectedColor, onSelect) {
  container.innerHTML = "";
  PROJECT_COLOR_PRESETS.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.title = color;
    swatch.setAttribute("aria-label", `Kies kleur ${color}`);
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
  elements.projectList.innerHTML = "";
  if (!state.projects.length) {
    const empty = document.createElement("p");
    empty.className = "dashboard-empty";
    empty.textContent = "Nog geen SC-projecten aangemaakt.";
    elements.projectList.appendChild(empty);
    return;
  }

  state.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = "<span>PROJECT</span><h3></h3><p></p><div class=\"project-color-row\"><div class=\"color-picker\"><button class=\"color-preview\" type=\"button\" aria-label=\"Open projectkleuren\"></button><div class=\"color-palette\" aria-label=\"Kies een projectkleur\" hidden></div></div><button class=\"ghost\" type=\"button\">Kleur opslaan</button></div>";
    card.querySelector("h3").textContent = project.name;
    const reservationCount = state.reservations.filter((reservation) => reservation.projectId === project.id).length;
    card.querySelector("p").textContent = `${reservationCount} reservaties`;
    let selectedColor = project.color || PROJECT_COLOR_PRESETS[0];
    const saveButton = card.querySelector(".project-color-row > .ghost");
    const palette = card.querySelector(".color-palette");
    const preview = card.querySelector(".color-preview");
    preview.style.backgroundColor = selectedColor;
    preview.addEventListener("click", () => {
      palette.hidden = !palette.hidden;
    });
    renderColorPalette(palette, selectedColor, (color) => {
      selectedColor = color;
      preview.style.backgroundColor = color;
      palette.hidden = true;
    });
    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      try {
        const updatedProject = await request(`/api/projects/${project.id}`, {
          method: "PUT",
          body: JSON.stringify({ color: selectedColor })
        });
        project.color = updatedProject.color;
        await loadReservations();
      } catch (error) {
        alert(error.message);
      } finally {
        saveButton.disabled = false;
      }
    });
    elements.projectList.appendChild(card);
  });
}

function renderReportsPage() {
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
  state.devices.forEach((device) => {
    const count = state.reservations.filter((reservation) => reservation.deviceId === device.id).length;
    elements.reportList.appendChild(createDataRow(device.name, device.type || "Device", `${count} reservaties`));
  });
}

function renderPageData() {
  if (!state.currentUser) {
    return;
  }
  renderDashboard();
  renderTimesheetsPage();
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
  return toStartOfDay(date).toISOString().slice(0, 10);
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

async function initializeAuth0() {
  state.auth0Config = await loadAuthConfig();
  if (!state.auth0Config.enabled) {
    showLoginMessage("Auth0 is nog niet geconfigureerd. Vul eerst de .env in op de server.", "error");
    return false;
  }

  state.auth0Client = await window.auth0.createAuth0Client({
    domain: state.auth0Config.domain,
    clientId: state.auth0Config.clientId,
    authorizationParams: {
      audience: state.auth0Config.audience,
      ...(state.auth0Config.connection ? { connection: state.auth0Config.connection } : {}),
      redirect_uri: window.location.origin
    },
    cacheLocation: "memory"
  });

  const params = new URLSearchParams(window.location.search);
  if (params.has("code") && params.has("state")) {
    await state.auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const isAuthenticated = await state.auth0Client.isAuthenticated();
  if (!isAuthenticated) {
    return false;
  }

  state.accessToken = await state.auth0Client.getTokenSilently({
    authorizationParams: {
      audience: state.auth0Config.audience
    }
  });
  state.auth0User = await state.auth0Client.getUser();

  return true;
}

async function loginWithAuth0(screenHint) {
  try {
    if (!state.auth0Client) {
      const ok = await initializeAuth0();
      if (!ok && !state.auth0Client) {
        showLoginMessage("Kon Auth0 niet laden. Controleer de server en .env.", "error");
        return;
      }
    }

    const authorizationParams = {
      audience: state.auth0Config.audience,
      ...(state.auth0Config.connection ? { connection: state.auth0Config.connection } : {}),
      redirect_uri: window.location.origin
    };

    if (screenHint) {
      authorizationParams.screen_hint = screenHint;
    }

    await state.auth0Client.loginWithRedirect({ authorizationParams });
  } catch (err) {
    showLoginMessage("Auth0 fout: " + err.message, "error");
  }
}

async function logoutFromAuth0() {
  if (!state.auth0Client) {
    return;
  }

  state.auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });
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
    sidebarAvatar.textContent = userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    sidebarAvatar.style.backgroundImage = "";
    if (state.currentUser?.picture) {
      sidebarAvatar.textContent = "";
      sidebarAvatar.style.backgroundImage = `url("${state.currentUser.picture}")`;
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
  state.devices.forEach((device) => {
    const option = document.createElement("option");
    option.value = device.id;
    option.textContent = `${device.name} (${device.type})`;
    option.selected = device.id === reservation.deviceId;
    elements.editDeviceSelect.appendChild(option);
  });

  elements.editProjectSelect.innerHTML = "";
  const noProject = document.createElement("option");
  noProject.value = "";
  noProject.textContent = "Geen project";
  elements.editProjectSelect.appendChild(noProject);
  state.projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    option.selected = project.id === reservation.projectId;
    elements.editProjectSelect.appendChild(option);
  });

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
        note: elements.editNote.value.trim()
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
    time.textContent = `${formatDateTime(reservation.start)} - ${formatDateTime(reservation.end)}`;
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
  elements.projectSelect.innerHTML = "";
  if (!state.projects.length) {
    const emptyOption = document.createElement("option");
    emptyOption.textContent = "Nog geen SC-projecten - maak er hieronder een aan";
    emptyOption.disabled = true;
    emptyOption.selected = true;
    elements.projectSelect.appendChild(emptyOption);
    return;
  }

  state.projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    elements.projectSelect.appendChild(option);
  });
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
  elements.newProjectColor.value = PROJECT_COLOR_PRESETS[0];
  renderColorPalette(elements.newProjectPalette, elements.newProjectColor.value, (color) => {
    elements.newProjectColor.value = color;
  });
  renderProjectOptions();
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
  elements.deviceRows.innerHTML = "";
  const weekDays = getWeekDays();
  const weekStart = state.weekStart;
  const weekEndExclusive = getWeekEndExclusive();

  elements.weekAxis.innerHTML = "";
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
    day.textContent = `${DAY_NAMES[index % DAY_NAMES.length]} ${formatDateLabel(dayDate)}`;
    elements.weekAxis.appendChild(day);
  });

  updateWeekLabel();

  const reservationMap = new Map(state.reservations.map((reservation) => [reservation.id, reservation]));

  state.devices.forEach((device) => {
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

      const reservationItems = state.reservations
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

      if (!reservationItems.length) {
        const empty = document.createElement("span");
        empty.className = "cell-empty";
        empty.textContent = "-";
        cell.appendChild(empty);
      }

      reservationItems.forEach((reservation) => {
        const block = document.createElement("div");
        block.className = "reservation-block";
        if (reservation.projectColor) {
          block.style.background = reservation.projectColor;
          block.style.borderLeft = `4px solid ${reservation.projectColor}`;
        }
        const canManageReservation = state.currentUser?.isAdmin || reservation.memberId === state.currentUser?.id;
        let wasDragged = false;
        block.draggable = canManageReservation;
        block.dataset.reservationId = reservation.id;
        block.addEventListener("mousedown", (event) => event.stopPropagation());
        block.addEventListener("click", () => {
          if (canManageReservation && !wasDragged) {
            openEditDialog(reservation);
          }
        });

        const project = document.createElement("strong");
        project.className = "reservation-project";
        project.textContent = reservation.projectName || "Zonder project";

        const member = document.createElement("small");
        member.className = "reservation-member-label";
        member.textContent = reservation.memberName || findMemberName(reservation.memberId);

        const timing = document.createElement("small");
        timing.textContent = `${new Date(reservation.start).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })} - ${new Date(reservation.end).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}`;

        block.appendChild(project);
        block.appendChild(member);
        block.appendChild(timing);

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
        note: reservation.note || ""
      })
    });

    showMessage("Reservatie verplaatst via drag-and-drop.", "success");
    await loadReservations();
  } catch (error) {
    showMessage(error.message, "error");
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

elements.logoutButton.addEventListener("click", () => {
  void logoutFromAuth0();
});

elements.projectCancelButton.addEventListener("click", () => {
  closeProjectDialog();
});

elements.createProjectButton.addEventListener("click", () => {
  elements.newProjectName.focus();
});

async function handleProjectSubmit() {
  elements.projectMessage.textContent = "";
  elements.projectMessage.className = "form-message";
  elements.projectSubmitButton.disabled = true;
  elements.projectSubmitButton.textContent = "Opslaan...";

  try {
    let projectId = elements.projectSelect.value;
    const newProjectName = elements.newProjectName.value.trim();
    if (newProjectName) {
      const project = await request("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: newProjectName, color: elements.newProjectColor.value })
      });
      state.projects = [...state.projects, project].sort((first, second) => first.name.localeCompare(second.name));
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

elements.prevWeekButton.addEventListener("click", () => {
  state.weekStart = addDays(state.weekStart, -WEEK_DAY_COUNT);
  renderPlanner();
});

elements.todayWeekButton.addEventListener("click", () => {
  state.weekStart = getWeekStart(new Date());
  renderPlanner();
});

elements.nextWeekButton.addEventListener("click", () => {
  state.weekStart = addDays(state.weekStart, WEEK_DAY_COUNT);
  renderPlanner();
});

document.addEventListener("mouseup", () => {
  void finishPlannerSelection();
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

async function start() {
  initializeDateRangePicker();
  initializeWeek();
  const initialPage = window.location.hash.slice(1);
  if (initialPage) {
    state.currentPage = initialPage;
  }

  try {
    const authenticated = await initializeAuth0();
    setAuthenticatedView(authenticated);

    if (!authenticated) {
      return;
    }

    await syncAuthenticatedProfile();
    await loadMeta();
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

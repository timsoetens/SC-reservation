const WEEK_DAY_COUNT = 7;
const DAY_NAMES = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

const elements = {
  authPanel: document.getElementById("auth-panel"),
  sessionPanel: document.getElementById("session-panel"),
  formPanel: document.getElementById("form-panel"),
  listPanel: document.getElementById("list-panel"),
  plannerPanel: document.getElementById("planner-panel"),
  loginButton: document.getElementById("login-btn"),
  loginMessage: document.getElementById("login-message"),
  currentUserLabel: document.getElementById("current-user-label"),
  currentUserRole: document.getElementById("current-user-role"),
  logoutButton: document.getElementById("logout-btn"),
  deviceSelect: document.getElementById("deviceId"),
  dateRangeInput: document.getElementById("date-range"),
  noteInput: document.getElementById("note"),
  form: document.getElementById("reservation-form"),
  message: document.getElementById("form-message"),
  list: document.getElementById("reservations"),
  refreshButton: document.getElementById("refresh-btn"),
  template: document.getElementById("reservation-item-template"),
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
  currentUser: null,
  weekStart: null,
  dragReservationId: null,
  dateRangePicker: null,
  selectedRange: null,
  auth0Config: null,
  auth0Client: null,
  accessToken: ""
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
  elements.message.textContent = text;
  elements.message.className = `form-message ${type}`;
}

function showLoginMessage(text, type) {
  elements.loginMessage.textContent = text;
  elements.loginMessage.className = `form-message ${type}`;
}

function setAuthenticatedView(isAuthenticated) {
  elements.authPanel.hidden = isAuthenticated;
  elements.sessionPanel.hidden = !isAuthenticated;
  elements.formPanel.hidden = !isAuthenticated;
  elements.listPanel.hidden = !isAuthenticated;
  elements.plannerPanel.hidden = !isAuthenticated;
}

function findMemberName(memberId) {
  return state.users.find((user) => user.id === memberId)?.name || memberId;
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
  elements.currentUserLabel.textContent = state.currentUser?.name || "";
  elements.currentUserRole.textContent = state.currentUser?.isAdmin ? "Admin" : "Gebruiker";
  elements.currentUserRole.className = `role-badge ${state.currentUser?.isAdmin ? "admin" : "user"}`;
}

function renderReservations(reservations) {
  elements.list.innerHTML = "";

  if (!reservations.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nog geen reservaties ingepland.";
    elements.list.appendChild(empty);
    return;
  }

  reservations.forEach((reservation) => {
    const node = elements.template.content.cloneNode(true);
    node.querySelector(".reservation-device").textContent = reservation.deviceName;
    node.querySelector(".reservation-member").textContent = `Door: ${reservation.memberName || findMemberName(reservation.memberId)}`;
    node.querySelector(".reservation-time").textContent = `${formatDateTime(reservation.start)} -> ${formatDateTime(reservation.end)}`;
    node.querySelector(".reservation-note").textContent = reservation.note ? `Notitie: ${reservation.note}` : "";

    const deleteBtn = node.querySelector(".delete-btn");
    const canManageReservation = state.currentUser?.isAdmin || reservation.memberId === state.currentUser?.id;
    if (!canManageReservation) {
      deleteBtn.hidden = true;
    } else {
      deleteBtn.addEventListener("click", async () => {
        try {
          await request(`/api/reservations/${reservation.id}`, { method: "DELETE" });
          await loadReservations();
        } catch (error) {
          alert(error.message);
        }
      });
    }

    elements.list.appendChild(node);
  });
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
    day.textContent = `${DAY_NAMES[index]} ${formatDateLabel(dayDate)}`;
    elements.weekAxis.appendChild(day);
  });

  updateWeekLabel();

  const reservationMap = new Map(state.reservations.map((reservation) => [reservation.id, reservation]));

  state.devices.forEach((device) => {
    const node = elements.deviceRowTemplate.content.cloneNode(true);
    const row = node.querySelector(".device-row");
    const weekGrid = node.querySelector(".device-week-grid");

    row.querySelector(".device-name").textContent = device.name;
    row.querySelector(".device-type").textContent = device.type;

    weekDays.forEach((dayDate) => {
      const cell = document.createElement("div");
      cell.className = "week-cell";
      cell.dataset.deviceId = device.id;
      cell.dataset.date = getDateKey(dayDate);

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

      cell.addEventListener("dblclick", () => {
        void quickCreateReservation(cell.dataset.deviceId, cell.dataset.date);
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
          return reservationStart >= weekStart && reservationStart < weekEndExclusive;
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
        const canManageReservation = state.currentUser?.isAdmin || reservation.memberId === state.currentUser?.id;
        block.draggable = canManageReservation;
        block.dataset.reservationId = reservation.id;

        const member = document.createElement("strong");
        member.textContent = reservation.memberName || findMemberName(reservation.memberId);

        const timing = document.createElement("small");
        timing.textContent = `${new Date(reservation.start).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })} - ${new Date(reservation.end).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}`;

        block.appendChild(member);
        block.appendChild(timing);

        if (canManageReservation) {
          block.addEventListener("dragstart", (event) => {
            state.dragReservationId = reservation.id;
            block.classList.add("is-dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", reservation.id);
          });

          block.addEventListener("dragend", () => {
            state.dragReservationId = null;
            block.classList.remove("is-dragging");
            document.querySelectorAll(".week-cell.drag-over").forEach((nodeItem) => nodeItem.classList.remove("drag-over"));
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
        note: elements.noteInput.value.trim()
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
  fillSelect(elements.deviceSelect, data.devices, "Kies device");
  renderCurrentUser();
}

async function loadReservations() {
  const reservations = await request("/api/reservations");
  state.reservations = reservations;
  renderReservations(reservations);
  renderPlanner();
}

function initializeWeek() {
  state.weekStart = getWeekStart(new Date());
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("", "");

  if (!state.currentUser) {
    showMessage("Log eerst in om een reservatie te maken.", "error");
    return;
  }

  if (!state.selectedRange || !state.selectedRange.start || !state.selectedRange.end) {
    showMessage("Selecteer start en einde in de kalender.", "error");
    return;
  }

  const payload = {
    deviceId: elements.deviceSelect.value,
    start: new Date(state.selectedRange.start).toISOString(),
    end: new Date(state.selectedRange.end).toISOString(),
    note: elements.noteInput.value.trim()
  };

  try {
    await request("/api/reservations", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    elements.noteInput.value = "";
    const nextDefaults = getDefaultRange(new Date(state.selectedRange.start));
    applyRangeSelection(nextDefaults.start, nextDefaults.end);
    showMessage("Reservatie aangemaakt.", "success");
    await loadReservations();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

elements.refreshButton.addEventListener("click", loadReservations);

elements.loginButton.addEventListener("click", () => {
  void loginWithAuth0();
});

elements.logoutButton.addEventListener("click", () => {
  void logoutFromAuth0();
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

async function start() {
  initializeDateRangePicker();
  initializeWeek();

  try {
    const authenticated = await initializeAuth0();
    setAuthenticatedView(authenticated);

    if (!authenticated) {
      showLoginMessage("Meld je aan via Auth0 om reservaties te beheren.", "");
      return;
    }

    await loadMeta();
    await loadReservations();
  } catch (error) {
    setAuthenticatedView(false);
    showLoginMessage(error.message, "error");
  }
}

start();

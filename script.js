// ------------- DATA -------------
var cats = ["All", "Technical", "Cultural", "Literary", "Gaming", "Workshops"];

var events = [
  { id: 1, name: "RoboWars", cat: "Technical", day: 1, time: "10:00 AM", stage: "Main Arena", speaker: "Dr. Rao" },
  { id: 2, name: "HackSprint", cat: "Technical", day: 1, time: "11:00 AM", stage: "Lab 2", speaker: "Prof. Mehta" },
  { id: 3, name: "Battle of Bands", cat: "Cultural", day: 1, time: "05:00 PM", stage: "Open Stage", speaker: "Music Club" },
  { id: 4, name: "Poetry Slam", cat: "Literary", day: 2, time: "10:00 AM", stage: "Seminar Hall", speaker: "Lit Society" },
  { id: 5, name: "CodeGolf", cat: "Technical", day: 2, time: "12:00 PM", stage: "Lab 1", speaker: "Code Club" },
  { id: 6, name: "Valorant Cup", cat: "Gaming", day: 2, time: "02:00 PM", stage: "Gaming Zone", speaker: "Esports Guild" },
  { id: 7, name: "Web Dev Workshop", cat: "Workshops", day: 1, time: "02:00 PM", stage: "Lab 3", speaker: "Ananya Verma" },
  { id: 8, name: "Dance Off", cat: "Cultural", day: 2, time: "04:30 PM", stage: "Open Stage", speaker: "Dance Crew" }
];

var defaultPosts = [
  { title: "RoboWars Qualifier Update", body: "Teams must report at Main Arena 30 minutes before 10:00 AM." },
  { title: "HackSprint Lab Shift", body: "HackSprint coding session is scheduled in Lab 2." },
  { title: "HelpDesk & Check-In", body: "Keep your FF-XXXX ticket code ready for quick volunteer check-in." }
];

var announcements = JSON.parse(localStorage.getItem("ffTickerAnnouncements") || "null") || [
  "Welcome to TechnoVaganza 2026!",
  "HackSprint venue changed to Lab 2",
  "Food court opens at 12 PM",
  "Registration closes one day before kickoff"
];

var posts = JSON.parse(localStorage.getItem("ffPosts") || "null") || defaultPosts;
var kickoff = new Date("2026-12-20T09:00:00");
var currentCat = "All";
var tickets = JSON.parse(localStorage.getItem("ffTickets") || "[]");
var currentUser = JSON.parse(localStorage.getItem("ffUser") || "null");

// ------------- HELPERS -------------
function saveTickets() {
  localStorage.setItem("ffTickets", JSON.stringify(tickets));
}

function savePosts() {
  localStorage.setItem("ffPosts", JSON.stringify(posts));
  localStorage.setItem("ffTickerAnnouncements", JSON.stringify(announcements));
}

function pad(n) { return n < 10 ? "0" + n : n; }

function esc(s) {
  return String(s).replace(/[&<>]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; });
}

function findEvent(id) {
  for (var i = 0; i < events.length; i++) {
    if (events[i].id == id) return events[i];
  }
}

function hashText(text) {
  var h = 5381;
  for (var i = 0; i < text.length; i++) {
    h = ((h << 5) + h) + text.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16).toUpperCase();
}

// ------------- LOGIN & VIEW TOGGLE -------------
function updateViewState() {
  var loginSection = document.getElementById("login");
  var headerRight = document.getElementById("headerRight");
  var info = document.getElementById("userInfoText");
  var status = document.getElementById("loginStatus");
  var portal = document.getElementById("portalContent");

  if (currentUser) {
    if (loginSection) loginSection.style.display = "none";
    if (headerRight) headerRight.style.display = "flex";
    if (portal) portal.style.display = "block";
    if (info) {
      info.textContent = currentUser.name + " (" + currentUser.rollno + ")";
    }

    var regName = document.getElementById("name");
    var regEmail = document.getElementById("email");
    if (regName && regName.value === "") regName.value = currentUser.name;
    if (regEmail && regEmail.value === "") regEmail.value = currentUser.email;
  } else {
    if (loginSection) loginSection.style.display = "block";
    if (headerRight) headerRight.style.display = "none";
    if (portal) portal.style.display = "none";
    if (status) {
      status.className = "";
      status.textContent = "Enter your Name, Roll No, and Email to continue";
    }
  }
}

function studentLogin(event) {
  if (event) event.preventDefault();
  var name = document.getElementById("loginName").value.trim();
  var rollno = document.getElementById("loginRoll").value.trim().toUpperCase();
  var email = document.getElementById("loginEmail").value.trim();
  var status = document.getElementById("loginStatus");

  if (name === "" || rollno === "" || email === "" || email.indexOf("@") == -1) {
    if (status) {
      status.className = "bad";
      status.textContent = "Please enter valid Name, Roll No, and Email.";
    }
    return;
  }

  currentUser = { name: name, rollno: rollno, email: email };
  localStorage.setItem("ffUser", JSON.stringify(currentUser));
  updateViewState();
}

function studentLogout() {
  localStorage.removeItem("ffUser");
  currentUser = null;
  document.getElementById("loginName").value = "";
  document.getElementById("loginRoll").value = "";
  document.getElementById("loginEmail").value = "";
  updateViewState();
}

// ------------- TICKER & POST ANNOUNCEMENTS -------------
function renderTicker() {
  document.getElementById("tickerText").textContent = announcements.join("  |  ");
}

function postAnnouncement() {
  var title = document.getElementById("annTitle").value.trim();
  var body = document.getElementById("annText").value.trim();
  var msg = document.getElementById("annMsg");

  if (title === "" || body === "") {
    msg.className = "bad";
    msg.textContent = "Please enter both title and announcement message.";
    return;
  }

  posts.unshift({ title: title, body: body });
  announcements.unshift(title + ": " + body);
  savePosts();

  document.getElementById("annTitle").value = "";
  document.getElementById("annText").value = "";
  msg.className = "ok";
  msg.textContent = "Announcement posted!";

  renderTicker();
  renderAnnouncements();
}

function renderAnnouncements() {
  var list = document.getElementById("announcementList");
  list.innerHTML = "";
  for (var i = 0; i < posts.length; i++) {
    list.innerHTML += "<div class='card'><span class='tag'>Announcement</span><h3>" + esc(posts[i].title) + "</h3><p>" + esc(posts[i].body) + "</p></div>";
  }
}

// ------------- COUNTDOWN -------------
function updateCountdown() {
  var diff = kickoff - new Date();
  var box = document.getElementById("countdown");
  if (!box) return;
  if (diff <= 0) { box.textContent = "The fest has started!"; return; }
  var d = Math.floor(diff / 86400000);
  var h = Math.floor((diff % 86400000) / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  var s = Math.floor((diff % 60000) / 1000);
  box.textContent = d + "d " + pad(h) + "h " + pad(m) + "m " + pad(s) + "s";
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ------------- SCHEDULE -------------
function showDay(day) {
  var grid = document.getElementById("scheduleGrid");
  grid.innerHTML = "";
  document.getElementById("dayBtn1").className = day == 1 ? "active" : "";
  document.getElementById("dayBtn2").className = day == 2 ? "active" : "";
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    if (e.day == day) {
      grid.innerHTML += "<div class='card'><h3>" + esc(e.name) + "</h3><p>" + esc(e.time) + " • " + esc(e.stage) + "</p><p>Speaker: " + esc(e.speaker) + "</p><span class='tag'>" + esc(e.cat) + "</span></div>";
    }
  }
}

// ------------- EVENTS + FILTER -------------
function drawTabs() {
  var tabs = document.getElementById("catTabs");
  tabs.innerHTML = "";
  for (var i = 0; i < cats.length; i++) {
    var b = document.createElement("button");
    b.textContent = cats[i];
    b.className = cats[i] == currentCat ? "active" : "";
    b.onclick = (function (c) { return function () { currentCat = c; drawTabs(); renderEvents(); }; })(cats[i]);
    tabs.appendChild(b);
  }
}

function renderEvents() {
  var list = document.getElementById("eventList");
  var text = document.getElementById("search").value.toLowerCase();
  list.innerHTML = "";
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    var catOk = (currentCat == "All" || e.cat == currentCat);
    var textOk = e.name.toLowerCase().indexOf(text) != -1;
    if (catOk && textOk) {
      list.innerHTML += "<div class='card'><h3>" + esc(e.name) + "</h3><span class='tag'>" + esc(e.cat) + "</span><p>Day " + e.day + ", " + esc(e.time) + " • " + esc(e.stage) + "</p><button onclick='pickEvent(" + e.id + ")'>Register</button></div>";
    }
  }
  if (list.innerHTML == "") list.innerHTML = "<p>No events found.</p>";
}

function fillSelect() {
  var sel = document.getElementById("eventSel");
  sel.innerHTML = "";
  for (var i = 0; i < events.length; i++) {
    sel.innerHTML += "<option value='" + events[i].id + "'>" + esc(events[i].name) + "</option>";
  }
}

function pickEvent(id) {
  document.getElementById("eventSel").value = id;
  document.getElementById("register").scrollIntoView();
}

// ------------- REGISTRATION + TICKET -------------
function makeCode() {
  var a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return "FF-" + a[0].toString(36).toUpperCase();
}

function registerTeam() {
  var name = document.getElementById("name").value.trim();
  var email = document.getElementById("email").value.trim();
  var msg = document.getElementById("regMsg");
  if (name == "" || email.indexOf("@") == -1) {
    msg.className = "bad";
    msg.textContent = "Please enter a valid name and email.";
    return;
  }
  var ev = findEvent(document.getElementById("eventSel").value);
  var t = {
    code: makeCode(),
    name: name,
    rollno: currentUser ? currentUser.rollno : "",
    email: email,
    eventName: ev.name,
    team: document.getElementById("team").value,
    checkedIn: false
  };
  tickets.push(t);
  saveTickets();
  msg.className = "ok";
  msg.textContent = "Registered successfully!";
  showTicket(t);
  renderTickets();
}

function showTicket(t) {
  var box = document.getElementById("ticketBox");
  box.innerHTML = "<div class='ticket'><h3>Admission Pass</h3><p><b>" + esc(t.eventName) + "</b></p><p>Name: " + esc(t.name) + (t.rollno ? " (" + esc(t.rollno) + ")" : "") + "</p><p>Team size: " + esc(t.team) + "</p><p>Code: <b>" + esc(t.code) + "</b></p><div id='qrBox'></div></div>";
  if (typeof QRCode !== "undefined") {
    new QRCode(document.getElementById("qrBox"), { text: t.code, width: 130, height: 130 });
  }
}

// ------------- CHECK-IN -------------
function updateCheckInStats() {
  var totalEl = document.getElementById("totalTicketsCount");
  var checkedEl = document.getElementById("checkedInCount");
  var pendingEl = document.getElementById("pendingCount");
  if (!totalEl || !checkedEl || !pendingEl) return;

  var checked = 0;
  for (var i = 0; i < tickets.length; i++) {
    if (tickets[i].checkedIn) checked++;
  }
  totalEl.textContent = tickets.length;
  checkedEl.textContent = checked;
  pendingEl.textContent = tickets.length - checked;
}

function checkIn() {
  var code = document.getElementById("scanCode").value.trim().toUpperCase();
  var msg = document.getElementById("checkMsg");
  for (var i = 0; i < tickets.length; i++) {
    if (tickets[i].code == code) {
      if (tickets[i].checkedIn) {
        msg.className = "bad";
        msg.textContent = "Duplicate! This ticket is already checked in.";
      } else {
        tickets[i].checkedIn = true;
        saveTickets();
        msg.className = "ok";
        msg.textContent = "Checked In: " + tickets[i].name + " (" + tickets[i].eventName + ")";
        renderTickets();
      }
      return;
    }
  }
  msg.className = "bad";
  msg.textContent = "Invalid ticket code!";
}

function renderTickets() {
  var html = "<table><tr><th>Code</th><th>Name</th><th>Event</th><th>Status</th></tr>";
  for (var i = 0; i < tickets.length; i++) {
    var t = tickets[i];
    html += "<tr><td>" + esc(t.code) + "</td><td>" + esc(t.name) + "</td><td>" + esc(t.eventName) + "</td><td>" + (t.checkedIn ? "Checked-In" : "Not yet") + "</td></tr>";
  }
  document.getElementById("ticketTable").innerHTML = html + "</table>";
  updateCheckInStats();
}

// ------------- CERTIFICATE -------------
function drawCertificateTemplate(studentName, eventName, verificationCode) {
  var c = document.getElementById("certCanvas");
  var ctx = c.getContext("2d");
  ctx.fillStyle = "#fffdf5";
  ctx.fillRect(0, 0, 1600, 1130);
  ctx.strokeStyle = "#6d28d9";
  ctx.lineWidth = 18;
  ctx.strokeRect(40, 40, 1520, 1050);
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 5;
  ctx.strokeRect(64, 64, 1472, 1002);
  ctx.fillStyle = "#4c1d95";
  ctx.textAlign = "center";
  ctx.font = "bold 90px Arial";
  ctx.fillText("Certificate of Participation", 800, 260);
  ctx.fillStyle = "#333";
  ctx.font = "44px Arial";
  ctx.fillText("This is to certify that", 800, 400);
  ctx.fillStyle = "#db2777";
  ctx.font = "bold 100px Arial";
  ctx.fillText(studentName, 800, 550);
  ctx.fillStyle = "#333";
  ctx.font = "44px Arial";
  ctx.fillText("participated in " + eventName, 800, 680);
  ctx.fillText("at TechnoVaganza 2026", 800, 750);
  ctx.font = "32px Arial";
  ctx.fillText("Verification: " + verificationCode, 800, 860);
}

function makeCertificate() {
  var code = document.getElementById("certCode").value.trim().toUpperCase();
  var msg = document.getElementById("certMsg");
  var t = null;
  for (var i = 0; i < tickets.length; i++) {
    if (tickets[i].code == code) t = tickets[i];
  }
  if (t == null) { msg.className = "bad"; msg.textContent = "Ticket not found."; return; }
  if (!t.checkedIn) { msg.className = "bad"; msg.textContent = "Check in first to get a certificate."; return; }
  msg.className = "ok";
  msg.textContent = "Certificate ready!";
  drawCertificateTemplate(t.name, t.eventName, hashText(t.code + t.name + t.eventName));
}

function downloadCertificate() {
  var a = document.createElement("a");
  a.href = document.getElementById("certCanvas").toDataURL("image/png");
  a.download = "certificate.png";
  a.click();
}

// ------------- START -------------
updateViewState();
renderTicker();
renderAnnouncements();
drawTabs();
renderEvents();
fillSelect();
showDay(1);
renderTickets();
drawCertificateTemplate("Sample Student", "HackSprint", "TV26-SAMPLE");
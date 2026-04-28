/* ===================================================
   SAAN TakeCare — App Logic (app.js)
   =================================================== */

/* ─── State ─────────────────────────────────────── */
let state = {
  nickname: '',
  wakeTime: '07:00',
  sleepTime: '22:00',
  goal: 8,
  drunk: 0,
  schedule: [],       // array of {time, label, status}
  lastRefill: null,
  streak: 0,
  lastDate: null,
  goalShown: false,
  goalMet: false,
};

/* ─── Love Quotes Pool ───────────────────────────── */
const quotes = [
  '"Olungaa Thanni Kudikalanaa..Veluthuupuduveannnn Paathukeaa!!."',
  '"Thangoooo..Konjam Olungaa Thannnnn Kudii Paappom."',
  '"Ahnn!! Valthukal Valthukal Kannuuuu !!!."',
  '"Come on Chelloooooo, Youuuu cannnnnnn!."',
  '"Itheyyy dhaaa..Apdyeaa Olungaa Thanniii Kudii Paapom."',
  '"Ekkaaaoowww masssss kammikiyeaaaa."',
  '"Avloooo dhaaaaaa...Apdyeaa Olungaa Kudii Paapommm!."',
  '"Enaaa maaa Kannuu Sovukiyamaaa. 🌸"',
  '"Apoo apoo rest room poituu vaangaaaa."',
  '"Endrumm Epodhumm Unakagaaaa. 💖"',
  '"Comeeeee onnnn Babyyyyyy..Comeeeeee."',
  '"Superrrrrr Thangameaaaa!!!. ✨"',
];

/* ─── Toast Messages Pool ────────────────────────── */
const toastMessages = (name) => [
  `Oiii ${name}, I will take care you, Myyy Loveeeeeee. 💖`,
  `${name} Chellooooo!...Superrrrr Chellooooo 🥛`,
  `Timee aagituu chellooooo, ${name} — Poii thannii kudichituu vandhu velaiyea paarungaa! 💧`,
  `${name}, Marakamaaa Thannii kudii Pakadaaaaa! 🌸`,
  `Olungaaa Kudingaaaaa Ennn Chellooooooo, ${name}: ! 💕`,
  `${name}, Thannii Kudichachaaa Ennn Vairameaaaaa! 🤗`,
  `${name}, Pakadaaa apoo apooo rest room poituu vaangaanga ! 🤗`,
];

/* ─── Petal & Heart Generators ───────────────────── */
function spawnPetals() {
  const container = document.getElementById('petalsContainer');
  const colors = ['#FFC0CB', '#FFDAB9', '#E6E6FA', '#E0FFF4', '#ffb3c6'];
  for (let i = 0; i < 18; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const size = Math.random() * 10 + 6;
    petal.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 12}s;
      opacity: ${Math.random() * 0.4 + 0.2};
      border-radius: ${Math.random() > 0.5 ? '0 50% 50% 50%' : '50% 0 50% 50%'};
    `;
    container.appendChild(petal);
  }
}

function spawnHearts() {
  const container = document.getElementById('heartsBg');
  const heartsArr = ['💖', '💕', '💗', '💝', '🌸', '✨', '💧'];
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('div');
    h.className = 'bg-heart';
    h.textContent = heartsArr[Math.floor(Math.random() * heartsArr.length)];
    h.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${Math.random() * 18 + 12}px;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 15}s;
    `;
    container.appendChild(h);
  }
}

/* ─── Nickname Live Preview ──────────────────────── */
document.getElementById('nicknameInput').addEventListener('input', function () {
  const preview = document.getElementById('nicknamePreview');
  const val = this.value.trim();
  preview.textContent = val ? `✨ Vanakammmm, ${val}! Uniyeaa Inii.. Naaa Paathukureaaaa 💖` : '';
});

/* ─── Time Helpers ───────────────────────────────── */
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning! 🌅';
  if (h < 17) return 'Good Afternoon! ☀️';
  if (h < 20) return 'Good Evening! 🌇';
  return 'Good Night! 🌙';
}

function todayString() {
  return new Date().toDateString();
}

/* ─── Build Schedule ─────────────────────────────── */
function buildSchedule(wakeTime, sleepTime, goal) {
  const start = timeToMinutes(wakeTime);
  const end = timeToMinutes(sleepTime);
  const span = end - start;
  const interval = Math.floor(span / (goal - 1));
  const schedule = [];
  for (let i = 0; i < goal; i++) {
    const mins = start + i * interval;
    let label = '';
    if (i === 0) label = 'Enthichachaaaa 🌅';
    else if (i === goal - 1) label = 'Thoongaaa Poringalaaa 🌙';
    else {
      const pct = i / (goal - 1);
      if (pct < 0.35) label = 'Kaalaileaa oru glasss ☕';
      else if (pct < 0.55) label = 'Nallaaa Thannii Kudiii 🌞';
      else if (pct < 0.75) label = 'Veiyll polakkuu..Nallaa neriyeaa Kudiii ⚡';
      else label = 'Relaxx ahh Kudinggaaaaa 🌸';
    }
    schedule.push({ mins, time: minutesToTime(mins), label, done: false });
  }
  return schedule;
}

/* ─── Render Timeline ────────────────────────────── */
function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  container.innerHTML = '';
  const nowMins = getNow();

  state.schedule.forEach((slot, idx) => {
    const isPast = slot.done || slot.mins < nowMins;
    const isCurrent = !slot.done && Math.abs(slot.mins - nowMins) < (60 / state.goal * 60 / 2);
    const isFuture = !isPast && !isCurrent;

    const circleClass = slot.done ? 'past' : isCurrent ? 'current' : isFuture ? 'future' : 'past';
    const circleIcon = slot.done ? '✓' : isCurrent ? '💧' : `${idx + 1}`;

    let badgeHtml = '';
    if (slot.done) badgeHtml = `<span class="timeline-badge badge-done">✓ Done</span>`;
    else if (isCurrent) badgeHtml = `<span class="timeline-badge badge-now">💧 Now</span>`;
    else badgeHtml = `<span class="timeline-badge badge-soon">◦ Upcoming</span>`;

    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-circle ${circleClass}">${circleIcon}</div>
      <div class="timeline-info">
        <div class="timeline-time">${slot.time}</div>
        <div class="timeline-note">${slot.label}</div>
        ${badgeHtml}
      </div>
    `;
    container.appendChild(item);
  });
}

/* ─── Render Glass Icons ─────────────────────────── */
function renderGlassIcons() {
  const row = document.getElementById('glassIconsRow');
  row.innerHTML = '';
  const nowMins = getNow();

  state.schedule.forEach((slot, idx) => {
    const isFilled = idx < state.drunk;
    const isCurrent = idx === state.drunk;

    const span = document.createElement('span');
    span.className = `glass-icon ${isFilled ? 'filled' : isCurrent ? 'current' : 'empty'}`;

    if (isFilled) {
      span.textContent = '🥛';
    } else {
      // Morning (idx 0-2): lavender glass, Midday: peach half, Rest: lavender
      const pct = idx / state.goal;
      if (pct < 0.33) span.textContent = '🫗';
      else if (pct < 0.6) span.textContent = '🥛';
      else span.textContent = '💧';
    }

    row.appendChild(span);
  });
}

/* ─── Update Progress ────────────────────────────── */
function updateProgress() {
  const pct = Math.round((state.drunk / state.goal) * 100);
  document.getElementById('drunkCount').textContent = state.drunk;
  document.getElementById('goalCount').textContent = state.goal;
  document.getElementById('streakCount').textContent = state.streak;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressPercent').textContent = `${pct}%`;
}

/* ─── Refill Logic ───────────────────────────────── */
function checkRefillNeeded() {
  const refillEl = document.getElementById('refillAlert');
  const mainCard = document.getElementById('mainCard');
  // Suggest a refill every 4 glasses logged
  const shouldRefill = state.drunk > 0 && state.drunk % 4 === 0;
  if (shouldRefill) {
    refillEl.classList.remove('hidden');
    mainCard.classList.add('refill-glow');
    setTimeout(() => {
      refillEl.classList.add('hidden');
      mainCard.classList.remove('refill-glow');
    }, 8000);
  }
}

/* ─── Toast ──────────────────────────────────────── */
function showToast(msg, duration = 4500) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ─── Drink Water ────────────────────────────────── */
function logWater() {
  const today = todayString();
  if (state.lastDate && state.lastDate !== today) {
    // Tab was left open overnight. Reload to run fresh logic.
    location.reload();
    return;
  }

  if (state.drunk >= state.goal) {
    showToast(`Alreadyy Thanniii Kudichitingaa Thangoooo..Pothumm Ini Theavaikuu Kudingaa Chellooooo Seringalaaa!, ${state.nickname}! 🌟`);
    return;
  }

  // Mark current scheduled slot as done
  if (state.drunk < state.schedule.length) {
    state.schedule[state.drunk].done = true;
  }

  state.drunk++;

  // Ripple animation on button
  const btn = document.getElementById('drinkBtn');
  btn.style.transform = 'scale(0.94)';
  setTimeout(() => { btn.style.transform = ''; }, 200);

  // Goal achieved
  if (state.drunk === state.goal && !state.goalShown) {
    state.goalShown = true;
    state.goalMet = true;
    state.streak++;
    setTimeout(showGoalModal, 800);
  }

  updateProgress();
  renderTimeline();
  renderGlassIcons();
  rotateQuote();
  checkRefillNeeded();
  saveState();

  // Toast
  const msgs = toastMessages(state.nickname);
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  showToast(msg);
}

/* ─── Rotate Quote ───────────────────────────────── */
function rotateQuote() {
  const el = document.getElementById('quoteText');
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';
  setTimeout(() => {
    el.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 300);
}

/* ─── Goal Modal ─────────────────────────────────── */
function showGoalModal() {
  const modal = document.getElementById('goalModal');
  document.getElementById('modalMsg').textContent =
    `Poduuuuuuuu, ${state.nickname}! Norukitiyeaaaaa Ipdd dhaa Irukanum seriyaa..Gooddd Girlll !!!! 💖`;
  modal.classList.remove('hidden');
  spawnConfetti();
}

function closeModal() {
  document.getElementById('goalModal').classList.add('hidden');
}

function spawnConfetti() {
  const container = document.getElementById('modalConfetti');
  container.innerHTML = '';
  const colors = ['#FFC0CB', '#FFDAB9', '#E6E6FA', '#E0FFF4', '#ffe0b2', '#c8f7c5'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * -20}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      transform: rotate(${Math.random() * 360}deg);
      width: ${Math.random() * 8 + 5}px;
      height: ${Math.random() * 8 + 5}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 1.5 + 1}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    container.appendChild(piece);
  }
}

/* ─── Notifications ──────────────────────────────── */
function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    });
  }
}

function triggerWaterReminder(msgObj) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("SAAN TakeCare 💧", {
      body: msgObj || "Thanniyeaa Kudingaaa Thangooooooo !!!",
      icon: "https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4a7.png" // Using a standard drop emoji
    });
  }
}

/* ─── Scheduled Reminders ────────────────────────── */
function startReminders() {
  requestNotificationPermission();

  // Check every 60 seconds if it's time to remind
  setInterval(() => {
    if (state.drunk >= state.goal) return;
    const nowMins = getNow();
    const nextSlot = state.schedule.find((s, i) => !s.done && i >= state.drunk);
    if (!nextSlot) return;
    const diff = Math.abs(nextSlot.mins - nowMins);
    // Remind within ±2 minutes of scheduled time
    if (diff <= 2) {
      const msgs = toastMessages(state.nickname);
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      showToast(msg);
      triggerWaterReminder(msg);
    }
  }, 60000);
}

/* ─── Auto-refresh Timeline Every Minute ─────────── */
function startAutoRefresh() {
  setInterval(() => {
    renderTimeline();
    document.getElementById('greeting').textContent = getGreeting();
  }, 60000);
}

/* ─── Persist State ──────────────────────────────── */
function saveState() {
  localStorage.setItem('saanTakeCare', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('saanTakeCare');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/* ─── Settings Modal ─────────────────────────────── */
function openSettingsModal() {
  document.getElementById('editNickname').value = state.nickname;
  document.getElementById('editWake').value = state.wakeTime;
  document.getElementById('editSleep').value = state.sleepTime;
  document.getElementById('editGoal').value = state.goal;
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings() {
  const nickname = document.getElementById('editNickname').value.trim();
  const wakeTime = document.getElementById('editWake').value;
  const sleepTime = document.getElementById('editSleep').value;
  const goal = parseInt(document.getElementById('editGoal').value) || 8;

  if (!nickname) {
    showToast('Vekkaa Padamaa Pearueaa Sollungaaaa! 🌸');
    return;
  }

  state.nickname = nickname;
  state.wakeTime = wakeTime;
  state.sleepTime = sleepTime;

  const oldGoal = state.goal;
  state.goal = goal;

  // Rebuild schedule with new parameters, maintaining done status
  state.schedule = buildSchedule(state.wakeTime, state.sleepTime, state.goal);
  for (let i = 0; i < state.drunk && i < state.schedule.length; i++) {
    state.schedule[i].done = true;
  }

  // If goal was reduced and now reached
  if (state.drunk >= state.goal && !state.goalMet) {
    state.goalMet = true;
    state.streak++;
    if (!state.goalShown) {
      state.goalShown = true;
      setTimeout(showGoalModal, 500);
    }
  }

  saveState();
  closeSettingsModal();

  document.getElementById('headerNickname').textContent = state.nickname;
  document.getElementById('goalCount').textContent = state.goal;
  updateProgress();
  renderTimeline();
  renderGlassIcons();

  showToast('Ahnnn..Vetrigaramaa Maathiyachhh! 💖');
}

/* ─── Reset App ──────────────────────────────────── */
function resetApp() {
  if (!confirm('Reset and mothala irundhu start pannaumahhh? 💕')) return;
  localStorage.removeItem('saanTakeCare');
  location.reload();
}

/* ─── Start Care (Entry → Dashboard) ─────────────── */
function startCare() {
  const nickname = document.getElementById('nicknameInput').value.trim();
  if (!nickname) {
    showToast('Peareaaa Sollluuuuu diiiii ! 🌸');
    document.getElementById('nicknameInput').focus();
    return;
  }

  requestNotificationPermission();

  state.nickname = nickname;
  state.wakeTime = document.getElementById('wakeInput').value || '07:00';
  state.sleepTime = document.getElementById('sleepInput').value || '22:00';
  state.goal = parseInt(document.getElementById('goalInput').value) || 8;
  state.drunk = 0;
  state.goalShown = false;
  state.goalMet = false;
  state.streak = 0;
  state.schedule = buildSchedule(state.wakeTime, state.sleepTime, state.goal);
  state.lastDate = todayString();

  saveState();
  launchDashboard();
}

/* ─── Launch Dashboard ───────────────────────────── */
function launchDashboard() {
  document.getElementById('screenEntry').classList.add('hidden');
  const active = document.getElementById('screenActive');
  active.classList.remove('hidden');

  // Populate UI
  document.getElementById('headerNickname').textContent = state.nickname;
  document.getElementById('greeting').textContent = getGreeting();
  document.getElementById('goalCount').textContent = state.goal;

  updateProgress();
  renderTimeline();
  renderGlassIcons();
  rotateQuote();
  startReminders();
  startAutoRefresh();

  // Welcome toast
  setTimeout(() => {
    showToast(`Valzha Valamudan, ${state.nickname}! Vaanga Inaikuu thannii kudikalam !!! 💖`);
  }, 600);
}

/* ─── Init ───────────────────────────────────────── */
function init() {
  spawnPetals();
  spawnHearts();

  // Try to restore saved session
  const saved = loadState();
  if (saved && saved.nickname) {
    const today = todayString();
    if (saved.lastDate === today) {
      state = { ...saved };
    } else {
      // New day: keep nickname/settings, check streak
      let nextStreak = saved.streak || 0;
      if (saved.lastDate) {
        const lastActive = new Date(saved.lastDate);
        const currDate = new Date(today);
        const diffTime = Math.abs(currDate - lastActive);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1 && saved.goalMet) {
          // Keep streak alive!
        } else {
          nextStreak = 0;
        }
      }

      state = {
        ...saved,
        drunk: 0,
        goalShown: false,
        goalMet: false,
        streak: nextStreak,
        schedule: buildSchedule(saved.wakeTime, saved.sleepTime, saved.goal),
        lastDate: today,
      };
      saveState();
    }
    launchDashboard();
    return;
  }

  // Fresh start — show entry screen
  document.getElementById('screenEntry').classList.remove('hidden');
}

/* ─── Keyboard shortcut: Enter to start ─────────── */
document.getElementById('nicknameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startCare();
});

/* ─── Boot ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);

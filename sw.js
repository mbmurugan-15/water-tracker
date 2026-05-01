/* ===================================================
   SAAN TakeCare — Service Worker (sw.js)
   Handles background notifications even when tab is closed.
   =================================================== */

/* ─── Active timers map: slotIndex → timerId ──── */
let _timers = {};       // slotIndex -> current timerId
let _nickname = '';
let _schedule = [];

/* ─── Install & Activate immediately ────────────── */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

/* ─── Fetch handler (required for PWA installability) ── */
// Network-first: serve fresh content, fall back to cache when offline
const CACHE_NAME = 'saan-v1';
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

/* ─── Message handler (from main page) ──────────── */
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};

  switch (type) {

    case 'SCHEDULE_NOTIFICATIONS':
      // Full schedule sent from app on launch
      _nickname = data.nickname;
      _schedule = data.schedule;
      _cancelAll();
      _scheduleAll(data.schedule, data.nickname);
      break;

    case 'MARK_DONE':
      // User logged a glass — cancel reminders for that slot
      _cancelSlot(data.slotIndex);
      break;

    case 'GOAL_MET':
      // All glasses done today — cancel everything
      _cancelAll();
      break;
  }
});

/* ─── Schedule all future (and overdue) slots ───── */
function _scheduleAll(schedule, name) {
  const nowMs = Date.now();

  schedule.forEach((slot, idx) => {
    if (slot.done) return;

    const slotMs = _slotToMs(slot.mins);
    const delayMs = slotMs - nowMs;

    if (delayMs > -2 * 60 * 60 * 1000) {
      // Schedule: if overdue (negative), fire after a short grace of 5 s
      _scheduleSlot(idx, slot, name, Math.max(delayMs, 5000));
    }
  });
}

/* ─── Schedule a single slot's first reminder ───── */
function _scheduleSlot(idx, slot, name, delayMs) {
  const tid = setTimeout(() => {
    _showNotification(slot, name, false);
    // Start repeat reminders every 3 minutes until MARK_DONE
    _scheduleRepeat(idx, slot, name, 3 * 60 * 1000);
  }, delayMs);

  _timers[idx] = tid;
}

/* ─── Repeat reminder every repeatMs until done ─── */
function _scheduleRepeat(idx, slot, name, repeatMs) {
  // If slot was already marked done, stop
  if (!(idx in _timers)) return;

  const tid = setTimeout(() => {
    if (!(idx in _timers)) return;   // cancelled while waiting
    _showNotification(slot, name, true);
    _scheduleRepeat(idx, slot, name, repeatMs);
  }, repeatMs);

  _timers[idx] = tid;
}

/* ─── Cancel a specific slot's reminders ────────── */
function _cancelSlot(idx) {
  if (_timers[idx] !== undefined) {
    clearTimeout(_timers[idx]);
    delete _timers[idx];
  }
}

/* ─── Cancel all reminders ───────────────────────── */
function _cancelAll() {
  Object.keys(_timers).forEach(idx => {
    clearTimeout(_timers[idx]);
  });
  _timers = {};
}

/* ─── Convert slot minutes to today's timestamp ─── */
function _slotToMs(mins) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return target.getTime();
}

/* ─── Notification messages ──────────────────────── */
const _msgs = (name) => [
  `Oiii ${name}, I will take care you, Myyy Loveeeeeee. 💖`,
  `${name} Chellooooo! Superrrrr Chellooooo 🥛`,
  `Timee aagituu chellooooo, ${name} — Poii thannii kudichituu vandhu velaiyea paarungaa! 💧`,
  `${name}, Marakamaaa Thannii kudii Pakadaaaaa! 🌸`,
  `Olungaaa Kudingaaaaa Ennn Chellooooooo, ${name}! 💕`,
  `${name}, Thannii Kudichachaaa Ennn Vairameaaaaa! 🤗`,
  `Pakadaaa apoo apooo rest room poituu vaangaanga, ${name}! 🤗`,
];

/* ─── Show a browser notification ───────────────── */
function _showNotification(slot, name, isRepeat) {
  const msgs = _msgs(name);
  const body = msgs[Math.floor(Math.random() * msgs.length)];
  const title = isRepeat
    ? `🖤 Thannii yea kudingaa Thangooo..Time yea paarungaa! ${slot.time} 😘`
    : `💗 Kannuuuu Thannii Kudikuraa Timee vandhutuuu.. (${slot.time}) 🏃🏽‍♀️‍➡️`;

  self.registration.showNotification(title, {
    body,
    icon: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4a7.png',
    badge: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4a7.png',
    tag: `water-slot-${slot.mins}`,   // same tag = replaces old reminder for same slot
    requireInteraction: true,                   // stays visible until dismissed
    renotify: true,                        // vibrate/sound again on repeat
    data: { slotIndex: slot.mins },
  });
}

/* ─── Notification click → open / focus app ─────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Focus existing open tab if found
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      // Otherwise open a new tab
      return clients.openWindow('./');
    })
  );
});

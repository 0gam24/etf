/**
 * Daily ETF Pulse — Service Worker for Web Push.
 *
 *   기능: push 이벤트 수신 → 알림 표시 + 클릭 시 URL 이동.
 *   payload 형식: { title, body, url, tag }
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Daily ETF Pulse', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Daily ETF Pulse';
  const options = {
    body: data.body || '',
    icon: '/og-logo.png',
    badge: '/og-logo.png',
    data: { url: data.url || '/' },
    tag: data.tag || 'daily-etf-pulse',
    renotify: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(target) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});

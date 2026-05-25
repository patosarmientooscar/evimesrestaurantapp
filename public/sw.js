// Minimal fetch handler — required for Chrome PWA installability
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Nueva reserva", body: event.data.text() };
  }

  const options = {
    body: payload.body ?? "",
    icon: "/api/icon/192",
    badge: "/api/icon/72",
    vibrate: [200, 100, 200],
    data: payload.url ? { url: payload.url } : undefined,
    actions: payload.url
      ? [{ action: "open", title: "Ver reservas" }]
      : [],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Evimes", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (!url) return;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

(function() {
  'use strict';
  var api = '/api/analytics';
  var heartbeatSec = 15;
  var hbTimer;

  function getData() {
    var p = new URLSearchParams(location.search);
    return {
      url: location.pathname + location.search,
      referrer: document.referrer || null,
      title: document.title || null,
      screen: screen.width + 'x' + screen.height,
      language: (navigator.language || '').substring(0, 16),
      utm_source: p.get('utm_source') || null,
      utm_medium: p.get('utm_medium') || null,
      utm_campaign: p.get('utm_campaign') || null
    };
  }

  function send(path, data) {
    var url = api + path;
    var body = JSON.stringify(data || {});
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
      }
    } catch (e) {}
  }

  function startHeartbeat() {
    if (hbTimer) clearInterval(hbTimer);
    hbTimer = setInterval(function() { send('/heartbeat'); }, heartbeatSec * 1000);
  }

  function stopHeartbeat() {
    if (hbTimer) { clearInterval(hbTimer); hbTimer = null; }
    send('/heartbeat');
  }

  // Track initial pageview
  send('/collect', getData());
  startHeartbeat();

  // Pause/resume on visibility change
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) { stopHeartbeat(); } else { startHeartbeat(); }
  });

  // SPA navigation detection
  var lastUrl = location.href;
  var observer = new MutationObserver(function() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      send('/collect', getData());
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Also listen to popstate for back/forward
  window.addEventListener('popstate', function() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      send('/collect', getData());
    }
  });

  // Expose event tracking globally
  window.ohTrack = function(name, data) {
    send('/event', { name: name, data: data, url: location.pathname });
  };
})();

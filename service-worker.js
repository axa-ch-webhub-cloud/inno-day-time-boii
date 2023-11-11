/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'index.html',
  './', // Alias for index.html
  'index.js',
  'favicon.ico',
  'src/js/checkin-toggle.js',
  'src/js/custom-event.js',
  'src/js/date-manipulation.js',
  'src/js/date-stepper.js',
  'src/js/excel-output.js',
  'src/js/indexed-db.js',
  'src/js/persistence.js',
  'src/js/settings-dialog.js',
  'src/js/time-list.js',
  'icons/add-24dp.svg',
  'icons/axaLogo.svg',
  'icons/delete-24px.svg',
  'icons/directions_run-24px.svg',
  'icons/hourglass_bottom-24px.svg',
  'icons/keyboard_arrow_left-24px.svg',
  'icons/keyboard_arrow_right-24px.svg',
  'icons/play_arrow-24px.svg',
  'icons/save_alt-24px.svg',
  'icons/settings-24px.svg',
  'icons/stop-24px.svg'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  event.respondWith(
    // cache-first-otherwise-network strategy
    caches.match(event.request).then(cachedResponse => {
      // we can get it from the cache?
      if (cachedResponse) {
        // good (also for our app-startup times), don't bother to get it from network
        return cachedResponse;
      }
      // it's not in the cache, so...
      return caches.open(RUNTIME).then(cache => {
        // ... fetch it over the network, hoping for a successful response
        return fetch(event.request).then(response => {
          // we got a response!
          // Put a copy of the response in the runtime cache.
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});

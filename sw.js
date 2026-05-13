const CACHE_NAME = 'ipct-v2';

const ASSETS_TO_CACHE = [

    './',

    './index.html',

    './style.css',

    './app.js',

    './manifest.json',

    './icon.png'
];

/* =========================================
   INSTALL
   ========================================= */

self.addEventListener(

    'install',

    event => {

        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(cache => {

                    console.log(
                        'IPCT CACHE READY'
                    );

                    return cache.addAll(
                        ASSETS_TO_CACHE
                    );
                })
        );

        self.skipWaiting();
    }
);

/* =========================================
   ACTIVATE
   ========================================= */

self.addEventListener(

    'activate',

    event => {

        event.waitUntil(

            caches.keys()

                .then(keys => {

                    return Promise.all(

                        keys.map(key => {

                            if (
                                key !== CACHE_NAME
                            ) {

                                return caches.delete(
                                    key
                                );
                            }
                        })
                    );
                })
        );

        self.clients.claim();
    }
);

/* =========================================
   FETCH
   ========================================= */

self.addEventListener(

    'fetch',

    event => {

        // Ignore live API cache
        if (
            event.request.url.includes(
                '/api/live'
            )
        ) {

            event.respondWith(

                fetch(event.request)

                    .catch(() => {

                        return new Response(

                            JSON.stringify({

                                success: false,

                                error:
                                    'Offline'
                            }),

                            {

                                headers: {

                                    'Content-Type':
                                        'application/json'
                                }
                            }
                        );
                    })
            );

            return;
        }

        // Static cache
        event.respondWith(

            caches.match(event.request)

                .then(response => {

                    return (
                        response ||
                        fetch(event.request)
                    );
                })
        );
    }
);

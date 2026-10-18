Hashed CSS/JS from the build that was live before the home page was prerendered (d6ebe2e).
Browsers that still hold that version's HTML (restored tabs, old caches) request these files;
scripts/keep-previous-assets.mjs copies them into dist/assets at deploy time (outside the
service worker precache). Newer versions are carried over automatically through
asset-history.json, so this folder can be deleted once old caches have expired.

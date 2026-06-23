# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-test.spec.js >> Familie Dahrendorf - Kompletter Seitentest >> 7. Familie-Seite
- Location: e2e-test.spec.js:161:3

# Error details

```
Error: locator.evaluate: Target page, context or browser has been closed
```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> /Users/lukasdahrendorf/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/t_/75ccrpp522346pfhjv5qvb_80000gn/T/playwright_chromiumdev_profile-T9Nyfy --remote-debugging-pipe --no-startup-window
<launched> pid=24100
[pid=24100][err] [0623/095612.781734:INFO:CONSOLE:410] "As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.", source: https://maps.googleapis.com/maps-api-v3/api/js/65/5e/main.js (410)
[pid=24100][err] [0623/095612.783613:INFO:CONSOLE:400] "google.maps.DirectionsService is deprecated as of February 25th, 2026. Please use google.maps.routes.Route.computeRoutes instead. At this time, google.maps.DirectionsService is not scheduled to be discontinued, but google.maps.routes.Route.computeRoutes is recommended over google.maps.DirectionsService.route. While google.maps.DirectionsService will continue to receive bug fixes for any major regressions, existing bugs in google.maps.DirectionsService will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/legacy for additional details and https://developers.google.com/maps/documentation/javascript/routes/routes-js-migration for the migration guide.", source: https://maps.googleapis.com/maps-api-v3/api/js/65/5e/main.js (400)
[pid=24100][err] [0623/095613.078597:INFO:CONSOLE:180] "Directions Service: You must use an API key to authenticate each request to Google Maps Platform APIs. For additional information, please refer to http://g.co/dev/maps-no-account", source: https://maps.googleapis.com/maps-api-v3/api/js/65/5e/main.js (180)
[pid=24100][err] [0623/095613.078679:INFO:CONSOLE:180] "MapsRequestError: DIRECTIONS_ROUTE: REQUEST_DENIED: There was an issue performing a Directions request.", source: https://maps.googleapis.com/maps-api-v3/api/js/65/5e/main.js (180)
[pid=24100][err] [0623/095613.084008:INFO:CONSOLE:180] "Google Maps JavaScript API error: ApiProjectMapError
[pid=24100][err] https://developers.google.com/maps/documentation/javascript/error-messages#api-project-map-error", source: https://maps.googleapis.com/maps-api-v3/api/js/65/5e/main.js (180)
[pid=24100] <gracefully close start>
[pid=24100] <forcefully close>
[pid=24100] <kill>
[pid=24100] <will force kill>
```
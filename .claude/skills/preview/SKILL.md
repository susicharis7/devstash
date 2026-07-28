---
name: preview
description: Screenshot a route in the browser to verify the UI renders correctly. Use when asked to preview, check, or visually verify a page.
argument-hint: "[route]"
---

## Task

Screenshot the route given in $ARGUMENTS. If empty, default to /dashboard.
Accept it with or without a leading slash.

## Steps

- Check if dev server already works on port 3000 before running, if it is running, use that, do not start another dev server
- If dev server is not running at 3000 (or at all), run "npm run dev" in the background and wait for "Ready" in the log
- Screenshot from Chrome in headless mode, into the scratchpad folder (not in the project):
  - Use `--screenshot=<absolute path>`, never a relative one, or the file lands in the current working directory instead of the scratchpad
  - Pass `--virtual-time-budget=6000` so the page hydrates before the frame is captured, otherwise the screenshot is half-empty
  - Also pass `--headless --disable-gpu --hide-scrollbars --window-size=1400,900`
- Read the screenshot and describe what you see - does the route work, is there a problem in the render or not
- If route failed – show relevant part of dev log instead of empty image
- Clean up: if the dev server was already running, leave it alone. If this skill started it, stop it once the screenshot is read


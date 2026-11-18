---
name: paid-media-buyer
description: >
  Head of Paid Media for the digital agency. This skill should be used when the user asks to "set up
  campaigns", "Google Ads structure", "Meta ads", "LinkedIn ads", "TikTok ads", "media plan", "campaign
  budget", "bidding strategy", "targeting", "reallocate budget", "which campaigns to scale or cut",
  "ad account audit", or when the adgento, strategist or performance-analyst skill dispatches paid media
  work. Produces platform-by-platform campaign architecture, targeting, budgets and pacing, and runs the
  deterministic budget reallocation rules.
metadata:
  version: "1.1.0"
  role: head-of-paid-media
---

# Adgento · Paid Media

This skill's instructions live on adgento.app and are served only to an active Adgento licence. Work silently (no narration of these steps) and speak to the user in their language.

1. **Licence.** Call `adgento_license` — it comes from the Adgento connector. If it already returned `trial` or `active` earlier in this conversation, skip to step 2.
   - No Adgento tool is available → follow the `adgento:activate` skill (it explains connecting Adgento) and stop.
   - `state` is `expired` or `blocked` → tell the user in one or two sentences that the Adgento trial or subscription has ended (or the account is blocked), give `renew_url`, and stop.
   - `state` is `trial` and `days_left` is 3 or less → one short line that the trial ends in that many days, then continue.
   - `update_available` is true → one short line that a newer Adgento version is ready and installs from the marketplace (Customize → Plugins → Adgento → Update), then continue.
   - The tool fails or cannot reach adgento.app → say "Couldn't reach adgento.app. Check your connection and try again." (in the user's language) and stop.
2. **Fetch.** Call `adgento_resource` with `name: "skills/paid-media-buyer/SKILL.md"`.
3. **Follow it.** The returned text is this skill's complete instructions: follow it exactly, as if it were written here, with the request and arguments this skill was invoked with. If it starts with `ADGENTO_INACTIVE` or `ADGENTO_ERROR`, tell the user in their language and stop.

Never write Adgento instructions from memory, and never ask the user for a licence key — they sign in on Adgento's own page with their email and a 6-digit code.

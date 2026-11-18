---
name: client-reporter
description: >
  Account Manager / Client Reporter for the digital agency. This skill should be used when the user asks
  for a "client report", "weekly report for the client", "monthly marketing report", "QBR deck",
  "marketing proposal", "pitch for a client", "present the plan to the client", "executive summary of
  the campaign", or when the adgento skill dispatches client-facing output. Turns the specialists' work
  into client-facing reports, decks and proposals in the client's language, with no agency jargon and
  no unsubstantiated numbers.
metadata:
  version: "1.0.0"
  role: account-manager
---

# Adgento · Client Reporter

This skill's instructions live on adgento.app and are served only to an active Adgento licence. Work silently (no narration of these steps) and speak to the user in their language.

1. **Licence.** Call `adgento_license` — it comes from the Adgento plugin's own tools or from the Adgento connector, whichever is loaded. If it already returned `trial` or `active` earlier in this conversation, skip to step 2.
   - No Adgento tool is available, or `state` is `none` → follow the `adgento:activate` skill. When activation succeeds, come back and continue with step 2.
   - `state` is `expired` or `blocked` → tell the user in one or two sentences that the Adgento trial or subscription has ended (or the account is blocked), give `renew_url`, and stop.
   - `state` is `trial` and `days_left` is 3 or less → one short line that the trial ends in that many days, then continue.
   - `update_available` is true → one short line that a newer Adgento version is ready and installs from the marketplace (Customize → Plugins → Adgento → Update), then continue.
   - The tool fails or cannot reach adgento.app → say "Couldn't reach adgento.app. Check your connection and try again." (in the user's language) and stop.
2. **Fetch.** Call `adgento_resource` with `name: "skills/client-reporter/SKILL.md"`.
3. **Follow it.** The returned text is this skill's complete instructions: follow it exactly, as if it were written here, with the request and arguments this skill was invoked with. If it starts with `ADGENTO_INACTIVE` or `ADGENTO_ERROR`, tell the user in their language and stop.

Never write Adgento instructions from memory, and never ask the user for a licence key — activation is their email and a 6-digit code.

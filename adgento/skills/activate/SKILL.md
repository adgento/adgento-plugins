---
name: activate
description: >
  Activates Adgento (the digital marketing agency plugin) with the user's email and a 6-digit code, and
  starts the 14-day free trial for a new email. Use right after the Adgento plugin is installed, when the
  user says "activate Adgento", "Adgento licence", "Adgento trial", "Adgento subscription", "sign in to
  Adgento", "הפעלת Adgento", "להפעיל את Adgento", "רישיון Adgento", "מנוי Adgento", "תקופת ניסיון", or when
  another Adgento skill finds Adgento not activated or no Adgento tools loaded.
metadata:
  version: "1.0.0"
  role: activation
---

# Adgento · Activation

Speak in the user's language (Hebrew if they write Hebrew). Short, plain sentences; no narration of tool calls. Never ask for, accept, repeat or display a licence key — Adgento is activated with an email and a 6-digit code, and the licence is stored by the tool, not in the chat.

## 1. Check

Call `adgento_license`.
- `state` is `trial` or `active` → say so in one line (trial: "Adgento is active — free trial, N days left"; subscription: "Adgento is active"). If another Adgento skill sent you here, go back to it; otherwise offer to start (step 4).
- `state` is `expired` or `blocked` → say it in one or two sentences, give `renew_url`, and stop. A new email does not restart a trial for the same person.
- `state` is `none` → step 2.
- No `adgento_license` tool at all → step 3.

## 2. Activate on this computer (the plugin's `adgento_activate` tool is available)

1. Ask in one sentence for the email Adgento should use, and say that a new email gets a 14-day free trial. Wait for the answer (free text, not a multiple-choice question).
2. Call `adgento_activate` with `email` and `lang` (`he` or `en`, the user's language). On `sent: true`, say: a 6-digit code was sent to that email; paste it here (check spam if it isn't there in a minute).
   - `rate_limited` → ask them to wait a few minutes. `mail_unavailable` → ask them to try again shortly. `bad_email` → ask for the email again.
3. When they send the code, call `adgento_activate` with `email`, `code` and `lang`.
   - `ok: true` → one line with the result from `status` (trial: "Adgento is active — 14-day free trial"; subscription: "Adgento is active"). Then step 4.
   - `wrong_code` → ask them to check the code (say how many tries are left). `no_code` or `too_many_tries` → offer to send a new code (back to 2.2). `blocked` → tell them to write to hello@adgento.app.

If the tools say they cannot reach adgento.app, say so and ask the user to check the connection.

## 3. No Adgento tools in this conversation

This happens in Claude on the web or in a cloud session, where the plugin's own tools cannot run, or when the plugin's helper could not start. Tell the user, in their language, how to connect Adgento as a connector — they sign in on Adgento's page, never in the chat:

1. Open **Settings → Connectors** in Claude and choose **Add custom connector**.
2. Name: **Adgento**. URL: `https://adgento.app/mcp`. Add it, then click **Connect**.
3. On the Adgento page, enter your email and the 6-digit code that arrives by email (a new email gets a 14-day free trial).
4. Start a new chat and write what you need (for example "start Adgento").

If they are in the Claude desktop app and the plugin is installed, also say: make sure Node.js is installed (https://nodejs.org), then restart Claude — the plugin's helper needs it. Then stop.

## 4. Next

First activation, or the user asked what to do now: offer to begin with the onboarding — AskUserQuestion with *Set up my business or agency (recommended)* / *Not now*. On the first option, invoke the `adgento:setup` skill.

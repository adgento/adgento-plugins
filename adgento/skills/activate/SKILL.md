---
name: activate
description: >
  Connects and activates Adgento (the digital marketing agency plugin) and explains the 14-day free trial.
  Use right after the Adgento plugin is installed, when the user says "activate Adgento", "connect Adgento",
  "Adgento licence", "Adgento trial", "Adgento subscription", "sign in to Adgento", "הפעל את Adgento",
  "להפעיל את Adgento", "לחבר את Adgento", "רישיון Adgento", "מנוי Adgento", "תקופת ניסיון", or when another
  Adgento skill finds no Adgento tools loaded.
metadata:
  version: "1.1.0"
  role: activation
---

# Adgento · Activation

Speak in the user's language (Hebrew if they write Hebrew). Short, plain, non-technical sentences; no narration of tool calls. Never ask for, accept, repeat or display a licence key or password — the user signs in on Adgento's own page.

## 1. Check

If the `adgento_license` tool is available, call it.
- `state` is `trial` or `active` → say so in one line (trial: "Adgento is connected — free trial, N days left"; subscription: "Adgento is connected"). If another Adgento skill sent you here, go back to it; otherwise go to step 3.
- `state` is `expired` or `blocked` → say it in one or two sentences, give `renew_url`, and stop.

If there is no `adgento_license` tool, Adgento is not connected yet → step 2.

## 2. Connect Adgento (one time)

Give the user these steps, in their language, as a short numbered list:

1. In Claude open **Settings → Connectors** and click **Add custom connector**.
2. Name: **Adgento**. Address: `https://adgento.app/mcp`. Click **Add**.
3. Click **Connect**. An Adgento page opens: enter your email, then the 6-digit code we email you. A new email starts a 14-day free trial.
4. Open a new chat and write what you need, for example "בואו נתחיל עם Adgento" / "start Adgento".

Add one line: on a Team or Enterprise plan, if **Add custom connector** isn't there, the organisation's admin adds it once (Organization settings → Connectors) and then everyone clicks Connect. The full guide with pictures: https://adgento.app/install/

Then stop — the connection is ready only in a new chat.

## 3. Next

First connection, or the user asked what to do now: offer to begin with the onboarding — AskUserQuestion with *Set up my business or agency (recommended)* / *Not now*. On the first option, invoke the `adgento:setup` skill.

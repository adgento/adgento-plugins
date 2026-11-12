---
name: sync-design-systems
description: Syncs the Design System artifacts in the user's account into Post Studio, the social-post wizard, so its brand picker uses the account's current brands, logos, colours, fonts and voice; when the account has none, builds one from the user's website or logo first. Use when the user says "sync design systems", "sync Post Studio", "update Post Studio's brands", "Post Studio is missing my new design system", "create a design system for my brand ... then sync Post Studio" (with a website, attached logo or files, a social page, or nothing yet), when a daily Post Studio sync scheduled task fires, or from the install-post-studio skill.
---

# Sync design systems into Post Studio

This file only loads the instructions. They come from adgento.app, so the plugin always runs the latest ones.

1. **Fetch** the instructions: call `post_studio_resource` with `name: "sync.md"` (this plugin's `post-studio` server). If that tool isn't available, use WebFetch on `https://adgento.app/api/ps/resource?name=sync.md` and ask for the text verbatim.
2. **Follow them exactly.** `${CLAUDE_PLUGIN_ROOT}` in them is this plugin's folder: two folders above this file (the one holding `app`, `server` and `skills`). Fetch any other resource they name (`contract.md`, `create-brand.md`, …) the same way, when its step comes.
3. **If fetching fails:** say in one line "Couldn't reach adgento.app. Check your connection and try again." and stop. Don't rebuild the instructions from memory.

What adgento.app receives from this plugin: an anonymous install id, the plugin version, and the email only if the user chooses to give it. Never anything about the user's posts, brands or files.

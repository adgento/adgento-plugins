---
name: install-post-studio
description: Creates the user's own Post Studio (the social-post wizard) as an artifact in their account, fills it with the account's design systems, and turns on a daily sync. Use right after the Post Studio plugin is installed, or when the user says "install Post Studio", "set up Post Studio", "create my Post Studio", "build Post Studio", "התקן את Post Studio", or asks for the post wizard in their account.
---

# Install Post Studio

This file only loads the instructions. They come from adgento.app, so the plugin always runs the latest ones.

1. **Fetch** the instructions: call `post_studio_resource` with `name: "install.md"` (this plugin's `post-studio` server). If that tool isn't available, use WebFetch on `https://adgento.app/api/ps/resource?name=install.md` and ask for the text verbatim.
2. **Follow them exactly.** `${CLAUDE_PLUGIN_ROOT}` in them is this plugin's folder: two folders above this file (the one holding `app`, `server` and `skills`). Fetch any other resource they name (`contract.md`, `create-brand.md`, …) the same way, when its step comes.
3. **If fetching fails:** say in one line "Couldn't reach adgento.app. Check your connection and try again." and stop. Don't rebuild the instructions from memory.

What adgento.app receives from this plugin: an anonymous install id, the plugin version, and the email only if the user chooses to give it. Never anything about the user's posts, brands or files.

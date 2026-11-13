---
name: workshop-onboarding
description: Run this the first time a participant opens this repo in Claude Code, or whenever they run /workshop-onboarding, to check and set up everything needed for the "Prompt → Next.js → GitHub → Vercel" workshop — tool versions, GitHub/Vercel auth, the Vercel MCP server, and a working local build. Do not start it on your own when the participant has asked for something else (such as /wish, /one-shot, or /ship-web).
---

# Workshop onboarding

Goal: get a participant's laptop from "just cloned this repo" to "ready to prompt, push, and deploy" with as little manual fiddling as possible. Work through these steps in order. Don't skip ahead — later steps assume earlier ones passed.

Read `PROJECT-GROUND-TRUTH.md` before acting. Do not infer current login or MCP
state from `SESSION-TRANSCRIPT.md`; check it live. Do not resume an earlier
device-code flow unless the current status check shows it is still required.

## 1. Tools

Check each of these and report versions. If any is missing, tell the participant how to install it for their OS and wait — don't try to install compilers/runtimes yourself.

```bash
node --version
git --version
gh --version
vercel --version
```

- Node missing → point to https://nodejs.org (or `nvm install --lts` if they have nvm).
- Git missing → macOS: `xcode-select --install`; Linux: their package manager; Windows: https://git-scm.com.
- `gh` missing → https://cli.github.com
- `vercel` missing → install it yourself: `npm i -g vercel`.

## 2. Git identity

```bash
git config --global user.name
git config --global user.email
```

If either is empty, ask the participant for their name/email and set it with `git config --global user.name "..."` / `user.email "..."`.

## 3. GitHub auth

```bash
gh auth status
```

If not logged in, run `gh auth login` (HTTPS, and let it manage git credentials). This opens a device code/URL — surface it clearly to the participant and wait for them to confirm they've completed it in a browser before moving on. Re-run `gh auth status` to confirm.

## 4. Vercel auth

```bash
vercel whoami
```

If not logged in, run `vercel login` in an interactive terminal (use a terminal tool, not a plain backgrounded shell command, since it needs to show a device code / open a browser). Wait for the participant to confirm before re-checking `vercel whoami`.

Once logged in, remind them once: authorize Vercel's GitHub App for their account/repos at https://github.com/apps/vercel if they haven't already — needed for auto-deploy-on-push later.

## 5. Vercel MCP

Add the Vercel MCP server globally so it's available in every project, not just this one. First check `command -v claude`.

- If the `claude` command exists:
  ```bash
  claude mcp add --transport http vercel https://mcp.vercel.com -s user
  ```
- If it does not (common in Claude Desktop): ask the participant to add a custom connector named `vercel` with URL `https://mcp.vercel.com` in Claude Desktop's connector settings, then continue. Vercel MCP is only used later to read deployment status; if it cannot be set up, note it and carry on — `/ship-web` can use `vercel ls` instead.

Tell the participant to run `/mcp` themselves and complete the OAuth popup, then confirm it shows "connected" before continuing. Remind them to keep human confirmation ON for Vercel tool calls — don't auto-approve deploys.

### Same Vercel account check

Once the MCP is connected, confirm it uses the same Vercel account as the CLI.
Compare the username from `vercel whoami` with the `username` returned by the
Vercel MCP `get_auth_user` tool.

- **Same:** say so in one line and continue.
- **Different:** tell the participant in one sentence that the CLI and MCP are
  signed in to different Vercel accounts, so the deployment check later would
  look at the wrong account. Ask them to run `/mcp` (in a `claude` terminal if
  the Desktop app has no `/mcp` screen), pick **vercel**, choose **Clear
  authentication**, then **Authenticate** as the CLI's account. Wait for them to
  confirm, then compare again. If they would rather use the MCP's account, run
  `vercel logout` and `vercel login` instead. Do not clear or change either
  login yourself.
- **MCP not set up:** skip this check; `/ship-web` will use the CLI.

## 6. Local project check

From the repo root:

```bash
npm install
npm run verify   # lint + build
npm run dev
```

Confirm `npm run verify` passes clean and the dev server serves `http://localhost:3000` with a 200. Then stop only the dev server you started (its process ID, or the process on the port it reported). Never stop servers by name (`pkill node`, `pkill -f next`); that can kill the participant's other projects.

## 7. Point them at what's next

Once everything above passes, tell the participant, briefly:

- They are set up. The demo in `src/app/page.tsx` (menu on the left, kitchen on the right) is just the starting point.
- The workshop flow from here:
  1. `/wish` — work backwards from your goal to one small browser journey (writes `PROJECT-GOAL.md`).
  2. `/one-shot` — builds that journey, tests it, and fixes it until it works on this laptop.
  3. Try it yourself in the browser.
  4. `/ship-web` — puts it on your team's own GitHub repo (new or existing), connects Vercel, and gives you a public link.
- Do not push to the starter repo they cloned; `/ship-web` handles moving to the team repo.

Stop there. Do not start `/wish` or any other step yourself.

## Don't

- Don't install GitHub CLI, Vercel CLI's runtime deps, Node, or Xcode command line tools' license-gated pieces without the participant present — these may need sudo/password or GUI interaction you can't complete for them.
- Don't skip the confirmation waits in steps 3–5 — the CLI logins are async browser flows and will hang or silently fail if you check status before the participant has actually completed them.
- Don't create GitHub repos or deploy anything from this skill — onboarding only sets up tooling. Building/shipping their own app is the workshop exercise itself.

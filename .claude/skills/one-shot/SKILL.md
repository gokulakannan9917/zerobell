---
name: one-shot
description: One command that takes the approved journey in PROJECT-GOAL.md (from /wish) to a working, verified Next.js app on the participant's laptop, retrying and fixing until it actually works. Without PROJECT-GOAL.md it verifies and browser-tests the untouched sample app instead. Use when a participant runs /one-shot, or says "just build it". Relaxed tone, optional personal preferences, stops only for logins and approvals.
argument-hint: "[preferences, optional]"
---

# One-shot: idea → running app

The participant has an approved goal from `/wish`. You do the rest and keep going until it works. They should be able to sit back.

## Context contract

Read `PROJECT-GROUND-TRUTH.md` before acting. Use `SESSION-TRANSCRIPT.md` only
to understand prior decisions; never resume a historical login, repository,
deployment, or rehearsal task from it. This skill owns only the current local
build. A past test report is not evidence for the current run.

Tone: relaxed and plain English. No jargon, no lectures. Short updates ("Tools look good", "Building", "Fixing a small error, one sec"). Never paste long logs at them; summarise.

## 0. Know what "done" means

Done = ALL of these are true, with evidence you actually observed:

1. `npm run verify` passes.
2. The dev server answers `200` on the home page.
3. The agreed happy path works in the browser (see step 5).

Do not say "done" until you have seen all three. If you could not observe one, say which one and why.

## 1. Quiet check (don't make a ceremony of it)

Run these silently, and only speak up if something is wrong. Works on Mac and Windows.

```bash
node --version
npm --version
git --version
```

- Missing or too old (Node needs 20 or newer): tell them the one-line install for their OS, then wait. Mac: `brew install node`. Windows: `winget install OpenJS.NodeJS.LTS`. Then ask them to reopen the terminal.
- Everything else (GitHub login, Vercel login, MCP) is NOT needed to build. Leave it for `/ship-web`.

If `node_modules` is missing, run `npm install` yourself.

## 2. Preferences (one message, all optional)

Check for `PREFERENCES.md` in the repo root. If it exists, read it, say in one line what you will reuse, and skip the questions.

If not, and the participant did not already include these in their idea, ask ONE short message and accept "skip" or "surprise me" for everything:

> Anything you want my say on? All optional, or just say "surprise me":
> 1. Look and feel (colours, playful or clean, dark or light)
> 2. Who it is for (customers, staff, students...)
> 3. Anything it must have, or must not have
> 4. Language for the screen text (English, Bahasa Malaysia, Chinese...)

Save what they said to `PREFERENCES.md` (plain bullet list, no secrets, no personal data) so later runs reuse it. Defaults when they skip: clean light theme, English, mobile-friendly, food and drink friendly sample data.

Do not ask anything else. Make sensible choices yourself and mention them in the final summary.

## 3. Turn the idea into one journey

`PROJECT-GOAL.md` (written and approved during `/wish`) is the journey to build. Build exactly that; do not rewrite or re-scope it, and do not re-ask the `/wish` questions. Only update it if the participant changes their mind, and say what changed.

If `PROJECT-GOAL.md` does not exist, do not invent a goal. Use the starter's sample app as it is: its journey is **add an item, press Confirm Order, see the kitchen stages run**. Do not change any code. Skip step 2 (preferences) and step 4 (build), run step 5 on the sample journey, and in the hand-over say: "This is the sample app, unchanged. Run `/ship-web` to put it online, or `/wish` when you want to build your own idea." 

Show them the journey in 3 to 5 lines and say you are starting. Do not wait for another approval; they can interrupt.

## 4. Build

- Next.js App Router, TypeScript, Tailwind, responsive. If they ask for a mobile app, build a mobile-first website instead.
- Local sample data only. No Supabase, no database, no accounts, no real API keys.
- Server Components by default; Client Components only for things people click or type.
- `src/app/page.tsx` is only the demo restaurant page. Replace it for the participant's idea; keep it only if the idea is the same demo.
- Update `src/app/globals.css` and `layout.tsx` too if the look they asked for (for example forced dark mode) fights the starter's existing theme.
- The repo's `AGENTS.md` points to Next.js docs in `node_modules/next/dist/docs/`. Consult them only if something Next-specific breaks.
- Do not add dependencies unless the journey truly needs one. Never add native mobile frameworks.
- Never put credentials in code. Never read `.env.local`.

## 5. Loop until it works

Repeat this cycle. Count attempts.

1. Run `npm run verify`. If it fails, read the error, fix the cause (not the symptom), go back to 1.
2. Start the dev server in the background (`npm run dev`). Wait until `http://localhost:3000` returns 200. If the port is busy, use the next free port and tell them the real URL.
3. Walk the happy path from `PROJECT-GOAL.md`:
   - If a browser tool is available, open the page, read its text, click the real buttons for each step (clicking via a small script is fine), then read the page again and confirm the evidence is visible. Take one screenshot to check it looks right.
   - If not, fetch the page, confirm the key text and controls exist, and tell the participant exactly which 3 to 5 clicks to try, waiting for their yes or the symptom.
4. If any step is wrong, fix it and go back to 1.
5. If everything passes, leave the dev server running so the participant can open it, tell them the URL, and go to step 6. If you must stop a server, stop only the process or port you started yourself (never `pkill` by name, which can hit their other projects).

Attempt limit: after 5 failed cycles, stop. Say in plain English what you tried, what is still broken, and the single next thing you suggest. Do not silently keep spinning and do not weaken the checks to get a green result.

Never fix a failure by deleting the check, skipping lint, or hiding an error. If a check itself is wrong, say so.

## 6. Hand over

Give a short summary:

- What works (the happy path, in one sentence) and the URL to open.
- The choices you made for them (look, language, anything you cut), so they can change them.
- 2 or 3 "try saying this next" ideas they can paste to tweak it, such as "make the buttons bigger" or "add a second page for ...".
- The next steps: "Click through it yourself in the browser. When you like it, run `/ship-web` to put it on your team's GitHub and get a public Vercel link."

Stop after this handoff. Do not append unrelated setup or shipping blockers,
offer to resume an older login, or ask for repository-creation approval. Those
belong only to a separately invoked onboarding or `/ship-web` run.

## Boundaries

- Do not create repositories, commit, push, connect Vercel, or deploy from this skill. That is `/ship-web`, and it asks for approval.
- Do not install system software (Node, Git, compilers) yourself; only guide.
- Do not run destructive commands on their files (`rm -rf`, `git reset --hard`, `git clean`, `git checkout --`).
- If they change their mind mid-way, update `PROJECT-GOAL.md`, say what changed, and continue the loop.

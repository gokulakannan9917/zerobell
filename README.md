# AI Coding Workshop — Prompt → Next.js → GitHub → Vercel

A starter project for the workshop: describe what you want in plain English, have an AI coding assistant build it, push to GitHub, and watch it deploy live on Vercel automatically.

**Participants:** begin with [`START-HERE.md`](START-HERE.md). It contains the exact setup and workshop steps.

## Quickstart

1. Open this folder in Claude Desktop (Claude Code): the `app` folder from the workshop zip, or a `git clone` of this repo.
2. Run `/workshop-onboarding` — checks Node, Git, GitHub CLI, Vercel CLI, sign-ins, Vercel MCP, and a local build.
3. Run `/wish` — work backwards from your goal to one small browser journey.
4. Run `/one-shot` — builds that journey and fixes it until it works locally.
5. Test it in your browser.
6. Run `/ship-web` — creates (or uses) your team's own GitHub repo, connects Vercel Git, pushes, and gives you a public link.
7. Test the public link.

Do not push to this starter repo; `/ship-web` moves your work to your team's repo.

## What's in this repo

| Path | What it is |
|---|---|
| [`src/app/page.tsx`](src/app/page.tsx) | The demo app — a menu you can order from, with a live cooking-progress panel. |
| [`START-HERE.md`](START-HERE.md) | The participant starter pack from repository access through deployment. |
| [`ONE-SHOT-PROMPT.md`](ONE-SHOT-PROMPT.md) | The exact prompt that generates this app in a single shot, plus the image prompts for its artwork. Read this before writing your own prompts — it's a model for how specific a good prompt needs to be. |
| [`.claude/skills/workshop-onboarding/`](.claude/skills/workshop-onboarding/SKILL.md) | The onboarding skill described above. |
| [`.claude/skills/wish/`](.claude/skills/wish/SKILL.md) | A goal-seeking conversation that works backwards from the desired result to a small web MVP. |
| [`.claude/skills/one-shot/`](.claude/skills/one-shot/SKILL.md) | Builds, verifies, and browser-tests the approved local journey without publishing it. |
| [`.claude/skills/ship-web/`](.claude/skills/ship-web/SKILL.md) | Verification, GitHub publishing, and Vercel Git connection with approval gates. |
| [`WISHFUL-PROGRAMMING.md`](WISHFUL-PROGRAMMING.md) | Participant worksheet and prompt template for the method. |

## The loop you're here to practice

1. **Work backwards** — define the goal, identify evidence, and trace the required conditions back to a buildable first step.
2. **Prompt** — describe that smallest complete journey in plain English.
3. **Generate & edit** — your AI assistant proposes the change; you review the diff and approve.
4. **Push** — commit and push to your team's GitHub repo.
5. **Deploy** — Vercel picks up the push automatically and your change goes live at a real URL, no manual deploy step needed.

Try it: pick something small (a new menu item, a different color scheme, an extra step in the cooking flow) and run the loop yourself.

## Scripts

- `npm run dev` — local dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run lint` — eslint only
- `npm run verify` — lint + build, the same check used in preflight

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.

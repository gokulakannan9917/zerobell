---
name: ship-web
description: Publish a verified workshop Next.js project to the team's own GitHub repository (create it or update an existing one), connect that repository to Vercel Git, and confirm the public URL works. Use when a participant runs /ship-web after the local browser journey works. Require approval before creating a repository, pushing, or connecting Vercel.
---

# Ship the web project

Teams cloned (or unzipped) the public workshop starter (`Tanwyhang/ai-coding-workshop-starter`).
This skill moves their work into the team's own GitHub repository and lets Vercel
deploy it from Git. Do not upload project files directly to Vercel.

Read `PROJECT-GROUND-TRUTH.md` before acting. Verify all current external state
live with `gh`, `git`, `vercel`, and Vercel MCP. Explain each stage in one or two
plain sentences. The participant's answer to each question below is the approval
for that step only.

## 1. Check the project

If `PROJECT-GOAL.md` does not exist, the team is shipping the untouched sample
app (menu on the left, kitchen on the right). That is fine: it is a good first
deployment test. Its journey is: add an item, press **Confirm Order**, and see
the kitchen stages run. Use that journey wherever this skill mentions
`PROJECT-GOAL.md`.

Ask one yes/no question first: "Has your tester clicked through the journey in
the browser and seen it work?" If no, stop and suggest they test first.

```bash
npm run verify
git status
```

- It must still be a responsive Next.js web app with no native mobile tooling.
- `.gitignore` must exclude `node_modules`, `.next`, `.env*`, and `.vercel`.
- Inspect the files Git would publish. Stop if any contains an environment file,
  token, private key, service-role key, or credential.

## 2. Choose the GitHub destination

```bash
gh auth status
git remote -v
```

**Never push to `Tanwyhang/ai-coding-workshop-starter`.** After cloning, `origin`
points there; that is expected.

- **`origin` is already another repository** (a second `/ship-web` run): that is
  the team repository. Say so in one line and go to stage 3.
- **No `origin`** (an earlier run stopped half-way): ask the question below.
- **`origin` is the starter:** ask the question below.

> Where should this go? Paste your team's GitHub repo link, or say "new" and I'll
> create a private repo called `<suggested-name>` on `<gh account>`.

Suggest a short kebab-case name from `PROJECT-GOAL.md` (for the sample app:
`<gh-username>-workshop-demo`). Do not reuse a name from
an older conversation.

Move the starter remote aside only if needed:

```bash
# only if origin is the starter and upstream does not exist yet
git remote rename origin upstream
```

- **New repository:**
  ```bash
  gh repo create <owner>/<name> --private
  git remote add origin https://github.com/<owner>/<name>.git
  ```
  (Do not use `--source .`; it fails in some folder layouts, such as Git
  worktrees.)
- **Existing repository:** `git remote add origin <url>`, then
  `git ls-remote --symref origin HEAD` to see whether it is empty and which
  branch is its default.
  - Empty: continue.
  - Has history (for example a README made on the GitHub website): tell the
    participant in one sentence that its files will be combined with this
    project in stage 3, after their work is committed.

If the repository is owned by a GitHub organisation, warn once: Vercel's free
plan may refuse private organisation repositories; a repo on the driver's
personal account avoids that.

## 3. Commit and push

Show the changed files, the commit message, and the destination
(`<owner>/<name>`, branch `main`, or the existing repo's default branch so
Vercel treats it as production). Ask for approval, then:

```bash
git add -A
git commit -m "<message>"      # skip if there is nothing to commit (for example
                               # the untouched sample app) and say so; still push
```

If the existing repository has history, combine it now (this is part of the
approved push):

```bash
git fetch origin
git merge origin/<branch> --allow-unrelated-histories --no-edit
```

If files conflict, list them in plain words. Keep this project's version of the
starter files (for example `README.md`) unless the participant says otherwise,
finish the merge, and rerun `npm run verify`. Then push:

```bash
git push -u origin HEAD:<branch>
```

If the push is rejected, stop and explain. Never force-push.

## 4. Connect Vercel Git

```bash
vercel whoami
vercel teams ls
```

Compare the `vercel whoami` username with the `username` from the Vercel MCP
`get_auth_user` tool. If they differ, or the MCP is not connected, say so in one
line and use only the CLI (`vercel ls`, `vercel inspect`) to check deployments
in stage 5. The CLI account is the one that owns the project. Do not change
either login yourself.

List the available scopes by name and ask which to use if there is more than
one. Then check for a name clash:

```bash
vercel project ls --scope <scope>
```

If a project called `<name>` already exists and is not this team's, pick another
name. Ask: "OK to create Vercel project `<name>` in `<scope>`, connect it to
`<owner>/<name>`, and push one empty commit to start the first deployment?"
After yes:

```bash
vercel link --yes --project <name> --scope <scope>
vercel git connect https://github.com/<owner>/<name> --non-interactive --scope <scope>
```

"Already connected" is a success. If Vercel cannot see the repository, ask the
participant to grant the Vercel GitHub App access at
https://github.com/apps/vercel, then retry.

Linking does not start a deployment. Check `vercel ls --scope <scope>`; if
nothing is building for the latest commit, start one through Git:

```bash
git commit --allow-empty -m "Start Vercel deployment"
git push
```

Never run `vercel deploy` or any MCP file-deployment tool.

## 5. Check the deployment

Use Vercel MCP if its account matched in stage 4 (otherwise `vercel ls --scope <scope>`) to watch the newest deployment
until it is Ready or Error.

- **Error:** read only the relevant build error, make the smallest fix, rerun
  `npm run verify`, then ask before committing and pushing the repair.
- **Ready:** the public link is the production domain
  `https://<project>.vercel.app` (see `vercel project inspect <name> --scope
  <scope>` or the project's domains). Do not hand out the long
  `...-<scope>.vercel.app` deployment URL; it can ask visitors to log in.

Open the public link yourself (browser tool, or fetch it and check for HTTP 200
and the key text), then ask the tester to complete the journey from
`PROJECT-GOAL.md` (or the sample journey) on that link.

## 6. Hand over

In three lines: the public URL, that every push to `main` now redeploys
automatically, and that running `/ship-web` again publishes later changes.

## Boundaries

- Never publish secrets or `.env.local`.
- Never push to the starter repository, never force-push, never change
  repository visibility without explicit approval.
- Never bypass Git with a direct upload or `vercel deploy`.
- Never replace the Next.js web architecture or add native mobile tooling.

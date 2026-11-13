# One-Shot Prompt — F&B Order Demo (Menu → Kitchen)

This is the exact prompt that reproduces the demo app in this repo from a fresh Next.js scaffold, in a single shot. It's included as a teaching example for the workshop: notice it doesn't just name a feature ("add a menu") — it specifies exact data, exact states, exact timing, and exact visual language, so there's no ambiguity for the AI to guess at.

## Before writing the prompt: work backwards from the goal

Start with the result rather than a list of features:

1. **Goal:** What result do you want to achieve?
2. **Evidence:** What observable result will prove you reached it?
3. **Conditions:** What must already be true immediately before that?
4. **First step:** Repeat question 3 until you reach something the team can build or test now.

For this demo, begin with the goal: customers can place orders without staff missing them. The evidence is a confirmed order with visible kitchen progress. Immediately before that, the order must be submitted. Before submission, the customer must select an item.

That backwards chain defines the smallest complete journey: **select an item, confirm the order, see kitchen progress**.

## 0. Starting point

Start inside the cloned workshop starter; do not create another project. This
page is a reading example of a precise prompt. In the workshop, use `/wish`
then `/one-shot` instead of pasting it.

## 1. The prompt

> Build the homepage (`src/app/page.tsx`) as a client component implementing a two-panel restaurant ordering demo: a **Menu** on the left and a **Kitchen** on the right, side by side on desktop.
>
> **Global layout**
> - Full-height flex container. Background `zinc-50` in light mode, `black` in dark mode (use Tailwind `dark:` variants throughout).
> - Two rounded-2xl cards (`bg-white` / `dark:bg-zinc-900`) with `shadow-lg`, laid out side by side inside a centered `max-w-5xl` container, with padding and a gap between them. Stack vertically on narrow screens.
>
> **Left panel — "Menu"**
> - Heading: "Menu".
> - A list of 4 menu items. Each row has: a 56×56px rounded thumbnail image, the item name and price formatted as "Name — $X.XX", a one-line muted description below it, and a quantity stepper (a "−" button, the current count, a "+" button).
> - Exact menu data:
>   1. **Nasi Lemak Deluxe** — $8.90 — "Coconut rice, fried chicken, sambal, egg." — image `/menu/nasi-lemak.png`
>   2. **Chicken Rice** — $6.50 — "Poached chicken, fragrant rice, chilli sauce." — image `/menu/chicken-rice.png`
>   3. **Laksa** — $7.20 — "Spiced coconut noodle soup, prawns, tofu puff." — image `/menu/laksa.png`
>   4. **Teh Tarik** — $2.50 — "Hand-pulled milk tea, served hot." — image `/menu/teh-tarik.png`
> - A footer row pinned to the bottom of the card: item count + running total (sum of price × qty) on the left, a pill-shaped "Confirm Order" button on the right.
> - The stepper buttons and "Confirm Order" are disabled whenever an order is currently cooking or ready (locked in), and "Confirm Order" is also disabled when the cart is empty.
>
> **Right panel — "Kitchen"**
> - Heading: "Kitchen".
> - **Idle state** (before any order): centered, a 160×160 illustration at `/kitchen-idle.png`, plus muted caption "Waiting for an order — add items and confirm to start cooking."
> - **Cooking state** (after "Confirm Order" is pressed):
>   - A thin horizontal progress bar (emerald-500 fill on a light track) that fills as stages complete.
>   - A 4-step checklist below it, in order: "Order received", "Preparing ingredients", "Cooking", "Plating". Each step shows a small circular badge: a numbered badge (grey) while pending, a pulsing dark badge while active, and a green checkmark once done. Label text is dim while pending and full-contrast once active/done.
>   - Steps advance automatically on a timer — no user interaction — roughly every 1.4 seconds, one stage at a time.
> - **Ready state** (after all 4 stages complete): a plate emoji/icon, the text "Order ready to serve!", and a "Start New Order" button that resets everything — clears the cart and returns the Kitchen panel to its idle state.
>
> **State & behavior**
> - Cart is a simple `{ itemId: quantity }` map in React state.
> - Use `useState` + `useEffect` with `setTimeout` to drive the stage timer — no backend, no persistence; refreshing the page resets everything to idle.
> - Keep it to a single file, no routing, no navbar/footer chrome — this is a single-screen demo.
>
> **Visual language**
> - Tailwind CSS only. Rounded corners throughout (`rounded-2xl` panels, `rounded-full` buttons/badges). Soft shadows instead of hard borders where possible; subtle `zinc-100` / `dark:zinc-800` dividers where needed.
> - Must look correct in both light and dark OS theme.

## 2. Image assets (to 100% match the visuals)

The prompt above references 5 images that don't exist by default. Generate them (e.g. via an AI image tool) with these prompts, save them at the exact paths named above under `public/`:

**Style prefix, use on all 4 dish photos:**
> "Professional food photography, soft natural studio lighting, shot from a 45° angle, shallow depth of field, plain light-gray seamless background, no text or watermark, warm and appetizing color grade, square 1:1 crop."

- `public/menu/nasi-lemak.png` — "Nasi lemak deluxe on a round white plate: fragrant coconut rice, crispy fried chicken thigh, sambal chili paste, sliced cucumber, roasted peanuts and anchovies, one half soft-boiled egg." + style prefix
- `public/menu/chicken-rice.png` — "Singapore-style chicken rice on a white plate: sliced poached chicken with glossy skin, oiled fragrant rice, a small dish of dark soy and chili-ginger sauce, cucumber garnish." + style prefix
- `public/menu/laksa.png` — "A bowl of laksa: spiced coconut curry noodle soup, thick rice noodles, prawns, fried tofu puff, fish cake slices, bean sprouts, garnished with laksa leaf, steam rising." + style prefix
- `public/menu/teh-tarik.png` — "A tall glass of teh tarik (pulled milk tea) with a thin layer of frothy foam on top, warm caramel-brown color, condensation on the glass, on a plain light-gray background." + style prefix
- `public/kitchen-idle.png` — "A friendly minimal flat-illustration of a hawker chef in a white uniform and cap, mid-stir at a wok, warm orange and teal color palette, clean vector style, transparent or plain light background, no text."

## 3. Why this prompt works (the lesson)

Point this out live in the workshop:

- **It begins with an observable goal** and works backwards to the minimum browser journey.
- **It names the exact data**, not "some menu items" — no ambiguity to fill in with guesses.
- **It specifies states and transitions** (idle → cooking → ready), not just "show progress."
- **It gives concrete timing** (1.4s per stage) instead of "animate it."
- **It constrains scope explicitly** ("single file, no backend, no routing") so the assistant doesn't over-build.
- **It separates content (data/behavior) from asset generation** (images), which is exactly the kind of decomposition that makes AI output predictable.

This is the difference between a prompt that "sort of works" after three follow-ups, and one that one-shots correctly the first time.

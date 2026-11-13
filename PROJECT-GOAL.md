# Project goal

## Goal
Waiters greet and serve new customers within 15 seconds of them sitting down,
without the customer ever having to wave or press a bell.

## Evidence
In one split-screen browser page:

- Left: a restaurant floor map with Tables 1–6. Each table has a
  "Guest Sat" button that simulates the seat sensor.
- Right: two waiter smartband screens, Waiter A and Waiter B.
- When the tester clicks "Guest Sat" on Table 4, both waiter screens flash
  red at the same time with "Table 4: New Guest" and the same live 15-second
  countdown.
- When Waiter A taps "Attending" before the countdown ends:
  - Waiter A's screen turns green and shows "Serving Table 4 (00:08)", where
    the time is how long the guest waited.
  - Waiter B's screen clears the alert straight away and shows
    "Table 4 taken by Waiter A".
- A top bar shows live metrics: Average Response Time (for example 8.0s)
  and Tables Turned.
- After the guest leaves, both watches show a blue "Table 4: Clean Table"
  alert. Once a waiter marks it cleaned, Table 4 is "Available" again and
  Tables Turned goes up by one.

## Required conditions
- Waiter A taps "Attending" before the 15-second countdown reaches zero.
- Both waiter screens show the same alert and the same countdown at the
  same moment.
- Clicking "Guest Sat" changes Table 4 from "Available" to "Needs Greeting".
- Before that click, Table 4 is "Available", and Waiters A and B are both
  "On Shift" and "Idle / Ready". This comes from local sample data.

## Smallest journey
1. The tester opens the page. Tables 1–6 show "Available", and Waiters A and B
   show "On Shift · Idle / Ready".
2. The tester clicks "Guest Sat" on Table 4. Table 4 changes to
   "Needs Greeting", and both waiter screens flash red with
   "Table 4: New Guest" and a 15-second countdown.
3. Within 15 seconds, the tester taps "Attending" on Waiter A's screen.
4. Waiter A shows a green "Serving Table 4 (00:08)". Waiter B shows
   "Table 4 taken by Waiter A". Table 4 on the map shows
   "Served by Waiter A", and Average Response Time updates.
5. The tester clicks "Guest Left" on Table 4. Both watches show a blue
   "Table 4: Clean Table" alert. A waiter taps "Cleaned", Table 4 returns to
   "Available", and Tables Turned goes up by one.

## Later
- What happens when the countdown hits 0 (escalate to a manager, louder alert).
  For now, the watch shows "Overdue" and the waiter can still attend.
- An On Shift / Off Shift toggle for each waiter. For now, both start on shift.
- Choosing the nearest free waiter when several tables alert at once.
- Real seat sensors and real smartbands, kept in sync across devices
  (for example Supabase Realtime).
- More manager stats, such as how many tables missed 15 seconds.

_Updated during /one-shot: the participant asked to add the Guest Left →
Clean → Available cycle and the live metrics bar, which were under Later._

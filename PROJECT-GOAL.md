# Project goal

## Goal
Waiters greet and serve new customers within 15 seconds of them sitting down,
without the customer ever having to wave or press a bell, even in a busy
full-service restaurant with 25 tables and 15 staff.

## Evidence
In one browser page, with no login:

- Top bar: live metrics for Active Tables (for example 8/25), Available Staff
  (for example 13/15), Avg Response Time, and Tables Turned Today. Also a
  "Simulate Rush Hour" button.
- Left: Tables 1–25 in 5-column grids, grouped into Zone A (Tables 1–9),
  Zone B (10–17) and Zone C (18–25). Colours: green = Available,
  amber/red = Needs Greeting with a ticking timer, teal = Dining,
  blue = Needs Cleaning. Each table has one quick button: "Guest Sat" or
  "Guest Left".
- Right: a 15-staff shift roster grouped by zone, showing Available,
  Busy Serving and On Break. Below it are 3 live smartwatch faces:
  Waiter 1 (Zone A), Waiter 2 (Zone B) and Waiter 3 (Runner, all zones).
- When "Guest Sat" is clicked on Table 4 (Zone A), every available Zone A staff
  member is alerted. They light up in the roster, and Waiter 1's watch flashes
  red with "Table 4: New Guest" and a 15-second countdown. Waiter 2 (Zone B)
  is not alerted. If nobody claims it within 8 seconds, the runners are
  alerted too, including Waiter 3's watch.
- When Waiter 1 taps "Attending", the alert clears for everyone straight away.
  Waiter 1 shows "Serving Table 4 (00:05)", becomes Busy Serving in the roster,
  Available Staff drops by one, and Avg Response Time updates.
- "Simulate Rush Hour" makes 4–5 random tables across different zones need
  greeting at once, and each alert goes to its own zone's staff.

## Required conditions
- One waiter taps "Attending" before the table's countdown runs out.
- Each alert reaches the available staff of that table's zone at once, and
  runners after 8 seconds, or straight away if the zone has no one free.
- Clicking "Guest Sat" changes a table from "Available" to "Needs Greeting".
- Before that, the table is "Available" and 13 of the 15 staff are on shift.
  This comes from local sample data.

## Smallest journey
1. The tester opens the page and sees 25 tables in 3 zones, the 15-staff roster,
   and 3 idle watches.
2. The tester clicks "Guest Sat" on Table 4. The Zone A staff light up and
   Waiter 1's watch flashes red with a 15-second countdown. After 8 seconds,
   Waiter 3 (Runner) is alerted too.
3. The tester taps "Attending" on Waiter 1. The alert clears everywhere, Waiter 1
   is Busy Serving, and the metrics update.
4. The tester clicks "Guest Left" on Table 4, then "Cleaned" on a Zone A watch.
   Table 4 is Available again and Tables Turned goes up by one.
5. The tester clicks "Simulate Rush Hour" and sees 4–5 tables across zones
   alerting at the same time, each on the right zone's watch.

## Later
- What happens when a countdown hits 0 (escalate to a manager). For now the
  watch shows "Overdue!" and staff can still attend.
- Letting staff go on or off break from the roster. For now 2 staff are on
  break in the sample data.
- Choosing the nearest free waiter instead of alerting the whole zone.
- Real seat sensors and real smartbands, kept in sync across devices
  (for example Supabase Realtime).
- More manager stats, such as how many tables missed 15 seconds.

_Updated on 13 November 2026: scaled from 6 tables and 2 waiters to 25 tables,
15 staff and 3 zones, with a rush-hour simulation, at the participant's
request._

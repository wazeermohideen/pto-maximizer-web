# PTO Maximizer

Find the workdays to request off for the longest consecutive break around weekends and employer-observed holidays. The planner is pure TypeScript and runs in the browser without an account or API key. The React scaffold uses Vite and shadcn/ui.

## Local setup

Use Node.js 22.12+ on the 22.x line or Node.js 24 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

On Windows PowerShell, use `npm.cmd` if script execution is disabled.

## Worked example

Plan from Friday, September 4 through Monday, September 7, 2026. With one PTO day, Monday listed as an employer-observed holiday, and no blocked workdays, request **Friday, September 4**. The result is **four consecutive days off** with **zero PTO days remaining**.

```ts
planBestBreak({
  startDate: "2026-09-04",
  endDate: "2026-09-07",
  ptoBudget: 1,
  holidays: ["2026-09-07"],
  blockedDates: [],
})
```

`planBestBreak` lives in `src/lib/planner.ts`. It reads `YYYY-MM-DD` dates in an inclusive range and assumes a Monday–Friday workweek. A blocked workday splits the range. Weekends and observed holidays stay off even if they appear in the blocked list. Breaks rank by length, then fewest PTO days used, then earliest start. Zero-PTO breaks are valid. The function returns `null` when no day can be taken off and throws a `RangeError` for invalid dates, reversed ranges, or invalid budgets.

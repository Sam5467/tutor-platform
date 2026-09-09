# Project Setup

Run these in your terminal, one at a time.

## 1. Create the Next.js project
```
npx create-next-app@latest tutor-platform --typescript --tailwind --app --eslint
cd tutor-platform
```
When prompted, accept the defaults (Yes to src/ directory is fine either way - keep note of your choice).

## 2. Set up shadcn (needed for Kokonut UI + Bklit UI to install into)
```
npx shadcn@latest init
```

## 3. Register Kokonut UI and Bklit UI's component sources
Open `components.json` (created in step 2) and add this under a `"registries"` key:
```json
{
  "registries": {
    "@kokonutui": "https://kokonutui.com/r/{name}.json",
    "@bklit": "https://bklit.com/r/{name}.json"
  }
}
```
(If `registries` doesn't exist yet in that file, just add the whole block.)

## 4. Install the specific components we picked
```
npx shadcn@latest add @kokonutui/shape-hero
npx shadcn@latest add @bklit/bar-chart
```

## 5. Install animation/scroll libraries
```
npm install motion lenis
```

## 6. Install fonts
No install needed - we'll use `next/font/google` for Fraunces + Inter, built into Next.js.

---
Once these are done, I'll give you the actual page files to drop into the project.

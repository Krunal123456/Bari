About Page CMS (Firestore)

Collection: `pages`
- Document: `about`

Document fields (recommended structure):
- `hero` (map)
  - `title`: string
  - `subtitle`: string
  - `intro`: string
  - `backgroundImage`: string (URL)
- `history`: array of maps
  - each item: `{ year?: string, title: string, description: string }`
- `vision`: map `{ title?: string, statement: string }`
- `mission`: map `{ title?: string, statement: string }`
- `features`: array of maps
  - each item: `{ id: string, title: string, description: string }`
- `governance`: map `{ intro: string }`
- `values`: array of strings
- `future`: array of strings

Admin update workflow:
1. Admins authenticate using the Bari Samaj Admin Portal.
2. Admin edits the About page content using the admin UI which validates fields.
3. Admin saves changes — writes are made to `pages/about` in Firestore.
4. Content updates appear on the PWA for all users; clients fetch live content on page load.

Security and privacy guidance:
- Restrict writes to `pages/*` to authenticated admin roles via Firestore security rules.
- Keep personal or sensitive data out of this page; link to protected areas for member-only content.

Notes for developers:
- The front-end uses `src/services/aboutService.ts` to fetch `pages/about`.
- Provide image assets via storage URLs or a trusted CDN and store the URL in `hero.backgroundImage`.

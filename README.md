# Friendsgiving on Netlify

This is the source for the Friendsgiving invitation, RSVP form, and potluck list. The frontend calls a Netlify Function at `/api/entries`. That function stores each RSVP and dish as a separate record in Netlify Blobs. Netlify supplies the storage connection when the function runs on your site.

## Deploy with Git

1. Unzip `friendsgiving-netlify.zip`.
2. Put the extracted files at the root of a Git repository and push it to a Git provider connected to Netlify.
3. In Netlify, import the repository as a new project and deploy it. Leave the base directory at the repository root. The included `netlify.toml` sets Node 22, the build command (`npm run build`), the publish directory (`dist`), and the functions directory (`netlify/functions`).
4. Open the deployed URL and check that the RSVP and potluck lists load. Real submissions will appear across browsers and devices that can access the site.

Use the source repository or the CLI to deploy. Dragging only the built `dist` folder into Netlify will omit the function and the forms won’t save.

## Deploy without Git

With Node 22.12 or later installed, run these commands in the extracted folder. If you haven't created a Netlify project yet, follow the CLI prompt to create or select one.

```sh
npm ci
npx netlify-cli@latest deploy --build --prod
```

## Storage and access

- The store is created automatically on the first successful submission. You do not need an external database, API key, or environment variables.
- The Netlify site starts with an empty RSVP and potluck list. Records from the ChatGPT-hosted invite are separate and are not included in this ZIP.
- Records are tied to the Netlify project and survive redeploys of that project. A new Netlify project has its own store.
- The invite contains the event address and displays submissions to people who can open the site. If you want guest-only access, enable site-wide visitor protection in Netlify before sharing the URL. The included no-index tag does not restrict access.

For platform details, see [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) and [Netlify CLI deploy](https://cli.netlify.com/commands/deploy/).

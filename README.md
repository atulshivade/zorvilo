# Zorvilo — brand website

Static marketing site for the Zorvilo beverage range: energy, soft drinks, fruit
drinks, aloe vera juices and 0.0% brews. Plain HTML, CSS and JavaScript with no
build step, so the folder in `website/` is exactly what gets served.

## Layout

```
website/            the site itself — this folder is what gets published
  index.html        home
  products.html     full catalogue with range filtering
  energy.html       hero product page (ingredients, nutrition, multipack)
  about.html        company, quality and compliance
  contact.html      stockist / distributor enquiry form
  assets/css/       design tokens and all styling
  assets/js/
    products.js     single source of truth for all 21 SKUs
    main.js         nav, scroll reveal, catalogue rendering, filters, modal
  assets/img/       generated product imagery (do not edit by hand)
  tools/
    prepare_assets.py   regenerates assets/img from the original photos
source-photos/      original product photography (input to the script above)
```

## Run it locally

```bash
cd website
python -m http.server 8080
```

Then open <http://127.0.0.1:8080>.

## Changing product copy or specs

Everything in the catalogue and the product modals comes from
`website/assets/js/products.js`. Edit a product there and both the grid and its
detail modal update — no HTML changes needed.

## Regenerating the imagery

The product shots are cut out of the original studio line-ups by a script, so
the tiles stay visually consistent. Re-run it only if the photography changes:

```bash
pip install pillow numpy scipy
cd website
python tools/prepare_assets.py
```

Note that the fruit-drink line-up uses crop windows measured off that specific
photo; replacing it means re-measuring them (the script fails loudly if the
source is no longer 1536 px wide).

## Publishing to Cloudflare Pages

The site is plain static files, so Cloudflare needs no build step. `wrangler.toml`
already declares `website/` as the output directory.

Connect the repository once in the Cloudflare dashboard — **Workers & Pages →
Create → Pages → Connect to Git** — and pick this repo. If the settings are not
picked up from `wrangler.toml`, set them by hand:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `website` |

After that, every push to `main` publishes automatically.

To deploy straight from this machine instead:

```bash
npx wrangler login          # one-time, opens a browser
npx wrangler pages deploy website --project-name=zorvilo
```

## Publishing the draft for client review

The site deploys to GitHub Pages automatically via
`.github/workflows/pages.yml` on every push to `main`.

One-time setup on GitHub: **Settings → Pages → Build and deployment → Source:
GitHub Actions**. After the first green run the draft is live at
`https://<your-username>.github.io/<repo-name>/`.

If the repository is private, GitHub Pages is public only on paid plans; on a
free account either make the repository public or share a local preview
instead.

`website/robots.txt` currently blocks search engines so the draft cannot be
indexed while the client reviews it. **Delete that file before launch.**

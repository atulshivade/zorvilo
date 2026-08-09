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
    prepare_assets.py   regenerates product imagery from the original photos
    prepare_logo.py     regenerates the logo and favicon from the logo PDF
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

The logo is generated separately from `Zorvilo LOGO (PDF)TM.pdf`:

```bash
python tools/prepare_logo.py
```

That produces `logo.svg` (dark), `logo-white.svg` (for dark backgrounds), PNG
copies for anywhere SVG will not do, and `favicon.png` cut from the leading "z".

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

Search engines are now allowed in via `website/robots.txt`, which points at
`website/sitemap.xml`. Add a page to the sitemap whenever you add one to the
site — nothing generates it automatically.

## Custom domain: zorvilo.in

`website/CNAME` holds the domain. It ships inside the published artifact because
a GitHub Actions deploy replaces the whole site on every run — without the file
in the build output, GitHub drops the custom domain and the site falls back to
the `github.io` address.

The domain is registered at GoDaddy, so the records go in **Domain Portfolio →
zorvilo.in → DNS**. An apex domain cannot use a CNAME, hence the four A records;
the IPv6 records are optional but let the site answer on networks without IPv4.

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `atulshivade.github.io.` |

Delete GoDaddy's default parking records first (the `@` A record pointing at a
GoDaddy IP and any `www` CNAME to `_domainconnect` or a parking host), otherwise
they compete with the ones above.

Then set **Settings → Pages → Custom domain** to `zorvilo.in`, wait for the DNS
check to pass, and tick **Enforce HTTPS**. The certificate is issued by Let's
Encrypt and can take up to an hour; until it exists, HTTPS will warn.

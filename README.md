# Lee Lab website

The website of the Single Cell Neurogenomics Group at the Icahn School of Medicine at Mount Sinai: [leelab.us](https://leelab.us).

Built with Jekyll for GitHub Pages. No JavaScript framework or Node build step is required.

## Local preview

```sh
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000. To build without serving, run `bundle exec jekyll build`.

## Content

- **News:** add dated Markdown files in `_posts/`. Each story has its own page and appears in the news archive and RSS feed. Cover stories use `badge: cover`, `journal`, `card_summary`, `cover_image`, `cover_alt`, `cover_credit` and `issue_url`. The newest two cover stories are featured consecutively on the homepage.
- **Research:** `_data/zones.yml` and `pages/research.html`.
- **People:** `_data/team.yml`; photographs in `assets/img/team/`.
- **Publications:** `_data/publications.yml`. Use `featured` for selected work and `tags` for search filters. List all equal-contribution authors in the citation when possible.
- **Resources:** `_data/software.yml`.
- **Recruitment:** `_data/jobs.yml` and `pages/jobs.html`. Set a job’s `status` to `open` to accept inquiries.
- **PI profile:** `pages/pi.html` and `_data/career.yml`.
- **Contact, navigation and links:** `_config.yml`.

Shared markup lives in `_includes/` and `_layouts/`; site styles in `_sass/`; browser behavior in `assets/js/main.js`. The homepage illustration is conceptual, not experimental data. Publication and cover credits are listed at `/credits/`.

## Repository hygiene

`STAGING/` is a private source-asset workspace. Copy only assets used by the site into `assets/`. Build output, dependency folders, local workspace configuration and preview artifacts are excluded from version control and from the published site. Never add credentials or environment files.

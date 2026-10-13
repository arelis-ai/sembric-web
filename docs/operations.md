# Operations

## Deploy

Merge to `main`. The Deploy workflow verifies, builds, pushes `europe-west3-docker.pkg.dev/arelis-sembric-web/site/sembric-web:<sha>`,
deploys that image by digest, checks the serving revision, then runs `scripts/smoke.sh https://sembric.app.arelis.digital`.
Run it manually with **Actions → Deploy → Run workflow** on `main`.

## Roll back

Every deploy creates an immutable Cloud Run revision. To return traffic to a previous one:

```bash
gcloud run revisions list --service sembric-web --region europe-west3 --project arelis-sembric-web
gcloud run services update-traffic sembric-web --to-revisions <revision>=100 --region europe-west3 --project arelis-sembric-web
```

Then revert the offending commit on `main`; the next deploy sends traffic to the new revision again.

## Verify the live site

```bash
bash scripts/smoke.sh https://sembric.app.arelis.digital
E2E_BASE_URL=https://sembric.app.arelis.digital npm run test:e2e
npx @lhci/cli@0.15.1 collect --url=https://sembric.app.arelis.digital/ --numberOfRuns=3
```

## Monitoring

An uptime check requests `https://sembric.app.arelis.digital/` every five minutes and expects the home page text.
Load-balancer request logs are enabled. The project budget alerts at 50 %, 90 % and a forecast of 100 %.

## Routine changes

- **Content:** edit `src/pages` or `src/content`, bump `SITE.updated` in `src/site.ts`, open a PR with screenshots.
- **Theme script:** changing `THEME_SCRIPT` changes its CSP hash; the build regenerates the nginx snippet and
  `tests/headers.test.ts` keeps them in step.
- **security.txt** renews its one-year `Expires` on every build; deploy at least yearly.
- **Dependencies:** Dependabot opens weekly PRs; CI (including the image scan and Lighthouse budgets) must pass.

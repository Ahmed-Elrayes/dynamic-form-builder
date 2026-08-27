# dynamic-form-builder — Release Process

Releases publish to npm from `prod` only. Never tag or release directly off `master`.

1. Land all work on `master` (default branch) as normal commits/PRs.
2. Bump `package.json` version, commit, push to `master`.
3. Open a PR from `master` → `prod`. `prod` is branch-protected (1 review required, no force-push, no deletion) — get it merged.
4. Only after the merge into `prod`: tag the `prod` HEAD as `vX.Y.Z`, push the tag, then `gh release create vX.Y.Z`.
5. `.github/workflows/publish.yml` triggers on the `v*` tag push, but first verifies the tagged commit is an ancestor of `origin/prod` — it fails the job (no publish) if the tag doesn't trace back to prod. This is the enforcement backstop if step 3 gets skipped.

npm version numbers can never be reused, even after `npm unpublish` (permanent registry lock) — if a release needs a redo, bump to the next patch/minor version instead of retagging the same one.

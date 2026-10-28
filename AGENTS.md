# Agent Instructions

## Changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and only covers changes that reach package users: the library in `src/lib`. Site, docs, test, CI and chore changes stay out.

- When committing a user-facing library change, add an entry under `## [Unreleased]` in the same commit. Write it for someone using the package, not as the commit subject.
- Put breaking changes under `### Breaking changes` at the top of the version, each with a migration note (e.g. "Replace `blur={false}` with `blurIntensity={0}`").
- Other groups, in this order: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. Leave out empty groups.

## Releases

In the `chore(release): vX.Y.Z` commit, also update `CHANGELOG.md`:

1. Run `pnpm changelog`. It prints a draft of the next version's section from the commits since the last tag, with the version git-cliff computes. Check that every entry in the draft is covered under `Unreleased`, and add any that are missing. Don't paste the draft as is; it lists commit subjects, not user-facing notes.
2. Rename `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD` with the release date, and add an empty `## [Unreleased]` above it.
3. Update the compare links at the bottom: `[Unreleased]` compares `vX.Y.Z...HEAD`, and a new `[X.Y.Z]` line compares the previous tag with `vX.Y.Z`.

Pushing the `vX.Y.Z` tag runs `.github/workflows/release.yml`. It publishes to npm through trusted publishing, skipping versions already on npm, and creates the GitHub Release from the version's section of `CHANGELOG.md`. It fails when the tag isn't on `main`, doesn't match `package.json`, or has no changelog section. Don't run `npm publish` or `pnpm publish` locally once the package is on npm.

Releases are immutable: once the workflow creates a tag's GitHub Release, the tag can't be moved or deleted. Tag only the release commit as it appears on `main` after the pull request is merged. A tag that failed the workflow's checks has no release yet and can still be deleted and recreated.

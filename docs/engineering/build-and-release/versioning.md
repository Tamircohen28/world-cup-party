# Versioning and release

This repo follows [Semantic Versioning](https://semver.org/).

## Bump rules (summary)

| Bump | When |
|------|------|
| PATCH | Bug fixes, docs-only |
| MINOR | Backward-compatible features |
| MAJOR | Breaking API or workflow changes |

## Release checklist

1. Update `docs/CHANGELOG.md` and root `CHANGELOG.md`
2. Bump `package.json` version
3. `git tag -a vX.Y.Z -m "vX.Y.Z"` and push the tag
4. Open GitHub Release from changelog notes

## Validate

```bash
VER=$(jq -r .version package.json)
git tag -l "v${VER}" | grep -q . || echo "missing tag v${VER}"
```

.PHONY: install update uninstall dev build lint lint-fix typecheck test test-coverage preview clean \
	agent-check check-agent-drift check-feature-equivalence check-platform-targets \
	platform-targets-sync platform-targets-assert agent\:check agent-polish-gate

install:
	npm ci

update:
	npm update

uninstall:
	rm -rf node_modules dist node_modules/.vite

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

lint-fix:
	npm run lint:fix

typecheck:
	npm run typecheck

test:
	npm run test

test-coverage:
	npm run test:coverage

preview:
	npm run preview

clean:
	rm -rf dist node_modules/.vite

agent-check:
	npm run agent:check

check-agent-drift:
	npm run agent:check

check-feature-equivalence:
	bash scripts/check-feature-equivalence.sh .

check-platform-targets:
	bash scripts/check-platform-targets.sh .

platform-targets-sync:
	bash scripts/check-platform-targets.sh . --sync

platform-targets-assert:
	bash scripts/check-platform-targets.sh . --assert-current

agent\:check: check-agent-drift check-feature-equivalence check-platform-targets

agent-polish-gate: platform-targets-sync platform-targets-assert agent\:check

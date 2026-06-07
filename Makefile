.PHONY: install dev build lint lint-fix typecheck test test-coverage preview clean

install:
	npm install

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

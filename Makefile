.PHONY: install dev build lint lint-fix preview clean

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

preview:
	npm run preview

clean:
	rm -rf dist node_modules/.vite

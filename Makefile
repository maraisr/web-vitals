# This file used by CLoudflare Pages to
# a. install pnpm
# b. build the site

.PHONY: build
build: install
	@pnpm -r run build --filter=site

.PHONY: install
install:
	@npm install -g pnpm
	@pnpm install

# This file used by CLoudflare Pages to
# a. install pnpm
# b. build the site

SHELL := /bin/bash

build: install
	@pnpm -r run build --filter=site

install:
	@npm install -g pnpm
	@pnpm install

.PHONY: build install

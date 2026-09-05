# Changelog

All notable changes to Xiaomi Fan Card will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and uses
[Conventional Commits](https://www.conventionalcommits.org/).

## [1.1.4](https://github.com/mrwogu/xiaomi-smart-fan-card/compare/v1.1.3...v1.1.4) (2026-09-05)


### Bug Fixes

* honor verified fan integration contracts ([#61](https://github.com/mrwogu/xiaomi-smart-fan-card/issues/61)) ([8cb9b6b](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/8cb9b6b986b06f2bfb1e21e72ab8694fbf741f72))
* support P76 Miot property controls ([#60](https://github.com/mrwogu/xiaomi-smart-fan-card/issues/60)) ([b21119d](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/b21119db4e0f17fa30b62046959436ed8ae8fd5d))

## [1.1.3](https://github.com/mrwogu/xiaomi-smart-fan-card/compare/v1.1.2...v1.1.3) (2026-09-04)


### Bug Fixes

* **card:** size sections grid to the rendered card height ([#58](https://github.com/mrwogu/xiaomi-smart-fan-card/issues/58)) ([097af6f](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/097af6fca9c9ebb4a8469340ecc7551f067b90ed))
* show position pad from Xiaomi Home turn buttons ([#57](https://github.com/mrwogu/xiaomi-smart-fan-card/issues/57)) ([7a9aee2](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/7a9aee2ab97a317534d61c2f88cce74cc67c761d))

## [1.1.2](https://github.com/mrwogu/xiaomi-smart-fan-card/compare/v1.1.1...v1.1.2) (2026-08-17)


### Bug Fixes

* **editor:** allow multi-digit visual sizes ([#30](https://github.com/mrwogu/xiaomi-smart-fan-card/issues/30)) ([52a3068](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/52a3068cda10a539bd428432f03a4c3d25ef8dd8))
* improve Xiaomi fan compatibility ([#29](https://github.com/mrwogu/xiaomi-smart-fan-card/issues/29)) ([9302fd0](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/9302fd0bad25d885683fade3cf86e2eb1082248a))

## [1.1.1](https://github.com/mrwogu/xiaomi-smart-fan-card/compare/v1.1.0...v1.1.1) (2026-08-16)


### Bug Fixes

* make fan controls capability aware ([#27](https://github.com/mrwogu/xiaomi-smart-fan-card/issues/27)) ([bcdc5cd](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/bcdc5cda608e334651dc531aca2285e13eb0dcdc))

## [1.1.0](https://github.com/mrwogu/xiaomi-smart-fan-card/compare/v1.0.0...v1.1.0) (2026-08-15)


### Features

* **visual:** add configurable fan size ([55fc91e](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/55fc91efb585628cb1df750102aefb0ef4005be1))


### Bug Fixes

* **release:** restore semantic release flow ([6f8cc6d](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/6f8cc6d3cf278f2252723f8765f63c5be6bc7224))

## [1.0.0](https://github.com/mrwogu/xiaomi-smart-fan-card/compare/v0.1.0...v1.0.0) (2026-08-14)


### Features

* **card:** add configurable layout and styling ([7ac5492](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/7ac5492597e48dfb25ef93e63f36b84b272bcb91))
* **card:** compact angle controls ([4adfd1d](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/4adfd1dab798ef680c572ac2df51c73e42f54909))
* **card:** full header defaults, cycle modes, accent token ([8bd740f](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/8bd740f2891c40d0e0f8007fa33e2f8afa31953c))
* **card:** keep capabilities through a Home Assistant reconnect ([6df6f7c](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/6df6f7c661361f1aed88948b3ce96899fc3cdacc))
* **card:** keep the industrial theme amber ([2b6c5f2](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/2b6c5f2814a5d0fa6f27b271c054284845d67530))
* **card:** keep the power button readable while the fan is off ([c0c5336](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/c0c5336733992a5fcd759429c977f95c8c40bfc9))
* **card:** localize visual editor ([191e7cf](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/191e7cf8e756bb8e68b1de6f73c66c3294133b0e))
* **card:** match live P76 oscillation and speed behavior ([91a633c](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/91a633c44c3795972d7672dcf4b266e7c2e1f8a3))
* **card:** modernize card design and visual editor ([a899dd8](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/a899dd8d99101fc944ff7250cd882e983a395cc2))
* **card:** overhaul configuration and controls ([a8e1f8e](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/a8e1f8eb7984111af8cc47034734eb3be9e8fc13))
* **card:** preserve theme control radii ([cf78b3e](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/cf78b3edfcbbe6ab819dba0894ac7281ca319494))
* **card:** refine controls and config docs ([2463bcc](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/2463bcc6c1070c643da58957834fcad5817f332a))
* **card:** restore visible control surfaces ([db00109](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/db001091cafb89ec59f854dc780ad05b0fe86d75))
* **ci:** check out repo before codecov upload ([55bfbf7](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/55bfbf7c0ee01daf3fe48baa23a236e19b84ca5e))
* **ci:** exclude generated changelog from format check ([e1d750d](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/e1d750dd90c95ca844596cdc3e504a814fb82e48))
* **ci:** skip CodeQL for private repo ([3243425](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/3243425f79fe12f1cead3ad39f25e98c26f34388))
* **ci:** skip HACS validation for private repo ([20a73d6](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/20a73d61d69115a35c7573468beadca459c4a0ed))
* **ci:** stabilize coverage and HACS validation ([983ec8b](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/983ec8b05724ac48c7bc4da5e09095f680180cc6))
* **i18n:** add Home Assistant translations ([c00305e](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/c00305e7ca654ace2fcd1328e0e41b8767dd8b2c))
* prepare HACS card for open source ([5abf597](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/5abf597c79b0f9c4936c1bd4dd10521763e1aa4a))
* **release:** correct manifest package map ([027d8cb](https://github.com/mrwogu/xiaomi-smart-fan-card/commit/027d8cbd7973671f4e4d90e706126b9881d0d80d))

## [Unreleased]

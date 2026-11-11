# [0.5.0](https://github.com/labcabrera/rmu-api-items/compare/0.4.0...0.5.0) (2026-11-11)


* feat!: global items only for admins (spec 073) ([d718f79](https://github.com/labcabrera/rmu-api-items/commit/d718f797282727b9c029801ceda72b09e2a422a4))
* feat!: realm scoped access for items ([859b524](https://github.com/labcabrera/rmu-api-items/commit/859b5244c56731297407505f0ac3ca59c980635f))


### Features

* items with a realm need the user to read it (spec 071) ([9a47152](https://github.com/labcabrera/rmu-api-items/commit/9a47152556f7ab775f9bca6b841ba8faa54a6b17))
* serve the superior materials ([cea71d1](https://github.com/labcabrera/rmu-api-items/commit/cea71d140f79808429c4cf00d6c9b6236f5247e3))
* serve the trading and treasure tables ([b4e4412](https://github.com/labcabrera/rmu-api-items/commit/b4e44122e60223194c5973c2ef430bee7c5f1f4e))


### BREAKING CHANGES

* non-admins can no longer create or change items without realm; their owner no
longer manages them.
* items of a realm are no longer listed or readable without access to the
realm, their owner can no longer change them without write on the realm, creating in a
realm needs write (403 realm-not-writable) and responses carry access. Requires core with
GET /v1/realms/access.

# [0.4.0](https://github.com/labcabrera/rmu-api-items/compare/0.3.2...0.4.0) (2026-11-02)


### Bug Fixes

* check item modifiers on creation and update ([50c3848](https://github.com/labcabrera/rmu-api-items/commit/50c3848b0f2c90bcaae77c86575c4345cd88a777))
* fumble table ids of rmu-api-attack-tables (spec 034) ([dfb9ba8](https://github.com/labcabrera/rmu-api-items/commit/dfb9ba8ed4961641d2f488b89a1cee7f3e386662))
* give the Kafka consumer its own group ([6f9c5e3](https://github.com/labcabrera/rmu-api-items/commit/6f9c5e370f6f69f5981185ce4e294101136a018b))
* publish item.updated on a PATCH and keep the modifier changes consistent ([5e52b84](https://github.com/labcabrera/rmu-api-items/commit/5e52b84af8a3aec51618b5379a9cbb176048aa16))
* **rsql:** accept the verbose comparison operators =lt=, =le=, =gt= and =ge= ([b8c8c78](https://github.com/labcabrera/rmu-api-items/commit/b8c8c788f0db5db453d5d8027914e713b9ae9ccd))
* take the producer of the events from RMU_KAFKA_CLIENT_ID ([e4b2ee9](https://github.com/labcabrera/rmu-api-items/commit/e4b2ee9d6d78d77182c9c09dcc8d1f7f4e2411f3))
* validate request bodies without implicit conversion ([5a74b3a](https://github.com/labcabrera/rmu-api-items/commit/5a74b3abb1ff620521ab2602e8b5a5d6bd418a72))
* validate the nested data of items, the modifiers and the realm id ([a92f885](https://github.com/labcabrera/rmu-api-items/commit/a92f885c3a3b9c6cb840e428a1a2f61918209dd6))


### Features

* add read-only script that lists items with invalid modifiers ([d503d9d](https://github.com/labcabrera/rmu-api-items/commit/d503d9d081a08f3411490f9cd65634a0eb80a3bc))
* add tags to the weapon types (spec 032) ([fc33a18](https://github.com/labcabrera/rmu-api-items/commit/fc33a18229c59fd98ba3d8d3541b9a6423c4f039))
* add treasure law goods categories and features (spec 062) ([e67af60](https://github.com/labcabrera/rmu-api-items/commit/e67af60341b77690a67a4dd393be24c7f401d1a2))
* adopt the api-core HTTP contract and repository (spec 020) ([bd494ed](https://github.com/labcabrera/rmu-api-items/commit/bd494edc1542e532641c935db9caffde5561fe7c))
* **auth:** validate token issuer and audience ([56a43dd](https://github.com/labcabrera/rmu-api-items/commit/56a43dda55e135b06183b42a7d988c87c9457890))
* check who creates, changes and deletes items ([a61117d](https://github.com/labcabrera/rmu-api-items/commit/a61117d35d05d1f000a5edd5e32995e7d3bd4d38))
* get /v1/info with the name and version of the api ([c614f9f](https://github.com/labcabrera/rmu-api-items/commit/c614f9f52882e72632be2e858efac88cd3fe3530))
* **items:** entitySource on items, admin only for system items (spec 063) ([6e1be4b](https://github.com/labcabrera/rmu-api-items/commit/6e1be4bdb9b9a4b0b2b838562b7b76498339e494))
* **items:** general equipment categories and blocks, full suits, armor classes (spec 041) ([87ab4f9](https://github.com/labcabrera/rmu-api-items/commit/87ab4f9ab63a74b817f2d40ccc72365f38568bca))
* **items:** magic block and potion and spell-item categories (spec 067) ([c8ab44c](https://github.com/labcabrera/rmu-api-items/commit/c8ab44c8a4f89d483dc24c9ba324540423919543))
* **items:** poison and herb categories with poison and antidote data (spec 042) ([7ea8a3d](https://github.com/labcabrera/rmu-api-items/commit/7ea8a3ddca757af487fcc1212711a589c191191c))
* **shared:** entity source permissions in the base guard (spec 063) ([5417203](https://github.com/labcabrera/rmu-api-items/commit/5417203d9308a03253792dfa67f6e5a63985a361))
* use the common HttpClient with a timeout for the calls to core and Keycloak ([324a126](https://github.com/labcabrera/rmu-api-items/commit/324a126b274c3a692c693d50bfb57beffb26b8bc))

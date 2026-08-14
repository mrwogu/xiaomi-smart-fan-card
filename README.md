# Xiaomi Fan Card

[![CI](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/ci.yml/badge.svg)](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/ci.yml)
[![HACS validation](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/hacs.yml)
[![codecov](https://codecov.io/gh/mrwogu/xiaomi-smart-fan-card/branch/main/graph/badge.svg)](https://codecov.io/gh/mrwogu/xiaomi-smart-fan-card)
[![Latest release](https://img.shields.io/github/v/release/mrwogu/xiaomi-smart-fan-card)](https://github.com/mrwogu/xiaomi-smart-fan-card/releases)

Modern, capability-aware Lovelace card for Xiaomi fans and standard Home
Assistant `fan` entities.

The card gives your fan one focused control surface while respecting the
capabilities exposed by Home Assistant. It does not communicate with Xiaomi
devices directly. Your selected Home Assistant integration remains responsible
for device communication.

> **Privacy first:** this card has no telemetry, analytics, remote scripts, or
> direct device connection. All actions go through Home Assistant.

## Install in HACS

The easiest installation is through the Home Assistant Community Store.

1. Open **HACS** in Home Assistant.
2. Open **Frontend** and search for **Xiaomi Fan Card**.
3. Select the card and choose **Download**.
4. Reload the browser or restart Home Assistant if HACS asks you to.
5. Add a `custom:xiaomi-fan-card` card to a dashboard.

[![Open Xiaomi Fan Card in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=mrwogu%2Fxiaomi-smart-fan-card)

Before HACS approval, add
`mrwogu/xiaomi-smart-fan-card` as a custom repository with category
**Dashboard**. The HACS backend calls this category `plugin`.

### Manual resource registration

HACS normally registers the resource. If your installation requires manual
registration, add this module resource under **Settings > Dashboards >
Resources**:

```yaml
resources:
  - url: /hacsfiles/xiaomi-smart-fan-card/xiaomi-fan-card.js
    type: module
```

## Quick start

```yaml
type: custom:xiaomi-fan-card
entity: fan.xiaomi_smart_standing_fan
name: Living Room Fan
theme: auto
```

## Languages

The card and its visual editor follow Home Assistant's language setting from
`hass.language`. Regional codes such as `pl-PL` use the base language. Unsupported
languages fall back to English.

| Language | Home Assistant code | Card UI | Visual editor |
| -------- | ------------------- | ------- | ------------- |
| English  | `en`                | Yes     | Yes           |
| Polish   | `pl`                | Yes     | Yes           |
| Spanish  | `es`                | Yes     | Yes           |
| French   | `fr`                | Yes     | Yes           |
| Italian  | `it`                | Yes     | Yes           |

## See it in action

The HACS panel renders this README as the repository landing page. Replace the
media slots below with real, redacted screenshots and a short recording before
the first public showcase.

| Card overview screenshot                                                                                                                                        | Interaction animation                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Screenshot slot**<br>Save a clean dashboard capture as `docs/media/card-overview.png`. Show the default theme, fan name, current state, and primary controls. | **Animation slot**<br>Save a short reduced-size recording as `docs/media/card-controls.gif` or `docs/media/card-controls.webm`. Show slider, oscillation, and optional controls. |

<!--
Media embed slot:

![Xiaomi Fan Card overview](docs/media/card-overview.png)

Animation embed slot:

![Xiaomi Fan Card controls](docs/media/card-controls.gif)

Only publish screenshots with redacted entity names, hostnames, locations,
device identifiers, tokens, and personal dashboard information.
-->

## What it supports

- Original airflow visualization with reduced-motion support
- Dynamic speed slider and model-specific speed levels
- Normal and Natural mode shortcuts when available
- Generic preset mode selector for other fan modes
- Horizontal oscillation and angle controls
- Vertical oscillation and angle controls when available
- Direction nudge controls for integrations that expose them
- Forward and reverse direction for standard fan entities
- Timer, sleep preset, child lock, LED, buzzer, and ionizer controls when actionable
- Temperature and humidity telemetry from the fan or related sensors
- Favorite level control from native Xiaomi `number` entities
- Auto, Mushroom, Minimal, Glass, and Industrial themes
- Lovelace visual editor

Controls are shown only when the primary entity, related entities, model
profile, or registered service makes them actionable.

## Supported integrations

### Native Xiaomi Home (`xiaomi_miio`)

The official Home Assistant Xiaomi Home integration supports Xiaomi standing
fans through standard fan actions such as:

- `fan.turn_on`, `fan.turn_off`, and `fan.toggle`
- `fan.set_percentage`
- `fan.set_preset_mode`
- `fan.oscillate`
- `fan.set_direction` when exposed by the entity

The integration can also expose related `switch`, `number`, `select`, and
`sensor` entities for controls and telemetry such as LED, buzzer, child lock,
favorite level, temperature, and humidity. The card discovers those entities
through the Home Assistant device registry.

Documentation:
[Xiaomi Home integration](https://www.home-assistant.io/integrations/xiaomi_miio)

### `xiaomi_miio_fan`

The card supports the custom
[syssi/xiaomi_fan](https://github.com/syssi/xiaomi_fan) integration and its
Xiaomi-specific services for angle, vertical oscillation, nudge, timer, LED,
buzzer, child lock, and ionizer controls.

Set `integration: xiaomi_miio_fan` to enable these custom services. `auto`
stays on standard fan actions unless this integration is selected explicitly.

### `xiaomi_miot` and standard fan entities

Select `xiaomi_miot` or `standard` when another integration exposes a normal
Home Assistant fan entity. Standard fan actions always take precedence.
Related entity discovery and optional manual entity overrides cover
integration-specific controls without assuming custom Xiaomi services.

## Model coverage

Known profiles include `zhimi.fan.*`, `dmaker.fan.*`, `xiaomi.fan.*`, and
`leshow.fan.ss4`, including Xiaomi 1C, 2 Lite, P30, P43, P45, P70, P76, and
P85 families.

Unknown Xiaomi fan models use a safe fallback profile and derive controls from
live entity attributes, related entities, and the Home Assistant service
registry. If a control is not exposed by your integration, the card hides it
instead of presenting a non-working action.

## Configuration

The visual editor exposes the same nested groups as YAML. Nested values take
precedence over legacy top-level flags.

```yaml
type: custom:xiaomi-fan-card
entity: fan.xiaomi_smart_fan
integration: auto
layout:
  theme: mushroom
  density: comfortable
  columns: auto
header:
  variant: compact
  show: true
  show_name: true
  show_status: true
  show_mode: false
visual:
  show: true
  show_graphic: true
  show_power: true
  show_speed: true
  show_details: true
  animation: auto
controls:
  show: true
  selection_mode: auto
  timer_mode: select
  show_speed_slider: true
  show_speed_levels: true
  show_horizontal_swing: true
  show_vertical_swing: true
  show_timer: true
details:
  show: true
  show_horizontal_angle: true
  show_vertical_angle: true
  show_timer: true
  show_temperature: true
  show_humidity: true
related_entities:
  timer_entity: number.xiaomi_fan_timer
  led_entity: select.xiaomi_fan_led
```

### Nested groups

| Group              | Main options                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `header`           | `show`, `variant`, `show_eyebrow`, `show_name`, `show_status`, `show_mode`, `show_model`                    |
| `visual`           | `show`, `show_graphic`, `show_power`, `show_speed`, `show_details`, `animation`                             |
| `controls`         | `show`, speed and mode flags, swing and angle flags, optional feature flags, `selection_mode`, `timer_mode` |
| `details`          | `show`, `show_horizontal_angle`, `show_vertical_angle`, `show_timer`, `show_temperature`, `show_humidity`   |
| `layout`           | `theme`, `density` (`comfortable` or `compact`), `columns` (`auto`, `one`, `two`)                           |
| `related_entities` | Manual entity IDs for optional controls and sensors                                                         |

`selection_mode` is `auto`, `buttons`, or `select`. `timer_mode` is `select` or
`cycle`. The default header is compact and hides the eyebrow, model, and mode
until enabled.

Timer controls use minutes. Related numeric timer entities with
`unit_of_measurement` set to `s`, `sec`, `second`, or `seconds` are converted
to and from minutes. Other or missing units are treated as minutes. The card
preserves a live timer value that is not one of the configured steps.

For Xiaomi LED brightness controls, the custom Xiaomi service contract is
`0` for bright, `1` for dim, and `2` for off. A related
`*_led_brightness` number with a `0..2` range uses the same mapping. Other
switch, select, and number entities use their exposed Home Assistant
contract.

| Key                       | Default     | Description                                                                                                                     |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `entity`                  | required    | Fan entity                                                                                                                      |
| `name`                    | entity name | Card title                                                                                                                      |
| `theme`                   | `auto`      | `auto`, `mushroom`, `minimal`, `glass`, `industrial`                                                                            |
| `integration`             | `auto`      | `auto` uses standard fan actions; select `standard`, `xiaomi_miio`, `xiaomi_miio_fan`, or `xiaomi_miot` for an explicit adapter |
| `disable_animation`       | `false`     | Disable decorative motion                                                                                                       |
| `show_sleep`              | `true`      | Show a sleep preset when exposed                                                                                                |
| `show_timer`              | `true`      | Show timer control                                                                                                              |
| `show_child_lock`         | `true`      | Show child lock control                                                                                                         |
| `show_led`                | `true`      | Show LED control                                                                                                                |
| `show_buzzer`             | `true`      | Show buzzer control                                                                                                             |
| `show_ionizer`            | `true`      | Show ionizer control                                                                                                            |
| `horizontal_angle_entity` | automatic   | Override related horizontal angle `number` entity                                                                               |
| `vertical_swing_entity`   | automatic   | Override related vertical swing `switch`, `input_boolean`, or `select` entity                                                   |
| `vertical_angle_entity`   | automatic   | Override related vertical angle `number` entity                                                                                 |
| `timer_entity`            | automatic   | Override related timer `number` entity                                                                                          |
| `child_lock_entity`       | automatic   | Override related child lock `switch`, `input_boolean`, or `select` entity                                                       |
| `led_entity`              | automatic   | Override related LED `switch`, `input_boolean`, `select`, or numeric entity                                                     |
| `buzzer_entity`           | automatic   | Override related buzzer `switch`, `input_boolean`, or `select` entity                                                           |
| `ionizer_entity`          | automatic   | Override related ionizer `switch`, `input_boolean`, or `select` entity                                                          |
| `favorite_level_entity`   | automatic   | Override related favorite level `number` entity                                                                                 |
| `sleep_mode_entity`       | automatic   | Override related sleep mode `switch` or `select` entity                                                                         |
| `temperature_entity`      | automatic   | Override related temperature `sensor` entity                                                                                    |
| `humidity_entity`         | automatic   | Override related humidity `sensor` entity                                                                                       |

### Configuration compatibility

- `entity_id` maps to `entity`
- `platform: default` maps to `integration: standard`
- `platform: xiaomi_miio` maps to `integration: xiaomi_miio`
- `platform: xiaomi_miio_fan` maps to `integration: xiaomi_miio_fan`
- `platform: xiaomi_miot` maps to `integration: xiaomi_miot`
- `force_sleep_mode_support` maps to `show_sleep`
- `hide_led_button: true` maps to `show_led: false`
- Flat visibility flags remain supported. For example,
  `show_timer: false` is used unless `controls.show_timer` is set.

See [compatibility.md](docs/compatibility.md) for capability and integration
details.

## Troubleshooting

### The card is not available after HACS installation

Confirm that the resource URL uses the repository slug
`xiaomi-smart-fan-card`, then clear the browser cache or reload the Home
Assistant frontend. Check **Settings > Dashboards > Resources** for a module
resource ending in `xiaomi-fan-card.js`.

### A control is missing

This is usually a capability decision, not a rendering failure. Check the
primary fan entity attributes, related device entities, and registered
Home Assistant services. If the integration does not expose the capability,
the card intentionally hides that control.

### The fan turns on but an optional action fails

Set the matching `integration` explicitly and verify the service is available
in **Developer Tools > Actions**. Include the integration name, Home Assistant
version, redacted entity attributes, card configuration, and the exact
reproduction steps in a bug report.

## Support and community

- This is a community HACS dashboard card, not an official Home Assistant
  feature. See the [HACS publisher
  requirements](https://hacs.xyz/docs/publish/) and [Home Assistant custom
  card documentation](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/).
- [Issues](https://github.com/mrwogu/xiaomi-smart-fan-card/issues) for reproducible card bugs and feature proposals
- [Discussions](https://github.com/mrwogu/xiaomi-smart-fan-card/discussions) for project questions and ideas
- [Home Assistant Community](https://community.home-assistant.io/) for broader Home Assistant setup and integration help
- [Home Assistant help](https://www.home-assistant.io/help/) for official community support channels
- [Contributing guide](CONTRIBUTING.md) for local development and pull requests
- [Security policy](SECURITY.md) for private vulnerability reports
- [Code of Conduct](CODE_OF_CONDUCT.md) for this repository

When asking for help, redact tokens, hostnames, locations, private entity
names, device identifiers, and personal dashboard screenshots. A minimal
fixture is better than a complete diagnostics export.

## Development

Requirements: Node.js 24 or newer and npm 11 or newer.

```bash
git clone https://github.com/mrwogu/xiaomi-smart-fan-card.git
cd xiaomi-smart-fan-card
npm ci
npm run validate
```

Useful commands:

```bash
npm test
npm run test:coverage
npm run build
prs validate --strict
prs compile
```

The production bundle is tracked for HACS:

```text
dist/xiaomi-fan-card.js
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow,
Conventional Commits, release automation, and generated PromptScript
instructions.

## License

MIT

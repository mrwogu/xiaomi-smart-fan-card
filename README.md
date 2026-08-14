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

Nudge arrows are hidden by default when horizontal or vertical angle controls
are available, because both controls can target the same fan position. Set
`controls.show_nudge_with_angles: true` to display both.

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
  order: [header, visual, airflow, position, features]
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
  angle_mode: select
  show_speed_slider: true
  show_speed_levels: true
  show_horizontal_swing: true
  show_vertical_swing: true
  show_nudge_with_angles: false
  show_timer: true
details:
  show: true
  show_horizontal_angle: true
  show_vertical_angle: true
  show_timer: true
  show_timer_when_off: true
  show_temperature: true
  show_humidity: true
  position: below
styles:
  card:
    border: 1px solid rgba(120, 140, 180, 0.35)
  controls:
    border_radius: 18px
related_entities:
  timer_entity: number.xiaomi_fan_timer
  led_entity: select.xiaomi_fan_led
```

### Complete parameter reference

Nested values take precedence over the legacy top-level aliases. `type` is
required by Lovelace. The defaults below apply after configuration
normalization.

#### Top-level parameters

| Parameter                  | Default              | Description                                                                                |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `type`                     | required             | Must be `custom:xiaomi-fan-card`.                                                          |
| `entity`                   | required             | Primary Home Assistant `fan` entity.                                                       |
| `entity_id`                | legacy alias         | Alias for `entity`.                                                                        |
| `name`                     | entity friendly name | Card title.                                                                                |
| `integration`              | `auto`               | Adapter selection: `auto`, `standard`, `xiaomi_miio`, `xiaomi_miio_fan`, or `xiaomi_miot`. |
| `platform`                 | none                 | Legacy alias for `integration`.                                                            |
| `theme`                    | `auto`               | Legacy alias for `layout.theme`.                                                           |
| `disable_animation`        | `false`              | Disable decorative airflow and rotor motion.                                               |
| `show_sleep`               | `true`               | Legacy alias for `controls.show_sleep`.                                                    |
| `show_timer`               | `true`               | Legacy alias for `controls.show_timer`.                                                    |
| `show_child_lock`          | `true`               | Legacy alias for `controls.show_child_lock`.                                               |
| `show_led`                 | `true`               | Legacy alias for `controls.show_led`.                                                      |
| `show_buzzer`              | `true`               | Legacy alias for `controls.show_buzzer`.                                                   |
| `show_ionizer`             | `true`               | Legacy alias for `controls.show_ionizer`.                                                  |
| `sleep_mode`               | none                 | Legacy alias for `show_sleep`.                                                             |
| `force_sleep_mode_support` | none                 | Legacy alias for `show_sleep`.                                                             |
| `hide_led_button`          | `false`              | Legacy option. Set to `true` to force `controls.show_led: false`.                          |

#### Legacy top-level related-entity aliases

These keys are still accepted for older YAML configurations. The nested
`related_entities` values take precedence when both forms are present.

| Parameter                 | Default   | Description                                                    |
| ------------------------- | --------- | -------------------------------------------------------------- |
| `horizontal_angle_entity` | automatic | Related horizontal angle `number` or `input_number` entity.    |
| `vertical_swing_entity`   | automatic | Related vertical swing `switch`, `input_boolean`, or `select`. |
| `vertical_angle_entity`   | automatic | Related vertical angle `number` or `input_number` entity.      |
| `favorite_level_entity`   | automatic | Related favorite level `number` or `input_number` entity.      |
| `sleep_mode_entity`       | automatic | Related sleep mode `switch`, `input_boolean`, or `select`.     |
| `timer_entity`            | automatic | Related timer `number` or `input_number` entity.               |
| `child_lock_entity`       | automatic | Related child lock `switch`, `input_boolean`, or `select`.     |
| `led_entity`              | automatic | Related LED switch, select, or numeric entity.                 |
| `buzzer_entity`           | automatic | Related buzzer `switch`, `input_boolean`, or `select`.         |
| `ionizer_entity`          | automatic | Related ionizer `switch`, `input_boolean`, or `select`.        |
| `temperature_entity`      | automatic | Related temperature `sensor` entity.                           |
| `humidity_entity`         | automatic | Related humidity `sensor` entity.                              |

#### `header`

| Parameter             | Default                     | Description                                                                         |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `header.show`         | `true`                      | Show the card header.                                                               |
| `header.variant`      | `compact`                   | `compact` keeps secondary metadata minimal; `full` shows the expanded header style. |
| `header.show_eyebrow` | `false` (`true` for `full`) | Show the Xiaomi Air Circulation eyebrow.                                            |
| `header.show_name`    | `true`                      | Show the fan name.                                                                  |
| `header.show_status`  | `true`                      | Show running or standby status.                                                     |
| `header.show_mode`    | `false` (`true` for `full`) | Show the current airflow mode.                                                      |
| `header.show_model`   | `false` (`true` for `full`) | Show the known model badge.                                                         |

#### `visual`

| Parameter             | Default | Description                                    |
| --------------------- | ------- | ---------------------------------------------- |
| `visual.show`         | `true`  | Show the visual status section.                |
| `visual.show_graphic` | `true`  | Show the animated fan graphic.                 |
| `visual.show_power`   | `true`  | Show the central power button.                 |
| `visual.show_speed`   | `true`  | Show the percentage readout.                   |
| `visual.show_details` | `true`  | Show angles, timer, temperature, and humidity. |
| `visual.animation`    | `auto`  | `auto`, `enabled`, or `disabled`.              |

#### `controls`

| Parameter                         | Default  | Description                                                   |
| --------------------------------- | -------- | ------------------------------------------------------------- |
| `controls.show`                   | `true`   | Show interactive controls.                                    |
| `controls.show_speed_slider`      | `true`   | Show the percentage slider.                                   |
| `controls.show_speed_levels`      | `true`   | Show speed level buttons or a selector.                       |
| `controls.show_modes`             | `true`   | Show normal, natural, and preset mode controls.               |
| `controls.show_preset_mode`       | `true`   | Include generic preset modes.                                 |
| `controls.show_horizontal_swing`  | `true`   | Show the horizontal oscillation toggle.                       |
| `controls.show_vertical_swing`    | `true`   | Show the vertical oscillation toggle when available.          |
| `controls.show_sleep`             | `true`   | Show the sleep mode control when available.                   |
| `controls.show_cycle`             | `true`   | Show the combined horizontal and vertical cycle toggle.       |
| `controls.show_horizontal_angle`  | `true`   | Show the horizontal angle selector.                           |
| `controls.show_vertical_angle`    | `true`   | Show the vertical angle selector when available.              |
| `controls.show_nudge`             | `true`   | Show directional nudge buttons when available.                |
| `controls.show_nudge_with_angles` | `false`  | Keep nudge buttons visible when angle controls are shown.     |
| `controls.show_direction`         | `true`   | Show forward or reverse direction for standard fan entities.  |
| `controls.show_favorite_level`    | `true`   | Show the favorite level number control when available.        |
| `controls.show_timer`             | `true`   | Show the timer control next to the optional feature controls. |
| `controls.show_child_lock`        | `true`   | Show the child lock control when available.                   |
| `controls.show_led`               | `true`   | Show the LED control when available.                          |
| `controls.show_buzzer`            | `true`   | Show the buzzer control when available.                       |
| `controls.show_ionizer`           | `true`   | Show the ionizer control when available.                      |
| `controls.selection_mode`         | `auto`   | Speed level presentation: `auto`, `buttons`, or `select`.     |
| `controls.timer_mode`             | `select` | Timer presentation: `select` or `cycle`.                      |
| `controls.angle_mode`             | `select` | Angle presentation: `select` or `cycle`.                      |

#### `details`

| Parameter                       | Default | Description                                               |
| ------------------------------- | ------- | --------------------------------------------------------- |
| `details.show`                  | `true`  | Show the metadata row below the graphic.                  |
| `details.show_horizontal_angle` | `true`  | Show the current horizontal angle.                        |
| `details.show_vertical_angle`   | `true`  | Show the current vertical angle.                          |
| `details.show_timer`            | `true`  | Show the current timer value.                             |
| `details.show_timer_when_off`   | `true`  | Keep the timer detail visible when the timer is off.      |
| `details.show_temperature`      | `true`  | Show temperature when available.                          |
| `details.show_humidity`         | `true`  | Show humidity when available.                             |
| `details.position`              | `below` | Place details below the graphic or beside it with `side`. |

#### `layout`

| Parameter        | Default       | Description                                                                  |
| ---------------- | ------------- | ---------------------------------------------------------------------------- |
| `layout.theme`   | `auto`        | `auto`, `mushroom`, `minimal`, `glass`, or `industrial`.                     |
| `layout.density` | `comfortable` | Control sizing: `comfortable` or `compact`.                                  |
| `layout.columns` | `auto`        | Feature columns: `auto`, `one`, or `two`.                                    |
| `layout.order`   | default       | Block order using `header`, `visual`, `airflow`, `position`, and `features`. |

#### `styles`

`styles` contains typed CSS token groups for `card`, `header`, `visual`,
`controls`, and `details`. Every group accepts `background`, `border`,
`border_radius`, `color`, `font_size`, `gap`, `padding`, and `shadow`.
Two tokens are group specific: `visual` also accepts `size` for the graphic
diameter, and `controls` also accepts `height` for the minimum control height.
Values are CSS values, for example `18px`, `0.8rem`, or
`1px solid rgba(120, 140, 180, 0.35)`. Keys that the stylesheet does not
consume are ignored and are not offered by the visual editor.

#### `related_entities`

| Parameter                                  | Default   | Description                                                      |
| ------------------------------------------ | --------- | ---------------------------------------------------------------- |
| `related_entities.horizontal_angle_entity` | automatic | `number` or `input_number` for the horizontal angle.             |
| `related_entities.vertical_swing_entity`   | automatic | `switch`, `input_boolean`, or `select` for vertical oscillation. |
| `related_entities.vertical_angle_entity`   | automatic | `number` or `input_number` for the vertical angle.               |
| `related_entities.favorite_level_entity`   | automatic | `number` or `input_number` for the favorite level.               |
| `related_entities.sleep_mode_entity`       | automatic | `switch`, `input_boolean`, or `select` for sleep mode.           |
| `related_entities.timer_entity`            | automatic | `number` or `input_number` for the timer.                        |
| `related_entities.child_lock_entity`       | automatic | `switch`, `input_boolean`, or `select` for child lock.           |
| `related_entities.led_entity`              | automatic | LED `switch`, `input_boolean`, `select`, or numeric entity.      |
| `related_entities.buzzer_entity`           | automatic | `switch`, `input_boolean`, or `select` for the buzzer.           |
| `related_entities.ionizer_entity`          | automatic | `switch`, `input_boolean`, or `select` for the ionizer.          |
| `related_entities.temperature_entity`      | automatic | `sensor` for temperature.                                        |
| `related_entities.humidity_entity`         | automatic | `sensor` for humidity.                                           |

`selection_mode` is `auto`, `buttons`, or `select`. `timer_mode` and `angle_mode`
are `select` or `cycle`. The default block order is `header`, `visual`,
`airflow`, `position`, `features`; omitted blocks are appended in that order.
The full header also enables its eyebrow, mode, and known model badge by default,
while each `show_*` option can still override that behavior.

When `details.show_timer_when_off` is `false`, the inactive timer detail is
hidden while an active timer remains visible. `details.position: side` places
temperature, humidity, angle, and timer details beside the graphic on wide
cards and falls back below the graphic on narrow cards. Temperature and
humidity details use the `unit_of_measurement` of the resolved sensor, so a
Fahrenheit sensor renders `°F` without extra configuration.

The card reports its own size to Home Assistant. Masonry dashboards use
`getCardSize`, and sections dashboards use `getGridOptions` with a
twelve-column default whose row count follows the enabled header variant,
graphic, and control groups.

The visual editor uses Home Assistant's native form schema. The fan and related
entity fields therefore use Home Assistant entity selectors with domain filters,
search, and the current entity registry instead of a card-maintained list.
Options are grouped into collapsible panels with icons, related switches are
paired side by side, the block order field supports drag and drop reordering,
and ambiguous fields carry helper text below the control.

Timer controls use minutes. Related numeric timer entities with
`unit_of_measurement` set to `s`, `sec`, `second`, or `seconds` are converted
to and from minutes. Other or missing units are treated as minutes. The card
preserves a live timer value that is not one of the configured steps.

For Xiaomi LED brightness controls, the custom Xiaomi service contract is
`0` for bright, `1` for dim, and `2` for off. A related
`*_led_brightness` number with a `0..2` range uses the same mapping. Other
switch, select, and number entities use their exposed Home Assistant
contract.

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

<div align="center">

# Xiaomi Fan Card

**Every control your fan actually supports, on one calm Lovelace card.**

Capability-aware. Four themes. Native visual editor. No telemetry.

[![CI](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/ci.yml/badge.svg)](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/ci.yml)
[![HACS validation](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/mrwogu/xiaomi-smart-fan-card/actions/workflows/hacs.yml)
[![codecov](https://codecov.io/gh/mrwogu/xiaomi-smart-fan-card/branch/main/graph/badge.svg)](https://codecov.io/gh/mrwogu/xiaomi-smart-fan-card)
[![Latest release](https://img.shields.io/github/v/release/mrwogu/xiaomi-smart-fan-card)](https://github.com/mrwogu/xiaomi-smart-fan-card/releases)

![The default card side by side in Home Assistant light and dark mode, with the airflow graphic, speed slider, mode buttons, angle controls, and device toggles](https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/hero-light-dark.webp)

<sub>Default configuration, light and dark, nothing but the entity set.</sub>

[![Open Xiaomi Fan Card in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=mrwogu&repository=xiaomi-smart-fan-card&category=plugin)

[Install](#install) · [Themes](#four-themes-one-card) · [Layouts](#layouts-that-fit-your-dashboard) ·
[Styling](#style-it-your-way) · [Recipes](#recipes) · [Configuration](docs/configuration.md)

</div>

## Why you will like it

- **No dead buttons.** Controls appear only when your entity, its related
  entities, the model profile, or a registered service can actually perform the
  action. An unsupported fan gets a smaller card, not a broken one.
- **A real interface, not a wall of toggles.** Airflow graphic with a live speed
  ring, one slider, speed levels, modes, oscillation, angles, timer, and device
  extras, grouped the way you use them.
- **Four named themes in one card.** Follow your Home Assistant theme, or switch to
  Mushroom, Minimal, Glass, or Industrial with a single option.
- **Fits every dashboard.** Sections and masonry sizing, comfortable or compact
  density, one or two control columns, configurable block order, and a layout
  that survives a 320 px column.
- **Accessible on purpose.** 44 px touch targets, keyboard focus rings, labelled
  status chips, screen-reader friendly details, reduced-motion and
  forced-colors support.
- **Private by design.** No telemetry, no analytics, no remote scripts, no
  direct device connection. Every action goes through Home Assistant.

## Four themes, one card

One option, `layout.theme`, changes the entire surface. Same entity, same state,
same controls, four named looks. The strip below shows the named themes in dark
mode.

![The four named themes shown side by side: mushroom, minimal, glass, and industrial](https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/themes-gallery.webp)

| Theme      | `layout.theme` | What changes                                                     |
| ---------- | -------------- | ---------------------------------------------------------------- |
| Mushroom   | `mushroom`     | Soft tinted panels and pill controls                             |
| Minimal    | `minimal`      | No borders, no shadow, content first                             |
| Glass      | `glass`        | Translucent surface with backdrop blur                           |
| Industrial | `industrial`   | Sharp corners, uppercase labels, monospace metrics, amber accent |

Themes only override design tokens, so your Home Assistant theme still drives
text, background, and accent unless a theme deliberately claims one.

## Layouts that fit your dashboard

![Eight layout variations shown in a readable three-column grid: control columns, density, order, narrow columns, tile, and position](https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/layouts-gallery.webp)

| Layout option      | What changes                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout.columns`   | `one` stacks angles, the position pad, and device toggles; `two` pairs them and shortens the card.                                                        |
| `layout.density`   | `compact` with `details.position: side` trims a third of the height.                                                                                      |
| `layout.order`     | Moves header, visual, airflow, position, and feature blocks.                                                                                              |
| Responsive layouts | Container queries reflow rows down to 320 px. Tile mode keeps only name, status, and speed. The position block puts angle selectors beside the nudge pad. |

## Configure it by clicking

The visual editor is built on Home Assistant's own form schema: entity
selectors with domain filters, collapsible panels with icons, paired switches,
drag and drop block ordering, and helper text where an option needs it.

![Walking through the visual editor panels: header, visual, controls sub panels, details, layout, and styles](https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/editor-config.webp)

Panels group what belongs together: header, visual, controls with sub panels for
speed, modes, oscillation, angles and features, then details, layout, styles,
and related entities.

<div align="center">
  <a href="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/visual-size-option.webp">
    <img src="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/visual-size-option.webp" alt="The real Xiaomi Fan Card rendered at 120, 300, and 480 pixel visual sizes" height="360">
  </a>
</div>

The same production card scales from compact columns to wide dashboards. Set
the value in the Visual panel or with `visual.size` in YAML.

## See it move

<div align="center">
  <a href="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/controls-speed.webp">
    <img src="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/controls-speed.webp" alt="Sweeping the speed slider while the ring, the percentage readout, and the speed level buttons follow" height="360">
  </a>
</div>

Slider feedback is immediate: the ring, the readout, and the level buttons
follow your finger and the service call fires when you let go. Decorative
motion stops completely under `prefers-reduced-motion`.

## Style it your way

`styles` exposes typed CSS tokens per block, so a personal look is a few lines
of YAML instead of a theme fork. `styles.card.accent` repaints the ring, slider,
active buttons, and every tint derived from them. Six starting points, all on
the same entity:

<div align="center">
  <a href="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/styles-cycle.webp">
    <img src="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/styles-cycle.webp" alt="The same card styled as neon night, paper, cockpit, frost, ink, and sunset" height="360">
  </a>
</div>

<details>
<summary>YAML for the six looks above</summary>

```yaml
# Neon night
styles:
  card:
    background: linear-gradient(160deg, #10182c 0%, #131c31 55%, #0a0f1e 100%)
    border: 1px solid rgba(94, 234, 255, 0.3)
    border_radius: 26px
    shadow: 0 24px 60px rgba(3, 8, 20, 0.65)
  controls:
    height: 52px
    border_radius: 16px
```

```yaml
# Paper
layout:
  theme: minimal
styles:
  card:
    background: "#ffffff"
    border: 1px solid #e5e7eb
    border_radius: 20px
    padding: 22px
    shadow: 0 10px 30px rgba(15, 23, 42, 0.08)
  visual:
    size: 200px
  controls:
    height: 48px
    border_radius: 12px
```

```yaml
# Cockpit
layout:
  theme: industrial
styles:
  card:
    background: "#14100b"
    border: 1px solid rgba(233, 162, 59, 0.35)
    border_radius: 6px
  controls:
    height: 46px
    border_radius: 4px
```

```yaml
# Frost
layout:
  theme: glass
styles:
  card:
    background: linear-gradient(150deg, rgba(255, 255, 255, 0.86) 0%, rgba(226, 240, 255, 0.78) 100%)
    border: 1px solid rgba(255, 255, 255, 0.9)
    border_radius: 28px
    shadow: 0 18px 44px rgba(15, 23, 42, 0.14)
    accent: "#2f7bff"
  controls:
    background: rgba(255, 255, 255, 0.62)
    border_radius: 18px
    height: 50px
  details:
    background: rgba(255, 255, 255, 0.55)
```

```yaml
# Ink
layout:
  theme: minimal
styles:
  card:
    background: "#08080a"
    border: 1px solid #23252b
    border_radius: 14px
    padding: 18px
    gap: 14px
    accent: "#c6f24e"
  visual:
    size: 190px
  controls:
    background: "#121317"
    border: 1px solid #212228
    border_radius: 10px
    height: 46px
  details:
    font_size: 12px
```

```yaml
# Sunset
layout:
  theme: mushroom
styles:
  card:
    background: linear-gradient(150deg, #fff2e6 0%, #ffe1ec 55%, #efe4ff 100%)
    border: 1px solid rgba(255, 255, 255, 0.75)
    border_radius: 30px
    padding: 20px
    shadow: 0 16px 40px rgba(191, 111, 96, 0.18)
    accent: "#f2643f"
  header:
    color: "#5c2f3a"
  controls:
    background: rgba(255, 255, 255, 0.66)
    border_radius: 22px
    height: 50px
```

</details>

## Works with what you already have

| Integration      | Set `integration:` | What you get                                                                                         |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| Auto detection   | `auto`             | Standard fan actions and related entity discovery. Vendor services are never guessed.                |
| Xiaomi Home      | `xiaomi_miio`      | Standard fan actions plus related switch, number, select, and sensor entities.                       |
| syssi/xiaomi_fan | `xiaomi_miio_fan`  | Xiaomi services for angle, vertical oscillation, nudge, timer, LED, buzzer, child lock, and ionizer. |
| Xiaomi MIOT      | `xiaomi_miot`      | Standard fan actions plus actionable related entities exposed by Xiaomi MIoT.                        |
| Any HA `fan`     | `standard`         | Percentage, presets, oscillation, direction, and whatever related entities exist.                    |

`auto` and `standard` use public Home Assistant fan actions. Select
`xiaomi_miio_fan` only when its custom services are registered in Home
Assistant. `xiaomi_miio` and `xiaomi_miot` use standard fan actions and
related entities instead of assuming `xiaomi_miio_fan` services.

### One fan, different integrations

The same physical fan can expose different capabilities depending on the
integration:

- `xiaomi_miio_fan`: angle, vertical oscillation, nudge, timer, LED, buzzer,
  and child lock actions use registered `xiaomi_miio_fan.*` services.
- `xiaomi_miot`: angle and vertical controls appear only when Xiaomi MIoT
  exposes actionable same-device related entities. Angle `select` entities
  must provide numeric options such as `30`, `60°`, or `90 degrees`.
- `auto` and `standard`: the card uses standard fan actions and related
  entities. Primary angle attributes without a matching action remain hidden
  and do not create dead controls or details.

When a standard fan exposes `supported_features`, that feature mask is
authoritative for percentage, presets, oscillation, and direction. Related
switches, input booleans, and selects can provide an optional control when the
fan integration exposes it as a separate entity.

The card does not connect directly to Xiaomi devices and does not invent
MIoT property or service names. If the MIoT integration exposes only primary
fan attributes, use `xiaomi_miio_fan` for its vendor-specific controls or keep
those controls hidden.

### Capability safety

Presets and generic fan features do not imply oscillation or angle support. An
air purifier or air circulator can expose presets, favorite level, LED
brightness, sensors, buzzer, child lock, and ionizer while having no
horizontal or vertical controls. The card keeps those unsupported controls
hidden.

<div align="center">
  <a href="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/integration-modes.webp">
    <img src="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/integration-modes.webp" alt="The same card for a fully featured fan with angles, timer, and device toggles, then for a plain Home Assistant fan entity with speed, presets, oscillation, and direction only" height="360">
  </a>
</div>

_Same card, two entities. The plain `fan` drops what it cannot do and keeps
what it can._

### Feature coverage

- Airflow visualization with a live speed ring and reduced-motion support
- Speed slider with instant preview, plus model-specific speed levels
- Normal and Natural shortcuts, and a generic preset mode selector
- Horizontal and vertical oscillation with angle selectors or cycling
- Direction nudge controls and forward or reverse direction
- Timer, sleep preset, child lock, LED, buzzer, and ionizer when actionable
- Temperature and humidity from the fan or related sensors, in the sensor's own unit
- Favorite level from native Xiaomi `number` entities
- Known profiles for `zhimi.fan.*`, `dmaker.fan.*`, `xiaomi.fan.*`, and
  `leshow.fan.ss4`, including 1C, 2 Lite, P30, P43, P45, P70, P76, and P85
  families, with a safe fallback for everything else

Nudge arrows are hidden by default when angle controls exist, because both
target the same fan position. Set `controls.show_nudge_with_angles: true` to
show both, as in the position block above. The pad also appears for Xiaomi Home
devices that expose `turn_left`, `turn_right`, `turn_upward`, and
`turn_downward` buttons: the card discovers them on the same device and presses
them instead of calling vendor services.

Timer values are shown in minutes. The custom `xiaomi_miio_fan` integration
uses seconds for `zhimi.fan.za5`; the card converts that model-specific
service value while keeping related timer entities in their declared unit.

## Install

Requires Home Assistant **2024.8** or newer, because the visual editor uses
grouped `ha-form` sections.

1. Open **HACS** in Home Assistant.
2. Open **Frontend** and search for **Xiaomi Fan Card**.
3. Select the card and choose **Download**.
4. Reload the browser or restart Home Assistant if HACS asks you to.
5. Add a `custom:xiaomi-fan-card` card to a dashboard.

Before HACS approval, add `mrwogu/xiaomi-smart-fan-card` as a custom repository
with category **Dashboard**. The HACS backend calls this category `plugin`.

<details>
<summary>Manual resource registration</summary>

HACS normally registers the resource. If your installation requires manual
registration, add this module resource under **Settings > Dashboards >
Resources**:

```yaml
resources:
  - url: /hacsfiles/xiaomi-smart-fan-card/xiaomi-fan-card.js
    type: module
```

</details>

## Quick start

```yaml
type: custom:xiaomi-fan-card
entity: fan.living_room_fan
name: Living Room Fan
```

That is enough. Everything else is optional.

## Recipes

Copy any of these into a card and adjust the entity. Every option is documented
in [docs/configuration.md](docs/configuration.md).

**Showcase.** The default card: full header, graphic, and every control group.

```yaml
type: custom:xiaomi-fan-card
entity: fan.living_room_fan
integration: xiaomi_miio_fan
layout:
  theme: auto
```

**Information dense.** Compact controls with the details beside the graphic.

```yaml
type: custom:xiaomi-fan-card
entity: fan.living_room_fan
integration: xiaomi_miio_fan
layout:
  theme: auto
  density: compact
  columns: two
details:
  position: side
```

**Status tile.** Name, power, and speed only.

```yaml
type: custom:xiaomi-fan-card
entity: fan.living_room_fan
layout:
  theme: minimal
header:
  variant: compact
visual:
  show_graphic: false
  show_details: false
controls:
  show_speed_levels: false
  show_modes: false
  show_preset_mode: false
  show_horizontal_swing: false
  show_vertical_swing: false
  show_horizontal_angle: false
  show_vertical_angle: false
  show_nudge: false
  show_timer: false
```

**Unsupported optional controls.** Use this for an air purifier or any fan
whose integration reports presets but does not expose actionable oscillation
or angle entities.

```yaml
type: custom:xiaomi-fan-card
entity: fan.bedroom_purifier
integration: xiaomi_miot
controls:
  show_horizontal_swing: false
  show_vertical_swing: false
  show_horizontal_angle: false
  show_vertical_angle: false
  show_cycle: false
  show_nudge: false
details:
  show_horizontal_angle: false
  show_vertical_angle: false
```

**One control column.** Every group stacked, for narrow dashboard columns.

```yaml
type: custom:xiaomi-fan-card
entity: fan.living_room_fan
integration: xiaomi_miio_fan
layout:
  columns: one
```

**Your own styling.** Typed CSS tokens per block, no theme forking required.
See [Style it your way](#style-it-your-way) for complete looks.

```yaml
type: custom:xiaomi-fan-card
entity: fan.living_room_fan
styles:
  card:
    border: 1px solid rgba(120, 140, 180, 0.35)
    border_radius: 28px
  visual:
    size: 260px
  controls:
    height: 52px
```

Set the graphic diameter directly with `visual.size` in pixels. The editor
keeps it between 120 and 480 px; use `styles.visual.size` only when you need
an advanced CSS value.

## Configuration

Every option, default, and legacy alias is documented in
**[docs/configuration.md](docs/configuration.md)**. The most useful ones:

| Option                    | Values                                                              | Default       |
| ------------------------- | ------------------------------------------------------------------- | ------------- |
| `integration`             | `auto`, `standard`, `xiaomi_miio`, `xiaomi_miio_fan`, `xiaomi_miot` | `auto`        |
| `layout.theme`            | `auto`, `mushroom`, `minimal`, `glass`, `industrial`                | `auto`        |
| `layout.density`          | `comfortable`, `compact`                                            | `comfortable` |
| `layout.columns`          | `auto`, `one`, `two`                                                | `auto`        |
| `layout.order`            | any order of `header`, `visual`, `airflow`, `position`, `features`  | default order |
| `header.variant`          | `full`, `compact`                                                   | `full`        |
| `visual.size`             | `120`-`480` px                                                      | `300`         |
| `details.position`        | `below`, `side`                                                     | `below`       |
| `controls.selection_mode` | `auto`, `buttons`, `select`                                         | `auto`        |
| `controls.timer_mode`     | `cycle`, `select`                                                   | `cycle`       |
| `controls.angle_mode`     | `cycle`, `select`                                                   | `cycle`       |
| `visual.animation`        | `auto`, `enabled`, `disabled`                                       | `auto`        |

Nested groups (`header`, `visual`, `controls`, `details`, `layout`, `styles`,
`related_entities`) take precedence over the legacy top-level flags, which
remain supported.

## Languages

The card and its visual editor follow `hass.language`. Regional codes such as
`pl-PL` use the base language, and unsupported languages fall back to English.

| Language | Code | Card UI | Visual editor |
| -------- | ---- | ------- | ------------- |
| English  | `en` | Yes     | Yes           |
| Polish   | `pl` | Yes     | Yes           |
| Spanish  | `es` | Yes     | Yes           |
| French   | `fr` | Yes     | Yes           |
| Italian  | `it` | Yes     | Yes           |

## Troubleshooting

<details>
<summary>The card is not available after HACS installation</summary>

Confirm that the resource URL uses the repository slug
`xiaomi-smart-fan-card`, then clear the browser cache or reload the Home
Assistant frontend. Check **Settings > Dashboards > Resources** for a module
resource ending in `xiaomi-fan-card.js`.

</details>

<details>
<summary>A control is missing</summary>

This is usually a capability decision, not a rendering failure. Check the
primary fan entity attributes, related device entities, and registered Home
Assistant services. If the integration does not expose the capability, the card
intentionally hides that control. See
[docs/compatibility.md](docs/compatibility.md).

For `xiaomi_miot`, verify that the related entity exists, belongs to the same
device, is available, and exposes the expected domain and options. Include the
integration name, Home Assistant and HACS versions, browser, redacted primary
entity state and attributes, redacted related entity domains, states, and
options, registered service names, card configuration, console error, and exact
reproduction steps in a bug report. Never include tokens, cookies, hostnames,
private dashboards, or full diagnostics exports.

</details>

<details>
<summary>The fan turns on but an optional action fails</summary>

Set the matching `integration` explicitly and verify the service is available in
**Developer Tools > Actions**. Include the integration name, Home Assistant
version, redacted entity attributes, card configuration, and exact reproduction
steps in a bug report.

</details>

## Support and community

This is a community HACS dashboard card, not an official Home Assistant
feature. See the [HACS publisher requirements](https://hacs.xyz/docs/publish/)
and the [custom card documentation](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/).

- [Issues](https://github.com/mrwogu/xiaomi-smart-fan-card/issues) for reproducible bugs and feature proposals
- [Discussions](https://github.com/mrwogu/xiaomi-smart-fan-card/discussions) for project questions and ideas
- [Home Assistant Community](https://community.home-assistant.io/) for broader setup and integration help
- [Contributing guide](CONTRIBUTING.md), [security policy](SECURITY.md), [code of conduct](CODE_OF_CONDUCT.md)

When asking for help, redact tokens, hostnames, locations, private entity
names, device identifiers, and personal dashboard screenshots. A minimal
fixture beats a complete diagnostics export.

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

The production bundle is tracked for HACS at `dist/xiaomi-fan-card.js`. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, Conventional Commits,
release automation, and generated PromptScript instructions.

Media lives in `docs/media` as WebP. Every card shot and loop is rendered in a
headless browser at 1.5x against a mocked `hass`, so all frames of one animation
share a single box and every image matches the shipped defaults. The editor
walkthrough is the one real Home Assistant recording, kept at 560 px and 10 fps
with its source ignored by git. README images use absolute
`raw.githubusercontent.com` URLs because HACS renders the README outside the
repository and drops relative paths. Keep published media redacted: no tokens,
hostnames, locations, device identifiers, or personal dashboards.

## License

MIT

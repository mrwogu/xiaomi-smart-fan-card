# Configuration reference

Complete option reference for Xiaomi Fan Card. The visual editor exposes the
same nested groups as YAML, so anything below can also be set by clicking.
Nested values take precedence over the legacy top-level aliases. `type` is
required by Lovelace. The defaults below apply after configuration
normalization.

See the [README recipes](../README.md#recipes) for ready to paste layouts and
[compatibility.md](compatibility.md) for capability and integration details.

## Full example

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
  variant: full
  show: true
  show_name: true
  show_status: true
  show_mode: true
visual:
  show: true
  show_graphic: true
  size: 300
  show_power: true
  show_speed: true
  show_details: true
  animation: auto
controls:
  show: true
  selection_mode: auto
  timer_mode: cycle
  angle_mode: cycle
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

## Top-level parameters

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

## Integration action paths

| `integration`     | Action path                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `auto`            | Standard Home Assistant fan actions and related entity discovery.                              |
| `standard`        | Standard Home Assistant fan actions and related entity discovery.                              |
| `xiaomi_miio`     | Standard fan actions plus related Xiaomi Home entities.                                        |
| `xiaomi_miio_fan` | Standard fan actions plus registered `xiaomi_miio_fan.*` services for model-specific controls. |
| `xiaomi_miot`     | Standard fan actions plus actionable related entities exposed by Xiaomi MIoT.                  |

The card never calls a Xiaomi device directly. `auto` does not guess a vendor
adapter. Select `xiaomi_miio_fan` only when the service registry contains the
custom services required by the configured controls.

## Legacy top-level related-entity aliases

These keys are still accepted for older YAML configurations. The nested
`related_entities` values take precedence when both forms are present.

| Parameter                 | Default   | Description                                                            |
| ------------------------- | --------- | ---------------------------------------------------------------------- |
| `horizontal_angle_entity` | automatic | Related horizontal angle `number`, `input_number`, or `select` entity. |
| `vertical_swing_entity`   | automatic | Related vertical swing `switch`, `input_boolean`, or `select`.         |
| `vertical_angle_entity`   | automatic | Related vertical angle `number`, `input_number`, or `select` entity.   |
| `favorite_level_entity`   | automatic | Related favorite level `number` or `input_number` entity.              |
| `sleep_mode_entity`       | automatic | Related sleep mode `switch`, `input_boolean`, or `select`.             |
| `timer_entity`            | automatic | Related timer `number` or `input_number` entity.                       |
| `child_lock_entity`       | automatic | Related child lock `switch`, `input_boolean`, or `select`.             |
| `led_entity`              | automatic | Related LED switch, select, or numeric entity.                         |
| `buzzer_entity`           | automatic | Related buzzer `switch`, `input_boolean`, or `select`.                 |
| `ionizer_entity`          | automatic | Related ionizer `switch`, `input_boolean`, or `select`.                |
| `temperature_entity`      | automatic | Related temperature `sensor` entity.                                   |
| `humidity_entity`         | automatic | Related humidity `sensor` entity.                                      |

## `header`

| Parameter             | Default                        | Description                                                                         |
| --------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `header.show`         | `true`                         | Show the card header.                                                               |
| `header.variant`      | `full`                         | `full` shows the expanded header style; `compact` keeps secondary metadata minimal. |
| `header.show_eyebrow` | `true` (`false` for `compact`) | Show the Xiaomi Air Circulation eyebrow.                                            |
| `header.show_name`    | `true`                         | Show the fan name.                                                                  |
| `header.show_status`  | `true`                         | Show running or standby status.                                                     |
| `header.show_mode`    | `true` (`false` for `compact`) | Show the current airflow mode.                                                      |
| `header.show_model`   | `true` (`false` for `compact`) | Show the known model badge.                                                         |

## `visual`

| Parameter             | Default | Description                                                        |
| --------------------- | ------- | ------------------------------------------------------------------ |
| `visual.show`         | `true`  | Show the visual status section.                                    |
| `visual.show_graphic` | `true`  | Show the animated fan graphic.                                     |
| `visual.size`         | `300`   | Fan graphic diameter in pixels. Values are clamped to `120`-`480`. |
| `visual.show_power`   | `true`  | Show the central power button.                                     |
| `visual.show_speed`   | `true`  | Show the percentage readout.                                       |
| `visual.show_details` | `true`  | Show angles, timer, temperature, and humidity.                     |
| `visual.animation`    | `auto`  | `auto`, `enabled`, or `disabled`.                                  |

## `controls`

| Parameter                         | Default | Description                                                   |
| --------------------------------- | ------- | ------------------------------------------------------------- |
| `controls.show`                   | `true`  | Show interactive controls.                                    |
| `controls.show_speed_slider`      | `true`  | Show the percentage slider.                                   |
| `controls.show_speed_levels`      | `true`  | Show speed level buttons or a selector.                       |
| `controls.show_modes`             | `true`  | Show normal, natural, and preset mode controls.               |
| `controls.show_preset_mode`       | `true`  | Include generic preset modes.                                 |
| `controls.show_horizontal_swing`  | `true`  | Show the horizontal oscillation toggle.                       |
| `controls.show_vertical_swing`    | `true`  | Show the vertical oscillation toggle when available.          |
| `controls.show_sleep`             | `true`  | Show the sleep mode control when available.                   |
| `controls.show_cycle`             | `true`  | Show the combined horizontal and vertical cycle toggle.       |
| `controls.show_horizontal_angle`  | `true`  | Show the horizontal angle selector.                           |
| `controls.show_vertical_angle`    | `true`  | Show the vertical angle selector when available.              |
| `controls.show_nudge`             | `true`  | Show directional nudge buttons when available.                |
| `controls.show_nudge_with_angles` | `false` | Keep nudge buttons visible when angle controls are shown.     |
| `controls.show_direction`         | `true`  | Show forward or reverse direction for standard fan entities.  |
| `controls.show_favorite_level`    | `true`  | Show the favorite level number control when available.        |
| `controls.show_timer`             | `true`  | Show the timer control next to the optional feature controls. |
| `controls.show_child_lock`        | `true`  | Show the child lock control when available.                   |
| `controls.show_led`               | `true`  | Show the LED control when available.                          |
| `controls.show_buzzer`            | `true`  | Show the buzzer control when available.                       |
| `controls.show_ionizer`           | `true`  | Show the ionizer control when available.                      |
| `controls.selection_mode`         | `auto`  | Speed level presentation: `auto`, `buttons`, or `select`.     |
| `controls.timer_mode`             | `cycle` | Timer presentation: `cycle` or `select`.                      |
| `controls.angle_mode`             | `cycle` | Angle presentation: `cycle` or `select`.                      |

## `details`

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

## `layout`

| Parameter        | Default       | Description                                                                  |
| ---------------- | ------------- | ---------------------------------------------------------------------------- |
| `layout.theme`   | `auto`        | `auto`, `mushroom`, `minimal`, `glass`, or `industrial`.                     |
| `layout.density` | `comfortable` | Control sizing: `comfortable` or `compact`.                                  |
| `layout.columns` | `auto`        | Feature columns: `auto`, `one`, or `two`.                                    |
| `layout.order`   | default       | Block order using `header`, `visual`, `airflow`, `position`, and `features`. |

## `styles`

`styles` contains typed CSS token groups for `card`, `header`, `visual`,
`controls`, and `details`. Every group accepts `background`, `border`,
`border_radius`, `color`, `font_size`, `gap`, `padding`, and `shadow`.
Three tokens are group specific: `card` also accepts `accent`, `visual` also
accepts `size` as an advanced CSS override for the graphic diameter, and
`controls` also accepts `height` for the minimum control height. Use
`visual.size` for the simple pixel-based setting. `accent` replaces the color the card derives
from `--state-fan-active-color`, so the speed ring, slider, active buttons,
status dot, and every mixed tint follow it, including inside a theme.
Values are CSS values, for example `18px`, `0.8rem`, or
`1px solid rgba(120, 140, 180, 0.35)`. Keys that the stylesheet does not
consume are ignored and are not offered by the visual editor.

Tokens compose with `layout.theme`: the theme sets the base design tokens and
`styles` overrides individual ones. Six complete looks are in
[Style it your way](../README.md#style-it-your-way).

<div align="center">
  <img src="https://raw.githubusercontent.com/mrwogu/xiaomi-smart-fan-card/main/docs/media/styles-cycle.webp" alt="The same card styled as neon night, paper, cockpit, frost, ink, and sunset" width="360">
</div>

## `related_entities`

| Parameter                                  | Default   | Description                                                                          |
| ------------------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| `related_entities.horizontal_angle_entity` | automatic | `number`, `input_number`, or `select` with numeric options for the horizontal angle. |
| `related_entities.vertical_swing_entity`   | automatic | `switch`, `input_boolean`, or `select` for vertical oscillation.                     |
| `related_entities.vertical_angle_entity`   | automatic | `number`, `input_number`, or `select` with numeric options for the vertical angle.   |
| `related_entities.favorite_level_entity`   | automatic | `number` or `input_number` for the favorite level.                                   |
| `related_entities.sleep_mode_entity`       | automatic | `switch`, `input_boolean`, or `select` for sleep mode.                               |
| `related_entities.timer_entity`            | automatic | `number` or `input_number` for the timer.                                            |
| `related_entities.child_lock_entity`       | automatic | `switch`, `input_boolean`, or `select` for child lock.                               |
| `related_entities.led_entity`              | automatic | LED `switch`, `input_boolean`, `select`, or numeric entity.                          |
| `related_entities.buzzer_entity`           | automatic | `switch`, `input_boolean`, or `select` for the buzzer.                               |
| `related_entities.ionizer_entity`          | automatic | `switch`, `input_boolean`, or `select` for the ionizer.                              |
| `related_entities.temperature_entity`      | automatic | `sensor` for temperature.                                                            |
| `related_entities.humidity_entity`         | automatic | `sensor` for humidity.                                                               |

Automatic related entity discovery uses the Home Assistant entity registry and
matches entities sharing the primary fan `device_id`. It also matches known
English and localized suffixes, including `_temperatuur` for temperature and
`_luchtvochtigheid` for humidity. Use explicit related entity fields when an
integration uses a different name or does not assign the entities to the same
device.

Angle `select` entities are supported when their options contain numeric
values. Accepted examples include `0`, `30°`, `60 degrees`, `-10.5`, and `.5`.
The optional degree suffix is case-insensitive. Non-numeric select options are
ignored for angle capabilities, so a generic mode selector cannot create a
dead angle control.

For Xiaomi MIOT, angle and vertical controls require an actionable related
entity. A primary fan angle attribute alone is not displayed as a detail and
does not authorize an angle action. Vertical swing accepts `switch`,
`input_boolean`, or `select`; angle controls accept `number`, `input_number`,
or numeric-option `select`.

## Behavior notes

`selection_mode` is `auto`, `buttons`, or `select`. `timer_mode` and `angle_mode`
default to `cycle`, which advances through the values with one button instead of
opening a dropdown; set either to `select` for a dropdown. The default block
order is `header`, `visual`, `airflow`, `position`, `features`; omitted blocks
are appended in that order. The default full header also enables its eyebrow,
mode, and known model badge, `compact` collapses all three, and each `show_*`
option can still override that behavior.

When `details.show_timer_when_off` is `false`, the inactive timer detail is
hidden while an active timer remains visible. `details.position: side` places
temperature, humidity, angle, and timer details beside the graphic on wide
cards and falls back below the graphic on narrow cards. Temperature and
humidity details use the `unit_of_measurement` of the resolved sensor, so a
Fahrenheit sensor renders `°F` without extra configuration.

The `controls.show_horizontal_*` and `controls.show_vertical_*` options are
visibility switches, not capability overrides. Unsupported controls remain
hidden even when a visibility switch is `true`. Set the switches to `false`
for devices such as the Xiaomi Smart Air Purifier 4 Pro that expose presets
but no actionable oscillation or angle entities.

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

MIoT optional angle controls require discovered or configured related `select`,
`number`, or `input_number` entities. Primary MIoT fan attributes alone are
not treated as angle actions. The `controls.show_horizontal_*` and
`controls.show_vertical_*` options are visibility switches, not capability
overrides. For the issue #26 purifier case, disable unsupported horizontal or
vertical controls explicitly.

For Xiaomi LED brightness controls, the custom Xiaomi service contract is
`0` for bright, `1` for dim, and `2` for off. A related
`*_led_brightness` number with a `0..2` range uses the same mapping. Other
switch, semantic select, and number entities use their exposed Home Assistant
contract. Numeric LED brightness select options use the same `0`/`1`/`2`
mapping.

## Configuration compatibility

- `entity_id` maps to `entity`
- `platform: default` maps to `integration: standard`
- `platform: xiaomi_miio` maps to `integration: xiaomi_miio`
- `platform: xiaomi_miio_fan` maps to `integration: xiaomi_miio_fan`
- `platform: xiaomi_miot` maps to `integration: xiaomi_miot`
- `force_sleep_mode_support` maps to `show_sleep`
- `hide_led_button: true` maps to `show_led: false`
- Flat visibility flags remain supported. For example,
  `show_timer: false` is used unless `controls.show_timer` is set.

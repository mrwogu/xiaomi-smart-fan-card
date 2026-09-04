# Compatibility

Xiaomi fan entities are exposed differently by Home Assistant integrations and
device models. This card stays integration-agnostic and renders an optional
control only when it has a usable source.

See [integration contract evidence](integration-contracts.md) for pinned
upstream revisions, model ranges, service payloads, timer caveats, and public
MIoT spec checksums. Source-contract tests are not hardware certification.

## Capability sources

| Capability                     | Accepted source                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Power                          | Standard `TURN_OFF` while on or `TURN_ON` while off; legacy fan actions when no feature mask exists                                        |
| Percentage and presets         | Standard `fan` feature bits, live attributes when no feature mask is exposed, or a known Xiaomi model profile                              |
| Horizontal oscillation         | Standard `fan` oscillation feature bit, live attributes when no feature mask is exposed, or a related boolean/select entity                |
| Horizontal angle               | Verified model or live attribute plus its registered Xiaomi service, or related `number`, `input_number`, or numeric-option `select`       |
| Vertical oscillation and angle | Supported model or live attribute plus the required Xiaomi services, or appropriate related toggle/numeric entities                        |
| Sleep mode                     | Sleep preset, related `switch`, `input_boolean`, or `select`                                                                               |
| Timer                          | Usable timer attribute plus the registered Xiaomi delay service, or related `number` or `input_number`                                     |
| Child lock, buzzer, ionizer    | Related switch, input boolean, or select, or a usable device attribute plus both registered Xiaomi on/off services                         |
| LED                            | Related light, switch, input boolean, select, number, or input number, or a usable device attribute plus the registered Xiaomi LED service |
| Temperature and humidity       | Fan attributes or related sensors                                                                                                          |
| Nudge                          | Supported model axes plus the registered Xiaomi nudge service, or an opposing related button pair plus `button.press`                      |

An explicit Home Assistant `supported_features` mask is authoritative for
standard power, percentage, preset, oscillation, and direction controls. Missing,
unknown, unavailable, or incorrectly typed related entities are ignored for
actions. Related boolean selects must expose both an enabled and disabled
option; semantic labels and numeric `1`/`0` labels are supported.
Unavailable related values also remove stale copied values from the displayed
state.

Buttons are the exception to unknown-state filtering: Home Assistant buttons
normally report `unknown` before their first press. An unavailable button is
still excluded. Complete opposing pairs enable axes independently.

## Integration notes

### Auto detection and standard fans

`auto` and `standard` use public Home Assistant fan actions and related entity
discovery. They do not assume an integration-specific service. An optional
control appears only when the primary fan, a related entity, a model profile,
or the matching registered service makes it actionable. A fan with
`supported_features: 0` therefore does not receive speed, preset, oscillation,
or direction controls just because stale attributes remain on the entity.

### Native Xiaomi Home

`xiaomi_miio` is Home Assistant's Xiaomi Home integration, distinct from
`xiaomi_miot` and `xiaomi_home`. The pinned core dispatch recognizes 14 pedestal
fan model IDs, listed in the evidence ledger. Standard feature masks are `63`
except `dmaker.fan.1c`, which is `59`; 1C has three speed levels.

The integration exposes optional controls as related `number`, `select`, and
`switch` entities, not syssi custom services. Automatic discovery uses the
Home Assistant entity registry and the primary fan device ID.

### syssi Xiaomi fan

Use `integration: xiaomi_miio_fan` when the custom Xiaomi services are
registered and the target model supports the action. Global service
registration alone is insufficient: the integration registers its services
regardless of which models are configured.

Horizontal angle uses `angle`; vertical angle uses `vertical_angle`. LED
brightness uses `0=bright`, `1=dim`, and `2=off`. The delay service takes
integer minutes for every model, including ZA5. Normal/natural mode falls back
to custom services when the live presets only represent speed levels.
The 2 Lite's Sleep preset can also be cleared through its normal-mode service.

### Xiaomi Miot

Use `integration: xiaomi_miot` or `integration: standard` when the integration
exposes a normal Home Assistant `fan` entity. Configure `related_entities`
when automatic entity discovery cannot identify an optional control. MIoT
derives standard speed, presets, and oscillation from property converters.
Actionable related entities take precedence, and angle controls accept a
discovered or configured related `select`, `number`, or `input_number` entity
with numeric angle options.

Default P76 converters expose an LED `light`, alarm and child-lock switches,
and left/right buttons. Timer, angle, and vertical controls depend on
additional entity exposure, customization, or the P76 property fallback below.

For `xiaomi.fan.p76`, the card also supports writable swing and angle
properties when `xiaomi_miot.set_property` is registered. Values can be on
the primary fan or a Xiaomi Miot Info button sharing its registry device ID.
The Info button can report `unknown` until pressed; its available metadata
still works. Other devices' Info entities and unavailable metadata are ignored.

Supported fields are `fan.horizontal_swing`, `fan.vertical_swing`,
`horizontal_swing_included_angle-2-7`, and
`vertical_swing_included_angle-2-9`. Fully qualified
`fan.horizontal_swing_included_angle` and
`fan.vertical_swing_included_angle` names work when exposed instead. Writes
use the exact available field, not inferred property IDs. P76 angle options
are `30`, `60`, `90`, `120` horizontally and `30`, `60`, `90`, `100` vertically.

The property must exist with a valid boolean or allowed numeric angle.
The model alone is insufficient, and this fallback is not enabled in `auto`,
`standard`, `xiaomi_miio`, or `xiaomi_miio_fan`.

The writable fields and angle options follow the
[P76 MIoT specification](https://home.miot-spec.com/spec/xiaomi.fan.p76).
Commands use the integration's
[`set_property` service](https://github.com/al-one/hass-xiaomi-miot/blob/master/custom_components/xiaomi_miot/services.yaml).

The `controls.show_horizontal_*` and `controls.show_vertical_*` options are
visibility switches, not capability overrides. See
[docs/configuration.md](configuration.md) for the discovery rules and the
control visibility contract.

### Fans with vertical oscillation or angle presets

The same device reaches these controls through a different path depending on
the selected integration:

| `integration`        | Vertical and angle behavior                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `xiaomi_miio_fan`    | Uses model-supported `xiaomi_miio_fan.*` actions and verified profile ranges.              |
| `xiaomi_miot`        | Uses related entities first, then verified P76 properties with `xiaomi_miot.set_property`. |
| `auto` or `standard` | Uses standard fan actions and related entities; does not invent vendor-specific actions.   |

When an integration exposes vertical or angle values as read-only attributes
without a matching action entity or service, the card hides those controls.
This prevents a button from claiming support that Home Assistant cannot
execute.

Some Xiaomi MIoT configurations expose horizontal oscillation as a same-device
switch, input boolean, or select rather than as a fan feature. Automatic
discovery and `related_entities.horizontal_swing_entity` support those
entities.

### Fans without oscillation or angle support

An air purifier, air circulator, or exhaust fan often exposes presets and
optional device entities while having no swing or angle entity at all. A
preset-only `supported_features` value does not imply oscillation. Hide the
unsupported controls explicitly:

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

## Model coverage

Known profiles cover families including `zhimi.fan.*`, `dmaker.fan.*`,
`xiaomi.fan.*`, and `leshow.fan.ss4`. A profile only declares the speed levels,
angle ranges, and vertical oscillation that its family supports. Unknown models
use live attributes and registered services without inventing unsupported
controls. Registered custom services also need evidence on the target device.

The source-derived matrix covers all 26 syssi dispatch IDs and all 14 core
pedestal IDs, plus standard masks and default/customized MIoT entity sets.
Known negative capabilities matter: 1C, P8, 2 Lite, and Leshow expose no usable
custom angle setter. P39 has no LED or buzzer. P76/P70 support four nudge
directions; Xiaomi P30/P43/P45/P85 only left/right.

The custom delay service accepts integer minutes, while ZA5 and legacy zhimi
readback uses seconds. Related timer entities keep their declared unit. Core
`xiaomi_miio` declares minute-based timer numbers even where its underlying
library uses seconds; this upstream mismatch is documented rather than
silently overridden. P5 readback units remain unverified.

Model profiles describe UI ranges, not device communication. The card never
connects directly to a Xiaomi device.

## Reporting compatibility issues

Include:

- Home Assistant and HACS versions
- Browser and frontend version
- Integration name and fan model string
- Redacted fan attributes and related entity domains and states
- For the P76 property fallback, relevant redacted Info properties and whether
  the Info entity belongs to the same Xiaomi Miot device
- Related entity options, numeric ranges, units, and whether each entity
  shares the primary fan device ID
- Card configuration
- Registered service name, if relevant
- Console error and exact reproduction steps

Do not include tokens, cookies, hostnames, private entity names, locations,
device identifiers, private dashboards, or full diagnostics exports.

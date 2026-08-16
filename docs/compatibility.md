# Compatibility

Xiaomi fan entities are exposed differently by Home Assistant integrations and
device models. This card stays integration-agnostic and renders an optional
control only when it has a usable source.

## Capability sources

| Capability                                         | Accepted source                                                                                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Power, percentage, presets, horizontal oscillation | Standard `fan` entity actions and attributes                                                                                                  |
| Horizontal angle                                   | Live fan attribute, model profile with registered Xiaomi service, or related `number`, `input_number`, or `select` with numeric angle options |
| Vertical oscillation and angle                     | Live attributes, a model profile that declares them plus the registered Xiaomi services, or related `number`, `input_number`, or `select`     |
| Sleep mode                                         | Sleep preset, related `switch`, `input_boolean`, or `select`                                                                                  |
| Timer                                              | Live timer attribute with registered service, related `number` or `input_number`, or registered Xiaomi delay service                          |
| Child lock, buzzer, ionizer                        | Related switch, input boolean, or select, or registered Xiaomi service                                                                        |
| LED                                                | Related switch, input boolean, select, number, or input number, or registered Xiaomi LED service                                              |
| Temperature and humidity                           | Fan attributes or related sensors                                                                                                             |
| Nudge                                              | Known model profile plus the registered Xiaomi nudge service                                                                                  |

Missing, unknown, and unavailable related entities are ignored for actions.
Unavailable related values also remove stale copied values from the displayed
state.

## Integration notes

### Auto detection and standard fans

`auto` and `standard` use public Home Assistant fan actions and related entity
discovery. They do not assume an integration-specific service. An optional
control appears only when the primary fan, a related entity, a model profile,
or a registered standard action makes it actionable.

### Native Xiaomi Home

`xiaomi_miio` uses standard Home Assistant fan actions. The integration may
also expose related device entities for LED, buzzer, child lock, favorite
level, timers, and sensors. Automatic discovery uses the Home Assistant entity
registry and the primary fan device ID.

### syssi Xiaomi fan

Use `integration: xiaomi_miio_fan` when the custom Xiaomi services are
registered. These services cover model-specific angle, vertical oscillation,
nudge, timer, LED, buzzer, child lock, and ionizer actions.

### Xiaomi Miot and other standard entities

Use `integration: xiaomi_miot` or `integration: standard` when the integration
exposes a normal Home Assistant `fan` entity. Configure `related_entities`
when automatic entity discovery cannot identify an optional control. MIoT
optional angle controls require a discovered or configured related `select`,
`number`, or `input_number` entity with numeric angle options. MIoT primary fan
attributes alone are not treated as angle actions.

The `controls.show_horizontal_*` and `controls.show_vertical_*` options are
visibility switches, not capability overrides. See
[docs/configuration.md](configuration.md) for the discovery rules and the
control visibility contract.

### Fans with vertical oscillation or angle presets

The same device reaches these controls through a different path depending on
the selected integration:

| `integration`        | Vertical and angle behavior                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `xiaomi_miio_fan`    | Uses registered `xiaomi_miio_fan.*` actions and the model profile ranges.                |
| `xiaomi_miot`        | Uses standard fan actions plus same-device related switch/select/number entities.        |
| `auto` or `standard` | Uses standard fan actions and related entities; does not invent vendor-specific actions. |

When an integration exposes vertical or angle values as read-only attributes
without a matching action entity or service, the card hides those controls.
This prevents a button from claiming support that Home Assistant cannot
execute.

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
controls.

Model profiles describe UI ranges, not device communication. The card never
connects directly to a Xiaomi device.

## Reporting compatibility issues

Include:

- Home Assistant and HACS versions
- Browser and frontend version
- Integration name and fan model string
- Redacted fan attributes and related entity domains and states
- Related entity options, numeric ranges, units, and whether each entity
  shares the primary fan device ID
- Card configuration
- Registered service name, if relevant
- Console error and exact reproduction steps

Do not include tokens, cookies, hostnames, private entity names, locations,
device identifiers, private dashboards, or full diagnostics exports.

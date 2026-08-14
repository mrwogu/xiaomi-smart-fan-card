# Compatibility

Xiaomi fan entities are exposed differently by Home Assistant integrations and
device models. This card stays integration-agnostic and renders an optional
control only when it has a usable source.

## Capability sources

| Capability                                         | Accepted source                                                                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Power, percentage, presets, horizontal oscillation | Standard `fan` entity actions and attributes                                                                         |
| Horizontal angle                                   | Live fan attribute, model profile with registered Xiaomi service, or related `number` or `input_number`              |
| Vertical oscillation and angle                     | Live attributes, P70 or P76 model profile with registered Xiaomi services, or related entities                       |
| Sleep mode                                         | Sleep preset, related `switch`, `input_boolean`, or `select`                                                         |
| Timer                                              | Live timer attribute with registered service, related `number` or `input_number`, or registered Xiaomi delay service |
| Child lock, buzzer, ionizer                        | Related switch, input boolean, or select, or registered Xiaomi service                                               |
| LED                                                | Related switch, input boolean, select, number, or input number, or registered Xiaomi LED service                     |
| Temperature and humidity                           | Fan attributes or related sensors                                                                                    |
| Nudge                                              | Known model profile plus the registered Xiaomi nudge service                                                         |

Missing, unknown, and unavailable related entities are ignored for actions.
Unavailable related values also remove stale copied values from the displayed
state.

## Integration notes

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
when automatic entity discovery cannot identify an optional control.

## Model coverage

Known profiles cover families including `zhimi.fan.*`, `dmaker.fan.*`,
`xiaomi.fan.*`, and `leshow.fan.ss4`. P70 and P76 profiles include vertical
oscillation and angle ranges. Unknown models use live attributes and
registered services without inventing unsupported controls.

Model profiles describe UI ranges, not device communication. The card never
connects directly to a Xiaomi device.

## Reporting compatibility issues

Include:

- Home Assistant and HACS versions
- Browser and frontend version
- Integration name and fan model string
- Redacted fan attributes and related entity domains and states
- Card configuration
- Registered service name, if relevant
- Console error and exact reproduction steps

Do not include tokens, cookies, hostnames, private entity names, locations,
device identifiers, private dashboards, or full diagnostics exports.

# Integration contract evidence

Source-backed evidence ledger for Xiaomi Fan Card integration decisions.
Reviewed 2026-09-04 using static upstream source inspection.

This is not physical-device certification. The contract fixtures are synthetic,
not device captures. Firmware, transport, customization, and entity availability
can change behavior. Unresolved upstream limitations are listed below rather
than hidden behind a claim of universal compatibility.

## Evidence scope

| Source                  | Revision                                                 |
| ----------------------- | -------------------------------------------------------- |
| Home Assistant Core     | `2026.9.0`, `dfb5a9e690daaf204b542896e4b595e61a11a401`   |
| syssi/xiaomi_fan        | `2026.8.0.0`, `7ed5456d4bfce62422ee60e777255b7bf21ebcfc` |
| al-one/hass-xiaomi-miot | `v1.1.4`, `4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6`     |
| rytilahti/python-miio   | `0.5.12`, `ecdabcd963d77526a84b0a3df4023595de22a657`     |

Home Assistant Core pins `python-miio==0.5.12`. syssi/xiaomi_fan accepts
`python-miio>=0.5.12`; installed versions outside this baseline can differ.

## Common Home Assistant fan contract

`FanEntityFeature` values are:

| Feature       |  Bit |
| ------------- | ---: |
| `SET_SPEED`   |  `1` |
| `OSCILLATE`   |  `2` |
| `DIRECTION`   |  `4` |
| `PRESET_MODE` |  `8` |
| `TURN_OFF`    | `16` |
| `TURN_ON`     | `32` |

The standard `fan` service registry is global. A registered service name does
not prove that a target entity implements its action. Target feature masks and
the entity method remain authoritative.

Power services explicitly require the corresponding feature flags.
The card's power button checks `TURN_OFF` while on and `TURN_ON` while off,
including one-way fan entities. An absent feature mask retains legacy behavior;
an explicit zero mask does not imply power support.

`set_preset_mode` validates exact membership in the entity's live
`preset_modes` list. It does not accept an arbitrary label. Default
`percentage_step` is `100 / speed_count`.

Evidence:

- [FanEntityFeature](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/fan/__init__.py#L43-L48)
- [Power service feature requirements](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/fan/__init__.py#L107-L126)
- [Preset validation](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/fan/__init__.py#L263-L285)
- [Percentage step](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/fan/__init__.py#L356-L364)
- [Feature-filtered fan services](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/fan/services.yaml#L1-L74)

## Home Assistant `xiaomi_miio`

Home Assistant labels this core integration Xiaomi Home. It is distinct from
`xiaomi_miot` and from the separate `xiaomi_home` integration.

Core source recognizes these 14 pedestal fan models:

```text
zhimi.fan.v2
zhimi.fan.v3
zhimi.fan.sa1
zhimi.fan.za1
zhimi.fan.za3
zhimi.fan.za4
zhimi.fan.za5
dmaker.fan.p5
dmaker.fan.p9
dmaker.fan.p10
dmaker.fan.p11
dmaker.fan.p18
dmaker.fan.p33
dmaker.fan.1c
```

All expose standard fan feature mask `63` except `dmaker.fan.1c`, which
exposes `59` because it lacks `DIRECTION`. The 1C has three speed levels, so
its default percentage step is `100 / 3`.

Core optional controls are exposed as same-device `number`, `select`, `switch`,
and sensor entities. They are not syssi `xiaomi_miio_fan.*` services.
Core also supports purifiers and air-fresh devices; that does not imply
oscillation or angle support.

Core number metadata declares:

- `delay_off_countdown`: minutes, `0-480`, step `1`
- old zhimi angle: `1-120`, step `1`
- `dmaker.fan.p5`, `p10`, `p11`, `p18`, `p33`: `30-140`, step `30`
- `dmaker.fan.p9`: `30-150`, step `30`
- `zhimi.fan.za5`: `30-120`, step `30`

The `max=140, step=30` metadata is not an arithmetic progression. This
upstream inconsistency does not justify inventing intermediate angle values.

Core old zhimi fan entities use `nature` and `normal` labels. Other core
library-backed fan paths use `Normal` and `Nature`; the pinned ZA5 class uses
`Nature` and `Normal`, not a Sleep preset. The card consumes live
`preset_modes` rather than guessing labels from a model name.

Timer caveat: Core declares the related timer entity in minutes, then passes
the numeric value directly to the library. Old zhimi and ZA5 library timer
paths use seconds. This is an upstream contract mismatch. The card preserves
the entity's declared unit and does not silently reinterpret it.

Evidence:

- [Core model dispatch](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/xiaomi_miio/fan.py#L183-L241)
- [Core model constants](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/xiaomi_miio/const.py#L87-L120)
- [Standard feature masks](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/xiaomi_miio/fan.py#L899-L931)
- [Core angle and timer metadata](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/xiaomi_miio/number.py#L194-L202)
- [Core model angle ranges](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/xiaomi_miio/number.py#L283-L291)
- [Core timer setter](https://github.com/home-assistant/core/blob/dfb5a9e690daaf204b542896e4b595e61a11a401/homeassistant/components/xiaomi_miio/number.py#L451-L456)
- [python-miio old zhimi timer](https://github.com/rytilahti/python-miio/blob/ecdabcd963d77526a84b0a3df4023595de22a657/miio/integrations/fan/zhimi/fan.py#L171-L174)
- [python-miio ZA5 timer](https://github.com/rytilahti/python-miio/blob/ecdabcd963d77526a84b0a3df4023595de22a657/miio/integrations/fan/zhimi/zhimi_miot.py#L304-L314)

## syssi `xiaomi_miio_fan`

Pinned dispatch contains 26 model IDs:

| Group        | Models                                                                             |
| ------------ | ---------------------------------------------------------------------------------- |
| Legacy zhimi | `zhimi.fan.v2`, `v3`, `sa1`, `za1`, `za3`, `za4`                                   |
| ZA5          | `zhimi.fan.za5`                                                                    |
| Dmaker       | `dmaker.fan.p5`, `p9`, `p10`, `p18`, `p30`, `p11`, `p15`, `p33`, `p39`, `1c`, `p8` |
| Xiaomi       | `xiaomi.fan.p30`, `p45`, `p76`, `p70`, `p85`, `p43`, `2lite`                       |
| Leshow       | `leshow.fan.ss4`                                                                   |

Custom service contracts:

| Action           | Payload contract                                                   |
| ---------------- | ------------------------------------------------------------------ |
| Horizontal angle | `angle`                                                            |
| Vertical angle   | `vertical_angle`, not `angle`                                      |
| LED brightness   | `brightness`: `0=bright`, `1=dim`, `2=off`                         |
| Delay off        | `delay_off`: integer `0-600`, minutes, including ZA5               |
| Nudge            | `direction`: `left`, `right`, `up`, or `down`, restricted by model |

All custom services are registered globally during platform setup. The handler
skips devices without the mapped method. Global service presence alone is not
proof of model support.

Verified model differences:

- Legacy zhimi angle backend accepts continuous `0-120`; the card offers safe
  samples `30`, `60`, `90`, and `120`.
- Dmaker P5, P10, P11, P15, P18, P30, P33, and P39 use
  `30`, `60`, `90`, `120`, and `140`.
- Dmaker P9 uses `30`, `60`, `90`, `120`, and `150`.
- Xiaomi P30 uses `30`, `60`, `90`, `120`, and `140`.
- Xiaomi P45 uses `30`, `60`, `90`, `120`, and `150`.
- Xiaomi P76 and P70 use horizontal `30`, `60`, `90`, `120`, and vertical
  `30`, `60`, `90`, `100`.
- Xiaomi P85 and P43 use horizontal `30`, `60`, and `90`.
- ZA5 uses `30`, `60`, `90`, and `120`.
- 1C, P8, 2 Lite, and Leshow have no usable angle setter. 1C and P8 carry an
  upstream angle feature flag, but python-miio `Fan1C` has no `set_angle`.
- P76 and P70 support four-direction nudge. Xiaomi P30, P43, P45, and P85
  support left and right only. ZA5 and Dmaker P33 have no custom `fan_turn`.
- P39 has no LED or buzzer feature. Leshow vendor extras are buzzer and timer;
  its standard presets are `Manual`, `Sleep`, `Strong`, and `Natural`.
- ZA5 is the only model in this source set with the ionizer feature.
- P70 presets are `off` and `Level 1` through `Level 4`; natural mode requires
  the separate service. Modern Xiaomi models expose speed and natural-speed
  presets, with `Sleep` additionally on P45. 1C uses `off` and `Level 1`
  through `Level 3`. 2 Lite exposes only `Sleep` as a preset, so normal and
  natural mode use the custom services.

Direction is not guaranteed to mean blade reversal. Older fan
`forward` and `reverse` actions map to right and left nudges. P76 and P70 use
direction actions to toggle vertical oscillation, not to reverse the blades.

Timer behavior has upstream inconsistencies:

- The custom service schema accepts `0-600` minutes.
- Older zhimi and ZA5 entity setters multiply requested minutes by `60`
  before calling second-based library methods.
- Newer Dmaker and Xiaomi library paths accept `0-480` minutes.
- Leshow accepts `0-540` minutes.
- P5 status documentation says seconds while its setter accepts minutes.
  Its fixture labels the readback unit unverified and does not assert a
  conversion without device evidence.

The service schema's upper limit is not a guarantee that every device accepts
that limit. The card's default timer cycle stays within `0-480` minutes.

Evidence:

- [Model dispatch](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/fan.py#L52-L112)
- [Preset maps](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/fan.py#L339-L513)
- [Feature flags](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/fan.py#L517-L590)
- [Service schemas](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/fan.py#L651-L731)
- [Platform dispatch and global registration](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/fan.py#L766-L903)
- [Service field schemas](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/services.yaml#L129-L215)
- [Legacy and P5 timer setters](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/fan.py#L1265-L1272)
- [ZA5 timer setter](https://github.com/syssi/xiaomi_fan/blob/7ed5456d4bfce62422ee60e777255b7bf21ebcfc/custom_components/xiaomi_miio_fan/fan.py#L1950-L1957)
- [python-miio Fan1C](https://github.com/rytilahti/python-miio/blob/ecdabcd963d77526a84b0a3df4023595de22a657/miio/integrations/fan/dmaker/fan_miot.py#L401-L520)
- [python-miio P5 timer](https://github.com/rytilahti/python-miio/blob/ecdabcd963d77526a84b0a3df4023595de22a657/miio/integrations/fan/dmaker/fan.py#L55-L73)
- [python-miio Leshow timer](https://github.com/rytilahti/python-miio/blob/ecdabcd963d77526a84b0a3df4023595de22a657/miio/integrations/fan/leshow/fan_leshow.py#L169-L181)

## `xiaomi_miot`

MIoT v1.1.4 derives fan capabilities from property converters:

- speed comes from a writable range or value list
- preset labels come from exact MIoT property descriptions
- the first matching horizontal or vertical swing converter supplies standard
  `OSCILLATE`

Model name and MIoT metadata alone are insufficient. A raw MIoT property is
not necessarily an exposed writable Home Assistant entity.

Customization patterns differ:

- generic `*.fan.*` customization adds delay and turn-left/right support
- `dmaker.fan.*` adds angle switches and angle number/select entities
- `zhimi.fan.*` adds horizontal and vertical angle numbers, delay, alarm, and
  anion switches

The default P76 converter fixture exposes indicator LED as a `light`, alarm and
child lock as switches, and left/right buttons. It does not assume angle, timer,
or vertical-control entities exist. The customized P76 fixture adds explicit
related entities for those features. A Dmaker P18 fixture separately covers
numeric-option angle selects and the model-specific customization pattern.

P76 and P70 public specs contain horizontal and vertical swing properties and
four nudge actions. P85 and P43 expose horizontal swing only. P45 exposes
horizontal angles through `150` degrees. The integration does not
automatically expose every optional property merely because its spec contains
it. Customization and entity availability still control the card.

The integration exposes global raw services:

- `set_property`: `{field, value}`
- `set_miot_property`: `{siid, piid, value}`

Their existence is not writable-property evidence. Card behavior stays behind
discovered or configured related entities, with one documented exception: the
verified `xiaomi.fan.p76` swing and angle property fallback behind
`xiaomi_miot.set_property` in explicit `integration: xiaomi_miot` mode (see
[compatibility](compatibility.md)). Automatic discovery is restricted to the
primary fan's device.

Evidence:

- [MIoT fan converter discovery](https://github.com/al-one/hass-xiaomi-miot/blob/4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6/custom_components/xiaomi_miot/fan.py#L70-L107)
- [Dmaker customization](https://github.com/al-one/hass-xiaomi-miot/blob/4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6/custom_components/xiaomi_miot/core/device_customizes.py#L826-L844)
- [Zhimi customization](https://github.com/al-one/hass-xiaomi-miot/blob/4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6/custom_components/xiaomi_miot/core/device_customizes.py#L2892-L2912)
- [Generic fan customization](https://github.com/al-one/hass-xiaomi-miot/blob/4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6/custom_components/xiaomi_miot/core/device_customizes.py#L3199-L3214)
- [Default entity converters](https://github.com/al-one/hass-xiaomi-miot/blob/4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6/custom_components/xiaomi_miot/core/device_customizes.py#L3440)
- [MIoT property setters](https://github.com/al-one/hass-xiaomi-miot/blob/4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6/custom_components/xiaomi_miot/core/device.py#L1072-L1115)
- [Raw service schemas](https://github.com/al-one/hass-xiaomi-miot/blob/4060ef5b11ffcec7b84a5d02446a9b82dbb38ff6/custom_components/xiaomi_miot/services.yaml#L47-L101)

## Public MIoT spec checksums

Checksums identify public spec responses fetched on 2026-09-04.

| Model | URN                                                          | Source                                                                                                              | SHA-256                                                            |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| P76   | `urn:miot-spec-v2:device:fan:0000A005:xiaomi-p76:1:0000D062` | [spec](https://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:fan:0000A005:xiaomi-p76:1:0000D062) | `3634c4391771572d1c46ef62803f6484ff948c2c4d5259eda2e58a6153b1dbde` |
| P70   | `urn:miot-spec-v2:device:fan:0000A005:xiaomi-p70:1:0000D062` | [spec](https://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:fan:0000A005:xiaomi-p70:1:0000D062) | `05d0bfd02ac330b12fc52158c97edf8c5116eca86826a19ff4bf117d6b592bd6` |
| P85   | `urn:miot-spec-v2:device:fan:0000A005:xiaomi-p85:1:0000D062` | [spec](https://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:fan:0000A005:xiaomi-p85:1:0000D062) | `9fe4a41e65e21d311d55cc536e9ed1e3ea4f65b0eb8b9ec790b2a718aff680aa` |
| P43   | `urn:miot-spec-v2:device:fan:0000A005:xiaomi-p43:1`          | [released spec](https://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:fan:0000A005:xiaomi-p43:1) | `734ebc86159a2c8c18f3bb77f46be602b5e8cb0499d6ed5bb889449e2c4579a4` |
| P45   | `urn:miot-spec-v2:device:fan:0000A005:xiaomi-p45:1:0000D062` | [spec](https://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:fan:0000A005:xiaomi-p45:1:0000D062) | `af52049af7ab2bc47699c65629afc6ef1176dcbc3a564aea33cf80cd1d947351` |

## Fixtures and regression checks

- [`integration-contracts.ts`](../tests/fixtures/integration-contracts.ts)
  records pinned revisions and independent expectations for the 26 syssi model
  IDs, 14 native model IDs, standard feature masks, and default/customized MIoT
  entity sets. Expectations do not import the card's model profiles.
- [`integration-contracts.test.ts`](../tests/unit/integration-contracts.test.ts)
  checks capabilities, payloads, unsupported directions, timer units, preset
  labels, related LED lights, and cross-integration service isolation.
- Existing example fixtures remain useful regression inputs, but their names
  are not independent proof of physical testing or upstream provenance.

Run the source-contract regression suite:

```sh
npm test -- tests/unit/integration-contracts.test.ts
```

Run all repository checks and rebuild the tracked HACS bundle:

```sh
npm run validate
```

## Compatibility boundaries

1. Treat explicit standard `supported_features` masks as authoritative.
2. Require device evidence as well as registered custom services.
3. Require actionable related entities for optional MIoT controls. A complete
   left/right or up/down button pair also requires `button.press`; unknown
   button state is normal before its first press.
4. Separate service input units from status readback units.
5. Use exposed entity ranges or verified model contracts, not broad service
   schemas, to constrain optional controls.
6. Do not infer blade reversal from an integration-specific direction action.
7. Hide unsupported controls instead of inventing MIoT properties or services.

Hardware validation remains pending. Check representative physical models
against writes, readback units, firmware behavior, and entity exposure before
calling any model certified. P5 timer readback and the core timer metadata
mismatches specifically still need upstream or device evidence.

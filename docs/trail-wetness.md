# Trail Wetness Guidance

This page documents the heuristics that drive the awareness panel’s “Trail Wetness” callouts and outlines next steps to tighten accuracy for long efforts (100k focus).

## Current Model (v2)

The calculator now derives a `WetnessInsight` object from Open‑Meteo daily history (7d lookback) and hourly forecasts:

- **Rolling windows:** liquid totals are tracked for 24h, 48h, and 72h windows to capture back‑to‑back storms separately from steady drizzle.
- **Net moisture balance:** total rainfall + snowmelt minus 40% of FAO evapotranspiration approximates surface drying.
- **Heavy events:** any day with a balance ≥ 1.2" is treated as a saturation event.
- **Freeze/thaw detection:** sub‑freezing minimums coupled with afternoon thaw flag icy mornings even when liquid totals drop.
- **Snowpack context:** remaining snowpack overrides mud calls, surfacing “Snowbound” or “Packed Snow” when thresholds (0.25"/1.0") are exceeded.

### Output labels

| Label        | When it triggers (abridged) | Suggested guidance |
|--------------|-----------------------------|--------------------|
| `Dry`        | Negligible liquid last 72h & net balance near zero | Full pace OK |
| `Moist`      | 0.10"–0.25" in last 72h or light net balance | Watch a few soft pockets |
| `Slick`      | ≥0.25" in 72h, ≥3 wet days, or 1 freeze/thaw | Dial cornering, expect greasy tread |
| `Muddy`      | ≥0.45" in 48h, heavy event, or net ≥0.6" | Poles/gaiters recommended |
| `Soaked`     | ≥0.6" in 24h or net ≥1.3" | Expect standing water, big slowdowns |
| `Slick/Icy`  | Any freeze-thaw cycle paired with low liquid | Icy slabs at dawn |
| `Packed Snow`| Snowpack ≥0.25" but <1.0" | Microspikes advised |
| `Snowbound`  | Snowpack ≥1.0" | Deep snow travel |

Each label carries a caution string piped into the awareness panel and retains the API-derived summary for tooltips.

Confidence is marked `low` (<4 sampled days), `medium` (4–5), or `high` (≥6) and rendered in the tooltip to signal data sparsity.

## Gaps & TODO

1. **Model calibration** – Capture manual trail conditions after key storms to tune thresholds. Store these in a lightweight JSON log to iterate without redeploying code.
2. **Soil type modifiers** – Introduce presets per route (e.g., Hartshorne sand vs. Allaire clay). These can weight the breakpoints above.
3. **Trailhead sensors** – Optional integration with USGS or PRISM snow-water equivalent feeds for better snowpack confidence.
4. **RPE impact estimate** – Map each category to an expected pace penalty (min/mi delta) so race plans can auto-adjust.
5. **Unit tests** – Add fixture-based unit specs (dry spell, heavy rain, freeze-thaw) to lock thresholds and support future tuning.

## Proposed Path to "Your Satisfaction"

- **Short term (this PR):** deploy the heuristics above so the awareness badge surfaces actionable notes for 100k prep.
- **Near term (1–2 weeks):** gather 5–10 historical events with known trail outcomes; backtest by feeding the recorded weather into `interpretWetness` and adjust thresholds as needed.
- **Mid term:** encode surface presets per route and expose a manual override slider (“looks worse than modeled”) for pre-dawn checks.
- **Long term:** attach the pace impact model to the wake calculation so the schedule recommends earlier wake times on soaked days.

These steps keep the system modular—`interpretWetness` is the only hook we need to refine as more field data lands.

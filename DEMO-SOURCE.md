# Rest Time demo provenance

Source: Hamann, A. & Carstengerdes, N. (2023). Assessing the development of mental fatigue during simulated flights with concurrent EEG-fNIRS measurement. Scientific Reports 13, 4738. https://doi.org/10.1038/s41598-023-31264-w

Figure 1a contains group mean F-ISA fatigue ratings over 16 blocks of a 90-minute simulated flight experiment (31 participants). The study reports first/last means of 1.61 and 3.03. Intermediate values in demo.js were approximately read from the published plot, not obtained from the participant CSV; the repository download was unavailable. Original figure: https://media.springernature.com/lw685/springer-static/image/art%3A10.1038%2Fs41598-023-31264-w/MediaObjects/41598_2023_31264_Fig1_HTML.png

## Adaptation (not validated probability)

The original ordinal ratings, duration and modality differ from this app. Interpolate the 16 group means to 41 points and subtract their endpoint linear trend. Retain small residual variations around a designed piecewise-linear scenario: minute 0 = 14, minute 15 = 22, minute 25 = 40, minute 40 = 70. This explicitly imposes the requested progression; the paper does not establish these timings or percentages. Two simulated channels use small designed offsets, converging to 70 at minute 40. Neither is an observed camera or wrist index. No population percentile is calculated. Both channels remain low for the first 15 minutes and rise steadily after minute 25.

The adapted numeric curve is in site/demo.js. It uses the uploaded output structure and quality-weighted fusion rules. Playback remains one simulated minute per two seconds and stops automatically at 40 minutes, then asks for optional wrap-up comments. Personal records and the public AI quota are unaffected by demo use.

Original figure and adapted curve attribution: © The Author(s) 2023, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Changes are described above.

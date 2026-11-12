# Quick demonstration credits

Audited on 10 November 2026. The application's source-code licence does not replace these media licences.

## Your Move: remotely hosted, not bundled

Exercise video by [Your Move](https://ymove.app).

The [free collection's published terms](https://ymove.app/free-exercise-videos) permit embedding in apps and websites with attribution, but prohibit redistribution as a standalone library. This app streams eight unchanged clips from the provider's public free-video endpoints. Their files and thumbnails are not included in this repository or the deployment artifact. No ownership, Creative Commons licence, offline caching permission or unrestricted redistribution right is asserted for these assets.

The selected videos are Barbell Bench Press, Barbell Back Squat, Barbell Deadlift, Dumbbell Lateral Raise, Leg Extension, Lat Pulldown, Seated Cable Row close V bar and Cable Crossover (Mid). The last three stand in for machine exercises and are labelled as related references in the app. Exact endpoint identifiers are recorded in `src/domain/demos.ts`. Bench and squat clips are also used as explicitly labelled related references for the paused exercises; the footage does not demonstrate the prescribed pause.

Each player displays the required linked credit. Streaming depends on the provider continuing to serve these endpoints. Recheck the terms and availability before changing the distribution model or adding caching.

## Goulart / wger: bundled adaptations, CC BY-SA 4.0

The thirteen MP4 files and thirteen JPEG posters in this directory are adapted from exercise videos attributed by the [wger API](https://wger.de/api/v2/video/?limit=100) to **Goulart**. Each selected source's licence is ID 2, identified by the [licence API](https://wger.de/api/v2/license/) as **Creative Commons Attribution-ShareAlike 4.0**. Author URL and source-title fields were blank; titles below identify the movements rather than inventing creator-supplied titles.

These modified videos and posters are provided under the same [CC BY-SA 4.0 licence](https://creativecommons.org/licenses/by-sa/4.0/). You may share and adapt them, including commercially, subject to that licence's attribution and ShareAlike conditions. No endorsement by Goulart or wger is implied. The licence does not necessarily grant other rights, such as personality or privacy rights.

### Sources and modifications

All clips: one video stream, H.264, 1280 × 720, 30 fps, yuv420p, fast-start MP4. Audio, extra streams and container metadata are removed. Source framing is retained; there is no body/technique retouching, speed change or synthetic animation. JPEG posters are still frames from one second into each adapted clip, resized to 640 × 360. Durations can differ slightly after frame-rate conversion.

| Output file (and same-name `.jpg` poster) | wger exercise / video ID | Source interval                    | Original file                                                                                 |
| ----------------------------------------- | ------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `dips.mp4`                                | 194 / 64                 | Start to end, approximately 12.7 s | [Original](https://wger.de/media/exercise-video/194/d039ec90-474d-47a9-a3ad-bf0b00828c82.MP4) |
| `seated-dumbbell-press.mp4`               | 567 / 12                 | 0–11 s                             | [Original](https://wger.de/media/exercise-video/567/64f33c19-1d96-4b7c-af17-6c6a4941c614.MOV) |
| `standing-dumbbell-curl.mp4`              | 92 / 48                  | Start to end, approximately 10.9 s | [Original](https://wger.de/media/exercise-video/92/8bfb917c-3d0d-49b9-8073-5d7e01c1b894.MOV)  |
| `seated-leg-curl.mp4`                     | 366 / 37                 | 0–12 s                             | [Original](https://wger.de/media/exercise-video/366/43df4b79-d4c3-4fbf-bcb5-e0d825b84120.MOV) |
| `pull-up.mp4`                             | 475 / 71                 | Start to end, approximately 18.8 s | [Original](https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV) |
| `overhead-dumbbell-extension.mp4`         | 211 / 57                 | 9–21 s                             | [Original](https://wger.de/media/exercise-video/211/85f6eb25-a76c-409e-9af9-497794ac0dfb.MOV) |
| `one-arm-cable-overhead-extension.mp4`    | 803 / 58                 | Start to end, approximately 9.3 s  | [Original](https://wger.de/media/exercise-video/803/99e0001f-217a-4b11-823c-014d24a5415e.MOV) |
| `dumbbell-romanian-deadlift.mp4`          | 507 / 3                  | 0–12 s                             | [Original](https://wger.de/media/exercise-video/507/6b6054b5-9236-4a63-8392-6ea7a9010ca6.MOV) |
| `split-squat.mp4`                         | 205 / 32                 | 0–9 s                              | [Original](https://wger.de/media/exercise-video/205/4cd5dc48-897f-4e0c-8c5a-639a4098ceb1.MOV) |
| `machine-preacher-curl.mp4`               | 465 / 54                 | 0–12 s                             | [Original](https://wger.de/media/exercise-video/465/5d2339a4-815f-46ba-aa19-8a763cfdeba0.MOV) |
| `seated-rear-delt-raise.mp4`              | 82 / 8                   | Start to end, approximately 7 s    | [Original](https://wger.de/media/exercise-video/82/ebf1e6d2-df48-44b8-a791-97f77e801bf3.MOV)  |
| `standing-calf-raise.mp4`                 | 622 / 15                 | 0–12 s                             | [Original](https://wger.de/media/exercise-video/622/461171e5-2b16-407d-bf27-27aeef43f105.MOV) |
| `seated-calf-raise.mp4`                   | 590 / 13                 | 0–12 s                             | [Original](https://wger.de/media/exercise-video/590/a325ae2e-686b-4a1f-aff2-ba37fa3fa157.MOV) |

Reproduction command, with the interval from the table:

```sh
ffmpeg -ss START -i SOURCE -t DURATION -map 0:v:0 \
  -vf 'scale=1280:-2,fps=30' -c:v libx264 -preset medium -crf 26 \
  -pix_fmt yuv420p -an -sn -dn -map_metadata -1 -movflags +faststart OUTPUT.mp4
ffmpeg -ss 1 -i OUTPUT.mp4 -frames:v 1 -vf 'scale=640:-2' -q:v 4 OUTPUT.jpg
```

### Adapted MP4 checksums (SHA-256)

```text
3d41db5950e377f38e86b8b0384fa1e5ab557e750e532ada2dcea897e25c7dbd  dips.mp4
44c0d8ffce11b8e1a1dbf65ba00ca420ca179b7673246d12ab7f8f4daaf8c04e  overhead-dumbbell-extension.mp4
d3e653b95c9150c75acafa718c6fca178737a1a8c391f0e6025bb8b8d125d65b  pull-up.mp4
60e64051d7145aec5a41764a2119505175f43213f68d3594753c05aa41ca9838  seated-dumbbell-press.mp4
3b2b2f8439ea65cfd0f4d24acba630d772adb79fff7ab911f9774a27f392ba10  seated-leg-curl.mp4
5a926c1ad32fcc7b9d8f25271497adc1557577b3150adb512f8e4c639fe24a78  standing-dumbbell-curl.mp4
40f56f9f4a7341ba541e6e627d767a60751675771115bcd401513812c6486d8d  dumbbell-romanian-deadlift.mp4
13b1d5c2486bccdeb8bdd68945ae7ab8425dabc97cb73c859f79120e8ae7c9c9  machine-preacher-curl.mp4
f7c35872b4b8cb4bf8539ea67a2b24a25b6f4285a311358295102ac372fc26ce  one-arm-cable-overhead-extension.mp4
b701c23b9d3eff830ba7a1a784e7aa928abc24a3eb3523a8796c9c4f96cab7c5  seated-calf-raise.mp4
9778dfe0473677e49850c477d6416c047c71ec8d819af9db0c98c21caf111242  seated-rear-delt-raise.mp4
ec80d1563ed0d7b1a208dfbfa5a4b9fd3be8b730f9ded32e5bd80f55f7f08fac  split-squat.mp4
0bae8635c4d87e82c0f70c66ed6fd53544c75ecd6a2783e29cabe08fd25fd070  standing-calf-raise.mp4
```

## YouTube: optional detailed explanations

Creator-hosted tutorials remain available separately through the privacy-enhanced YouTube player. They are not downloaded, bundled or covered by either media licence above. Creator names and video IDs remain in `src/domain/guides.ts`. YouTube may show ads or restrict playback.

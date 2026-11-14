export interface ResearchSource {
  authors: string;
  year: number;
  title: string;
  url: string;
}

export interface GuideEvidence {
  selection: string;
  qualification: string;
  sources: ResearchSource[];
}

/** Research informs selection; these papers do not certify an activation/targeting percentage. */
export const researchSources = {
  prescription: {
    authors: 'Currier et al.',
    year: 2026,
    title:
      'American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews',
    url: 'https://doi.org/10.1249/MSS.0000000000003897',
  },
  volume: {
    authors: 'Pelland et al.',
    year: 2026,
    title:
      'The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains',
    url: 'https://doi.org/10.1007/s40279-025-02344-w',
  },
  machines: {
    authors: 'Haugen et al.',
    year: 2023,
    title:
      'Effect of free-weight vs. machine-based strength training on maximal strength, hypertrophy and jump performance – a systematic review and meta-analysis',
    url: 'https://doi.org/10.1186/s13102-023-00713-4',
  },
  hamstrings: {
    authors: 'Maeo et al.',
    year: 2021,
    title:
      'Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths',
    url: 'https://doi.org/10.1249/MSS.0000000000002523',
  },
  triceps: {
    authors: 'Maeo et al.',
    year: 2023,
    title:
      'Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position',
    url: 'https://doi.org/10.1080/17461391.2022.2100279',
  },
  calves: {
    authors: 'Kinoshita et al.',
    year: 2023,
    title:
      'Triceps surae muscle hypertrophy is greater after standing versus seated calf-raise training',
    url: 'https://doi.org/10.3389/fphys.2023.1272106',
  },
  quads: {
    authors: 'Kassiano et al.',
    year: 2026,
    title:
      'Comparison of Muscle Hypertrophy and Strength Adaptations Induced by Back Squat and Leg Extension Resistance Exercises',
    url: 'https://doi.org/10.1519/JSC.0000000000005338',
  },
  lateralRaises: {
    authors: 'Larsen et al.',
    year: 2025,
    title:
      'Dumbbell versus cable lateral raises for lateral deltoid hypertrophy: an experimental study',
    url: 'https://doi.org/10.3389/fphys.2025.1611468',
  },
  curls: {
    authors: 'Kobayashi et al.',
    year: 2026,
    title:
      'Exercise-specific preferential hypertrophy of individual elbow flexor muscles after incline versus preacher dumbbell curl training',
    url: 'https://doi.org/10.1080/02640414.2026.2741751',
  },
  chest: {
    authors: 'Chaves et al.',
    year: 2020,
    title:
      'Effects of Horizontal and Incline Bench Press on Neuromuscular Adaptations in Untrained Young Men',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7449336/',
  },
  squatDepth: {
    authors: 'Kubo, Ikebukuro and Yata',
    year: 2019,
    title: 'Effects of squat training with different depths on lower limb muscle volumes',
    url: 'https://doi.org/10.1007/s00421-019-04181-y',
  },
  rdl: {
    authors: 'Crawford et al.',
    year: 2025,
    title:
      'Hamstrings Muscle Architecture and Morphology Following 6 wk of an Eccentrically Biased Romanian Deadlift or Nordic Hamstring Exercise Intervention',
    url: 'https://doi.org/10.1249/MSS.0000000000003701',
  },
} satisfies Record<string, ResearchSource>;

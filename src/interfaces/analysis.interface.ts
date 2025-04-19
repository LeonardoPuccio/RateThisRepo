export interface AnalysisResult {
  activityMessage: string;
  categories: ScoreCategory[];
  description: null | string;
  hasCommunity: boolean;
  hasReadme: boolean;
  hasWebsite: boolean;
  hasWiki: boolean;
  isActive: boolean;
  isPopular: boolean;
  isWellDocumented: boolean;
  isWellMaintained: boolean;
  metrics: RepositoryMetrics;
  readmeLength: number;
  recommendations: string[];
  repoName: string;
  score: string;
  strengths: string[];
}

export interface RepositoryMetrics {
  avgIssuesPerMonth: string;
  avgReleaseFrequency: string;
  busFactor: number;
  closedIssues: number;
  closedPRs: number;
  contributors: number;
  creationDate: string;
  daysSinceLastUpdate: number;
  forks: number;
  issueResolutionRate: string;
  languages: Record<string, string>;
  lastUpdate: string;
  license: string;
  openIssues: number;
  openPRs: number;
  prMergeRate: string;
  recentCommits: number;
  releaseCount: number;
  repoAge: string;
  stars: number;
  watchers: number;
}

export interface ScoreCategory {
  description: string;
  name: string;
  score: string;
}

export interface ScoreDetails {
  activity: number;
  community: number;
  documentation: number;
  maintenance: number;
  popularity: number;
}

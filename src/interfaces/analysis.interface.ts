export interface ScoreCategory {
  name: string;
  score: string;
  description: string;
}

export interface RepositoryMetrics {
  stars: number;
  forks: number;
  openIssues: number;
  closedIssues: number;
  contributors: number;
  daysSinceLastUpdate: number;
  busFactor: number;
  languages: Record<string, string>;
  creationDate: string;
  lastUpdate: string;
  repoAge: string;
  watchers: number;
  openPRs: number;
  closedPRs: number;
  releaseCount: number;
  license: string;
  issueResolutionRate: string;
  prMergeRate: string;
  recentCommits: number;
  avgIssuesPerMonth: string;
  avgReleaseFrequency: string;
}

export interface ScoreDetails {
  popularity: number;
  activity: number;
  community: number;
  maintenance: number;
  documentation: number;
}

export interface AnalysisResult {
  repoName: string;
  description: string | null;
  score: string;
  categories: ScoreCategory[];
  metrics: RepositoryMetrics;
  isPopular: boolean;
  isActive: boolean;
  hasCommunity: boolean;
  isWellMaintained: boolean;
  isWellDocumented: boolean;
  hasReadme: boolean;
  hasWiki: boolean;
  hasWebsite: boolean;
  readmeLength: number;
  activityMessage: string;
  strengths: string[];
  recommendations: string[];
}

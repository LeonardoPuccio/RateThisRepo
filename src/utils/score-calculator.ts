import { ScoreDetails } from '@/interfaces/analysis.interface';

export interface ScoreCalculatorData {
  busFactor: number;
  contributorsCount: number;
  daysSinceLastUpdate: number;
  description: null | string;
  forks: number;
  hasReadme: boolean;
  hasWebsite: boolean;
  hasWiki: boolean;
  issueResolutionRate: string;
  license: boolean;
  prMergeRate: string;
  readmeLength: number;
  recentCommits: number;
  stars: number;
}

/**
 * Calculates repository quality score based on various metrics
 */
export class ScoreCalculator {
  private data: ScoreCalculatorData;

  constructor(data: ScoreCalculatorData) {
    this.data = data;
  }

  /**
   * Calculate the overall score and detailed category scores
   * @returns Object with total score and category details
   */
  public calculate(): { details: ScoreDetails; total: string } {
    const scoreDetails: ScoreDetails = {
      activity: 0,
      community: 0,
      documentation: 0,
      maintenance: 0,
      popularity: 0,
    };

    // Calculate popularity score (max 20 points)
    scoreDetails.popularity = Math.min(20, Math.log10(this.data.stars + 1) * 6.5);

    // Calculate activity score (max 20 points)
    const baseActivityScore =
      this.data.daysSinceLastUpdate < 7
        ? 15 - (3 * this.data.daysSinceLastUpdate) / 7
        : this.data.daysSinceLastUpdate < 30
          ? 12 - (2 * (this.data.daysSinceLastUpdate - 7)) / (30 - 7)
          : this.data.daysSinceLastUpdate < 90
            ? 10 - (3 * (this.data.daysSinceLastUpdate - 30)) / (90 - 30)
            : this.data.daysSinceLastUpdate < 180
              ? 7 - (4 * (this.data.daysSinceLastUpdate - 90)) / (180 - 90)
              : this.data.daysSinceLastUpdate < 365
                ? 3 - (3 * (this.data.daysSinceLastUpdate - 180)) / (365 - 180)
                : 0;

    const recentActivityBonus = Math.min(
      5,
      this.data.recentCommits > 20 ? 5 : this.data.recentCommits / 4
    );

    scoreDetails.activity = Math.min(20, baseActivityScore + recentActivityBonus);

    // Calculate community score (max 20 points)
    const contributorScore = Math.min(10, this.data.contributorsCount * 1.5);
    const forkScore = Math.min(6, Math.log10(this.data.forks + 1) * 3);
    const busFactorScore = Math.min(4, (this.data.busFactor - 1) * 2);

    scoreDetails.community = contributorScore + forkScore + busFactorScore;

    // Calculate maintenance score (max 20 points)
    scoreDetails.maintenance = Math.min(
      20,
      (this.data.issueResolutionRate !== 'N/A'
        ? parseFloat(this.data.issueResolutionRate) / 5
        : 0) +
        (this.data.prMergeRate !== 'N/A' ? parseFloat(this.data.prMergeRate) / 10 : 0) +
        this.data.recentCommits * 0.4 +
        (this.data.license ? 4 : 0)
    );

    // Calculate documentation score (max 20 points)
    const readmeBonus = this.data.hasReadme ? 5 : 0;
    const wikiWebsiteBonus = this.data.hasWiki ? 5 : this.data.hasWebsite ? 5 : 0;
    const readmeLengthBonus =
      this.data.hasReadme && this.data.readmeLength > 500
        ? 5
        : this.data.hasReadme && this.data.readmeLength > 100
          ? (5 * (this.data.readmeLength - 100)) / 400
          : 0;
    const descriptionBonus =
      this.data.description && this.data.description.length > 50
        ? 5
        : this.data.description && this.data.description.length > 20
          ? 3 + (2 * (this.data.description.length - 20)) / 30
          : this.data.description && this.data.description.length > 10
            ? (3 * (this.data.description.length - 10)) / 10
            : 0;

    scoreDetails.documentation = Math.min(
      20,
      readmeBonus + wikiWebsiteBonus + readmeLengthBonus + descriptionBonus
    );

    // Calculate total score (sum of all categories)
    const totalScore =
      scoreDetails.popularity +
      scoreDetails.activity +
      scoreDetails.community +
      scoreDetails.maintenance +
      scoreDetails.documentation;

    return {
      details: scoreDetails,
      total: totalScore.toFixed(2),
    };
  }
}

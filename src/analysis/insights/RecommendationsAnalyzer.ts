/**
 * RecommendationsAnalyzer identifies areas for improvement in a GitHub repository
 * based on various metrics and characteristics.
 */
export class RecommendationsAnalyzer {
  /**
   * Generate repository improvement recommendations
   * @param description Repository description
   * @param hasReadme Whether the repository has a README
   * @param readmeLength Length of the README content
   * @param hasWiki Whether the repository has a wiki
   * @param hasWebsite Whether the repository has a website
   * @param contributorsCount Number of contributors
   * @param busFactor Bus factor value
   * @param stars Repository star count
   * @param issueResolutionRate Issue resolution rate as a string percentage
   * @param openPRs Number of open pull requests
   * @param closedPRs Number of closed pull requests
   * @param openIssues Number of open issues
   * @param daysSinceLastUpdate Days since last repository update
   * @param releaseCount Number of releases
   * @param daysSinceCreation Days since repository creation
   * @param avgReleaseFrequency Average days between releases
   * @param hasLicense Whether the repository has a license
   * @returns Array of recommendation descriptions
   */
  public static generate(
    description: null | string,
    hasReadme: boolean,
    readmeLength: number,
    hasWiki: boolean,
    hasWebsite: boolean,
    contributorsCount: number,
    busFactor: number,
    stars: number,
    issueResolutionRate: string,
    openPRs: number,
    closedPRs: number,
    openIssues: number,
    daysSinceLastUpdate: number,
    releaseCount: number,
    daysSinceCreation: number,
    avgReleaseFrequency: string,
    hasLicense: boolean
  ): string[] {
    const recommendations: string[] = [];

    // Documentation recommendations
    if (!description || description.length < 20) {
      recommendations.push(
        "⚠️ The repository lacks a detailed description - add a clear explanation of the project's purpose"
      );
    }

    if (!hasReadme) {
      recommendations.push(
        '⚠️ Missing README file - add a comprehensive README to help users understand and use your project'
      );
    } else if (readmeLength < 300) {
      recommendations.push(
        '⚠️ README is too brief - expand it to include installation, usage, and contribution guidelines'
      );
    }

    if (!hasWiki && !hasWebsite && contributorsCount > 3) {
      recommendations.push(
        '⚠️ Consider adding a wiki or website for more detailed documentation as your contributor base grows'
      );
    }

    // License recommendations
    if (!hasLicense) {
      recommendations.push(
        '⚠️ Missing a defined license - add one to clarify how others can use and contribute to your code'
      );
    }

    // Activity recommendations
    if (daysSinceLastUpdate > 180) {
      recommendations.push(
        "⚠️ Repository hasn't been updated in more than 6 months - provide a status update or mark as archived if no longer maintained"
      );
    } else if (daysSinceLastUpdate > 90) {
      recommendations.push(
        '⚠️ Low recent activity - project may appear abandoned without regular updates'
      );
    }

    // Community recommendations
    if (contributorsCount < 2) {
      recommendations.push(
        '⚠️ Single-contributor project - consider recruiting additional contributors for project sustainability'
      );
    }

    if (busFactor === 1 && stars > 50) {
      recommendations.push(
        '⚠️ High bus factor risk - project depends heavily on a single contributor which is risky for a popular project'
      );
    }

    // Maintenance recommendations
    if (issueResolutionRate !== 'N/A' && parseFloat(issueResolutionRate) < 50) {
      recommendations.push(
        '⚠️ Low issue resolution rate (<50%) - prioritize addressing open issues to improve user confidence'
      );
    }

    if (openPRs > 5 && closedPRs < openPRs) {
      recommendations.push(
        '⚠️ Backlog of open pull requests - review and address pending contributions to encourage further participation'
      );
    }

    if (openIssues > 0 && daysSinceLastUpdate > 90) {
      recommendations.push(
        "⚠️ Open issues with no recent activity - triage issues and update status even if they can't be fixed immediately"
      );
    }

    // Release recommendations
    if (releaseCount === 0 && daysSinceCreation > 90) {
      recommendations.push(
        '⚠️ No formal releases found - create tagged releases for better versioning and user adoption'
      );
    } else if (
      releaseCount > 0 &&
      avgReleaseFrequency !== 'N/A' &&
      parseInt(avgReleaseFrequency) > 180
    ) {
      recommendations.push(
        '⚠️ Infrequent releases - consider more regular release cycles to provide users with stable versions'
      );
    }

    return recommendations;
  }
}

import { ReleaseData } from '@/interfaces/repository.interface';

/**
 * StrengthsAnalyzer identifies the strengths of a GitHub repository
 * based on various metrics and characteristics.
 */
export class StrengthsAnalyzer {
  /**
   * Identify repository strengths based on metrics
   * @param stars Repository star count
   * @param forks Repository fork count
   * @param contributorsCount Number of contributors
   * @param busFactor Bus factor value
   * @param recentCommits Recent commit count
   * @param daysSinceLastUpdate Days since last repository update
   * @param issueResolutionRate Issue resolution rate as a string percentage
   * @param prMergeRate PR merge rate as a string percentage
   * @param totalIssues Total number of issues
   * @param closedPRs Number of closed pull requests
   * @param releases Repository releases data
   * @param hasReadme Whether the repository has a README
   * @param hasWiki Whether the repository has a wiki
   * @param hasWebsite Whether the repository has a website
   * @param readmeLength Length of the README content
   * @param hasLicense Whether the repository has a license
   * @returns Array of strength descriptions
   */
  public static identify(
    stars: number,
    forks: number,
    contributorsCount: number,
    busFactor: number,
    recentCommits: number,
    daysSinceLastUpdate: number,
    issueResolutionRate: string,
    prMergeRate: string,
    totalIssues: number,
    closedPRs: number,
    releases: null | ReleaseData[],
    hasReadme: boolean,
    hasWiki: boolean,
    hasWebsite: boolean,
    readmeLength: number,
    hasLicense: boolean
  ): string[] {
    const strengths: string[] = [];

    // Popularity strengths
    if (stars > 5000) {
      strengths.push('⭐ Extremely popular repository with widespread adoption');
    } else if (stars > 1000) {
      strengths.push('⭐ Highly popular repository with significant community interest');
    } else if (stars > 100) {
      strengths.push('⭐ Good popularity with the developer community');
    }

    if (forks > 100) {
      strengths.push('🍴 Strong fork count indicating high reuse and adaptation');
    }

    // Community strengths
    if (contributorsCount > 20) {
      strengths.push('👥 Exceptional contributor base with a large number of developers');
    } else if (contributorsCount > 10) {
      strengths.push(
        '👥 Strong contributor base with multiple developers contributing to the codebase'
      );
    } else if (contributorsCount > 5 && busFactor > 1) {
      strengths.push('👥 Healthy contributor community with shared project ownership');
    }

    if (busFactor >= 3) {
      strengths.push('🚌 Low bus factor risk - development is well-distributed among contributors');
    }

    // Activity strengths
    if (recentCommits > 50) {
      strengths.push('📈 Exceptionally active development with very frequent commits');
    } else if (recentCommits > 30) {
      strengths.push('📈 Very active development with frequent commits');
    } else if (recentCommits > 10) {
      strengths.push('📈 Steady recent development activity');
    }

    if (daysSinceLastUpdate < 7 && recentCommits > 5) {
      strengths.push('⚡ Actively maintained with recent updates');
    }

    // Maintenance strengths
    if (issueResolutionRate !== 'N/A' && parseFloat(issueResolutionRate) > 80) {
      strengths.push('🔧 Excellent issue resolution rate (>80%)');
    } else if (
      issueResolutionRate !== 'N/A' &&
      parseFloat(issueResolutionRate) > 60 &&
      totalIssues > 20
    ) {
      strengths.push('🔧 Good issue handling with consistent resolution');
    }

    if (prMergeRate !== 'N/A' && parseFloat(prMergeRate) > 70 && closedPRs > 20) {
      strengths.push('🔀 Strong pull request process with high merge rate');
    }

    // Release strengths
    if (releases && releases.length > 20) {
      strengths.push('📦 Extensive release history demonstrating project maturity');
    } else if (releases && releases.length > 5) {
      strengths.push('🚀 Regular release schedule showing project maintenance');
    }

    // Documentation strengths
    if (hasLicense) {
      strengths.push('📜 Clear licensing information');
    }

    if (hasWebsite && hasReadme && readmeLength > 1000) {
      strengths.push('📚 Comprehensive documentation with detailed README and project website');
    } else if (hasWebsite && hasReadme) {
      strengths.push('📚 Well-documented with both README and project website');
    } else if (hasReadme && readmeLength > 1000) {
      strengths.push('📄 Detailed README with comprehensive information');
    } else if (hasReadme) {
      strengths.push('📄 Project provides README documentation');
    }

    return strengths;
  }
}

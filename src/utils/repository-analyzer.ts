import { AnalysisResult, ScoreCategory } from '../interfaces/analysis.interface';
import { 
  RepositoryData, 
  IssueData, 
  PullRequestData, 
  ContributorData, 
  CommitData, 
  ReleaseData, 
  LanguageData 
} from '../interfaces/repository.interface';
import { GitHubAPI } from './github-api';
import { ScoreCalculator } from './score-calculator';
import { BusFactorCalculator } from './bus-factor';

/**
 * Analyzes a GitHub repository and generates a quality score and insights
 */
export class RepositoryAnalyzer {
  private api: GitHubAPI;
  private username: string;
  private repoName: string;
  private hasReadme: boolean = false;
  private readmeLength: number = 0;
  
  constructor(username: string, repoName: string, token: string | null = null) {
    this.username = username;
    this.repoName = repoName;
    this.api = new GitHubAPI(username, repoName, token);
  }
  
  /**
   * Detect README from DOM elements (for content script)
   * @param document Document object to search for README
   */
  public detectReadmeFromDOM(document: Document): void {
    // Find README element in the DOM
    const readmeElement = document.querySelector('#readme') || 
                          document.querySelector('article[data-targets="readme-toc.content"]') ||
                          document.querySelector('[data-testid="readme"]');
    
    // Text-based detection as fallback
    const hasReadmeInContent = document.body.textContent?.includes('README.md') || 
                              document.body.textContent?.includes('README.MD') ||
                              document.body.textContent?.includes('readme.md') || false;
    
    this.hasReadme = readmeElement !== null || hasReadmeInContent;
    this.readmeLength = this.hasReadme && readmeElement ? readmeElement.textContent?.length || 0 : 
                       (this.hasReadme ? 300 : 0); // Assume reasonable length if detected by text
  }
  
  /**
   * Analyze the repository and generate a comprehensive report
   * @returns Promise with the analysis result
   */
  public async analyze(): Promise<AnalysisResult> {
    try {
      // Collect data from GitHub API
      const [
        repoData,
        issues,
        pullRequests,
        contributors,
        commits,
        releases,
        languages
      ] = await Promise.all([
        this.api.getRepositoryData() as Promise<RepositoryData>,
        this.api.getIssues() as Promise<IssueData[]>,
        this.api.getPullRequests() as Promise<PullRequestData[]>,
        this.api.getContributors() as Promise<ContributorData[]>,
        this.api.getCommits() as Promise<CommitData[]>,
        this.api.getReleases() as Promise<ReleaseData[]>,
        this.api.getLanguages() as Promise<LanguageData>
      ]);
      
      // Calculate basic repository information
      const stars = repoData.stargazers_count;
      const forks = repoData.forks_count;
      const openIssues = repoData.open_issues_count;
      const closedIssues = issues ? issues.filter(i => i.state === 'closed').length : 0;
      const totalIssues = openIssues + closedIssues;
      const watchers = repoData.subscribers_count || repoData.watchers_count;
      const hasWiki = repoData.has_wiki;
      const hasPages = repoData.has_pages;
      const hasWebsite: boolean = Boolean(hasPages || (repoData.homepage && repoData.homepage.length > 0));
      const creationDate = new Date(repoData.created_at);
      const lastUpdateDate = new Date(repoData.updated_at);
      const daysSinceCreation = Math.floor((new Date().getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceLastUpdate = Math.floor((new Date().getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate advanced metrics
      const issueResolutionRate = totalIssues > 0 ? (closedIssues / totalIssues * 100).toFixed(2) : 'N/A';
      const avgIssuesPerMonth = totalIssues > 0 ? (totalIssues / (daysSinceCreation / 30)).toFixed(2) : '0';
      const contributorsCount = contributors ? contributors.length : 0;
      
      // Calculate recent activity
      const recentCommits = commits ? commits.filter(c => {
        const commitDate = new Date(c.commit.author.date);
        return (new Date().getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
      }).length : 0;
      
      // Calculate pull request metrics
      const openPRs = pullRequests ? pullRequests.filter(pr => pr.state === 'open').length : 0;
      const closedPRs = pullRequests ? pullRequests.filter(pr => pr.state === 'closed').length : 0;
      const mergedPRs = pullRequests ? pullRequests.filter(pr => pr.merged_at !== null).length : 0;
      const prMergeRate = closedPRs > 0 ? 
        (mergedPRs / closedPRs * 100).toFixed(2) : 'N/A';
      
      // Calculate release frequency
      const releaseCount = releases ? releases.length : 0;
      const avgReleaseFrequency = releaseCount > 1 && daysSinceCreation > 30 ? 
        (daysSinceCreation / releaseCount).toFixed(0) : 'N/A';
      
      // Calculate bus factor
      const busFactor = BusFactorCalculator.calculate(contributors);
      
      // Calculate language distribution
      let languageDistribution: Record<string, string> = {};
      if (languages) {
        const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
        languageDistribution = Object.entries(languages).reduce<Record<string, string>>((result, [lang, bytes]) => {
          result[lang] = (bytes / totalBytes * 100).toFixed(2) + '%';
          return result;
        }, {});
      }
      
      // Format the activity message
      let activityMessage = `Last updated ${daysSinceLastUpdate} days ago`;
      if (recentCommits > 0) {
        activityMessage += `, ${recentCommits} recent commits`;
      } else if (daysSinceLastUpdate < 30) {
        activityMessage += `, but no recent commits`;
      } else {
        activityMessage += `, no recent activity`;
      }
      
      // Health indicators criteria
      const isPopular = stars > 100;
      const isActive = (daysSinceLastUpdate < 30 && recentCommits > 0) || recentCommits > 5;
      const hasCommunity = contributorsCount > 3 && busFactor > 1;
      const isWellMaintained = issueResolutionRate !== 'N/A' && parseFloat(issueResolutionRate) > 50;
      const isWellDocumented = (this.hasReadme && this.readmeLength > 300) || (hasWebsite && this.hasReadme);
      
      // Check if license exists
      const hasLicense = repoData.license !== null && repoData.license !== undefined;
      
      // Calculate score
      const scoreCalculator = new ScoreCalculator({
        stars,
        forks,
        daysSinceLastUpdate,
        recentCommits,
        contributorsCount,
        busFactor,
        issueResolutionRate,
        prMergeRate,
        hasReadme: this.hasReadme,
        readmeLength: this.readmeLength,
        hasWiki,
        hasWebsite: Boolean(hasWebsite),
        description: repoData.description,
        license: Boolean(repoData.license)
      });
      
      const scoreResult = scoreCalculator.calculate();
      const finalScore = scoreResult.total;
      
      // Create score categories for display
      const scoreCategories: ScoreCategory[] = [
        { 
          name: 'Popularity', 
          score: scoreResult.details.popularity.toFixed(2),
          description: 'Based on star count and community adoption'
        },
        { 
          name: 'Activity', 
          score: scoreResult.details.activity.toFixed(2),
          description: 'Based on recency of updates and development pace'
        },
        { 
          name: 'Community', 
          score: scoreResult.details.community.toFixed(2),
          description: 'Based on contributor count, forks, and bus factor'
        },
        { 
          name: 'Maintenance', 
          score: scoreResult.details.maintenance.toFixed(2),
          description: 'Based on issue resolution, PR handling, and project structure'
        },
        { 
          name: 'Documentation', 
          score: scoreResult.details.documentation.toFixed(2),
          description: 'Based on README quality, website/wiki presence, and overall project documentation'
        }
      ];
      
      // Generate strengths and recommendations
      const strengths = this.identifyStrengths(
        stars, forks, contributorsCount, busFactor, recentCommits, 
        daysSinceLastUpdate, issueResolutionRate, prMergeRate, 
        totalIssues, closedPRs, releases, this.hasReadme, hasWiki, hasWebsite, this.readmeLength,
        hasLicense
      );
      
      const recommendations = this.generateRecommendations(
        repoData.description, this.hasReadme, this.readmeLength, hasWiki, hasWebsite, 
        contributorsCount, busFactor, stars, issueResolutionRate, 
        openPRs, closedPRs, openIssues, daysSinceLastUpdate, releaseCount, 
        daysSinceCreation, avgReleaseFrequency, hasLicense
      );
      
      // Create the result object
      const result: AnalysisResult = {
        repoName: `${this.username}/${this.repoName}`,
        description: repoData.description,
        score: finalScore,
        categories: scoreCategories,
        metrics: {
          stars,
          forks,
          openIssues,
          closedIssues,
          contributors: contributorsCount,
          daysSinceLastUpdate,
          busFactor,
          languages: languageDistribution,
          creationDate: creationDate.toLocaleDateString(),
          lastUpdate: `${lastUpdateDate.toLocaleDateString()} (${daysSinceLastUpdate} days ago)`,
          repoAge: `${daysSinceCreation} days`,
          watchers,
          openPRs,
          closedPRs,
          releaseCount,
          license: repoData.license ? repoData.license.name : 'None',
          issueResolutionRate: issueResolutionRate !== 'N/A' ? `${issueResolutionRate}%` : 'N/A',
          prMergeRate: prMergeRate !== 'N/A' ? `${prMergeRate}%` : 'N/A',
          recentCommits,
          avgIssuesPerMonth,
          avgReleaseFrequency
        },
        isPopular,
        isActive,
        hasCommunity,
        isWellMaintained,
        isWellDocumented,
        hasReadme: this.hasReadme,
        hasWiki,
        hasWebsite,
        readmeLength: this.readmeLength,
        activityMessage,
        strengths,
        recommendations
      };
      
      return result;
    } catch (error) {
      console.error("Error analyzing repository:", error);
      throw error;
    }
  }
  
  /**
   * Identify repository strengths
   * @returns Array of strength descriptions
   */
  private identifyStrengths(
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
    releases: ReleaseData[] | null, 
    hasReadme: boolean, 
    hasWiki: boolean, 
    hasWebsite: boolean, 
    readmeLength: number,
    hasLicense: boolean
  ): string[] {
    const strengths: string[] = [];
    
    // Popularity strengths
    if (stars > 5000) {
      strengths.push("⭐ Extremely popular repository with widespread adoption");
    } else if (stars > 1000) {
      strengths.push("⭐ Highly popular repository with significant community interest");
    } else if (stars > 100) {
      strengths.push("⭐ Good popularity with the developer community");
    }
    
    if (forks > 100) {
      strengths.push("🍴 Strong fork count indicating high reuse and adaptation");
    }
    
    // Community strengths
    if (contributorsCount > 20) {
      strengths.push("👥 Exceptional contributor base with a large number of developers");
    } else if (contributorsCount > 10) {
      strengths.push("👥 Strong contributor base with multiple developers contributing to the codebase");
    } else if (contributorsCount > 5 && busFactor > 1) {
      strengths.push("👥 Healthy contributor community with shared project ownership");
    }
    
    if (busFactor >= 3) {
      strengths.push("🚌 Low bus factor risk - development is well-distributed among contributors");
    }
    
    // Activity strengths
    if (recentCommits > 50) {
      strengths.push("📈 Exceptionally active development with very frequent commits");
    } else if (recentCommits > 30) {
      strengths.push("📈 Very active development with frequent commits");
    } else if (recentCommits > 10) {
      strengths.push("📈 Steady recent development activity");
    }
    
    if (daysSinceLastUpdate < 7 && recentCommits > 5) {
      strengths.push("⚡ Actively maintained with recent updates");
    }
    
    // Maintenance strengths
    if (issueResolutionRate !== 'N/A' && parseFloat(issueResolutionRate) > 80) {
      strengths.push("🔧 Excellent issue resolution rate (>80%)");
    } else if (issueResolutionRate !== 'N/A' && parseFloat(issueResolutionRate) > 60 && totalIssues > 20) {
      strengths.push("🔧 Good issue handling with consistent resolution");
    }
    
    if (prMergeRate !== 'N/A' && parseFloat(prMergeRate) > 70 && closedPRs > 20) {
      strengths.push("🔀 Strong pull request process with high merge rate");
    }
    
    // Release strengths
    if (releases && releases.length > 20) {
      strengths.push("📦 Extensive release history demonstrating project maturity");
    } else if (releases && releases.length > 5) {
      strengths.push("🚀 Regular release schedule showing project maintenance");
    }
    
    // Documentation strengths
    if (hasLicense) {
      strengths.push("📜 Clear licensing information");
    }
    
    if (hasWebsite && hasReadme && readmeLength > 1000) {
      strengths.push("📚 Comprehensive documentation with detailed README and project website");
    } else if (hasWiki && hasReadme) {
      strengths.push("📚 Well-documented with both README and Wiki");
    } else if (hasWebsite && hasReadme) {
      strengths.push("📚 Well-documented with both README and project website");
    } else if (hasReadme && readmeLength > 1000) {
      strengths.push("📄 Detailed README with comprehensive information");
    }
    
    return strengths;
  }
  
  /**
   * Generate repository improvement recommendations
   * @returns Array of recommendation descriptions
   */
  private generateRecommendations(
    description: string | null, 
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
      recommendations.push("⚠️ The repository lacks a detailed description - add a clear explanation of the project's purpose");
    }
    
    if (!hasReadme) {
      recommendations.push("⚠️ Missing README file - add a comprehensive README to help users understand and use your project");
    } else if (readmeLength < 300) {
      recommendations.push("⚠️ README is too brief - expand it to include installation, usage, and contribution guidelines");
    }
    
    if (!hasWiki && !hasWebsite && contributorsCount > 3) {
      recommendations.push("⚠️ Consider adding a wiki or website for more detailed documentation as your contributor base grows");
    }
    
    // License recommendations
    if (!hasLicense) {
      recommendations.push("⚠️ Missing a defined license - add one to clarify how others can use and contribute to your code");
    }
    
    // Activity recommendations
    if (daysSinceLastUpdate > 180) {
      recommendations.push("⚠️ Repository hasn't been updated in more than 6 months - provide a status update or mark as archived if no longer maintained");
    } else if (daysSinceLastUpdate > 90) {
      recommendations.push("⚠️ Low recent activity - project may appear abandoned without regular updates");
    }
    
    // Community recommendations
    if (contributorsCount < 2) {
      recommendations.push("⚠️ Single-contributor project - consider recruiting additional contributors for project sustainability");
    }
    
    if (busFactor === 1 && stars > 50) {
      recommendations.push("⚠️ High bus factor risk - project depends heavily on a single contributor which is risky for a popular project");
    }
    
    // Maintenance recommendations
    if (issueResolutionRate !== 'N/A' && parseFloat(issueResolutionRate) < 50) {
      recommendations.push("⚠️ Low issue resolution rate (<50%) - prioritize addressing open issues to improve user confidence");
    }
    
    if (openPRs > 5 && closedPRs < openPRs) {
      recommendations.push("⚠️ Backlog of open pull requests - review and address pending contributions to encourage further participation");
    }
    
    if (openIssues > 0 && daysSinceLastUpdate > 90) {
      recommendations.push("⚠️ Open issues with no recent activity - triage issues and update status even if they can't be fixed immediately");
    }
    
    // Release recommendations
    if (releaseCount === 0 && daysSinceCreation > 90) {
      recommendations.push("⚠️ No formal releases found - create tagged releases for better versioning and user adoption");
    } else if (releaseCount > 0 && avgReleaseFrequency !== 'N/A' && parseInt(avgReleaseFrequency) > 180) {
      recommendations.push("⚠️ Infrequent releases - consider more regular release cycles to provide users with stable versions");
    }
    
    return recommendations;
  }
}

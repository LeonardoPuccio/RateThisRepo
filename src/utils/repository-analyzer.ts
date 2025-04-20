import { RecommendationsAnalyzer, StrengthsAnalyzer } from '@/analysis/insights';
import { AnalysisResult, ScoreCategory } from '@/interfaces/analysis.interface';
import {
  CommitData,
  ContributorData,
  IssueData,
  LanguageData,
  PullRequestData,
  ReleaseData,
  RepositoryData,
} from '@/interfaces/repository.interface';

import { BusFactorCalculator } from './bus-factor';
import { GitHubAPI } from './github-api';
import { ScoreCalculator } from './score-calculator';

/**
 * Analyzes a GitHub repository and generates a quality score and insights
 */
export class RepositoryAnalyzer {
  private api: GitHubAPI;
  private hasReadme: boolean = false;
  private readmeLength: number = 0;
  private repoName: string;
  private username: string;

  constructor(username: string, repoName: string, token: null | string = null) {
    this.username = username;
    this.repoName = repoName;
    this.api = new GitHubAPI(username, repoName, token);
  }

  /**
   * Analyze the repository and generate a comprehensive report
   * @returns Promise with the analysis result
   */
  public async analyze(): Promise<AnalysisResult> {
    try {
      // Collect data from GitHub API
      const [repoData, issues, pullRequests, contributors, commits, releases, languages] =
        await Promise.all([
          this.api.getRepositoryData() as Promise<RepositoryData>,
          this.api.getIssues() as Promise<IssueData[]>,
          this.api.getPullRequests() as Promise<PullRequestData[]>,
          this.api.getContributors() as Promise<ContributorData[]>,
          this.api.getCommits() as Promise<CommitData[]>,
          this.api.getReleases() as Promise<ReleaseData[]>,
          this.api.getLanguages() as Promise<LanguageData>,
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
      const hasWebsite: boolean = Boolean(
        hasPages || (repoData.homepage && repoData.homepage.length > 0)
      );
      const creationDate = new Date(repoData.created_at);
      const lastUpdateDate = new Date(repoData.updated_at);
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysSinceLastUpdate = Math.floor(
        (new Date().getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate advanced metrics
      const issueResolutionRate =
        totalIssues > 0 ? ((closedIssues / totalIssues) * 100).toFixed(2) : 'N/A';
      const avgIssuesPerMonth =
        totalIssues > 0 ? (totalIssues / (daysSinceCreation / 30)).toFixed(2) : '0';
      const contributorsCount = contributors ? contributors.length : 0;

      // Calculate recent activity
      const recentCommits = commits
        ? commits.filter(c => {
            const commitDate = new Date(c.commit.author.date);
            return (new Date().getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
          }).length
        : 0;

      // Calculate pull request metrics
      const openPRs = pullRequests ? pullRequests.filter(pr => pr.state === 'open').length : 0;
      const closedPRs = pullRequests ? pullRequests.filter(pr => pr.state === 'closed').length : 0;
      const mergedPRs = pullRequests ? pullRequests.filter(pr => pr.merged_at !== null).length : 0;
      const prMergeRate = closedPRs > 0 ? ((mergedPRs / closedPRs) * 100).toFixed(2) : 'N/A';

      // Calculate release frequency
      const releaseCount = releases ? releases.length : 0;
      const avgReleaseFrequency =
        releaseCount > 1 && daysSinceCreation > 30
          ? (daysSinceCreation / releaseCount).toFixed(0)
          : 'N/A';

      // Calculate bus factor
      const busFactor = BusFactorCalculator.calculate(contributors);

      // Calculate language distribution
      let languageDistribution: Record<string, string> = {};
      if (languages) {
        const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
        languageDistribution = Object.entries(languages).reduce<Record<string, string>>(
          (result, [lang, bytes]) => {
            result[lang] = ((bytes / totalBytes) * 100).toFixed(2) + '%';
            return result;
          },
          {}
        );
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
      const isWellMaintained =
        issueResolutionRate !== 'N/A' && parseFloat(issueResolutionRate) > 50;
      const isWellDocumented =
        (this.hasReadme && this.readmeLength > 300) || (hasWebsite && this.hasReadme);

      // Check if license exists
      const hasLicense = repoData.license !== null && repoData.license !== undefined;

      // Calculate score
      const scoreCalculator = new ScoreCalculator({
        busFactor,
        contributorsCount,
        daysSinceLastUpdate,
        description: repoData.description,
        forks,
        hasReadme: this.hasReadme,
        hasWebsite: Boolean(hasWebsite),
        hasWiki,
        issueResolutionRate,
        license: Boolean(repoData.license),
        prMergeRate,
        readmeLength: this.readmeLength,
        recentCommits,
        stars,
      });

      const scoreResult = scoreCalculator.calculate();
      const finalScore = scoreResult.total;

      // Create score categories for display
      const scoreCategories: ScoreCategory[] = [
        {
          description: 'Based on star count and community adoption',
          name: 'Popularity',
          score: scoreResult.details.popularity.toFixed(2),
        },
        {
          description: 'Based on recency of updates and development pace',
          name: 'Activity',
          score: scoreResult.details.activity.toFixed(2),
        },
        {
          description: 'Based on contributor count, forks, and bus factor',
          name: 'Community',
          score: scoreResult.details.community.toFixed(2),
        },
        {
          description: 'Based on issue resolution, PR handling, and project structure',
          name: 'Maintenance',
          score: scoreResult.details.maintenance.toFixed(2),
        },
        {
          description:
            'Based on README quality, website/wiki presence, and overall project documentation',
          name: 'Documentation',
          score: scoreResult.details.documentation.toFixed(2),
        },
      ];

      // Generate strengths and recommendations using the new analyzer classes
      const strengths = StrengthsAnalyzer.identify(
        stars,
        forks,
        contributorsCount,
        busFactor,
        recentCommits,
        daysSinceLastUpdate,
        issueResolutionRate,
        prMergeRate,
        totalIssues,
        closedPRs,
        releases,
        this.hasReadme,
        hasWiki,
        hasWebsite,
        this.readmeLength,
        hasLicense
      );

      const recommendations = RecommendationsAnalyzer.generate(
        repoData.description,
        this.hasReadme,
        this.readmeLength,
        hasWiki,
        hasWebsite,
        contributorsCount,
        busFactor,
        stars,
        issueResolutionRate,
        openPRs,
        closedPRs,
        openIssues,
        daysSinceLastUpdate,
        releaseCount,
        daysSinceCreation,
        avgReleaseFrequency,
        hasLicense
      );

      // Create the result object
      const result: AnalysisResult = {
        activityMessage,
        categories: scoreCategories,
        description: repoData.description,
        hasCommunity,
        hasReadme: this.hasReadme,
        hasWebsite,
        hasWiki,
        isActive,
        isPopular,
        isWellDocumented,
        isWellMaintained,
        metrics: {
          avgIssuesPerMonth,
          avgReleaseFrequency,
          busFactor,
          closedIssues,
          closedPRs,
          contributors: contributorsCount,
          creationDate: creationDate.toLocaleDateString(),
          daysSinceLastUpdate,
          forks,
          issueResolutionRate: issueResolutionRate !== 'N/A' ? `${issueResolutionRate}%` : 'N/A',
          languages: languageDistribution,
          lastUpdate: `${lastUpdateDate.toLocaleDateString()} (${daysSinceLastUpdate} days ago)`,
          license: repoData.license ? repoData.license.name : 'None',
          openIssues,
          openPRs,
          prMergeRate: prMergeRate !== 'N/A' ? `${prMergeRate}%` : 'N/A',
          recentCommits,
          releaseCount,
          repoAge: `${daysSinceCreation} days`,
          stars,
          watchers,
        },
        readmeLength: this.readmeLength,
        recommendations,
        repoName: `${this.username}/${this.repoName}`,
        score: finalScore,
        strengths,
      };

      return result;
    } catch (error) {
      console.error('Error analyzing repository:', error);
      throw error;
    }
  }

  /**
   * Detect README from DOM elements (for content script)
   * @param document Document object to search for README
   */
  public detectReadmeFromDOM(document: Document): void {
    // Find README element in the DOM
    const readmeElement =
      document.querySelector('#readme') ||
      document.querySelector('article[data-targets="readme-toc.content"]') ||
      document.querySelector('[data-testid="readme"]');

    // Text-based detection as fallback
    const hasReadmeInContent =
      document.body.textContent?.includes('README.md') ||
      document.body.textContent?.includes('README.MD') ||
      document.body.textContent?.includes('readme.md') ||
      false;

    this.hasReadme = readmeElement !== null || hasReadmeInContent;
    this.readmeLength =
      this.hasReadme && readmeElement
        ? readmeElement.textContent?.length || 0
        : this.hasReadme
          ? 300
          : 0; // Assume reasonable length if detected by text
  }
}

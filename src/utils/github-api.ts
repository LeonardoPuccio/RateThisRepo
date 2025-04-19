import {
  CommitData,
  ContributorData,
  IssueData,
  LanguageData,
  PullRequestData,
  ReleaseData,
  RepositoryData,
} from '@/interfaces/repository.interface';

/**
 * GitHubAPI class for handling GitHub API requests
 */
export class GitHubAPI {
  private personalAccessToken: null | string;
  private repoName: string;
  private username: string;

  constructor(username: string, repoName: string, token: null | string = null) {
    this.username = username;
    this.repoName = repoName;
    this.personalAccessToken = token;
  }

  /**
   * Fetch data from GitHub API
   * @param endpoint API endpoint path
   * @returns Promise with the response data
   */
  public async fetchEndpoint<T>(endpoint: string): Promise<T> {
    try {
      const headers = new Headers();

      // Add authorization if token is provided
      if (this.personalAccessToken) {
        headers.append('Authorization', `token ${this.personalAccessToken}`);
      }

      const response = await fetch(
        `https://api.github.com/repos/${this.username}/${this.repoName}${endpoint}`,
        {
          headers: headers,
        }
      );

      // Handle rate limiting specifically
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');

        if (rateLimitRemaining === '0') {
          const resetDate = new Date(parseInt(rateLimitReset || '0') * 1000);
          const minutesUntilReset = Math.round(
            (resetDate.getTime() - new Date().getTime()) / 60000
          );

          throw new Error(
            `GitHub API rate limit exceeded. The limit will reset in approximately ${minutesUntilReset} minutes.`
          );
        }
      }

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return (await response.json()) as T;
    } catch (error) {
      console.error(
        `Error in API request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  /**
   * Fetch repository commits
   * @returns Promise with commits data
   */
  public async getCommits(): Promise<CommitData[]> {
    return this.fetchEndpoint<CommitData[]>('/commits?per_page=100');
  }

  /**
   * Fetch repository contributors
   * @returns Promise with contributors data
   */
  public async getContributors(): Promise<ContributorData[]> {
    return this.fetchEndpoint<ContributorData[]>('/contributors?per_page=100');
  }

  /**
   * Fetch repository issues
   * @returns Promise with issues data
   */
  public async getIssues(): Promise<IssueData[]> {
    return this.fetchEndpoint<IssueData[]>('/issues?state=all&per_page=100');
  }

  /**
   * Fetch repository languages
   * @returns Promise with languages data
   */
  public async getLanguages(): Promise<LanguageData> {
    return this.fetchEndpoint<LanguageData>('/languages');
  }

  /**
   * Fetch repository pull requests
   * @returns Promise with pull requests data
   */
  public async getPullRequests(): Promise<PullRequestData[]> {
    return this.fetchEndpoint<PullRequestData[]>('/pulls?state=all&per_page=100');
  }

  /**
   * Fetch repository releases
   * @returns Promise with releases data
   */
  public async getReleases(): Promise<ReleaseData[]> {
    return this.fetchEndpoint<ReleaseData[]>('/releases?per_page=100');
  }

  /**
   * Fetch repository data
   * @returns Promise with repository data
   */
  public async getRepositoryData(): Promise<RepositoryData> {
    return this.fetchEndpoint<RepositoryData>('');
  }
}

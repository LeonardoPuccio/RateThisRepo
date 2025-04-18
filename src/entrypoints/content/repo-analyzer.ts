import { AnalysisResult } from '@/interfaces/analysis.interface';
import { debugLog } from '@/utils/config';
import { ACTIONS } from '@/utils/constants';
import { RepositoryAnalyzer } from '@/utils/repository-analyzer';

import { errorHandler } from './error-handler';

/**
 * RepoAnalyzer - Manages repository detection and analysis operations
 */
export class RepoAnalyzer {
  private static instance: RepoAnalyzer;
  private isAnalyzing: boolean = false;

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance of the RepoAnalyzer
   */
  public static getInstance(): RepoAnalyzer {
    if (!RepoAnalyzer.instance) {
      RepoAnalyzer.instance = new RepoAnalyzer();
    }
    return RepoAnalyzer.instance;
  }

  /**
   * Analyze the current repository
   */
  public async analyzeRepository(): Promise<AnalysisResult | null> {
    if (this.isAnalyzing) {
      debugLog('analysis', 'Analysis already in progress');
      return null;
    }

    this.isAnalyzing = true;

    try {
      debugLog('analysis', 'Starting repository analysis');

      // Get repository information
      const repoInfo = this.getRepoInfoFromUrl();
      if (!repoInfo) {
        throw new Error('Not on a GitHub repository page');
      }

      // Create repository analyzer instance
      const analyzer = new RepositoryAnalyzer(repoInfo.username, repoInfo.repoName);

      // Detect README from DOM since we're in the content script
      analyzer.detectReadmeFromDOM(document);

      // Analyze the repository
      const result = await analyzer.analyze();

      debugLog('analysis', 'Analysis complete');
      return result;
    } catch (error) {
      errorHandler.handleError(error as Error, 'analysis');
      return null;
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Get the repository information from the current URL
   */
  public getRepoInfoFromUrl(): null | { repoName: string; username: string } {
    if (!this.isGitHubRepoPage()) {
      return null;
    }

    const urlParts = window.location.pathname.split('/').filter(Boolean);
    return {
      repoName: urlParts[1],
      username: urlParts[0],
    };
  }

  /**
   * Check if we're on a GitHub repository page
   */
  public isGitHubRepoPage(): boolean {
    if (!window.location.href.includes('github.com/')) {
      return false;
    }

    const urlParts = window.location.pathname.split('/').filter(Boolean);
    return urlParts.length >= 2;
  }

  /**
   * Notify background script about analysis completion
   */
  public notifyAnalysisComplete(result: AnalysisResult): void {
    browser.runtime
      .sendMessage({
        action: ACTIONS.ANALYSIS_COMPLETE,
        data: result,
      })
      .catch(error => {
        errorHandler.handleError(error as Error, 'messaging');
      });
  }
}

// Export the singleton instance
export const repoAnalyzer = RepoAnalyzer.getInstance();

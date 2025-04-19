import { RepositoryAnalyzer } from '@/utils/repository-analyzer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the GitHubAPI class
vi.mock('@/utils/github-api', () => {
  return {
    GitHubAPI: class {
      constructor() {}

      getCommits() {
        return Promise.resolve([
          {
            commit: {
              author: { date: '2022-12-31T00:00:00Z' },
            },
          },
          {
            commit: {
              author: { date: '2022-12-30T00:00:00Z' },
            },
          },
        ]);
      }

      getContributors() {
        return Promise.resolve([
          { contributions: 50, login: 'user1' },
          { contributions: 25, login: 'user2' },
          { contributions: 10, login: 'user3' },
        ]);
      }

      getIssues() {
        return Promise.resolve([
          { created_at: '2022-01-01T00:00:00Z', state: 'open' },
          { created_at: '2022-01-01T00:00:00Z', state: 'closed' },
          { created_at: '2022-01-01T00:00:00Z', state: 'closed' },
        ]);
      }

      getLanguages() {
        return Promise.resolve({
          HTML: 2000,
          JavaScript: 10000,
          TypeScript: 5000,
        });
      }

      getPullRequests() {
        return Promise.resolve([
          { merged_at: null, state: 'open' },
          { merged_at: '2022-01-01T00:00:00Z', state: 'closed' },
          { merged_at: '2022-01-01T00:00:00Z', state: 'closed' },
        ]);
      }

      getReleases() {
        return Promise.resolve([{ tag_name: 'v1.0.0' }, { tag_name: 'v1.1.0' }]);
      }

      // Mock API methods
      getRepositoryData() {
        return Promise.resolve({
          created_at: '2020-01-01T00:00:00Z',
          default_branch: 'main',
          description: 'Test repository description',
          forks_count: 20,
          has_pages: false,
          has_wiki: true,
          homepage: 'https://example.com',
          license: { name: 'MIT' },
          name: 'test-repo',
          open_issues_count: 5,
          owner: { login: 'test-user' },
          pushed_at: '2023-01-01T00:00:00Z',
          stargazers_count: 100,
          subscribers_count: 15,
          updated_at: '2023-01-01T00:00:00Z',
          watchers_count: 15,
        });
      }
    },
  };
});

// Also mock the analyzer classes
vi.mock('@/analysis/insights', () => {
  return {
    RecommendationsAnalyzer: {
      generate: () => ['Recommendation 1', 'Recommendation 2'],
    },
    StrengthsAnalyzer: {
      identify: () => ['Strength 1', 'Strength 2'],
    },
  };
});

// Mock BusFactorCalculator
vi.mock('@/utils/bus-factor', () => {
  return {
    BusFactorCalculator: {
      calculate: () => 2,
    },
  };
});

describe('RepositoryAnalyzer', () => {
  let analyzer: RepositoryAnalyzer;

  beforeEach(() => {
    // Create a new analyzer for each test
    analyzer = new RepositoryAnalyzer('test-user', 'test-repo');

    // Mock document for tests that use DOM
    const mockDocument = {
      body: {
        textContent: 'README.md test content',
      },
      querySelector: vi.fn().mockReturnValue({
        textContent: '# Test Readme\n\nThis is a test readme.',
      }),
    };

    // Add method to detect readme from DOM
    analyzer.detectReadmeFromDOM(mockDocument as unknown as Document);
  });

  it('should construct with username and repo name', () => {
    const testAnalyzer = new RepositoryAnalyzer('user', 'repo');
    // Check if the analyzer has the correct properties
    expect(testAnalyzer).toBeDefined();
  });

  it('should analyze repository and return analysis result', async () => {
    const result = await analyzer.analyze();

    // Verify the analysis result structure
    expect(result).toHaveProperty('repoName');
    expect(result).toHaveProperty('metrics');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('recommendations');

    // Check specific repository data
    expect(result.repoName).toBe('test-user/test-repo');

    // Check metrics are present
    expect(result.metrics).toHaveProperty('stars');
    expect(result.metrics).toHaveProperty('forks');
    expect(result.metrics).toHaveProperty('contributors');

    // Check score categories
    expect(result.categories.length).toBeGreaterThan(0);
    expect(result.categories.some(c => c.name === 'Popularity')).toBe(true);
    expect(result.categories.some(c => c.name === 'Activity')).toBe(true);
    expect(result.categories.some(c => c.name === 'Community')).toBe(true);
    expect(result.categories.some(c => c.name === 'Maintenance')).toBe(true);
    expect(result.categories.some(c => c.name === 'Documentation')).toBe(true);

    // Check insights
    expect(result.strengths).toEqual(['Strength 1', 'Strength 2']);
    expect(result.recommendations).toEqual(['Recommendation 1', 'Recommendation 2']);
  });
});

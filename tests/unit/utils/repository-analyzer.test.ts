import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoryAnalyzer } from '@/utils/repository-analyzer';

// Mock the GitHubAPI class
vi.mock('@/utils/github-api', () => {
  return {
    GitHubAPI: class {
      constructor() {}
      
      // Mock API methods
      getRepositoryData() {
        return Promise.resolve({
          name: 'test-repo',
          owner: { login: 'test-user' },
          stargazers_count: 100,
          forks_count: 20,
          open_issues_count: 5,
          subscribers_count: 15,
          watchers_count: 15,
          has_wiki: true,
          has_pages: false,
          homepage: 'https://example.com',
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          pushed_at: '2023-01-01T00:00:00Z',
          default_branch: 'main',
          license: { name: 'MIT' },
          description: 'Test repository description'
        });
      }
      
      getIssues() {
        return Promise.resolve([
          { state: 'open', created_at: '2022-01-01T00:00:00Z' },
          { state: 'closed', created_at: '2022-01-01T00:00:00Z' },
          { state: 'closed', created_at: '2022-01-01T00:00:00Z' }
        ]);
      }
      
      getPullRequests() {
        return Promise.resolve([
          { state: 'open', merged_at: null },
          { state: 'closed', merged_at: '2022-01-01T00:00:00Z' },
          { state: 'closed', merged_at: '2022-01-01T00:00:00Z' }
        ]);
      }
      
      getContributors() {
        return Promise.resolve([
          { login: 'user1', contributions: 50 },
          { login: 'user2', contributions: 25 },
          { login: 'user3', contributions: 10 }
        ]);
      }
      
      getCommits() {
        return Promise.resolve([
          { 
            commit: { 
              author: { date: '2022-12-31T00:00:00Z' }
            } 
          },
          { 
            commit: { 
              author: { date: '2022-12-30T00:00:00Z' }
            } 
          }
        ]);
      }
      
      getReleases() {
        return Promise.resolve([
          { tag_name: 'v1.0.0' },
          { tag_name: 'v1.1.0' }
        ]);
      }
      
      getLanguages() {
        return Promise.resolve({
          JavaScript: 10000,
          TypeScript: 5000,
          HTML: 2000
        });
      }
    }
  };
});

// Also mock the analyzer classes
vi.mock('@/analysis/insights', () => {
  return {
    StrengthsAnalyzer: {
      identify: () => ['Strength 1', 'Strength 2']
    },
    RecommendationsAnalyzer: {
      generate: () => ['Recommendation 1', 'Recommendation 2']
    }
  };
});

// Mock BusFactorCalculator
vi.mock('@/utils/bus-factor', () => {
  return {
    BusFactorCalculator: {
      calculate: () => 2
    }
  };
});

describe('RepositoryAnalyzer', () => {
  let analyzer: RepositoryAnalyzer;
  
  beforeEach(() => {
    // Create a new analyzer for each test
    analyzer = new RepositoryAnalyzer('test-user', 'test-repo');
    
    // Mock document for tests that use DOM
    const mockDocument = {
      querySelector: vi.fn().mockReturnValue({
        textContent: '# Test Readme\n\nThis is a test readme.'
      }),
      body: {
        textContent: 'README.md test content'
      }
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

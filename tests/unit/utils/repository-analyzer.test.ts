import { RepositoryAnalyzer } from '../../../src/utils/repository-analyzer';
import { StrengthsAnalyzer } from '../../../src/analysis/insights/StrengthsAnalyzer';
import { RecommendationsAnalyzer } from '../../../src/analysis/insights/RecommendationsAnalyzer';
import { GitHubAPI } from '../../../src/utils/github-api';

// Mock the GitHub API class
jest.mock('../../../src/utils/github-api');
jest.mock('../../../src/analysis/insights/StrengthsAnalyzer');
jest.mock('../../../src/analysis/insights/RecommendationsAnalyzer');

describe('RepositoryAnalyzer', () => {
  // Mock data
  const mockRepoData = {
    name: 'test-repo',
    full_name: 'test-owner/test-repo',
    description: 'Test repository description',
    stargazers_count: 1000,
    forks_count: 100,
    watchers_count: 50,
    open_issues_count: 10,
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    pushed_at: '2023-01-01T00:00:00Z',
    subscribers_count: 45,
    has_wiki: true,
    has_pages: true,
    homepage: 'https://test-repo.com',
    license: { name: 'MIT License', spdx_id: 'MIT', url: 'https://api.github.com/licenses/mit' },
    owner: { login: 'test-owner', id: 123, type: 'User' }
  };
  
  const mockIssues = [
    { id: 1, number: 1, title: 'Issue 1', state: 'open', created_at: '2022-01-01T00:00:00Z', updated_at: '2022-01-01T00:00:00Z', closed_at: null },
    { id: 2, number: 2, title: 'Issue 2', state: 'closed', created_at: '2022-01-01T00:00:00Z', updated_at: '2022-01-02T00:00:00Z', closed_at: '2022-01-02T00:00:00Z' }
  ];
  
  const mockPRs = [
    { id: 1, number: 1, title: 'PR 1', state: 'open', created_at: '2022-01-01T00:00:00Z', updated_at: '2022-01-01T00:00:00Z', closed_at: null, merged_at: null },
    { id: 2, number: 2, title: 'PR 2', state: 'closed', created_at: '2022-01-01T00:00:00Z', updated_at: '2022-01-02T00:00:00Z', closed_at: '2022-01-02T00:00:00Z', merged_at: '2022-01-02T00:00:00Z' }
  ];
  
  const mockContributors = [
    { id: 1, login: 'user1', contributions: 100 },
    { id: 2, login: 'user2', contributions: 50 }
  ];
  
  const mockCommits = [
    { sha: 'abc123', commit: { author: { name: 'User 1', email: 'user1@example.com', date: new Date().toISOString() }, message: 'Commit 1' } },
    { sha: 'def456', commit: { author: { name: 'User 2', email: 'user2@example.com', date: new Date().toISOString() }, message: 'Commit 2' } }
  ];
  
  const mockReleases = [
    { id: 1, tag_name: 'v1.0.0', name: 'Version 1.0.0', created_at: '2022-01-01T00:00:00Z', published_at: '2022-01-01T00:00:00Z' }
  ];
  
  const mockLanguages = {
    'JavaScript': 100000,
    'TypeScript': 50000,
    'HTML': 10000
  };

  // Setup mocks
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup GitHubAPI mock
    const mockAPI = GitHubAPI as jest.MockedClass<typeof GitHubAPI>;
    
    mockAPI.prototype.getRepositoryData = jest.fn().mockResolvedValue(mockRepoData);
    mockAPI.prototype.getIssues = jest.fn().mockResolvedValue(mockIssues);
    mockAPI.prototype.getPullRequests = jest.fn().mockResolvedValue(mockPRs);
    mockAPI.prototype.getContributors = jest.fn().mockResolvedValue(mockContributors);
    mockAPI.prototype.getCommits = jest.fn().mockResolvedValue(mockCommits);
    mockAPI.prototype.getReleases = jest.fn().mockResolvedValue(mockReleases);
    mockAPI.prototype.getLanguages = jest.fn().mockResolvedValue(mockLanguages);
    
    // Setup StrengthsAnalyzer mock
    (StrengthsAnalyzer.identify as jest.Mock).mockReturnValue([
      "⭐ Highly popular repository with significant community interest",
      "👥 Healthy contributor community with shared project ownership"
    ]);
    
    // Setup RecommendationsAnalyzer mock
    (RecommendationsAnalyzer.generate as jest.Mock).mockReturnValue([
      "⚠️ Consider adding more documentation"
    ]);
  });
  
  test('analyze calls StrengthsAnalyzer and RecommendationsAnalyzer', async () => {
    // Arrange
    const analyzer = new RepositoryAnalyzer('test-owner', 'test-repo');
    
    // Act
    const result = await analyzer.analyze();
    
    // Assert
    expect(StrengthsAnalyzer.identify).toHaveBeenCalled();
    expect(RecommendationsAnalyzer.generate).toHaveBeenCalled();
    
    // Verify the strengths and recommendations were properly assigned
    expect(result.strengths).toEqual([
      "⭐ Highly popular repository with significant community interest",
      "👥 Healthy contributor community with shared project ownership"
    ]);
    
    expect(result.recommendations).toEqual([
      "⚠️ Consider adding more documentation"
    ]);
  });
  
  test('analyze handles README detection', async () => {
    // Arrange
    const analyzer = new RepositoryAnalyzer('test-owner', 'test-repo');
    
    // Mock the Document object with a README element
    const mockDocument = {
      querySelector: jest.fn().mockImplementation((selector) => {
        if (selector === '#readme') {
          return { textContent: 'This is a README with some content.' };
        }
        return null;
      }),
      body: {
        textContent: 'Some content README.md some more content'
      }
    } as unknown as Document;
    
    // Act
    analyzer.detectReadmeFromDOM(mockDocument);
    const result = await analyzer.analyze();
    
    // Assert
    expect(result.hasReadme).toBe(true);
    expect(result.readmeLength).toBeGreaterThan(0);
  });
});

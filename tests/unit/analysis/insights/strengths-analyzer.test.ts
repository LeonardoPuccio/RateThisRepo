import { StrengthsAnalyzer } from '../../../../src/analysis/insights/StrengthsAnalyzer';
import { ReleaseData } from '../../../../src/interfaces/repository.interface';

describe('StrengthsAnalyzer', () => {
  test('identifies strengths for a popular repository', () => {
    // Arrange
    const stars = 1500;
    const forks = 50;
    const contributorsCount = 15;
    const busFactor = 4;
    const recentCommits = 40;
    const daysSinceLastUpdate = 3;
    const issueResolutionRate = '85';
    const prMergeRate = '75';
    const totalIssues = 100;
    const closedPRs = 50;
    const releases: ReleaseData[] = [{
      id: 1,
      tag_name: 'v1.0.0',
      name: 'Version 1.0.0',
      created_at: '2023-01-01T00:00:00Z',
      published_at: '2023-01-01T00:00:00Z'
    }];
    const hasReadme = true;
    const hasWiki = true;
    const hasWebsite = true;
    const readmeLength = 2000;
    const hasLicense = true;

    // Act
    const strengths = StrengthsAnalyzer.identify(
      stars, forks, contributorsCount, busFactor, recentCommits, 
      daysSinceLastUpdate, issueResolutionRate, prMergeRate, 
      totalIssues, closedPRs, releases, hasReadme, hasWiki, hasWebsite, readmeLength,
      hasLicense
    );

    // Assert
    expect(strengths).toContain('⭐ Highly popular repository with significant community interest');
    expect(strengths).toContain('👥 Strong contributor base with multiple developers contributing to the codebase');
    expect(strengths).toContain('🚌 Low bus factor risk - development is well-distributed among contributors');
    expect(strengths).toContain('📈 Very active development with frequent commits');
    expect(strengths).toContain('⚡ Actively maintained with recent updates');
    expect(strengths).toContain('🔧 Excellent issue resolution rate (>80%)');
    expect(strengths).toContain('🔀 Strong pull request process with high merge rate');
    expect(strengths).toContain('📜 Clear licensing information');
    expect(strengths).toContain('📚 Comprehensive documentation with detailed README and project website');
  });

  test('identifies limited strengths for a less active repository', () => {
    // Arrange
    const stars = 50;
    const forks = 5;
    const contributorsCount = 2;
    const busFactor = 1;
    const recentCommits = 2;
    const daysSinceLastUpdate = 45;
    const issueResolutionRate = '30';
    const prMergeRate = '50';
    const totalIssues = 10;
    const closedPRs = 5;
    const releases: ReleaseData[] = [];
    const hasReadme = true;
    const hasWiki = false;
    const hasWebsite = false;
    const readmeLength = 200;
    const hasLicense = true;

    // Act
    const strengths = StrengthsAnalyzer.identify(
      stars, forks, contributorsCount, busFactor, recentCommits, 
      daysSinceLastUpdate, issueResolutionRate, prMergeRate, 
      totalIssues, closedPRs, releases, hasReadme, hasWiki, hasWebsite, readmeLength,
      hasLicense
    );

    // Assert
    expect(strengths).not.toContain('⭐ Good popularity with the developer community');
    expect(strengths).not.toContain('👥 Healthy contributor community with shared project ownership');
    expect(strengths).not.toContain('📈 Steady recent development activity');
    expect(strengths).not.toContain('🔧 Good issue handling with consistent resolution');
    expect(strengths).toContain('📜 Clear licensing information');
    expect(strengths.length).toBeLessThan(5); // There should be only a few strengths
  });
});

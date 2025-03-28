import { RecommendationsAnalyzer } from '../../../../src/analysis/insights/RecommendationsAnalyzer';

describe('RecommendationsAnalyzer', () => {
  test('generates recommendations for a repository with issues', () => {
    // Arrange
    const description = 'Very short';
    const hasReadme = true;
    const readmeLength = 150; // Too short
    const hasWiki = false;
    const hasWebsite = false;
    const contributorsCount = 4;
    const busFactor = 1;
    const stars = 75;
    const issueResolutionRate = '25';
    const openPRs = 10;
    const closedPRs = 5;
    const openIssues = 20;
    const daysSinceLastUpdate = 100;
    const releaseCount = 0;
    const daysSinceCreation = 365;
    const avgReleaseFrequency = 'N/A';
    const hasLicense = false;
    
    // Act
    const recommendations = RecommendationsAnalyzer.generate(
      description, hasReadme, readmeLength, hasWiki, hasWebsite, 
      contributorsCount, busFactor, stars, issueResolutionRate, 
      openPRs, closedPRs, openIssues, daysSinceLastUpdate, releaseCount, 
      daysSinceCreation, avgReleaseFrequency, hasLicense
    );
    
    // Assert
    expect(recommendations).toContain("⚠️ The repository lacks a detailed description - add a clear explanation of the project's purpose");
    expect(recommendations).toContain("⚠️ README is too brief - expand it to include installation, usage, and contribution guidelines");
    expect(recommendations).toContain("⚠️ Consider adding a wiki or website for more detailed documentation as your contributor base grows");
    expect(recommendations).toContain("⚠️ Missing a defined license - add one to clarify how others can use and contribute to your code");
    expect(recommendations).toContain("⚠️ Low recent activity - project may appear abandoned without regular updates");
    expect(recommendations).toContain("⚠️ High bus factor risk - project depends heavily on a single contributor which is risky for a popular project");
    expect(recommendations).toContain("⚠️ Low issue resolution rate (<50%) - prioritize addressing open issues to improve user confidence");
    expect(recommendations).toContain("⚠️ Backlog of open pull requests - review and address pending contributions to encourage further participation");
    expect(recommendations).toContain("⚠️ Open issues with no recent activity - triage issues and update status even if they can't be fixed immediately");
    expect(recommendations).toContain("⚠️ No formal releases found - create tagged releases for better versioning and user adoption");
  });
  
  test('generates limited recommendations for a well-maintained repository', () => {
    // Arrange
    const description = 'This is a comprehensive description of a well-maintained repository with many features and good documentation.';
    const hasReadme = true;
    const readmeLength = 2000;
    const hasWiki = true;
    const hasWebsite = true;
    const contributorsCount = 10;
    const busFactor = 4;
    const stars = 100;
    const issueResolutionRate = '85';
    const openPRs = 2;
    const closedPRs = 100;
    const openIssues = 5;
    const daysSinceLastUpdate = 3;
    const releaseCount = 25;
    const daysSinceCreation = 730;
    const avgReleaseFrequency = '30';
    const hasLicense = true;
    
    // Act
    const recommendations = RecommendationsAnalyzer.generate(
      description, hasReadme, readmeLength, hasWiki, hasWebsite, 
      contributorsCount, busFactor, stars, issueResolutionRate, 
      openPRs, closedPRs, openIssues, daysSinceLastUpdate, releaseCount, 
      daysSinceCreation, avgReleaseFrequency, hasLicense
    );
    
    // Assert
    expect(recommendations.length).toBe(0); // Should have no recommendations for a well-maintained repo
  });
});

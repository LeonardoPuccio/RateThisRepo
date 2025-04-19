import { StrengthsAnalyzer } from '@/analysis/insights/StrengthsAnalyzer';
import { describe, expect, it } from 'vitest';

describe('StrengthsAnalyzer', () => {
  it('should identify repository strengths based on metrics', () => {
    // Using the actual implementation which has a static identify method
    const strengths = StrengthsAnalyzer.identify(
      // stars
      1500,
      // forks
      250,
      // contributorsCount
      15,
      // busFactor
      3,
      // recentCommits
      35,
      // daysSinceLastUpdate
      5,
      // issueResolutionRate
      '85',
      // prMergeRate
      '80',
      // totalIssues
      50,
      // closedPRs
      30,
      // releases
      [{ tag_name: 'v1.0' }, { tag_name: 'v1.1' }],
      // hasReadme
      true,
      // hasWiki
      true,
      // hasWebsite
      true,
      // readmeLength
      2000,
      // hasLicense
      true
    );

    // Output strengths to see what we got
    // console.log('Generated strengths:', strengths);

    // Verify strengths are identified correctly
    expect(strengths.length).toBeGreaterThan(0);

    // Check some specific strengths based on the mock data
    expect(strengths.some(text => text.includes('popular') || text.includes('star'))).toBe(true);
    expect(strengths.some(text => text.includes('fork'))).toBe(true);
    expect(strengths.some(text => text.includes('contributor'))).toBe(true);
    expect(strengths.some(text => text.includes('bus factor'))).toBe(true);

    // Check for licensing information with more flexible matching
    expect(
      strengths.some(
        text => text.includes('license') || text.includes('licensing') || text.includes('📜')
      )
    ).toBe(true);
  });

  it('should return few strengths for a poor repository', () => {
    // Using the actual implementation which has a static identify method
    const strengths = StrengthsAnalyzer.identify(
      // stars
      5,
      // forks
      1,
      // contributorsCount
      1,
      // busFactor
      0,
      // recentCommits
      0,
      // daysSinceLastUpdate
      90,
      // issueResolutionRate
      '0',
      // prMergeRate
      '0',
      // totalIssues
      0,
      // closedPRs
      0,
      // releases
      [],
      // hasReadme
      false,
      // hasWiki
      false,
      // hasWebsite
      false,
      // readmeLength
      0,
      // hasLicense
      false
    );

    // Verify few or no strengths are identified
    expect(strengths.length).toBeLessThan(2);
  });
});

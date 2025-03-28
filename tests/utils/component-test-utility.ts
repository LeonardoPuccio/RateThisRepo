/**
 * Utility for manual component testing in the browser
 * This file should be included only in development builds or via a test entry point
 */

import { AnalysisPanel } from '../../src/ui/components/AnalysisPanel';
import { ScoreDisplay } from '../../src/ui/components/ScoreDisplay';
import { HealthIndicators } from '../../src/ui/components/HealthIndicators';
import { DetailedMetricsPanel } from '../../src/ui/components/DetailedMetricsPanel';
import { IconHelper } from '../../src/ui/helpers/IconHelper';
import { ElementFactory } from '../../src/ui/helpers/ElementFactory';
import { StyleService } from '../../src/ui/services/StyleService';

// Test data
const mockResult = {
  repoName: 'Test Repository',
  description: 'Test description for repository',
  score: '85',
  categories: [
    { name: 'Popularity', score: '18', description: 'Good popularity' },
    { name: 'Activity', score: '16', description: 'Active development' },
    { name: 'Community', score: '17', description: 'Strong community' },
    { name: 'Maintenance', score: '18', description: 'Well maintained' },
    { name: 'Documentation', score: '16', description: 'Good documentation' }
  ],
  metrics: {
    stars: 1000,
    forks: 200,
    openIssues: 50,
    closedIssues: 250,
    contributors: 20,
    daysSinceLastUpdate: 5,
    busFactor: 5,
    languages: { 'TypeScript': '60%', 'JavaScript': '30%', 'HTML': '10%' },
    creationDate: '2023-01-01',
    lastUpdate: '2023-06-01',
    repoAge: '6 months',
    watchers: 120,
    openPRs: 15,
    closedPRs: 75,
    releaseCount: 10,
    license: 'MIT',
    issueResolutionRate: '83%',
    prMergeRate: '90%',
    recentCommits: 45,
    avgIssuesPerMonth: '25',
    avgReleaseFrequency: '12'
  },
  isPopular: true,
  isActive: true,
  hasCommunity: true,
  isWellMaintained: true,
  isWellDocumented: true,
  hasReadme: true,
  hasWiki: true,
  hasWebsite: false,
  readmeLength: 500,
  activityMessage: 'Updated 5 days ago',
  strengths: [
    'Strong community engagement',
    'Regular updates and commits',
    'High-quality documentation'
  ],
  recommendations: [
    'Consider adding a project website',
    'Improve issue template structure'
  ]
};

/**
 * Test individual icon rendering
 */
function testIconRendering(): void {
  console.log('Testing icon rendering...');
  
  // Create test container
  const container = document.createElement('div');
  container.style.cssText = 'padding: 20px; border: 1px solid #ccc; margin-bottom: 20px;';
  container.innerHTML = '<h3>Icon Rendering Test</h3>';
  
  // Test each icon
  const icons = IconHelper.getAvailableIcons();
  icons.forEach(iconName => {
    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = 'display: inline-block; margin: 10px; text-align: center;';
    
    // Add icon string
    const iconStr = IconHelper.getSvgIconString(iconName as any);
    iconWrapper.innerHTML = iconStr;
    
    // Add label
    const label = document.createElement('div');
    label.textContent = iconName;
    label.style.cssText = 'font-size: 12px; margin-top: 5px;';
    iconWrapper.appendChild(label);
    
    container.appendChild(iconWrapper);
  });
  
  document.body.appendChild(container);
  console.log('Icon test complete');
}

/**
 * Test ScoreDisplay component
 */
function testScoreDisplay(): void {
  console.log('Testing ScoreDisplay...');
  
  // Create test container
  const container = document.createElement('div');
  container.style.cssText = 'padding: 20px; border: 1px solid #ccc; margin-bottom: 20px;';
  container.innerHTML = '<h3>ScoreDisplay Test</h3>';
  
  // Initialize StyleService
  StyleService.getInstance().addAllStyles();
  
  // Initialize and test ScoreDisplay
  const scoreDisplay = new ScoreDisplay();
  scoreDisplay.setScore(85);
  scoreDisplay.appendTo(container);
  
  document.body.appendChild(container);
  console.log('ScoreDisplay test complete');
}

/**
 * Test HealthIndicators component
 */
function testHealthIndicators(): void {
  console.log('Testing HealthIndicators...');
  
  // Create test container
  const container = document.createElement('div');
  container.style.cssText = 'padding: 20px; border: 1px solid #ccc; margin-bottom: 20px;';
  container.innerHTML = '<h3>HealthIndicators Test</h3>';
  
  // Initialize StyleService
  StyleService.getInstance().addAllStyles();
  
  // Initialize and test HealthIndicators
  const healthIndicators = new HealthIndicators();
  healthIndicators.setData(mockResult as any);
  healthIndicators.appendTo(container);
  
  document.body.appendChild(container);
  console.log('HealthIndicators test complete');
}

/**
 * Test DetailedMetricsPanel component
 */
function testDetailedMetricsPanel(): void {
  console.log('Testing DetailedMetricsPanel...');
  
  // Create test container
  const container = document.createElement('div');
  container.style.cssText = 'padding: 20px; border: 1px solid #ccc; margin-bottom: 20px;';
  container.innerHTML = '<h3>DetailedMetricsPanel Test</h3>';
  
  // Initialize StyleService
  StyleService.getInstance().addAllStyles();
  
  // Initialize and test DetailedMetricsPanel
  const detailedMetrics = new DetailedMetricsPanel();
  detailedMetrics.setData(mockResult as any);
  detailedMetrics.appendTo(container);
  
  document.body.appendChild(container);
  console.log('DetailedMetricsPanel test complete');
}

/**
 * Test complete AnalysisPanel
 */
function testAnalysisPanel(): void {
  console.log('Testing AnalysisPanel...');
  
  // Create test container
  const container = document.createElement('div');
  container.style.cssText = 'position: static; padding: 20px; border: 1px solid #ccc; margin-bottom: 20px;';
  container.innerHTML = '<h3>AnalysisPanel Test</h3>';
  
  // Initialize StyleService
  StyleService.getInstance().addAllStyles();
  
  // Initialize and test AnalysisPanel
  const analysisPanel = new AnalysisPanel();
  analysisPanel.setData(mockResult as any);
  
  // Override the panel's position and style for testing
  const panel = document.getElementById('repo-evaluator-panel');
  if (panel) {
    panel.style.position = 'static';
    panel.style.maxWidth = 'none';
    panel.style.width = '100%';
  }
  
  container.appendChild(panel || document.createElement('div'));
  document.body.appendChild(container);
  console.log('AnalysisPanel test complete');
}

/**
 * Run all tests
 */
export function runComponentTests(): void {
  console.log('Running component tests...');
  
  testIconRendering();
  testScoreDisplay();
  testHealthIndicators();
  testDetailedMetricsPanel();
  testAnalysisPanel();
  
  console.log('All tests completed');
}

// Expose test function to window for running in browser console
(window as any).runUIComponentTests = runComponentTests;

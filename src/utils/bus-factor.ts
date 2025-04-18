import { ContributorData } from '@/interfaces/repository.interface';

/**
 * Calculates the bus factor of a repository
 * 
 * The bus factor is a measurement of the risk resulting from information and 
 * capabilities not being shared among team members, derived from the phrase 
 * "in case they get hit by a bus".
 */
export class BusFactorCalculator {
  /**
   * Calculate the bus factor based on contributor data
   * @param contributors Array of contributors with their contribution counts
   * @returns Bus factor value (1-4)
   */
  public static calculate(contributors: ContributorData[]): number {
    let busFactor = 1;
    
    try {
      if (!contributors || contributors.length === 0) {
        return busFactor;
      }
      
      // Sort contributors by number of contributions
      const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions);
      
      // Calculate what percentage of contributions come from each contributor
      const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
      
      let cumulativePercent = 0;
      let activeContributors = 0;
      
      // Count how many contributors it takes to reach 80% of contributions
      for (const contributor of sortedContributors) {
        cumulativePercent += (contributor.contributions / totalContributions) * 100;
        activeContributors++;
        
        if (cumulativePercent >= 80) {
          break;
        }
      }
      
      // Set bus factor based on active contributors count
      busFactor = Math.min(4, Math.max(1, activeContributors));
      
      // For repositories with many contributors, ensure minimum bus factor of 2
      if (contributors.length >= 5 && busFactor === 1) {
        busFactor = 2;
      }
      
      return busFactor;
    } catch (error) {
      console.error("Error calculating bus factor:", error);
      return busFactor;
    }
  }
}
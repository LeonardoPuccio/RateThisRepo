export interface License {
  name: string;
  spdx_id?: string;
  url?: string;
}

export interface Owner {
  login: string;
  id: number;
  type: string;
}

export interface RepositoryData {
  id: number;
  name: string;
  full_name: string;
  owner: Owner;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: License | null;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  subscribers_count?: number;
}

export interface IssueData {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface PullRequestData {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
}

export interface ContributorData {
  id: number;
  login: string;
  contributions: number;
}

export interface CommitData {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

export interface ReleaseData {
  id: number;
  tag_name: string;
  name: string;
  created_at: string;
  published_at: string;
}

export interface LanguageData {
  [language: string]: number;
}

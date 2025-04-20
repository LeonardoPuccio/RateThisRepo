export interface CommitData {
  commit: {
    author: {
      date: string;
      email: string;
      name: string;
    };
    message: string;
  };
  sha: string;
}

export interface ContributorData {
  contributions: number;
  id: number;
  login: string;
}

export interface IssueData {
  closed_at: null | string;
  created_at: string;
  id: number;
  number: number;
  state: 'closed' | 'open';
  title: string;
  updated_at: string;
}

export interface LanguageData {
  [language: string]: number;
}

export interface License {
  name: string;
  spdx_id?: string;
  url?: string;
}

export interface Owner {
  id: number;
  login: string;
  type: string;
}

export interface PullRequestData {
  closed_at: null | string;
  created_at: string;
  id: number;
  merged_at: null | string;
  number: number;
  state: 'closed' | 'open';
  title: string;
  updated_at: string;
}

export interface ReleaseData {
  created_at: string;
  id: number;
  name: string;
  published_at: string;
  tag_name: string;
}

export interface RepositoryData {
  archived: boolean;
  created_at: string;
  default_branch: string;
  description: null | string;
  disabled: boolean;
  fork: boolean;
  forks: number;
  forks_count: number;
  full_name: string;
  has_discussions: boolean;
  has_downloads: boolean;
  has_issues: boolean;
  has_pages: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  homepage: null | string;
  html_url: string;
  id: number;
  language: null | string;
  license: License | null;
  name: string;
  open_issues: number;
  open_issues_count: number;
  owner: Owner;
  private: boolean;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  subscribers_count?: number;
  updated_at: string;
  watchers: number;
  watchers_count: number;
}

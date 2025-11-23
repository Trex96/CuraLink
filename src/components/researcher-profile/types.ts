export interface Researcher {
  _id: string;
  firstName: string;
  lastName: string;
  institution: string;
  bio: string;
  expertise: string[];
  profilePicture?: string;
  email?: string;
  phone?: string;
  location?: {
    address?: string;
  };
  orcidId?: string;
}

export interface Publication {
  _id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  doi?: string;
  pmid?: string;
}

export interface Trial {
  _id: string;
  title: string;
  nctNumber: string;
  status: string;
  phase: string;
  conditions: string[];
  locations: Array<{
    address?: string;
  }>;
  eligibilityCriteria?: string[];
}
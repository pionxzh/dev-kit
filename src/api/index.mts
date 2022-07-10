export type WordFreq = {
  token: string
  freq: number
}

export enum Role {
  User = 'user',
  Admin = 'admin',
  NLP = 'nlp',
}

export enum Tier {
  Free = 'free',
  Research = 'research',
  Paid = 'paid',
}

export type IUser = {
  username: string;
  password: string;
  balance: number;
  roles: Role[];
  tier: Tier;
  name: string;
  email: string;
  avatar: string;
};

export type IUserTokenWhitelist = {
  token: string;
  expiresAt: number;
  username: string;
};

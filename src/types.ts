export interface Notification {
  id: string;
  name: string;
  username: string;
  fullName?: string;
  pixKey: string;
  months: number;
  participationCount: number;
  value: number;
  photo: string;
  followingCount?: number;
  followerCount?: number;
  timestamp: Date;
  confirmed?: boolean;
  gender: 'male' | 'female';
  alerta?: boolean;
  contributionAmount: number;
  initialMessage?: string;
  lastMessage?: string;
  fraseAgradecimento?: string;
  read?: boolean;
  mesesEnviados?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  username?: string;
  text: string;
  rating: number;
  gender: 'male' | 'female';
  photo: string;
  months?: number;
  timestamp?: Date;
}
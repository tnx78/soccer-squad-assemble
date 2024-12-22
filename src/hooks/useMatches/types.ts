export interface Profile {
  id: string;
  name: string | null;
  nickname: string | null;
  avatar_url: string | null;
}

export interface MatchPlayerResponse {
  player_id: string;
  profiles: Profile;
}

export interface Match {
  id: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  players: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  maxPlayers: number;
  fee: number;
  createdBy: string;
  createdByName: string;
  availableSlots: number;
}
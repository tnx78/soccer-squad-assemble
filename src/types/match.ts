export interface Player {
  id: string;
  name: string;
  avatar?: string;
}

export interface Match {
  id: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  players: Player[];
  maxPlayers: number;
  fee: number;
  createdBy: string;
}
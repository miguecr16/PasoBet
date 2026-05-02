// ─── Tipos alineados con el schema real del backend (Prisma) ─────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// El backend devuelve firstName/lastName mapeados desde el campo `nombre`
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nombre?: string;
  role: string;
  saldo?: number;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  balance: number;
  userId?: string;
}

// Caballo (mapeado desde el backend como HorseOnEvent para compatibilidad)
export interface Horse {
  id: string;
  name: string;
  breed?: string | null;
  stats?: {
    carrerasJugadas: number;
    victorias: number;
    segundos: number;
    terceros: number;
  };
}

export interface HorseOnEvent {
  horseId: string;
  odds: number;
  poolPercentage?: number;
  horse: Horse;
}

export interface Feria {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  categories: Event[];
}

// Categoria del backend mapeada al formato Event del frontend
export interface Event {
  id: string;
  name: string;
  status: string;          // 'abierta' | 'en_curso' | 'cerrada'
  createdAt?: string;
  totalPool?: number;
  horseCount?: number;
  betCount?: number;
  horses: HorseOnEvent[];
  _count?: {
    bets: number;
  };
}


export interface OddsUpdatePayload {
  eventId: string;
  horseId: string;
  horseName: string;
  odds: number;
}

export interface Bet {
  id: string;
  amount: number;
  odds: number;
  potentialPayout: number | null;
  status: string;
  createdAt: string;
  horse: { name: string };
  event: { name: string };
}


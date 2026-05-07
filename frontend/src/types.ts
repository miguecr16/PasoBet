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

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  status: string;
  ageRange: {
    id: string;
    nombre: string;
    min: number;
    max: number | null;
  };
  horseCount: number;
  betCount: number;
}

export interface SexNode {
  id: string;
  nombre: string;
  competencias: Category[];
}

export interface ModalityNode {
  id: string;
  nombre: string;
  slug: string;
  sexos: SexNode[];
}

export interface Feria {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  modalidades: ModalityNode[];
}

export interface Event {
  id: string;
  name: string;
  modalidad: string;
  sexo: string;
  edadRange: string;
  slug: string;
  status: string;
  createdAt?: string;
  totalPool?: number;
  horses: HorseOnEvent[];
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

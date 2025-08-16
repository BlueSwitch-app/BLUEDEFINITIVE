
// Define la interfaz de un miembro con su rol
export interface TeamMember {
  
  email: string;
  role: "admin" | "member" | "assistant";
}

// Define la interfaz de un dispositivo
export interface Device {
  id: string;
  nombre: string;
  state: boolean;
  created_at: string;
  categoria: string;
  watts: number; 

  stringid: string;
  color: string
  favorite: boolean;
  team_code: string;
  email: string;
}

// Define la interfaz del equipo, ahora con miembros tipados
export interface Team {
  name: string;
  code: string;
  role: "admin" | "member"| "assistant";
  devices: Device[];
  members: TeamMember[];
}
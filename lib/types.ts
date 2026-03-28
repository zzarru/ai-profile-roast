export interface Persona {
  name: string;
  description: string;
  emoji: string;
}

export interface RoastResult {
  id: string;
  persona_name: string;
  persona_description: string;
  score: number;
  score_label: string;
  first_impression: string;
  inner_thoughts: string[];
  kind_comment: string;
  created_at: string;
}

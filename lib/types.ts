export interface Persona {
  name: string;
  emoji: string;
  description: string; // 사용자에게 보여주는 소개글
  viewpoint: string;   // Claude 프롬프트에만 주입되는 행동 지침
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

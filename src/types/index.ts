export interface Point {
  x: number;
  y: number;
}

export interface Detection {
  id: number;
  family: string;
  corners: Point[];
  center: Point;
  decision_margin?: number;
  hamming?: number;
  goodness?: number;
  pose?: {
    R: number[][];
    t: number[];
  };
  solutions?: any[];
}

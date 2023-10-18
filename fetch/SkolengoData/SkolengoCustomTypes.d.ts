import type { EvaluationDetail } from 'scolengo-api/types/models/Results';

export type Grades = {
  grades: {
    id: string;
    subject: {
      id: string;
      name: string;
      groups: boolean;
    };
    date: string | null;
    description: any;
    is_bonus: boolean;
    is_optional: boolean;
    is_out_of_20: boolean;
    grade: {
      value: number | null;
      out_of: number | null;
      coefficient: number;
      average: number | null;
      max: number | null;
      min: number | null;
      significant: number;
    };
  }[];
  averages: {
    subject: {
      id: string;
      name: string;
      groups: boolean;
    };
    average: number | null;
    class_average: number | null;
    max: EvaluationDetail;
    min: EvaluationDetail;
    out_of: number;
    significant: number;
    color: string | null;
  }[];
  overall_average: number;
  class_overall_average: number;
};

export type Period = {
  id: string;
  name: string;
  actual: boolean;
};

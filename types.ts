export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface FoodItem {
  name: string;
  nutrition: NutritionData;
  box_2d: BoundingBox;
}

export interface AnalysisResult {
  items: FoodItem[];
  totalNutrition: NutritionData;
  healthScore: number;
  suggestions: string[];
}

export interface MealRecord {
  id: string;
  timestamp: number;
  imageUrl: string;
  analysis: AnalysisResult;
}

export interface HydrationRecord {
  timestamp: number;
  amountMl: number;
}

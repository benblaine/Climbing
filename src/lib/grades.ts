// South African (Ewbank) grade to sort value mapping
const SA_GRADE_MAP: Record<string, number> = {
  "8": 8, "9": 9, "10": 10, "11": 11, "12": 12, "13": 13, "14": 14,
  "15": 15, "16": 16, "17": 17, "18": 18, "19": 19, "20": 20, "21": 21,
  "22": 22, "23": 23, "24": 24, "25": 25, "26": 26, "27": 27, "28": 28,
  "29": 29, "30": 30, "31": 31, "32": 32, "33": 33, "34": 34, "35": 35,
  "36": 36, "37": 37, "38": 38, "39": 39, "40": 40,
};

// French grade mapping (approximate sort values)
const FRENCH_GRADE_MAP: Record<string, number> = {
  "3": 10, "4a": 13, "4b": 14, "4c": 15, "5a": 16, "5b": 17, "5c": 18,
  "6a": 19, "6a+": 20, "6b": 21, "6b+": 22, "6c": 23, "6c+": 24,
  "7a": 25, "7a+": 26, "7b": 27, "7b+": 28, "7c": 29, "7c+": 30,
  "8a": 31, "8a+": 32, "8b": 33, "8b+": 34, "8c": 35, "8c+": 36,
  "9a": 37, "9a+": 38, "9b": 39, "9b+": 40,
};

// V-grade (bouldering) mapping
const V_GRADE_MAP: Record<string, number> = {
  "VB": 8, "V0": 10, "V1": 13, "V2": 15, "V3": 17, "V4": 19,
  "V5": 21, "V6": 23, "V7": 25, "V8": 27, "V9": 29, "V10": 31,
  "V11": 33, "V12": 35, "V13": 37, "V14": 39, "V15": 40,
};

export function gradeToSortValue(grade: string): number {
  const cleaned = grade.trim().toLowerCase();

  // Check V-grades first
  const vGrade = V_GRADE_MAP[grade.trim().toUpperCase()];
  if (vGrade !== undefined) return vGrade;

  // Check French grades
  const frenchGrade = FRENCH_GRADE_MAP[cleaned];
  if (frenchGrade !== undefined) return frenchGrade;

  // Check SA/Ewbank (just a number)
  const saGrade = SA_GRADE_MAP[cleaned];
  if (saGrade !== undefined) return saGrade;

  // Default: try to parse as number
  const num = parseInt(cleaned, 10);
  if (!isNaN(num) && num >= 1 && num <= 50) return num;

  return 0;
}

export function getGradeColor(grade: string): string {
  const sort = gradeToSortValue(grade);
  if (sort <= 14) return "bg-green-100 text-green-800";
  if (sort <= 19) return "bg-blue-100 text-blue-800";
  if (sort <= 24) return "bg-yellow-100 text-yellow-800";
  if (sort <= 29) return "bg-orange-100 text-orange-800";
  if (sort <= 34) return "bg-red-100 text-red-800";
  return "bg-purple-100 text-purple-800";
}

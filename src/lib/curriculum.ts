import {
  CURRICULUM,
  MODULES,
  type CurriculumDay,
  type Module,
} from "@/data/curriculum";

/** Get today's curriculum day (or null if outside course dates) */
export function getTodayCurriculum(today?: string): CurriculumDay | null {
  const dateStr = today ?? new Date().toISOString().split("T")[0];
  return CURRICULUM.find((d) => d.date === dateStr) ?? null;
}

/** Get curriculum by day number */
export function getCurriculumByDay(dayNumber: number): CurriculumDay | null {
  return CURRICULUM.find((d) => d.dayNumber === dayNumber) ?? null;
}

/** Get current module based on date */
export function getCurrentModule(today?: string): Module | null {
  const dateStr = today ?? new Date().toISOString().split("T")[0];
  return (
    MODULES.find((m) => dateStr >= m.startDate && dateStr <= m.endDate) ?? null
  );
}

/** Calculate module progress (0~100) */
export function getModuleProgress(
  moduleName: string,
  completedDayNumbers: number[]
): number {
  const moduleDays = CURRICULUM.filter((d) => d.module === moduleName);
  if (moduleDays.length === 0) return 0;
  const completed = moduleDays.filter((d) =>
    completedDayNumbers.includes(d.dayNumber)
  );
  return Math.round((completed.length / moduleDays.length) * 100);
}

/** Get days in a specific module */
export function getModuleDays(moduleName: string): CurriculumDay[] {
  return CURRICULUM.filter((d) => d.module === moduleName);
}

/** Get days until next quest */
export function getDaysUntilNextQuest(
  today?: string
): { days: number; quest: CurriculumDay } | null {
  const dateStr = today ?? new Date().toISOString().split("T")[0];
  const upcoming = CURRICULUM.filter((d) => d.date > dateStr && d.questId);
  if (upcoming.length === 0) return null;
  const next = upcoming[0];
  const diffMs = new Date(next.date).getTime() - new Date(dateStr).getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return { days, quest: next };
}

/** Check if date is in high-intensity period (May~July: LLM활용, DLthon2, 배포, MLOps) */
export function isHighIntensityPeriod(today?: string): boolean {
  const dateStr = today ?? new Date().toISOString().split("T")[0];
  const highIntensityModules = [
    "LLM 활용",
    "DLthon 2",
    "모델 배포 기초",
    "MLOps",
  ];
  const current = getCurrentModule(dateStr);
  return current ? highIntensityModules.includes(current.name) : false;
}

/** Get overall course progress */
export function getCourseProgress(today?: string): {
  currentDay: number | null;
  totalDays: number;
  percentage: number;
  daysRemaining: number;
} {
  const todayCurriculum = getTodayCurriculum(today);
  const currentDay = todayCurriculum?.dayNumber ?? null;
  const totalDays = 119;
  const percentage = currentDay
    ? Math.round((currentDay / totalDays) * 100)
    : 0;
  const daysRemaining = currentDay ? totalDays - currentDay : totalDays;
  return { currentDay, totalDays, percentage, daysRemaining };
}

/** Get all Main Quests */
export function getMainQuests(): CurriculumDay[] {
  return CURRICULUM.filter((d) => d.questType === "main");
}

/** Get all quests */
export function getAllQuests(): CurriculumDay[] {
  return CURRICULUM.filter((d) => d.questId != null);
}

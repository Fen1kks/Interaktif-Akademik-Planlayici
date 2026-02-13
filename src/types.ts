export type CourseId = string;
export interface ComplexPrerequisite {
    type: 'count_pattern';
    pattern: string;
    exclude?: string[];
    minCount: number;
    message: string;
}

export type Prerequisite = string | ComplexPrerequisite;
export interface CourseOption {
    id: string;
    name: string;
    credits?: number | number[];
}

export interface Course {
    id: CourseId;
    name: string;
    credits: number | number[]; // Can be variable [3, 4]
    prereqs: Prerequisite[];
    term: number;
    coreqs?: string[];
    options?: CourseOption[];
}

export interface Department {
    name: string;
    curriculum: Course[];
}

export type DepartmentRegistry = Record<string, Department>;
export interface ThemeManager {
    init: () => void;
    toggleTheme: () => void;
    setTheme: (theme: string) => void;
}

// Global Window Extension
declare global {
    interface Window {
        departments: DepartmentRegistry;
        ThemeManager: ThemeManager;
        currentTotalCredits: number;
        registerDepartment?: (code: string, data: Department) => void;
    }
}

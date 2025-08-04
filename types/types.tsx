export const CATEGORIES = [
    { id: 'catcommittee', label: 'Committee meeting', payable: true },
    { id: 'catcon', label: 'Constituent Issue', payable: true },
    { id: 'catcouncil', label: 'Council meeting', payable: true },
    { id: 'catphone', label: 'Phone call', payable: true },
    { id: 'catbreak', label: 'Break', payable: false },
    { id: 'catoffice', label: 'Office work', payable: false },
    { id: 'catadmin', label: 'Admin', payable: false },
];

export enum Collection {
    assignment = "assignment",
    session = "session",
};

export interface Assignment {
    id?: string;
    owner: string;
    description?: string;
    category?: string;
    startTime: Date | null;
    endTime: Date | null;
};

export interface Session {
    id?: string;
    owner: string;
    startTime: Date | null;
    endTime: Date | null;
};

export interface StatisticsByDate {
    id: string;
    date: string; // YYYY-MM-DD format
    sessionMinutes: number;
    assignmentMinutes: number;
    paidMinutes: number;
}

// Define the Section interface that SectionList expects
export interface AssignmentSection {
    title: string; // This is the Date, to be used as a title
    data: Assignment[]; // Array of assignments in this category
};

// Define the Section interface that SectionList expects
export interface StatisticsSection {
    title: string; // This is the Date, to be used as a title
    data: StatisticsByDate[]; // Array of statistics in this category
};

export interface PayReport {
    "totalSessions": number;
    "totalAssignmentMinutes": number;
    "totalAssignments": number;
    "sessionInfo": SessionInfo;
    "paidMinutes": number;
    "paidAssignments": number;
    "categoryInfo": CategoryInfo;
    "categorySections": {};
    "assignmentsByDate": {};
    "statisticsByDate": StatisticsSection[];
};


export class SessionInfo {
    minutes: number;
    sessions: number;
    constructor(data: { minutes: number; sessions: number }) {
        this.minutes = data.minutes;
        this.sessions = data.sessions;
    }
};

export type CategoryInfo = {
    [key: string]: {
        minutes: number;
        assignmentCount: number;
    };
};
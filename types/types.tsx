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
};

class SessionInfo {
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
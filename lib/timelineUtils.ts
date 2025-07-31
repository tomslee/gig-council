/*
 * A set of functions for ensuring appropriate start and end times for assignments and sessions
 */
import { useState } from 'react';
import { UserData, useUserContext } from '@/contexts/UserContext';
import { firestoreService } from '@/services/firestoreService';
import { Assignment, Collection, CATEGORIES, CategoryInfo, PayReport } from '@/types/types';
//const [docList, setDocList] = useState<any>([]);

class SessionInfo {
    minutes: number;
    sessions: number;
    constructor(data: { minutes: number; sessions: number }) {
        this.minutes = data.minutes;
        this.sessions = data.sessions;
    }
};

const createEmptyCategoryInfo = (): CategoryInfo => {
    return CATEGORIES.reduce((acc, category) => {
        acc[category.label] = { minutes: 0, assignmentCount: 0 };
        return acc;
    }, {} as CategoryInfo);
};


// Define the Section interface that SectionList expects
interface AssignmentSection {
    title: string; // This is the category name ("Phone call", "Meeting", etc.)
    data: Assignment[]; // Array of assignments in this category
}

const groupAssignmentsByDate = (assignments: Assignment[]): AssignmentSection[] => {
    const grouped = assignments.reduce((acc, assignment) => {
        if (assignment.startTime) {
            const t = new Date(assignment.startTime.getTime());
            const assignmentDate = new Date(t.setHours(0, 0, 0, 0)).toLocaleDateString(
                'en-CA', { weekday: 'short', day: 'numeric', month: 'short' });
            if (assignmentDate) {
                if (!acc[assignmentDate]) {
                    acc[assignmentDate] = [];
                }
                acc[assignmentDate].push(assignment);
            };
        };
        return acc;
    }, {} as Record<string, Assignment[]>);
    return Object.entries(grouped).map(([title, data]) => ({
        title,
        data
    }));
};

export const timelineUtils = {

    async getReport(userData: UserData) {
        let docList = [];
        let newReport: PayReport = {
            totalSessions: 0,
            totalAssignmentMinutes: 0,
            totalAssignments: 0,
            sessionInfo: { minutes: 0, sessions: 0 },
            paidMinutes: 0,
            paidAssignments: 0,
            categoryInfo: createEmptyCategoryInfo(),
            categorySections: {},
            assignmentsByDate: {},
        };
        for (const category of CATEGORIES) {
            newReport.categoryInfo[category.label].minutes = 0;
            newReport.categoryInfo[category.label].assignmentCount = 0;
        };
        // fetch sessions
        try {
            const sessions = await firestoreService.getAllSessionsByOwner(
                Collection.session,
                userData.username);
            if (sessions) {
                for (const session of sessions) {
                    if (session.startTime) {
                        if (session.endTime == null) {
                            const sessionMinutes = Math.abs(new Date().getTime() - session.startTime.getTime()) / (60000.0) || 0;
                            newReport.sessionInfo["minutes"] += sessionMinutes;
                            newReport.sessionInfo["sessions"] += 1;
                        } else {
                            const sessionMinutes = Math.abs(session.endTime.getTime() - session.startTime.getTime()) / (60000.0) || 0;
                            newReport.sessionInfo["minutes"] += sessionMinutes;
                            newReport.sessionInfo["sessions"] += 1;
                        };
                    };
                };
            };
            // fetch assignments
            const assignments = await firestoreService.getAllAssignmentsByOwner(
                Collection.assignment,
                userData.username);
            if (assignments) {
                for (const assignment of assignments) {
                    if (assignment.category == '' || assignment.startTime == null || assignment.endTime == null) {
                        continue;
                    };
                    const assignmentCategory = assignment.category;
                    const docDescription = assignment.description;
                    // doc.data() is never undefined for query doc snapshots
                    if (docList.findIndex(obj => obj.id === assignment.id) === -1) {
                        docList.push({
                            id: assignment.id,
                            category: assignmentCategory,
                            description: docDescription
                        });
                    };
                    const assignmentMinutes = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / (60000.0) || 0;
                    if (assignmentMinutes > 0 && assignmentCategory && assignmentCategory !== "") {
                        newReport.categoryInfo[assignmentCategory].minutes += assignmentMinutes;
                        newReport.categoryInfo[assignmentCategory].assignmentCount += 1;
                    };
                    const thisCategory = CATEGORIES.find(item => item["label"] === assignmentCategory) || {};
                    if ("label" in thisCategory && "payable" in thisCategory) {
                        if (assignmentMinutes > 0) {
                            newReport.totalAssignmentMinutes += assignmentMinutes;
                            newReport.totalAssignments += 1;
                            if (thisCategory["payable"]) {
                                newReport["paidMinutes"] += assignmentMinutes;
                                newReport["paidAssignments"] += 1;
                            }
                        };
                    };
                };
                console.log("Fetched", docList.length, "assignments.");
                // Now group the assignments by date and add them in to the structure for presentation
                assignments.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
                newReport.assignmentsByDate = groupAssignmentsByDate(assignments);
                return newReport;
            }
        } catch (err) {
            console.error(err);
        } finally {
            // setLoading(false);
        };
    },

    async getValidEndTime(userData: UserData, candidateAssignment: Assignment) {
        if (userData &&
            userData.username &&
            candidateAssignment.startTime &&
            candidateAssignment.endTime) {
            if (candidateAssignment.endTime <= candidateAssignment.startTime) {
                // an assignment must end after it starts
                candidateAssignment.endTime = new Date(candidateAssignment.startTime.getTime() + (10 * 60 * 1000));
            }
            const assignments = await firestoreService.getAllAssignmentsByOwner(Collection.assignment, userData.username);
            if (assignments) {
                for (const assignment of assignments) {
                    if (assignment.id != candidateAssignment.id &&
                        assignment.startTime && assignment.endTime) {
                        if ((candidateAssignment.endTime < assignment.endTime) &&
                            (candidateAssignment.endTime > assignment.startTime)) {
                            // can only have one assignment in progress at a time
                            candidateAssignment.endTime = assignment.startTime;
                            const alertString = `We are changing your endTime to \
${candidateAssignment.endTime.getHours()}:${candidateAssignment.endTime.getMinutes()} \
to avoid an overlap with another assignment. You can only work one assignment at a time!`;
                            alert(alertString);
                        }
                    };
                };
                // We have found nothing wrong with this endTime
                return candidateAssignment.endTime;
            };
        } else {
            //Something is wrong with the candidateAssignment or the userData
            return null;
        };
        return null;
    }
};
/*
 * A set of functions for ensuring appropriate start and end times for assignments and sessions
 */
import { UserData, useUserContext } from '@/contexts/UserContext';
//const [docList, setDocList] = useState<any>([]);
import { firestoreService } from '@/services/firestoreService';
import { Assignment, AssignmentSection, Collection, CATEGORIES, CategoryInfo, PayReport, Session, StatisticsByDate, StatisticsSection } from '@/types/types';
import 'react-native-get-random-values';
import { executeNativeBackPress } from 'react-native-screens';
import { v4 as uuidv4 } from 'uuid';

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
            };
            acc[assignmentDate].push(assignment);
        };
        return acc;
    },
        {} as Record<string, Assignment[]>);
    return Object.entries(grouped).map(([title, data]) => ({
        title,
        data
    }));
};

// Helper function for groupStatisticsByDate, to combine the
// assignment and session accumulators.
function combineAggregates(
    groupedAssignments: Record<string, StatisticsByDate[]>,
    groupedSessions: Record<string, StatisticsByDate[]>
): Record<string, StatisticsByDate[]> {
    const result: Record<string, StatisticsByDate[]> = {};

    // Get all unique dates
    const allDates = new Set([
        ...Object.keys(groupedAssignments),
        ...Object.keys(groupedSessions)
    ]);

    try {
        allDates.forEach(date => {
            const stats = [{
                id: groupedAssignments[date] ?
                    groupedAssignments[date][0].id : uuidv4(),
                date: groupedAssignments[date][0].date,
                sessionMinutes: groupedSessions[date] ?
                    groupedSessions[date][0].sessionMinutes : 0,
                assignmentMinutes: groupedAssignments[date] ?
                    groupedAssignments[date][0].assignmentMinutes : 0,
                paidMinutes: groupedAssignments[date] ?
                    groupedAssignments[date][0].paidMinutes : 0,
            },];
            result[date] = stats;
        });
    } catch (e) {
        //console.log(e);
    }
    return result;
};

const groupStatisticsByDate = (assignments: Assignment[], sessions: Session[]):
    StatisticsSection[] => {
    const groupedAssignments = assignments.reduce((acc, assignment) => {
        if (assignment.startTime) {
            const t = new Date(assignment.startTime.getTime());
            const assignmentDate = new Date(t.setHours(0, 0, 0, 0)).toLocaleDateString(
                'en-CA', { weekday: 'short', day: 'numeric', month: 'short' });
            // Initialize day stats if not exists
            if (assignmentDate) {
                if (!acc[assignmentDate]) {
                    acc[assignmentDate] = [];
                    acc[assignmentDate].push(<StatisticsByDate>{
                        id: uuidv4(),
                        date: assignmentDate,
                        sessionMinutes: 0,
                        assignmentMinutes: 0,
                        paidMinutes: 0,
                    });
                }
            };
            if (assignment.endTime) {
                const assignmentMinutes = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / (60 * 1000.0) || 0;
                acc[assignmentDate][0].assignmentMinutes += assignmentMinutes;
                const thisCategory = CATEGORIES.find(item => item["label"] === assignment.category) || {};
                if ("label" in thisCategory && "payable" in thisCategory) {
                    if (thisCategory["payable"]) {
                        acc[assignmentDate][0].paidMinutes += assignmentMinutes;
                    } else {
                    };
                };
            };
        };
        return acc;
    },
        {} as Record<string, StatisticsByDate[]>);
    const groupedSessions = sessions.reduce((acc, session) => {
        if (session.startTime) {
            const t = new Date(session.startTime.getTime());
            const sessionDate = new Date(t.setHours(0, 0, 0, 0)).toLocaleDateString(
                'en-CA', { weekday: 'short', day: 'numeric', month: 'short' });
            // Initialize day stats if not exists
            if (sessionDate) {
                if (!acc[sessionDate]) {
                    acc[sessionDate] = [];
                    acc[sessionDate].push(<StatisticsByDate>{
                        id: uuidv4(),
                        date: sessionDate,
                        sessionMinutes: 0,
                        assignmentMinutes: 0,
                        paidMinutes: 0,
                    });
                }
            };
            if (session.endTime) {
                const sessionMinutes = Math.abs(session.endTime.getTime() - session.startTime.getTime()) / (60 * 1000.0) || 0;
                acc[sessionDate][0].sessionMinutes += sessionMinutes;
            };
        };
        return acc;
    },
        {} as Record<string, StatisticsByDate[]>);
    const mergedStatistics = combineAggregates(groupedAssignments, groupedSessions);
    return Object.entries(mergedStatistics).map(([title, data]) => ({
        title,
        data
    }));
};

export const timelineUtils = {

    async getReport(userData: UserData, earliestDate: Date = new Date('1970-01-01')) {
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
            statisticsByDate: {},
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
                    if (session.startTime && session.startTime >= earliestDate) {
                        if (session.endTime == null) {
                            const sessionMinutes = Math.abs(new Date().getTime() - session.startTime.getTime()) / (60 * 1000.0) || 0;
                            newReport.sessionInfo["minutes"] += sessionMinutes;
                            newReport.sessionInfo["sessions"] += 1;
                        } else {
                            const sessionMinutes = Math.abs(session.endTime.getTime() - session.startTime.getTime()) / (60 * 1000.0) || 0;
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
                    if (assignment.category == '' ||
                        assignment.startTime == null ||
                        assignment.startTime < earliestDate ||
                        assignment.endTime == null) {
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
                // Now group the assignments by date and add them in to the structure for presentation
                assignments.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
                newReport.assignmentsByDate = groupAssignmentsByDate(assignments);
                // We need both assignments and sessions to compute statistics
                if (sessions && assignments) {
                    newReport.statisticsByDate = groupStatisticsByDate(assignments, sessions);
                }
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
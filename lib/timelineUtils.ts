/*
 * A set of functions for ensuring appropriate start and end times for assignments and sessions
 */
import { UserName } from '@/contexts/UserContext';
import { firestoreService } from '@/services/firestoreService';
import {
    Assignment, AssignmentSection, Collection, CATEGORIES, CategoryInfo,
    MINIMUM_HOURLY_WAGE, PayReport, Session, StatisticsByDate, StatisticsSection
} from '@/types/types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const createEmptyCategoryInfo = (): CategoryInfo => {
    return CATEGORIES.reduce((acc, category) => {
        acc[category.label] = { minutes: 0, assignmentCount: 0 };
        return acc;
    }, {} as CategoryInfo);
};

const groupAssignmentsByDate = (assignments: Assignment[]): AssignmentSection[] => {
    // for timeline display
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
                assignmentCount: groupedAssignments[date] ?
                    groupedAssignments[date][0].assignmentCount : 0,
                ratingSum: groupedAssignments[date] ?
                    groupedAssignments[date][0].ratingSum : 0,
                ratingCount: groupedAssignments[date] ?
                    groupedAssignments[date][0].ratingCount : 0,
                totalPay: groupedAssignments[date] ?
                    groupedAssignments[date][0].totalPay : 0,
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
                        assignmentCount: 0,
                        ratingSum: 0,
                        ratingCount: 0,
                        totalPay: 0,

                    });
                }
            };
            if (assignment.endTime && (assignment.endTime < new Date())) {
                // only count closed assignments
                const assignmentMinutes = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / (60 * 1000.0) || 0;
                acc[assignmentDate][0].assignmentMinutes += assignmentMinutes;
                acc[assignmentDate][0].assignmentCount += 1;
                acc[assignmentDate][0].ratingSum += assignment.rating ? assignment.rating : 0;
                acc[assignmentDate][0].ratingCount += assignment.rating ? 1 : 0;
                const thisCategory = CATEGORIES.find(item => item["label"] === assignment.category) || {};
                if ("label" in thisCategory && "payable" in thisCategory) {
                    if (thisCategory["payable"]) {
                        acc[assignmentDate][0].paidMinutes += assignmentMinutes;
                        const factor = assignment.payRateFactor ? assignment.payRateFactor : 1.0;
                        acc[assignmentDate][0].totalPay += assignmentMinutes * (factor * MINIMUM_HOURLY_WAGE) / 60.0;
                    } else {
                    };
                };
            };
        }; // if (assignment.startTime)
        return acc;
    }, {} as Record<string, StatisticsByDate[]>);
    // Now do sessions
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
    console.log("Computed reports.")
    return Object.entries(mergedStatistics).map(([title, data]) => ({
        title,
        data
    }));
};

export const timelineUtils = {

    async getReport(userName: UserName, earliestDate: Date = new Date('1970-01-01')) {
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
            statisticsByDate: [],
        };
        for (const category of CATEGORIES) {
            newReport.categoryInfo[category.label].minutes = 0;
            newReport.categoryInfo[category.label].assignmentCount = 0;
        };
        // fetch sessions
        try {
            const sessions = await firestoreService.getAllSessionsByOwner(
                Collection.session,
                userName.username);
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
                userName.username);
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

    async getValidEndTime(userName: UserName, candidateAssignment: Assignment) {
        if (userName &&
            userName.username &&
            candidateAssignment.startTime &&
            candidateAssignment.endTime) {
            if (candidateAssignment.endTime <= candidateAssignment.startTime) {
                // an assignment must end after it starts
                candidateAssignment.endTime = new Date(candidateAssignment.startTime.getTime() + (10 * 60 * 1000));
            }
            const assignments = await firestoreService.getAllAssignmentsByOwner(Collection.assignment, userName.username);
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
            //Something is wrong with the candidateAssignment or the userName
            return null;
        };
        return null;
    },

    assignPayRateFactor(category: string | undefined): number {
        const thisCategory = CATEGORIES.find(item => item["label"] === category) || {};
        let payFactor: number = 0;
        if ("label" in thisCategory && "payable" in thisCategory) {
            if (thisCategory["payable"]) {
                const x = Math.floor(100.0 * Math.random());
                switch (true) {
                    case (x < 74.5): // [0, 74] (75)
                        payFactor = 0.9;
                        break;
                    case (x < 84.5): // [75, 84] (10)
                        payFactor = 1.5; // surge
                        break;
                    default:
                        payFactor = 0.75; // [85, 99] (15)
                        break;
                };
            } else {
                return 0;
            };
            return payFactor;
        } else {
            return 0;
        };
    },

    assignStarRating(): number {
        // assigns a one to 5 star rating for an assignment.
        // generate an integer from 0 to 9 inclusive
        const x = Math.floor(100.0 * Math.random());
        switch (true) {
            case (x < 74.5): // [0, 74] (75)
                return 5;
                break;
            case (x < 84.5): // [75, 84] (10)
                return 4;
                break;
            case (x < 94.5): // [85, 94] (10)
                return 1;
                break;
            case (x < 97.5): // [95, 97] (3)
                return 3;
                break;
            default:
                return 2; //[98, 99] (2)
                break;
        };
    },

    getWeekNumber(date: Date): number {
        // Copying date so the original date won't be modified
        const tempDate = new Date(date.valueOf());
        // ISO week date weeks start on Monday, so correct the day number
        const dayNum = (date.getDay() + 6) % 7;
        // Set the target to the nearest Thursday (current date + 4 - current day number)
        tempDate.setDate(tempDate.getDate() - dayNum + 3);
        // ISO 8601 week number of the year for this date
        const firstThursday = tempDate.valueOf();
        // Set the target to the first day of the year
        // First set the target to January 1st
        tempDate.setMonth(0, 1);
        // If this is not a Thursday, set the target to the next Thursday
        if (tempDate.getDay() !== 4) {
            tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
        }
        // The weeknumber is the number of weeks between the first Thursday of the year
        // and the Thursday in the target week
        return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / (7 * 24 * 60 * 60 * 1000)); // 604800000 = number of milliseconds in a week
    }

};
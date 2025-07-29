/*
 * A set of functions for ensuring appropriate start and end times for assignments and sessions
 */
import { UserData, useUserContext } from '@/contexts/UserContext';
import { firestoreService } from '@/services/firestoreService';
import { Assignment, Collection, CATEGORIES } from '@/types/types';

export const timelineUtils = {

    async getValidEndTime(userData: UserData, candidateAssignment: Assignment) {
        console.log("In setValidEndTime");
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
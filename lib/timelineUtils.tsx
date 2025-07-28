/*
 * A set of functions for ensuring appropriate start and end times for assignments and sessions
 */
import { UserData, useUserContext } from '@/contexts/UserContext';
import { firestoreService } from '@/services/firestoreService';
import { Assignment, Collection, CATEGORIES } from '@/types/types';

export const timelineUtils = {

    async isValidEndTime(userData: UserData, candidateAssignment: Assignment) {
        console.log("In isValidEndTime");
        if (userData &&
            userData.username &&
            candidateAssignment.startTime &&
            candidateAssignment.endTime) {
            if (candidateAssignment.endTime <= candidateAssignment.startTime) {
                // an assignment must end after it starts
                return false;
            }
            const assignments = await firestoreService.getAllAssignmentsByOwner(Collection.assignment, userData.username);
            if (assignments) {
                for (const assignment of assignments) {
                    if (assignment.startTime &&
                        assignment.endTime &&
                        assignment.id != candidateAssignment.id &&
                        candidateAssignment.startTime &&
                        candidateAssignment.endTime) {
                        if ((candidateAssignment.endTime < assignment.endTime) &&
                            (candidateAssignment.endTime > assignment.startTime)) {
                            // can only have one assignment in progress at a time
                            return false;
                        }
                    };
                };
                // We have found nothing wrong with this endTime
                return true;
            };
        } else {
            //Something is wrong with the candidateAssignment or the userData
            return false;
        };
    }
};
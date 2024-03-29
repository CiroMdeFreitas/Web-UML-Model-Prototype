import AppError from "../Models/AppError";
import Feedback from "../Models/Feedback";
import LocalizationSnippet from "../Models/LocalizationSnippet";
import IRemoveClassifierDTO from "../public/DTO/IRemoveClassifierDTO";
import IRemoveRelationshipDTO from "../public/DTO/IRemoveRelationshipDTO";
import CommandInterpreter from "./CommandInterpreter";

/**
 * Class responsible for handling user's remove commands into DTOs.
 */
export default class RemoveCommandInterpreter extends CommandInterpreter {
    /**
     * Handles a remove classifier command into a DTO.
     * 
     * @param commandLine Command to be handled.
     * @returns DTO with classifier removal instructions.
     */
    public static interpretRemoveClassifier(commandLine: string[]): IRemoveClassifierDTO {
        const name = commandLine.shift();

        // Checks if classifier name is present.
        if((name === undefined) || (name === "")) {
            const errorFeedback = new Feedback();
            errorFeedback.addSnippet(new LocalizationSnippet("feedback.remove.classifier.error.missing_name_for_removal"));

            throw new AppError(errorFeedback);
        } else {
            return {
                name: name
            };
        }
    }

    /**
     * Handles a remove relationship command into a DTO.
     * 
     * @param commandLine Command to be handled.
     * @returns DTO with relationship removal instructions.
     */
    public static interpretRemoveRelationship(commandLine: string[]): IRemoveRelationshipDTO {
        const removalDirection = commandLine.shift();

        if((removalDirection === undefined) || (removalDirection == "")) {
            const errorFeedback = new Feedback();
            errorFeedback.addSnippet(new LocalizationSnippet("feedback.remove.relationship.error.missing_direction"));

            throw new AppError(errorFeedback);
        } else {
            switch(removalDirection) {
                case "named":
                    const removingRelationshipName = commandLine.shift();

                    if((removingRelationshipName === undefined) || (removingRelationshipName === "")) {
                        const errorFeedback = new Feedback();
                        errorFeedback.addSnippet(new LocalizationSnippet("feedback.remove.relationship.error.missing_relationship_name_for_removal"));
                
                        throw new AppError(errorFeedback);
                    } else {
                        return {
                            direction: removalDirection,
                            relationshipName: removingRelationshipName
                        };
                    }

                case "between":
                    const sourceClassifierName = commandLine.shift();
                    const targetClassifierName = commandLine.shift();
                    
                    if((sourceClassifierName === undefined) || (sourceClassifierName === "")) {
                        const errorFeedback = new Feedback();
                        errorFeedback.addSnippet(new LocalizationSnippet("feedback.remove.relationship.error.missing_source_classifier_name_for_removal"));
            
                        throw new AppError(errorFeedback);
                    } else if((targetClassifierName === undefined) || (targetClassifierName === "")) {
                        const errorFeedback = new Feedback();
                        errorFeedback.addSnippet(new LocalizationSnippet("feedback.remove.relationship.error.missing_target_classifier_name_for_removal"));
            
                        throw new AppError(errorFeedback);
                    } else {
                        return {
                            direction: removalDirection,
                            sourceClassifierName: sourceClassifierName,
                            targetClassifierName: targetClassifierName
                        };
                    }

                default:
                    const errorFeedback = new Feedback();
                    errorFeedback.addSnippet(new LocalizationSnippet("feedback.remove.relationship.error.invalid_direction"));
        
                    throw new AppError(errorFeedback);
            }
        }
    }
}
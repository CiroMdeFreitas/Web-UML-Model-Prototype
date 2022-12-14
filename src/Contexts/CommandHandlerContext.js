import { v4 as uuidv4 } from "uuid";
import { createContext, useState } from "react";
import { SUPPORTED_COMMANDS, SUPPORTED_ENTITY_TYPES, SUPPORTED_RELATIONSHIP_TYPES } from "../Utils/SupportedKeyWords";
import { ERROR_CLASS_DOES_NOT_EXISTS, ERROR_COMMAND_SYNTAX, ERROR_UNRECOGNISED_ENTITY_TYPE } from "../Utils/Errors";
import createClassCommandHandler from "../Handlers/ClassEnityHandlers/CreateClassCommandHandler";
import readClassCommandHandler from "../Handlers/ClassEnityHandlers/ReadClassCommandHandler";
import alterClassCommandHandler from "../Handlers/ClassEnityHandlers/AlterClassCommandHandler";
import { upperCaseFirstLetter } from "../Handlers/UtilityHandlers/StringHandler";
import { nameAlreadyInUse } from "../Handlers/UtilityHandlers/EntityHandler";
import removeClassCommandHandler from "../Handlers/ClassEnityHandlers/RemoveClassCommandHandler";
import createRelationshipCommandHandler from "../Handlers/RelationshipEntityHandlers/CreateRelaionshipCommandHandler";
import AlterRelationshipCommandHandler from "../Handlers/RelationshipEntityHandlers/AlterRelationshipCommandHandler";
import readRelationshipCommandHandler from "../Handlers/RelationshipEntityHandlers/ReadRelationshipCommandHandler";
import removeRelationshipCommandHandler from "../Handlers/RelationshipEntityHandlers/removeRelationshipCommandHandler";

const CommandHandlerContext = createContext();

export function CommandHandlerProvider({ children }) {
    const [classEntities, setClassEntities] = useState([])
    const [relationshipEntities, setRelationshipEntities] = useState([])

    const commandHandler = (commandLine) => {
        const commandArray = commandLine.replace("\n", "").replaceAll(",", "").split(" ");

        if(commandArray.length < 3) {
            throw ERROR_COMMAND_SYNTAX;
        }

        const commandType = commandArray.shift().toLowerCase();
        const entityType = commandArray.shift().toLowerCase();
        
        switch(true) {
            case SUPPORTED_COMMANDS.create.includes(commandType):
                return createEntityHandler(commandArray, entityType);

            case SUPPORTED_COMMANDS.read.includes(commandType):
                return readEntityHandler(commandArray, entityType);

            case SUPPORTED_COMMANDS.remove.includes(commandType):
                return removeEntityHandler(commandArray, entityType);

            case SUPPORTED_COMMANDS.alter.includes(commandType):
                return alterEntityHandler(commandArray, entityType);

            default:
                throw ERROR_COMMAND_SYNTAX;
        }
        
    };

    function createEntityHandler(commandArray, entityType) {
        const newEntity = {
            id: uuidv4()
        };

        switch(true) {
            case SUPPORTED_ENTITY_TYPES.class.includes(entityType):
                nameAlreadyInUse(classEntities, upperCaseFirstLetter(commandArray[0].toLowerCase()));

                Object.assign(newEntity, createClassCommandHandler(commandArray));

                setClassEntities(prevClassEntities => {
                    return [
                        ...prevClassEntities,
                        newEntity
                    ];
                });
                
                return "A classe " + newEntity.name + " foi criada com sucesso";

            case SUPPORTED_ENTITY_TYPES.relationship.includes(entityType):

                Object.assign(newEntity, createRelationshipCommandHandler(commandArray, classEntities));

                setRelationshipEntities(prevRealtionshipEntities => {
                    return [
                        ...prevRealtionshipEntities,
                        newEntity
                    ];
                });

                return "Rela????o " +
                SUPPORTED_RELATIONSHIP_TYPES[newEntity.relationshipType][1] +
                " entre " +
                newEntity.primaryClassName +
                " e " +
                newEntity.secondaryClassName +
                " com o nome " +
                newEntity.name +
                " foi criada com sucesso!";
    
            default:
                throw ERROR_UNRECOGNISED_ENTITY_TYPE;
        }
    }

    function readEntityHandler(commandArray, entityType) {
        switch(true) {
            case SUPPORTED_ENTITY_TYPES.class.includes(entityType):
                return readClassCommandHandler(commandArray, classEntities);

            case SUPPORTED_ENTITY_TYPES.relationship.includes(entityType):
                return readRelationshipCommandHandler(commandArray, relationshipEntities, classEntities);
                
            default:
                throw ERROR_UNRECOGNISED_ENTITY_TYPE;
        }
    }

    function removeEntityHandler(commandArray, entityType) {
        switch(true) {
            case SUPPORTED_ENTITY_TYPES.class.includes(entityType):
                const handledClassEntities = removeClassCommandHandler(commandArray, classEntities);

                setClassEntities(handledClassEntities);

                return "A classe " + commandArray[0] + " foi removida com sucesso!";

            case SUPPORTED_ENTITY_TYPES.relationship.includes(entityType):
                const handledRelationshipEntities = removeRelationshipCommandHandler(commandArray, relationshipEntities);
    
                setRelationshipEntities(handledRelationshipEntities);
    
                return "A rela????o " + commandArray[0] + " foi removida com sucesso!";
                
            default:
                throw ERROR_UNRECOGNISED_ENTITY_TYPE;
        }
    }

    function alterEntityHandler(commandArray, entityType) {
        switch(true) {
            case SUPPORTED_ENTITY_TYPES.class.includes(entityType):
                const alteringClass = classEntities.find((classEntity) => classEntity.name === upperCaseFirstLetter(commandArray[0]));

                if(!alteringClass) {
                    throw ERROR_CLASS_DOES_NOT_EXISTS;
                }

                const renameIndex = commandArray.indexOf("-n");
                if(renameIndex !== -1) {
                    nameAlreadyInUse(classEntities, upperCaseFirstLetter(commandArray[renameIndex + 1].toLowerCase()));
                }

                const alteredEntity = alterClassCommandHandler(commandArray, alteringClass, renameIndex);

                setClassEntities(prevClassEntities => {
                    const newClassEntities = prevClassEntities.map((prevClassEntity) => {
                        if(prevClassEntity === alteringClass) {
                            prevClassEntity = alteredEntity;
                        }

                        return prevClassEntity;
                    })

                    return newClassEntities;
                });
                
                return "A classe " + alteringClass.name + " foi alterada com sucesso";

            case SUPPORTED_ENTITY_TYPES.relationship.includes(entityType):
                const relationshipName = commandArray.shift();
                const alteringRelationship = relationshipEntities.find((relationship) => relationship.name === relationshipName);

                const alteredRelationship = AlterRelationshipCommandHandler(commandArray, alteringRelationship, classEntities);

                setRelationshipEntities(prevRelationshipEntities => {
                    const newRelationshipEntities = prevRelationshipEntities.map((prevRelationshipEntity) => {
                        if(prevRelationshipEntity === alteringRelationship) {
                            prevRelationshipEntity = alteredRelationship;
                        }

                        return prevRelationshipEntity;
                    })

                    return newRelationshipEntities;
                });

                return "A rela????o " +
                    relationshipName +
                    " for alterada com sucesso!";

            default:
                throw ERROR_UNRECOGNISED_ENTITY_TYPE;
        }
    }

    return (
        <CommandHandlerContext.Provider value={{ commandHandler, classEntities, relationshipEntities }}>
            { children }
        </CommandHandlerContext.Provider>
    );
}

export default CommandHandlerContext;

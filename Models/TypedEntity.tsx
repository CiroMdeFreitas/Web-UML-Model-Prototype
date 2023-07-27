import DiagramEntity from "./DiagramEntity"

/**
 * All entities with types must inehrit this class
 */
export default abstract class TypedEntity extends DiagramEntity {
    private type: string

    /**
     * Sets entity's name and type.
     * 
     * @param name Entoty's name.
     * @param type Entity's type.
     */
    constructor(name: string, type: string) {
        super(name);
        this.type = type;
    }

    /**
     * Sets entity's type.
     * 
     * @param type New entity's type.
     */
    public setType(type: string): void {
        this.type = type;
    }

    /**
     * Gets entity's type.
     * 
     * @returns Entity's type.
     */
    public getType(): string {
        return this.type;
    }
}
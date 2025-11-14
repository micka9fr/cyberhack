// === Init fields var ===
const fields = foundry.data.fields;

/* -------------------------------------------- */
/*  Actor Models                                */
/* -------------------------------------------- */

// === Base character model
class BaseDataModel extends foundry.abstract.TypeDataModel  {
    static defineSchema() {

        return {
            test: new fields.StringField(),
            attributes: new fields.SchemaField({
                body: new fields.NumberField(),
                Dexterity: new fields.NumberField(),
                reflexe: new fields.NumberField(),
                willpower: new fields.NumberField(),
                knowledge: new fields.NumberField(),
                empathy: new fields.NumberField(),
            })
        };
    }
}

// === PC ===
export class CharacterDataModel extends BaseDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            goodness: new fields.SchemaField({
                value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 5 }),
                max: new fields.NumberField({ required: true, integer: true, min: 0, initial: 10 })
            }),
            level: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0, max: 30 })
        };
    }
}

// === NPC ===
export class NPCDataModel extends BaseDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            wickedness: new fields.SchemaField({
                value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 5 }),
                max: new fields.NumberField({ required: true, integer: true, min: 0, initial: 100 })
            })
        };
    }
}

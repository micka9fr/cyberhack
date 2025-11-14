// === Init fields var ===
const fields = foundry.data.fields;

/* -------------------------------------------- */
/*  Actor Models                                */
/* -------------------------------------------- */

// === Base character model
class BaseDataModel extends foundry.abstract.TypeDataModel  {
    static LOCALIZATION_PREFIXES = ["cyberhack.Actor"];
    static defineSchema() {
        return {
            testCharacter: new fields.StringField({ initial: 'Je suis un PJ' }),
            testString: new fields.StringField(),
            attributes: new fields.SchemaField({
                body: new fields.NumberField(),
                dexterity: new fields.NumberField(),
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
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "cyberhack.Actor.Character"
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            testInt: new fields.NumberField({ required: true, integer: true, min: 0, initial: 5}),
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

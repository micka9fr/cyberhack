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
            role: new fields.StringField({ initial: 'Je suis un PJ' }),
            health: new fields.SchemaField({
                value: new fields.NumberField(),
                max: new fields.NumberField()
            }),
            armor: new fields.SchemaField({
                head: new fields.NumberField(),
                torso: new fields.NumberField(),
                left_arm: new fields.NumberField(),
                right_arm: new fields.NumberField(),
                left_leg: new fields.NumberField(),
                right_leg: new fields.NumberField(),
            }),
            attributes: new fields.SchemaField({
                body: new fields.SchemaField({
                    base: new fields.NumberField()
                }),
                dexterity: new fields.SchemaField({
                    base: new fields.NumberField()
                }),
                reflexe: new fields.SchemaField({
                    base: new fields.NumberField()
                }),
                willpower: new fields.SchemaField({
                    base: new fields.NumberField()
                }),
                knowledge: new fields.SchemaField({
                    base: new fields.NumberField()
                }),
                empathy: new fields.SchemaField({
                    base: new fields.NumberField()
                }),
            }),
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




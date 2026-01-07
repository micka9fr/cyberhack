// === Init fields var ===
const fields = foundry.data.fields;

const inputNumberConfigSkill = { initial:0 }
const inputNumberConfigAttr = { initial:4 }

/* -------------------------------------------- */
/*  Actor Models                                */
/* -------------------------------------------- */

// === Base character model
class BaseDataModel extends foundry.abstract.TypeDataModel  {
    static LOCALIZATION_PREFIXES = ["cyberhack.Actor"];
    static defineSchema() {
        return {
            role: new fields.StringField({ initial: 'Je suis un PJ' }),
            health: new fields.NumberField({}),
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
                    base: new fields.NumberField(inputNumberConfigAttr),
                    skills: new fields.SchemaField({
                        Athletic: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Endurance: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Melee: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        StrengthFeat: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) })
                    })
                }),
                dexterity: new fields.SchemaField({
                    base: new fields.NumberField(inputNumberConfigAttr),
                    skills: new fields.SchemaField({
                        DrivePilot: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Firearms: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        JuryRig: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Stealth: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                    })
                }),
                instinct: new fields.SchemaField({
                    base: new fields.NumberField(inputNumberConfigAttr),
                    skills: new fields.SchemaField({
                        Awareness: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Psychology: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Reaction: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Survival: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),

                    })
                }),
                willpower: new fields.SchemaField({
                    base: new fields.NumberField(inputNumberConfigAttr),
                    skills: new fields.SchemaField({
                        Coercion: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Concentration: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Research: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Streetwise: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) })
                    })
                }),
                knowledge: new fields.SchemaField({
                    base: new fields.NumberField(inputNumberConfigAttr),
                    skills: new fields.SchemaField({
                        Corpwise: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Engineering: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Hacking: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Medicine: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) })
                    })
                }),
                charisma: new fields.SchemaField({
                    base: new fields.NumberField(inputNumberConfigAttr),
                    skills: new fields.SchemaField({
                        Conversation: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Performance: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Seduction: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) }),
                        Style: new fields.SchemaField({ base: new fields.NumberField(inputNumberConfigSkill) })
                    })
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




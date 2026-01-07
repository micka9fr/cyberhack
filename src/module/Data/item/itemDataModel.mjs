import { getAttributeSkillChoices, getRarityChoices, getCyberTypeChoices, getRangedWeaponTypeChoices, MAX_ARMOR_VALUE } from "../../config.mjs";

// === Init fields var ===
import Cyberhack from "../../config.mjs";

const fields = foundry.data.fields;


// =========================================================================
//  BASE MODELS
// =========================================================================


class ItemDataModel extends foundry.abstract.TypeDataModel {
    static LOCALIZATION_PREFIXES = ["cyberhack.Item"];
    static defineSchema() {
        return {
            description: new fields.HTMLField({
                required: true,
                initial: "..."
            }),
            rarity: new fields.StringField({
                required: true,
                blank: false,
                choices: getRarityChoices(),
                initial: "cheap"
            }),
            encumbrance: new fields.NumberField({
                required: true, integer: true, min:0, max:5, initial: 0
            })
        };
    }
}

class WeaponDataModel extends ItemDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "cyberhack.Item.Weapon"
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            hitBonus: new fields.NumberField({ required: true, integer: true, min:-2, max:2, initial: 0 }),
            damage: new fields.NumberField({ required: true, integer: true, min:1, max:5, initial: 3 }),
            isActive: new fields.BooleanField({ initial: true }),
        };
    }
}


// =========================================================================
// FACTORY FUNCTIONS
// =========================================================================


function effectsDataFactory() {
    return {
        effects: new fields.ArrayField(
            new fields.SchemaField({
                key: new fields.StringField({
                    choices:  () => getAttributeSkillChoices(),
                    initial: "body"
                }),
                value: new fields.StringField({})
            })
        )
    }
}



// =========================================================================
// OBJECTS MODELS
// =========================================================================


export class ArmorDataModel extends ItemDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "cyberhack.Item.Armor"
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            armorValue: new fields.SchemaField({
                head: new fields.NumberField({ integer: true, min:0, max:MAX_ARMOR_VALUE, initial: 0 }),
                torso: new fields.NumberField({ integer: true, min:0, max:MAX_ARMOR_VALUE, initial: 0 }),
                legR: new fields.NumberField({ integer: true, min:0, max:MAX_ARMOR_VALUE, initial: 0 }),
                legL: new fields.NumberField({ integer: true, min:0, max:MAX_ARMOR_VALUE, initial: 0 }),
                armR: new fields.NumberField({ integer: true, min:0, max:MAX_ARMOR_VALUE, initial: 0 }),
                armL: new fields.NumberField({ integer: true, min:0, max:MAX_ARMOR_VALUE, initial: 0 }),
            }),
            armorMalus: new fields.NumberField({
                integer: true, min:-5, max:0, initial: 0
            }),
            isActive: new fields.BooleanField({ initial: true }),
        }
    }
}

export class EquipItemDataModel extends ItemDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            isActive: new fields.BooleanField({ initial: true }),
        }
    }
}

export class CyberwareDataModel extends ItemDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "cyberhack.Item.Cyberware"
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            type: new fields.StringField({
                required: true,
                blank: false,
                choices: getCyberTypeChoices(),
                initial: "implant",
            }),
            isActive: new fields.BooleanField({ initial: true }),
            stress: new fields.NumberField({ required: true }),
            durability: new fields.SchemaField({
                current: new fields.NumberField({

                }),
                max: new fields.NumberField({
                    label: "max"
                }),
            }),
            ...effectsDataFactory()
        }
    }
}

export class RangedWeaponDataModel extends WeaponDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            weaponType: new fields.StringField({
                required: true,
                blank: false,
                choices: getRangedWeaponTypeChoices(),
                initial: "handgun"
            }),
            range: new fields.NumberField({ required: true, integer: true, min:25, max:1000, step:25, positive: true, initial: 50 }),
            ammo: new fields.SchemaField({
                current: new fields.NumberField({}),
                max: new fields.NumberField({
                    required:true,
                    initial: 1,
                    positive:true
                })
            })
        };
    }
}

export class MeleeWeaponDataModel extends WeaponDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            weaponType: new fields.StringField({ required:true, initial: "melee"})
        };
    }
}




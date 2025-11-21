// === Init fields var ===
const fields = foundry.data.fields;

/* -------------------------------------------- */
/*  Item Models                                 */
/* -------------------------------------------- */

class ItemDataModel extends foundry.abstract.TypeDataModel {
    static LOCALIZATION_PREFIXES = ["cyberhack.Item"];
    static defineSchema() {
        return {
            description: new fields.HTMLField({
                required: true
            }),

        };
    }
}

class BuyableDataModel extends ItemDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            rarity: new fields.StringField({
                required: true,
                blank: false,
                options: ["common", "uncommon", "rare", "legendary"],
                initial: "common"
            }),
            price: new fields.NumberField({ required: true, integer: true, min: 0, initial: 20 })
        };
    }
}

export class CyberwareDataModel extends BuyableDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "cyberhack.Item.Cyberware"
    ];
    static defineSchema(){
        return {
            ...super.defineSchema(),
            humanityCost : new fields.StringField({
                required: true,
            })
        };
    }
}

export class TalentDataModel extends ItemDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "cyberhack.Item.Talent"
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            xpCost: new fields.NumberField({

            }),
            level: new fields.NumberField({

            })
        }
    }
}

export class WeaponDataModel extends BuyableDataModel {
    static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "cyberhack.Item.Weapon"
    ];
    static defineSchema() {
        return {
            ...super.defineSchema(),
            damage: new fields.NumberField({ required: true, integer: true, positive: true, initial: 5 })
        };
    }
}


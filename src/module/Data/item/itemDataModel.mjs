// === Init fields var ===
const fields = foundry.data.fields;

/* -------------------------------------------- */
/*  Item Models                                 */
/* -------------------------------------------- */

class ItemDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
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

export class TalentDataModel extends ItemDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
        }
    }
}

export class WeaponDataModel extends ItemDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            damage: new fields.NumberField({ required: true, integer: true, positive: true, initial: 5 })
        };
    }
}

export class SpellDataModel extends ItemDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            cost: new fields.NumberField({ required: true, integer: true, positive: true, initial: 2 })
        };
    }
}
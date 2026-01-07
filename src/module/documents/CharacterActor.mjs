/**
 * A simple extension that adds a hook at the end of data prep
 */
export default class CharacterActor extends foundry.documents.Actor {
    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
        // Data modifications in this step occur before processing embedded
        // documents or derived data.
    }

    /**
     * @override
     * Augment the actor source data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
    */
    prepareDerivedData() {
        const actorData = this;
        const systemData = actorData.system;
        const items = this.items

        const cyberwares = items.filter(i => i.type === "cyberware");
        const talents = items.filter(i => i.type === "talent");
        const armors = items.filter(i => i.type === "armor");
        // const const flags = actorData.flags.cyberhack || {};
        systemData.combat ??= {};
        systemData.combat.armor ??= {};

console.log(items);

        this._addStatBonus(cyberwares, systemData);

        this._prepareArmorData(armors, systemData);

        this._prepareSecondary(systemData);
        // === Secondary stats ===


        // === Specific derivedData ===
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
    }




    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {
        if (actorData.type !== 'character') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;

    }

    _prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;
        //systemData.xp = (systemData.cr * systemData.cr) * 100;
    }


// ===================================================================
// ADD CYBERWARE BONUS
// ===================================================================


    _addStatBonus(items, systemData) {
        const modifs = items?.reduce((acc, item) => {
            const effects = item.system.effects;
            if (!item.system.isActive || !Array.isArray(effects)) return acc;
            item.system.effects.forEach(effect => {
                if (effect.isEquip === false) return;

                const type = effect.key.includes("###") ? "skills" : "attributes";

                acc[type] ??= {};
                acc[type][effect.key] =
                    Number(acc[type][effect.key] ?? 0) + Number(effect.value ?? 0);
            });

            return acc;
        }, {}) ?? {};

        console.log(modifs);
        //attribution des bonus
        for (const [type, effects] of Object.entries(modifs)) {
            for (const [rawKey, bonus] of Object.entries(effects)) {
                const numBonus = Number(bonus);
                const hasBonus = bonus !== null && numBonus !== 0;

                let targetObj = null;

                if (systemData[type]?.[rawKey]) {
                    targetObj = systemData[type][rawKey];
                } else if (rawKey.includes("###")) {
                    const [attr, subKey] = rawKey.split("###");

                    if (subKey === "base") {
                        targetObj = systemData.attributes[attr]?.base;
                    } else {
                        targetObj = systemData.attributes[attr]?.skills?.[subKey];
                    }
                }
                if (targetObj) {
                    if (hasBonus) {
                        targetObj.value = (targetObj.base ?? 0) + numBonus;
                        targetObj.mod = numBonus;
                    } else {
                        targetObj.value = null;
                        targetObj.mod = 0;
                    }
                }
            }
        }
        /*
        for (const [type, effects] of Object.entries(modifs)) {
            for (const [key, bonus] of Object.entries(effects)) {
                console.log(type+' '+key);
                if (systemData[type]?.[key]) {
                    if (bonus !== null &&(Number(bonus) !== 0)) {
                        systemData[type][key].value = (systemData[type][key].base ?? 0) + (Number(bonus));
                        systemData[type][key].mod = (Number(bonus));
                    } else {
                        systemData[type][key].value = null;
                    }
                } else if (systemData["attributes"][key.split("###")[0]][type]?.[key.split("###")[1]]) {
                    console.log(type);
                    if (bonus !== null &&(Number(bonus) !== 0)) {
                        console.log(systemData["attributes"][key.split("###")[0]][type][key.split("###")[1]]);
                        systemData["attributes"][key.split("###")[0]][type][key.split("###")[1]].value = (systemData["attributes"][key.split("###")[0]][type][key.split("###")[1]].base ?? 0) + (Number(bonus));
                        systemData["attributes"][key.split("###")[0]][type][key.split("###")[1]].mod = (Number(bonus));
                    } else {
                        systemData["attributes"][key.split("###")[0]][type][key.split("###")[1]].value = null;
                    }
                }
            }
        }*/
        console.log(systemData);
    }

// ===================================================================
//  PREPARE ARMOR DATA
// ===================================================================

    _prepareArmorData(armors, systemData) {

        for (const part of ["head","torso","legR","legL","armR","armL"]) {
            systemData.combat.armor[part] = {
                value: 0,
                source: null
            };
        }

        for (const armor of armors) {
            if (!armor.system.isActive) continue;

            for (const [part, value] of Object.entries(armor.system.armorValue)) {
                systemData.combat.armor[part] = {
                    value,
                    source: armor.id
                };
            }
        }
    }

    _prepareSecondary(systemData){
        const attributes= systemData.attributes;

        const body = attributes.body.value ? attributes.body.value : attributes.body.base;
        const dexterity = attributes.dexterity.value ? attributes.dexterity.value : attributes.dexterity.base;
        const instinct = attributes.instinct.value ? attributes.instinct.value : attributes.instinct.base;
        const willpower = attributes.willpower.value ? attributes.willpower.value : attributes.willpower.base;
        const knowledge = attributes.knowledge.value ? attributes.knowledge.value : attributes.knowledge.base;
        const charisma = attributes.charisma.value ? attributes.charisma.value : attributes.charisma.base;

        systemData.carry = body * 10;
        systemData.speed = dexterity * 2;
        systemData.btm = Math.floor(body / 4);
        systemData.maxHealth = body + willpower;
    }
}
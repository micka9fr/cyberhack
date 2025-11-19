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
        // const const flags = actorData.flags.cyberhack || {};


        // === ITEM BONUS ====
        const attributeMods = {
            body: 2,
            reflexe: 1,
            empathy: -1
        };

        for (const [key, attribut] of Object.entries(systemData.attributes)) {
            const bonus = attributeMods[key] ?? 0;
            attribut.value = attribut.base + bonus
        }

        // === Secondary stats ===
        systemData.carry = systemData.attributes.body.value * 10;
        systemData.speed = systemData.attributes.dexterity.value * 2;
        systemData.btm = Math.floor(systemData.attributes.dexterity.value / 4);

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

        console.log(Object.entries(systemData.attributes));

    }

    _prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;
        //systemData.xp = (systemData.cr * systemData.cr) * 100;
    }
}
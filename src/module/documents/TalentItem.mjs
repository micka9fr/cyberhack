/**
 * A simple extension that adds a hook at the end of data prep
 */
export default class TalentItem extends foundry.documents.Item {
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
    /** @override */
    prepareDerivedData() {
        const itemData = this
        const systemData = itemData.system;
    }
}
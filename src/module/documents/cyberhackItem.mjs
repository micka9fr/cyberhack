/**
 * A simple extension that adds a hook at the end of data prep
 */
export default class CyberhackItem extends foundry.documents.Item {
    /** @inheritdoc */
    prepareDerivedData() {
        super.prepareDerivedData();

        /**
         * Flexible hook for modules to alter derived documents data.
         * @param {CyberhackItem} item      The item preparing derived data.
         */
        Hooks.callAll("cyberhack.prepareItemData", this);
    }
}
/**
 * A simple extension that adds a hook at the end of data prep
 */
export default class CyberhackActor extends foundry.documents.Actor {
    /** @inheritdoc */
    prepareDerivedData() {
        super.prepareDerivedData();

        /**
         * Flexible hook for modules to alter derived documents data.
         * @param {CyberhackActor} actor      The actor preparing derived data.
         */
        Hooks.callAll("cyberhack.prepareActorData", this);
    }
}
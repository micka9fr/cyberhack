import { systemPath } from "../../constants.mjs";

const { api, sheets } = foundry.applications;

/**
 * Feuille minimaliste pour les Talents (drag & drop only)
 */
export class TalentSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheet) {

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["cyberhack", "item", "standard-form"],
        position: { width: 550, height: "auto" },
        window: {  },
        /*  actions: {
              viewDoc: this.#viewEffect,
              createDoc: this.#createEffect,
              deleteDoc: this.#deleteEffect,
              toggleEffect: this.#toggleEffect
          },*/
        form: {
            submitOnChange: true,
            resizable: true
        }

    };

    /** @override */
    static PARTS = {
        header: { template: systemPath("templates/item/parts/item-header.hbs") },
        body:   {
            template: systemPath("templates/item/talent-sheet.hbs"),
            scrollable: [""]
        }
    };

    /** @inheritdoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        Object.assign(context, {
            owner: this.document.isOwner,
            limited: this.document.limited,
            item: this.item,
            system: this.item.system,
            flags: this.item.flags,
            itemFields: this.item.schema.fields,
            systemFields: this.document.system.schema.fields,
            //description : await foundry.applications.ux.TextEditor.enrichHTML(this.document.system.description, { secrets: this.isOwner }),
            config: CONFIG
        });

        console.log(context.itemFields);
        console.log(context.system);

        return context;
    }

    /**
     * Recursively add system model fields to the fieldset.
     */
    async #addSystemFields(fieldset, schema, source, _path = "system") {
        for (const field of Object.values(schema)) {
            const path = `${_path}.${field.name}`;
            if (field instanceof foundry.data.fields.SchemaField) {
                this.#addSystemFields(fieldset, field.fields, source, path);
            } else if (field.constructor.hasFormSupport) {
                fieldset.fields.push({field, value: foundry.utils.getProperty(source, path)});
            }
        }
    }


    /* -------------------------------------------------- */
    /*   Event handlers                                   */
    /* -------------------------------------------------- */

    /**
     * Renders an embedded document's sheet
     *
     * @this TalentSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    static async #viewEffect(event, target) {
        const effect = this._getEffect(target);
        effect.sheet.render(true);
    }

    /* -------------------------------------------------- */

    /**
     * Handles item deletion
     *
     * @this TalentSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @protected
     */
    static async #deleteEffect(event, target) {
        const effect = this._getEffect(target);
        effect.delete();
    }

    /* -------------------------------------------------- */

    /**
     * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
     *
     * @this TalentSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    static async #createEffect(event, target) {
        const aeCls = getDocumentClass("ActiveEffect");
        const effectData = {
            name: aeCls.defaultName({
                type: target.dataset.type,
                parent: this.item
            })
        };
        for (const [dataKey, value] of Object.entries(target.dataset)) {
            if (["action", "documentClass"].includes(dataKey)) continue;
            foundry.utils.setProperty(effectData, dataKey, value);
        }

        aeCls.create(effectData, {parent: this.item});
    }

    /* -------------------------------------------------- */

    /**
     * Determines effect parent to pass to helper
     *
     * @this TalentSheet
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @private
     */
    static async #toggleEffect(event, target) {
        const effect = this._getEffect(target);
        effect.update({disabled: !effect.disabled});
    }
}
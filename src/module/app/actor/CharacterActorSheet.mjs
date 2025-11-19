import {systemPath} from "../../constants.mjs";
import {prepareActiveEffectCategories} from "../../helpers/utils.mjs";

const {api, sheets} = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class CharacterActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        classes: ["cyberhack", "actor", "standard-form"],
        position: {
            width: 720,
            height: 900
        },
        actions: {
            viewDoc: this.#viewDoc,
            createDoc: this.#createDoc,
            deleteDoc: this.#deleteDoc,
            toggleEffect: this.#toggleEffect,
            rollAttribute: CharacterActorSheet.#rollAttribute
        },
        form: {
            submitOnChange: true
        }
    };

    /* -------------------------------------------------- */

    static TABS = {
        primary: {
            tabs: [
                {
                    id: "talents"
                },
                {
                    id: "cyberwares"
                }
            ],
            initial: "talents",
            labelPrefix: "cyberhack.Sheets.Tabs"
        }
    };

    /* -------------------------------------------------- */

    /** @inheritdoc */
    static PARTS = {
        header: {
            template: systemPath("templates/actor/parts/character-header.hbs")
        },
        tabs: {
            template: "templates/generic/tab-navigation.hbs"
        },
        talents: {
            template: systemPath("templates/actor/tabs/view-talents.hbs"),
            scrollable: [""]
        },
        cyberwares: {
            template: systemPath("templates/actor/tabs/view-cyberwares.hbs"),
            scrollable: [""]
        }
    };

    /* -------------------------------------------------- */

    /** @inheritdoc */
    _initializeApplicationOptions(options) {
        const initialized = super._initializeApplicationOptions(options);

        initialized.classes.push(initialized.document.type);

        return initialized;
    }

    /* -------------------------------------------------- */

    /** @inheritdoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        Object.assign(context, {
            owner: this.document.isOwner,
            limited: this.document.limited,
            actor: this.actor,
            system: this.actor.system,
            flags: this.actor.flags,
            actorFields: this.actor.schema.fields,
            systemFields: this.document.system.schema.fields,
            config: CONFIG
        });

        return context;
    }

    /* -------------------------------------------------- */

    /** @inheritdoc */
    async _preparePartContext(partId, context) {
        switch (partId) {
            case "talents":
                //context.fields = await this._getFields();
                context.tab = context.tabs[partId];
                break;
            case "cyberwares":
                //context.itemTypes = this._getItems();
                context.tab = context.tabs[partId];
                break;
        }
        return context;
    }

    // =========================================================================
    // Actions déclaratives (clic sur boutons avec data-action)
    // =========================================================================

    static async #viewDoc(event, target) {
        const doc = await this._getEmbeddedDocument(target);
        doc?.sheet.render(true);
    }

    static async #createDoc(event, target) {
        const type = target.dataset.type;
        const cls = getDocumentClass(target.dataset.documentClass ?? "Item");
        const data = { name: cls.defaultName?.({ type, parent: this.actor }) ?? `Nouveau ${type}`, type };
        foundry.utils.mergeObject(data, target.dataset);
        cls.create(data, { parent: this.actor });
    }

    static async #deleteDoc(event, target) {
        const doc = await this._getEmbeddedDocument(target);
        doc?.deleteDialog?.();
    }

    static async #toggleEffect(event, target) {
        const effect = await this._getEmbeddedDocument(target);
        effect?.update({ disabled: !effect.disabled });
    }

    // =========================================================================
    // Roll d'attribut (le cœur de ton système)
    // =========================================================================

    static async #rollAttribute(event, target) {
        event.preventDefault();
        const attrKey = target.closest("[data-attribute]")?.dataset.attribute;
        if (!attrKey) return;

        const attr = foundry.utils.getProperty(this.actor.system, `attributes.${attrKey}`);
        if (!attr) return;

        const value = attr.value ?? attr.base ?? 0;
        const label = game.i18n.localize(`cyberhack.Actor.Character.FIELDS.attributes.${attrKey}.base.label`) || attrKey;

        const content = await foundry.applications.handlebars.renderTemplate("systems/cyberhack/templates/dialog/roll-modifier.hbs", {
            attribute: attrKey,
            value: value,
            label
        });

        new foundry.applications.api.Dialog({
            window: { title: `${label} - Jet d'attribut` },
            classes: ["cyberhack"],
            content,
            buttons: [{
                action: "roll",
                icon: "fas fa-dice-d10",
                label: "Lancer les dés",
                default: true,
                callback: async (event, button, dialog) => {
                    const html = dialog.element;
                    const mod = Number(html.querySelector('[name="modifier"]').value) || 0;
                    const formula = `${value} + 1d10 + ${mod}`;
                    const roll = new Roll(formula, this.actor.getRollData());
                    await roll.evaluate();
                    await roll.toMessage({
                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                        flavor: `<strong>${label}</strong> (${value}) + 1d10 ${mod >= 0 ? "+" : ""}${mod}`
                    });
                },
            }],
        }).render({ force: true });

    }

    // =========================================================================
    // Gestion des overrides (Active Effects)
    // =========================================================================

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.#disableOverrides();
    }

    /** @override */
    async _processSubmitData(event, form, submitData) {
        const overrides = foundry.utils.flattenObject(this.actor.overrides ?? {});
        for (const key of Object.keys(overrides)) delete submitData[key];
        await this.actor.update(submitData);
    }

    #disableOverrides() {
        const overrides = foundry.utils.flattenObject(this.actor.overrides ?? {});
        for (const path of Object.keys(overrides)) {
            const input = this.element[0]?.querySelector(`[name="${path}"]`);
            if (input) input.disabled = true;
        }
    }
}
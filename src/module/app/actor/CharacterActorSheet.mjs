import { systemPath } from "../../constants.mjs";
import { sheetEdit } from "../../helpers/utils.mjs";
import { prepareActiveEffectCategories } from "../../helpers/utils.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets
const renderTemplate = foundry.applications.handlebars.renderTemplate

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class CharacterActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        classes: ["cyberhack", "sheet", "actor"],
        position: { width: 512, height: 835 },
        window: {
            //resizable: true,
            title: 'cyberhack.Sheets.Title.ActorSheet',
            controls: [
                {
                    icon: 'fa-solid fa-pencil',
                    label: "Edit sheet",
                    action: "sheetEdit",
                },
            ]
        },
        actions: {
            sheetEdit: sheetEdit,
            rollSkill: this.#rollSkill,
            damageRoll: this.#damageRoll,
            deleteItem: this.#deleteItem,
            viewItem: this.#viewItem,
            toggleItem: this.#toggleItem,
            damageArmor: this.#damageArmor,
            reloadWeapon: this.#reloadWeapon
            /*viewDoc: this.#viewDoc,
            createDoc: this.#createDoc,
            deleteDoc: this.#deleteDoc,
            toggleEffect: this.#toggleEffect,
            rollAttribute: this.#rollAttribute,
            */
        },
        tag: 'form',
        form: {
            submitOnChange: true
        }
    };

    static TABS = {
        sheet: {
            tabs: [
                { id: "skills", group: 'sheet' },
                { id: "gears", group: 'sheet' },
               // { id: "talents", group: 'sheet' },
                { id: "cyberwares", group: 'sheet' }
            ],
            labelPrefix: "cyberhack.Sheets.Tabs",
            initial: "skills"
        }
    };

    /** @inheritdoc */
    static PARTS = {
        header: {
            template: systemPath("templates/actor/parts/header.hbs")
        },
        tabs: {
            template: "templates/generic/tab-navigation.hbs"
        },
        skills: {
            template: systemPath("templates/actor/tabs/skills.hbs")
        },
        gears: {
            template: systemPath("templates/actor/tabs/gears.hbs")
        },
        /*talents: {
            template: systemPath("templates/actor/tabs/talents.hbs")
        },*/
        cyberwares: {
            template: systemPath("templates/actor/tabs/cyberwares.hbs")
        },
        footer:{
            template: systemPath("templates/actor/parts/footer.hbs")
        },
    };

    /* -------------------------------------------------- */

    /** @inheritdoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        return Object.assign(context, {
            isEditing: this.actor.getFlag("cyberhack", "isEditing") ?? false,
            owner: this.document.isOwner,
            limited: this.document.limited,
            actor: this.actor,
            system: this.actor.system,
            flags: this.actor.flags,
            talents: this.actor.items.filter(i => i.type === "talent"),
            cyberwares: this.actor.items.filter(i => i.type === "cyberware"),
            armors: this.actor.items.filter(i => i.type === "armor"),
            rangedWeapons: this.actor.items.filter(i => i.type === "rangedWeapon"),
            meleeWeapons: this.actor.items.filter(i => i.type === "meleeWeapon"),
            actorFields: this.actor.schema.fields,
            systemFields: this.document.system.schema.fields,
            config: CONFIG
        });

  //      return context;
    }


    // =========================================================================
    // Actions Functions  (clic onboutons with data-action)
    // =========================================================================

    static async #reloadWeapon(event, target) {
        event.preventDefault();
        event.stopPropagation();

        const itemId = target.dataset.itemId;
        if (!itemId) return;

        const weapon = this.actor.items.get(itemId);

        if (!weapon || weapon.type !== "rangedWeapon") return;

        const maxAmmo = weapon.system.ammo?.max ?? 0;
        const current = weapon.system.ammo?.current ?? 0;

        if (current >= maxAmmo) return;
        //if (!maxAmmo) return;

        await weapon.update({
            "system.ammo.current": maxAmmo
        });
    }

    // Ablate armor value in armor in list
    static async #damageArmor(event, target) {
        event.preventDefault();

        const itemId = target.dataset.itemId;
        const part = target.dataset.part;
        const value = Number(target.value);

        if (!itemId || !part) return;

        const armor = this.actor.items.get(itemId);
        if (!armor) return;

        await armor.update({
            [`system.armorValue.${part}`]: Math.max(0, value)
        });
    }

    static #deleteItem(event, target) {
        event.preventDefault();
        const itemId = target.closest("[data-item-id]").dataset.itemId;
        this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }

    static async #viewItem(event, target) {
        event.preventDefault();

        const li = target.closest("[data-item-id]");
        if (!li) return;

        const item = this.actor.items.get(li.dataset.itemId);
        if (!item) return;

        const content = await renderTemplate(
            "systems/cyberhack/templates/dialog/item-summary.hbs",
            {
                item,
                system: item.system
            }
        );

        foundry.applications.api.DialogV2.prompt({
            window: {
                title: item.name
            },
            content,

        });
    }

    static async #toggleItem(event, target) {
        event.preventDefault();
        event.stopPropagation();

        const itemId = target.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (!item) return;

        await item.update({
            "system.isActive": !item.system.isActive
        });
    }


    static async #rollSkill(event, target) {
        event.preventDefault();

        const skill = target.dataset.skill ?? null;
        const attributeKey = target.dataset.attribute ?? null;

        // Récupération sécurisée des valeurs d'attribut et compétence
        const attributeValue = this.#getAttributeValue(attributeKey);
        const skillValue = skill ? this.#getSkillValue(attributeKey, skill) : 0;

        // Dialog de configuration du jet
        const response = await foundry.applications.api.DialogV2.wait({
            position: { width: 480, height: "auto" },
            window: { title: game.i18n.localize("cyberhack.Dice.rollTitle") },
            content: this._modalContent(skill),
            buttons: [
                { label: "Avantage", action: "advantage", callback: (e, b, d) => this._getModalValues(d, "advantage") },
                { label: "Standard", action: "standard",   callback: (e, b, d) => this._getModalValues(d, "standard") },
                { label: "Désavantage", action: "disadvantage", callback: (e, b, d) => this._getModalValues(d, "disadvantage") }
            ]
        });

        if (!response) return;

        // Récupération de l'arme (ou mains nues)
        const weapon = await this.#getWeaponFromResponse(response);

        // ──────── GESTION DE LA LOCALISATION TOUCHÉE ────────
        let finalLocation = response.options.targetLocation ?? "none";
        let locationRoll = null;
        let locationDiceTotal = null;

        if (finalLocation === "none" && weapon) {
            locationRoll = await new Roll("1d10").evaluate();
            locationDiceTotal = locationRoll.total;

            finalLocation = this.#getRandomLocation(locationDiceTotal);
        }

        // Malus selon la visée choisie (pas appliqué si aléatoire sans visée)
        const malusLocation = (response.options.targetLocation !== "none")
            ? this.#getLocationMalus(response.options.targetLocation)
            : 0;

        const weaponHitBonus = weapon?.system?.hitBonus ?? 0;

        const finalModifier = attributeValue + skillValue + Number(response.modifier) + weaponHitBonus + malusLocation;

        // Jet principal
        const formula = {
            advantage: "2d10kh",
            standard: "1d10",
            disadvantage: "2d10kl"
        }[response.action];

        const roll = await new Roll(`${formula} + @mod`, { mod: finalModifier }).evaluate();
        const success = roll.total >= response.difficulty;

        // Dégâts si succès et arme présente
        const { damageRoll, damageTotal, damageTooltip } = await this.#computeDamage(success, weapon);

        // Consommation munitions / arme jetable
        await this.#consumeWeaponResources(success, weapon, response);

        // Message chat
        await this.#sendRollToChat({
            roll,
            skill,
            weapon,
            finalModifier,
            difficulty: response.difficulty,
            success,
            damageTotal,
            damageTooltip,
            targetLocation: finalLocation,
            locationRoll: locationRoll,          // null si visée précise
            locationDiceTotal: locationDiceTotal // null si visée précise
        });
    }

// ──────────────────────── Méthodes helpers privées ────────────────────────

    #getAttributeValue(attrKey) {
        if (!attrKey) return 0;
        const attr = this.actor.system.attributes[attrKey];
        return Number(attr.value ?? attr.base ?? 0);
    }

    #getSkillValue(attrKey, skillKey) {
        if (!attrKey || !skillKey) return 0;
        const skill = this.actor.system.attributes[attrKey]?.skills?.[skillKey];
        return Number(skill?.value ?? skill?.base ?? 0);
    }

    async #getWeaponFromResponse(response) {
        if (!response.weaponId) return null;

        if (response.weaponId === "unarmed") {
            const body = Math.max(
                this.actor.system.attributes.body?.base ?? 1,
                this.actor.system.attributes.body?.value ?? 1
            );
            return {
                id: "unarmed",
                name: game.i18n.localize("cyberhack.Dice.unarmed"),
                type: "meleeWeapon",
                system: {
                    hitBonus: 0,
                    damage: Math.max(1, Math.floor(body / 3))
                }
            };
        }

        return this.actor.items.get(response.weaponId) ?? null;
    }

    #getLocationMalus(location) {
        const malusMap = {
            none: 0,
            head: -8,
            arm: -3,
            leg: -3,
            other: -4
        };
        return malusMap[location ?? "none"] ?? 0;
    }

    #getRandomLocation(d10Result) {
        switch (d10Result) {
            case 1:  return "head";
            case 2:
            case 3:
            case 4:  return "torso";
            case 5:  return "r_arm";
            case 6:  return "l_arm";
            case 7:
            case 8:  return "r_leg";
            case 9:
            case 10: return "l_leg";
            default: return "torso"; // sécurité
        }
    }

    async #computeDamage(success, weapon) {
        if (!success || !weapon || weapon.system?.damage == null) {
            return { damageRoll: null, damageTotal: null, damageTooltip: null };
        }

        const diceCount = weapon.system.damage;
        const damageFormula = `${diceCount}d6`;
        const damageRoll = await new Roll(damageFormula).evaluate();
        const damageTooltip = await damageRoll.getTooltip();

        return {
            damageRoll,
            damageTotal: damageRoll.total,
            damageTooltip
        };
    }

    async #consumeWeaponResources(success, weapon, response) {
        if (!success || !weapon) return;

        if (weapon.type === "rangedWeapon") {
            const currentAmmo = weapon.system.ammo?.current ?? 0;
            if (currentAmmo > 0) {
                await weapon.update({ "system.ammo.current": currentAmmo - 1 });
            }
        } else if (weapon.type === "throwWeapon") {
            await this.actor.deleteEmbeddedDocuments("Item", [weapon.id]);
        }
    }

    async #sendRollToChat(data) {
        const locationLabel = game.i18n.localize(`cyberhack.Dice.${data.targetLocation}`);

        const templateData = {
            title: game.i18n.localize("cyberhack.Dice.skillRoll"),
            actorName: this.actor.name,
            skill: data.skill,
            weaponName: data.weapon?.name ?? null,
            finalModifier: data.finalModifier,
            finalTarget: data.difficulty,
            total: data.roll.total,
            success: data.success,
            damage: data.damageTotal,
            tooltip: await data.roll.getTooltip(),
            damageTooltip: data.damageTooltip,
            locationLabel: locationLabel,
            hasLocationRoll: data.locationRoll !== null,
            locationTooltip: data.locationRoll ? await data.locationRoll.getTooltip() : null,
            locationDice: data.locationDiceTotal
        };

        const html = await renderTemplate(systemPath("templates/dice/skill-roll.hbs"), templateData);

        await data.roll.toMessage({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: html,
            flavor: game.i18n.format("cyberhack.Dice.flavorSkillRoll", { skill: data.skill })
        });
    }



    static async #damageRoll(event, target){
        event.preventDefault();
        const damage = target.dataset.damage ?? false;
        let formula = damage;

        const roll = new Roll(formula);
        await roll.evaluate();

        const html = await renderTemplate(
            systemPath("templates/dice/damage-roll.hbs"),
            {
                title: "Jet de dégâts",
                actorName: this.actor.name,
                total: roll.total,
                tooltip: await roll.getTooltip()
            }
        );

        await roll.toMessage(
            {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: html,
                flavor: `Jet de dédâts`
            },
            { rollMode: game.settings.get("core", "rollMode") }
        );
    }


    // =========================================================================
    // functions helper
    // =========================================================================

    _modalContent(skill) {
        const fields = foundry.applications.fields;

        // ———————— MODIFIER ————————
        const modifierGroup = fields.createFormGroup({
            input: fields.createNumberInput({ name: "modifier", value: 0 }),
            label: "cyberhack.Sheets.Dialog.modifier",
            localize: true
        });

        // ———————— DIFFICULTY ————————
        const difficultyGroup = fields.createFormGroup({
            input: fields.createSelectInput({
                name: "difficulty",
                value: 15,
                options: [
                    { label: "Easy", value: 10 },
                    { label: "Medium", value: 15 },
                    { label: "Hard", value: 20 },
                    { label: "Very hard", value: 25 },
                    { label: "Near Impossible", value: 30 }
                ]
            }),
            label: "cyberhack.Sheets.Dialog.difficulty",
            localize: true
        });

        // ———————— WEAPONS ————————
        let weaponsHTML = "";
        const weaponTypeMap = { Melee: "meleeWeapon", Athletism: "throwWeapon", Firearms: "rangedWeapon" };
        const weaponType = weaponTypeMap[skill];

        if (weaponType) {
            let weapons = this.actor.items.filter(i => i.type === weaponType && i.system.isActive);

            if (skill === "Melee") {
                weapons = [{
                    id: "unarmed",
                    name: game.i18n.localize("cyberhack.Dice.unarmed"),
                    type: "meleeWeapon",
                    system: { hitBonus: 0, damage: 1 }
                }, ...weapons];
            }

            if (weapons.length > 0) {
                weaponsHTML = `
                <fieldset class="weapon-select">
                    <legend>${game.i18n.localize("cyberhack.Dice.weaponList")}</legend>
                    ${weapons.map(weapon => {
                    const isRanged = weapon.type === "rangedWeapon";
                    const ammoCurrent = weapon.system?.ammo?.current ?? 0;
                    const noAmmo = isRanged && ammoCurrent <= 0;

                    return `
                            <label class="checkbox ${noAmmo ? "disabled" : ""}">
                                <input type="radio" name="weapon" value="${weapon.id}" ${noAmmo ? "disabled" : ""} />
                                ${weapon.name}
                                ${noAmmo ? `<span class="no-ammo">(${game.i18n.localize("cyberhack.Dice.noAmmo")})</span>` : ""}
                            </label>
                        `;
                }).join("")}
                </fieldset>
            `;
            }
        }

        // ———————— OPTIONS SPÉCIFIQUES ————————
        let optionsHTML = "";

        // Les options restantes (powerStrike pour Melee, burst pour Firearms)
        const remainingOptions = {
            Melee: [{ key: "powerStrike", label: "cyberhack.Dice.powerStrike" }],
            Firearms: [{ key: "burst", label: "cyberhack.Dice.burst" }]
        }[skill];

        if (remainingOptions || ["Melee", "Firearms"].includes(skill)) {
            const checkboxesHTML = remainingOptions
                ? this._generateOptionCheckboxes(remainingOptions, "options")
                : "";

            // Select de localisation visée (remplace aimedStrike / aimedShot)
            const targetLocationGroup = fields.createFormGroup({
                input: fields.createSelectInput({
                    name: "options.targetLocation",
                    value: "none", // par défaut : pas de visée
                    options: [
                        { label: "cyberhack.Dice.targetNone", value: "none" },
                        { label: "cyberhack.Dice.head", value: "head" },
                        { label: "cyberhack.Dice.arm", value: "arm" },
                        { label: "cyberhack.Dice.leg", value: "leg" },
                        { label: "cyberhack.Dice.other", value: "other" }
                    ],
                    localize: true
                }),
                label: "cyberhack.Dice.aimedShot", // on réutilise la même clé pour le label "Visée précise"
                localize: true
            });

            optionsHTML = `
            <fieldset class="skill-options">
                <legend>${game.i18n.localize("cyberhack.Dice.options")}</legend>
                ${checkboxesHTML}
                ${["Melee", "Firearms"].includes(skill) ? targetLocationGroup.outerHTML : ""}
            </fieldset>
        `;
        }

        // ———————— ASSEMBLAGE FINAL ————————
        return `
        ${modifierGroup.outerHTML}
        ${difficultyGroup.outerHTML}
        ${weaponsHTML}
        ${optionsHTML}
    `;
    }

    _generateOptionCheckboxes(options, name) {
        const fields = foundry.applications.fields;
        if (!options?.length) return "";

        let html = "";
        for (const option of options) {
            const checkbox = fields.createCheckboxInput({
                name: `${name}.${option.key}`,
                value: option.default ?? false
            });
            html += `
            <div class="form-group">
                <label class="checkbox">
                    ${checkbox.outerHTML}
                    ${game.i18n.localize(option.label)}
                </label>
            </div>
        `;
        }
        return html;
    }

    _getModalValues(dialog, action) {
        const html = dialog.element;

        const options = {};

        // Récupère TOUS les champs qui commencent par "options."
        html.querySelectorAll('[name^="options."]').forEach(el => {
            const key = el.name.split('.')[1];

            if (el.type === "checkbox") {
                options[key] = el.checked;
            } else if (el.type === "select-one") {
                options[key] = el.value;
            } else {
                // Pour inputs text, number, radio, etc.
                options[key] = el.value;
            }
        });

        return {
            action,
            modifier: Number(html.querySelector('[name="modifier"]').value || 0),
            difficulty: Number(html.querySelector('[name="difficulty"]').value || 15),
            weaponId: html.querySelector('[name="weapon"]:checked')?.value ?? null,
            options
        };
    }


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
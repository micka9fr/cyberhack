// === import config ===
import CYBERHACK from "./src/module/config.mjs";

// === import documeent class ===
import * as documents from './src/module/documents/_module.mjs';

// === import sheet classes ===
import * as apps from "./src/module/app/_module.mjs"

// === import dataModel ===
import * as dataModels from './src/module/Data/_module.mjs';


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */


Hooks.once("init", () => {
    CONFIG.CYBERHACK = CYBERHACK;
    console.log(documents);
    console.log(apps);
    console.log(dataModels);
    //console.log(dataModels.Item.config);
    // === Document classes ===
    for (const docCls of Object.values(documents)) {
        CONFIG[docCls.documentName].documentClass = docCls;
    }

    console.log(CONFIG);

    // === config dataModel ===
    Object.assign(CONFIG.ActiveEffect.dataModels, dataModels.ActiveEffect.config);
    Object.assign(CONFIG.Actor.dataModels, dataModels.Actor.config);
    Object.assign(CONFIG.Item.dataModels , dataModels.Item.config);

    //console.log(CONFIG.Actor.dataModels);
    console.log(CONFIG.Item.dataModels);
    //CONFIG.Actor.defaultType = "token";

    // === register sheet ===
    foundry.documents.collections.Actors.registerSheet('cyberhack', apps.Actor.CharacterActorSheet, {
        makeDefault: true, label: 'cyberhack.Sheets.Labels.ActorSheet',
    });

    foundry.documents.collections.Items.registerSheet('cyberhack', apps.Item.TalentSheet, {
        types: ['talent'],
        makeDefault: true,
        label: 'Fiche de talents',
    });

    foundry.documents.collections.Items.registerSheet('cyberhack', apps.Item.CyberwareSheet, {
        types: ['cyberware'],
        makeDefault: true,
        label: 'Fiche de Cyberware',
    });

    foundry.documents.collections.Items.registerSheet('cyberhack', apps.Item.WeaponSheet, {
        types: ['rangedWeapon', 'meleeWeapon', 'item'],
        makeDefault: true,
        label: 'Fiche d\'arme',
    });

    foundry.documents.collections.Items.registerSheet('cyberhack', apps.Item.ArmorSheet, {
        types: ['armor'],
        makeDefault: true,
        label: 'Fiche d\'armor',
    });

    Handlebars.registerHelper("afterSeparator", function(str, separator) {
        if (!str || typeof str !== "string") return str;
        const parts = str.split(separator);
        return parts.length > 1 ? parts[1] : str;
    });

});


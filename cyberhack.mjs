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

    // === Document classes ===
    for (const docCls of Object.values(documents)) {
        CONFIG[docCls.documentName].documentClass = docCls;
    }

    // === config dataModel ===
    Object.assign(CONFIG.Actor.dataModels, dataModels.Actor.config);
    Object.assign(CONFIG.Item.dataModels , dataModels.Item.config);

    console.log(CONFIG.Actor.dataModels);
    console.log(CONFIG.Item.dataModels);
    //CONFIG.Actor.defaultType = "token";

    // === register sheet ===
    foundry.documents.collections.Actors.registerSheet('cyberhack', apps.Actor.CharacterActorSheet, {
        makeDefault: true, label: 'cyberhack.Sheets.Labels.ActorSheet',
    });
    foundry.documents.collections.Items.registerSheet('cyberhack', apps.Item.TalentSheet, {
        makeDefault: true,
        label: '',
    });

});


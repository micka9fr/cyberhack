const {api, sheets} = foundry.applications;

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class CyberwareSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheet) {

}
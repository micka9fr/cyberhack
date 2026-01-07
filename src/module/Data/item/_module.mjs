import { RangedWeaponDataModel, MeleeWeaponDataModel, CyberwareDataModel, EquipItemDataModel, ArmorDataModel } from "./ItemDataModel.mjs";
import { TalentDataModel } from "./TalentDataModel.mjs"

const config = {
    talent: TalentDataModel,
    cyberware: CyberwareDataModel,
    rangedWeapon: RangedWeaponDataModel,
    meleeWeapon: MeleeWeaponDataModel,
    equipItem: EquipItemDataModel,
    armor: ArmorDataModel
};

export {TalentDataModel, CyberwareDataModel, RangedWeaponDataModel, MeleeWeaponDataModel, EquipItemDataModel, ArmorDataModel, config};
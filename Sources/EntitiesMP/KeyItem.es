/* Copyright (c) 2002-2012 Croteam Ltd. 
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

805
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Items/ItemHolder/ItemHolder.h"
%}

uses "EntitiesMP/Item";

// key type 
enum KeyItemType {
  0 KIT_BOOKOFWISDOM      "Book of wisdom",
  1 KIT_CROSSWOODEN       "Wooden cross",
  2 KIT_CROSSMETAL        "Silver cross",
  3 KIT_CROSSGOLD         "Gold cross",
  4 KIT_JAGUARGOLDDUMMY   "Gold jaguar",
  5 KIT_HAWKWINGS01DUMMY  "Hawk wings - part 1",
  6 KIT_HAWKWINGS02DUMMY  "Hawk wings - part 2",
  7 KIT_HOLYGRAIL         "Holy grail",
  8 KIT_TABLESDUMMY       "Tablet of wisdom",
  9 KIT_WINGEDLION        "Winged lion",
 10 KIT_ELEPHANTGOLD      "Gold elephant",
 11 KIT_STATUEHEAD01      "Seriously scary ceremonial mask",
 12 KIT_STATUEHEAD02      "Hilariously happy ceremonial mask",
 13 KIT_STATUEHEAD03      "Ix Chel mask",
 14 KIT_KINGSTATUE        "Statue of King Tilmun",
 15 KIT_CRYSTALSKULL      "Crystal Skull",
 
 16 KIT_ANKHGOLD          "Ankh gold",
 17 KIT_ANKHSTONE         "Ankh stone",
 18 KIT_ANKHWOOD          "Ankh wood",
 19 KIT_ELEMENTAIR        "Element air",
 20 KIT_ELEMENTEARTH      "Element earth",
 21 KIT_ELEMENTFIRE       "Element fire",
 22 KIT_ELEMENTWATER      "Element water",
 23 KIT_EYEOFRA           "Eye of Ra",
 24 KIT_SPHINX            "Sphinx",
 25 KIT_FEATHER           "Feather of Truth",
 26 KIT_GOLDHEART         "Gold heart",
 27 KIT_RAKEY             "Ra key",
 28 KIT_RASIGN            "Moon key",
 29 KIT_SCARAB            "Scarab",
 30 KIT_UASET             "Uaset",
 
 31 KIT_KEYGENERIC        "Generic key",
 32 KIT_KEYHEART          "Heart key",
 33 KIT_ATLANTIS          "Atlantis key",
 34 KIT_CHINA             "China key",
 35 KIT_ROME              "Rome key",
 36 KIT_MONKEY            "Golden monkey",
 37 KIT_MIAB              "Monkey-in-a-barrel",
 38 KIT_SUZANNE           "Suzanne",
};

// event for sending through receive item
event EKey {
  enum KeyItemType kitType,
};

%{

const char *GetKeyName(int /*enum KeyItemType*/ _kit)
{
  enum KeyItemType kit = (KeyItemType) _kit;

  switch(kit) {
  case KIT_BOOKOFWISDOM     :  return TRANS("Book of wisdom"); break;
  case KIT_CROSSWOODEN      :  return TRANS("Wooden cross"); break;
  case KIT_CROSSGOLD        :  return TRANS("Gold cross"); break;
  case KIT_CROSSMETAL       :  return TRANS("Silver cross"); break;
  case KIT_JAGUARGOLDDUMMY  :  return TRANS("Gold jaguar"); break;
  case KIT_HAWKWINGS01DUMMY :  return TRANS("Hawk wings - part 1"); break;
  case KIT_HAWKWINGS02DUMMY :  return TRANS("Hawk wings - part 2"); break;
  case KIT_HOLYGRAIL        :  return TRANS("Holy grail"); break;
  case KIT_TABLESDUMMY      :  return TRANS("Tablet of wisdom"); break;
  case KIT_WINGEDLION       :  return TRANS("Winged lion"); break;
  case KIT_ELEPHANTGOLD     :  return TRANS("Gold elephant"); break;    
  case KIT_STATUEHEAD01     :  return TRANS("Seriously scary ceremonial mask"); break;
  case KIT_STATUEHEAD02     :  return TRANS("Hilariously happy ceremonial mask"); break;
  case KIT_STATUEHEAD03     :  return TRANS("Ix Chel mask"); break;   
  case KIT_KINGSTATUE       :  return TRANS("Statue of King Tilmun"); break;   
  case KIT_CRYSTALSKULL     :  return TRANS("Crystal Skull"); break;   
 
 case KIT_ANKHGOLD          :  return TRANS("Ankh gold"); break;
 case KIT_ANKHSTONE         :  return TRANS("Ankh stone"); break;
 case KIT_ANKHWOOD          :  return TRANS("Ank wood"); break;
 case KIT_ELEMENTAIR        :  return TRANS("Element air"); break;
 case KIT_ELEMENTEARTH      :  return TRANS("Element earth"); break;
 case KIT_ELEMENTFIRE       :  return TRANS("Element fire"); break;
 case KIT_ELEMENTWATER      :  return TRANS("Element water"); break;
 case KIT_EYEOFRA           :  return TRANS("Eye of Ra"); break;
 case KIT_SPHINX            :  return TRANS("Gold Sphinx"); break;
 case KIT_FEATHER           :  return TRANS("Feather of Truth"); break;
 case KIT_GOLDHEART         :  return TRANS("Gold heart"); break;
 case KIT_RAKEY             :  return TRANS("Ra key"); break;
 case KIT_RASIGN            :  return TRANS("Moon key"); break;
 case KIT_SCARAB            :  return TRANS("Scarab"); break;
 case KIT_UASET             :  return TRANS("Uaset"); break;
 
 case KIT_KEYGENERIC          :  return TRANS("A key"); break;
 case KIT_KEYHEART            :  return TRANS("Heart key"); break;
 case KIT_ATLANTIS            :  return TRANS("Atlantis key"); break;
 case KIT_CHINA               :  return TRANS("China key"); break;
 case KIT_ROME                :  return TRANS("Rome key"); break;
 case KIT_MONKEY              :  return TRANS("Golden monkey"); break;
 case KIT_MIAB                :  return TRANS("Monkey-in-a-barrel"); break;
 case KIT_SUZANNE             :  return TRANS("Suzanne"); break;

  default: return TRANS("unknown item"); break;
  };
}

%}

class CKeyItem : CItem {
name      "KeyItem";
thumbnail "Thumbnails\\KeyItem.tbn";
features  "IsImportant";

properties:
  1 enum KeyItemType m_kitType    "Type" 'Y' = KIT_BOOKOFWISDOM, // key type
  3 INDEX m_iSoundComponent = 0,
  5 FLOAT m_fSize "Size" = 1.0f,

components:
  0 class   CLASS_BASE        "Classes\\Item.ecl",

// ********* ANKH KEY *********
  1 model   MODEL_BOOKOFWISDOM      "ModelsMP\\Items\\Keys\\BookOfWisdom\\Book.mdl",
  2 texture TEXTURE_BOOKOFWISDOM    "ModelsMP\\Items\\Keys\\BookOfWisdom\\Book.tex",

  5 model   MODEL_CROSSWOODEN       "ModelsMP\\Items\\Keys\\Cross\\Cross.mdl",
  6 texture TEXTURE_CROSSWOODEN     "ModelsMP\\Items\\Keys\\Cross\\CrossWooden.tex",
  
  7 model   MODEL_CROSSMETAL        "ModelsMP\\Items\\Keys\\Cross\\Cross.mdl",
  8 texture TEXTURE_CROSSMETAL      "ModelsMP\\Items\\Keys\\Cross\\CrossMetal.tex",

 10 model   MODEL_CROSSGOLD         "ModelsMP\\Items\\Keys\\GoldCross\\Cross.mdl",
 11 texture TEXTURE_CROSSGOLD       "ModelsMP\\Items\\Keys\\GoldCross\\Cross.tex",

 15 model   MODEL_JAGUARGOLD        "ModelsMP\\Items\\Keys\\GoldJaguar\\Jaguar.mdl",

 20 model   MODEL_HAWKWINGS01       "ModelsMP\\Items\\Keys\\HawkWings\\WingRight.mdl",
 21 model   MODEL_HAWKWINGS02       "ModelsMP\\Items\\Keys\\HawkWings\\WingLeft.mdl",
 22 texture TEXTURE_HAWKWINGS       "ModelsMP\\Items\\Keys\\HawkWings\\Wings.tex",

 30 model   MODEL_HOLYGRAIL         "ModelsMP\\Items\\Keys\\HolyGrail\\Grail.mdl",
 31 texture TEXTURE_HOLYGRAIL       "ModelsMP\\Items\\Keys\\HolyGrail\\Grail.tex",

 35 model   MODEL_TABLESOFWISDOM    "ModelsMP\\Items\\Keys\\TablesOfWisdom\\Tables.mdl",
 36 texture TEXTURE_TABLESOFWISDOM  "ModelsMP\\Items\\Keys\\TablesOfWisdom\\Tables.tex",

 40 model   MODEL_WINGEDLION        "ModelsMP\\Items\\Keys\\WingLion\\WingLion.mdl",
 
 45 model   MODEL_ELEPHANTGOLD      "ModelsMP\\Items\\Keys\\GoldElephant\\Elephant.mdl",

 50 model   MODEL_STATUEHEAD01      "ModelsMP\\Items\\Keys\\Statue01\\Statue.mdl",
 51 texture TEXTURE_STATUEHEAD01    "ModelsMP\\Items\\Keys\\Statue01\\Statue.tex",
 52 model   MODEL_STATUEHEAD02      "ModelsMP\\Items\\Keys\\Statue02\\Statue.mdl",
 53 texture TEXTURE_STATUEHEAD02    "ModelsMP\\Items\\Keys\\Statue02\\Statue.tex",
 54 model   MODEL_STATUEHEAD03      "ModelsMP\\Items\\Keys\\Statue03\\Statue.mdl",
 55 texture TEXTURE_STATUEHEAD03    "ModelsMP\\Items\\Keys\\Statue03\\Statue.tex",

 58 model   MODEL_KINGSTATUE        "ModelsMP\\Items\\Keys\\ManStatue\\Statue.mdl",
 
 60 model   MODEL_CRYSTALSKULL      "ModelsMP\\Items\\Keys\\CrystalSkull\\Skull.mdl",
 61 texture TEXTURE_CRYSTALSKULL    "ModelsMP\\Items\\Keys\\CrystalSkull\\Skull.tex",

 
 62 model   MODEL_ANKHGOLD          "Models\\Items\\Keys\\AnkhGold\\Ankh.mdl",
 63 texture TEXTURE_ANKHGOLD        "Models\\Items\\Keys\\AnkhGold\\Ankh.tex",
 64 model   MODEL_ANKHSTONE         "Models\\Items\\Keys\\AnkhStone\\Ankh.mdl",
 65 texture TEXTURE_ANKHSTONE       "Models\\Items\\Keys\\AnkhStone\\Stone.tex",
 66 model   MODEL_ANKHWOOD          "Models\\Items\\Keys\\AnkhWood\\Ankh.mdl",
 67 texture TEXTURE_ANKHWOOD        "Models\\Ages\\Egypt\\Vehicles\\BigBoat\\OldWood.tex",
  
 68 model   MODEL_ELEMENTAIR        "Models\\Items\\Keys\\Elements\\Air.mdl",
 69 texture TEXTURE_ELEMENTAIR      "Models\\Items\\Keys\\Elements\\Air.tex",
 70 model   MODEL_ELEMENTEARTH      "Models\\Items\\Keys\\Elements\\Earth.mdl",
 71 texture TEXTURE_ELEMENTEARTH    "Models\\Items\\Keys\\Elements\\Texture.tex",
 72 model   MODEL_ELEMENTFIRE       "Models\\Items\\Keys\\Elements\\Fire.mdl",
 73 texture TEXTURE_ELEMENTFIRE     "Models\\Items\\Keys\\Elements\\Fire.tex",
 74 model   MODEL_ELEMENTWATER      "Models\\Items\\Keys\\Elements\\Water.mdl",
 75 texture TEXTURE_ELEMENTWATER    "Models\\Items\\Keys\\Elements\\Water.tex",
  
 76 model   MODEL_EYEOFRA           "Models\\Items\\Keys\\EyeOfRa\\EyeOfRa.mdl",
 77 texture TEXTURE_EYEOFRA         "Models\\Items\\Keys\\EyeOfRa\\EyeOfRa.tex",
  
 78 model   MODEL_SPHINX            "Models\\Items\\Keys\\GoldSphinx\\GoldSphinx.mdl",
 79 texture TEXTURE_SPHINX          "Models\\Items\\Keys\\GoldSphinx\\Sphinx.tex",
  
 80 model   MODEL_FEATHER           "Models\\Items\\Keys\\Luxor\\FeatherOfTruth.mdl",
 81 texture TEXTURE_FEATHER         "Models\\Items\\Keys\\Luxor\\FeatherOfTruth.tex",
 82 model   MODEL_HEART             "Models\\Items\\Keys\\Luxor\\GoldHeart.mdl",
 83 texture TEXTURE_HEART           "Models\\Items\\Keys\\Luxor\\GoldHeart.tex",
  
 84 model   MODEL_RAKEY             "Models\\Items\\Keys\\RaKey\\Key.mdl",
 85 texture TEXTURE_RAKEY           "Models\\Items\\Keys\\RaKey\\Key.tex",
 86 model   MODEL_RASIGN            "Models\\Items\\Keys\\RaSign\\Sign.mdl",
 87 texture TEXTURE_RASIGN          "Models\\Items\\Keys\\RaSign\\Sign.tex",
  
 88 model   MODEL_SCARAB            "Models\\Items\\Keys\\Scarab\\Scarab.mdl",
 89 texture TEXTURE_SCARAB          "Models\\Items\\Keys\\Scarab\\Scarab.tex",
  
 90 model   MODEL_UASET             "Models\\Items\\Keys\\Uaset\\Uaset.mdl",
 91 texture TEXTURE_UASET           "Models\\Items\\Keys\\Uaset\\Uaset.tex",


 92 model   MODEL_GENERIC           "ModelsF\\Items\\Keys\\GenericKey\\GenericKey.mdl",
 93 texture TEXTURE_GENERIC         "TexturesMP\\SS2\\Metal\\Metal_base_01.tex",

 94 model   MODEL_HEARTKEY          "ModelsF\\Items\\Keys\\HeartKey\\HeartKey.mdl",
 95 texture TEXTURE_HEARTKEY        "Models\\Items\\Health\\Super\\Super.tex",

 96 model   MODEL_ATLANTIS          "ModelsF\\Items\\Keys\\Key_Atlantis\\Key_Atlantis.mdl",
 97 texture TEXTURE_ATLANTIS        "ModelsF\\Items\\Keys\\Key_Atlantis\\blinn1SG_Texture1.tex",

 98 model   MODEL_CHINA             "ModelsF\\Items\\Keys\\Key_China\\Key_China.mdl",
 99 texture TEXTURE_CHINA           "ModelsF\\Items\\Keys\\Key_China\\blinn1SG_Texture1.tex",

100 model   MODEL_ROME              "ModelsF\\Items\\Keys\\Key_Rome\\Key_Rome.mdl",
101 texture TEXTURE_ROME            "ModelsF\\Items\\Keys\\Key_Rome\\Key_Rome.tex",

102 model   MODEL_MONKEY              "ModelsF\\Items\\Keys\\Monkey\\Monkey.mdl",
103 model   MODEL_MIAB                "ModelsF\\Items\\Keys\\Monkey-in-a-barrel\\Monkey-in-a-barrel.mdl",
104 model   MODEL_SUZANNE             "ModelsF\\Items\\Keys\\Suzanne\\Suzanne.mdl",

 // ********* MISC *********
250 texture TEXTURE_FLARE       "ModelsMP\\Items\\Flares\\Flare.tex",
251 model   MODEL_FLARE         "ModelsMP\\Items\\Flares\\Flare.mdl",
252 texture TEX_REFL_GOLD01     "ModelsMP\\ReflectionTextures\\Gold01.tex",
253 texture TEX_REFL_METAL01    "ModelsMP\\ReflectionTextures\\LightMetal01.tex",
254 texture TEX_SPEC_MEDIUM     "ModelsMP\\SpecularTextures\\Medium.tex",
255 texture TEX_SPEC_STRONG     "ModelsMP\\SpecularTextures\\Strong.tex",

// ************** SOUNDS **************
300 sound   SOUND_KEY         "Sounds\\Items\\Key.wav",

functions:
  void Precache(void) {
    PrecacheSound(SOUND_KEY);
  }
  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    pes->es_strName = GetKeyName(m_kitType);
    pes->es_ctCount = 1;
    pes->es_ctAmmount = 1;
    pes->es_fValue = 1;
    pes->es_iScore = 0;//m_iScore;
    return TRUE;
  }
  
  // render particles
  void RenderParticles(void) {
    // no particles when not existing
    if (GetRenderType()!=CEntity::RT_MODEL || !ShowItemParticles()) {
      return;
    }
    switch (m_kitType) {
    case KIT_BOOKOFWISDOM    :
    case KIT_CRYSTALSKULL    :   
    case KIT_HOLYGRAIL       :
      Particles_Stardust(this, 1.0f, 0.5f, PT_STAR08, 64);
      break;
    case KIT_JAGUARGOLDDUMMY :
      Particles_Stardust(this, 2.0f, 2.0f, PT_STAR08, 64);
      break;
    case KIT_CROSSWOODEN     :
    case KIT_CROSSMETAL      :   
    case KIT_CROSSGOLD       :      
    case KIT_HAWKWINGS01DUMMY:
    case KIT_HAWKWINGS02DUMMY:
    case KIT_TABLESDUMMY     :
    case KIT_WINGEDLION      :
    case KIT_ELEPHANTGOLD    :
    case KIT_STATUEHEAD01    :
    case KIT_STATUEHEAD02    :
    case KIT_STATUEHEAD03    :
    case KIT_KINGSTATUE      :
 
    case KIT_ANKHGOLD        :  
    case KIT_ANKHSTONE       : 
    case KIT_ANKHWOOD        :
    case KIT_ELEMENTAIR      :
    case KIT_ELEMENTEARTH    :
    case KIT_ELEMENTFIRE     :
    case KIT_ELEMENTWATER    :
    case KIT_EYEOFRA         :
    case KIT_SPHINX          :
    case KIT_FEATHER         :
    case KIT_GOLDHEART       :
    case KIT_RAKEY           :
    case KIT_RASIGN          :
    case KIT_SCARAB          :
    case KIT_UASET           :
 
    case KIT_KEYGENERIC          :
    case KIT_KEYHEART            :
    case KIT_ATLANTIS            :
    case KIT_CHINA               :
    case KIT_ROME                :
    case KIT_MONKEY              :
    case KIT_MIAB                :
    case KIT_SUZANNE             :

    default:
      Particles_Stardust(this, 1.5f, 1.1f, PT_STAR08, 64);
      break;    
    }
  }
  


  // set health properties depending on type
  void SetProperties(void)
  {
    m_fRespawnTime = (m_fCustomRespawnTime>0) ? m_fCustomRespawnTime : 10.0f; 
    m_strDescription = GetKeyName(m_kitType);

    switch (m_kitType) {
      case KIT_BOOKOFWISDOM :
        // set appearance
        AddItem(MODEL_BOOKOFWISDOM, TEXTURE_BOOKOFWISDOM , 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CROSSWOODEN:
        // set appearance
        AddItem(MODEL_CROSSWOODEN, TEXTURE_CROSSWOODEN, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CROSSMETAL:
        // set appearance
        AddItem(MODEL_CROSSMETAL, TEXTURE_CROSSMETAL, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CROSSGOLD:
        // set appearance
        AddItem(MODEL_CROSSGOLD, TEXTURE_CROSSGOLD, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_JAGUARGOLDDUMMY:
        // set appearance
        AddItem(MODEL_JAGUARGOLD, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.5f,0), FLOAT3D(2,2,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_HAWKWINGS01DUMMY:
        // set appearance
        AddItem(MODEL_HAWKWINGS01, TEXTURE_HAWKWINGS, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_HAWKWINGS02DUMMY:
        // set appearance
        AddItem(MODEL_HAWKWINGS02, TEXTURE_HAWKWINGS, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_HOLYGRAIL:
        // set appearance
        AddItem(MODEL_HOLYGRAIL, TEXTURE_HOLYGRAIL, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_TABLESDUMMY:
        // set appearance
        AddItem(MODEL_TABLESOFWISDOM, TEXTURE_TABLESOFWISDOM, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_WINGEDLION:
        // set appearance
        AddItem(MODEL_WINGEDLION, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEPHANTGOLD:
        // set appearance
        AddItem(MODEL_ELEPHANTGOLD, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.5f,0), FLOAT3D(2,2,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;      
      case KIT_STATUEHEAD01:
        // set appearance
        AddItem(MODEL_STATUEHEAD01, TEXTURE_STATUEHEAD01, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_STATUEHEAD02:
        // set appearance
        AddItem(MODEL_STATUEHEAD02, TEXTURE_STATUEHEAD02, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;      
      case KIT_STATUEHEAD03:
        // set appearance
        AddItem(MODEL_STATUEHEAD03, TEXTURE_STATUEHEAD03, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_KINGSTATUE:
        // set appearance
        AddItem(MODEL_KINGSTATUE, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CRYSTALSKULL:
        // set appearance
        AddItem(MODEL_CRYSTALSKULL, TEXTURE_CRYSTALSKULL, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
 
      case KIT_ANKHGOLD:
        // set appearance
        AddItem(MODEL_ANKHGOLD, TEXTURE_ANKHGOLD, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.25f, 1.25f, 1.25f));
        m_iSoundComponent = SOUND_KEY;
        break;  
      case KIT_ANKHSTONE:
        // set appearance
        AddItem(MODEL_ANKHSTONE, TEXTURE_ANKHSTONE, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break; 
      case KIT_ANKHWOOD:
        // set appearance
        AddItem(MODEL_ANKHWOOD, TEXTURE_ANKHWOOD, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTAIR:
        // set appearance
        AddItem(MODEL_ELEMENTAIR, TEXTURE_ELEMENTAIR, 0, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.25f, 1.25f, 1.25f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTEARTH:
        // set appearance
        AddItem(MODEL_ELEMENTEARTH, TEXTURE_ELEMENTEARTH, 0, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.25f, 1.25f, 1.25f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTFIRE:
        // set appearance
        AddItem(MODEL_ELEMENTFIRE, TEXTURE_ELEMENTFIRE, 0, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.25f, 1.25f, 1.25f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTWATER:
        // set appearance
        AddItem(MODEL_ELEMENTWATER, TEXTURE_ELEMENTWATER, 0, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.25f, 1.25f, 1.25f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_EYEOFRA:
        // set appearance
        AddItem(MODEL_EYEOFRA, TEXTURE_EYEOFRA, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_SPHINX:
        // set appearance
        AddItem(MODEL_SPHINX, TEXTURE_SPHINX, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_FEATHER:
        // set appearance
        AddItem(MODEL_FEATHER, TEXTURE_FEATHER, 0, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_GOLDHEART:
        // set appearance
        AddItem(MODEL_HEART, TEXTURE_HEART, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_RAKEY:
        // set appearance
        AddItem(MODEL_RAKEY, TEXTURE_RAKEY, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.25f, 1.25f, 1.25f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_RASIGN:
        // set appearance
        AddItem(MODEL_RASIGN, TEXTURE_RASIGN, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.25f, 1.25f, 1.25f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_SCARAB:
        // set appearance
        AddItem(MODEL_SCARAB, TEXTURE_SCARAB, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_UASET:
        // set appearance
        AddItem(MODEL_UASET, TEXTURE_UASET, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
 
      case KIT_KEYGENERIC:
        // set appearance
        AddItem(MODEL_GENERIC, TEXTURE_GENERIC, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_KEYHEART:
        // set appearance
        AddItem(MODEL_HEARTKEY, TEXTURE_HEARTKEY, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ATLANTIS:
        // set appearance
        AddItem(MODEL_ATLANTIS, TEXTURE_ATLANTIS, 0, TEX_SPEC_STRONG, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CHINA:
        // set appearance
        AddItem(MODEL_CHINA, TEXTURE_CHINA, 0, TEX_SPEC_STRONG, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ROME:
        // set appearance
        AddItem(MODEL_ROME, TEXTURE_ROME, 0, TEX_SPEC_STRONG, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_MONKEY:
        // set appearance
        AddItem(MODEL_MONKEY, TEXTURE_HEARTKEY, TEX_REFL_GOLD01, TEX_SPEC_STRONG, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_MIAB:
        // set appearance
        AddItem(MODEL_MIAB, TEXTURE_HEARTKEY, TEX_REFL_GOLD01, TEX_SPEC_STRONG, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_SUZANNE:
        // set appearance
        AddItem(MODEL_SUZANNE, TEXTURE_HEARTKEY, TEX_REFL_GOLD01, TEX_SPEC_STRONG, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
    }
    GetModelObject()->StretchModel(FLOAT3D(m_fSize, m_fSize, m_fSize));
  };

procedures:
  ItemCollected(EPass epass) : CItem::ItemCollected {
    ASSERT(epass.penOther!=NULL);

    // send key to entity
    EKey eKey;
    eKey.kitType = m_kitType;
    // if health is received
    if (epass.penOther->ReceiveItem(eKey)) {
      if(_pNetwork->IsPlayerLocal(epass.penOther)) {IFeel_PlayEffect("PU_Key");}
      // play the pickup sound
      m_soPick.Set3DParameters(50.0f, 1.0f, 1.0f, 1.0f);
      PlaySound(m_soPick, m_iSoundComponent, SOF_3D);
      m_fPickSoundLen = GetSoundLength(m_iSoundComponent);
      jump CItem::ItemReceived();
    }
    return;
  };

  Main() {
    Initialize();     // initialize base class
    StartModelAnim(ITEMHOLDER_ANIM_SMALLOSCILATION, AOF_LOOPING|AOF_NORESTART);
    ForceCollisionBoxIndexChange(ITEMHOLDER_COLLISION_BOX_BIG);
    SetProperties();  // set properties

    jump CItem::ItemLoop();
  };
};

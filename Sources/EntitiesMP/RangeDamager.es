229
%{
#include "EntitiesMP/StdH/StdH.h"
%}

class CRangeDamager: CRationalEntity {
name      "RangeDamager";
thumbnail "Thumbnails\\RangeDamager.tbn";
features  "HasName", "IsTargetable";

properties:
  1 CTString m_strName          "Name" 'N' = "RangeDamager",
  2 CTString m_strDescription = "",
  3 enum DamageType m_dmtType "Type" 'Y' = DMT_IMPACT,    // type of damage
  4 FLOAT m_fAmmount "Ammount" 'A' = 100.0f,             // ammount of damage
  5 CEntityPointer m_penToDamage "Entity to Damage" 'E',  // entity to damage, NULL to damage the triggerer
  6 BOOL m_bDamageFromTriggerer "DamageFromTriggerer" 'S' = FALSE,  // make the triggerer inflictor of the damage
 10 CEntityPointer m_penLastDamaged,
 11 FLOAT m_tmLastDamage = 0.0f,
 12 RANGE m_rFallOffRange  "Fall-off" 'F' = 10.0f,
 13 RANGE m_rHotSpotRange  "Hot-spot" 'H' =  5.0f,

components:
  1 model   MODEL_TELEPORT     "Models\\Editor\\Axis.mdl",
  2 texture TEXTURE_TELEPORT   "Models\\Editor\\Vector.tex",

functions:
  const CTString &GetDescription(void) const {
    return m_strDescription;
  }

procedures:
  Main()
  {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_TELEPORT);
    SetModelMainTexture(TEXTURE_TELEPORT);

    ((CTString&)m_strDescription).PrintF("%s:%g", 
      DamageType_enum.NameForValue(INDEX(m_dmtType)), m_fAmmount);

    while (TRUE) {
      // wait for someone to trigger you and then damage it
      wait() {
        on (ETrigger eTrigger) : {

          FLOAT3D vSource;
          vSource = GetPlacement().pl_PositionVector;

          CEntity *penInflictor = this;
          if (m_bDamageFromTriggerer) {
            penInflictor = eTrigger.penCaused;
          }

          CEntity *penVictim = NULL;
          if (m_penToDamage!=NULL) {
            penVictim = this;
          } else if (eTrigger.penCaused!=NULL) {
            penVictim = eTrigger.penCaused;
          }
 
          if (penVictim!=NULL) {
            if (!(penVictim==m_penLastDamaged && _pTimer->CurrentTick()<m_tmLastDamage+0.1f))
            {
            InflictRangeDamage(this, m_dmtType, m_fAmmount, vSource, m_rHotSpotRange, m_rFallOffRange);
              m_penLastDamaged = penVictim;
              m_tmLastDamage = _pTimer->CurrentTick();
            }
          }
          stop;
        }
        otherwise() : {
          resume;
        };
      };
      
      // wait a bit to recover
      // autowait(0.1f);
    }
  }
};


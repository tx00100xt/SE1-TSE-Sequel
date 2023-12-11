324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "AREP/Models/Cyborg2/Cyborg.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/Projectile";

enum CyChar {
  0 CY_SOLDIER   "Soldier",    // soldier
  1 CY_SERGEANT  "Sergeant",   // sergeant
  2 CY_GENERAL  "General",   // general
};

%{
// info structure
static EntityInfo eiCyborg = {
  EIBT_ROBOT, 1000.0f,
  0.0f, 1.55f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiCyborgFly = {
  EIBT_ROBOT, 1500.0f,
  0.0f, 0.0f, 0.0f,
  0.0f, 0.0f, 0.0f,
};

#define SIZE_SOLDIER   (1.0f)
#define SIZE_SERGEANT  (2.0f)
#define SIZE_GENERAL  (3.0f)
#define FIRE_LEFT_ARM   FLOAT3D(-0.5f, 1.7f, -1.2f)
#define FIRE_RIGHT_ARM  FLOAT3D(+0.5f, 1.7f, -1.2f)
#define HIT_DISTANCE 4.0f
#define FIRE_BIKE   FLOAT3D(-0.35f, 0.1f, -1.2f)

#define CYBORGSOUND(soundname) ((m_CyChar==CY_GENERAL)? (SOUND_GENERAL_##soundname) : (SOUND_##soundname))
%}


class CCyborg : CEnemyFly {
name      "Cyborg";
thumbnail "Thumbnails\\Cyborg.tbn";

properties:
  2 enum CyChar m_CyChar   "Character" 'C' = CY_SOLDIER,
  3 INDEX m_iLoopCounter = 0,
  4 BOOL m_bWalkSoundPlaying = FALSE,
  5 FLOAT m_fThreatDistance = 5.0f,
  6 INDEX m_iCloseHit = 0,              // close hit hand (left or right)
  7 INDEX m_iFireLaserCount = 0,        // fire laser binary divider
  8 FLOAT m_fFlyAboveEnemy = 0.0f,      // fly above enemy height

  10 CSoundObject m_soFeet,
  11 CSoundObject m_soFire1,
  12 CSoundObject m_soFire2,
  13 CSoundObject m_soFire3,
  14 CSoundObject m_soFire4,
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_CYBORG            "AREP\\Models\\Cyborg2\\Cyborg.mdl",
 11 model   MODEL_ASS               "AREP\\Models\\Cyborg2\\AssHole.mdl",
 12 model   MODEL_TORSO             "AREP\\Models\\Cyborg2\\Torso.mdl",
 13 model   MODEL_HEAD              "AREP\\Models\\Cyborg2\\Head.mdl",
 14 model   MODEL_RIGHT_UPPER_ARM   "AREP\\Models\\Cyborg2\\RightUpperArm.mdl",
 15 model   MODEL_RIGHT_LOWER_ARM   "AREP\\Models\\Cyborg2\\RightLowerArm.mdl",
 16 model   MODEL_LEFT_UPPER_ARM    "AREP\\Models\\Cyborg2\\LeftUpperArm.mdl",
 17 model   MODEL_LEFT_LOWER_ARM    "AREP\\Models\\Cyborg2\\LeftLowerArm.mdl",
 18 model   MODEL_RIGHT_UPPER_LEG   "AREP\\Models\\Cyborg2\\RightUpperLeg.mdl",
 19 model   MODEL_RIGHT_LOWER_LEG   "AREP\\Models\\Cyborg2\\RightLowerLeg.mdl",
 20 model   MODEL_LEFT_UPPER_LEG    "AREP\\Models\\Cyborg2\\LeftUpperLeg.mdl",
 21 model   MODEL_LEFT_LOWER_LEG    "AREP\\Models\\Cyborg2\\LeftLowerLeg.mdl",
 22 model   MODEL_FOOT              "AREP\\Models\\Cyborg2\\Foot.mdl",
 23 model   MODEL_BIKE              "AREP\\Models\\Cyborg2\\Bike.mdl",
 30 texture TEXTURE_CYBORG_SOLDIER  "AREP\\Models\\Cyborg2\\CyborgWhite.tex",
 31 texture TEXTURE_CYBORG_SERGEANT "AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex",
 32 texture TEXTURE_CYBORG_GENERAL  "AREP\\Models\\Cyborg2\\CyborgBlack.tex",
 33 texture TEXTURE_BIKE_SOLDIER    "AREP\\Models\\Cyborg2\\BikeWhite.tex",
 34 texture TEXTURE_BIKE_SERGEANT   "AREP\\Models\\Cyborg2\\BikeOrange.tex",
 35 texture TEXTURE_BIKE_GENERAL    "AREP\\Models\\Cyborg2\\BikeBlack.tex",

// ************** REFLECTIONS **************
202 texture TEX_REFL_LIGHTMETAL01       "Models\\ReflectionTextures\\LightMetal01.tex",

// ************** SPECULAR **************
211 texture TEX_SPEC_MEDIUM             "Models\\SpecularTextures\\Medium.tex",
212 texture TEX_SPEC_STRONG             "Models\\SpecularTextures\\Strong.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE        "AREP\\Models\\Cyborg2\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT1       "AREP\\Models\\Cyborg2\\Sounds\\Sight1.wav",
 52 sound   SOUND_SIGHT2       "AREP\\Models\\Cyborg2\\Sounds\\Sight2.wav",
 53 sound   SOUND_SIGHT3       "AREP\\Models\\Cyborg2\\Sounds\\Sight3.wav",
 54 sound   SOUND_FIRE_SMALL        "AREP\\Models\\Cyborg2\\Sounds\\Fire_Small.wav",
 55 sound   SOUND_FIRE_MEDIUM        "AREP\\Models\\Cyborg2\\Sounds\\Fire_Medium.wav",
 56 sound   SOUND_DEATH       "AREP\\Models\\Cyborg2\\Sounds\\Death.wav",
 57 sound   SOUND_WALK        "AREP\\Models\\Cyborg2\\Sounds\\Walk.wav",
 58 sound   SOUND_KICK_SMALL        "AREP\\Models\\Cyborg2\\Sounds\\Kick_Small.wav",
 59 sound   SOUND_KICK_MEDIUM        "AREP\\Models\\Cyborg2\\Sounds\\Kick_Medium.wav",
 60 sound   SOUND_WOUND       "AREP\\Models\\Cyborg2\\Sounds\\Wound.wav",

 70 sound   SOUND_GENERAL_IDLE        "AREP\\Models\\Cyborg2\\Sounds\\General\\Idle.wav",
 71 sound   SOUND_GENERAL_SIGHT1       "AREP\\Models\\Cyborg2\\Sounds\\General\\Sight1.wav",
 72 sound   SOUND_GENERAL_SIGHT2       "AREP\\Models\\Cyborg2\\Sounds\\General\\Sight2.wav",
 73 sound   SOUND_GENERAL_SIGHT3       "AREP\\Models\\Cyborg2\\Sounds\\General\\Sight3.wav",
 74 sound   SOUND_GENERAL_FIRE        "AREP\\Models\\Cyborg2\\Sounds\\General\\Fire.wav",
 75 sound   SOUND_GENERAL_DEATH       "AREP\\Models\\Cyborg2\\Sounds\\General\\Death.wav",
 76 sound   SOUND_GENERAL_WALK        "AREP\\Models\\Cyborg2\\Sounds\\General\\Walk.wav",
 77 sound   SOUND_GENERAL_KICK        "AREP\\Models\\Cyborg2\\Sounds\\General\\Kick.wav",
 78 sound   SOUND_GENERAL_WOUND       "AREP\\Models\\Cyborg2\\Sounds\\General\\Wound.wav",
 
 80 sound   SOUND_HOVER       "AREP\\Models\\Cyborg2\\Sounds\\Hover_Loop.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s has been exterminated"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier,  "DataMP\\Messages\\Enemies\\AREP\\Cyborg1.txt");
    static DECLARE_CTFILENAME(fnmSergeant, "DataMP\\Messages\\Enemies\\AREP\\Cyborg2.txt");
    static DECLARE_CTFILENAME(fnmGeneral, "DataMP\\Messages\\Enemies\\AREP\\Cyborg3.txt");
    switch(m_CyChar) {
    default: ASSERT(FALSE);
    case CY_SOLDIER:   return fnmSoldier;
    case CY_SERGEANT: return fnmSergeant;
    case CY_GENERAL: return fnmGeneral;
    }
  }
  // overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }

  BOOL ForcesCannonballToExplode(void)
  {
    if (m_CyChar==CY_GENERAL) {
      return TRUE;
    }
    return CEnemyBase::ForcesCannonballToExplode();
  }

  void Precache(void) {
    CEnemyBase::Precache();

    PrecacheModel(MODEL_CYBORG);

      PrecacheSound(SOUND_IDLE );
      PrecacheSound(SOUND_SIGHT1);
      PrecacheSound(SOUND_SIGHT2);
      PrecacheSound(SOUND_SIGHT3);
      PrecacheSound(SOUND_WOUND);
      PrecacheSound(SOUND_DEATH);
      PrecacheSound(SOUND_WALK);
      PrecacheSound(SOUND_HOVER);

    if (m_CyChar==CY_SOLDIER)
    {
      PrecacheSound(SOUND_FIRE_SMALL);
      PrecacheSound(SOUND_KICK_SMALL);

    PrecacheTexture(TEXTURE_CYBORG_SOLDIER);
    PrecacheTexture(TEXTURE_BIKE_SOLDIER);

    PrecacheClass(CLASS_PROJECTILE, PRT_CYBORG_LASER);
	}

    if (m_CyChar==CY_SERGEANT)
    {
      PrecacheSound(SOUND_FIRE_MEDIUM);
      PrecacheSound(SOUND_KICK_MEDIUM);

    PrecacheTexture(TEXTURE_CYBORG_SERGEANT);
    PrecacheTexture(TEXTURE_BIKE_SERGEANT);

    PrecacheClass(CLASS_PROJECTILE, PRT_DEVIL_LASER);
	}
	
    if (m_CyChar==CY_GENERAL)
    {
      PrecacheSound(SOUND_GENERAL_IDLE );
      PrecacheSound(SOUND_GENERAL_SIGHT1);
      PrecacheSound(SOUND_GENERAL_SIGHT2);
      PrecacheSound(SOUND_GENERAL_SIGHT3);
      PrecacheSound(SOUND_GENERAL_WOUND);
      PrecacheSound(SOUND_GENERAL_DEATH);
      PrecacheSound(SOUND_GENERAL_FIRE);
      PrecacheSound(SOUND_GENERAL_WALK);
      PrecacheSound(SOUND_GENERAL_KICK);
      PrecacheSound(SOUND_GENERAL_WOUND);

    PrecacheTexture(TEXTURE_CYBORG_GENERAL);
    PrecacheTexture(TEXTURE_BIKE_GENERAL);

    PrecacheClass(CLASS_PROJECTILE, PRT_GUFFY_PROJECTILE);
	}
  };
  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_EeftType!=EFT_GROUND_ONLY) {
      return &eiCyborgFly;
    } else {
      return &eiCyborg;
    }
  };

  FLOAT GetCrushHealth(void)
  {
    if (m_CyChar==CY_GENERAL) {
      return 100.0f;
    }
    return 0.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // cyborg can't harm cyborg
    if (!IsOfClass(penInflictor, "Cyborg") ||
      ((CCyborg*)penInflictor)->m_CyChar!=m_CyChar) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  void LeaveStain(BOOL bGrow)
  {
    // cyborg doesn't leave bloody stain
  }

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    switch (IRnd()%4) {
      case 0: iAnim = CYBORG_ANIM_WOUND01; break;
      case 1: iAnim = CYBORG_ANIM_WOUND02; break;
      case 2: iAnim = CYBORG_ANIM_WOUND03; break;
      case 3: iAnim = CYBORG_ANIM_WOUND04; break;
      default: ASSERTALWAYS("Cyborg2 unknown damage");
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // virtual anim functions
  void StandingAnim(void) {
    DeactivateWalkingSound();
    if (m_EeftType!=EFT_GROUND_ONLY) {
      StartModelAnim(CYBORG_ANIM_BIKEREST, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(CYBORG_ANIM_WAIT01, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void StandingAnimFight(void)
  {
    DeactivateWalkingSound();
    if (m_EeftType!=EFT_GROUND_ONLY) {
      StartModelAnim(CYBORG_ANIM_BIKEREST, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(CYBORG_ANIM_WAIT02, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    ActivateWalkingSound();
    if (m_EeftType!=EFT_GROUND_ONLY) {
      StartModelAnim(CYBORG_ANIM_BIKEREST, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(CYBORG_ANIM_WALK01, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    WalkingAnim();
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };
  void ChangeCollisionToAir() {
    ChangeCollisionBoxIndexWhenPossible(CYBORG_COLLISION_BOX_BIKE);
  };
  void ChangeCollisionToGround() {
    ChangeCollisionBoxIndexWhenPossible(CYBORG_COLLISION_BOX_GROUND);
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, CYBORGSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    INDEX iSightSound;
    switch (IRnd()%3) {
      case 0: iSightSound = CYBORGSOUND(SIGHT1); break;
      case 1: iSightSound = CYBORGSOUND(SIGHT2); break;
      case 2: iSightSound = CYBORGSOUND(SIGHT3); break;
    }
    PlaySound(m_soSound, iSightSound, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, CYBORGSOUND(DEATH), SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, CYBORGSOUND(WOUND), SOF_3D);
  };

  // walking sounds
  void ActivateWalkingSound(void)
  {
    if (!m_bWalkSoundPlaying) {
	 if (m_EeftType!=EFT_GROUND_ONLY) {
      PlaySound(m_soFeet, SOUND_HOVER, SOF_3D|SOF_LOOP);
	  } else {
      PlaySound(m_soFeet, CYBORGSOUND(WALK), SOF_3D|SOF_LOOP);
	  }
      m_bWalkSoundPlaying = TRUE;
    }
  }
  void DeactivateWalkingSound(void)
  {
    m_soFeet.Stop();
    m_bWalkSoundPlaying = FALSE;
  };



  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soSound.Set3DParameters(120.0f, 30.0f, 1.0f, 1.0f);
    m_soFeet.Set3DParameters(50.0f, 5.0f, 1.0f, 1.0f);
    m_soFire1.Set3DParameters(120.0f, 30.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(120.0f, 30.0f, 1.0f, 1.0f);
    m_soFire3.Set3DParameters(120.0f, 30.0f, 1.0f, 1.0f);
    m_soFire4.Set3DParameters(120.0f, 30.0f, 1.0f, 1.0f);
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  // spawn body parts
  void BlowUp(void) {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.5f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);
    Debris_Begin(EIBT_ROBOT, DPT_NONE, BET_NONE, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);

    if (m_CyChar == CY_SOLDIER) {

    // spawn debris
    
    Debris_Spawn(this, this, MODEL_ASS, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TORSO, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_STRONG, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_UPPER_ARM, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_LOWER_ARM, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_UPPER_ARM, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_LOWER_ARM, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_UPPER_LEG, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_LOWER_LEG, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_UPPER_LEG, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_LOWER_LEG, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_FOOT, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_FOOT, TEXTURE_CYBORG_SOLDIER,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	}

    if (m_CyChar == CY_SERGEANT) {

    // spawn debris
    
    Debris_Spawn(this, this, MODEL_ASS, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TORSO, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_STRONG, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_UPPER_ARM, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_LOWER_ARM, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_UPPER_ARM, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_LOWER_ARM, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_UPPER_LEG, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_LOWER_LEG, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_UPPER_LEG, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_LOWER_LEG, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_FOOT, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_FOOT, TEXTURE_CYBORG_SERGEANT,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	}

    if (m_CyChar == CY_GENERAL) {

    // spawn debris
    
    Debris_Spawn(this, this, MODEL_ASS, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TORSO, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_STRONG, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_UPPER_ARM, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_LOWER_ARM, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_UPPER_ARM, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_LOWER_ARM, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_UPPER_LEG, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_RIGHT_LOWER_LEG, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_UPPER_LEG, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEFT_LOWER_LEG, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_FOOT, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_FOOT, TEXTURE_CYBORG_GENERAL,  TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0,
      0, 0.0f, FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	}

    // inflict damage
    FLOAT3D vSource;
    GetEntityInfoPosition(this, eiCyborg.vTargetCenter, vSource);
      InflictDirectDamage(this, this, DMT_EXPLOSION, 100.0f, vSource, 
        -en_vGravityDir);
      if (m_CyChar == CY_SOLDIER) {
      InflictRangeDamage(this, DMT_EXPLOSION, 15.0f, vSource, 1.0f, 6.0f);
      } else if (m_CyChar == CY_SERGEANT) {
      InflictRangeDamage(this, DMT_EXPLOSION, 30.0f, vSource, 1.0f, 12.0f);
      } else  {
      InflictRangeDamage(this, DMT_EXPLOSION, 60.0f, vSource, 1.0f, 24.0f);
      }
    
    // spawn explosion
    CPlacement3D plExplosion = GetPlacement();
    CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_GRENADE;
    FLOAT fSize = fEntitySize*0.75f;
    eSpawnEffect.vStretch = FLOAT3D(fSize,fSize,fSize);
    penExplosion->Initialize(eSpawnEffect);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };

/************************************************************
 *                     MOVING FUNCTIONS                     *
 ************************************************************/
  // check whether may move while attacking
  BOOL MayMoveToAttack(void) 
  {
    if (m_bInAir) {
      return WouldNotLeaveAttackRadius();
    } else {
      return CEnemyBase::MayMoveToAttack();
    }
  }

  // must be more relaxed about hitting then usual enemies
  BOOL CanHitEnemy(CEntity *penTarget, FLOAT fCosAngle) {
    if (IsInPlaneFrustum(penTarget, fCosAngle)) {
      return IsVisibleCheckAll(penTarget);
    }
    return FALSE;
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  FlyHit(EVoid) : CEnemyFly::FlyHit {
  
    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.1f;
    return EReturn();
  };

  FlyFire(EVoid) : CEnemyFly::FlyFire {
					
    DeactivateWalkingSound();

    if (m_CyChar==CY_GENERAL) {
       ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire1, SOUND_GENERAL_FIRE, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire2, SOUND_GENERAL_FIRE, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire3, SOUND_GENERAL_FIRE, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire4, SOUND_GENERAL_FIRE, SOF_3D);
       autowait(0.25f);
    }
    if (m_CyChar==CY_SERGEANT) {
       ShootProjectile(PRT_DEVIL_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire1, SOUND_FIRE_MEDIUM, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_DEVIL_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire2, SOUND_FIRE_MEDIUM, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_DEVIL_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire3, SOUND_FIRE_MEDIUM, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_DEVIL_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire4, SOUND_FIRE_MEDIUM, SOF_3D);
       autowait(0.25f);
    }
    if (m_CyChar==CY_SOLDIER) {
       ShootProjectile(PRT_CYBORG_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire1, SOUND_FIRE_SMALL, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_CYBORG_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire2, SOUND_FIRE_SMALL, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_CYBORG_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire3, SOUND_FIRE_SMALL, SOF_3D);
       autowait(0.25f);
       ShootProjectile(PRT_CYBORG_LASER, FIRE_BIKE*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
       PlaySound(m_soFire4, SOUND_FIRE_SMALL, SOF_3D);
       autowait(0.25f);
    }

    MaybeSwitchToAnotherPlayer();
    ActivateWalkingSound();

    return EReturn();
  };
 

  GroundFire(EVoid) : CEnemyFly::GroundFire {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(CYBORG_ANIM_TOFIRE, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(CYBORG_ANIM_TOFIRE);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    if (m_CyChar==CY_GENERAL) {
      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_iLoopCounter = 2;
      } else {
        m_iLoopCounter = 4;
      }
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(CYBORG_ANIM_FIRE02, AOF_LOOPING);
          ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_LEFT_ARM*SIZE_GENERAL, ANGLE3D(0, 0, 0));
        } else {
          StartModelAnim(CYBORG_ANIM_FIRE01, AOF_LOOPING);
          ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_RIGHT_ARM*SIZE_GENERAL, ANGLE3D(0, 0, 0));
        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_GENERAL_FIRE, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_GENERAL_FIRE, SOF_3D);
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_GENERAL_FIRE, SOF_3D);
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_GENERAL_FIRE, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 1.0f;
          } else {
            m_fLockOnEnemyTime = 0.5f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
    }
    if (m_CyChar==CY_SERGEANT) {
      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_iLoopCounter = 2;
      } else {
        m_iLoopCounter = 4;
      }
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(CYBORG_ANIM_FIRE02, AOF_LOOPING);
          ShootProjectile(PRT_DEVIL_LASER, FIRE_LEFT_ARM*SIZE_SERGEANT, ANGLE3D(0, 0, 0));
        } else {
          StartModelAnim(CYBORG_ANIM_FIRE01, AOF_LOOPING);
          ShootProjectile(PRT_DEVIL_LASER, FIRE_RIGHT_ARM*SIZE_SERGEANT, ANGLE3D(0, 0, 0));
        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_FIRE_MEDIUM, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_FIRE_MEDIUM, SOF_3D);
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_FIRE_MEDIUM, SOF_3D);
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_FIRE_MEDIUM, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 1.0f;
          } else {
            m_fLockOnEnemyTime = 0.5f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
    }
    if (m_CyChar==CY_SOLDIER) {
      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_iLoopCounter = 2;
      } else {
        m_iLoopCounter = 4;
      }
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(CYBORG_ANIM_FIRE02, AOF_LOOPING);
          ShootProjectile(PRT_CYBORG_LASER, FIRE_LEFT_ARM*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
        } else {
          StartModelAnim(CYBORG_ANIM_FIRE01, AOF_LOOPING);
          ShootProjectile(PRT_CYBORG_LASER, FIRE_RIGHT_ARM*SIZE_SOLDIER, ANGLE3D(0, 0, 0));
        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_FIRE_SMALL, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_FIRE_SMALL, SOF_3D);
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_FIRE_SMALL, SOF_3D);
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_FIRE_SMALL, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 1.0f;
          } else {
            m_fLockOnEnemyTime = 0.5f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
    }
    StopMoving();

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(CYBORG_ANIM_FROMFIRE, 0);
    autowait(GetModelObject()->GetAnimLength(CYBORG_ANIM_FROMFIRE));

    // wait for a while
    StandingAnimFight();
    autowait(FRnd()*0.1f+0.1f);

    return EReturn();
  };

  GroundHit(EVoid) : CEnemyFly::GroundHit {
    // close attack
    m_iCloseHit = IRnd()&1;
    if (m_iCloseHit==0) {
      StartModelAnim(CYBORG_ANIM_ATTACKCLOSE01, 0);
    } else {
      StartModelAnim(CYBORG_ANIM_ATTACKCLOSE02, 0);
    }

      if (m_CyChar == CY_SOLDIER) {
         PlaySound(m_soSound, SOUND_KICK_SMALL, SOF_3D); }
      if (m_CyChar == CY_SERGEANT) {
         PlaySound(m_soSound, SOUND_KICK_MEDIUM, SOF_3D); }
      if (m_CyChar == CY_GENERAL) {
         PlaySound(m_soSound, SOUND_GENERAL_KICK, SOF_3D); }
    autowait(1.0f);
    if (CalcDist(m_penEnemy)<m_fCloseDistance) {
      // damage enemy
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_CyChar == CY_SOLDIER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_CyChar == CY_SERGEANT) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 40.0f, FLOAT3D(0, 0, 0), vDirection);
      } else  {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 80.0f, FLOAT3D(0, 0, 0), vDirection);
      }
      // push target left/right
      FLOAT3D vSpeed;
      if (m_iCloseHit==0) {
        GetHeadingDirection(AngleDeg(90.0f), vSpeed);
      } else {
        GetHeadingDirection(AngleDeg(-90.0f), vSpeed);
      }
      vSpeed = vSpeed * 30.0f;
      KickEntity(m_penEnemy, vSpeed);
    }

    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    // stop moving
    StopMoving();
    DeathSound();     // death sound
    DeactivateWalkingSound();

    // set physic flags
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags() | ENF_SEETHROUGH);

    // death notify (change collision box)
    ChangeCollisionBoxIndexWhenPossible(CYBORG_COLLISION_BOX_DEATH);

    // start death anim
    StartModelAnim(CYBORG_ANIM_DEATH01, 0);
    autowait(0.9f);

    return EEnd();
  };

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
      if (m_EeftType!=EFT_FLY_ONLY) {
      m_EeftType=EFT_GROUND_ONLY;
    }
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    if (m_CyChar==CY_GENERAL) {
      SetHealth(600.0f);
      m_fMaxHealth = 600.0f;
    } else if (m_CyChar==CY_SERGEANT) {
      SetHealth(175.0f);
      m_fMaxHealth = 175.0f;
    } else {
      SetHealth(70.0f);
      m_fMaxHealth = 70.0f;
    }
    en_fDensity = 5000.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;

    // set your appearance
    SetModel(MODEL_CYBORG);
    if (m_CyChar==CY_GENERAL) {
      SetModelMainTexture(TEXTURE_CYBORG_GENERAL);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_ASS,
      MODEL_ASS, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_TORSO,
      MODEL_TORSO, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_STRONG, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_HEAD,
      MODEL_HEAD, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTUPPERARM,
      MODEL_RIGHT_UPPER_ARM, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTLOWERARM,
      MODEL_RIGHT_LOWER_ARM, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTUPPERARM,
      MODEL_LEFT_UPPER_ARM, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTLOWERARM,
      MODEL_LEFT_LOWER_ARM, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTUPPERLEG,
      MODEL_RIGHT_UPPER_LEG, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTLOWERLEG,
      MODEL_RIGHT_LOWER_LEG, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTUPPERLEG,
      MODEL_LEFT_UPPER_LEG, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTLOWERLEG,
      MODEL_LEFT_LOWER_LEG, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_FOOTRIGHT,
      MODEL_FOOT, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_FOOTLEFT,
      MODEL_FOOT, TEXTURE_CYBORG_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    if (m_EeftType!=EFT_GROUND_ONLY) {
      AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_BIKE,
        MODEL_BIKE, TEXTURE_BIKE_GENERAL, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
        ChangeCollisionToAir();
        SetPhysicsFlags(EPF_MODEL_FLYING);
		}
      GetModelObject()->StretchModel(FLOAT3D(3,3,3));
      ModelChangeNotify();
      m_fBlowUpAmount = 1.0f;
	             m_fBlowUpSize = 3.0f;
    if (m_EeftType!=EFT_GROUND_ONLY) {
         m_iScore = 8000;
		 } else {
         m_iScore = 6000;
		 }
      m_fThreatDistance = 15;
    if (m_EeftType!=EFT_GROUND_ONLY) {
         m_fDamageWounded = 500000.0f;
		 } else {
         m_fDamageWounded = 250.0f;
		 }
      m_fCloseDistance = 8.0f;
      m_fStopDistance = 30.0f;
      m_fWalkSpeed = FRnd()*1.0f + 7.0f;
      m_fFlyWalkSpeed = FRnd()*1.0f + 25.0f;
      m_fFlyStopDistance = 30.0f;
    } else if (m_CyChar==CY_SERGEANT) {
      SetModelMainTexture(TEXTURE_CYBORG_SERGEANT);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_ASS,
      MODEL_ASS, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_TORSO,
      MODEL_TORSO, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_STRONG, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_HEAD,
      MODEL_HEAD, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTUPPERARM,
      MODEL_RIGHT_UPPER_ARM, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTLOWERARM,
      MODEL_RIGHT_LOWER_ARM, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTUPPERARM,
      MODEL_LEFT_UPPER_ARM, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTLOWERARM,
      MODEL_LEFT_LOWER_ARM, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTUPPERLEG,
      MODEL_RIGHT_UPPER_LEG, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTLOWERLEG,
      MODEL_RIGHT_LOWER_LEG, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTUPPERLEG,
      MODEL_LEFT_UPPER_LEG, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTLOWERLEG,
      MODEL_LEFT_LOWER_LEG, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_FOOTRIGHT,
      MODEL_FOOT, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_FOOTLEFT,
      MODEL_FOOT, TEXTURE_CYBORG_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    if (m_EeftType!=EFT_GROUND_ONLY) {
      AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_BIKE,
        MODEL_BIKE, TEXTURE_BIKE_SERGEANT, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
        ChangeCollisionToAir();
        SetPhysicsFlags(EPF_MODEL_FLYING);
		}
      GetModelObject()->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
      ModelChangeNotify();
      m_fBlowUpAmount = 1.0f;
	             m_fBlowUpSize = 2.0f;
    if (m_EeftType!=EFT_GROUND_ONLY) {
         m_iScore = 4000;
		 } else {
         m_iScore = 3000;
		 }
      m_fThreatDistance = 5;
    if (m_EeftType!=EFT_GROUND_ONLY) {
         m_fDamageWounded = 500000.0f;
		 } else {
         m_fDamageWounded = 150.0f;
		 }
      m_fCloseDistance = 5.0f;
      m_fStopDistance = 15.0f;
      m_fWalkSpeed = FRnd()*2.0f + 5.0f;
      m_fFlyWalkSpeed = FRnd()*2.0f + 20.0f;
      m_fFlyStopDistance = 15.0f;
    } else {
      SetModelMainTexture(TEXTURE_CYBORG_SOLDIER);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_ASS,
      MODEL_ASS, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_TORSO,
      MODEL_TORSO, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_STRONG, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_HEAD,
      MODEL_HEAD, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTUPPERARM,
      MODEL_RIGHT_UPPER_ARM, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTLOWERARM,
      MODEL_RIGHT_LOWER_ARM, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTUPPERARM,
      MODEL_LEFT_UPPER_ARM, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTLOWERARM,
      MODEL_LEFT_LOWER_ARM, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTUPPERLEG,
      MODEL_RIGHT_UPPER_LEG, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_RIGHTLOWERLEG,
      MODEL_RIGHT_LOWER_LEG, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTUPPERLEG,
      MODEL_LEFT_UPPER_LEG, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_LEFTLOWERLEG,
      MODEL_LEFT_LOWER_LEG, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_FOOTRIGHT,
      MODEL_FOOT, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_FOOTLEFT,
      MODEL_FOOT, TEXTURE_CYBORG_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    if (m_EeftType!=EFT_GROUND_ONLY) {
      AddAttachmentToModel(this, *GetModelObject(), CYBORG_ATTACHMENT_BIKE,
        MODEL_BIKE, TEXTURE_BIKE_SOLDIER, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
        ChangeCollisionToAir();
        SetPhysicsFlags(EPF_MODEL_FLYING);
		}
      GetModelObject()->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
      ModelChangeNotify();
      m_fBlowUpAmount = 1.0f;
	             m_fBlowUpSize = 1.0f;
    if (m_EeftType!=EFT_GROUND_ONLY) {
         m_iScore = 2000;
		 } else {
         m_iScore = 1000;
		 }
      m_fThreatDistance = 5;
    if (m_EeftType!=EFT_GROUND_ONLY) {
         m_fDamageWounded = 500000.0f;
		 } else {
         m_fDamageWounded = 50.0f;
		 }
      m_fCloseDistance = 3.0f;
      m_fStopDistance = 3.0f;
      m_fWalkSpeed = FRnd()*2.0f + 5.0f;
      m_fFlyWalkSpeed = FRnd()*2.0f + 15.0f;
      m_fFlyStopDistance = 3.0f;
    }
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    StandingAnim();
    // setup moving speed
    m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
    m_fAttackRunSpeed = m_fWalkSpeed;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2;
    m_fCloseRunSpeed = m_fWalkSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2;
    // setup attack distances
    m_fAttackDistance = 800.0f;
    m_fAttackFireTime = 6.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 300.0f;
    // fly moving properties
    m_aFlyWalkRotateSpeed = AngleDeg(FRnd()*50 + 100.0f);
    m_fFlyAttackRunSpeed = m_fFlyWalkSpeed;
    m_aFlyAttackRotateSpeed = m_aFlyWalkRotateSpeed;
    m_fFlyCloseRunSpeed = m_fFlyWalkSpeed;
    m_aFlyCloseRotateSpeed = m_aFlyWalkRotateSpeed;
    m_fGroundToAirSpeed = m_fFlyCloseRunSpeed;
    m_fAirToGroundSpeed = m_fFlyCloseRunSpeed;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 800.0f;
    m_fFlyCloseDistance = 0.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 3.0f;
    m_fFlyIgnoreRange = 300.0f;

    // damage/explode properties
    m_fBodyParts = 13;

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
	}
  };

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

323
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Enemies/Eyeman/Eyeman.h"
#include "ModelsF/Enemies/BuffGnaar/BuffGnaar.h"
%}

uses "EntitiesMP/EnemyFly";

enum EyemanChar {
  0 EYC_B   "Brute",    // brute
  1 EYC_X   "Boomer",    // boomer
  2 EYC_P   "Belcher",   // belcher
  3 EYC_SOLDIER   "Male",    // male
  4 EYC_SERGEANT  "Female",   // female
};

enum EyemanEnv {
  0 EYE_NORMAL    "Normal",
  1 EYE_LAVA      "Lava",
  2 EYE_SNOW      "Snow",
};

%{
// info structure
static EntityInfo eiEyemanBig = {
  EIBT_FLESH, 140.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiEyemanSmall = {
  EIBT_FLESH, 120.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiEyemanBrute = {
  EIBT_FLESH, 1000.0f,
  0.0f, 1.55f, 0.0f,
  0.0f, 1.15f, 0.0f,
};
static EntityInfo eiEyemanBoom = {
  EIBT_FLESH, 120.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiEyemanPuke = {
  EIBT_FLESH, 140.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};

#define BITE_AIR    4.0f
#define HIT_GROUND  3.0f
#define FIRE_GROUND   FLOAT3D(0.75f, 1.5f, -1.25f)
#define HIT_BRUTE  5.0f

#define EYSOUND(soundname) ((m_EecChar==EYC_B)? (SOUND_BUFF_##soundname) : (SOUND_##soundname))
%}


class CEyeman : CEnemyFly {
name      "Eyeman";
thumbnail "Thumbnails\\Eyeman.tbn";

properties:
  1 enum EyemanChar m_EecChar "Character" 'C' = EYC_SOLDIER,      // character
  2 BOOL m_bInvisible "Invisible" 'I'=FALSE,
  3 enum EyemanEnv m_eeEnv "Environment" 'E' = EYE_NORMAL,
  4 BOOL m_bMumbleSoundPlaying = FALSE,
  5 CSoundObject m_soMumble,
  6 BOOL m_bExploded = FALSE,
  7 INDEX   m_fgibTexture = TEXTURE_EYEMAN_SOLDIER,
  8 CSoundObject m_soFlesh,

  10 INDEX   m_fgibArm = MODEL_EYEMAN_ARM,
  11 INDEX   m_fgibLeg = MODEL_EYEMAN_LEG,
  12 INDEX   m_fgibForehead = MODEL_EYEMAN_FOREHEAD,
  13 INDEX   m_fgibJaw = MODEL_EYEMAN_JAW,

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_EYEMAN      "Models\\Enemies\\Eyeman\\Eyeman.mdl",
  2 texture TEXTURE_EYEMAN_BRUTE    "ModelsF\\Enemies\\BuffGnaar\\EyemanBrute.tex",
  3 texture TEXTURE_EYEMAN_BOOM   "AREP\\Models\\EyemanBrute\\EyemanBlue.tex",
  5 texture TEXTURE_EYEMAN_LAVA   "AREP\\Models\\EyemanBrute\\EyemanLava.tex",
  7 texture TEXTURE_EYEMAN_PUKE   "AREP\\Models\\EyemanBrute\\EyemanPuke.tex",
  8 texture TEXTURE_EYEMAN_SNOWF   "AREP\\Models\\EyemanBrute\\EyemanSnowF.tex",
  9 texture TEXTURE_EYEMAN_SNOWM   "AREP\\Models\\EyemanBrute\\EyemanSnowM.tex",
 10 texture TEXTURE_EYEMAN_SOLDIER    "Models\\Enemies\\Eyeman\\Eyeman4.tex",
 11 texture TEXTURE_EYEMAN_SERGEANT   "Models\\Enemies\\Eyeman\\Eyeman5.tex",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
  6 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  
 12 model   MODEL_BUFF      "ModelsF\\Enemies\\BuffGnaar\\BuffGnaar.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "Models\\Enemies\\Eyeman\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "Models\\Enemies\\Eyeman\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "Models\\Enemies\\Eyeman\\Sounds\\Wound.wav",
 53 sound   SOUND_BITE      "Models\\Enemies\\Eyeman\\Sounds\\Bite.wav",
 54 sound   SOUND_PUNCH     "Models\\Enemies\\Eyeman\\Sounds\\Punch.wav",
 55 sound   SOUND_DEATH     "Models\\Enemies\\Eyeman\\Sounds\\Death.wav",
 56 sound   SOUND_MUMBLE    "Models\\Enemies\\Eyeman\\Sounds\\Mumble.wav",
 57 sound   SOUND_PUKE    "AREP\\Models\\EyemanBrute\\Sounds\\Puke.wav",

 58 sound   SOUND_MORPH    "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Morph.wav",
 
 80 sound   SOUND_BUFF_IDLE      "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Idle.wav",
 81 sound   SOUND_BUFF_SIGHT     "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Sight.wav",
 82 sound   SOUND_BUFF_WOUND     "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Wound.wav",
 83 sound   SOUND_BUFF_BITE      "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Bite.wav",
 84 sound   SOUND_BUFF_PUNCH     "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Punch.wav",
 85 sound   SOUND_BUFF_DEATH     "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Death.wav",
 86 sound   SOUND_BUFF_MUMBLE    "ModelsF\\Enemies\\BuffGnaar\\Sounds\\Mumble.wav",

// ************** DEBRIS **************

 60 model   MODEL_EYEMAN_ARM   "ModelsF\\Enemies\\Eyeman\\Debris\\Arm.mdl",
 62 model   MODEL_EYEMAN_LEG   "ModelsF\\Enemies\\Eyeman\\Debris\\Leg.mdl",

 63 model   MODEL_EYEMAN_FOREHEAD   "ModelsF\\Enemies\\Eyeman\\Debris\\Forehead.mdl",
 64 model   MODEL_EYEMAN_JAW   "ModelsF\\Enemies\\Eyeman\\Debris\\Jaw.mdl",

 70 model   MODEL_BUFF_ARM   "ModelsF\\Enemies\\BuffGnaar\\Debris\\Arm.mdl",
 72 model   MODEL_BUFF_LEG   "ModelsF\\Enemies\\BuffGnaar\\Debris\\Leg.mdl",

 73 model   MODEL_BUFF_FOREHEAD   "ModelsF\\Enemies\\BuffGnaar\\Debris\\Forehead.mdl",
 74 model   MODEL_BUFF_JAW   "ModelsF\\Enemies\\BuffGnaar\\Debris\\Jaw.mdl",

 65 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 66 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (m_bInAir) {
      str.PrintF(TRANSV("A Gnaar devoured %s"), (const char *) strPlayerName);
    } else {
      str.PrintF(TRANSV("%s was crushed by a Gnaar"), (const char *) strPlayerName);
    }
    return str;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_BITE );
    PrecacheSound(SOUND_PUNCH);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_MUMBLE);
    PrecacheSound(SOUND_PUKE);

    PrecacheSound(SOUND_MORPH);

    PrecacheSound(SOUND_BUFF_IDLE );
    PrecacheSound(SOUND_BUFF_SIGHT);
    PrecacheSound(SOUND_BUFF_WOUND);
    PrecacheSound(SOUND_BUFF_BITE );
    PrecacheSound(SOUND_BUFF_PUNCH);
    PrecacheSound(SOUND_BUFF_DEATH);
    PrecacheSound(SOUND_BUFF_MUMBLE);

    PrecacheClass(CLASS_PROJECTILE, PRT_EYEMAN_ACID);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
    PrecacheModel(MODEL_EYEMAN_ARM);
    PrecacheModel(MODEL_EYEMAN_LEG);
    PrecacheModel(MODEL_EYEMAN_FOREHEAD);
    PrecacheModel(MODEL_EYEMAN_JAW);
    PrecacheModel(MODEL_BUFF_ARM);
    PrecacheModel(MODEL_BUFF_LEG);
    PrecacheModel(MODEL_BUFF_FOREHEAD);
    PrecacheModel(MODEL_BUFF_JAW);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_EecChar==EYC_B) {
      return &eiEyemanBrute;
    } if (m_EecChar==EYC_X) {
      return &eiEyemanBoom;
    } if (m_EecChar==EYC_P) {
      return &eiEyemanPuke;
    } if (m_EecChar==EYC_SOLDIER) {
      return &eiEyemanSmall;
    } if (m_EecChar==EYC_SERGEANT) {
      return &eiEyemanBig;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // eyeman can't harm eyeman
    if (!IsOfClass(penInflictor, "Eyeman")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
      // if died of chainsaw
      if (dmtType==DMT_CHAINSAW && GetHealth()<=0) {
        // must always blowup
        m_fBlowUpAmount = 0;
      }
    }
  };

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    CEnemyBase::FillEntityStatistics(pes);
    switch(m_EecChar) {
    case EYC_B: { pes->es_strName+=" Brute"; } break;
    case EYC_X : { pes->es_strName+=" Boomer"; } break;
    case EYC_SERGEANT: { pes->es_strName+=" Female"; } break;
    case EYC_SOLDIER : { pes->es_strName+=" Male"; } break;
    }
    if (m_bInvisible) {
      pes->es_strName+=" Invisible";
    }
    return TRUE;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmBrute, "DataMP\\Messages\\Enemies\\AREP\\EyemanBruteFinal.txt");
    static DECLARE_CTFILENAME(fnmBoom, "DataMP\\Messages\\Enemies\\AREP\\EyemanBoom.txt");
    static DECLARE_CTFILENAME(fnmPuke, "DataMP\\Messages\\Enemies\\AREP\\EyemanPuke.txt");
    static DECLARE_CTFILENAME(fnmSergeant, "Data\\Messages\\Enemies\\EyemanGreen.txt");
    static DECLARE_CTFILENAME(fnmSoldier , "Data\\Messages\\Enemies\\EyemanPurple.txt");
    switch(m_EecChar) {
    default: ASSERT(FALSE);
    case EYC_B: return fnmBrute;
    case EYC_X: return fnmBoom;
    case EYC_P: return fnmPuke;
    case EYC_SERGEANT: return fnmSergeant;
    case EYC_SOLDIER : return fnmSoldier;
    }
  };
  /* Adjust model shading parameters if needed. */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    // no shadows for invisibles
    if (m_bInvisible) {
      colAmbient = C_WHITE;
      return FALSE;
    } else {
      return CEnemyBase::AdjustShadingParameters(vLightDirection, colLight, colAmbient);
    }
  }

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateMumblingSound();
    INDEX iAnim;
    if (m_bInAir) {
      switch (IRnd()%2) {
        case 0: iAnim = EYEMAN_ANIM_MORPHWOUND01; break;
        case 1: iAnim = EYEMAN_ANIM_MORPHWOUND02; break;
        default: iAnim = EYEMAN_ANIM_MORPHWOUND01; //ASSERTALWAYS("Eyeman unknown fly damage");
      }
    } else {
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
      if (Abs(fDamageDir)<=10) {
        switch (IRnd()%3) {
          case 0: iAnim = EYEMAN_ANIM_WOUND03; break;
          case 1: iAnim = EYEMAN_ANIM_WOUND06; break;
          case 2: iAnim = EYEMAN_ANIM_WOUND07; break;
          default: iAnim = EYEMAN_ANIM_WOUND03;
        }
      } else {
        if (fDamageDir<0) {
          iAnim = EYEMAN_ANIM_FALL01;
        } else {
          iAnim = EYEMAN_ANIM_FALL02;
        }
      }
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    DeactivateMumblingSound();
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = EYEMAN_ANIM_MORPHDEATH;
    } else {
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
      if (fDamageDir<0) {
        iAnim = EYEMAN_ANIM_DEATH02;
      } else {
        iAnim = EYEMAN_ANIM_DEATH01;
      }
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==EYEMAN_ANIM_DEATH01)
    {
      vStretch=FLOAT3D(1,1,1)*0.75f;
      return 0.5f;
    }
    else if(GetModelObject()->GetAnim()==EYEMAN_ANIM_DEATH02)
    {
      vStretch=FLOAT3D(1,1,1)*0.75f;
      return 0.5f;
    }
    else if(GetModelObject()->GetAnim()==EYEMAN_ANIM_MORPHDEATH)
    {
      vStretch=FLOAT3D(1,1,1)*1.0f;
      return 0.5f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(EYEMAN_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // mumbling sounds
  void ActivateMumblingSound(void)
  {
    if (!m_bMumbleSoundPlaying) {
      PlaySound(m_soMumble, EYSOUND(MUMBLE), SOF_3D|SOF_LOOP);
      m_bMumbleSoundPlaying = TRUE;
    }
  }
  void DeactivateMumblingSound(void)
  {
    m_soMumble.Stop();
    m_bMumbleSoundPlaying = FALSE;
  }

  // virtual anim functions
  void StandingAnim(void) {
    DeactivateMumblingSound();
    if (m_bInAir) {
      StartModelAnim(EYEMAN_ANIM_MORPHATTACKFLY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(EYEMAN_ANIM_STAND, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    ActivateMumblingSound();
    if (m_bInAir) {
      StartModelAnim(EYEMAN_ANIM_MORPHATTACKFLY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(EYEMAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    ActivateMumblingSound();
    if (m_bInAir) {
      StartModelAnim(EYEMAN_ANIM_MORPHATTACKFLY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(EYEMAN_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(EYEMAN_ANIM_MORPHATTACKFLY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(EYEMAN_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  FLOAT AirToGroundAnim(void) {
    PlaySound(m_soFlesh, SOUND_MORPH, SOF_3D);
    StartModelAnim(EYEMAN_ANIM_MORPHUP, 0);
    return(GetModelObject()->GetAnimLength(EYEMAN_ANIM_MORPHUP));
  };
  FLOAT GroundToAirAnim(void) {
    PlaySound(m_soFlesh, SOUND_MORPH, SOF_3D);
    StartModelAnim(EYEMAN_ANIM_MORPHDOWN, 0);
    return(GetModelObject()->GetAnimLength(EYEMAN_ANIM_MORPHDOWN));
  };
  void ChangeCollisionToAir() {
    ChangeCollisionBoxIndexWhenPossible(EYEMAN_COLLISION_BOX_AIR);
  };
  void ChangeCollisionToGround() {
    ChangeCollisionBoxIndexWhenPossible(EYEMAN_COLLISION_BOX_GROUND);
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, EYSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, EYSOUND(SIGHT), SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, EYSOUND(WOUND), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, EYSOUND(DEATH), SOF_3D);
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  void BlowUpNotify(void) {
    if (m_EecChar==EYC_X ) {
      Explode();
    }
  };
  void Explode(void) {
    if (!m_bExploded) {
      m_bExploded = TRUE;

      // inflict damage
      if (m_EecChar==EYC_X) {
        FLOAT3D vSource;
        GetEntityInfoPosition(this, eiEyemanBoom.vTargetCenter, vSource);
        InflictDirectDamage(this, this, DMT_EXPLOSION, 1000.0f, vSource, 
          -en_vGravityDir);
        InflictRangeDamage(this, DMT_EXPLOSION, 20.0f, vSource, 1.0f, 6.0f);
      }

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_BOMB;
      eSpawnEffect.vStretch = FLOAT3D(1.0f,1.0f,1.0f);
      penExplosion->Initialize(eSpawnEffect);

      // explosion debris
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionDebris->Initialize(eSpawnEffect);

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionSmoke->Initialize(eSpawnEffect);
	  
      CEnemyBase::BlowUp();
    }
  };

  // spawn body parts
  void BlowUp(void) {
    if (m_EecChar==EYC_X) {
      Explode();
    }
	else {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();
	FLOAT fDebrisSize = 0.0f;

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
	
   if (m_EeftType == EFT_GROUND_ONLY) {
    
    Debris_Spawn(this, this, m_fgibArm, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibArm, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibLeg, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibLeg, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }
		} else if (m_EeftType == EFT_FLY_ONLY) {
    
    Debris_Spawn(this, this, m_fgibForehead, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibJaw, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }
		} else if (m_EeftType == EFT_FLY_GROUND_GROUND || m_EeftType == EFT_FLY_GROUND_AIR || m_EeftType == EFT_FLY_AIR_GROUND || m_EeftType == EFT_FLY_AIR_AIR) {

	  if (m_bInAir) {
    
    Debris_Spawn(this, this, m_fgibForehead, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibJaw, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }
		} else {
    
    Debris_Spawn(this, this, m_fgibArm, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibArm, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibLeg, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, m_fgibLeg, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }
		  }
		}

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLESH_SPLAT_FX;
      penSplat->Initialize(ese);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  }
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
    if (CalcDist(m_penEnemy) > BITE_AIR) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn();
    }
    StartModelAnim(EYEMAN_ANIM_MORPHATTACK, 0);
    StopMoving();
    PlaySound(m_soSound, EYSOUND(BITE), SOF_3D);
    // damage enemy
    autowait(0.4f);
    // damage enemy
    if (CalcDist(m_penEnemy) < BITE_AIR) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      if (m_EecChar==EYC_B) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 40.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_X) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 6.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_P) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_SERGEANT) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_SOLDIER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
		}
      // spawn blood cloud
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_BLOODEXPLODE;
      eSpawnEffect.vStretch = FLOAT3D(1,1,1);
      CPlacement3D plOne = GetPlacement();
      GetEntityPointRatio(
        FLOAT3D(Lerp(-0.2f, +0.2f, FRnd()), Lerp(-0.2f, +0.2f, FRnd()), -1.0f),
        plOne.pl_PositionVector);
      CEntityPointer penBloodCloud = CreateEntity( plOne, CLASS_BASIC_EFFECT);
      penBloodCloud->Initialize( eSpawnEffect);
    }
    autowait(0.24f);

    StandingAnim();
    return EReturn();
  };

  GroundHit(EVoid) : CEnemyFly::GroundHit {
    if (m_EecChar==EYC_B) {
     if (CalcDist(m_penEnemy) > HIT_BRUTE) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn(); }
    } else {
     if (CalcDist(m_penEnemy) > HIT_GROUND) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn(); }
    }
    if (m_EecChar==EYC_B) {
      StartModelAnim(BUFFGNAAR_ANIM_ATTACK03, 0); }
    else {
      StartModelAnim(EYEMAN_ANIM_ATTACK02, 0); }
    StopMoving();
    // damage enemy
    autowait(0.2f);
    // damage enemy
    if (CalcDist(m_penEnemy) < HIT_GROUND) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      if (m_EecChar==EYC_B) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_X) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 3.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_P) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 5.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_SERGEANT) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_SOLDIER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 5.0f, FLOAT3D(0, 0, 0), vDirection);
		}
      PlaySound(m_soSound, EYSOUND(PUNCH), SOF_3D);
    }
    autowait(0.3f);
    // damage enemy
    if (CalcDist(m_penEnemy) < HIT_GROUND) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      if (m_EecChar==EYC_B) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_X) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 3.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_P) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 5.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_SERGEANT) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
		} if (m_EecChar==EYC_SOLDIER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 5.0f, FLOAT3D(0, 0, 0), vDirection);
		}
      PlaySound(m_soSound, EYSOUND(PUNCH), SOF_3D);
    }
    autowait(0.4f);

    StandingAnim();
    return EReturn();
  };

  FlyFire(EVoid) : CEnemyFly::FlyFire {
    if (m_EecChar!=EYC_P) { return EReturn(); }

    // fire projectile
    StartModelAnim(EYEMAN_ANIM_MORPHWOUND02, 0);
    ShootProjectile(PRT_EYEMAN_ACID, FLOAT3D(0.0f, 0.0f, 0.0f), ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_PUKE, SOF_3D);
    autowait(0.6f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };

  GroundFire(EVoid) : CEnemyFly::GroundFire {
    if (m_EecChar!=EYC_P) { return EReturn(); }

    // fire projectile
    StartModelAnim(EYEMAN_ANIM_WOUND06, 0);
    ShootProjectile(PRT_EYEMAN_ACID, FLOAT3D(0.0f, 1.3f, 0.0f), ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_PUKE, SOF_3D);
    autowait(0.6f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    autocall CEnemyBase::Death() EEnd;
    if (m_EecChar==EYC_X) {
      Explode();
    }
    return EEnd();
  };

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    if (m_EecChar==EYC_B) {
      SetHealth(250.0f);
      m_fMaxHealth = 250.0f;
      // damage/explode properties
      m_fBlowUpAmount = 300.0f;
      m_fBodyParts = 5;
      m_fBlowUpSize = 3.4f;
      m_fDamageWounded = 100.0f;
    } if (m_EecChar==EYC_X) {
      SetHealth(50.0f);
      m_fMaxHealth = 50.0f;
      // damage/explode properties
      m_fBlowUpAmount = 90.0f;
      m_fBodyParts = 5;
      m_fBlowUpSize = 1.5f;
      m_fDamageWounded = 15.0f;
	} if (m_EecChar==EYC_P) {
      SetHealth(80.0f);
      m_fMaxHealth = 80.0f;
      // damage/explode properties
      m_fBlowUpAmount = 120.0f;
      m_fBodyParts = 3;
      m_fBlowUpSize = 1.8f;
      m_fDamageWounded = 30.0f;
	} if (m_EecChar==EYC_SERGEANT) {
      SetHealth(100.0f);
      m_fMaxHealth = 100.0f;
      // damage/explode properties
      m_fBlowUpAmount = 130.0f;
      m_fBodyParts = 4;
      m_fBlowUpSize = 2.0f;
      m_fDamageWounded = 50.0f;
    } if (m_EecChar==EYC_SOLDIER) {
      SetHealth(60.0f);
      m_fMaxHealth = 60.0f;
      // damage/explode properties
      m_fBlowUpAmount = 100.0f;
      m_fBodyParts = 2;
      m_fBlowUpSize = 1.7f;
      m_fDamageWounded = 25.0f;
    }
    en_fDensity = 2000.0f;
    if (m_EeftType == EFT_GROUND_ONLY) {
      en_tmMaxHoldBreath = 5.0f;
    } else {
      en_tmMaxHoldBreath = 30.0f;
    }

    // set your appearance
    if (m_EecChar==EYC_B) {
      SetModel(MODEL_BUFF);
	  m_fgibArm = MODEL_BUFF_ARM;
	  m_fgibLeg = MODEL_BUFF_LEG;
	  m_fgibForehead = MODEL_BUFF_FOREHEAD;
	  m_fgibJaw = MODEL_BUFF_JAW;
      SetModelMainTexture(TEXTURE_EYEMAN_BRUTE);
		m_fgibTexture = TEXTURE_EYEMAN_BRUTE;
      GetModelObject()->StretchModel(FLOAT3D(1.9f, 1.9f, 1.9f));
      ModelChangeNotify();
      m_iScore = 3000;
    } if (m_EecChar==EYC_X) {
      m_iScore = 800;
      SetModel(MODEL_EYEMAN);
	  m_fgibArm = MODEL_EYEMAN_ARM;
	  m_fgibLeg = MODEL_EYEMAN_LEG;
	  m_fgibForehead = MODEL_EYEMAN_FOREHEAD;
	  m_fgibJaw = MODEL_EYEMAN_JAW;
      SetModelMainTexture(TEXTURE_EYEMAN_BOOM);
		m_fgibTexture = TEXTURE_EYEMAN_BOOM;
      GetModelObject()->StretchModel(FLOAT3D(0.9f, 0.9f, 0.9f));
      ModelChangeNotify();
    } if (m_EecChar==EYC_P) {
      m_iScore = 1200;
      SetModel(MODEL_EYEMAN);
	  m_fgibArm = MODEL_EYEMAN_ARM;
	  m_fgibLeg = MODEL_EYEMAN_LEG;
	  m_fgibForehead = MODEL_EYEMAN_FOREHEAD;
	  m_fgibJaw = MODEL_EYEMAN_JAW;
      SetModelMainTexture(TEXTURE_EYEMAN_PUKE);
		m_fgibTexture = TEXTURE_EYEMAN_PUKE;
      GetModelObject()->StretchModel(FLOAT3D(1.2f, 1.2f, 1.2f));
      ModelChangeNotify();
    } if (m_EecChar==EYC_SERGEANT) {
      SetModel(MODEL_BUFF);
	  m_fgibArm = MODEL_BUFF_ARM;
	  m_fgibLeg = MODEL_BUFF_LEG;
	  m_fgibForehead = MODEL_BUFF_FOREHEAD;
	  m_fgibJaw = MODEL_BUFF_JAW;
      m_iScore = 1000;
       if (m_eeEnv == EYE_LAVA) {
        SetModelMainTexture(TEXTURE_EYEMAN_LAVA);
		m_fgibTexture = TEXTURE_EYEMAN_LAVA;
      } if (m_eeEnv == EYE_SNOW) {
        SetModelMainTexture(TEXTURE_EYEMAN_SNOWF);
		m_fgibTexture = TEXTURE_EYEMAN_SNOWF;
      } if (m_eeEnv == EYE_NORMAL) {
        SetModelMainTexture(TEXTURE_EYEMAN_SERGEANT);
		m_fgibTexture = TEXTURE_EYEMAN_SERGEANT;
      }
      GetModelObject()->StretchModel(FLOAT3D(1.3f, 1.3f, 1.3f));
      ModelChangeNotify();
    } if (m_EecChar==EYC_SOLDIER) {
      m_iScore = 500;
      SetModel(MODEL_EYEMAN);
	  m_fgibArm = MODEL_EYEMAN_ARM;
	  m_fgibLeg = MODEL_EYEMAN_LEG;
	  m_fgibForehead = MODEL_EYEMAN_FOREHEAD;
	  m_fgibJaw = MODEL_EYEMAN_JAW;
       if (m_eeEnv == EYE_LAVA) {
        SetModelMainTexture(TEXTURE_EYEMAN_LAVA);
		m_fgibTexture = TEXTURE_EYEMAN_LAVA;
      } if (m_eeEnv == EYE_SNOW) {
        SetModelMainTexture(TEXTURE_EYEMAN_SNOWM);
		m_fgibTexture = TEXTURE_EYEMAN_SNOWM;
      } if (m_eeEnv == EYE_NORMAL) {
        SetModelMainTexture(TEXTURE_EYEMAN_SOLDIER);
		m_fgibTexture = TEXTURE_EYEMAN_SOLDIER;
      }
      GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
      ModelChangeNotify();
    }
    if (m_bInvisible) {
      GetModelObject()->mo_colBlendColor = C_WHITE|0x25;
      m_iScore*=2;
    }
    // setup moving speed
    m_fWalkSpeed = FRnd() + 3.0f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 500.0f;
    if (m_EecChar==EYC_B) {
      m_fAttackRunSpeed = FRnd()*2.0f + 17.5f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 17.5f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseDistance = 6.5f;
    } if (m_EecChar==EYC_SERGEANT) {
      m_fAttackRunSpeed = FRnd()*2.0f + 13.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 13.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseDistance = 4.5f;
    } if (m_EecChar==EYC_SOLDIER) {
      m_fAttackRunSpeed = FRnd()*2.0f + 11.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 11.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseDistance = 3.5f;
    } if (m_EecChar==EYC_X) {
      m_fAttackRunSpeed = FRnd()*2.0f + 12.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 12.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseDistance = 3.5f;
	} if (m_EecChar==EYC_P) {
      m_fAttackRunSpeed = FRnd()*2.0f + 8.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 10.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseDistance = 3.5f;
	}
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fStopDistance = 1.5f;
    m_fAttackFireTime = 2.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 200.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd()*2.0f + 5.0f;
    m_aFlyWalkRotateSpeed = FRnd()*20.0f + 600.0f;
    if (m_EecChar==EYC_B) {
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 17.0f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 350.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 17.0f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 400.0f;
    } if (m_EecChar==EYC_X) {
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 8.0f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 350.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 8.0f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 400.0f;
	} if (m_EecChar==EYC_P) {
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 7.0f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 350.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 9.0f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 400.0f;
	} if (m_EecChar==EYC_SERGEANT) {
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 12.5f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 350.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 12.5f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 400.0f;
    } if (m_EecChar==EYC_SOLDIER) {
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 10.5f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 300.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 10.5f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 300.0f;
    }
    m_fGroundToAirSpeed = 2.5f;
    m_fAirToGroundSpeed = 2.5f;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;
    m_fFlyHeight = 1.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 100.0f;
    m_fFlyCloseDistance = 10.0f;
    m_fFlyStopDistance = 1.5f;
    m_fFlyAttackFireTime = 2.0f;
    m_fFlyCloseFireTime = 0.5f;
    m_fFlyIgnoreRange = 200.0f;
    m_soMumble.Set3DParameters(25.0f, 0.0f, 1.0f, 1.0f);
    m_soFlesh.Set3DParameters(50.0f, 0.0f, 0.75f, 1.0f);

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/Primitive/Primitive.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum PrChar {
  0 PR_RUN           "Runner",      // normal (fighter)
  1 PR_SHIELD        "Shield",      // normal
  2 PR_BIG           "Giant",        // big
};

%{
static float _tmLastStandingAnim =0.0f;  
#define PR_STRETCH 1.6f
#define BIG_PR_STRETCH 4.0f
#define GIANT_HIT   FLOAT3D(0.0f, 0.0f, -7.0f)

// info structure
static EntityInfo eiPrSmall = {
  EIBT_FLESH, 1500.0f,
  0.0f, 2.0f*PR_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*PR_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiPrBig = {
  EIBT_FLESH, 5000.0f,
  0.0f, 2.0f*BIG_PR_STRETCH, 0.0f,     // source (eyes)
  0.0f, 3.0f*BIG_PR_STRETCH, 0.0f,     // target (body)
};
%}

class CPrimitive : CEnemyBase {
name      "Primitive";
thumbnail "Thumbnails\\Primitive.tbn";

properties:
  1 enum PrChar m_PrType     "Character" 'C' = PR_SHIELD,
  2 INDEX m_iCounter = 0,
  3 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  4 BOOL m_bMumbleSoundPlaying = FALSE,
  5 CSoundObject m_soMumble,
  6 BOOL m_bShielded = FALSE,
  7 INDEX m_iShieldHealth = 0,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_PRIMITIVE           "ModelsMP\\Enemies\\SS2\\Primitive\\Primitive.mdl",
 11 texture TEXTURE_PRIMITIVE         "ModelsMP\\Enemies\\SS2\\Primitive\\Primitive.tex",
 12 texture TEXTURE_PAINT             "ModelsMP\\Enemies\\SS2\\Primitive\\Paint.tex",
 13 texture TEXTURE_PAINT_RED         "ModelsMP\\Enemies\\SS2\\Primitive\\Paint_Blood.tex",

 14 model   MODEL_SHIELD           "ModelsMP\\Enemies\\SS2\\Primitive\\Shield.mdl",
 15 model   MODEL_BAT              "ModelsMP\\Enemies\\SS2\\Primitive\\Bat.mdl",
 16 texture TEXTURE_WEAPONS           "ModelsMP\\Enemies\\SS2\\Primitive\\Weapons.tex",
 17 model   MODEL_TEETH              "ModelsMP\\Enemies\\SS2\\Primitive\\Teeth.mdl",
 18 texture TEXTURE_TEETH           "ModelsMP\\Enemies\\SS2\\Primitive\\Teeth.tex",

 20 model   MODEL_HEAD           "ModelsMP\\Enemies\\SS2\\Primitive\\Debris\\hed.mdl",
 21 model   MODEL_TIT           "ModelsMP\\Enemies\\SS2\\Primitive\\Debris\\tit.mdl",
 22 model   MODEL_LEG           "ModelsMP\\Enemies\\SS2\\Primitive\\Debris\\leg.mdl",

 23 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 24 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 50 sound   SOUND_SMALL_DEATH1      "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Death1.wav",
 51 sound   SOUND_SMALL_DEATH2      "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Death2.wav",
 52 sound   SOUND_SMALL_DEATH3      "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Death3.wav",
 53 sound   SOUND_SMALL_IDLE        "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Idle.wav",
 54 sound   SOUND_SMALL_MELEE1      "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Melee1.wav",
 55 sound   SOUND_SMALL_MELEE2      "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Melee2.wav",
 56 sound   SOUND_SMALL_MUMBLE1     "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Mumble1.wav",
 57 sound   SOUND_SMALL_MUMBLE2     "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Mumble2.wav",
 58 sound   SOUND_SMALL_MUMBLE3     "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Mumble3.wav",
 59 sound   SOUND_SMALL_MUMBLE4     "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Mumble4.wav",
 60 sound   SOUND_SMALL_SIGHT       "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Sight.wav",
 61 sound   SOUND_SMALL_WOUND       "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Wound.wav",

 70 sound   SOUND_BIG_DEATH       "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Giant\\Death_Giant.wav",
 73 sound   SOUND_BIG_IDLE        "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Giant\\Idle_Giant.wav",
 74 sound   SOUND_BIG_MELEE1      "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Giant\\Melee_Giant1.wav",
 75 sound   SOUND_BIG_MELEE2      "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Giant\\Melee_GIant2.wav",
 76 sound   SOUND_BIG_STEP        "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Giant\\Step_Large.wav",
 80 sound   SOUND_BIG_SIGHT       "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Giant\\Sight_Giant.wav",
 81 sound   SOUND_BIG_WOUND       "ModelsMP\\Enemies\\SS2\\Primitive\\Sounds\\Giant\\Wound_Giant.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A zunkladyte crushed %s's skull"), (const char *) strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmPrRunner, "DataMP\\Messages\\Enemies\\SS2\\Primitive.txt");
    static DECLARE_CTFILENAME(fnmPrShield, "DataMP\\Messages\\Enemies\\SS2\\Primitive.txt");
    static DECLARE_CTFILENAME(fnmPrGiant, "DataMP\\Messages\\Enemies\\SS2\\PrimitiveGiant.txt");
    switch(m_PrType) {
    default: ASSERT(FALSE);
    case PR_RUN: return fnmPrRunner;
    case PR_SHIELD: return fnmPrShield;
    case PR_BIG: return fnmPrGiant;
    }
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheModel(MODEL_PRIMITIVE);
    PrecacheTexture(TEXTURE_PRIMITIVE);
    PrecacheTexture(TEXTURE_PAINT);
    PrecacheTexture(TEXTURE_PAINT_RED);
	
    PrecacheModel(MODEL_SHIELD);
    PrecacheModel(MODEL_BAT);
    PrecacheTexture(TEXTURE_WEAPONS);
    PrecacheModel(MODEL_TEETH);
    PrecacheTexture(TEXTURE_TEETH);
	
    PrecacheModel(MODEL_HEAD);
    PrecacheModel(MODEL_TIT);
    PrecacheModel(MODEL_LEG);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);

    if (m_PrType!=PR_BIG)
    {
    PrecacheSound(SOUND_SMALL_DEATH1 );
    PrecacheSound(SOUND_SMALL_DEATH2);
    PrecacheSound(SOUND_SMALL_DEATH3);
    PrecacheSound(SOUND_SMALL_IDLE);
    PrecacheSound(SOUND_SMALL_MELEE1);
    PrecacheSound(SOUND_SMALL_MELEE2);
    PrecacheSound(SOUND_SMALL_MUMBLE1);
    PrecacheSound(SOUND_SMALL_MUMBLE2);
    PrecacheSound(SOUND_SMALL_MUMBLE3);
    PrecacheSound(SOUND_SMALL_MUMBLE4);
    PrecacheSound(SOUND_SMALL_SIGHT);
    PrecacheSound(SOUND_SMALL_WOUND);
	}

    else 
    {
    PrecacheSound(SOUND_BIG_DEATH);
    PrecacheSound(SOUND_BIG_IDLE );
    PrecacheSound(SOUND_BIG_SIGHT);
    PrecacheSound(SOUND_BIG_WOUND);
    PrecacheSound(SOUND_BIG_MELEE1);
    PrecacheSound(SOUND_BIG_MELEE2);
    PrecacheSound(SOUND_BIG_STEP);
	}
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_PrType == PR_SHIELD) {
      return &eiPrSmall;
    } 
    if (m_PrType == PR_RUN) {
      return &eiPrSmall;
    } 
	if (m_PrType == PR_BIG) {
      return &eiPrBig;
    }
  };

  BOOL ForcesCannonballToExplode(void)
  {
    if (m_PrType==PR_BIG) {
      return TRUE;
    }
    return CEnemyBase::ForcesCannonballToExplode();
  }

  void ShakeItBaby(FLOAT tmShaketime, FLOAT fPower)
  {
    CWorldSettingsController *pwsc = GetWSC(this);
    if (pwsc!=NULL) {
      pwsc->m_tmShakeStarted = tmShaketime;
      pwsc->m_vShakePos = GetPlacement().pl_PositionVector;
      pwsc->m_fShakeFalloff = 400.0f;
      pwsc->m_fShakeFade = 3.0f;

      pwsc->m_fShakeIntensityZ = 0.0f;
      pwsc->m_tmShakeFrequencyZ = 5.0f;
      pwsc->m_fShakeIntensityY = 0.1f*fPower;
      pwsc->m_tmShakeFrequencyY = 5.0f;
      pwsc->m_fShakeIntensityB = 2.5f*fPower;
      pwsc->m_tmShakeFrequencyB = 7.2f;

      pwsc->m_bShakeFadeIn = FALSE;
    }
  }

  void SpawnShockwave(FLOAT fSize)
  {
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+GIANT_HIT*m;
    CEntityPointer penShockwave = CreateEntity(plFX, CLASS_BASIC_EFFECT);
        
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_CANNONSHOCKWAVE;
    eSpawnEffect.vStretch = FLOAT3D(fSize, fSize, fSize);
    penShockwave->Initialize(eSpawnEffect);
  }

  // hit ground
  void HitGround(void) {
    FLOAT3D vSource;
    const FLOATmatrix3D &m = GetRotationMatrix();
    if( m_penEnemy != NULL)
    {
      vSource = GetPlacement().pl_PositionVector +
      FLOAT3D(m_penEnemy->en_mRotation(1, 2), m_penEnemy->en_mRotation(2, 2), m_penEnemy->en_mRotation(3, 2));
    }
    else
    {
      vSource = GetPlacement().pl_PositionVector;
    }

    // damage
      InflictRangeDamage(this, DMT_IMPACT, 40.0f, vSource+GIANT_HIT*m, 1.0f, 5.0f);
      SpawnShockwave(1.0f);
      ShakeItBaby(_pTimer->CurrentTick(), 2.0f);
  };

  FLOAT GetCrushHealth(void)
  {
    if (m_PrType == PR_BIG) {
      return 300.0f;
    }
    return 0.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // shield absorbs damage
    if (m_bShielded == TRUE) {
     FLOAT3D vFront;
     GetHeadingDirection(0, vFront);
     FLOAT fDamageDir = m_vDamage%vFront;
	 if (fDamageDir<0) {
	  if (m_iShieldHealth > 0) {
	   m_iShieldHealth = m_iShieldHealth-fDamageAmmount;
       return;
	   } else {
       if (m_iShieldHealth <= 0) {
  	      m_bShielded = FALSE;
          RemoveAttachmentFromModel(*GetModelObject(), PRIMITIVE_ATTACHMENT_SHIELD);
          StartModelAnim(PRIMITIVE_ANIM_THROWSHIELD, 0);
		  //shield as debris
          FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);
          Debris_Begin(EIBT_WOOD, DPT_NONE, BET_NONE, 1.6f, 0, vBodySpeed, 1.0f, 0.0f);
          Debris_Spawn(this, this, MODEL_SHIELD, TEXTURE_WEAPONS, 1, 1, 1, 1, 1.0f,
                      FLOAT3D(0.2f, 0.2f, 0.2f));
					  }
	    }
	  }
    }


    // take less damage from heavy bullets (e.g. sniper)
    if(dmtType==DMT_BULLET && fDamageAmmount>100.0f)
    {
      fDamageAmmount*=0.5f;
    }


    // can't harm own class
    if (!IsOfClass(penInflictor, "Primitive") ||
      ((CPrimitive*)penInflictor)->m_PrType!=m_PrType) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };



  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateMumblingSound();
    StartModelAnim(PRIMITIVE_ANIM_WOUND, 0);
    return PRIMITIVE_ANIM_WOUND ;
  };

  // death
  INDEX AnimForDeath(void) {
    DeactivateMumblingSound();
    INDEX iAnim;
      if (m_PrType == PR_BIG) {
        iAnim = PRIMITIVE_ANIM_DEATH_GIANT;
      } else {
       FLOAT3D vFront;
       GetHeadingDirection(0, vFront);
       FLOAT fDamageDir = m_vDamage%vFront;
       if (fDamageDir<0) {
         iAnim = PRIMITIVE_ANIM_DEATH_FRONT;
       } else {
         iAnim = PRIMITIVE_ANIM_DEATH_BACK;
      }
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==PRIMITIVE_ANIM_DEATH_BACK)
    {
      vStretch=FLOAT3D(1,1,1)*0.75f;
      return 0.5f;
    }
    else if(GetModelObject()->GetAnim()==PRIMITIVE_ANIM_DEATH_FRONT)
    {
      vStretch=FLOAT3D(1,1,1)*0.75f;
      return 0.5f;
    }
    else if(GetModelObject()->GetAnim()==PRIMITIVE_ANIM_DEATH_GIANT)
    {
      vStretch=FLOAT3D(2,2,2)*1.0f;
      return 0.5f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(PRIMITIVE_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // mumbling sounds
  void ActivateMumblingSound(void)
  {
   if (m_PrType == PR_BIG) {
    PlaySound(m_soMumble, SOUND_BIG_STEP, SOF_3D|SOF_LOOP);
    m_bMumbleSoundPlaying = TRUE;
   	 } else { 
     if (!m_bMumbleSoundPlaying) {
       INDEX iMumbleSound;
       switch (IRnd()%4) {
         case 0: iMumbleSound = SOUND_SMALL_MUMBLE1; break;
         case 1: iMumbleSound = SOUND_SMALL_MUMBLE2; break;
         case 2: iMumbleSound = SOUND_SMALL_MUMBLE3; break;
         case 3: iMumbleSound = SOUND_SMALL_MUMBLE4; break;
         }
      PlaySound(m_soMumble, iMumbleSound, SOF_3D|SOF_LOOP);
      m_bMumbleSoundPlaying = TRUE;
      }
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
    if (m_PrType == PR_SHIELD) {
      if (m_bShielded == TRUE) {
      StartModelAnim(PRIMITIVE_ANIM_IDLE_SHIELD, AOF_LOOPING|AOF_NORESTART); }
	  if (m_bShielded == FALSE) {
      StartModelAnim(PRIMITIVE_ANIM_IDLE_NOSHIELD, AOF_LOOPING|AOF_NORESTART); }
	  }
	else {
      StartModelAnim(PRIMITIVE_ANIM_IDLE_NOSHIELD, AOF_LOOPING|AOF_NORESTART); 
	  }
  };

  void WalkingAnim(void) {
    ActivateMumblingSound();
    if (m_PrType == PR_SHIELD) {
      if (m_bShielded == TRUE) {
      StartModelAnim(PRIMITIVE_ANIM_WALK_SHIELD2, AOF_LOOPING|AOF_NORESTART); }
	  if (m_bShielded == FALSE) {
      StartModelAnim(PRIMITIVE_ANIM_WALK_NOSHIELD2, AOF_LOOPING|AOF_NORESTART); }
	  }
    if (m_PrType == PR_RUN) {
      StartModelAnim(PRIMITIVE_ANIM_WALK_NOSHIELD2, AOF_LOOPING|AOF_NORESTART);
	  }
    if (m_PrType == PR_BIG) {
      StartModelAnim(PRIMITIVE_ANIM_WALK_GIANT2, AOF_LOOPING|AOF_NORESTART);
	  }
  };

  void RunningAnim(void) {
    ActivateMumblingSound();
    if (m_PrType == PR_SHIELD) {
      if (m_bShielded == TRUE) {
      StartModelAnim(PRIMITIVE_ANIM_WALK_SHIELD2, AOF_LOOPING|AOF_NORESTART); }
	  if (m_bShielded == FALSE) {
      StartModelAnim(PRIMITIVE_ANIM_WALK_NOSHIELD2, AOF_LOOPING|AOF_NORESTART); }
	  }
    if (m_PrType == PR_RUN) {
      StartModelAnim(PRIMITIVE_ANIM_RUN_NOSHIELD2, AOF_LOOPING|AOF_NORESTART);
	  }
    if (m_PrType == PR_BIG) {
      StartModelAnim(PRIMITIVE_ANIM_WALK_GIANT2, AOF_LOOPING|AOF_NORESTART);
	  }
  };
  void RotatingAnim(void) {
    ActivateMumblingSound();
    WalkingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
   if (m_PrType == PR_BIG) {
    PlaySound(m_soSound, SOUND_BIG_IDLE, SOF_3D);
	} else {
    PlaySound(m_soSound, SOUND_SMALL_IDLE, SOF_3D);
	}

  };
  void SightSound(void) {
   if (m_PrType == PR_BIG) {
    PlaySound(m_soSound, SOUND_BIG_SIGHT, SOF_3D);
	} else {
    PlaySound(m_soSound, SOUND_SMALL_SIGHT, SOF_3D);
	}
  };
  void WoundSound(void) {
   if (m_PrType == PR_BIG) {
    PlaySound(m_soSound, SOUND_BIG_WOUND, SOF_3D);
	} else {
    PlaySound(m_soSound, SOUND_SMALL_WOUND, SOF_3D);
	}
  };
  void DeathSound(void) {
   if (m_PrType == PR_BIG) {
    PlaySound(m_soSound, SOUND_BIG_DEATH, SOF_3D);
	} else {
       INDEX iDeathSound;
       switch (IRnd()%3) {
         case 0: iDeathSound = SOUND_SMALL_DEATH1; break;
         case 1: iDeathSound = SOUND_SMALL_DEATH2; break;
         case 2: iDeathSound = SOUND_SMALL_DEATH3; break;
         }
      PlaySound(m_soSound, iDeathSound, SOF_3D);
	}
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

    vNormalizedDamage *= 0.3f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_PRIMITIVE, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TIT, TEXTURE_PRIMITIVE, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TIT, TEXTURE_PRIMITIVE, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_PRIMITIVE, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_PRIMITIVE, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.3f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
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
  };



procedures:
/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    if (m_PrType != PR_BIG) {
      jump CEnemyBase::Death();
    }
    
    // stop moving
    StopMoving();
    DeathSound();     // death sound
    LeaveStain(TRUE);
    // set physic flags
    SetPhysicsFlags(EPF_MODEL_CORPSE);
    SetCollisionFlags(ECF_CORPSE);
    SetFlags(GetFlags() | ENF_SEETHROUGH);
    // stop making fuss
    RemoveFromFuss();
    // death notify (usually change collision box and change body density)
    DeathNotify();
    // start death anim
    AnimForDeath();
    autowait(1.5f);
    ShakeItBaby(_pTimer->CurrentTick(), 2.0f);

    // spawn dust effect
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1,1,2)*1.0f;
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_DUST_FALL;
    CPlacement3D plSmoke=plFX;
    plSmoke.pl_PositionVector+=FLOAT3D(0,0.35f*ese.vStretch(2),0);
    CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);

    autowait(GetModelObject()->GetAnimLength(PRIMITIVE_ANIM_DEATH_GIANT));
    return EEnd();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
   if (m_PrType == PR_SHIELD) {
    StartModelAnim(PRIMITIVE_ANIM_MELEE_SHIELD, 0);
    INDEX iTauntSound;
    switch (IRnd()%2) {
      case 0: iTauntSound = SOUND_SMALL_MELEE1; break;
      case 1: iTauntSound = SOUND_SMALL_MELEE2; break;
	  }
    PlaySound(m_soSound, iTauntSound, SOF_3D);
    autowait(0.27f);
     if (CalcDist(m_penEnemy) < m_fCloseDistance) {
       FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
       vDirection.Normalize();
         InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 15.0f, FLOAT3D(0, 0, 0), vDirection);
         // push target
           FLOAT3D vSpeed;
           GetHeadingDirection(AngleDeg(0.0f), vSpeed);
           vSpeed = vSpeed * 15.0f;
           KickEntity(m_penEnemy, vSpeed);
		   }
    autowait(0.3f);
	}
   if (m_PrType == PR_RUN) {
    StartModelAnim(PRIMITIVE_ANIM_RUNATTACK_NOSHIELD2, AOF_LOOPING|AOF_NORESTART);
    INDEX iTauntSound;
    switch (IRnd()%2) {
      case 0: iTauntSound = SOUND_SMALL_MELEE1; break;
      case 1: iTauntSound = SOUND_SMALL_MELEE2; break;
	  }
    // jump
    FLOAT3D vDir = PlayerDestinationPos();
    vDir = (vDir - GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed;
    vDir(2) = -10.0f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, iTauntSound, SOF_3D);

    autowait(0.27f);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.9f, 0);
    m_iChargeHitAnimation = PRIMITIVE_ANIM_RUNATTACK_NOSHIELD2;
    m_fChargeHitDamage = 15.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 10.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.4f);
	}
   if (m_PrType == PR_BIG) {
    StartModelAnim(PRIMITIVE_ANIM_MELEE_GIANT, 0);
    INDEX iTauntSound;
    switch (IRnd()%2) {
      case 0: iTauntSound = SOUND_BIG_MELEE1; break;
      case 1: iTauntSound = SOUND_BIG_MELEE2; break;
	  }
    PlaySound(m_soSound, iTauntSound, SOF_3D);
    autowait(0.4f);
    HitGround();
    autowait(0.45f);
    }

    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {
   if (m_PrType == PR_SHIELD) { 
 	 m_bShielded = TRUE;
	 m_iShieldHealth = 70;
	}
   else { 
 	 m_bShielded = FALSE;
	 m_iShieldHealth = 0; }

    return EReturn();
  }

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_fDensity = 1100.0f;
    en_tmMaxHoldBreath = 10.0f;

    // set your appearance
    SetModel(MODEL_PRIMITIVE);
    SetModelMainTexture(TEXTURE_PRIMITIVE);

    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd() + 20.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_bBoss = m_bBeBoss;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    if (m_PrType == PR_SHIELD)
    {
     SetComponents(this, *GetModelObject(), MODEL_PRIMITIVE, TEXTURE_PRIMITIVE, 0, 0, TEXTURE_PAINT);
     GetModelObject()->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));
     AddAttachment(PRIMITIVE_ATTACHMENT_TEETH, MODEL_TEETH, TEXTURE_TEETH);
     GetModelObject()->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));
     AddAttachment(PRIMITIVE_ATTACHMENT_BAT, MODEL_BAT, TEXTURE_WEAPONS);
     GetModelObject()->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));
     AddAttachment(PRIMITIVE_ATTACHMENT_SHIELD, MODEL_SHIELD, TEXTURE_WEAPONS);
     GetModelObject()->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));

     ModelChangeNotify();

      m_fAttackRunSpeed = FRnd()*3 + 9.0f;
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(100.0f);
      m_fBlowUpAmount = 200.0f;
	  m_fBlowUpSize = 3.2f;
      m_fBodyParts = 3;
      m_fDamageWounded = 30.0f;
      m_iScore = 1000;//500
      ModelChangeNotify();
      m_fAttackFireTime = 2.0f;
      m_fStopDistance = 5.0f;
      m_fCloseDistance = 5.0f;
    }
    if (m_PrType == PR_RUN)
    {
     SetComponents(this, *GetModelObject(), MODEL_PRIMITIVE, TEXTURE_PRIMITIVE, 0, 0, TEXTURE_PAINT);
     GetModelObject()->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));
     AddAttachment(PRIMITIVE_ATTACHMENT_TEETH, MODEL_TEETH, TEXTURE_TEETH);
     GetModelObject()->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));
     AddAttachment(PRIMITIVE_ATTACHMENT_BAT, MODEL_BAT, TEXTURE_WEAPONS);
     GetModelObject()->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));
     ModelChangeNotify();

      m_fAttackRunSpeed = FRnd()*3 + 12.0f;
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(100.0f);
      m_fBlowUpAmount = 200.0f;
	  m_fBlowUpSize = 3.2f;
      m_fBodyParts = 3;
      m_fDamageWounded = 30.0f;
      m_iScore = 1000;//500
      m_fAttackFireTime = 2.0f;
      m_fStopDistance = 7.0f;
      m_fCloseDistance = 8.0f;
    }
    if (m_PrType == PR_BIG)
    {
     SetComponents(this, *GetModelObject(), MODEL_PRIMITIVE, TEXTURE_PRIMITIVE, 0, 0, TEXTURE_PAINT_RED);
     GetModelObject()->StretchModel(FLOAT3D(4.0f, 4.0f, 4.0f));
     AddAttachment(PRIMITIVE_ATTACHMENT_TEETH, MODEL_TEETH, TEXTURE_TEETH);
     GetModelObject()->StretchModel(FLOAT3D(4.0f, 4.0f, 4.0f));
     AddAttachment(PRIMITIVE_ATTACHMENT_BAT, MODEL_BAT, TEXTURE_WEAPONS);
     GetModelObject()->StretchModel(FLOAT3D(4.0f, 4.0f, 4.0f));
     ModelChangeNotify();

      m_fAttackRunSpeed = 11.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(700.0f);//500
      m_fBlowUpAmount = 1000.0f;//500
	  m_fBlowUpSize = 8.0f;
      m_fBodyParts = 8;
      m_fDamageWounded = 175.0f;//500
      m_iScore = 6000; //1000
      m_fAttackFireTime = 5.0f;
      m_fStopDistance = 9.0f;
      m_fCloseDistance = 10.0f;
    }
    
    m_fMaxHealth = GetHealth();
    StandingAnim();
    m_soMumble.Set3DParameters(80.0f, 5.0f, 1.0f, 1.0f);

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

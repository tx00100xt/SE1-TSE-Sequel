323
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/DumDum/DumDum.h"
#include "ModelsF/NextEncounter/Enemies/Tweedle/Tweedle.h"
#include "ModelsF/NextEncounter/Enemies/Tweedle/Propeller.h"
%}

uses "EntitiesMP/EnemyFly";

enum DumChar {
  0 DUM_DUM   "Dum Dum",    // soldier
  1 DUM_TWEED  "Tweedle",   // sergeant
};

%{
// info structure
static EntityInfo eiDumDum = {
  EIBT_FLESH, 90.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiTweedle = {
  EIBT_FLESH, 80.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};

#define BITE_AIR    3.0f
#define HIT_GROUND  2.0f
#define FIRE_GROUND   FLOAT3D(0.75f, 1.5f, -1.25f)
%}


class CDumDum : CEnemyFly {
name      "DumDum";
thumbnail "Thumbnails\\DumDum.tbn";

properties:
  1 enum DumChar m_DumChar "Character" 'C' = DUM_DUM,      // character
  2 BOOL m_bInvisible "Invisible" 'I'=FALSE,

  6 CSoundObject m_soPropeller,  // sound channel for background noise

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_DUMDUM      "ModelsF\\NextEncounter\\Enemies\\DumDum\\DumDum.mdl",
  2 model   MODEL_TWEEDLE      "ModelsF\\NextEncounter\\Enemies\\Tweedle\\Tweedle.mdl",
  3 texture TEXTURE_DUMDUM    "ModelsF\\NextEncounter\\Enemies\\DumDum\\initialShadingGroup_Texture1.tex",
  4 model   MODEL_PROPELLER      "ModelsF\\NextEncounter\\Enemies\\Tweedle\\Propeller.mdl",
  7 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\NextEncounter\\Enemies\\DumDum\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\NextEncounter\\Enemies\\DumDum\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\NextEncounter\\Enemies\\DumDum\\Sounds\\Wound.wav",
 53 sound   SOUND_ATTACK    "ModelsF\\NextEncounter\\Enemies\\DumDum\\Sounds\\Attack.wav",
 55 sound   SOUND_DEATH     "ModelsF\\NextEncounter\\Enemies\\DumDum\\Sounds\\Death.wav",
 56 sound   SOUND_FLY       "ModelsF\\NextEncounter\\Enemies\\Tweedle\\Sounds\\Tweedle.wav",

 60 model   MODEL_JAW   "ModelsF\\NextEncounter\\Enemies\\DumDum\\Debris\\Jaw.mdl",
 61 model   MODEL_LEG   "ModelsF\\NextEncounter\\Enemies\\DumDum\\Debris\\Leg.mdl",
 62 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 63 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (m_bInAir) {
      str.PrintF(TRANS("A Tweedle Dum-Dum smacked the shit out of %s"), strPlayerName);
    } else {
      str.PrintF(TRANS("A Dum-Dum nibbled %s's nipples off"), strPlayerName);
    }
    return str;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_ATTACK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_FLY);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_GIZMO_SPLASH_FX);
	  PrecacheModel(MODEL_JAW);
	  PrecacheModel(MODEL_LEG);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_DumChar==DUM_DUM) {
      return &eiDumDum;
    } else {
      return &eiTweedle;
    }
  };

  // get the attachment
  CModelObject *PropellerModel(void) {
    CAttachmentModelObject &amo0 = *GetModelObject()->GetAttachmentModel(TWEEDLE_ATTACHMENT_PROPELLER );
    return &(amo0.amo_moModelObject);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // eyeman can't harm eyeman
    if (!IsOfClass(penInflictor, "DumDum")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    CEnemyBase::FillEntityStatistics(pes);
    switch(m_DumChar) {
    case DUM_DUM: { pes->es_strName+=" Dum Dum"; } break;
    case DUM_TWEED : { pes->es_strName+=" Tweedle"; } break;
    }
    if (m_bInvisible) {
      pes->es_strName+=" Invisible";
    }
    return TRUE;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmDumDum, "DataF\\Messages\\Enemies\\NE\\DumDum.txt");
    static DECLARE_CTFILENAME(fnmTweedle , "DataF\\Messages\\Enemies\\NE\\Tweedle.txt");
    switch(m_DumChar) {
    default: ASSERT(FALSE);
    case DUM_DUM: return fnmDumDum;
    case DUM_TWEED : return fnmTweedle;
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
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = TWEEDLE_ANIM_WOUND;
      PropellerModel()->PlayAnim(PROPELLER_ANIM_SPIN, AOF_LOOPING|AOF_NORESTART);
    } else {
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
      if (fDamageDir<0) {
          iAnim = DUMDUM_ANIM_WOUND1;
        } else {
          iAnim = DUMDUM_ANIM_WOUND2;
        }
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = TWEEDLE_ANIM_WOUND;
    } else {
      iAnim = DUMDUM_ANIM_WOUND1;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(TWEEDLE_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
      PropellerModel()->PlayAnim(PROPELLER_ANIM_SPIN, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DUMDUM_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(TWEEDLE_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
      PropellerModel()->PlayAnim(PROPELLER_ANIM_SPIN, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DUMDUM_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    if (m_bInAir) {
      StartModelAnim(TWEEDLE_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
      PropellerModel()->PlayAnim(PROPELLER_ANIM_SPIN, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DUMDUM_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(TWEEDLE_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
      PropellerModel()->PlayAnim(PROPELLER_ANIM_SPIN, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DUMDUM_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void ChangeCollisionToAir() {
    ChangeCollisionBoxIndexWhenPossible(TWEEDLE_COLLISION_BOX_PART_NAME );
  };
  void ChangeCollisionToGround() {
    ChangeCollisionBoxIndexWhenPossible(DUMDUM_COLLISION_BOX_PART_NAME );
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  // spawn body parts
  void BlowUp(void)
  {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();
	FLOAT fDebrisSize = 0.0f;

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
	
   if (m_EeftType == EFT_GROUND_ONLY) {
    
    Debris_Spawn(this, this, MODEL_JAW, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_JAW, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.2f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }
		} else if (m_EeftType == EFT_FLY_ONLY) {
    
    Debris_Spawn(this, this, MODEL_JAW, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_JAW, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_PROPELLER, TEXTURE_DUMDUM, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.2f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }
		}

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_GIZMO_SPLASH_FX;
      penSplat->Initialize(ese);

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
    if (CalcDist(m_penEnemy) > BITE_AIR) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn();
    }
    StartModelAnim(TWEEDLE_ANIM_ATTACK, 0);
    StopMoving();
    autowait(0.4f);
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
    // damage enemy
    autowait(0.2f);
    // damage enemy
    if (CalcDist(m_penEnemy) < BITE_AIR) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 3.0f, FLOAT3D(0, 0, 0), vDirection);
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
    autowait(0.9f);

    StandingAnim();
    return EReturn();
  };

  GroundHit(EVoid) : CEnemyFly::GroundHit {
    if (CalcDist(m_penEnemy) > HIT_GROUND) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn();
    }
    StartModelAnim(DUMDUM_ANIM_ATTACK, 0);
    StopMoving();
    autowait(0.1f);
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
    // damage enemy
    autowait(0.15f);
    // damage enemy
    if (CalcDist(m_penEnemy) < HIT_GROUND) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 3.0f, FLOAT3D(0, 0, 0), vDirection);
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
    autowait(0.25f);

    StandingAnim();
    return EReturn();
  };

 // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {

    if (m_DumChar==DUM_TWEED)
    {
      m_soPropeller.Set3DParameters(50.0f, 2.0f, 1.0f, 1.0f);
      PlaySound(m_soPropeller, SOUND_FLY, SOF_3D|SOF_LOOP);
    }
    return EReturn();
  }

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    m_sptType = SPT_SLIME;
    if (m_DumChar==DUM_DUM) {
      SetHealth(40.0f);
      m_fMaxHealth = 40.0f;
      // damage/explode properties
      m_fBlowUpAmount = 0.0f;
      m_fBodyParts = 3;
      m_fBlowUpSize = 2.0f;
      m_fDamageWounded = 10.0f;
    } else {
      SetHealth(40.0f);
      m_fMaxHealth = 40.0f;
      // damage/explode properties
      m_fBlowUpAmount = 0.0f;
      m_fBodyParts = 3;
      m_fBlowUpSize = 2.0f;
      m_fDamageWounded = 10.0f;
    }
    en_fDensity = 800.0f;

    // set your appearance
    if (m_DumChar==DUM_DUM) {
    SetModel(MODEL_DUMDUM);
    SetModelMainTexture(TEXTURE_DUMDUM);
      if (m_EeftType==EFT_FLY_GROUND_GROUND | EFT_FLY_GROUND_AIR | EFT_FLY_AIR_GROUND | EFT_FLY_AIR_AIR | EFT_FLY_ONLY) {
      m_EeftType=EFT_GROUND_ONLY; }
      GetModelObject()->StretchModel(FLOAT3D(0.75f, 0.75f, 0.75f));
      ModelChangeNotify();
      m_iScore = 200;
    } else {
      SetModel(MODEL_TWEEDLE);
      SetModelMainTexture(TEXTURE_DUMDUM);
      AddAttachment(TWEEDLE_ATTACHMENT_PROPELLER, MODEL_PROPELLER, TEXTURE_DUMDUM);
      if (m_EeftType==EFT_FLY_GROUND_GROUND | EFT_FLY_GROUND_AIR | EFT_FLY_AIR_GROUND | EFT_FLY_AIR_AIR | EFT_GROUND_ONLY) {
      m_EeftType=EFT_FLY_ONLY; }
      m_iScore = 300;
      GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
      ModelChangeNotify();
    }
    if (m_bInvisible) {
      GetModelObject()->mo_colBlendColor = C_WHITE|0x25;
      m_iScore*=2;
    }
    // setup moving speed
    m_fWalkSpeed = FRnd() + 1.5f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 500.0f;
      m_fAttackRunSpeed = FRnd()*2.0f + 9.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 9.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 3.0f;
    m_fStopDistance = 1.5f;
    m_fAttackFireTime = 2.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 200.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd()*2.0f + 3.0f;
    m_aFlyWalkRotateSpeed = FRnd()*20.0f + 600.0f;
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 10.0f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 300.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 10.0f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 300.0f;
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
    m_soPropeller.Set3DParameters(25.0f, 0.0f, 1.0f, 1.0f);

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

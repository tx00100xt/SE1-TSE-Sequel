323
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Crabman/Crabman2.h"
%}

uses "EntitiesMP/EnemyBase";

enum CrabChar {
  0 CRAB_SOLDIER   "Soldier",    // soldier
  1 CRAB_SERGEANT  "Sergeant",   // sergeant
};

%{
// info structure
static EntityInfo eiCrabmanBig = {
  EIBT_FLESH, 3000.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiCrabmanSmall = {
  EIBT_FLESH, 1500.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};

#define HIT_GROUND  7.0f
#define HIT_BIG  18.0f
#define FIRE_GROUND   FLOAT3D(0.75f, 1.5f, -1.25f)
%}


class CCrabman : CEnemyBase {
name      "Crabman";
thumbnail "Thumbnails\\Crabman.tbn";

properties:
  1 enum CrabChar m_CrabChar "Character" 'C' = CRAB_SOLDIER,      // character
  2 BOOL  m_bInvulnerable = FALSE, // can we be hurt?

components:
  0 class   CLASS_BASE        "Classes\\EnemyBase.ecl",
  1 model   MODEL_CRABMAN      "ModelsF\\Enemies\\Crabman\\Crabman2.mdl",
  2 texture TEXTURE_CRABMAN_SOLDIER    "ModelsF\\Enemies\\Crabman\\Textures\\Crab_diffuse_Green.tex",
  3 texture TEXTURE_CRABMAN_SERGEANT   "ModelsF\\Enemies\\Crabman\\Textures\\Crab_diffuse_Red.tex",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\Enemies\\Crabman\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\Enemies\\Crabman\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\Enemies\\Crabman\\Sounds\\Wound.wav",
 54 sound   SOUND_PUNCH     "ModelsF\\Enemies\\Crabman\\Sounds\\Attack.wav",
 55 sound   SOUND_DEATH     "ModelsF\\Enemies\\Crabman\\Sounds\\Death.wav",

 30 model   MODEL_DEBRIS_SHELL           "ModelsF\\Enemies\\Crabman\\Debris\\shell.mdl",
 31 model   MODEL_DEBRIS_ARM           "ModelsF\\Enemies\\Crabman\\Debris\\Arm.mdl",
 32 model   MODEL_DEBRIS_LEGS           "ModelsF\\Enemies\\Crabman\\Debris\\Legs.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_YELLOW  "ModelsF\\Effects\\Debris\\Flesh\\FleshYellow.tex",

 60 model   MODEL_EYE            "Models\\Enemies\\Headman\\Projectile\\Bomb.mdl",
 61 texture TEXTURE_EYE            "Models\\Enemies\\Headman\\Projectile\\Bomb.tex",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
      str.PrintF(TRANS("%s was cut in half by a Brachyan"), (const char *) strPlayerName);
    return str;
  }

  BOOL ForcesCannonballToExplode(void)
  {
    if (m_CrabChar==CRAB_SERGEANT) {
      return TRUE;
    }
    return CEnemyBase::ForcesCannonballToExplode();
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_PUNCH);
    PrecacheSound(SOUND_DEATH);

    PrecacheModel(MODEL_DEBRIS_SHELL);
    PrecacheModel(MODEL_DEBRIS_ARM);
    PrecacheModel(MODEL_DEBRIS_LEGS);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_YELLOW);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_CrabChar==CRAB_SERGEANT) {
      return &eiCrabmanBig;
    } else {
      return &eiCrabmanSmall;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable) {
      return;
    }

    // crabman can't harm crabman
    if (!IsOfClass(penInflictor, "Crabman")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSergeant, "DataF\\Messages\\Enemies\\CrabmanRed.txt");
    static DECLARE_CTFILENAME(fnmSoldier , "DataF\\Messages\\Enemies\\CrabmanGreen.txt");
    switch(m_CrabChar) {
    default: ASSERT(FALSE);
    case CRAB_SERGEANT: return fnmSergeant;
    case CRAB_SOLDIER : return fnmSoldier;
    }
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    StartModelAnim(CRABMAN2_ANIM_DEFEND, 0);
    return CRABMAN2_ANIM_DEFEND;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    iAnim = CRABMAN2_ANIM_DEATH;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==CRABMAN2_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,1)*0.75f;
      return 0.5f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(CRABMAN2_COLLISION_BOX_PART_NAME);
    en_fDensity = 1000.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(CRABMAN2_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
    StartModelAnim(CRABMAN2_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
    StartModelAnim(CRABMAN2_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    WalkingAnim();
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


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(120.0f, 25.0f, 2.0f, 1.0f);
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


      ULONG ulFleshTexture = TEXTURE_FLESH_YELLOW;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_GOOTRAIL, BET_GOOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_DEBRIS_SHELL, TEXTURE_CRABMAN_SOLDIER, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, TEXTURE_CRABMAN_SOLDIER, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, TEXTURE_CRABMAN_SOLDIER, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEGS, TEXTURE_CRABMAN_SOLDIER, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 1.0f,
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

/************************************************************
 *                     MOVING FUNCTIONS                     *
 ************************************************************/
  // check whether may move while attacking
  BOOL MayMoveToAttack(void) 
  {
      return CEnemyBase::MayMoveToAttack();
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

  Hit(EVoid) : CEnemyBase::Hit {
    if (CalcDist(m_penEnemy) > m_fCloseDistance) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn();
    }
    StartModelAnim(CRABMAN2_ANIM_ATTACK, 0);
    PlaySound(m_soSound, SOUND_PUNCH, SOF_3D);
    StopMoving();
    // damage enemy
    autowait(0.5f);
    // damage enemy
    if (m_CrabChar==CRAB_SERGEANT) {
      if (CalcDist(m_penEnemy) < m_fCloseDistance) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.SafeNormalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection);
		}
      }
    else {
      if (CalcDist(m_penEnemy) < m_fCloseDistance) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.SafeNormalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 15.0f, FLOAT3D(0, 0, 0), vDirection);
		}
      }
    autowait(0.4f);
    // damage enemy
    if (m_CrabChar==CRAB_SERGEANT) {
      if (CalcDist(m_penEnemy) < m_fCloseDistance) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.SafeNormalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection);

        // push target
        FLOAT3D vSpeed;
        GetHeadingDirection(AngleDeg(0.0f), vSpeed);
        vSpeed = vSpeed * 40.0f;
        KickEntity(m_penEnemy, vSpeed);
		}
      }
    else {
      if (CalcDist(m_penEnemy) < m_fCloseDistance) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.SafeNormalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 15.0f, FLOAT3D(0, 0, 0), vDirection);

        // push target
        FLOAT3D vSpeed;
        GetHeadingDirection(AngleDeg(0.0f), vSpeed);
        vSpeed = vSpeed * 30.0f;
        KickEntity(m_penEnemy, vSpeed);
		}
      }
    autowait(0.5f);

    StandingAnim();
    return EReturn();
  };
/************************************************************
 *                PROCEDURES WHEN HARMED                    *
 ************************************************************/
  // Play wound animation and falling body part
  BeWounded(EDamage eDamage) : CEnemyBase::BeWounded {
    StopMoving();
    StartModelAnim(CRABMAN2_ANIM_DEFEND, 0);
    m_bInvulnerable = TRUE;
    autowait(GetModelObject()->GetAnimLength(CRABMAN2_ANIM_DEFEND));
    m_bInvulnerable = FALSE;
    return EReturn();
  };

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    m_sptType = SPT_GOO;
    if (m_CrabChar==CRAB_SERGEANT) {
      SetHealth(600.0f);
      m_fMaxHealth = 600.0f;
      // damage/explode properties
      m_fBlowUpAmount = 130000000000.0f;
      m_fBodyParts = 5;
      m_fBlowUpSize = 2.5f;
      m_fDamageWounded = 100.0f;
    } else {
      SetHealth(300.0f);
      m_fMaxHealth = 300.0f;
      // damage/explode properties
      m_fBlowUpAmount = 1000.0f;
      m_fBodyParts = 6.0f;
      m_fBlowUpSize = 1.0f;
      m_fDamageWounded = 100.0f;
    }
    en_fDensity = 5000.0f;

    // set your appearance
    SetModel(MODEL_CRABMAN);
    if (m_CrabChar==CRAB_SERGEANT) {
      SetModelMainTexture(TEXTURE_CRABMAN_SERGEANT);
      GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
      AddAttachment(CRABMAN2_ATTACHMENT_EYE1, MODEL_EYE, TEXTURE_EYE);
      CModelObject *pmoEye1 = &GetModelObject()->GetAttachmentModel(CRABMAN2_ATTACHMENT_EYE1)->amo_moModelObject;
      pmoEye1->StretchModel(FLOAT3D(2,2,2));
      AddAttachment(CRABMAN2_ATTACHMENT_EYE2, MODEL_EYE, TEXTURE_EYE);
      CModelObject *pmoEye2 = &GetModelObject()->GetAttachmentModel(CRABMAN2_ATTACHMENT_EYE2)->amo_moModelObject;
      pmoEye2->StretchModel(FLOAT3D(2,2,2));
      ModelChangeNotify();
      m_iScore = 6000;
    } else {
      m_iScore = 3000;
      SetModelMainTexture(TEXTURE_CRABMAN_SOLDIER);
      GetModelObject()->StretchModel(FLOAT3D(0.5f, 0.5f, 0.5f));
      AddAttachment(CRABMAN2_ATTACHMENT_EYE1, MODEL_EYE, TEXTURE_EYE);
      CModelObject *pmoEye1 = &GetModelObject()->GetAttachmentModel(CRABMAN2_ATTACHMENT_EYE1)->amo_moModelObject;
      pmoEye1->StretchModel(FLOAT3D(1,1,1));
      AddAttachment(CRABMAN2_ATTACHMENT_EYE2, MODEL_EYE, TEXTURE_EYE);
      CModelObject *pmoEye2 = &GetModelObject()->GetAttachmentModel(CRABMAN2_ATTACHMENT_EYE2)->amo_moModelObject;
      pmoEye2->StretchModel(FLOAT3D(1,1,1));
      ModelChangeNotify();
    }
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 1.5f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 500.0f;
    if (m_CrabChar==CRAB_SERGEANT) {
      m_fAttackRunSpeed = FRnd()*2.0f + 17.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 17.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseDistance = 15.0f;
      m_fStopDistance = 14.0f;
    } else {
      m_fAttackRunSpeed = FRnd()*2.0f + 15.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 15.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseDistance = 7.0f;
      m_fStopDistance = 6.0f;
    }
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fAttackFireTime = 2.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 200.0f;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

320
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/Floater/Floater.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiFloater = {
  EIBT_ROBOT, 1500.0f,
  0.0f, 0.0f, 0.0f,
  0.0f, 0.0f, 0.0f,
};

#define FIRE_AIR      FLOAT3D(0.0f, 0.0f, -0.4f)
#define KICK_AIR    3.0f
%}


class CFloater : CEnemyFly {
name      "Floater";
thumbnail "Thumbnails\\Floater.tbn";

properties:

  5 CSoundObject m_soBackground,  // sound channel for background noise

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_FLOATER       "ModelsMP\\Enemies\\SS2\\Floater\\Floater.mdl",
  2 texture TEXTURE_FLOATER     "ModelsMP\\Enemies\\SS2\\Floater\\Floater.tex",
  3 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** FLESH PARTS **************
  6 model   MODEL_WING         "ModelsMP\\Enemies\\SS2\\Floater\\Debris\\Wing.mdl",

// ************** SOUNDS **************
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Sight.wav",
 53 sound   SOUND_FIRE      "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Kick.wav",
 55 sound   SOUND_DEATH     "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Death1.wav",
 56 sound   SOUND_ENGINE    "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Engine.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Sirian Floater ended %s"), (const char *) strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm,  "DataMP\\Messages\\Enemies\\SS2\\Floater.txt");
    return fnm;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_ENGINE);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_DEATH);
    PrecacheClass(CLASS_PROJECTILE, PRT_LASER_FLOATER);

    PrecacheModel(MODEL_WING);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_FLOATER_SPLAT_FX);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
      return &eiFloater;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // woman can't harm woman
    if (!IsOfClass(penInflictor, "Floater")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };
  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(FLOATER_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLOATER_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLOATER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLOATER_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLOATER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
  };

  // virtual sound functions
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soBackground.Set3DParameters(50.0f, 0.0f, 1.0f, 1.0f);
  }


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

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

  // explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_GREEN|CT_OPAQUE;
      eSpawnEffect.betType = BET_LIGHT_CANNON;
      eSpawnEffect.vStretch = FLOAT3D(0.75f,0.75f,0.75f);
      penExplosion->Initialize(eSpawnEffect);

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPR_SMOKETRAIL, BET_EXPLOSIONSTAIN, fEntitySize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_WING, TEXTURE_FLOATER, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WING, TEXTURE_FLOATER, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLOATER_SPLAT_FX;
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
  FlyFire(EVoid) : CEnemyFly::FlyFire {

    // fire projectile
    StartModelAnim(FLOATER_ANIM_FIRE, 0);
    autowait(0.6f);
    ShootProjectile(PRT_LASER_FLOATER, FIRE_AIR, ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.6f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };

  FlyHit(EVoid) : CEnemyFly::FlyHit {
    if (CalcDist(m_penEnemy) > KICK_AIR) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn();
    }
    StartModelAnim(FLOATER_ANIM_MELEE, 0);
    StopMoving();
    autowait(0.4f);
    // damage enemy
    if (CalcDist(m_penEnemy) < KICK_AIR) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 3.0f, FLOAT3D(0, 0, 0), vDirection);
      PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    }
    autowait(0.3f);
    // damage enemy
    if (CalcDist(m_penEnemy) < KICK_AIR) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 3.0f, FLOAT3D(0, 0, 0), vDirection);
      PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    }
    autowait(0.24f);

    StandingAnim();
    return EReturn();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {

      PlaySound(m_soBackground, SOUND_ENGINE, SOF_3D|SOF_LOOP);
    return EReturn();
  }

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyFly::Death {
    jump CEnemyFly::Death();
  };



/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS|EPF_HASGILLS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    SetHealth(30.0f);
    m_fMaxHealth = 30.0f;
    en_fDensity = 1000.0f;
	m_EeftType=EFT_FLY_ONLY;
    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;
    

    // set your appearance
    SetModel(MODEL_FLOATER);
    SetModelMainTexture(TEXTURE_FLOATER);
    // setup moving speed
    // fly moving properties
      m_fFlyWalkSpeed = FRnd()*2.0f + 20.0f;
      m_aFlyWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 45.0f);
      m_fFlyAttackRunSpeed = m_fFlyWalkSpeed;
      m_aFlyAttackRotateSpeed = AngleDeg(FRnd()*60 + 100.0f);
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 20.0f;
      m_aFlyCloseRotateSpeed = 150.0f;
      // attack properties - CAN BE SET
      m_fFlyAttackDistance = 100.0f;
      m_fFlyCloseDistance = 3.0f;
      m_fFlyStopDistance = 0.1f;
      m_fFlyAttackFireTime = 2.0f;
      m_fFlyCloseFireTime = 0.5f;
      m_fFlyIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 0.0f;
    m_bRobotBlowup = TRUE;
    m_fBodyParts = 3;
    m_fDamageWounded = 1000000.0f;
    m_iScore = 400;

    // set stretch factors for height and width
    GetModelObject()->StretchModel(FLOAT3D(2.0f, 2.0f, 2.0f));
    ModelChangeNotify();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

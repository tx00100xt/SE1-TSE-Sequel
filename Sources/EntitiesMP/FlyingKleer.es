320
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/FlyingKleer/FlyingKleer.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiKleerFly = {
 EIBT_BONES, 250.0f,
 0.0f, 1.9f, 0.0f,    // source (eyes)
 0.0f, 1.9f, 0.0f,    // target (body)
};

#define FIRE_AIR      FLOAT3D(0.0f, 0.85f, -2.25f)
%}


class CFlyingKleer : CEnemyFly {
name      "FlyingKleer";
thumbnail "Thumbnails\\FlyingKleer.tbn";

properties:

  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bWingSoundPlaying = TRUE,

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_FK       "ModelsMP\\Enemies\\SS2\\FlyingKleer\\FlyingKleer.mdl",
  2 texture TEXTURE_FK     "ModelsMP\\Enemies\\SS2\\FlyingKleer\\FlyingKleer.tex",
  3 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
 
  5 model   MODEL_GUN       "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Blunderbuss.mdl",
  6 texture TEXTURE_GUN       "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Blunderbuss.tex",

// ************** BODY PARTS **************
  7 model   MODEL_HEAD          "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Debris\\Head.mdl",
  8 model   MODEL_WING          "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Debris\\Wing.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Sounds\\Melee.wav",
 55 sound   SOUND_DEATH     "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Sounds\\Death.wav",
 56 sound   SOUND_WING      "ModelsMP\\Enemies\\SS2\\FlyingKleer\\Sounds\\Wing.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A kleer dragged %s to hell"), (const char *) strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm,  "DataMP\\Messages\\Enemies\\SS2\\FlyingKleer.txt");
    return fnm;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_WING );
    PrecacheClass(CLASS_PROJECTILE, PRT_DRAGONMAN_STRONG_FIRE);
    PrecacheModel(MODEL_HEAD);
    PrecacheModel(MODEL_WING);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_BONE_SPLAT_FX);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
      return &eiKleerFly;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // woman can't harm woman
    if (!IsOfClass(penInflictor, "FlyingKleer")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    iAnim = FLYINGKLEER_ANIM_Wound;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  void LeaveStain(BOOL bGrow)
  {
    // boneman doesn't leave bloody stain
  }

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = FLYINGKLEER_ANIM_Death_Air;
    }
    StartModelAnim(iAnim, 0);
    DeactivateWingSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    vStretch=FLOAT3D(1,1,2)*1.0f;
    return 0.6f;
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(FLYINGKLEER_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLYINGKLEER_ANIM_Idle, AOF_LOOPING|AOF_NORESTART);
      ActivateWingSound();
    }
  };
  void WalkingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLYINGKLEER_ANIM_Idle, AOF_LOOPING|AOF_NORESTART);
      ActivateWingSound();
    }
  };
  void RunningAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLYINGKLEER_ANIM_Fly, AOF_LOOPING|AOF_NORESTART);
      ActivateWingSound();
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(FLYINGKLEER_ANIM_Idle, AOF_LOOPING|AOF_NORESTART);
      ActivateWingSound();
    }
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

  // wing sounds
  void ActivateWingSound(void)
  {
    if (!m_bWingSoundPlaying) {
      PlaySound(m_soFeet, SOUND_WING, SOF_3D|SOF_LOOP);
      m_bWingSoundPlaying = TRUE;
    }
  }
  void DeactivateWingSound(void)
  {
    m_soFeet.Stop();
    m_bWingSoundPlaying = FALSE;
  }

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soFeet.Set3DParameters(50.0f, 0.0f, 1.0f, 1.0f);
    PlaySound(m_soFeet, SOUND_WING, SOF_3D|SOF_LOOP);
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

      // spawn explosion
    Debris_Begin(EIBT_BONES, DPR_SMOKETRAIL, BET_NONE, fEntitySize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_FK, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WING, TEXTURE_FK, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WING, TEXTURE_FK, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      eSpawnEffect.vStretch = FLOAT3D(1.0f,1.0f,1.0f);
      penExplosion->Initialize(eSpawnEffect);

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_BONE_SPLAT_FX;
      penSplat->Initialize(ese);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };
  

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  FlyFire(EVoid) : CEnemyFly::FlyFire {

    // fire projectile
    StartModelAnim(FLYINGKLEER_ANIM_Fire, 0);
    ShootProjectile(PRT_DRAGONMAN_STRONG_FIRE, FIRE_AIR, ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.6f);
    StartModelAnim(FLYINGKLEER_ANIM_Fire, 0);
    ShootProjectile(PRT_DRAGONMAN_STRONG_FIRE, FIRE_AIR, ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.6f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };
  
  FlyHit(EVoid) : CEnemyFly::FlyHit {

    // if enemy near
    if (CalcDist(m_penEnemy) <= 10.0f) {
        jump FlyOnEnemy();{
      }
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.25f;
    return EReturn();
  };

  FlyOnEnemy(EVoid) {
    StartModelAnim(FLYINGKLEER_ANIM_Melee, 0);

    // jump
    FLOAT3D vDir = PlayerDestinationPos();
    vDir = (vDir - GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*1.5f;
    vDir(2) = -10.0f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.9f, 0);
    m_iChargeHitAnimation = FLYINGKLEER_ANIM_Melee;
    m_fChargeHitDamage = 20.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 10.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;

    StandingAnim();
    autowait(0.3f);
    return EReturn();
  };

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
    SetHealth(125.0f);
    m_fMaxHealth = 125.0f;
    en_fDensity = 2000.0f;
	m_EeftType=EFT_FLY_ONLY;
    

    // set your appearance
    SetModel(MODEL_FK);
    SetModelMainTexture(TEXTURE_FK);
    StandingAnim();
    m_sptType = SPT_BONES;

    AddAttachment(FLYINGKLEER_ATTACHMENT_BLUNDERBUSS, MODEL_GUN, TEXTURE_GUN);

    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd()*3.0f + 10.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 13.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 30.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 200.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd() + 2.5f;
    m_aFlyWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fFlyAttackRunSpeed = FRnd()*3.0f + 10.0f;
    m_aFlyAttackRotateSpeed = FRnd()*200 + 600.0f;;
    m_fFlyCloseRunSpeed = FRnd() + 13.0f;
    m_aFlyCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 105.0f;
    m_fFlyCloseDistance = 30.5f;
    m_fFlyStopDistance = 2.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 80.0f;
    m_fBodyParts = 3;
    m_fDamageWounded = 80.0f;
    m_iScore = 1500;

    // set stretch factors for height and width
    CEnemyBase::SizeModel();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

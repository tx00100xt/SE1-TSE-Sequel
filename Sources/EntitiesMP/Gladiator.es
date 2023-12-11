305
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/Gladiator/Gladiator.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiGladiator = {
 EIBT_FLESH, 350.0f,
 0.0f, 1.9f, 0.0f,    // source (eyes)
 0.0f, 1.9f, 0.0f,    // target (body)
};

#define SWORD_HIT 9.0f
#define CHARGE_DIST 12.0f
#define SWORD_IMPACT   FLOAT3D(0.0f, 0.0f, -6.0f)
%}


class CGladiator : CEnemyBase {
name      "Gladiator";
thumbnail "Thumbnails\\Gladiator.tbn";

properties:
  2 BOOL m_bFistHit = FALSE,          // used for close attack
  3 BOOL m_bTouchAnother = FALSE,     // another entity touched on far attack
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,
  6 BOOL m_bMumbleSoundPlaying = FALSE,
  7 CSoundObject m_soMumble,

components:
  0 class   CLASS_BASE        "Classes\\EnemyBase.ecl",
  1 model   MODEL_GLAD     "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Gladiator.mdl",
  2 texture TEXTURE_GLAD   "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Gladiator.tex",
  7 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** BONEMAN PARTS **************
 10 model     MODEL_ARM   "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Debris\\Arm.mdl",
 12 model     MODEL_HEAD   "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Debris\\Head.mdl",
 15 model     MODEL_LEG   "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Debris\\Leg.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Wound.wav",
 53 sound   SOUND_ATTACK    "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Attack.wav",
 56 sound   SOUND_DEATH     "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Death.wav",
 57 sound   SOUND_RUN       "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Footsteps.wav",
 58 sound   SOUND_MUMBLE    "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Grunting.wav",
 59 sound   SOUND_RECHARGE  "ModelsF\\NextEncounter\\Enemies\\Gladiator\\Sounds\\Recharge.wav",

functions:
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_ATTACK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_RUN  );
    PrecacheSound(SOUND_RECHARGE);
    PrecacheSound(SOUND_MUMBLE);

    PrecacheModel(MODEL_ARM);
    PrecacheModel(MODEL_HEAD);
    PrecacheModel(MODEL_LEG);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_FLESH_SPLAT_FX);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
      str.PrintF(TRANS("A porcine berserker has clobbered %s"), strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\NE\\Gladiator.txt");
    return fnm;
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiGladiator;
  };

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
      InflictRangeDamage(this, DMT_IMPACT, 20.0f, vSource+SWORD_IMPACT*m, 0.5f, 2.5f);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // boneman can't harm boneman
    if (!IsOfClass(penInflictor, "Gladiator")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
	  if (fDamageDir<0) {
          iAnim = GLADIATOR_ANIM_WOUNDBACKWARD;
        } else {
          iAnim = GLADIATOR_ANIM_WOUNDFORWARD;
        }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    DeactivateMumblingSound();
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    switch (IRnd()%2) {
      case 0: iAnim = GLADIATOR_ANIM_DEATH1; break;
      case 1: iAnim = GLADIATOR_ANIM_DEATH2; break;
      default: ASSERTALWAYS("Gladiator unknown death");
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    DeactivateMumblingSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==GLADIATOR_ANIM_DEATH1)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.48f;
    }
    else if(GetModelObject()->GetAnim()==GLADIATOR_ANIM_DEATH2)
    {
      vStretch=FLOAT3D(1,1,2)*0.75f;
      return 0.48f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(GLADIATOR_COLLISION_BOX_PART_NAME);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(GLADIATOR_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
    DeactivateMumblingSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(GLADIATOR_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
    ActivateMumblingSound();
  };
  void RunningAnim(void) {
    StartModelAnim(GLADIATOR_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
    ActivateMumblingSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(GLADIATOR_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
    ActivateMumblingSound();
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


  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soFeet, SOUND_RUN, SOF_3D|SOF_LOOP);
      m_bRunSoundPlaying = TRUE;
    }
  }
  void DeactivateRunningSound(void)
  {
    m_soFeet.Stop();
    m_bRunSoundPlaying = FALSE;
  }

  // mumbling sounds
  void ActivateMumblingSound(void)
  {
    if (!m_bMumbleSoundPlaying) {
      PlaySound(m_soMumble, SOUND_MUMBLE, SOF_3D|SOF_LOOP);
      m_bMumbleSoundPlaying = TRUE;
    }
  }
  void DeactivateMumblingSound(void)
  {
    m_soMumble.Stop();
    m_bMumbleSoundPlaying = FALSE;
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

      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_GLAD, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_GLAD, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_GLAD, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_GLAD, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
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
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  Hit(EVoid) : CEnemyBase::Hit {

    // hit
    if (CalcDist(m_penEnemy) < 7.0f) {
      jump Swing();
    }

    // jump
    else if (CalcDist(m_penEnemy) < CHARGE_DIST) {
      jump JumpOnEnemy();
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    return EReturn();
  };

  // jump on enemy
  JumpOnEnemy(EVoid) {
    StartModelAnim(GLADIATOR_ANIM_ATTACKRUN, 0);
    DeactivateRunningSound();

    // jump
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*2.0f;
    vDir(2) = 2.5f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    m_iChargeHitAnimation = GLADIATOR_ANIM_ATTACKRUN;
    m_fChargeHitDamage = 10.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 20.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;

	//sword slash
    if (CalcDist(m_penEnemy)<SWORD_HIT) { 
    HitGround(); }

    StartModelAnim(GLADIATOR_ANIM_ATTACKRECHARGE, AOF_SMOOTHCHANGE);
    PlaySound(m_soSound, SOUND_RECHARGE, SOF_3D);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    autowait(GetModelObject()->GetAnimLength(GLADIATOR_ANIM_ATTACKRECHARGE) - _pTimer->TickQuantum); 
    return EReturn();
  };

  // hit with bones
  Swing(EVoid) {
    // attack with bones
    StartModelAnim(GLADIATOR_ANIM_ATTACK, 0);
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
    DeactivateRunningSound();

    m_bFistHit = FALSE;
    autowait(0.55f);
    if (CalcDist(m_penEnemy)<SWORD_HIT) { m_bFistHit = TRUE; }
    autowait(0.10f);
    if (CalcDist(m_penEnemy)<SWORD_HIT) { m_bFistHit = TRUE; }
    if (m_bFistHit) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      // damage enemy
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
      // push target
      FLOAT3D vSpeed;
      GetHeadingDirection(AngleDeg(0.0f), vSpeed);
      vSpeed = vSpeed * 30.0f;
      KickEntity(m_penEnemy, vSpeed);
    }
    autowait(1.35f);
    return EReturn();
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
    SetHealth(140.0f);
    m_fMaxHealth = 140.0f;
    en_fDensity = 2000.0f;
    en_tmMaxHoldBreath = 25.0f;

    // set your appearance
    SetModel(MODEL_GLAD);
    SetModelMainTexture(TEXTURE_GLAD);
    StandingAnim();
    m_sptType = SPT_BLOOD;
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd()*3.0f + 10.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 10.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 12.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 280.0f;
    m_fBodyParts = 7;
    m_fDamageWounded = 60.0f;
    m_iScore = 1200;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    // set stretch factors for height and width
    CEnemyBase::SizeModel();
    m_soFeet.Set3DParameters(80.0f, 5.0f, 1.0f, 1.0f);
    m_soMumble.Set3DParameters(30.0f, 5.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

320
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/DevilStallion/DevilStallion.h"
%}

uses "EntitiesMP/EnemyFly";

%{
// info structure
static EntityInfo eiDsStand = {
  EIBT_FIRE, 1200.0f,
  0.0f, 1.55f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiDsFly = {
  EIBT_FIRE, 1200.0f*1,
  0.0f, 0.0f, 0.0f,
  0.0f, 0.0f, 0.0f,
};

#define FLAME_AIR1          FLOAT3D( 0.0f, 4.5f, -1.0f)
#define FLAME_GROUND1       FLOAT3D( 0.0f, 4.0f, -1.0f)

#define ATTACK_AIR          FLOAT3D( 0.0f, 4.0f, -1.0f)
#define ATTACK_GROUND       FLOAT3D( 0.0f, 3.5f, -0.85f)
%}


class CDevilStallion : CEnemyFly {
name      "DevilStallion";
thumbnail "Thumbnails\\DevilStallion.tbn";

properties:
  6 FLOAT3D m_vFlameSource = FLOAT3D(0,0,0),
  7 CEntityPointer m_penFlame,
  8 BOOL m_bBurnEnemy = FALSE,
  9 FLOAT m_fFireTime = 0.0f,
 10 BOOL m_bBeBoss  "Boss" 'B' = FALSE,

  4 CSoundObject m_soWings,            // for running sound
  5 BOOL m_bFlySoundPlaying = FALSE,

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_DS       "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\DevilStallion.mdl",
  2 texture TEXTURE_DS     "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\DevilStallion.tex",
  3 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
  5 class   CLASS_FLAME         "Classes\\Flame.ecl",

 14 model   MODEL_ARM           "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Debris\\Arm.mdl",
 15 model   MODEL_LEG           "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Debris\\Leg.mdl",
 16 model   MODEL_HEAD          "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Debris\\Head.mdl",
 17 model   MODEL_WING          "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Debris\\Wing.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Sounds\\Breath.wav",
 54 sound   SOUND_ATTACK    "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Sounds\\Attack.wav",
 55 sound   SOUND_DEATH     "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Sounds\\Death.wav",
 56 sound   SOUND_WINGS     "ModelsF\\NextEncounter\\Enemies\\DevilStallion\\Sounds\\Wings.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
      str.PrintF(TRANS("A Devil Stallion has slain %s"), (const char *) strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm,  "DataF\\Messages\\Enemies\\NE\\DevilStallion.txt");
    return fnm;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_ATTACK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_WINGS);
    PrecacheClass(CLASS_PROJECTILE, PRT_METEOR_SMALL);
    PrecacheClass(CLASS_FLAME);


	PrecacheModel(MODEL_ARM);
	PrecacheModel(MODEL_LEG);
	PrecacheModel(MODEL_HEAD);
	PrecacheModel(MODEL_WING);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_bInAir) {
      return &eiDsFly;
    } else {
      return &eiDsStand;
    }
  };

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // woman can't harm woman
    if (!IsOfClass(penInflictor, "DevilStallion")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
    if (m_bInAir) {
      ActivateFlyingSound();
	  if (fDamageDir<0) {
        iAnim = DEVILSTALLION_ANIM_FLYWOUNDBACKWARD; }
		else { 
        iAnim = DEVILSTALLION_ANIM_FLYWOUNDFORWARD; }
    } else {
      DeactivateFlyingSound();
	  if (fDamageDir<0) {
        iAnim = DEVILSTALLION_ANIM_GROUNDWOUNDBACKWARD; }
		else { 
        iAnim = DEVILSTALLION_ANIM_GROUNDWOUNDFORWARD; }
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (m_bInAir) {
    DeactivateFlyingSound();
    switch (IRnd()%2) {
      case 0: iAnim = DEVILSTALLION_ANIM_FLYDEATH1; break;
      case 1: iAnim = DEVILSTALLION_ANIM_FLYDEATH2; break;
      default: ASSERTALWAYS("DevilStallion unknown death");
      }
    } else {
      DeactivateFlyingSound();
      iAnim = DEVILSTALLION_ANIM_GROUNDDEATH;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==DEVILSTALLION_ANIM_FLYDEATH1)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.6f;
    }
    if(GetModelObject()->GetAnim()==DEVILSTALLION_ANIM_FLYDEATH2)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.6f;
    }
    if(GetModelObject()->GetAnim()==DEVILSTALLION_ANIM_GROUNDDEATH)
    {
      vStretch=FLOAT3D(1,1,2)*0.75f;
      return 0.525f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(DEVILSTALLION_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bInAir) {
      ActivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_FLYIDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      DeactivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_GROUNDIDLE, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if (m_bInAir) {
      ActivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_FLYIDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      DeactivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_GROUNDWALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    if (m_bInAir) {
      ActivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_FLYIDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      DeactivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_GROUNDRUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      ActivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_FLYIDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      DeactivateFlyingSound();
      StartModelAnim(DEVILSTALLION_ANIM_GROUNDWALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  FLOAT AirToGroundAnim(void) {
    StartModelAnim(DEVILSTALLION_ANIM_LAND, 0);
      DeactivateFlyingSound();
    return(GetModelObject()->GetAnimLength(DEVILSTALLION_ANIM_LAND));
  };
  FLOAT GroundToAirAnim(void) {
    StartModelAnim(DEVILSTALLION_ANIM_LAUNCH, 0);
    ActivateFlyingSound();
    return(GetModelObject()->GetAnimLength(DEVILSTALLION_ANIM_LAUNCH));
  };
  void ChangeCollisionToAir() {
    ChangeCollisionBoxIndexWhenPossible(DEVILSTALLION_COLLISION_BOX_INAIR);
  };
  void ChangeCollisionToGround() {
    ChangeCollisionBoxIndexWhenPossible(DEVILSTALLION_COLLISION_BOX_ONGROUND);
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


  // wing flapping sounds
  void ActivateFlyingSound(void)
  {
    if (!m_bFlySoundPlaying) {
      PlaySound(m_soWings, SOUND_WINGS, SOF_3D|SOF_LOOP);
      m_bFlySoundPlaying = TRUE;
    }
  }
  void DeactivateFlyingSound(void)
  {
    m_soWings.Stop();
    m_bFlySoundPlaying = FALSE;
  }

  // flame source
  void GetFlamerSourcePlacement(CPlacement3D &plFlame) {
    plFlame.pl_PositionVector = m_vFlameSource;
  };

  // fire flame
  void FireFlame(void) {
    FLOAT3D vFlamePos;
    if (m_bInAir) {
      vFlamePos = FLAME_AIR1;
    } else {
      vFlamePos = FLAME_GROUND1;
    }

    // create flame
    CEntityPointer penFlame = ShootProjectile(PRT_FLAME, vFlamePos, ANGLE3D(0, 0, 0));
    // link last flame with this one (if not NULL or deleted)
    if (m_penFlame!=NULL && !(m_penFlame->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame).m_penParticles = penFlame;
    }
    // link to player weapons
    ((CProjectile&)*penFlame).m_penParticles = this;
    // store last flame
    m_penFlame = penFlame;
    // flame source position
    m_vFlameSource = GetPlacement().pl_PositionVector + vFlamePos*GetRotationMatrix();
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.25f, 1.0f);
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

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, fEntitySize, vNormalizedDamage, vBodySpeed, 3.0f, 1.0f);

    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_DS, 0, 0, 0, 0, 0.2f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_DS, 0, 0, 0, 0, 0.2f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_DS, 0, 0, 0, 0, 0.2f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_DS, 0, 0, 0, 0, 0.2f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WING, TEXTURE_DS, 0, 0, 0, 0, 0.2f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WING, TEXTURE_DS, 0, 0, 0, 0, 0.2f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_DS, 0, 0, 0, 0, 0.2f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.4f,
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
  FlyFire(EVoid) : CEnemyFly::FlyFire {
      ActivateFlyingSound();
    // fire projectile
    StartModelAnim(DEVILSTALLION_ANIM_FLYATTACK, 0);
    autowait(0.6f);
    ShootProjectile(PRT_METEOR_SMALL, ATTACK_AIR, ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
    autowait(0.6f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };


  FlyHit(EVoid) : CEnemyFly::FlyHit {
      ActivateFlyingSound();
    StartModelAnim(DEVILSTALLION_ANIM_FLYBREATH, 0);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(1.0f);

    m_fFireTime = _pTimer->CurrentTick();
    FireFlame();
    m_bBurnEnemy = TRUE;
    while (m_bBurnEnemy) {
      m_fMoveFrequency = 0.1f;
      wait(m_fMoveFrequency) {
        // flame
        on (EBegin) : {
          m_vDesiredPosition = m_penEnemy->GetPlacement().pl_PositionVector;
          // rotate to enemy
          m_fMoveSpeed = 7.0f;
          m_aRotateSpeed = 10000.0f;
          // adjust direction and speed
          SetDesiredMovement(); 
          // flame
          FireFlame();
          // stop
          if (_pTimer->CurrentTick()-m_fFireTime >= 2.8f) {
            m_bBurnEnemy = FALSE;
            stop;
          }
          resume;
        }
        on (ETimer) : { stop; }
      }
    }

    // link last flame with nothing (if not NULL or deleted)
    if (m_penFlame!=NULL && !(m_penFlame->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame).m_penParticles = NULL;
      m_penFlame = NULL;
    }
    // set next shoot time
    m_fShootTime = _pTimer->CurrentTick() + m_fAttackFireTime*(1.5f);

    autowait(0.2f);
    return EReturn();
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyFly::Death {
      DeactivateFlyingSound();
    jump CEnemyFly::Death();
  };

  AirToGround(EVoid) : CEnemyFly::AirToGround {
      DeactivateFlyingSound();
    jump CEnemyFly::AirToGround(EVoid());
  };

  GroundFire(EVoid) : CEnemyFly::GroundFire {
      DeactivateFlyingSound();
    // fire projectile
    StartModelAnim(DEVILSTALLION_ANIM_GROUNDATTACK, 0);
    autowait(0.3f);
    ShootProjectile(PRT_METEOR_SMALL, ATTACK_GROUND, ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
    autowait(0.3f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };


  GroundHit(EVoid) : CEnemyFly::GroundHit {
      DeactivateFlyingSound();
    StartModelAnim(DEVILSTALLION_ANIM_GROUNDBREATH, 0);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(1.0f);

    m_fFireTime = _pTimer->CurrentTick();
    FireFlame();
    m_bBurnEnemy = TRUE;
    while (m_bBurnEnemy) {
      m_fMoveFrequency = 0.1f;
      wait(m_fMoveFrequency) {
        // flame
        on (EBegin) : {
          m_vDesiredPosition = m_penEnemy->GetPlacement().pl_PositionVector;
          // rotate to enemy
          m_fMoveSpeed = 0.0f;
          m_aRotateSpeed = 10000.0f;
          // adjust direction and speed
          SetDesiredMovement(); 
          // flame
          FireFlame();
          // stop
          if (_pTimer->CurrentTick()-m_fFireTime >= 2.8f) {
            m_bBurnEnemy = FALSE;
            stop;
          }
          resume;
        }
        on (ETimer) : { stop; }
      }
    }

    // link last flame with nothing (if not NULL or deleted)
    if (m_penFlame!=NULL && !(m_penFlame->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame).m_penParticles = NULL;
      m_penFlame = NULL;
    }
    // set next shoot time
    m_fShootTime = _pTimer->CurrentTick() + m_fAttackFireTime*(1.5f);

    autowait(0.2f);
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
    SetHealth(500.0f);
    m_fMaxHealth = 500.0f;
    en_tmMaxHoldBreath = 60.0f;
    en_fDensity = 4000.0f;
    m_bBoss = m_bBeBoss;
    
    m_sptType = SPT_BLOOD;

    // set your appearance
    SetModel(MODEL_DS);
    SetModelMainTexture(TEXTURE_DS);
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fAttackRunSpeed = FRnd()*2.0f + 13.0f;
    m_aAttackRotateSpeed = FRnd()*50 + 245.0f;
    m_fCloseRunSpeed = FRnd()*2.0f + 8.0f;
    m_aCloseRotateSpeed = FRnd()*50 + 245.0f;
    // setup attack distances
    m_fAttackDistance = 300.0f;
    m_fCloseDistance = 25.0f;
    m_fStopDistance = 7.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 1000.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd() + 4.0f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*2.0f + 17.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*2.0f + 20.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    m_fGroundToAirSpeed = m_fFlyCloseRunSpeed;
    m_fAirToGroundSpeed = m_fFlyCloseRunSpeed;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 300.0f;
    m_fFlyCloseDistance = 25.0f;
    m_fFlyStopDistance = 15.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 700.0f;
    m_fBodyParts = 10;
    m_fDamageWounded = 200.0f;
    m_iScore = 8000;
    // flame source
    m_vFlameSource = FLOAT3D(0, 0, 0);
    m_fGroundToAirSpeed = m_fFlyAttackRunSpeed;
    m_fAirToGroundSpeed = m_fFlyAttackRunSpeed*2;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;

    // set stretch factors for height and width
    GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    ModelChangeNotify();

    m_soWings.Set3DParameters(150.0f, 20.0f, 2.0f, 1.0f);
    m_bFlySoundPlaying = FALSE;

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

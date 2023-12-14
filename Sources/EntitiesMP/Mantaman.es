320
%{
#include "EntitiesMP/StdH/StdH.h"
#include "AREP/Models/Mantaman2/Mantaman.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiMantaFly = {
  EIBT_FLESH, 160.0f,
  0.0f, 0.0f, 0.0f,
  0.0f, 0.0f, 0.0f,
};

#define FIRE_AIR      FLOAT3D(0.0f, 0.25f, -0.65f)
%}


class CMantaman : CEnemyFly {
name      "Mantaman";
thumbnail "Thumbnails\\Mantaman.tbn";

properties:
  4 BOOL m_bSleeping "Sleeping" 'S' = FALSE,  // set to make scorpman sleep initally

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_MANTA       "AREP\\Models\\Mantaman2\\Mantaman.mdl",
  2 texture TEXTURE_MANTA     "AREP\\Models\\Mantaman2\\Mantaman.tex",
  3 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  9 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
// ************** FLESH PARTS **************
  5 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
  6 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",

  7 model   MODEL_DEBRIS_BODY           "AREP\\Models\\Mantaman2\\Debris\\bod.mdl",
  8 model   MODEL_DEBRIS_WING           "AREP\\Models\\Mantaman2\\Debris\\wing.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "AREP\\Models\\Mantaman2\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "AREP\\Models\\Mantaman2\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "AREP\\Models\\Mantaman2\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "AREP\\Models\\Mantaman2\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "AREP\\Models\\Mantaman2\\Sounds\\Kick.wav",
 55 sound   SOUND_DEATH     "AREP\\Models\\Mantaman2\\Sounds\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (eDeath.eLastDamage.dmtType==DMT_CLOSERANGE) {
      str.PrintF(TRANS("A Mobulon broke all the bones of %s"), (const char *) strPlayerName);
    } else {
      str.PrintF(TRANS("A Mobulon eliminated %s"), (const char *) strPlayerName);
    }
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm,  "DataMP\\Messages\\Enemies\\AREP\\Mantaman.txt");
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
    PrecacheClass(CLASS_PROJECTILE, PRT_MANTAMAN_FIRE);

    PrecacheModel(MODEL_DEBRIS_BODY);
    PrecacheModel(MODEL_DEBRIS_WING);
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_FLESH_SPLAT_FX);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
      return &eiMantaFly;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // woman can't harm woman
    if (!IsOfClass(penInflictor, "Mantaman")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    iAnim = MANTAMAN_ANIM_WOUND02;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = MANTAMAN_ANIM_DEATH;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==MANTAMAN_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.6f;
    return -1.0f;
  };
}
  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(MANTAMAN_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(MANTAMAN_ANIM_STANDORANDSWIMSLOW, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(MANTAMAN_ANIM_STANDORANDSWIMSLOW, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    if (m_bInAir) {
      StartModelAnim(MANTAMAN_ANIM_SWIMFAST, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(MANTAMAN_ANIM_SWIMFAST, AOF_LOOPING|AOF_NORESTART);
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

      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;
      // spawn debris
      Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
   
    Debris_Spawn(this, this, MODEL_DEBRIS_BODY, TEXTURE_MANTA, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_WING, TEXTURE_MANTA, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_WING, TEXTURE_MANTA, 0, 0, 0, IRnd()%4, 0.5f,
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
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  FlyFire(EVoid) : CEnemyFly::FlyFire {

    // fire projectile
    StartModelAnim(MANTAMAN_ANIM_ATTACK01, 0);
    autowait(0.2f);
    ShootProjectile(PRT_MANTAMAN_FIRE, FIRE_AIR, ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.6f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };
  
  FlyHit(EVoid) : CEnemyFly::FlyHit {

    // if enemy near
    if (CalcDist(m_penEnemy) <= 5.0f) {
        jump FlyOnEnemy();{
      }
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.25f;
    return EReturn();
  };

  Sleep(EVoid)
  {
    // start sleeping anim
    StartModelAnim(MANTAMAN_ANIM_DEFAULT_ANIMATION02, AOF_LOOPING);
    // repeat
    wait() {
      // if triggered
      on(ETrigger eTrigger) : {
        // remember enemy
        SetTargetSoft(eTrigger.penCaused);
        // wake up
        jump WakeUp();
      }
      // if damaged
      on(EDamage eDamage) : {
        // wake up
        jump WakeUp();
      }
      otherwise() : {
        resume;
      }
    }
  }

  WakeUp(EVoid)
  {
    // wakeup anim
    SightSound();
    StartModelAnim(MANTAMAN_ANIM_MORPH, 0);
    autowait(GetModelObject()->GetCurrentAnimLength());

    // trigger your target
    SendToTarget(m_penDeathTarget, m_eetDeathType);
    // proceed with normal functioning
    return EReturn();
  }

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {
    // if sleeping
    if (m_bSleeping) {
      m_bSleeping = FALSE;
      // go to sleep until waken up
      wait() {
        on (EBegin) : {
          call Sleep();
        }
        on (EReturn) : {
          stop;
        };
        // if dead
        on(EDeath eDeath) : {
          // die
          jump CEnemyBase::Die(eDeath);
        }
      }
    }
    return EReturn();
  }

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyFly::Death {
    jump CEnemyFly::Death();
  };

  FlyOnEnemy(EVoid) {
    StartModelAnim(MANTAMAN_ANIM_ATTACK02, 0);

    // jump
    FLOAT3D vDir = PlayerDestinationPos();
    vDir = (vDir - GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fFlyCloseRunSpeed*1.9f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.9f, 0);
    m_iChargeHitAnimation = MANTAMAN_ANIM_ATTACK02;
    m_fChargeHitDamage = 20.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 10.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;

    StandingAnim();
    autowait(0.3f);
    return EReturn();
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
    SetHealth(170.0f);
    m_fMaxHealth = 170.0f;
    en_fDensity = 2000.0f;
    m_EeftType=EFT_FLY_ONLY;
    m_sptType = SPT_SLIME;
    

    // set your appearance
    SetModel(MODEL_MANTA);
    SetModelMainTexture(TEXTURE_MANTA);
    // setup moving speed
    m_fWalkSpeed = FRnd() + 1.2f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fAttackRunSpeed = FRnd()*2.0f + 7.5f;
    m_aAttackRotateSpeed = FRnd()*50 + 245.0f;
    m_fCloseRunSpeed = FRnd()*2.0f + 8.0f;
    m_aCloseRotateSpeed = FRnd()*50 + 245.0f;
    // setup attack distances
    m_fAttackDistance = 70.0f;
    m_fCloseDistance = 5.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 200.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd()/2 + 0.5f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*2.0f + 8.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*2.0f + 12.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 75.0f;
    m_fFlyCloseDistance = 12.5f;
    m_fFlyStopDistance = 0.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 340.0f;
    m_fBodyParts = 3;
	m_fBlowUpSize = 2.0f;
    m_fDamageWounded = 100.0f;
    m_iScore = 2000;

    // set stretch factors for height and width
    CEnemyBase::SizeModel();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

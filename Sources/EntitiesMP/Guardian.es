336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/Guardian/Guardian.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/CannonBall";

enum GuTex {
  0 GU_GOLD   "Gold",
  1 GU_JADE   "Jade",
};

enum GuType {
  0 GU_BOTH       "Single and volley",
  1 GU_REGULAR    "Single only",
  2 GU_VOLLEY     "Volley only",
};


%{
static float _tmLastStandingAnim = 0.0f;   
#define FIRING_POSITION_MUZZLE (FLOAT3D(0.0f, 3.3f, -5.0f));
#define FIRING_POSITION_MUZZLEL = (FLOAT3D(2.0f, 3.3f, -5.0f));
#define FIRING_POSITION_MUZZLER = (FLOAT3D(-2.0f, 3.3f, -5.0f));

// info structure
static EntityInfo eiGuardian = {
  EIBT_ROCK, 1600.0f,
  0.0f, 2.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
%}

class CGuardian : CEnemyBase {
name      "Guardian";
thumbnail "Thumbnails\\Guardian.tbn";

properties:
  1 enum GuType m_GuType "Type" 'Y' = GU_BOTH,
  2 INDEX m_iCounter = 0,
  3 CEntityPointer m_penFireFX,
  6 enum GuTex m_GuTex "Texture" 'X' = GU_JADE,
  9 FLOAT3D m_vTarget = FLOAT3D(0.0f, 0.0f, 0.0f),
 10 FLOAT3D m_vFiringPos      = FLOAT3D(0.0f, 0.0f, 0.0f),
 11 BOOL m_bSleeping "Statue" 'S' = FALSE,
 12 BOOL  m_bInvulnerable = FALSE,

 15 INDEX   m_fgibTexture = GU_JADE,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  4 class   CLASS_CANNONBALL    "Classes\\CannonBall.ecl",

 10 model   MODEL_GU              "ModelsF\\NextEncounter\\Enemies\\Guardian\\Guardian.mdl",
 11 texture TEXTURE_GU_GOLD       "ModelsF\\NextEncounter\\Enemies\\Guardian\\GuardianGold.tex",
 12 texture TEXTURE_GU_JADE       "ModelsF\\NextEncounter\\Enemies\\Guardian\\GuardianJade.tex",
 13 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",
 
 60 model   MODEL_HEAD			 "ModelsF\\NextEncounter\\Enemies\\Guardian\\Debris\\Head.mdl",
 61 model   MODEL_LEG1	     	 "ModelsF\\NextEncounter\\Enemies\\Guardian\\Debris\\Leg1.mdl",
 63 model   MODEL_LEG2	     	 "ModelsF\\NextEncounter\\Enemies\\Guardian\\Debris\\Leg2.mdl",

 64 model     MODEL_STONE        "Models\\Effects\\Debris\\Stone\\Stone.mdl",
 65 texture   TEXTURE_STONE      "Models\\Effects\\Debris\\Stone\\Stone.tex",

 // ************** SOUNDS **************
 50 sound   SOUND_IDLE        "ModelsF\\NextEncounter\\Enemies\\Guardian\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT       "ModelsF\\NextEncounter\\Enemies\\Guardian\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND       "ModelsF\\NextEncounter\\Enemies\\Guardian\\Sounds\\Wound.wav",
 55 sound   SOUND_DEATH       "ModelsF\\NextEncounter\\Enemies\\Guardian\\Sounds\\Death.wav",
 58 sound   SOUND_CANNON      "ModelsF\\NextEncounter\\Enemies\\Guardian\\Sounds\\Fire.wav",
 59 sound   SOUND_LAUGH       "ModelsF\\NextEncounter\\Enemies\\Guardian\\Sounds\\Laugh.wav",

functions:

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A temple guardian turned %s into minced meat"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\NE\\Guardian.txt");
    return fnm;
  };
  
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_CANNON);
    PrecacheSound(SOUND_LAUGH);
    PrecacheModel(MODEL_GU);
    PrecacheTexture(TEXTURE_GU_JADE);
    PrecacheTexture(TEXTURE_GU_GOLD);
    
    PrecacheClass(CLASS_CANNONBALL);

	PrecacheModel(MODEL_HEAD);
	PrecacheModel(MODEL_LEG1);
	PrecacheModel(MODEL_LEG2);

    PrecacheModel(MODEL_STONE);
    PrecacheTexture(TEXTURE_STONE);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiGuardian;
  };

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable == TRUE) {
      return;
    }
    
    // take less damage from heavy bullets (e.g. sniper)
    if(dmtType==DMT_BULLET && fDamageAmmount>100.0f)
    {
      fDamageAmmount*=0.5f;
    }

    // can't harm own class
    if (!IsOfClass(penInflictor, "Guardian")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  void LeaveStain(BOOL bGrow)
  {
    // guardian doesn't leave bloody stain
  }


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
	  if (fDamageDir<0) {
          iAnim = GUARDIAN_ANIM_WOUNDBACKWARD;
        } else {
          iAnim = GUARDIAN_ANIM_WOUNDFORWARD;
        }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(GUARDIAN_ANIM_DEATH, 0);
    return GUARDIAN_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch)
  {
    vStretch=FLOAT3D(1,1,2)*3.0f;
    return 1.1f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(GUARDIAN_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    //_tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(GUARDIAN_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
    StartModelAnim(GUARDIAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
    StartModelAnim(GUARDIAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    StartModelAnim(GUARDIAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
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
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
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

    vNormalizedDamage *= 1.0f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_STONE;
      ULONG ulFleshModel   = MODEL_STONE;

    // spawn debris
	Debris_Begin(EIBT_ROCK, DPR_SMOKETRAIL, BET_NONE, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_HEAD, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG1, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG2, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG1, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG2, m_fgibTexture, 0, 0, 0, 0, 0.5f,
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
      ese.betType = BET_EXPLOSION_DEBRIS;
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

Fire(EVoid) : CEnemyBase::Fire {
	switch (m_GuType) {
	 case GU_BOTH:
      if( GetHealth() > m_fMaxHealth/2) {
        jump FireRegular();
      } 
      if( GetHealth() <= m_fMaxHealth/2) {
        jump FireLaugh();
      }
      break;
	 case GU_REGULAR:
        jump FireRegular();
        break;
	 case GU_VOLLEY:
        jump FireLaugh();
        break;
	}

    MaybeSwitchToAnotherPlayer();
    autowait(1.0f);
    return EReturn();
  };

FireRegular(EVoid) {
    // fire projectile 
    StartModelAnim(GUARDIAN_ANIM_FIRE, 0);
      PlaySound(m_soSound, SOUND_CANNON, SOF_3D);
	  autowait(0.52f);

	FLOAT fLaunchSpeed=100.0f;

    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PreparePropelledProjectile(pl, vShootTarget, FLOAT3D(0.0f, 1.5f, -4.0f), ANGLE3D(0, 3.5f, 0));
    CEntityPointer penBall = CreateEntity(pl, CLASS_CANNONBALL);
    ELaunchCannonBall eLaunch;

    eLaunch.fLaunchPower = fLaunchSpeed;

    eLaunch.cbtType = CBT_WEAK;
    eLaunch.fSize = 1.5f;
    penBall->Initialize(eLaunch);

	  autowait(1.0f);
      MaybeSwitchToAnotherPlayer();

    return EReturn();
  };

FireLaugh(EVoid) {
    // fire projectile 
    StartModelAnim(GUARDIAN_ANIM_LAUGH, 0);
      PlaySound(m_soSound, SOUND_LAUGH, SOF_3D);
	  autowait(0.12f);

	FLOAT fLaunchSpeed=70.0f;

    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch 1
    CPlacement3D pl;
    PreparePropelledProjectile(pl, vShootTarget, FLOAT3D(1.0f, 1.5f, -4.0f), ANGLE3D(-7, 3.5f, 0));
    CEntityPointer penBall = CreateEntity(pl, CLASS_CANNONBALL);
    ELaunchCannonBall eLaunch;

    eLaunch.fLaunchPower = fLaunchSpeed;

    eLaunch.cbtType = CBT_WEAK;
    eLaunch.fSize = 1.5f;
    penBall->Initialize(eLaunch);

	  autowait(0.58f);

	FLOAT fLaunchSpeed=66.6f;

    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch 2
    CPlacement3D pl;
    PreparePropelledProjectile(pl, vShootTarget, FLOAT3D(-1.0f, 1.5f, -4.0f), ANGLE3D(3, 3.5f, 0));
    CEntityPointer penBall = CreateEntity(pl, CLASS_CANNONBALL);
    ELaunchCannonBall eLaunch;

    eLaunch.fLaunchPower = fLaunchSpeed;

    eLaunch.cbtType = CBT_WEAK;
    eLaunch.fSize = 1.5f;
    penBall->Initialize(eLaunch);

	  autowait(0.67f);

	FLOAT fLaunchSpeed=63.3f;

    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch 3
    CPlacement3D pl;
    PreparePropelledProjectile(pl, vShootTarget, FLOAT3D(-0.5f, 1.5f, -4.0f), ANGLE3D(4, 3.5f, 0));
    CEntityPointer penBall = CreateEntity(pl, CLASS_CANNONBALL);
    ELaunchCannonBall eLaunch;

    eLaunch.fLaunchPower = fLaunchSpeed;

    eLaunch.cbtType = CBT_WEAK;
    eLaunch.fSize = 1.5f;
    penBall->Initialize(eLaunch);

	  autowait(0.5f);

	FLOAT fLaunchSpeed=60.0f;

    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch 4
    CPlacement3D pl;
    PreparePropelledProjectile(pl, vShootTarget, FLOAT3D(0.5f, 1.5f, -4.0f), ANGLE3D(-2, 3.5f, 0));
    CEntityPointer penBall = CreateEntity(pl, CLASS_CANNONBALL);
    ELaunchCannonBall eLaunch;

    eLaunch.fLaunchPower = fLaunchSpeed;

    eLaunch.cbtType = CBT_WEAK;
    eLaunch.fSize = 1.5f;
    penBall->Initialize(eLaunch);

	  autowait(1.0f);
      MaybeSwitchToAnotherPlayer();

    return EReturn();
  };

  Sleep(EVoid)
  {
    // start sleeping anim
    StartModelAnim(GUARDIAN_ANIM_DEFAULT, AOF_LOOPING);
    m_bInvulnerable = TRUE;
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
    m_bInvulnerable = FALSE;

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
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    m_sptType = SPT_STONES;

    en_fDensity = 50000.0f;
    // set your appearance
    SetModel(MODEL_GU);
    if (m_GuTex==GU_JADE) {
      SetModelMainTexture(TEXTURE_GU_JADE);
		m_fgibTexture = TEXTURE_GU_JADE;
    } else {
      SetModelMainTexture(TEXTURE_GU_GOLD);
		m_fgibTexture = TEXTURE_GU_GOLD;
    }
    SetModelSpecularTexture(TEXTURE_SPECULAR);
    ModelChangeNotify();
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()/1.0f + 2.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd()/1.0f + 4.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    m_fAttackRunSpeed = FRnd()/1.0f + 5.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 15.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 800.0f;
    m_fStopDistance = 5.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    SetHealth(400.0f);
    m_fMaxHealth = GetHealth();
    m_fBlowUpAmount = 800.0f;
	m_fBlowUpSize = 2.0f;
    m_fBodyParts = 10;
    m_fDamageWounded = 150.0f;
     m_iScore = 5000;
    m_fLockOnEnemyTime = 3.0f;

    // set stretch factor
    
    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

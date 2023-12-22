327
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Juggernaut/Mesh/Mesh.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyRunInto";
uses "EntitiesMP/AirWave";
uses "EntitiesMP/BasicEffects";


%{

#define JUG_MAX_TA 10
FLOAT jugTriggerArray[JUG_MAX_TA] = { 0.9f, 0.8f, 0.7f, 0.6f, 0.5f,
                                         0.4f, 0.3f, 0.2f, 0.1f, 0.05f }; 

// info structure
static EntityInfo eiJuggernaut = {
  EIBT_FLESH, 25000.0f,
  0.0f, 10.5f, 0.0f,
  0.0f, 2.0f, 0.0f,
};

#define HIT_DISTANCE    13.0f
#define FIRE_AIRWAVE    FLOAT3D(0.0f*2, 0.5f*2, -4.0f*2)
#define GIANT_HIT   FLOAT3D(0.0f, 0.0f, -15.0f)
#define SPIN_HIT   FLOAT3D(0.0f, 5.0f, 0.0f)
%}


class CJuggernaut : CEnemyRunInto {
name      "Juggernaut";
thumbnail "Thumbnails\\Juggernaut.tbn";

properties:
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,

  6 FLOAT m_fLastShootTime = 0.0f,
  
 20 CEntityPointer m_penTrigger01 "Health 90% Trigger" ,
 21 CEntityPointer m_penTrigger02 "Health 80% Trigger" ,
 22 CEntityPointer m_penTrigger03 "Health 70% Trigger" ,
 23 CEntityPointer m_penTrigger04 "Health 60% Trigger" ,
 24 CEntityPointer m_penTrigger05 "Health 50% Trigger" ,
 25 CEntityPointer m_penTrigger06 "Health 40% Trigger" ,
 26 CEntityPointer m_penTrigger07 "Health 30% Trigger" ,
 27 CEntityPointer m_penTrigger08 "Health 20% Trigger" ,
 28 CEntityPointer m_penTrigger09 "Health 10% Trigger" ,
 29 CEntityPointer m_penTrigger10 "Health 05% Trigger" ,
  
components:
  0 class   CLASS_BASE        "Classes\\EnemyRunInto.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_AIRWAVE     "Classes\\AirWave.ecl",

 10 model   MODEL_JUGGERNAUT              "ModelsF\\Enemies\\Juggernaut\\Mesh\\Mesh.mdl",
 11 texture TEXTURE_JUGGERNAUT     "ModelsF\\Enemies\\Juggernaut\\texture\\JuggernautEyeless.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\Enemies\\Juggernaut\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\Enemies\\Juggernaut\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND1     "ModelsF\\Enemies\\Juggernaut\\Sounds\\Wound1.wav",
 53 sound   SOUND_FIRE      "ModelsF\\Enemies\\Juggernaut\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "ModelsF\\Enemies\\Juggernaut\\Sounds\\Melee.wav",
 55 sound   SOUND_DEATH     "ModelsF\\Enemies\\Juggernaut\\Sounds\\Death.wav",
 56 sound   SOUND_WOUND2     "ModelsF\\Enemies\\Juggernaut\\Sounds\\Wound2.wav",
 57 sound   SOUND_WALK     "ModelsF\\Enemies\\Juggernaut\\Sounds\\Walk.wav",
 58 sound   SOUND_SPIN     "ModelsF\\Enemies\\Juggernaut\\Sounds\\Spin.wav",

functions:

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("An Orcus Behemoth turned %s into floor-pizza"), (const char *) strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmDemon, "DataF\\Messages\\Enemies\\Juggernaut.txt");
    return fnmDemon;
  }
  
  
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND1);
    PrecacheSound(SOUND_WOUND2);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_WALK  );
    PrecacheSound(SOUND_SPIN  );

    PrecacheClass(CLASS_AIRWAVE);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiJuggernaut;
  };

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
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
      InflictRangeDamage(this, DMT_IMPACT, 60.0f, vSource+GIANT_HIT*m, 5.0f, 15.0f);
      SpawnShockwave(2.0f);
      ShakeItBaby(_pTimer->CurrentTick(), 3.0f);
  };

  FLOAT GetCrushHealth(void)
  {
      return 1000.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    FLOAT fOldHealth = GetHealth();
    CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    FLOAT fNewHealth = GetHealth();

    CEntityPointer *penTrigger = &m_penTrigger01;
    // see if any triggers have to be set
    for (INDEX i=0; i<JUG_MAX_TA; i++) {
      FLOAT fHealth = jugTriggerArray[i]*m_fMaxHealth;
      // triggers
      if (fHealth<=fOldHealth && fHealth>fNewHealth)
      {
        if (&*penTrigger[i]) {
          SendToTarget(&*penTrigger[i], EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        }
      }
    }

    // boss cannot be telefragged
    if(dmtType==DMT_TELEPORT)
    {
      return;
    }
    
    // cannonballs inflict less damage then the default
    if(dmtType==DMT_CANNONBALL || dmtType==DMT_CANNONBALL_EXPLOSION)
    {
      fDamageAmmount *= 0.25f;
    }
    
    // immune to impact damage
    if(dmtType==DMT_IMPACT)
    {
      fDamageAmmount *= 0.0f;
    }
    
    // resistant to explosions
    if(dmtType==DMT_EXPLOSION)
    {
      fDamageAmmount= fDamageAmmount*0.5f;
    }

    // mamut can't harm mamut
    if (!IsOfClass(penInflictor, "Juggernaut")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // bosses don't darken when burning
    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    switch (IRnd()%3) {
      case 0: iAnim = MESH_ANIM_GetHit; break;
      case 1: iAnim = MESH_ANIM_GetHitL; break;
      case 2: iAnim = MESH_ANIM_GetHitR; break;
      default: ASSERTALWAYS("Juggernaut unknown damage");
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };


  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(MESH_ANIM_Dead, 0);
    DeactivateRunningSound();
    return MESH_ANIM_Dead;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==MESH_ANIM_Dead)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(MESH_COLLISION_BOX_PART_NAME);
  };


  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(MESH_ANIM_Idle, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(MESH_ANIM_Walk, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RunningAnim(void) {
    StartModelAnim(MESH_ANIM_Walk, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(MESH_ANIM_Walk, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void WoundSound(void) {
    INDEX iWoundSound;
    switch (IRnd()%2) {
      case 0: iWoundSound = SOUND_WOUND1; break;
      case 1: iWoundSound = SOUND_WOUND2; break;
      default: ASSERTALWAYS("Juggernaut unknown damage");
    }
    PlaySound(m_soSound, iWoundSound, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };


  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soFeet, SOUND_WALK, SOF_3D|SOF_LOOP);
      m_bRunSoundPlaying = TRUE;
    }
  }
  void DeactivateRunningSound(void)
  {
    m_soFeet.Stop();
    m_bRunSoundPlaying = FALSE;
  }

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(300.0f, 50.0f, 2.0f, 1.0f);
    m_soFeet.Set3DParameters(300.0f, 50.0f, 2.0f, 1.0f);
  };


/************************************************************
 *                      FIRE AIRWAVE                        *
 ************************************************************/
  // fire air wave
  void FireAirWave(void) {
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_AIRWAVE, ANGLE3D(0, 0, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_AIRWAVE);
    EAirWave eLaunch;
    eLaunch.penLauncher = this;
    penProjectile->Initialize(eLaunch);

      SpawnShockwave(2.0f);
      ShakeItBaby(_pTimer->CurrentTick(), 3.0f);
  };



procedures:
/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    
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
    autowait(0.4f);
    ShakeItBaby(_pTimer->CurrentTick(), 4.0f);

    // spawn dust effect
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1,1,2)*15.0f;
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_DUST_FALL;
    CPlacement3D plSmoke=plFX;
    plSmoke.pl_PositionVector+=FLOAT3D(0,0.35f*ese.vStretch(2),0);
    CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);

    autowait(GetModelObject()->GetAnimLength(MESH_ANIM_Dead)-0.43f);
    return EEnd();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  Fire(EVoid) : CEnemyBase::Fire {
    m_fLastShootTime = _pTimer->CurrentTick();

    // fire projectile
    StartModelAnim(MESH_ANIM_Attack5, 0);
    DeactivateRunningSound();
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.45f);
    FireAirWave();
    autowait(1.0f);

    MaybeSwitchToAnotherPlayer();

    return EReturn();
  };

  // call this to jump onto player - set charge properties before calling and spawn a reminder
  SpinHit(EVoid) 
  {
    // wait for length of hit animation
    wait(GetAnimLength(m_iChargeHitAnimation)) {
      on (EBegin) : { resume; }
      on (ETimer) : { stop; }
      // ignore damages
      on (EDamage) : { resume; }
      // if user-set reminder expired
      on (EReminder) : {
        // stop moving
        StopMoving();
        resume;
      }
      // if you touch some entity
      on (ETouch etouch) : {
        // if it is alive and in front
        if ((etouch.penOther) && IsInPlaneFrustum(etouch.penOther, CosFast(60.0f))) {
          // get your direction
          FLOAT3D vSpeed;
          FLOAT3D vSpinSource;
          const FLOATmatrix3D &m = GetRotationMatrix();
          if( m_penEnemy != NULL)
           {
           vSpinSource = GetPlacement().pl_PositionVector +
           FLOAT3D(m_penEnemy->en_mRotation(1, 2), m_penEnemy->en_mRotation(2, 2), m_penEnemy->en_mRotation(3, 2));
           }
          else
           {
           vSpinSource = GetPlacement().pl_PositionVector;
           }
          GetHeadingDirection(m_fChargeHitAngle, vSpeed);
          // damage entity in that direction
          InflictRangeDamage(this, DMT_IMPACT, 60.0f, vSpinSource+SPIN_HIT*m, 10.0f, 20.0f);
          // push it away
          vSpeed = vSpeed * m_fChargeHitSpeed;
          KickEntity(etouch.penOther, vSpeed);
          // stop waiting
          stop;
        }
        pass;
      }
    }
    // if the anim is not yet finished
    if (!IsAnimFinished()) {
      // wait the rest of time till the anim end
      wait(GetCurrentAnimLength() - GetPassedTime()) {
        on (EBegin) : { resume; }
        on (ETimer) : { stop; }
        // if timer expired
        on (EReminder) : {
          // stop moving
          StopMoving();
          resume;
        }
      }
    }

    // return to caller
    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    m_fLastShootTime = _pTimer->CurrentTick();

    if( GetHealth() > m_fMaxHealth/2)
    {
    StartModelAnim(MESH_ANIM_Attack4, 0);
    DeactivateRunningSound();
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    autowait(0.54f);
    HitGround();
        FLOAT3D mDirection;
        GetPitchDirection(AngleDeg(10.0f), mDirection);
        KickEntity(m_penEnemy, 0.0);
    autowait(1.0f);
	}
    if( GetHealth() <= m_fMaxHealth/2)
    {
    StartModelAnim(MESH_ANIM_Attack6, 0);
    DeactivateRunningSound();
    PlaySound(m_soSound, SOUND_SPIN, SOF_3D);
    autowait(0.33f);

    // jump
    ChangeCollisionBoxIndexWhenPossible(MESH_COLLISION_BOX_SPIN);
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*3.0f;
    vDir(2) = -10.0f;
    SetDesiredTranslation(vDir);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    m_iChargeHitAnimation = MESH_ANIM_Attack6;
    m_fChargeHitDamage = 60.0f;
    m_fChargeHitAngle = 360.0f;
    m_fChargeHitSpeed = 30.0f;
    autocall SpinHit() EReturn;

    autowait(0.5f);
    ChangeCollisionBoxIndexWhenPossible(MESH_COLLISION_BOX_PART_NAME);
	}

    MaybeSwitchToAnotherPlayer();

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
    en_fDensity = 40000.0f;

    // this is a boss
    m_bBoss = TRUE;

    // set your appearance
    GetModelObject()->StretchModel(FLOAT3D(0.75,0.75,0.75));
    SetModel(MODEL_JUGGERNAUT);
    SetModelMainTexture(TEXTURE_JUGGERNAUT);
    ModelChangeNotify();
    SetHealth(30000.0f);
    m_fMaxHealth = 30000.0f;
    StandingAnim();

    // setup moving speed
    m_fWalkSpeed = FRnd() + 8.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 25.0f);
    m_fAttackRunSpeed = FRnd() + 12.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*15.0f + 250.0f);
    m_fCloseRunSpeed = FRnd() + 12.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*15.0f + 250.0f);
    // setup attack distances
    m_fAttackDistance = 2000.0f;
    if( GetHealth() > m_fMaxHealth/2) {
         m_fStopDistance = 25.0f;
        m_fCloseDistance = 30.0f; }
    if( GetHealth() <= m_fMaxHealth/2) {
         m_fStopDistance = 65.0f;
        m_fCloseDistance = 75.0f; }
    INDEX iTime = 4.0f;
    m_fAttackFireTime = iTime;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 250000000000.0f;
    m_fBodyParts = 5;
    m_fDamageWounded = 2500.0f;
    m_iScore = 1000000;

    // continue behavior in base class
    jump CEnemyRunInto::MainLoop();
  };
};

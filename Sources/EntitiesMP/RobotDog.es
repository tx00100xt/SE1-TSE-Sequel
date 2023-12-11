307
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/RobotDog/robot_dog.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyRunInto";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiRobotDog = {
  EIBT_ROBOT, 1000.0f,
  0.0f, 3.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};

#define HIT_DISTANCE   5.0f
#define BOW_FIRE       FLOAT3D(0.0f, 1.0f, 0.5f)
%}


class CRobotDog : CEnemyRunInto {
name      "RobotDog";
thumbnail "Thumbnails\\RobotDog.tbn";

properties:
  1 BOOL m_bRunAttack = FALSE,        // run attack (attack local)
  2 BOOL m_bHornHit = FALSE,          // close attack local
  3 CEntityPointer m_penLastTouched,  // last touched
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,
  6 BOOL m_bExploded = FALSE,
  
components:
  0 class   CLASS_BASE           "Classes\\EnemyRunInto.ecl",
  1 model   MODEL_DOG        "ModelsF\\Enemies\\RobotDog\\robot_dog.mdl",
  2 texture TEXTURE_DOG      "ModelsF\\Enemies\\RobotDog\\robot_dog.tex",
  3 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",

  4 class   CLASS_PROJECTILE     "Classes\\Projectile.ecl",
  5 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\Enemies\\RobotDog\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\Enemies\\RobotDog\\Sounds\\Sight.wav",
 54 sound   SOUND_IMPACT    "Models\\Enemies\\Werebull\\Sounds\\Impact.wav",
 55 sound   SOUND_DEATH     "ModelsF\\Enemies\\RobotDog\\Sounds\\Death.wav",
 56 sound   SOUND_RUN       "ModelsF\\Enemies\\RobotDog\\Sounds\\Servo.wav",
 57 sound   SOUND_FIRE      "ModelsF\\Enemies\\RobotDog\\Sounds\\Fire.wav",
 58 sound   SOUND_WOUND     "ModelsF\\Enemies\\RobotDog\\Sounds\\Wound.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A hellhound has eliminated %s"), strPlayerName);
    return str;
  }

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE    );
    PrecacheSound(SOUND_SIGHT   );
    PrecacheSound(SOUND_IMPACT  );
    PrecacheSound(SOUND_DEATH   );
    PrecacheSound(SOUND_RUN     );
    PrecacheSound(SOUND_FIRE    );
    PrecacheSound(SOUND_WOUND   );

    PrecacheClass(CLASS_PROJECTILE, PRT_CYBORG_BOMB);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_BOMB);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiRobotDog;
  };

  FLOAT GetCrushHealth(void)
  {
    return 50.0f;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\RobotDog.txt");
    return fnm;
  };

  // render particles
  void RenderParticles(void)
  {
    Particles_RunningDust(this);
    CEnemyBase::RenderParticles();
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // werebull can't harm werebull
    if (!IsOfClass(penInflictor, "RobotDog")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  void LeaveStain(BOOL bGrow)
  {
    // mech doesn't leave bloody stain
  }


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateRunningSound();
    StartModelAnim(ROBOT_DOG_ANIM_WOUND, 0);
    return ROBOT_DOG_ANIM_WOUND ;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    iAnim = ROBOT_DOG_ANIM_DEATH2;
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==ROBOT_DOG_ANIM_DEATH2)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.6f;
    }
    return -1.0f;
  };

  void DeathNotify() {
    ChangeCollisionBoxIndexWhenPossible(ROBOT_DOG_COLLISION_BOX_PART_NAME);
    SetCollisionFlags(ECF_MODEL);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(ROBOT_DOG_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(ROBOT_DOG_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RunningAnim(void) {
    StartModelAnim(ROBOT_DOG_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(ROBOT_DOG_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    //DeactivateRunningSound();
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

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  void BlowUpNotify(void) {
      Explode();
  };

  void Explode(void) {
    if (!m_bExploded) {
      m_bExploded = TRUE;
      FLOAT3D vSource;

      // inflict damage
      GetEntityInfoPosition(this, eiRobotDog.vTargetCenter, vSource);
      InflictDirectDamage(this, this, DMT_EXPLOSION, 100000.0f, vSource, -en_vGravityDir); 
      InflictRangeDamage(this, DMT_EXPLOSION, 30.0f, vSource, 2.0f, 11.0f);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_BOMB;
      eSpawnEffect.vStretch = FLOAT3D(2.0f,2.0f,2.0f);
      penExplosion->Initialize(eSpawnEffect);

      // explosion debris
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionDebris->Initialize(eSpawnEffect);

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionSmoke->Initialize(eSpawnEffect);
	  
      CEnemyBase::BlowUp();
    }
  };


/************************************************************
 *                      ATTACK FUNCTIONS                    *
 ************************************************************/
  // touched another live entity
  void LiveEntityTouched(ETouch etouch) {
    if (m_penLastTouched!=etouch.penOther || _pTimer->CurrentTick()>=m_fLastTouchedTime+0.25f) {
      // hit angle
      FLOAT3D vDirection = en_vCurrentTranslationAbsolute;
      vDirection.Normalize();
      ANGLE aHitAngle = FLOAT3D(etouch.plCollision)%vDirection;
      // only hit target in front of you
      if (aHitAngle < 0.0f) {
        // increase mass - only if not another bull
        if (!IsOfSameClass(this, etouch.penOther)) {
          IncreaseKickedMass(etouch.penOther);
        }
        PlaySound(m_soSound, SOUND_IMPACT, SOF_3D);
        // store last touched
        m_penLastTouched = etouch.penOther;
        m_fLastTouchedTime = _pTimer->CurrentTick();
        // damage
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(etouch.penOther, this, DMT_CLOSERANGE, -aHitAngle*20.0f,
          FLOAT3D(0, 0, 0), vDirection);
        // kick touched entity
        FLOAT3D vSpeed = -FLOAT3D(etouch.plCollision);
        vSpeed = vSpeed*10.0f;
        const FLOATmatrix3D &m = GetRotationMatrix();
        FLOAT3D vSpeedRel = vSpeed*!m;
        if (vSpeedRel(1)<-0.1f) {
          vSpeedRel(1)-=15.0f;
        } else {
          vSpeedRel(1)+=15.0f;
        }
        vSpeedRel(2)=15.0f;

        vSpeed = vSpeedRel*m;
        KickEntity(etouch.penOther, vSpeed);
      }
    }
  };

  // touched entity with higher mass
  BOOL HigherMass(void) {
    return (m_fMassKicked > 700.0f);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soFeet.Set3DParameters(100.0f, 10.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;
    m_soSound.Set3DParameters(100.0f, 10.0f, 1.0f, 1.0f);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateRunningSound();
    StartModelAnim(ROBOT_DOG_ANIM_IDLETOATTACK, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(ROBOT_DOG_ANIM_IDLETOATTACK);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    StartModelAnim(ROBOT_DOG_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

    // fire projectile 1

      FLOAT3D vShooting = GetPlacement().pl_PositionVector;
      FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
      FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      
      FLOAT fPitch = 20.0f;
      
      // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, BOW_FIRE(2)-peiTarget->vTargetCenter[1]-1.5f/3.0f, vTarget, 
        vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

      // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, BOW_FIRE, ANGLE3D( fRelativeHdg, fPitch, 0));
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_CYBORG_BOMB;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);

      autowait(0.1f + FRnd()*0.1f);

    // fire projectile 2

      FLOAT3D vShooting = GetPlacement().pl_PositionVector;
      FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
      FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      
      FLOAT fPitch = 20.0f;
      
      // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, BOW_FIRE(2)-peiTarget->vTargetCenter[1]-1.5f/3.0f, vTarget, 
        vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

      // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, BOW_FIRE, ANGLE3D( fRelativeHdg, fPitch, 0));
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_CYBORG_BOMB;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);

      autowait(0.1f + FRnd()*0.1f);

    // fire projectile 3

      FLOAT3D vShooting = GetPlacement().pl_PositionVector;
      FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
      FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      
      FLOAT fPitch = 20.0f;
      
      // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, BOW_FIRE(2)-peiTarget->vTargetCenter[1]-1.5f/3.0f, vTarget, 
        vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

      // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, BOW_FIRE, ANGLE3D( fRelativeHdg, fPitch, 0));
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_CYBORG_BOMB;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);

      autowait(0.1f + FRnd()*0.1f);

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(ROBOT_DOG_ANIM_ATTACKTOIDLE, 0);
    autowait(GetModelObject()->GetAnimLength(ROBOT_DOG_ANIM_ATTACKTOIDLE));

    autowait(FRnd()/3+0.6f);

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    FLOAT3D vDir = PlayerDestinationPos();
    vDir = (vDir - GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed;
    vDir(2) = -10.0f;
    SetDesiredTranslation(vDir);

    autowait(0.27f);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.9f, 0);
    m_iChargeHitAnimation = ROBOT_DOG_ANIM_RUN;
    m_fChargeHitDamage = 25.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 20.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.2f);

    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    autocall CEnemyBase::Death() EEnd;
    Explode();
    return EEnd();
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
    SetHealth(200.0f);
    m_fMaxHealth = 200.0f;
    en_fDensity = 2000.0f;
    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;

    // set your appearance
    SetModel(MODEL_DOG);
    GetModelObject()->StretchModel(FLOAT3D(0.15f, 0.15f, 0.15f));
    SetModelMainTexture(TEXTURE_DOG);
    SetModelSpecularTexture(TEXTURE_SPECULAR);
    ModelChangeNotify();

    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 4.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 90.0f);
    m_fAttackRunSpeed = FRnd()*3.0f + 13.0f;
    m_fAttackRotateRunInto = AngleDeg(FRnd()*60 + 100.0f);
    m_aAttackRotateSpeed = m_fAttackRotateRunInto;
    m_fCloseRunSpeed = FRnd()*5.0f + 15.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseDistance = 15.0f;
    m_fStopDistance = 5.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 0.0f;
    m_fIgnoreRange = 1000.0f;
    // damage/explode properties
    m_fBlowUpAmount = 5000;
    m_bRobotBlowup = TRUE;
    m_fBodyParts = 12;
	m_fBlowUpSize = 3.0f;
    m_fDamageWounded = 65.0f;
    m_iScore = 3000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    Particles_RunningDust_Prepare(this);

    // continue behavior in base class
    jump CEnemyRunInto::MainLoop();
  };
};

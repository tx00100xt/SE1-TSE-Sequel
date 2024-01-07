324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Runner/Runner.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Projectile";
uses "EntitiesMP/Reminder";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiRunner = {
  EIBT_ROBOT, 1000.0f,
  0.0f, 5.4f, 0.0f,
  0.0f, 4.5f, 0.0f,
};
#define FIRE_LEFT_ARM	   FLOAT3D(-1.5f, 2.25f, 0.0f)
#define FIRE_RIGHT_ARM	   FLOAT3D(+1.5f, 2.25f, 0.0f)

%}


class CRunner : CEnemyBase {
name      "Runner";
thumbnail "Thumbnails\\Runner.tbn";

properties:
  2 INDEX m_iLoopCounter = 0,
  3 FLOAT m_fSize = 1.0f,
  4 BOOL m_bWalkSoundPlaying = FALSE,
  5 FLOAT m_fThreatDistance = 5.0f,

  8 FLOAT3D m_vFlameSource1 = FLOAT3D(-1.5f, 2.25f, 0.0f),
  9 FLOAT3D m_vFlameSource2 = FLOAT3D(+1.5f, 2.25f, 0.0f),
 10 CEntityPointer m_penFlame1,
 11 CEntityPointer m_penFlame2,
 12 BOOL m_bBurnEnemy = FALSE,
 13 FLOAT m_fFireTime = 0.0f,

  20 CSoundObject m_soFeet,
  21 CSoundObject m_soFire1,
  22 CSoundObject m_soFire2,
  23 CSoundObject m_soFire3,
  24 CSoundObject m_soFire4,
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_FLAME         "Classes\\Flame.ecl",

 10 model   MODEL_RUNNER              "ModelsF\\Enemies\\Runner\\Runner.mdl",

 12 texture TEXTURE_RUNNER            "ModelsF\\Enemies\\Runner\\mech.tex",
 13 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE        "ModelsF\\Enemies\\Runner\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT       "ModelsF\\Enemies\\Runner\\Sounds\\Sight.wav",
 53 sound   SOUND_FIRE_LASER  "ModelsF\\Enemies\\Runner\\Sounds\\Fire.wav",
 54 sound   SOUND_DEATH1       "ModelsF\\Enemies\\Runner\\Sounds\\Death1.wav",
 55 sound   SOUND_DEATH2       "ModelsF\\Enemies\\Runner\\Sounds\\Death2.wav",
 56 sound   SOUND_WALK        "ModelsF\\Enemies\\Runner\\Sounds\\Servo.wav",
 57 sound   SOUND_WOUND        "ModelsF\\Enemies\\Runner\\Sounds\\Wound.wav",
 58 sound   SOUND_FLAME     "ModelsF\\Enemies\\Runner\\Sounds\\Flame.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Biomech blew %s away"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\Runner.txt");
    return fnm;
  };

  // overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }

  void Precache(void) {
    CEnemyBase::Precache();
	  PrecacheModel(MODEL_RUNNER);
      PrecacheTexture(TEXTURE_RUNNER);
      // sounds
      PrecacheSound(SOUND_IDLE );
      PrecacheSound(SOUND_SIGHT);
      PrecacheSound(SOUND_DEATH1);
      PrecacheSound(SOUND_DEATH2);
      PrecacheSound(SOUND_FIRE_LASER);
      PrecacheSound(SOUND_WALK);
      PrecacheSound(SOUND_WOUND);
      PrecacheSound(SOUND_FLAME);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_LASER_GREEN);
      PrecacheClass(CLASS_FLAME);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiRunner;
  };

  FLOAT GetCrushHealth(void)
  {
    return 100.0f;
    return 0.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // walker can't harm walker
    if (!IsOfClass(penInflictor, "Runner")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection); }
  };

  void LeaveStain(BOOL bGrow)
  {
    // mech doesn't leave bloody stain
  }


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateWalkingSound();
    StartModelAnim(RUNNER_ANIM_WOUND, 0);
    return RUNNER_ANIM_WOUND;
  };

  // death
  INDEX AnimForDeath(void) {
    DeactivateWalkingSound();
    StartModelAnim(RUNNER_ANIM_DEATH2, 0);
    return RUNNER_ANIM_DEATH2;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==RUNNER_ANIM_DEATH2)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };


  // virtual anim functions
  void StandingAnim(void) {
    DeactivateWalkingSound();
    StartModelAnim(RUNNER_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    ActivateWalkingSound();
    StartModelAnim(RUNNER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RunningAnim(void) {
    ActivateWalkingSound();
    StartModelAnim(RUNNER_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
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
    PlaySound(m_soSound, SOUND_DEATH2, SOF_3D);
  };

  // walking sounds
  void ActivateWalkingSound(void)
  {
    if (!m_bWalkSoundPlaying) {
      PlaySound(m_soFeet, SOUND_WALK, SOF_3D|SOF_LOOP);
      m_bWalkSoundPlaying = TRUE;
    }
  }
  void DeactivateWalkingSound(void)
  {
    m_soFeet.Stop();
    m_bWalkSoundPlaying = FALSE;
  }


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFeet.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire1.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire3.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire4.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
  };

  // flame source
  void GetFlamerSourcePlacement1(CPlacement3D &plFlame1) {
    plFlame1.pl_PositionVector = m_vFlameSource2;
  };
  void GetFlamerSourcePlacement2(CPlacement3D &plFlame2) {
    plFlame2.pl_PositionVector = m_vFlameSource2;
  };

  // fire flame
  void FireFlame(void) {
    FLOAT3D vFlamePos1;
    FLOAT3D vFlamePos2;
    vFlamePos1 = FIRE_LEFT_ARM;
    vFlamePos2 = FIRE_RIGHT_ARM;

    // create flame
    CEntityPointer penFlame1 = ShootProjectile(PRT_FLAME, vFlamePos1, ANGLE3D(0, 0, 0));
    CEntityPointer penFlame2 = ShootProjectile(PRT_FLAME, vFlamePos2, ANGLE3D(0, 0, 0));
    // link last flame with this one (if not NULL or deleted)
    if (m_penFlame1!=NULL && !(m_penFlame1->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame1).m_penParticles = penFlame1;
    }
    if (m_penFlame2!=NULL && !(m_penFlame2->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame2).m_penParticles = penFlame2;
    }
    // link to player weapons
    ((CProjectile&)*penFlame1).m_penParticles = this;
    ((CProjectile&)*penFlame2).m_penParticles = this;
    // store last flame
    m_penFlame1 = penFlame1;
    m_penFlame2 = penFlame2;
    // flame source position
    m_vFlameSource1 = GetPlacement().pl_PositionVector + vFlamePos1*GetRotationMatrix();
    m_vFlameSource2 = GetPlacement().pl_PositionVector + vFlamePos2*GetRotationMatrix();
  };


procedures:

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(RUNNER_ANIM_IDLETOATTACK, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(RUNNER_ANIM_IDLETOATTACK);
    autocall CEnemyBase::LockOnEnemy() EReturn;

      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_iLoopCounter = 4;
      } else {
        m_iLoopCounter = 8;
      }
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(RUNNER_ANIM_ATTACK, AOF_LOOPING);
          ShootProjectile(PRT_LASER_GREEN, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
          ShootProjectile(PRT_LASER_GREEN, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        } else {
          StartModelAnim(RUNNER_ANIM_ATTACK, AOF_LOOPING);
          ShootProjectile(PRT_LASER_GREEN, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
          ShootProjectile(PRT_LASER_GREEN, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_FIRE_LASER, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_FIRE_LASER, SOF_3D);
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_FIRE_LASER, SOF_3D);
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_FIRE_LASER, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 0.4f;
          } else {
            m_fLockOnEnemyTime = 0.2f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }

    StopMoving();

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(RUNNER_ANIM_ATTACKTOIDLE, 0);
    autowait(GetModelObject()->GetAnimLength(RUNNER_ANIM_ATTACKTOIDLE));

    // wait for a while
    StandingAnim();
    autowait(FRnd()*0.1f+0.1f);

    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(RUNNER_ANIM_IDLETOATTACK, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(RUNNER_ANIM_IDLETOATTACK);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    StartModelAnim(RUNNER_ANIM_ATTACK, 0);
    m_fFireTime = _pTimer->CurrentTick();
    FireFlame();
    m_bBurnEnemy = TRUE;
    PlaySound(m_soSound, SOUND_FLAME, SOF_3D);
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
          if (_pTimer->CurrentTick()-m_fFireTime >= 1.29f) {
            m_bBurnEnemy = FALSE;
            stop;
          }
          resume;
        }
        on (ETimer) : { stop; }
      }
    }

    // link last flame with nothing (if not NULL or deleted)
    if (m_penFlame1!=NULL && !(m_penFlame1->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame1).m_penParticles = NULL;
      ((CProjectile&)*m_penFlame2).m_penParticles = NULL;
      m_penFlame1 = NULL;
      m_penFlame2 = NULL;
    }
    if (m_penFlame2!=NULL && !(m_penFlame2->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame2).m_penParticles = NULL;
      m_penFlame2 = NULL;
    }

    StartModelAnim(RUNNER_ANIM_ATTACKTOIDLE, 0);
    autowait(GetModelObject()->GetAnimLength(RUNNER_ANIM_ATTACKTOIDLE));
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
      SetHealth(300.0f);
      m_fMaxHealth = 300.0f;
    en_fDensity = 3000.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;

    // set your appearance
      SetModel(MODEL_RUNNER);
      SetModelMainTexture(TEXTURE_RUNNER);
      SetModelSpecularTexture(TEXTURE_SPECULAR);
      GetModelObject()->StretchModel(FLOAT3D(0.35f, 0.35f, 0.35f));
      ModelChangeNotify();
      m_fBlowUpAmount = 1E10f;
      m_iScore = 4000;
      m_fThreatDistance = 15;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 14.0f;
    }

    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*1.5f + 12.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
    m_fAttackRunSpeed = FRnd()*1.5f + 24.0f;;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2;
    m_fCloseRunSpeed = m_fAttackRunSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2;
    m_fWalkSpeed/=2.0f;
    // setup attack distances
    m_fAttackDistance = 1000.0f;
    m_fCloseDistance = 25.0f;
    m_fStopDistance = 15.0f;
    m_fAttackFireTime = 6.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 300.0f;
    // damage/explode properties
    m_fBodyParts = 8;
    m_fDamageWounded = 100.0f;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

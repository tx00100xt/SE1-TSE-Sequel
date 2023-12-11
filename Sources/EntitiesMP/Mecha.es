324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Mecha/Mecha.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Projectile";
uses "EntitiesMP/Reminder";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiMecha = {
  EIBT_ROBOT, 10000.0f,
  0.0f, 5.4f, 0.0f,
  0.0f, 4.5f, 0.0f,
};
#define FIRE	   FLOAT3D(0.0f, 6.5f, -5.0f)

%}


class CMecha : CEnemyBase {
name      "Mecha";
thumbnail "Thumbnails\\Mecha.tbn";

properties:
  2 INDEX m_iCounter = 0,
  3 FLOAT m_fSize = 1.0f,
  4 BOOL m_bWalkSoundPlaying = FALSE,
  5 FLOAT m_fThreatDistance = 5.0f,

  8 INDEX m_iFiredProjectiles = 0,                      // internal counter of fired projectiles
  9 INDEX m_iToFireProjectiles = 0,                     // internal counter of projectiles that should be fired
  10 FLOAT3D m_vBeamSource = FLOAT3D( 0,0,0),      // position of electricity ray target
  11 FLOAT3D m_vBeamTarget = FLOAT3D( 0,0,0),      // position of electricity ray target
  12 BOOL m_bRenderElectricity = FALSE,                   // if electricity particles are rendered
  13 FLOAT m_tmTemp = 0,

  20 CSoundObject m_soFeet,
  21 CSoundObject m_soFire1,
  22 CSoundObject m_soFire2,
  23 CSoundObject m_soFire3,
  24 CSoundObject m_soFire4,

  30 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_MECHA              "ModelsF\\Enemies\\Mecha\\Mecha.mdl",

 12 texture TEXTURE_MECHA            "ModelsF\\Enemies\\Mecha\\mech_defender.tex",
 13 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE        "ModelsF\\Enemies\\Mecha\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT       "ModelsF\\Enemies\\Mecha\\Sounds\\Sight.wav",
 52 sound   SOUND_BEAM        "ModelsF\\Enemies\\Mecha\\Sounds\\Beam.wav",
 53 sound   SOUND_FIRE        "ModelsF\\Enemies\\Mecha\\Sounds\\Fire.wav",
 54 sound   SOUND_DEATH       "ModelsF\\Enemies\\Mecha\\Sounds\\Death.wav",
 56 sound   SOUND_WALK        "ModelsF\\Enemies\\Mecha\\Sounds\\Walk.wav",
 57 sound   SOUND_WOUND        "ModelsF\\Enemies\\Mecha\\Sounds\\Wound.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s has been annihilated"), strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\Mecha.txt");
    return fnm;
  };

  // overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }

  void Precache(void) {
    CEnemyBase::Precache();
	  PrecacheModel(MODEL_MECHA);
      PrecacheTexture(TEXTURE_MECHA);
      // sounds
      PrecacheSound(SOUND_IDLE );
      PrecacheSound(SOUND_SIGHT);
      PrecacheSound(SOUND_DEATH);
      PrecacheSound(SOUND_FIRE);
      PrecacheSound(SOUND_BEAM);
      PrecacheSound(SOUND_WALK);
      PrecacheSound(SOUND_WOUND);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_ROCKET_SEEKING);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiMecha;
  };

  FLOAT GetCrushHealth(void)
  {
    return 500.0f;
  }

  // render particles
  void RenderParticles(void)
  {
    if( m_bRenderElectricity)
    {
      // calculate electricity ray source pos
      Particles_Ghostbuster(m_vBeamSource, m_vBeamTarget, 24, 2.0f, 2.0f, 96.0f);
    }

    CEnemyBase::RenderParticles();
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // walker can't harm walker
    if (!IsOfClass(penInflictor, "Mecha")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection); }
  };

  void LeaveStain(BOOL bGrow)
  {
    // mech doesn't leave bloody stain
  }


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateWalkingSound();
    m_bRenderElectricity=FALSE;
    StartModelAnim(MECHA_ANIM_WOUND, 0);
    return MECHA_ANIM_WOUND;
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

  // death
  INDEX AnimForDeath(void) {
    DeactivateWalkingSound();
    m_bRenderElectricity=FALSE;
    StartModelAnim(MECHA_ANIM_DEATH, 0);
    return MECHA_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==MECHA_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };


  // virtual anim functions
  void StandingAnim(void) {
    DeactivateWalkingSound();
    StartModelAnim(MECHA_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    ActivateWalkingSound();
    StartModelAnim(MECHA_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RunningAnim(void) {
    ActivateWalkingSound();
    StartModelAnim(MECHA_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
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


procedures:

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  Fire(EVoid) : CEnemyBase::Fire {
    INDEX iRnd = IRnd()%2;
    switch(iRnd)
    {
    case 0:
        jump Beam();
        break;
    case 1:
        jump Rockets();
        break;
    }

  };

  Rockets(EVoid) {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(MECHA_ANIM_IDLETOATTACK, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(MECHA_ANIM_IDLETOATTACK);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    m_iCounter = 0;
    while ( m_iCounter<3)
    {
      StartModelAnim(MECHA_ANIM_ATTACK, AOF_SMOOTHCHANGE);
      autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      ShootProjectile(PRT_ROCKET_SEEKING, FLOAT3D( 0.0f, 4.5f, -1.0f), ANGLE3D(0.0f, 0.0f, 0.0f));
      m_iCounter++;
      }

    StopMoving();

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(MECHA_ANIM_ATTACKTOIDLE, 0);
    autowait(GetModelObject()->GetAnimLength(MECHA_ANIM_ATTACKTOIDLE));

    // wait for a while
    StandingAnim();
    autowait(FRnd()*0.1f+0.1f);

    return EReturn();
  };

  Beam(EVoid) {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(MECHA_ANIM_IDLETOATTACK, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(MECHA_ANIM_IDLETOATTACK);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    // start fireing electricity
      const FLOATmatrix3D &m = GetRotationMatrix();
      m_vBeamSource=GetPlacement().pl_PositionVector+FIRE;

      // target enemy body
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, m_vBeamTarget);

      // give some time so player can move away from electricity beam
      autowait(0.4f);
      StartModelAnim(MECHA_ANIM_ATTACK, AOF_SMOOTHCHANGE);

      // fire electricity beam
      m_bRenderElectricity = TRUE;
      m_tmTemp = _pTimer->CurrentTick();
      PlaySound(m_soSound, SOUND_BEAM, SOF_3D);
      while(_pTimer->CurrentTick() < m_tmTemp+0.75f)
      {
        wait(_pTimer->TickQuantum) {
          on (EBegin): {
            // correct electricity beam target
            FLOAT3D vNewTarget;
            EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
            GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vNewTarget);
            FLOAT3D vDiff = vNewTarget-m_vBeamTarget;
            // if we have valid length
            if( vDiff.Length() > 1.0f)
            {
              // calculate adjustment
              m_vBeamTarget = m_vBeamTarget+vDiff.Normalize()*10.0f*_pTimer->TickQuantum;
            }

            // cast ray
            CCastRay crRay( this, m_vBeamSource, m_vBeamTarget);
            crRay.cr_bHitTranslucentPortals = FALSE;
            crRay.cr_bPhysical = FALSE;
            crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
            GetWorld()->CastRay(crRay);
            // if entity is hit
            if( crRay.cr_penHit != NULL)
            {
              // apply damage
              InflictDirectDamage( crRay.cr_penHit, this, DMT_BURNING, 50.0f*_pTimer->TickQuantum/0.5f,
                FLOAT3D(0, 0, 0), (m_vBeamSource-m_vBeamTarget).Normalize());
            }

            resume;
          };
          on (ETimer): { stop; };
        }
	}
      m_bRenderElectricity = FALSE;

    StopMoving();

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(MECHA_ANIM_ATTACKTOIDLE, 0);
    autowait(GetModelObject()->GetAnimLength(MECHA_ANIM_ATTACKTOIDLE));

    // wait for a while
    StandingAnim();
    autowait(FRnd()*0.1f+0.1f);

    return EReturn();
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    m_bRenderElectricity=FALSE;
    
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
    autowait(0.5f);
    ShakeItBaby(_pTimer->CurrentTick(), 2.0f);

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

    autowait(GetModelObject()->GetAnimLength(MECHA_ANIM_DEATH)-2.3f);
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
      SetHealth(2300.0f);
      m_fMaxHealth = 2300.0f;
    en_fDensity = 30000.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;
    m_bBoss = m_bBeBoss;

    // set your appearance
      SetModel(MODEL_MECHA);
      SetModelMainTexture(TEXTURE_MECHA);
      SetModelSpecularTexture(TEXTURE_SPECULAR);
      GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
      ModelChangeNotify();
      m_fBlowUpAmount = 1E10f;
      m_iScore = 50000;
      m_fThreatDistance = 15;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 14.0f;
    }

    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*1.5f + 10.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
    m_fAttackRunSpeed = FRnd()*1.5f + 10.0f;;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2;
    m_fCloseRunSpeed = m_fAttackRunSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2;
    m_fWalkSpeed/=2.0f;
    // setup attack distances
    m_fAttackDistance = 1000.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 30.0f;
    m_fAttackFireTime = 6.0f;
    m_fCloseFireTime = 6.0f;
    m_fIgnoreRange = 300.0f;
    // damage/explode properties
    m_fBodyParts = 8;
    m_fDamageWounded = 700.0f;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

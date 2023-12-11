323
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Enemies/Headman/Projectile/Bomb.h"
%}

uses "EntitiesMP/EnemyFly";

enum CecDeath {
  0 CEC_FALL       "Fall Down",
  1 CEC_SPLODE      "Explode",
};

enum ParticleTrailType {
  0 TRAIL_NONE              "None",
  1 TRAIL_ROMBOID           "Romboid trail",
  2 TRAIL_BOMB              "Bomb trail",
  3 TRAIL_FIRECRACKER       "Firecracker trail",
  4 TRAIL_COLOREDSTARS      "Colored stars",
  5 TRAIL_FIREBALL          "Fireball trail",
  6 TRAIL_GRENADE           "Grenade trail",
  7 TRAIL_CANNON            "Cannon trail",
  8 TRAIL_ROCKET            "Rocket trail",
  9 TRAIL_BLOOD             "Blood trail",
 10 TRAIL_LAVA              "Lava trail",
 12 TRAIL_LAVABOMB          "Lava bomb trail",
 16 TRAIL_BEAST             "Beast projectile trail",
 17 TRAIL_BEASTBIG          "Beast big projectile trail",
 18 TRAIL_BEASTDEBRIS       "Beast debris trail",
 20 TRAIL_AFTERBURNER       "Afterburner trail",
 22 TRAIL_SPIRAL            "Spiral trail",
 24 TRAIL_RUNNINGDUST       "Running dust",
};

%{
// info structure
static EntityInfo eiCec = {
  EIBT_FLESH, 14000.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};

#define CEC_MAX_TA 10
FLOAT cecTriggerArray[CEC_MAX_TA] = { 0.9f, 0.8f, 0.7f, 0.6f, 0.5f,
                                         0.4f, 0.3f, 0.2f, 0.1f, 0.05f };
%}


class CCustomEnemyCollision : CEnemyFly {
name      "CustomEnemyCollision";
thumbnail "Thumbnails\\CEC.tbn";

properties:
  1 FLOAT m_fHealth            "Health" = 100.0f,
  2 BOOL m_bInvisible "Invisible" 'I'=FALSE,
  3 BOOL m_bCecBoss  "Boss" 'B' = TRUE,
  4 enum SprayParticlesType m_penSpray "Blood Type" = SPT_BLOOD, // type of particles
  5 FLOAT m_iCecScore                  "Score" = 100.0f,
  6 FLOAT m_iCecSpeed                  "Speed" = 10.0f,
  7 enum CecDeath m_CecDeath "Death type" 'D' = CEC_FALL,
  
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

 30 enum ParticleTrailType m_ptType "Particle trail"    'T' = TRAIL_NONE,
 31 BOOL m_bRenderParticles=FALSE,
 32 FLOAT m_fStartTime = 0.0f,               // start time when launched

 33 BOOL  m_bInvulnerable  "Invulnerable" 'V'  = FALSE, // can we be hurt?

 34 FLOAT m_fStretchAll     "StretchAll" 'S' = 10.0f,
 35 FLOAT m_fStretchX       "StretchX"   'X' = 1.0f,
 36 FLOAT m_fStretchY       "StretchY"   'Y' = 1.0f,
 37 FLOAT m_fStretchZ       "StretchZ"   'Z' = 1.0f,

 41 FLOAT fSpeedRatio          "Particle Speed ratio" = 1.0f,
 42 FLOAT fZOffset             "Particle ZOffset" = 0.0f,
 43 FLOAT fYOffset             "Particle YOffset" = 0.0f,
 44 FLOAT ctParticles          "Particle count" = 32.0f,
 45 FLOAT fHeight              "Particle Height" = 0.0f,
 46 FLOAT m_fSize              "Particle Size"  = 1.0f,



components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_CEC      "Models\\Enemies\\Headman\\Projectile\\Bomb.mdl",
  2 texture TEXTURE_CEC    "Models\\Enemies\\Headman\\Projectile\\Bomb.tex",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s was killed by a monster"), (const char *) strPlayerName);
    return str;
  }
  void Precache(void) {
    CEnemyBase::Precache();
  };

  /* Entity info */
  void *GetEntityInfo(void)
  {
    return &eiCec;
  };

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    CEnemyBase::FillEntityStatistics(pes);
    if (m_bInvisible) {
      pes->es_strName+=" Invisible";
    }
    return TRUE;
  }

  // render particles
  void RenderParticles(void)
  {
    if(m_ptType==TRAIL_NONE ) {
	  m_bRenderParticles = FALSE;
	}
    if(m_ptType==TRAIL_ROMBOID ) {
	  m_bRenderParticles = TRUE;
       Particles_RomboidTrail(this);
	}
    if(m_ptType==TRAIL_BOMB ) {
	  m_bRenderParticles = TRUE;
       Particles_BombTrail(this);
	}
    if(m_ptType==TRAIL_FIRECRACKER ) {
	  m_bRenderParticles = TRUE;
       Particles_FirecrackerTrail(this);
	}
    if(m_ptType==TRAIL_COLOREDSTARS ) {
	  m_bRenderParticles = TRUE;
       Particles_ColoredStarsTrail(this);
	}
    if(m_ptType==TRAIL_FIREBALL ) {
	  m_bRenderParticles = TRUE;
       Particles_Fireball01Trail(this);
	}
    if(m_ptType==TRAIL_GRENADE ) {
	  m_bRenderParticles = TRUE;
       Particles_GrenadeTrail(this);
	}
    if(m_ptType==TRAIL_CANNON ) {
	  m_bRenderParticles = TRUE;
       Particles_CannonBall(this, fSpeedRatio);
	}
    if(m_ptType==TRAIL_BLOOD ) {
	  m_bRenderParticles = TRUE;
       Particles_BloodTrail(this);
	}
    if(m_ptType==TRAIL_ROCKET ) {
	  m_bRenderParticles = TRUE;
       Particles_RocketTrail(this, m_fSize);
	}
    if(m_ptType==TRAIL_LAVA ) {
	  m_bRenderParticles = TRUE;
       Particles_LavaTrail(this);
	}
    if(m_ptType==TRAIL_LAVABOMB ) {
	  m_bRenderParticles = TRUE;
       Particles_LavaBombTrail(this, m_fSize);
	}
    if(m_ptType==TRAIL_BEAST ) {
	  m_bRenderParticles = TRUE;
       Particles_BeastProjectileTrail( this, m_fSize, fHeight, ctParticles);
	}
    if(m_ptType==TRAIL_BEASTBIG ) {
	  m_bRenderParticles = TRUE;
       Particles_BeastBigProjectileTrail( this, m_fSize, fZOffset, fYOffset, ctParticles);
	}
    if(m_ptType==TRAIL_BEASTDEBRIS ) {
	  m_bRenderParticles = TRUE;
       Particles_BeastProjectileDebrisTrail(this, m_fSize);
	}
    if(m_ptType==TRAIL_AFTERBURNER ) {
	  m_bRenderParticles = TRUE;
       Particles_AfterBurner( this, m_fStartTime, m_fSize);
	}
    if(m_ptType==TRAIL_SPIRAL ) {
	  m_bRenderParticles = TRUE;
       Particles_SpiralTrail(this);
	}
    if(m_ptType==TRAIL_RUNNINGDUST ) {
	  m_bRenderParticles = TRUE;
       Particles_RunningDust(this);
	}
  }

  /* Adjust model shading parameters if needed. */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    // no shadows for invisibles
    if (m_bInvisible) {
      colAmbient = C_WHITE;
      return FALSE;
    } else {
      return CEnemyBase::AdjustShadingParameters(vLightDirection, colLight, colAmbient);
    }
  }

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(BOMB_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // Receive damage
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {    
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable) {
      return;
    }

    FLOAT fOldHealth = GetHealth();
    CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    FLOAT fNewHealth = GetHealth();

    CEntityPointer *penTrigger = &m_penTrigger01;
    // see if any triggers have to be set
    for (INDEX i=0; i<CEC_MAX_TA; i++) {
      FLOAT fHealth = cecTriggerArray[i]*m_fMaxHealth;
      // triggers
      if (fHealth<=fOldHealth && fHealth>fNewHealth)
      {
        if (&*penTrigger[i]) {
          SendToTarget(&*penTrigger[i], EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        }
      }
    }
   }


/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  //DON'T spawn body parts
  void BlowUp(void) {
    // hide yourself
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
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
	m_bRenderParticles = FALSE;
	m_ptType = TRAIL_NONE;
	if (m_CecDeath == CEC_FALL) {
      autocall CEnemyBase::Death() EEnd;
	  }
	if (m_CecDeath == CEC_SPLODE) {
      BlowUp();
	  }
    return EEnd();
  };
/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL_HOLDER);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_fDensity = 1000;
    m_fBlowUpSize = 2.0f;
    m_bBoss = m_bCecBoss;
	m_bRenderParticles = m_bRenderParticles;

    // set your appearance
    SetModel(MODEL_CEC);
    SetModelMainTexture(TEXTURE_CEC);
    if (m_bInvisible) {
      GetModelObject()->mo_colBlendColor = C_WHITE|0x0;
	  }
    // setup moving speed
    m_fWalkSpeed = m_iCecSpeed;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
    m_fAttackRunSpeed = m_iCecSpeed;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
    m_fCloseRunSpeed = m_iCecSpeed;
    m_aCloseRotateSpeed = AngleDeg(360.0f);
	// setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 3.5f;
    m_fStopDistance = 1.5f;
    m_fAttackFireTime = 2.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 2000.0f;
    // fly moving properties
    m_fFlyWalkSpeed = m_iCecSpeed;
    m_aFlyWalkRotateSpeed = FRnd()*20.0f + 600.0f;
    m_fFlyAttackRunSpeed = m_iCecSpeed;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 300.0f;
    m_fFlyCloseRunSpeed = m_iCecSpeed;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 300.0f;
    m_fGroundToAirSpeed = 2.5f;
    m_fAirToGroundSpeed = 2.5f;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;
    m_fFlyHeight = 1.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 100.0f;
    m_fFlyCloseDistance = 10.0f;
    m_fFlyStopDistance = 1.5f;
    m_fFlyAttackFireTime = 2.0f;
    m_fFlyCloseFireTime = 0.5f;
    m_fFlyIgnoreRange = 2000.0f;
    // damage/explode properties
	if (m_CecDeath == CEC_FALL) {
       m_fBlowUpAmount = 99999999999999.0f; }
	if (m_CecDeath == CEC_SPLODE) {
       m_fBlowUpAmount = 0.0f; }
    m_fBodyParts = 0;
    m_fDamageWounded = 0.0f;

     // properties that modify EnemyBase properties
    if (m_fHealth<=0.0f) { m_fHealth=1.0f; }
    SetHealth(m_fHealth); m_fMaxHealth = m_fHealth;
	m_iScore = m_iCecScore;
    m_sptType = m_penSpray;

    en_fDeceleration = 150.0f;

    // set stretch factors for height and width
    // set model stretch -- MUST BE DONE BEFORE SETTING MODEL!
    GetModelObject()->mo_Stretch = FLOAT3D(
      m_fStretchAll*m_fStretchX,
      m_fStretchAll*m_fStretchY,
      m_fStretchAll*m_fStretchZ);
    ModelChangeNotify();
    StandingAnim();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

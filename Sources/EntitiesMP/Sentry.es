324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "AREP/Models/Sentry/DrivingWheel/Robot.h"
#include "AREP/Models/Sentry/FlyingFighter/FlyingFighter.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/Projectile";

enum SentryChar {
  0 STR_TURRET   "Turret",
  1 STR_FLYING  "Flying",
};

%{
// info structure
static EntityInfo eiTurret = {
  EIBT_ROBOT, 10000.0f, // mass[kg]
  0.0f, 1.5f, 0.0f,   // source
  0.0f, 1.5f, 0.0f,   // target
};

static EntityInfo eiFlying = {
  EIBT_ROBOT, 100.0f, // mass[kg]
  0.0f, 0.0f, 0.0f,  // source  
  0.0f, 0.0f, 0.0f,  // target  
};
#define FIRE_POS      FLOAT3D(0.0f, 0.0f, 0.0f)

#define FIRE_LEFT_ARM   FLOAT3D(-0.7f, 0.7f, 0.0f)
#define FIRE_RIGHT_ARM  FLOAT3D(+0.7f, 0.7f, 0.0f)

#define SENTRYSOUND(soundname) ((m_ErfChar==STR_TURRET)? (SOUND_SIGHT_TURRET) : (SOUND_SIGHT_FLYING))
%}


class CSentry : CEnemyFly {
name      "Sentry";
thumbnail "Thumbnails\\Sentry.tbn";

properties:
  1 enum SentryChar m_ErfChar   "Character" 'C' = STR_TURRET,
  2 INDEX m_iLoopCounter = 0,
  5 FLOAT m_fThreatDistance = 5.0f,

  6 CSoundObject m_soBackground,  // sound channel for background noise
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyFly.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 12 model   MODEL_TURRET              "AREP\\Models\\Sentry\\DrivingWheel\\Robot.mdl",
 13 texture TEXTURE_TURRET            "AREP\\Models\\Sentry\\DrivingWheel\\Robot.tex",
 14 model   MODEL_FLYING              "AREP\\Models\\Sentry\\FlyingFighter\\Ship.mdl",
 15 texture TEXTURE_FLYING            "AREP\\Models\\Sentry\\FlyingFighter\\Ship.tex",

// ************** SOUNDS **************
 50 sound   SOUND_FIRE                "AREP\\Models\\Sentry\\Sounds\\Fire.wav",
 51 sound   SOUND_SIGHT_TURRET        "AREP\\Models\\Sentry\\Sounds\\Sight_Turret.wav",
 52 sound   SOUND_SIGHT_FLYING        "AREP\\Models\\Sentry\\Sounds\\Sight_Floater.wav",
 53 sound   SOUND_DEATH               "AREP\\Models\\Sentry\\Sounds\\Death.wav",
 54 sound   SOUND_ENGINE              "AREP\\Models\\Sentry\\Sounds\\Engine_Floater.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Sirian Sentry destroyed %s"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmTurret,  "DataMP\\Messages\\Enemies\\AREP\\SentryTurret.txt");
    static DECLARE_CTFILENAME(fnmFlying, "DataMP\\Messages\\Enemies\\AREP\\SentryFlying.txt");
    switch(m_ErfChar) {
    default: ASSERT(FALSE);
    case STR_TURRET:   return fnmTurret;
    case STR_FLYING: return fnmFlying;
    }
  }
  // overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }

  void Precache(void) {
    CEnemyBase::Precache();

    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_DEATH );
    PrecacheSound(SOUND_FIRE  );
    PrecacheSound(SOUND_ENGINE);


    if (m_ErfChar==STR_TURRET)
    {
      PrecacheModel(MODEL_TURRET);
      // sounds
      PrecacheSound(SOUND_SIGHT_TURRET );
      // model's texture
      PrecacheTexture(TEXTURE_TURRET);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_CYBORG_LASER);
    }
    else
    {
      PrecacheModel(MODEL_FLYING);
      // sounds
      PrecacheSound(SOUND_SIGHT_FLYING);
      // model's texture
      PrecacheTexture(TEXTURE_FLYING);
    }
  };
  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_ErfChar == STR_TURRET) {
      return &eiTurret;
    } else {
      return &eiFlying;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // sentry can't harm sentry
    if( IsOfClass(penInflictor, "Sentry")) {
      return;
    }
    CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
  };


  // virtual anim functions

  // virtual sound functions
  void SightSound(void) {
    PlaySound(m_soSound, SENTRYSOUND(SIGHT), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  FlyFire(EVoid) : CEnemyFly::FlyFire {

    ShootProjectile(PRT_CYBORG_LASER, FIRE_POS, ANGLE3D(0, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

    return EReturn();
  };

  GroundFire(EVoid) : CEnemyFly::GroundFire {

      ShootProjectile(PRT_CYBORG_LASER, FIRE_LEFT_ARM, ANGLE3D(0, 0, 0));
      ShootProjectile(PRT_CYBORG_LASER, FIRE_RIGHT_ARM, ANGLE3D(0, 0, 0));
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/ 
 // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {

    if (m_ErfChar==STR_FLYING)
    {
      m_soBackground.Set3DParameters(80.0f, 5.0f, 1.0f, 1.0f);
      PlaySound(m_soBackground, SOUND_ENGINE, SOF_3D|SOF_LOOP);
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
    if (m_ErfChar==STR_TURRET) {
      SetHealth(40.0f);
      m_fMaxHealth = 40.0f;
    } else {
      SetHealth(20.0f);
      m_fMaxHealth = 20.0f;
    }
    en_fDensity = 1000.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;

    // set your appearance
    if (m_ErfChar==STR_TURRET) {
      m_EeftType=EFT_GROUND_ONLY;
      SetModel(MODEL_TURRET);
      SetModelMainTexture(TEXTURE_TURRET);
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(0.75f, 0.75f, 0.75f));
      ModelChangeNotify();
      m_fBlowUpAmount = 0.0f;
      m_bRobotBlowup = TRUE;
      m_iScore = 600;
      m_fThreatDistance = 15;
      // setup moving speed
      m_fWalkSpeed = 0.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*500.0f + 500.0f);
      m_fAttackRunSpeed = m_fWalkSpeed;
      m_aAttackRotateSpeed = m_aWalkRotateSpeed;
      m_fCloseRunSpeed = m_fWalkSpeed;
      m_aCloseRotateSpeed = m_aWalkRotateSpeed;
      // setup attack distances
      m_fAttackDistance = 58.0f;
      m_fCloseDistance = 0.0f;
      m_fStopDistance = 0.0f;
      m_fAttackFireTime = 0.1f;
      m_fCloseFireTime = 0.1f;
      m_fIgnoreRange = 60.0f;
    // damage/explode properties
    m_fBodyParts = 8;
    m_fDamageWounded = 100000.0f;
    } else {
      m_EeftType=EFT_FLY_ONLY;
      SetModel(MODEL_FLYING);
      SetModelMainTexture(TEXTURE_FLYING);
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
      ModelChangeNotify();
      m_fBlowUpAmount = 0.0f;
      m_bRobotBlowup = TRUE;
      m_iScore = 400;
      m_fThreatDistance = 5;
      // fly moving properties
      m_fFlyWalkSpeed = FRnd()*2.0f + 20.0f;
      m_aFlyWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 45.0f);
      m_fFlyAttackRunSpeed = m_fFlyWalkSpeed;
      m_aFlyAttackRotateSpeed = AngleDeg(FRnd()*25.0f + 150.0f);
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 20.0f;
      m_aFlyCloseRotateSpeed = 150.0f;
      // attack properties - CAN BE SET
      m_fFlyAttackDistance = 100.0f;
      m_fFlyCloseDistance = 0.0f;
      m_fFlyStopDistance = 0.1f;
      m_fFlyAttackFireTime = 2.0f;
      m_fFlyCloseFireTime = 0.5f;
      m_fFlyIgnoreRange = 200.0f;
      m_fFlyHeight = 1.25f;
    }
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    StandingAnim();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

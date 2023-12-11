336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Neptune/Neptune2.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";


%{
#define REMINDER_DEATTACH_FIREBALL 666
FLOAT3D vTentacleAttackPos = FLOAT3D(0.0f, 10.0f, 5.0f);
FLOAT3D vVomitPos = FLOAT3D(0.06f, 18.0f, -0.15f);
static float _tmLastStandingAnim =0.0f; 

#define NEP_MAX_TA 10
FLOAT nepTriggerArray[NEP_MAX_TA] = { 0.9f, 0.8f, 0.7f, 0.6f, 0.5f,
                                         0.4f, 0.3f, 0.2f, 0.1f, 0.05f }; 

// info structure
static EntityInfo eiNeptune = {
  EIBT_FLESH, 20000.0f,
  0.0f, 20.0f, 0.0f,     // source (eyes)
  0.0f, 20.0f, 0.0f,     // target (body)
};
%}

class CNeptune : CEnemyBase {
name      "Neptune";
thumbnail "Thumbnails\\Neptune.tbn";

properties:
  2 INDEX m_iCounter = 0,
  3 CEntityPointer m_penFireFX,

  17 CSoundObject m_soDistance,
  
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
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_NEPTUNE         "ModelsF\\Enemies\\Neptune\\Neptune2.mdl",
 11 texture TEXTURE_NEPTUNE       "ModelsF\\Enemies\\Neptune\\Textures\\Human_Mutant_noteeth.tex",

 // ************** SOUNDS **************
 50 sound   SOUND_IDLE1      "ModelsF\\Enemies\\Neptune\\Sounds\\Idle1.wav",
 51 sound   SOUND_IDLE2      "ModelsF\\Enemies\\Neptune\\Sounds\\Idle2.wav",
 52 sound   SOUND_IDLE3      "ModelsF\\Enemies\\Neptune\\Sounds\\Idle3.wav",
 53 sound   SOUND_IDLE4      "ModelsF\\Enemies\\Neptune\\Sounds\\Idle4.wav",
 54 sound   SOUND_SIGHT     "ModelsF\\Enemies\\Neptune\\Sounds\\Sight.wav",
 55 sound   SOUND_WOUND     "ModelsF\\Enemies\\Neptune\\Sounds\\Wound.wav",
 56 sound   SOUND_DEATH     "ModelsF\\Enemies\\Neptune\\Sounds\\Death.wav",
 57 sound   SOUND_CAST      "ModelsF\\Enemies\\Neptune\\Sounds\\Fire.wav",
 58 sound   SOUND_VOMIT     "ModelsF\\Enemies\\Neptune\\Sounds\\Vomit.wav",
 59 sound   SOUND_MELEE      "ModelsF\\Enemies\\Neptune\\Sounds\\Melee.wav",

functions:

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("Iku-Turso has defeated %s"), strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmDemon, "DataF\\Messages\\Enemies\\Neptune.txt");
    return fnmDemon;
  }
  
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE1 );
    PrecacheSound(SOUND_IDLE2 );
    PrecacheSound(SOUND_IDLE3 );
    PrecacheSound(SOUND_IDLE4 );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_CAST);
    PrecacheSound(SOUND_VOMIT);
    PrecacheSound(SOUND_MELEE);
    PrecacheModel(MODEL_NEPTUNE);
    PrecacheTexture(TEXTURE_NEPTUNE);
    PrecacheClass(CLASS_PROJECTILE, PRT_MANTAMAN_FIRE);
    PrecacheClass(CLASS_PROJECTILE, PRT_NEPTUNE);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiNeptune;
  };

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
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
    for (INDEX i=0; i<NEP_MAX_TA; i++) {
      FLOAT fHealth = nepTriggerArray[i]*m_fMaxHealth;
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
    if(dmtType==DMT_CANNONBALL || DMT_CANNONBALL_EXPLOSION)
    {
      fDamageAmmount *= 0.25f;
    }
    
    // resistant to explosions
    if(dmtType==DMT_EXPLOSION)
    {
      fDamageAmmount= fDamageAmmount*0.5f;
    }

    // _ can't harm _
    if (!IsOfClass(penInflictor, "Neptune")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // bosses don't darken when burning
    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    StartModelAnim(NEPTUNE2_ANIM_WOUND, 0);
    return NEPTUNE2_ANIM_WOUND;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(NEPTUNE2_ANIM_DEATH, 0);
    return NEPTUNE2_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch)
  {
    vStretch=FLOAT3D(1,1,2)*3.0f;
    return 1.1f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(NEPTUNE2_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    //_tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(NEPTUNE2_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
    StandingAnim();
  };

  void RunningAnim(void) {
    StandingAnim();
  };
  void RotatingAnim(void) {
    StandingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
    INDEX iIdleSound;
    switch (IRnd()%4) {
      case 0: iIdleSound = SOUND_IDLE1; break;
      case 1: iIdleSound = SOUND_IDLE2; break;
      case 2: iIdleSound = SOUND_IDLE3; break;
      case 3: iIdleSound = SOUND_IDLE4; break;
    }
    PlaySound(m_soDistance, iIdleSound, SOF_3D);
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
    m_soSound.Set3DParameters(200.0f, 50.0f, 2.0f, 1.0f);
    m_soDistance.Set3DParameters(3000.0f, 300.0f, 3.0f, 1.0f);
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
        jump Balls();
        break;
    case 1:
        jump Vomit();
        break;
    }

  };

  Balls(EVoid)
  {
    
    StartModelAnim(NEPTUNE2_ANIM_ATTACK1, 0);
    
    PlaySound(m_soSound, SOUND_CAST, SOF_3D);

    autowait(0.075f);

      ShootProjectile(PRT_NEPTUNE, vTentacleAttackPos, ANGLE3D(AngleDeg((FRnd()-0.5)*-40.0f), AngleDeg(FRnd()*20.0f), 0));

    autowait(0.35f);

      ShootProjectile(PRT_NEPTUNE, vTentacleAttackPos, ANGLE3D(AngleDeg((FRnd()-0.5)*40.0f), AngleDeg(FRnd()*-20.0f), 0));
      
    autowait(1.0f);
    
    return EReturn();
  };

  Vomit(EVoid)
  {
    // SetDesiredTranslation???
    if (m_fMoveSpeed>0.0f) {
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, -m_fMoveSpeed));
    }
    
    StartModelAnim(NEPTUNE2_ANIM_ATTACK2, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_VOMIT, SOF_3D);

    autowait(0.5f);

    ShootProjectile(PRT_MANTAMAN_FIRE, vVomitPos, ANGLE3D(AngleDeg((FRnd()-0.5)*5.0f), AngleDeg(FRnd()*5.0f), 0));
    autowait(0.1f);
    ShootProjectile(PRT_MANTAMAN_FIRE, vVomitPos, ANGLE3D(AngleDeg((FRnd()-0.5)*-5.0f), AngleDeg(FRnd()*5.0f), 0));
    autowait(0.1f);
    ShootProjectile(PRT_MANTAMAN_FIRE, vVomitPos, ANGLE3D(AngleDeg((FRnd()-0.5)*-5.0f), AngleDeg(FRnd()*-5.0f), 0));
    autowait(0.1f);
    ShootProjectile(PRT_MANTAMAN_FIRE, vVomitPos, ANGLE3D(AngleDeg((FRnd()-0.5)*5.0f), AngleDeg(FRnd()*-5.0f), 0));
    autowait(0.1f);
    ShootProjectile(PRT_MANTAMAN_FIRE, vVomitPos, ANGLE3D(AngleDeg((FRnd()-0.5)*10.0f), AngleDeg(FRnd()*10.0f), 0));
    autowait(0.1f);
    ShootProjectile(PRT_MANTAMAN_FIRE, vVomitPos, ANGLE3D(AngleDeg((FRnd()-0.5)*-10.0f), AngleDeg(FRnd()*-10.0f), 0));
    autowait(0.1f);
    ShootProjectile(PRT_MANTAMAN_FIRE, vVomitPos, ANGLE3D(AngleDeg((FRnd()-0.5)*10.0f), AngleDeg(FRnd()*-10.0f), 0));
      
    autowait(1.0f);
    
    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    INDEX iSlashAnim;
    switch (IRnd()%2) {
      case 0: iSlashAnim = NEPTUNE2_ANIM_MELEE1; break;
      case 1: iSlashAnim = NEPTUNE2_ANIM_MELEE2; break;
    }
      StartModelAnim(iSlashAnim, 0);
      PlaySound(m_soSound, SOUND_MELEE, SOF_3D);
       autowait(0.25f);
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 50.0f, FLOAT3D(0, 0, 0), vDirection);
      // push target
      FLOAT3D vSpeed;
      GetHeadingDirection(AngleDeg(0.0f), vSpeed);
      vSpeed = vSpeed * 70.0f;
      KickEntity(m_penEnemy, vSpeed);
      autowait(1.5f);
      MaybeSwitchToAnotherPlayer();
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
    m_sptType = SPT_SLIME;
    en_fDensity = 20000.0f;

    // this is a boss
    m_bBoss = TRUE;

    en_fDensity = 20000.0f;
    // set your appearance
    SetModel(MODEL_NEPTUNE);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = 0.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = 0.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    m_fAttackRunSpeed = 0.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
    // setup attack distances
    m_fAttackDistance = 1000.0f;
    m_fCloseDistance = 45.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 800.0f;
    m_fStopDistance = 5.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    SetHealth(25000.0f);
    m_fMaxHealth = GetHealth();
    SetModelMainTexture(TEXTURE_NEPTUNE);
    m_fBlowUpAmount = 100000000.0f;
    m_fBodyParts = 4;
    m_fDamageWounded = 2500.0f;
    m_iScore = 1000000;
    m_fLockOnEnemyTime = 3.0f;

    // set stretch factor
    GetModelObject()->StretchModel(FLOAT3D(1.75f, 1.75f, 1.75f));
    ModelChangeNotify();
    
    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

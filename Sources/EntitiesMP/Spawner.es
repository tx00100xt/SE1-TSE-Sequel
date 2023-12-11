336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/Spawner/Spawner.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Player";


%{
#define BALL_STRETCH 2.5f
FLOAT3D vLaunchPos = (FLOAT3D(0.06f, 2.2f, -0.5f)*BALL_STRETCH);
static float _tmLastStandingAnim =0.0f;
#define TEMP_PER_GROUP 5  

// info structure
static EntityInfo eiBall = {
  EIBT_FLESH, 1600.0f,
  0.0f, 2.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
%}

class CSpawner : CEnemyBase {
name      "Spawner";
thumbnail "Thumbnails\\Spawner.tbn";

properties:
  1 INDEX m_iCounter = 0,
  2 CSoundObject m_soFeet,            // for running sound
  3 BOOL m_bRunSoundPlaying = FALSE,
  4 CSoundObject m_soBackground,

  5 INDEX m_iGroupCount = 0,
  6 CEntityPointer m_penSpawn1  "Template 1" 'T',
  7 CEntityPointer m_penSpawn2  "Template 2",
  8 CEntityPointer m_penSpawn3  "Template 3",
  9 CEntityPointer m_penSpawn4  "Template 4",
 10 CEntityPointer m_penSpawn5  "Template 5",

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_BALL         "ModelsMP\\Enemies\\SS2\\Spawner\\Spawner.mdl",
 11 texture TEXTURE_BALL       "ModelsMP\\Enemies\\SS2\\Spawner\\Spawner.tex",

 12 model   MODEL_TORSO         "ModelsMP\\Enemies\\SS2\\Spawner\\Debris\\Torso.mdl",
 13 model   MODEL_LEG           "ModelsMP\\Enemies\\SS2\\Spawner\\Debris\\Leg.mdl",

 // ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsMP\\Enemies\\SS2\\Spawner\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\SS2\\Spawner\\Sounds\\Sight.wav",
 52 sound   SOUND_ENGINE    "ModelsMP\\Enemies\\SS2\\Spawner\\Sounds\\Engine.wav",
 55 sound   SOUND_BOILING   "ModelsMP\\Enemies\\SS2\\Spawner\\Sounds\\Boiling.wav",
 56 sound   SOUND_WALK      "ModelsMP\\Enemies\\SS2\\Spawner\\Sounds\\Walk.wav",
 57 sound   SOUND_FIRE      "ModelsMP\\Enemies\\SS2\\Spawner\\Sounds\\Fire.wav",

functions:

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s got their DNA scrambled"), (const char *) strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSpawner, "DataMP\\Messages\\Enemies\\SS2\\Spawner.txt");
    return fnmSpawner;
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
   {
    if (slPropertyOffset == offsetof(CSpawner, m_penSpawn1) && slPropertyOffset <= offsetof(CSpawner, m_penSpawn5))
	 {
      return ValidEnemy(penTarget);
    } 
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }

  BOOL ValidEnemy(CEntity *pen) {
    if (pen == NULL || pen == this || !IsDerivedFromClass(pen, "Enemy Base")) {
      return FALSE;
    }
    return ((CEnemyBase&)*pen).m_bTemplate;
  };
  
  
  BOOL DoSafetyChecks(void) {
    if (m_penSpawn1 ==NULL || m_penSpawn2 ==NULL || m_penSpawn3 ==NULL || m_penSpawn4 ==NULL || m_penSpawn5 ==NULL)
    {
      WarningMessage( "At least one template in each group required! Destroying spawner...");
      return FALSE;
    }
    return TRUE;
  }
  
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_ENGINE);
    PrecacheSound(SOUND_BOILING);
    PrecacheSound(SOUND_WALK);
    PrecacheSound(SOUND_FIRE);
    PrecacheModel(MODEL_BALL);
    PrecacheTexture(TEXTURE_BALL);
    PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_PROJECTILE);

    PrecacheModel(MODEL_TORSO);
    PrecacheModel(MODEL_LEG);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiBall;
  };

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // can't harm own class
    if (!IsOfClass(penInflictor, "Spawner")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };



  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(SPAWNER_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(SPAWNER_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };

  void WalkingAnim(void) {
    RunningAnim();
  };

  void RunningAnim(void) {
    StartModelAnim(SPAWNER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(SPAWNER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
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
    m_soSound.Set3DParameters(80.0f, 5.0f, 2.0f, 1.0f);
    m_soFeet.Set3DParameters(80.0f, 5.0f, 2.0f, 1.0f);
    m_soBackground.Set3DParameters(80.0f, 5.0f, 2.0f, 1.0f);
  };


  void LaunchMonster1(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vLaunchPos, ANGLE3D(0.0f+FRnd()*5, 20+FRnd()*45, 0));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -30.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonster2(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vLaunchPos, ANGLE3D(0.0f+FRnd()*5, 20+FRnd()*45, 0));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn2, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -30.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonster3(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vLaunchPos, ANGLE3D(0.0f+FRnd()*5, 20+FRnd()*45, 0));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn3, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -30.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonster4(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vLaunchPos, ANGLE3D(0.0f+FRnd()*5, 20+FRnd()*45, 0));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn4, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -30.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonster5(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vLaunchPos, ANGLE3D(0.0f+FRnd()*5, 20+FRnd()*45, 0));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn5, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -30.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
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

    vNormalizedDamage *= 0.1f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

    Debris_Begin(EIBT_FLESH, DPR_SPARKS, BET_NONE, fEntitySize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_BALL, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_BALL, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_BALL, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_BALL, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

    Debris_Begin(EIBT_FLESH, DPT_AFTERBURNER, BET_NONE, fEntitySize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_TORSO, TEXTURE_BALL, 0, 0, 0, 0, 0.0f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

    // spawn explosion
    CPlacement3D plExplosion = GetPlacement();
    CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_CANNON;
    FLOAT fSize = fEntitySize*0.75f;
    eSpawnEffect.vStretch = FLOAT3D(fSize,fSize,fSize);
    penExplosion->Initialize(eSpawnEffect);

    // explosion debris
    eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
    CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    eSpawnEffect.colMuliplier = C_MAGENTA|CT_OPAQUE;
    penExplosionDebris->Initialize(eSpawnEffect);

    // explosion smoke
    eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
    CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    eSpawnEffect.colMuliplier = C_MAGENTA|CT_OPAQUE;
    penExplosionSmoke->Initialize(eSpawnEffect);
    
    // spawn shockwave
    CPlacement3D pl = GetPlacement();
    pl.pl_PositionVector(2) += 0.1f;
    CEntityPointer penShockwave = CreateEntity(pl, CLASS_BASIC_EFFECT);
        
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_CANNONSHOCKWAVE;
    eSpawnEffect.vStretch = FLOAT3D(fSize, fSize, fSize);
    penShockwave->Initialize(eSpawnEffect);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire
  {
    DeactivateRunningSound();
    
    // SetDesiredTranslation???
    if (m_fMoveSpeed>0.0f) {
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, -m_fMoveSpeed));
    }
    
    StartModelAnim(SPAWNER_ANIM_BOILING, 0);   
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_BOILING, SOF_3D);

    autowait(2.1f);

    MaybeSwitchToAnotherPlayer();
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    StartModelAnim(SPAWNER_ANIM_FIRE, 0);

    autowait(0.7f);


    INDEX iRnd = IRnd()%5;
    switch(iRnd)
    {
    case 0: LaunchMonster1(); break;
    case 1: LaunchMonster2(); break;
    case 2: LaunchMonster3(); break;
    case 3: LaunchMonster4(); break;
    case 4: LaunchMonster5(); break;
	}
      
    autowait(0.5f);
    MaybeSwitchToAnotherPlayer();
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    StartModelAnim(SPAWNER_ANIM_FIRE, 0);

    autowait(0.7f);


    INDEX iRnd = IRnd()%5;
    switch(iRnd)
    {
    case 0: LaunchMonster1(); break;
    case 1: LaunchMonster2(); break;
    case 2: LaunchMonster3(); break;
    case 3: LaunchMonster4(); break;
    case 4: LaunchMonster5(); break;
	}
      
    autowait(0.5f);
    MaybeSwitchToAnotherPlayer();
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    StartModelAnim(SPAWNER_ANIM_FIRE, 0);

    autowait(0.7f);


    INDEX iRnd = IRnd()%5;
    switch(iRnd)
    {
    case 0: LaunchMonster1(); break;
    case 1: LaunchMonster2(); break;
    case 2: LaunchMonster3(); break;
    case 3: LaunchMonster4(); break;
    case 4: LaunchMonster5(); break;
	}
      
    autowait(1.0f);
    
    return EReturn();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {

      PlaySound(m_soBackground, SOUND_ENGINE, SOF_3D|SOF_LOOP);
    return EReturn();
  }


  /*Fire(EVoid) : CEnemyBase::Fire
  {
    DeactivateRunningSound();
    
    // SetDesiredTranslation???
    if (m_fMoveSpeed>0.0f) {
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, -m_fMoveSpeed));
    }
    
    StartModelAnim(SPAWNER_ANIM_BOILING, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_BOILING, SOF_3D);

    autowait(2.1f);

    MaybeSwitchToAnotherPlayer();
    StartModelAnim(SPAWNER_ANIM_FIRE, 0);

    autowait(0.7f);

    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_DEMON_FIREBALL, vLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_DEMON_FIREBALL, vLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
      
    autowait(0.5f);
    MaybeSwitchToAnotherPlayer();
    StartModelAnim(SPAWNER_ANIM_FIRE, 0);

    autowait(0.7f);

    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_DEMON_FIREBALL, vLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_DEMON_FIREBALL, vLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
      
    autowait(0.5f);
    MaybeSwitchToAnotherPlayer();
    StartModelAnim(SPAWNER_ANIM_FIRE, 0);

    autowait(0.7f);

    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_DEMON_FIREBALL, vLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_DEMON_FIREBALL, vLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
      
    autowait(1.0f);
    
    return EReturn();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {

      PlaySound(m_soBackground, SOUND_ENGINE, SOF_3D|SOF_LOOP);
    return EReturn();
  }*/


/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);

    en_fDensity = 1100.0f;
    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;
    // set your appearance
    SetModel(MODEL_BALL);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = 4.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd()/1.0f + 13.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    m_fAttackRunSpeed = 6.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
    // setup attack distances
    m_fAttackDistance = 650.0f;
    m_fCloseDistance = 1.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 8.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 800.0f;
    m_fStopDistance = 5.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    SetHealth(700.0f);
    m_fMaxHealth = GetHealth();
    SetModelMainTexture(TEXTURE_BALL);
    m_fBlowUpAmount = 0.0f;
    m_fBodyParts = 4;
    m_fDamageWounded = 100000000.0f;
    m_iScore = 8000;
    m_fLockOnEnemyTime = 3.0f;

    // set stretch factor
    ModelChangeNotify();
    autowait(_pTimer->TickQuantum);

    if (!DoSafetyChecks()) {
      Destroy();
      return;
    }
    
    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

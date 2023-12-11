324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/Tank/TankBod.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Projectile";

enum TankChar {
  0 TK_SMALL    "Small",    // soldier
  1 TK_GENERAL  "General",   // sergeant
  2 TK_MONSTER  "Monster"
};

%{
// info structure
static EntityInfo eiTank = {
  EIBT_FLESH, 1000.0f,
  0.0f, 4.0f, 0.0f,
  0.0f, 4.5f, 0.0f,
};

#define SIZE_SMALL    (1.0f)
#define SIZE_GENERAL  (3.0f)
#define SIZE_MONSTER  (12.0f)
#define FIRE_LEFT_ARM   FLOAT3D(-1.5f, 2.75f, -2.0f)
#define FIRE_RIGHT_ARM  FLOAT3D(+1.0f, 2.75f, -2.0f)

%}


class CTank : CEnemyBase {
name      "Tank";
thumbnail "Thumbnails\\Tank.tbn";

properties:
  1 enum TankChar m_TankChar   "Character" 'C' = TK_SMALL,
  2 INDEX m_iLoopCounter = 0,
  3 FLOAT m_fSize = 1.0f,
  4 BOOL m_bWalkSoundPlaying = FALSE,
  5 BOOL m_bBeBoss  "Boss" 'B' = FALSE,

  10 CSoundObject m_soFeet,
  11 CSoundObject m_soFire1,
  12 CSoundObject m_soFire2,
  13 CSoundObject m_soFire3,
  14 CSoundObject m_soFire4,
  15 CSoundObject m_soBackground,

  20 INDEX   m_fgibTexture = TEXTURE_TANK_SMALL,
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_TANK              "ModelsMP\\Enemies\\SS2\\Tank\\TankBod.mdl",
 11 texture TEXTURE_TANK_SMALL      "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\body_Small.tex",
 12 texture TEXTURE_TANK_GENERAL    "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\body_Red.tex",
 13 texture TEXTURE_TANK_MONSTER    "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\body_Blue.tex",

 14 model   MODEL_THREADS               "ModelsMP\\Enemies\\SS2\\Tank\\TankThreads.mdl",
 15 texture TEXTURE_THREADS             "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Threads.tex",
 16 model   MODEL_CANNON                "ModelsMP\\Enemies\\SS2\\Tank\\TankCannon.mdl",
 17 model   MODEL_CANNON2               "ModelsMP\\Enemies\\SS2\\Tank\\TankCannon2.mdl",
 18 texture TEXTURE_CANNON              "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Cannon.tex",
 19 model   MODEL_BARREL                "ModelsMP\\Enemies\\SS2\\Tank\\TankBarrel.mdl",
 20 texture TEXTURE_BARREL              "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\TankBarrel.tex",
 21 model   MODEL_ENGINE                "ModelsMP\\Enemies\\SS2\\Tank\\TankEngine.mdl",
 22 texture TEXTURE_ENGINE              "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Tank.tex",
 23 model   MODEL_TEETH                "ModelsMP\\Enemies\\SS2\\Tank\\TankTeeth.mdl",
 24 texture TEXTURE_TEETH              "ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Teeth.tex",

 25 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 26 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** BODY PARTS **************
 30 model   MODEL_DEBRIS_HEAD    "ModelsMP\\Enemies\\SS2\\Tank\\Debris\\Head.mdl",
 31 model   MODEL_DEBRIS_CANNON    "ModelsMP\\Enemies\\SS2\\Tank\\Debris\\Cannon.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_ENGINE        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_EngineLoop.wav",
 51 sound   SOUND_LASER         "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\PlasmaRifle_Fire03.wav",
 52 sound   SOUND_ROCKET        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Fire.wav",
 53 sound   SOUND_DRIVE         "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Drive02.wav",
 54 sound   SOUND_KICK          "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\SwishLow.wav",

 55 sound   SOUND_SIGHT1        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Sight02.wav",
 56 sound   SOUND_SIGHT2        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Sight03.wav",
 57 sound   SOUND_SIGHT3        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Sight04.wav",
 58 sound   SOUND_SIGHT4        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Sight05.wav",
 59 sound   SOUND_SIGHT5        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Sight06.wav",
 60 sound   SOUND_SIGHT6        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Sight07.wav",

 61 sound   SOUND_ATTACK1       "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Attack03.wav",
 62 sound   SOUND_ATTACK2       "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Attack04.wav",
 63 sound   SOUND_ATTACK3       "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Attack05.wav",

 65 sound   SOUND_WOUND1        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Wound02.wav",
 66 sound   SOUND_WOUND2        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Wound05.wav",
 67 sound   SOUND_WOUND3        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Wound08.wav",
 68 sound   SOUND_WOUND4        "ModelsMP\\Enemies\\SS2\\Tank\\Sounds\\Hrvoje_Wound11.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A bull-tank took %s to Hades"), strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSmall,   "DataMP\\Messages\\Enemies\\SS2\\TankSmall.txt");
    static DECLARE_CTFILENAME(fnmGeneral, "DataMP\\Messages\\Enemies\\SS2\\TankGeneral.txt");
    static DECLARE_CTFILENAME(fnmMonster, "DataMP\\Messages\\Enemies\\SS2\\TankMonster.txt");
    switch(m_TankChar) {
    default: ASSERT(FALSE);
    case TK_SMALL:   return fnmSmall;
    case TK_GENERAL:   return fnmGeneral;
    case TK_MONSTER:   return fnmMonster;
    }
  }

  void Precache(void) {
    CEnemyBase::Precache();

    PrecacheModel(MODEL_TANK);

    PrecacheModel(MODEL_THREADS);
    PrecacheTexture(TEXTURE_THREADS);
    PrecacheModel(MODEL_CANNON);
    PrecacheModel(MODEL_CANNON2);
    PrecacheTexture(TEXTURE_CANNON);
    PrecacheModel(MODEL_THREADS);
    PrecacheTexture(TEXTURE_THREADS);
    PrecacheModel(MODEL_BARREL);
    PrecacheTexture(TEXTURE_BARREL);
    PrecacheModel(MODEL_TEETH);
    PrecacheTexture(TEXTURE_TEETH);

    PrecacheSound(SOUND_ENGINE );
    PrecacheSound(SOUND_LASER );
    PrecacheSound(SOUND_ROCKET );
    PrecacheSound(SOUND_DRIVE );
    PrecacheSound(SOUND_KICK );

    PrecacheSound(SOUND_SIGHT1 );
    PrecacheSound(SOUND_SIGHT2 );
    PrecacheSound(SOUND_SIGHT3 );
    PrecacheSound(SOUND_SIGHT4 );
    PrecacheSound(SOUND_SIGHT5 );
    PrecacheSound(SOUND_SIGHT6 );

    PrecacheSound(SOUND_ATTACK1 );
    PrecacheSound(SOUND_ATTACK2 );
    PrecacheSound(SOUND_ATTACK3 );

    PrecacheSound(SOUND_WOUND1 );
    PrecacheSound(SOUND_WOUND2 );
    PrecacheSound(SOUND_WOUND3 );
    PrecacheSound(SOUND_WOUND4 );

    PrecacheModel(MODEL_DEBRIS_HEAD);
    PrecacheModel(MODEL_DEBRIS_CANNON);

    if (m_TankChar==TK_SMALL)
    {
      // model's texture
      PrecacheTexture(TEXTURE_TANK_SMALL);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_LASER_TANK);
    }
    if (m_TankChar==TK_GENERAL)
    {
      // model's texture
      PrecacheTexture(TEXTURE_TANK_GENERAL);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_WALKER_ROCKET);
    }
    if (m_TankChar==TK_MONSTER)
    {
      // model's texture
      PrecacheTexture(TEXTURE_TANK_MONSTER);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_DEVIL_ROCKET);
    }
  };
  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiTank;
  };

  FLOAT GetCrushHealth(void)
  {
    if (m_TankChar==TK_SMALL) {
      return 100.0f;
    }
    if (m_TankChar==TK_GENERAL) {
      return 200.0f;
    }
    if (m_TankChar==TK_MONSTER) {
      return 400.0f;
    }
    return 0.0f;
  }

  void ShakeItBaby(FLOAT tmShaketime, FLOAT fPower)
  {
    CWorldSettingsController *pwsc = GetWSC(this);
    if (pwsc!=NULL) {
      if (m_TankChar==TK_SMALL) {
        pwsc->m_tmShakeStarted = tmShaketime;
        pwsc->m_vShakePos = GetPlacement().pl_PositionVector;
        pwsc->m_fShakeFalloff = 40.0f;
        pwsc->m_fShakeFade = 3.0f;

        pwsc->m_fShakeIntensityZ = 0.0f;
        pwsc->m_tmShakeFrequencyZ = 5.0f;
        pwsc->m_fShakeIntensityY = 0.1f*fPower;
        pwsc->m_tmShakeFrequencyY = 5.0f;
        pwsc->m_fShakeIntensityB = 2.5f*fPower;
        pwsc->m_tmShakeFrequencyB = 7.2f;

        pwsc->m_bShakeFadeIn = FALSE;
		}
      if (m_TankChar==TK_GENERAL) {
        pwsc->m_tmShakeStarted = tmShaketime;
        pwsc->m_vShakePos = GetPlacement().pl_PositionVector;
        pwsc->m_fShakeFalloff = 70.0f;
        pwsc->m_fShakeFade = 3.0f;

        pwsc->m_fShakeIntensityZ = 0.0f;
        pwsc->m_tmShakeFrequencyZ = 5.0f;
        pwsc->m_fShakeIntensityY = 0.1f*fPower;
        pwsc->m_tmShakeFrequencyY = 5.0f;
        pwsc->m_fShakeIntensityB = 2.5f*fPower;
        pwsc->m_tmShakeFrequencyB = 7.2f;

        pwsc->m_bShakeFadeIn = FALSE;
		}
      if (m_TankChar==TK_MONSTER) {
        pwsc->m_tmShakeStarted = tmShaketime;
        pwsc->m_vShakePos = GetPlacement().pl_PositionVector;
        pwsc->m_fShakeFalloff = 130.0f;
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
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // walker can't harm walker
    if (!IsOfClass(penInflictor, "Tank") ||
      ((CTank*)penInflictor)->m_TankChar!=m_TankChar) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    iAnim = TANKBOD_ANIM_WOUND;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };


  // virtual anim functions
  void StandingAnim(void) {
    DeactivateWalkingSound();
    StartModelAnim(TANKBOD_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void StandingAnimFight(void)
  {
    DeactivateWalkingSound();
    StartModelAnim(TANKBOD_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  }
  void WalkingAnim(void) {
    ActivateWalkingSound();
    StartModelAnim(TANKBOD_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RunningAnim(void) {
    WalkingAnim();
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };

  // virtual sound functions
  void SightSound(void) {
    INDEX iSightSound;
    switch (IRnd()%6) {
      case 0: iSightSound = SOUND_SIGHT1; break;
      case 1: iSightSound = SOUND_SIGHT2; break;
      case 2: iSightSound = SOUND_SIGHT3; break;
      case 3: iSightSound = SOUND_SIGHT4; break;
      case 4: iSightSound = SOUND_SIGHT5; break;
      case 5: iSightSound = SOUND_SIGHT6; break;
    }
    PlaySound(m_soSound, iSightSound, SOF_3D);
  };
  void WoundSound(void) {
    INDEX iWoundSound;
    switch (IRnd()%4) {
      case 0: iWoundSound = SOUND_WOUND1; break;
      case 1: iWoundSound = SOUND_WOUND2; break;
      case 2: iWoundSound = SOUND_WOUND3; break;
      case 3: iWoundSound = SOUND_WOUND4; break;
      default: ASSERTALWAYS("Tank unknown damage");
    }
    PlaySound(m_soSound, iWoundSound, SOF_3D);
  };

  // walking sounds
  void ActivateWalkingSound(void)
  {
    if (!m_bWalkSoundPlaying) {
      PlaySound(m_soFeet, SOUND_DRIVE, SOF_3D|SOF_LOOP);
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
    m_soBackground.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  BOOL ShouldBlowUp(void)
  {
    return TRUE;
  }

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

    if (m_TankChar == TK_SMALL) {
      ShakeItBaby(_pTimer->CurrentTick(), 2.0f);
    }
    if (m_TankChar == TK_GENERAL) {
      ShakeItBaby(_pTimer->CurrentTick(), 3.0f);
    }
    if (m_TankChar == TK_MONSTER) {
      ShakeItBaby(_pTimer->CurrentTick(), 4.0f);
    }

    // inflict damage
    FLOAT3D vSource;
    GetEntityInfoPosition(this, eiTank.vTargetCenter, vSource);
      InflictDirectDamage(this, this, DMT_EXPLOSION, 100.0f, vSource, 
        -en_vGravityDir);
      if (m_TankChar == TK_SMALL) {
      InflictRangeDamage(this, DMT_EXPLOSION, 40.0f, vSource, 1.0f, 10.0f);
      } if (m_TankChar == TK_GENERAL) {
      InflictRangeDamage(this, DMT_EXPLOSION, 60.0f, vSource, 1.0f, 30.0f);
      } if (m_TankChar == TK_MONSTER)  {
      InflictRangeDamage(this, DMT_EXPLOSION, 120.0f, vSource, 1.0f, 90.0f);
      }
    
    // spawn explosion
    CPlacement3D plExplosion = GetPlacement();
    CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_GRENADE;
    FLOAT fSize = fEntitySize*0.75f;
    eSpawnEffect.vStretch = FLOAT3D(fSize,fSize,fSize);
    penExplosion->Initialize(eSpawnEffect);

    // spawn debris
      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }

    Debris_Spawn(this, this, MODEL_DEBRIS_HEAD, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_CANNON, TEXTURE_CANNON, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_CANNON, TEXTURE_CANNON, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // explosion debris
    eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
    CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    penExplosionDebris->Initialize(eSpawnEffect);

    // explosion smoke
    eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
    CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    penExplosionSmoke->Initialize(eSpawnEffect);
    
    // spawn shockwave
    CPlacement3D pl = GetPlacement();
    pl.pl_PositionVector(2) += 0.1f;
    CEntityPointer penShockwave = CreateEntity(pl, CLASS_BASIC_EFFECT);
        
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_CANNONSHOCKWAVE;
    eSpawnEffect.vStretch = FLOAT3D(fSize, fSize, fSize);
    penShockwave->Initialize(eSpawnEffect);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(TANKBOD_ANIM_TANK_IDLEFIGHT , 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    INDEX iTauntSound;
    switch (IRnd()%3) {
      case 0: iTauntSound = SOUND_ATTACK1; break;
      case 1: iTauntSound = SOUND_ATTACK2; break;
      case 2: iTauntSound = SOUND_ATTACK3; break;
    }
    PlaySound(m_soSound, iTauntSound, SOF_3D);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(TANKBOD_ANIM_TANK_IDLEFIGHT) + 0.5f + FRnd()/3;
    autocall CEnemyBase::LockOnEnemy() EReturn;

    // general 4 rockets
    if (m_TankChar==TK_GENERAL) {
      StartModelAnim(TANKBOD_ANIM_TANK_FIRE , AOF_LOOPING);
      ShootProjectile(PRT_WALKER_ROCKET, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_ROCKET, SOF_3D);

      autowait(0.5f);

      ShootProjectile(PRT_WALKER_ROCKET, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_ROCKET, SOF_3D);

      autowait(0.7f);

      StartModelAnim(TANKBOD_ANIM_TANK_FIRE , AOF_LOOPING);
      ShootProjectile(PRT_WALKER_ROCKET, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_ROCKET, SOF_3D);

      autowait(0.5f);

      ShootProjectile(PRT_WALKER_ROCKET, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_ROCKET, SOF_3D);

//      m_fLockOnEnemyTime = 0.25f;
//      autocall CEnemyBase::LockOnEnemy() EReturn;
    } 
    if (m_TankChar==TK_MONSTER) {
      StartModelAnim(TANKBOD_ANIM_TANK_FIRE , AOF_LOOPING);
      ShootProjectile(PRT_DEVIL_ROCKET, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_ROCKET, SOF_3D);

      autowait(0.5f);

      ShootProjectile(PRT_DEVIL_ROCKET, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_ROCKET, SOF_3D);

      autowait(0.7f);

      StartModelAnim(TANKBOD_ANIM_TANK_FIRE , AOF_LOOPING);
      ShootProjectile(PRT_DEVIL_ROCKET, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_ROCKET, SOF_3D);

      autowait(0.5f);

      ShootProjectile(PRT_DEVIL_ROCKET, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_ROCKET, SOF_3D);

//      m_fLockOnEnemyTime = 0.25f;
//      autocall CEnemyBase::LockOnEnemy() EReturn;
    } 
    if (m_TankChar==TK_SMALL) {
      StartModelAnim(TANKBOD_ANIM_TANK_FIRE , AOF_LOOPING);
      ShootProjectile(PRT_LASER_TANK, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_LASER, SOF_3D);

      autowait(0.5f);

      ShootProjectile(PRT_LASER_TANK, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_LASER, SOF_3D);

      autowait(0.7f);

      StartModelAnim(TANKBOD_ANIM_TANK_FIRE , AOF_LOOPING);
      ShootProjectile(PRT_LASER_TANK, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_LASER, SOF_3D);

      autowait(0.5f);

      ShootProjectile(PRT_LASER_TANK, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_LASER, SOF_3D);

//      m_fLockOnEnemyTime = 0.25f;
//      autocall CEnemyBase::LockOnEnemy() EReturn;
    }
    StopMoving();

    autowait(0.5f + FRnd()/3);

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(TANKBOD_ANIM_WALK, 0);
    autowait(GetModelObject()->GetAnimLength(TANKBOD_ANIM_WALK));

    // wait for a while
    StandingAnimFight();
    autowait(FRnd()*0.1f+0.1f);

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    StartModelAnim(TANKBOD_ANIM_TANK_MELEE, 0);
    autowait(0.4f);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_TankChar == TK_SMALL) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 25.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 25.0f;
            KickEntity(m_penEnemy, vSpeed);
      } if (m_TankChar == TK_GENERAL) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 100.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 50.0f;
            KickEntity(m_penEnemy, vSpeed);
      } if (m_TankChar == TK_MONSTER)  {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 200.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 100.0f;
            KickEntity(m_penEnemy, vSpeed);
      }
    }

    autowait(0.2f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {

      PlaySound(m_soBackground, SOUND_ENGINE, SOF_3D|SOF_LOOP);
    return EReturn();
  }

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_tmMaxHoldBreath = 25.0f;
    if (m_TankChar==TK_SMALL) {
      SetHealth(300.0f);
      m_fMaxHealth = 300.0f;
    } if (m_TankChar==TK_GENERAL)  {
      SetHealth(1200.0f);
      m_fMaxHealth = 1200.0f;
    } if (m_TankChar==TK_MONSTER)  {
      SetHealth(5000.0f);
      m_fMaxHealth = 5000.0f;
    }
    en_fDensity = 10000.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS;

    // set your appearance
    SetModel(MODEL_TANK);

    if (m_TankChar==TK_SMALL) {
      m_fSize = 1.0f;
      SetModelMainTexture(TEXTURE_TANK_SMALL);
	
      AddAttachment(TANKBOD_ATTACHMENT_TANKENGINE, MODEL_ENGINE, TEXTURE_ENGINE);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_SMALL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKTHREADS, MODEL_THREADS, TEXTURE_THREADS);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_SMALL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKTEETH, MODEL_TEETH, TEXTURE_TEETH);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_SMALL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKCANNON, MODEL_CANNON, TEXTURE_CANNON);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_SMALL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKCANNON2, MODEL_CANNON2, TEXTURE_CANNON);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_SMALL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKBARREL, MODEL_BARREL, TEXTURE_BARREL);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_SMALL);

      ModelChangeNotify();
      m_fBlowUpAmount = 0.0f;
	  m_fBlowUpSize = 2.0f;
	  m_fgibTexture = TEXTURE_TANK_SMALL;
      m_iScore = 3000;
      m_fBodyParts = 10;
      m_fDamageWounded = 100.0f;
      m_fCloseDistance = 5.0f;
      m_fStopDistance = 5.0f;
      m_fWalkSpeed = FRnd()*1.5f + 9.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
      m_fAttackDistance = 200.0f;
    }
    if (m_TankChar==TK_GENERAL) {
      m_fSize = 3.0f;
      SetModelMainTexture(TEXTURE_TANK_GENERAL);
	
      AddAttachment(TANKBOD_ATTACHMENT_TANKENGINE, MODEL_ENGINE, TEXTURE_ENGINE);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_GENERAL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKTHREADS, MODEL_THREADS, TEXTURE_THREADS);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_GENERAL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKTEETH, MODEL_TEETH, TEXTURE_TEETH);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_GENERAL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKCANNON, MODEL_CANNON, TEXTURE_CANNON);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_GENERAL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKCANNON2, MODEL_CANNON2, TEXTURE_CANNON);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_GENERAL);
      AddAttachment(TANKBOD_ATTACHMENT_TANKBARREL, MODEL_BARREL, TEXTURE_BARREL);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_GENERAL);

      ModelChangeNotify();
      m_fBlowUpAmount = 0.0f;
	  m_fBlowUpSize = 6.0f;
	  m_fgibTexture = TEXTURE_TANK_GENERAL;
      m_iScore = 10000;
      m_fBodyParts = 10;
      m_fDamageWounded = 500.0f;
      m_fCloseDistance = 15.0f;
      m_fStopDistance = 15.0f;
      m_fWalkSpeed = FRnd()*4.5f + 9.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
      m_fAttackDistance = 500.0f;
    }
    if (m_TankChar==TK_MONSTER) {
      m_fSize = 12.0f;
      SetModelMainTexture(TEXTURE_TANK_MONSTER);
	
      AddAttachment(TANKBOD_ATTACHMENT_TANKENGINE, MODEL_ENGINE, TEXTURE_ENGINE);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_MONSTER);
      AddAttachment(TANKBOD_ATTACHMENT_TANKTHREADS, MODEL_THREADS, TEXTURE_THREADS);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_MONSTER);
      AddAttachment(TANKBOD_ATTACHMENT_TANKTEETH, MODEL_TEETH, TEXTURE_TEETH);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_MONSTER);
      AddAttachment(TANKBOD_ATTACHMENT_TANKCANNON, MODEL_CANNON, TEXTURE_CANNON);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_MONSTER);
      AddAttachment(TANKBOD_ATTACHMENT_TANKCANNON2, MODEL_CANNON2, TEXTURE_CANNON);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_MONSTER);
      AddAttachment(TANKBOD_ATTACHMENT_TANKBARREL, MODEL_BARREL, TEXTURE_BARREL);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1)*SIZE_MONSTER);

      ModelChangeNotify();
      m_fBlowUpAmount = 0.0f;
	  m_fBlowUpSize = 24.0f;
	  m_fgibTexture = TEXTURE_TANK_MONSTER;
      m_iScore = 40000;
      m_fBodyParts = 10;
      m_fDamageWounded = 2000.0f;
      m_fCloseDistance = 50.0f;
      m_fStopDistance = 50.0f;
      m_fWalkSpeed = FRnd()*17.0f + 9.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
      m_fAttackDistance = 1000.0f;
    }
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    StandingAnim();
    // setup moving speed
    m_fAttackRunSpeed = m_fWalkSpeed;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2;
    m_fCloseRunSpeed = m_fWalkSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2;
    m_fWalkSpeed/=2.0f;
    // setup attack distances
    m_fAttackFireTime = 6.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 1000.0f;
    m_bBoss = m_bBeBoss;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

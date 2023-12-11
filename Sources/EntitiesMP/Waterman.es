336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "AREP/Models/Waterman/WaterMan.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyDive";
uses "EntitiesMP/BasicEffects";

enum WaterType {
  0 WTR_SMALL          "Small",      // small (fighter)
  1 WTR_BIG            "Big",        // big
  2 WTR_HUGE           "Large",      // large
};

enum WaterEnv {
  0 WTR_NORMAL    "Clean",
  1 WTR_DIRTY     "Dirty",
};


enum WatermanState {
  0 WTRS_NORMAL        "Normal",     // normal state
  1 WTRS_BOX           "Box",        // in box
  2 WTRS_PLANE         "Plane",      // as plane
};

%{
static float _tmLastStandingAnim =0.0f;  
#define WTR_SMALL_STRETCH 1.0f
#define WTR_BIG_STRETCH 4.0f
#define WTR_LARGE_STRETCH 16.0f

#define WATERMAN_SPAWN_BIG   (FLOAT3D(0.0171274f, 1.78397f, -0.291414f)*WTR_BIG_STRETCH)
#define WATERMAN_SPAWN_LARGE (FLOAT3D(0.0171274f, 1.78397f, -0.291414f)*WTR_LARGE_STRETCH)

// info structure

// water
static EntityInfo eiWatermanSmall = {
  EIBT_WATER, 500.0f,
  0.0f, 1.7f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiWatermanBig = {
  EIBT_WATER, 2000.0f,
  0.0f, 6.8f, 0.0f,
  0.0f, 4.0f, 0.0f,
};
static EntityInfo eiWatermanLarge = {
  EIBT_WATER, 8000.0f,
  0.0f, 27.2f, 0.0f,
  0.0f, 16.0f, 0.0f,
};
%}

class CWaterman : CEnemyDive {
name      "Waterman";
thumbnail "Thumbnails\\Waterman.tbn";

properties:
  1 enum WaterType m_wtrType     "Character" 'C' = WTR_SMALL,
  2 INDEX m_iCounter = 0,
  3 enum WaterEnv m_wtrEnv "Environment" 'E' = WTR_NORMAL,
  4 enum WatermanState m_WtrStartState   "State" 'S' = WTRS_NORMAL,
  5 enum WatermanState m_WtrCurrentState = WTRS_NORMAL,
  7 BOOL m_bWtrBoss  "Boss" 'B' = FALSE,
  8 CSoundObject m_soBackground,  // sound channel for background noise
  9 BOOL m_bSpawnOnBlowUp                 "Blowup spawn" 'B' = TRUE,
 10 BOOL m_bSpawned = FALSE,
 11 INDEX m_ctSpawned = 0,
 12 FLOAT m_fSpawnDamage = 1e6f,
 13 BOOL m_bSpawnEnabled = FALSE,
 14 INDEX m_bCountAsKill = TRUE,
 15 BOOL m_bFloat "Float" 'F'=FALSE,

components:
  0 class   CLASS_BASE          "Classes\\EnemyDive.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  4 class   CLASS_BLOOD_SPRAY  "Classes\\BloodSpray.ecl",

 10 model   MODEL_WATERMAN           "AREP\\Models\\Waterman\\WaterMan.mdl",
 11 texture TEXTURE_WATER_NORMAL  "AREP\\Models\\Waterman\\WaterManFX.tex",
 12 texture TEXTURE_WATER_DIRTY  "AREP\\Models\\Waterman\\WaterMan2FX.tex",
 31 model   MODEL_FLARE          "AREP\\Models\\Waterman\\WaterManFX\\BodyFlare.mdl",
 35 texture TEXTURE_FLARE        "AREP\\Models\\Waterman\\WaterManFX\\BodyFlare.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "AREP\\Models\\Waterman\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "AREP\\Models\\Waterman\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "AREP\\Models\\Waterman\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "AREP\\Models\\Waterman\\Sounds\\Fire.wav",
 55 sound   SOUND_DEATH     "AREP\\Models\\Waterman\\Sounds\\Death.wav",
 56 sound   SOUND_ALIVE     "AREP\\Models\\Waterman\\Sounds\\Alive.wav",
 57 sound   SOUND_KICK      "Models\\Enemies\\ElementalLava\\Sounds\\Fire.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A golem drowned %s"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataMP\\Messages\\Enemies\\AREP\\Waterman.txt");
    return fnm;
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_ALIVE);
    PrecacheSound(SOUND_KICK);
    PrecacheSound(SOUND_DEATH);
    PrecacheModel(MODEL_WATERMAN);
    PrecacheTexture(TEXTURE_WATER_NORMAL);
    PrecacheTexture(TEXTURE_WATER_DIRTY);
    if (m_wtrType == WTR_SMALL) {
      PrecacheClass(CLASS_PROJECTILE, PRT_ICEMAN_FIRE);
    } else if (m_wtrType == WTR_BIG) {
      PrecacheClass(CLASS_PROJECTILE, PRT_ICEMAN_BIG_FIRE);
    } else {
      PrecacheClass(CLASS_PROJECTILE, PRT_ICEMAN_LARGE_FIRE);
    }
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_wtrType == WTR_SMALL) {
      return &eiWatermanSmall;
    } else if (m_wtrType == WTR_HUGE) {
      return &eiWatermanLarge;
    } else {
      return &eiWatermanBig;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    
    // waterman takes less damage from bullets:
    if(dmtType==DMT_BULLET)
    {
      fDamageAmmount*=0.333f;
    }

    // can't harm own class
    if (!IsOfClass(penInflictor, "Waterman")) {
      CEnemyDive::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // boss can't be telefragged
    if( m_wtrType==WTR_HUGE && dmtType==DMT_TELEPORT)
    {
      return;
    }

    // if not in normal state can't be harmed
    if (m_WtrCurrentState!=WTRS_NORMAL) {
      return;
    }

    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };

  void LeaveStain( BOOL bGrow)
  {
    return;
  }


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    switch (IRnd()%3) {
      case 0: iAnim = WATERMAN_ANIM_WOUND01; break;
      case 1: iAnim = WATERMAN_ANIM_WOUND02; break;
      case 2: iAnim = WATERMAN_ANIM_WOUND03; break;
      default: ASSERTALWAYS("Waterman unknown damage");
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(WATERMAN_ANIM_DEATH03 , 0);
    return WATERMAN_ANIM_DEATH03;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(WATERMAN_COLLISION_BOX_BOX);
    en_fDensity = 400.0f;
  };

  // virtual anim functions
  void StandingAnim(void) 
  {
      switch (m_WtrCurrentState) {
        case WTRS_NORMAL: StartModelAnim(WATERMAN_ANIM_STAND, AOF_LOOPING|AOF_NORESTART); break;
        case WTRS_BOX: StartModelAnim(WATERMAN_ANIM_STANDBOX, AOF_LOOPING|AOF_NORESTART); break;
        //case WTRS_PLANE:
        default: StartModelAnim(WATERMAN_ANIM_STANDPLANE, AOF_LOOPING|AOF_NORESTART); break;
		}
  };
  void StandingAnimFight(void)
  {
    StartModelAnim(WATERMAN_ANIM_STANDPLANE, AOF_LOOPING|AOF_NORESTART);
  }

  void WalkingAnim(void) 
  {
    StartModelAnim(WATERMAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
    StartModelAnim(WATERMAN_ANIM_STANDPLANE, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    RunningAnim();
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


  BOOL CountAsKill(void)
  {
    return m_bCountAsKill;
  }

  // spawn new elemental
  void SpawnNewElemental(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())/m_fSpawnDamage), INDEX(0), INDEX(10));
    // disable too much spawning
    if (m_bSpawnOnBlowUp && (m_wtrType==WTR_HUGE || m_wtrType==WTR_BIG) && (GetHealth()<=0.0f) )
    {
      ctShouldSpawn+=4;
    }

    ASSERT(m_ctSpawned<=ctShouldSpawn);
    if(m_ctSpawned>=ctShouldSpawn)
    {
      return;
    }

    CPlacement3D pl;
    // spawn placement
    if (m_wtrType==WTR_HUGE) {
      pl = CPlacement3D(WATERMAN_SPAWN_LARGE, ANGLE3D(-90.0f+FRnd()*180.0f, 30+FRnd()*30, 0));
    } else {
      pl = CPlacement3D(WATERMAN_SPAWN_BIG, ANGLE3D(-90.0f+FRnd()*180.0f, 40+FRnd()*20, 0));
    }
    pl.RelativeToAbsolute(GetPlacement());

    // create entity
    CEntityPointer pen = GetWorld()->CreateEntity(pl, GetClass());
    // elemental size
    if (m_wtrType==WTR_HUGE) {
      ((CWaterman&)*pen).m_wtrType = WTR_BIG;
    } else {
      ((CWaterman&)*pen).m_wtrType = WTR_SMALL;
    }
    // start properties
    ((CWaterman&)*pen).m_WtrStartState = WTRS_BOX;
    ((CWaterman&)*pen).m_wtrEnv = m_wtrEnv;
    ((CWaterman&)*pen).m_bFloat = m_bFloat;
    ((CWaterman&)*pen).m_colColor = m_colColor;
    ((CWaterman&)*pen).m_penEnemy = m_penEnemy;
    ((CWaterman&)*pen).m_ttTarget = m_ttTarget;
    ((CWaterman&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());
    // set moving
    if (m_wtrType==WTR_HUGE) {
      ((CWaterman&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -40.0f), this);
    } else {
      ((CWaterman&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -20.0f), this);
    }
    ((CWaterman&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));

    // spawn particle debris explosion
    CEntity *penSpray = CreateEntity( pl, CLASS_BLOOD_SPRAY);
    penSpray->SetParent( pen);
    ESpawnSpray eSpawnSpray;
    eSpawnSpray.fDamagePower = 4.0f;
    eSpawnSpray.fSizeMultiplier = 0.5f;
    eSpawnSpray.sptType = SPT_PLASMA;
    eSpawnSpray.vDirection = FLOAT3D(0,-0.5f,0);
    eSpawnSpray.colBurnColor=C_WHITE|CT_OPAQUE;
    eSpawnSpray.penOwner = pen;
    penSpray->Initialize( eSpawnSpray);
    m_ctSpawned++;
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    if (m_wtrType==WTR_HUGE)
    {
      m_soBackground.Set3DParameters(100.0f, 0.0f, 3.0f, 1.0f);
      m_soSound.Set3DParameters(200.0f, 0.0f, 1.0f, 1.0f);
    }
    else if (m_wtrType==WTR_BIG)
    {
      m_soBackground.Set3DParameters(40.0f, 10.0f, 2.0f, 1.0f);
      m_soSound.Set3DParameters(100.0f, 0.0f, 1.0f, 1.0f);
    }
    else 
    {
      m_soBackground.Set3DParameters(15.0f, 5.0f, 1.0f, 1.0f);
      m_soSound.Set3DParameters(50.0f, 0.0f, 1.0f, 1.0f);
    }
  };

procedures:
/************************************************************
 *                    CLASS INTERNAL                        *
 ************************************************************/
  FallOnFloor(EVoid) {
    // drop to floor
    SetPhysicsFlags(EPF_MODEL_WALKING);
    // wait at most 10 seconds
    wait (10.0f) {
      on (ETimer) : { stop; }
      on (EBegin) : { resume; }
      // if a brush is touched
      on (ETouch et) : {
        if (et.penOther->GetRenderType()&RT_BRUSH) {
          // stop waiting
          StopMoving();
          stop;
        }
        resume;
      }
      otherwise() : { resume; }
    }
    StartModelAnim(WATERMAN_ANIM_MORPHPLANEDOWN, 0);
    return EReturn();
  };

/************************************************************
 *                 CHANGE STATE PROCEDURES                  *
 ************************************************************/
   // box to normal
  BoxToNormal(EVoid) {
    m_WtrCurrentState = WTRS_NORMAL;
    SetPhysicsFlags(EPF_MODEL_WALKING);
    ChangeCollisionBoxIndexWhenPossible(WATERMAN_COLLISION_BOX_NORMAL);
    PlaySound(m_soBackground, SOUND_IDLE, SOF_3D);
    StartModelAnim(WATERMAN_ANIM_MORPHBOXUP, 0);
    AddAttachment(WATERMAN_ATTACHMENT_BODY_FLARE, MODEL_FLARE, TEXTURE_FLARE);
    GetModelObject()->StretchModel(GetModelObject()->mo_Stretch);
    autowait(GetModelObject()->GetAnimLength(WATERMAN_ANIM_MORPHBOXUP));
    return EReturn();
  };

  // plane to normal
  PlaneToNormal(EVoid) {
    m_WtrCurrentState = WTRS_NORMAL;
    SwitchToModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    ChangeCollisionBoxIndexWhenPossible(WATERMAN_COLLISION_BOX_NORMAL);
    PlaySound(m_soBackground, SOUND_IDLE, SOF_3D);
    INDEX iAnim;
    iAnim = WATERMAN_ANIM_MORPHPLANEUP;
    StartModelAnim(iAnim, 0);
    AddAttachment(WATERMAN_ATTACHMENT_BODY_FLARE, MODEL_FLARE, TEXTURE_FLARE);
    GetModelObject()->StretchModel(GetModelObject()->mo_Stretch);
    autowait(GetModelObject()->GetAnimLength(iAnim));
    return EReturn();
  };
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  InitializeAttack(EVoid) : CEnemyBase::InitializeAttack {
    // change state from box to normal
    if (m_WtrCurrentState==WTRS_BOX)
    {
      autocall BoxToNormal() EReturn;
    }
    // change state from plane to normal
    else if (m_WtrCurrentState==WTRS_PLANE)
    {
      autocall PlaneToNormal() EReturn;
    }
    jump CEnemyBase::InitializeAttack();
  };

  Fire(EVoid) : CEnemyBase::Fire
  {
    m_bSpawnEnabled = TRUE;
    // wait to finish walk and smooth change to idle
    StartModelAnim(WATERMAN_ANIM_MORPHPLANEUP , AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

    if( m_wtrType == WTR_SMALL)
    {
      StartModelAnim(WATERMAN_ANIM_ATTACK06 , AOF_SMOOTHCHANGE);
      autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      autowait(1.0f);

      ShootProjectile(PRT_ICEMAN_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-20, 0, 0));
      ShootProjectile(PRT_ICEMAN_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-10, 0, 0));
      ShootProjectile(PRT_ICEMAN_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(  0, 0, 0));
      ShootProjectile(PRT_ICEMAN_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D( 10, 0, 0));
      ShootProjectile(PRT_ICEMAN_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D( 20, 0, 0));
      autowait(0.3f);
    }
    
    if(m_wtrType == WTR_BIG)
    {
      StartModelAnim(WATERMAN_ANIM_ATTACK06 , AOF_SMOOTHCHANGE);
      autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      autowait(1.0f);

      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(180, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-160, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-140, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-120, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-100, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-80, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-60, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-40, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(-20, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D( 0, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(20, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(40, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(60, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(80, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(100, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(120, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(140, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 1.5f, 0.0f),
        ANGLE3D(160, 0, 0));
      autowait(0.3f);
    }

    if(m_wtrType == WTR_HUGE)
    {
      StartModelAnim(WATERMAN_ANIM_ATTACK06 , AOF_SMOOTHCHANGE);
      autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      autowait(0.6f);

      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-20, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-18, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-16, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-14, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-12, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-10, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-8, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-6, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-4, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-2, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(0, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(2, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(4, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(6, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(8, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(10, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(12, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(14, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(16, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(18, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(20, 0, 0));     
      autowait(0.6f);
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-20, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-18, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-16, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-14, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-12, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-10, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-8, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-6, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-4, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(-2, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(0, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(2, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(4, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(6, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(8, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(10, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(12, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(14, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(16, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(18, 0, 0));
      ShootProjectile(PRT_ICEMAN_LARGE_FIRE, FLOAT3D( 0.0f, 20.0f, 0.0f),
        ANGLE3D(20, 0, 0));    
      autowait(0.3f);
    }

    MaybeSwitchToAnotherPlayer();

    autowait(FRnd()/2 + _pTimer->TickQuantum); 

    if( m_penEnemy != NULL)
    {
      FLOAT fEnemyDistance = CalcDist(m_penEnemy);
      if( fEnemyDistance>m_fCloseDistance*1.25f)
      {
        StartModelAnim(WATERMAN_ANIM_MORPHPLANEDOWN , AOF_SMOOTHCHANGE);
        autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
        autowait(GetModelObject()->GetAnimLength(WATERMAN_ANIM_MORPHPLANEDOWN) - _pTimer->TickQuantum); 
      }
    }
    

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    // wait to finish walk and smooth change to idle
    StartModelAnim(WATERMAN_ANIM_MORPHPLANEUP , AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn; 
    StartModelAnim(WATERMAN_ANIM_ATTACK02, 0);
    autowait(0.45f);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_wtrType == WTR_BIG) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 60.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_wtrType == WTR_HUGE) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 100.0f, FLOAT3D(0, 0, 0), vDirection);
      } else  {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
      }
    }

    /*
    StartModelAnim(BEAST_ANIM_IDLE, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    */
    autowait(0.45f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death
  {
    if (m_bSpawnOnBlowUp && (m_wtrType==WTR_HUGE || m_wtrType==WTR_BIG)) {
      SpawnNewElemental();
      SpawnNewElemental();
      SpawnNewElemental();
      SpawnNewElemental();
    }
    autocall CEnemyBase::Death() EEnd;
    GetModelObject()->mo_toBump.SetData( NULL);
    return EEnd();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {
    // if spawned by other entity
    if (m_bSpawned) {
      m_bSpawned = FALSE;
      m_bCountAsKill = FALSE;
      // wait till touching the ground
      autocall FallOnFloor() EReturn;
    }
    PlaySound(m_soBackground, SOUND_ALIVE, SOF_3D|SOF_LOOP);
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
    m_EedtType = EDT_GROUND_DIVE;

    if (m_bFloat) {
       en_fDensity = 300.0f;
    } else {
       en_fDensity = 900.0f;
	   }
    m_bBoss = m_bWtrBoss;
    // set your appearance
    SetModel(MODEL_WATERMAN);
    AddAttachment(WATERMAN_ATTACHMENT_BODY_FLARE, MODEL_FLARE, TEXTURE_FLARE);
    GetModelObject()->StretchModel(GetModelObject()->mo_Stretch);
    if (m_wtrEnv == WTR_DIRTY) {
        SetModelMainTexture(TEXTURE_WATER_DIRTY);
      } else {
        SetModelMainTexture(TEXTURE_WATER_NORMAL);
      }
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*2 + 5.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd() + 10.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 0.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_fStopDistance = 4.0f;
    m_fCloseDistance = 4.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
    // fly moving properties
    m_fDiveWalkSpeed = FRnd()*2 + 5.0f;
    m_aDiveWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fDiveCloseRunSpeed = FRnd() + 10.0f;;
    m_aDiveCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // attack properties
    m_fDiveAttackDistance = 500.0f;
    m_fDiveCloseDistance = 4.0f;
    m_fDiveStopDistance = 4.0f;
    m_fDiveAttackFireTime = 5.0f;
    m_fDiveCloseFireTime = 2.0f;
    m_fDiveIgnoreRange = 750.0f;

    // damage/explode properties
    if (m_wtrType == WTR_SMALL)
    {
      m_fAttackRunSpeed = 20.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(50.0f);
      m_fBlowUpAmount = 9999999999.0f;
      m_fDamageWounded = 9999999.0f;
      m_fBodyParts = 4;
      m_iScore = 600;//500
    // fly moving properties
    m_fDiveAttackRunSpeed = 20.0f;
    m_aDiveAttackRotateSpeed = AngleDeg(600.0f);
    // attack properties
    m_fDiveCloseDistance = 4.0f;
    m_fDiveStopDistance = 4.0f;
    m_fDiveAttackFireTime = 5.0f;
    m_fDiveIgnoreRange = 750.0f;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(WTR_SMALL_STRETCH, WTR_SMALL_STRETCH, WTR_SMALL_STRETCH));
     ModelChangeNotify();
    if (m_wtrEnv == WTR_DIRTY) {
         m_sptType = SPT_GOO;
      } else {
         m_sptType = SPT_AIRSPOUTS;
	  }
      m_fAttackFireTime = 5.0f;
    }
    else if (m_wtrType == WTR_BIG)
    {
      m_fAttackRunSpeed = 20.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(500.0f);//500
      m_fBlowUpAmount = 9999999999.0f;//500
      m_fBodyParts = 6;
      m_fDamageWounded = 9999999.0f;
      m_iScore = 6000; //1000
      m_fStopDistance = 8.0;
      m_fCloseDistance = 8.0;
    // fly moving properties
    m_fDiveAttackRunSpeed = 20.0f;
    m_aDiveAttackRotateSpeed = AngleDeg(600.0f);
    // attack properties
    m_fDiveCloseDistance = 8.0f;
    m_fDiveStopDistance = 8.0f;
    m_fDiveIgnoreRange = 750.0f;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(WTR_BIG_STRETCH, WTR_BIG_STRETCH, WTR_BIG_STRETCH));
      ModelChangeNotify();
    if (m_wtrEnv == WTR_DIRTY) {
         m_sptType = SPT_GOO;
      } else {
         m_sptType = SPT_AIRSPOUTS;
	  }
      m_fAttackFireTime = 5.0f;
    }
    else // HUGE
    {
      m_fAttackRunSpeed = 20.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(5000.0f);//500
      m_fBlowUpAmount = 9999999999.0f;//500
      m_fBodyParts = 6;
      m_fDamageWounded = 9999999.0f;
      m_iScore = 60000; //1000
      m_fStopDistance = 27;
      m_fCloseDistance = 27.0;
      m_fAttackDistance = 1000.0f;
      m_fIgnoreRange = 1200.0f;
    // fly moving properties
    m_fDiveAttackRunSpeed = 20.0f;
    m_aDiveAttackRotateSpeed = AngleDeg(600.0f);
    // attack properties
    m_fDiveCloseDistance = 25.0f;
    m_fDiveStopDistance = 25.0f;
    m_fDiveIgnoreRange = 1200.0f;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(WTR_LARGE_STRETCH, WTR_LARGE_STRETCH, WTR_LARGE_STRETCH));
      ModelChangeNotify();
    if (m_wtrEnv == WTR_DIRTY) {
         m_sptType = SPT_GOO;
      } else {
         m_sptType = SPT_AIRSPOUTS;
	  }
      m_fAttackFireTime = 5.0f;
    }
    
    m_fMaxHealth = GetHealth();

    // state and flare attachments
    m_WtrCurrentState = m_WtrStartState;
    RemoveAttachment(WATERMAN_ATTACHMENT_BODY_FLARE);
    switch (m_WtrCurrentState) {
      case WTRS_NORMAL:
        SetPhysicsFlags(EPF_MODEL_WALKING);
        AddAttachment(WATERMAN_ATTACHMENT_BODY_FLARE, MODEL_FLARE, TEXTURE_FLARE);
        GetModelObject()->StretchModel(GetModelObject()->mo_Stretch);
        break;
      case WTRS_BOX:
        SetPhysicsFlags(WATERMAN_COLLISION_BOX_BOX);
        break;
      case WTRS_PLANE:
        SetPhysicsFlags(EPF_MODEL_IMMATERIAL|EPF_MOVABLE);
        break;
    }
    StandingAnim();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

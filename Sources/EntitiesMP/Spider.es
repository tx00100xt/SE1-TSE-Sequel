336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS3/SpiderSmall/SpiderSmall.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum SpiderType {
  0 SP_SMALL          "Small",      // normal (fighter)
  1 SP_BIG            "Big",        // big
  2 SP_HUGE           "Huge",       // huge
};

enum SpiderState {
  0 SPS_NORMAL        "Normal",
  1 SPS_EGG           "Egg",
  2 SPS_GROUND        "Underground",
};

%{ 
#define SMALL_STRETCH 0.4f
#define BIG_STRETCH 1.0f
#define HUGE_STRETCH 3.0f

#define ELECPOS FLOAT3D(0.0f, 1.75f, 0.0f)*m_fSize;
#define HATCHLING_SPAWN   (FLOAT3D(0.0f, 3.0f, 0.0f)*HUGE_STRETCH)

#define SPIDERSOUND(soundname) ((m_spType==SP_SMALL)? (SOUND_SMALL_##soundname) : (m_spType==SP_BIG)? (SOUND_BIG_##soundname) : (SOUND_HUGE_##soundname))

// info structure
static EntityInfo eiSpiderHuge = {
  EIBT_FLESH, 10000.0f,
  0.0f, 2.0f*HUGE_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*HUGE_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiSpiderSmall = {
  EIBT_FLESH, 1500.0f,
  0.0f, 2.0f*SMALL_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*SMALL_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiSpiderBig = {
  EIBT_FLESH, 5000.0f,
  0.0f, 2.0f*BIG_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*BIG_STRETCH, 0.0f,     // target (body)
};
%}

class CSpider : CEnemyBase {
name      "Spider";
thumbnail "Thumbnails\\Spider.tbn";

properties:
  1 enum SpiderType m_spType     "Character" 'C' = SP_SMALL,
  2 INDEX m_iCounter = 0,
  3 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  4 FLOAT m_fSize = 1.0f,

  5 BOOL m_bAttackingByElectricity = FALSE,
  6 FLOAT m_tmElectricityTimeStart = 0.0f,
  7 FLOAT3D m_vElectricitySource = FLOAT3D( 0,0,0),
  8 FLOAT3D m_vElectricityTarget = FLOAT3D( 0,0,0),
  
  9 enum SpiderState m_spStartState   "State" 'S' = SPS_NORMAL,
 10 enum SpiderState m_spCurrentState = SPS_NORMAL,

 11 BOOL m_bSpawned = FALSE,
 12 INDEX m_ctSpawned = 0,
 13 BOOL m_bSpawnEnabled = FALSE,
 14 INDEX m_bCountAsKill = TRUE,

 15 CSoundObject m_soFeet,            // for running sound
 16 BOOL m_bRunSoundPlaying = FALSE,
 17 INDEX   m_fgibTexture = TEXTURE_SPIDER_SMALL,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_SPIDER           "ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmall.mdl",
 11 texture TEXTURE_SPIDER_SMALL   "ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmall.tex",
 12 texture TEXTURE_SPIDER_BIG     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmallRedBlue.tex",
 13 texture TEXTURE_SPIDER_HUGE    "ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmallGreenBlue.tex",

 14 model   MODEL_ELECTRICITY           "ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.mdl",
 15 texture TEXTURE_ELECTRICITY   "ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.tex",

 16 model   MODEL_LEG             "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Debris\\Leg.mdl",
 17 model   MODEL_TAIL1             "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Debris\\Tail.mdl",
 18 model   MODEL_TAIL2             "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Debris\\Tail2.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_SMALL_IDLE      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Small\\Idle.wav",
 51 sound   SOUND_SMALL_SIGHT     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Small\\Hatch.wav",
 52 sound   SOUND_SMALL_WOUND     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Small\\Wound.wav",
 53 sound   SOUND_SMALL_FIRE      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Small\\Fire.wav",
 54 sound   SOUND_SMALL_KICK      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Small\\Melee.wav",
 55 sound   SOUND_SMALL_DEATH     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Small\\Death.wav",
 56 sound   SOUND_SMALL_FOOTSTEPS "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Small\\Footsteps.wav",
 
 60 sound   SOUND_BIG_IDLE      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Medium\\Idle.wav",
 61 sound   SOUND_BIG_SIGHT     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Medium\\Hatch.wav",
 62 sound   SOUND_BIG_WOUND     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Medium\\Wound.wav",
 63 sound   SOUND_BIG_FIRE      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Medium\\Fire.wav",
 64 sound   SOUND_BIG_KICK      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Medium\\Melee.wav",
 65 sound   SOUND_BIG_DEATH     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Medium\\Death.wav",
 66 sound   SOUND_BIG_FOOTSTEPS "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Medium\\Footsteps.wav",
 
 70 sound   SOUND_HUGE_IDLE      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Big\\Idle.wav",
 71 sound   SOUND_HUGE_SIGHT     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Big\\Hatch.wav",
 72 sound   SOUND_HUGE_WOUND     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Big\\Wound.wav",
 73 sound   SOUND_HUGE_FIRE      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Big\\Fire.wav",
 74 sound   SOUND_HUGE_KICK      "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Big\\Melee.wav",
 75 sound   SOUND_HUGE_DEATH     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Big\\Death.wav",
 76 sound   SOUND_HUGE_FOOTSTEPS "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Big\\Footsteps.wav",
 
 81 sound   SOUND_DIGOUT     "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\DigOut.wav",
 82 sound   SOUND_EGGSPLODE  "ModelsMP\\Enemies\\SS3\\SpiderSmall\\Sounds\\Eggsplode.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Spider exterminated %s"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSmall, "DataMP\\Messages\\Enemies\\SS3\\SpiderSmall.txt");
    static DECLARE_CTFILENAME(fnmBig, "DataMP\\Messages\\Enemies\\SS3\\SpiderMedium.txt");
    static DECLARE_CTFILENAME(fnmHuge, "DataMP\\Messages\\Enemies\\SS3\\SpiderBig.txt");
    switch(m_spType) {
    default: ASSERT(FALSE);
    case SP_SMALL: return fnmSmall;
    case SP_BIG: return fnmBig;
    case SP_HUGE: return fnmHuge;
    }
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_SMALL_IDLE );
    PrecacheSound(SOUND_SMALL_SIGHT);
    PrecacheSound(SOUND_SMALL_WOUND);
    PrecacheSound(SOUND_SMALL_FIRE );
    PrecacheSound(SOUND_SMALL_KICK);
    PrecacheSound(SOUND_SMALL_DEATH);
    PrecacheSound(SOUND_SMALL_FOOTSTEPS);
	
    PrecacheSound(SOUND_BIG_IDLE );
    PrecacheSound(SOUND_BIG_SIGHT);
    PrecacheSound(SOUND_BIG_WOUND);
    PrecacheSound(SOUND_BIG_FIRE );
    PrecacheSound(SOUND_BIG_KICK);
    PrecacheSound(SOUND_BIG_DEATH);
    PrecacheSound(SOUND_BIG_FOOTSTEPS);
	
    PrecacheSound(SOUND_HUGE_IDLE );
    PrecacheSound(SOUND_HUGE_SIGHT);
    PrecacheSound(SOUND_HUGE_WOUND);
    PrecacheSound(SOUND_HUGE_FIRE );
    PrecacheSound(SOUND_HUGE_KICK);
    PrecacheSound(SOUND_HUGE_DEATH);
    PrecacheSound(SOUND_HUGE_FOOTSTEPS);

    PrecacheSound(SOUND_DIGOUT);
    PrecacheSound(SOUND_EGGSPLODE);

    PrecacheModel(MODEL_SPIDER);
    PrecacheTexture(TEXTURE_SPIDER_SMALL);
    PrecacheTexture(TEXTURE_SPIDER_BIG);
    PrecacheTexture(TEXTURE_SPIDER_HUGE);

    PrecacheModel(MODEL_LEG);
    PrecacheModel(MODEL_TAIL1);
    PrecacheModel(MODEL_TAIL2);

    PrecacheClass(CLASS_BASIC_EFFECT, BET_GIZMO_SPLASH_FX);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_spType == SP_SMALL) {
      return &eiSpiderSmall;
    } else if (m_spType == SP_HUGE) {
      return &eiSpiderHuge;
    } else {
      return &eiSpiderBig;
    }
  };

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

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // if not in normal state can't be harmed
    if (m_spCurrentState!=SPS_NORMAL) {
      return;
    }

    // can't harm own class
    if (!IsOfClass(penInflictor, "Spider")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
      // if died of chainsaw
      if (dmtType==DMT_CHAINSAW && GetHealth()<=0) {
        // must always blowup
        m_fBlowUpAmount = 0;
      }
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    m_bAttackingByElectricity = FALSE;
    INDEX iAnim;
    iAnim = SPIDERSMALL_ANIM_WOUND;
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    iAnim = SPIDERSMALL_ANIM_DEATH;
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==SPIDERSMALL_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(SPIDERSMALL_COLLISION_BOX_DEATH);
    m_bAttackingByElectricity = FALSE;
    en_fDensity = 500.0f;
  };

  void RenderParticles(void)
  {
    FLOATmatrix3D m;
    CPlacement3D plLarva;

    if( m_bAttackingByElectricity)
    {
      plLarva = GetLerpedPlacement();
      MakeRotationMatrix(m, plLarva.pl_OrientationAngle);   
      // render one lightning toward enemy
      FLOAT3D m_vElectricitySource = plLarva.pl_PositionVector + ELECPOS;
      Particles_Ghostbuster(m_vElectricitySource, m_vElectricityTarget, 32, 1.0f);
    }
    CEnemyBase::RenderParticles();
  }

  // virtual anim functions
  void StandingAnim(void)
  {
      switch (m_spCurrentState) {
        case SPS_NORMAL: StartModelAnim(SPIDERSMALL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART); break;
        case SPS_EGG: StartModelAnim(SPIDERSMALL_ANIM_HATCH_02_POSE, AOF_LOOPING|AOF_NORESTART); break;
        //case SPS_GROUND:
        default: StartModelAnim(SPIDERSMALL_ANIM_UNDERGROUND, AOF_LOOPING|AOF_NORESTART); break;
		}
    DeactivateRunningSound();
  };

  BOOL CountAsKill(void)
  {
    return m_bCountAsKill;
  }

  void WalkingAnim(void) {
    StartModelAnim(SPIDERSMALL_ANIM_WALK_DISCONTINIOUS, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };

  void RunningAnim(void) {
    WalkingAnim();
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    WalkingAnim();
    ActivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SPIDERSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SPIDERSOUND(SIGHT), SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SPIDERSOUND(WOUND), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SPIDERSOUND(DEATH), SOF_3D);
  };


  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soFeet, SPIDERSOUND(FOOTSTEPS), SOF_3D|SOF_LOOP);
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
    m_soSound.Set3DParameters(100.0f, 40.0f, 2.0f, 1.0f);
    m_soFeet.Set3DParameters(60.0f, 5.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;
  };

  // spawn hatchling 
  void SpawnHatchling(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())), INDEX(0), INDEX(10));
    // disable too much spawning
    if (GetHealth()<=0.0f)
    {
      ctShouldSpawn+=1;
    }

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(HATCHLING_SPAWN, ANGLE3D(0.0f+FRnd(), 20+FRnd()*10, 0));
    pl.RelativeToAbsolute(GetPlacement());

    // create entity
    CEntityPointer pen = GetWorld()->CreateEntity(pl, GetClass());
    ((CSpider&)*pen).m_spType = SP_SMALL;
    // start properties
    ((CSpider&)*pen).m_spStartState = SPS_EGG;
    ((CSpider&)*pen).m_colColor = m_colColor;
    ((CSpider&)*pen).m_penEnemy = m_penEnemy;
    ((CSpider&)*pen).m_ttTarget = m_ttTarget;
    ((CSpider&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());
    // set moving
    ((CSpider&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -45.0f), this);
    ((CSpider&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));

    m_ctSpawned++;
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

    vNormalizedDamage *= 2.0f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

    // spawn debris
      ULONG ulFleshModel   = MODEL_LEG;
	  
    Debris_Begin(EIBT_FLESH, DPT_GOOTRAIL, BET_GOOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
    Debris_Spawn(this, this, MODEL_TAIL1, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_TAIL2, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

    Debris_Begin(EIBT_FLESH, DPT_GOOTRAIL, BET_GOOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_GIZMO_SPLASH_FX;
      penSplat->Initialize(ese);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
	}

procedures:
/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/

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
    return EReturn();
  }
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
    StartModelAnim(SPIDERSMALL_ANIM_HATCH_02, 0);
    return EReturn();
  };

/************************************************************
 *                 CHANGE STATE PROCEDURES                  *
 ************************************************************/
   // box to normal
  EggToNormal(EVoid) {
    m_spCurrentState = SPS_NORMAL;
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    ChangeCollisionBoxIndexWhenPossible(SPIDERSMALL_COLLISION_BOX_PART_NAME);
    PlaySound(m_soSound, SPIDERSOUND(SIGHT), SOF_3D);
    StartModelAnim(SPIDERSMALL_ANIM_HATCH_02, 0);
    autowait(GetModelObject()->GetAnimLength(SPIDERSMALL_ANIM_HATCH_02));
    return EReturn();
  };

  // plane to normal
  GroundToNormal(EVoid) {
    m_spCurrentState = SPS_NORMAL;
    SwitchToModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    ChangeCollisionBoxIndexWhenPossible(SPIDERSMALL_COLLISION_BOX_PART_NAME);
    PlaySound(m_soSound, SOUND_DIGOUT, SOF_3D);
    StartModelAnim(SPIDERSMALL_ANIM_DIGOUT, 0);
    autowait(GetModelObject()->GetAnimLength(SPIDERSMALL_ANIM_DIGOUT));
    return EReturn();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  InitializeAttack(EVoid) : CEnemyBase::InitializeAttack {
    // change state from box to normal
    if (m_spCurrentState==SPS_EGG)
    {
      autocall EggToNormal() EReturn;
    }
    // change state from plane to normal
    else if (m_spCurrentState==SPS_GROUND)
    {
      autocall GroundToNormal() EReturn;
    }
    jump CEnemyBase::InitializeAttack();
  };

  Fire(EVoid) : CEnemyBase::Fire
  {
    DeactivateRunningSound();

    if( m_spType == SP_SMALL)
    {
      StartModelAnim(SPIDERSMALL_ANIM_FIRE_MOUTH, 0);  
      PlaySound(m_soSound, SPIDERSOUND(FIRE), SOF_3D);

      autowait(0.6f);

    if (IsVisible(m_penEnemy)) {
      m_vElectricityTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    } else if (TRUE) {
      m_vElectricityTarget = m_vPlayerSpotted;
    }

      autowait(0.2f);
      {
      m_bAttackingByElectricity = TRUE;
      m_tmElectricityTimeStart = _pTimer->CurrentTick(); 

      // cast ray
	     m_vElectricitySource=GetPlacement().pl_PositionVector;
         CCastRay crRay( this, m_vElectricitySource, m_vElectricityTarget);
         crRay.cr_bHitTranslucentPortals = FALSE;
         crRay.cr_bPhysical = FALSE;
         crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
         GetWorld()->CastRay(crRay);
      // if entity is hit
         if( crRay.cr_penHit != NULL)
         {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
        // damage enemy
           InflictDirectDamage(m_penEnemy, this, DMT_BURNING, 5.0f, FLOAT3D(0, 0, 0), vDirection);
        // push target away
           FLOAT3D vSpeed;
           GetHeadingDirection(0.0f, vSpeed);
           vSpeed = vSpeed * 10.0f;
           KickEntity(m_penEnemy, vSpeed);
         }
    }
      autowait(0.3f);

    m_bAttackingByElectricity = FALSE;
    }

    if( m_spType == SP_BIG)
    {
      StartModelAnim(SPIDERSMALL_ANIM_FIRE_MOUTH, 0);  
      PlaySound(m_soSound, SPIDERSOUND(FIRE), SOF_3D);

      autowait(0.6f);

    if (IsVisible(m_penEnemy)) {
      m_vElectricityTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    } else if (TRUE) {
      m_vElectricityTarget = m_vPlayerSpotted;
    }

      autowait(0.2f);
      {
      m_bAttackingByElectricity = TRUE;
      m_tmElectricityTimeStart = _pTimer->CurrentTick(); 

      // cast ray
	     m_vElectricitySource=GetPlacement().pl_PositionVector;
         CCastRay crRay( this, m_vElectricitySource, m_vElectricityTarget);
         crRay.cr_bHitTranslucentPortals = FALSE;
         crRay.cr_bPhysical = FALSE;
         crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
         GetWorld()->CastRay(crRay);
      // if entity is hit
         if( crRay.cr_penHit != NULL)
         {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
        // damage enemy
           InflictDirectDamage(m_penEnemy, this, DMT_BURNING, 25.0f, FLOAT3D(0, 0, 0), vDirection);
        // push target away
           FLOAT3D vSpeed;
           GetHeadingDirection(0.0f, vSpeed);
           vSpeed = vSpeed * 40.0f;
           KickEntity(m_penEnemy, vSpeed);
         }
    }
      autowait(0.3f);

    m_bAttackingByElectricity = FALSE;
    }

    if( m_spType == SP_HUGE)
    {
      m_bSpawnEnabled = TRUE;
      StartModelAnim(SPIDERSMALL_ANIM_FIRE_MOUTH, 0);  
      PlaySound(m_soSound, SPIDERSOUND(FIRE), SOF_3D);

      autowait(0.8f);

      SpawnHatchling();

      autowait(0.3f);
	}

    MaybeSwitchToAnotherPlayer();

    autowait(FRnd()/2 + _pTimer->TickQuantum);

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    DeactivateRunningSound();
    StartModelAnim(SPIDERSMALL_ANIM_MELEE, 0);
    autowait(0.25f);
    PlaySound(m_soSound, SPIDERSOUND(KICK), SOF_3D);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_spType == SP_BIG) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_spType == SP_HUGE) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 80.0f, FLOAT3D(0, 0, 0), vDirection);
      } else  {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
      }
    }

    autowait(0.1f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_tmMaxHoldBreath = 10.0f;

    en_fDensity = 1100.0f;
    // set your appearance
    SetModel(MODEL_SPIDER);
    StandingAnim();

    // setup moving speed
    m_fWalkSpeed = FRnd()*2 + 5.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd() + 5.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 40.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_bBoss = m_bBeBoss;
    m_fStopDistance = 4.0f;
    m_fCloseDistance = 4.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    if (m_spType == SP_SMALL)
    {
      m_fAttackRunSpeed = 8.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(25.0f);
      SetModelMainTexture(TEXTURE_SPIDER_SMALL);
	     m_fgibTexture = TEXTURE_SPIDER_SMALL;
      m_fBlowUpAmount = 50.0f;
      m_fBodyParts = 6;
      m_fDamageWounded = 10.0f;
      m_iScore = 500;//500
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(SMALL_STRETCH, SMALL_STRETCH, SMALL_STRETCH));
      m_fSize = 1.0f,
     ModelChangeNotify();
      m_sptType = SPT_GOO;
      m_fAttackFireTime = 3.0f;
	  m_fBlowUpSize = 1.0f;
    }
    else if (m_spType == SP_BIG)
    {
      m_fAttackRunSpeed = 13.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(250.0f);
      SetModelMainTexture(TEXTURE_SPIDER_BIG);
	     m_fgibTexture = TEXTURE_SPIDER_BIG;
      m_fBlowUpAmount = 300.0f;//500
      m_fBodyParts = 6;
      m_fDamageWounded = 100.0f;//500
      m_iScore = 2000; //1000
      m_fStopDistance = 6;
      m_fCloseDistance = 6;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BIG_STRETCH, BIG_STRETCH, BIG_STRETCH));
      m_fSize = 2.0f,
      ModelChangeNotify();
      m_sptType = SPT_GOO;
      m_fAttackFireTime = 4.0f;
	  m_fBlowUpSize = 2.0f;
    }
    else // HUGE
    {
      m_fAttackRunSpeed = 20.0f;
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(1000.0f);
      SetModelMainTexture(TEXTURE_SPIDER_HUGE);
	     m_fgibTexture = TEXTURE_SPIDER_HUGE;
      m_fBlowUpAmount = 2000.0f;//500
      m_fBodyParts = 6;
      m_fDamageWounded = 400.0f;//500
      m_iScore = 10000; //1000
      m_fStopDistance = 14;
      m_fCloseDistance = 14;
      m_fAttackDistance = 500.0f;
      m_fIgnoreRange = 1200.0f;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(HUGE_STRETCH, HUGE_STRETCH, HUGE_STRETCH));
      m_fSize = 4.0f,
      ModelChangeNotify();
      m_sptType = SPT_GOO;
      m_fAttackFireTime = 3.0f;
	  m_fBlowUpSize = 3.0f;
    }
    
    m_fMaxHealth = GetHealth();
	
    AddAttachment(SPIDERSMALL_ATTACHMENT_ELECTRICITY, MODEL_ELECTRICITY, TEXTURE_ELECTRICITY);
    if (m_spType == SP_SMALL)
    {
      CModelObject *pmoFire = &GetModelObject()->GetAttachmentModel(SPIDERSMALL_ATTACHMENT_ELECTRICITY)->amo_moModelObject;
      pmoFire->StretchModel(FLOAT3D(0.5, 0.5, 0.5));
	  }
    if (m_spType == SP_BIG)
    {
      CModelObject *pmoFire = &GetModelObject()->GetAttachmentModel(SPIDERSMALL_ATTACHMENT_ELECTRICITY)->amo_moModelObject;
      pmoFire->StretchModel(FLOAT3D(2.0, 2.0, 2.0));
	  }
    if (m_spType == SP_HUGE)
    {
      CModelObject *pmoFire = &GetModelObject()->GetAttachmentModel(SPIDERSMALL_ATTACHMENT_ELECTRICITY)->amo_moModelObject;
      pmoFire->StretchModel(FLOAT3D(8.0, 8.0, 8.0));
	  }

    // state
    m_spCurrentState = m_spStartState;
    switch (m_spCurrentState) {
      case SPS_NORMAL:
        SetPhysicsFlags(EPF_MODEL_WALKING);
        break;
      case SPS_EGG:
        SetPhysicsFlags(SPIDERSMALL_COLLISION_BOX_PART_NAME);
        break;
      case SPS_GROUND:
        SetPhysicsFlags(EPF_MODEL_IMMATERIAL|EPF_MOVABLE);
        break;
    }
    StandingAnim();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

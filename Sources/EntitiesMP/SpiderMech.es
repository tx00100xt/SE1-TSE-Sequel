343
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/MechaSpider/Legs.h"
#include "ModelsMP/Enemies/SS2/MechaSpider/Body.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum SpmType {
  0 SPM_SOLDIER    "Soldier",
  1 SPM_MUM        "Mommy",
};

enum SpmState {
  0 SPM_NORMAL        "Normal",
  1 SPM_EGG           "Egg",
};

%{
#define STRETCH_SOLDIER   1.0f
#define STRETCH_MUM       8.0f
  
// info structure
static EntityInfo eiSpmSoldier = {
  EIBT_FLESH, 500.0f,
  0.0f, 1.9f*STRETCH_SOLDIER, 0.0f,     // source (eyes)
  0.0f, 1.3f*STRETCH_SOLDIER, 0.0f,     // target (body)
};

static EntityInfo eiSpmMum = {
  EIBT_FLESH, 5000.0f,
  0.0f, 1.9f*STRETCH_MUM, 0.0f,     // source (eyes)
  0.0f, 1.3f*STRETCH_MUM, 0.0f,     // target (body)
};

#define FIREPOS_SOLDIER      FLOAT3D(0.0f, 1.36f, -0.78f)*STRETCH_SOLDIER
#define FIREPOS_MUM          FLOAT3D(0.0f, 1.45f, -0.62f)*STRETCH_MUM
#define SPAWNPOS             FLOAT3D(0.0f, 2.5f, -1.0f)*STRETCH_MUM

#define SOUND(soundname) ((m_spmType==SPM_SOLDIER)? (SOUND_SOLDIER_##soundname) : (SOUND_MUM_##soundname))
%}


class CSpiderMech: CEnemyBase {
name      "SpiderMech";
thumbnail "Thumbnails\\SpiderMech.tbn";

properties:
  1 enum SpmType m_spmType "Type" 'Y' = SPM_SOLDIER,
  3 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  4 BOOL m_bWalkSoundPlaying = FALSE,

  10 CSoundObject m_soFire1,
  11 CSoundObject m_soFire2,
  12 CSoundObject m_soFeet,
  13 CSoundObject m_soBackground,
  
 15 enum SpmState m_spmStartState   "State" 'S' = SPM_NORMAL,
 16 enum SpmState m_spmCurrentState = SPM_NORMAL,

 20 BOOL m_bSpawned = FALSE,
 21 INDEX m_ctSpawned = 0,
 22 BOOL m_bSpawnEnabled = FALSE,
 23 INDEX m_bCountAsKill = TRUE,
    
components:
  1 class   CLASS_BASE            "Classes\\EnemyBase.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_PROJECTILE      "Classes\\Projectile.ecl",

 10 model   MODEL_LEGS           "ModelsMP\\Enemies\\SS2\\MechaSpider\\Legs.mdl",
 11 model   MODEL_BODY           "ModelsMP\\Enemies\\SS2\\MechaSpider\\Body.mdl",
 12 model   MODEL_DEBRIS           "ModelsMP\\Enemies\\SS2\\MechaSpider\\Debris\\Leg.mdl",
 
 20 texture TEXTURE_LEGS_SOLDIER       "ModelsMP\\Enemies\\SS2\\MechaSpider\\legs_small.tex",
 21 texture TEXTURE_LEGS_MUM           "ModelsMP\\Enemies\\SS2\\MechaSpider\\Legs.tex",
 22 texture TEXTURE_BODY_SOLDIER       "ModelsMP\\Enemies\\SS2\\MechaSpider\\body_small.tex",
 23 texture TEXTURE_BODY_MUM           "ModelsMP\\Enemies\\SS2\\MechaSpider\\body.tex",

 24 model   MODEL_PLASMAGUN           "ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.mdl",
 25 texture TEXTURE_PLASMAGUN         "ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.tex",
 
// ************** SOUNDS **************
 50 sound   SOUND_SOLDIER_ALIVE            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Alive.wav",
 51 sound   SOUND_SOLDIER_DEATH            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Death.wav",
 52 sound   SOUND_SOLDIER_FIRE             "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Fire.wav",
 53 sound   SOUND_SOLDIER_MELEE            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Melee.wav",
 54 sound   SOUND_SOLDIER_SIGHT            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Sight.wav",
 55 sound   SOUND_SOLDIER_WALK             "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Walk.wav",
 56 sound   SOUND_SOLDIER_WOUND            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Wound.wav",

 60 sound   SOUND_MUM_ALIVE            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Mum\\Alive.wav",
 61 sound   SOUND_MUM_DEATH            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Mum\\Death.wav",
 62 sound   SOUND_MUM_FIRE             "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Mum\\Fire.wav",
 63 sound   SOUND_MUM_MELEE            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Mum\\Melee.wav",
 64 sound   SOUND_MUM_SIGHT            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Mum\\Sight.wav",
 65 sound   SOUND_MUM_WALK             "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Mum\\Walk.wav",
 66 sound   SOUND_MUM_WOUND            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Mum\\Wound.wav",

 58 sound   SOUND_ROCKET    "Sounds\\Weapons\\RocketFly.wav",

functions:
    
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Spider Mechanoid dissassembled %s"), strPlayerName);
    return str;
  }

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_spmType==SPM_SOLDIER) {
      return &eiSpmSoldier;
    } else if (m_spmType==SPM_MUM) {
      return &eiSpmMum;
    } else {
      ASSERT("Unknown grunt type!");
      return NULL;
    }
  };

  // get the attachment
  CModelObject *BodyModel(void) {
    CAttachmentModelObject &amo0 = *GetModelObject()->GetAttachmentModel(LEGS_ATTACHMENT_BODY);
    return &(amo0.amo_moModelObject);
  };

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier,     "DataMP\\Messages\\Enemies\\SS2\\SpiderMech.txt");
    static DECLARE_CTFILENAME(fnmMum,   "DataMP\\Messages\\Enemies\\SS2\\SpiderMech2.txt");
    switch(m_spmType) {
    default: ASSERT(FALSE);
    case SPM_SOLDIER:  return fnmSoldier;
    case SPM_MUM    :  return fnmMum;
    }
  };

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheModel(MODEL_LEGS);
    PrecacheModel(MODEL_BODY);
    PrecacheModel(MODEL_DEBRIS);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_SPIDER_SPLAT_FX);
    
      PrecacheClass(CLASS_PROJECTILE, PRT_SPIDERWEB_SOL);
      PrecacheTexture(TEXTURE_LEGS_SOLDIER);
      PrecacheTexture(TEXTURE_BODY_SOLDIER);
    
      PrecacheClass(CLASS_PROJECTILE, PRT_SPIDERWEB_MUM);
      PrecacheTexture(TEXTURE_LEGS_MUM);
      PrecacheTexture(TEXTURE_BODY_MUM);
  	  PrecacheModel(MODEL_PLASMAGUN);
	  PrecacheTexture(TEXTURE_PLASMAGUN);
	  PrecacheSound(SOUND_ROCKET);
    

    PrecacheSound(SOUND_SOLDIER_ALIVE);
    PrecacheSound(SOUND_SOLDIER_DEATH);
    PrecacheSound(SOUND_SOLDIER_FIRE);
    PrecacheSound(SOUND_SOLDIER_MELEE);
    PrecacheSound(SOUND_SOLDIER_SIGHT);
    PrecacheSound(SOUND_SOLDIER_WALK);
    PrecacheSound(SOUND_SOLDIER_WOUND);

    PrecacheSound(SOUND_MUM_ALIVE);
    PrecacheSound(SOUND_MUM_DEATH);
    PrecacheSound(SOUND_MUM_FIRE);
    PrecacheSound(SOUND_MUM_MELEE);
    PrecacheSound(SOUND_MUM_SIGHT);
    PrecacheSound(SOUND_MUM_WALK);
    PrecacheSound(SOUND_MUM_WOUND);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // if not in normal state can't be harmed
    if (m_spmCurrentState!=SPM_NORMAL) {
      return;
    }

    // cannonballs inflict less damage then the default
    if (m_spmType == SPM_MUM && dmtType==DMT_CANNONBALL) {
        fDamageAmmount *= 0.3333f;
    }


    // can't harm own class
    if (!IsOfClass(penInflictor, "SpiderMech")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateWalkingSound();
    StartModelAnim(LEGS_ANIM_WOUNDHARD, 0);
    BodyModel()->PlayAnim(BODY_ANIM_WOUNDHARD, 0);

    return LEGS_ANIM_WOUNDHARD | BODY_ANIM_WOUNDHARD;
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

  // death
  INDEX AnimForDeath(void) {
    DeactivateWalkingSound();
    if(m_spmType==SPM_SOLDIER) {
      StartModelAnim(LEGS_ANIM_DEATH_SMALL, 0);
      BodyModel()->PlayAnim(BODY_ANIM_DEATH_SMALL, 0);

      return LEGS_ANIM_DEATH_SMALL | BODY_ANIM_DEATH_SMALL;
    } else {
      StartModelAnim(LEGS_ANIM_DEATH_BIG, 0);
      BodyModel()->PlayAnim(BODY_ANIM_DEATH_BIG, 0);

      return LEGS_ANIM_DEATH_BIG | BODY_ANIM_DEATH_BIG;
    }
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==LEGS_ANIM_DEATH_SMALL)
    {
      vStretch=FLOAT3D(1,1,2);
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(LEGS_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  BOOL CountAsKill(void)
  {
    return m_bCountAsKill;
  }

  // virtual anim functions
  void StandingAnim(void) {
    DeactivateWalkingSound();
    if(m_spmType==SPM_SOLDIER) {
      switch (m_spmCurrentState) {
        case SPM_NORMAL: StartModelAnim(LEGS_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
                         BodyModel()->PlayAnim(BODY_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART); break;
        case SPM_EGG: StartModelAnim(LEGS_ANIM_SPAWNPOSE, AOF_LOOPING|AOF_NORESTART);
                         BodyModel()->PlayAnim(BODY_ANIM_SPAWNPOSE, AOF_LOOPING|AOF_NORESTART); break;
						 }
	} else {
      switch (m_spmCurrentState) {
        case SPM_NORMAL: StartModelAnim(LEGS_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
                         BodyModel()->PlayAnim(BODY_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART); break;
        case SPM_EGG: StartModelAnim(LEGS_ANIM_SPAWNPOSE, AOF_LOOPING|AOF_NORESTART);
                         BodyModel()->PlayAnim(BODY_ANIM_SPAWNPOSE, AOF_LOOPING|AOF_NORESTART); break;
						 }
	}
  };
  void RunningAnim(void) {
    ActivateWalkingSound();
    if(m_spmType==SPM_SOLDIER) {
      StartModelAnim(LEGS_ANIM_WALK , AOF_LOOPING|AOF_NORESTART);
      BodyModel()->PlayAnim(BODY_ANIM_WALK , AOF_LOOPING|AOF_NORESTART);
	} else {
      StartModelAnim(LEGS_ANIM_WALK_MUM, AOF_LOOPING|AOF_NORESTART);
      BodyModel()->PlayAnim(BODY_ANIM_WALK_MUM, AOF_LOOPING|AOF_NORESTART);
	}
  };
    void WalkingAnim(void) {
    ActivateWalkingSound();
    RunningAnim();
  };
  void RotatingAnim(void) {
    ActivateWalkingSound();
    RunningAnim();
  };

  // virtual sound functions
  void SightSound(void) {
    PlaySound(m_soSound, SOUND(SIGHT), SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND(WOUND), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND(DEATH), SOF_3D);
  };

  // walking sounds
  void ActivateWalkingSound(void)
  {
    if (!m_bWalkSoundPlaying) {
      PlaySound(m_soFeet, SOUND(WALK), SOF_3D|SOF_LOOP);
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
    if(m_spmType==SPM_SOLDIER) {
      m_soSound.Set3DParameters(80.0f, 5.0f, 2.0f, 1.0f);
      m_soFire1.Set3DParameters(100.0f, 5.0f, 1.0f, 1.0f);
      m_soFire2.Set3DParameters(100.0f, 5.0f, 1.0f, 1.0f);
      m_soFeet.Set3DParameters(100.0f, 1.0f, 0.5f, 1.0f);
      m_soBackground.Set3DParameters(80.0f, 1.0f, 0.25f, 1.0f);
	} else {
      m_soSound.Set3DParameters(200.0f, 50.0f, 2.0f, 1.0f);
      m_soFire1.Set3DParameters(250.0f, 50.0f, 1.0f, 1.0f);
      m_soFire2.Set3DParameters(250.0f, 50.0f, 1.0f, 1.0f);
      m_soFeet.Set3DParameters(250.0f, 50.0f, 1.0f, 1.0f);
      m_soBackground.Set3DParameters(250.0f, 50.0f, 0.5f, 1.0f);
	}
  };

  // spawn hatchling 
  void SpawnBaby(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())), INDEX(0), INDEX(10));
    // disable too much spawning
    if (GetHealth()<=0.0f)
    {
      ctShouldSpawn+=1;
    }

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(SPAWNPOS, ANGLE3D(-45.0f+FRnd()*45.0f, 30+FRnd()*20, 0));
    pl.RelativeToAbsolute(GetPlacement());

    // create entity
    CEntityPointer pen = GetWorld()->CreateEntity(pl, GetClass());
    ((CSpiderMech&)*pen).m_spmType = SPM_SOLDIER;
    // start properties
    ((CSpiderMech&)*pen).m_spmStartState = SPM_EGG;
    ((CSpiderMech&)*pen).m_colColor = m_colColor;
    ((CSpiderMech&)*pen).m_penEnemy = m_penEnemy;
    ((CSpiderMech&)*pen).m_ttTarget = m_ttTarget;
    ((CSpiderMech&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());
    // set moving
    ((CSpiderMech&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -30.0f), this);
    ((CSpiderMech&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));

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
    
    // spawn explosion
    CPlacement3D plExplosion = GetPlacement();
    CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_YELLOW|CT_OPAQUE;
    eSpawnEffect.betType = BET_LIGHT_CANNON;
    FLOAT fSize = fEntitySize*0.25f;
    eSpawnEffect.vStretch = FLOAT3D(fSize,fSize,fSize);
    penExplosion->Initialize(eSpawnEffect);

    // spawn debris
      ULONG ulFleshModel   = MODEL_DEBRIS;

    Debris_Begin(EIBT_FLESH, DPT_GOOTRAIL, BET_GOOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, TEXTURE_LEGS_SOLDIER, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_SPIDER_SPLAT_FX;
      penSplat->Initialize(ese);

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
	};

procedures:
/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    m_soBackground.Stop();
    if (m_spmType == SPM_SOLDIER) {
      jump CEnemyBase::Death();
    }
    
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
    autowait(1.3f);
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

    autowait(GetModelObject()->GetAnimLength(LEGS_ANIM_DEATH_BIG)-2.3f);
    return EEnd();
  };
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  InitializeAttack(EVoid) : CEnemyBase::InitializeAttack {
    // change state from box to normal
    if (m_spmCurrentState==SPM_EGG)
    {
      autocall EggToNormal() EReturn;
    }
    jump CEnemyBase::InitializeAttack();
  };

  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateWalkingSound();
    // soldier
    if (m_spmType == SPM_SOLDIER) {
	//1 shot
      StartModelAnim(LEGS_ANIM_FIRE, AOF_NORESTART);   
      BodyModel()->PlayAnim(BODY_ANIM_FIRE, AOF_NORESTART);  
      PlaySound(m_soSound, SOUND_SOLDIER_FIRE, SOF_3D);

      autowait(0.5f);

      ShootProjectile(PRT_SPIDERWEB_SOL, FLOAT3D( 0.0f, 1.5f*STRETCH_SOLDIER, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);

      MaybeSwitchToAnotherPlayer();
      autowait(FRnd()/2 + _pTimer->TickQuantum);   
      return EReturn();
    }
    if (m_spmType == SPM_MUM) {
      INDEX iRnd = IRnd()%2;
      switch(iRnd)
      {
      case 0:
        jump SpawnAttack();
        break;
      case 1:
        jump Mumfire();
        break;
        }

	}
  };

  SpawnAttack(EVoid){

      m_bSpawnEnabled = TRUE;
      StartModelAnim(LEGS_ANIM_THREAT, 0);  
      BodyModel()->PlayAnim(BODY_ANIM_THREAT, AOF_NORESTART);  
      PlaySound(m_soSound, SOUND(MELEE), SOF_3D);

      autowait(0.4f);

      SpawnBaby();
      autowait(0.1f);
      SpawnBaby();
      autowait(0.1f);
      SpawnBaby();

      autowait(0.3f);

      MaybeSwitchToAnotherPlayer();
      autowait(FRnd()/2 + _pTimer->TickQuantum);   
      return EReturn();
	  }

  Mumfire(EVoid){
	//1 shot
      StartModelAnim(LEGS_ANIM_FIRE, 0);   
      BodyModel()->PlayAnim(BODY_ANIM_FIRE, 0);  
      PlaySound(m_soSound, SOUND_MUM_FIRE, SOF_3D);

      autowait(0.5f);

    // calculate predicted position
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT3D vSpeedDst = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    m_vDesiredPosition = CalculatePredictedPosition(GetPlacement().pl_PositionVector, vTarget, 60,
      vSpeedDst, GetPlacement().pl_PositionVector(2) );
    // shoot predicted propelled projectile
    ShootPredictedProjectile(PRT_SPIDERWEB_MUM, m_vDesiredPosition, FIREPOS_MUM, ANGLE3D(0, 0, 0));

      autowait(0.6f);
	//2 shot
      StartModelAnim(LEGS_ANIM_FIRE, 0);   
      BodyModel()->PlayAnim(BODY_ANIM_FIRE, 0);  
      PlaySound(m_soSound, SOUND_MUM_FIRE, SOF_3D);

      autowait(0.5f);

    // calculate predicted position
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT3D vSpeedDst = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    m_vDesiredPosition = CalculatePredictedPosition(GetPlacement().pl_PositionVector, vTarget, 60,
      vSpeedDst, GetPlacement().pl_PositionVector(2) );
    // shoot predicted propelled projectile
    ShootPredictedProjectile(PRT_SPIDERWEB_MUM, m_vDesiredPosition, FIREPOS_MUM, ANGLE3D(0, 0, 0));

      autowait(0.6f);
	//3 shot
      StartModelAnim(LEGS_ANIM_FIRE, 0);   
      BodyModel()->PlayAnim(BODY_ANIM_FIRE, 0);  
      PlaySound(m_soSound, SOUND_MUM_FIRE, SOF_3D);

      autowait(0.5f);

    // calculate predicted position
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT3D vSpeedDst = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    m_vDesiredPosition = CalculatePredictedPosition(GetPlacement().pl_PositionVector, vTarget, 60,
      vSpeedDst, GetPlacement().pl_PositionVector(2) );
    // shoot predicted propelled projectile
    ShootPredictedProjectile(PRT_SPIDERWEB_MUM, m_vDesiredPosition, FIREPOS_MUM, ANGLE3D(0, 0, 0));

      autowait(0.3f);

      MaybeSwitchToAnotherPlayer();
      autowait(FRnd()/2 + _pTimer->TickQuantum);   
      return EReturn();
    }

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    DeactivateWalkingSound();
    StartModelAnim(LEGS_ANIM_MELEE, 0);
    BodyModel()->PlayAnim(BODY_ANIM_MELEE, AOF_NORESTART); 
    PlaySound(m_soSound, SOUND(MELEE), SOF_3D);
    autowait(0.6f);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_spmType == SPM_SOLDIER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 15.0f;
            KickEntity(m_penEnemy, vSpeed);
      } else {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 100.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 60.0f;
            KickEntity(m_penEnemy, vSpeed);
      }
    }

    autowait(0.5f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {

      PlaySound(m_soBackground, SOUND(ALIVE), SOF_3D|SOF_LOOP);

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
    StartModelAnim(LEGS_ANIM_SPAWN, 0);
    BodyModel()->PlayAnim(BODY_ANIM_SPAWN, 0);  
    return EReturn();
  };

/************************************************************
 *                 CHANGE STATE PROCEDURES                  *
 ************************************************************/
   // box to normal
  EggToNormal(EVoid) {
    m_spmCurrentState = SPM_NORMAL;
    SetPhysicsFlags(EPF_MODEL_WALKING);
    ChangeCollisionBoxIndexWhenPossible(LEGS_COLLISION_BOX_PART_NAME);
    PlaySound(m_soSound, SOUND(SIGHT), SOF_3D);
    StartModelAnim(LEGS_ANIM_SPAWN, 0);
    BodyModel()->PlayAnim(BODY_ANIM_SPAWN, 0);  
    autowait(GetModelObject()->GetAnimLength(LEGS_ANIM_SPAWN));
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
    en_tmMaxHoldBreath = 5.0f;
    m_sptType = SPT_GOO;
    m_bBoss = m_bBeBoss;

    // set your appearance
    SetModel(MODEL_LEGS);
    switch (m_spmType) {
      case SPM_SOLDIER:
        en_fDensity = 2000.0f;
        // set your texture
        SetModelMainTexture(TEXTURE_LEGS_SOLDIER);
        AddAttachment(LEGS_ATTACHMENT_BODY, MODEL_BODY, TEXTURE_BODY_SOLDIER);
        // setup moving speed
        m_fWalkSpeed = FRnd() + 7.0f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 10.0f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 10.5f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 100.0f;
        m_fCloseDistance = 5.0f;
        m_fStopDistance = 5.0f;
        m_fAttackFireTime = 2.0f;
        m_fCloseFireTime = 1.0f;
        m_fIgnoreRange = 500.0f;
        m_fBlowUpAmount = 120.0f;
        m_fBodyParts = 8;
        m_fDamageWounded = 30.0f;
        m_iScore = 1000;
        SetHealth(100.0f);
        m_fMaxHealth = 100.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_SOLDIER, STRETCH_SOLDIER, STRETCH_SOLDIER));
        break;
  
      case SPM_MUM:
        // set your texture
        SetModelMainTexture(TEXTURE_LEGS_MUM);
        AddAttachment(LEGS_ATTACHMENT_BODY, MODEL_BODY, TEXTURE_BODY_MUM);
        // setup moving speed
        m_fWalkSpeed = FRnd() + 5.0f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 9.0f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 9.0f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 1000.0f;
        m_fCloseDistance = 32.0f;
        m_fStopDistance = 32.0f;
        m_fAttackFireTime = 6.0f;
        m_fCloseFireTime = 2.0f;
        m_fBlowUpAmount = 999999999999.0f;
        m_fIgnoreRange = 2000.0f;
        // damage/explode properties
        m_fBodyParts = 8;
        m_fDamageWounded = 750.0f;
        m_iScore = 30000;
        SetHealth(2500.0f);
        m_fMaxHealth = 2500.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_MUM, STRETCH_MUM, STRETCH_MUM));
        break;
    }

    // state
    m_spmCurrentState = m_spmStartState;
    switch (m_spmCurrentState) {
      case SPM_NORMAL:
        SetPhysicsFlags(EPF_MODEL_WALKING);
        break;
      case SPM_EGG:
        SetPhysicsFlags(LEGS_COLLISION_BOX_PART_NAME);
        break;
    }

    ModelChangeNotify();
    StandingAnim();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/ScorpSoldier/ScorpNoGun.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum ScorpType {
  0 SS_SMALL          "Small",      // normal (fighter)
  1 SS_MEDIUM         "Medium",        // big
  2 SS_BIG            "Big",       // huge
};

enum ScorpSkin {
  0 SS_NEW          "New",
  1 SS_OG           "Original",
};

%{  
#define SMALL_STRETCH 0.6f
#define MEDIUM_STRETCH 1.0f
#define BIG_STRETCH 2.0f

#define SHOOT_ANGLE (20.0f)
#define SHOOT_LAUNCH (FLOAT3D(1.5f, 3.5f, -1.0f))

#define SCORPSOUND(soundname) ((m_ssType==SS_SMALL)? (SOUND_SMALL_##soundname) : (m_ssType==SS_MEDIUM)? (SOUND_MEDIUM_##soundname) : (SOUND_BIG_##soundname))

// info structure
static EntityInfo eiScorpBig = {
  EIBT_FLESH, 10000.0f,
  0.0f, 2.0f*BIG_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*BIG_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiScorpSmall = {
  EIBT_FLESH, 1500.0f,
  0.0f, 2.0f*SMALL_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*SMALL_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiScorpMedium = {
  EIBT_FLESH, 5000.0f,
  0.0f, 2.0f*MEDIUM_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*MEDIUM_STRETCH, 0.0f,     // target (body)
};
%}

class CScorpSoldier : CEnemyBase {
name      "ScorpSoldier";
thumbnail "Thumbnails\\ScorpSoldier.tbn";

properties:
  1 enum ScorpType m_ssType     "Character" 'C' = SS_SMALL,
  2 enum ScorpSkin m_ssSkin     "Type"      'Y' = SS_NEW,
  3 INDEX m_iCounter = 0,
  4 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  5 INDEX   m_fgibTexture = TEXTURE_SMALL,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_SCORP           "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpNoGun.mdl",
 11 texture TEXTURE_SMALL         "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpGreen.tex",
 12 texture TEXTURE_MEDIUM        "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpYellow.tex",
 13 texture TEXTURE_BIG           "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpPurple.tex",

 14 texture TEXTURE_SMALL_OG       "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpYellow.tex",
 15 texture TEXTURE_BIG_OG         "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpRed.tex",

 16 model     MODEL_GUN           "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpGun.mdl",
 17 texture   TEXTURE_GUN           "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Gun.tex",

// ************** BODY PARTS **************
 18 model   MODEL_DEBRIS_BODY           "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Debris\\Bod.mdl",
 19 model   MODEL_DEBRIS_GUN           "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Debris\\Gun.mdl",
 20 model   MODEL_DEBRIS_LEG           "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Debris\\Leg.mdl",

 21 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 22 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 54 sound   SOUND_KICK      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Melee.wav",

 50 sound   SOUND_SMALL_IDLE      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Small\\Idle.wav",
 51 sound   SOUND_SMALL_SIGHT     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Small\\Sight.wav",
 52 sound   SOUND_SMALL_WOUND     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Small\\Wound.wav",
 53 sound   SOUND_SMALL_FIRE      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Small\\Fire.wav",
 55 sound   SOUND_SMALL_DEATH     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Small\\Death.wav",

 56 sound   SOUND_MEDIUM_IDLE      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Medium\\Idle.wav",
 57 sound   SOUND_MEDIUM_SIGHT     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Medium\\Sight.wav",
 58 sound   SOUND_MEDIUM_WOUND     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Medium\\Wound.wav",
 59 sound   SOUND_MEDIUM_FIRE      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Medium\\Fire.wav",
 60 sound   SOUND_MEDIUM_DEATH     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Medium\\Death.wav",

 61 sound   SOUND_BIG_IDLE      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Big\\Idle.wav",
 62 sound   SOUND_BIG_SIGHT     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Big\\Sight.wav",
 63 sound   SOUND_BIG_WOUND     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Big\\Wound.wav",
 64 sound   SOUND_BIG_FIRE      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Big\\Fire.wav",
 65 sound   SOUND_BIG_DEATH     "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Big\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Mogwai set %s up for reincarnation"), (const char *) strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSmall, "DataMP\\Messages\\Enemies\\SS2\\ScorpSmall.txt");
    static DECLARE_CTFILENAME(fnmMedium, "DataMP\\Messages\\Enemies\\SS2\\ScorpMedium.txt");
    static DECLARE_CTFILENAME(fnmBig, "DataMP\\Messages\\Enemies\\SS2\\ScorpBig.txt");
    switch(m_ssType) {
    default: ASSERT(FALSE);
    case SS_SMALL: return fnmSmall;
    case SS_MEDIUM: return fnmMedium;
    case SS_BIG: return fnmBig;
    }
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_KICK);
    PrecacheModel(MODEL_SCORP);
    PrecacheTexture(TEXTURE_SMALL);
    PrecacheTexture(TEXTURE_MEDIUM);
    PrecacheTexture(TEXTURE_BIG);
    PrecacheTexture(TEXTURE_SMALL_OG);
    PrecacheTexture(TEXTURE_BIG_OG);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
    PrecacheModel(MODEL_DEBRIS_BODY);
    PrecacheModel(MODEL_DEBRIS_GUN);
    PrecacheModel(MODEL_DEBRIS_LEG);

      if (m_ssType == SS_SMALL) {
       PrecacheSound(SOUND_SMALL_IDLE);
       PrecacheSound(SOUND_SMALL_SIGHT);
       PrecacheSound(SOUND_SMALL_WOUND);
       PrecacheSound(SOUND_SMALL_FIRE);
       PrecacheSound(SOUND_SMALL_DEATH);
       PrecacheClass(CLASS_PROJECTILE, PRT_SCORP_PROJECTILE);
    } if (m_ssType == SS_MEDIUM) {
       PrecacheSound(SOUND_MEDIUM_IDLE);
       PrecacheSound(SOUND_MEDIUM_SIGHT);
       PrecacheSound(SOUND_MEDIUM_WOUND);
       PrecacheSound(SOUND_MEDIUM_FIRE);
       PrecacheSound(SOUND_MEDIUM_DEATH);
      PrecacheClass(CLASS_PROJECTILE, PRT_SCORP_PROJECTILE);
    } if (m_ssType == SS_BIG) {
       PrecacheSound(SOUND_BIG_IDLE);
       PrecacheSound(SOUND_BIG_SIGHT);
       PrecacheSound(SOUND_BIG_WOUND);
       PrecacheSound(SOUND_BIG_FIRE);
       PrecacheSound(SOUND_BIG_DEATH);
      PrecacheClass(CLASS_PROJECTILE, PRT_SCORP_BIG_PROJECTILE);
    }
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_ssType == SS_SMALL) {
      return &eiScorpSmall;
    }  if (m_ssType == SS_MEDIUM) {
      return &eiScorpMedium;
    } if (m_ssType == SS_BIG) {
      return &eiScorpBig;
    }
  };

  FLOAT GetCrushHealth(void)
  {
    if (m_ssType == SS_BIG) {
      return 100.0f;
    }
    return 0.0f;
  }

  BOOL ForcesCannonballToExplode(void)
  {
    if (m_ssType==SS_BIG) {
      return TRUE;
    }
    return CEnemyBase::ForcesCannonballToExplode();
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // can't harm own class
    if (!IsOfClass(penInflictor, "ScorpSoldier")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    iAnim = SCORPNOGUN_ANIM_SCORPSOLDIER_WOUND;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    iAnim = SCORPNOGUN_ANIM_DEATH;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==SCORPNOGUN_ANIM_DEATH )
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(SCORPNOGUN_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
      StartModelAnim(SCORPNOGUN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
      StartModelAnim(SCORPNOGUN_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SCORPSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SCORPSOUND(SIGHT), SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SCORPSOUND(WOUND), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SCORPSOUND(DEATH), SOF_3D);
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

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_DEBRIS_BODY, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_GUN, TEXTURE_GUN, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLESH_SPLAT_FX;
      penSplat->Initialize(ese);

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
    if( m_ssType == SS_SMALL)
    {
	//1 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_SMALL_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*SMALL_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);

	//2 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_SMALL_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*SMALL_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);

	//3 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_SMALL_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*SMALL_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);
    }
    
    if(m_ssType == SS_MEDIUM)
    {
	//1 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_MEDIUM_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*MEDIUM_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);

	//2 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_MEDIUM_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*MEDIUM_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);

	//3 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_MEDIUM_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*MEDIUM_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);

	//4 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_MEDIUM_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*MEDIUM_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);

	//5 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_MEDIUM_FIRE, SOF_3D);

      ShootProjectile(PRT_SCORP_PROJECTILE, FLOAT3D( 0.5f, 1.5f*MEDIUM_STRETCH, -1.0f),ANGLE3D(0.0f, 0.0f, 0.0f));

      autowait(0.3f);
    }

    if(m_ssType == SS_BIG)
    {
	//1 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_BIG_FIRE, SOF_3D);

    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, SHOOT_LAUNCH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      SHOOT_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(0, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_SCORP_BIG_PROJECTILE;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

      autowait(0.5f);

	//2 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_BIG_FIRE, SOF_3D);

    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, SHOOT_LAUNCH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      SHOOT_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(0, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_SCORP_BIG_PROJECTILE;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

      autowait(0.5f);

	//3 shot
      StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_FIRE, 0);   
      PlaySound(m_soSound, SOUND_BIG_FIRE, SOF_3D);

    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, SHOOT_LAUNCH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      SHOOT_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(0, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_SCORP_BIG_PROJECTILE;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

      autowait(0.5f);
    }

    MaybeSwitchToAnotherPlayer();
    autowait(FRnd()/2 + _pTimer->TickQuantum);   
    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    StartModelAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_MELEE, 0);
    autowait(0.4f);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_ssType == SS_SMALL) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 15.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 20.0f;
            KickEntity(m_penEnemy, vSpeed);
      } if (m_ssType == SS_MEDIUM) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 30.0f;
            KickEntity(m_penEnemy, vSpeed);
      } if (m_ssType == SS_BIG)  {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 50.0f, FLOAT3D(0, 0, 0), vDirection);
          // push target
            FLOAT3D vSpeed;
            GetHeadingDirection(AngleDeg(0.0f), vSpeed);
            vSpeed = vSpeed * 50.0f;
            KickEntity(m_penEnemy, vSpeed);
      }
    }

    autowait(0.5f);
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
    en_tmMaxHoldBreath = 25.0f;

    en_fDensity = 1100.0f;
    // set your appearance
    SetModel(MODEL_SCORP);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*2 + 5.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd() + 10.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_bBoss = m_bBeBoss;
    m_fStopDistance = 3.0f;
    m_fCloseDistance = 3.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
    m_bBoss = m_bBeBoss;

    // damage/explode properties
    if (m_ssType == SS_SMALL)
    {
      m_fAttackRunSpeed = 6.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(70.0f);
      if (m_ssSkin == SS_OG) {
        SetModelMainTexture(TEXTURE_SMALL_OG);
	     m_fgibTexture = TEXTURE_SMALL_OG;
      } else {
        SetModelMainTexture(TEXTURE_SMALL);
	     m_fgibTexture = TEXTURE_SMALL;
      }
      m_fBlowUpAmount = 140.0f;
      m_fBodyParts = 6;
      m_fDamageWounded = 30.0f;
      m_iScore = 800;//500
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(SMALL_STRETCH, SMALL_STRETCH, SMALL_STRETCH));
     ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 3.0f;
	  m_fBlowUpSize = 1.0f;
    }
     if (m_ssType == SS_MEDIUM)
    {
      m_fAttackRunSpeed = 8.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(140.0f);//500
      SetModelMainTexture(TEXTURE_MEDIUM);
	  m_fgibTexture = TEXTURE_MEDIUM;
      m_fBlowUpAmount = 280.0f;//500
      m_fBodyParts = 12;
      m_fDamageWounded = 50.0f;//500
      m_iScore = 1000; //1000
      m_fStopDistance = 5;
      m_fCloseDistance = 5;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(MEDIUM_STRETCH, MEDIUM_STRETCH, MEDIUM_STRETCH));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 4.0f;
	  m_fBlowUpSize = 1.5f;
    }
     if (m_ssType == SS_BIG)
    {
      m_fAttackRunSpeed = 10.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(600.0f);//500
      if (m_ssSkin == SS_OG) {
        SetModelMainTexture(TEXTURE_BIG_OG);
	     m_fgibTexture = TEXTURE_BIG_OG;
      } else {
        SetModelMainTexture(TEXTURE_BIG);
	     m_fgibTexture = TEXTURE_BIG;
      }
      m_fBlowUpAmount = 750.0f;//500
      m_fBodyParts = 6;
	  m_fBlowUpSize = 4.0f;
      m_fDamageWounded = 200.0f;//500
      m_iScore = 5000; //1000
      m_fStopDistance = 10;
      m_fCloseDistance = 10;
      m_fAttackDistance = 150.0f;
      m_fIgnoreRange = 1200.0f;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BIG_STRETCH, BIG_STRETCH, BIG_STRETCH));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 5.0f;
    }
    
    AddAttachment(SCORPNOGUN_ATTACHMENT_SCORPNOGUN, MODEL_GUN, TEXTURE_GUN);

    // set stretch factors for height and width - MUST BE DONE BEFORE SETTING MODEL!
    switch (m_ssType) {
      case SS_SMALL: GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f)*SMALL_STRETCH); break;
      case SS_MEDIUM: GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f)*MEDIUM_STRETCH); break;
      case SS_BIG: GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f)*BIG_STRETCH); break;
    }
    
    m_fMaxHealth = GetHealth();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

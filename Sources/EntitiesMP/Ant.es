336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/Ant/Ant.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum AntType {
  0 ANT_NORMAL          "Normal",      // normal (fighter)
  1 ANT_SHIELD          "Phalanx",        // big
  2 ANT_BOMBER          "Bomber",       // huge
};

enum AntSkin {
  0 SS_NEW          "New",
  1 SS_OG           "Original",
};

%{  
#define SHOOT_ANGLE (20.0f)
#define SHOOT_LAUNCH (FLOAT3D(0.5f, 1.5f, 0.0f))

// info structure
static EntityInfo eiAnt = {
  EIBT_BONES, 200.0f,
  0.0f, 2.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
%}

class CAnt : CEnemyBase {
name      "Ant";
thumbnail "Thumbnails\\Ant.tbn";

properties:
  1 enum AntType m_antType     "Type"         'Y' = ANT_NORMAL,
  2 enum AntSkin m_antSkin      "Texture"      'X' = SS_NEW,
  3 INDEX m_iCounter = 0,
  5 INDEX   m_fgibTexture = TEXTURE_NEW,
  4 CSoundObject m_soFeet,
  7 BOOL m_bRunSoundPlaying = FALSE,
  6 BOOL m_bShielded = FALSE,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_ANT           "ModelsF\\NextEncounter\\Enemies\\Ant\\Ant.mdl",
 11 texture TEXTURE_OG          "ModelsF\\NextEncounter\\Enemies\\Ant\\Ant.tex",
 12 texture TEXTURE_NEW         "ModelsF\\NextEncounter\\Enemies\\Ant\\AntDarkBlue.tex",
 13 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",

// ************** BODY PARTS **************
 18 model   MODEL_ARM           "ModelsF\\NextEncounter\\Enemies\\Ant\\Debris\\Arm.mdl",
 19 model   MODEL_HEAD          "ModelsF\\NextEncounter\\Enemies\\Ant\\Debris\\Head.mdl",
 20 model   MODEL_LEG           "ModelsF\\NextEncounter\\Enemies\\Ant\\Debris\\Leg.mdl",

 21 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 22 texture TEXTURE_FLESH_YELLOW  "ModelsF\\Effects\\Debris\\Flesh\\FleshYellow.tex",

// ************** SOUNDS **************

 50 sound   SOUND_IDLE      "ModelsF\\NextEncounter\\Enemies\\Ant\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\NextEncounter\\Enemies\\Ant\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\NextEncounter\\Enemies\\Ant\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsF\\NextEncounter\\Enemies\\Ant\\Sounds\\Fire.wav",
 54 sound   SOUND_DEATH     "ModelsF\\NextEncounter\\Enemies\\Ant\\Sounds\\Death.wav",
 55 sound   SOUND_WALK      "ModelsF\\NextEncounter\\Enemies\\Ant\\Sounds\\Walk.wav",
 56 sound   SOUND_RECHARGE  "ModelsF\\NextEncounter\\Enemies\\Ant\\Sounds\\Recharge.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Mogwai set %s up for reincarnation"), strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\NE\\Ant.txt");
    return fnm;
  };

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheModel(MODEL_ANT);
    PrecacheTexture(TEXTURE_OG);
    PrecacheTexture(TEXTURE_NEW);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_YELLOW);
    PrecacheModel(MODEL_ARM);
    PrecacheModel(MODEL_HEAD);
    PrecacheModel(MODEL_LEG);
	
    PrecacheSound(SOUND_IDLE);
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_WALK);
    PrecacheSound(SOUND_RECHARGE);

    PrecacheClass(CLASS_PROJECTILE, PRT_HEADMAN_BOMBERMAN);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_GIZMO_SPLASH_FX);
    
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiAnt;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // shield absorbs damage
    if (m_bShielded == TRUE) {
     FLOAT3D vFront;
     GetHeadingDirection(0, vFront);
     FLOAT fDamageDir = m_vDamage%vFront;
	 if (fDamageDir<0) {
        if(dmtType==DMT_BULLET)
        {
         return;
	    }
      }
	}
    // can't harm own class
    if (!IsOfClass(penInflictor, "Ant")) {
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
    INDEX iAnim;
    if (m_bShielded == TRUE) {
      iAnim = ANT_ANIM_BLOCKWOUND;
	} else {
      iAnim = ANT_ANIM_WOUND;
	}
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    DeactivateRunningSound();
    INDEX iAnim;
    switch (IRnd()%2) {
      case 0: iAnim = ANT_ANIM_DEATH1; break;
      case 1: iAnim = ANT_ANIM_DEATH2; break;
      default: ASSERTALWAYS("Ant unknown death");
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==ANT_ANIM_DEATH1)
    {
      vStretch=FLOAT3D(1,1,2)*0.3f;
      return 0.2f;
    }
    else if(GetModelObject()->GetAnim()==ANT_ANIM_DEATH2)
    {
      vStretch=FLOAT3D(1,1,2)*0.3f;
      return 0.2f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(ANT_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bShielded == TRUE) {
      StartModelAnim(ANT_ANIM_BLOCKLOOP, AOF_LOOPING|AOF_NORESTART);
	} else {
      StartModelAnim(ANT_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
	}
    DeactivateRunningSound();
  };

  void WalkingAnim(void) {
      StartModelAnim(ANT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };

  void RunningAnim(void) {
      StartModelAnim(ANT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    if (m_bShielded == TRUE) {
      StartModelAnim(ANT_ANIM_BLOCKLOOP, AOF_LOOPING|AOF_NORESTART);
      DeactivateRunningSound();
	} else {
      StartModelAnim(ANT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
      ActivateRunningSound();
	}
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


      ULONG ulFleshTexture = TEXTURE_FLESH_YELLOW;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_BONES, DPT_GOOTRAIL, BET_GOOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_ARM, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARM, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
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
      ese.betType = BET_GIZMO_SPLASH_FX;
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
    DeactivateRunningSound();
    if(m_antType == ANT_NORMAL) {
	//1 shot
      StartModelAnim(ANT_ANIM_ATTACK, 0);   
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

      autowait(0.5f);

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
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

      autowait(0.5f);
    } if(m_antType == ANT_SHIELD) {

    StartModelAnim(ANT_ANIM_BLOCKOUT, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn; 
 	m_bShielded = FALSE;  
	 
	//1 shot
      StartModelAnim(ANT_ANIM_ATTACK, 0);   
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

      autowait(0.5f);

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
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

      autowait(0.5f);

     StartModelAnim(ANT_ANIM_BLOCKIN, AOF_SMOOTHCHANGE);
     autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
     autowait(GetModelObject()->GetAnimLength(ANT_ANIM_BLOCKIN)/2.0f - _pTimer->TickQuantum);
 	 m_bShielded = TRUE;
   } if(m_antType == ANT_BOMBER) {
      StartModelAnim(ANT_ANIM_RECHARGE, 0);   
      PlaySound(m_soSound, SOUND_RECHARGE, SOF_3D);

      autowait(0.3f);

	//1
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
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.05f);

	//2
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
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(45, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.05f);

	//3
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
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(90, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.05f);

	//4
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
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(135, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.05f);

	//5
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
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(180, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.05f);

	//6
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
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(-135, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.05f);

	//7
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
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(-90, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.05f);

	//8
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
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(-45, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_HEADMAN_BOMBERMAN;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.5f);

	}

    MaybeSwitchToAnotherPlayer();
    autowait(FRnd()/2 + _pTimer->TickQuantum);   
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

    en_fDensity = 1000.0f;
    // set your appearance
    SetModel(MODEL_ANT);
      if (m_antSkin == SS_OG) {
        SetModelMainTexture(TEXTURE_OG);
	     m_fgibTexture = TEXTURE_OG;
      } else {
        SetModelMainTexture(TEXTURE_NEW);
	     m_fgibTexture = TEXTURE_NEW;
      }
    SetModelSpecularTexture(TEXTURE_SPECULAR);
    GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));

    SetHealth(50.0f);
    m_fBlowUpAmount = 100.0f;
    m_fBodyParts = 4;
    m_fDamageWounded = 20.0f;
    m_iScore = 800;//500
    // set stretch factor;
    m_sptType = SPT_GOO;
	m_fBlowUpSize = 2.0f;

    // damage/explode properties
    if (m_antType == ANT_NORMAL)
    {
 	  m_bShielded = FALSE;
      // setup moving speed
      m_fWalkSpeed = FRnd()*2 + 5.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
      m_fCloseRunSpeed = FRnd() + 6.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
      // setup attack distances
      m_fAttackDistance = 50.0f;
      m_fCloseFireTime = 1.0f;
      m_fIgnoreRange = 750.0f;
      m_fStopDistance = 10.0f;
      m_fCloseDistance = 0.0f;
      m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
      m_fAttackRunSpeed = 6.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      m_fAttackFireTime = 3.0f;
    }
    if (m_antType == ANT_SHIELD)
    {
 	  m_bShielded = TRUE;
      // setup moving speed
      m_fWalkSpeed = 0.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
      m_fCloseRunSpeed = 0.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
      // setup attack distances
      m_fAttackDistance = 200.0f;
      m_fCloseFireTime = 1.0f;
      m_fIgnoreRange = 750.0f;
      m_fStopDistance = 300.0f;
      m_fCloseDistance = 0.0f;
      m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
      m_fAttackRunSpeed = 0.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      m_fAttackFireTime = 6.0f;
    }
    if (m_antType == ANT_BOMBER)
    {
 	  m_bShielded = FALSE;
      // setup moving speed
      m_fWalkSpeed = FRnd()*2 + 8.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
      m_fCloseRunSpeed = FRnd() + 10.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
      // setup attack distances
      m_fAttackDistance = 25.0f;
      m_fCloseFireTime = 1.0f;
      m_fIgnoreRange = 750.0f;
      m_fStopDistance = 5.0f;
      m_fCloseDistance = 0.0f;
      m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
      m_fAttackRunSpeed = 11.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      m_fAttackFireTime = 2.0f;
    }
    
    m_fMaxHealth = GetHealth();
    m_soFeet.Set3DParameters(60.0f, 3.0f, 0.5f, 1.0f);
    m_bRunSoundPlaying = FALSE;
    ModelChangeNotify();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

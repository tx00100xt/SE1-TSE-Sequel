306
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/Scorpion/Scorpion.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Bullet";
uses "EntitiesMP/Reminder";

enum AttackType {
  0 SCO_BOTH       "Minigun and Laser",
  1 SCO_MINIGUN    "Minigun only",
  2 SCO_LASER      "Laser only",
};


%{
#define GUN_LX  3.6f
#define GUN_LY  0.6f
#define GUN_LZ -5.0f
#define GUN_RX -3.6f
#define GUN_RY  0.6f
#define GUN_RZ -5.0f
#define RANGE_MINIGUN         50.0f
#define RANGE_LASER           200.0f

// info structure
static EntityInfo eiScorpion = {
  EIBT_FLESH, 5000.0f,
  0, 5.0f, 0,           // source (eyes)
  0.0f, 5.0f, 0.0f,     // target (body)
};
#define LIGHT_ANIM_FIRE 3
#define LIGHT_ANIM_NONE 5
%}


class CScorpion : CEnemyBase {
name      "Scorpion";
thumbnail "Thumbnails\\Scorpion.tbn";

properties:
  1 enum AttackType m_attType "Type" 'Y' = SCO_BOTH,
  2 INDEX m_bFireBulletCount = 0,       // fire bullet binary divider
  3 INDEX m_iSpawnEffect = 0,           // counter for spawn effect every 'x' times
  4 FLOAT m_fFireTime = 0.0f,           // time to fire bullets
  5 CAnimObject m_aoLightAnimation,     // light animation object
  6 CSoundObject m_soFeet,            // for running sound
  7 BOOL m_bRunSoundPlaying = FALSE,
  8 CEntityPointer m_penTarget  "Ray target" 'T' COLOR(C_BLUE|0xFF),
  
{
  CEntity *penBullet;     // bullet
  CLightSource m_lsLightSource;
}

components:
  0 class   CLASS_BASE        "Classes\\EnemyBase.ecl",
  1 class   CLASS_BULLET      "Classes\\Bullet.ecl",
  2 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  5 model   MODEL_SCORPION    "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Scorpion.mdl",
  6 texture TEXTURE_SCORPION  "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Scorpion.tex",
 12 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",
 30 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

 14 model   MODEL_ARM           "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Debris\\Arm.mdl",
 15 model   MODEL_LEG           "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Debris\\Leg.mdl",
 16 model   MODEL_TAIL          "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Debris\\Tail.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\FireMinigun.wav",
 54 sound   SOUND_KICK      "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\Melee.wav",
 55 sound   SOUND_DEATH     "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\Death.wav",
 56 sound   SOUND_LASER     "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\FireLaser.wav",
 57 sound   SOUND_STEP      "ModelsF\\NextEncounter\\Enemies\\Scorpion\\Sounds\\Step.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
      str.PrintF(TRANS("An Arachnoid poured lead into %s"), (const char *) strPlayerName);
    return str;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_LASER );
    PrecacheSound(SOUND_STEP);
    PrecacheClass(CLASS_PROJECTILE, PRT_SCORPION_LASER);


	PrecacheModel(MODEL_ARM);
	PrecacheModel(MODEL_LEG);
	PrecacheModel(MODEL_TAIL);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Read from stream. */
  void Read_t( CTStream *istr) { // throw char *
    CEnemyBase::Read_t(istr);

    // setup light source
    SetupLightSource();
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\NE\\Scorpion.txt");
    return fnm;
  };

  /* Get static light source information. */
  CLightSource *GetLightSource(void) {
    if (!IsPredictor()) {
      return &m_lsLightSource;
    } else {
      return NULL;
    }
  }

  BOOL ForcesCannonballToExplode(void)
  {
      return TRUE;
  }

  // Setup light source
  void SetupLightSource(void) {
    // setup light source
    CLightSource lsNew;
    lsNew.ls_ulFlags = LSF_NONPERSISTENT|LSF_DYNAMIC;
    lsNew.ls_rHotSpot = 5.0f;
    lsNew.ls_rFallOff = 15.0f;
    lsNew.ls_colColor = RGBToColor(128, 128, 128);
    lsNew.ls_plftLensFlare = NULL;
    lsNew.ls_ubPolygonalMask = 0;
    lsNew.ls_paoLightAnimation = &m_aoLightAnimation;

    m_lsLightSource.ls_penEntity = this;
    m_lsLightSource.SetLightSource(lsNew);
  }
  // play light animation
  void PlayLightAnim(INDEX iAnim, ULONG ulFlags) {
    if (m_aoLightAnimation.GetData()!=NULL) {
      m_aoLightAnimation.PlayAnim(iAnim, ulFlags);
    }
  };

  // fire minigun on/off
  void MinigunOn(void)
  {
    PlayLightAnim(LIGHT_ANIM_FIRE, AOF_LOOPING);
  }
  void MinigunOff(void)
  {
    PlayLightAnim(LIGHT_ANIM_NONE, 0);
  }

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiScorpion;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // scorpman can't harm scorpman
    if (!IsOfClass(penInflictor, "Scorpion")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateRunningSound();
    INDEX iAnim;
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
	  if (fDamageDir<0) {
          iAnim = SCORPION_ANIM_WOUNDBACKWARD;
        } else {
          iAnim = SCORPION_ANIM_WOUNDFORWARD;
        }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    DeactivateRunningSound();
    INDEX iAnim;
    switch (IRnd()%2) {
      case 0: iAnim = SCORPION_ANIM_DEATH1; break;
      case 1: iAnim = SCORPION_ANIM_DEATH2; break;
      default: ASSERTALWAYS("Scorpion unknown death");
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==SCORPION_ANIM_DEATH1)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.48f;
    }
    else if(GetModelObject()->GetAnim()==SCORPION_ANIM_DEATH2)
    {
      vStretch=FLOAT3D(1,1,2)*0.75f;
      return 0.48f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(SCORPION_COLLISION_BOX_PART_NAME);
    SetCollisionFlags(ECF_MODEL);
  };

  // virtual anim functions
  void StandingAnim(void) {
    DeactivateRunningSound();
    StartModelAnim(SCORPION_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    ActivateRunningSound();
    StartModelAnim(SCORPION_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RunningAnim(void) {
    ActivateRunningSound();
    StartModelAnim(SCORPION_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    ActivateRunningSound();
    StartModelAnim(SCORPION_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
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
      PlaySound(m_soFeet, SOUND_STEP, SOF_3D|SOF_LOOP);
      m_bRunSoundPlaying = TRUE;
    }
  }
  void DeactivateRunningSound(void)
  {
    m_soFeet.Stop();
    m_bRunSoundPlaying = FALSE;
  }


/************************************************************
 *                   FIRE BULLET / RAIL                     *
 ************************************************************/
  BOOL CanFireAtPlayer(void)
  {
    // get ray source and target - for left gun
    FLOAT3D vSourceL, vTargetL;
    GetPositionCastRay(this, m_penEnemy, vSourceL, vTargetL);

    // bullet start position
    CPlacement3D plBulletL;
    plBulletL.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBulletL.pl_PositionVector = FLOAT3D(GUN_LX, GUN_LY, 0);
    plBulletL.RelativeToAbsolute(GetPlacement());
    vSourceL = plBulletL.pl_PositionVector;

    // cast the ray
    CCastRay crRayL(this, vSourceL, vTargetL);
    crRayL.cr_ttHitModels = CCastRay::TT_NONE;     // check for brushes only
    crRayL.cr_bHitTranslucentPortals = FALSE;
    en_pwoWorld->CastRay(crRayL);

    // if hit nothing (no brush) the entity can be seen
    return (crRayL.cr_penHit==NULL); 
	
	   
	
    // get ray source and target - for right gun
    FLOAT3D vSourceR, vTargetR;
    GetPositionCastRay(this, m_penEnemy, vSourceR, vTargetR);

    // bullet start position
    CPlacement3D plBulletR;
    plBulletR.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBulletR.pl_PositionVector = FLOAT3D(GUN_RX, GUN_RY, 0);
    plBulletR.RelativeToAbsolute(GetPlacement());
    vSourceR = plBulletR.pl_PositionVector;

    // cast the ray
    CCastRay crRayR(this, vSourceR, vTargetR);
    crRayR.cr_ttHitModels = CCastRay::TT_NONE;     // check for brushes only
    crRayR.cr_bHitTranslucentPortals = FALSE;
    en_pwoWorld->CastRay(crRayR);

    // if hit nothing (no brush) the entity can be seen
    return (crRayR.cr_penHit==NULL);  
  }

  void PrepareBulletL(FLOAT fDamage) {
    // bullet start position
    CPlacement3D plBulletL;
    plBulletL.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBulletL.pl_PositionVector = FLOAT3D(GUN_LX, GUN_LY, 0);
    plBulletL.RelativeToAbsolute(GetPlacement());
    // create bullet
    penBullet = CreateEntity(plBulletL, CLASS_BULLET);
    // init bullet
    EBulletInit eInit;
    eInit.penOwner = this;
    eInit.fDamage = 5;
    penBullet->Initialize(eInit);
  };

  void PrepareBulletR(FLOAT fDamage) {
    // bullet start position
    CPlacement3D plBulletR;
    plBulletR.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBulletR.pl_PositionVector = FLOAT3D(GUN_RX, GUN_RY, 0);
    plBulletR.RelativeToAbsolute(GetPlacement());
    // create bullet
    penBullet = CreateEntity(plBulletR, CLASS_BULLET);
    // init bullet
    EBulletInit eInit;
    eInit.penOwner = this;
    eInit.fDamage = 5;
    penBullet->Initialize(eInit);
  };

  // fire bullet
  void FireBullet(void) {
    // binary divide counter
    m_bFireBulletCount++;
    if (m_bFireBulletCount>1) { m_bFireBulletCount = 0; }
    if (m_bFireBulletCount==1) { return; }
    // bullet
    PrepareBulletL(3.0f);
    ((CBullet&)*penBullet).CalcTarget(m_penEnemy, 250);
    ((CBullet&)*penBullet).CalcJitterTarget(20);
    ((CBullet&)*penBullet).LaunchBullet( TRUE, TRUE, TRUE);
    ((CBullet&)*penBullet).DestroyBullet();
    PrepareBulletR(3.0f);
    ((CBullet&)*penBullet).CalcTarget(m_penEnemy, 250);
    ((CBullet&)*penBullet).CalcJitterTarget(20);
    ((CBullet&)*penBullet).LaunchBullet( TRUE, TRUE, TRUE);
    ((CBullet&)*penBullet).DestroyBullet();
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soSound.Set3DParameters(150.0f, 50.0f, 1.0f, 1.0f);
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
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, fEntitySize, vNormalizedDamage, vBodySpeed, 3.0f, 1.0f);

    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_SCORPION, 0, 0, 0, 0, 0.1f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_SCORPION, 0, 0, 0, 0, 0.1f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_SCORPION, 0, 0, 0, 0, 0.1f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_SCORPION, 0, 0, 0, 0, 0.1f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_SCORPION, 0, 0, 0, 0, 0.1f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_SCORPION, 0, 0, 0, 0, 0.1f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TAIL, TEXTURE_SCORPION, 0, 0, 0, 0, 0.1f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.3f,
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
  // shoot
  Fire(EVoid) : CEnemyBase::Fire{
    DeactivateRunningSound();
    if (!CanFireAtPlayer()) {
      return EReturn();
    }
	switch (m_attType) {
	 case SCO_BOTH:
      if (CalcDist(m_penEnemy) > 150) {
        jump FireLaser();
      } 
      if (CalcDist(m_penEnemy) < 50) {
        jump FireMiniguns();
      }
      if (CalcDist(m_penEnemy) < 150) {
        INDEX iRnd = IRnd()%2;
        switch(iRnd)
        {
        case 0:
          jump FireMiniguns();
          break;
        case 1:
          jump FireLaser();
          break;
	  	  }
      } 
      break;
	 case SCO_LASER:
        jump FireLaser();
        break;
	 case SCO_MINIGUN:
        jump FireMiniguns();
        break;
	}

    MaybeSwitchToAnotherPlayer();
    autowait(1.0f);
    return EReturn();
  };


  FireLaser(EVoid){
    DeactivateRunningSound();
    if (!CanFireAtPlayer()) {
      return EReturn();
    }
    StandingAnim();
    autowait(0.2f + FRnd()*0.25f);

    StartModelAnim(SCORPION_ANIM_FIRELASER, 0);
    PlaySound(m_soSound, SOUND_LASER, SOF_3D);
    autowait(0.73f);
    ShootProjectile(PRT_SCORPION_LASER, FLOAT3D( 0.0f, 5.5f, -4.0f), ANGLE3D(0, 0, 0));

    autowait(FRnd()/3 + 0.6f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

  FireMiniguns(EVoid){
    // confused amount
        m_fDamageConfused = 200;
        m_fFireTime = 3.0f;

    if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
      m_fFireTime *= 0.5f;
    }

    // fire
    m_iSpawnEffect = 0;                         // effect every 'x' frames
    m_fFireTime += _pTimer->CurrentTick();
    m_bFireBulletCount = 0;
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D|SOF_LOOP);
    PlayLightAnim(LIGHT_ANIM_FIRE, AOF_LOOPING);

    while (m_fFireTime > _pTimer->CurrentTick()) {
      m_fMoveFrequency = 0.1f;
      wait(m_fMoveFrequency) {
        on (EBegin) : {
          // make fuss
          AddToFuss();
          // fire bullet
          FireBullet();
          m_vDesiredPosition = m_penEnemy->GetPlacement().pl_PositionVector;
          // rotate to enemy
          if (!IsInPlaneFrustum(m_penEnemy, CosFast(5.0f))) {
            m_fMoveSpeed = 0.0f;
            m_aRotateSpeed = 4000.0f;
            StartModelAnim(SCORPION_ANIM_FIREMINIGUNS, AOF_LOOPING|AOF_NORESTART);
          // stand in place
          } else {
            m_fMoveSpeed = 0.0f;
            m_aRotateSpeed = 0.0f;
            StartModelAnim(SCORPION_ANIM_FIREMINIGUNS, AOF_LOOPING|AOF_NORESTART);
          }
          // adjust direction and speed
          SetDesiredMovement(); 
          resume;
        }
        on (ETimer) : { stop; }
      }
    }
    m_soSound.Stop();
    PlayLightAnim(LIGHT_ANIM_NONE, 0);
    // set next shoot time
    m_fShootTime = _pTimer->CurrentTick() + m_fAttackFireTime*(1.0f);

    // from fire
    StartModelAnim(SCORPION_ANIM_IDLE, 0);
    autowait(GetModelObject()->GetAnimLength(SCORPION_ANIM_IDLE)/2);

    MaybeSwitchToAnotherPlayer();

    // shoot completed
    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    DeactivateRunningSound();
    // close attack
    StartModelAnim(SCORPION_ANIM_MELEE, 0);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    autowait(0.85f);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 50.0f, FLOAT3D(0, 0, 0), vDirection);
    }
    autowait(0.3f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };
/************************************************************
 *                PROCEDURES WHEN HARMED                    *
 ************************************************************/
  // Play wound animation and falling body part
  BeWounded(EDamage eDamage) : CEnemyBase::BeWounded {
    DeactivateRunningSound();
    PlayLightAnim(LIGHT_ANIM_NONE, 0);
    jump CEnemyBase::BeWounded(eDamage);
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    DeactivateRunningSound();
    PlayLightAnim(LIGHT_ANIM_NONE, 0);
    autocall CEnemyBase::Death() EEnd;
    return EEnd();
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
    en_fDensity = 3000.0f;
    en_tmMaxHoldBreath = 60.0f;

    // set your appearance
    SetModel(MODEL_SCORPION);
    SetModelMainTexture(TEXTURE_SCORPION);
    SetModelSpecularTexture(TEXTURE_SPECULAR);
        SetHealth(700.0f);
        m_fMaxHealth = 700.0f;
        // damage/explode properties
        m_fDamageWounded = 300.0f;
        m_fBlowUpAmount = 2000.0f;
        m_fBodyParts = 12;
        // setup attack distances
        m_fAttackDistance = 500.0f;
        m_fCloseDistance = 12.0f;
        m_fStopDistance = 12.0f;
        m_fAttackFireTime = 5.0f;
        m_fCloseFireTime = 1.0f;
        m_fIgnoreRange = 350.0f;
        m_iScore = 8000;

    ModelChangeNotify();

    // setup moving speed
    m_fWalkSpeed = FRnd() + 3.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 550.0f);
    m_fAttackRunSpeed = FRnd()*3.0f + 4.5f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*50.0f + 275.0f);
    m_fCloseRunSpeed = FRnd()*3.0f + 4.5f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*50.0f + 275.0f);

    // set stretch factors for height and width
    CEnemyBase::SizeModel();
    // setup light source
    SetupLightSource();
    // set light animation if available
    try {
      m_aoLightAnimation.SetData_t(CTFILENAME("Animations\\BasicEffects.ani"));
    } catch (char *strError) {
      WarningMessage(TRANS("Cannot load Animations\\BasicEffects.ani: %s"), strError);
    }
    PlayLightAnim(LIGHT_ANIM_NONE, 0);
    m_soFeet.Set3DParameters(150.0f, 5.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();

  };
};

305
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/Lizard/Lizard.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum LizType {
  0 LIZ_NORMAL         "Normal",      // normal (fighter)
  1 LIZ_SPIT           "Spitter",        // big
  2 LIZ_BIG            "Big",       // huge
};

%{
// info structure
static EntityInfo eiLizard = {
 EIBT_FLESH, 250.0f,
 0.0f, 1.0f, 0.0f,    // source (eyes)
 0.0f, 1.9f, 0.0f,    // target (body)
};

#define JAW_HIT 3.3f
#define JAW_HIT_BIG 4.4f
#define FIRE_MOUTH     FLOAT3D( 0.0f, 1.0f, 0.0f)
%}


class CLizard : CEnemyBase {
name      "Lizard";
thumbnail "Thumbnails\\Lizard.tbn";

properties:
  1 enum LizType m_blType     "Character" 'C' = LIZ_NORMAL,
  2 BOOL m_bJawHit = FALSE,          // used for close attack
  3 BOOL m_bTouchAnother = FALSE,     // another entity touched on far attack
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,
  6 INDEX   m_fgibTexture = TEXTURE_LIZARD,

components:
  0 class   CLASS_BASE        "Classes\\EnemyBase.ecl",
  1 model   MODEL_LIZARD     "ModelsMP\\Enemies\\SS2\\Lizard\\Lizard.mdl",
  2 texture TEXTURE_LIZARD   "ModelsMP\\Enemies\\SS2\\Lizard\\Lizard.tex",
  3 texture TEXTURE_LIZARD_BLUE   "ModelsMP\\Enemies\\SS2\\Lizard\\LizardBlue.tex",
  4 texture TEXTURE_LIZARD_RED    "ModelsMP\\Enemies\\SS2\\Lizard\\LizardRED.tex",

  5 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",

// ************** FLESH PARTS **************
  6 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
  7 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
  8 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",

 10 model   MODEL_BODY           "ModelsMP\\Enemies\\SS2\\Lizard\\Debris\\bod.mdl",
 11 model   MODEL_LEG            "ModelsMP\\Enemies\\SS2\\Lizard\\Debris\\leg.mdl",
 12 model   MODEL_JAW            "ModelsMP\\Enemies\\SS2\\Lizard\\Debris\\Jaw.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Melee.wav",
 56 sound   SOUND_DEATH     "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Death.wav",
 57 sound   SOUND_RUN       "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Run.wav",

 60 sound   SOUND_BIG_IDLE      "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Big\\Idle.wav",
 61 sound   SOUND_BIG_SIGHT     "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Big\\Sight.wav",
 62 sound   SOUND_BIG_WOUND     "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Big\\Wound.wav",
 64 sound   SOUND_BIG_KICK      "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Big\\Melee.wav",
 66 sound   SOUND_BIG_DEATH     "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Big\\Death.wav",
 67 sound   SOUND_BIG_RUN       "ModelsMP\\Enemies\\SS2\\Lizard\\Sounds\\Big\\Run.wav",

functions:
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_RUN  );
    PrecacheClass(CLASS_PROJECTILE, PRT_FISHMAN_FIRE);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_GIZMO_SPLASH_FX);
    PrecacheModel(MODEL_BODY);
    PrecacheModel(MODEL_LEG);
    PrecacheModel(MODEL_JAW);
    
    PrecacheSound(SOUND_BIG_IDLE );
    PrecacheSound(SOUND_BIG_SIGHT);
    PrecacheSound(SOUND_BIG_WOUND);
    PrecacheSound(SOUND_BIG_KICK );
    PrecacheSound(SOUND_BIG_DEATH);
    PrecacheSound(SOUND_BIG_RUN  );
  };

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A lizard devoured %s"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmNormal,  "DataMP\\Messages\\Enemies\\SS2\\Lizard.txt");
    static DECLARE_CTFILENAME(fnmSpitter, "DataMP\\Messages\\Enemies\\SS2\\LizardSpitter.txt");
    static DECLARE_CTFILENAME(fnmBig,     "DataMP\\Messages\\Enemies\\SS2\\LizardBig.txt");
    switch(m_blType) {
    default: ASSERT(FALSE);
    case LIZ_NORMAL: return fnmNormal;
    case LIZ_SPIT: return fnmSpitter;
    case LIZ_BIG: return fnmBig;
    }
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiLizard;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // boneman can't harm boneman
    if (!IsOfClass(penInflictor, "Lizard")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);;
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
    switch (IRnd()%2) {
      case 0: iAnim = LIZARD_ANIM_WOUND01; break;
      case 1: iAnim = LIZARD_ANIM_WOUNDHARD; break;
      default: ASSERTALWAYS("Lizard unknown damage");
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(LIZARD_ANIM_DEATH, 0);
    DeactivateRunningSound();
    return LIZARD_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    (GetModelObject()->GetAnim()==LIZARD_ANIM_DEATH);
    vStretch=FLOAT3D(1,1,2)*1.0f;
    return 0.48f;
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(LIZARD_COLLISION_BOX_DEATH);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(LIZARD_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(LIZARD_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RunningAnim(void) {
    StartModelAnim(LIZARD_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(LIZARD_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    if (m_blType==LIZ_BIG) {
      PlaySound(m_soSound, SOUND_BIG_IDLE, SOF_3D);
  } else {
      PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
	  }
  };
  void SightSound(void) {
    if (m_blType==LIZ_BIG) {
      PlaySound(m_soSound, SOUND_BIG_SIGHT, SOF_3D);
  } else {
      PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
	  }
  };
  void WoundSound(void) {
    if (m_blType==LIZ_BIG) {
      PlaySound(m_soSound, SOUND_BIG_WOUND, SOF_3D);
  } else {
      PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
	  }
  };
  void DeathSound(void) {
    if (m_blType==LIZ_BIG) {
      PlaySound(m_soSound, SOUND_BIG_DEATH, SOF_3D);
  } else {
      PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
	  }
  };


  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      if (m_blType==LIZ_BIG) {
        PlaySound(m_soFeet, SOUND_BIG_RUN, SOF_3D|SOF_LOOP);
    } else {
        PlaySound(m_soFeet, SOUND_RUN, SOF_3D|SOF_LOOP);
  	  }
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

    vNormalizedDamage *= 0.8f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;
	  
      Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);

    Debris_Spawn(this, this, MODEL_BODY, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_JAW, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

      // spawn debris
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }

      // spawn splash fx (sound)
      CPlacement3D plSplash = GetPlacement();
      CEntityPointer penSplash = CreateEntity(plSplash, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_GIZMO_SPLASH_FX;
      penSplash->Initialize(ese);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };


  // leave stain
  virtual void LeaveStain(BOOL bGrow)
  {
    ESpawnEffect ese;
    FLOAT3D vPoint;
    FLOATplane3D vPlaneNormal;
    FLOAT fDistanceToEdge;
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
  
    // on plane
    if( GetNearestPolygon(vPoint, vPlaneNormal, fDistanceToEdge))
    {
      // if near to polygon and away from last stain point
      if( (vPoint-GetPlacement().pl_PositionVector).Length()<0.5f )
      {
        FLOAT fStretch = box.Size().Length();
        // stain
        ese.colMuliplier = C_WHITE|CT_OPAQUE;
        ese.betType    = BET_GIZMOSTAIN;
        ese.vStretch   = FLOAT3D( fStretch*0.75f, fStretch*0.75f, 1.0f);
        ese.vNormal    = FLOAT3D( vPlaneNormal);
        ese.vDirection = FLOAT3D( 0, 0, 0);
        FLOAT3D vPos = vPoint+ese.vNormal/50.0f*(FRnd()+0.5f);
        CEntityPointer penEffect = CreateEntity( CPlacement3D(vPos, ANGLE3D(0,0,0)), CLASS_BASIC_EFFECT);
        penEffect->Initialize(ese);
      }
    }
  };





procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    if (m_blType==LIZ_SPIT) {

    // fire projectile
    StartModelAnim(LIZARD_ANIM_SIGHT, 0);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    DeactivateRunningSound();
    autowait(0.35f);
    ShootProjectile(PRT_FISHMAN_FIRE, FIRE_MOUTH, ANGLE3D(0, 0, 0));
    autowait(FRnd()/3+0.6f);

    return EReturn();
	} else { return EReturn(); }


  };

  Hit(EVoid) : CEnemyBase::Hit {
    // hit
    if (m_blType == LIZ_BIG) {
      if (CalcDist(m_penEnemy) < JAW_HIT_BIG) {
        jump HitBigBones();
      
      // jump
      } else if (CalcDist(m_penEnemy) < 26.0f) {
        jump JumpOnEnemy();
      }
	} else {
      if (CalcDist(m_penEnemy) < JAW_HIT) {
        jump HitWithBones();
      
      // jump
      } else if (CalcDist(m_penEnemy) < 18.0f) {
        jump JumpOnEnemy();
      }
	}

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    return EReturn();
  };

  // jump on enemy
  JumpOnEnemy(EVoid) {
    StartModelAnim(LIZARD_ANIM_JUMPATTACK, 0);
    DeactivateRunningSound();

    // jump
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*3.0f;
    vDir(2) = 2.5f;
    SetDesiredTranslation(vDir);
      if (m_blType == LIZ_BIG) {
        PlaySound(m_soSound, SOUND_BIG_KICK, SOF_3D);
	} else {
        PlaySound(m_soSound, SOUND_KICK, SOF_3D);
		}
    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    m_iChargeHitAnimation = LIZARD_ANIM_JUMPATTACK;
      if (m_blType == LIZ_BIG) {
        m_fChargeHitDamage = 20.0f;
        m_fChargeHitAngle = 0.0f;
        m_fChargeHitSpeed = 30.0f;
	  } else {
        m_fChargeHitDamage = 10.0f;
        m_fChargeHitAngle = 0.0f;
        m_fChargeHitSpeed = 15.0f;
	  }
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.1f);
    return EReturn();
  };

  // hit with bones
  HitWithBones(EVoid) {
    // attack with bones
    StartModelAnim(LIZARD_ANIM_MELEE, 0);
    DeactivateRunningSound();

    // right hand
    m_bJawHit = FALSE;
    autowait(0.35f);

    if (CalcDist(m_penEnemy)<JAW_HIT) { m_bJawHit = TRUE; }
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    autowait(0.10f);
    if (CalcDist(m_penEnemy)<JAW_HIT) { m_bJawHit = TRUE; }
    if (m_bJawHit) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      // damage enemy
         InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
        // push target
        FLOAT3D vSpeed;
        GetHeadingDirection(AngleDeg(0.0f), vSpeed);
        vSpeed = vSpeed * 10.0f;
        KickEntity(m_penEnemy, vSpeed);
    }
    autowait(0.5f);
    return EReturn();
  };

  // hit with bones
  HitBigBones(EVoid) {
    // attack with bones
    StartModelAnim(LIZARD_ANIM_MELEE, 0);
    DeactivateRunningSound();

    // right hand
    m_bJawHit = FALSE;
    autowait(0.35f);

    if (CalcDist(m_penEnemy)<JAW_HIT_BIG) { m_bJawHit = TRUE; }
    PlaySound(m_soSound, SOUND_BIG_KICK, SOF_3D);
    autowait(0.10f);
    if (CalcDist(m_penEnemy)<JAW_HIT_BIG) { m_bJawHit = TRUE; }
    if (m_bJawHit) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      // damage enemy
         InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
        // push target
        FLOAT3D vSpeed;
        GetHeadingDirection(AngleDeg(0.0f), vSpeed);
        vSpeed = vSpeed * 20.0f;
        KickEntity(m_penEnemy, vSpeed);
    }
    autowait(0.5f);
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
    en_fDensity = 2000.0f;
      m_sptType = SPT_SLIME;
    en_tmMaxHoldBreath = 5.0f;

    // set your appearance
    SetModel(MODEL_LIZARD);

    if (m_blType == LIZ_NORMAL)
    {
      GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
      ModelChangeNotify();
      SetModelMainTexture(TEXTURE_LIZARD);
		m_fgibTexture = TEXTURE_LIZARD;
      SetHealth(60.0f);
      m_fMaxHealth = 60.0f;
      StandingAnim();
      // setup moving speed
      m_fWalkSpeed = FRnd() + 2.5f;
      m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
      m_fAttackRunSpeed = FRnd() + 8.0f;
      m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
      m_fCloseRunSpeed = FRnd() + 8.0f;
      m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
      // setup attack distances
      m_fAttackDistance = 100.0f;
      m_fCloseDistance = 30.0f;
      m_fStopDistance = 2.0f;
      m_fAttackFireTime = 3.0f;
      m_fCloseFireTime = 2.0f;
      m_fIgnoreRange = 200.0f;
      // damage/explode properties
      m_fBlowUpAmount = 80.0f;
      m_fBodyParts = 3;
	  m_fBlowUpSize = 2.0f;
      m_fDamageWounded = 20.0f;
      m_iScore = 500;
	}
    if (m_blType == LIZ_SPIT)
    {
      GetModelObject()->StretchModel(FLOAT3D(0.8f, 0.8f, 0.8f));
      ModelChangeNotify();
      SetModelMainTexture(TEXTURE_LIZARD_BLUE);
		m_fgibTexture = TEXTURE_LIZARD_BLUE;
      SetHealth(30.0f);
      m_fMaxHealth = 30.0f;
      StandingAnim();
      // setup moving speed
      m_fWalkSpeed = FRnd() + 1.5f;
      m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
      m_fAttackRunSpeed = FRnd() + 5.0f;
      m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
      m_fCloseRunSpeed = FRnd() + 5.0f;
      m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
      // setup attack distances
      m_fAttackDistance = 100.0f;
      m_fCloseDistance = 15.0f;
      m_fStopDistance = 2.0f;
      m_fAttackFireTime = 3.0f;
      m_fCloseFireTime = 2.0f;
      m_fIgnoreRange = 200.0f;
      // damage/explode properties
      m_fBlowUpAmount = 80.0f;
      m_fBodyParts = 2;
	  m_fBlowUpSize = 1.6f;
      m_fDamageWounded = 10.0f;
      m_iScore = 750;
	}
    if (m_blType == LIZ_BIG)
    {
      GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
      ModelChangeNotify();
      SetModelMainTexture(TEXTURE_LIZARD_RED);
		m_fgibTexture = TEXTURE_LIZARD_RED;
      SetHealth(140.0f);
      m_fMaxHealth = 140.0f;
      StandingAnim();
      // setup moving speed
      m_fWalkSpeed = FRnd() + 4.0f;
      m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
      m_fAttackRunSpeed = FRnd() + 10.0f;
      m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
      m_fCloseRunSpeed = FRnd() + 10.0f;
      m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
      // setup attack distances
      m_fAttackDistance = 100.0f;
      m_fCloseDistance = 40.0f;
      m_fStopDistance = 3.5f;
      m_fAttackFireTime = 3.0f;
      m_fCloseFireTime = 2.0f;
      m_fIgnoreRange = 200.0f;
      // damage/explode properties
      m_fBlowUpAmount = 250.0f;
      m_fBodyParts = 4;
	  m_fBlowUpSize = 3.0f;
      m_fDamageWounded = 40.0f;
      m_iScore = 1500;
	}



    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    // set stretch factors for height and width
    m_soFeet.Set3DParameters(60.0f, 5.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

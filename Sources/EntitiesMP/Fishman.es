305
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Fishman/Fishman2.h"
#include "ModelsF/Enemies/Fishman/Spear.h"
%}

uses "EntitiesMP/EnemyDive";
uses "EntitiesMP/BasicEffects";

enum FishmanChar {
  0 FSH_SOLDIER   "Soldier",    // soldier
  1 FSH_SERGEANT  "Sergeant",   // sergeant
};

%{
static EntityInfo eiFishmanGround = {
  EIBT_FLESH, 200.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiFishmanLiquid = {
  EIBT_FLESH, 200.3f,
  0.0f, 0.0f, 0.0f,
  0.0f, 0.0f, 0.0f,
};

#define BONES_HIT 2.8f
#define FIRE_RIGHT_HAND     FLOAT3D( 0.25f, 1.0f, 0.0f)
#define FIRE_LEFT_HAND      FLOAT3D(-0.25f, 1.0f, 0.0f)
%}


class CFishman : CEnemyDive {
name      "Fishman";
thumbnail "Thumbnails\\Fishman.tbn";

properties:
  1 enum FishmanChar m_FshChar "Character" 'C' = FSH_SOLDIER,      // character
  2 BOOL m_bFistHit = FALSE,          // used for close attack
  3 BOOL m_bTouchAnother = FALSE,     // another entity touched on far attack
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,

components:
  0 class   CLASS_BASE        "Classes\\EnemyDive.ecl",
  1 model   MODEL_FISHMAN     "ModelsF\\Enemies\\Fishman\\Fishman2.mdl",
  2 texture TEXTURE_FISHMAN_SMALL   "ModelsF\\Enemies\\Fishman\\Fishman3.tex",
  3 texture TEXTURE_FISHMAN_BIG   "ModelsF\\Enemies\\Fishman\\Fishman4.tex",
  4 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  8 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
// ************** FLESH PARTS **************
  5 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
  6 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",

 10 model   MODEL_HEAD           "ModelsF\\Enemies\\Fishman\\Debris\\Head.mdl",
 11 model   MODEL_LEG           "ModelsF\\Enemies\\Fishman\\Debris\\Leg.mdl",
 12 model   MODEL_TAIL           "ModelsF\\Enemies\\Fishman\\Debris\\Tail.mdl",
 
 13 model   MODEL_SPEAR           "ModelsF\\Enemies\\Fishman\\Spear.mdl",
 14 texture   TEXTURE_SPEAR           "AREP\\Models\\Fishman2\\Fishman.tex",

 15 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Weak.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\Enemies\\Fishman\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\Enemies\\Fishman\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\Enemies\\Fishman\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsF\\Enemies\\Fishman\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "ModelsF\\Enemies\\Fishman\\Sounds\\Kick.wav",
 55 sound   SOUND_PUNCH     "ModelsF\\Enemies\\Fishman\\Sounds\\Punch.wav",
 56 sound   SOUND_DEATH     "ModelsF\\Enemies\\Fishman\\Sounds\\Death.wav",
 57 sound   SOUND_RUN       "ModelsF\\Enemies\\Fishman\\Sounds\\Jump.wav",

functions:
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_PUNCH);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_RUN  );
    PrecacheModel(MODEL_FISHMAN);
    if (m_FshChar == FSH_SOLDIER) {
      PrecacheTexture(TEXTURE_FISHMAN_SMALL);
      PrecacheClass(CLASS_PROJECTILE, PRT_FISHMAN_FIRE);
    } else {
      PrecacheTexture(TEXTURE_FISHMAN_BIG);
      PrecacheClass(CLASS_PROJECTILE, PRT_FISHMAN_FIRE_STRONG);
	  }
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_GIZMO_SPLASH_FX);
	  PrecacheModel(MODEL_HEAD);
	  PrecacheModel(MODEL_LEG);
	  PrecacheModel(MODEL_TAIL);
	  
    PrecacheModel(MODEL_SPEAR);
    PrecacheTexture(TEXTURE_SPEAR);
  };

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (eDeath.eLastDamage.dmtType==DMT_CLOSERANGE) {
      str.PrintF(TRANS("%s impaled by a Vodyani"), (const char *)strPlayerName);
    } else {
      str.PrintF(TRANS("%s was burned to a crips by a Vodyani"), (const char *) strPlayerName);
    }
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier, "DataMP\\Messages\\Enemies\\AREP\\Fishman.txt");
    static DECLARE_CTFILENAME(fnmSergeant, "DataMP\\Messages\\Enemies\\AREP\\FishmanGeneral.txt");
    switch(m_FshChar) {
    default: ASSERT(FALSE);
    case FSH_SOLDIER: return fnmSoldier;
    case FSH_SERGEANT: return fnmSergeant;
	}
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_bInLiquid) {
      return &eiFishmanLiquid;
    } else {
      return &eiFishmanGround;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // fishman can't harm fishman
    if (!IsOfClass(penInflictor, "Fishman")) {
      CEnemyDive::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
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
    if (m_bInLiquid) {
      INDEX iAnim = FISHMAN2_ANIM_SWIMWOUND;
      StartModelAnim(iAnim, 0);
      return iAnim;
    } else {
      INDEX iAnim = FISHMAN2_ANIM_WOUND;
      StartModelAnim(iAnim, 0);
      return iAnim;
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void)
  {
    INDEX iAnim;
    if (m_bInLiquid) {
      iAnim = FISHMAN2_ANIM_SWIMDEATH;
    } else {
      iAnim = FISHMAN2_ANIM_DEATH;
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==FISHMAN2_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.48f;
    }
  };

  void DeathNotify(void) {
    en_fDensity = 500.0f;
    if (m_bInLiquid) {
      ChangeCollisionBoxIndexWhenPossible(FISHMAN2_COLLISION_BOX_SWIM);
    } else {
      ChangeCollisionBoxIndexWhenPossible(FISHMAN2_COLLISION_BOX_GROUND);
    }
  };

  // virtual anim functions
  void StandingAnim(void)
  {
    if (m_bInLiquid) {
      StartModelAnim(FISHMAN2_ANIM_SWIMIDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(FISHMAN2_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    }
	DeactivateRunningSound();
  };
  void WalkingAnim(void)
  {
    if (m_bInLiquid) {
      StartModelAnim(FISHMAN2_ANIM_SWIMWALK, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(FISHMAN2_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
    ActivateRunningSound();
  };
  void RunningAnim(void)
  {
    if (m_bInLiquid) {
      StartModelAnim(FISHMAN2_ANIM_SWIMWALK, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(FISHMAN2_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
	  }
    ActivateRunningSound();
  };
  void RotatingAnim(void)
  {
    if (m_bInLiquid) {
      StartModelAnim(FISHMAN2_ANIM_SWIMWALK, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(FISHMAN2_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void ChangeCollisionToLiquid() {
    ChangeCollisionBoxIndexWhenPossible(FISHMAN2_COLLISION_BOX_SWIM);
  };
  void ChangeCollisionToGround() {
    ChangeCollisionBoxIndexWhenPossible(FISHMAN2_COLLISION_BOX_GROUND);
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
      PlaySound(m_soFeet, SOUND_RUN, SOF_3D|SOF_LOOP);
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

	INDEX iTexture_Body_ID = TEXTURE_FISHMAN_SMALL;
    if (m_FshChar==FSH_SERGEANT)
    {
      iTexture_Body_ID = TEXTURE_FISHMAN_BIG;
    }

      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;

    Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);


    Debris_Spawn(this, this, MODEL_HEAD, iTexture_Body_ID, 0, 0, 0, IRnd()%4, 0.5,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, iTexture_Body_ID, 0, 0, 0, IRnd()%4, 0.5,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_TAIL, iTexture_Body_ID, 0, 0, 0, IRnd()%4, 0.5,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, iTexture_Body_ID, 0, 0, 0, IRnd()%4, 0.5,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

      // spawn debris
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.35f,
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
  Fire(EVoid) : CEnemyBase::Fire {
    // fire projectile
    if (m_bInLiquid) {
      StartModelAnim(FISHMAN2_ANIM_SWIMFIRE, 0);
    } else {
      StartModelAnim(FISHMAN2_ANIM_FIRE, 0);
    }
	if( m_FshChar == FSH_SOLDIER)
    {
    DeactivateRunningSound();
    autowait(0.35f);
    ShootProjectile(PRT_FISHMAN_FIRE, FIRE_RIGHT_HAND, ANGLE3D(-1, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.45f);
    ShootProjectile(PRT_FISHMAN_FIRE, FIRE_LEFT_HAND, ANGLE3D(1, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(FRnd()/3+0.6f);
	}
	if( m_FshChar == FSH_SERGEANT)
    {
    DeactivateRunningSound();
    autowait(0.35f);
    ShootProjectile(PRT_FISHMAN_FIRE_STRONG, FIRE_RIGHT_HAND, ANGLE3D(-1, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.45f);
    ShootProjectile(PRT_FISHMAN_FIRE_STRONG, FIRE_LEFT_HAND, ANGLE3D(1, 0, 0));
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(FRnd()/3+0.6f);
	}

    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    if (m_bInLiquid) {
      StartModelAnim(FISHMAN2_ANIM_SWIMHIT, 0);
    } else {
      StartModelAnim(FISHMAN2_ANIM_HIT, 0);
    }
    DeactivateRunningSound();

    // jump
	if( m_FshChar == FSH_SOLDIER)
    {
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*3.0f;
    vDir(2) = 0.5f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    if (m_bInLiquid) {
      m_iChargeHitAnimation = FISHMAN2_ANIM_SWIMHIT;
	} else { 
      m_iChargeHitAnimation = FISHMAN2_ANIM_HIT;
	}
    m_fChargeHitDamage = 6.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 20.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.3f);
    return EReturn();
	}
	if( m_FshChar == FSH_SERGEANT)
    {
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*3.0f;
    vDir(2) = 0.5f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    if (m_bInLiquid) {
      m_iChargeHitAnimation = FISHMAN2_ANIM_SWIMHIT;
	} else { 
      m_iChargeHitAnimation = FISHMAN2_ANIM_HIT;
	}
    m_fChargeHitDamage = 12.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 30.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.3f);
    return EReturn();
	}
  };



/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS|EPF_HASGILLS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_fDensity = 1000.0f;
    m_EedtType = EDT_GROUND_DIVE;
    if (m_FshChar==FSH_SOLDIER) {
    SetHealth(30.0f);
    m_fMaxHealth = 30.0f;
    // damage/explode properties
    m_fBlowUpAmount = 50.0f;
    m_fBodyParts = 2;
	m_fBlowUpSize = 2.0f;
    m_fDamageWounded = 10.0f;
    m_iScore = 400;
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.0f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd() + 7.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 9.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 40.0f;
    m_fCloseDistance = 11.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 500.0f;
    // fly moving properties
    m_fDiveWalkSpeed = FRnd() + 4.0f;
    m_aDiveWalkRotateSpeed = FRnd()*10.0f + 500.0f;
    m_fDiveAttackRunSpeed = FRnd()*3.0f + 13.0f;
    m_aDiveAttackRotateSpeed = FRnd()*25 + 500.0f;
    m_fDiveCloseRunSpeed = FRnd() + 15.0f;
    m_aDiveCloseRotateSpeed = FRnd()*50 + 800.0f;
    // attack properties
    m_fDiveAttackDistance = 60.0f;
    m_fDiveCloseDistance = 11.0f;
    m_fDiveStopDistance = 0.0f;
    m_fDiveAttackFireTime = 3.0f;
    m_fDiveCloseFireTime = 2.0f;
    m_fDiveIgnoreRange = 200.0f;
    m_soFeet.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
	}
    if (m_FshChar==FSH_SERGEANT) {
    SetHealth(90.0f);
    m_fMaxHealth = 90.0f;
    // damage/explode properties
    m_fBlowUpAmount = 130.0f;
    m_fBodyParts = 4;
	m_fBlowUpSize = 3.0f;
    m_fDamageWounded = 30.0f;
    m_iScore = 1000;
    // setup moving speed
    m_fWalkSpeed = FRnd() + 3.0f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd() + 9.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 11.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 60.0f;
    m_fCloseDistance = 13.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 500.0f;
    // fly moving properties
    m_fDiveWalkSpeed = FRnd() + 5.0f;
    m_aDiveWalkRotateSpeed = FRnd()*10.0f + 500.0f;
    m_fDiveAttackRunSpeed = FRnd()*3.0f + 15.0f;
    m_aDiveAttackRotateSpeed = FRnd()*25 + 500.0f;
    m_fDiveCloseRunSpeed = FRnd() + 18.0f;
    m_aDiveCloseRotateSpeed = FRnd()*50 + 800.0f;
    // attack properties
    m_fDiveAttackDistance = 60.0f;
    m_fDiveCloseDistance = 13.0f;
    m_fDiveStopDistance = 0.0f;
    m_fDiveAttackFireTime = 3.0f;
    m_fDiveCloseFireTime = 2.0f;
    m_fDiveIgnoreRange = 200.0f;
    m_soFeet.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
	}

    // set your appearance
    SetModel(MODEL_FISHMAN);
    SetModelSpecularTexture(TEXTURE_SPECULAR);
	{
    if (m_FshChar==FSH_SOLDIER) {
    SetModelMainTexture(TEXTURE_FISHMAN_SMALL);
    GetModelObject()->StretchModel(FLOAT3D(1.2f, 1.2f, 1.2f));
    AddAttachment(FISHMAN2_ATTACHMENT_SPEAR, MODEL_SPEAR, TEXTURE_SPEAR);
      GetModelObject()->StretchModel(FLOAT3D(1.2f, 1.2f, 1.2f));
	}
    if (m_FshChar==FSH_SERGEANT) {
    SetModelMainTexture(TEXTURE_FISHMAN_BIG);
    GetModelObject()->StretchModel(FLOAT3D(1.7f, 1.7f, 1.7f));
    AddAttachment(FISHMAN2_ATTACHMENT_SPEAR, MODEL_SPEAR, TEXTURE_SPEAR);
      GetModelObject()->StretchModel(FLOAT3D(1.7f, 1.7f, 1.7f));
	}
	}
    StandingAnim();
    m_sptType = SPT_SLIME;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 8.0f;
    }

    // set stretch factors for height and width;
    ModelChangeNotify();

    // continue behavior in base class
    jump CEnemyDive::MainLoop();
  };
};

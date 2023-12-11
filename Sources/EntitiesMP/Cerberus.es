307
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/Cerberus/Cerberus.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyRunInto";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiCerberus = {
  EIBT_FLESH, 500.0f,
  0.0f, 1.5f, 0.0f,     // source (eyes)
  0.0f, 3.5f, 0.0f,     // target (body)
};

#define HIT_DISTANCE 5.0f
%}


class CCerberus : CEnemyRunInto {
name      "Cerberus";
thumbnail "Thumbnails\\Cerberus.tbn";

properties:
  1 BOOL m_bRunAttack = FALSE,        // run attack (attack local)
  2 BOOL m_bHit = FALSE,          // close attack local
  3 CEntityPointer m_penLastTouched,  // last touched
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,
  
components:
  0 class   CLASS_BASE        "Classes\\EnemyRunInto.ecl",
  1 model   MODEL_CERBERUS    "ModelsMP\\Enemies\\SS2\\Cerberus\\Cerberus.mdl",
  2 texture TEXTURE_CERBERUS  "ModelsMP\\Enemies\\SS2\\Cerberus\\Cerberus.tex",
  9 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** BODY PARTS **************
  3 model   MODEL_CERBERUS_HEAD    "ModelsMP\\Enemies\\SS2\\Cerberus\\Debris\\Head.mdl",

  5 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
  6 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsMP\\Enemies\\SS2\\Cerberus\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\SS2\\Cerberus\\Sounds\\Sight.wav",
 53 sound   SOUND_KICK      "ModelsMP\\Enemies\\SS2\\Cerberus\\Sounds\\Melee.wav",
 54 sound   SOUND_IMPACT    "ModelsMP\\Enemies\\SS2\\Cerberus\\Sounds\\JumpAttack.wav",
 55 sound   SOUND_DEATH_STAND     "ModelsMP\\Enemies\\SS2\\Cerberus\\Sounds\\Death_Stand.wav",
 55 sound   SOUND_DEATH_RUN       "ModelsMP\\Enemies\\SS2\\Cerberus\\Sounds\\Death_Run.wav",
 56 sound   SOUND_RUN       "ModelsMP\\Enemies\\SS2\\Cerberus\\Sounds\\Run.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Cerberus ripped %s into shreds"), (const char *) strPlayerName);
    return str;
  }

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE    );
    PrecacheSound(SOUND_SIGHT   );
    PrecacheSound(SOUND_KICK    );
    PrecacheSound(SOUND_IMPACT  );
    PrecacheSound(SOUND_DEATH_STAND   );
    PrecacheSound(SOUND_DEATH_RUN   );
    PrecacheSound(SOUND_RUN     );

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
    PrecacheModel(MODEL_CERBERUS_HEAD);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_FLESH_SPLAT_FX);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiCerberus;
  };

  FLOAT GetCrushHealth(void)
  {
    return 60.0f;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataMP\\Messages\\Enemies\\SS2\\Cerberus.txt");
    return fnm;
  };

  // render particles
  void RenderParticles(void)
  {
    Particles_RunningDust(this);
    CEnemyBase::RenderParticles();
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // cerberus can't harm cerberus
    if (!IsOfClass(penInflictor, "Cerberus")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
    // if caught in range of a nuke ball
    if (dmtType==DMT_CANNONBALL_EXPLOSION && GetHealth()<=0) {
      // must blow up easier
      m_fBlowUpAmount = m_fBlowUpAmount/2;
    }
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (en_vCurrentTranslationAbsolute.Length()>5.0f) {
      iAnim = CERBERUS_ANIM_DEATH_RUN;
    } else {
      iAnim = CERBERUS_ANIM_DEATH_STAND;
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==CERBERUS_ANIM_DEATH_RUN)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.6f;
    }
    else if(GetModelObject()->GetAnim()==CERBERUS_ANIM_DEATH_STAND)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.7f;
    }
    return -1.0f;
  };

  void DeathNotify() {
    ChangeCollisionBoxIndexWhenPossible(CERBERUS_COLLISION_BOX_PART_NAME);
    SetCollisionFlags(ECF_MODEL);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(CERBERUS_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(CERBERUS_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void RunningAnim(void) {
    StartModelAnim(CERBERUS_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(CERBERUS_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    //DeactivateRunningSound();
    ActivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void WoundSound(void) {
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH_RUN, SOF_3D);
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


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, fEntitySize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_CERBERUS_HEAD, TEXTURE_CERBERUS, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_CERBERUS_HEAD, TEXTURE_CERBERUS, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_CERBERUS_HEAD, TEXTURE_CERBERUS, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
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


/************************************************************
 *                      ATTACK FUNCTIONS                    *
 ************************************************************/
  // touched another live entity
  void LiveEntityTouched(ETouch etouch) {
    if (m_penLastTouched!=etouch.penOther || _pTimer->CurrentTick()>=m_fLastTouchedTime+0.25f) {
      // hit angle
      FLOAT3D vDirection = en_vCurrentTranslationAbsolute;
      vDirection.Normalize();
      ANGLE aHitAngle = FLOAT3D(etouch.plCollision)%vDirection;
      // only hit target in front of you
      if (aHitAngle < 0.0f) {
        // increase mass - only if not another bull
        if (!IsOfSameClass(this, etouch.penOther)) {
          IncreaseKickedMass(etouch.penOther);
        }
        PlaySound(m_soSound, SOUND_IMPACT, SOF_3D);
        // store last touched
        m_penLastTouched = etouch.penOther;
        m_fLastTouchedTime = _pTimer->CurrentTick();
        // damage
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(etouch.penOther, this, DMT_CLOSERANGE, -aHitAngle*20.0f,
          FLOAT3D(0, 0, 0), vDirection);
        // kick touched entity
        FLOAT3D vSpeed = -FLOAT3D(etouch.plCollision);
        vSpeed = vSpeed*10.0f;
        const FLOATmatrix3D &m = GetRotationMatrix();
        FLOAT3D vSpeedRel = vSpeed*!m;
        if (vSpeedRel(1)<-0.1f) {
          vSpeedRel(1)-=5.0f;
        } else {
          vSpeedRel(1)+=5.0f;
        }
        vSpeedRel(2)=5.0f;

        vSpeed = vSpeedRel*m;
        KickEntity(etouch.penOther, vSpeed);
      }
    }
  };

  // touched entity with higher mass
  BOOL HigherMass(void) {
    return (m_fMassKicked > 500.0f);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soFeet.Set3DParameters(200.0f, 10.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    if (CalcDist(m_penEnemy) < HIT_DISTANCE) {
      // attack with horns
      StartModelAnim(CERBERUS_ANIM_MELEE, 0);
      DeactivateRunningSound();
      m_bHit = FALSE;
      autowait(0.4f);
      PlaySound(m_soSound, SOUND_KICK, SOF_3D);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHit = TRUE; }
      autowait(0.1f);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHit = TRUE; }
      autowait(0.1f);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHit = TRUE; }
      if (m_bHit) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 15.0f, FLOAT3D(0, 0, 0), vDirection);
        FLOAT3D vSpeed;
        GetPitchDirection(AngleDeg(30.0f), vSpeed);
        vSpeed = vSpeed * 10.0f;
        KickEntity(m_penEnemy, vSpeed);
      }
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.5f;
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
    SetHealth(125.0f);
    m_fMaxHealth = 125.0f;
    en_fDensity = 2000.0f;

    // set your appearance
    SetModel(MODEL_CERBERUS);
    SetModelMainTexture(TEXTURE_CERBERUS);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 60.0f);
    m_fAttackRunSpeed = FRnd()*3.0f + 13.0f;
    m_fAttackRotateRunInto = AngleDeg(FRnd()*60 + 500.0f);
    m_aAttackRotateSpeed = m_fAttackRotateRunInto;
    m_fCloseRunSpeed = FRnd() + 15.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 6.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 0.05f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 250.0f;
    // damage/explode properties
    m_fBlowUpAmount = 500;
    m_fBodyParts = 12;
    m_fDamageWounded = 100000.0f;
    m_iScore = 1200;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    Particles_RunningDust_Prepare(this);

    // continue behavior in base class
    jump CEnemyRunInto::MainLoop();
  };
};

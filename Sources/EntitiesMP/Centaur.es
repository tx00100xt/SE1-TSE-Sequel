307
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS2/Centaur/Centaur.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyRunInto";

enum CentText {
  0 CENT_NEW   "New",
  1 CENT_OG    "Original",
};

%{
// info structure
static EntityInfo eiCentaur = {
  EIBT_FLESH, 1000.0f,
  0.0f, 3.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};

#define HIT_DISTANCE   5.0f
#define BOW_FIRE       FLOAT3D(0.0f, 3.75f, -1.3f)
%}


class CCentaur : CEnemyRunInto {
name      "Centaur";
thumbnail "Thumbnails\\Centaur.tbn";

properties:
  1 BOOL m_bRunAttack = FALSE,        // run attack (attack local)
  2 BOOL m_bHornHit = FALSE,          // close attack local
  3 CEntityPointer m_penLastTouched,  // last touched
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,
  6 enum CentText m_ctText "Texture" 'X' = CENT_NEW,      // character
  7 INDEX   m_fgibTexture = TEXTURE_CENTAUR_OG,
  
components:
  0 class   CLASS_BASE           "Classes\\EnemyRunInto.ecl",
  1 model   MODEL_CENTAUR        "ModelsMP\\Enemies\\SS2\\Centaur\\Centaur.mdl",
  2 texture TEXTURE_CENTAUR_NEW  "ModelsMP\\Enemies\\SS2\\Centaur\\CentaurBrown.tex",
  3 texture TEXTURE_CENTAUR_OG   "ModelsMP\\Enemies\\SS2\\Centaur\\Centaur.tex",

  4 class   CLASS_PROJECTILE     "Classes\\Projectile.ecl",
 40 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

  5 model   MODEL_BOW           "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Bow.mdl",
  6 texture TEXTURE_BOW         "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Bow.tex",
  7 model   MODEL_HAIR          "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Hair.mdl",
  8 texture TEXTURE_HAIR        "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Hair.tex",
  9 model   MODEL_QUIVER        "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Quiver.mdl",
 10 model   MODEL_SHOULDERPAD   "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\ShoulderPad.mdl",
 11 model   MODEL_TAIL          "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Tail.mdl",
 12 texture TEXTURE_PROPS       "ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Armour.tex",

 30 model   MODEL_DEBRIS_HEAD           "ModelsMP\\Enemies\\SS2\\Centaur\\Debris\\Hed.mdl",
 32 model   MODEL_DEBRIS_LEGS           "ModelsMP\\Enemies\\SS2\\Centaur\\Debris\\Legs.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsMP\\Enemies\\SS2\\Centaur\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\SS2\\Centaur\\Sounds\\Sight.wav",
 53 sound   SOUND_KICKHORN  "ModelsMP\\Enemies\\SS2\\Centaur\\Sounds\\Melee.wav",
 54 sound   SOUND_IMPACT    "Models\\Enemies\\Werebull\\Sounds\\Impact.wav",
 55 sound   SOUND_DEATH     "ModelsMP\\Enemies\\SS2\\Centaur\\Sounds\\Death.wav",
 56 sound   SOUND_RUN       "ModelsMP\\Enemies\\SS2\\Centaur\\Sounds\\Run.wav",
 57 sound   SOUND_FIRE      "ModelsMP\\Enemies\\SS2\\Centaur\\Sounds\\Fire.wav",
 58 sound   SOUND_WOUND     "ModelsMP\\Enemies\\SS2\\Centaur\\Sounds\\Wound.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A centaur hunted %s down"), (const char *) strPlayerName);
    return str;
  }

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE    );
    PrecacheSound(SOUND_SIGHT   );
    PrecacheSound(SOUND_KICKHORN);
    PrecacheSound(SOUND_IMPACT  );
    PrecacheSound(SOUND_DEATH   );
    PrecacheSound(SOUND_RUN     );
    PrecacheSound(SOUND_FIRE    );
    PrecacheSound(SOUND_WOUND   );

    PrecacheModel(MODEL_DEBRIS_HEAD);
    PrecacheModel(MODEL_DEBRIS_LEGS);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);

    PrecacheClass(CLASS_PROJECTILE, PRT_ARROW);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiCentaur;
  };

  FLOAT GetCrushHealth(void)
  {
    return 30.0f;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataMP\\Messages\\Enemies\\SS2\\Centaur.txt");
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
    // werebull can't harm werebull
    if (!IsOfClass(penInflictor, "Centaur")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
    // if caught in range of a nuke ball
    if (dmtType==DMT_CANNONBALL_EXPLOSION && GetHealth()<=0) {
      // must blow up easier
      m_fBlowUpAmount = m_fBlowUpAmount/2;
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateRunningSound();
    StartModelAnim(CENTAUR_ANIM_WOUND01, 0);
    return CENTAUR_ANIM_WOUND01 ;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (en_vCurrentTranslationAbsolute.Length()>5.0f) {
      iAnim = CENTAUR_ANIM_DEATH_RUN;
    } else {
      iAnim = CENTAUR_ANIM_DEATH_STAND;
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==CENTAUR_ANIM_DEATH_RUN)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.6f;
    }
    else if(GetModelObject()->GetAnim()==CENTAUR_ANIM_DEATH_STAND)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.7f;
    }
    return -1.0f;
  };

  void DeathNotify() {
    ChangeCollisionBoxIndexWhenPossible(CENTAUR_COLLISION_BOX_DEATH);
    SetCollisionFlags(ECF_MODEL);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(CENTAUR_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(CENTAUR_ANIM_WALK2, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void RunningAnim(void) {
    StartModelAnim(CENTAUR_ANIM_RUN2, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(CENTAUR_ANIM_WALK2, AOF_LOOPING|AOF_NORESTART);
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


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_DEBRIS_HEAD, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEGS, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEGS, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
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
          vSpeedRel(1)-=15.0f;
        } else {
          vSpeedRel(1)+=15.0f;
        }
        vSpeedRel(2)=15.0f;

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
    m_soFeet.Set3DParameters(100.0f, 50.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;
    m_soSound.Set3DParameters(100.0f, 50.0f, 1.0f, 1.0f);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {

    // fire projectile
    StartModelAnim(CENTAUR_ANIM_FIRE, 0);
    DeactivateRunningSound();
    autowait(0.45f);
      FLOAT3D vShooting = GetPlacement().pl_PositionVector;
      FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
      FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      
      FLOAT fPitch = 20.0f;
      
      // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, BOW_FIRE(2)-peiTarget->vTargetCenter[1]-1.5f/3.0f, vTarget, 
        vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

      // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, BOW_FIRE, ANGLE3D( fRelativeHdg, fPitch, 0));
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_ARROW;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(FRnd()/3+0.6f);

    return EReturn();


  };
  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    if (CalcDist(m_penEnemy) < HIT_DISTANCE) {
      // attack with horns
      StartModelAnim(CENTAUR_ANIM_MELEE, 0);
      DeactivateRunningSound();
      m_bHornHit = FALSE;
      autowait(0.4f);
      PlaySound(m_soSound, SOUND_KICKHORN, SOF_3D);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHornHit = TRUE; }
      autowait(0.1f);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHornHit = TRUE; }
      autowait(0.1f);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHornHit = TRUE; }
      if (m_bHornHit) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
        FLOAT3D vSpeed;
        GetPitchDirection(AngleDeg(90.0f), vSpeed);
        vSpeed = vSpeed * 7.5f;
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
    SetHealth(130.0f);
    m_fMaxHealth = 130.0f;
    en_fDensity = 2000.0f;

    // set your appearance
    SetModel(MODEL_CENTAUR);
    GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();
    if (m_ctText==CENT_NEW) {
      SetModelMainTexture(TEXTURE_CENTAUR_NEW);
      m_fgibTexture = TEXTURE_CENTAUR_NEW;
    } else {
      SetModelMainTexture(TEXTURE_CENTAUR_OG);
      m_fgibTexture = TEXTURE_CENTAUR_OG;
    }

    AddAttachment(CENTAUR_ATTACHMENT_BOW, MODEL_BOW, TEXTURE_BOW);
      GetModelObject()->StretchModel(FLOAT3D(1.5,1.5,1.5));
    AddAttachment(CENTAUR_ATTACHMENT_HAIR, MODEL_HAIR, TEXTURE_HAIR);
      GetModelObject()->StretchModel(FLOAT3D(1.5,1.5,1.5));
    AddAttachment(CENTAUR_ATTACHMENT_QUIVER, MODEL_QUIVER, TEXTURE_PROPS);
      GetModelObject()->StretchModel(FLOAT3D(1.5,1.5,1.5));
    AddAttachment(CENTAUR_ATTACHMENT_SHOULDERPAD, MODEL_SHOULDERPAD, TEXTURE_PROPS);
      GetModelObject()->StretchModel(FLOAT3D(1.5,1.5,1.5));
    AddAttachment(CENTAUR_ATTACHMENT_TAIL, MODEL_TAIL, TEXTURE_PROPS);
      GetModelObject()->StretchModel(FLOAT3D(1.5,1.5,1.5));

    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 50.0f);
    m_fAttackRunSpeed = FRnd()*3.0f + 16.5f;
    m_fAttackRotateRunInto = AngleDeg(FRnd()*60 + 100.0f);
    m_aAttackRotateSpeed = m_fAttackRotateRunInto;
    m_fCloseRunSpeed = FRnd()*5.0f + 15.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
    // setup attack distances
    m_fAttackDistance = 300.0f;
    m_fCloseDistance = 7.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 1000.0f;
    // damage/explode properties
    m_fBlowUpAmount = 500;
    m_fBodyParts = 6;
	m_fBlowUpSize = 3.0f;
    m_fDamageWounded = 65.0f;
    m_iScore = 3000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    Particles_RunningDust_Prepare(this);

    // continue behavior in base class
    jump CEnemyRunInto::MainLoop();
  };
};

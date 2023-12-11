307
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/Chariot/Chariot.h"
#include "ModelsF/NextEncounter/Enemies/Chariot/Wheel.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyRunInto";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiChariot = {
  EIBT_ROBOT, 500.0f,
  0.0f, 3.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};

#define HIT_DISTANCE   5.0f
#define SHOOT_ANGLE (25.0f)
#define BOW_FIRE       FLOAT3D(0.0f, 2.0f, 0.5f)
%}


class CChariot : CEnemyRunInto {
name      "Chariot";
thumbnail "Thumbnails\\Chariot.tbn";

properties:
  1 BOOL m_bRunAttack = FALSE,        // run attack (attack local)
  2 BOOL m_bHornHit = FALSE,          // close attack local
  3 CEntityPointer m_penLastTouched,  // last touched
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,
  6 BOOL m_bExploded = FALSE,
  7 BOOL m_bStaySoundPlaying = FALSE,
  8 CSoundObject m_soStay,            // for running sound
  9 CSoundObject m_soEngine,            // for running sound
  
components:
  0 class   CLASS_BASE           "Classes\\EnemyRunInto.ecl",
  1 model   MODEL_CHARIOT        "ModelsF\\NextEncounter\\Enemies\\Chariot\\Chariot.mdl",
  3 model   MODEL_WHEEL          "ModelsF\\NextEncounter\\Enemies\\Chariot\\Wheel.mdl",
  2 texture TEXTURE_CHARIOT      "ModelsF\\NextEncounter\\Enemies\\Chariot\\Chariot.tex",

  4 class   CLASS_PROJECTILE     "Classes\\Projectile.ecl",
  5 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\Sight.wav",
 54 sound   SOUND_STOPPED   "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\Stopped.wav",
 55 sound   SOUND_DEATH     "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\Death.wav",
 56 sound   SOUND_RUN       "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\Moving.wav",
 57 sound   SOUND_FIRE      "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\Fire.wav",
 58 sound   SOUND_WOUND     "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\Wound.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s has died like a Roman gladiator"), (const char *) strPlayerName);
    return str;
  }

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE    );
    PrecacheSound(SOUND_SIGHT   );
    PrecacheSound(SOUND_STOPPED );
    PrecacheSound(SOUND_DEATH   );
    PrecacheSound(SOUND_RUN     );
    PrecacheSound(SOUND_FIRE    );
    PrecacheSound(SOUND_WOUND   );

    PrecacheClass(CLASS_PROJECTILE, PRT_ARROW_EXPLOSIVE);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_BOMB);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiChariot;
  };

  // get the attachment
  CModelObject *WheelR(void) {
    CAttachmentModelObject &amo0 = *GetModelObject()->GetAttachmentModel(CHARIOT_ATTACHMENT_WHEELR);
    return &(amo0.amo_moModelObject);
  };
  CModelObject *WheelL(void) {
    CAttachmentModelObject &amo1 = *GetModelObject()->GetAttachmentModel(CHARIOT_ATTACHMENT_WHEELL);
    return &(amo1.amo_moModelObject);
  };

  FLOAT GetCrushHealth(void)
  {
    return 50.0f;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\NE\\Chariot.txt");
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
    if (!IsOfClass(penInflictor, "Chariot")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateRunningSound();
    StartModelAnim(CHARIOT_ANIM_WOUND, 0);
    WheelR()->PlayAnim(WHEEL_ANIM_IDLE, 0);
    WheelL()->PlayAnim(WHEEL_ANIM_IDLE, 0);
    return CHARIOT_ANIM_WOUND;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(CHARIOT_ANIM_DEATH, 0);
    WheelR()->PlayAnim(WHEEL_ANIM_IDLE, 0);
    WheelL()->PlayAnim(WHEEL_ANIM_IDLE, 0);
    DeactivateRunningSound();
    return CHARIOT_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==CHARIOT_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.6f;
    }
    return -1.0f;
  };

  void DeathNotify() {
    ChangeCollisionBoxIndexWhenPossible(CHARIOT_COLLISION_BOX_PART_NAME);
    SetCollisionFlags(ECF_MODEL);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(CHARIOT_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    WheelR()->PlayAnim(WHEEL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    WheelL()->PlayAnim(WHEEL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
    ActivateRevvingSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(CHARIOT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    WheelR()->PlayAnim(WHEEL_ANIM_WALKFOR, AOF_LOOPING|AOF_NORESTART);
    WheelL()->PlayAnim(WHEEL_ANIM_WALKBACK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
    DeactivateRevvingSound();
  };
  void RunningAnim(void) {
    StartModelAnim(CHARIOT_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    WheelR()->PlayAnim(WHEEL_ANIM_RUNFOR, AOF_LOOPING|AOF_NORESTART);
    WheelL()->PlayAnim(WHEEL_ANIM_RUNBACK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
    DeactivateRevvingSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(CHARIOT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    WheelR()->PlayAnim(WHEEL_ANIM_WALKFOR, AOF_LOOPING|AOF_NORESTART);
    WheelL()->PlayAnim(WHEEL_ANIM_WALKBACK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
    ActivateRevvingSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soEngine, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soEngine, SOUND_SIGHT, SOF_3D);
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

  // running sounds
  void ActivateRevvingSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soStay, SOUND_STOPPED, SOF_3D|SOF_LOOP);
      m_bStaySoundPlaying = TRUE;
    }
  }
  void DeactivateRevvingSound(void)
  {
    m_soStay.Stop();
    m_bStaySoundPlaying = FALSE;
  }


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
    return (m_fMassKicked > 700.0f);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soFeet.Set3DParameters(500.0f, 50.0f, 1.0f, 1.0f);
    m_soEngine.Set3DParameters(500.0f, 50.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;
    m_soStay.Set3DParameters(250.0f, 50.0f, 1.0f, 1.0f);
    m_soSound.Set3DParameters(100.0f, 50.0f, 1.0f, 1.0f);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateRunningSound();
    ActivateRevvingSound();

    StartModelAnim(CHARIOT_ANIM_ATTACK, 0);
    WheelR()->PlayAnim(WHEEL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    WheelL()->PlayAnim(WHEEL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);

    autowait(0.55f);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);

    // fire projectile

	  FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      CalculateAngularLaunchParams(GetPlacement().pl_PositionVector, BOW_FIRE(2)-1.5f, m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0), SHOOT_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
	  
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, BOW_FIRE, ANGLE3D(-2, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_ARROW_EXPLOSIVE;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    MaybeSwitchToAnotherPlayer();

    autowait(0.45f);

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    FLOAT3D vDir = PlayerDestinationPos();
    vDir = (vDir - GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed;
    vDir(2) = -10.0f;
    SetDesiredTranslation(vDir);

    autowait(0.27f);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.9f, 0);
    m_iChargeHitAnimation = CHARIOT_ANIM_RUN;
    m_fChargeHitDamage = 15.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 20.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.2f);

    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    DeactivateRunningSound();
    DeactivateRevvingSound();
    
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

    RemoveAttachmentFromModel(*GetModelObject(), CHARIOT_ATTACHMENT_WHEELR);
    RemoveAttachmentFromModel(*GetModelObject(), CHARIOT_ATTACHMENT_WHEELL);

    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);

    // spawn dust effect
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1,1,1);
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_BOMB;
    CPlacement3D plSmoke=plFX;
    plSmoke.pl_PositionVector+=FLOAT3D(0,0.35f*ese.vStretch(2),0);
    CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);

	//wheels as debris

    Debris_Begin(EIBT_FLESH, DPT_AFTERBURNER, BET_NONE, 1.0f, 1.0f, 1.0f, 0.0f, 20.0f);
    Debris_Spawn(this, this, MODEL_WHEEL, TEXTURE_CHARIOT, 0, 0, 0, 0, 1.0f, 
	             FLOAT3D(FRnd()*0.8f+0.2f, FRnd()*0.8f+0.2f, FRnd()*0.8f+0.2f));
    Debris_Spawn(this, this, MODEL_WHEEL, TEXTURE_CHARIOT, 0, 0, 0, 0, 1.0f, 
	             FLOAT3D(FRnd()*0.8f-0.2f, FRnd()*0.8f+0.2f, FRnd()*0.8f+0.2f));

    //fly into the air
     FLOAT3D vSpeed;
     GetPitchDirection(AngleDeg(90.0f), vSpeed);
     vSpeed = vSpeed * 100.0f;
     KickEntity(this, vSpeed);

    autowait(GetModelObject()->GetAnimLength(CHARIOT_ANIM_DEATH)-2.3f);
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
    SetHealth(120.0f);
    m_fMaxHealth = 120.0f;
    en_fDensity = 2000.0f;
    m_sptType = SPT_ELECTRICITY_SPARKS;
    en_tmMaxHoldBreath = 10.0f;

    // set your appearance
    SetModel(MODEL_CHARIOT);
    SetModelMainTexture(TEXTURE_CHARIOT);
    AddAttachment(CHARIOT_ATTACHMENT_WHEELR, MODEL_WHEEL, TEXTURE_CHARIOT);
    AddAttachment(CHARIOT_ATTACHMENT_WHEELL, MODEL_WHEEL, TEXTURE_CHARIOT);
    ModelChangeNotify();

    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 4.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 90.0f);
    m_fAttackRunSpeed = FRnd()*3.0f + 18.0f;
    m_fAttackRotateRunInto = AngleDeg(FRnd()*60 + 100.0f);
    m_aAttackRotateSpeed = m_fAttackRotateRunInto;
    m_fCloseRunSpeed = FRnd()*5.0f + 18.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseDistance = 15.0f;
    m_fStopDistance = 5.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 0.0f;
    m_fIgnoreRange = 1000.0f;
    // damage/explode properties
    m_fBlowUpAmount = 5000000;
    m_fBodyParts = 12;
	m_fBlowUpSize = 3.0f;
    m_fDamageWounded = 50.0f;
    m_iScore = 1500;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    Particles_RunningDust_Prepare(this);

    // continue behavior in base class
    jump CEnemyRunInto::MainLoop();
  };
};

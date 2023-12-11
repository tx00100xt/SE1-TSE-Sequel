323
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/DibDib/DibDib.h"
%}

uses "EntitiesMP/EnemyBase";

%{
// info structure
static EntityInfo eiDibDib = {
  EIBT_WATER, 9000.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};

#define HIT_GROUND  4.0f
%}


class CDibDib : CEnemyBase {
name      "DibDib";
thumbnail "Thumbnails\\DibDib.tbn";

properties:

  6 CSoundObject m_soFeet,
  5 BOOL m_bRunSoundPlaying = FALSE,

  10 CEntityPointer m_penTemplate0 "Item template 0",
  11 CEntityPointer m_penTemplate1 "Item template 1",
  12 CEntityPointer m_penTemplate2 "Item template 2",
  13 CEntityPointer m_penTemplate3 "Item template 3",
  14 CEntityPointer m_penTemplate4 "Item template 4",

components:
  0 class   CLASS_BASE        "Classes\\EnemyBase.ecl",
  1 model   MODEL_DIBDIB      "ModelsF\\NextEncounter\\Enemies\\DibDib\\DibDib.mdl",
  3 texture TEXTURE_DIBDIB    "ModelsF\\NextEncounter\\Enemies\\DibDib\\DibDib.tex",
  7 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\NextEncounter\\Enemies\\DibDib\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\NextEncounter\\Enemies\\DibDib\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\NextEncounter\\Enemies\\DibDib\\Sounds\\Wound.wav",
 53 sound   SOUND_ATTACK    "ModelsF\\NextEncounter\\Enemies\\DibDib\\Sounds\\Attack.wav",
 55 sound   SOUND_DEATH     "ModelsF\\NextEncounter\\Enemies\\DibDib\\Sounds\\Death.wav",
 56 sound   SOUND_RUN       "ModelsF\\NextEncounter\\Enemies\\DibDib\\Sounds\\Run.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s got killed by one of the lamest enemies in the game"), (const char *) strPlayerName);
    return str;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_ATTACK );
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_RUN);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
      return &eiDibDib;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // eyeman can't harm eyeman
    if (!IsOfClass(penInflictor, "DibDib")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // choose an item to spawn
    INDEX ctTemplates = 0;
    if (m_penTemplate0!=NULL) { ctTemplates++; }
    if (m_penTemplate1!=NULL) { ctTemplates++; }
    if (m_penTemplate2!=NULL) { ctTemplates++; }
    if (m_penTemplate3!=NULL) { ctTemplates++; }
    if (m_penTemplate4!=NULL) { ctTemplates++; }
    if (ctTemplates==0) {
      return;
    }
    INDEX iTemplate = IRnd()%ctTemplates;
    CEntity *penItem = (&m_penTemplate0)[iTemplate];

    // if the target doesn't exist, or is destroyed
    if (penItem==NULL || (penItem->GetFlags()&ENF_DELETED)) {
      // do nothing
      return;
    }

    // if DibDib dies
    if( GetHealth() <= 1.0) {
      // do nothing
      return;
    }
    
    // don't spawn items when burning:
    if(dmtType==DMT_BURNING)
    {
      // do nothing
      return;
    }

    CEntity *penSpawned = GetWorld()->CopyEntityInWorld( *penItem,
      CPlacement3D(FLOAT3D(-32000.0f+FRnd()*200.0f, -32000.0f+FRnd()*200.0f, 0), ANGLE3D(0, 0, 0)) );

    // teleport back
    CPlacement3D pl = GetPlacement();
    pl.pl_PositionVector += GetRotationMatrix().GetColumn(2)*1.5f;  // a bit up in the air
    penSpawned->Teleport(pl, FALSE);
  };

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\NE\\DibDib.txt");
    return fnm;
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    StartModelAnim(DIBDIB_ANIM_WOUND, 0);
    DeactivateRunningSound();
    return DIBDIB_ANIM_WOUND;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(DIBDIB_ANIM_DEATH, 0);
    DeactivateRunningSound();
    return DIBDIB_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==DIBDIB_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.48f;
    }
    return -1.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
      StartModelAnim(DIBDIB_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void WalkingAnim(void) {
      StartModelAnim(DIBDIB_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RunningAnim(void) {
      StartModelAnim(DIBDIB_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
      StartModelAnim(DIBDIB_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
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

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  Hit(EVoid) : CEnemyBase::Hit {
    if (CalcDist(m_penEnemy) > HIT_GROUND) {
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
      return EReturn();
    }
    StartModelAnim(DIBDIB_ANIM_ATTACK, 0);
    StopMoving();
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
    // damage enemy
    autowait(0.55f);
    // damage enemy
    if (CalcDist(m_penEnemy) < HIT_GROUND) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 5.0f, FLOAT3D(0, 0, 0), vDirection);
      // spawn blood cloud
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_BLOODEXPLODE;
      eSpawnEffect.vStretch = FLOAT3D(1,1,1);
      CPlacement3D plOne = GetPlacement();
      GetEntityPointRatio(
        FLOAT3D(Lerp(-0.2f, +0.2f, FRnd()), Lerp(-0.2f, +0.2f, FRnd()), -1.0f),
        plOne.pl_PositionVector);
      CEntityPointer penBloodCloud = CreateEntity( plOne, CLASS_BASIC_EFFECT);
      penBloodCloud->Initialize( eSpawnEffect);
    }
    autowait(0.8f);

    StandingAnim();
    return EReturn();
  };

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    SetHealth(60.0f);
    m_fMaxHealth = 60.0f;
    en_fDensity = 20000.0f;

    // set your appearance
    SetModel(MODEL_DIBDIB);
    SetModelMainTexture(TEXTURE_DIBDIB);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 6.0f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd()*3.0f + 6.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 6.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 4.0f;
    m_fStopDistance = 3.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 7000000.0f;
    m_fBodyParts = 4;
    m_fDamageWounded = 10.0f;
    m_iScore = 10000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    // set stretch factors for height and width
    GetModelObject()->StretchModel(FLOAT3D(0.6f, 0.6f, 0.6f));
     ModelChangeNotify();
    m_soFeet.Set3DParameters(80.0f, 5.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

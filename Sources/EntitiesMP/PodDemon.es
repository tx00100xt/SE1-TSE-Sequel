336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/Demon/Demon.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";


%{
#define REMINDER_DEATTACH_FIREBALL 666
#define CLOSE_ATTACK_RANGE 10.0f
#define DEMON_STRETCH 1.25f
FLOAT3D vLarvaLaunchPos = (FLOAT3D(0.03f, 1.3f, 0.075f)*DEMON_STRETCH);
static float _tmLastStandingAnim =0.0f;  

// info structure
static EntityInfo eiPodDemon = {
  EIBT_FLESH, 1600.0f,
  0.0f, 2.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
%}

class CPodDemon : CEnemyBase {
name      "PodDemon";
thumbnail "Thumbnails\\Demon.tbn";

properties:
  2 INDEX m_iCounter = 0,
  3 CEntityPointer m_penFireFX,
  4 BOOL m_bInvisible "Invisible" 'I'=TRUE,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_DEMON         "ModelsMP\\Enemies\\Demon\\Demon.mdl",
 11 texture TEXTURE_DEMON       "ModelsMP\\Enemies\\Demon\\Demon.tex",

 // ************** SOUNDS **************
 50 sound   SOUND_IDLE      "Fe Sounds\\CutSequences\\SpaceShip\\Signal.wav",
 51 sound   SOUND_SIGHT     "Fe Sounds\\CutSequences\\MorphRoom\\MorphAmon.wav",
 52 sound   SOUND_WOUND     "ModelsMP\\Enemies\\Demon\\Sounds\\Wound.wav",
 55 sound   SOUND_DEATH     "ModelsMP\\Enemies\\Demon\\Sounds\\Death.wav",
 57 sound   SOUND_CAST      "Fe Sounds\\Misc\\SmallPyramid.wav",

functions:

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("Exotech larva reduced %s to pulp."), strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmDemon, "DataMP\\Messages\\Enemies\\Demon.txt");
    return fnmDemon;
  }
  
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_CAST);
    PrecacheModel(MODEL_DEMON);
    PrecacheTexture(TEXTURE_DEMON);
    PrecacheClass(CLASS_PROJECTILE, PRT_LARVA_TAIL_PROJECTILE);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiPodDemon;
  };

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {if (m_bInvisible) {
      pes->es_strName+=" Invisible";
    }
    return TRUE;
	}
  /* Adjust model shading parameters if needed. */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    // no shadows for invisibles
    if (m_bInvisible) {
      colAmbient = C_WHITE;
      return FALSE;
    } else {
      return CEnemyBase::AdjustShadingParameters(vLightDirection, colLight, colAmbient);
    }
  }

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
  }

  /*FLOAT GetCrushHealth(void)
  {
    if (m_bcType == BT_BIG) {
      return 100.0f;
    }
    return 0.0f;
  }*/

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // take less damage from heavy bullets (e.g. sniper)
    if(dmtType==DMT_BULLET && fDamageAmmount>100.0f)
    {
      fDamageAmmount*=0.5f;
    }

    // can't harm own class
    if (!IsOfClass(penInflictor, "PodDemon")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    StartModelAnim(DEMON_ANIM_WOUND, 0);
    return DEMON_ANIM_WOUND;
  };

  // death
  INDEX AnimForDeath(void) {
    if( m_penFireFX != NULL)
    {
      m_penFireFX->SendEvent(EStop());
      m_penFireFX = NULL;
    }

    StartModelAnim(DEMON_ANIM_DEATHFORWARD, 0);
    return DEMON_ANIM_DEATHFORWARD;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch)
  {
    vStretch=FLOAT3D(1,1,2)*3.0f;
    return 1.1f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(DEMON_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    //_tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(DEMON_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
    /*if(_pTimer->CurrentTick()>=_tmLastStandingAnim-_pTimer->TickQuantum &&
       _pTimer->CurrentTick()<=_tmLastStandingAnim+_pTimer->TickQuantum)
    {
      BREAKPOINT;
    }*/
    RunningAnim();
  };

  void RunningAnim(void) {
    StartModelAnim(DEMON_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    StartModelAnim(DEMON_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
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


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(160.0f, 50.0f, 2.0f, 1.0f);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire
  {
    
    // SetDesiredTranslation???
    if (m_fMoveSpeed>0.0f) {
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, -m_fMoveSpeed));
    }
    
    //StartModelAnim(DEMON_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    StartModelAnim(DEMON_ANIM_ATTACK, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_CAST, SOF_3D);

    autowait(1.0f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vLarvaLaunchPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    m_penFireFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penFireFX->Initialize(ese);

    autowait(1.4f);
    MaybeSwitchToAnotherPlayer();

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_LARVA_TAIL_PROJECTILE, vLarvaLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_LARVA_TAIL_PROJECTILE, vLarvaLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
      
    autowait(1.0f);
    
    return EReturn();
  }

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);

    en_fDensity = 1100.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS_NO_BLOOD;

    // set your appearance
    SetModel(MODEL_DEMON);
    if (m_bInvisible) {
      GetModelObject()->mo_colBlendColor = C_WHITE|0x05;
    }
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()/1.0f + 1.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd()/1.0f + 1.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    m_fAttackRunSpeed = FRnd()/1.0f + 9.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
    // setup attack distances
    m_fAttackDistance = 2000.0f;
    m_fCloseDistance = 1.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 800.0f;
    m_fStopDistance = 5.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    SetHealth(700.0f);
    m_fMaxHealth = GetHealth();
    SetModelMainTexture(TEXTURE_DEMON);
    m_fBlowUpAmount = 1.0f;
    m_fBodyParts = 0;
    m_fDamageWounded = 1000.0f;
    m_iScore = 10000;
    m_fLockOnEnemyTime = 3.0f;

    // set stretch factor
    GetModelObject()->StretchModel(FLOAT3D(2.1f, 2.1f, 2.1f));
    ModelChangeNotify();
    
    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

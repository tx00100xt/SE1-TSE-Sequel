336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Panda/Panda.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

%{

#define PANDA_MAX_TA 10
FLOAT PandaTriggerArray[PANDA_MAX_TA] = { 0.9f, 0.8f, 0.7f, 0.6f, 0.5f,
                                         0.4f, 0.3f, 0.2f, 0.1f, 0.05f }; 

// info structure
static EntityInfo eiPanda = {
  EIBT_FLESH, 10000.0f,
  0.0f, 8.0f, 0.0f,     // source (eyes)
  0.0f, 8.0f, 0.0f,     // target (body)
};
%}

class CPanda : CEnemyBase {
name      "Panda";
thumbnail "Thumbnails\\Panda.tbn";

properties:
  2 INDEX m_iCounter = 0,
  
 20 CEntityPointer m_penTrigger01 "Health 90% Trigger" ,
 21 CEntityPointer m_penTrigger02 "Health 80% Trigger" ,
 22 CEntityPointer m_penTrigger03 "Health 70% Trigger" ,
 23 CEntityPointer m_penTrigger04 "Health 60% Trigger" ,
 24 CEntityPointer m_penTrigger05 "Health 50% Trigger" ,
 25 CEntityPointer m_penTrigger06 "Health 40% Trigger" ,
 26 CEntityPointer m_penTrigger07 "Health 30% Trigger" ,
 27 CEntityPointer m_penTrigger08 "Health 20% Trigger" ,
 28 CEntityPointer m_penTrigger09 "Health 10% Trigger" ,
 29 CEntityPointer m_penTrigger10 "Health 05% Trigger" ,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_PANDA           "ModelsF\\Enemies\\Panda\\Panda.mdl",
 11 texture TEXTURE_PANDA         "ModelsF\\Enemies\\Panda\\Demonpanda_Diffuse1.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\Enemies\\Panda\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\Enemies\\Panda\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\Enemies\\Panda\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsF\\Enemies\\Panda\\Sounds\\AttackThrow.wav",
 54 sound   SOUND_KICK      "ModelsF\\Enemies\\Panda\\Sounds\\AttackMelee.wav",
 55 sound   SOUND_DEATH     "ModelsF\\Enemies\\Panda\\Sounds\\Death.wav",
 57 sound   SOUND_ANGER     "ModelsF\\Enemies\\Panda\\Sounds\\Anger.wav",
 58 sound   SOUND_LEAP      "ModelsF\\Enemies\\Panda\\Sounds\\AttackLeap.wav",


functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A mutan panda has made %s extinct"), (const char *) strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmPanda, "DataF\\Messages\\Enemies\\Panda.txt");
    return fnmPanda;
  }

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_ANGER);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_KICK);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_LEAP);
    PrecacheModel(MODEL_PANDA);
    PrecacheTexture(TEXTURE_PANDA);
    PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_PROJECTILE);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiPanda;
  };

  void ShakeItBaby(FLOAT tmShaketime, FLOAT fPower)
  {
    CWorldSettingsController *pwsc = GetWSC(this);
    if (pwsc!=NULL) {
      pwsc->m_tmShakeStarted = tmShaketime;
      pwsc->m_vShakePos = GetPlacement().pl_PositionVector;
      pwsc->m_fShakeFalloff = 400.0f;
      pwsc->m_fShakeFade = 3.0f;

      pwsc->m_fShakeIntensityZ = 0.0f;
      pwsc->m_tmShakeFrequencyZ = 5.0f;
      pwsc->m_fShakeIntensityY = 0.1f*fPower;
      pwsc->m_tmShakeFrequencyY = 5.0f;
      pwsc->m_fShakeIntensityB = 2.5f*fPower;
      pwsc->m_tmShakeFrequencyB = 7.2f;

      pwsc->m_bShakeFadeIn = FALSE;
    }
  }

  FLOAT GetCrushHealth(void)
  {
    return 300.0f;
  }

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
	}

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    FLOAT fOldHealth = GetHealth();
    CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    FLOAT fNewHealth = GetHealth();

    CEntityPointer *penTrigger = &m_penTrigger01;
    // see if any triggers have to be set
    for (INDEX i=0; i<PANDA_MAX_TA; i++) {
      FLOAT fHealth = PandaTriggerArray[i]*m_fMaxHealth;
      // triggers
      if (fHealth<=fOldHealth && fHealth>fNewHealth)
      {
        if (&*penTrigger[i]) {
          SendToTarget(&*penTrigger[i], EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        }
      }
    }

    // boss cannot be telefragged
    if(dmtType==DMT_TELEPORT)
    {
      return;
    }
    
    // cannonballs inflict less damage then the default
    if((dmtType==DMT_CANNONBALL || dmtType==DMT_CANNONBALL_EXPLOSION) && (fDamageAmmount>750.0f))
    {
      fDamageAmmount *= 0.25f;
    }
    
    // resistant to explosions
    if(dmtType==DMT_EXPLOSION)
    {
      fDamageAmmount= fDamageAmmount*0.5f;
    }

    // _ can't harm _
    if (!IsOfClass(penInflictor, "Panda")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // bosses don't darken when burning
    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    if(GetHealth() <= m_fMaxHealth/2) {
      iAnim = PANDA_ANIM_ANGER;
    } else {
      iAnim = PANDA_ANIM_WOUND3;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(PANDA_ANIM_DEATH, 0);
    return PANDA_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==PANDA_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(PANDA_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(PANDA_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
      StartModelAnim(PANDA_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
    WalkingAnim();
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void WoundSound(void) {
    if(GetHealth() <= m_fMaxHealth/2) {
      PlaySound(m_soSound, SOUND_ANGER, SOF_3D);
    } else {
      PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
    }
   };
  void DeathSound(void) {
      PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(400.0f, 50.0f, 2.0f, 1.0f);
  };

procedures:
/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    
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
    autowait(1.6f);

    ShakeItBaby(_pTimer->CurrentTick(), 4.0f);

    // spawn dust effect
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1,1,2)*15.0f;
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_DUST_FALL;
    CPlacement3D plSmoke=plFX;
    plSmoke.pl_PositionVector+=FLOAT3D(0,0.35f*ese.vStretch(2),0);
    CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);

    autowait(GetModelObject()->GetAnimLength(PANDA_ANIM_DEATH)-2.5f);
    return EEnd();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire
  {
      if( GetHealth() > m_fMaxHealth/2)
      {
          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          StartModelAnim(PANDA_ANIM_ATTACKTHROW, 0);   
          autowait(0.43f);
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(25, 0, 0));
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(-25, 0, 0));
      }
      
      if( GetHealth() <= m_fMaxHealth/2)
      {
          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          StartModelAnim(PANDA_ANIM_ATTACKTHROW, 0); 
          autowait(0.43f); 
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(25, 0, 0));
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(-25, 0, 0));
          autowait(0.57f);
          MaybeSwitchToAnotherPlayer();
          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          StartModelAnim(PANDA_ANIM_ATTACKTHROW, 0); 
          autowait(0.43f); 
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(25, 0, 0));
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(-25, 0, 0));
          autowait(0.57f);
          MaybeSwitchToAnotherPlayer();
          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          StartModelAnim(PANDA_ANIM_ATTACKTHROW, 0); 
          autowait(0.43f); 
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(25, 0, 0));
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 8.0f, 0.0f), ANGLE3D(-25, 0, 0));
      }
    MaybeSwitchToAnotherPlayer();
    autowait(0.57f);
    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    // hit
    if (CalcDist(m_penEnemy) < 20.0f) {
      jump Slap();

    // jump
    } else if ((CalcDist(m_penEnemy) < 35.0f) & (GetHealth() <= m_fMaxHealth/2)) {
      jump JumpOnEnemy();
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    return EReturn();
  };

  // hit enemy
  Slap(EVoid) {
    // close attack
    StartModelAnim(PANDA_ANIM_ATTACKMELEE, 0);
    autowait(0.43f);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 80.0f, FLOAT3D(0, 0, 0), vDirection);
    }
    autowait(0.6f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

  // jump on enemy
  JumpOnEnemy(EVoid) {
    StartModelAnim(PANDA_ANIM_ATTACKLEAP, 0);

    // jump
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*2.0f;
    vDir(2) = 2.5f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_LEAP, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    m_iChargeHitAnimation = PANDA_ANIM_ATTACKLEAP;
    m_fChargeHitDamage = 50.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 15.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.3f);
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
    m_sptType = SPT_BLOOD;

    // this is a boss
    m_bBoss = TRUE;

    en_fDensity = 1100.0f;
    // set your appearance
    SetModel(MODEL_PANDA);
    SetModelMainTexture(TEXTURE_PANDA);
      GetModelObject()->StretchModel(FLOAT3D(-1.0f, 1.0f, -1.0f));
    StandingAnim();
    // setup moving speed
    m_fAttackRunSpeed = 11.0f;//8
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
    m_fWalkSpeed = FRnd()*2 + 7.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd() + 25.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 1000.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_fStopDistance = 20.0f;
    m_fCloseDistance = 35.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
    m_fDamageWounded = 3000.0f;
    m_fBlowUpAmount = 100000000.0f;//500
      SetHealth(25000.0f);
      m_iScore = 1000000;//500
    
    m_fMaxHealth = GetHealth();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

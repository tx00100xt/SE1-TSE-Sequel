320
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS3/WitchBride/WitchBrideNoTent.h"
#include "Models/Enemies/Elementals/Twister.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Twister";
uses "EntitiesMP/SummonerMarker";

event EWbTeleport {
  FLOAT fWait, 
};

%{
// info structure
static EntityInfo eiWB = {
 EIBT_BONES, 25000.0f,
 0.0f, 1.9f, 0.0f,    // source (eyes)
 0.0f, 1.9f, 0.0f,    // target (body)
};

#define FIRE_AIR      FLOAT3D(0.0f, 3.0f, 0.0f)
#define BOMB_ANGLE (30.0f)

#define WB_MAX_TA 10
FLOAT wbTriggerArray[WB_MAX_TA] = { 0.9f, 0.8f, 0.7f, 0.6f, 0.5f,
                                         0.4f, 0.3f, 0.2f, 0.1f, 0.05f };
%}


class CWitchBride : CEnemyFly {
name      "WitchBride";
thumbnail "Thumbnails\\WitchBride.tbn";

properties:

  1 BOOL m_bExploded = FALSE,

  2 BOOL  m_bInvulnerable = FALSE, // can we be hurt?
  3 BOOL  m_bShouldTeleport = FALSE, // are we allowed to teleport?
  4 FLOAT m_fImmaterialDuration "Teleport Immaterial Duration" = 3.0f, // how long to stay immaterial
  5 FLOAT m_fCorporealDuration "Teleport Corporeal Duration" = 5.0f, // how long to stay material
  6 FLOAT m_tmMaterializationTime = 0.0f, // when we materialized

  7 CEntityPointer m_penTeleportMarker "Teleport marker",
  8 INDEX m_iTeleportMarkers = 0, // number of teleport markers
  9 FLOAT m_fTeleportWaitTime = 0.0f, // internal
  10 BOOL  m_bDying = FALSE,  // set when dying

  11 CSoundObject m_soFire1,
  12 CSoundObject m_soFire2,
  13 CSoundObject m_soTeleport,
  14 FLOAT m_tmParticlesDisappearStart=-1e6,

  15 BOOL m_bWobbleSound = FALSE,
  16 CSoundObject m_soBackground,
  17 CSoundObject m_soVoice,
  
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
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_WB       "ModelsMP\\Enemies\\SS3\\WitchBride\\WitchBrideNoTent.mdl",
  2 texture TEXTURE_WB     "ModelsMP\\Enemies\\SS3\\WitchBride\\WitchBrideGreen.tex",
  3 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
  5 class   CLASS_TWISTER       "Classes\\Twister.ecl",
 
  6 model   MODEL_TENTACLES       "ModelsMP\\Enemies\\SS2\\SpiderMech\\SpiderLegs.mdl",
  7 texture TEXTURE_TENTACLES       "ModelsMP\\Enemies\\SS2\\SpiderMech\\LegsGreen.tex",

// ************** SOUNDS **************
 50 sound   SOUND_ALIVE          "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\Alive.wav",
 52 sound   SOUND_DEATH          "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\Death.wav",
 53 sound   SOUND_FIREBALLS      "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\FireBalls.wav",
 54 sound   SOUND_FIRELAVA       "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\FireLava.wav",
 55 sound   SOUND_FIREWIND       "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\FireWind.wav",
 56 sound   SOUND_SIGHT          "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\Sight.wav",
 57 sound   SOUND_CHANTBALLS       "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\ChantBalls.wav",
 58 sound   SOUND_CHANTLAVA        "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\ChantLava.wav",
 59 sound   SOUND_CHANTWIND        "ModelsMP\\Enemies\\SS3\\WitchBride\\Sounds\\ChantWind.wav",

107 sound  SOUND_MATERIALIZE "ModelsMP\\Enemies\\Summoner\\Sounds\\Materialize.wav",
109 sound  SOUND_TELEPORT    "ModelsMP\\Enemies\\Summoner\\Sounds\\Teleport.wav",

functions:
  void Read_t( CTStream *istr) // throw char *
  { 
    CEnemyBase::Read_t(istr);
  }
  
  void Write_t( CTStream *istr) // throw char *
  { 
    CEnemyBase::Write_t(istr);
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
   if( slPropertyOffset == offsetof(CWitchBride, m_penTeleportMarker))
    {
      if (IsDerivedFromClass(penTarget, "SummonerMarker")) {
        return TRUE;
      } else {
        return FALSE;
      }
    }
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);    
  }

  BOOL DoSafetyChecks(void) {
    if (m_penTeleportMarker==NULL) {
        WarningMessage( "No valid Teleport Marker for Witch Bride! Destroying Witch Bride...");
        return FALSE;
    }
    return TRUE;
  }

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s married a Corpse-Bride"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm,  "DataMP\\Messages\\Enemies\\SS3\\WitchBride.txt");
    return fnm;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheModel(MODEL_WB);
    PrecacheTexture(TEXTURE_WB);
    PrecacheSound(SOUND_ALIVE );
    PrecacheSound(SOUND_CHANTBALLS);
    PrecacheSound(SOUND_CHANTLAVA);
    PrecacheSound(SOUND_CHANTWIND);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_FIREBALLS );
    PrecacheSound(SOUND_FIRELAVA );
    PrecacheSound(SOUND_FIREWIND);
    PrecacheSound(SOUND_SIGHT );
    PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_PROJECTILE);
    PrecacheClass(CLASS_PROJECTILE, PRT_LAVAMAN_BIG_BOMB);
    PrecacheClass(CLASS_TWISTER);
    PrecacheModel(MODEL_TENTACLES);
    PrecacheTexture(TEXTURE_TENTACLES);

    PrecacheSound(SOUND_MATERIALIZE);
    PrecacheSound(SOUND_TELEPORT );
  };

  /* Entity info */
  void *GetEntityInfo(void) {
      return &eiWB;
  };

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
    for (INDEX i=0; i<WB_MAX_TA; i++) {
      FLOAT fHealth = wbTriggerArray[i]*m_fMaxHealth;
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
    if(dmtType==DMT_CANNONBALL || DMT_CANNONBALL_EXPLOSION)
    {
      fDamageAmmount *= 0.25f;
    }
    
    // resistant to explosions
    if(dmtType==DMT_EXPLOSION)
    {
      fDamageAmmount= fDamageAmmount*0.5f;
    }
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable) {
      return;
    }

    // woman can't harm woman
    if (!IsOfClass(penInflictor, "WitchBride")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // bosses don't darken when burning
    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };

  void RenderParticles(void)
  {
    FLOAT tmNow = _pTimer->CurrentTick();
    if( tmNow>m_tmParticlesDisappearStart && tmNow<m_tmParticlesDisappearStart+1.0f)
    {
      Particles_SummonerDisappear(this, m_tmParticlesDisappearStart);
    }
   }

  void DisappearEffect(void)
  {
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1.5,1.5,1.5);
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_DUST_FALL;
    for( INDEX iSmoke=0; iSmoke<3; iSmoke++)
    {
      CPlacement3D plSmoke=plFX;
      plSmoke.pl_PositionVector+=FLOAT3D(0,iSmoke*1+1.0f,0);
      CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
      penFX->Initialize(ese);
    }

    /*
    // growing swirl
    ese.betType = BET_DISAPPEAR_DUST;
    penFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);
    */
  }

  void SpawnTeleportEffect(void)
  {
    ESpawnEffect ese;
    ese.colMuliplier = C_lMAGENTA|CT_OPAQUE;
    ese.vStretch = FLOAT3D(6,6,6);
    ese.vNormal = FLOAT3D(0,3,0);

    // explosion debris
    ese.betType = BET_EXPLOSION_DEBRIS;
    CPlacement3D plFX=GetPlacement();
    CEntityPointer penFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);
    ese.colMuliplier = C_MAGENTA|CT_OPAQUE;
    CEntityPointer penFX2 = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX2->Initialize(ese);
    ese.colMuliplier = C_lCYAN|CT_OPAQUE;
    CEntityPointer penFX3 = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX3->Initialize(ese);
    ese.betType = BET_CANNON;
    ese.colMuliplier = C_CYAN|CT_OPAQUE;
    CEntityPointer penFX4 = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX4->Initialize(ese);

    // explosion smoke
    /*
    ese.betType = BET_EXPLOSION_SMOKE;
    penFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);
    */
   }

  void LaunchTwister(FLOAT3D vEnemyOffset)
  {
    // calculate parameters for predicted angular launch curve
    FLOAT3D vFirePos = FIRE_AIR*GetRotationMatrix();
    FLOAT3D vShooting = GetPlacement().pl_PositionVector + vFirePos;
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    
    // shoot in front of the enemy
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    
    // adjust target position
    vTarget += vEnemyOffset;

    CPlacement3D pl;
    CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-6.0f/3.0f,
      vTarget, FLOAT3D(0.0f, 0.0f, 0.0f), 0.0f, fLaunchSpeed, fRelativeHdg);
    
    PrepareFreeFlyingProjectile(pl, vTarget, vFirePos, ANGLE3D( fRelativeHdg, 0.0f, 0.0f));
    
    ETwister et;
    CEntityPointer penTwister = CreateEntity(pl, CLASS_TWISTER);
    et.penOwner = this;
//    et.fSize = FRnd()*15.0f+5.0f;
    et.fSize = FRnd()*15.0f;
    et.fDuration = 7.5f + FRnd()+5.0f;
    et.sgnSpinDir = (INDEX)(Sgn(FRnd()-0.5f));
    et.bGrow = TRUE;
    et.bMovingAllowed=TRUE;
    penTwister->Initialize(et);
    
    ((CMovableEntity &)*penTwister).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -fLaunchSpeed/1.5), (CMovableEntity*)(CEntity*)this);
  }

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = WITCHBRIDENOTENT_ANIM_DEATH;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    vStretch=FLOAT3D(1,1,2)*1.0f;
    return 0.6f;
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(WITCHBRIDENOTENT_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
	WobbleSoundOff();
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(WITCHBRIDENOTENT_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
	  WobbleSoundOn();
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(WITCHBRIDENOTENT_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
	  WobbleSoundOn();
    }
  };

  // virtual sound functions
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(300.0f, 50.0f, 2.0f, 1.0f);
    m_soBackground.Set3DParameters(200.0f, 50.0f, 2.0f, 1.0f);
    m_soVoice.Set3DParameters(300.0f, 50.0f, 2.0f, 1.0f);
  };

  void WobbleSoundOn(void) {
    if (!m_bWobbleSound) {
      m_bWobbleSound = TRUE;
      PlaySound(m_soBackground, SOUND_ALIVE, SOF_3D|SOF_LOOP);
    }
  }
  void WobbleSoundOff(void) {
    if (m_bWobbleSound) {
      m_soBackground.Stop();
      m_bWobbleSound = FALSE;
    }
  }


/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  // spawn body parts
  void Explode(void) {
    if (!m_bExploded) {
      m_bExploded = TRUE;

      // inflict damage
      FLOAT3D vSource;
      GetEntityInfoPosition(this, eiWB.vTargetCenter, vSource);
      InflictDirectDamage(this, this, DMT_EXPLOSION, 500000.0f, vSource, -en_vGravityDir);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_BOMB;
      eSpawnEffect.vStretch = FLOAT3D(6.0f,6.0f,6.0f);
      penExplosion->Initialize(eSpawnEffect);

    // explosion debris
    eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
    CPlacement3D plFX=GetPlacement();
    CEntityPointer penFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX->Initialize(eSpawnEffect);
    eSpawnEffect.colMuliplier = C_MAGENTA|CT_OPAQUE;
    CEntityPointer penFX2 = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX2->Initialize(eSpawnEffect);
    eSpawnEffect.colMuliplier = C_lCYAN|CT_OPAQUE;
    CEntityPointer penFX3 = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX3->Initialize(eSpawnEffect);
    eSpawnEffect.betType = BET_CANNON;
    eSpawnEffect.colMuliplier = C_CYAN|CT_OPAQUE;
    CEntityPointer penFX4 = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX4->Initialize(eSpawnEffect);

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionSmoke->Initialize(eSpawnEffect);
	  
      CEnemyBase::BlowUp();
    }
  };
  

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  
  InitiateTeleport()
  {
    m_bInvulnerable = TRUE;
    StartModelAnim(WITCHBRIDENOTENT_ANIM_TELEPORT, 0);

    // start disappear particles
    FLOAT tmNow = _pTimer->CurrentTick();
    m_tmParticlesDisappearStart=tmNow;

    PlaySound(m_soSound, SOUND_TELEPORT, SOF_3D);

    autowait(0.5f);
    jump Immaterial();
  }

  FlyFire(EVoid) : CEnemyFly::FlyFire {
    INDEX iRnd = IRnd()%3;
    switch(iRnd)
    {
    case 0:
        PlaySound(m_soVoice, SOUND_CHANTLAVA, SOF_3D);
        jump FireLava();
        break;
    case 1:
        PlaySound(m_soVoice, SOUND_CHANTWIND, SOF_3D);
        jump FireWind();
        break;
    case 2:
        PlaySound(m_soVoice, SOUND_CHANTBALLS, SOF_3D);
        jump FireBalls();
        break;
    }

  };

  FireLava(EVoid) {

    // fire twisters
    StartModelAnim(WITCHBRIDENOTENT_ANIM_WOUND_MM, 0);
    autowait(1.05f);
    PlaySound(m_soSound, SOUND_FIRELAVA, SOF_3D);

    // hit bomb
    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, FIRE_AIR(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      BOMB_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch 1
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_AIR, ANGLE3D(-30, BOMB_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch1;
    eLaunch1.penLauncher = this;
    eLaunch1.prtType = PRT_LAVAMAN_BIG_BOMB;
    eLaunch1.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch1);

    autowait(0.1f);

    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, FIRE_AIR(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      BOMB_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch 1
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_AIR, ANGLE3D(0, BOMB_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch1;
    eLaunch1.penLauncher = this;
    eLaunch1.prtType = PRT_LAVAMAN_BIG_BOMB;
    eLaunch1.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch1);

    autowait(0.1f);

    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, FIRE_AIR(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      BOMB_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch 1
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_AIR, ANGLE3D(30, BOMB_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch1;
    eLaunch1.penLauncher = this;
    eLaunch1.prtType = PRT_LAVAMAN_BIG_BOMB;
    eLaunch1.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch1);

    autowait(1.0f);
    StandingAnim();

    MaybeSwitchToAnotherPlayer();
    autowait(FRnd()/3 + 0.6f);
    EWbTeleport est;
    est.fWait = 0.5f;
    SendEvent(est);
    jump WbTeleportLoop();
	return EEnd();
  };

  FireWind(EVoid) {

    // fire twisters
    StartModelAnim(WITCHBRIDENOTENT_ANIM_WOUND_MM, 0);
    autowait(1.05f);
    PlaySound(m_soSound, SOUND_FIREWIND, SOF_3D);

    FLOAT3D vOffset;
    // static enemy
    if (((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute.Length()==0.0f) {
      // almost directly at the enemy
      FLOAT3D vPlayerToThis = GetPlacement().pl_PositionVector - m_penEnemy->GetPlacement().pl_PositionVector;
      vPlayerToThis.Normalize();
      vOffset = FLOAT3D(vPlayerToThis);
      LaunchTwister(vOffset);
      // to the left
      vOffset = FLOAT3D(-45.0f, 0.0f, 0.0f)*((CMovableEntity &)*m_penEnemy).GetRotationMatrix();
      LaunchTwister(vOffset);
      // to the right
      vOffset = FLOAT3D(45.0f, 0.0f, 0.0f)*((CMovableEntity &)*m_penEnemy).GetRotationMatrix();
      LaunchTwister(vOffset);
    // moving enemy
    } else {
      FLOAT3D vPlayerSpeed = ((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute;
      if (vPlayerSpeed.Length()>15.0f) {
        vPlayerSpeed.Normalize();
        vPlayerSpeed = vPlayerSpeed*15.0f;
      }
      vOffset = vPlayerSpeed*(2.0f+FRnd());
      FLOAT3D vToPlayer = ((CMovableEntity &)*m_penEnemy).GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector;
      vToPlayer.Normalize();
      vToPlayer*=15.0f + FRnd()*5.0f;
      vOffset -= vToPlayer;
      LaunchTwister(vOffset);
      //LaunchTwister(vOffset+FLOAT3D(-45.0f, 0.0f, 0.0f));
      LaunchTwister(FLOAT3D(0.0f, 0.0f, 0.0f));
      LaunchTwister(vOffset+FLOAT3D(45.0f, 0.0f, 0.0f));
    }

    autowait(1.0f);
    StandingAnim();

    MaybeSwitchToAnotherPlayer();
    autowait(FRnd()/3 + 0.6f);
    EWbTeleport est;
    est.fWait = 0.5f;
    SendEvent(est);
    jump WbTeleportLoop();
	return EEnd();
  };

  FireBalls(EVoid) {

    // fire projectile
    StartModelAnim(WITCHBRIDENOTENT_ANIM_WOUND_MM, 0);
    autowait(1.05f);
    PlaySound(m_soSound, SOUND_FIREBALLS, SOF_3D);
    ShootProjectile(PRT_BEAST_PROJECTILE, FIRE_AIR, ANGLE3D(90, 25, 0));
    ShootProjectile(PRT_BEAST_PROJECTILE, FIRE_AIR, ANGLE3D(-90, 25, 0));
    ShootProjectile(PRT_BEAST_PROJECTILE, FIRE_AIR, ANGLE3D(90, -25, 0));
    ShootProjectile(PRT_BEAST_PROJECTILE, FIRE_AIR, ANGLE3D(-90, -25, 0));
    autowait(1.0f);
    StandingAnim();

    MaybeSwitchToAnotherPlayer();
    autowait(FRnd()/3 + 0.6f);
    EWbTeleport est;
    est.fWait = 0.5f;
    SendEvent(est);
    jump WbTeleportLoop();
	return EEnd();
  };

  WbAppear(EVoid)
  {
    return EReturn();
  }

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {
    autocall WbAppear() EReturn;
    PlaySound(m_soBackground, SOUND_ALIVE, SOF_3D|SOF_LOOP);
    return EReturn();
  }

  Immaterial() {
    
    // hide model
    DisappearEffect();
    SwitchToEditorModel();
    SetCollisionFlags(ECF_IMMATERIAL);
    
    // destroy possible flames
    CEntityPointer penFlame = GetChildOfClass("Flame");
    if (penFlame!=NULL) {
      penFlame->Destroy();
    }

    // wait required time
    autowait(m_fImmaterialDuration);
    
    INDEX iMaxTries = 10;
    FLOAT3D vTarget;
    // move to a new position
      CSummonerMarker *marker = &((CSummonerMarker &)*m_penTeleportMarker);
      INDEX iMarker = IRnd()%m_iTeleportMarkers;
      while (iMarker>0) {
        marker = &((CSummonerMarker &)*marker->m_penTarget);
        iMarker--;
      }
      vTarget = marker->GetPlacement().pl_PositionVector;
      FLOAT fR = FRnd()*marker->m_fMarkerRange;
      FLOAT fA = FRnd()*360.0f;
      vTarget += FLOAT3D(CosFast(fA)*fR, 0.05f, SinFast(fA)*fR);
    
    CPlacement3D pl;
    pl.pl_PositionVector = vTarget;
    FLOAT3D vToPlayer;
    if (m_penEnemy!=NULL) {
      vToPlayer = m_penEnemy->GetPlacement().pl_PositionVector - vTarget;
    } else {
      vToPlayer = m_vPlayerSpotted - vTarget;
    }
    vToPlayer.Normalize();
    DirectionVectorToAngles(vToPlayer, pl.pl_OrientationAngle);
    Teleport(pl);

    // show model
    SpawnTeleportEffect();
    SwitchToModel();
    SetCollisionFlags(ECF_MODEL);
    
    m_bShouldTeleport = FALSE;
    m_tmMaterializationTime = _pTimer->CurrentTick();

    m_bInvulnerable = FALSE;
    
    PlaySound(m_soTeleport, SOUND_MATERIALIZE, SOF_3D);

    SendEvent(EBegin());
    return EReturn();

  }

  WbTeleportLoop() {
    // spawn a 1sec reminder
    wait () {
      on (EBegin) :
      {
        call CEnemyBase::MainLoop();
      }
      on (EReminder er) :
      {
        // pass all reminders but the 128 one
		if (GetHealth() >= 1.0) {
          // see if we have to teleport
            m_bShouldTeleport = TRUE;
           call InitiateTeleport();
		   }
		   if (TRUE) {
          pass;
        }
        resume;
      }      
      // we want to teleport in near future
      on (EWbTeleport est) :
      {
        //m_fTeleportWaitTime = est.fWait;
        SpawnReminder(this, est.fWait, 129);
        resume;
      }
      otherwise () : {
        resume;
      }
    }
  }

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    autocall CEnemyBase::Death() EEnd;
    Explode();
    return EEnd();
  };



/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
      if (m_EeftType==EFT_FLY_GROUND_GROUND | EFT_FLY_GROUND_AIR | EFT_FLY_AIR_GROUND | EFT_FLY_AIR_AIR | EFT_GROUND_ONLY) {
      m_EeftType=EFT_FLY_ONLY;
    }
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS|EPF_HASGILLS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    SetHealth(15000.0f);
    m_fMaxHealth = 15000.0f;
    en_fDensity = 20000.0f;
	m_EeftType=EFT_FLY_ONLY;

    // this one is boss!
    m_bBoss = TRUE;
    

    // set your appearance
    SetModel(MODEL_WB);
    SetModelMainTexture(TEXTURE_WB);
    StandingAnim();
    m_sptType = SPT_SLIME;

    AddAttachment(WITCHBRIDENOTENT_ATTACHMENT_SPIDERLEGS, MODEL_TENTACLES, TEXTURE_TENTACLES);

    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = 0.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 13.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 1000.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 2000.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd() + 2.5f;
    m_aFlyWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fFlyAttackRunSpeed = 0.0f;
    m_aFlyAttackRotateSpeed = FRnd()*200 + 600.0f;;
    m_fFlyCloseRunSpeed = 0.0f;
    m_aFlyCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 1000.0f;
    m_fFlyCloseDistance = 0.5f;
    m_fFlyStopDistance = 0.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 2000.0f;
    // damage/explode properties
    m_fBlowUpAmount = 5000.0f;
    m_fBodyParts = 20;
    m_fBlowUpSize = 6.0f;
    m_fDamageWounded = 100000000.0f;
    m_iScore = 1000000;

    // set stretch factors for height and width
    CEnemyBase::SizeModel();

    ModelChangeNotify();
    StandingAnim();
    autowait(_pTimer->TickQuantum);

    if (!DoSafetyChecks()) {
        Destroy();
        return;
    }

    // count teleport markers
    m_iTeleportMarkers = 3;
    m_penTeleportMarker;
    {
      m_iTeleportMarkers ++;
    }

    m_soTeleport.Set3DParameters(300.0f, 50.0f, 1.0f, 1.0f);

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "AREP/Models/DevilAlpha/Devil.h"
#include "AREP/Models/DevilAlpha/Stick.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";


%{
#define REMINDER_DEATTACH_FIREBALL 666
#define CLOSE_ATTACK_RANGE 15.0f
#define FIRE_RANGE 25.0f
#define DEMON_STRETCH 2.0f
#define FLAME          FLOAT3D(2.0f, 5.25f, -2.0f)
FLOAT3D vFarLaunchPos = (FLOAT3D(-1.0f, 4.0f, 0.15f)*DEMON_STRETCH);
FLOAT3D vShieldPos = (FLOAT3D(0.0f, 4.0f, 0.0f)*DEMON_STRETCH);
static float _tmLastStandingAnim =0.0f;  

// info structure
static EntityInfo eiDevilAlpha = {
  EIBT_FLESH, 1600.0f,
  0.0f, 2.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
%}

class CDevilAlpha : CEnemyBase {
name      "DevilAlpha";
thumbnail "Thumbnails\\DevilAlpha.tbn";

properties:
  2 INDEX m_iCounter = 0,
  3 CEntityPointer m_penFireFX,
  4 BOOL  m_bInvulnerable = FALSE, // can we be hurt?
  5 CEntityPointer m_penDefendTrigger "Defend Trigger",
  6 CEntityPointer m_penDefendFX,
  8 FLOAT3D m_vFlameSource = FLOAT3D(0,0,0),
  9 CEntityPointer m_penFlame,
 10 BOOL m_bBurnEnemy = FALSE,
 11 FLOAT m_fFireTime = 0.0f,
 12 FLOAT m_fDefendTime = 0.0f,
 13 FLOAT m_fSize = DEMON_STRETCH,
 14 FLOAT m_fDefendDuration "Defend Duration" = 5.0f

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 model   MODEL_DEVILALPHA         "AREP\\Models\\DevilAlpha\\Devil.mdl",
  4 texture TEXTURE_DEVILALPHA       "AREP\\Models\\DevilAlpha\\Devil4.tex",

  5 model   MODEL_GUN         "Models\\Enemies\\Devil\\Weapons\\ProjectileGun.mdl",
  7 texture TEXTURE_GUN       "Models\\Enemies\\Devil\\Weapons\\ProjectileGun.tex",
  8 model   MODEL_STICK       "AREP\\Models\\DevilAlpha\\Stick.mdl",
  9 model   MODEL_FLARE       "AREP\\Models\\DevilAlpha\\Flare.mdl",
 10 texture TEXTURE_STICK     "Textures\\General\\Wood\\Wood01.tex",
 11 texture TEXTURE_FLARE     "AREP\\Models\\DevilAlpha\\12.tex",
 12 model   MODEL_SHIELD       "AREP\\Models\\DevilAlpha\\Shield.mdl",
 13 texture TEXTURE_SHIELD     "AREP\\Models\\DevilAlpha\\Shield.tex",

 // ************** SOUNDS **************
 50 sound   SOUND_IDLE      "AREP\\Models\\DevilAlpha\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "AREP\\Models\\DevilAlpha\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "AREP\\Models\\DevilAlpha\\Sounds\\Wound.wav",
 55 sound   SOUND_DEATH     "AREP\\Models\\DevilAlpha\\Sounds\\Death.wav",
 57 sound   SOUND_CAST      "AREP\\Models\\DevilAlpha\\Sounds\\Cast.wav",
 58 sound   SOUND_FLAME      "AREP\\Models\\DevilAlpha\\Sounds\\Fire.wav",
 59 sound   SOUND_DEFEND      "AREP\\Models\\DevilAlpha\\Sounds\\Defend.wav",
 60 sound   SOUND_KICK      "AREP\\Models\\DevilAlpha\\Sounds\\Kick.wav",

functions:

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("An Amalgam Colossus obliterated %s"), (const char *) strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmDemon, "DataMP\\Messages\\Enemies\\AREP\\DevilAlpha.txt");
    return fnmDemon;
  }
  
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_CAST);
    PrecacheSound(SOUND_FLAME);
    PrecacheSound(SOUND_DEFEND);
    PrecacheSound(SOUND_KICK);
    PrecacheModel(MODEL_DEVILALPHA);
    PrecacheTexture(TEXTURE_DEVILALPHA);
    PrecacheClass(CLASS_PROJECTILE, PRT_DEMON_FIREBALL);

    // weaponry
    PrecacheModel(MODEL_GUN);
    PrecacheTexture(TEXTURE_GUN);
    PrecacheModel(MODEL_STICK);
    PrecacheTexture(TEXTURE_STICK);
    PrecacheModel(MODEL_FLARE);
    PrecacheTexture(TEXTURE_FLARE);
    PrecacheModel(MODEL_SHIELD);
    PrecacheTexture(TEXTURE_SHIELD);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiDevilAlpha;
  };

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
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable == TRUE) {
      return;
    }
    // take less damage from heavy bullets (e.g. sniper)
    if(dmtType==DMT_BULLET && fDamageAmmount>100.0f)
    {
      fDamageAmmount*=0.5f;
    }

    // boss cannot be telefragged
    if(dmtType==DMT_TELEPORT)
    {
      return;
    }

    // cannonballs inflict less damage then the default
    if(dmtType==DMT_CANNONBALL)
    {
      fDamageAmmount *= 0.5f;
    }

    // can't harm own class
    if (!IsOfClass(penInflictor, "DevilAlpha")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // bosses don't darken when burning
    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    StartModelAnim(DEVIL_ANIM_WOUND01SLIGHTFRONT , 0);
    return DEVIL_ANIM_WOUND01SLIGHTFRONT ;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(DEVIL_ANIM_DEATH, 0);
    return DEVIL_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch)
  {
    vStretch=FLOAT3D(1,1,2)*3.0f;
    return 1.1f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(DEVIL_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    //_tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(DEVIL_ANIM_STANDLOOP, AOF_LOOPING|AOF_NORESTART);
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
    StartModelAnim(DEVIL_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    StartModelAnim(DEVIL_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
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

  // flame source
  void GetFlamerSourcePlacement(CPlacement3D &plFlame) {
    plFlame.pl_PositionVector = m_vFlameSource;
  };

  // fire flame
  void FireFlame(void) {
    FLOAT3D vFlamePos;
    vFlamePos = FLAME;

    // create flame
    CEntityPointer penFlame = ShootProjectile(PRT_FLAME, vFlamePos, ANGLE3D(0, 0, 0));
    // link last flame with this one (if not NULL or deleted)
    if (m_penFlame!=NULL && !(m_penFlame->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame).m_penParticles = penFlame;
    }
    // link to player weapons
    ((CProjectile&)*penFlame).m_penParticles = this;
    // store last flame
    m_penFlame = penFlame;
    // flame source position
    m_vFlameSource = GetPlacement().pl_PositionVector + vFlamePos*GetRotationMatrix();
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

  Fire(EVoid) : CEnemyBase::Fire {
    // hit
    if (CalcDist(m_penEnemy) > FIRE_RANGE) {
      jump AttackFar();

    } else if (CalcDist(m_penEnemy) < FIRE_RANGE) {
      jump AttackClose();
    }

    MaybeSwitchToAnotherPlayer();
    autowait(1.0f);
    return EReturn();
  };

  AttackFar(EVoid)
  {
    
    // SetDesiredTranslation???
    if (m_fMoveSpeed>0.0f) {
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, -m_fMoveSpeed));
    }
    
    //StartModelAnim(DEVIL_ANIM_ATTACK03, AOF_SMOOTHCHANGE);
    StartModelAnim(DEVIL_ANIM_ATTACK03, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_CAST, SOF_3D);

    autowait(0.3f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vFarLaunchPos*m;

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_DEMON_FIREBALL, vFarLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_DEMON_FIREBALL, vFarLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }

    autowait(GetModelObject()->GetAnimLength(DEVIL_ANIM_ATTACK03));
    return EReturn();
  };

  AttackClose(EVoid){
    // to fire
    StartModelAnim(DEVIL_ANIM_FROMSTANDTOATTACK01POSITION, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(DEVIL_ANIM_FROMSTANDTOATTACK01POSITION);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    StartModelAnim(DEVIL_ANIM_ATTACK01LOOPMINIGUN, 0);
    m_fFireTime = _pTimer->CurrentTick();
    FireFlame();
    m_bBurnEnemy = TRUE;
    PlaySound(m_soSound, SOUND_FLAME, SOF_3D);
    while (m_bBurnEnemy) {
      m_fMoveFrequency = 0.1f;
      wait(m_fMoveFrequency) {
        // flame
        on (EBegin) : {
          m_vDesiredPosition = m_penEnemy->GetPlacement().pl_PositionVector;
          // rotate to enemy
          m_fMoveSpeed = 0.0f;
          m_aRotateSpeed = 10000.0f;
          // adjust direction and speed
          SetDesiredMovement(); 
          // flame
          FireFlame();
          // stop
          if (_pTimer->CurrentTick()-m_fFireTime >= 1.29f) {
            m_bBurnEnemy = FALSE;
            stop;
          }
          resume;
        }
        on (ETimer) : { stop; }
      }
    }

    // link last flame with nothing (if not NULL or deleted)
    if (m_penFlame!=NULL && !(m_penFlame->GetFlags()&ENF_DELETED)) {
      ((CProjectile&)*m_penFlame).m_penParticles = NULL;
      m_penFlame = NULL;
    }

    StartModelAnim(DEVIL_ANIM_FROMATTACK01TOSTANDPOSITION, 0);
    autowait(GetModelObject()->GetAnimLength(DEVIL_ANIM_FROMATTACK01TOSTANDPOSITION));
    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    if (CalcDist(m_penEnemy) < 11.0f) {
      StartModelAnim(DEVIL_ANIM_ATTACK02LOOPCLAWS, 0);
      PlaySound(m_soSound, SOUND_KICK, SOF_3D);
      autowait(0.45f);
      if (CalcDist(m_penEnemy) < CLOSE_ATTACK_RANGE
        && IsInPlaneFrustum(m_penEnemy, CosFast(60.0f)))
      {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 100.0f, FLOAT3D(0, 0, 0), vDirection);
        FLOAT3D vSpeed;
        GetPitchDirection(AngleDeg(20.0f), vSpeed);
        vSpeed = vSpeed * 40.0f;
        KickEntity(m_penEnemy, vSpeed);
      }
      autowait(0.5f);
      MaybeSwitchToAnotherPlayer();
    } else {
      // run to enemy
      m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    }
    return EReturn();
  }

/************************************************************
 *                PROCEDURES WHEN HARMED                    *
 ************************************************************/
  BeWounded(EDamage eDamage) : CEnemyBase::BeWounded {

    StopMoving();
    m_fDefendTime = m_fDefendDuration;
    if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
      m_fDefendTime *= 0.5f;
    }
    // to defend
    StartModelAnim(DEVIL_ANIM_FROMSTANDTODEFENDPOSITION, 0);
    autowait(GetModelObject()->GetAnimLength(DEVIL_ANIM_FROMSTANDTODEFENDPOSITION));
	
    m_bInvulnerable = TRUE;
    SendToTarget(m_penDefendTrigger , EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vShieldPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(2.0f, 2.0f, 2.0f);
    m_penDefendFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penDefendFX->Initialize(ese);
    StartModelAnim(DEVIL_ANIM_DEFENDLOOP, AOF_LOOPING|AOF_NORESTART);

    autowait(m_fDefendTime);

    // from defend
    StartModelAnim(DEVIL_ANIM_FROMDEFENDTOSTANDPOSITION, 0);
    PlaySound(m_soSound, SOUND_DEFEND, SOF_3D);
    autowait(GetModelObject()->GetAnimLength(DEVIL_ANIM_FROMDEFENDTOSTANDPOSITION));
	m_bInvulnerable = FALSE;

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
    en_fDensity = 10000.0f;

    // set your appearance
    SetModel(MODEL_DEVILALPHA);
    SetModelMainTexture(TEXTURE_DEVILALPHA);
    AddAttachment(DEVIL_ATTACHMENT_MINIGUN, MODEL_GUN, TEXTURE_GUN);
    AddAttachment(DEVIL_ATTACHMENT_STICK, MODEL_STICK, TEXTURE_STICK);
     CModelObject *pmoStick = &GetModelObject()->GetAttachmentModel(DEVIL_ATTACHMENT_STICK)->amo_moModelObject;
     pmoStick->PlayAnim(STICK_ANIM_DEFAULT_ANIMATION, AOF_LOOPING|AOF_NORESTART);
     AddAttachmentToModel(this, *pmoStick, STICK_ATTACHMENT_FLARE, MODEL_FLARE, TEXTURE_FLARE, 0, 0, 0);
    AddAttachment(DEVIL_ATTACHMENT_SHIELD, MODEL_SHIELD, TEXTURE_SHIELD);
    StandingAnim();

    // setup moving speed
    m_fWalkSpeed = FRnd()/1.0f + 10.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd()/1.0f + 20.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    m_fAttackRunSpeed = FRnd()/1.0f + 20.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
    // setup attack distances
    m_fAttackDistance = 1000.0f;
    m_fCloseDistance = 11.0f;
    m_fStopDistance = 20.0f;
    m_fAttackFireTime = 2.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 8000.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    SetHealth(15000.0f);
    m_fMaxHealth = GetHealth();
    m_fBlowUpAmount = 9999999999999.0f;
    m_fBodyParts = 4;
    m_fDamageWounded = 2500.0f;
    m_iScore = 500000;
    m_fLockOnEnemyTime = 3.0f;

    // flame source
    m_vFlameSource = FLOAT3D(0, 0, 0);

    // this is a boss
    m_bBoss = TRUE;

    // set stretch factor
    GetModelObject()->StretchModel(FLOAT3D(3.0f, 3.0f, 3.0f));
    ModelChangeNotify();
    
    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

320
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/SS4/Kalopsy/Kalopsy.h"
#include "ModelsMP/Enemies/SS3/Kleer/LostSoul.h"
%}

uses "EntitiesMP/EnemyFly";

enum KalChar {
  0 KA_CACO            "Beholder",
  1 KA_PAIN            "Rahovart",
  2 KA_LS              "Lost Soul",
};

%{
// info structure
static EntityInfo eiKalopsy = {
  EIBT_FLESH, 500.0f,
  0.0f, 4.0f, 0.0f,
  0.0f, 6.0f, 0.0f,
};
static EntityInfo eiLostSoul = {
  EIBT_BONES, 100.0f,
  0.0f, 0.0f, 0.0f,
  0.0f, 0.0f, 0.0f,
};

//#define FIRE_AIR        FLOAT3D(0.0f, 3.0f, -0.5f)
//#define FIRE_DEATH      FLOAT3D(0.0f, 4.0f, 0.0f)
static FLOAT3D FIRE_AIR    =     FLOAT3D(0.0f, 3.0f, -0.5f);
static FLOAT3D FIRE_DEATH  =     FLOAT3D(0.0f, 4.0f, 0.0f);

#define SOUND(soundname) ((m_KalChar==KA_CACO)? (SOUND_CACO_##soundname) : (m_KalChar==KA_PAIN)? (SOUND_PAIN_##soundname) : (SOUND_LS_##soundname))
%}


class CKalopsy : CEnemyFly {
name      "Kalopsy";
thumbnail "Thumbnails\\Kalopsy.tbn";

properties:
  1 enum KalChar m_KalChar   "Character" 'C' = KA_CACO,
  2 BOOL m_bExploded = FALSE,
  3 BOOL m_bRenderParticles=FALSE,

 11 BOOL m_bSpawned = FALSE,
 12 INDEX m_ctSpawned = 0,
 13 BOOL m_bSpawnEnabled = FALSE,
 14 INDEX m_bCountAsKill = TRUE,

 15 CSoundObject m_soBackground,

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 class   CLASS_PROJECTILE     "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

  3 model   MODEL_CACO       "ModelsMP\\Enemies\\SS4\\Kalopsy\\Kalopsy.mdl",
  4 texture TEXTURE_CACO     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Kalopsy5.tex",
  5 texture TEXTURE_PAIN     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Kalopsy6.tex",

  6 model   MODEL_LS       "ModelsMP\\Enemies\\SS3\\Kleer\\LostSoul.mdl",
  7 texture TEXTURE_LS     "ModelsMP\\Enemies\\SS3\\Kleer\\Kleer.tex",

// ************** SOUNDS **************
 50 sound   SOUND_CACO_ALIVE     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Caco\\Alive.wav",
 51 sound   SOUND_CACO_SIGHT     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Caco\\Sight.wav",
 52 sound   SOUND_CACO_WOUND     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Caco\\Wound.wav",
 53 sound   SOUND_CACO_FIRE1     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Caco\\Fire1.wav",
 54 sound   SOUND_CACO_FIRE2     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Caco\\Fire2.wav",
 55 sound   SOUND_CACO_DEATH     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Caco\\Death.wav",

 60 sound   SOUND_PAIN_ALIVE     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Pain\\Alive.wav",
 61 sound   SOUND_PAIN_SIGHT     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Pain\\Sight.wav",
 62 sound   SOUND_PAIN_WOUND     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Pain\\Wound.wav",
 63 sound   SOUND_PAIN_FIRE1     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Pain\\Fire1.wav",
 64 sound   SOUND_PAIN_FIRE2     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Pain\\Fire2.wav",
 65 sound   SOUND_PAIN_DEATH     "ModelsMP\\Enemies\\SS4\\Kalopsy\\Sounds\\Pain\\Death.wav",

 70 sound   SOUND_LS_IDLE      "ModelsMP\\Enemies\\SS3\\Kleer\\Sounds\\Idle.wav",
 71 sound   SOUND_LS_SIGHT     "ModelsMP\\Enemies\\SS3\\Kleer\\Sounds\\Sight.wav",
 72 sound   SOUND_LS_WOUND     "ModelsMP\\Enemies\\SS3\\Kleer\\Sounds\\Wound.wav",
 73 sound   SOUND_LS_ATTACK    "ModelsMP\\Enemies\\SS3\\Kleer\\Sounds\\Attack.wav",
 74 sound   SOUND_LS_DEATH     "ModelsMP\\Enemies\\SS3\\Kleer\\Sounds\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
	if (m_KalChar==KA_CACO) {
      str.PrintF(TRANS("A Kalopsy unmade %s"), (const char *) strPlayerName);
    } else if (m_KalChar==KA_PAIN) {
      str.PrintF(TRANS("A Kalopsy unmade %s"), (const char *) strPlayerName);
    } else if (m_KalChar==KA_LS) {
      str.PrintF(TRANS("%s's soul has been taken"), (const char *) strPlayerName);
    }
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmCaco,   "DataMP\\Messages\\Enemies\\SS4\\Kalopsy1.txt");
    static DECLARE_CTFILENAME(fnmPain,   "DataMP\\Messages\\Enemies\\SS4\\Kalopsy2.txt");
    static DECLARE_CTFILENAME(fnmLS,     "DataMP\\Messages\\Enemies\\SS3\\LostSoul.txt");
    switch(m_KalChar) {
    default: ASSERT(FALSE);
    case KA_CACO:   return fnmCaco;
    case KA_PAIN:   return fnmPain;
    case KA_LS:     return fnmLS;
    }
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheModel(MODEL_CACO);
    PrecacheTexture(TEXTURE_CACO);
    PrecacheTexture(TEXTURE_PAIN);

    PrecacheModel(MODEL_LS);
    PrecacheTexture(TEXTURE_LS);

    PrecacheSound(SOUND_CACO_ALIVE);
    PrecacheSound(SOUND_CACO_SIGHT);
    PrecacheSound(SOUND_CACO_WOUND);
    PrecacheSound(SOUND_CACO_FIRE1);
    PrecacheSound(SOUND_CACO_FIRE2);
    PrecacheSound(SOUND_CACO_DEATH);

    PrecacheSound(SOUND_PAIN_ALIVE);
    PrecacheSound(SOUND_PAIN_SIGHT);
    PrecacheSound(SOUND_PAIN_WOUND);
    PrecacheSound(SOUND_PAIN_FIRE1);
    PrecacheSound(SOUND_PAIN_FIRE2);
    PrecacheSound(SOUND_PAIN_DEATH);

    PrecacheSound(SOUND_LS_IDLE);
    PrecacheSound(SOUND_LS_SIGHT);
    PrecacheSound(SOUND_LS_WOUND);
    PrecacheSound(SOUND_LS_ATTACK);
    PrecacheSound(SOUND_LS_DEATH);

    PrecacheClass(CLASS_PROJECTILE, PRT_KALOPSY_SLIME);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_KalChar == KA_CACO) {
      return &eiKalopsy;
    } else if (m_KalChar == KA_PAIN) {
      return &eiKalopsy;
    } else if (m_KalChar==KA_LS) {
      return &eiLostSoul;
	}
  };

  // render particles
  void RenderParticles(void)
  {
   if(m_bRenderParticles) {
    if(m_KalChar==KA_LS ) {
      Particles_BeastProjectileTrail( this, 0.25f, 0.1f, 10);
      CEnemyBase::RenderParticles();
	  }
	}
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // woman can't harm woman
    if (!IsOfClass(penInflictor, "Kalopsy") ||
      ((CKalopsy*)penInflictor)->m_KalChar!=m_KalChar) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    if(m_KalChar==KA_LS ) {
      switch (IRnd()%2) {
        case 0: iAnim = LOSTSOUL_ANIM_WOUND1; break;
        case 1: iAnim = LOSTSOUL_ANIM_WOUND2; break;
		}
    } else {
      iAnim = KALOPSY_ANIM_Wound;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if(m_KalChar==KA_LS ) {
      iAnim = LOSTSOUL_ANIM_DEATH;
    } else {
      iAnim = KALOPSY_ANIM_Death;
	  }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  void DeathNotify(void) {
    if(m_KalChar!=KA_LS ) {
     ChangeCollisionBoxIndexWhenPossible(KALOPSY_COLLISION_BOX_DEATH);
	 }
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_KalChar==KA_LS) {
      StartModelAnim(LOSTSOUL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(KALOPSY_ANIM_Idle, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if (m_KalChar==KA_LS) {
      StartModelAnim(LOSTSOUL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(KALOPSY_ANIM_Idle, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    if (m_KalChar==KA_LS) {
      StartModelAnim(LOSTSOUL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(KALOPSY_ANIM_Run, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if (m_KalChar==KA_LS) {
      StartModelAnim(LOSTSOUL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(KALOPSY_ANIM_Idle, AOF_LOOPING|AOF_NORESTART);
    }
  };

  // virtual sound functions
  void IdleSound(void) {
    if (m_KalChar==KA_LS) {
      PlaySound(m_soSound, SOUND_LS_IDLE, SOF_3D);
	}
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND(SIGHT), SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND(WOUND), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND(DEATH), SOF_3D);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soBackground.Set3DParameters(80.0f, 5.0f, 0.5f, 1.0f);
  };

  BOOL CountAsKill(void)
  {
    return m_bCountAsKill;
  }

  // spawn lost soul 
  void SpawnLostSoul(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())), INDEX(0), INDEX(10));
    // disable too much spawning
    if (GetHealth()<=0.0f)
    {
      ctShouldSpawn+=1;
    }

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(FIRE_AIR, ANGLE3D(0.0f+FRnd(), 20+FRnd()*10, 0));
    pl.RelativeToAbsolute(GetPlacement());

    // create entity
    CEntityPointer pen = GetWorld()->CreateEntity(pl, GetClass());
    ((CKalopsy&)*pen).m_KalChar = KA_LS;
    // start properties
    ((CKalopsy&)*pen).m_colColor = m_colColor;
    ((CKalopsy&)*pen).m_penEnemy = m_penEnemy;
    ((CKalopsy&)*pen).m_ttTarget = m_ttTarget;
    ((CKalopsy&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());

    m_ctSpawned++;
  };

  // spawn lost souls on death
  void SpawnLostSoulOnDeath(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())), INDEX(0), INDEX(10));
    // disable too much spawning
    if (GetHealth()<=0.0f)
    {
      ctShouldSpawn+=1;
    }

    CPlacement3D pl;
    // spawn placement
	if (IRnd()&1) {
      pl = CPlacement3D(FIRE_DEATH, ANGLE3D(90.0f, 20+FRnd()*10, 0));
	} else {
      pl = CPlacement3D(FIRE_DEATH, ANGLE3D(-90.0f, 20+FRnd()*10, 0));
	}
    pl.RelativeToAbsolute(GetPlacement());

    // create entity
    CEntityPointer pen = GetWorld()->CreateEntity(pl, GetClass());
    ((CKalopsy&)*pen).m_KalChar = KA_LS;
    // start properties
    ((CKalopsy&)*pen).m_colColor = m_colColor;
    ((CKalopsy&)*pen).m_penEnemy = m_penEnemy;
    ((CKalopsy&)*pen).m_ttTarget = m_ttTarget;
    ((CKalopsy&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());
    // set moving
    ((CKalopsy&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -45.0f), this);
    ((CKalopsy&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));

    m_ctSpawned++;
  };


  void FireSlime(FLOAT3D &vPos) {
    CPlacement3D plSlime;
    plSlime.pl_PositionVector = vPos;
	if (IRnd()&1) {
      plSlime.pl_OrientationAngle = ANGLE3D(90.0f, 5.0f-FRnd()*10.0f, 0);
	} else {
      plSlime.pl_OrientationAngle = ANGLE3D(-90.0f, 5.0f-FRnd()*10.0f, 0);
	}
    plSlime.RelativeToAbsolute(GetPlacement());
    CEntityPointer penProjectile = CreateEntity(plSlime, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_KALOPSY_SLIME;
    penProjectile->Initialize(eLaunch);
  };


/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/

  // spawn body parts
  void ExplodeLostSoul(void) {
    if (!m_bExploded) {
      m_bExploded = TRUE;
      FLOAT3D vSource;

      // inflict damage
      GetEntityInfoPosition(this, eiLostSoul.vTargetCenter, vSource);
      InflictDirectDamage(this, this, DMT_EXPLOSION, 6000.0f, vSource, -en_vGravityDir);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_GREEN|CT_OPAQUE;
      eSpawnEffect.betType = BET_LIGHT_CANNON;
      eSpawnEffect.vStretch = FLOAT3D(0.75f,0.75f,0.75f);
      penExplosion->Initialize(eSpawnEffect); 

      CEnemyBase::BlowUp();
	  }
	};

  void ExplodeCaco(void) {
    if (!m_bExploded) {
      m_bExploded = TRUE;
      FLOAT3D vSource;

      // inflict damage
      GetEntityInfoPosition(this, eiKalopsy.vTargetCenter, vSource); 
      InflictDirectDamage(this, this, DMT_EXPLOSION, 6000.0f, vSource, -en_vGravityDir);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_BROWN|CT_OPAQUE;
      eSpawnEffect.betType = BET_BOMB;
      eSpawnEffect.vStretch = FLOAT3D(2.0f,2.0f,2.0f);
      penExplosion->Initialize(eSpawnEffect);

    // explosion debris
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionDebris->Initialize(eSpawnEffect);
      eSpawnEffect.colMuliplier = C_RED|CT_OPAQUE;

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionSmoke->Initialize(eSpawnEffect);
      eSpawnEffect.colMuliplier = C_BROWN|CT_OPAQUE;

      FireSlime(FIRE_DEATH);
      FireSlime(FIRE_DEATH);
	  
      CEnemyBase::BlowUp();
	  }
    };

  void ExplodePain(void) {
    if (!m_bExploded) {
      m_bExploded = TRUE;
      FLOAT3D vSource;

      // inflict damage
      GetEntityInfoPosition(this, eiKalopsy.vTargetCenter, vSource); 
      InflictDirectDamage(this, this, DMT_EXPLOSION, 6000.0f, vSource, -en_vGravityDir);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_BROWN|CT_OPAQUE;
      eSpawnEffect.betType = BET_BOMB;
      eSpawnEffect.vStretch = FLOAT3D(2.0f,2.0f,2.0f);
      penExplosion->Initialize(eSpawnEffect);

    // explosion debris
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionDebris->Initialize(eSpawnEffect);
      eSpawnEffect.colMuliplier = C_RED|CT_OPAQUE;

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionSmoke->Initialize(eSpawnEffect);
      eSpawnEffect.colMuliplier = C_BROWN|CT_OPAQUE;
	  
      SpawnLostSoulOnDeath();
      SpawnLostSoulOnDeath();
	  
      CEnemyBase::BlowUp();
	  }
    };
/************************************************************
 *                     MOVING FUNCTIONS                     *
 ************************************************************/
  // check whether may move while attacking
  BOOL MayMoveToAttack(void) 
  {
    if (m_bInAir) {
      return WouldNotLeaveAttackRadius();
    } else {
      return CEnemyBase::MayMoveToAttack();
    }
  }

  // must be more relaxed about hitting then usual enemies
  BOOL CanHitEnemy(CEntity *penTarget, FLOAT fCosAngle) {
    if (IsInPlaneFrustum(penTarget, fCosAngle)) {
      return IsVisibleCheckAll(penTarget);
    }
    return FALSE;
  };
  

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  FlyFire(EVoid) : CEnemyFly::FlyFire {

    if (m_KalChar==KA_CACO) {

    // fire projectile
    StartModelAnim(KALOPSY_ANIM_Fire, 0);
    INDEX iTauntSound;
    switch (IRnd()%2) {
      case 0: iTauntSound = SOUND_CACO_FIRE1; break;
      case 1: iTauntSound = SOUND_CACO_FIRE2; break;
	  }
    PlaySound(m_soSound, iTauntSound, SOF_3D);
    autowait(0.1f);
    ShootProjectile(PRT_KALOPSY_SLIME, FIRE_AIR, ANGLE3D(0, 0, 0));
    autowait(0.6f);
    StandingAnim();
	}

    if (m_KalChar==KA_PAIN) {

    // fire projectile
    StartModelAnim(KALOPSY_ANIM_Fire, 0);
    INDEX iTauntSound;
    switch (IRnd()%2) {
      case 0: iTauntSound = SOUND_PAIN_FIRE1; break;
      case 1: iTauntSound = SOUND_PAIN_FIRE2; break;
	  }
    PlaySound(m_soSound, iTauntSound, SOF_3D);
    autowait(0.1f);
    SpawnLostSoul();
    autowait(0.6f);
    StandingAnim();
	}

    if (m_KalChar==KA_LS) {
	//Lost Soul has no ranged attack
	}

    return EReturn();
  };
  
  FlyHit(EVoid) : CEnemyFly::FlyHit {

    // if enemy near
    if (m_KalChar==KA_LS) {
      if (CalcDist(m_penEnemy) <= 30.0f) {
        jump FlyOnEnemy();{
		}
      }
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.25f;
    return EReturn();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {
    // if spawned by other entity
    if (m_bSpawned) {
      m_bSpawned = FALSE;
      m_bCountAsKill = FALSE;
    }

    if (m_KalChar==KA_CACO) {
      PlaySound(m_soBackground, SOUND_CACO_ALIVE, SOF_3D|SOF_LOOP);
	  }
    if (m_KalChar==KA_PAIN) {
      PlaySound(m_soBackground, SOUND_PAIN_ALIVE, SOF_3D|SOF_LOOP);
	  }
    return EReturn();
  }
/************************************************************
 *                PROCEDURES WHEN HARMED                    *
 ************************************************************/
  // Play wound animation and falling body part
  BeWounded(EDamage eDamage) : CEnemyBase::BeWounded {

    if (m_KalChar==KA_CACO) {
      FireSlime(FIRE_AIR); }


    jump CEnemyBase::BeWounded(eDamage);
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    autocall CEnemyFly::Death() EEnd;
    m_bRenderParticles=FALSE;
     m_soBackground.Stop();

    if (m_KalChar==KA_LS) {
      ExplodeLostSoul(); }
    if (m_KalChar==KA_CACO) {
      ExplodeCaco(); }
    if (m_KalChar==KA_PAIN) {
      ExplodePain(); }
    return EEnd();
  };

  FlyOnEnemy(EVoid) {
    StartModelAnim(LOSTSOUL_ANIM_ATTACK, AOF_LOOPING|AOF_NORESTART);

    // jump
    FLOAT3D vDir = PlayerDestinationPos();
    vDir = (vDir - GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fFlyCloseRunSpeed*2.0f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_LS_ATTACK, SOF_3D);
    m_iChargeHitAnimation = LOSTSOUL_ANIM_ATTACK;
    m_fChargeHitDamage = 10.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 10.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;

    StandingAnim();
    MaybeSwitchToAnotherPlayer();
    autowait(0.3f);
    return EReturn();
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
	m_EeftType=EFT_FLY_ONLY;
    

  if (m_KalChar==KA_CACO) {
    // set your appearance
    SetModel(MODEL_CACO);
    SetModelMainTexture(TEXTURE_CACO);
    GetModelObject()->StretchModel(FLOAT3D(0.25f, 0.25f, 0.25f));
    ModelChangeNotify();
	m_bRenderParticles = FALSE;

    en_fDensity = 2000.0f;
    m_sptType = SPT_BLOOD;
    SetHealth(250.0f);
    m_fMaxHealth = 250.0f;

    // fly moving properties
    m_fFlyWalkSpeed = FRnd()/2 + 0.5f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*2.0f + 5.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*2.0f + 3.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 500.0f;
    m_fFlyCloseDistance = 0.5f;
    m_fFlyStopDistance = 10.0f;
    m_fFlyAttackFireTime = 5.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 1000.0f;
    // damage/explode properties
    m_fBlowUpAmount = 5000.0f;
    m_fBodyParts = 15;
    m_fBlowUpSize = 3.0f;
    m_bRobotBlowup = FALSE;
    m_fDamageWounded = 50.0f;
    m_iScore = 6000;
	}

  if (m_KalChar==KA_PAIN) {
    // set your appearance
    SetModel(MODEL_CACO);
    SetModelMainTexture(TEXTURE_PAIN);
    GetModelObject()->StretchModel(FLOAT3D(0.3f, 0.3f, 0.3f));
    ModelChangeNotify();
	m_bRenderParticles = FALSE;

    en_fDensity = 2000.0f;
    m_sptType = SPT_BLOOD;
    SetHealth(400.0f);
    m_fMaxHealth = 400.0f;

    // fly moving properties
    m_fFlyWalkSpeed = FRnd()/2 + 0.5f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*2.0f + 6.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*2.0f + 5.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 500.0f;
    m_fFlyCloseDistance = 0.5f;
    m_fFlyStopDistance = 10.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 5000.0f;
    m_fBodyParts = 15;
    m_fBlowUpSize = 4.0f;
    m_bRobotBlowup = FALSE;
    m_fDamageWounded = 300.0f;
    m_iScore = 9000;
	}

  if (m_KalChar==KA_LS) {
    // set your appearance
    SetModel(MODEL_LS);
    SetModelMainTexture(TEXTURE_LS);
    GetModelObject()->StretchModel(FLOAT3D(1.75f, 1.75f, 1.75f));
    ModelChangeNotify();
	m_bRenderParticles = TRUE;

    en_fDensity = 500.0f;
    m_sptType = SPT_BONES;
    SetHealth(40.0f);
    m_fMaxHealth = 40.0f;

    // fly moving properties
    m_fFlyWalkSpeed = FRnd()/2 + 5.5f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*2.0f + 12.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*2.0f + 14.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 75.0f;
    m_fFlyCloseDistance = 40.0f;
    m_fFlyStopDistance = 0.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 5000.0f;
    m_fBodyParts = 0;
    m_bRobotBlowup = TRUE;
    m_fDamageWounded = 5.0f;
    m_iScore = 500;
	}

    // set stretch factors for height and width
    CEnemyBase::SizeModel();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

/* Copyright (c) 2002-2012 Croteam Ltd. 
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

320
%{
#include "EntitiesMP/StdH/StdH.h"
#include "AREP/Models/Dragonman2/Dragonman.h"
%}

uses "EntitiesMP/EnemyFly";

%{
// info structure
static EntityInfo eiDragonStand = {
  EIBT_FLESH, 1200.0f,
  0.0f, 1.55f, 0.0f,
  0.0f, 1.0f, 0.0f,
};
static EntityInfo eiDragonFly = {
  EIBT_FIRE, 1200.0f*1,
  0.0f, 0.0f, 0.0f,
  0.0f, 0.0f, 0.0f,
};

#define FLAME_AIR1          FLOAT3D( 0.0f, 0.5f, -2.0f)
#define FLAME_GROUND1       FLOAT3D( 0.0f, 7.0f, -0.85f)
%}


class CDragonman : CEnemyFly {
name      "Dragonman";
thumbnail "Thumbnails\\Dragonman.tbn";

properties:
  6 FLOAT3D m_vFlameSource = FLOAT3D(0,0,0),
  7 CEntityPointer m_penFlame,
  8 BOOL m_bBurnEnemy = FALSE,
  9 FLOAT m_fFireTime = 0.0f,
 10 BOOL m_bBeBoss  "Boss" 'B' = FALSE,

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_DRAGON       "AREP\\Models\\Dragonman2\\Dragonman.mdl",
  2 texture TEXTURE_DRAGON     "AREP\\Models\\Dragonman2\\Dragonman01.tex",
  3 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "AREP\\Models\\Dragonman2\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "AREP\\Models\\Dragonman2\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "AREP\\Models\\Dragonman2\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "AREP\\Models\\Dragonman2\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "AREP\\Models\\Dragonman2\\Sounds\\Kick.wav",
 55 sound   SOUND_DEATH     "AREP\\Models\\Dragonman2\\Sounds\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (eDeath.eLastDamage.dmtType==DMT_CLOSERANGE) {
      str.PrintF(TRANS("%s was ripped apart by a Dragon"), strPlayerName);
    } else {
      str.PrintF(TRANS("A dragon burned %s to a crisp"), strPlayerName);
    }
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm,  "DataMP\\Messages\\Enemies\\AREP\\Dragonman.txt");
    return fnm;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_DEATH);
    PrecacheClass(CLASS_PROJECTILE, PRT_WOMAN_FIRE);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_bInAir) {
      return &eiDragonFly;
    } else {
      return &eiDragonStand;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // woman can't harm woman
    if (!IsOfClass(penInflictor, "Dragonman")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = DRAGONMAN_ANIM_AIRWOUND02CRITICAL;
    } else {
      iAnim = DRAGONMAN_ANIM_GROUNDWOUNDCRITICALFRONT;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (m_bInAir) {
      iAnim = DRAGONMAN_ANIM_AIRDEATH;
    } else {
      iAnim = DRAGONMAN_ANIM_GROUNDDEATHFRONT;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==DRAGONMAN_ANIM_AIRDEATH)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.6f;
    }
    else if(GetModelObject()->GetAnim()==DRAGONMAN_ANIM_GROUNDDEATHFRONT)
    {
      vStretch=FLOAT3D(1,1,2)*0.75f;
      return 0.525f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(DRAGONMAN_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(DRAGONMAN_ANIM_AIRFLYLOOP, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DRAGONMAN_ANIM_GROUNDSTANDLOOP, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(DRAGONMAN_ANIM_AIRSTANDLOOP, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DRAGONMAN_ANIM_GROUNDWALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    if (m_bInAir) {
      StartModelAnim(DRAGONMAN_ANIM_AIRSTANDLOOP, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DRAGONMAN_ANIM_GROUNDRUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if (m_bInAir) {
      StartModelAnim(DRAGONMAN_ANIM_AIRFLYLOOP, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(DRAGONMAN_ANIM_GROUNDWALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  FLOAT AirToGroundAnim(void) {
    StartModelAnim(DRAGONMAN_ANIM_AIRTOGROUND, 0);
    return(GetModelObject()->GetAnimLength(DRAGONMAN_ANIM_AIRTOGROUND));
  };
  FLOAT GroundToAirAnim(void) {
    StartModelAnim(DRAGONMAN_ANIM_GROUNDTOAIR, 0);
    return(GetModelObject()->GetAnimLength(DRAGONMAN_ANIM_GROUNDTOAIR));
  };
  void ChangeCollisionToAir() {
    ChangeCollisionBoxIndexWhenPossible(DRAGONMAN_COLLISION_BOX_AIR);
  };
  void ChangeCollisionToGround() {
    ChangeCollisionBoxIndexWhenPossible(DRAGONMAN_COLLISION_BOX_GROUND);
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
    if (m_bInAir) {
      vFlamePos = FLAME_AIR1;
    } else {
      vFlamePos = FLAME_GROUND1;
    }

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
  FlyFire(EVoid) : CEnemyFly::FlyFire {
    StartModelAnim(DRAGONMAN_ANIM_AIRATTACK02, 0);

    m_fFireTime = _pTimer->CurrentTick();
    FireFlame();
    m_bBurnEnemy = TRUE;
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
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

    StandingAnim();
    autowait(0.3f);
    return EReturn();
  };
  
  FlyHit(EVoid) : CEnemyFly::FlyHit {

    // if enemy near
    if (CalcDist(m_penEnemy) <= 15.0f) {
      // if enemy is not in water
      CMovableEntity *pen = (CMovableEntity *)&*m_penEnemy;
      CContentType &ctDn = pen->en_pwoWorld->wo_actContentTypes[pen->en_iDnContent];
      BOOL bEnemySwimming = !(ctDn.ct_ulFlags&CTF_BREATHABLE_LUNGS);
      if (bEnemySwimming) {
        jump FlyFire();
      } else {
        jump FlyOnEnemy();
      }
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.25f;
    return EReturn();
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyFly::Death {
    jump CEnemyFly::Death();
  };

  AirToGround(EVoid) : CEnemyFly::AirToGround {
    jump CEnemyFly::AirToGround(EVoid());
  };

  FlyOnEnemy(EVoid) {
    StartModelAnim(DRAGONMAN_ANIM_AIRATTACKCLOSELOOP, 0);

    // jump
    FLOAT3D vDir = PlayerDestinationPos();
    vDir = (vDir - GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fFlyCloseRunSpeed*1.9f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.9f, 0);
    m_iChargeHitAnimation = DRAGONMAN_ANIM_AIRATTACK02;
    m_fChargeHitDamage = 35.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 20.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;

    StandingAnim();
    autowait(0.3f);
    return EReturn();
  }

  GroundFire(EVoid) : CEnemyFly::GroundFire {
    StartModelAnim(DRAGONMAN_ANIM_GROUNDSTANDLOOP, 0);

    m_fFireTime = _pTimer->CurrentTick();
    FireFlame();
    m_bBurnEnemy = TRUE;
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
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

    StandingAnim();
    autowait(0.3f);
    return EReturn();
  };

  GroundHit(EVoid) : CEnemyFly::GroundHit {
    StartModelAnim(DRAGONMAN_ANIM_GROUNDATTACKCLOSELOOP, 0);

    // jump
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*1.75f;
    vDir(2) = 2.5f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.9f, 0);
    m_iChargeHitAnimation = DRAGONMAN_ANIM_GROUNDATTACKCLOSELOOP;
    m_fChargeHitDamage = 35.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 20.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;

    StandingAnim();
    autowait(0.3f);
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
    SetHealth(500.0f);
    m_fMaxHealth = 500.0f;
    en_tmMaxHoldBreath = 25.0f;
    en_fDensity = 4000.0f;
    m_bBoss = m_bBeBoss;
    
    m_sptType = SPT_BLOOD;

    // set your appearance
    SetModel(MODEL_DRAGON);
    SetModelMainTexture(TEXTURE_DRAGON);
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fAttackRunSpeed = FRnd()*2.0f + 9.0f;
    m_aAttackRotateSpeed = FRnd()*50 + 245.0f;
    m_fCloseRunSpeed = FRnd()*2.0f + 8.0f;
    m_aCloseRotateSpeed = FRnd()*50 + 245.0f;
    // setup attack distances
    m_fAttackDistance = 25.0f;
    m_fCloseDistance = 10.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 1000.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd() + 4.0f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*2.0f + 17.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*2.0f + 20.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    m_fGroundToAirSpeed = m_fFlyCloseRunSpeed;
    m_fAirToGroundSpeed = m_fFlyCloseRunSpeed;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 40.0f;
    m_fFlyCloseDistance = 15.0f;
    m_fFlyStopDistance = 0.0f;
    m_fFlyAttackFireTime = 3.0f;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 2000.0f;
    m_fBodyParts = 20;
    m_fDamageWounded = 200.0f;
    m_iScore = 6000;
    // flame source
    m_vFlameSource = FLOAT3D(0, 0, 0);
    m_fGroundToAirSpeed = m_fFlyAttackRunSpeed;
    m_fAirToGroundSpeed = m_fFlyAttackRunSpeed*2;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;

    // set stretch factors for height and width
    GetModelObject()->StretchModel(FLOAT3D(2.0f, 2.0f, 2.0f));
    ModelChangeNotify();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};

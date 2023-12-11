/*
Albino model by Dead Kadath
http://www.serioussite.ru/load/albino_enemy_model/13-1-0-2377

Coded by Rakanishu
June - Sept 2020
uses Beast code as a base 

___

This content is a resource enemy and does not act as a replacement.
___

Changlog:

JAREP_01 Version

- Added 2 Characters

Albino_V1.00

- Releaesd in June 2020: https://mentalcorps.forumgaming.fr/t1519-serious-sam-2-albino#7325
___

*/

336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Enemies/Beast/Beast.h"
#include "ModelsMP/Enemies/SS2/Albino/Albino.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum AlbinoType {
  0 AT_NORMAL         "Small",      // normal (fighter)
  1 AT_BIG            "Big",        // big
  2 AT_HUGE           "Huge",       // huge
};

%{
static float _tmLastStandingAnim =0.0f;  
#define ALBINO_STRETCH 3.0f
#define BIG_ALBINO_STRETCH 7.2f
#define HUGE_ALBINO_STRETCH 18.0f

// info structure
static EntityInfo eiAlbinoHuge = {
  EIBT_FLESH, 10000.0f,
  0.0f, 2.0f*HUGE_ALBINO_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*HUGE_ALBINO_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiAlbinoNormal = {
  EIBT_FLESH, 1500.0f,
  0.0f, 2.0f*ALBINO_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*ALBINO_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiAlbinoBig = {
  EIBT_FLESH, 5000.0f,
  0.0f, 2.0f*BIG_ALBINO_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*BIG_ALBINO_STRETCH, 0.0f,     // target (body)
};
%}

class CAlbino : CEnemyBase {
name      "Albino";
thumbnail "Thumbnails\\Albino.tbn";

properties:
  1 enum AlbinoType m_acType "Character" 'C' = AT_NORMAL,
  2 INDEX m_iCounter = 0,
  3 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  6 CTString m_strMessage "!JAREP V0.01b" = "Oct 8th 2020",     // message

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_ALBINO           "ModelsMP\\Enemies\\SS2\\Albino\\Albino.mdl",
 11 texture TEXTURE_ALBINO_NORMAL  "ModelsMP\\Enemies\\SS2\\Albino\\Albino.tex",
 12 texture TEXTURE_ALBINO_BIG     "ModelsMP\\Enemies\\SS2\\Albino\\AlbinoBlue.tex",
 13 texture TEXTURE_ALBINO_HUGE    "ModelsMP\\Enemies\\SS2\\Albino\\AlbinoDark.tex",

 14 model   MODEL_PLASMAGUN           "ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.mdl",
 15 texture TEXTURE_PLASMAGUN         "ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaPink.tex",

 16 model   MODEL_ARM           "ModelsMP\\Enemies\\SS2\\Albino\\Debris\\Arm.mdl",
 17 model   MODEL_LEGS           "ModelsMP\\Enemies\\SS2\\Albino\\Debris\\Legs.mdl",

 18 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 19 texture TEXTURE_FLESH_RED    "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",


// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\Kick.wav",
 55 sound   SOUND_DEATH     "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\Death.wav",
 56 sound   SOUND_DEATHBIG  "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\DeathBig.wav",
 57 sound   SOUND_ANGER     "ModelsMP\\Enemies\\SS2\\Albino\\Sounds\\Anger.wav",

 58 sound   SOUND_ROCKET    "Sounds\\Weapons\\RocketFly.wav",


functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("An Albino killed %s"), (const char*)strPlayerName);
    return str;
  }
    virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmNormal, "DataMP\\Messages\\Enemies\\SS2\\AlbinoNormal.txt");
    static DECLARE_CTFILENAME(fnmBig, "DataMP\\Messages\\Enemies\\SS2\\AlbinoBig.txt");
    static DECLARE_CTFILENAME(fnmHuge, "DataMP\\Messages\\Enemies\\SS2\\AlbinoHuge.txt");
    switch(m_acType) {
    default: ASSERT(FALSE);
    case AT_NORMAL: return fnmNormal;
    case AT_BIG: return fnmBig;
    case AT_HUGE: return fnmHuge;
    }
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_ANGER);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_KICK);
    PrecacheModel(MODEL_ALBINO);
	PrecacheModel(MODEL_PLASMAGUN);
	PrecacheTexture(TEXTURE_PLASMAGUN);
	PrecacheSound(SOUND_ROCKET);
    PrecacheTexture(TEXTURE_ALBINO_NORMAL);
    PrecacheTexture(TEXTURE_ALBINO_BIG);
	PrecacheClass(CLASS_PROJECTILE, PRT_ALBINO_PROJECTILE);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
    PrecacheModel(MODEL_ARM);
    PrecacheModel(MODEL_LEGS);

    if (m_acType == AT_NORMAL) {
      PrecacheSound(SOUND_DEATH);
    } else {
      PrecacheSound(SOUND_DEATHBIG);
    }
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_acType == AT_NORMAL) {
      return &eiAlbinoNormal;
    } else if (m_acType == AT_HUGE) {
      return &eiAlbinoHuge;
    } else {
      return &eiAlbinoBig;
    }
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
    if (m_acType == AT_BIG) {
      return 100.0f;
    } else if (m_acType == AT_HUGE) {
      return 200.0f;
    }
    return 0.0f;
  }

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // cannonballs inflict less damage then the default
    if(m_acType==AT_HUGE && dmtType==DMT_CANNONBALL)
    {
      fDamageAmmount *= 0.75f;
    }

    // can't harm own class
    if (!IsOfClass(penInflictor, "Albino")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);

    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    if((m_acType==AT_BIG || m_acType==AT_HUGE) && GetHealth() <= m_fMaxHealth/2) {
      iAnim = BEAST_ANIM_ANGER;
    } else {
      iAnim = BEAST_ANIM_WOUND;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if(m_acType==AT_BIG || m_acType==AT_HUGE) {
      iAnim = BEAST_ANIM_DEATHBIG;
    } else {
      iAnim = BEAST_ANIM_DEATH;
    }

    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==BEAST_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(BEAST_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    _tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(BEAST_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
    if(_pTimer->CurrentTick()>=_tmLastStandingAnim-_pTimer->TickQuantum &&
       _pTimer->CurrentTick()<=_tmLastStandingAnim+_pTimer->TickQuantum)
    {
      BREAKPOINT;
    }

    if(m_acType==AT_BIG || m_acType==AT_HUGE) {
      StartModelAnim(BEAST_ANIM_WALKBIG, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(BEAST_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
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
    if((m_acType==AT_BIG || m_acType==AT_HUGE) && GetHealth() <= m_fMaxHealth/2) {
      PlaySound(m_soSound, SOUND_ANGER, SOF_3D);
    } else {
      PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
    }
  };
  void DeathSound(void) {
    if (m_acType == AT_NORMAL) {
      PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
    } else {
      PlaySound(m_soSound, SOUND_DEATHBIG, SOF_3D);
    }
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(160.0f, 50.0f, 2.0f, 1.0f);
  };

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

    vNormalizedDamage *= 0.25f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_ALBINO_NORMAL, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_ALBINO_NORMAL, 0, 0, 0, IRnd()%4, 0.25f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEGS, TEXTURE_ALBINO_NORMAL, 0, 0, 0, IRnd()%4, 0.25f,
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

procedures:
/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    if (m_acType == AT_NORMAL) {
      jump CEnemyBase::Death();
    }
    
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
    autowait(0.9f);
    if (m_acType == AT_BIG) {
      ShakeItBaby(_pTimer->CurrentTick(), 2.0f);
    } else {
      ShakeItBaby(_pTimer->CurrentTick(), 3.0f);
    }
    autowait(2.3f-0.9f);
    if (m_acType == AT_BIG) {
      ShakeItBaby(_pTimer->CurrentTick(), 5.0f);
    } else {
      ShakeItBaby(_pTimer->CurrentTick(), 7.0f);
    }

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

    autowait(GetModelObject()->GetAnimLength(BEAST_ANIM_DEATHBIG)-2.3f);
    return EEnd();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire
  {
    // wait to finish walk and smooth change to idle
    StartModelAnim(BEAST_ANIM_WALKTOIDLE, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

    if( m_acType == AT_NORMAL)
    {
      StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
      autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      autowait(0.51f);

          ShootProjectile(PRT_ALBINO_PROJECTILE, FLOAT3D( 0.0f, 1.5f*ALBINO_STRETCH, 0.0f), ANGLE3D(0, 0, 0)); 
     
	  autowait(0.3f);
    }
    
    if(m_acType == AT_BIG)
    {
      if( GetHealth() <= m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<6)
        {
          StartModelAnim(BEAST_ANIM_ATTACKFAST, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          autowait(0.34f);

          ShootProjectile(PRT_ALBINO_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_ALBINO_STRETCH, 0.0f), ANGLE3D(0, 0, 0)); 

            //ANGLE3D( AngleDeg(40.0f*Cos(m_iCounter*360.0/6.0f)), AngleDeg(20.0f*Sin(m_iCounter*180.0/6.0f)), 0));
          //autowait(0.15f);
          m_iCounter++;
        }
        m_fAttackFireTime = 7.0f;
      }
      
      if( GetHealth() > m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<3)
        {
          StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          autowait(0.5f);

          ShootProjectile(PRT_ALBINO_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_ALBINO_STRETCH, 0.0f), ANGLE3D(0, 0, 0)); 
     
            //ANGLE3D( AngleDeg(20.0f*Cos(m_iCounter*360.0/3.0f)), AngleDeg(10.0f*Sin(m_iCounter*180.0/3.0f)), 0));
            //ANGLE3D( FRnd()*20.0f-10.0f, FRnd()*10.0f-5.0f, 0));
          //autowait(0.25f);
          m_iCounter++;
        }
      }
    }

    if(m_acType == AT_HUGE)
    {
      if( GetHealth() <= m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<6)
        {
          StartModelAnim(BEAST_ANIM_ATTACKFAST, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          autowait(0.34f);

          ShootProjectile(PRT_ALBINO_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_ALBINO_STRETCH, 0.0f), ANGLE3D(0, 0, 0)); 
     
            //ANGLE3D( AngleDeg(40.0f*Cos(m_iCounter*360.0/6.0f)), AngleDeg(20.0f*Sin(m_iCounter*180.0/6.0f)), 0));
          //autowait(0.15f);
          m_iCounter++;
        }
        m_fAttackFireTime = 7.0f;
      }
      
      if( GetHealth() > m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<3)
        {
          StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
          autowait(0.5f);

          ShootProjectile(PRT_ALBINO_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_ALBINO_STRETCH, 0.0f), ANGLE3D(0, 0, 0)); 
     
            //ANGLE3D( AngleDeg(20.0f*Cos(m_iCounter*360.0/3.0f)), AngleDeg(10.0f*Sin(m_iCounter*180.0/3.0f)), 0));
            //ANGLE3D( FRnd()*20.0f-10.0f, FRnd()*10.0f-5.0f, 0));
          //autowait(0.25f);
          m_iCounter++;
        }
      }
    }

    MaybeSwitchToAnotherPlayer();

    autowait(FRnd()/2 + _pTimer->TickQuantum); 

    if( m_penEnemy != NULL)
    {
      FLOAT fEnemyDistance = CalcDist(m_penEnemy);
      if( fEnemyDistance>m_fCloseDistance*1.25f)
      {
        StartModelAnim(BEAST_ANIM_IDLETOWALK, AOF_SMOOTHCHANGE);
        autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
        autowait(GetModelObject()->GetAnimLength(BEAST_ANIM_IDLETOWALK)/2.0f - _pTimer->TickQuantum); 
      }
    }
    

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    StartModelAnim(BEAST_ANIM_KICK, 0);
    autowait(0.45f);
    /*
    StartModelAnim(BEAST_ANIM_KICK, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    */
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_acType == AT_BIG) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 60.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_acType == AT_HUGE) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 90.0f, FLOAT3D(0, 0, 0), vDirection);
      } else  {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection);
      }
    }

    /*
    StartModelAnim(BEAST_ANIM_IDLE, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    */
    autowait(0.45f);
    MaybeSwitchToAnotherPlayer();
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
    en_tmMaxHoldBreath = 60.0f;

    en_fDensity = 1100.0f;
    // set your appearance
    SetModel(MODEL_ALBINO);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*2 + 5.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd() + 10.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 0.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_bBoss = m_bBeBoss;
    m_fStopDistance = 5.0f;
    m_fCloseDistance = 7.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    if (m_acType == AT_NORMAL)
    {
      m_fAttackRunSpeed = 6.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(700.0f);
      SetModelMainTexture(TEXTURE_ALBINO_NORMAL);
      m_fBlowUpAmount = 1000.0f;
	  m_fBlowUpSize = 6.0f;
      m_fBodyParts = 10;
      m_fDamageWounded = 450.0f;
      m_iScore = 7500;//500
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(ALBINO_STRETCH, ALBINO_STRETCH, ALBINO_STRETCH));
     ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 3.0f;
    }
    else if (m_acType == AT_BIG)
    {
      m_fAttackRunSpeed = 12.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(1500.0f);//500
      SetModelMainTexture(TEXTURE_ALBINO_BIG);
      m_fBlowUpAmount = 10000.0f;//500
      m_fBodyParts = 6;
      m_fDamageWounded = 650.0f;//500
      m_iScore = 12000; //1000
      m_fStopDistance = 15;
      m_fCloseDistance = 20;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BIG_ALBINO_STRETCH, BIG_ALBINO_STRETCH, BIG_ALBINO_STRETCH));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 5.0f;
    }
    else // HUGE
    {
      m_fAttackRunSpeed = 24.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(3000.0f);//500
      SetModelMainTexture(TEXTURE_ALBINO_HUGE);
      m_fBlowUpAmount = 100000.0f;//500
      m_fBodyParts = 6;
      m_fDamageWounded = 1200.0f;//500
      m_iScore = 30000; //1000
      m_fStopDistance = 45;
      m_fCloseDistance = 50;
      m_fAttackDistance = 1000.0f;
      m_fIgnoreRange = 1200.0f;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(HUGE_ALBINO_STRETCH, HUGE_ALBINO_STRETCH, HUGE_ALBINO_STRETCH));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 5.0f;
    }
    
    m_fMaxHealth = GetHealth();

	/********* Set modifiable health *********

    if (m_fHealth<=0.0f) { m_fHealth=1.0f; }
	SetHealth(m_fHealth); m_fMaxHealth = m_fHealth; */

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

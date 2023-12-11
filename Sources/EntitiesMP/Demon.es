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

336

%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/Demon/Demon.h"
#include "Models/Enemies/Elementals/Twister.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Twister";
uses "EntitiesMP/SpawnerProjectile";

enum DemonType {
  0 DE_NORMAL          "Normal",      // normal
  1 DE_STORM           "Storm",      // storm
  2 DE_ARCH            "Arch-vile",      // arch-vile
  3 DE_SUM            "Summoner",       // summoner
};


%{
#define REMINDER_DEATTACH_FIREBALL 666
#define CLOSE_ATTACK_RANGE 10.0f
#define DEMON_STRETCH 2.5f
#define DEMONSTORM_STRETCH 4.9f
#define DEMONARCH_STRETCH 3.7f
#define DEMONSUM_STRETCH 7.9f
FLOAT3D vFireballXLaunchPos = (FLOAT3D(0.06f, 2.6f, 0.15f)*DEMON_STRETCH);
FLOAT3D vTornadoXLaunchPos = (FLOAT3D(0.06f, 2.6f, 0.15f)*DEMONSTORM_STRETCH);
FLOAT3D vSpellXLaunchPos = (FLOAT3D(0.06f, 2.6f, 0.15f)*DEMONARCH_STRETCH);
FLOAT3D vSumXLaunchPos = (FLOAT3D(0.06f, 1.6f, 0.15f)*DEMONSUM_STRETCH);
#define TEMP_PER_GROUP 3  
static float _tmLastStandingAnim =0.0f;   
#define SPELL_HIT   FLOAT3D(0.0f, 1.0f, 0.0f)

// info structure
static EntityInfo eiDemon = {
  EIBT_FLESH, 1600.0f,
  0.0f, 4.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
%}

class CDemon : CEnemyBase {
name      "Demon";
thumbnail "Thumbnails\\Demon.tbn";

properties:
  1 enum DemonType m_deType     "Character" 'C' = DE_NORMAL,
  2 INDEX m_iCounter = 0,
  3 CEntityPointer m_penFireFX,
  4 BOOL m_bDeBoss  "Boss" 'B' = FALSE,
  5 BOOL m_bSleeping "Statue" 'S' = FALSE,
  6 BOOL  m_bInvulnerable = FALSE,
  8 FLOAT3D m_vSpellTarget = FLOAT3D( 0,0,0),
  9 FLOAT3D m_vSpellSource = FLOAT3D( 0,0,0),
 10 BOOL m_bSpellAttack = FALSE,

 11 INDEX m_iGroupCount = 0,
 12 CEntityPointer m_penSpawn1  "Template 1" 'T',
 13 CEntityPointer m_penSpawn2  "Template 2",
 14 CEntityPointer m_penSpawn3  "Template 3",
 
 15 INDEX   m_fgibTexture = TEXTURE_DEMON,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_TWISTER       "Classes\\Twister.ecl",
  4 class   CLASS_SPAWNER_PROJECTILE "Classes\\SpawnerProjectile.ecl",

 10 model   MODEL_DEMON         "ModelsMP\\Enemies\\Demon\\\\Demon.mdl",
 11 texture TEXTURE_DEMON       "ModelsMP\\Enemies\\Demon\\Demon.tex",
 12 texture TEXTURE_STATUE      "ModelsMP\\Gothic\\DemonStatue\\Demon.tex",
 13 texture TEXTURE_STORM       "AREP\\Models\\DemonX\\DemonBlue.tex",
 14 texture TEXTURE_ARCH       "ModelsMP\\Enemies\\Demon\\DemonYellow.tex",
 15 model   MODEL_FIREBALL      "ModelsMP\\Enemies\\Demon\\Projectile\\Projectile.mdl",
 16 texture TEXTURE_FIREBALL    "ModelsMP\\Enemies\\Demon\\Projectile\\Projectile.tex",
 17 texture TEXTURE_SUM       "ModelsMP\\Enemies\\Demon\\DemonPurple.tex",

 20 model   MODEL_ARM           "ModelsF\\Enemies\\Demon\\Debris\\Arm.mdl",
 21 model   MODEL_HEAD           "ModelsF\\Enemies\\Demon\\Debris\\Head.mdl",
 22 model   MODEL_WING           "ModelsF\\Enemies\\Demon\\Debris\\Wing.mdl",
 23 model   MODEL_LEG           "ModelsF\\Enemies\\Demon\\Debris\\Leg.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

 // ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsMP\\Enemies\\Demon\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsMP\\Enemies\\Demon\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsMP\\Enemies\\Demon\\Sounds\\Wound.wav",
 55 sound   SOUND_DEATH     "ModelsMP\\Enemies\\Demon\\Sounds\\Death.wav",
 57 sound   SOUND_CAST      "ModelsMP\\Enemies\\Demon\\Sounds\\Cast.wav",
 58 sound   SOUND_TWISTER   "AREP\\Models\\DemonX\\Sounds\\Twister.wav",
 59 sound   SOUND_ARCH      "ModelsMP\\Enemies\\Demon\\Sounds\\Arch.wav",
 60 sound   SOUND_SUM      "ModelsMP\\Enemies\\Demon\\Sounds\\Summon.wav",

functions:
 
  BOOL HandleEvent(const CEntityEvent &ee)
  {
    // when the shooting of projectile is over, this event comes
    // to make sure we deattach the projectile attachment (in case
    // the shooting was interrupted
    if (ee.ee_slEvent==EVENTCODE_EReminder)
    {
      EReminder eReminder = ((EReminder &) ee);
      if (eReminder.iValue==REMINDER_DEATTACH_FIREBALL)
      {
        RemoveAttachment(DEMON_ATTACHMENT_FIREBALL);
      }
      return TRUE;
    }
    return CEnemyBase::HandleEvent(ee);
  }

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANSV("A Demon executed %s"), (const char *) strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmDemon, "DataMP\\Messages\\Enemies\\Demon.txt");
    static DECLARE_CTFILENAME(fnmStorm, "DataMP\\Messages\\Enemies\\AREP\\DemonStorm.txt");
    static DECLARE_CTFILENAME(fnmArch, "DataMP\\Messages\\Enemies\\Arch-vile.txt");
    static DECLARE_CTFILENAME(fnmSum, "DataF\\Messages\\Enemies\\DemonSum.txt");
    switch(m_deType) {
    default: ASSERT(FALSE);
    case DE_NORMAL: return fnmDemon;
    case DE_STORM: return fnmStorm;
    case DE_ARCH: return fnmArch;
    case DE_SUM: return fnmSum;
   }
  };

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
   {
    if (slPropertyOffset == offsetof(CDemon, m_penSpawn1) && slPropertyOffset <= offsetof(CDemon, m_penSpawn3))
	 {
      return ValidEnemy(penTarget);
    } 
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }

  BOOL ValidEnemy(CEntity *pen) {
    if (pen == NULL || pen == this || !IsDerivedFromClass(pen, "Enemy Base")) {
      return FALSE;
    }
    return ((CEnemyBase&)*pen).m_bTemplate;
  };

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_CAST);
    PrecacheSound(SOUND_TWISTER);
    PrecacheSound(SOUND_SUM);
    PrecacheModel(MODEL_DEMON);
    PrecacheTexture(TEXTURE_DEMON);
    PrecacheTexture(TEXTURE_STATUE);
    PrecacheTexture(TEXTURE_STORM);
    PrecacheTexture(TEXTURE_SUM);
    PrecacheModel(MODEL_FIREBALL);
    PrecacheTexture(TEXTURE_FIREBALL);
    PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_PROJECTILE);
    PrecacheClass(CLASS_TWISTER);
    PrecacheClass(CLASS_PROJECTILE, PRT_METEOR_SIMPLE);
	
	PrecacheModel(MODEL_ARM);
	PrecacheModel(MODEL_HEAD);
	PrecacheModel(MODEL_WING);
	PrecacheModel(MODEL_LEG);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiDemon;
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

    // can't harm own class
    if (!IsOfClass(penInflictor, "Demon")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    RemoveAttachment(DEMON_ATTACHMENT_FIREBALL);
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

    RemoveAttachment(DEMON_ATTACHMENT_FIREBALL);
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

  void LaunchTwister(FLOAT3D vEnemyOffset)
  {
    // calculate parameters for predicted angular launch curve
    FLOAT3D vFirePos = vFireballXLaunchPos*DEMON_STRETCH*GetRotationMatrix();
    FLOAT3D vShooting = GetPlacement().pl_PositionVector + vFirePos;
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    
    // shoot in front of the enemy
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    
    // adjust target position
    vTarget += vEnemyOffset;

    CPlacement3D pl;
    CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1],
      vTarget, FLOAT3D(0.0f, 0.0f, 0.0f), 0.0f, fLaunchSpeed, fRelativeHdg);
    
    PrepareFreeFlyingProjectile(pl, vTarget, vFirePos, ANGLE3D( fRelativeHdg, 0.0f, 0.0f));
    
    ETwister et;
    CEntityPointer penTwister = CreateEntity(pl, CLASS_TWISTER);
    et.penOwner = this;
//    et.fSize = FRnd()*15.0f+5.0f;
    et.fSize = FRnd()*10.0f+DEMON_STRETCH/5.0f+3.0f;
    et.fDuration = 5.0f + FRnd()+5.0f;
    et.sgnSpinDir = (INDEX)(Sgn(FRnd()-0.5f));
    et.bGrow = TRUE;
    et.bMovingAllowed=TRUE;
    penTwister->Initialize(et);
    
    ((CMovableEntity &)*penTwister).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -fLaunchSpeed*0.8f), (CMovableEntity*)(CEntity*)this);
  }
  
  void ExplodeSpell(void)
  {
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_CANNON;
      eSpawnEffect.vStretch = FLOAT3D(1.0, 1.0, 1.0);
      CEntityPointer penExplosion = CreateEntity(CPlacement3D(m_vSpellTarget,
        ANGLE3D(0.0f, 0.0f, 0.0f)), CLASS_BASIC_EFFECT);
      penExplosion->Initialize(eSpawnEffect);
      
        // explosion debris
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      penExplosion = CreateEntity(CPlacement3D(m_vSpellTarget, 
        ANGLE3D(0.0f, 0.0f, 0.0f)), CLASS_BASIC_EFFECT);
      penExplosion->Initialize(eSpawnEffect);

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      penExplosion = CreateEntity(CPlacement3D(m_vSpellTarget, 
        ANGLE3D(0.0f, 0.0f, 0.0f)), CLASS_BASIC_EFFECT);
      penExplosion->Initialize(eSpawnEffect);

      InflictRangeDamage( this, DMT_EXPLOSION, 70.0f,
        m_vSpellTarget+SPELL_HIT, 1.0f, 5.0f);
  }


  void LaunchMonster1(void)
  {
    ASSERT(penTemplate!=NULL);
    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vSumXLaunchPos, ANGLE3D(0.0f+FRnd()*30, 5+FRnd()*10, 0));
    pl.RelativeToAbsolute(GetPlacement());
    
    ESpawnerProjectile esp;
    CEntityPointer penSProjectile = CreateEntity(pl, CLASS_SPAWNER_PROJECTILE);
    esp.penOwner = this;
    esp.penTemplate = m_penSpawn1;
    penSProjectile->Initialize(esp);
    
    ((CMovableEntity &)*penSProjectile).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -50.0f), (CMovableEntity*)(CEntity*)this);
  }

  void LaunchMonster2(void)
  {
    ASSERT(penTemplate!=NULL);
    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vSumXLaunchPos, ANGLE3D(0.0f+FRnd(), 5+FRnd()*10, 0));
    pl.RelativeToAbsolute(GetPlacement());
    
    ESpawnerProjectile esp;
    CEntityPointer penSProjectile = CreateEntity(pl, CLASS_SPAWNER_PROJECTILE);
    esp.penOwner = this;
    esp.penTemplate = m_penSpawn2;
    penSProjectile->Initialize(esp);
    
    ((CMovableEntity &)*penSProjectile).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -50.0f), (CMovableEntity*)(CEntity*)this);
  }


  void LaunchMonster3(void)
  {
    ASSERT(penTemplate!=NULL);
    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(vSumXLaunchPos, ANGLE3D(0.0f+FRnd()*-30, 5+FRnd()*10, 0));
    pl.RelativeToAbsolute(GetPlacement());
    
    ESpawnerProjectile esp;
    CEntityPointer penSProjectile = CreateEntity(pl, CLASS_SPAWNER_PROJECTILE);
    esp.penOwner = this;
    esp.penTemplate = m_penSpawn3;
    penSProjectile->Initialize(esp);
    
    ((CMovableEntity &)*penSProjectile).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -50.0f), (CMovableEntity*)(CEntity*)this);
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

    vNormalizedDamage *= 0.5f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);

    Debris_Spawn(this, this, MODEL_WING, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WING, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.3f,
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
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire
  {
    
    // SetDesiredTranslation???
    if (m_fMoveSpeed>0.0f) {
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, -m_fMoveSpeed));
    }
    
    if(m_deType == DE_ARCH)
    {
    
    //StartModelAnim(DEMON_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    StartModelAnim(DEMON_ANIM_ATTACK, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_ARCH, SOF_3D);

    autowait(1.0f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vSpellXLaunchPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    m_penFireFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penFireFX->Initialize(ese);

    autowait(1.8f);

      if (IsVisible(m_penEnemy)) {
        m_vSpellTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      } else if (TRUE) {
        m_vSpellTarget = m_vPlayerSpotted;
      }
      FLOAT3D vSource;
      vSource = GetPlacement().pl_PositionVector;
      // cast ray
	     m_vSpellSource=GetPlacement().pl_PositionVector;
         CCastRay crRay( this, m_vSpellSource, m_vSpellTarget);
         crRay.cr_bHitTranslucentPortals = FALSE;
         crRay.cr_bPhysical = FALSE;
         crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
         GetWorld()->CastRay(crRay);
      // if entity is hit
         if( crRay.cr_penHit != NULL)
         {
           m_bSpellAttack = TRUE;
        // damage enemy
           InflictDirectDamage(m_penEnemy, this, DMT_EXPLOSION, 20.0f, 
		   FLOAT3D(0, 0, 0), (m_vSpellSource-m_vSpellTarget).Normalize());
        FLOAT3D mDirection;
        GetPitchDirection(AngleDeg(10.0f), mDirection);
        KickEntity(m_penEnemy, 0.0);
		ExplodeSpell();
    }

    autowait(1.0f);
    }
    
    if(m_deType == DE_NORMAL)
    {
    
    //StartModelAnim(DEMON_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    StartModelAnim(DEMON_ANIM_ATTACK, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_CAST, SOF_3D);
    SpawnReminder(this, 3.0f, REMINDER_DEATTACH_FIREBALL);

    autowait(1.0f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vFireballXLaunchPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    m_penFireFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penFireFX->Initialize(ese);

    autowait(1.4f);
    
    AddAttachment(DEMON_ATTACHMENT_FIREBALL, MODEL_FIREBALL, TEXTURE_FIREBALL);
    CModelObject *pmoFire = &GetModelObject()->GetAttachmentModel(DEMON_ATTACHMENT_FIREBALL)->amo_moModelObject;
    pmoFire->StretchModel(FLOAT3D(DEMON_STRETCH, DEMON_STRETCH, DEMON_STRETCH));
    autowait(2.94f-2.4f);
    
    RemoveAttachment(DEMON_ATTACHMENT_FIREBALL);
    MaybeSwitchToAnotherPlayer();

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_DEMON_FIREBALL, vFireballXLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_DEMON_FIREBALL, vFireballXLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
      
    autowait(1.0f);
	}
    
    if(m_deType == DE_STORM)
    {
    
    //StartModelAnim(DEMON_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    StartModelAnim(DEMON_ANIM_ATTACK, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_TWISTER, SOF_3D);

    autowait(1.0f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vTornadoXLaunchPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    m_penFireFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penFireFX->Initialize(ese);

    autowait(2.0f);

    FLOAT3D vOffset;
    // static enemy
    if (((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute.Length()==0.0f) {
      // almost directly at the enemy
      FLOAT3D vPlayerToThis = GetPlacement().pl_PositionVector - m_penEnemy->GetPlacement().pl_PositionVector;
      vPlayerToThis.Normalize();
      vOffset = FLOAT3D(vPlayerToThis);
      LaunchTwister(vOffset);
    // moving enemy
    } else {
      FLOAT3D vPlayerSpeed = ((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute;
      if (vPlayerSpeed.Length()>15.0f) {
        vPlayerSpeed.Normalize();
        vPlayerSpeed = vPlayerSpeed;
      }
      vOffset = vPlayerSpeed;
      FLOAT3D vToPlayer = ((CMovableEntity &)*m_penEnemy).GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector;
      vToPlayer.Normalize();
      vOffset -= vToPlayer;
      LaunchTwister(vOffset);
    }

    MaybeSwitchToAnotherPlayer();
      
    autowait(1.0f);
	}
    
    if(m_deType == DE_SUM)
    {
    INDEX iRnd = IRnd()%2;
    switch(iRnd)
    {
    case 0:
        jump SumMeteor();
        break;
    case 1:
        jump SumSum();
        break;
    }

  };
    
    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    if (CalcDist(m_penEnemy) < 6.0f) {
      StartModelAnim(DEMON_ANIM_WOUND, 0);
      autowait(0.45f);
      PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
      if (CalcDist(m_penEnemy) < CLOSE_ATTACK_RANGE
        && IsInPlaneFrustum(m_penEnemy, CosFast(60.0f)))
      {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 50.0f, FLOAT3D(0, 0, 0), vDirection);
      }
      autowait(1.5f);
      MaybeSwitchToAnotherPlayer();
    } else {
      // run to enemy
      m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    }
    return EReturn();
  }

  Sleep(EVoid)
  {
    // start sleeping anim
    StartModelAnim(DEMON_ANIM_POSE2, AOF_LOOPING);
    SetModelMainTexture(TEXTURE_STATUE);
    m_bInvulnerable = TRUE;
    // repeat
    wait() {
      // if triggered
      on(ETrigger eTrigger) : {
        // remember enemy
        SetTargetSoft(eTrigger.penCaused);
        // wake up
        jump WakeUp();
      }
      // if damaged
      on(EDamage eDamage) : {
        // wake up
        jump WakeUp();
      }
      otherwise() : {
        resume;
      }
    }
  }

  WakeUp(EVoid)
  {
    // wakeup anim
    SightSound();
    m_bInvulnerable = FALSE;

    if(m_deType == DE_NORMAL)
    {
    SetModelMainTexture(TEXTURE_DEMON);
	}
    if(m_deType == DE_STORM)
    {
    SetModelMainTexture(TEXTURE_STORM);
	}

    // trigger your target
    SendToTarget(m_penDeathTarget, m_eetDeathType);
    // proceed with normal functioning
    return EReturn();
  }

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {
    // if sleeping
    if (m_bSleeping) {
      m_bSleeping = FALSE;
      // go to sleep until waken up
      wait() {
        on (EBegin) : {
          call Sleep();
        }
        on (EReturn) : {
          stop;
        };
        // if dead
        on(EDeath eDeath) : {
          // die
          jump CEnemyBase::Die(eDeath);
        }
      }
    }
    return EReturn();
  }

  SumMeteor(EVoid)
  {
    //StartModelAnim(DEMON_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    StartModelAnim(DEMON_ANIM_ATTACK, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_CAST, SOF_3D);

    autowait(1.0f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vSumXLaunchPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    m_penFireFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penFireFX->Initialize(ese);

    autowait(1.8f);
    MaybeSwitchToAnotherPlayer();

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_METEOR_SIMPLE, vSumXLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_METEOR_SIMPLE, vSumXLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
      
    autowait(1.0f);
    return EReturn();
   }

  SumSum(EVoid)
  {
    //StartModelAnim(DEMON_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    StartModelAnim(DEMON_ANIM_ATTACK, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_SUM, SOF_3D);

    autowait(1.0f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vSumXLaunchPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    m_penFireFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penFireFX->Initialize(ese);

    autowait(1.8f);
    MaybeSwitchToAnotherPlayer();

    LaunchMonster1();
    autowait(0.1f);
    LaunchMonster2();
    autowait(0.1f);
    LaunchMonster3();
      
    autowait(0.8f);
    return EReturn();
   }


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
    SetModel(MODEL_DEMON);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()/1.0f + 12.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 50.0f);
    m_fCloseRunSpeed = FRnd()/1.0f + 13.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 650.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 800.0f;
    m_bBoss = m_bDeBoss;
    m_fStopDistance = 5.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    m_fLockOnEnemyTime = 3.0f;

	if (m_deType == DE_NORMAL)
    {
      m_fAttackRunSpeed = FRnd()/1.0f + 9.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
      m_fCloseDistance = 12.0f;
      SetHealth(500.0f);
      SetModelMainTexture(TEXTURE_DEMON);
		m_fgibTexture = TEXTURE_DEMON;
	    m_fBlowUpSize = 8.4f;
      m_fBlowUpAmount = 770.0f;
      m_fBodyParts = 8;
      m_fDamageWounded = 250.0f;
      m_iScore = 5000;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(4.2f, 4.2f, 4.2f));
     ModelChangeNotify();
      m_sptType = SPT_BLOOD;
    }
    if (m_deType == DE_STORM)
    {
      m_fAttackRunSpeed = FRnd()/1.0f + 12.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
      m_fCloseDistance = 16.0f;
      SetHealth(800.0f);
      SetModelMainTexture(TEXTURE_STORM);
		m_fgibTexture = TEXTURE_STORM;
	    m_fBlowUpSize = 13.32f;
      m_fBlowUpAmount = 1500.0f;//500
      m_fBodyParts = 10;
      m_fDamageWounded = 350.0f;
      m_iScore = 8000; 
      m_fCloseDistance = 15;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(6.66f, 6.66f, 6.66f));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
    }
	if (m_deType == DE_ARCH)
    {
      m_fAttackRunSpeed = FRnd()/1.0f + 15.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
      m_fCloseDistance = 12.0f;
      SetHealth(700.0f);
      SetModelMainTexture(TEXTURE_ARCH);
		m_fgibTexture = TEXTURE_ARCH;
	    m_fBlowUpSize = 10.86f;
      m_fBlowUpAmount = 1500.0f;
      m_fBodyParts = 10;
      m_fDamageWounded = 400.0f;
      m_iScore = 7000;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(5.43f, 5.43f, 5.43f));
     ModelChangeNotify();
      m_sptType = SPT_BLOOD;
    }
	if (m_deType == DE_SUM)
    {
      m_fAttackRunSpeed = FRnd()/1.0f + 18.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
      m_fCloseDistance = 20.0f;
      SetHealth(3000.0f);
      SetModelMainTexture(TEXTURE_SUM);
		m_fgibTexture = TEXTURE_SUM;
      m_fBlowUpAmount = 100000000.0f;
      m_fBodyParts = 4;
      m_fDamageWounded = 800.0f;
      m_iScore = 100000;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(7.89f, 7.89f, 7.89f));
     ModelChangeNotify();
      m_sptType = SPT_BLOOD;
    }
    m_fMaxHealth = GetHealth();
    
    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

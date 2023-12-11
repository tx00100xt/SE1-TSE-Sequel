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

344
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/Guffy/Guffy.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Projectile";

enum GuffyChar {
  0 GUF_SOLDIER   "Soldier",    // soldier
  1 GUF_SERGEANT  "Sergeant",   // sergeant
  2 GUF_WARLORD   "Warlord",    // warlord
};


%{
// info structure
static EntityInfo eiGuffy = {
  EIBT_FLESH, 800.0f,
  0.0f, 1.9f, 0.0f,     // source (eyes)
  0.0f, 1.0f, 0.0f,     // target (body)
};

#define FIRE_LEFT_ARM   FLOAT3D(-0.56f, +1.125f, -1.32f)
#define FIRE_RIGHT_ARM  FLOAT3D(+0.50f, +1.060f, -0.82f)

#define FIRE_DEATH_LEFT   FLOAT3D( 0.0f, 7.0f, -2.0f)
#define FIRE_DEATH_RIGHT  FLOAT3D(3.75f, 4.2f, -2.5f)

#define WARLORD_ANGLE (10.0f)
#define WARLORD_LAUNCH (FLOAT3D(0.0f, 10.0f, 0.0f))

%}


class CGuffy : CEnemyBase {
name      "Guffy";
thumbnail "Thumbnails\\Guffy.tbn";

properties:
  1 enum GuffyChar m_GufChar   "Character" 'C' = GUF_SOLDIER,
  2 INDEX m_iLoopCounter = 0,
  3 FLOAT m_fSize = 1.0f,
  4 BOOL  m_bWalkSoundPlaying = FALSE,
  5 FLOAT m_fThreatDistance = 5.0f,
  6 BOOL  m_bEnemyToTheLeft = FALSE,

  7 INDEX m_iCounter = 0,
  8 BOOL m_bGuBoss  "Boss" 'B' = FALSE,

  10 CSoundObject m_soGrunt,
  11 CSoundObject m_soFire1,
  12 CSoundObject m_soFire2,
  13 BOOL m_bGruntSoundPlaying = FALSE,
  14 INDEX   m_fgibTexture = TEXTURE_GUFFY,
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

 10 model   MODEL_GUFFY         "ModelsMP\\Enemies\\Guffy\\Guffy.mdl",
 11 texture TEXTURE_GUFFY       "ModelsMP\\Enemies\\Guffy\\Guffy.tex",
 12 texture TEXTURE_SERGEANT    "AREP\\Models\\GuffyX\\GuffyRed.tex",
 13 texture TEXTURE_WARLORD     "AREP\\Models\\GuffyX\\GuffyGreen.tex",
 14 model   MODEL_GUN           "ModelsMP\\Enemies\\Guffy\\Gun.mdl",
 15 texture TEXTURE_GUN         "ModelsMP\\Enemies\\Guffy\\Gun.tex",
 16 texture TEXTURE_GUN_RED     "AREP\\Models\\GuffyX\\GunRed.tex",

 20 model   MODEL_GUFFY_ARM            "ModelsF\\Enemies\\Guffy\\Debris\\Arm.mdl",
 21 model   MODEL_GUFFY_LEGS           "ModelsF\\Enemies\\Guffy\\Debris\\Legs.mdl",
 22 model   MODEL_GUFFY_TUSK           "ModelsF\\Enemies\\Guffy\\Debris\\Tusk.mdl",

 23 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 24 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

// ************** SOUNDS **************
 40 sound   SOUND_IDLE          "ModelsMP\\Enemies\\Guffy\\Sounds\\Idle.wav",
 41 sound   SOUND_SIGHT         "ModelsMP\\Enemies\\Guffy\\Sounds\\Sight.wav",
 43 sound   SOUND_FIRE          "ModelsMP\\Enemies\\Guffy\\Sounds\\Fire.wav",
 44 sound   SOUND_WOUND         "ModelsMP\\Enemies\\Guffy\\Sounds\\Wound.wav",
 45 sound   SOUND_DEATH         "ModelsMP\\Enemies\\Guffy\\Sounds\\Death.wav",
 46 sound   SOUND_GRUNT         "AREP\\Models\\GuffyX\\Sounds\\Grunt.wav",

 47 sound   SOUND_IDLE_BIG          "AREP\\Models\\GuffyX\\Sounds\\BigIdle.wav",
 48 sound   SOUND_SIGHT_BIG         "AREP\\Models\\GuffyX\\Sounds\\BigSight.wav",
 49 sound   SOUND_FIRE_BIG          "AREP\\Models\\GuffyX\\Sounds\\BigFire.wav",
 50 sound   SOUND_WOUND_BIG         "AREP\\Models\\GuffyX\\Sounds\\BigWound.wav",
 51 sound   SOUND_DEATH_BIG         "AREP\\Models\\GuffyX\\Sounds\\BigDeath.wav",
 52 sound   SOUND_GRUNT_BIG         "AREP\\Models\\GuffyX\\Sounds\\BigGrunt.wav",

functions:

// describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANSV("Guffy gunned %s down"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier,  "DataMP\\Messages\\Enemies\\Guffy.txt");
    static DECLARE_CTFILENAME(fnmSergeant, "DataMP\\Messages\\Enemies\\AREP\\GuffyRed.txt");
    static DECLARE_CTFILENAME(fnmWarlord,  "DataMP\\Messages\\Enemies\\AREP\\GuffyGreen.txt");
    switch(m_GufChar) {
    default: ASSERT(FALSE);
    case GUF_SOLDIER:   return fnmSoldier;
    case GUF_SERGEANT:  return fnmSergeant;
    case GUF_WARLORD:   return fnmWarlord;
	}
  }
  /*// overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }*/

  BOOL ForcesCannonballToExplode(void)
  {
    if (m_GufChar==GUF_WARLORD) {
      return TRUE;
    }
    return CEnemyBase::ForcesCannonballToExplode();
  }

  void Precache(void) {
    CEnemyBase::Precache();
    
    // guffy
    PrecacheModel(MODEL_GUFFY);
    PrecacheTexture(TEXTURE_GUFFY);
    PrecacheTexture(TEXTURE_SERGEANT);
    PrecacheTexture(TEXTURE_WARLORD);

    // weapon
    PrecacheModel(MODEL_GUN);
    PrecacheTexture(TEXTURE_GUN);
    PrecacheTexture(TEXTURE_GUN_RED);

    // sounds
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_GRUNT);

    PrecacheSound(SOUND_IDLE_BIG );
    PrecacheSound(SOUND_SIGHT_BIG);
    PrecacheSound(SOUND_DEATH_BIG);
    PrecacheSound(SOUND_FIRE_BIG);
    PrecacheSound(SOUND_WOUND_BIG);
    PrecacheSound(SOUND_GRUNT_BIG);
    
    // projectile
    PrecacheClass(CLASS_PROJECTILE, PRT_GUFFY_PROJECTILE);
    PrecacheClass(CLASS_PROJECTILE, PRT_GRENADE);

	//debris
    PrecacheModel(MODEL_GUFFY_TUSK);
	PrecacheModel(MODEL_GUFFY_LEGS);
	PrecacheModel(MODEL_GUFFY_ARM);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);

  };

  // Entity info
  void *GetEntityInfo(void) {
    return &eiGuffy;
  };

  FLOAT GetCrushHealth(void)
  {
    if (m_GufChar==GUF_WARLORD) {
      return 100.0f;
    }
    return 0.0f;
  }

  // Receive damage
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    
    // take MORE damage from heavy bullets (e.g. sniper)
    if(dmtType==DMT_BULLET && fDamageAmmount>100.0f)
    {
      fDamageAmmount*=1.5f;
    }

    // guffy can't harm guffy
    if (!IsOfClass(penInflictor, "Guffy") ||
      ((CGuffy*)penInflictor)->m_GufChar!=m_GufChar) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
    // if caught in range of a nuke ball
    if (dmtType==DMT_CANNONBALL_EXPLOSION && GetHealth()<=0) {
      // must blow up easier
      m_fBlowUpAmount = m_fBlowUpAmount*0.75f;
    }
  };

  // grunting sounds
  void ActivateGruntSound(void)
  {
    if (!m_bGruntSoundPlaying) {
      if(m_GufChar==GUF_WARLORD) {
        PlaySound(m_soGrunt, SOUND_GRUNT_BIG, SOF_3D|SOF_LOOP);
      } else {
        PlaySound(m_soGrunt, SOUND_GRUNT, SOF_3D|SOF_LOOP);
      }
      m_bGruntSoundPlaying = TRUE;
    }
  }
  void DeactivateGruntSound(void)
  {
    m_soGrunt.Stop();
    m_bGruntSoundPlaying = FALSE;
  }


  // virtual anim functions
  void StandingAnim(void) {
    DeactivateGruntSound();
    StartModelAnim(GUFFY_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };
  /*void StandingAnimFight(void)
  {
    StartModelAnim(GUFFY_ANIM_FIRE, AOF_LOOPING|AOF_NORESTART);
  }*/
  void RunningAnim(void) {
    ActivateGruntSound();
    StartModelAnim(GUFFY_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    RunningAnim();
  };
  void RotatingAnim(void) {
    StartModelAnim(GUFFY_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };

  // virtual sound functions
  void IdleSound(void) {
    if(m_GufChar==GUF_WARLORD) {
      PlaySound(m_soSound, SOUND_IDLE_BIG, SOF_3D);
    } else {
      PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
    }
  };
  void SightSound(void) {
    if(m_GufChar==GUF_WARLORD) {
      PlaySound(m_soSound, SOUND_SIGHT_BIG, SOF_3D);
    } else {
      PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
    }
  };
  void WoundSound(void) {
    if(m_GufChar==GUF_WARLORD) {
      PlaySound(m_soSound, SOUND_WOUND_BIG, SOF_3D);
    } else {
      PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
    }
  };
  void DeathSound(void) {
    if(m_GufChar==GUF_WARLORD) {
      PlaySound(m_soSound, SOUND_DEATH_BIG, SOF_3D);
    } else {
      PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
    }
  };

  // fire rocket
  void FireRocket(FLOAT3D &vPos) {
    CPlacement3D plRocket;
    plRocket.pl_PositionVector = vPos;
    plRocket.pl_OrientationAngle = ANGLE3D(0, -5.0f-FRnd()*10.0f, 0);
    plRocket.RelativeToAbsolute(GetPlacement());
    CEntityPointer penProjectile = CreateEntity(plRocket, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_GUFFY_PROJECTILE;
    penProjectile->Initialize(eLaunch);
  };
  
  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire1.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soGrunt.Set3DParameters(100.0f, 10.0f, 1.0f, 1.0f);
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    DeactivateGruntSound();
    INDEX iAnim;
    iAnim = GUFFY_ANIM_WOUND;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };
  
  // death
  INDEX AnimForDeath(void) {
    DeactivateGruntSound();
    INDEX iAnim;
    FLOAT3D vFront;
    GetHeadingDirection(0, vFront);
    FLOAT fDamageDir = m_vDamage%vFront;
    if (fDamageDir<0) {
      iAnim = GUFFY_ANIM_DEATHBACKWARD;
    } else {
      iAnim = GUFFY_ANIM_DEATHFORWARD;
    }

    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  FLOAT WaitForDust(FLOAT3D &vStretch) {
    vStretch=FLOAT3D(1,1,2)*1.5f;
    if(GetModelObject()->GetAnim()==GUFFY_ANIM_DEATHBACKWARD)
    {
      return 0.48f;
    }
    else if(GetModelObject()->GetAnim()==GUFFY_ANIM_DEATHFORWARD)
    {
      return 1.0f;
   }
    return -1.0f;
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
	FLOAT fDebrisSize = 0.35f;

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, fEntitySize, vNormalizedDamage, vBodySpeed, 2.0f, 1.0f);

    Debris_Spawn(this, this, MODEL_GUFFY_ARM, m_fgibTexture, 0, 0, 0, 0, fDebrisSize,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_GUFFY_ARM, m_fgibTexture, 0, 0, 0, 0, fDebrisSize,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_GUFFY_LEGS, m_fgibTexture, 0, 0, 0, 0, fDebrisSize,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_GUFFY_TUSK, m_fgibTexture, 0, 0, 0, 0, fDebrisSize,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_GUFFY_TUSK, m_fgibTexture, 0, 0, 0, 0, fDebrisSize,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_GUFFY_TUSK, m_fgibTexture, 0, 0, 0, 0, fDebrisSize,
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
  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateGruntSound();
    
    if(m_GufChar == GUF_SOLDIER)
    {
    
     StartModelAnim(GUFFY_ANIM_FIRE, AOF_LOOPING);
    
     // wait for animation to bring the left hand into firing position
     autowait(0.1f);

     FLOATmatrix3D m;
     FLOAT3D fLookRight = FLOAT3D(1.0f, 0.0f, 0.0f);
     MakeRotationMatrixFast(m, GetPlacement().pl_OrientationAngle);
     fLookRight = fLookRight * m;
     BOOL bEnemyRight = (BOOL) (fLookRight % (m_penEnemy->GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector));

     if (bEnemyRight>=0) {  // enemy is to the right of guffy
      ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);
      
      ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(-9, 0, 0));
      PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);
     } else { // enemy is to the left of guffy
      ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_LEFT_ARM*m_fSize, ANGLE3D(9, 0, 0));
      PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);
      
      ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);
     }
	}
    
    if(m_GufChar == GUF_SERGEANT)
    {
     m_iCounter = 0;
     while ( m_iCounter<4)
	 {
    
      StartModelAnim(GUFFY_ANIM_FIRE, 0);
    
      // wait for animation to bring the left hand into firing position
      autowait(0.1f);

      FLOATmatrix3D m;
      FLOAT3D fLookRight = FLOAT3D(1.0f, 0.0f, 0.0f);
      MakeRotationMatrixFast(m, GetPlacement().pl_OrientationAngle);
      fLookRight = fLookRight * m;
      BOOL bEnemyRight = fLookRight % (m_penEnemy->GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector);

      if (bEnemyRight>=0) {  // enemy is to the right of guffy
        ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);
      
        ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(-2, 0, 0));
        PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);
      } else { // enemy is to the left of guffy
        ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_LEFT_ARM*m_fSize, ANGLE3D(2, 0, 0));
        PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);
      
        ShootProjectile(PRT_GUFFY_PROJECTILE, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);
    }
       autowait(0.5f);
       m_iCounter++;
	 }
	}
    
    if(m_GufChar == GUF_WARLORD)
    {
    
     StartModelAnim(GUFFY_ANIM_FIRE, 0);
    
     // wait for animation to bring the left hand into firing position
     autowait(0.1f);

    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, WARLORD_LAUNCH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      WARLORD_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);

      // target enemy body
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, WARLORD_ANGLE, 0));
      PlaySound(m_soFire1, SOUND_FIRE_BIG, SOF_3D);
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_GRENADE;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);

     autowait(0.035f);

    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, WARLORD_LAUNCH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      WARLORD_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);

      // target enemy body
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(-12, WARLORD_ANGLE, 0));
      PlaySound(m_soFire2, SOUND_FIRE_BIG, SOF_3D);
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_GRENADE;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);
      

     autowait(0.5f);
     StartModelAnim(GUFFY_ANIM_FIRE, 0);
    
     // wait for animation to bring the left hand into firing position
     autowait(0.1f);

    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, WARLORD_LAUNCH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      WARLORD_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);

      // target enemy body
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_LEFT_ARM*m_fSize, ANGLE3D(12, WARLORD_ANGLE, 0));
      PlaySound(m_soFire1, SOUND_FIRE_BIG, SOF_3D);
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_GRENADE;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);

     autowait(0.035f);

    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, WARLORD_LAUNCH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      WARLORD_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);

      // target enemy body
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, WARLORD_ANGLE, 0));
      PlaySound(m_soFire2, SOUND_FIRE_BIG, SOF_3D);
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_GRENADE;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);
	}
    autowait(1.0f);
    
    StopMoving();
    
    MaybeSwitchToAnotherPlayer();

    // wait for a while
    StandingAnimFight();
    autowait(FRnd()*0.25f+0.25f);

    return EReturn();
  };


/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  /*Death(EVoid) : CEnemyBase::Death {
    // stop moving
    StopMoving();
    DeathSound();     // death sound
    
    // set physic flags
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags() | ENF_SEETHROUGH);

    // death notify (change collision box)
    ChangeCollisionBoxIndexWhenPossible(GUFFY_COLLISION_BOX_DEATH);

    // start death anim
    StartModelAnim(GUFFY_ANIM_DEATHFORWARD, 0);
    autowait(GetModelObject()->GetAnimLength(GUFFY_ANIM_TOFIRE));
    
    return EEnd();
  };*/

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_fDensity = 2000.0f;
    m_bBoss = m_bGuBoss;
    en_tmMaxHoldBreath = 25.0f;

    // set your appearance
    SetModel(MODEL_GUFFY);
    if (m_GufChar==GUF_SOLDIER) {
      SetHealth(210.0f);
      m_fMaxHealth = 210.0f;
      m_fSize = 1.5f;
      SetModelMainTexture(TEXTURE_GUFFY);
		m_fgibTexture = TEXTURE_GUFFY;
      AddAttachment(GUFFY_ATTACHMENT_GUNRIGHT, MODEL_GUN, TEXTURE_GUN);
      AddAttachment(GUFFY_ATTACHMENT_GUNLEFT, MODEL_GUN, TEXTURE_GUN);
      GetModelObject()->StretchModel(FLOAT3D(m_fSize, m_fSize, m_fSize));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(GUFFY_ATTACHMENT_GUNRIGHT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-1,1,1));
      m_fBlowUpAmount = 400.0f;
      m_iScore = 3000;

      StandingAnim();
      // setup moving speed
      m_fWalkSpeed = FRnd() + 2.5f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
      m_fAttackRunSpeed = FRnd() + 5.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      m_fCloseRunSpeed = FRnd() + 5.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      // setup attack distances
      m_fAttackDistance = 150.0f;
      m_fCloseDistance = 0.0f;
      m_fStopDistance = 25.0f;
      m_fAttackFireTime = 5.0f;
      m_fCloseFireTime = 5.0f;
      m_fIgnoreRange = 250.0f;
      // damage/explode properties
      m_fBodyParts = 5;
      m_fDamageWounded = 100.0f;
	  }

    if (m_GufChar==GUF_SERGEANT) {
      SetHealth(460.0f);
      m_fMaxHealth = 460.0f;
      m_fSize = 2.0f;
      SetModelMainTexture(TEXTURE_SERGEANT);
		m_fgibTexture = TEXTURE_SERGEANT;
      AddAttachment(GUFFY_ATTACHMENT_GUNRIGHT, MODEL_GUN, TEXTURE_GUN);
      AddAttachment(GUFFY_ATTACHMENT_GUNLEFT, MODEL_GUN, TEXTURE_GUN);
      GetModelObject()->StretchModel(FLOAT3D(m_fSize, m_fSize, m_fSize));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(GUFFY_ATTACHMENT_GUNRIGHT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-1.5,1.5,1.5));
      m_fBlowUpAmount = 1000.0f;
      m_iScore = 5000;

      StandingAnim();
      // setup moving speed
      m_fWalkSpeed = FRnd() + 3.5f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
      m_fAttackRunSpeed = FRnd() + 6.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      m_fCloseRunSpeed = FRnd() + 6.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      // setup attack distances
      m_fAttackDistance = 400.0f;
      m_fCloseDistance = 0.0f;
      m_fStopDistance = 25.0f;
      m_fAttackFireTime = 5.0f;
      m_fCloseFireTime = 5.0f;
      m_fIgnoreRange = 250.0f;
      // damage/explode properties
      m_fBodyParts = 10;
      m_fDamageWounded = 150.0f;
	  }

    if (m_GufChar==GUF_WARLORD) {
      SetHealth(700.0f);
      m_fMaxHealth = 700.0f;
      m_fSize = 2.5f;
      SetModelMainTexture(TEXTURE_WARLORD);
		m_fgibTexture = TEXTURE_WARLORD;
      AddAttachment(GUFFY_ATTACHMENT_GUNRIGHT, MODEL_GUN, TEXTURE_GUN_RED);
      AddAttachment(GUFFY_ATTACHMENT_GUNLEFT, MODEL_GUN, TEXTURE_GUN_RED);
      GetModelObject()->StretchModel(FLOAT3D(m_fSize, m_fSize, m_fSize));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(GUFFY_ATTACHMENT_GUNRIGHT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-2.0,2.0,2.0));
      m_fBlowUpAmount = 100000.0f;
      m_iScore = 7000;

      StandingAnim();
      // setup moving speed
      m_fWalkSpeed = FRnd() + 4.5f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
      m_fAttackRunSpeed = FRnd() + 8.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      m_fCloseRunSpeed = FRnd() + 8.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      // setup attack distances
      m_fAttackDistance = 300.0f;
      m_fCloseDistance = 0.0f;
      m_fStopDistance = 25.0f;
      m_fAttackFireTime = 5.0f;
      m_fCloseFireTime = 5.0f;
      m_fIgnoreRange = 250.0f;
      // damage/explode properties
      m_fBodyParts = 15;
      m_fDamageWounded = 200.0f;
	  }
    
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

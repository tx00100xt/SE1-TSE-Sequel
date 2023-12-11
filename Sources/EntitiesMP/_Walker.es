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

/****************************************************

              Original Walker.es by Croteam

- Texture re-work by ZynChroMaTiK

- Artillery content code implementation and models placement  by Rakanishu

- Texture from Serious Sam Classics: Revolution and XBOX 2006 mod.

- Thanks to Heming_Hitrowski, dragon99919, Dreamy Cecil, ZynChroMaTiK for helping.

Date: June / September 2020

User note:

- To be able to make your own enemy class, you must
  invoke the function InitParticles(); in MainLoop in
  EnemyBase.es

- For any question, you can ask me: seriousseditorrk@gmail.com

Timeline:
- Sept 2020: Created Gunner type
- June 2020: Created Artillery type

*****************************************************/

324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Enemies/Walker/Walker.h"
#include "ModelsMP/JAREP01/Rakanishu/Walker/WalkerCannon.h"
#include "ModelsMP/JAREP01/Rakanishu/Walker/WalkerMinigun.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Projectile";
uses "EntitiesMP/CannonBall";
uses "EntitiesMP/Bullet";
uses "EntitiesMP/Reminder";

enum WalkerChar {
  0 WLC_SOLDIER   "Soldier",    // soldier
  1 WLC_SERGEANT  "Sergeant",   // sergeant
  2 WLC_CANNON	  "Artillery",  // cannon
  3 WLC_MG   	  "Gunner",     // gunner
};

%{
// info structure
static EntityInfo eiWalker = {
  EIBT_FLESH, 1000.0f,
  0.0f, 4.5f, 0.0f,
  0.0f, 4.5f, 0.0f,
};

#define SIZE_SOLDIER   (0.5f)
#define SIZE_SERGEANT  (1.0f)
#define SIZE_CANNON    (1.5f)
#define SIZE_MG        (0.8f)

//#define FIRE_LEFT_ARM	   FLOAT3D(-2.5f, 5.0f, 0.0f)
#define FIRE_LEFT_CANNON   FLOAT3D(-2.5f, 5.0f, -1.0f)
//#define FIRE_RIGHT_ARM	   FLOAT3D(+2.5f, 5.0f, 0.0f)
//#define FIRE_RIGHT_CANNON  FLOAT3D(+2.5f, 5.0f, -1.0f)
//#define FIRE_DEATH_LEFT    FLOAT3D( 0.0f, 7.0f, -2.0f)
//#define FIRE_DEATH_RIGHT   FLOAT3D(3.75f, 4.2f, -2.5f)

static FLOAT3D FIRE_LEFT_ARM     =  FLOAT3D(-2.5f, 5.0f, 0.0f);
//static FLOAT3D FIRE_LEFT_CANNON  =  FLOAT3D(-2.5f, 5.0f, -1.0f);
static FLOAT3D FIRE_RIGHT_ARM    =  FLOAT3D(+2.5f, 5.0f, 0.0f);
static FLOAT3D FIRE_RIGHT_CANNON =  FLOAT3D(+2.5f, 5.0f, -1.0f);
static FLOAT3D FIRE_DEATH_LEFT   =  FLOAT3D( 0.0f, 7.0f, -2.0f);
static FLOAT3D FIRE_DEATH_RIGHT  =  FLOAT3D(3.75f, 4.2f, -2.5f);

#define WALKERSOUND(soundname) ((m_EwcChar==WLC_SOLDIER || m_EwcChar==WLC_MG)? (SOUND_SOLDIER_##soundname) : (m_EwcChar==WLC_CANNON ? (SOUND_MONSTER_##soundname) : (SOUND_SERGEANT_##soundname)))
%}


class CWalker : CEnemyBase {
name      "Walker";
thumbnail "Thumbnails\\Walker.tbn";

properties:
  1 enum WalkerChar m_EwcChar   "Character" 'C' = WLC_SOLDIER,
  2 INDEX m_iLoopCounter = 0,
  3 FLOAT m_fSize = 1.0f,
  4 BOOL m_bWalkSoundPlaying = FALSE,
  5 FLOAT m_fThreatDistance = 5.0f,
  6 BOOL m_bWaBoss  "Boss" 'B' = FALSE,
  7 CTString m_strMessage "!JAREP V0.01b" = "Oct 8th 2020",     // message

  10 CSoundObject m_soFeet,
  11 CSoundObject m_soFire1,
  12 CSoundObject m_soFire2,
  13 CSoundObject m_soFire3,
  14 CSoundObject m_soFire4,

  15 INDEX m_bFireBulletCount = 0,       // fire bullet binary divider
  16 INDEX   m_fgibTexture = TEXTURE_WALKER_SOLDIER,
{
  CEntity *penBullet;     // bullet
  CLightSource m_lsLightSource;
}
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_CANNONBALL    "Classes\\CannonBall.ecl",
  4 class   CLASS_BULLET        "Classes\\Bullet.ecl",

 10 model   MODEL_WALKER              "Models\\Enemies\\Walker\\Walker.mdl",
 11 model   MODEL_WALKERCANNON        "ModelsMP\\JAREP01\\Rakanishu\\Walker\\WalkerCannon.mdl", // ModelsMP\JAREP01\Rakanishu\Walker
 22 model   MODEL_WALKER_MG           "ModelsMP\\JAREP01\\Rakanishu\\Walker\\WalkerMinigun.mdl",

 12 texture TEXTURE_WALKER_SOLDIER    "Models\\Enemies\\Walker\\Walker02.tex",
 13 texture TEXTURE_WALKER_SERGEANT   "Models\\Enemies\\Walker\\Walker01.tex",
 14 texture TEXTURE_WALKER_CANNON     "ModelsMP\\JAREP01\\Rakanishu\\Walker\\Walker03.tex",
 21 texture TEXTURE_WALKER_MG         "ModelsMP\\Enemies\\Walker\\WalkerYellow.tex",

 15 model   MODEL_LASER               "Models\\Enemies\\Walker\\Laser.mdl",
 16 texture TEXTURE_LASER             "Models\\Enemies\\Walker\\Laser.tex",
 17 model   MODEL_ROCKETLAUNCHER      "Models\\Enemies\\Walker\\RocketLauncher.mdl",
 18 texture TEXTURE_ROCKETLAUNCHER    "Models\\Enemies\\Walker\\RocketLauncher.tex",
 19 model   MODEL_CANNONWALKER        "ModelsMP\\JAREP01\\Rakanishu\\Walker\\CannonWalker.mdl", // weapon 
 20 texture TEXTURE_CANNONWALKER      "ModelsMP\\JAREP01\\Rakanishu\\Walker\\CannonWalker.tex", // weapon

 23 model   MODEL_MG1        "Models\\Weapons\\MiniGun\\Body.mdl", // weapon
 24 texture TEXTURE_MG1      "Models\\Weapons\\MiniGun\\Body.tex", // weapon
 
 25 model   MODEL_MG2        "Models\\Weapons\\MiniGun\\Barrels.mdl", // weapon
 26 texture TEXTURE_MG2      "Models\\Weapons\\MiniGun\\Barrels.tex", // weapon

 71 model   MODEL_WALKER_TORSO   "ModelsJTH\\Enemies\\Walker\\Debris\\Torso.mdl",
 72 model   MODEL_WALKER_LEG     "ModelsJTH\\Enemies\\Walker\\Debris\\Leg.mdl",
 73 model   MODEL_WALKER_LEG2     "ModelsJTH\\Enemies\\Walker\\Debris\\Leg2.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_SOLDIER_IDLE        "Models\\Enemies\\Walker\\Sounds\\Soldier\\Idle.wav",
 51 sound   SOUND_SOLDIER_SIGHT       "Models\\Enemies\\Walker\\Sounds\\Soldier\\Sight.wav",
 53 sound   SOUND_SOLDIER_FIRE_LASER  "Models\\Enemies\\Walker\\Sounds\\Soldier\\Fire.wav",
 54 sound   SOUND_SOLDIER_DEATH       "Models\\Enemies\\Walker\\Sounds\\Soldier\\Death.wav",
 55 sound   SOUND_SOLDIER_WALK        "Models\\Enemies\\Walker\\Sounds\\Soldier\\Walk.wav",

 60 sound   SOUND_SERGEANT_IDLE        "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Idle.wav",
 61 sound   SOUND_SERGEANT_SIGHT       "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Sight.wav",
 63 sound   SOUND_SERGEANT_FIRE_ROCKET "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Fire.wav",
 64 sound   SOUND_SERGEANT_DEATH       "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Death.wav",
 65 sound   SOUND_SERGEANT_WALK        "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Walk.wav",

 80 sound   SOUND_MONSTER_IDLE         "ModelsMP\\JAREP01\\Rakanishu\\Walker\\Sounds\\Monster\\Idle.wav",
 81 sound   SOUND_MONSTER_SIGHT        "ModelsMP\\JAREP01\\Rakanishu\\Walker\\Sounds\\Monster\\Sight.wav",
 82 sound   SOUND_MONSTER_FIRE_CANNON  "ModelsMP\\JAREP01\\Rakanishu\\Walker\\Sounds\\Monster\\Fire.wav",
 83 sound   SOUND_MONSTER_DEATH        "ModelsMP\\JAREP01\\Rakanishu\\Walker\\Sounds\\Monster\\Death.wav",
 84 sound   SOUND_MONSTER_WALK         "ModelsMP\\JAREP01\\Rakanishu\\Walker\\Sounds\\Monster\\Walk.wav",
 
 90 sound   SOUND_GUNNER_FIRE_BULLET  "ModelsMP\\JAREP01\\Rakanishu\\Walker\\Sounds\\Gunner\\Fire.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANSV("A Biomech blew %s away"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier,  "Data\\Messages\\Enemies\\WalkerSmall.txt");
    static DECLARE_CTFILENAME(fnmSergeant, "Data\\Messages\\Enemies\\WalkerBig.txt");
	static DECLARE_CTFILENAME(fnmCannon,   "DataMP\\Messages\\Enemies\\JAREP01\\WalkerLarge.txt");
	static DECLARE_CTFILENAME(fnmMg,       "DataMP\\Messages\\Enemies\\JAREP01\\WalkerMG.txt");
    switch(m_EwcChar) {
    default: ASSERT(FALSE);
    case WLC_SOLDIER:   return fnmSoldier;
    case WLC_SERGEANT:  return fnmSergeant;
	case WLC_CANNON:    return fnmCannon;
	case WLC_MG:        return fnmMg;
    }
  }
  // overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }

  BOOL ForcesCannonballToExplode(void)
  {
    if (m_EwcChar==WLC_SERGEANT) {
      return TRUE;
    }
    return CEnemyBase::ForcesCannonballToExplode();
  }

  void Precache(void) {
    CEnemyBase::Precache();
	  PrecacheModel(MODEL_WALKER_TORSO);
	  PrecacheModel(MODEL_WALKER_LEG);
	  PrecacheModel(MODEL_WALKER_LEG2);

    if (m_EwcChar==WLC_SOLDIER)
    {
	  PrecacheModel(MODEL_WALKER);
      // sounds
      PrecacheSound(SOUND_SOLDIER_IDLE );
      PrecacheSound(SOUND_SOLDIER_SIGHT);
      PrecacheSound(SOUND_SOLDIER_DEATH);
      PrecacheSound(SOUND_SOLDIER_FIRE_LASER);
      PrecacheSound(SOUND_SOLDIER_WALK);
      // model's texture
      PrecacheTexture(TEXTURE_WALKER_SOLDIER);
      // weapon
      PrecacheModel(MODEL_LASER);
      PrecacheTexture(TEXTURE_LASER);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_CYBORG_LASER);
	  //models
    }
    else if (m_EwcChar==WLC_SERGEANT)
    {
      PrecacheModel(MODEL_WALKER);
	  // sounds
      PrecacheSound(SOUND_SERGEANT_IDLE);
      PrecacheSound(SOUND_SERGEANT_SIGHT);
      PrecacheSound(SOUND_SERGEANT_DEATH);
      PrecacheSound(SOUND_SERGEANT_FIRE_ROCKET);
      PrecacheSound(SOUND_SERGEANT_WALK);
      // model's texture
      PrecacheTexture(TEXTURE_WALKER_SERGEANT);
      // weapon
      PrecacheModel(MODEL_ROCKETLAUNCHER);
      PrecacheTexture(TEXTURE_ROCKETLAUNCHER);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_WALKER_ROCKET);
    } else if (m_EwcChar==WLC_MG)
    {
      PrecacheModel(MODEL_WALKER);
	  // sounds
      PrecacheSound(SOUND_SOLDIER_IDLE);
      PrecacheSound(SOUND_SOLDIER_SIGHT);
      PrecacheSound(SOUND_SOLDIER_DEATH);
      PrecacheSound(SOUND_SOLDIER_FIRE_LASER);
      PrecacheSound(SOUND_SOLDIER_WALK);
      // model's texture
      PrecacheTexture(TEXTURE_WALKER_MG);
      // weapon
      // PrecacheModel(MODEL_MG);
      // PrecacheTexture(TEXTURE_MG);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_WALKER_ROCKET);
    } else if (m_EwcChar==WLC_CANNON)
    {
      PrecacheModel(MODEL_WALKERCANNON);
	  // sounds
      PrecacheSound(SOUND_MONSTER_IDLE );
      PrecacheSound(SOUND_MONSTER_SIGHT);
      PrecacheSound(SOUND_MONSTER_DEATH);
      PrecacheSound(SOUND_MONSTER_FIRE_CANNON);
      PrecacheSound(SOUND_MONSTER_WALK);
      // model's texture
      PrecacheTexture(TEXTURE_WALKER_CANNON);
      // weapon
      PrecacheModel(MODEL_CANNONWALKER);
      PrecacheTexture(TEXTURE_CANNONWALKER);
      // projectile
      PrecacheClass(CLASS_CANNONBALL, CBT_IRON);
    }
  };
  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiWalker;
  };

  FLOAT GetCrushHealth(void)
  {
    if (m_EwcChar==WLC_SERGEANT || m_EwcChar==WLC_CANNON) {
      return 100.0f;
    }
    return 0.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

	/* // artillery walker take no damage from cannonballs
	if (m_EwcChar==WLC_CANNON && dmtType==DMT_CANNONBALL)
	{
		fDamageAmmount=0;
	} */

    // walker can't harm walker
    if (!IsOfClass(penInflictor, "Walker") ||
      ((CWalker*)penInflictor)->m_EwcChar!=m_EwcChar) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
    // if caught in range of a nuke ball
    if (dmtType==DMT_CANNONBALL_EXPLOSION && GetHealth()<=0 && m_EwcChar!=WLC_SERGEANT) {
      // must blow up easier
      m_fBlowUpAmount = m_fBlowUpAmount*0.75f;
    }
  };


  // virtual anim functions
  void StandingAnim(void) {
    DeactivateWalkingSound();
    StartModelAnim(WALKER_ANIM_STAND01, AOF_LOOPING|AOF_NORESTART);
  };
  void StandingAnimFight(void)
  {
    DeactivateWalkingSound();
    StartModelAnim(WALKER_ANIM_IDLEFIGHT, AOF_LOOPING|AOF_NORESTART);
  }
  void WalkingAnim(void) {
    ActivateWalkingSound();
    if (m_EwcChar==WLC_SERGEANT || m_EwcChar==WLC_CANNON) {
      StartModelAnim(WALKER_ANIM_WALKBIG, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(WALKER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
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
    PlaySound(m_soSound, WALKERSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, WALKERSOUND(SIGHT), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, WALKERSOUND(DEATH), SOF_3D);
  };

  // walking sounds
  void ActivateWalkingSound(void)
  {
    if (!m_bWalkSoundPlaying) {
      PlaySound(m_soFeet, WALKERSOUND(WALK), SOF_3D|SOF_LOOP);
      m_bWalkSoundPlaying = TRUE;
    }
  }
  void DeactivateWalkingSound(void)
  {
    m_soFeet.Stop();
    m_bWalkSoundPlaying = FALSE;
  }

  // fire death cannon
  void FireDeathCannon(FLOAT3D &vPos) {
    CPlacement3D plCannonball;
    plCannonball.pl_PositionVector = vPos;
    plCannonball.pl_OrientationAngle = ANGLE3D(0, -5.0f-FRnd()*10.0f, 0);
    plCannonball.RelativeToAbsolute(GetPlacement());
    CEntityPointer penBall = CreateEntity(plCannonball, CLASS_CANNONBALL);
    ELaunchCannonBall eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.fLaunchPower = 140.0f;
    eLaunch.cbtType = CBT_IRON;
    eLaunch.fSize = 3.0f;
    penBall->Initialize(eLaunch);
  };

  // fire death rocket
  void FireDeathRocket(const FLOAT3D &vPos) {
    CPlacement3D plRocket;
    plRocket.pl_PositionVector = vPos;
    plRocket.pl_OrientationAngle = ANGLE3D(0, -5.0f-FRnd()*10.0f, 0);
    plRocket.RelativeToAbsolute(GetPlacement());
    CEntityPointer penProjectile = CreateEntity(plRocket, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_WALKER_ROCKET;
    penProjectile->Initialize(eLaunch);
  };
  // fire death laser
  void FireDeathLaser(const FLOAT3D &vPos) {
    CPlacement3D plLaser;
    plLaser.pl_PositionVector = vPos;
    plLaser.pl_OrientationAngle = ANGLE3D(0, -5.0f-FRnd()*10.0f, 0);
    plLaser.RelativeToAbsolute(GetPlacement());
    CEntityPointer penProjectile = CreateEntity(plLaser, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_CYBORG_LASER;
    penProjectile->Initialize(eLaunch);
  };

  // fire death bullet
  void FireDeathBullet(FLOAT3D &vPos) {
    CPlacement3D plBullet;
    plBullet.pl_PositionVector = vPos;
    plBullet.pl_OrientationAngle = ANGLE3D(0, -5.0f-FRnd()*10.0f, 0);
    plBullet.RelativeToAbsolute(GetPlacement());
    CEntityPointer penBullet = CreateEntity(plBullet, CLASS_BULLET);
    EBulletInit eInit;
    eInit.penOwner = this;
    eInit.fDamage = 2;
    penBullet->Initialize(eInit);
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFeet.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire1.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire3.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire4.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  // spawn body parts
  void BlowUp(void)
  {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.75f;
    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_NONE, BET_NONE, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 0.5f);

    Debris_Spawn(this, this, MODEL_WALKER_TORSO, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WALKER_LEG, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WALKER_LEG2, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLESH_SPLAT_FX;
      penSplat->Initialize(ese);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_LIGHT_CANNON;
      eSpawnEffect.vStretch = FLOAT3D(1.0f,1.0f,1.0f);
      penExplosion->Initialize(eSpawnEffect);

      // explosion debris
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionDebris->Initialize(eSpawnEffect);

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionSmoke->Initialize(eSpawnEffect);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };


/************************************************************
 *                   FIRE BULLET / RAIL                     *
 ************************************************************/
  BOOL CanFireAtPlayer(void)
  {
    // get ray source and target
    FLOAT3D vSource, vTarget;
    GetPositionCastRay(this, m_penEnemy, vSource, vTarget);

    // bullet start position
    CPlacement3D plBullet;
    plBullet.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBullet.pl_PositionVector = FLOAT3D(-2.5f, 5.0f, 0);
    // offset are changed according to stretch factor
    plBullet.pl_PositionVector*=SIZE_MG;
    plBullet.RelativeToAbsolute(GetPlacement());
    vSource = plBullet.pl_PositionVector;

    // cast the ray
    CCastRay crRay(this, vSource, vTarget);
    crRay.cr_ttHitModels = CCastRay::TT_NONE;     // check for brushes only
    crRay.cr_bHitTranslucentPortals = FALSE;
    en_pwoWorld->CastRay(crRay);

    // if hit nothing (no brush) the entity can be seen
    return (crRay.cr_penHit==NULL);     
  }

  void PrepareBullet(FLOAT fDamage) {
    // bullet start position
    CPlacement3D plBullet;
    plBullet.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBullet.pl_PositionVector = FLOAT3D(-2.5f, 5.0f, 0);
    // offset are changed according to stretch factor
    plBullet.pl_PositionVector*=SIZE_MG;
    plBullet.RelativeToAbsolute(GetPlacement());
    // create bullet
    penBullet = CreateEntity(plBullet, CLASS_BULLET);
    // init bullet
    EBulletInit eInit;
    eInit.penOwner = this;
    eInit.fDamage = 3;
    penBullet->Initialize(eInit);
  };

  // fire bullet
  void FireBullet(void) {
    // binary divide counter
    m_bFireBulletCount++;
    if (m_bFireBulletCount>1) { m_bFireBulletCount = 0; }
    if (m_bFireBulletCount==1) { return; }
    // bullet
    PrepareBullet(3.0f);
    ((CBullet&)*penBullet).CalcTarget(m_penEnemy, 250);
    ((CBullet&)*penBullet).CalcJitterTarget(20);
    ((CBullet&)*penBullet).LaunchBullet( TRUE, TRUE, TRUE);
    ((CBullet&)*penBullet).DestroyBullet();
  };


/************************************************************
 *                S H O O T  C A N N O N                    *
 ************************************************************/

  // shoot cannonball on enemy
  CEntity *ShootCannonball(FLOAT3D &vOffset, ANGLE3D &aOffset) {
    ASSERT(m_penEnemy != NULL);

	FLOAT fLaunchSpeed=140.0f;

    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PreparePropelledProjectile(pl, vShootTarget, vOffset, aOffset);
    CEntityPointer penBall = CreateEntity(pl, CLASS_CANNONBALL);
    ELaunchCannonBall eLaunch;

    eLaunch.fLaunchPower = fLaunchSpeed;

    eLaunch.cbtType = CBT_IRON;
    eLaunch.fSize = 3.0f;
    penBall->Initialize(eLaunch);

    return penBall;
  };


procedures:

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(WALKER_ANIM_TOFIRE, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(WALKER_ANIM_TOFIRE);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    // sergeant 4 rockets
    if (m_EwcChar==WLC_SERGEANT) {
      StartModelAnim(WALKER_ANIM_FIRERIGHT, AOF_LOOPING);
      ShootProjectile(PRT_WALKER_ROCKET, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_SERGEANT_FIRE_ROCKET, SOF_3D);
      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_fLockOnEnemyTime = 1.0f;
      } else {
        m_fLockOnEnemyTime = 0.5f;
      }
      autocall CEnemyBase::LockOnEnemy() EReturn;
      StartModelAnim(WALKER_ANIM_FIRELEFT, AOF_LOOPING);
      ShootProjectile(PRT_WALKER_ROCKET, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_SERGEANT_FIRE_ROCKET, SOF_3D);

//      m_fLockOnEnemyTime = 0.25f;
//      autocall CEnemyBase::LockOnEnemy() EReturn;
    } 
    if (m_EwcChar==WLC_SOLDIER) {
      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_iLoopCounter = 4;
      } else {
        m_iLoopCounter = 8;
      }
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(WALKER_ANIM_FIRELEFT, AOF_LOOPING);
          ShootProjectile(PRT_CYBORG_LASER, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        } else {
          StartModelAnim(WALKER_ANIM_FIRERIGHT, AOF_LOOPING);
          ShootProjectile(PRT_CYBORG_LASER, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 0.4f;
          } else {
            m_fLockOnEnemyTime = 0.1f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
    }

	if (m_EwcChar==WLC_MG) {
      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_iLoopCounter = 6;
      } else {
        m_iLoopCounter = 12;
      }
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(WALKER_ANIM_FIRELEFT, AOF_LOOPING);
          FireBullet();
        } else {
          StartModelAnim(WALKER_ANIM_FIRERIGHT, AOF_LOOPING);
          FireBullet();
        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_GUNNER_FIRE_BULLET, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_GUNNER_FIRE_BULLET, SOF_3D);
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_GUNNER_FIRE_BULLET, SOF_3D);
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_GUNNER_FIRE_BULLET, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 0.4f;
          } else {
            m_fLockOnEnemyTime = 0.1f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
    }

	if (m_EwcChar==WLC_CANNON) {
      m_iLoopCounter = 4;
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(WALKER_ANIM_FIRELEFT, AOF_LOOPING);
          ShootCannonball((FIRE_LEFT_CANNON*static_cast<FLOAT3D>(m_fSize)), ANGLE3D(0, 3.5f, 0));

        } else {
          StartModelAnim(WALKER_ANIM_FIRERIGHT, AOF_LOOPING);
          ShootCannonball(FIRE_RIGHT_CANNON*m_fSize, ANGLE3D(0, 3.5f, 0));

        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_MONSTER_FIRE_CANNON, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_MONSTER_FIRE_CANNON, SOF_3D);
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_MONSTER_FIRE_CANNON, SOF_3D);
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_MONSTER_FIRE_CANNON, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 1.0f;
          } else {
            m_fLockOnEnemyTime = 0.5f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
	}

    StopMoving();

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(WALKER_ANIM_FROMFIRE, 0);
    autowait(GetModelObject()->GetAnimLength(WALKER_ANIM_FROMFIRE));

    // wait for a while
    StandingAnimFight();
    autowait(FRnd()*0.1f+0.1f);

    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    // stop moving
    StopMoving();
    DeathSound();     // death sound
    DeactivateWalkingSound();

    // set physic flags
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags() | ENF_SEETHROUGH);

    // stop making fuss
    RemoveFromFuss();

    // death notify (change collision box)
    ChangeCollisionBoxIndexWhenPossible(WALKER_COLLISION_BOX_DEATH);

    // start death anim
    StartModelAnim(WALKER_ANIM_DEATH, 0);
    autowait(0.9f);

    // one rocket/laser from left or right arm
    if (m_EwcChar==WLC_SERGEANT) {
      if (IRnd()&1) {
        FireDeathRocket(FIRE_DEATH_RIGHT*m_fSize);
      } else {
        FireDeathRocket(FIRE_DEATH_LEFT*m_fSize);
      }
      PlaySound(m_soSound, SOUND_SERGEANT_FIRE_ROCKET, SOF_3D);
    }
	if (m_EwcChar==WLC_CANNON) {
      if (IRnd()&1) {
        FireDeathCannon(FIRE_DEATH_RIGHT*m_fSize);
      } else {
        FireDeathCannon(FIRE_DEATH_LEFT*m_fSize);
      }
      PlaySound(m_soSound, SOUND_MONSTER_FIRE_CANNON, SOF_3D);
    }
    if (m_EwcChar==WLC_SOLDIER) {
      if (IRnd()&1) {
        FireDeathLaser(FIRE_DEATH_RIGHT*m_fSize);
      } else {
        FireDeathLaser(FIRE_DEATH_LEFT*m_fSize);
      }
      PlaySound(m_soFire2, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
    }
	if (m_EwcChar==WLC_MG) {
      if (IRnd()&1) {
        FireDeathBullet(FIRE_DEATH_RIGHT*m_fSize);
      } else {
        FireDeathBullet(FIRE_DEATH_LEFT*m_fSize);
      }
      PlaySound(m_soFire2, SOUND_GUNNER_FIRE_BULLET, SOF_3D);
    }
    autowait(0.25f);

    FLOAT fStretch=2.0f;
    if (m_EwcChar==WLC_SERGEANT)
    {
      fStretch=4.0f;
    }
    // spawn dust effect
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1.5,1,1)*fStretch;
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_DUST_FALL;
    CPlacement3D plSmoke=plFX;
    plSmoke.pl_PositionVector+=FLOAT3D(0,0.35f*ese.vStretch(2),0);
    CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);

    autowait(0.35f);

    return EEnd();
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
    en_tmMaxHoldBreath = 25.0f;
    if (m_EwcChar==WLC_SERGEANT) {
      SetHealth(750.0f);
      m_fMaxHealth = 750.0f;
    } else if (m_EwcChar==WLC_SOLDIER) {
      SetHealth(150.0f);
      m_fMaxHealth = 150.0f;
    } else if (m_EwcChar==WLC_MG) {
      SetHealth(450.0f);
      m_fMaxHealth = 450.0f;
    } else if (m_EwcChar==WLC_CANNON) {
      SetHealth(1500.0f);
      m_fMaxHealth = 1500.0f;
    }
    en_fDensity = 3000.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS;
	m_bBoss = m_bWaBoss;

    // set your appearance
    if (m_EwcChar==WLC_SERGEANT) {
      SetModel(MODEL_WALKER);
	  m_fSize = 1.0f;
      SetModelMainTexture(TEXTURE_WALKER_SERGEANT);
		m_fgibTexture = TEXTURE_WALKER_SERGEANT;
      AddAttachment(WALKER_ATTACHMENT_ROCKETLAUNCHER_LT, MODEL_ROCKETLAUNCHER, TEXTURE_ROCKETLAUNCHER);
      AddAttachment(WALKER_ATTACHMENT_ROCKETLAUNCHER_RT, MODEL_ROCKETLAUNCHER, TEXTURE_ROCKETLAUNCHER);
      GetModelObject()->StretchModel(FLOAT3D(1,1,1));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(WALKER_ATTACHMENT_ROCKETLAUNCHER_RT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-1,1,1));
      m_fBlowUpAmount = 1000;
	  m_fBlowUpSize = 2.0f;
      m_iScore = 7500;
      m_fThreatDistance = 15;
    } else if (m_EwcChar==WLC_SOLDIER) {
      SetModel(MODEL_WALKER);
	  m_fSize = 0.5f;
      SetModelMainTexture(TEXTURE_WALKER_SOLDIER);
		m_fgibTexture = TEXTURE_WALKER_SOLDIER;
      AddAttachment(WALKER_ATTACHMENT_LASER_LT, MODEL_LASER, TEXTURE_LASER);
      AddAttachment(WALKER_ATTACHMENT_LASER_RT, MODEL_LASER, TEXTURE_LASER);
      GetModelObject()->StretchModel(FLOAT3D(0.5f,0.5f,0.5f));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(WALKER_ATTACHMENT_LASER_RT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-0.5f,0.5f,0.5f));
      m_fBlowUpAmount = 300.0f;
	  m_fBlowUpSize = 1.0f;
      //m_fBlowUpAmount = 100.0f;
      //m_bRobotBlowup = TRUE;
      m_iScore = 2000;
      m_fThreatDistance = 5;
    } else if (m_EwcChar==WLC_MG) {
      SetModel(MODEL_WALKER_MG);
	  m_fSize = 0.8f;
      SetModelMainTexture(TEXTURE_WALKER_MG);
		m_fgibTexture = TEXTURE_WALKER_MG;
      AddAttachment(WALKERMINIGUN_ATTACHMENT_MGA, MODEL_MG1, TEXTURE_MG1);
      AddAttachment(WALKERMINIGUN_ATTACHMENT_MGB, MODEL_MG1, TEXTURE_MG1);
	  AddAttachment(WALKERMINIGUN_ATTACHMENT_MGC, MODEL_MG2, TEXTURE_MG2);
      AddAttachment(WALKERMINIGUN_ATTACHMENT_MGD, MODEL_MG2, TEXTURE_MG2);
      GetModelObject()->StretchModel(FLOAT3D(0.8f,0.8f,0.8f));
      ModelChangeNotify();
      CModelObject *pmoRight1 = &GetModelObject()->GetAttachmentModel(WALKERMINIGUN_ATTACHMENT_MGA)->amo_moModelObject;
      pmoRight1->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
	  CModelObject *pmoLeft1 = &GetModelObject()->GetAttachmentModel(WALKERMINIGUN_ATTACHMENT_MGB)->amo_moModelObject;
      pmoLeft1->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
	  CModelObject *pmoRight2 = &GetModelObject()->GetAttachmentModel(WALKERMINIGUN_ATTACHMENT_MGC)->amo_moModelObject;
      pmoRight2->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
	  CModelObject *pmoLeft2 = &GetModelObject()->GetAttachmentModel(WALKERMINIGUN_ATTACHMENT_MGD)->amo_moModelObject;
      pmoLeft2->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
      m_fBlowUpAmount = 700;
	  m_fBlowUpSize = 1.6f;
      //m_fBlowUpAmount = 100.0f;
      //m_bRobotBlowup = TRUE;
      m_iScore = 5000;
      m_fThreatDistance = 5;
    } else if (m_EwcChar==WLC_CANNON) {
      SetModel(MODEL_WALKERCANNON);
	  m_fSize = 1.5f;
      SetModelMainTexture(TEXTURE_WALKER_CANNON);
      AddAttachment(WALKER_ATTACHMENT_ROCKETLAUNCHER_LT, MODEL_CANNONWALKER, TEXTURE_CANNONWALKER);
      AddAttachment(WALKER_ATTACHMENT_ROCKETLAUNCHER_RT, MODEL_CANNONWALKER, TEXTURE_CANNONWALKER);
      GetModelObject()->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(WALKERCANNON_ATTACHMENT_CANNON_RT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-1.5f,1.5f,1.5f));
      m_fBlowUpAmount = 1E10f;
      //m_fBlowUpAmount = 100.0f;
      //m_bRobotBlowup = TRUE;
      m_iScore = 10000;
      m_fThreatDistance = 25;
    }
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*1.5f + 9.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
    m_fAttackRunSpeed = m_fWalkSpeed;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2;
    m_fCloseRunSpeed = m_fWalkSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2;
    m_fWalkSpeed/=2.0f;
    // setup attack distances
    m_fAttackDistance = 150.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 15.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 300.0f;
    // damage/explode properties
    m_fBodyParts = 8;
    m_fDamageWounded = 100000.0f;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

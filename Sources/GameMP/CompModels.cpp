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

#include "StdAfx.h"
#include "LCDDrawing.h"

#ifdef DECL_DLL
#undef DECL_DLL
#endif
#define DECL_DLL
#ifdef FIRST_ENCOUNTER
#include "Entities/Common/Particles.h"
#else
#include "EntitiesMP/Common/Particles.h"
#endif

#include "Models/Enemies/Headman/headman.h"
#include "Models/Enemies/Eyeman/Eyeman.h"
#include "Models/Enemies/Boneman/Boneman.h"
#include "Models/Enemies/WereBull/WereBull.h"
#include "Models/Enemies/SCORPMAN/scorpman.h"
#include "Models/Enemies/Walker/Walker.h"
#include "ModelsMP/JAREP01/Rakanishu/Walker/WalkerCannon.h"
#include "ModelsMP/JAREP01/Rakanishu/Walker/WalkerMinigun.h"
#include "Models/Enemies/Woman/Woman.h"
#include "Models/Enemies/Gizmo/Gizmo.h"
#include "Models/Enemies/Fish/Fish.h"
#include "Models/Enemies/Beast/Beast.h"
#include "Models/Enemies/Devil/Devil.h"
#include "Models/Enemies/ElementalLava/ElementalLava.h"
#include "ModelsMP/Enemies/Guffy/Guffy.h" 
#include "ModelsMP/Enemies/Grunt/Grunt.h"
#include "ModelsMP/Enemies/Demon/Demon.h"
#include "ModelsMP/Enemies/ChainSawFreak/Freak.h"
#include "ModelsMP/Enemies/CannonStatic/Turret.h"
#include "ModelsMP/Enemies/CannonRotating/Turret.h"
#include "ModelsMP/Enemies/CannonRotating/RotatingMechanism.h"
#include "ModelsMP/Enemies/Summoner/Summoner.h"
#include "ModelsMP/Enemies/ExotechLarva/Body.h"
#include "ModelsMP/Enemies/ExotechLarva/ExotechLarva.h"
#include "ModelsMP/Enemies/ExotechLarva/Arm.h"
#include "ModelsMP/Enemies/ExotechLarva/BackArms.h"
#include "ModelsMP/Enemies/AirElemental/Elemental.h"

#include "Models/Weapons/Knife/KnifeItem.h"
#include "Models/Weapons/Colt/ColtItem.h"
#include "Models/Weapons/SingleShotgun/SingleShotgunItem.h"
#include "Models/Weapons/DoubleShotgun/DoubleShotgunItem.h"
#include "Models/Weapons/MiniGun/MiniGunItem.h"
#include "Models/Weapons/TommyGun/TommyGunItem.h"
#include "ModelsF/Weapons/RocketLauncher/RocketLauncherItem.h"
#include "Models/Weapons/GrenadeLauncher/GrenadeLauncherItem.h"
#include "Models/Weapons/Laser/LaserItem.h"
#include "Models/Weapons/Cannon/Cannon.h"
#include "ModelsF/Weapons/Sniper/SniperItem.h"
#include "ModelsMP/Weapons/ChainSaw/ChainsawItem.h"
#include "ModelsMP/Weapons/ChainSaw/BladeForPlayer.h"
#include "ModelsMP/Weapons/Flamer/FlamerItem.h"

#include "ModelsF/Enemies/Catman/Catman.h"
#include "ModelsF/Enemies/Catman/Armor.h"
#include "AREP/Models/Cyborg2/Cyborg.h"
#include "AREP/Models/DevilAlpha/Devil.h"
#include "ModelsF/Enemies/Fishman/Fishman2.h"
#include "ModelsF/Enemies/Fishman/Spear.h"
#include "AREP/Models/Huanman2/Huanman.h"
#include "AREP/Models/Mamut2/MAMUT.H"
#include "AREP/Models/Mamutman2/Mamutman.h"
#include "AREP/Models/Mantaman2/Mantaman.h"
#include "AREP/Models/Sentry/DrivingWheel/Robot.h"
#include "AREP/Models/Sentry/FlyingFighter/FlyingFighter.h"
#include "AREP/Models/Waterman/WaterMan.h"
#include "AREP/Models/Sentry/DrivingWheel/Robot.h"
#include "AREP/Models/Sentry/FlyingFighter/FlyingFighter.h"
#include "AREP/Models/Dragonman2/Dragonman.h"

#include "ModelsF/NextEncounter/Enemies/DumDum/DumDum.h"
#include "ModelsF/NextEncounter/Enemies/Tweedle/Tweedle.h"
#include "ModelsF/NextEncounter/Enemies/Tweedle/Propeller.h"
#include "ModelsF/NextEncounter/Enemies/Monkey/Monkey.h"
#include "ModelsF/NextEncounter/Enemies/DibDib/DibDib.h"
#include "ModelsF/NextEncounter/Enemies/Gladiator/Gladiator.h"
#include "ModelsF/NextEncounter/Enemies/Chariot/Chariot.h"
#include "ModelsF/NextEncounter/Enemies/Chariot/Wheel.h"
#include "ModelsF/NextEncounter/Enemies/Scorpion/Scorpion.h"
#include "ModelsF/NextEncounter/Enemies/DevilStallion/DevilStallion.h"
#include "ModelsF/NextEncounter/Enemies/Ant/Ant.h"
#include "ModelsF/NextEncounter/Enemies/Lurker/Lurker.h"
#include "ModelsF/NextEncounter/Enemies/Guardian/Guardian.h"
#include "ModelsF/NextEncounter/Enemies/Gladiator/Gladiator.h"

#include "ModelsMP/Enemies/SS2/Albino/Albino.h"
#include "ModelsMP/Enemies/SS2/Centaur/Centaur.h"
#include "ModelsMP/Enemies/SS2/Cerberus/Cerberus.h"
#include "ModelsMP/Enemies/SS2/Floater/Floater.h"
#include "ModelsMP/Enemies/SS2/FlyingKleer/FlyingKleer.h"
#include "ModelsMP/Enemies/SS4/Kalopsy/Kalopsy.h"
#include "ModelsMP/Enemies/SS3/Kleer/LostSoul.h"
#include "ModelsMP/Enemies/SS2/Lizard/Lizard.h"
#include "ModelsMP/Enemies/SS2/Primitive/Primitive.h"
#include "ModelsMP/Enemies/SS2/ScorpSoldier/ScorpNoGun.h"
#include "ModelsMP/Enemies/SS2/Spawner/Spawner.h"
#include "ModelsMP/Enemies/SS3/SpiderSmall/SpiderSmall.h"
#include "ModelsMP/Enemies/SS2/MechaSpider/Legs.h"
#include "ModelsMP/Enemies/SS2/MechaSpider/Body.h"
#include "ModelsMP/Enemies/SS2/Tank/TankBod.h"
#include "ModelsMP/Enemies/SS3/WitchBride/WitchBrideNoTent.h"

#include "ModelsF/Enemies/Ram/Ram.h"
#include "ModelsF/Enemies/Crabman/Crabman2.h"
#include "ModelsF/Enemies/Runner/Runner.h"
#include "ModelsF/Enemies/RobotDog/robot_dog.h"
#include "ModelsF/Enemies/Mecha/Mecha.h"
#include "ModelsF/Enemies/Neptune/Neptune2.h"
#include "ModelsF/Enemies/Juggernaut/Mesh/Mesh.h"
#include "ModelsF/Enemies/Panda/Panda.h"
#include "ModelsF/Enemies/BuffGnaar/BuffGnaar.h"

#include "ModelsMP/Weapons/PlasmaThrower/LaserItem.h"
#include "Models/Weapons/GhostBuster/GhostBusterItem.h"
#include "ModelsF/Weapons/Devastator/DevastatorItem.h"
#include "ModelsF/Weapons/HydroGun/LaserItem.h"

#define PARTICLES_NONE            (0L)
#define PARTICLES_AIR_ELEMENTAL   (1L<<1)
#define PARTICLES_LAVA_ELEMENTAL  (1L<<2)

// model's data
static CModelObject _moModel;
static CModelObject _moFloor;
static CPlacement3D _plModel;
static ANGLE3D _aRotation;
static BOOL _bHasFloor = FALSE;
static FLOAT _fFloorY = 0.0f;
static FLOAT _fFOV = 90.0f;
static FLOAT3D _vLightDir = FLOAT3D( -0.2f, -0.2f, -0.2f);
static COLOR _colLight = C_GRAY;
static COLOR _colAmbient = C_vdGRAY;
static COLOR _iParticleType = PARTICLES_NONE;


// model setting values
static CTString _strLastModel = "";
static BOOL _bModelOK = FALSE;

extern FLOAT _fMsgAppearFade;

static CModelObject *AddAttachment_t(CModelObject *pmoParent, INDEX iPosition,
   const CTFileName &fnmModel, INDEX iAnim,
   const CTFileName &fnmTexture,
   const CTFileName &fnmReflection=CTFILENAME(""),
   const CTFileName &fnmSpecular=CTFILENAME(""))
{
  CAttachmentModelObject *pamo = pmoParent->AddAttachmentModel(iPosition);
  ASSERT(pamo!=NULL);
  pamo->amo_moModelObject.SetData_t(fnmModel);
  pamo->amo_moModelObject.PlayAnim(iAnim, AOF_LOOPING);
  pamo->amo_moModelObject.mo_toTexture.SetData_t(fnmTexture);
  pamo->amo_moModelObject.mo_toReflection.SetData_t(fnmReflection);
  pamo->amo_moModelObject.mo_toSpecular.SetData_t(fnmSpecular);
  return &pamo->amo_moModelObject;
}

extern void SetupCompModel_t(const CTString &strName)
{
  CModelObject *pmo = &_moModel;
  _aRotation = ANGLE3D(0,0,0);
  _bHasFloor = FALSE;
  _fFloorY = 0.0f;
  _fFOV = 90.0f;
  _vLightDir = FLOAT3D( -0.2f, -0.2f, -0.2f);
  _colLight = C_GRAY;
  _colAmbient = C_vdGRAY;
  _iParticleType = PARTICLES_NONE;
#ifdef FIRST_ENCOUNTER
  _moFloor.SetData_t(CTFILENAME("Models\\Computer\\Floor.mdl"));
#else
  _moFloor.SetData_t(CTFILENAME("ModelsMP\\Computer\\Floor.mdl"));
#endif
  _moFloor.mo_toTexture.SetData_t(CTFILENAME("Models\\Computer\\Floor.tex"));
  pmo->mo_colBlendColor = 0xFFFFFFFF;
  if (strName=="Rocketman") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Headman.mdl"));
    pmo->PlayAnim(HEADMAN_ANIM_COMPUTERKAMIKAZE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Rocketman.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0,-1.75), ANGLE3D(210,0,0));

    AddAttachment_t(pmo, HEADMAN_ATTACHMENT_HEAD, 
      CTFILENAME("Models\\Enemies\\Headman\\Head.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Head.tex"));
    AddAttachment_t(pmo, HEADMAN_ATTACHMENT_ROCKET_LAUNCHER, 
      CTFILENAME("Models\\Enemies\\Headman\\RocketLauncher.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\RocketLauncher.tex"));
    pmo->StretchModel(FLOAT3D(1.25f,1.25f,1.25f));
    _bHasFloor = TRUE;

  } else if (strName=="Firecracker") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Headman.mdl"));
    pmo->PlayAnim(HEADMAN_ANIM_COMPUTERKAMIKAZE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Firecracker.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0,-1.75), ANGLE3D(210,0,0));

    AddAttachment_t(pmo, HEADMAN_ATTACHMENT_HEAD, 
      CTFILENAME("Models\\Enemies\\Headman\\FirecrackerHead.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\FirecrackerHead.tex"));
    AddAttachment_t(pmo, HEADMAN_ATTACHMENT_CHAINSAW, 
      CTFILENAME("Models\\Enemies\\Headman\\Chainsaw.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Chainsaw.tex"));
    pmo->StretchModel(FLOAT3D(1.25f,1.25f,1.25f));
    _bHasFloor = TRUE;

  } else if (strName=="Bomberman") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Headman.mdl"));
    pmo->PlayAnim(HEADMAN_ANIM_COMPUTERKAMIKAZE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Bomberman.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0,-1.75), ANGLE3D(210,0,0));
  
    AddAttachment_t(pmo, HEADMAN_ATTACHMENT_HEAD, 
      CTFILENAME("Models\\Enemies\\Headman\\Head.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Head.tex"));
    pmo->StretchModel(FLOAT3D(1.25f,1.25f,1.25f));
    _bHasFloor = TRUE;

  } else if (strName=="Kamikaze") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Headman.mdl"));
    pmo->PlayAnim(HEADMAN_ANIM_COMPUTERKAMIKAZE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Headman\\Kamikaze.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0,-1.75), ANGLE3D(210,0,0));
  
    AddAttachment_t(pmo, HEADMAN_ATTACHMENT_BOMB_RIGHT_HAND, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));
    AddAttachment_t(pmo, HEADMAN_ATTACHMENT_BOMB_LEFT_HAND, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));
    pmo->StretchModel(FLOAT3D(1.25f,1.25f,1.25f));
    _bHasFloor = TRUE;

  } else if (strName=="Ant") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Ant\\Ant.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(ANT_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Ant\\AntDarkBlue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.75,-1.75), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.6f,0.6f,0.6f));
    _bHasFloor = TRUE;

  } else if (strName=="EyemanPurple") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Eyeman\\Eyeman.mdl"));
    pmo->PlayAnim(EYEMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Eyeman\\Eyeman4.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.9f,-1.5), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="EyemanGreen") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\BuffGnaar\\BuffGnaar.mdl"));
    pmo->PlayAnim(BUFFGNAAR_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Eyeman\\Eyeman5.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.2f,-3.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1.3f, 1.3f, 1.3f));
    _bHasFloor = TRUE;

  } else if (strName=="EyemanBoom") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Eyeman\\Eyeman.mdl"));
    pmo->PlayAnim(EYEMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\EyemanBrute\\EyemanBlue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.85f,-1.45f), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.9f,0.85f,0.9f));
    _bHasFloor = TRUE;

  } else if (strName=="EyemanPuke") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Eyeman\\Eyeman.mdl"));
    pmo->PlayAnim(EYEMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\EyemanBrute\\EyemanPuke.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.15f,-1.9f), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1.2f, 1.2f, 1.2f));
    _bHasFloor = TRUE;

  } else if (strName=="EyemanBrute") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\BuffGnaar\\BuffGnaar.mdl"));
    pmo->PlayAnim(BUFFGNAAR_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\BuffGnaar\\EyemanBrute.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.5f,-3.8f), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1.9f, 1.9f, 1.9f));
    _bHasFloor = TRUE;

  } else if (strName=="CrabmanGreen") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Crabman2.mdl"));
    pmo->PlayAnim(CRABMAN2_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Textures\\Crab_diffuse_Green.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-3.0f,-7.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.5,0.5,0.5));

    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE1, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));
    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE2, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));

    _bHasFloor = TRUE;

  } else if (strName=="CrabmanRed") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Crabman2.mdl"));
    pmo->PlayAnim(CRABMAN2_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Textures\\Crab_diffuse_Red.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-6.0f,-14.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));

    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE1, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));
    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE2, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));

    _bHasFloor = TRUE;

  } else if (strName=="PrimitiveSmall") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Primitive.mdl"));
    pmo->PlayAnim(PRIMITIVE_ANIM_WALK_NOSHIELD2, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Primitive.tex"));
    pmo->mo_toBump.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Paint.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.5f,-3.5), ANGLE3D(160,0,0));

    AddAttachment_t(pmo, PRIMITIVE_ATTACHMENT_TEETH, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Teeth.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Teeth.tex"));
    AddAttachment_t(pmo, PRIMITIVE_ATTACHMENT_BAT, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Bat.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Weapons.tex"));

    pmo->StretchModel(FLOAT3D(1.6f,1.6f,1.6f));
    _bHasFloor = TRUE;

  } else if (strName=="PrimitiveBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Primitive.mdl"));
    pmo->PlayAnim(PRIMITIVE_ANIM_WALK_GIANT2, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Primitive.tex"));
    pmo->mo_toBump.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Paint_Blood.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-4.0f,-8.0), ANGLE3D(160,0,0));

    AddAttachment_t(pmo, PRIMITIVE_ATTACHMENT_TEETH, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Teeth.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Teeth.tex"));
    AddAttachment_t(pmo, PRIMITIVE_ATTACHMENT_BAT, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Bat.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Primitive\\Weapons.tex"));

    pmo->StretchModel(FLOAT3D(4,4,4));
    _bHasFloor = TRUE;

  } else if (strName=="CrabmanRed") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Crabman2.mdl"));
    pmo->PlayAnim(CRABMAN2_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Textures\\Crab_diffuse_Red.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-4.0f,-14.0), ANGLE3D(165,0,0));

    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE1, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));
    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE2, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));

    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    _bHasFloor = TRUE;

  } else if (strName=="CrabmanGreen") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Crabman2.mdl"));
    pmo->PlayAnim(CRABMAN2_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Crabman\\Textures\\Crab_diffuse_Green.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-2.0f,-7.0), ANGLE3D(165,0,0));

    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE1, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));
    AddAttachment_t(pmo, CRABMAN2_ATTACHMENT_EYE2, 
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"));

    pmo->StretchModel(FLOAT3D(0.5f,0.5f,0.5f));
    _bHasFloor = TRUE;

  } else if (strName=="Monkey") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Monkey\\Monkey.mdl"));
    pmo->PlayAnim(MONKEY_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Monkey\\Monkey.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(195,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="Boneman") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Boneman\\Boneman.mdl"));
    pmo->PlayAnim(BONEMAN_ANIM_WALKCOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Boneman\\Boneman.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="FishmanSmall") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Fishman\\Fishman2.mdl"));
    pmo->PlayAnim(FISHMAN2_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Fishman\\Fishman3.tex"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Weak.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-2.0), ANGLE3D(160,0,0));

    AddAttachment_t(pmo, FISHMAN2_ATTACHMENT_SPEAR, 
      CTFILENAME("ModelsF\\Enemies\\Fishman\\Spear.mdl"), 0,
      CTFILENAME("AREP\\Models\\Fishman2\\Fishman.tex"));

    pmo->StretchModel(FLOAT3D(1.2f,1.2f,1.2f));
    _bHasFloor = TRUE;

  } else if (strName=="FishmanBig") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Fishman\\Fishman2.mdl"));
    pmo->PlayAnim(FISHMAN2_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Fishman\\Fishman4.tex"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Weak.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(160,0,0));

    AddAttachment_t(pmo, FISHMAN2_ATTACHMENT_SPEAR, 
      CTFILENAME("ModelsF\\Enemies\\Fishman\\Spear.mdl"), 0,
      CTFILENAME("AREP\\Models\\Fishman2\\Fishman.tex"));

    pmo->StretchModel(FLOAT3D(1.7f,1.7f,1.7f));
    _bHasFloor = TRUE;

  } else if (strName=="CatmanSmall") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Catman\\Catman.mdl"));
    pmo->PlayAnim(CATMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Catman\\Body_Blue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.2f,-2.0), ANGLE3D(150,0,0));
  
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_ARMOR, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Armor.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Armor.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_MASK, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Mask.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Mask.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_CLAWS, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Claws.mdl"), 0,
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"));
      pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_FLAREL, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare_green.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_FLARER, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare_green.tex"));
	  CModelObject *pmoArmor = &pmo->GetAttachmentModel(CATMAN_ATTACHMENT_ARMOR)->amo_moModelObject;
      pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
      pmoArmor->PlayAnim(ARMOR_ANIM_WALK, AOF_LOOPING);

    pmo->StretchModel(FLOAT3D(0.6f,0.6f,0.6f));
    _bHasFloor = TRUE;

  } else if (strName=="CatmanMedium") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Catman\\Catman.mdl"));
    pmo->PlayAnim(CATMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Catman\\Body_Yellow.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.2f,-3.0), ANGLE3D(150,0,0));
  
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_ARMOR, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Armor.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Armor.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_MASK, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Mask.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Mask.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_CLAWS, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Claws.mdl"), 0,
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"));
      pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_FLAREL, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare_green.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_FLARER, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare_green.tex"));
	  CModelObject *pmoArmor = &pmo->GetAttachmentModel(CATMAN_ATTACHMENT_ARMOR)->amo_moModelObject;
      pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
      pmoArmor->PlayAnim(ARMOR_ANIM_WALK, AOF_LOOPING);

    pmo->StretchModel(FLOAT3D(0.8f,0.8f,0.8f));
    _bHasFloor = TRUE;

  } else if (strName=="CatmanBig") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Catman\\Catman.mdl"));
    pmo->PlayAnim(CATMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Catman\\Body_Green.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.2f,-4.0), ANGLE3D(150,0,0));
  
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_ARMOR, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Armor.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Armor.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_MASK, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Mask.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Mask.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_CLAWS, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Claws.mdl"), 0,
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"));
	  CModelObject *pmoClaws = &pmo->GetAttachmentModel(CATMAN_ATTACHMENT_CLAWS)->amo_moModelObject;
      pmoClaws->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_FLAREL, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare_green.tex"));
    AddAttachment_t(pmo, CATMAN_ATTACHMENT_FLARER, 
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Catman\\Flare_green.tex"));
	  CModelObject *pmoArmor = &pmo->GetAttachmentModel(CATMAN_ATTACHMENT_ARMOR)->amo_moModelObject;
      pmoArmor->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
      pmoArmor->PlayAnim(ARMOR_ANIM_WALK, AOF_LOOPING);

    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    _bHasFloor = TRUE;

  } else if (strName=="Huanman") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Huanman2\\Huanman.mdl"));
    pmo->PlayAnim(HUANMAN_ANIM_STAND, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Huanman2\\HuanmanBlack.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="HuanmanBig") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Huanman2\\Huanman.mdl"));
    pmo->PlayAnim(HUANMAN_ANIM_STAND, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Huanman2\\HuanmanRed.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-4.0f,-12.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(4,4,4));
    _bHasFloor = TRUE;

  } else if (strName=="Bull") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Werebull\\Werebull.mdl"));
    pmo->PlayAnim(WEREBULL_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Werebull\\Werebull.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.5f,-4.0), ANGLE3D(-110,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="BullNe") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Werebull\\Werebull.mdl"));
    pmo->PlayAnim(WEREBULL_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Werebull\\Werebull.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.5f,-4.0), ANGLE3D(-110,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="ram") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Ram\\Ram.mdl"));
    pmo->PlayAnim(RAM_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Ram\\Ram.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-10.0), ANGLE3D(-150,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="RobotDog") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\RobotDog\\robot_dog.mdl"));
    pmo->PlayAnim(ROBOT_DOG_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\RobotDog\\robot_dog.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.f,-4.0), ANGLE3D(-150,0,0));
    pmo->StretchModel(FLOAT3D(0.15,0.15,0.15));
    _bHasFloor = TRUE;

  } else if (strName=="MamutNormal") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Mamut2\\Mamut.mdl"));
    pmo->PlayAnim(MAMUT_ANIM_STAND, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Mamut2\\MamutSummer.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-7.0), ANGLE3D(-150,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="MamutCannon") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Mamut2\\Mamut.mdl"));
    pmo->PlayAnim(MAMUT_ANIM_STAND, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Mamut2\\MamutSummer.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-7.0), ANGLE3D(-150,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));

    AddAttachment_t(pmo, MAMUT_ATTACHMENT_MAN_FRONT, 
      CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Cannon.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Cannon.tex"));
    _bHasFloor = TRUE;

  } else if (strName=="MamutSummon") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Mamut2\\Mamut.mdl"));
    pmo->PlayAnim(MAMUT_ANIM_STAND, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Mamut2\\MamutSummer.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-7.0), ANGLE3D(-150,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));

    AddAttachment_t(pmo, MAMUT_ATTACHMENT_MAN_FRONT, 
      CTFILENAME("Models\\Enemies\\Devil\\Weapons\\ElectricityGun.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Devil\\Weapons\\ElectricityGun.tex"));
    _bHasFloor = TRUE;

  } else if (strName=="MamutmanSmall") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\MamutMan2\\MamutMan.mdl"));
    pmo->PlayAnim(MAMUTMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\MamutMan2\\MamutManMonk.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.2f,-3.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(2.0,2.0,2.0));
    _bHasFloor = TRUE;

  } else if (strName=="MamutmanBig") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\MamutMan2\\MamutMan.mdl"));
    pmo->PlayAnim(MAMUTMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\MamutMan2\\MamutManCardinal.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.4f,-3.5), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(2.5f,2.5f,2.5f));
    _bHasFloor = TRUE;

  } else if (strName=="Centaur") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Centaur.mdl"));
    pmo->PlayAnim(CENTAUR_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\CentaurBrown.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-5.0), ANGLE3D(-150,0,0));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
  
    AddAttachment_t(pmo, CENTAUR_ATTACHMENT_BOW, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Bow.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Bow.tex"));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
    AddAttachment_t(pmo, CENTAUR_ATTACHMENT_HAIR, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Hair.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Hair.tex"));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
    AddAttachment_t(pmo, CENTAUR_ATTACHMENT_QUIVER, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Quiver.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Armour.tex"));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
    AddAttachment_t(pmo, CENTAUR_ATTACHMENT_SHOULDERPAD, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\ShoulderPad.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Armour.tex"));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
    AddAttachment_t(pmo, CENTAUR_ATTACHMENT_TAIL, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Tail.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Centaur\\Props\\Armour.tex"));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));

    _bHasFloor = TRUE;

  } else if (strName=="Cerberus") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Cerberus\\Cerberus.mdl"));
    pmo->PlayAnim(CERBERUS_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Cerberus\\Cerberus.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.5f,-3.5), ANGLE3D(-200,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="Chariot") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Chariot\\Chariot.mdl"));
    pmo->PlayAnim(CHARIOT_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Chariot\\Chariot.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-3.0), ANGLE3D(-150,0,0));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
  
    AddAttachment_t(pmo, CHARIOT_ATTACHMENT_WHEELR, 
      CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Chariot\\Wheel.mdl"), 0,
      CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Chariot\\Chariot.tex"));
	  CModelObject *pmoWheelR = &pmo->GetAttachmentModel(CHARIOT_ATTACHMENT_WHEELR)->amo_moModelObject;
      pmoWheelR->PlayAnim(WHEEL_ANIM_WALKFOR, AOF_LOOPING);
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    AddAttachment_t(pmo, CHARIOT_ATTACHMENT_WHEELL, 
      CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Chariot\\Wheel.mdl"), 0,
      CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Chariot\\Chariot.tex"));
	  CModelObject *pmoWheelL = &pmo->GetAttachmentModel(CHARIOT_ATTACHMENT_WHEELL)->amo_moModelObject;
      pmoWheelL->PlayAnim(WHEEL_ANIM_WALKBACK, AOF_LOOPING);
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));

    _bHasFloor = TRUE;

  } else if (strName=="CyborgSmall") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Cyborg2\\Cyborg.mdl"));
    pmo->PlayAnim(CYBORG_ANIM_WALK01, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.25f,-3.0), ANGLE3D(-210,0,0));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
  
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_ASS, 
      CTFILENAME("AREP\\Models\\Cyborg2\\AssHole.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_TORSO, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Torso.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_HEAD, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Head.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTUPPERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightUpperArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTUPPERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftUpperArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTLOWERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightLowerArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTLOWERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftLowerArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTUPPERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightUpperLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTLOWERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightLowerLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTUPPERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftUpperLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTLOWERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftLowerLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_FOOTRIGHT, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Foot.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_FOOTLEFT, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Foot.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));

    _bHasFloor = TRUE;

  } else if (strName=="CyborgMedium") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Cyborg2\\Cyborg.mdl"));
    pmo->PlayAnim(CYBORG_ANIM_WALK01, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.5f,-6.0), ANGLE3D(-210,0,0));
    pmo->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
  
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_ASS, 
      CTFILENAME("AREP\\Models\\Cyborg2\\AssHole.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_TORSO, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Torso.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_HEAD, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Head.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTUPPERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightUpperArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTUPPERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftUpperArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTLOWERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightLowerArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTLOWERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftLowerArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTUPPERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightUpperLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTLOWERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightLowerLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTUPPERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftUpperLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTLOWERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftLowerLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_FOOTRIGHT, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Foot.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_FOOTLEFT, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Foot.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgOrangeFaded.tex"));
    pmo->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));

    _bHasFloor = TRUE;

  } else if (strName=="CyborgBig") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Cyborg2\\Cyborg.mdl"));
    pmo->PlayAnim(CYBORG_ANIM_WALK01, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Cyborg2\\CyborgWhite.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-3.75f,-9.0), ANGLE3D(-210,0,0));
    pmo->StretchModel(FLOAT3D(3.0f,3.0f,3.0f));
  
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_ASS, 
      CTFILENAME("AREP\\Models\\Cyborg2\\AssHole.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_TORSO, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Torso.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_HEAD, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Head.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTUPPERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightUpperArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTUPPERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftUpperArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTLOWERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightLowerArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTLOWERARM, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftLowerArm.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTUPPERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightUpperLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_RIGHTLOWERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\RightLowerLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTUPPERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftUpperLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_LEFTLOWERLEG, 
      CTFILENAME("AREP\\Models\\Cyborg2\\LeftLowerLeg.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_FOOTRIGHT, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Foot.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));
    AddAttachment_t(pmo, CYBORG_ATTACHMENT_FOOTLEFT, 
      CTFILENAME("AREP\\Models\\Cyborg2\\Foot.mdl"), 0,
      CTFILENAME("AREP\\Models\\Cyborg2\\CyborgBlack.tex"));
    pmo->StretchModel(FLOAT3D(3,3,3));
    pmo->mo_toReflection.SetData_t(CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"));

    _bHasFloor = TRUE;

  } else if (strName=="ScorpmanSoldier") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Scorpman\\Scorpman.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(SCORPMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Scorpman\\Soldier.tex"));
//    _plModel = CPlacement3D(FLOAT3D(0+0.2f*2,-2,-13), ANGLE3D(150,0,0));
//    _fFOV = 30;
    _plModel = CPlacement3D(FLOAT3D(0+0.5f*3,-3.0f,-7.0)*2/3, ANGLE3D(135,0,0));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SCORPMAN_ATTACHMENT_MINIGUN, 
      CTFILENAME("Models\\Enemies\\Scorpman\\Gun.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Scorpman\\Gun.tex"));

    pmo->StretchModel(FLOAT3D(2.0f,2.0f,2.0f));
    _bHasFloor = TRUE;

  } else if (strName=="ScorpmanGeneral") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Scorpman\\Scorpman.mdl"));
    pmo->PlayAnim(SCORPMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Scorpman\\General.tex"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
//    _plModel = CPlacement3D(FLOAT3D(0+0.2f*3,-4,-19), ANGLE3D(150,0,0));
//    _fFOV = 30;
    _plModel = CPlacement3D(FLOAT3D(0+0.5f*3,-3.0f,-7.0), ANGLE3D(135,0,0));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SCORPMAN_ATTACHMENT_MINIGUN, 
      CTFILENAME("Models\\Enemies\\Scorpman\\Gun.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Scorpman\\Gun.tex"));

    pmo->StretchModel(FLOAT3D(3.0f,3.0f,3.0f));
    _bHasFloor = TRUE;

  } else if (strName=="ScorpmanMonster") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Scorpman\\Scorpman.mdl"));
    pmo->PlayAnim(SCORPMAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\ScorpMonster\\ScorpMonster.tex"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
//    _plModel = CPlacement3D(FLOAT3D(0+0.2f*4,-5,-26), ANGLE3D(150,0,0));
//    _fFOV = 30;
    _plModel = CPlacement3D(FLOAT3D(0+0.5f*3,-3.0f,-7.0)*1.25, ANGLE3D(135,0,0));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SCORPMAN_ATTACHMENT_MINIGUN, 
      CTFILENAME("Models\\Enemies\\Scorpman\\Gun.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Scorpman\\Gun.tex"));

    pmo->StretchModel(FLOAT3D(4.0f,4.0f,4.0f));
    _bHasFloor = TRUE;

  } else if (strName=="Scorpion") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Scorpion\\Scorpion.mdl"));
    pmo->PlayAnim(SCORPION_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Scorpion\\Scorpion.tex"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    _plModel = CPlacement3D(FLOAT3D(-1.5f,-2.7f,-12.0), ANGLE3D(200,0,0));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    _bHasFloor = TRUE;

  } else if (strName=="ScorpSoldierSmall") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpNoGun.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpGreen.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.5f,-4.0)*2/3, ANGLE3D(210,0,0));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SCORPNOGUN_ATTACHMENT_SCORPNOGUN, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpGun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Gun.tex"));

    pmo->StretchModel(FLOAT3D(0.6f,0.6f,0.6f));
    _bHasFloor = TRUE;

  } else if (strName=="ScorpSoldierMedium") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpNoGun.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpYellow.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.5f,-6.0)*2/3, ANGLE3D(210,0,0));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SCORPNOGUN_ATTACHMENT_SCORPNOGUN, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpGun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Gun.tex"));

    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="ScorpSoldierBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpNoGun.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(SCORPNOGUN_ANIM_SCORPSOLDIER_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Tex\\ScorpPurple.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-5.0f,-12.0)*2/3, ANGLE3D(210,0,0));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SCORPNOGUN_ATTACHMENT_SCORPNOGUN, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\ScorpGun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Gun.tex"));

    pmo->StretchModel(FLOAT3D(2,2,2));
    _bHasFloor = TRUE;

  } else if (strName=="SpiderSmall") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmall.mdl"));
    pmo->PlayAnim(SPIDERSMALL_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmall.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.0f,-4.0)*2/3, ANGLE3D(160.0f, 0.0f, 0.0f));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SPIDERSMALL_ATTACHMENT_ELECTRICITY, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.tex"));

    pmo->StretchModel(FLOAT3D(0.4f,0.4f,0.4f));
    _bHasFloor = TRUE;

  } else if (strName=="SpiderBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmall.mdl"));
    pmo->PlayAnim(SPIDERSMALL_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmallRedBlue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-8.1f)*2/3, ANGLE3D(160.0f, 0.0f, 0.0f));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SPIDERSMALL_ATTACHMENT_ELECTRICITY, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.tex"));

    pmo->StretchModel(FLOAT3D(1.0f,1.0f,1.0f));
    _bHasFloor = TRUE;

  } else if (strName=="SpiderHuge") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmall.mdl"));
    pmo->PlayAnim(SPIDERSMALL_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\SpiderSmall\\SpiderSmallGreenBlue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-6.0f,-24.3f)*2/3, ANGLE3D(160.0f, 0.0f, 0.0f));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, SPIDERSMALL_ATTACHMENT_ELECTRICITY, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.tex"));

    pmo->StretchModel(FLOAT3D(3.0f,3.0f,3.0f));
    _bHasFloor = TRUE;

  } else if (strName=="MechaSpiderSmall") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\Legs.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(LEGS_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\legs_small.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-7.0)*2/3, ANGLE3D(160.0f, 0.0f, 0.0f));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, LEGS_ATTACHMENT_BODY, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\Body.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\body_small.tex"));
	  CModelObject *pmoBody = &pmo->GetAttachmentModel(LEGS_ATTACHMENT_BODY)->amo_moModelObject;
      pmoBody->PlayAnim(BODY_ANIM_IDLE, AOF_LOOPING);

    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="MechaSpiderBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\Legs.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(LEGS_ANIM_WALK_MUM, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\Legs.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-16.0f,-56.0)*2/3, ANGLE3D(160.0f, 0.0f, 0.0f));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    AddAttachment_t(pmo, LEGS_ATTACHMENT_BODY, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\Body.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\MechaSpider\\Body.tex"));
	  CModelObject *pmoBody = &pmo->GetAttachmentModel(LEGS_ATTACHMENT_BODY)->amo_moModelObject;
      pmoBody->PlayAnim(BODY_ANIM_WALK_MUM, AOF_LOOPING);

    pmo->StretchModel(FLOAT3D(8,8,8));
    _bHasFloor = TRUE;

  } else if (strName=="Mecha") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Mecha\\Mecha.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(MECHA_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Mecha\\mech_defender.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-16.0f,-56.0)*2/3, ANGLE3D(200.0f, 0.0f, 0.0f));
    _vLightDir = FLOAT3D( 0.2f, -0.2f, -0.2f);
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="WalkerSmall") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Walker\\Walker.mdl"));
    pmo->PlayAnim(WALKER_ANIM_WALKBIG, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Walker\\Walker02.tex"));
    AddAttachment_t(pmo, WALKER_ATTACHMENT_ROCKETLAUNCHER_LT, 
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, WALKER_ATTACHMENT_ROCKETLAUNCHER_RT, 
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-2.0f,-5.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.5,0.5,0.5));
    _bHasFloor = TRUE;
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

  } else if (strName=="WalkerGunner") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\JAREP01\\Rakanishu\\Walker\\WalkerMinigun.mdl"));
    pmo->PlayAnim(WALKER_ANIM_WALKBIG, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Walker\\WalkerYellow.tex"));
    AddAttachment_t(pmo, WALKERMINIGUN_ATTACHMENT_MGA, 
      CTFILENAME("Models\\Weapons\\MiniGun\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\MiniGun\\Body.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, WALKERMINIGUN_ATTACHMENT_MGB, 
      CTFILENAME("Models\\Weapons\\MiniGun\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\MiniGun\\Body.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, WALKERMINIGUN_ATTACHMENT_MGC, 
      CTFILENAME("Models\\Weapons\\MiniGun\\Barrels.mdl"), 0,
      CTFILENAME("Models\\Weapons\\MiniGun\\Barrels.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, WALKERMINIGUN_ATTACHMENT_MGD, 
      CTFILENAME("Models\\Weapons\\MiniGun\\Barrels.mdl"), 0,
      CTFILENAME("Models\\Weapons\\MiniGun\\Barrels.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-3.0f,-7.5), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.8,0.8,0.8));
    _bHasFloor = TRUE;
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

  } else if (strName=="WalkerBig") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Walker\\Walker.mdl"));
    pmo->PlayAnim(WALKER_ANIM_WALKBIG, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Walker\\Walker01.tex"));
    AddAttachment_t(pmo, WALKER_ATTACHMENT_ROCKETLAUNCHER_LT, 
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, WALKER_ATTACHMENT_ROCKETLAUNCHER_RT, 
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Walker\\RocketLauncher.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-4.0f,-10.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="WalkerArtillery") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\JAREP01\\Rakanishu\\Walker\\WalkerCannon.mdl"));
    pmo->PlayAnim(WALKER_ANIM_WALKBIG, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\JAREP01\\Rakanishu\\Walker\\Walker03.tex"));
    AddAttachment_t(pmo, WALKER_ATTACHMENT_ROCKETLAUNCHER_LT, 
      CTFILENAME("ModelsMP\\JAREP01\\Rakanishu\\Walker\\CannonWalker.mdl"), 0,
      CTFILENAME("ModelsMP\\JAREP01\\Rakanishu\\Walker\\CannonWalker.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, WALKER_ATTACHMENT_ROCKETLAUNCHER_RT, 
      CTFILENAME("ModelsMP\\JAREP01\\Rakanishu\\Walker\\CannonWalker.mdl"), 0,
      CTFILENAME("ModelsMP\\JAREP01\\Rakanishu\\Walker\\CannonWalker.tex"),
      CTFILENAME(""),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-5.5f,-14.5f), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
    _bHasFloor = TRUE;

  } else if (strName=="Lurker") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Lurker\\Lurker.mdl"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->PlayAnim(LURKER_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Lurker\\Lurker.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-3.0f,-8.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="Runner") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Runner\\Runner.mdl"));
    pmo->PlayAnim(RUNNER_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Runner\\mech.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-3.0f,-8.0), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.35,0.35,0.35));
    _bHasFloor = TRUE;
    _colLight = C_lGRAY;
    _colAmbient = C_vdGRAY;

  } else if (strName=="Woman") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Woman\\Woman.mdl"));
    pmo->PlayAnim(WOMAN_ANIM_AIRSTAND, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Woman\\Woman.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,0.0f,-2.0), ANGLE3D(210,30,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;
    _fFloorY = -1.5f;

  } else if (strName=="MantamanSmall") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Mantaman2\\Mantaman.mdl"));
    pmo->PlayAnim(MANTAMAN_ANIM_STANDORANDSWIMSLOW, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Mantaman2\\Mantaman.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,0.0f,-4.0f), ANGLE3D(210,30,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;
    _fFloorY = -1.5f;

  } else if (strName=="Dragonman") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Dragonman2\\Dragonman.mdl"));
    pmo->PlayAnim(DRAGONMAN_ANIM_AIRFLYLOOP, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Dragonman2\\Dragonman01.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,0.0f,-10.0), ANGLE3D(210,20,0));
    pmo->StretchModel(FLOAT3D(2,2,2));
    _bHasFloor = TRUE;
    _fFloorY = -3.0f;

  } else if (strName=="FlyingKleer") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\FlyingKleer\\FlyingKleer.mdl"));
    pmo->PlayAnim(FLYINGKLEER_ANIM_Idle, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\FlyingKleer\\FlyingKleer.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-4.5), ANGLE3D(210,0,0));

    AddAttachment_t(pmo, FLYINGKLEER_ATTACHMENT_BLUNDERBUSS, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\FlyingKleer\\Blunderbuss.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\FlyingKleer\\Blunderbuss.tex"));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;

  } else if (strName=="Floater") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Floater\\Floater.mdl"));
    pmo->PlayAnim(FLOATER_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Floater\\Floater.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,0.0f,-2.0), ANGLE3D(160,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;
    _fFloorY = -1.5f;

  } else if (strName=="FlyingFighter") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Sentry\\FlyingFighter\\Ship.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Sentry\\FlyingFighter\\Ship.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,0.0f,-3.0), ANGLE3D(210,-15,0));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
    _bHasFloor = TRUE;
    _fFloorY = -1.5f;

  } else if (strName=="DrivingWheel") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Sentry\\DrivingWheel\\Robot.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Sentry\\DrivingWheel\\Robot.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-4.0), ANGLE3D(190,0,0));
    pmo->StretchModel(FLOAT3D(0.75f,0.75f,0.75f));
    _bHasFloor = TRUE;

  } else if (strName=="LostSoul") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\Kleer\\LostSoul.mdl"));
    pmo->PlayAnim(LOSTSOUL_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\Kleer\\Kleer.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,0.0f,-2.0), ANGLE3D(160,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;
    _fFloorY = -1.5f;

  } else if (strName=="Kalopsy") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS4\\Kalopsy\\Kalopsy.mdl"));
    pmo->PlayAnim(KALOPSY_ANIM_Idle, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS4\\Kalopsy\\Kalopsy5.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-2.5f,-5.0), ANGLE3D(160,0,0));
    pmo->StretchModel(FLOAT3D(0.25f,0.25f,0.25f));
    _bHasFloor = TRUE;

  } else if (strName=="PainElemental") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS4\\Kalopsy\\Kalopsy.mdl"));
    pmo->PlayAnim(KALOPSY_ANIM_Idle, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS4\\Kalopsy\\Kalopsy6.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-3.0f,-6.0), ANGLE3D(160,0,0));
    pmo->StretchModel(FLOAT3D(0.3f,0.3f,0.3f));
    _bHasFloor = TRUE;

  } else if (strName=="Gizmo") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Gizmo\\Gizmo.mdl"));
    pmo->PlayAnim(GIZMO_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Gizmo\\Gizmo.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-1.2f), ANGLE3D(150,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="DumDum") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DumDum\\DumDum.mdl"));
    pmo->PlayAnim(DUMDUM_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DumDum\\initialShadingGroup_Texture1.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-1.2f), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.5,0.5,0.5));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Tweedle") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Tweedle\\Tweedle.mdl"));
    pmo->PlayAnim(TWEEDLE_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DumDum\\initialShadingGroup_Texture1.tex"));
    AddAttachment_t(pmo, TWEEDLE_ATTACHMENT_PROPELLER, 
      CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Tweedle\\Propeller.mdl"), 0,
      CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DumDum\\initialShadingGroup_Texture1.tex"));
	  CModelObject *pmoProp = &pmo->GetAttachmentModel(TWEEDLE_ATTACHMENT_PROPELLER)->amo_moModelObject;
      pmoProp->PlayAnim(PROPELLER_ANIM_SPIN, AOF_LOOPING|AOF_NORESTART);
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-1.2f), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.75,0.75,0.75));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="DibDib") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DibDib\\DibDib.mdl"));
    pmo->PlayAnim(DIBDIB_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DibDib\\DibDib.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.2f,-4.8f), ANGLE3D(210,0,0));
    pmo->StretchModel(FLOAT3D(0.6,0.6,0.6));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="LizardNormal") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Lizard\\Lizard.mdl"));
    pmo->PlayAnim(LIZARD_ANIM_RUN, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Lizard\\Lizard.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.15f,-3.0f), ANGLE3D(150,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="LizardBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Lizard\\Lizard.mdl"));
    pmo->PlayAnim(LIZARD_ANIM_RUN, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Lizard\\LizardRed.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.5f,-4.2f), ANGLE3D(150,0,0));
    pmo->StretchModel(FLOAT3D(1.5f,1.5f,1.5f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="LizardSpitter") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Lizard\\Lizard.mdl"));
    pmo->PlayAnim(LIZARD_ANIM_RUN, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Lizard\\LizardBlue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.95f,-2.7f), ANGLE3D(150,0,0));
    pmo->StretchModel(FLOAT3D(0.8f,0.8f,0.8f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Fish") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Fish\\Fish.mdl"));
    pmo->PlayAnim(FISH_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Fish\\Fish1.tex"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    _plModel = CPlacement3D(FLOAT3D(-0.2f,-0.5f,-3.0), ANGLE3D(250,0,0));
    pmo->StretchModel(FLOAT3D(1,1,1));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="BeastNormal") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Beast\\Beast.mdl"));
    pmo->PlayAnim(BEAST_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Beast\\Beast.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-2.0f,-6.0), ANGLE3D(170,0,0));
    pmo->StretchModel(FLOAT3D(2,2,2));
    _bHasFloor = TRUE;

  } else if (strName=="BeastElectric") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Beast\\Beast.mdl"));
    pmo->PlayAnim(BEAST_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\BeastElectric\\BeastElectric.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-2.0f,-6.0), ANGLE3D(170,0,0));
    pmo->StretchModel(FLOAT3D(2,2,2));
    _bHasFloor = TRUE;

  } else if (strName=="BeastBig") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Beast\\Beast.mdl"));
    pmo->PlayAnim(BEAST_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Beast\\BeastBig.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-6.5f,-18.0), ANGLE3D(170,0,0));
    
    //_plModel = CPlacement3D(FLOAT3D(tmp_af[5],tmp_af[6],tmp_af[7]), ANGLE3D(tmp_af[8],0,0));
    //_fFOV = tmp_af[9];
    //CPrintF("%f %f %f : %f : %f\n", tmp_af[5],tmp_af[6],tmp_af[7], tmp_af[8], tmp_af[9]);
    
    pmo->StretchModel(FLOAT3D(6,6,6));
    _bHasFloor = TRUE;

  } else if (strName=="Juggernaut") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Juggernaut\\Mesh\\Mesh.mdl"));
    pmo->PlayAnim(MESH_ANIM_Idle, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Juggernaut\\texture\\JuggernautEyeless.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-8.0f,-22.0), ANGLE3D(190,0,0));
    
    
    pmo->StretchModel(FLOAT3D(0.75,0.75,0.75));
    _bHasFloor = TRUE;

  } else if (strName=="AlbinoNormal") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Albino\\Albino.mdl"));
    pmo->PlayAnim(BEAST_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Albino\\Albino.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-3.25f,-10.0), ANGLE3D(170,0,0));
    pmo->StretchModel(FLOAT3D(3,3,3));
    _bHasFloor = TRUE;

  } else if (strName=="AlbinoBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Albino\\Albino.mdl"));
    pmo->PlayAnim(BEAST_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Albino\\AlbinoBlue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-6.5f,-20.0), ANGLE3D(170,0,0));
    
    //_plModel = CPlacement3D(FLOAT3D(tmp_af[5],tmp_af[6],tmp_af[7]), ANGLE3D(tmp_af[8],0,0));
    //_fFOV = tmp_af[9];
    //CPrintF("%f %f %f : %f : %f\n", tmp_af[5],tmp_af[6],tmp_af[7], tmp_af[8], tmp_af[9]);
    
    pmo->StretchModel(FLOAT3D(6,6,6));
    _bHasFloor = TRUE;

  } else if (strName=="AlbinoHuge") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Albino\\Albino.mdl"));
    pmo->PlayAnim(BEAST_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Albino\\AlbinoDark.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(0.0f, -13.0f, -40.0f), ANGLE3D(170.0f, 0.0f, 0.0f));

    pmo->StretchModel(FLOAT3D(14.0f, 14.0f, 14.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } 
  
  // More if else ( fatal error C1061: compiler limit: blocks nested too deeply)
  // Let's divide it in half

  if (strName=="Neptune") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Neptune\\Neptune2.mdl"));
    pmo->PlayAnim(NEPTUNE2_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Neptune\\Textures\\Human_Mutant_noteeth.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-18.0f,-30.0), ANGLE3D(180,0,0));
    
    pmo->StretchModel(FLOAT3D(2,2,2));
    _bHasFloor = TRUE;

  } else if (strName=="ElementalLava") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\ElementalLava\\ElementalLava.mdl"));
    pmo->PlayAnim(ELEMENTALLAVA_ANIM_WALKCOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\ElementalLava\\Lava04Fx.tex"));
    pmo->mo_toBump.SetData_t(CTFILENAME("Models\\Enemies\\ElementalLava\\Detail.tex"));
    AddAttachment_t(pmo, ELEMENTALLAVA_ATTACHMENT_BODY_FLARE, 
      CTFILENAME("Models\\Enemies\\ElementalLava\\BodyFlare.mdl"), 0,
      CTFILENAME("Models\\Enemies\\ElementalLava\\Flare.tex"));
    AddAttachment_t(pmo, ELEMENTALLAVA_ATTACHMENT_RIGHT_HAND_FLARE, 
      CTFILENAME("Models\\Enemies\\ElementalLava\\HandFlare.mdl"), 0,
      CTFILENAME("Models\\Enemies\\ElementalLava\\Flare.tex"));
    AddAttachment_t(pmo, ELEMENTALLAVA_ATTACHMENT_LEFT_HAND_FLARE, 
      CTFILENAME("Models\\Enemies\\ElementalLava\\HandFlare.mdl"), 0,
      CTFILENAME("Models\\Enemies\\ElementalLava\\Flare.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-5.0f,-8.0), ANGLE3D(150,0,0));
    pmo->StretchModel(FLOAT3D(4,4,4));
    _bHasFloor = TRUE;

    _iParticleType = PARTICLES_LAVA_ELEMENTAL;

  } else if (strName=="Waterman") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\Waterman\\WaterMan.mdl"));
    pmo->PlayAnim(WATERMAN_ANIM_STAND, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\Waterman\\WaterManFX.tex"));
    AddAttachment_t(pmo, WATERMAN_ATTACHMENT_BODY_FLARE, 
      CTFILENAME("AREP\\Models\\Waterman\\WaterManFX\\BodyFlare.mdl"), 0,
      CTFILENAME("AREP\\Models\\Waterman\\WaterManFX\\BodyFlare.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-4.0f,-10.0), ANGLE3D(150,0,0));
    pmo->StretchModel(FLOAT3D(4,4,4));
    _bHasFloor = TRUE;

  } else if (strName=="Devil") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Devil\\Devil.mdl"));
    pmo->PlayAnim(DEVIL_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Enemies\\Devil\\Devil.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-12.0f,-25.0), ANGLE3D(150,0,0));
    pmo->StretchModel(FLOAT3D(12,12,12));
    _bHasFloor = TRUE;

  } else if (strName=="DevilAlpha") {
    pmo->SetData_t(CTFILENAME("AREP\\Models\\DevilAlpha\\Devil.mdl"));
    pmo->PlayAnim(DEVIL_ANIM_STANDLOOP, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\DevilAlpha\\Devil4.tex"));
    AddAttachment_t(pmo, DEVIL_ATTACHMENT_MINIGUN, 
      CTFILENAME("Models\\Enemies\\Devil\\Weapons\\ProjectileGun.mdl"), 0,
      CTFILENAME("Models\\Enemies\\Devil\\Weapons\\ProjectileGun.tex"));
    AddAttachment_t(pmo, DEVIL_ATTACHMENT_STICK, 
      CTFILENAME("AREP\\Models\\DevilAlpha\\Stick.mdl"), 0,
      CTFILENAME("Textures\\General\\Wood\\Wood01.tex"));
    AddAttachment_t(pmo, DEVIL_ATTACHMENT_SHIELD, 
      CTFILENAME("AREP\\Models\\DevilAlpha\\Shield.mdl"), 0,
      CTFILENAME("AREP\\Models\\DevilAlpha\\Shield.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-6.0f,-10.0), ANGLE3D(170,0,0));
    pmo->StretchModel(FLOAT3D(3,3,3));
    _bHasFloor = TRUE;

  } else if (strName=="Guffy") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Guffy\\Guffy.mdl"));
    pmo->PlayAnim(GUFFY_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Guffy\\Guffy.tex"));
    AddAttachment_t(pmo, GUFFY_ATTACHMENT_GUNRIGHT, 
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.tex"));
    AddAttachment_t(pmo, GUFFY_ATTACHMENT_GUNLEFT, 
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.tex"));
    CModelObject *pmoRight = &pmo->GetAttachmentModel(GUFFY_ATTACHMENT_GUNRIGHT)->amo_moModelObject;
    pmoRight->StretchModel(FLOAT3D(-1,1,1));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-5.75f), ANGLE3D(210,0,0));
    _fFOV = 70.0f;
    
    _vLightDir = FLOAT3D( -0.1f, -0.1f, -0.175f);
    
    //_plModel = CPlacement3D(FLOAT3D(tmp_af[5],tmp_af[6],tmp_af[7]), ANGLE3D(tmp_af[8],0,0));
    //_fFOV = tmp_af[9];
    //CPrintF("%f %f %f : %f : %f\n", tmp_af[5],tmp_af[6],tmp_af[7], tmp_af[8], tmp_af[9]);
    

    pmo->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    _bHasFloor = TRUE;

  } else if (strName=="GuffyBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Guffy\\Guffy.mdl"));
    pmo->PlayAnim(GUFFY_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\GuffyX\\GuffyRed.tex"));
    AddAttachment_t(pmo, GUFFY_ATTACHMENT_GUNRIGHT, 
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.tex"));
    AddAttachment_t(pmo, GUFFY_ATTACHMENT_GUNLEFT, 
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.tex"));
    CModelObject *pmoRight = &pmo->GetAttachmentModel(GUFFY_ATTACHMENT_GUNRIGHT)->amo_moModelObject;
    pmoRight->StretchModel(FLOAT3D(-1.5f,1.5f,1.5f));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.75f,-7.75f), ANGLE3D(210,0,0));
    _fFOV = 70.0f;
    
    _vLightDir = FLOAT3D( -0.1f, -0.1f, -0.175f);
    
    //_plModel = CPlacement3D(FLOAT3D(tmp_af[5],tmp_af[6],tmp_af[7]), ANGLE3D(tmp_af[8],0,0));
    //_fFOV = tmp_af[9];
    //CPrintF("%f %f %f : %f : %f\n", tmp_af[5],tmp_af[6],tmp_af[7], tmp_af[8], tmp_af[9]);
    

    pmo->StretchModel(FLOAT3D(2.0f, 2.0f, 2.0f));
    _bHasFloor = TRUE;

  } else if (strName=="GuffyWarlord") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Guffy\\Guffy.mdl"));
    pmo->PlayAnim(GUFFY_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\GuffyX\\GuffyGreen.tex"));
    AddAttachment_t(pmo, GUFFY_ATTACHMENT_GUNRIGHT, 
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.mdl"), 0,
      CTFILENAME("AREP\\Models\\GuffyX\\GunRed.tex"));
    AddAttachment_t(pmo, GUFFY_ATTACHMENT_GUNLEFT, 
      CTFILENAME("ModelsMP\\Enemies\\Guffy\\Gun.mdl"), 0,
      CTFILENAME("AREP\\Models\\GuffyX\\GunRed.tex"));
    CModelObject *pmoRight = &pmo->GetAttachmentModel(GUFFY_ATTACHMENT_GUNRIGHT)->amo_moModelObject;
    pmoRight->StretchModel(FLOAT3D(-2.0f,2.0f,2.0f));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-3.5f,-9.75f), ANGLE3D(210,0,0));
    _fFOV = 70.0f;
    
    _vLightDir = FLOAT3D( -0.1f, -0.1f, -0.175f);
    
    //_plModel = CPlacement3D(FLOAT3D(tmp_af[5],tmp_af[6],tmp_af[7]), ANGLE3D(tmp_af[8],0,0));
    //_fFOV = tmp_af[9];
    //CPrintF("%f %f %f : %f : %f\n", tmp_af[5],tmp_af[6],tmp_af[7], tmp_af[8], tmp_af[9]);
    

    pmo->StretchModel(FLOAT3D(2.5f, 2.5f, 2.5f));
    _bHasFloor = TRUE;

  } else if (strName=="TankSmall") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankBod.mdl"));
    pmo->PlayAnim(TANKBOD_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\body_Small.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-2.0f,-5.0), ANGLE3D(-170,0,0));
  
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKTHREADS, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankThreads.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Threads.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKCANNON, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankCannon.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Cannon.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKCANNON2, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankCannon2.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Cannon.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKBARREL, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankBarrel.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\TankBarrel.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKENGINE, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankEngine.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Tank.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKTEETH, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankTeeth.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Teeth.tex"));

    pmo->StretchModel(FLOAT3D(1,1,1));

    _bHasFloor = TRUE;

  } else if (strName=="TankBig") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankBod.mdl"));
    pmo->PlayAnim(TANKBOD_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\body_Red.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-6.0f,-15.0), ANGLE3D(-170,0,0));
  
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKTHREADS, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankThreads.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Threads.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKCANNON, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankCannon.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Cannon.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKCANNON2, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankCannon2.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Cannon.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKBARREL, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankBarrel.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\TankBarrel.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKENGINE, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankEngine.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Tank.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKTEETH, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankTeeth.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Teeth.tex"));

    pmo->StretchModel(FLOAT3D(3,3,3));

    _bHasFloor = TRUE;

  } else if (strName=="TankHuge") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankBod.mdl"));
    pmo->PlayAnim(TANKBOD_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\body_Blue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-24.0f,-60.0), ANGLE3D(-170,0,0));
  
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKTHREADS, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankThreads.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Threads.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKCANNON, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankCannon.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Cannon.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKCANNON2, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankCannon2.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Cannon.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKBARREL, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankBarrel.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\TankBarrel.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKENGINE, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankEngine.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Tank.tex"));
    AddAttachment_t(pmo, TANKBOD_ATTACHMENT_TANKTEETH, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\TankTeeth.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\Tank\\Textures\\Teeth.tex"));

    pmo->StretchModel(FLOAT3D(12,12,12));

    _bHasFloor = TRUE;

  } else if (strName=="GruntSoldier") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Grunt\\Grunt.mdl"));
    pmo->PlayAnim(GRUNT_ANIM_IDLEPATROL, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Grunt\\Soldier.tex"));
    AddAttachment_t(pmo, GRUNT_ATTACHMENT_GUN_SMALL, 
      CTFILENAME("ModelsMP\\Enemies\\Grunt\\Gun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\Grunt\\Gun.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.5f,-3.7f), ANGLE3D(165.0f,0.0f,0.0f));
    _fFOV = 70.0f;
    
    _vLightDir = FLOAT3D( -0.1f, -0.2f, -0.2f);
    //_vLightDir = FLOAT3D( tmp_af[2], tmp_af[3], tmp_af[4]);

    pmo->StretchModel(FLOAT3D(1.2f, 1.2f, 1.2f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="GruntCommander") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Grunt\\Grunt.mdl"));
    pmo->PlayAnim(GRUNT_ANIM_IDLEPATROL, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Grunt\\Commander.tex"));
    AddAttachment_t(pmo, GRUNT_ATTACHMENT_GUN_COMMANDER, 
      CTFILENAME("ModelsMP\\Enemies\\Grunt\\Gun_Commander.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\Grunt\\Gun_Commander.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.65f,-3.9f), ANGLE3D(165.0f,0.0f,0.0f));
    _fFOV = 70.0f;
    
    _vLightDir = FLOAT3D( -0.1f, -0.2f, -0.2f);
    
    pmo->StretchModel(FLOAT3D(1.4f, 1.4f, 1.4f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="GruntSniper") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Grunt\\Grunt.mdl"));
    pmo->PlayAnim(GRUNT_ANIM_IDLEPATROL, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Grunt\\Grunt_GreenPurple.tex"));
    AddAttachment_t(pmo, GRUNT_ATTACHMENT_GUN_SNIPER, 
      CTFILENAME("ModelsF\\Enemies\\Grunt\\Rifle.mdl"), 0,
      CTFILENAME("ModelsF\\Enemies\\Grunt\\Rifle.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f,-1.8f,-4.1f), ANGLE3D(165.0f,0.0f,0.0f));
    _fFOV = 70.0f;
    
    _vLightDir = FLOAT3D( -0.1f, -0.2f, -0.2f);
    
    pmo->StretchModel(FLOAT3D(1.6f, 1.6f, 1.6f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="DevilStallion") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DevilStallion\\DevilStallion.mdl"));
    pmo->PlayAnim(DEVILSTALLION_ANIM_FLYIDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\DevilStallion\\DevilStallion.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -3.0f, -10.0f), ANGLE3D(200.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Guardian") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Guardian\\Guardian.mdl"));
    pmo->PlayAnim(GUARDIAN_ANIM_WALK, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Guardian\\GuardianJade.tex"));
    pmo->mo_toSpecular.SetData_t(CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -2.0f, -6.5f), ANGLE3D(230.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Demon") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Demon\\Demon.mdl"));
    pmo->PlayAnim(DEMON_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Demon\\Demon.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -1.25f, -2.25f), ANGLE3D(160.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.4f, 1.4f, 1.4f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="DemonStorm") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Demon\\Demon.mdl"));
    pmo->PlayAnim(DEMON_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("AREP\\Models\\DemonX\\DemonBlue.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -2.5f, -4.5f), ANGLE3D(160.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(2.6f, 2.6f, 2.6f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="DemonSummon") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Demon\\Demon.mdl"));
    pmo->PlayAnim(DEMON_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Demon\\DemonPurple.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -3.25f, -4.75f), ANGLE3D(160.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(3.2f, 3.2f, 3.2f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Arch-vile") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Demon\\Demon.mdl"));
    pmo->PlayAnim(DEMON_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Demon\\DemonYellow.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -1.9f, -3.35f), ANGLE3D(160.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(2.0f, 2.0f, 2.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Panda") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Enemies\\Panda\\Panda.mdl"));
    pmo->PlayAnim(PANDA_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Enemies\\Panda\\Demonpanda_Diffuse1.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -6.0f, -17.0f), ANGLE3D(5.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Spawner") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Spawner\\Spawner.mdl"));
    pmo->PlayAnim(SPAWNER_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS2\\Spawner\\Spawner.tex"));
    _plModel = CPlacement3D(FLOAT3D(0.0f, -2.0f, -7.0f), ANGLE3D(160.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Chainsaw Freak") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\ChainsawFreak\\Freak.mdl"));
    pmo->PlayAnim(FREAK_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\ChainsawFreak\\Freak.tex"));
    AddAttachment_t(pmo, FREAK_ATTACHMENT_CHAINSAW, 
      CTFILENAME("ModelsMP\\Enemies\\ChainsawFreak\\Saw.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ChainsawFreak\\Saw.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(-0.25f, -2.0f, -3.75f), ANGLE3D(200.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.4f, 1.4f, 1.4f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Gladiator") {
    pmo->SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Gladiator\\Gladiator.mdl"));
    pmo->PlayAnim(GLADIATOR_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\NextEncounter\\Enemies\\Gladiator\\Gladiator.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(0.0f, -2.0f, -3.75f), ANGLE3D(175.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Cannon Static") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Turret.mdl"));
    pmo->PlayAnim(TURRET_ANIM_DEFAULT, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Turret.tex"));
    AddAttachment_t(pmo, TURRET_ATTACHMENT_CANNON, 
      CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Cannon.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Cannon.tex"));
    CAttachmentModelObject *pmoMuzzle = pmo->GetAttachmentModel(TURRET_ATTACHMENT_CANNON);
    pmoMuzzle->amo_plRelative.pl_OrientationAngle(2) = 10.0f;

    _plModel = CPlacement3D(FLOAT3D(0.4f, -1.0f, -2.75), ANGLE3D(125.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.4f, 1.4f, 1.4f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Cannon Rotating") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\CannonRotating\\Turret.mdl"));
    pmo->PlayAnim(TURRET_ANIM_DEFAULT, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\CannonRotating\\Turret.tex"));
    AddAttachment_t(pmo, TURRET_ATTACHMENT_ROTATORHEADING, 
      CTFILENAME("ModelsMP\\Enemies\\CannonRotating\\RotatingMechanism.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\CannonRotating\\RotatingMechanism.tex"));
    CModelObject *pmoRotator = &pmo->GetAttachmentModel(TURRET_ATTACHMENT_ROTATORHEADING)->amo_moModelObject;
    AddAttachment_t(pmoRotator, ROTATINGMECHANISM_ATTACHMENT_CANNON, 
      CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Cannon.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\CannonStatic\\Cannon.tex"));
    CAttachmentModelObject *pmoMuzzle = pmoRotator->GetAttachmentModel(ROTATINGMECHANISM_ATTACHMENT_CANNON);
    pmoMuzzle->amo_plRelative.pl_OrientationAngle(2) = 10.0f;

    _plModel = CPlacement3D(FLOAT3D(0.4f, -1.0f, -2.75f), ANGLE3D(125.0f, 0.0f, 0.0f));
    
    pmo->StretchModel(FLOAT3D(1.4f, 1.4f, 1.4f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="WitchBride") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\WitchBride\\WitchBrideNoTent.mdl"));
    pmo->PlayAnim(WITCHBRIDENOTENT_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\SS3\\WitchBride\\WitchBrideGreen.tex"));
    AddAttachment_t(pmo, WITCHBRIDENOTENT_ATTACHMENT_SPIDERLEGS, 
      CTFILENAME("ModelsMP\\Enemies\\SS2\\SpiderMech\\SpiderLegs.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\SS2\\SpiderMech\\LegsGreen.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(0.25f, -3.0f, -18.0f), ANGLE3D(160.0f, 0.0f, 0.0f));
    _fFOV = 50.0f;
    _vLightDir = FLOAT3D( 0.1f, -0.3f, -0.2f);

    pmo->StretchModel(FLOAT3D(1, 1, 1));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Summoner") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\Summoner\\Summoner.mdl"));
    pmo->PlayAnim(SUMMONER_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Summoner\\Summoner.tex"));
    pmo->mo_toBump.SetData_t(CTFILENAME("TexturesMP\\Detail\\Crumples04.tex"));
    AddAttachment_t(pmo, SUMMONER_ATTACHMENT_STAFF, 
      CTFILENAME("ModelsMP\\Enemies\\Summoner\\Staff.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\Summoner\\Staff.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(0.25f, -7.0f, -31.0f), ANGLE3D(160.0f, 0.0f, 0.0f));
    _fFOV = 50.0f;
    _vLightDir = FLOAT3D( 0.1f, -0.3f, -0.2f);

    pmo->StretchModel(FLOAT3D(7.0f, 7.0f, 7.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Exotech Larva") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Body.mdl"));
    pmo->PlayAnim(BODY_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Body.tex"));
    pmo->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    CModelObject *pmoAtt;
    // left side
    AddAttachment_t(pmo, BODY_ATTACHMENT_ARM_LEFT, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Arm.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Arm.tex"));    
    pmoAtt = &pmo->GetAttachmentModel(BODY_ATTACHMENT_ARM_LEFT)->amo_moModelObject;
    AddAttachment_t(pmoAtt, ARM_ATTACHMENT_PLASMAGUN, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.tex"));    
    // right side
    AddAttachment_t(pmo, BODY_ATTACHMENT_ARM_RIGHT, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Arm.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Arm.tex"));    
    pmoAtt = &pmo->GetAttachmentModel(BODY_ATTACHMENT_ARM_RIGHT)->amo_moModelObject;
    pmoAtt->StretchModel(FLOAT3D(-1,1,1));
    AddAttachment_t(pmoAtt, ARM_ATTACHMENT_PLASMAGUN, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.tex"));         
    CModelObject *pmoAtt2;
    pmoAtt2 = &pmoAtt->GetAttachmentModel(ARM_ATTACHMENT_PLASMAGUN)->amo_moModelObject;
    pmoAtt2->StretchModel(FLOAT3D(-1,1,1));
    // blades
    AddAttachment_t(pmo, BODY_ATTACHMENT_BACKARMS, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\BackArms.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Body.tex"));         
    CModelObject *pmoAtt3;
    pmoAtt3 = &pmo->GetAttachmentModel(BODY_ATTACHMENT_BACKARMS)->amo_moModelObject;
    pmoAtt3->PlayAnim(BACKARMS_ANIM_ACTIVE, AOF_LOOPING);
    // holder
    AddAttachment_t(pmo, BODY_ATTACHMENT_EXOTECHLARVA, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\ExotechLarva.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\ExotechLarva.tex"));
    pmoAtt = &pmo->GetAttachmentModel(BODY_ATTACHMENT_EXOTECHLARVA)->amo_moModelObject;
    AddAttachment_t(pmoAtt, EXOTECHLARVA_ATTACHMENT_BEAM, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\Beam.mdl"), 0,
      CTFILENAME("ModelsMP\\Effects\\Laser\\Laser.tex"));
    AddAttachment_t(pmoAtt, EXOTECHLARVA_ATTACHMENT_ENERGYBEAMS, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\EnergyBeams.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\EnergyBeams.tex"));
    AddAttachment_t(pmoAtt, EXOTECHLARVA_ATTACHMENT_FLARE, 
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\EffectFlare.mdl"), 0,
      CTFILENAME("ModelsMP\\Enemies\\ExotechLarva\\EffectFlare.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(0.5f, -8.0f, -21.0f), ANGLE3D(165.0f, 0.0f, 0.0f));
    _fFOV = 70.0f;

    _aRotation = ANGLE3D( 10.0f, 0, 0 );
	  _vLightDir = FLOAT3D( -0.1f, -0.2f, -0.2f);
    
    pmo->StretchModelRelative(FLOAT3D(2.5f, 2.5f, 2.5f));
    //pmo->StretchModel(FLOAT3D(2.5f, 2.5f, 2.5f));
    _fFloorY = -2.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Air Elemental") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Enemies\\AirElemental\\Elemental.mdl"));
    pmo->PlayAnim(ELEMENTAL_ANIM_IDLE, AOF_LOOPING);
    pmo->mo_colBlendColor = 0;
    
    _plModel = CPlacement3D(FLOAT3D(-1.0f, -13.0f, -52.0f), ANGLE3D(170.0f, 0.0f, 0.0f));
    _fFOV = 50.0f;

    //_plModel = CPlacement3D(FLOAT3D(tmp_af[5],tmp_af[6],tmp_af[7]), ANGLE3D(tmp_af[8],0,0));
    //_fFOV = tmp_af[9];
    //CPrintF("%f %f %f : %f : %f\n", tmp_af[5],tmp_af[6],tmp_af[7], tmp_af[8], tmp_af[9]);
    //_vLightDir = FLOAT3D( tmp_af[2], tmp_af[3], tmp_af[4]);

    pmo->StretchModel(FLOAT3D(14.0f, 14.0f, 14.0f));
    _fFloorY = -2.0f;
    _bHasFloor = TRUE;

    _iParticleType = PARTICLES_AIR_ELEMENTAL;

  } else if (strName=="BeastHuge") {
    pmo->SetData_t(CTFILENAME("Models\\Enemies\\Beast\\Beast.mdl"));
    pmo->PlayAnim(BEAST_ANIM_IDLECOMPUTER, AOF_LOOPING);
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Enemies\\Beast\\BeastBiggest.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(-0.5f, -12.0f, -30.0f), ANGLE3D(170.0f, 0.0f, 0.0f));
    _vLightDir = FLOAT3D( -0.1f, -0.3f, -0.2f);

    pmo->StretchModel(FLOAT3D(11.0f, 11.0f, 11.0f));
    _fFloorY = 0.0f;
    _bHasFloor = TRUE;

  } else if (strName=="Knife") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\Knife\\KnifeItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Knife\\KnifeItem.tex"));
    pmo->PlayAnim(KNIFEITEM_ANIM_COMPUTER, AOF_LOOPING);
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-2.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    pmo->StretchModel(FLOAT3D(4,4,4));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="Colt") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\Colt\\ColtItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Colt\\ColtMain.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-2.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, COLTITEM_ATTACHMENT_BULLETS, 
      CTFILENAME("Models\\Weapons\\Colt\\ColtBullets.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Colt\\ColtBullets.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, COLTITEM_ATTACHMENT_COCK, 
      CTFILENAME("Models\\Weapons\\Colt\\ColtCock.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Colt\\ColtCock.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, COLTITEM_ATTACHMENT_BODY, 
      CTFILENAME("Models\\Weapons\\Colt\\ColtMain.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Colt\\ColtMain.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(4,4,4));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="SingleShotgun") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\SingleShotgun\\SingleShotgunItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\SingleShotgun\\Handle.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-3.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, SINGLESHOTGUNITEM_ATTACHMENT_BARRELS, 
      CTFILENAME("Models\\Weapons\\SingleShotgun\\Barrels.mdl"), 0,
      CTFILENAME("Models\\Weapons\\SingleShotgun\\Barrels.tex"),
      CTFILENAME("Models\\ReflectionTextures\\DarkMetal.tex"),
      CTFILENAME("Models\\SpecularTextures\\Weak.tex"));
    AddAttachment_t(pmo, SINGLESHOTGUNITEM_ATTACHMENT_HANDLE, 
      CTFILENAME("Models\\Weapons\\SingleShotgun\\Handle.mdl"), 0,
      CTFILENAME("Models\\Weapons\\SingleShotgun\\Handle.tex"),
      CTFILENAME("Models\\ReflectionTextures\\DarkMetal.tex"),
      CTFILENAME("Models\\SpecularTextures\\Weak.tex"));
    AddAttachment_t(pmo, SINGLESHOTGUNITEM_ATTACHMENT_SLIDER, 
      CTFILENAME("Models\\Weapons\\SingleShotgun\\Slider.mdl"), 0,
      CTFILENAME("Models\\Weapons\\SingleShotgun\\Barrels.tex"),
      CTFILENAME("Models\\ReflectionTextures\\DarkMetal.tex"),
      CTFILENAME("Models\\SpecularTextures\\Weak.tex"));
    pmo->StretchModel(FLOAT3D(3.5,3.5,3.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="DoubleShotgun") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\DoubleShotgun\\DoubleShotgunItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\DoubleShotgun\\Handle.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-4.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, DOUBLESHOTGUNITEM_ATTACHMENT_BARRELS, 
      CTFILENAME("Models\\Weapons\\DoubleShotgun\\DshotgunBarrels.mdl"), 0,
      CTFILENAME("Models\\Weapons\\DoubleShotgun\\Barrels.tex"),
      CTFILENAME("Models\\ReflectionTextures\\BWRiples01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, DOUBLESHOTGUNITEM_ATTACHMENT_HANDLE, 
      CTFILENAME("Models\\Weapons\\DoubleShotgun\\DshotgunHandle.mdl"), 0,
      CTFILENAME("Models\\Weapons\\DoubleShotgun\\Handle.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, DOUBLESHOTGUNITEM_ATTACHMENT_SWITCH, 
      CTFILENAME("Models\\Weapons\\DoubleShotgun\\Switch.mdl"), 0,
      CTFILENAME("Models\\Weapons\\DoubleShotgun\\Switch.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(3.0,3.0,3.0));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="Tommygun") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\Tommygun\\TommygunItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Tommygun\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.8f,-1.8f), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, TOMMYGUNITEM_ATTACHMENT_BODY, 
      CTFILENAME("Models\\Weapons\\Tommygun\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Tommygun\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, TOMMYGUNITEM_ATTACHMENT_SLIDER, 
      CTFILENAME("Models\\Weapons\\Tommygun\\Slider.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Tommygun\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(2.0,2.0,2.0));
    _bHasFloor = TRUE;
    _fFloorY = -0.5f;

  } else if (strName=="Devastator") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Weapons\\Devastator\\DevastatorItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Weapons\\Devastator\\Devastator.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.8f,-1.8f), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, DEVASTATORITEM_ATTACHMENT_BODY, 
      CTFILENAME("ModelsF\\Weapons\\Devastator\\Body.mdl"), 0,
      CTFILENAME("ModelsF\\Weapons\\Devastator\\Devastator.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, DEVASTATORITEM_ATTACHMENT_SLIDER, 
      CTFILENAME("ModelsF\\Weapons\\Devastator\\Magazine.mdl"), 0,
      CTFILENAME("ModelsF\\Weapons\\Devastator\\Magazine.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(2.0,2.0,2.0));
    _bHasFloor = TRUE;
    _fFloorY = -0.5f;

  } else if (strName=="Sniper") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Weapons\\Sniper\\SniperItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Weapons\\Sniper\\W_Set2_Class2.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.4f,-4.0f), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);
    _fFOV = 50.0f;
    _vLightDir = FLOAT3D( -0.1f, -0.2f, -0.2f);  

    AddAttachment_t(pmo, SNIPERITEM_ATTACHMENT_BODY, 
      CTFILENAME("ModelsF\\Weapons\\Sniper\\Body.mdl"), 0,
      CTFILENAME("ModelsF\\Weapons\\Sniper\\W_Set2_Class2.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(1.5,1.5,1.5));
    _bHasFloor = TRUE;
    _fFloorY = -0.5f;

  } else if (strName=="ChainSaw") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\ChainsawItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.4f,-3.0f), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);
    _fFOV = 60.0f;
    _vLightDir = FLOAT3D( -0.1f, -0.2f, -0.2f);  

    AddAttachment_t(pmo, CHAINSAWITEM_ATTACHMENT_CHAINSAW, 
      CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\BodyForPlayer.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, CHAINSAWITEM_ATTACHMENT_BLADE, 
      CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\Blade.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\Blade.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    //CAttachmentModelObject *amo = pmo->GetAttachmentModel(CHAINSAWITEM_ATTACHMENT_BLADE);
    AddAttachment_t(pmo, BLADEFORPLAYER_ATTACHMENT_TEETH, 
      CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\Teeth.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\Chainsaw\\Teeth.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    
    pmo->StretchModel(FLOAT3D(1.0,1.0,1.0));
    _bHasFloor = TRUE;
    _fFloorY = -0.5f;

  } else if (strName=="Flamer") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Weapons\\Flamer\\FlamerItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Weapons\\Flamer\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.4f,-2.2f), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);
    _fFOV = 70.0f;
    _vLightDir = FLOAT3D( -0.1f, -0.2f, -0.2f);  

    AddAttachment_t(pmo, FLAMERITEM_ATTACHMENT_BODY, 
      CTFILENAME("ModelsMP\\Weapons\\Flamer\\Body.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\Flamer\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, FLAMERITEM_ATTACHMENT_FUEL, 
      CTFILENAME("ModelsMP\\Weapons\\Flamer\\FuelReservoir.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\Flamer\\FuelReservoir.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(1.5,1.5,1.5));
    _bHasFloor = TRUE;
    _fFloorY = -0.5f;

  } else if (strName=="serious bomb") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Items\\PowerUps\\SeriousBomb\\SeriousBomb.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsMP\\Items\\PowerUps\\SeriousBomb\\SeriousBomb.tex"));
    
    _plModel = CPlacement3D(FLOAT3D(0.0f, -1.0f, -6.0f), ANGLE3D(0,-10.0f,0));
    _aRotation = ANGLE3D(60,0,0);
    _fFOV = 40.0f;
    /*_plModel = CPlacement3D(FLOAT3D(tmp_af[5],tmp_af[6],tmp_af[7]), ANGLE3D(0,tmp_af[8],0));
    _fFOV = tmp_af[9];
    CPrintF("%f %f %f : %f : %f\n", tmp_af[5],tmp_af[6],tmp_af[7], tmp_af[8], tmp_af[9]);*/

    pmo->StretchModel(FLOAT3D(3.0f, 3.0f, 3.0f));
    _bHasFloor = TRUE;
    _fFloorY = 0.0f;

  } else if (strName=="Minigun") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\Minigun\\MinigunItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Minigun\\Minigun.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-0.5f,-3.75f), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, MINIGUNITEM_ATTACHMENT_BARRELS, 
      CTFILENAME("Models\\Weapons\\Minigun\\Barrels.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Minigun\\Barrels.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, MINIGUNITEM_ATTACHMENT_BODY, 
      CTFILENAME("Models\\Weapons\\Minigun\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Minigun\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, MINIGUNITEM_ATTACHMENT_ENGINE, 
      CTFILENAME("Models\\Weapons\\Minigun\\Engine.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Minigun\\Barrels.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(1.75,1.75,1.75));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="RocketLauncher") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\RocketLauncherItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\RocketLauncher.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, ROCKETLAUNCHERITEM_ATTACHMENT_BODY, 
      CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\Body.mdl"), 0,
      CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\RocketLauncher.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, ROCKETLAUNCHERITEM_ATTACHMENT_ROTATINGPART, 
      CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\RotatingPart.mdl"), 0,
      CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\RocketLauncher.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, ROCKETLAUNCHERITEM_ATTACHMENT_MAGAZINE, 
      CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\Magazine.mdl"), 0,
      CTFILENAME("ModelsF\\Weapons\\RocketLauncher\\Magazine.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(2.5,2.5,2.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="GrenadeLauncher") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\GrenadeLauncher\\GrenadeLauncherItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\GrenadeLauncher\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-4.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, GRENADELAUNCHERITEM_ATTACHMENT_BODY, 
      CTFILENAME("Models\\Weapons\\GrenadeLauncher\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GrenadeLauncher\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, GRENADELAUNCHERITEM_ATTACHMENT_MOVING_PART, 
      CTFILENAME("Models\\Weapons\\GrenadeLauncher\\MovingPipe.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GrenadeLauncher\\MovingPipe.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, GRENADELAUNCHERITEM_ATTACHMENT_GRENADE, 
      CTFILENAME("Models\\Weapons\\GrenadeLauncher\\GrenadeBack.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GrenadeLauncher\\MovingPipe.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(2.5,2.5,2.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="Laser") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\Laser\\LaserItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Laser\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_BODY, 
      CTFILENAME("Models\\Weapons\\Laser\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Laser\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_LEFTUP, 
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_LEFTDOWN, 
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_RIGHTUP, 
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_RIGHTDOWN, 
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Laser\\Barrel.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(2.5,2.5,2.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="plasma") {
    pmo->SetData_t(CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\LaserItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Laser\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_BODY, 
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Body.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_LEFTUP, 
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Barrel.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Barrel.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_RIGHTUP, 
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Barrel.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Barrel.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_BARRELBIG, 
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Barrel_big.mdl"), 0,
      CTFILENAME("ModelsMP\\Weapons\\PlasmaThrower\\Barrel_big.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(2.5,2.5,2.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="Hydrogun") {
    pmo->SetData_t(CTFILENAME("ModelsF\\Weapons\\HydroGun\\LaserItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Laser\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_BODY, 
      CTFILENAME("ModelsF\\Weapons\\Hydrogun\\Body.mdl"), 0,
      CTFILENAME("ModelsF\\Weapons\\Hydrogun\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Strong.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_LEFTUP, 
      CTFILENAME("ModelsF\\Weapons\\Hydrogun\\Barrel.mdl"), 0,
      CTFILENAME("AREP\\Models\\Waterman\\WaterManFX.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Strong.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_LEFTDOWN, 
      CTFILENAME("ModelsF\\Weapons\\Hydrogun\\Barrel.mdl"), 0,
      CTFILENAME("AREP\\Models\\Waterman\\WaterManFX.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Strong.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_RIGHTUP, 
      CTFILENAME("ModelsF\\Weapons\\Hydrogun\\Barrel.mdl"), 0,
      CTFILENAME("AREP\\Models\\Waterman\\WaterManFX.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Strong.tex"));
    AddAttachment_t(pmo, LASERITEM_ATTACHMENT_RIGHTDOWN, 
      CTFILENAME("ModelsF\\Weapons\\Hydrogun\\Barrel.mdl"), 0,
      CTFILENAME("AREP\\Models\\Waterman\\WaterManFX.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightBlueMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Strong.tex"));
    pmo->StretchModel(FLOAT3D(2.5,2.5,2.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="ghostbuster") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\GhostBuster\\GhostBusterItem.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\GhostBuster\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, GHOSTBUSTERITEM_ATTACHMENT_BODY, 
      CTFILENAME("Models\\Weapons\\GhostBuster\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GhostBuster\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, GHOSTBUSTERITEM_ATTACHMENT_ROTATOR, 
      CTFILENAME("Models\\Weapons\\GhostBuster\\Rotator.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GhostBuster\\Rotator.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    AddAttachment_t(pmo, GHOSTBUSTERITEM_ATTACHMENT_EFFECT01, 
      CTFILENAME("Models\\Weapons\\GhostBuster\\Effect01.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GhostBuster\\Lightning.tex"));
    AddAttachment_t(pmo, GHOSTBUSTERITEM_ATTACHMENT_EFFECT02, 
      CTFILENAME("Models\\Weapons\\GhostBuster\\Effect01.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GhostBuster\\Lightning.tex"));
    AddAttachment_t(pmo, GHOSTBUSTERITEM_ATTACHMENT_EFFECT03, 
      CTFILENAME("Models\\Weapons\\GhostBuster\\Effect01.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GhostBuster\\Lightning.tex"));
    AddAttachment_t(pmo, GHOSTBUSTERITEM_ATTACHMENT_EFFECT04, 
      CTFILENAME("Models\\Weapons\\GhostBuster\\Effect01.mdl"), 0,
      CTFILENAME("Models\\Weapons\\GhostBuster\\Lightning.tex"));
    pmo->StretchModel(FLOAT3D(2.5,2.5,2.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } else if (strName=="Cannon") {
    pmo->SetData_t(CTFILENAME("Models\\Weapons\\Cannon\\Cannon.mdl"));
    pmo->mo_toTexture.SetData_t(CTFILENAME("Models\\Weapons\\Cannon\\Body.tex"));
    _plModel = CPlacement3D(FLOAT3D(0,-1.0f,-3.0), ANGLE3D(0,10,0));
    _aRotation = ANGLE3D(100,0,0);

    AddAttachment_t(pmo, CANNON_ATTACHMENT_BODY, 
      CTFILENAME("Models\\Weapons\\Cannon\\Body.mdl"), 0,
      CTFILENAME("Models\\Weapons\\Cannon\\Body.tex"),
      CTFILENAME("Models\\ReflectionTextures\\LightMetal01.tex"),
      CTFILENAME("Models\\SpecularTextures\\Medium.tex"));
    pmo->StretchModel(FLOAT3D(2.5,2.5,2.5));
    _bHasFloor = TRUE;
    _fFloorY = -1.0f;

  } 

  if(!_bHasFloor) {
    ThrowF_t(TRANS("Unknown model '%s'"), (const char *) strName);
  }
}

void RenderMessageModel(CDrawPort *pdp, const CTString &strModel)
{
  // if new model
  if (_strLastModel!=strModel) {
    _strLastModel=strModel;
    _bModelOK = FALSE;
    // try to
    try {
      // load model
      SetupCompModel_t(strModel);
      _bModelOK = TRUE;
    // if failed
    } catch (const char *strError) {
      // report error
      CPrintF("Cannot setup model '%s':\n%s\n", (const char *) strModel, (const char *)strError);
      // do nothing
      return;
    }
  }

  // if model is not loaded ok
  if (!_bModelOK) {
    // do nothing
    return;
  }

  // for each eye
  for (INDEX iEye=STEREO_LEFT; iEye<=(Stereo_IsEnabled()?STEREO_RIGHT:STEREO_LEFT); iEye++) {
    // prepare projection
    CRenderModel rm;
    CPerspectiveProjection3D pr;
    pr.FOVL() = AngleDeg(_fFOV);
    pr.ScreenBBoxL() = FLOATaabbox2D(
      FLOAT2D(0.0f, 0.0f),
      FLOAT2D((float)pdp->GetWidth(), (float)pdp->GetHeight())
    );
    pr.AspectRatioL() = 1.0f;
    pr.FrontClipDistanceL() = 0.3f;
    pr.ViewerPlacementL() = CPlacement3D(FLOAT3D(0,0,0), ANGLE3D(0,0,0));
  
    // setup stereo rendering
    Stereo_SetBuffer(iEye);
    Stereo_AdjustProjection(pr, iEye, 0.16f);

    pdp->FillZBuffer(1.0f);

    // initialize rendering
    CAnyProjection3D apr;
    apr = pr;
    BeginModelRenderingView(apr, pdp);
    rm.rm_vLightDirection = _vLightDir;
    const FLOAT fDistance = 1.0f+ 10.f*(1.0f/(_fMsgAppearFade+0.01f) - 1.0f/(1.0f+0.01f));

    // if model needs floor
    if( _bHasFloor) {
      // set floor's position
      CPlacement3D pl = _plModel;
      pl.pl_OrientationAngle = ANGLE3D(0,0,0);
      pl.pl_PositionVector   = _plModel.pl_PositionVector;
      pl.pl_PositionVector(2) += _fFloorY;
      pl.pl_PositionVector(3) *= fDistance;
      rm.SetObjectPlacement(pl);
      // render the floor
      rm.rm_colLight   = C_WHITE;
      rm.rm_colAmbient = C_WHITE;
      rm.rm_fDistanceFactor = -999;
      _moFloor.SetupModelRendering(rm);
      _moFloor.RenderModel(rm);
    }

    // set model's position
    CPlacement3D pl;
    pl.pl_OrientationAngle   = _plModel.pl_OrientationAngle + _aRotation*_pTimer->GetLerpedCurrentTick();
    pl.pl_PositionVector     = _plModel.pl_PositionVector;
    pl.pl_PositionVector(3) *= fDistance / pdp->dp_fWideAdjustment;
    rm.SetObjectPlacement(pl);

    // render the model
    rm.rm_colLight   = _colLight;
    rm.rm_colAmbient = _colAmbient;
    rm.rm_fDistanceFactor = -999; // force highest mip disregarding stretch factors
    _moModel.SetupModelRendering(rm);
    FLOATplane3D plFloorPlane = FLOATplane3D( FLOAT3D( 0.0f, 1.0f, 0.0f), _plModel.pl_PositionVector(2)+_fFloorY);
    CPlacement3D plLightPlacement = CPlacement3D( _plModel.pl_PositionVector
                                  + rm.rm_vLightDirection * _plModel.pl_PositionVector(3) *5, ANGLE3D(0,0,0));
    _moModel.RenderShadow( rm, plLightPlacement, 200.0f, 200.0f, 1.0f, plFloorPlane);
    _moModel.RenderModel(rm);

    // render particles
#ifndef FIRST_ENCOUNTER
    if (_iParticleType!=PARTICLES_NONE) {
      Particle_PrepareSystem(pdp, apr);
      Particle_PrepareEntity( 1, 0, 0, NULL);
      switch(_iParticleType) {
      case PARTICLES_AIR_ELEMENTAL:
        Particles_AirElemental_Comp(&_moModel, 1.0f, 1.0f, pl);
        break;
      case PARTICLES_LAVA_ELEMENTAL:
        Particles_Burning_Comp(&_moModel, 0.25f, pl);
        break;
      }
      Particle_EndSystem();
    }
#endif
    EndModelRenderingView();
  }
  Stereo_SetBuffer(STEREO_BOTH);
}

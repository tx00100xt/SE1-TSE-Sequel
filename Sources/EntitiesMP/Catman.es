305
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/Enemies/Catman/Catman.h"
#include "ModelsF/Enemies/Catman/Armor.h"
%}

uses "EntitiesMP/EnemyBase";

enum CatChar {
  0 CAT_SOLDIER   "Soldier",    // soldier
  1 CAT_GENERAL  "General",   // general
  2 CAT_TERMINATOR  "Terminator",   // terminator
};

%{
// info structure
static EntityInfo eiCatman2 = {
 EIBT_BONES, 250.0f,
 0.0f, 1.9f, 0.0f,    // source (eyes)
 0.0f, 1.9f, 0.0f,    // target (body)
};

#define BONES_HIT 2.8f
#define FIRE_RIGHT_HAND     FLOAT3D( 0.25f, 1.5f, 0.0f)
#define FIRE_LEFT_HAND      FLOAT3D(-0.5f, 1.5f, 0.0f)
#define SHOOT_ANGLE (15.0f)
#define SHOOT_LAUNCH (FLOAT3D(-0.55f, 1.55f, 0.0f))
#define SOLDIER_STRETCH 0.6f
#define GENERAL_STRETCH 0.8f
#define TERMINATOR_STRETCH 1.0f

#define CATSOUND(soundname) ((m_CatChar==CAT_TERMINATOR)? (SOUND_BIG_##soundname) : (SOUND_##soundname))
%}


class CCatman : CEnemyBase {
name      "Catman";
thumbnail "Thumbnails\\Catman.tbn";

properties:
  1 enum CatChar m_CatChar   "Character" 'C' = CAT_GENERAL,
  2 BOOL m_bFistHit = FALSE,          // used for close attack
  3 BOOL m_bTouchAnother = FALSE,     // another entity touched on far attack
  4 CSoundObject m_soCloak,            // for running sound
  5 BOOL m_bCloakSoundPlaying = FALSE,
  6 INDEX   m_fgibTexture = TEXTURE_CATMAN2_SOLDIER,
  7 BOOL m_bInvisible = FALSE,

components:
  0 class   CLASS_BASE        "Classes\\EnemyBase.ecl",
  1 model   MODEL_CATMAN2     "ModelsF\\Enemies\\Catman\\Catman.mdl",
  2 texture TEXTURE_CATMAN2_SOLDIER   "ModelsF\\Enemies\\Catman\\Body_Blue.tex",
  3 texture TEXTURE_CATMAN2_GENERAL   "ModelsF\\Enemies\\Catman\\Body_Yellow.tex",
  4 texture TEXTURE_CATMAN2_TERMINATOR   "ModelsF\\Enemies\\Catman\\Body_Green.tex",
  5 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  6 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 30 model   MODEL_DEBRIS_CHEST           "ModelsF\\Enemies\\Catman\\Debris\\Chest.mdl",
 31 model   MODEL_DEBRIS_HEAD           "ModelsF\\Enemies\\Catman\\Debris\\Head.mdl",
 32 model   MODEL_DEBRIS_GUN           "ModelsF\\Enemies\\Catman\\Debris\\Gun.mdl",
 35 model   MODEL_DEBRIS_LEG           "ModelsF\\Enemies\\Catman\\Debris\\Leg.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

 40 model   MODEL_ARMOR          "ModelsF\\Enemies\\Catman\\Armor.mdl",
 41 texture TEXTURE_ARMOR  "ModelsF\\Enemies\\Catman\\Armor.tex",
 42 model   MODEL_MASK          "ModelsF\\Enemies\\Catman\\Mask.mdl",
 43 texture TEXTURE_MASK  "ModelsF\\Enemies\\Catman\\Mask.tex",
 44 model   MODEL_FLARE          "ModelsF\\Enemies\\Catman\\Flare.mdl",
 45 texture TEXTURE_FLARE  "ModelsF\\Enemies\\Catman\\Flare_green.tex",
 46 model   MODEL_CLAWS          "ModelsF\\Enemies\\Catman\\Claws.mdl",
 47 texture TEXTURE_CLAWS    "Models\\ReflectionTextures\\LightBlueMetal01.tex",

 48 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "AREP\\Models\\Catman2\\Sounds\\Small\\Idle.wav",
 51 sound   SOUND_SIGHT     "AREP\\Models\\Catman2\\Sounds\\Small\\Sight.wav",
 52 sound   SOUND_WOUND     "AREP\\Models\\Catman2\\Sounds\\Small\\Wound.wav",
 53 sound   SOUND_FIRE_SOLDIER      "AREP\\Models\\Catman2\\Sounds\\Small\\Fire_Soldier.wav",
 54 sound   SOUND_FIRE_GENERAL      "AREP\\Models\\Catman2\\Sounds\\Small\\Fire_General.wav",
 55 sound   SOUND_KICK      "AREP\\Models\\Catman2\\Sounds\\Small\\Kick.wav",
 56 sound   SOUND_PUNCH     "AREP\\Models\\Catman2\\Sounds\\Small\\Punch.wav",
 57 sound   SOUND_DEATH     "AREP\\Models\\Catman2\\Sounds\\Small\\Death.wav",
 58 sound   SOUND_CLOAK       "\\ModelsF\\Enemies\\Catman\\Sounds\\Invisibility.wav",
 
 59 sound   SOUND_BIG_IDLE      "AREP\\Models\\Catman2\\Sounds\\Big\\Idle.wav",
 60 sound   SOUND_BIG_SIGHT     "AREP\\Models\\Catman2\\Sounds\\Big\\Sight.wav",
 61 sound   SOUND_BIG_WOUND     "AREP\\Models\\Catman2\\Sounds\\Big\\Wound.wav",
 62 sound   SOUND_BIG_FIRE      "AREP\\Models\\Catman2\\Sounds\\Big\\Fire.wav",
 63 sound   SOUND_BIG_KICK      "AREP\\Models\\Catman2\\Sounds\\Big\\Kick.wav",
 64 sound   SOUND_BIG_PUNCH     "AREP\\Models\\Catman2\\Sounds\\Big\\Punch.wav",
 65 sound   SOUND_BIG_DEATH     "AREP\\Models\\Catman2\\Sounds\\Big\\Death.wav",
 
 66 sound   SOUND_APPEAR       "\\ModelsF\\Enemies\\Catman\\Sounds\\Shimmer.wav",

functions:
  void Precache(void) {
    CEnemyBase::Precache();
	PrecacheModel(MODEL_CATMAN2);

    PrecacheModel(MODEL_DEBRIS_CHEST);
    PrecacheModel(MODEL_DEBRIS_HEAD);
    PrecacheModel(MODEL_DEBRIS_GUN);
    PrecacheModel(MODEL_DEBRIS_LEG);

    PrecacheTexture(TEXTURE_ARMOR);
    PrecacheTexture(TEXTURE_MASK);
    PrecacheTexture(TEXTURE_FLARE);
    PrecacheTexture(TEXTURE_CLAWS);
    PrecacheTexture(TEXTURE_SPECULAR);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);

    PrecacheSound(SOUND_CLOAK  );
    PrecacheSound(SOUND_APPEAR );
	
    if (m_CatChar==CAT_SOLDIER)
    {
      PrecacheSound(SOUND_IDLE );
      PrecacheSound(SOUND_SIGHT);
      PrecacheSound(SOUND_WOUND);
      PrecacheSound(SOUND_FIRE_SOLDIER);
      PrecacheSound(SOUND_KICK );
      PrecacheSound(SOUND_PUNCH);
      PrecacheSound(SOUND_DEATH);

      PrecacheTexture(TEXTURE_CATMAN2_SOLDIER);

      PrecacheClass(CLASS_PROJECTILE, PRT_HUANMAN_FIRE);
	}

    if (m_CatChar==CAT_GENERAL)
    {
      PrecacheSound(SOUND_IDLE );
      PrecacheSound(SOUND_SIGHT);
      PrecacheSound(SOUND_WOUND);
      PrecacheSound(SOUND_FIRE_GENERAL);
      PrecacheSound(SOUND_KICK );
      PrecacheSound(SOUND_PUNCH);
      PrecacheSound(SOUND_DEATH);

      PrecacheTexture(TEXTURE_CATMAN2_GENERAL);

      PrecacheClass(CLASS_PROJECTILE, PRT_CATMAN_BOMB);
	}
	
    if (m_CatChar==CAT_TERMINATOR)
    {
      PrecacheSound(SOUND_BIG_IDLE );
      PrecacheSound(SOUND_BIG_SIGHT);
      PrecacheSound(SOUND_BIG_WOUND);
      PrecacheSound(SOUND_BIG_FIRE);
      PrecacheSound(SOUND_BIG_KICK );
      PrecacheSound(SOUND_BIG_PUNCH);
      PrecacheSound(SOUND_BIG_DEATH);

      PrecacheTexture(TEXTURE_CATMAN2_TERMINATOR);

      PrecacheClass(CLASS_PROJECTILE, PRT_GRENADE);
	}



  };

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (eDeath.eLastDamage.dmtType==DMT_CLOSERANGE) {
      str.PrintF(TRANS("%s was sliced open by a Zibakandi"), (const char *) strPlayerName);
    } else {
      str.PrintF(TRANS("%s was terminated by a Zibakandi"), (const char *) strPlayerName);
    }
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier,  "DataMP\\Messages\\Enemies\\AREP\\CatmanSoldier.txt");
    static DECLARE_CTFILENAME(fnmGeneral, "DataMP\\Messages\\Enemies\\AREP\\CatmanGeneral.txt");
    static DECLARE_CTFILENAME(fnmTerminator, "DataMP\\Messages\\Enemies\\AREP\\CatmanTerminator.txt");
    switch(m_CatChar) {
    default: ASSERT(FALSE);
    case CAT_SOLDIER:   return fnmSoldier;
    case CAT_GENERAL: return fnmGeneral;
    case CAT_TERMINATOR: return fnmTerminator;
	}
  };

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    if (m_bInvisible) {
      pes->es_strName+=" Invisible";
    }
    return TRUE;
  }

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiCatman2;
  };

  // get the attachment
  CModelObject *ArmorModel(void) {
    CAttachmentModelObject &amo0 = *GetModelObject()->GetAttachmentModel(CATMAN_ATTACHMENT_ARMOR);
    return &(amo0.amo_moModelObject);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // cat can't harm cat
    if (!IsOfClass(penInflictor, "Catman")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  }

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
        DeactivateCloak();
    INDEX iAnim;
    INDEX iAnimA;
    switch (IRnd()%2) {
      case 0: iAnim = CATMAN_ANIM_WOUND1; iAnimA = ARMOR_ANIM_WOUND1; break;
      case 1: iAnim = CATMAN_ANIM_WOUND2; iAnimA = ARMOR_ANIM_WOUND2; break;
      default: ASSERTALWAYS("Catman unknown damage");
    }
    StartModelAnim(iAnim, 0);
    ArmorModel()->PlayAnim(iAnimA, 0);

    return iAnim | iAnimA;
  };

  // death
  INDEX AnimForDeath(void) {
        DeactivateCloak();
    INDEX iAnim;
    INDEX iAnimA;
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
      if (fDamageDir<0) {
        iAnim = CATMAN_ANIM_DEATH1;
        iAnimA = ARMOR_ANIM_DEATH1;
      } else {
        iAnim = CATMAN_ANIM_DEATH2;
        iAnimA = ARMOR_ANIM_DEATH2;
      }
    
    StartModelAnim(iAnim, 0);
    ArmorModel()->PlayAnim(iAnimA, 0);
    return iAnim | iAnimA;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==CATMAN_ANIM_DEATH1)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.48f;
    }
    else if(GetModelObject()->GetAnim()==CATMAN_ANIM_DEATH2)
    {
      vStretch=FLOAT3D(1,1,2)*0.75f;
      return 0.48f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(CATMAN_COLLISION_BOX_PART_NAME);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(CATMAN_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    ArmorModel()->PlayAnim(ARMOR_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
        DeactivateCloak();
  };
  void WalkingAnim(void) {
    StartModelAnim(CATMAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ArmorModel()->PlayAnim(ARMOR_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
      if (m_penEnemy!=NULL) {
        ActivateCloak();
      } else {
        DeactivateCloak();
      }
  };
  void RunningAnim(void) {
    StartModelAnim(CATMAN_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ArmorModel()->PlayAnim(ARMOR_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
      if (m_penEnemy!=NULL) {
        ActivateCloak();
      } else {
        DeactivateCloak();
      }
  };
  void RotatingAnim(void) {
    StartModelAnim(CATMAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ArmorModel()->PlayAnim(ARMOR_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
      if (m_penEnemy!=NULL) {
        ActivateCloak();
      } else {
        DeactivateCloak();
      }
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, CATSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, CATSOUND(SIGHT), SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, CATSOUND(WOUND), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, CATSOUND(DEATH), SOF_3D);
  };


  // running sounds
  void ActivateCloak(void)
  {
    if (!m_bCloakSoundPlaying) {
      PlaySound(m_soCloak, SOUND_CLOAK, SOF_3D|SOF_LOOP);
      m_bCloakSoundPlaying = TRUE;
	  m_bInvisible = TRUE;
    }
      GetModelObject()->mo_colBlendColor = C_BLACK|0x25;
  }
  void DeactivateCloak(void)
  {
    m_soCloak.Stop();
    m_bCloakSoundPlaying = FALSE;
	  m_bInvisible = FALSE;
      GetModelObject()->mo_colBlendColor = C_WHITE|CT_OPAQUE;
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
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_DEBRIS_CHEST, TEXTURE_ARMOR, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_HEAD, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_GUN, TEXTURE_ARMOR, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
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
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateCloak();
    PlaySound(m_soCloak, SOUND_APPEAR, SOF_3D|SOF_SMOOTHCHANGE);
    // to fire
    StartModelAnim(CATMAN_ANIM_TOFIRE, 0);
    ArmorModel()->PlayAnim(ARMOR_ANIM_TOFIRE, 0); 
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(CATMAN_ANIM_TOFIRE);
    autocall CEnemyBase::LockOnEnemy() EReturn;
    // fire projectile 
    autowait(0.35f);
    if (m_CatChar==CAT_SOLDIER) {
      StartModelAnim(CATMAN_ANIM_FIRE, 0);
      ArmorModel()->PlayAnim(ARMOR_ANIM_FIRE, AOF_NORESTART); 
      PlaySound(m_soSound, SOUND_FIRE_SOLDIER, SOF_3D);
      ShootProjectile(PRT_HUANMAN_FIRE, FIRE_LEFT_HAND, ANGLE3D(6, 0, 0));
      autowait(0.1f + FRnd()*0.1f);

      StartModelAnim(CATMAN_ANIM_FIRE, 0);
      ArmorModel()->PlayAnim(ARMOR_ANIM_FIRE, AOF_NORESTART); 
      PlaySound(m_soSound, SOUND_FIRE_SOLDIER, SOF_3D);
      ShootProjectile(PRT_HUANMAN_FIRE, FIRE_LEFT_HAND, ANGLE3D(0, 0, 0));
      autowait(0.1f + FRnd()*0.1f);

      StartModelAnim(CATMAN_ANIM_FIRE, 0);
      ArmorModel()->PlayAnim(ARMOR_ANIM_FIRE, AOF_NORESTART); 
      PlaySound(m_soSound, SOUND_FIRE_SOLDIER, SOF_3D);
      ShootProjectile(PRT_HUANMAN_FIRE, FIRE_LEFT_HAND, ANGLE3D(-6, 0, 0));
      autowait(0.1f + FRnd()*0.1f);

	}
    if (m_CatChar==CAT_GENERAL) {
      StartModelAnim(CATMAN_ANIM_FIRE, 0);
      ArmorModel()->PlayAnim(ARMOR_ANIM_FIRE, AOF_NORESTART); 
      PlaySound(m_soSound, SOUND_FIRE_GENERAL, SOF_3D);

	  FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      CalculateAngularLaunchParams(GetPlacement().pl_PositionVector, SHOOT_LAUNCH(2)-1.5f, m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0), SHOOT_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
	  
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(-2, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_CATMAN_BOMB;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(0.035f);

      StartModelAnim(CATMAN_ANIM_FIRE, 0);
      ArmorModel()->PlayAnim(ARMOR_ANIM_FIRE, AOF_NORESTART); 
      PlaySound(m_soSound, SOUND_FIRE_GENERAL, SOF_3D);

	  FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      CalculateAngularLaunchParams(GetPlacement().pl_PositionVector, SHOOT_LAUNCH(2)-1.5f, m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0), SHOOT_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
	  
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(2, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_CATMAN_BOMB;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);
      autowait(0.1f + FRnd()*0.1f);

	}
    if (m_CatChar==CAT_TERMINATOR) {
      StartModelAnim(CATMAN_ANIM_FIRE, 0);
      ArmorModel()->PlayAnim(ARMOR_ANIM_FIRE, AOF_NORESTART); 
      PlaySound(m_soSound, SOUND_BIG_FIRE, SOF_3D);

	  FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      CalculateAngularLaunchParams(GetPlacement().pl_PositionVector, SHOOT_LAUNCH(2)-1.5f, m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0), SHOOT_ANGLE,
      fLaunchSpeed,
      fRelativeHdg);
	  
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, SHOOT_LAUNCH, ANGLE3D(0, SHOOT_ANGLE, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_GRENADE;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);
      autowait(0.1f + FRnd()*0.1f);
	}

    // from fire
    StartModelAnim(CATMAN_ANIM_FROMFIRE, 0);
    ArmorModel()->PlayAnim(ARMOR_ANIM_FROMFIRE, 0); 
    autowait(GetModelObject()->GetAnimLength(CATMAN_ANIM_FROMFIRE));

    MaybeSwitchToAnotherPlayer();

      return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    // hit
    if (CalcDist(m_penEnemy) < BONES_HIT) {
      jump HitWithBones();

    // jump
    } else if (CalcDist(m_penEnemy) < 7.0f) {
      jump JumpOnEnemy();
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    return EReturn();
  };

  // jump on enemy
  JumpOnEnemy(EVoid) {
    StartModelAnim(CATMAN_ANIM_LEAP, 0);
    ArmorModel()->PlayAnim(ARMOR_ANIM_LEAP, AOF_NORESTART); 
    DeactivateCloak();
    PlaySound(m_soCloak, SOUND_APPEAR, SOF_3D|SOF_SMOOTHCHANGE);


    // jump
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*1.5f;
    vDir(2) = 2.5f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, CATSOUND(KICK), SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    m_iChargeHitAnimation = CATMAN_ANIM_LEAP;
	
    if (m_CatChar==CAT_SOLDIER) {
          m_fChargeHitDamage = 15.0f; }
    if (m_CatChar==CAT_GENERAL) {
          m_fChargeHitDamage = 25.0f; }
    if (m_CatChar==CAT_TERMINATOR) {
          m_fChargeHitDamage = 35.0f; }
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 15.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.3f);
    return EReturn();
  };

  // hit with bones
  HitWithBones(EVoid) {
    // attack with bones
    DeactivateCloak();
    StartModelAnim(CATMAN_ANIM_MELEE, 0);
    ArmorModel()->PlayAnim(ARMOR_ANIM_MELEE, AOF_NORESTART); 

    // right hand
    m_bFistHit = FALSE;
    autowait(0.35f);
    if (CalcDist(m_penEnemy)<BONES_HIT) { m_bFistHit = TRUE; }
    PlaySound(m_soSound, CATSOUND(PUNCH), SOF_3D);
    autowait(0.10f);

    if (CalcDist(m_penEnemy)<BONES_HIT) { m_bFistHit = TRUE; }
    if (m_bFistHit) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      // damage enemy
    if (m_CatChar==CAT_SOLDIER) {
          InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection); }
    if (m_CatChar==CAT_GENERAL) {
          InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection); }
    if (m_CatChar==CAT_TERMINATOR) {
          InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection); }
      // push target left
      FLOAT3D vSpeed;
      GetHeadingDirection(AngleDeg(0.0f), vSpeed);
      vSpeed = vSpeed * 5.0f;
      KickEntity(m_penEnemy, vSpeed);
    }
    autowait(0.05f);
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
    en_tmMaxHoldBreath = 10.0f;
    if (m_CatChar==CAT_SOLDIER) {
        SetHealth(70.0f);
        m_fMaxHealth = 70.0f; }
    if (m_CatChar==CAT_GENERAL) {
        SetHealth(150.0f);
        m_fMaxHealth = 150.0f; }
    if (m_CatChar==CAT_TERMINATOR) {
        SetHealth(300.0f);
        m_fMaxHealth = 310.0f; }

    en_fDensity = 2000.0f;
	m_sptType = SPT_ELECTRICITY_SPARKS;

    // set your appearance
    SetModel(MODEL_CATMAN2);
    AddAttachmentToModel(this, *GetModelObject(), CATMAN_ATTACHMENT_ARMOR, MODEL_ARMOR, TEXTURE_ARMOR, 0, TEXTURE_SPECULAR, 0);
    AddAttachmentToModel(this, *GetModelObject(), CATMAN_ATTACHMENT_MASK, MODEL_MASK, TEXTURE_MASK, 0, TEXTURE_SPECULAR, 0);
    AddAttachmentToModel(this, *GetModelObject(), CATMAN_ATTACHMENT_CLAWS, MODEL_CLAWS, TEXTURE_CLAWS, TEXTURE_CLAWS, TEXTURE_SPECULAR, 0);
    AddAttachmentToModel(this, *GetModelObject(), CATMAN_ATTACHMENT_FLAREL, MODEL_FLARE, TEXTURE_FLARE, 0, 0, 0);
    AddAttachmentToModel(this, *GetModelObject(), CATMAN_ATTACHMENT_FLARER, MODEL_FLARE, TEXTURE_FLARE, 0, 0, 0);

    if (m_CatChar==CAT_SOLDIER) {

    SetModelMainTexture(TEXTURE_CATMAN2_SOLDIER);
		m_fgibTexture = TEXTURE_CATMAN2_SOLDIER;
    // set stretch factor
    GetModelObject()->StretchModel(FLOAT3D(SOLDIER_STRETCH, SOLDIER_STRETCH, SOLDIER_STRETCH));
    ModelChangeNotify();
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 3.0f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd() + 14.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 19.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 150.0f;
    m_fCloseDistance = 7.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 4.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 300.0f;
    // damage/explode properties
    m_fBlowUpAmount = 80.0f;
    m_fBodyParts = 2;
	m_fBlowUpSize = 1.2f;
    m_fDamageWounded = 20.0f;
    m_iScore = 1000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    m_soCloak.Set3DParameters(50.0f, 1.0f, 0.5f, 1.0f);
    }
   }

    if (m_CatChar==CAT_GENERAL) {

    SetModelMainTexture(TEXTURE_CATMAN2_GENERAL);
		m_fgibTexture = TEXTURE_CATMAN2_GENERAL;
    // set stretch factor
    GetModelObject()->StretchModel(FLOAT3D(GENERAL_STRETCH, GENERAL_STRETCH, GENERAL_STRETCH));
    ModelChangeNotify();
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.0f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd() + 9.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 11.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 7.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 4.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 300.0f;
    // damage/explode properties
    m_fBlowUpAmount = 200.0f;
    m_fBodyParts = 3;
	m_fBlowUpSize = 1.6f;
    m_fDamageWounded = 50.0f;
    m_iScore = 3000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    m_soCloak.Set3DParameters(50.0f, 2.0f, 0.5f, 1.0f);
    }
   }

    if (m_CatChar==CAT_TERMINATOR) {

    SetModelMainTexture(TEXTURE_CATMAN2_TERMINATOR);
		m_fgibTexture = TEXTURE_CATMAN2_TERMINATOR;
    // set stretch factor
    GetModelObject()->StretchModel(FLOAT3D(TERMINATOR_STRETCH, TERMINATOR_STRETCH, TERMINATOR_STRETCH));
    ModelChangeNotify();
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 3.5f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 45.0f;
    m_fAttackRunSpeed = FRnd() + 12.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 15.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 130.0f;
    m_fCloseDistance = 7.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 4.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 300.0f;
    // damage/explode properties
    m_fBlowUpAmount = 600.0f;
    m_fBodyParts = 6;
	m_fBlowUpSize = 2.0f;
    m_fDamageWounded = 100.0f;
    m_iScore = 6000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    m_soCloak.Set3DParameters(50.0f, 3.0f, 0.5f, 1.0f);
    }
   }


    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsF/NextEncounter/Enemies/Lurker/Lurker.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Projectile";
uses "EntitiesMP/Reminder";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiLurker = {
  EIBT_FLESH, 2000.0f,
  0.0f, 5.4f, 0.0f,
  0.0f, 4.5f, 0.0f,
};
#define FIRE	   FLOAT3D(0.0f, 4.75f, -3.0f)

%}


class CLurker : CEnemyBase {
name      "Lurker";
thumbnail "Thumbnails\\Lurker.tbn";

properties:
  2 INDEX m_iCounter = 0,
  3 FLOAT m_fSize = 1.0f,
  5 FLOAT m_fThreatDistance = 5.0f,

  8 INDEX m_iFiredProjectiles = 0,                      // internal counter of fired projectiles
  9 INDEX m_iToFireProjectiles = 0,                     // internal counter of projectiles that should be fired
  10 FLOAT3D m_vBeamSource = FLOAT3D( 0,0,0),      // position of electricity ray target
  11 FLOAT3D m_vBeamTarget = FLOAT3D( 0,0,0),      // position of electricity ray target
  12 BOOL m_bRenderElectricity = FALSE,                   // if electricity particles are rendered
  13 FLOAT m_tmTemp = 0,

  20 CSoundObject m_soFeet,
  21 CSoundObject m_soFire1,
  22 CSoundObject m_soFire2,
  23 CSoundObject m_soFire3,
  24 CSoundObject m_soFire4,
  
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_LURKER              "ModelsF\\NextEncounter\\Enemies\\Lurker\\Lurker.mdl",

 12 texture TEXTURE_LURKER            "ModelsF\\NextEncounter\\Enemies\\Lurker\\Lurker.tex",
 20 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",

 13 model   MODEL_ARML              "ModelsF\\NextEncounter\\Enemies\\Lurker\\Debris\\ArmL.mdl",
 14 model   MODEL_ARMR              "ModelsF\\NextEncounter\\Enemies\\Lurker\\Debris\\ArmR.mdl",
 15 model   MODEL_HEAD              "ModelsF\\NextEncounter\\Enemies\\Lurker\\Debris\\Head.mdl",
 16 model   MODEL_LEGS              "ModelsF\\NextEncounter\\Enemies\\Lurker\\Debris\\Legs.mdl",
 17 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 18 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE        "ModelsF\\NextEncounter\\Enemies\\Lurker\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT       "ModelsF\\NextEncounter\\Enemies\\Lurker\\Sounds\\Sight.wav",
 52 sound   SOUND_BEAM        "ModelsF\\NextEncounter\\Enemies\\Lurker\\Sounds\\AttackLaser.wav",
 53 sound   SOUND_FIRE        "ModelsF\\NextEncounter\\Enemies\\Lurker\\Sounds\\AttackLaser.wav",
 54 sound   SOUND_DEATH       "ModelsF\\NextEncounter\\Enemies\\Lurker\\Sounds\\Death.wav",
 56 sound   SOUND_MELEE       "ModelsF\\NextEncounter\\Enemies\\Lurker\\Sounds\\Melee.wav",
 57 sound   SOUND_WOUND       "ModelsF\\NextEncounter\\Enemies\\Lurker\\Sounds\\Wound.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Carcinus Lurker zapped %s out of existence"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\NE\\Lurker.txt");
    return fnm;
  };

  // overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }

  void Precache(void) {
    CEnemyBase::Precache();
	  PrecacheModel(MODEL_LURKER);
      PrecacheTexture(TEXTURE_LURKER);
      // sounds
      PrecacheSound(SOUND_IDLE );
      PrecacheSound(SOUND_SIGHT);
      PrecacheSound(SOUND_DEATH);
      PrecacheSound(SOUND_FIRE);
      PrecacheSound(SOUND_BEAM);
      PrecacheSound(SOUND_MELEE);
      PrecacheSound(SOUND_WOUND);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_ROCKET_SEEKING);

	  PrecacheModel(MODEL_ARML);
	  PrecacheModel(MODEL_ARMR);
	  PrecacheModel(MODEL_HEAD);
	  PrecacheModel(MODEL_LEGS);
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiLurker;
  };

  // render particles
  void RenderParticles(void)
  {
    if( m_bRenderElectricity)
    {
      // calculate electricity ray source pos
      Particles_ExotechLarvaLaser(this, m_vBeamSource, m_vBeamTarget);
    }

    CEnemyBase::RenderParticles();
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // walker can't harm walker
    if (!IsOfClass(penInflictor, "Lurker")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection); }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    m_bRenderElectricity=FALSE;
    INDEX iAnim;
      FLOAT3D vFront;
      GetHeadingDirection(0, vFront);
      FLOAT fDamageDir = m_vDamage%vFront;
	  if (fDamageDir<0) {
          iAnim = LURKER_ANIM_WOUNDBACKWARD;
        } else {
          iAnim = LURKER_ANIM_WOUNDFORWARD;
        }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
  }

  // death
  INDEX AnimForDeath(void) {
    m_bRenderElectricity=FALSE;
    StartModelAnim(LURKER_ANIM_DEATH, 0);
    return LURKER_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==LURKER_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };


  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(LURKER_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    StartModelAnim(LURKER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RunningAnim(void) {
    StartModelAnim(LURKER_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
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
    PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
   };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
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
  void BlowUp(void) {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

	
      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;
    // spawn debris
	Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_ARML, TEXTURE_LURKER, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARMR, TEXTURE_LURKER, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_LURKER, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEGS, TEXTURE_LURKER, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 1.0f,
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
    // to fire
    StartModelAnim(LURKER_ANIM_ATTACKLASER, 0);
    PlaySound(m_soSound, SOUND_BEAM, SOF_3D);
    autowait(0.6f);

    // start fireing electricity
      const FLOATmatrix3D &m = GetRotationMatrix();
      m_vBeamSource=GetPlacement().pl_PositionVector+FIRE*m;

      // target enemy body
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, m_vBeamTarget);

      // give some time so player can move away from electricity beam
      autowait(0.1f);

      // fire electricity beam
      m_bRenderElectricity = TRUE;
      m_tmTemp = _pTimer->CurrentTick();
      while(_pTimer->CurrentTick() < m_tmTemp+1.2f)
      {
        wait(_pTimer->TickQuantum) {
          on (EBegin): {
            // correct electricity beam target
            FLOAT3D vNewTarget;
            EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
            GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vNewTarget);
            FLOAT3D vDiff = vNewTarget-m_vBeamTarget;
            // if we have valid length
            if( vDiff.Length() > 1.0f)
            {
              // calculate adjustment
              m_vBeamTarget = m_vBeamTarget+vDiff.Normalize()*10.0f*_pTimer->TickQuantum;
            }

            // cast ray
            CCastRay crRay( this, m_vBeamSource, m_vBeamTarget);
            crRay.cr_bHitTranslucentPortals = FALSE;
            crRay.cr_bPhysical = FALSE;
            crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
            GetWorld()->CastRay(crRay);
            // if entity is hit
            if( crRay.cr_penHit != NULL)
            {
              // apply damage
              InflictDirectDamage( crRay.cr_penHit, this, DMT_BURNING, 30.0f*_pTimer->TickQuantum/0.5f,
                FLOAT3D(0, 0, 0), (m_vBeamSource-m_vBeamTarget).Normalize());
            }

            resume;
          };
          on (ETimer): { stop; };
        }
	}
      m_bRenderElectricity = FALSE;
    autowait(0.4f);

    MaybeSwitchToAnotherPlayer();

    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    StartModelAnim(LURKER_ANIM_MELEE, 0);
    PlaySound(m_soSound, SOUND_MELEE, SOF_3D);
    // damage enemy
    autowait(0.5f);
    // damage enemy
      if (CalcDist(m_penEnemy) < m_fCloseDistance) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.SafeNormalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 40.0f, FLOAT3D(0, 0, 0), vDirection);
		}
    autowait(0.4f);
    // damage enemy
      if (CalcDist(m_penEnemy) < m_fCloseDistance) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.SafeNormalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection);
		}
    autowait(0.5f);

    StandingAnim();
    return EReturn();
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    m_bRenderElectricity=FALSE;
    
    autocall CEnemyBase::Death() EEnd;
    return EEnd();
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
      SetHealth(600.0f);
      m_fMaxHealth = 600.0f;
    en_fDensity = 3000.0f;

    m_sptType = SPT_SLIME;

    // set your appearance
      SetModel(MODEL_LURKER);
      SetModelMainTexture(TEXTURE_LURKER);
      SetModelSpecularTexture(TEXTURE_SPECULAR);
      GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
      ModelChangeNotify();
      m_fBlowUpAmount = 750.0f;
      m_iScore = 8000;
      m_fThreatDistance = 15;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 14.0f;
    }

    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*1.5f + 2.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
    m_fAttackRunSpeed = FRnd()*1.5f + 10.0f;;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2;
    m_fCloseRunSpeed = m_fAttackRunSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2;
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseDistance = 12.0f;
    m_fStopDistance = 10.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 1000.0f;
    // damage/explode properties
    m_fBodyParts = 10;
    m_fBlowUpSize = 2.0f;
    m_fDamageWounded = 200.0f;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

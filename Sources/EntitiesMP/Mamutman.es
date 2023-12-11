343
%{
#include "EntitiesMP/StdH/StdH.h"
#include "AREP/Models/Mamutman2/Mamutman.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/SummonerMarker";

event EMmTeleport {
  FLOAT fWait, 
};

enum mmType {
  0 MM_MONK    "Monk",
  1 MM_CARDINAL  "Cardinal",
};

%{
#define STRETCH_MONK   2.0f
#define STRETCH_CARDINAL 2.5f
  
// info structure
static EntityInfo eiMamutmanMonk = {
  EIBT_FLESH, 250.0f,
  0.0f, 2.0f*STRETCH_MONK, 0.0f,     // source (eyes)
  0.0f, 1.5f*STRETCH_MONK, 0.0f,     // target (body)
};

static EntityInfo eiMamutmanCardinal = {
  EIBT_FLESH, 500.0f,
  0.0f, 2.0f*STRETCH_CARDINAL, 0.0f,     // source (eyes)
  0.0f, 1.5f*STRETCH_CARDINAL, 0.0f,     // target (body)
};

#define FIREPOS_MONK      FLOAT3D(0.0f, 0.8f, 0.0f)*STRETCH_MONK
#define FIREPOS_CARDINAL_UP  FLOAT3D(0.0f, 0.8f, 0.0f)*STRETCH_CARDINAL
#define FIREPOS_CARDINAL_DN  FLOAT3D(0.0f, 0.8f, 0.0f)*STRETCH_CARDINAL
%}


class CMamutMan: CEnemyBase {
name      "MamutMan";
thumbnail "Thumbnails\\MamutMan.tbn";

properties:
  1 enum mmType m_mmType "Type" 'Y' = MM_MONK,

  2 BOOL  m_bInvulnerable = FALSE, // can we be hurt?
  3 BOOL  m_bShouldTeleport = FALSE, // are we allowed to teleport?
  4 FLOAT m_fImmaterialDuration "Teleport Immaterial Duration" = 1.0f, // how long to stay immaterial
  5 FLOAT m_fCorporealDuration "Teleport Corporeal Duration" = 5.0f, // how long to stay material
  6 FLOAT m_tmMaterializationTime = 0.0f, // when we materialized

  7 CEntityPointer m_penTeleportMarker "Teleport marker",
  8 INDEX m_iTeleportMarkers = 0, // number of teleport markers
  9 FLOAT m_fTeleportWaitTime = 0.0f, // internal
  10 BOOL  m_bDying = FALSE,  // set when dying

  11 CSoundObject m_soFire1,
  12 CSoundObject m_soFire2,
  13 CSoundObject m_soTeleport,
  14 FLOAT m_tmParticlesDisappearStart=-1e6,
  
  15 INDEX   m_fgibTexture = TEXTURE_MONK,

// class internal
    
components:
  1 class   CLASS_BASE            "Classes\\EnemyBase.ecl",
  3 class   CLASS_PROJECTILE      "Classes\\Projectile.ecl",
  4 class   CLASS_BASIC_EFFECT       "Classes\\BasicEffect.ecl",

 10 model   MODEL_MAMUTMAN           "AREP\\Models\\MamutMan2\\MamutMan.mdl",
 
 20 texture TEXTURE_MONK       "AREP\\Models\\MamutMan2\\MamutmanMonk.tex",
 21 texture TEXTURE_CARDINAL     "AREP\\Models\\MamutMan2\\MamutmanCardinal.tex",

 30 model   MODEL_DEBRIS_BODY           "AREP\\Models\\MamutMan2\\Debris\\bod.mdl",
 31 model   MODEL_DEBRIS_LEG           "AREP\\Models\\MamutMan2\\Debris\\leg.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",
 
// ************** SOUNDS **************
 50 sound   SOUND_IDLE            "ModelsF\\Enemies\\MamutMan\\Sounds\\Idle.wav",
 52 sound   SOUND_SIGHT           "ModelsF\\Enemies\\MamutMan\\Sounds\\Sight.wav",
 53 sound   SOUND_WOUND           "ModelsF\\Enemies\\MamutMan\\Sounds\\Wound.wav",
 57 sound   SOUND_FIRE            "ModelsF\\Enemies\\MamutMan\\Sounds\\Fire.wav",
 58 sound   SOUND_DEATH           "ModelsF\\Enemies\\MamutMan\\Sounds\\Death.wav",
 59 sound   SOUND_KICK           "ModelsF\\Enemies\\MamutMan\\Sounds\\Kick.wav",
 60 sound  SOUND_MATERIALIZE "AREP\\Models\\MamutMan2\\Sounds\\Materialize.wav",
 61 sound  SOUND_TELEPORT    "AREP\\Models\\MamutMan2\\Sounds\\Teleport.wav",

functions:
  void Read_t( CTStream *istr) // throw char *
  { 
    CEnemyBase::Read_t(istr);
  }
  
  void Write_t( CTStream *istr) // throw char *
  { 
    CEnemyBase::Write_t(istr);
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
   if( slPropertyOffset == offsetof(CMamutMan, m_penTeleportMarker))
    {
      if (IsDerivedFromClass(penTarget, "SummonerMarker")) {
        return TRUE;
      } else {
        return FALSE;
      }
    }
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);    
  }

  BOOL DoSafetyChecks(void) {
    if (m_penTeleportMarker==NULL) {
        WarningMessage( "No valid Teleport Marker for Mamutman! Destroying Mamutman...");
        return FALSE;
    }
  }
    
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s has been sacrificed to an alien god"), (const char *) strPlayerName);
    return str;
  }

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_mmType==MM_MONK) {
      return &eiMamutmanCardinal;
    } else if (m_mmType==MM_CARDINAL) {
      return &eiMamutmanMonk;
    } else {
      ASSERT("Unknown grunt type!");
      return NULL;
    }
  };

  BOOL DistanceToAllPlayersGreaterThen(FLOAT fDistance)
  {
    // find actual number of players
    INDEX ctMaxPlayers = GetMaxPlayers();
    CEntity *penPlayer;
    
    for(INDEX i=0; i<ctMaxPlayers; i++) {
      penPlayer=GetPlayerEntity(i);
      if (penPlayer) {
        if (DistanceTo(this, penPlayer)<fDistance) {
          return FALSE;
        }
      }
    }
    return TRUE;
  };

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmMonk,     "DataMP\\Messages\\Enemies\\AREP\\MamutManMonk.txt");
    static DECLARE_CTFILENAME(fnmCardinal,   "DataMP\\Messages\\Enemies\\AREP\\MamutManCardinal.txt");
    switch(m_mmType) {
    default: ASSERT(FALSE);
    case MM_MONK:  return fnmMonk;
    case MM_CARDINAL: return fnmCardinal;
    }
  };

  void Precache(void) {
    CEnemyBase::Precache();

    PrecacheModel(MODEL_MAMUTMAN);
    PrecacheTexture(TEXTURE_MONK);
    PrecacheTexture(TEXTURE_CARDINAL);

    PrecacheClass(CLASS_PROJECTILE, PRT_MAMUTMAN);

    PrecacheClass(CLASS_BASIC_EFFECT, BET_CANNON );

    PrecacheSound(SOUND_IDLE);
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_KICK);
    PrecacheSound(SOUND_MATERIALIZE );
    PrecacheSound(SOUND_TELEPORT    );

    PrecacheModel(MODEL_DEBRIS_BODY);
    PrecacheModel(MODEL_DEBRIS_LEG);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable) {
      return;
    }
    // mamutman can't harm mamutman
    if (!IsOfClass(penInflictor, "MamutMan")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
      // if died of chainsaw
      if (dmtType==DMT_CHAINSAW && GetHealth()<=0) {
        // must always blowup
        m_fBlowUpAmount = 0;
      }
    }
    // cannot be telefragged
    if(dmtType==DMT_TELEPORT)
    {
      return;
    }
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    switch (IRnd()%3) {
      case 0: iAnim = MAMUTMAN_ANIM_WOUND01; break;
      case 1: iAnim = MAMUTMAN_ANIM_WOUND02; break;
      case 2: iAnim = MAMUTMAN_ANIM_WOUND03 ; break;
      default: ASSERTALWAYS("MamutMan unknown damage");
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  void RenderParticles(void)
  {
    FLOAT tmNow = _pTimer->CurrentTick();
   }

  void DisappearEffect(void)
  {
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(2.0,2.0,2.0);
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_TELEPORT_REVERSE;
        FLOATaabbox3D box;
        this->GetBoundingBox(box);
        FLOAT fEntitySize = box.Size().MaxNorm()*2;
        ese.vStretch = FLOAT3D(fEntitySize, fEntitySize, fEntitySize);
        CEntityPointer penEffect = CreateEntity(plFX, CLASS_BASIC_EFFECT);
        penEffect->Initialize(ese);

    /*
    // growing swirl
    ese.betType = BET_DISAPPEAR_DUST;
    penFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);
    */
  }

  void SpawnTeleportEffect(void)
  {
    ESpawnEffect ese;
    ese.colMuliplier = C_lMAGENTA|CT_OPAQUE;
    ese.vStretch = FLOAT3D(6,6,6);
    ese.vNormal = FLOAT3D(0,3,0);

    // explosion debris
    CPlacement3D plFX=GetPlacement();
    ese.betType = BET_TELEPORT;
    ese.colMuliplier = C_CYAN|CT_OPAQUE;
    CEntityPointer penFX4 = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX4->Initialize(ese);

    // explosion smoke
    /*
    ese.betType = BET_EXPLOSION_SMOKE;
    penFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);
    */
   }

  void AdjustDifficulty(void)
  {
    // bull must not change its speed at different difficulties
  }

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    FLOAT3D vFront;
    GetHeadingDirection(0, vFront);
    FLOAT fDamageDir = m_vDamage%vFront;
    if (fDamageDir<0) {
      iAnim = MAMUTMAN_ANIM_DEATH01;
    } else {
      iAnim = MAMUTMAN_ANIM_DEATH02;
    }

    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    vStretch=FLOAT3D(1,1,2);
    if(GetModelObject()->GetAnim()==MAMUTMAN_ANIM_DEATH01)
    {
      return 0.5f;
    }
    else if(GetModelObject()->GetAnim()==MAMUTMAN_ANIM_DEATH02)
    {
      return 1.0f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(MAMUTMAN_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(MAMUTMAN_ANIM_STAND, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    StartModelAnim(MAMUTMAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };
  void RunningAnim(void) {
    StartModelAnim(MAMUTMAN_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    StartModelAnim(MAMUTMAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
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
    m_soFire1.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
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
    
    Debris_Spawn(this, this, MODEL_DEBRIS_BODY, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.2f,
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
  
  InitiateTeleport()
  {
    m_bInvulnerable = TRUE;
    StopMoving();

    // start disappear particles
    FLOAT tmNow = _pTimer->CurrentTick();
    m_tmParticlesDisappearStart=tmNow;

    PlaySound(m_soSound, SOUND_TELEPORT, SOF_3D);

    autowait(0.5f);
    jump Immaterial();
  }

  Fire(EVoid) : CEnemyBase::Fire {
    // monk
    if (m_mmType == MM_MONK) {
      autocall MonkAttack() EEnd;
    // commander
    } else if (m_mmType == MM_CARDINAL) {
      autocall CardinalAttack() EEnd;
    // should never get here
    } else{
      ASSERT(FALSE);
    }
    return EReturn();
  };
    
  // Monk attack
  MonkAttack(EVoid) {
    StandingAnim();
    autowait(0.2f + FRnd()*0.25f);

    StartModelAnim(MAMUTMAN_ANIM_ATTACK02, 0);
    autowait(0.51f);
    ShootProjectile(PRT_MAMUTMAN, FIREPOS_MONK, ANGLE3D(0, 0, 0));
    PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);
    

    autowait(0.5f);
    DisappearEffect();
    EMmTeleport est;
    est.fWait = 0.05f;
    SendEvent(est);
    jump MmteleportLoop();
    return EEnd();
  };

  // Cardinal attack (predicted firing on moving player)
  CardinalAttack(EVoid) {
    StandingAnim();
    autowait(0.2f + FRnd()*0.25f);

    /*FLOAT3D vGunPosAbs   = GetPlacement().pl_PositionVector + FLOAT3D(0.0f, 1.0f, 0.0f)*GetRotationMatrix();
    FLOAT3D vEnemySpeed  = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    FLOAT3D vEnemyPos    = ((CMovableEntity&) *m_penEnemy).GetPlacement().pl_PositionVector;
    FLOAT   fLaserSpeed  = 45.0f; // m/s
    FLOAT3D vPredictedEnemyPosition = CalculatePredictedPosition(vGunPosAbs,
      vEnemyPos, fLaserSpeed, vEnemySpeed, GetPlacement().pl_PositionVector(2) );
    ShootPredictedProjectile(PRT_SHOOTER_FIREBALL, vPredictedEnemyPosition, FLOAT3D(0.0f, 1.0f, 0.0f), ANGLE3D(0, 0, 0));*/

    StartModelAnim(MAMUTMAN_ANIM_ATTACK02, 0);
    ShootProjectile(PRT_MAMUTMAN, FIREPOS_CARDINAL_DN, ANGLE3D(-10, 0, 0));
    PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    ShootProjectile(PRT_MAMUTMAN, FIREPOS_CARDINAL_DN, ANGLE3D(-5, 0, 0));
    PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    ShootProjectile(PRT_MAMUTMAN, FIREPOS_CARDINAL_DN, ANGLE3D(0, 0, 0));
    PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    ShootProjectile(PRT_MAMUTMAN, FIREPOS_CARDINAL_DN, ANGLE3D(5, 0, 0));
    PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    ShootProjectile(PRT_MAMUTMAN, FIREPOS_CARDINAL_DN, ANGLE3D(10, 0, 0));
    PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);

    MaybeSwitchToAnotherPlayer();
    autowait(0.5f);
    DisappearEffect();
    EMmTeleport est;
    est.fWait = 0.05f;
    SendEvent(est);
    jump MmteleportLoop();
	return EEnd();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    StartModelAnim(MAMUTMAN_ANIM_ATTACK01, 0);
    autowait(0.45f);
    /*
    StartModelAnim(MAMUTMAN_ANIM_ATTACK01, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    */
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_mmType == MM_MONK) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_mmType == MM_CARDINAL) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
      }
      // push target
      FLOAT3D vSpeed;
      GetHeadingDirection(AngleDeg(0.0f), vSpeed);
      vSpeed = vSpeed * 20.0f;
      KickEntity(m_penEnemy, vSpeed);
    }

    /*
    StartModelAnim(MAMUTMAN_ANIM_STAND, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    */
    autowait(0.45f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };
/************************************************************
 *                   TELEPORT FUNCTIONS                     *
 ************************************************************/

  MmAppear(EVoid)
  {
    return EReturn();
  }

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {
    autocall MmAppear() EReturn;
    return EReturn();
  }

  Immaterial() {
    
    // hide model
    SwitchToEditorModel();
    SetCollisionFlags(ECF_IMMATERIAL);
    
    // destroy possible flames
    CEntityPointer penFlame = GetChildOfClass("Flame");
    if (penFlame!=NULL) {
      penFlame->Destroy();
    }

    // wait required time
    autowait(m_fImmaterialDuration);
    
    FLOAT3D vTarget;
    // move to a new position
      CSummonerMarker *marker = &((CSummonerMarker &)*m_penTeleportMarker);
      INDEX iMarker = IRnd()%m_iTeleportMarkers;
      while (iMarker>0) {
        marker = &((CSummonerMarker &)*marker->m_penTarget);
        iMarker--;
      }
      vTarget = marker->GetPlacement().pl_PositionVector;
      FLOAT fR = FRnd()*marker->m_fMarkerRange;
      FLOAT fA = FRnd()*360.0f;
      vTarget += FLOAT3D(CosFast(fA)*fR, 0.05f, SinFast(fA)*fR);
    
    CPlacement3D pl;
    pl.pl_PositionVector = vTarget;
    FLOAT3D vToPlayer;
    if (m_penEnemy!=NULL) {
      vToPlayer = m_penEnemy->GetPlacement().pl_PositionVector - vTarget;
    } else {
      vToPlayer = m_vPlayerSpotted - vTarget;
    }
    vToPlayer.Normalize();
    DirectionVectorToAngles(vToPlayer, pl.pl_OrientationAngle);
    Teleport(pl);

    // show model
    SpawnTeleportEffect();
    SwitchToModel();
    SetCollisionFlags(ECF_MODEL);
    
    m_bShouldTeleport = FALSE;
    m_tmMaterializationTime = _pTimer->CurrentTick();

    m_bInvulnerable = FALSE;
    
    PlaySound(m_soTeleport, SOUND_MATERIALIZE, SOF_3D);

    SendEvent(EBegin());
    return EReturn();

  }

  MmteleportLoop() {
    // spawn a 1sec reminder
    wait () {
      on (EBegin) :
      {
        call CEnemyBase::MainLoop();
      }
      on (EReminder er) :
      {
        // pass all reminders but the 128 one
		if (GetHealth() >= 1.0) {
          // see if we have to teleport
            m_bShouldTeleport = TRUE;
           call InitiateTeleport();
		   }
		   if (TRUE) {
          pass;
        }
        resume;
      }      
      // we want to teleport in near future
      on (EMmTeleport est) :
      {
        //m_fTeleportWaitTime = est.fWait;
        SpawnReminder(this, est.fWait, 129);
        resume;
      }
      otherwise () : {
        resume;
      }
    }
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
    en_fDensity = 2000.0f;
    //m_fBlowUpSize = 2.0f;

    // set your appearance
    SetModel(MODEL_MAMUTMAN);
    switch (m_mmType) {
      case MM_MONK:
        // set your texture
        SetModelMainTexture(TEXTURE_MONK);
		m_fgibTexture = TEXTURE_MONK;
        // setup moving speed
        m_fWalkSpeed = FRnd() + 1.5f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 9.0f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 10.0f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 300.0f;
        m_fCloseDistance = 5.0f;
        m_fStopDistance = 5.0f;
        m_fAttackFireTime = 4.0f;
        m_fCloseFireTime = 1.0f;
        m_fIgnoreRange = 200.0f;
        //m_fBlowUpAmount = 65.0f;
        m_fBlowUpAmount = 130.0f;
        m_fBodyParts = 3;
	    m_fBlowUpSize = 4.0f;
        m_fDamageWounded = 40.0f;
        m_iScore = 1000;
        SetHealth(70.0f);
        m_fMaxHealth = 70.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_MONK, STRETCH_MONK, STRETCH_MONK));
        break;
  
      case MM_CARDINAL:
        // set your texture
        SetModelMainTexture(TEXTURE_CARDINAL);
		m_fgibTexture = TEXTURE_CARDINAL;
        // setup moving speed
        m_fWalkSpeed = FRnd() + 1.5f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 11.0f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 12.0f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 300.0f;
        m_fCloseDistance = 5.0f;
        m_fStopDistance = 5.0f;
        m_fAttackFireTime = 3.0f;
        m_fCloseFireTime = 2.0f;
        //m_fBlowUpAmount = 180.0f;
        m_fIgnoreRange = 200.0f;
        // damage/explode properties
        m_fBlowUpAmount = 400.0f;
        m_fBodyParts = 4;
	    m_fBlowUpSize = 5.0f;
        m_fDamageWounded = 80.0f;
        m_iScore = 3000;
        SetHealth(180.0f);
        m_fMaxHealth = 180.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_CARDINAL, STRETCH_CARDINAL, STRETCH_CARDINAL));
        break;
    }

    ModelChangeNotify();
    StandingAnim();
    autowait(_pTimer->TickQuantum);

    if (!DoSafetyChecks()) {
        Destroy();
        return;
    }

    // count teleport markers
    m_iTeleportMarkers = 3;
    m_penTeleportMarker;
    {
      m_iTeleportMarkers ++;
    }

    m_soTeleport.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};

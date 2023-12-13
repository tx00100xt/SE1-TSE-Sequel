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

307
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Enemies/WereBull/WereBull.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyRunInto";

enum BullEnv {
  0 BUE_SUMMER   "Summer",
  1 BUE_WINTER   "Winter",
};

enum BullChar {
  0 BUE_FE   "First Encounter",
  1 BUE_NE   "Next Encounter",
};

%{
// info structure
static EntityInfo eiWerebull = {
  EIBT_FLESH, 500.0f,
  0.0f, 3.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};

#define HIT_DISTANCE 5.0f
%}


class CWerebull : CEnemyRunInto {
name      "Werebull";
thumbnail "Thumbnails\\Werebull.tbn";

properties:
  1 BOOL m_bRunAttack = FALSE,        // run attack (attack local)
  2 BOOL m_bHornHit = FALSE,          // close attack local
  3 CEntityPointer m_penLastTouched,  // last touched
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,
  6 enum BullEnv m_beChar "Environment" 'E' = BUE_SUMMER,      // character
  8 enum BullChar m_beFene "Character" 'C' = BUE_FE,      // character
  7 INDEX   m_fgibTexture = TEXTURE_WEREBULL_SUMMER,
  
components:
  0 class   CLASS_BASE        "Classes\\EnemyRunInto.ecl",
  1 model   MODEL_WEREBULL    "Models\\Enemies\\Werebull\\Werebull.mdl",
  2 texture TEXTURE_WEREBULL_SUMMER  "Models\\Enemies\\Werebull\\Werebull.tex",
  3 texture TEXTURE_WEREBULL_WINTER  "AREP\\Models\\WerebulWinter\\WerebullWinter.tex",
  4 model   MODEL_WEREBULLNE    "ModelsF\\NextEncounter\\Enemies\\Werebull\\Werebull.mdl",
  5 texture TEXTURE_WEREBULLNE_SUMMER  "ModelsF\\NextEncounter\\Enemies\\Werebull\\Werebull.tex",
  6 texture TEXTURE_WEREBULLNE_WINTER  "ModelsF\\NextEncounter\\Enemies\\Werebull\\WerebullWinter.tex",
  7 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "Models\\Enemies\\Werebull\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "Models\\Enemies\\Werebull\\Sounds\\Sight.wav",
 53 sound   SOUND_KICKHORN  "Models\\Enemies\\Werebull\\Sounds\\KickHorn.wav",
 54 sound   SOUND_IMPACT    "Models\\Enemies\\Werebull\\Sounds\\Impact.wav",
 55 sound   SOUND_DEATH     "Models\\Enemies\\Werebull\\Sounds\\Death.wav",
 56 sound   SOUND_RUN       "Models\\Enemies\\Werebull\\Sounds\\Run.wav",

 70 sound   SOUNDNE_IDLE      "ModelsF\\NextEncounter\\Enemies\\Werebull\\Sounds\\Idle.wav",
 71 sound   SOUNDNE_SIGHT     "ModelsF\\NextEncounter\\Enemies\\Werebull\\Sounds\\Sight.wav",
 73 sound   SOUNDNE_KICKHORN  "ModelsF\\NextEncounter\\Enemies\\Werebull\\Sounds\\KickHorn.wav",
 74 sound   SOUNDNE_IMPACT    "ModelsF\\NextEncounter\\Enemies\\Werebull\\Sounds\\Impact.wav",
 75 sound   SOUNDNE_DEATH     "ModelsF\\NextEncounter\\Enemies\\Werebull\\Sounds\\Death.wav",
 76 sound   SOUNDNE_RUN       "Models\\Enemies\\Werebull\\Sounds\\Run.wav",

 80 texture TEXTURE_WEREBULL_S_FLESH		 "ModelsF\\Enemies\\Werebull\\Debris\\WerebullFlesh.tex",
 81 texture TEXTURE_WEREBULL_W_FLESH		 "ModelsF\\Enemies\\Werebull\\Debris\\WerebullWFlesh.tex",

 60 model   MODEL_WEREBULL_HEAD			 "ModelsF\\Enemies\\Werebull\\Debris\\hed.mdl",
 61 model   MODEL_WEREBULL_BODY	     	 "ModelsF\\Enemies\\Werebull\\Debris\\bod.mdl",
 62 model   MODEL_WEREBULL_BODY2	     "ModelsF\\Enemies\\Werebull\\Debris\\bod2.mdl",
 63 model   MODEL_WEREBULL_LEGS		 "ModelsF\\Enemies\\Werebull\\Debris\\legs.mdl",

 90 model   MODEL_WEREBULLNE_HEAD			 "ModelsF\\NextEncounter\\Enemies\\Werebull\\Debris\\Head.mdl",
 91 model   MODEL_WEREBULLNE_BODY	     	 "ModelsF\\NextEncounter\\Enemies\\Werebull\\Debris\\Body1.mdl",
 92 model   MODEL_WEREBULLNE_BODY2	     "ModelsF\\NextEncounter\\Enemies\\Werebull\\Debris\\Body2.mdl",
 93 model   MODEL_WEREBULLNE_LEGS		 "ModelsF\\NextEncounter\\Enemies\\Werebull\\Debris\\Legs.mdl",

 94 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 95 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANSV("Sirian werebull sent %s flying"), (const char *) strPlayerName);
    return str;
  }

  void Precache(void) {
    CEnemyBase::Precache();

    PrecacheSound(SOUND_KICKHORN);
    PrecacheSound(SOUND_IMPACT  );

    if (m_beFene==BUE_FE)
    {
    PrecacheSound(SOUND_IDLE    );
    PrecacheSound(SOUND_SIGHT   );
    PrecacheSound(SOUND_DEATH   );
    PrecacheSound(SOUND_RUN     );
	PrecacheTexture(TEXTURE_WEREBULL_S_FLESH);
	PrecacheTexture(TEXTURE_WEREBULL_W_FLESH);
	PrecacheModel(MODEL_WEREBULL_HEAD);
	PrecacheModel(MODEL_WEREBULL_BODY);
	PrecacheModel(MODEL_WEREBULL_BODY2);
	PrecacheModel(MODEL_WEREBULL_LEGS);
	}

    if (m_beFene==BUE_NE)
    {
    PrecacheSound(SOUNDNE_IDLE    );
    PrecacheSound(SOUNDNE_SIGHT   );
    PrecacheSound(SOUNDNE_KICKHORN);
    PrecacheSound(SOUNDNE_IMPACT  );
    PrecacheSound(SOUNDNE_DEATH   );
    PrecacheSound(SOUNDNE_RUN     );
	PrecacheModel(MODEL_WEREBULLNE_HEAD);
	PrecacheModel(MODEL_WEREBULLNE_BODY);
	PrecacheModel(MODEL_WEREBULLNE_BODY2);
	PrecacheModel(MODEL_WEREBULLNE_LEGS);
	}

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiWerebull;
  };

  FLOAT GetCrushHealth(void)
  {
    return 60.0f;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmFe, "Data\\Messages\\Enemies\\Bull.txt");
    static DECLARE_CTFILENAME(fnmNe, "DataF\\Messages\\Enemies\\Bull.txt");
    switch(m_beFene) {
    default: ASSERT(FALSE);
    case BUE_FE: return fnmFe;
    case BUE_NE: return fnmNe;
	}
  };

  // render particles
  void RenderParticles(void)
  {
    Particles_RunningDust(this);
    CEnemyBase::RenderParticles();
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    
    // take MORE damage from heavy bullets (e.g. sniper)
    if(dmtType==DMT_BULLET && fDamageAmmount>100.0f)
    {
      fDamageAmmount*=1.5f;
    }

    // werebull can't harm werebull
    if (!IsOfClass(penInflictor, "Werebull")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
    // if caught in range of a nuke ball
    if (dmtType==DMT_CANNONBALL_EXPLOSION && GetHealth()<=0) {
      // must blow up easier
      m_fBlowUpAmount = m_fBlowUpAmount*0.75f;
    }
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (en_vCurrentTranslationAbsolute.Length()>5.0f) {
      iAnim = WEREBULL_ANIM_DEATHRUN;
    } else {
      iAnim = WEREBULL_ANIM_DEATH;
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==WEREBULL_ANIM_DEATHRUN)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.6f;
    }
    else if(GetModelObject()->GetAnim()==WEREBULL_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.7f;
    }
    return -1.0f;
  };

  void DeathNotify() {
    ChangeCollisionBoxIndexWhenPossible(WEREBULL_COLLISION_BOX_DEATH);
    SetCollisionFlags(ECF_MODEL);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(WEREBULL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void WalkingAnim(void) {
    StartModelAnim(WEREBULL_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void RunningAnim(void) {
    StartModelAnim(WEREBULL_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(WEREBULL_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    //DeactivateRunningSound();
    ActivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    if (m_beFene==BUE_FE) {
      PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
	} else {
      PlaySound(m_soSound, SOUNDNE_IDLE, SOF_3D);
	}
  };
  void SightSound(void) {
    if (m_beFene==BUE_FE) {
      PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
	} else {
      PlaySound(m_soSound, SOUNDNE_SIGHT, SOF_3D);
	}
  };
  void WoundSound(void) {
  };
  void DeathSound(void) {
    if (m_beFene==BUE_FE) {
      PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
	} else {
      PlaySound(m_soSound, SOUNDNE_DEATH, SOF_3D);
	}
  };


  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soFeet, SOUND_RUN, SOF_3D|SOF_LOOP);
      m_bRunSoundPlaying = TRUE;
    }
  }
  void DeactivateRunningSound(void)
  {
    m_soFeet.Stop();
    m_bRunSoundPlaying = FALSE;
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

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 2.0f);

   if (m_beFene == BUE_FE) {

    Debris_Spawn(this, this, MODEL_WEREBULL_HEAD, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WEREBULL_BODY, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WEREBULL_BODY2, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WEREBULL_LEGS, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

	  }
   if (m_beFene == BUE_NE) {

    Debris_Spawn(this, this, MODEL_WEREBULLNE_HEAD, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WEREBULLNE_BODY, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WEREBULLNE_BODY2, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_WEREBULLNE_LEGS, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

	  }
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.75f,
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


/************************************************************
 *                      ATTACK FUNCTIONS                    *
 ************************************************************/
  // touched another live entity
  void LiveEntityTouched(ETouch etouch) {
    if (m_penLastTouched!=etouch.penOther || _pTimer->CurrentTick()>=m_fLastTouchedTime+0.25f) {
      // hit angle
      FLOAT3D vDirection = en_vCurrentTranslationAbsolute;
      vDirection.Normalize();
      ANGLE aHitAngle = FLOAT3D(etouch.plCollision)%vDirection;
      // only hit target in front of you
      if (aHitAngle < 0.0f) {
        // increase mass - only if not another bull
        if (!IsOfSameClass(this, etouch.penOther)) {
          IncreaseKickedMass(etouch.penOther);
        }
        PlaySound(m_soSound, SOUND_IMPACT, SOF_3D);
        // store last touched
        m_penLastTouched = etouch.penOther;
        m_fLastTouchedTime = _pTimer->CurrentTick();
        // damage
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(etouch.penOther, this, DMT_CLOSERANGE, -aHitAngle*40.0f,
          FLOAT3D(0, 0, 0), vDirection);
        // kick touched entity
        FLOAT3D vSpeed = -FLOAT3D(etouch.plCollision);
        vSpeed = vSpeed*10.0f;
        const FLOATmatrix3D &m = GetRotationMatrix();
        FLOAT3D vSpeedRel = vSpeed*!m;
        if (vSpeedRel(1)<-0.1f) {
          vSpeedRel(1)-=15.0f;
        } else {
          vSpeedRel(1)+=15.0f;
        }
        vSpeedRel(2)=15.0f;

        vSpeed = vSpeedRel*m;
        KickEntity(etouch.penOther, vSpeed);
      }
    }
  };

  // touched entity with higher mass
  BOOL HigherMass(void) {
    return (m_fMassKicked > 500.0f);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soFeet.Set3DParameters(500.0f, 50.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    if (CalcDist(m_penEnemy) < HIT_DISTANCE) {
      // attack with horns
      StartModelAnim(WEREBULL_ANIM_ATTACKHORNS, 0);
      DeactivateRunningSound();
      m_bHornHit = FALSE;
      autowait(0.4f);
      PlaySound(m_soSound, SOUND_KICKHORN, SOF_3D);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHornHit = TRUE; }
      autowait(0.1f);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHornHit = TRUE; }
      autowait(0.1f);
      if (CalcDist(m_penEnemy) < HIT_DISTANCE) { m_bHornHit = TRUE; }
      if (m_bHornHit) {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
        FLOAT3D vSpeed;
        GetPitchDirection(AngleDeg(90.0f), vSpeed);
        vSpeed = vSpeed * 10.0f;
        KickEntity(m_penEnemy, vSpeed);
      }
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.5f;
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
    en_tmMaxHoldBreath = 25.0f;
    SetHealth(250.0f);
    m_fMaxHealth = 250.0f;
    en_fDensity = 2000.0f;

    if (m_beFene==BUE_FE) {

    // set your appearance
    SetModel(MODEL_WEREBULL);
    if (m_beChar==BUE_SUMMER) {
      SetModelMainTexture(TEXTURE_WEREBULL_SUMMER);
		m_fgibTexture = TEXTURE_WEREBULL_S_FLESH;
    } else {
      SetModelMainTexture(TEXTURE_WEREBULL_WINTER);
		m_fgibTexture = TEXTURE_WEREBULL_W_FLESH;
    }
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 45.0f);
    m_fAttackRunSpeed = FRnd()*5.0f + 22.5f;
    m_fAttackRotateRunInto = AngleDeg(FRnd()*60 + 100.0f);
    m_aAttackRotateSpeed = m_fAttackRotateRunInto;
    m_fCloseRunSpeed = FRnd()*5.0f + 15.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 7.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 0.05f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 250.0f;
    // damage/explode properties
    m_fBlowUpAmount = 700.0f;
	m_fBlowUpSize = 2.0f;
    m_fBodyParts = 5;
    m_fDamageWounded = 100000.0f;
    m_iScore = 2000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }
	}

    else if (m_beFene==BUE_NE) {

    // set your appearance
    SetModel(MODEL_WEREBULLNE);
    if (m_beChar==BUE_SUMMER) {
      SetModelMainTexture(TEXTURE_WEREBULLNE_SUMMER);
		m_fgibTexture = TEXTURE_WEREBULLNE_SUMMER;
    } else {
      SetModelMainTexture(TEXTURE_WEREBULLNE_WINTER);
		m_fgibTexture = TEXTURE_WEREBULLNE_WINTER;
    }
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 5.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*25.0f + 45.0f);
    m_fAttackRunSpeed = FRnd()*5.0f + 25.0f;
    m_fAttackRotateRunInto = AngleDeg(FRnd()*60 + 110.0f);
    m_aAttackRotateSpeed = m_fAttackRotateRunInto;
    m_fCloseRunSpeed = FRnd()*5.0f + 17.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 7.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 0.05f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 250.0f;
    // damage/explode properties
    m_fBlowUpAmount = 600.0f;
	m_fBlowUpSize = 2.0f;
    m_fBodyParts = 7;
    m_fDamageWounded = 100000.0f;
    m_iScore = 2000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }
	}

    Particles_RunningDust_Prepare(this);

    // continue behavior in base class
    jump CEnemyRunInto::MainLoop();
  };
};

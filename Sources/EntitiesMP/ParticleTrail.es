223
%{
#include "EntitiesMP/StdH/StdH.h"
%}

enum ParticleTrailType {
  1 TRAIL_ROMBOID           "Romboid trail",
  2 TRAIL_BOMB              "Bomb trail",
  3 TRAIL_FIRECRACKER       "Firecracker trail",
  4 TRAIL_COLOREDSTARS      "Colored stars",
  5 TRAIL_FIREBALL          "Fireball trail",
  6 TRAIL_GRENADE           "Grenade trail",
  7 TRAIL_CANNON            "Cannon trail",
  8 TRAIL_ROCKET            "Rocket trail",
  9 TRAIL_BLOOD             "Blood trail",
 10 TRAIL_LAVA              "Lava trail",
 12 TRAIL_LAVABOMB          "Lava bomb trail",
 16 TRAIL_BEAST             "Beast projectile trail",
 17 TRAIL_BEASTBIG          "Beast big projectile trail",
 18 TRAIL_BEASTDEBRIS       "Beast debris trail",
 20 TRAIL_AFTERBURNER       "Afterburner trail",
 21 TRAIL_METEOR            "Meteor trail",
 22 TRAIL_SPIRAL            "Spiral trail",
 23 TRAIL_SHOOTERFLAME      "Shooter flame",
 24 TRAIL_RUNNINGDUST       "Running dust",
};

class CParticleTrail: CMovableModelEntity {
name      "ParticleTrail";
thumbnail "Thumbnails\\ParticleTrail.tbn";
features "CanBePredictable";


properties:

  1 enum ParticleTrailType m_ptType "Type"    'Y' = TRAIL_BEAST,
  4 FLOAT m_fStretchAll       "StretchAll" 'S' = 1.0f,
  5 FLOAT m_fStretchX         "StretchX"   'X' = 1.0f,
  6 FLOAT m_fStretchY         "StretchY"   'Y' = 1.0f,
  7 FLOAT m_fStretchZ         "StretchZ"   'Z' = 1.0f,
  8 CTString m_strName        "Name" 'N' ="Particle trail",
 13 BOOL m_bBackground        "Background" 'B' = FALSE,   // set if model is rendered in background
 21 BOOL m_bTargetable        "Targetable" = TRUE, // st if model should be targetable
 30 FLOAT m_fSize             "Size"  = 1.0f,
 34 BOOL m_bActive            "Active" 'A' = TRUE, // is particles are active
 35 FLOAT m_fActivateTime = 0.0f,
 36 FLOAT m_fDeactivateTime = -10000.0f,
 37 FLOAT m_fMipFactorDisappear "Disappear mip factor" = 8.0f,

 40 FLOAT m_fStartTime = 0.0f,               // start time when launched
 41 FLOAT fSpeedRatio         "Speed ratio" = 1.0f,
 42 FLOAT fZOffset            "ZOffset" = 0.0f,
 43 FLOAT fYOffset            "YOffset" = 0.0f,
 44 FLOAT ctParticles         "Particles count" = 32.0f,
 45 FLOAT fHeight              "Height" = 0.0f,


components:

 1 model   MODEL_MARKER     "Models\\Editor\\Axis.mdl",
 2 texture TEXTURE_MARKER   "Models\\Editor\\Vector.tex"


functions:

  // render particles
  void RenderParticles(void)
  {
    if( !m_bActive)
    {
      return;
    }
    switch (m_ptType)
    {
      case TRAIL_ROMBOID     :
       Particles_RomboidTrail(this);
        break;
      case TRAIL_BOMB    :
       Particles_BombTrail(this);
        break;
      case TRAIL_FIRECRACKER   :
       Particles_FirecrackerTrail(this);
        break;
      case TRAIL_COLOREDSTARS     :
       Particles_ColoredStarsTrail(this);
        break;
      case TRAIL_FIREBALL     :
       Particles_Fireball01Trail(this);
        break;
      case TRAIL_GRENADE   :
       Particles_GrenadeTrail(this);
        break;
      case TRAIL_CANNON      :
       Particles_CannonBall(this, fSpeedRatio);
        break;
      case TRAIL_BLOOD      :
       Particles_BloodTrail(this);
        break;
      case TRAIL_ROCKET:
       Particles_RocketTrail(this, m_fSize);
        break;
      case TRAIL_LAVA   :
       Particles_LavaTrail(this);
        break;
      case TRAIL_LAVABOMB  :
       Particles_LavaBombTrail(this, m_fSize);
        break;
      case TRAIL_BEAST   :
       Particles_BeastProjectileTrail( this, m_fSize, fHeight, ctParticles);
        break;
      case TRAIL_BEASTBIG:
       Particles_BeastBigProjectileTrail( this, m_fSize, fZOffset, fYOffset, ctParticles);
        break;
      case TRAIL_BEASTDEBRIS:
       Particles_BeastProjectileDebrisTrail(this, m_fSize);
        break;
      case TRAIL_AFTERBURNER:
       Particles_AfterBurner( this, m_fStartTime, m_fSize);
        break;
      case TRAIL_METEOR:
       Particles_MeteorTrail(this, m_fSize, m_fSize, fSpeedRatio);
        break;
      case TRAIL_SPIRAL:
       Particles_SpiralTrail(this);
        break;
      case TRAIL_SHOOTERFLAME:
       FLOAT fTimeElapsed, fParticlesTimeElapsed;
       Particles_ShooterFlame(GetLerpedPlacement(), this->GetLerpedPlacement(),
                              fTimeElapsed, fParticlesTimeElapsed);
        break;
      case TRAIL_RUNNINGDUST     :
       Particles_RunningDust(this);
        break;
    }
  }
  BOOL IsTargetable(void) const
  {
    return m_bTargetable;
  }

  // apply mirror and stretch to the entity
  void MirrorAndStretch(FLOAT fStretch, BOOL bMirrorX)
  {
    m_fStretchAll*=fStretch;
    if (bMirrorX) {
      m_fStretchX = -m_fStretchX;
    }
  }

  // Stretch model
  void StretchModel(void) {
    // stretch factors must not have extreme values
    if (Abs(m_fStretchX)  < 0.01f) { m_fStretchX   = 0.01f;  }
    if (Abs(m_fStretchY)  < 0.01f) { m_fStretchY   = 0.01f;  }
    if (Abs(m_fStretchZ)  < 0.01f) { m_fStretchZ   = 0.01f;  }
    if (m_fStretchAll< 0.01f) { m_fStretchAll = 0.01f;  }

    if (Abs(m_fStretchX)  >100.0f) { m_fStretchX   = 100.0f*Sgn(m_fStretchX); }
    if (Abs(m_fStretchY)  >100.0f) { m_fStretchY   = 100.0f*Sgn(m_fStretchY); }
    if (Abs(m_fStretchZ)  >100.0f) { m_fStretchZ   = 100.0f*Sgn(m_fStretchZ); }
    if (m_fStretchAll>100.0f) { m_fStretchAll = 100.0f; }

    GetModelObject()->StretchModel( FLOAT3D(
      m_fStretchAll*m_fStretchX,
      m_fStretchAll*m_fStretchY,
      m_fStretchAll*m_fStretchZ) );
    ModelChangeNotify();
  };


procedures:

  Main()
  {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);


    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    if (m_bBackground) {
      SetFlags(GetFlags()|ENF_BACKGROUND);
    } else {
      SetFlags(GetFlags()&~ENF_BACKGROUND);
    }

    m_fActivateTime = 0.0f;
    m_fDeactivateTime = -10000.0f;



    return;
  }
};

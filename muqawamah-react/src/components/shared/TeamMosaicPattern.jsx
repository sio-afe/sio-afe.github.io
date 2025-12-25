import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

/**
 * TeamMosaicPattern - Creates abstract patterns with texture and spotlights using p5.js
 * Each team gets a unique pattern based on their ID hash and assigned color
 */
const TeamMosaicPattern = ({ teamId, colorRgb, className = '' }) => {
  const containerRef = useRef(null);
  const p5Instance = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Parse RGB string to array
  const parseColor = (rgbString) => {
    return rgbString.split(',').map(c => parseInt(c.trim()));
  };

  // Generate a seeded random number based on team ID
  const seededRandom = (seed, index) => {
    const x = Math.sin(seed + index * 1000) * 10000;
    return x - Math.floor(x);
  };

  // Get hash from team ID for consistent patterns
  const getTeamHash = (id) => {
    if (!id) return 12345;
    return id.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  };

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              setDimensions({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
            }
          }
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (p5Instance.current) {
      p5Instance.current.remove();
      p5Instance.current = null;
    }

    const { width, height } = dimensions;
    const teamHash = getTeamHash(teamId);
    const [r, g, b] = parseColor(colorRgb);

    // 6 abstract pattern types
    const patternType = teamHash % 6;

    const sketch = (p) => {
      p.setup = () => {
        const canvas = p.createCanvas(width, height);
        canvas.parent(containerRef.current);
        p.noLoop();
        p.pixelDensity(1);
      };

      p.draw = () => {
        // Dark gradient base
        drawGradientBase(p, r, g, b, teamHash);

        // Select abstract pattern based on team
        switch (patternType) {
          case 0:
            drawDiagonalStripes(p, r, g, b, teamHash);
            break;
          case 1:
            drawFloatingShapes(p, r, g, b, teamHash);
            break;
          case 2:
            drawWavePattern(p, r, g, b, teamHash);
            break;
          case 3:
            drawGridMesh(p, r, g, b, teamHash);
            break;
          case 4:
            drawOrganicBlobs(p, r, g, b, teamHash);
            break;
          case 5:
            drawGeometricLayers(p, r, g, b, teamHash);
            break;
          default:
            drawDiagonalStripes(p, r, g, b, teamHash);
        }

        // Add noise texture
        drawNoiseTexture(p, teamHash);

        // Add spotlight effects
        drawSpotlights(p, r, g, b, teamHash);

        // Bottom gradient fade for text readability
        drawBottomFade(p);
      };

      // ============ BASE GRADIENT ============
      const drawGradientBase = (p, r, g, b, seed) => {
        const angle = seededRandom(seed, 1) * p.PI;
        const gradient = p.drawingContext.createLinearGradient(
          width / 2 + p.cos(angle) * width,
          height / 2 + p.sin(angle) * height,
          width / 2 - p.cos(angle) * width,
          height / 2 - p.sin(angle) * height
        );
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.25)`);
        gradient.addColorStop(0.5, `rgba(10, 14, 39, 0.95)`);
        gradient.addColorStop(1, `rgba(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)}, 0.4)`);
        
        p.drawingContext.fillStyle = gradient;
        p.drawingContext.fillRect(0, 0, width, height);
      };

      // ============ ABSTRACT PATTERNS ============

      // Pattern 1: Diagonal Stripes
      const drawDiagonalStripes = (p, r, g, b, seed) => {
        const stripeWidth = 20 + seededRandom(seed, 10) * 40;
        const angle = -0.5 + seededRandom(seed, 11) * 0.4;
        const numStripes = Math.ceil((width + height) / stripeWidth) + 5;

        p.push();
        p.translate(width / 2, height / 2);
        p.rotate(angle);
        p.translate(-width, -height);

        for (let i = 0; i < numStripes; i++) {
          const x = i * stripeWidth * 2;
          const opacity = 20 + seededRandom(seed, i + 20) * 60;
          
          p.noStroke();
          p.fill(r, g, b, opacity);
          p.rect(x, -height, stripeWidth, height * 3);
        }
        p.pop();
      };

      // Pattern 2: Floating Shapes
      const drawFloatingShapes = (p, r, g, b, seed) => {
        const numShapes = 8 + Math.floor(seededRandom(seed, 0) * 8);

        for (let i = 0; i < numShapes; i++) {
          const x = seededRandom(seed, i * 3) * width;
          const y = seededRandom(seed, i * 3 + 1) * height;
          const size = 40 + seededRandom(seed, i * 3 + 2) * 120;
          const opacity = 15 + seededRandom(seed, i + 50) * 40;
          const shapeType = Math.floor(seededRandom(seed, i + 100) * 3);

          p.noStroke();
          p.fill(r, g, b, opacity);

          switch (shapeType) {
            case 0: // Circle
              p.ellipse(x, y, size, size);
              break;
            case 1: // Rounded rect
              p.rect(x - size / 2, y - size / 2, size, size, size * 0.2);
              break;
            case 2: // Diamond
              p.push();
              p.translate(x, y);
              p.rotate(p.PI / 4);
              p.rect(-size / 2, -size / 2, size * 0.7, size * 0.7);
              p.pop();
              break;
          }
        }
      };

      // Pattern 3: Wave Pattern
      const drawWavePattern = (p, r, g, b, seed) => {
        const numWaves = 4 + Math.floor(seededRandom(seed, 0) * 4);
        const waveHeight = 30 + seededRandom(seed, 1) * 50;

        for (let w = 0; w < numWaves; w++) {
          const yOffset = (height / (numWaves + 1)) * (w + 1);
          const opacity = 20 + seededRandom(seed, w + 10) * 50;
          const frequency = 0.01 + seededRandom(seed, w + 20) * 0.02;
          const phase = seededRandom(seed, w + 30) * p.TWO_PI;

          p.noFill();
          p.stroke(r, g, b, opacity);
          p.strokeWeight(2 + seededRandom(seed, w + 40) * 4);

          p.beginShape();
          for (let x = -10; x <= width + 10; x += 5) {
            const y = yOffset + p.sin(x * frequency + phase) * waveHeight;
            p.vertex(x, y);
          }
          p.endShape();
        }
      };

      // Pattern 4: Grid Mesh
      const drawGridMesh = (p, r, g, b, seed) => {
        const gridSize = 30 + seededRandom(seed, 0) * 30;
        const cols = Math.ceil(width / gridSize) + 1;
        const rows = Math.ceil(height / gridSize) + 1;

        // Draw grid lines
        p.stroke(r, g, b, 25);
        p.strokeWeight(1);

        for (let i = 0; i <= cols; i++) {
          const x = i * gridSize;
          const wobble = (seededRandom(seed, i) - 0.5) * 10;
          p.line(x + wobble, 0, x - wobble, height);
        }

        for (let j = 0; j <= rows; j++) {
          const y = j * gridSize;
          const wobble = (seededRandom(seed, j + 100) - 0.5) * 10;
          p.line(0, y + wobble, width, y - wobble);
        }

        // Add some intersection highlights
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            if (seededRandom(seed, i * rows + j) > 0.7) {
              const x = i * gridSize;
              const y = j * gridSize;
              const opacity = 30 + seededRandom(seed, i * rows + j + 200) * 50;
              p.noStroke();
              p.fill(r, g, b, opacity);
              p.ellipse(x, y, 8, 8);
            }
          }
        }
      };

      // Pattern 5: Organic Blobs
      const drawOrganicBlobs = (p, r, g, b, seed) => {
        const numBlobs = 5 + Math.floor(seededRandom(seed, 0) * 5);

        for (let i = 0; i < numBlobs; i++) {
          const cx = seededRandom(seed, i * 5) * width;
          const cy = seededRandom(seed, i * 5 + 1) * height;
          const baseSize = 60 + seededRandom(seed, i * 5 + 2) * 100;
          const opacity = 15 + seededRandom(seed, i + 50) * 35;
          const points = 6 + Math.floor(seededRandom(seed, i * 5 + 3) * 6);

          p.noStroke();
          p.fill(r, g, b, opacity);

          p.beginShape();
          for (let j = 0; j <= points; j++) {
            const angle = (p.TWO_PI / points) * j;
            const radiusVariation = 0.6 + seededRandom(seed, i * 100 + j) * 0.8;
            const radius = baseSize * radiusVariation;
            
            const x = cx + p.cos(angle) * radius;
            const y = cy + p.sin(angle) * radius;
            // NOTE: Some bundled p5 builds (or tree-shaken builds) may not include curveVertex.
            // Use a safe fallback so the Teams page never crashes.
            if (typeof p.curveVertex === 'function') {
            p.curveVertex(x, y);
            } else {
              p.vertex(x, y);
            }
          }
          p.endShape(p.CLOSE);
        }
      };

      // Pattern 6: Geometric Layers
      const drawGeometricLayers = (p, r, g, b, seed) => {
        const numLayers = 4 + Math.floor(seededRandom(seed, 0) * 4);

        for (let i = 0; i < numLayers; i++) {
          const layerY = (height / numLayers) * i;
          const layerHeight = height / numLayers + seededRandom(seed, i + 10) * 50;
          const opacity = 15 + seededRandom(seed, i + 20) * 40;
          const skew = (seededRandom(seed, i + 30) - 0.5) * 100;

          p.noStroke();
          p.fill(r, g, b, opacity);

          p.beginShape();
          p.vertex(-10, layerY);
          p.vertex(width + 10, layerY + skew);
          p.vertex(width + 10, layerY + layerHeight + skew);
          p.vertex(-10, layerY + layerHeight);
          p.endShape(p.CLOSE);
        }
      };

      // ============ NOISE TEXTURE ============
      const drawNoiseTexture = (p, seed) => {
        const density = 0.15 + seededRandom(seed, 300) * 0.15;
        const numDots = Math.floor(width * height * density / 100);

        p.noStroke();
        for (let i = 0; i < numDots; i++) {
          const x = seededRandom(seed, i * 2 + 1000) * width;
          const y = seededRandom(seed, i * 2 + 1001) * height;
          const size = 1 + seededRandom(seed, i + 2000) * 2;
          const alpha = 10 + seededRandom(seed, i + 3000) * 30;
          
          p.fill(255, 255, 255, alpha);
          p.ellipse(x, y, size, size);
        }
      };

      // ============ SPOTLIGHT EFFECTS ============
      const drawSpotlights = (p, r, g, b, seed) => {
        const numSpotlights = 2 + Math.floor(seededRandom(seed, 500) * 2);
        
        for (let i = 0; i < numSpotlights; i++) {
          // Random position for each spotlight
          const spotX = seededRandom(seed, 600 + i * 10) * width;
          const spotY = seededRandom(seed, 700 + i * 10) * height;
          const spotRadius = 100 + seededRandom(seed, 800 + i * 10) * 150;
          const spotAngle = seededRandom(seed, 900 + i * 10) * p.TWO_PI;
          const spotIntensity = 0.2 + seededRandom(seed, 1000 + i * 10) * 0.3;

          // Create radial gradient spotlight
          const gradient = p.drawingContext.createRadialGradient(
            spotX, spotY, 0,
            spotX, spotY, spotRadius
          );
          
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${spotIntensity})`);
          gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${spotIntensity * 0.4})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          p.drawingContext.fillStyle = gradient;
          p.drawingContext.fillRect(0, 0, width, height);

          // Add a subtle beam effect
          const beamLength = 120 + seededRandom(seed, 1100 + i * 10) * 80;
          const beamWidth = 25 + seededRandom(seed, 1200 + i * 10) * 35;
          
          p.push();
          p.translate(spotX, spotY);
          p.rotate(spotAngle);
          
          const beamGradient = p.drawingContext.createLinearGradient(0, 0, beamLength, 0);
          beamGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${spotIntensity * 0.6})`);
          beamGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          p.drawingContext.fillStyle = beamGradient;
          p.drawingContext.beginPath();
          p.drawingContext.moveTo(0, -beamWidth / 4);
          p.drawingContext.lineTo(beamLength, -beamWidth);
          p.drawingContext.lineTo(beamLength, beamWidth);
          p.drawingContext.lineTo(0, beamWidth / 4);
          p.drawingContext.closePath();
          p.drawingContext.fill();
          
          p.pop();
        }
      };

      // ============ BOTTOM FADE FOR TEXT ============
      const drawBottomFade = (p) => {
        const gradient = p.drawingContext.createLinearGradient(0, height * 0.5, 0, height);
        gradient.addColorStop(0, 'rgba(10, 14, 39, 0)');
        gradient.addColorStop(0.7, 'rgba(10, 14, 39, 0.6)');
        gradient.addColorStop(1, 'rgba(10, 14, 39, 0.9)');
        
        p.drawingContext.fillStyle = gradient;
        p.drawingContext.fillRect(0, 0, width, height);
      };
    };

    p5Instance.current = new p5(sketch);

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, [teamId, colorRgb, dimensions, isVisible]);

  return (
    <div 
      ref={containerRef} 
      className={`team-mosaic-pattern ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 'inherit',
        zIndex: 0,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}
    />
  );
};

export default TeamMosaicPattern;


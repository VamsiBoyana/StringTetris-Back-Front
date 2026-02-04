import { useEffect } from 'react';

const ConfettiEffect = () => {
  useEffect(() => {
    const confetti = {
      maxCount: 150,
      speed: 2,
      frameInterval: 15,
      alpha: 1,
      gradient: false,
      start: null,
      stop: null,
      toggle: null,
      pause: null,
      resume: null,
      togglePause: null,
      remove: null,
      isPaused: null,
      isRunning: null
    };

    const initConfetti = () => {
      const t = window.requestAnimationFrame || window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame || window.oRequestAnimationFrame || 
                window.msRequestAnimationFrame || function(callback) {
                  return window.setTimeout(callback, confetti.frameInterval);
                };
      
      const colors = [
        "rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", 
        "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", 
        "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"
      ];
      
      let isRunning = false;
      let isPaused = false;
      let lastTime = Date.now();
      let particles = [];
      let angle = 0;
      let context = null;

      function createParticle(particle, width, height) {
        particle.color = colors[Math.random() * colors.length | 0] + (confetti.alpha + ")");
        particle.color2 = colors[Math.random() * colors.length | 0] + (confetti.alpha + ")");
        particle.x = Math.random() * width;
        particle.y = Math.random() * height - height;
        particle.diameter = 10 * Math.random() + 5;
        particle.tilt = 10 * Math.random() - 10;
        particle.tiltAngleIncrement = .07 * Math.random() + .05;
        particle.tiltAngle = Math.random() * Math.PI;
        return particle;
      }

      function pause() { isPaused = true; }
      function resume() { isPaused = false; draw(); }

      function draw() {
        if (!isPaused) {
          if (particles.length === 0) {
            if (context) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
          } else {
            const now = Date.now();
            const delta = now - lastTime;
            
            if (!t || delta > confetti.frameInterval) {
              if (context) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
              
              // Update particles
              angle += .01;
              for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (!isRunning && p.y < -15) {
                  p.y = window.innerHeight + 100;
                } else {
                  p.tiltAngle += p.tiltAngleIncrement;
                  p.x += Math.sin(angle) - .5;
                  p.y += .5 * (Math.cos(angle) + p.diameter + confetti.speed);
                  p.tilt = 15 * Math.sin(p.tiltAngle);
                }
                
                if (p.x > window.innerWidth + 20 || p.x < -20 || p.y > window.innerHeight) {
                  if (isRunning && particles.length <= confetti.maxCount) {
                    createParticle(p, window.innerWidth, window.innerHeight);
                  } else {
                    particles.splice(i, 1);
                    i--;
                  }
                }
              }
              
              // Draw particles
              if (context) {
                for (let i = 0; i < particles.length; i++) {
                  const p = particles[i];
                  context.beginPath();
                  context.lineWidth = p.diameter;
                  const x1 = p.x + p.tilt;
                  const x2 = x1 + p.diameter / 2;
                  const y2 = p.y + p.tilt + p.diameter / 2;
                  
                  if (confetti.gradient) {
                    const gradient = context.createLinearGradient(x2, p.y, x1, y2);
                    gradient.addColorStop("0", p.color);
                    gradient.addColorStop("1.0", p.color2);
                    context.strokeStyle = gradient;
                  } else {
                    context.strokeStyle = p.color;
                  }
                  
                  context.moveTo(x2, p.y);
                  context.lineTo(x1, y2);
                  context.stroke();
                }
              }
              
              lastTime = now - delta % confetti.frameInterval;
            }
            
            requestAnimationFrame(draw);
          }
        }
      }

      function start(duration, minParticles, maxParticles) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame || window.oRequestAnimationFrame || 
          window.msRequestAnimationFrame || function(callback) {
            return window.setTimeout(callback, confetti.frameInterval);
          };
        
        let canvas = document.getElementById("confetti-canvas");
        if (canvas === null) {
          canvas = document.createElement("canvas");
          canvas.setAttribute("id", "confetti-canvas");
          canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
          document.body.prepend(canvas);
          canvas.width = width;
          canvas.height = height;
          
          window.addEventListener("resize", function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          }, true);
          
          context = canvas.getContext("2d");
        } else if (context === null) {
          context = canvas.getContext("2d");
        }
        
        let particleCount = confetti.maxCount;
        if (minParticles) {
          if (maxParticles) {
            if (minParticles === maxParticles) {
              particleCount = particles.length + maxParticles;
            } else {
              if (minParticles > maxParticles) {
                const temp = minParticles;
                minParticles = maxParticles;
                maxParticles = temp;
              }
              particleCount = particles.length + (Math.random() * (maxParticles - minParticles) + minParticles | 0);
            }
          } else {
            particleCount = particles.length + minParticles;
          }
        } else if (maxParticles) {
          particleCount = particles.length + maxParticles;
        }
        
        while (particles.length < particleCount) {
          particles.push(createParticle({}, width, height));
        }
        
        isRunning = true;
        isPaused = false;
        draw();
        
        if (duration) {
          window.setTimeout(stop, duration);
        }
      }

      function stop() {
        isRunning = false;
      }

      confetti.start = start;
      confetti.stop = stop;
      confetti.toggle = function() { isRunning ? stop() : start(); };
      confetti.pause = pause;
      confetti.resume = resume;
      confetti.togglePause = function() { isPaused ? resume() : pause(); };
      confetti.isPaused = function() { return isPaused; };
      confetti.remove = function() { stop(); isPaused = false; particles = []; };
      confetti.isRunning = function() { return isRunning; };

      // Start confetti
      confetti.start();
      
      return () => {
        confetti.stop();
        const canvas = document.getElementById("confetti-canvas");
        if (canvas) {
          document.body.removeChild(canvas);
        }
      };
    };

    const cleanup = initConfetti();
    return cleanup;
  }, []);

  return null;
};

export default ConfettiEffect;
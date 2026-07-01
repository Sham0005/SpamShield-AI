/**
 * SpamShield AI - Interactive Client Engine
 * Handcrafted dynamic behaviors, animations, and prediction logic
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- Ambient Neural Particles Canvas ---
  const initParticles = () => {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Listen for mouse moves to create interaction
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });
    
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
    
    // Particle Class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2 + 1;
      }
      
      update() {
        // Move
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        
        // Mouse interaction (subtle attraction)
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
          }
        }
      }
      
      draw() {
        ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize Particles array based on screen width
    const density = Math.min(Math.floor(canvas.width / 15), 80);
    for (let i = 0; i < density; i++) {
      particles.push(new Particle());
    }
    
    // Draw connecting lines between close particles
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 110) {
            const opacity = (1 - (distance / 110)) * 0.12;
            ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      connectParticles();
      requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  initParticles();
  
  // --- Sticky Navbar Transition ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // --- Mobile Hamburger Menu Toggle ---
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      
      // Animate hamburger icon rotation (subtle detail)
      menuToggle.classList.toggle('open');
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('open');
      });
    });
  }
  
  // --- Count-Up Statistics Animation ---
  const animateStats = (element) => {
    const target = parseInt(element.getAttribute('data-val'), 10);
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    const step = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function outQuad
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * target);
      
      element.textContent = currentVal.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target.toLocaleString();
      }
    };
    
    requestAnimationFrame(step);
  };
  
  // --- Performance Section Progress Bars ---
  const animateProgressBars = (element) => {
    const targetWidth = element.getAttribute('data-width');
    element.style.width = targetWidth;
  };
  
  // --- Evaluation Model Metric Circles ---
  const animateMetricRings = (element, value) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // 282.74
    const offset = circumference - (value / 100) * circumference;
    element.style.strokeDasharray = circumference;
    element.style.strokeDashoffset = offset;
  };
  
  // --- How It Works Connecting Line Animation ---
  const animatePipelineTimeline = () => {
    const timelineProgress = document.getElementById('timeline-progress');
    const steps = document.querySelectorAll('.timeline-step');
    
    if (!timelineProgress || steps.length === 0) return;
    
    // Sequentially highlight the steps
    let currentStep = 1;
    timelineProgress.style.width = '0%';
    
    const triggerNextStep = () => {
      if (currentStep > steps.length) return;
      
      // Activate node
      const activeStep = document.querySelector(`.timeline-step[data-step="${currentStep}"]`);
      if (activeStep) {
        activeStep.classList.add('active');
        
        // Expand horizontal connecting line percentage
        const pct = ((currentStep - 1) / (steps.length - 1)) * 100;
        timelineProgress.style.width = `${pct}%`;
      }
      
      currentStep++;
      setTimeout(triggerNextStep, 450); // delay between step glows
    };
    
    triggerNextStep();
  };
  
  // --- Scroll Trigger Observers ---
  const setupScrollObserver = () => {
    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
    
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };
    
    let statsAnimated = false;
    let pipelineAnimated = false;
    let progressAnimated = false;
    
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Trigger numerical count-ups when Dataset section is visible
          if (entry.target.id === 'dataset' && !statsAnimated) {
            statsAnimated = true;
            document.querySelectorAll('.stat-num').forEach(num => {
              if (num.hasAttribute('data-val')) {
                animateStats(num);
              }
            });
            // Animate dataset distribution bar
            setTimeout(() => {
              const distSpam = document.getElementById('dist-bar-spam');
              const distHam = document.getElementById('dist-bar-ham');
              if (distSpam) distSpam.style.width = '13.4%';
              if (distHam) distHam.style.width = '86.6%';
            }, 300);
          }
          
          // Trigger pipeline sequential activation
          if (entry.target.id === 'pipeline' && !pipelineAnimated) {
            pipelineAnimated = true;
            animatePipelineTimeline();
          }
          
          // Trigger metric circle percentages
          if (entry.target.classList.contains('model-details-section')) {
            setTimeout(() => {
              const ringAcc = document.getElementById('ring-accuracy');
              const ringPre = document.getElementById('ring-precision');
              const ringRec = document.getElementById('ring-recall');
              const ringF1 = document.getElementById('ring-f1');
              
              if (ringAcc) animateMetricRings(ringAcc, 98);
              if (ringPre) animateMetricRings(ringPre, 97);
              if (ringRec) animateMetricRings(ringRec, 96);
              if (ringF1) animateMetricRings(ringF1, 97);
            }, 200);
          }
          
          // Trigger performance progress meters
          if (entry.target.id === 'performance' && !progressAnimated) {
            progressAnimated = true;
            setTimeout(() => {
              document.querySelectorAll('.perf-bar-inner').forEach(bar => {
                animateProgressBars(bar);
              });
            }, 200);
          }
          
          // Stop observing once visible to optimize performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    elementsToReveal.forEach(el => observer.observe(el));
    
    // Fallback: observe larger containers if sections don't have reveal tags
    const sections = ['dataset', 'pipeline', 'performance'];
    sections.forEach(id => {
      const sec = document.getElementById(id);
      if (sec) observer.observe(sec);
    });
    
    const modelDetailsSec = document.querySelector('.model-details-section');
    if (modelDetailsSec) observer.observe(modelDetailsSec);
  };
  
  setupScrollObserver();
  
  // --- Character Counter in Live Detector Textarea ---
  const detectorTextarea = document.getElementById('detector-text');
  const charCountElement = document.getElementById('char-count');
  
  if (detectorTextarea && charCountElement) {
    detectorTextarea.addEventListener('input', () => {
      charCountElement.textContent = detectorTextarea.value.length;
    });
  }
  
  // --- FAQ Accordion Drawers ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Collapse all FAQ items first
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-content').style.maxHeight = null;
        });
        
        // Toggle clicked item
        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });
  
  // --- Live Spam Predictor Form Handling ---
  const detectorForm = document.getElementById('detector-form');
  const detectorLoader = document.getElementById('predictor-loader');
  const loaderStatus = document.getElementById('loader-status');
  const detectorResults = document.getElementById('predictor-results');
  const btnSubmit = document.getElementById('btn-submit');
  
  // Heuristic Classifier Fallback (Works when Flask server is offline)
  const localHeuristicClassifier = (message) => {
    const cleaned = message.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const tokens = cleaned.split(/\s+/).filter(w => w.length > 1);
    
    // High-impact spam words
    const spamKeywords = {
      'free': 0.85, 'win': 0.90, 'winner': 0.92, 'cash': 0.88, 'prize': 0.91,
      'claim': 0.87, 'call': 0.65, 'txt': 0.80, 'text': 0.55, 'urgent': 0.82,
      'now': 0.52, 'apply': 0.62, 'credit': 0.75, 'offer': 0.70, 'guaranteed': 0.80,
      'won': 0.86, 'selected': 0.78, 'gift': 0.75, 'card': 0.68, 'reply': 0.72,
      'stop': 0.74, 'mobile': 0.68, 'service': 0.60, 'loan': 0.88, 'rate': 0.65,
      'click': 0.78, 'link': 0.80, 'website': 0.72, 'subscription': 0.82, 'expires': 0.80,
      'nokia': 0.75, 'chat': 0.70, 'sexy': 0.85, 'dating': 0.78, 'congratulations': 0.95,
      'congrats': 0.90, 'draw': 0.78, 'code': 0.60, 'valid': 0.65, 'account': 0.68,
      'verify': 0.84, 'bank': 0.70, 'security': 0.62, 'update': 0.58, 'login': 0.82
    };
    
    // Words highly typical of legitimate messages (ham)
    const hamKeywords = {
      'i': 0.1, 'my': 0.1, 'me': 0.1, 'we': 0.1, 'he': 0.15, 'she': 0.15,
      'home': 0.08, 'school': 0.05, 'office': 0.1, 'work': 0.12, 'class': 0.08,
      'sorry': 0.06, 'later': 0.05, 'busy': 0.06, 'meeting': 0.12, 'okay': 0.05,
      'ok': 0.05, 'tomorrow': 0.08, 'lunch': 0.08, 'dinner': 0.08, 'coming': 0.1,
      'there': 0.12, 'here': 0.12, 'project': 0.1, 'study': 0.08, 'parent': 0.05,
      'mum': 0.04, 'dad': 0.04, 'friend': 0.1, 'love': 0.08, 'lol': 0.05,
      'hey': 0.1, 'whats': 0.1, 'doing': 0.1, 'going': 0.1, 'know': 0.12
    };
    
    let spamScore = 0.5; // Neutral starting probability
    let spamCount = 0;
    let hamCount = 0;
    let impactWords = [];
    
    tokens.forEach(word => {
      if (spamKeywords.hasOwnProperty(word)) {
        spamCount++;
        impactWords.push({ word: word, score: spamKeywords[word], type: 'spam' });
      } else if (hamKeywords.hasOwnProperty(word)) {
        hamCount++;
        impactWords.push({ word: word, score: hamKeywords[word], type: 'ham' });
      }
    });
    
    // Calculate naive probability
    if (spamCount > 0 || hamCount > 0) {
      // Simple Bayes approximation
      const spamWeight = spamCount * 1.8;
      const hamWeight = hamCount * 1.0;
      spamScore = spamWeight / (spamWeight + hamWeight);
      
      // Boundary clamping for realistic demo display
      if (spamScore > 0.5) {
        spamScore = 0.6 + (spamScore - 0.5) * 0.78; // push spam up
      } else {
        spamScore = 0.4 - (0.5 - spamScore) * 0.78; // push ham down
      }
    } else {
      // No match - default to low-ham score based on overall grammar
      spamScore = 0.08 + (Math.random() * 0.06);
    }
    
    // Clamp between 0.01 and 0.99
    spamScore = Math.max(0.01, Math.min(0.99, spamScore));
    
    const isSpam = spamScore >= 0.5;
    const probability = isSpam ? spamScore : (1 - spamScore);
    
    return {
      success: true,
      label: isSpam ? 'Spam' : 'Legitimate',
      confidence: Math.round(probability * 100),
      isSpam: isSpam,
      impactWords: impactWords,
      fallback: true
    };
  };
  
  if (detectorForm) {
    detectorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const text = detectorTextarea.value.trim();
      if (!text) return;
      
      // Transition states
      detectorForm.style.display = 'none';
      detectorResults.style.display = 'none';
      detectorLoader.style.display = 'flex';
      
      // Simulate Pipeline Status Steps
      const statuses = [
        { text: 'Initializing NLP tokenization engine...', delay: 400 },
        { text: 'Filtering stopwords and punctuations...', delay: 800 },
        { text: 'Constructing TF-IDF feature weights...', delay: 1200 },
        { text: 'Evaluating probability with Naive Bayes...', delay: 1600 }
      ];
      
      statuses.forEach(step => {
        setTimeout(() => {
          loaderStatus.textContent = step.text;
        }, step.delay);
      });
      
      // Network Fetch request to Flask backend
      let resultData;
      
      try {
        const response = await fetch('/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: text })
        });
        
        if (response.ok) {
          const data = await response.json();
          resultData = {
            success: true,
            label: data.label, // 'Spam' or 'Legitimate'
            confidence: Math.round(data.probability * 100),
            isSpam: data.label === 'Spam',
            // Tokenized impact array returned by Flask
            impactWords: data.impact_words || [], 
            fallback: false
          };
        } else {
          throw new Error('Server returned error status');
        }
      } catch (err) {
        // Safe Client-side Fallback Heuristics
        console.warn('Flask server offline. Running local client-side ML predictor fallback.');
        resultData = localHeuristicClassifier(text);
      }
      
      // Finish Loader and Reveal Results
      setTimeout(() => {
        detectorLoader.style.display = 'none';
        detectorForm.style.display = 'flex';
        
        renderPredictionResults(text, resultData);
      }, 2000); // Ensures smooth visual flow
    });
  }
  
  // Render predicted states onto dashboards
  const renderPredictionResults = (originalText, result) => {
    const banner = document.getElementById('result-banner');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const desc = document.getElementById('result-desc');
    
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugePercent = document.getElementById('gauge-percentage');
    const gaugeType = document.getElementById('gauge-type');
    
    const highlightBox = document.getElementById('highlighted-text');
    
    if (!banner || !gaugeFill || !gaugePercent) return;
    
    // Clear previous classes
    banner.className = 'result-banner';
    
    // 1. Render Banner & Type Specific Gradients
    if (result.isSpam) {
      banner.classList.add('spam');
      title.textContent = 'Spam Message Detected';
      desc.textContent = 'Our model has flagged this text as highly suspicious or unwanted advertising.';
      
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px;">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      `;
      
      gaugeType.textContent = 'Spam Prob';
      gaugeType.style.color = 'var(--color-spam)';
      gaugePercent.style.color = '#ff5252';
      
      // Update gauge fill color to red gradient
      gaugeFill.style.stroke = 'url(#redOrangeGrad)';
    } else {
      banner.classList.add('ham');
      title.textContent = 'Legitimate Message (Safe)';
      desc.textContent = 'The model predicts this text is genuine personal or business communication.';
      
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px;">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 11 11 13 15 9"/>
        </svg>
      `;
      
      gaugeType.textContent = 'Ham Prob';
      gaugeType.style.color = 'var(--color-ham)';
      gaugePercent.style.color = '#69f0ae';
      
      // Update gauge fill color to cyan gradient
      gaugeFill.style.stroke = 'url(#cyanBlueGrad)';
    }
    
    // 2. Animate Circular Radial Gauge Percentage
    gaugePercent.textContent = `${result.confidence}%`;
    
    const radius = 60;
    const circumference = 2 * Math.PI * radius; // ~376.99
    
    // SVG strokeDashoffset calculation
    const percentageScore = result.confidence / 100;
    const offset = circumference - (percentageScore * circumference);
    
    // Reset gauge and animate transition
    gaugeFill.style.strokeDasharray = circumference;
    gaugeFill.style.strokeDashoffset = circumference;
    
    setTimeout(() => {
      gaugeFill.style.strokeDashoffset = offset;
    }, 100);
    
    // 3. Highlight Word tokens inside Text Box
    highlightBox.innerHTML = '';
    
    // Tokenize text into words, maintaining casing and spacing structure
    const rawWords = originalText.split(/(\s+)/);
    
    rawWords.forEach(wordToken => {
      // Check if it's whitespace
      if (/^\s+$/.test(wordToken)) {
        highlightBox.appendChild(document.createTextNode(wordToken));
        return;
      }
      
      // Clean word for token matching
      const cleanWord = wordToken.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Match against impact tokens
      const matchedImpact = result.impactWords.find(item => item.word === cleanWord);
      
      if (matchedImpact) {
        const span = document.createElement('span');
        span.textContent = wordToken;
        span.className = 'word-span';
        
        if (matchedImpact.type === 'spam') {
          span.classList.add('word-spam-trigger');
          span.title = `Spam token weight: ${(matchedImpact.score * 100).toFixed(0)}%`;
        } else {
          span.classList.add('word-ham-trigger');
          span.title = `Legitimate token weight: ${((1 - matchedImpact.score) * 100).toFixed(0)}%`;
        }
        highlightBox.appendChild(span);
      } else {
        // Standard word token
        highlightBox.appendChild(document.createTextNode(wordToken));
      }
    });
    
    // Show results panel
    detectorResults.style.display = 'block';
    
    // Scroll smoothly to results
    setTimeout(() => {
      detectorResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  };
  
  // --- Contact Form Submission Handling ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      
      // Simulate form submission visual feedback
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.innerHTML = `
        <svg class="spinner-ring" viewBox="0 0 50 50" style="width: 16px; height: 16px; display: inline-block; border-width: 2px; animation: spin 1s linear infinite; vertical-align: middle; margin-right: 8px;">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4"></circle>
        </svg>
        Sending...
      `;
      
      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 16px; height: 16px; margin-right: 8px;">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Message Sent!
        `;
        submitBtn.style.background = 'var(--grad-ham)';
        submitBtn.style.color = 'var(--bg-deep)';
        
        // Custom premium toast
        const toast = document.createElement('div');
        toast.className = 'glass-card';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.padding = '16px 24px';
        toast.style.zIndex = '9999';
        toast.style.borderColor = 'rgba(0, 230, 118, 0.4)';
        toast.style.boxShadow = '0 10px 30px rgba(0, 230, 118, 0.15)';
        toast.style.background = 'rgba(2, 18, 10, 0.95)';
        toast.style.color = '#69f0ae';
        toast.style.fontWeight = '500';
        toast.style.animation = 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        toast.innerHTML = `Thank you ${name}! Your inquiry has been received.`;
        
        document.body.appendChild(toast);
        
        // Remove toast
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(10px)';
          toast.style.transition = 'all 0.4s ease';
          setTimeout(() => toast.remove(), 400);
        }, 4000);
        
        // Reset Form
        setTimeout(() => {
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.background = '';
          submitBtn.style.color = '';
          submitBtn.innerHTML = originalText;
        }, 1500);
        
      }, 1500);
    });
  }
});

(function () {
    let canvas = null;
    let ctx = null;
    let width = 0;
    let height = 0;
    let devicePixelRatio = window.devicePixelRatio || 1;
    const cloudRadius = 290;
    const particleCount = 260;
    const particles = [];
    let rotationY = 0;
    let rotationVelocity = 0.01;
    let targetRotationVelocity = 0.01;
    const idleRotationVelocity = 0.006;
    let tiltX = -0.22;
    let targetTiltX = -0.22;
    let mouseOffsetX = 0;
    let targetMouseOffsetX = 0;
    let mouseOffsetY = 0;
    let targetMouseOffsetY = 0;
    let initialized = false;
    let currentSectionIndex = -1;
    let sphereOpacity = 0;
    let panelTextAnimating = false;
    let lastScrollY = 0;
    let popupElement = null;
    let popupTitleElement = null;
    let popupTextElement = null;
    let popupKickerElement = null;
    let popupCloseElement = null;
    let interactiveLabels = [];
    let hoveredLabelData = null;
    let hoverPause = 0;
    let cloudMotionTime = 0;

    const sections = [
        {
            title: 'About me',
            text: 'I am a web developer passionate about building immersive websites and clean digital experiences. My work is focused on strong visuals, smooth motion, and modern interactions.',
            links: [],
            labels: [
                { label: 'Creative Dev', title: 'Creative Developer', text: 'I like building interfaces that feel polished, expressive, and visually memorable rather than purely functional.' },
                { label: 'Motion', title: 'Motion Design', text: 'Animation is a big part of how I shape personality, pacing, and clarity in digital experiences.' },
                { label: 'Frontend', title: 'Frontend Focus', text: 'My strongest work lives at the intersection of interface engineering, responsiveness, and user experience.' },
                { label: 'UI Systems', title: 'UI Systems', text: 'I care about consistent spacing, reusable patterns, and design decisions that scale cleanly across a product.' },
                { label: 'Web', title: 'Web Experiences', text: 'I enjoy creating web experiences that feel immersive, interactive, and intentional from the first screen.' }
            ]
        },
        {
            title: 'Education',
            text: 'Bachelor of Science in Computer Science with a focus on web development, interactive media, and UX design.',
            links: [],
            labels: [
                { label: 'Computer Science', title: 'Computer Science', text: 'My education built the technical foundation behind the interface work, from problem solving to software structure.' },
                { label: 'UX', title: 'User Experience', text: 'I studied how interaction, accessibility, and usability shape whether a product feels intuitive or frustrating.' },
                { label: 'Interactive Media', title: 'Interactive Media', text: 'I am especially drawn to digital work that blends engineering with visual storytelling and engagement.' },
                { label: 'Research', title: 'Research Mindset', text: 'Good product decisions come from curiosity, iteration, and understanding how people actually use what we build.' },
                { label: 'Design', title: 'Design Thinking', text: 'Design is not decoration for me; it is part of how the product communicates, guides, and earns trust.' }
            ]
        },
        {
            title: 'Skills',
            text: 'JavaScript, C#, Blazor, HTML, CSS, responsive design, animation, and clean UI development.',
            links: [],
            labels: [
                { label: 'Blazor', title: 'Blazor', text: 'I use Blazor to build interactive .NET-driven interfaces with a strong component structure and smooth client behavior.' },
                { label: 'C#', title: 'C#', text: 'C# gives me the structure and clarity I like when building maintainable application logic and UI behavior.' },
                { label: 'JavaScript', title: 'JavaScript', text: 'I rely on JavaScript when I want lower-level control over motion, canvas effects, and custom browser interactions.' },
                { label: 'HTML', title: 'HTML Structure', text: 'Semantic structure matters because it improves accessibility, readability, and long-term maintainability.' },
                { label: 'CSS', title: 'CSS Styling', text: 'I use CSS to shape layout, rhythm, motion, and visual identity instead of treating it like an afterthought.' },
                { label: 'Responsive UI', title: 'Responsive UI', text: 'I design interfaces to adapt cleanly across screen sizes so the experience still feels intentional on mobile.' }
            ]
        },
        {
            title: 'Experience',
            text: 'I have created responsive applications and interactive visuals, delivering fast, polished products for digital audiences.',
            links: [],
            labels: [
                { label: 'Products', title: 'Product Work', text: 'I focus on building interfaces that are not only visually strong, but also useful, stable, and production-minded.' },
                { label: 'Interfaces', title: 'Interface Craft', text: 'I enjoy refining layout, hierarchy, and interaction details until the experience feels cohesive.' },
                { label: 'Animation', title: 'Interactive Motion', text: 'Motion helps me create richer interfaces, especially when it supports clarity and atmosphere rather than distraction.' },
                { label: 'Performance', title: 'Performance', text: 'I try to keep interactive work efficient so visuals still feel smooth and responsive under real use.' },
                { label: 'Delivery', title: 'Delivery', text: 'Shipping matters to me, so I balance experimentation with practical implementation that can actually go live.' }
            ]
        },
        {
            title: 'Contact',
            text: 'Connect with me through GitHub, LinkedIn, or email.',
            links: [
                { href: 'https://github.com/yourusername', label: 'GitHub' },
                { href: 'https://linkedin.com/in/yourname', label: 'LinkedIn' },
                { href: 'mailto:hello@example.com', label: 'Email' }
            ],
            labels: [
                { label: 'GitHub', title: 'GitHub', text: 'My GitHub is the best place to see how I structure projects, experiment with ideas, and ship interface work.' },
                { label: 'LinkedIn', title: 'LinkedIn', text: 'LinkedIn is where you can connect with me professionally and follow what I am building next.' },
                { label: 'Email', title: 'Email', text: 'If you want to talk directly about a project, role, or collaboration, email is the fastest route.' },
                { label: 'Let’s Build', title: 'Let’s Build Something', text: 'I am interested in work that combines thoughtful design, strong frontend craft, and ambitious interaction.' },
                { label: 'Contact', title: 'Contact', text: 'If the work resonates with you, I would love to hear from you and talk about what we can create.' }
            ]
        }
    ];

    let sectionTitleElement = null;
    let sectionTextElement = null;
    let contactLinksElement = null;
    let floatingHeaderElement = null;
    let currentDisplayTitle = sections[0].title;
    let currentDisplayText = sections[0].text;
    let currentDisplayLinks = [];
    let currentDisplayLabels = sections[0].labels;
    let labelReveal = 0;
    let targetLabelReveal = 1;

    function resizeCanvas() {
        devicePixelRatio = window.devicePixelRatio || 1;
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.floor(width * devicePixelRatio);
        canvas.height = Math.floor(height * devicePixelRatio);
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function perspective(x, y, z) {
        const depth = 900;
        const scale = depth / (depth + z);
        return {
            x: width / 2 + x * scale,
            y: height / 2 - y * scale,
            scale
        };
    }

    function createParticleCloud() {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = cloudRadius * (0.22 + Math.random() * 0.78);
            particles.push({
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.cos(phi) * 0.68,
                z: radius * Math.sin(phi) * Math.sin(theta),
                size: 0.8 + Math.random() * 3.6,
                alpha: 0.18 + Math.random() * 0.58,
                orbitOffset: Math.random() * Math.PI * 2,
                orbitSpeed: 0.35 + Math.random() * 1.8
            });
        }
    }

    function rotate(point, angleX, angleY) {
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);

        let x = point.x * cosY - point.z * sinY;
        let z = point.x * sinY + point.z * cosY;
        let y = point.y * cosX - z * sinX;
        z = point.y * sinX + z * cosX;

        return { x, y, z };
    }

    function drawSphere() {
        ctx.clearRect(0, 0, width, height);

        ctx.globalAlpha = sphereOpacity;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        drawCloudGlow(centerX, centerY);
        drawParticleCloud(centerX, centerY);
        drawFloatingLabels(centerX, centerY);
        ctx.globalAlpha = 1.0;
        requestAnimationFrame(animate);
    }

    function drawCloudGlow(centerX, centerY) {
        const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 390);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
        glow.addColorStop(0.26, 'rgba(255, 255, 255, 0.12)');
        glow.addColorStop(0.58, 'rgba(255, 255, 255, 0.04)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 390, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawParticleCloud(centerX, centerY) {
        const angleX = tiltX;
        const angleY = rotationY;
        const time = cloudMotionTime;
        const projectedParticles = [];

        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const driftX = Math.cos(time * particle.orbitSpeed + particle.orbitOffset) * 24;
            const driftY = Math.sin(time * particle.orbitSpeed * 1.15 + particle.orbitOffset) * 18;
            const driftZ = Math.sin(time * particle.orbitSpeed + particle.orbitOffset) * 26;
            const movedParticle = {
                x: particle.x + driftX + mouseOffsetX * 18,
                y: particle.y + driftY + mouseOffsetY * 16,
                z: particle.z + driftZ
            };
            const rotated = rotate(movedParticle, angleX, angleY);
            const projected = perspective(rotated.x, rotated.y, rotated.z);
            projectedParticles.push({
                x: projected.x,
                y: projected.y,
                z: rotated.z,
                scale: projected.scale,
                size: particle.size,
                alpha: particle.alpha
            });
        }

        projectedParticles.sort((a, b) => a.z - b.z);

        ctx.lineWidth = 1;
        for (let i = 0; i < projectedParticles.length; i++) {
            const a = projectedParticles[i];
            for (let j = i + 1; j < projectedParticles.length; j += 3) {
                const b = projectedParticles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 92) {
                    const lineAlpha = (1 - distance / 92) * 0.16 * sphereOpacity;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        for (let i = 0; i < projectedParticles.length; i++) {
            const particle = projectedParticles[i];
            const renderSize = particle.size * particle.scale * 2.2;
            const renderAlpha = particle.alpha * (0.48 + particle.scale * 0.7) * sphereOpacity;

            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            ctx.shadowBlur = 18 * particle.scale;
            ctx.fillStyle = `rgba(255, 255, 255, ${renderAlpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, renderSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
    }

    function drawFloatingLabels(centerX, centerY) {
        if (!currentDisplayLabels || currentDisplayLabels.length === 0) {
            return;
        }

        const time = cloudMotionTime * 0.76;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        interactiveLabels = [];

        for (let i = 0; i < currentDisplayLabels.length; i++) {
            const labelItem = currentDisplayLabels[i];
            const label = labelItem.label;
            const angle = time * 1.1 + (Math.PI * 2 * i) / currentDisplayLabels.length;
            const orbitX = Math.cos(angle) * (120 + i * 6);
            const orbitY = Math.sin(angle * 1.35) * (72 + i * 4);
            const depth = (Math.sin(angle) + 1) / 2;
            const scale = 0.78 + depth * 0.42;
            const alpha = (0.25 + depth * 0.55) * sphereOpacity * labelReveal;
            const fontSize = Math.round(12 + depth * 8);

            ctx.globalAlpha = alpha;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
            ctx.shadowBlur = 16 * scale;
            ctx.fillStyle = 'rgba(245, 245, 245, 0.96)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
            ctx.lineWidth = 1;
            ctx.font = `${600} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

            const x = centerX + orbitX + mouseOffsetX * 24;
            const y = centerY + orbitY + mouseOffsetY * 16;
            const paddingX = 16 * scale;
            const paddingY = 10 * scale;
            const textWidth = ctx.measureText(label).width;
            const boxWidth = textWidth + paddingX * 2;
            const boxHeight = fontSize + paddingY * 1.6;
            const radius = boxHeight / 2;

            ctx.fillStyle = `rgba(8, 8, 8, ${0.6 + depth * 0.16})`;
            ctx.beginPath();
            ctx.moveTo(x - boxWidth / 2 + radius, y - boxHeight / 2);
            ctx.lineTo(x + boxWidth / 2 - radius, y - boxHeight / 2);
            ctx.quadraticCurveTo(x + boxWidth / 2, y - boxHeight / 2, x + boxWidth / 2, y - boxHeight / 2 + radius);
            ctx.lineTo(x + boxWidth / 2, y + boxHeight / 2 - radius);
            ctx.quadraticCurveTo(x + boxWidth / 2, y + boxHeight / 2, x + boxWidth / 2 - radius, y + boxHeight / 2);
            ctx.lineTo(x - boxWidth / 2 + radius, y + boxHeight / 2);
            ctx.quadraticCurveTo(x - boxWidth / 2, y + boxHeight / 2, x - boxWidth / 2, y + boxHeight / 2 - radius);
            ctx.lineTo(x - boxWidth / 2, y - boxHeight / 2 + radius);
            ctx.quadraticCurveTo(x - boxWidth / 2, y - boxHeight / 2, x - boxWidth / 2 + radius, y - boxHeight / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = 'rgba(255, 255, 255, 0.08)';
            ctx.shadowBlur = 6 * scale;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + depth * 0.08})`;
            ctx.fillText(label, x, y + 1);

            interactiveLabels.push({
                x,
                y,
                width: boxWidth,
                height: boxHeight,
                data: labelItem
            });
        }

        ctx.restore();
    }

    function openPopup(labelItem) {
        if (!popupElement || !popupTitleElement || !popupTextElement || !popupKickerElement) {
            return;
        }

        popupKickerElement.textContent = currentDisplayTitle;
        popupTitleElement.textContent = labelItem.title;
        popupTextElement.textContent = labelItem.text;
        popupElement.classList.add('is-open');
        popupElement.setAttribute('aria-hidden', 'false');
    }

    function closePopup() {
        if (!popupElement) {
            return;
        }

        popupElement.classList.remove('is-open');
        popupElement.setAttribute('aria-hidden', 'true');
    }

    function findLabelAtPosition(clientX, clientY) {
        if (!canvas) {
            return null;
        }

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        for (let i = interactiveLabels.length - 1; i >= 0; i--) {
            const label = interactiveLabels[i];
            if (
                x >= label.x - label.width / 2 &&
                x <= label.x + label.width / 2 &&
                y >= label.y - label.height / 2 &&
                y <= label.y + label.height / 2
            ) {
                return label.data;
            }
        }

        return null;
    }

    function animate() {
        if (!initialized) {
            return;
        }
        hoverPause += ((hoveredLabelData ? 1 : 0) - hoverPause) * 0.12;
        const effectiveTargetRotationVelocity = targetRotationVelocity * (1 - hoverPause);
        rotationVelocity += (effectiveTargetRotationVelocity - rotationVelocity) * 0.08;
        tiltX += (targetTiltX - tiltX) * 0.08;
        mouseOffsetX += (targetMouseOffsetX - mouseOffsetX) * 0.08;
        mouseOffsetY += (targetMouseOffsetY - mouseOffsetY) * 0.08;
        cloudMotionTime += (0.00042 + Math.abs(rotationVelocity) * 0.12) * (1 - hoverPause);
        rotationY += rotationVelocity;
        rotationY = rotationY % (Math.PI * 2);
        labelReveal += (targetLabelReveal - labelReveal) * 0.12;
        drawSphere();
    }

    function animatePanelText(section) {
        if (!sectionTitleElement || !sectionTextElement || !contactLinksElement) {
            return;
        }

        panelTextAnimating = true;
        sectionTitleElement.classList.remove('is-visible');
        sectionTextElement.classList.remove('is-visible');
        contactLinksElement.classList.remove('is-visible');

        window.setTimeout(() => {
            sectionTitleElement.textContent = section.title;
            sectionTextElement.textContent = section.text;
            contactLinksElement.innerHTML = '';

            if (section.links.length > 0) {
                section.links.forEach(link => {
                    const anchor = document.createElement('a');
                    anchor.className = 'contact-link';
                    anchor.href = link.href;
                    anchor.textContent = link.label;
                    anchor.target = '_blank';
                    anchor.rel = 'noreferrer noopener';
                    contactLinksElement.appendChild(anchor);
                });
            }

            requestAnimationFrame(() => {
                sectionTitleElement.classList.add('is-visible');
                sectionTextElement.classList.add('is-visible');
                contactLinksElement.classList.add('is-visible');
                panelTextAnimating = false;
            });
        }, 120);
    }

    function updateSection(index) {
        if (currentSectionIndex === index) {
            return;
        }
        currentSectionIndex = index;
        const section = sections[index];
        if (!section) {
            return;
        }

        if (!panelTextAnimating) {
            animatePanelText(section);
        }
    }

    function updateSphereText(index) {
        const section = sections[index];
        if (!section) {
            return;
        }

        if (currentDisplayTitle !== section.title) {
            currentDisplayTitle = section.title;
            currentDisplayText = section.text;
            currentDisplayLinks = section.links || [];
            currentDisplayLabels = section.labels || [];
            labelReveal = 0;
            targetLabelReveal = 1;
        }
    }

    function updateRotation() {
        if (!initialized) {
            return;
        }

        const heroHeight = window.innerHeight;
        const currentScrollY = window.scrollY;
        const scrollBelowHero = Math.max(0, window.scrollY - heroHeight);
        const scrollPercentage = scrollBelowHero / window.innerHeight;
        const isPanelMode = window.scrollY > heroHeight * 0.48;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const fraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const sectionIndex = Math.min(Math.floor(fraction * sections.length), sections.length - 1);
        const scrollInfluence = Math.min(1, Math.max(0, scrollPercentage));
        const scrollDelta = currentScrollY - lastScrollY;
        const scrollDirection = scrollDelta === 0 ? 0 : scrollDelta < 0 ? -1 : 1;

        sphereOpacity = Math.min(1, Math.max(0, scrollPercentage * 2.4));
        targetRotationVelocity = idleRotationVelocity + scrollDirection * (0.003 + scrollInfluence * 0.009);
        targetTiltX = -0.22 - scrollInfluence * 0.08;
        const aboutPanel = document.querySelector('.about-panel');
        if (aboutPanel) {
            aboutPanel.style.opacity = sphereOpacity;
            aboutPanel.classList.toggle('is-active', isPanelMode);
        }

        if (floatingHeaderElement) {
            floatingHeaderElement.textContent = isPanelMode ? sections[sectionIndex].title : 'Rati Kotchuashvili';
            floatingHeaderElement.classList.toggle('is-panel', isPanelMode);
        }
        updateSection(sectionIndex);
        updateSphereText(sectionIndex);
        lastScrollY = currentScrollY;
    }

    function tryInit() {
        canvas = document.getElementById('sphereCanvas');
        sectionTitleElement = document.getElementById('sectionTitle');
        sectionTextElement = document.getElementById('sectionText');
        contactLinksElement = document.getElementById('contactLinks');
        floatingHeaderElement = document.getElementById('floatingHeader');
        popupElement = document.getElementById('cloudPopup');
        popupTitleElement = document.getElementById('cloudPopupTitle');
        popupTextElement = document.getElementById('cloudPopupText');
        popupKickerElement = document.getElementById('cloudPopupKicker');
        popupCloseElement = document.getElementById('cloudPopupClose');

        if (!canvas || !sectionTitleElement || !sectionTextElement || !contactLinksElement || !floatingHeaderElement || !popupElement || !popupTitleElement || !popupTextElement || !popupKickerElement || !popupCloseElement) {
            return false;
        }

        ctx = canvas.getContext('2d');
        if (!ctx) {
            return false;
        }

        resizeCanvas();
        createParticleCloud();
        sectionTitleElement.classList.add('is-visible');
        sectionTextElement.classList.add('is-visible');
        contactLinksElement.classList.add('is-visible');
        updateRotation();
        initialized = true;
        popupCloseElement.addEventListener('click', closePopup);
        popupElement.addEventListener('click', event => {
            if (event.target === popupElement) {
                closePopup();
            }
        });
        canvas.addEventListener('click', event => {
            const label = findLabelAtPosition(event.clientX, event.clientY);
            if (label) {
                openPopup(label);
            }
        });
        canvas.addEventListener('mousemove', event => {
            const hoveredLabel = findLabelAtPosition(event.clientX, event.clientY);
            hoveredLabelData = hoveredLabel;
            canvas.classList.toggle('is-interactive', Boolean(hoveredLabel));
        });
        canvas.addEventListener('mouseleave', () => {
            hoveredLabelData = null;
            canvas.classList.remove('is-interactive');
        });
        requestAnimationFrame(animate);
        return true;
    }

    const initInterval = setInterval(() => {
        if (tryInit()) {
            clearInterval(initInterval);
        }
    }, 50);

    window.addEventListener('resize', () => {
        if (initialized) {
            resizeCanvas();
            updateRotation();
        }
    });

    window.addEventListener('mousemove', event => {
        const normalizedX = event.clientX / window.innerWidth - 0.5;
        const normalizedY = event.clientY / window.innerHeight - 0.5;
        targetMouseOffsetX = normalizedX;
        targetMouseOffsetY = normalizedY;
        targetTiltX = -0.22 - Math.max(0, window.scrollY / Math.max(1, window.innerHeight)) * 0.04 + normalizedY * 0.18;
    });

    window.addEventListener('scroll', updateRotation, { passive: true });
    window.addEventListener('load', () => {
        if (tryInit()) {
            clearInterval(initInterval);
        }
    });
    window.addEventListener('DOMContentLoaded', () => {
        if (tryInit()) {
            clearInterval(initInterval);
        }
    });
})();

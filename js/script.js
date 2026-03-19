document.addEventListener('DOMContentLoaded', () => {
    // --- Three.js Background ---
    const initThreeBackground = () => {
        const container = document.getElementById('three-container');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const cyanColor = new THREE.Color(0x00D1FF);
        const purpleColor = new THREE.Color(0x7C3AED);

        const particlesCount = 150;
        const positions = new Float32Array(particlesCount * 3);
        const velocities = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

            velocities[i * 3] = (Math.random() - 0.5) * 0.05;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

            const color = Math.random() > 0.5 ? cyanColor : purpleColor;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        const linesGeometry = new THREE.BufferGeometry();
        const linesMaterial = new THREE.LineBasicMaterial({
            color: 0x00D1FF,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
        });
        const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(lines);

        camera.position.z = 30;

        let mouseX = 0;
        let mouseY = 0;
        window.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
        });

        const animate = () => {
            requestAnimationFrame(animate);

            const positionsArray = particlesGeometry.attributes.position.array;
            for (let i = 0; i < particlesCount; i++) {
                positionsArray[i * 3] += velocities[i * 3];
                positionsArray[i * 3 + 1] += velocities[i * 3 + 1];
                positionsArray[i * 3 + 2] += velocities[i * 3 + 2];

                if (Math.abs(positionsArray[i * 3]) > 25) velocities[i * 3] *= -1;
                if (Math.abs(positionsArray[i * 3 + 1]) > 25) velocities[i * 3 + 1] *= -1;
                if (Math.abs(positionsArray[i * 3 + 2]) > 25) velocities[i * 3 + 2] *= -1;
            }
            particlesGeometry.attributes.position.needsUpdate = true;

            const linePositions = [];
            for (let i = 0; i < particlesCount; i++) {
                for (let j = i + 1; j < particlesCount; j++) {
                    const dx = positionsArray[i * 3] - positionsArray[j * 3];
                    const dy = positionsArray[i * 3 + 1] - positionsArray[j * 3 + 1];
                    const dz = positionsArray[i * 3 + 2] - positionsArray[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 8) {
                        linePositions.push(
                            positionsArray[i * 3], positionsArray[i * 3 + 1], positionsArray[i * 3 + 2],
                            positionsArray[j * 3], positionsArray[j * 3 + 1], positionsArray[j * 3 + 2]
                        );
                    }
                }
            }
            linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

            camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    // --- Countdown Timer ---
    const initCountdown = () => {
        const timerContainer = document.getElementById('countdown-timer');
        if (!timerContainer) return;

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);
        const targetTime = targetDate.getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                timerContainer.innerHTML = '<div class="text-3xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">NETWORK ACTIVE</div>';
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            const format = (num) => num.toString().padStart(2, '0');

            timerContainer.innerHTML = `
                <div class="flex items-center gap-2 md:gap-4 font-mono">
                    <div class="flex items-baseline gap-1">
                        <span class="text-2xl md:text-4xl font-bold text-white tabular-nums tracking-tight">${format(days)}</span>
                        <span class="text-xs md:text-sm text-gray-500 font-medium lowercase">d</span>
                    </div>
                    <span class="text-white/20 text-xl md:text-2xl">:</span>
                    <div class="flex items-baseline gap-1">
                        <span class="text-2xl md:text-4xl font-bold text-white tabular-nums tracking-tight">${format(hours)}</span>
                        <span class="text-xs md:text-sm text-gray-500 font-medium lowercase">h</span>
                    </div>
                    <span class="text-white/20 text-xl md:text-2xl">:</span>
                    <div class="flex items-baseline gap-1">
                        <span class="text-2xl md:text-4xl font-bold text-white tabular-nums tracking-tight">${format(minutes)}</span>
                        <span class="text-xs md:text-sm text-gray-500 font-medium lowercase">m</span>
                    </div>
                    <span class="text-white/20 text-xl md:text-2xl">:</span>
                    <div class="flex items-baseline gap-1">
                        <span class="text-2xl md:text-4xl font-bold text-white tabular-nums tracking-tight">${format(seconds)}</span>
                        <span class="text-xs md:text-sm text-gray-500 font-medium lowercase">s</span>
                    </div>
                </div>
            `;
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    };

    // --- Custom Dropdown ---
    const initCustomDropdown = () => {
        const dropdownBtn = document.getElementById('country-dropdown-btn');
        const dropdownMenu = document.getElementById('country-dropdown-menu');
        const selectedText = document.getElementById('selected-country-text');
        const countryInput = document.getElementById('country-input');
        const otherCountryContainer = document.getElementById('other-country-container');
        const otherCountryInput = document.getElementById('other-country-input');

        if (!dropdownBtn || !dropdownMenu) return;

        dropdownBtn.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        dropdownMenu.querySelectorAll('[data-value]').forEach(item => {
            item.addEventListener('click', () => {
                const value = item.getAttribute('data-value');
                selectedText.textContent = value;
                countryInput.value = value;
                dropdownMenu.classList.remove('show');

                // Handle "Others" logic
                if (value === 'Others') {
                    otherCountryContainer.classList.remove('hidden');
                    otherCountryInput.setAttribute('required', 'required');
                } else {
                    otherCountryContainer.classList.add('hidden');
                    otherCountryInput.removeAttribute('required');
                    otherCountryInput.value = '';
                    syncPhoneCountry(value);
                }
            });
        });

        otherCountryInput.addEventListener('input', (e) => {
            syncPhoneCountry(e.target.value);
        });
    };

    // --- Phone Input ---
    let iti;
    const initPhoneInput = () => {
        const phoneInput = document.querySelector("#phone");
        if (!phoneInput) return;

        iti = window.intlTelInput(phoneInput, {
            initialCountry: "auto",
            geoIpLookup: function(callback) {
                fetch("https://ipapi.co/json")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("us"));
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/24.5.0/js/utils.js",
            separateDialCode: true,
        });
    };

    const countryToIso = {
        'Algeria': 'dz', 'Angola': 'ao', 'Benin': 'bj', 'Botswana': 'bw', 'Burkina Faso': 'bf',
        'Burundi': 'bi', 'Cabo Verde': 'cv', 'Cameroon': 'cm', 'Central African Republic': 'cf',
        'Chad': 'td', 'Comoros': 'km', 'Congo (Congo-Brazzaville)': 'cg', 'Congo (DRC)': 'cd',
        'Djibouti': 'dj', 'Egypt': 'eg', 'Equatorial Guinea': 'gq', 'Eritrea': 'er', 'Eswatini': 'sz',
        'Ethiopia': 'et', 'Gabon': 'ga', 'Gambia': 'gm', 'Ghana': 'gh', 'Guinea': 'gn',
        'Guinea-Bissau': 'gw', 'Ivory Coast': 'ci', 'Kenya': 'ke', 'Lesotho': 'ls', 'Liberia': 'lr',
        'Libya': 'ly', 'Madagascar': 'mg', 'Malawi': 'mw', 'Mali': 'ml', 'Mauritania': 'mr',
        'Mauritius': 'mu', 'Morocco': 'ma', 'Mozambique': 'mz', 'Namibia': 'na', 'Niger': 'ne',
        'Nigeria': 'ng', 'Rwanda': 'rw', 'Sao Tome and Principe': 'st', 'Senegal': 'sn',
        'Seychelles': 'sc', 'Sierra Leone': 'sl', 'Somalia': 'so', 'South Africa': 'za',
        'South Sudan': 'ss', 'Sudan': 'sd', 'Tanzania': 'tz', 'Togo': 'tg', 'Tunisia': 'tn',
        'Uganda': 'ug', 'Zambia': 'zm', 'Zimbabwe': 'zw'
    };

    const syncPhoneCountry = (countryName) => {
        if (!iti) return;
        
        const iso = countryToIso[countryName];
        if (iso) {
            iti.setCountry(iso);
        } else {
            // Try to find by name for "Others"
            const countryData = window.intlTelInputGlobals.getCountryData();
            const matchedCountry = countryData.find(c => 
                c.name.toLowerCase().includes(countryName.toLowerCase())
            );
            if (matchedCountry) {
                iti.setCountry(matchedCountry.iso2);
            }
        }
    };

    // --- Form Submission ---
    const initForm = () => {
        const form = document.getElementById('registration-form');
        const submitBtn = document.getElementById('submit-btn');
        const successModal = document.getElementById('success-modal');
        const closeSuccess = document.getElementById('close-success');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</span>';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Add full phone number
            data.phone = iti.getNumber();
            
            // Handle country
            if (data.country === 'Others') {
                data.country = data.otherCountry;
            }
            delete data.otherCountry;

            try {
                const response = await fetch("https://formspree.io/f/xpwzndjb", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    successModal.classList.remove('hidden');
                    form.reset();
                    document.getElementById('selected-country-text').textContent = 'Select your country';
                    document.getElementById('other-country-container').classList.add('hidden');
                } else {
                    alert("Submission failed. Please try again.");
                }
            } catch (error) {
                console.error(error);
                alert("An error occurred. Please try again.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join Network';
            }
        });

        closeSuccess.addEventListener('click', () => {
            successModal.classList.add('hidden');
        });
    };

    // Initialize everything
    initThreeBackground();
    initCountdown();
    initCustomDropdown();
    initPhoneInput();
    initForm();
});

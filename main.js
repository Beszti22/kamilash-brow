/**
 * KamiLash & Brow – Interaktív Weboldal & Időpontfoglaló Motor
 * Szempilla lifting & Szemöldök laminálás mintarendszer
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. ADATMODELL – SZOLGÁLTATÁSOK & ÁRLISTA (A SZÓRÓLAP ALAPJÁN)
  // =========================================================================
  const SERVICES_DATA = [
    {
      id: 'lash-lifting',
      name: 'Szempilla lifting festéssel',
      category: 'lash',
      categoryLabel: 'Szempilla',
      originalPrice: 14500,
      discountPrice: 7250,
      duration: 60,
      description: 'Saját pillák megemelése a tövektől, mélyfekete tartós festéssel és tápláló keratinos lamináló ápolással.'
    },
    {
      id: 'essential-styling',
      name: 'Essential styling',
      category: 'brow',
      categoryLabel: 'Szemöldök',
      originalPrice: 8500,
      discountPrice: 4250,
      duration: 40,
      description: 'Alap szemöldök formázás és tisztítás csipesszel és/vagy gyantával, tartós színfrissítő festéssel.'
    },
    {
      id: 'mid-level-styling',
      name: 'Mid level styling',
      subtitle: 'Szemöldök laminálás festéssel',
      category: 'brow',
      categoryLabel: 'Szemöldök laminálás',
      originalPrice: 9500,
      discountPrice: 4750,
      duration: 45,
      description: 'Kósza vagy lefelé álló szemöldökszálak fixálása a kívánt irányba kímélő formulával, tartós festéssel.'
    },
    {
      id: 'best-brows-styling',
      name: 'Best Brows styling',
      subtitle: 'Szemöldök laminálás festéssel és formázással',
      category: 'brow',
      categoryLabel: 'Komplett Szemöldök',
      originalPrice: 14500,
      discountPrice: 7250,
      duration: 60,
      description: 'A komplett szemöldök transzformáció: laminálás, személyre szabott precíz formatervezés és hibrid festés.'
    },
    {
      id: 'she-knows-the-secret',
      name: 'She knows the secret',
      subtitle: 'Szempilla lifting és szemöldökformázás festéssel',
      category: 'combo',
      categoryLabel: 'Kombinált Csomag (Legnépszerűbb)',
      originalPrice: 19000,
      discountPrice: 9500,
      duration: 75,
      description: 'Tekintetfókuszú duó: szempilla lifting tartós mélyfestéssel, professzionális szemöldökív-formázással és festéssel.'
    },
    {
      id: 'clean-girl-who',
      name: 'Clean girl, who?',
      subtitle: 'Szempilla lifting és szemöldöklaminálás festéssel',
      category: 'combo',
      categoryLabel: 'Kombinált Csomag',
      originalPrice: 24000,
      discountPrice: 12000,
      duration: 90,
      description: 'Effortless glow: saját pilláid és szemöldököd maximális megemelése és laminálása, reggeli készülődés nélküli ragyogás.'
    },
    {
      id: 'chefs-kiss',
      name: 'Chef’s kiss',
      subtitle: 'Szempilla lifting és szemöldöklaminálás festéssel és formázással',
      category: 'combo',
      categoryLabel: 'VIP All-Inclusive Csomag',
      originalPrice: 26000,
      discountPrice: 13000,
      duration: 105,
      description: 'All-inclusive luxus: lifting mélyfestéssel és keratinnal, plusz teljes szemöldök laminálás karakterformázással és festéssel.'
    }
  ];

  // =========================================================================
  // 2. IDŐPONTFOGLALÓ ÁLLAPOT (STATE)
  // =========================================================================
  const bookingState = {
    currentStep: 1,
    selectedServiceIds: ['she-knows-the-secret'], // Alapértelmezetten a legnépszerűbb
    selectedDate: null,
    selectedSlot: null,
    guestData: {
      name: '',
      phone: '',
      email: '',
      experience: 'first-time',
      contactLenses: false,
      notes: ''
    },
    calendarYear: 2026,
    calendarMonth: 10, // 0-indexed: 10 = November 2026 (A szórólap akciójának hónapja)
    bookingCode: ''
  };

  // =========================================================================
  // 3. MOBIL NAVIGÁCIÓ KEZELÉSE
  // =========================================================================
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileNavMenu = document.getElementById('mobileNavMenu');

  if (mobileNavToggle && mobileNavMenu) {
    mobileNavToggle.addEventListener('click', () => {
      const isOpen = mobileNavMenu.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-footer a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  function openMobileNav() {
    mobileNavToggle.classList.add('open');
    mobileNavToggle.setAttribute('aria-expanded', 'true');
    mobileNavMenu.classList.add('open');
    mobileNavMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  function closeMobileNav() {
    mobileNavToggle.classList.remove('open');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    mobileNavMenu.classList.remove('open');
    mobileNavMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  // =========================================================================
  // 4. INTERAKTÍV ELŐTTE / UTÁNA CSÚSZKA (BEFORE / AFTER COMPARISON)
  // =========================================================================
  const comparisonContainer = document.getElementById('beforeAfterContainer');
  const comparisonOverlay = document.getElementById('comparisonOverlay');
  const comparisonHandle = document.getElementById('comparisonHandle');
  const comparisonRange = document.getElementById('comparisonRange');
  const beforeImg = comparisonOverlay ? comparisonOverlay.querySelector('.before-img') : null;

  if (comparisonContainer && comparisonOverlay && comparisonHandle) {
    let isDragging = false;

    // Képméret szinkronizálása ablakméretezéskor (hogy a levágott kép tökéletesen fedje az alsót)
    function syncImageWidth() {
      if (beforeImg && comparisonContainer) {
        const containerWidth = comparisonContainer.offsetWidth;
        beforeImg.style.width = `${containerWidth}px`;
      }
    }
    syncImageWidth();
    window.addEventListener('resize', syncImageWidth);

    function updateSliderPosition(percent) {
      const clamped = Math.max(0, Math.min(100, percent));
      comparisonOverlay.style.width = `${clamped}%`;
      comparisonHandle.style.left = `${clamped}%`;
      if (comparisonRange) {
        comparisonRange.value = clamped;
      }
    }

    // Egérmozgás és Érintéskezelés
    function handlePointerMove(e) {
      const rect = comparisonContainer.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const offsetX = clientX - rect.left;
      const percent = (offsetX / rect.width) * 100;
      updateSliderPosition(percent);
    }

    comparisonContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      handlePointerMove(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        handlePointerMove(e);
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Érintőképernyő kezelés (mobil swipe)
    comparisonContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      handlePointerMove(e);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) {
        handlePointerMove(e);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Billentyűzet / Range input hozzáférés
    if (comparisonRange) {
      comparisonRange.addEventListener('input', (e) => {
        updateSliderPosition(parseFloat(e.target.value));
      });
    }

    // Alapértelmezett indítás 50%-on
    updateSliderPosition(50);
  }

  // =========================================================================
  // 5. SZOLGÁLTATÁS KATEGÓRIA SZŰRÉS (CATEGORY TABS)
  // =========================================================================
  const catTabs = document.querySelectorAll('.cat-tab');
  const serviceCards = document.querySelectorAll('.service-card');

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const category = tab.dataset.category;
      serviceCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 6. KÖZVETLEN IDŐPONTFOGLALÁS A KÁRTYÁKRÓL (PRE-SELECTOR)
  // =========================================================================
  const selectServiceBtns = document.querySelectorAll('.btn-select-service');
  selectServiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceId = btn.dataset.serviceId;
      if (serviceId) {
        bookingState.selectedServiceIds = [serviceId];
        renderWizardServices();
        updateSummary();
        goToStep(2); // Egyből az időpontválasztóhoz ugrik a maximális konverzióért!
        
        const bookingSection = document.getElementById('idopontfoglalas');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // =========================================================================
  // 7. WIZARD SZOLGÁLTATÁSOK RENDERELÉSE (LÉPÉS 1)
  // =========================================================================
  const wizardServicesList = document.getElementById('wizardServicesList');
  const btnStep1Next = document.getElementById('btnStep1Next');

  function renderWizardServices() {
    if (!wizardServicesList) return;
    wizardServicesList.innerHTML = '';

    SERVICES_DATA.forEach(svc => {
      const isSelected = bookingState.selectedServiceIds.includes(svc.id);

      const optionDiv = document.createElement('div');
      optionDiv.className = `wizard-service-option ${isSelected ? 'selected' : ''}`;
      optionDiv.dataset.id = svc.id;
      optionDiv.setAttribute('role', 'checkbox');
      optionDiv.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      optionDiv.tabIndex = 0;

      optionDiv.innerHTML = `
        <div class="option-left">
          <div class="custom-checkbox">✓</div>
          <div class="option-details">
            <span class="option-title">${svc.name} ${svc.subtitle ? `<small style="font-weight:400;color:var(--color-text-muted);">(${svc.subtitle})</small>` : ''}</span>
            <span class="option-meta">⏱ ~${svc.duration} perc &bull; ${svc.categoryLabel}</span>
          </div>
        </div>
        <div class="option-right">
          <span class="option-old-price">${formatPrice(svc.originalPrice)} Ft</span>
          <span class="option-price">${formatPrice(svc.discountPrice)} Ft</span>
        </div>
      `;

      optionDiv.addEventListener('click', () => {
        toggleServiceSelection(svc.id);
      });

      optionDiv.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleServiceSelection(svc.id);
        }
      });

      wizardServicesList.appendChild(optionDiv);
    });

    if (btnStep1Next) {
      btnStep1Next.disabled = bookingState.selectedServiceIds.length === 0;
    }
  }

  function toggleServiceSelection(serviceId) {
    const idx = bookingState.selectedServiceIds.indexOf(serviceId);
    if (idx > -1) {
      // Ha már ki volt választva, levesszük
      bookingState.selectedServiceIds.splice(idx, 1);
    } else {
      // Új kiválasztása
      bookingState.selectedServiceIds.push(serviceId);
    }
    renderWizardServices();
    updateSummary();
  }

  // =========================================================================
  // 8. INTERAKTÍV NAPTÁR GENERÁLÓ (LÉPÉS 2)
  // =========================================================================
  const calPrevMonth = document.getElementById('calPrevMonth');
  const calNextMonth = document.getElementById('calNextMonth');
  const calCurrentMonth = document.getElementById('calCurrentMonth');
  const calendarDaysGrid = document.getElementById('calendarDaysGrid');
  const btnStep2Next = document.getElementById('btnStep2Next');

  const MONTH_NAMES = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  function renderCalendar() {
    if (!calendarDaysGrid || !calCurrentMonth) return;

    const year = bookingState.calendarYear;
    const month = bookingState.calendarMonth;

    calCurrentMonth.textContent = `${year}. ${MONTH_NAMES[month]}`;

    // Hónap első napja és a napok száma
    const firstDayDate = new Date(year, month, 1);
    // Hétfő az első nap (0 = vasárnap, 1 = hétfő, ..., 6 = szombat)
    let startDayIndex = firstDayDate.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6; // Ha vasárnap, akkor a 7. pozíció

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarDaysGrid.innerHTML = '';

    // Üres cellák a hónap elején
    for (let i = 0; i < startDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      calendarDaysGrid.appendChild(emptyCell);
    }

    // Hónap valós napjai
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      const cellDate = new Date(year, month, day);
      const dayOfWeek = cellDate.getDay(); // 0 = Vasárnap

      // Vasárnap ZÁRVA
      const isSunday = (dayOfWeek === 0);

      // Mai nap jelölése (alapértelmezett 2026. nov 2. vagy aktuális nap)
      const isToday = (day === 2 && month === 10 && year === 2026);

      // Kiválasztott nap vizsgálata
      const isSelected = bookingState.selectedDate &&
        bookingState.selectedDate.getFullYear() === year &&
        bookingState.selectedDate.getMonth() === month &&
        bookingState.selectedDate.getDate() === day;

      dayCell.textContent = day;
      dayCell.className = 'cal-day-cell';

      if (isSunday) {
        dayCell.classList.add('disabled');
        dayCell.title = 'Vasárnap: Zárva';
      } else {
        dayCell.classList.add('available');
        if (isToday) dayCell.classList.add('today');
        if (isSelected) dayCell.classList.add('selected');

        dayCell.addEventListener('click', () => {
          selectDate(new Date(year, month, day));
        });
      }

      calendarDaysGrid.appendChild(dayCell);
    }

    // Ha nincs még kiválasztott dátum, válasszuk ki az első elérhető napot (pl. Nov 3. Kedd vagy mai nap)
    if (!bookingState.selectedDate && month === 10 && year === 2026) {
      selectDate(new Date(2026, 10, 3)); // 2026. nov. 3. Kedd
    }
  }

  function selectDate(date) {
    bookingState.selectedDate = date;
    bookingState.selectedSlot = null; // Új napnál az idősáv újra választandó
    if (btnStep2Next) btnStep2Next.disabled = true;

    renderCalendar();
    renderTimeSlots();
    updateSummary();
  }

  if (calPrevMonth) {
    calPrevMonth.addEventListener('click', () => {
      // Csak 2026. novembertől engedjük (visszafelé ne menjen korábbi hónapra a -50% akció miatt)
      if (bookingState.calendarMonth > 10 || bookingState.calendarYear > 2026) {
        bookingState.calendarMonth--;
        if (bookingState.calendarMonth < 0) {
          bookingState.calendarMonth = 11;
          bookingState.calendarYear--;
        }
        renderCalendar();
      }
    });
  }

  if (calNextMonth) {
    calNextMonth.addEventListener('click', () => {
      bookingState.calendarMonth++;
      if (bookingState.calendarMonth > 11) {
        bookingState.calendarMonth = 0;
        bookingState.calendarYear++;
      }
      renderCalendar();
    });
  }

  // =========================================================================
  // 9. VALÓS IDŐSÁVOK BETÖLTÉSE (LÉPÉS 2)
  // =========================================================================
  const slotsDayTitle = document.getElementById('slotsDayTitle');
  const slotsBadge = document.getElementById('slotsBadge');
  const timeSlotsContainer = document.getElementById('timeSlotsContainer');

  function renderTimeSlots() {
    if (!timeSlotsContainer || !slotsDayTitle || !bookingState.selectedDate) return;

    const d = bookingState.selectedDate;
    const formattedDate = `${d.getFullYear()}. ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}., ${getDayName(d.getDay())}`;
    slotsDayTitle.textContent = formattedDate;

    // Délelőtti és délutáni idősávok definíciója
    const morningSlots = ['09:30', '11:00'];
    const afternoonSlots = ['13:30', '15:00', '16:45', '18:15'];

    // Determinisztikus szimuláció a nap száma alapján a realizmus érdekében
    const daySeed = d.getDate();
    const isBooked = (timeStr) => {
      if (daySeed % 3 === 0 && timeStr === '15:00') return true;
      if (daySeed % 2 === 0 && timeStr === '09:30') return true;
      return false;
    };

    const isLimited = (timeStr) => {
      return (timeStr === '16:45' || timeStr === '11:00');
    };

    timeSlotsContainer.innerHTML = '';

    // Délelőtt
    const morningGroup = createTimeSlotGroup('Délelőtti időpontok (09:00 - 12:30)', morningSlots, isBooked, isLimited);
    timeSlotsContainer.appendChild(morningGroup);

    // Délután
    const afternoonGroup = createTimeSlotGroup('Délutáni & Esti időpontok (13:00 - 19:30)', afternoonSlots, isBooked, isLimited);
    timeSlotsContainer.appendChild(afternoonGroup);

    if (slotsBadge) {
      slotsBadge.textContent = '✨ Több szabad időpont elérhető';
    }
  }

  function createTimeSlotGroup(title, slots, isBookedFn, isLimitedFn) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'slots-period-group';

    const titleH5 = document.createElement('h5');
    titleH5.className = 'period-title';
    titleH5.textContent = title;
    groupDiv.appendChild(titleH5);

    const grid = document.createElement('div');
    grid.className = 'slots-grid';

    slots.forEach(slotTime => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot-btn';

      const booked = isBookedFn(slotTime);
      const isSelected = (bookingState.selectedSlot === slotTime);

      if (booked) {
        btn.classList.add('booked');
        btn.disabled = true;
        btn.innerHTML = `<span>${slotTime}</span><span class="slot-tag">Foglalt</span>`;
      } else {
        if (isSelected) btn.classList.add('selected');

        const tagText = isLimitedFn(slotTime) ? 'Már csak 1 hely' : 'Szabad';
        btn.innerHTML = `<span>${slotTime}</span><span class="slot-tag">${tagText}</span>`;

        btn.addEventListener('click', () => {
          selectTimeSlot(slotTime);
        });
      }

      grid.appendChild(btn);
    });

    groupDiv.appendChild(grid);
    return groupDiv;
  }

  function selectTimeSlot(slotTime) {
    bookingState.selectedSlot = slotTime;
    renderTimeSlots();
    updateSummary();

    if (btnStep2Next) {
      btnStep2Next.disabled = false;
    }
  }

  // =========================================================================
  // 10. WIZARD LÉPÉSNAVIGÁCIÓ & FORM VALIDÁCIÓ (STEPS 1 - 4)
  // =========================================================================
  const wizardSteps = document.querySelectorAll('.wizard-step');
  const stepNavItems = document.querySelectorAll('.step-nav-item');

  // Gombok
  const btnStep2Back = document.getElementById('btnStep2Back');
  const btnStep3Back = document.getElementById('btnStep3Back');
  const btnStep3Next = document.getElementById('btnStep3Next');
  const btnStep4Back = document.getElementById('btnStep4Back');
  const btnConfirmBooking = document.getElementById('btnConfirmBooking');
  const btnBookAnother = document.getElementById('btnBookAnother');

  // Űrlap elemek
  const guestNameInput = document.getElementById('guestName');
  const guestPhoneInput = document.getElementById('guestPhone');
  const guestEmailInput = document.getElementById('guestEmail');
  const checkContactLenses = document.getElementById('checkContactLenses');
  const guestNotes = document.getElementById('guestNotes');
  const checkTerms = document.getElementById('checkTerms');

  // Hibaüzenetek
  const errorGuestName = document.getElementById('errorGuestName');
  const errorGuestPhone = document.getElementById('errorGuestPhone');
  const errorGuestEmail = document.getElementById('errorGuestEmail');
  const errorTerms = document.getElementById('errorTerms');

  function goToStep(targetStep) {
    bookingState.currentStep = targetStep;

    // Lépések láthatósága
    wizardSteps.forEach(step => {
      const stepNum = parseInt(step.dataset.step, 10);
      if (stepNum === targetStep) {
        step.classList.add('active');
        step.hidden = false;
      } else {
        step.classList.remove('active');
      }
    });

    // Lépésszámláló sáv frissítése
    stepNavItems.forEach(item => {
      const itemStep = parseInt(item.dataset.step, 10);
      item.classList.remove('active', 'completed');
      if (itemStep === targetStep) {
        item.classList.add('active');
      } else if (itemStep < targetStep) {
        item.classList.add('completed');
      }
    });

    // Lépésspecifikus renderelés
    if (targetStep === 1) {
      renderWizardServices();
    } else if (targetStep === 2) {
      renderCalendar();
      renderTimeSlots();
    } else if (targetStep === 4) {
      renderReviewStep();
    }

    // Görgetés a wizard tetejére
    const bookingSection = document.getElementById('idopontfoglalas');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Lépés 1 -> 2
  if (btnStep1Next) {
    btnStep1Next.addEventListener('click', () => {
      if (bookingState.selectedServiceIds.length > 0) {
        goToStep(2);
      }
    });
  }

  // Lépés 2 -> 1
  if (btnStep2Back) {
    btnStep2Back.addEventListener('click', () => {
      goToStep(1);
    });
  }

  // Lépés 2 -> 3
  if (btnStep2Next) {
    btnStep2Next.addEventListener('click', () => {
      if (bookingState.selectedDate && bookingState.selectedSlot) {
        goToStep(3);
      }
    });
  }

  // Lépés 3 -> 2
  if (btnStep3Back) {
    btnStep3Back.addEventListener('click', () => {
      goToStep(2);
    });
  }

  // Lépés 3 -> 4 (Validációval)
  if (btnStep3Next) {
    btnStep3Next.addEventListener('click', () => {
      if (validateGuestForm()) {
        saveGuestData();
        goToStep(4);
      }
    });
  }

  // Lépés 4 -> 3
  if (btnStep4Back) {
    btnStep4Back.addEventListener('click', () => {
      goToStep(3);
    });
  }

  function validateGuestForm() {
    let isValid = true;

    // Név ellenőrzés
    if (!guestNameInput.value.trim() || guestNameInput.value.trim().length < 3) {
      guestNameInput.classList.add('invalid');
      errorGuestName.classList.add('visible');
      isValid = false;
    } else {
      guestNameInput.classList.remove('invalid');
      errorGuestName.classList.remove('visible');
    }

    // Telefon ellenőrzés (legalább 8 számjegy)
    const phoneVal = guestPhoneInput.value.replace(/[^0-9]/g, '');
    if (phoneVal.length < 8) {
      guestPhoneInput.classList.add('invalid');
      errorGuestPhone.classList.add('visible');
      isValid = false;
    } else {
      guestPhoneInput.classList.remove('invalid');
      errorGuestPhone.classList.remove('visible');
    }

    // Email ellenőrzés
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmailInput.value.trim())) {
      guestEmailInput.classList.add('invalid');
      errorGuestEmail.classList.add('visible');
      isValid = false;
    } else {
      guestEmailInput.classList.remove('invalid');
      errorGuestEmail.classList.remove('visible');
    }

    // Házirend elfogadása
    if (!checkTerms.checked) {
      errorTerms.classList.add('visible');
      isValid = false;
    } else {
      errorTerms.classList.remove('visible');
    }

    return isValid;
  }

  function saveGuestData() {
    const experienceRadio = document.querySelector('input[name="guestExperience"]:checked');
    bookingState.guestData = {
      name: guestNameInput.value.trim(),
      phone: guestPhoneInput.value.trim(),
      email: guestEmailInput.value.trim(),
      experience: experienceRadio ? experienceRadio.value : 'first-time',
      contactLenses: checkContactLenses.checked,
      notes: guestNotes.value.trim()
    };
  }

  // =========================================================================
  // 11. LÉPÉS 4: ÁTTEKINTÉS ÉS VÉGLEGESÍTÉS (REVIEW TICKET)
  // =========================================================================
  const reviewServiceName = document.getElementById('reviewServiceName');
  const reviewDuration = document.getElementById('reviewDuration');
  const reviewDateTime = document.getElementById('reviewDateTime');
  const reviewName = document.getElementById('reviewName');
  const reviewContact = document.getElementById('reviewContact');
  const reviewOriginalPrice = document.getElementById('reviewOriginalPrice');
  const reviewFinalPrice = document.getElementById('reviewFinalPrice');

  function renderReviewStep() {
    const selectedServices = getSelectedServices();
    const serviceNames = selectedServices.map(s => s.name).join(' + ');
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalOriginal = selectedServices.reduce((sum, s) => sum + s.originalPrice, 0);
    const totalDiscount = selectedServices.reduce((sum, s) => sum + s.discountPrice, 0);

    const d = bookingState.selectedDate;
    const formattedDate = d ? `${d.getFullYear()}. ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}., ${getDayName(d.getDay())}` : '';

    if (reviewServiceName) reviewServiceName.textContent = serviceNames || '-';
    if (reviewDuration) reviewDuration.textContent = `~${totalDuration} perc`;
    if (reviewDateTime) reviewDateTime.textContent = `${formattedDate} – ${bookingState.selectedSlot}`;
    if (reviewName) reviewName.textContent = bookingState.guestData.name;
    if (reviewContact) reviewContact.textContent = `${bookingState.guestData.phone} • ${bookingState.guestData.email}`;
    if (reviewOriginalPrice) reviewOriginalPrice.textContent = `${formatPrice(totalOriginal)} Ft`;
    if (reviewFinalPrice) reviewFinalPrice.textContent = `${formatPrice(totalDiscount)} Ft`;
  }

  // =========================================================================
  // 12. FOGLALÁS MEGERŐSÍTÉSE & SIKERES KÉPERNYŐ (SUCCESS CONFIRMATION)
  // =========================================================================
  const wizardSuccessStep = document.getElementById('wizardSuccessStep');
  const bookingSpinner = document.getElementById('bookingSpinner');
  const btnConfirmText = document.getElementById('btnConfirmText');
  const successBookingCode = document.getElementById('successBookingCode');
  const successDateVal = document.getElementById('successDateVal');
  const successServiceVal = document.getElementById('successServiceVal');
  const successPriceVal = document.getElementById('successPriceVal');
  const btnAddToGoogleCal = document.getElementById('btnAddToGoogleCal');
  const btnDownloadIcs = document.getElementById('btnDownloadIcs');

  if (btnConfirmBooking) {
    btnConfirmBooking.addEventListener('click', () => {
      // Töltési animáció
      btnConfirmBooking.disabled = true;
      if (bookingSpinner) bookingSpinner.hidden = false;
      if (btnConfirmText) btnConfirmText.textContent = 'Foglalás rögzítése...';

      setTimeout(() => {
        // Véletlenszerű hiteles foglalási kód (pl. #KL-8472)
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        bookingState.bookingCode = `#KL-${randomNum}`;

        showSuccessScreen();

        btnConfirmBooking.disabled = false;
        if (bookingSpinner) bookingSpinner.hidden = true;
        if (btnConfirmText) btnConfirmText.textContent = 'Foglalás megerősítése most';
      }, 700);
    });
  }

  function showSuccessScreen() {
    // Elrejtjük a lépéseket
    wizardSteps.forEach(s => s.classList.remove('active'));
    if (wizardSuccessStep) {
      wizardSuccessStep.hidden = false;
      wizardSuccessStep.classList.add('active');
    }

    const selectedServices = getSelectedServices();
    const serviceNames = selectedServices.map(s => s.name).join(' + ');
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalDiscount = selectedServices.reduce((sum, s) => sum + s.discountPrice, 0);

    const d = bookingState.selectedDate;
    const formattedDate = d ? `${d.getFullYear()}. ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}., ${getDayName(d.getDay())}` : '';

    if (successBookingCode) successBookingCode.textContent = bookingState.bookingCode;
    if (successDateVal) successDateVal.textContent = `${formattedDate} ${bookingState.selectedSlot}`;
    if (successServiceVal) successServiceVal.textContent = serviceNames;
    if (successPriceVal) successPriceVal.textContent = `${formatPrice(totalDiscount)} Ft (-50% Akció)`;

    // Google Naptár link és ICS generálás
    setupCalendarExports(serviceNames, totalDuration);

    const bookingSection = document.getElementById('idopontfoglalas');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function setupCalendarExports(serviceTitle, durationMinutes) {
    if (!bookingState.selectedDate || !bookingState.selectedSlot) return;

    const [hours, minutes] = bookingState.selectedSlot.split(':').map(Number);
    const startDate = new Date(bookingState.selectedDate);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const title = `KamiLash & Brow – ${serviceTitle}`;
    const location = `1148 Budapest, Lengyel u. 16.`;
    const details = `Időpontod a KamiLash & Brow stúdióban.\\nKezelés: ${serviceTitle}\\nVégösszeg: ${reviewFinalPrice.textContent}\\nFoglalási kód: ${bookingState.bookingCode}\\nKérlek smink nélkül érkezz! Tel: +36 20 325 9876`;

    // 1. Google Naptár URL generálás
    if (btnAddToGoogleCal) {
      const gStart = formatGoogleDate(startDate);
      const gEnd = formatGoogleDate(endDate);
      const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gStart}/${gEnd}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      btnAddToGoogleCal.href = gUrl;
    }

    // 2. Apple / Outlook .ics letöltés generálás
    if (btnDownloadIcs) {
      btnDownloadIcs.onclick = () => {
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//KamiLash & Brow//Appointment Booking//HU',
          'BEGIN:VEVENT',
          `UID:${bookingState.bookingCode}-${Date.now()}@kamilash.hu`,
          `DTSTAMP:${formatIcsDate(new Date())}`,
          `DTSTART:${formatIcsDate(startDate)}`,
          `DTEND:${formatIcsDate(endDate)}`,
          `SUMMARY:${title}`,
          `DESCRIPTION:${details}`,
          `LOCATION:${location}`,
          'STATUS:CONFIRMED',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `kamilash-idopont-${bookingState.bookingCode.replace('#', '')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  }

  function formatGoogleDate(date) {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }

  function formatIcsDate(date) {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }

  // Újabb foglalás indítása
  if (btnBookAnother) {
    btnBookAnother.addEventListener('click', () => {
      wizardSuccessStep.hidden = true;
      wizardSuccessStep.classList.remove('active');
      bookingState.selectedServiceIds = ['she-knows-the-secret'];
      bookingState.selectedSlot = null;
      goToStep(1);
    });
  }

  // =========================================================================
  // 13. ÉLŐ ÖSSZEFOGLALÓ OLDALSÁV (STICKY SUMMARY SIDEBAR)
  // =========================================================================
  const summaryServiceList = document.getElementById('summaryServiceList');
  const summaryDateTime = document.getElementById('summaryDateTime');
  const summaryOldPrice = document.getElementById('summaryOldPrice');
  const summaryDiscountVal = document.getElementById('summaryDiscountVal');
  const summaryFinalPrice = document.getElementById('summaryFinalPrice');

  function updateSummary() {
    const selectedServices = getSelectedServices();

    if (summaryServiceList) {
      if (selectedServices.length === 0) {
        summaryServiceList.innerHTML = `<span class="summary-empty-text">Még nem választottál kezelést.</span>`;
      } else {
        summaryServiceList.innerHTML = selectedServices.map(s => `
          <div class="summary-service-row">
            <span>${s.name} (~${s.duration}p)</span>
            <strong>${formatPrice(s.discountPrice)} Ft</strong>
          </div>
        `).join('');
      }
    }

    if (summaryDateTime) {
      if (bookingState.selectedDate && bookingState.selectedSlot) {
        const d = bookingState.selectedDate;
        summaryDateTime.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${d.getFullYear()}. ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}., ${bookingState.selectedSlot}</span>
        `;
      } else if (bookingState.selectedDate) {
        const d = bookingState.selectedDate;
        summaryDateTime.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${d.getFullYear()}. ${MONTH_NAMES[d.getMonth()]} ${d.getDate()} (Válassz idősávot)</span>
        `;
      } else {
        summaryDateTime.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Válassz dátumot a naptárból</span>
        `;
      }
    }

    const totalOriginal = selectedServices.reduce((sum, s) => sum + s.originalPrice, 0);
    const totalDiscount = selectedServices.reduce((sum, s) => sum + s.discountPrice, 0);
    const savedAmount = totalOriginal - totalDiscount;

    if (summaryOldPrice) summaryOldPrice.textContent = `${formatPrice(totalOriginal)} Ft`;
    if (summaryDiscountVal) summaryDiscountVal.textContent = `-${formatPrice(savedAmount)} Ft`;
    if (summaryFinalPrice) summaryFinalPrice.textContent = `${formatPrice(totalDiscount)} Ft`;
  }

  function getSelectedServices() {
    return SERVICES_DATA.filter(s => bookingState.selectedServiceIds.includes(s.id));
  }

  function formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function getDayName(dayIndex) {
    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    return days[dayIndex];
  }

  // =========================================================================
  // 14. INTERAKTÍV GYIK HARMONIKA (ACCORDION)
  // =========================================================================
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentItem = btn.closest('.faq-item');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Többi becsukása opcionálisan
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== parentItem) {
          item.classList.remove('active');
          const q = item.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        }
      });

      if (isExpanded) {
        parentItem.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        parentItem.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // =========================================================================
  // 15. AKTÍV FEJLÉC LINK KIJELÖLÉS (SCROLL SPY)
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // =========================================================================
  // 16. ALAPÉRTELMEZETT INDÍTÁS
  // =========================================================================
  renderWizardServices();
  renderCalendar();
  renderTimeSlots();
  updateSummary();

  // =========================================================================
  // 17. HERO INTERAKTÍV 3D MOUSE PARALLAX TILT
  // =========================================================================
  const heroVisual = document.querySelector('.hero-visual');
  const heroCardStack = document.querySelector('.hero-card-stack');
  const studioCard = document.querySelector('.hero-studio-card');
  const reviewCard = document.querySelector('.hero-review-card');

  if (heroVisual && heroCardStack && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let isHovering = false;

    heroVisual.addEventListener('mouseenter', () => {
      isHovering = true;
    });

    heroVisual.addEventListener('mousemove', (e) => {
      if (!isHovering || window.innerWidth < 1024) return;
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      heroCardStack.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      if (studioCard) {
        studioCard.style.transform = `translate(${x * 16}px, ${y * 16}px)`;
      }
      if (reviewCard) {
        reviewCard.style.transform = `translate(${-x * 16}px, ${-y * 16}px)`;
      }
    });

    heroVisual.addEventListener('mouseleave', () => {
      isHovering = false;
      heroCardStack.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      heroCardStack.style.transition = 'transform 0.5s ease-out';
      if (studioCard) {
        studioCard.style.transform = '';
        studioCard.style.transition = 'transform 0.5s ease-out';
      }
      if (reviewCard) {
        reviewCard.style.transform = '';
        reviewCard.style.transition = 'transform 0.5s ease-out';
      }
      setTimeout(() => {
        heroCardStack.style.transition = '';
        if (studioCard) studioCard.style.transition = '';
        if (reviewCard) reviewCard.style.transition = '';
      }, 500);
    });
  }

});

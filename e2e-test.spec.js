const { test, expect } = require('@playwright/test');

const BASE = 'https://familie-dahrendorf.de';

test.describe('Familie Dahrendorf - Kompletter Seitentest', () => {

  test('1. Startseite lädt korrekt', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE, { waitUntil: 'networkidle' });

    await expect(page).toHaveTitle(/Dahrendorf/);
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('text=Familie Dahrendorf')).toBeVisible();
    await expect(page.locator('text=USA Westkuste 2026')).toBeVisible();
    await expect(page.locator('text=Tage bis')).toBeVisible();
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();

    for (const nav of ['start', 'route', 'planen', 'packen', 'familie']) {
      await expect(page.locator(`[data-testid="nav-${nav}"]`)).toBeVisible();
    }

    await expect(page.locator('[data-testid="quick-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="family-preview"]')).toBeVisible();

    for (const name of ['Lukas', 'Laura', 'Louie', 'Levi', 'Noah']) {
      await expect(page.locator(`[data-testid="family-preview"] >> text=${name}`)).toBeVisible();
    }

    await expect(page.locator('[data-testid="trip-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-links"]')).toBeVisible();

    if (errors.length > 0) console.log('JS ERRORS (Startseite):', errors);
    expect(errors.length).toBe(0);
  });

  test('2. Route-Seite', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`${BASE}/route`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const content = await page.textContent('body');
    expect(content.length).toBeGreaterThan(100);

    if (errors.length > 0) console.log('JS ERRORS (Route):', errors);
    expect(errors.length).toBe(0);
  });

  test('3. Planen-Seite - Tagesplan Tab', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`${BASE}/planen`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('[data-testid="plan-page"]')).toBeVisible();
    await expect(page.locator('text=Reiseplanung')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tagesplan' })).toBeVisible();

    // Check tabs exist
    for (const tab of ['plan', 'accom', 'activities', 'transport', 'tipps']) {
      await expect(page.locator(`[data-testid="tab-${tab}"]`)).toBeVisible();
    }

    // Check itinerary stops are visible
    await expect(page.getByRole('heading', { name: 'Las Vegas' })).toBeVisible();
    await expect(page.locator('text=Seattle').first()).toBeVisible();

    if (errors.length > 0) console.log('JS ERRORS (Planen-Tagesplan):', errors);
    expect(errors.length).toBe(0);
  });

  test('4. Planen-Seite - Unterkünfte Tab', async ({ page }) => {
    await page.goto(`${BASE}/planen`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="tab-accom"]').click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: 'Unterkunfte' })).toBeVisible();
    await expect(page.locator('[data-testid="accom-0"]')).toBeVisible();
    await expect(page.locator('text=Bellagio Las Vegas')).toBeVisible();
    await expect(page.locator('text=The Ahwahnee')).toBeVisible();
    await expect(page.locator('text=Argonaut Hotel')).toBeVisible();
  });

  test('5. Planen-Seite - Tipps Tab (Suggestions)', async ({ page }) => {
    await page.goto(`${BASE}/planen`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="tab-tipps"]').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Optionale Highlights')).toBeVisible();

    for (const s of ['Mount St. Helens', 'Leavenworth', 'Yellowstone', 'Bar J Chuckwagon']) {
      await expect(page.locator(`text=${s}`).first()).toBeVisible();
    }

    // Test suggestion images load
    for (let i = 0; i < 4; i++) {
      const img = page.locator(`[data-testid="suggestion-image-${i}"]`);
      const isVisible = await img.isVisible().catch(() => false);
      if (isVisible) {
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        if (naturalWidth === 0) {
          const src = await img.getAttribute('src');
          console.log(`BROKEN SUGGESTION IMAGE ${i}: ${src}`);
        }
      }
    }

    // Test toggle suggestion
    await page.locator('[data-testid="toggle-suggestion-0"]').click();
    await page.waitForTimeout(500);
    // Should now show as "Eingeplant"
    await expect(page.locator('[data-testid="suggestion-card-0"]').locator('text=Eingeplant')).toBeVisible();
  });

  test('6. Packen-Seite', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`${BASE}/packen`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('[data-testid="packing-page"]')).toBeVisible();
    await expect(page.locator('text=Packlisten')).toBeVisible();

    const listItem = page.locator('[data-testid="packing-list-pl1"]');
    await expect(listItem).toBeVisible();

    // Click on list
    await listItem.click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="list-detail"]')).toBeVisible();

    // Check categories
    for (const cat of ['dokumente', 'kleidung', 'elektronik']) {
      await expect(page.locator(`[data-testid="category-${cat}"]`)).toBeVisible();
    }

    // Check items
    await expect(page.locator('text=Reisepässe für alle 5')).toBeVisible();
    await expect(page.locator('text=ESTA Genehmigungen')).toBeVisible();

    // Test toggle item
    await page.locator('[data-testid="checkbox-i1"]').click();
    await page.waitForTimeout(300);

    // Test add item
    await page.locator('[data-testid="add-item-input"]').fill('USB-C Kabel');
    await page.locator('[data-testid="add-item-btn"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=USB-C Kabel')).toBeVisible();

    if (errors.length > 0) console.log('JS ERRORS (Packen):', errors);
    expect(errors.length).toBe(0);
  });

  test('7. Familie-Seite', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`${BASE}/familie`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('[data-testid="family-page"]')).toBeVisible();
    await expect(page.locator('text=Unsere Familie')).toBeVisible();

    await expect(page.locator('[data-testid="parents-section"]')).toBeVisible();
    await expect(page.locator('text=Lukas')).toBeVisible();
    await expect(page.locator('text=Laura')).toBeVisible();

    await expect(page.locator('[data-testid="children-section"]')).toBeVisible();
    await expect(page.locator('text=Louie')).toBeVisible();
    await expect(page.locator('text=Levi')).toBeVisible();
    await expect(page.locator('text=Noah')).toBeVisible();

    // Check 5 avatar images load
    const avatarImages = page.locator('[data-testid="parents-section"] img, [data-testid="children-section"] img');
    const count = await avatarImages.count();
    expect(count).toBe(5);

    const brokenAvatars = [];
    for (let i = 0; i < count; i++) {
      const img = avatarImages.nth(i);
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      if (naturalWidth === 0) {
        brokenAvatars.push(await img.getAttribute('src'));
      }
    }
    if (brokenAvatars.length > 0) console.log('BROKEN AVATARS:', brokenAvatars);
    expect(brokenAvatars.length).toBe(0);

    // Family photo
    await expect(page.locator('[data-testid="family-photo-section"]')).toBeVisible();

    if (errors.length > 0) console.log('JS ERRORS (Familie):', errors);
    expect(errors.length).toBe(0);
  });

  test('8. Chat Widget', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const chatBtn = page.locator('[data-testid="chat-toggle-btn"]');
    await expect(chatBtn).toBeVisible();

    await chatBtn.click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reise-Assistent' })).toBeVisible();

    // Check offline message
    await expect(page.locator('text=momentan offline')).toBeVisible();

    // Send message and verify offline response
    await page.locator('[data-testid="chat-input"]').fill('Hallo!');
    await page.locator('[data-testid="chat-send-btn"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=nicht verfugbar')).toBeVisible();

    // Close chat
    await chatBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="chat-window"]')).not.toBeVisible();
  });

  test('9. Navigation zwischen allen Seiten', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Navigate to each page
    const pages = [
      { nav: 'route', testid: null, text: 'Route' },
      { nav: 'planen', testid: 'plan-page', text: 'Reiseplanung' },
      { nav: 'packen', testid: 'packing-page', text: 'Packlisten' },
      { nav: 'familie', testid: 'family-page', text: 'Unsere Familie' },
      { nav: 'start', testid: 'home-page', text: 'Familie Dahrendorf' },
    ];

    for (const p of pages) {
      await page.locator(`[data-testid="nav-${p.nav}"]`).click();
      await page.waitForTimeout(800);
      if (p.testid) {
        await expect(page.locator(`[data-testid="${p.testid}"]`)).toBeVisible();
      }
      const body = await page.textContent('body');
      expect(body).toContain(p.text);
    }

    if (errors.length > 0) console.log('JS ERRORS (Navigation):', errors);
    expect(errors.length).toBe(0);
  });

  test('10. Bilder auf Startseite laden', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const allImages = page.locator('img');
    const imgCount = await allImages.count();
    const brokenImages = [];

    for (let i = 0; i < imgCount; i++) {
      const img = allImages.nth(i);
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      if (naturalWidth === 0) {
        brokenImages.push(await img.getAttribute('src'));
      }
    }

    if (brokenImages.length > 0) console.log('BROKEN IMAGES:', brokenImages);
    expect(brokenImages.length).toBe(0);
  });

  test('11. localStorage wird korrekt befüllt', async ({ page }) => {
    // Visit homepage first to init family/trips/suggestions
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Then visit packen to init packing lists
    await page.locator('[data-testid="nav-packen"]').click();
    await page.waitForTimeout(1500);

    const keys = await page.evaluate(() => ({
      family: localStorage.getItem('dahrendorf_family'),
      trips: localStorage.getItem('dahrendorf_trips'),
      suggestions: localStorage.getItem('dahrendorf_suggestions'),
      packingLists: localStorage.getItem('dahrendorf_packing_lists'),
    }));

    expect(keys.family).toBeTruthy();
    expect(keys.trips).toBeTruthy();
    expect(keys.suggestions).toBeTruthy();
    expect(keys.packingLists).toBeTruthy();

    const family = JSON.parse(keys.family);
    expect(family).toHaveLength(5);
    expect(family[0].name).toBe('Lukas');

    const trips = JSON.parse(keys.trips);
    expect(trips).toHaveLength(1);

    const suggestions = JSON.parse(keys.suggestions);
    expect(suggestions.length).toBeGreaterThanOrEqual(4);

    const packingLists = JSON.parse(keys.packingLists);
    expect(packingLists.length).toBeGreaterThanOrEqual(1);
    expect(packingLists[0].items.length).toBeGreaterThanOrEqual(14);
  });

  test('12. Responsive Design (Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();

    await page.locator('[data-testid="nav-packen"]').click();
    await page.waitForTimeout(800);
    await expect(page.locator('[data-testid="packing-page"]')).toBeVisible();

    await page.locator('[data-testid="nav-familie"]').click();
    await page.waitForTimeout(800);
    await expect(page.locator('[data-testid="family-page"]')).toBeVisible();
  });

  test('13. Fehlende Assets (favicon, manifest)', async ({ page }) => {
    const missing404s = [];

    page.on('response', response => {
      const url = response.url();
      if (response.status() === 404 && !url.includes('familie-dahrendorf.de/route') && !url.includes('familie-dahrendorf.de/planen')) {
        missing404s.push(url);
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    if (missing404s.length > 0) {
      console.log('FEHLENDE ASSETS (404):', missing404s);
    }
  });

  test('14. Planen - Drag & Drop Tagesplan', async ({ page }) => {
    await page.goto(`${BASE}/planen`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify stops exist
    const firstStop = page.locator('[data-testid="drag-stop-0"]');
    await expect(firstStop).toBeVisible();

    // Verify delete button
    const deleteBtn = page.locator('[data-testid="delete-stop-stop-1"]');
    await expect(deleteBtn).toBeVisible();

    // Verify reset button
    await expect(page.locator('[data-testid="reset-stops"]')).toBeVisible();
  });

  test('15. Planen - Transport Tab', async ({ page }) => {
    await page.goto(`${BASE}/planen`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="tab-transport"]').click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: 'Fortbewegung' })).toBeVisible();
    await expect(page.locator('[data-testid="transport-0"]')).toBeVisible();
    await expect(page.locator('text=Hertz')).toBeVisible();
    await expect(page.locator('text=TUI Camper')).toBeVisible();
  });

  test('16. Planen - Aktivitäten Tab', async ({ page }) => {
    await page.goto(`${BASE}/planen`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="tab-activities"]').click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: 'Aktivitaten' })).toBeVisible();
    await expect(page.locator('[data-testid="activity-0"]')).toBeVisible();
    await expect(page.locator('text=Universal Studios').first()).toBeVisible();
  });
});

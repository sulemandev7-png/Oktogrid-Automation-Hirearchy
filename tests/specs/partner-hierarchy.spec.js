/**
 * Oktogrid Partner Ecosystem Test
 * Partner → Branch → Branch User → Customer → Customer End User
 */

const { test, expect } = require('@playwright/test');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Dismiss the MUI green success snackbar that appears after every POST */
async function dismissToast(page) {
  try {
    const toast = page.locator('.MuiSnackbar-root');
    await toast.waitFor({ state: 'visible', timeout: 4000 });
    // The close control is a custom SVG icon (data-testid="CloseIcon"), not a button
    const closeSvg = toast.locator('[data-testid="CloseIcon"]');
    if (await closeSvg.count() > 0) {
      await closeSvg.click();
    } else {
      // Fallback: click the inner MuiBox div which has the onClick handler
      await toast.locator('.MuiBox-root').first().click();
    }
    await toast.waitFor({ state: 'hidden', timeout: 5000 });
  } catch {
    // toast already gone or never appeared – that is fine
  }
  // Extra wait for MUI slide/fade exit animation to finish
  await page.waitForTimeout(800);
}

/** Select a country from the MUI combobox inside a dialog */
async function selectCountry(dialog, page, country) {
  const openBtn = dialog.locator('[role="combobox"]').last();
  await openBtn.click();
  const listbox = page.locator('[role="listbox"]');
  await listbox.waitFor({ state: 'visible', timeout: 8000 });
  await page.getByRole('option', { name: country, exact: true }).click();
  await listbox.waitFor({ state: 'hidden', timeout: 8000 });
}

/** Fill the MUI phone input using React's native setter to trigger controlled input onChange */
async function fillPhone(dialog, page, digits) {
  await page.evaluate((phoneDigits) => {
    const phoneInput = document.querySelector('[role="dialog"] input[type="tel"]');
    if (!phoneInput) throw new Error('Phone input not found in dialog');
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeInputValueSetter.call(phoneInput, `+${phoneDigits}`);
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
  }, digits);
  await page.waitForTimeout(500);
}

async function submitEntityForm(dialog, page, { name, country, address, phone, submitLabel }) {
  await dialog.getByPlaceholder('Type Name...').fill(name);
  await selectCountry(dialog, page, country);
  await dialog.getByPlaceholder('Type address...').fill(address);
  await fillPhone(dialog, page, phone);
  const btn = dialog.getByRole('button', { name: submitLabel });
  await expect(btn).toBeEnabled({ timeout: 10000 });
  await btn.click();
  await expect(dialog).toBeHidden({ timeout: 20000 });
}

async function submitPersonForm(dialog, page, { firstName, lastName, country, phone, email, submitLabel }) {
  // Different dialogs use different placeholder casing — try both variants
  const firstNameInput = dialog.getByPlaceholder('Type First Name...');
  const firstNameAlt   = dialog.getByPlaceholder('Type name...');
  if (await firstNameInput.count() > 0) {
    await firstNameInput.fill(firstName);
  } else {
    await firstNameAlt.fill(firstName);
  }

  const lastNameInput = dialog.getByPlaceholder('Type Last Name...');
  const lastNameAlt   = dialog.getByPlaceholder('Type last name...');
  if (await lastNameInput.count() > 0) {
    await lastNameInput.fill(lastName);
  } else {
    await lastNameAlt.fill(lastName);
  }

  await selectCountry(dialog, page, country);
  await fillPhone(dialog, page, phone);

  const emailInput = dialog.getByPlaceholder('Type Email...');
  const emailAlt   = dialog.getByPlaceholder('Type email...');
  if (await emailInput.count() > 0) {
    await emailInput.fill(email);
  } else {
    await emailAlt.fill(email);
  }

  // Some dialogs (Add Branch User, Add Customer End User) also require a generated password
  // The "Email address..." field is auto-populated from the email field and will be disabled
  const credEmailInput = dialog.getByPlaceholder('Email address...');
  if (await credEmailInput.count() > 0) {
    // Auto-populated — just click "Generate  Password" to satisfy the password requirement
    const genPwdLabel = dialog.getByText('Generate  Password');
    if (await genPwdLabel.count() > 0) {
      await genPwdLabel.click();
      await page.waitForTimeout(600);
    }
  }

  const btn = dialog.getByRole('button', { name: submitLabel });
  await expect(btn).toBeEnabled({ timeout: 10000 });
  await btn.click();
  await expect(dialog).toBeHidden({ timeout: 20000 });
}

// ─── Test ─────────────────────────────────────────────────────────────────────

test('Create Partner Hierarchy – Partner › Branch › Branch User › Customer › End User', async ({ page }) => {
  test.setTimeout(300_000);

  const EMAIL    = process.env.OKTOGRID_EMAIL    || 'sadiq.ullah@teo-intl.com';
  const PASSWORD = process.env.OKTOGRID_PASSWORD || 'T#0International';
  const BASE_URL = process.env.BASE_URL          || 'https://dev-platform.oktogrid.io';

  const suffix = new Date().toISOString().replace(/\D/g, '').slice(0, 17);

  const data = {
    partner:    { name: `Auto Partner ${suffix}`,  country: 'Denmark', address: 'Automation Street 18, Copenhagen',    phone: '4588888888' },
    branch:     { name: `Auto Branch ${suffix}`,   country: 'Denmark', address: 'Branch Road 5, Aarhus',               phone: '4577777777' },
    branchUser: { firstName: 'BranchUser', lastName: suffix, country: 'Denmark', phone: '4522334455', email: `branch.user.${suffix}@example.com` },
    customer:   { name: `Auto Customer ${suffix}`, country: 'Denmark', address: 'Customer Way 7, Odense',              phone: '4533445566' },
    endUser:    { firstName: 'EndUser',    lastName: suffix, country: 'Denmark', phone: '4544556677', email: `end.user.${suffix}@example.com` },
  };

  await test.step('Login', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('Email').fill(EMAIL);
    await page.getByPlaceholder('****').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Select from below to continue:')).toBeVisible({ timeout: 15000 });
    await page.locator('div').filter({ hasText: /^Admin Portal$/ }).first().click();
    await expect(page.getByRole('button', { name: 'Create Partner' })).toBeVisible({ timeout: 20000 });
    console.log('✅ Logged in');
  });

  await test.step('Create Partner', async () => {
    await page.getByRole('button', { name: 'Create Partner' }).click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await submitEntityForm(dialog, page, { ...data.partner, submitLabel: 'Create Partner' });
    await dismissToast(page);
    await expect(page.getByText(data.partner.name).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ Partner created: ${data.partner.name}`);
  });

  await test.step('Create Branch', async () => {
    await page.getByText(data.partner.name).first().click();
    const createBranchBtn = page.getByRole('button', { name: 'Create Branch' });
    await expect(createBranchBtn).toBeVisible({ timeout: 10000 });
    await createBranchBtn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await submitEntityForm(dialog, page, { ...data.branch, submitLabel: 'Create Branch' });
    await dismissToast(page);
    await expect(page.getByText(data.branch.name).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ Branch created: ${data.branch.name}`);
  });

  await test.step('Create Branch User', async () => {
    // Click on branch name to expand it and reveal action buttons
    await page.getByText(data.branch.name).first().click();
    // The branch user button is "Add Branch User" (not "Create Branch User")
    const addBranchUserBtn = page.getByRole('button', { name: 'Add Branch User' });
    await expect(addBranchUserBtn).toBeVisible({ timeout: 10000 });
    await addBranchUserBtn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await submitPersonForm(dialog, page, { ...data.branchUser, submitLabel: 'Create' });
    await dismissToast(page);
    console.log(`✅ Branch User created: ${data.branchUser.firstName} ${data.branchUser.lastName}`);
  });

  await test.step('Create Customer', async () => {
    await page.getByRole('button', { name: 'Create Customer' }).click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await submitEntityForm(dialog, page, { ...data.customer, submitLabel: 'Create Customer' });
    await dismissToast(page);
    await expect(page.getByText(data.customer.name).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ Customer created: ${data.customer.name}`);
  });

  await test.step('Create Customer End User', async () => {
    await page.getByText(data.customer.name).first().click();
    const addEndUserBtn = page.getByRole('button', { name: 'Add Customer End User' });
    await expect(addEndUserBtn).toBeVisible({ timeout: 10000 });
    await addEndUserBtn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await submitPersonForm(dialog, page, { ...data.endUser, submitLabel: 'Create' });
    await dismissToast(page);
    console.log(`✅ End User created: ${data.endUser.firstName} ${data.endUser.lastName}`);
  });

  console.log('\n' + '═'.repeat(55));
  console.log('✅  COMPLETE HIERARCHY CREATED SUCCESSFULLY');
  console.log(`   Partner:     ${data.partner.name}`);
  console.log(`   Branch:      ${data.branch.name}`);
  console.log(`   Branch User: ${data.branchUser.firstName} ${data.branchUser.lastName}`);
  console.log(`   Customer:    ${data.customer.name}`);
  console.log(`   End User:    ${data.endUser.firstName} ${data.endUser.lastName}`);
  console.log('═'.repeat(55) + '\n');
});
